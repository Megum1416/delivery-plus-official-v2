(() => {
  const TRACKING_VERSION = "2026-09-04";
  const LEAD_FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbwTL76WSgFP5Wzjxuj2gNMhYHRX2bGfYl13avVzi21AWOybF6pvWVGPzvoBZ-HAoeKc/exec";
  const ATTRIBUTION_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"];
  const ATTRIBUTION_STORAGE_KEY = "syncomp_campaign_attribution";
  const pageId = document.body.dataset.page || "unknown";

  const readStoredAttribution = () => {
    try {
      return JSON.parse(sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY) || "{}") || {};
    } catch {
      return {};
    }
  };

  const attribution = readStoredAttribution();
  const params = new URLSearchParams(location.search);
  ATTRIBUTION_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) attribution[key] = value.slice(0, 200);
  });
  try {
    sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Tracking must never interrupt the website when browser storage is unavailable.
  }

  const track = (eventName, details = {}) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      tracking_version: TRACKING_VERSION,
      page_id: pageId,
      ...attribution,
      ...details,
    });
    document.documentElement.dataset.lastSiteEvent = eventName;
  };

  window.siteTracking = Object.freeze({ track, pageId, attribution: { ...attribution } });

  const submitLeadForm = async (form) => {
    const formData = new FormData(form);
    const body = new URLSearchParams();
    formData.forEach((value, key) => {
      if (key !== "services") body.set(key, String(value));
    });
    body.set("services", formData.getAll("services").map(String).join("、"));
    body.set("source_page", pageId);

    const submissionId = form.dataset.pendingSubmissionId ||
      (crypto.randomUUID?.() || `web-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    form.dataset.pendingSubmissionId = submissionId;
    body.set("submission_id", submissionId);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(LEAD_FORM_ENDPOINT, {
        method: "POST",
        body,
        redirect: "follow",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`http_${response.status}`);
      const result = await response.json();
      if (!result?.ok) throw new Error(result?.message || "submission_failed");
      delete form.dataset.pendingSubmissionId;
      track("lead_form_submit_success", {
        form_id: form.id || "lead_form",
        submission_id: result.submission_id || submissionId,
        duplicate: Boolean(result.duplicate),
      });
      return result;
    } catch (error) {
      track("lead_form_submit_failed", {
        form_id: form.id || "lead_form",
        error_type: error?.name === "AbortError" ? "timeout" : "request_failed",
      });
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  };

  window.siteLeadForm = Object.freeze({ submit: submitLeadForm, endpoint: LEAD_FORM_ENDPOINT });
  document.documentElement.dataset.siteEventsReady = TRACKING_VERSION;

  const normalizeText = (value = "") => value.replace(/\s+/g, " ").trim().slice(0, 120);
  const getLabel = (element) => normalizeText(
    element.getAttribute("data-track-label") ||
    element.getAttribute("aria-label") ||
    element.textContent ||
    element.id ||
    element.className,
  );
  const getSection = (element) => element.closest("section[id], header[id], footer[id]")?.id ||
    (element.closest("header") ? "header" : element.closest("footer") ? "footer" : "page");
  const getSafeTarget = (link) => {
    const href = link.getAttribute("href") || "";
    if (!href || href.startsWith("#")) return href || "button";
    try {
      const url = new URL(href, location.href);
      return url.origin === location.origin ? `${url.pathname}${url.hash}` : `${url.origin}${url.pathname}`;
    } catch {
      return href.slice(0, 200);
    }
  };

  const decorateInternalLinks = (root = document) => {
    if (!ATTRIBUTION_KEYS.some((key) => attribution[key])) return;
    root.querySelectorAll?.("a[href]").forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (!href || href.startsWith("#") || href.startsWith("tel:") || href.startsWith("mailto:")) return;
      try {
        const url = new URL(href, location.href);
        if (url.origin !== location.origin || url.pathname === location.pathname) return;
        ATTRIBUTION_KEYS.forEach((key) => {
          if (attribution[key] && !url.searchParams.has(key)) url.searchParams.set(key, attribution[key]);
        });
        link.href = url.href;
      } catch {
        // Leave malformed or unsupported links unchanged.
      }
    });
  };

  const syncAttributionFields = (root = document) => {
    ATTRIBUTION_KEYS.forEach((key) => {
      root.querySelectorAll?.(`input[type="hidden"][name="${key}"]`).forEach((input) => {
        input.value = attribution[key] || "";
      });
    });
  };
  syncAttributionFields();
  decorateInternalLinks();
  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        syncAttributionFields(node);
        decorateInternalLinks(node);
      }
    }));
  }).observe(document.body, { childList: true, subtree: true });

  const socialHosts = ["instagram.com", "facebook.com", "threads.com"];
  const classifyClick = (element) => {
    const href = element.getAttribute("href") || "";
    const target = getSafeTarget(element);
    const common = {
      click_label: getLabel(element),
      click_target: target,
      click_section: getSection(element),
    };

    if (element.matches("[data-major]")) return ["qa_category_select", { ...common, category_id: element.dataset.major }];
    if (element.matches("[data-group]")) return ["qa_subcategory_select", { ...common, category_id: element.dataset.group }];
    if (element.matches("[data-search-group]")) return ["qa_search_result_select", { ...common, category_id: element.dataset.searchGroup }];
    if (element.id === "qaBack") return ["qa_back_click", common];
    if (element.id === "auditToContact") return ["health_check_contact_click", common];
    if (element.id === "marginToContact") return ["margin_calculator_contact_click", common];
    if (element.matches("[data-copy-contact]")) return ["contact_detail_copy", common];
    if (/lin\.ee/i.test(href)) return ["contact_click", { ...common, contact_method: "line" }];
    if (href.startsWith("tel:")) return ["contact_click", { ...common, contact_method: "phone" }];
    if (href.startsWith("mailto:")) return ["contact_click", { ...common, contact_method: "email" }];
    if (href === "#contact" || href.endsWith("#contact")) return ["contact_cta_click", common];
    if (socialHosts.some((host) => href.includes(host))) return ["social_click", common];
    if (element.matches("[data-modal-close], .menuButton, .successReturn")) return null;
    if (element.tagName === "BUTTON") return ["button_click", common];

    try {
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return ["outbound_click", common];
      if (url.pathname !== location.pathname) return ["internal_navigation_click", common];
    } catch {
      // Fall through to same-page navigation.
    }
    return [element.matches(".button, .navCta, .audienceItem, .faqMore") ? "cta_click" : "section_navigation_click", common];
  };

  document.addEventListener("click", (event) => {
    const summary = event.target.closest(".qaQuestionCard > summary");
    if (summary) {
      const details = summary.parentElement;
      if (!details.open) {
        track("qa_answer_open", {
          question_index: Number(details.dataset.questionIndex || 0) + 1,
          question_label: normalizeText(summary.querySelector(".qaQuestionText")?.textContent || summary.textContent),
        });
      }
      return;
    }

    const element = event.target.closest("a, button");
    if (!element || element.disabled) return;
    const classified = classifyClick(element);
    if (classified) track(classified[0], classified[1]);
  });

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("form");
    if (!form) return;
    syncAttributionFields(form);
    track("lead_form_submit_attempt", {
      form_id: form.id || "lead_form",
      form_name: form.getAttribute("aria-label") || "店家合作諮詢表單",
    });
  }, true);

  let marginStarted = false;
  document.addEventListener("input", (event) => {
    if (!marginStarted && event.target.matches("#marginTool input")) {
      marginStarted = true;
      track("margin_calculator_started");
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches(".auditItem input")) {
      const inputs = [...document.querySelectorAll(".auditItem input")];
      const checkedCount = inputs.filter((input) => input.checked).length;
      track("health_check_updated", {
        checked_count: checkedCount,
        total_count: inputs.length,
        score: inputs.length ? Math.round(checkedCount / inputs.length * 100) : 0,
      });
    }
    if (event.target.matches("#qaSearch")) {
      track("qa_search_used", { query_length: event.target.value.trim().length });
    }
  });
})();
