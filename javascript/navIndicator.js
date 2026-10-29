(() => {
  const SLIDE_EASE = "power2.out";
  const SLIDE_MIN = 0.35;
  const SLIDE_MAX = 0.7;
  const SLIDE_PER_PX = 1 / 1200;
  const SCROLL_OFFSET = 400;
  const LOCK_IDLE_MS = 200;

  function init() {
    const desktopNav = document.querySelector(".hideOnMobile");
    if (!desktopNav) return;

    const desktopLinks = [...desktopNav.querySelectorAll("a.button")];
    const menuLinks = [...document.querySelectorAll(".hamburgerMenu a.button")];
    const sections = [...document.querySelectorAll("main section[id]")];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const indicator = document.createElement("span");
    indicator.className = "nav_indicator";
    indicator.setAttribute("aria-hidden", "true");
    desktopNav.appendChild(indicator);

    let currentId;
    let shownLink = null;
    let lockedLink = null;
    let lockTimer;

    function idFromLink(link) {
      const url = new URL(link.href);
      if (url.hash.length > 1) return url.hash.slice(1);
      const path = url.pathname.replace(/\/+$/, "") || "/";
      const section = sections.find((s) => s.dataset.path === path);
      return section ? section.id : null;
    }

    function linkFor(id) {
      return desktopLinks.find((link) => id && idFromLink(link) === id) || null;
    }

    function getTextBounds(link) {
      const range = document.createRange();
      range.selectNodeContents(link);
      const rects = [...range.getClientRects()].filter((r) => r.width > 0);
      if (!rects.length) return null;
      return {
        left: Math.min(...rects.map((r) => r.left)),
        right: Math.max(...rects.map((r) => r.right)),
      };
    }

    function fitMenuUnderline(link) {
      const bounds = getTextBounds(link);
      if (!bounds) return;
      const linkRect = link.getBoundingClientRect();
      link.style.setProperty(
        "--underline-left",
        `${bounds.left - linkRect.left - link.clientLeft}px`,
      );
      link.style.setProperty(
        "--underline-width",
        `${bounds.right - bounds.left}px`,
      );
    }

    function measure(link) {
      if (!desktopNav.getClientRects().length) return null;
      const bounds = getTextBounds(link);
      if (!bounds) return null;

      const navRect = desktopNav.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      const style = getComputedStyle(link);
      const fontSize = parseFloat(style.fontSize);
      const borderBottom = parseFloat(style.borderBottomWidth);

      const thickness = fontSize * 0.2;
      const bottomEdge =
        linkRect.bottom - borderBottom + fontSize * 0.3 - navRect.top;

      return {
        x: bounds.left - navRect.left - desktopNav.clientLeft,
        width: bounds.right - bounds.left,
        top: bottomEdge - thickness - desktopNav.clientTop,
        thickness,
      };
    }

    function showIndicator(link, instant = false) {
      shownLink = link;
      const target = link ? measure(link) : null;
      if (!target) {
        indicator.classList.remove("visible");
        return;
      }

      gsap.set(indicator, { top: target.top, height: target.thickness });

      const snap =
        instant ||
        reduceMotion.matches ||
        !indicator.classList.contains("visible");

      if (snap) {
        gsap.killTweensOf(indicator);
        gsap.set(indicator, { x: target.x, width: target.width });
      } else {
        const distance = Math.abs(target.x - gsap.getProperty(indicator, "x"));
        gsap.to(indicator, {
          x: target.x,
          width: target.width,
          ease: SLIDE_EASE,
          duration: gsap.utils.clamp(
            SLIDE_MIN,
            SLIDE_MAX,
            SLIDE_MIN + distance * SLIDE_PER_PX,
          ),
          overwrite: true,
        });
      }
      indicator.classList.add("visible");
    }

    function follow(link) {
      desktopLinks.forEach((l) => l.classList.toggle("active", l === link));
      if (link !== shownLink) showIndicator(link);
    }

    function update() {
      const scrollY = window.pageYOffset + SCROLL_OFFSET;
      const section = sections.find(
        (s) => scrollY >= s.offsetTop && scrollY < s.offsetTop + s.offsetHeight,
      );
      const id = section ? section.id : null;
      if (id === currentId) return;
      currentId = id;

      menuLinks.forEach((link) =>
        link.classList.toggle("active", Boolean(id && idFromLink(link) === id)),
      );
      if (!lockedLink) follow(linkFor(id));
    }

    function releaseLock() {
      clearTimeout(lockTimer);
      if (!lockedLink) return;
      lockedLink = null;
      follow(linkFor(currentId));
    }

    function armLock() {
      clearTimeout(lockTimer);
      lockTimer = setTimeout(releaseLock, LOCK_IDLE_MS);
    }

    function refresh() {
      menuLinks.forEach(fitMenuUnderline);
      if (shownLink) showIndicator(shownLink, true);
    }

    desktopLinks.forEach((link) =>
      link.addEventListener("click", () => {
        lockedLink = link;
        follow(link);
        armLock();
      }),
    );
    ["wheel", "touchstart"].forEach((type) =>
      window.addEventListener(type, releaseLock, { passive: true }),
    );
    window.addEventListener(
      "scroll",
      () => {
        update();
        if (lockedLink) armLock();
      },
      { passive: true },
    );
    window.addEventListener("resize", refresh);
    document.fonts.ready.then(refresh);

    update();
    refresh();
  }

  init();
})();
