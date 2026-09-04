(() => {
  const FORMAL_HOSTS = new Set(["syncompgo.com", "www.syncompgo.com"]);
  if (!FORMAL_HOSTS.has(location.hostname)) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtm.js?id=GTM-58ZQ5ZBG";
  document.head.appendChild(script);
})();
