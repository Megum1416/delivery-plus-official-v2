(() => {
  const setupResultMotion = () => {
    const targets = [...document.querySelectorAll('.publicCaseMetrics article,.featuredEvidence,.evidenceItem,.disclosureCopy')];
    targets.forEach((target, index) => {
      target.classList.add('motionTarget');
      target.style.setProperty('--motion-delay', `${(index % 4) * 70}ms`);
    });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      targets.forEach(target => target.classList.add('isVisible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('isVisible');
        observer.unobserve(entry.target);
      });
    }, {threshold:.08,rootMargin:'0px 0px -6%'});
    targets.forEach(target => observer.observe(target));
  };

  setupResultMotion();
})();
