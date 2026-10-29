(() => {
  "use strict";

  const DISTANCE = 50;
  const DURATION = 0.2;
  const RESIZE_DELAY_MS = 100;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const groups = [...document.querySelectorAll(".splitter_anim")].map(
    (container) => {
      const [base, ...splitters] = container.children;
      return { base, splitters };
    },
  );

  function midPoint(element) {
    const rect = element.getBoundingClientRect();
    return [rect.left + rect.width / 2, rect.top + rect.height / 2];
  }

  function angle(base, splitter) {
    const [baseX, baseY] = midPoint(base);
    const [x, y] = midPoint(splitter);
    return Math.atan2(baseX - x, baseY - y);
  }

  function pointAway() {
    groups.forEach(({ base, splitters }) =>
      splitters.forEach((splitter) =>
        gsap.set(splitter, {
          rotation: (-angle(base, splitter) * 180) / Math.PI,
        }),
      ),
    );
  }

  function moveOut({ base, splitters }) {
    if (reduceMotion.matches) return;
    splitters.forEach((splitter) => {
      const alpha = angle(base, splitter);
      gsap.to(splitter, {
        x: -Math.sin(alpha) * DISTANCE,
        y: -Math.cos(alpha) * DISTANCE,
        duration: DURATION,
        ease: "power1.out",
      });
    });
  }

  function moveBack({ splitters }) {
    gsap.to(splitters, {
      x: 0,
      y: 0,
      duration: reduceMotion.matches ? 0 : DURATION,
      ease: "power1.in",
    });
  }

  groups.forEach((group) => {
    group.base.addEventListener("mouseenter", () => moveOut(group));
    group.base.addEventListener("mouseleave", () => moveBack(group));
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(pointAway, RESIZE_DELAY_MS);
  });
  window.addEventListener("load", pointAway);
  document.fonts.ready.then(pointAway);
  pointAway();
})();
