(() => {
  const menuButton = document.querySelector('.menuButton');
  const navLinks = document.querySelector('.navLinks');
  const closeMenu = () => {
    navLinks?.classList.remove('isOpen');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', '開啟選單');
    if (menuButton) menuButton.textContent = '☰';
    document.body.classList.remove('menuOpen');
  };
  menuButton?.addEventListener('click', () => {
    const open = !navLinks.classList.contains('isOpen');
    navLinks.classList.toggle('isOpen', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
    menuButton.textContent = open ? '×' : '☰';
    document.body.classList.toggle('menuOpen', open);
  });
  navLinks?.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMenu();
  });

  const progress = document.querySelector('.scrollProgress');
  const updateProgress = () => {
    if (!progress) return;
    const total = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${total > 0 ? scrollY / total : 0})`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, {passive:true});

  const marqueeTrack = document.querySelector('.marqueeTrack');
  const marqueeSet = document.querySelector('.marqueeSet');
  const updateMarqueeSpeed = () => {
    if (!marqueeTrack || !marqueeSet) return;
    const duration = Math.max(24, marqueeSet.getBoundingClientRect().width / 26);
    marqueeTrack.style.setProperty('--marquee-duration', `${duration.toFixed(2)}s`);
  };
  updateMarqueeSpeed();
  if ('ResizeObserver' in window && marqueeSet) new ResizeObserver(updateMarqueeSpeed).observe(marqueeSet);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionTargets = [...document.querySelectorAll('.sectionHead,.sectionLead,.serviceItem,.includedIntro,.includedRow,.includedNote,.priceCopy,.clarityList article,.processList article,.faqIntro,.faqList details,.contactCopy,.formCard')];
  motionTargets.forEach((target, index) => {
    target.classList.add('motionTarget');
    target.style.setProperty('--motion-delay', `${(index % 4) * 70}ms`);
  });
  document.querySelectorAll('.includedIntro,.priceCopy,.faqIntro,.contactCopy').forEach(target => target.classList.add('fromLeft'));
  document.querySelectorAll('.formCard').forEach(target => target.classList.add('fromRight'));
  if (reduceMotion || !('IntersectionObserver' in window)) {
    motionTargets.forEach(target => target.classList.add('isVisible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('isVisible');
        observer.unobserve(entry.target);
      });
    }, {threshold:.1, rootMargin:'0px 0px -7%'});
    motionTargets.forEach(target => observer.observe(target));
  }

  const params = new URLSearchParams(location.search);
  ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid'].forEach(name => {
    const input = document.querySelector(`[name="${name}"]`);
    if (input) input.value = params.get(name) || '';
  });

  const form = document.getElementById('leadForm');
  const contactCopyText = '外送＋｜餐飲外送成長顧問｜競合智數股份有限公司\n聯絡電話：07-262-1216\nEmail：17syn.comp@gmail.com\n官方LINE：@syn0017';
  const copyContactText = async () => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(contactCopyText);
      return;
    }
    const helper = document.createElement('textarea');
    helper.value = contactCopyText;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    const copied = document.execCommand('copy');
    helper.remove();
    if (!copied) throw new Error('copy failed');
  };
  document.querySelectorAll('[data-copy-contact]').forEach(link => {
    let resetTimer;
    link.addEventListener('click', async event => {
      event.preventDefault();
      try {
        await copyContactText();
        document.querySelectorAll('[data-copy-contact]').forEach(item => item.classList.remove('isCopied'));
        link.classList.add('isCopied');
        clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => link.classList.remove('isCopied'), 1800);
      } catch {
        location.href = 'mailto:17syn.comp@gmail.com';
      }
    });
  });
  const successModal = document.getElementById('successModal');
  const successDialog = successModal?.querySelector('.successDialog');
  let modalReturnFocus;
  const closeSuccessModal = () => {
    if (!successModal || successModal.hidden) return;
    successModal.classList.remove('isOpen');
    document.body.classList.remove('modalOpen');
    window.setTimeout(() => {
      successModal.hidden = true;
      modalReturnFocus?.focus();
    }, 220);
  };
  const openSuccessModal = () => {
    if (!successModal) return;
    modalReturnFocus = document.activeElement;
    successModal.hidden = false;
    document.body.classList.add('modalOpen');
    requestAnimationFrame(() => {
      successModal.classList.add('isOpen');
      successDialog?.focus();
    });
  };
  successModal?.querySelectorAll('[data-modal-close]').forEach(button => button.addEventListener('click', closeSuccessModal));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && successModal && !successModal.hidden) closeSuccessModal();
  });
  form?.addEventListener('submit', async event => {
    event.preventDefault();
    const message = document.getElementById('formMessage');
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton?.textContent;
    if (message) message.textContent = '';
    form.setAttribute('aria-busy', 'true');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = '資料送出中…';
    }
    try {
      if (!window.siteLeadForm) throw new Error('lead_service_unavailable');
      await window.siteLeadForm.submit(form);
      openSuccessModal();
    } catch {
      if (message) message.textContent = '目前無法送出，已保留你填寫的內容。請稍後再試，或改用 LINE 聯絡我們。';
    } finally {
      form.removeAttribute('aria-busy');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    }
  });
})();
