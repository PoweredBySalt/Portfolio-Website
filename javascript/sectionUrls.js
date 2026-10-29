(() => {
  "use strict";

  const sections = [...document.querySelectorAll("main section[data-path]")];
  if (!sections.length) return;

  function normalizePath(path) {
    return path.replace(/\/+$/, "") || "/";
  }

  function sectionForPath(path) {
    const normalized = normalizePath(path);
    return sections.find((section) => section.dataset.path === normalized);
  }

  function sectionForUrl(url) {
    if (url.origin !== location.origin) return null;
    if (url.hash.length > 1) {
      return sections.find((section) => section.id === url.hash.slice(1));
    }
    return sectionForPath(url.pathname);
  }

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest("a[href]");
    if (!link || link.target) return;
    const section = sectionForUrl(new URL(link.href));
    if (!section) return;

    event.preventDefault();
    if (normalizePath(location.pathname) !== section.dataset.path || location.search || location.hash) {
      history.pushState(null, "", section.dataset.path);
    }
    section.scrollIntoView({ behavior: "auto" });
  });

  const initialSection = sectionForUrl(new URL(location.href));
  if (initialSection && location.hash) {
    history.replaceState(null, "", initialSection.dataset.path);
  }
  if (initialSection && initialSection.dataset.path !== "/") {
    let userScrolled = false;
    const markScrolled = () => (userScrolled = true);
    ["wheel", "touchstart", "keydown"].forEach((type) =>
      window.addEventListener(type, markScrolled, { once: true, passive: true }),
    );

    initialSection.scrollIntoView({ behavior: "instant" });
    window.addEventListener("load", () => {
      if (!userScrolled) initialSection.scrollIntoView({ behavior: "instant" });
    });
  }
})();
