(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const menu = document.getElementById("hamburgerMenu");
  const openButton = document.getElementById("menu_open");
  const closeButton = document.getElementById("menu_close");

  const mobileLayout = window.matchMedia("(max-width: 1000px)");

  // Elemente, die beim Öffnen des Menüs inert gesetzt wurden
  let inertOutside = [];

  function isMenuOpen() {
    return !menu.inert;
  }

  // Bei offenem Menü ist alles außerhalb inert, damit der Fokus
  // (Tab, Screenreader) nicht hinter das Overlay wandern kann.
  function setOutsideInert(inert) {
    if (!inert) {
      inertOutside.forEach((element) => (element.inert = false));
      inertOutside = [];
      return;
    }
    for (let node = menu; node !== document.body; node = node.parentElement) {
      [...node.parentElement.children].forEach((sibling) => {
        if (sibling === node || sibling.inert) return;
        sibling.inert = true;
        inertOutside.push(sibling);
      });
    }
  }

  function setMenuOpen(open) {
    menu.inert = !open;
    setOutsideInert(open);
    openButton.setAttribute("aria-expanded", String(open));
    gsap.to(menu, {
      xPercent: open ? -100 : 0,
      duration: reduceMotion.matches ? 0 : 0.3,
    });
  }

  function openMenu() {
    setMenuOpen(true);
    closeButton.focus();
  }

  function closeMenu(restoreFocus) {
    setMenuOpen(false);
    if (restoreFocus) openButton.focus();
  }

  if (menu && openButton && closeButton) {
    openButton.addEventListener("click", openMenu);
    closeButton.addEventListener("click", () => closeMenu(true));
    menu
      .querySelectorAll("a")
      .forEach((link) => link.addEventListener("click", () => closeMenu(false)));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isMenuOpen()) closeMenu(true);
    });
    // Über 1000px ist das Menü ausgeblendet; offen bliebe sonst die Seite inert
    mobileLayout.addEventListener("change", () => {
      if (!mobileLayout.matches && isMenuOpen()) closeMenu(false);
    });
  }

  function fitUnderline(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    const rects = [...range.getClientRects()].filter((rect) => rect.width > 0);
    if (!rects.length) return;

    const left = Math.min(...rects.map((rect) => rect.left));
    const right = Math.max(...rects.map((rect) => rect.right));
    element.style.setProperty("--underline-w", `${right - left}px`);
  }

  const underlineObserver = new ResizeObserver((entries) =>
    entries.forEach((entry) => fitUnderline(entry.target)),
  );

  document.fonts.ready.then(() => {
    document
      .querySelectorAll("h1, h2, .project_tile > span span:first-child")
      .forEach((heading) => {
        fitUnderline(heading);
        underlineObserver.observe(heading);
      });
  });
})();
