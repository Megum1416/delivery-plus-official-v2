(() => {
  document.querySelectorAll('.mobileMenu').forEach(button => {
    const nav = button.closest('nav');
    const links = nav?.querySelector('.navLinks');
    if (!links) return;

    button.removeAttribute('onclick');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', links.id || 'mainNavigation');
    if (!links.id) links.id = 'mainNavigation';

    const close = () => {
      links.classList.remove('isOpen');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', '開啟選單');
      button.textContent = '☰';
    };

    button.addEventListener('click', () => {
      const open = !links.classList.contains('isOpen');
      links.classList.toggle('isOpen', open);
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
      button.textContent = open ? '×' : '☰';
    });

    links.addEventListener('click', event => {
      if (event.target.closest('a')) close();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) close();
    });
  });
})();
