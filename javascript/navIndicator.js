(() => {
  const SCROLL_OFFSET = 400;
  const LOCK_IDLE_MS = 200;

  function init() {
    const links = [
      ...document.querySelectorAll(
        ".hideOnMobile a.button_primary, .hamburgerMenu a.button_primary",
      ),
    ];
    const sections = [...document.querySelectorAll("main section[id]")];
    if (!links.length || !sections.length) return;

    let currentId;
    let markedId = null;
    let lockedId = null;
    let lockTimer;

    const order = (id) => sections.findIndex((s) => s.id === id);

    // While a button is fully filled or empty, moving the anchor of its fill
    // is invisible, so it can be set right before the change starts.
    function setFillSide(link, side) {
      link.style.setProperty("--fill_from", side);
    }

    function idFromLink(link) {
      const url = new URL(link.href);
      if (url.hash.length > 1) return url.hash.slice(1);
      const path = url.pathname.replace(/\/+$/, "") || "/";
      const section = sections.find((s) => s.dataset.path === path);
      return section ? section.id : null;
    }

    // The link of the current section gets .active, which shows the button
    // filled (the same look as its hover state). The fill travels in the
    // scroll direction: going down, the old button empties to the right and
    // the new one fills from the left; going up, the other way round.
    function mark(id) {
      if (id === markedId) return;
      const down = order(id) > order(markedId);
      links.forEach((link) => {
        const linkId = idFromLink(link);
        if (id && linkId === id) setFillSide(link, down ? "left" : "right");
        else if (markedId && linkId === markedId)
          setFillSide(link, down ? "right" : "left");
        link.classList.toggle("active", Boolean(id && linkId === id));
      });
      markedId = id;
    }

    function update() {
      const scrollY = window.scrollY + SCROLL_OFFSET;
      const section = sections.find(
        (s) => scrollY >= s.offsetTop && scrollY < s.offsetTop + s.offsetHeight,
      );
      const id = section ? section.id : null;
      if (id === currentId) return;
      currentId = id;
      if (!lockedId) mark(id);
    }

    // After a click the clicked link stays marked until the smooth scroll
    // has settled (or the visitor scrolls by hand), so the mark doesn't
    // flicker through the sections in between.
    function releaseLock() {
      clearTimeout(lockTimer);
      if (!lockedId) return;
      lockedId = null;
      mark(currentId);
    }

    function armLock() {
      clearTimeout(lockTimer);
      lockTimer = setTimeout(releaseLock, LOCK_IDLE_MS);
    }

    links.forEach((link) => {
      link.addEventListener("click", () => {
        lockedId = idFromLink(link);
        mark(lockedId);
        armLock();
      });
      // A plain hover always fills from the left again (only while the
      // button is empty, so a running fill doesn't jump).
      link.addEventListener("pointerenter", () => {
        if (!link.classList.contains("active")) setFillSide(link, "left");
      });
    });
    ["wheel", "touchstart"].forEach((type) =>
      window.addEventListener(type, releaseLock, { passive: true }),
    );
    window.addEventListener(
      "scroll",
      () => {
        update();
        if (lockedId) armLock();
      },
      { passive: true },
    );

    update();
  }

  init();
})();
