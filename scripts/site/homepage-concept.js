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

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const marqueeTrack = document.querySelector('.marqueeTrack');
  const marqueeSet = document.querySelector('.marqueeSet');
  const updateMarqueeSpeed = () => {
    if (!marqueeTrack || !marqueeSet) return;
    const distance = marqueeSet.getBoundingClientRect().width;
    const duration = Math.max(24, distance / 26);
    marqueeTrack.style.setProperty('--marquee-duration', `${duration.toFixed(2)}s`);
  };
  updateMarqueeSpeed();
  if ('ResizeObserver' in window && marqueeSet) {
    new ResizeObserver(updateMarqueeSpeed).observe(marqueeSet);
  } else {
    window.addEventListener('resize', updateMarqueeSpeed);
  }

  const flipGrid = document.querySelector('.flipGrid');
  const flipCards = [...document.querySelectorAll('.flipCard')];
  let flipIndex = -1;
  let flipTimer;
  let flipResumeTimer;
  let mobileDemoTimer;
  let flipGridVisible = false;
  let mobileDemoDone = false;

  const usesDesktopHover = () => window.innerWidth > 760 && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const coverAllCards = () => flipCards.forEach(card => card.classList.remove('isFlipped'));
  const showFlipCard = index => {
    coverAllCards();
    flipCards[index]?.classList.add('isFlipped');
    flipIndex = index;
  };
  const stopFlipTimers = () => {
    clearInterval(flipTimer);
    clearTimeout(flipResumeTimer);
    flipTimer = undefined;
    flipResumeTimer = undefined;
  };
  const playNextCard = () => showFlipCard((flipIndex + 1) % flipCards.length);
  const startDesktopFlipLoop = (delay = 0) => {
    stopFlipTimers();
    if (reduceMotion || !flipGridVisible || !usesDesktopHover() || document.hidden || !flipCards.length) return;
    flipResumeTimer = setTimeout(() => {
      playNextCard();
      flipTimer = setInterval(playNextCard, 3300);
    }, delay);
  };
  const stopMobileDemo = () => {
    clearTimeout(mobileDemoTimer);
    mobileDemoTimer = undefined;
  };
  const runMobileDemo = () => {
    if (reduceMotion || mobileDemoDone || !flipGridVisible || usesDesktopHover() || document.hidden || !flipCards.length) return;
    mobileDemoDone = true;
    let demoIndex = 0;
    const showNext = () => {
      if (usesDesktopHover() || document.hidden) {
        coverAllCards();
        return;
      }
      showFlipCard(demoIndex);
      demoIndex += 1;
      if (demoIndex < flipCards.length) {
        mobileDemoTimer = setTimeout(showNext, 3300);
      } else {
        mobileDemoTimer = setTimeout(coverAllCards, 3300);
      }
    };
    showNext();
  };

  flipCards.forEach(card => {
    card.addEventListener('pointerenter', () => {
      if (!usesDesktopHover()) return;
      stopFlipTimers();
      coverAllCards();
      card.classList.add('isFlipped');
    });
    card.addEventListener('pointerleave', () => {
      if (!usesDesktopHover()) return;
      coverAllCards();
      startDesktopFlipLoop(1500);
    });
    card.addEventListener('focus', () => {
      if (!usesDesktopHover()) return;
      stopFlipTimers();
      coverAllCards();
      card.classList.add('isFlipped');
    });
    card.addEventListener('blur', () => {
      if (!usesDesktopHover()) return;
      coverAllCards();
      startDesktopFlipLoop(1500);
    });
    card.addEventListener('click', () => {
      if (usesDesktopHover()) return;
      stopMobileDemo();
      mobileDemoDone = true;
      const wasFlipped = card.classList.contains('isFlipped');
      coverAllCards();
      card.classList.toggle('isFlipped', !wasFlipped);
    });
  });

  if (flipGrid) {
    if (!reduceMotion && 'IntersectionObserver' in window) {
      const flipObserver = new IntersectionObserver(entries => {
        flipGridVisible = entries.some(entry => entry.isIntersecting);
        if (!flipGridVisible) {
          stopFlipTimers();
          stopMobileDemo();
          coverAllCards();
          return;
        }
        if (usesDesktopHover()) startDesktopFlipLoop(600);
        else runMobileDemo();
      }, {threshold:.25});
      flipObserver.observe(flipGrid);
    } else if (!reduceMotion) {
      flipGridVisible = true;
      if (usesDesktopHover()) startDesktopFlipLoop(600);
      else runMobileDemo();
    }
  }

  document.addEventListener('visibilitychange', () => {
    stopFlipTimers();
    stopMobileDemo();
    coverAllCards();
    if (!document.hidden && flipGridVisible && usesDesktopHover()) startDesktopFlipLoop(1500);
  });
  window.addEventListener('resize', () => {
    stopFlipTimers();
    stopMobileDemo();
    coverAllCards();
    if (flipGridVisible && usesDesktopHover()) startDesktopFlipLoop(1500);
    else if (flipGridVisible) runMobileDemo();
  });

  const progress = document.querySelector('.scrollProgress');
  const updateProgress = () => {
    if (!progress) return;
    const total = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${total > 0 ? scrollY / total : 0})`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, {passive:true});

  const motionGroups = [
    '.audienceCopy','.audienceItem','.sectionHead','.flipCard','.journeyAction',
    '.accountBanner','.caseAction','.trustIntro','.trustItem','.faqIntro',
    '.faqList details','.contactCopy','.formCard'
  ];
  const motionTargets = [...document.querySelectorAll(motionGroups.join(','))];
  motionTargets.forEach((target, index) => {
    target.classList.add('motionTarget');
    target.style.setProperty('--motion-delay', `${(index % 4) * 70}ms`);
  });
  document.querySelectorAll('.contactCopy,.faqIntro').forEach(target => target.classList.add('fromLeft'));
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

  const collage = document.querySelector('.heroCollage');
  if (collage && !reduceMotion && window.innerWidth > 760 && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    collage.addEventListener('pointermove', event => {
      const box = collage.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - .5;
      const y = (event.clientY - box.top) / box.height - .5;
      collage.style.setProperty('--hero-x', `${x * 12}px`);
      collage.style.setProperty('--hero-y', `${y * 9}px`);
      collage.style.setProperty('--hero-rx', `${y * -1.2}deg`);
      collage.style.setProperty('--hero-ry', `${x * 1.5}deg`);
    });
    collage.addEventListener('pointerleave', () => {
      collage.style.setProperty('--hero-x', '0px');
      collage.style.setProperty('--hero-y', '0px');
      collage.style.setProperty('--hero-rx', '0deg');
      collage.style.setProperty('--hero-ry', '0deg');
    });
  }

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
        resetTimer = setTimeout(() => link.classList.remove('isCopied'), 1800);
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
    setTimeout(() => {
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

  const params = new URLSearchParams(location.search);
  ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid'].forEach(name => {
    const input = document.querySelector(`[name="${name}"]`);
    if (input) input.value = params.get(name) || '';
  });
})();
