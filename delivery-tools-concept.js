(() => {
  const contactMount = document.querySelector("#contactMount");
  const modalMount = document.querySelector("#modalMount");
  const footerMount = document.querySelector("#footerMount");
  const marginInputs = [...document.querySelectorAll("#marginTool input")];
  const auditInputs = [...document.querySelectorAll(".auditItem input")];
  const auditToContact = document.querySelector("#auditToContact");
  const marginToContact = document.querySelector("#marginToContact");

  let latestMargin = { platform: 75, promo: 25, profit: 60, margin: 24 };
  let latestAudit = "尚未完成頁面健檢";
  let hasUsedMargin = false;

  const clamp = (value) => Math.min(100, Math.max(0, Number(value) || 0));
  const money = (value) => {
    const amount = Math.round(Number(value) || 0);
    return `${amount < 0 ? "−" : ""}NT$${Math.abs(amount).toLocaleString("zh-TW")}`;
  };

  const calculateMargin = () => {
    const price = Math.max(0, Number(document.querySelector("#price").value) || 0);
    const cost = Math.max(0, Number(document.querySelector("#cost").value) || 0);
    const fee = clamp(document.querySelector("#fee").value);
    const discount = clamp(document.querySelector("#discount").value);
    const share = clamp(document.querySelector("#share").value);
    const platform = price * fee / 100;
    const promo = price * discount / 100 * share / 100;
    const profit = price - platform - promo - cost;
    const margin = price ? profit / price * 100 : 0;

    latestMargin = { platform, promo, profit, margin };
    document.querySelector("#platformCost").textContent = money(platform);
    document.querySelector("#promoCost").textContent = money(promo);
    document.querySelector("#profit").textContent = money(profit);
    document.querySelector("#marginValue").textContent = `${margin.toFixed(1)}%`;
    document.querySelector("#statusText").textContent = profit < 0
      ? "目前每單虧損，建議先調整活動條件"
      : margin < 15
        ? "毛利偏低，請再確認其他營運成本"
        : "仍有毛利空間，可再確認人事與其他成本";
  };

  const fillContactMessage = (message) => {
    const field = document.querySelector("#contact #message");
    if (field) field.value = message;
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const marginSummary = () => `我完成活動毛利試算：單筆概算剩餘 ${money(latestMargin.profit)}、毛利率 ${latestMargin.margin.toFixed(1)}%，想請專人協助評估。`;

  const calculateAudit = () => {
    const checked = auditInputs.filter((input) => input.checked);
    const missing = auditInputs.filter((input) => !input.checked);
    const score = Math.round(checked.length / auditInputs.length * 100);
    const tips = missing.slice(0, 3).map((input) => input.dataset.tip);

    latestAudit = `頁面健康分數 ${score} 分；${tips.length ? `優先改善：${tips.join("、")}` : "基礎項目皆已完成"}`;
    document.querySelector("#auditScore").textContent = String(score);
    const scoreRing = document.querySelector("#scoreRing");
    scoreRing.style.setProperty("--score", `${score}%`);
    scoreRing.classList.remove("isUpdating");
    void scoreRing.offsetWidth;
    scoreRing.classList.add("isUpdating");
    document.querySelector("#auditTitle").textContent = score >= 75
      ? "頁面基礎健康，可以繼續測試"
      : score >= 50
        ? "已有基礎，但還有明顯缺口"
        : "建議先把基礎頁面補完整";
    document.querySelector("#auditText").textContent = score >= 75
      ? "維持每週檢查，再測試主打品與活動效果。"
      : "先完成下方優先項目，再擴大活動或廣告。";

    const list = document.querySelector("#priorityList");
    list.replaceChildren();
    (tips.length ? tips : ["下一步可測試不同主打品與活動組合"]).forEach((tip) => {
      const item = document.createElement("li");
      item.textContent = `${tips.length ? "→" : "✓"} ${tip}`;
      list.append(item);
    });
    auditToContact.disabled = false;
  };

  const setupPageMotion = () => {
    const targets = [...document.querySelectorAll(".auditHeading,.auditItem,.auditResult,.marginIntro,.marginCard,.nextStepList article")];
    targets.forEach((target, index) => {
      target.classList.add("motionTarget");
      target.style.setProperty("--motion-delay", `${(index % 4) * 70}ms`);
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("isVisible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("isVisible");
        observer.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: "0px 0px -6%" });
    targets.forEach((target) => observer.observe(target));
  };

  const fetchDocument = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: ${response.status}`);
    return new DOMParser().parseFromString(await response.text(), "text/html");
  };

  const loadSharedSections = async () => {
    const source = await fetchDocument("首頁新版提案.html");
    const contact = source.querySelector("section#contact");
    const modal = source.querySelector("#successModal");
    const footer = source.querySelector("footer.footer");
    const floatLine = source.querySelector(".floatLine");
    if (!contact || !modal || !footer) throw new Error("首頁共用區塊不完整");

    contactMount.replaceChildren(document.importNode(contact, true));
    modalMount.replaceChildren(document.importNode(modal, true));
    footerMount.replaceChildren(document.importNode(footer, true));
    if (floatLine) footerMount.append(document.importNode(floatLine, true));
    footerMount.querySelectorAll(".footerGrid > div:first-child > p").forEach((paragraph) => {
      if (paragraph.textContent.includes("照片來源")) paragraph.remove();
    });
    footerMount.querySelectorAll('a[href="delivery-tools.html"], a[href="外送經營健檢新版提案.html"]').forEach((link) => link.setAttribute("href", "#top"));

    const sharedScript = document.createElement("script");
    sharedScript.src = "homepage-concept.js?v=9";
    document.body.append(sharedScript);
  };

  marginInputs.forEach((input) => input.addEventListener("input", () => {
    hasUsedMargin = true;
    calculateMargin();
  }));
  marginToContact.addEventListener("click", () => {
    hasUsedMargin = true;
    fillContactMessage(marginSummary());
  });
  auditInputs.forEach((input) => input.addEventListener("change", calculateAudit));
  auditToContact.addEventListener("click", () => {
    const message = hasUsedMargin
      ? `${latestAudit}。${marginSummary()}`
      : `${latestAudit}，想請專人協助評估。`;
    fillContactMessage(message);
  });
  calculateMargin();
  calculateAudit();
  setupPageMotion();

  loadSharedSections().catch(() => {
    const message = document.createElement("p");
    message.className = "sharedLoadError";
    message.textContent = "聯絡表單暫時無法載入，請重新整理頁面。";
    contactMount.replaceChildren(message);
  });
})();
