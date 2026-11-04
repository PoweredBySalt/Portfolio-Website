(() => {
  "use strict";

  // Low-poly edges, generated at random on every page load, whose corners are
  // pulled slightly towards the mouse. The CSS keeps drawing the fixed SVGs
  // from images/SVG/border/ as background images on ::before/::after (no JS,
  // reduced motion, touch). Here each one is replaced by an inline SVG in a
  // child .magnetic_edge, positioned by the same CSS rule as the pseudo.
  // solid: the side that joins the section, facets: colours of the triangles
  // drawn over the base colour.
  const BLUE = "var(--zblau)";
  const COLOURFUL = ["var(--ygrün)", "var(--xrot)"];
  const EDGES = [
    {
      selector: "nav",
      pseudo: "after",
      solid: "top",
      base: BLUE,
      facets: COLOURFUL,
    },
    {
      selector: ".border_footer",
      pseudo: "after",
      solid: "bottom",
      base: BLUE,
      facets: COLOURFUL,
    },
    {
      selector: ".borders",
      pseudo: "before",
      solid: "bottom",
      base: BLUE,
      facets: [],
    },
    {
      selector: ".borders",
      pseudo: "after",
      solid: "top",
      base: BLUE,
      facets: [],
    },
    {
      selector: ".borderWhite",
      pseudo: "before",
      solid: "bottom",
      base: "var(--white)",
      facets: ["#f2f2f2", "#e6e6e6"],
    },
  ];

  // Generator, in px (share of the edge height for depths)
  const SPACING = [40, 120]; // gap between corners of the outline
  const DEPTH = [0.3, 1.2]; // how far the outline reaches from the solid side
  const INNER = [0.15, 0.6]; // inner corners, as share of the outline depth
  const FACET_CHANCE = 0.4; // share of triangles that get a facet colour

  const RADIUS = 140; // px around the mouse in which corners are pulled
  const WOBBLE_RADIUS = 260; // px in which they tick, larger than the pull
  const STRENGTH = 0.35; // share of the distance a vertex moves at most
  const STEP = 5; // px; targets snap to this grid, so facets jump like crystal
  const EASE = 0.45; // per frame, towards the target position (stiff)
  const JITTER = 0.6; // per-vertex variation of strength and direction
  const WOBBLE = 3; // px; random ticking of corners near the mouse
  const WOBBLE_HOLD = [0.4, 1.8]; // s; a corner holds its offset this long
  const ENTER_EXCITE = [1, 1.5]; // strength, s; when an edge scrolls into view
  // A click sends a shockwave outwards from the cursor: each corner is jolted
  // away from the click and jiggles when the wave reaches it
  const BLAST_SPEED = 1800; // px per second
  const BLAST_DURATION = 0.9; // s a corner rings after the wave hits it
  const BLAST_PUSH = 14; // px; outward jolt right next to the click
  const BLAST_FALLOFF = 500; // px; at this distance the effect is halved
  const SVG_NS = "http://www.w3.org/2000/svg";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  // Without a mouse or with reduced motion, the edges stay the CSS backgrounds
  const animated = !reduceMotion.matches && finePointer.matches;
  if (!animated) return;

  const edges = [];
  const blasts = [];
  let mouse = null;
  let frame = 0;

  function random([min, max]) {
    return min + Math.random() * (max - min);
  }

  function createVertex(x, y, pinned) {
    return {
      x,
      y,
      dx: 0,
      dy: 0,
      pinned,
      // Irregular response per corner gives the rough, faceted look
      strength: 1 + (Math.random() * 2 - 1) * JITTER,
      angle: (Math.random() * 2 - 1) * JITTER,
      // Idle wobble: an offset that is held, then replaced at once
      wobbleX: 0,
      wobbleY: 0,
      nextWobble: 0,
    };
  }

  function addPolygon(edge, corners, fill) {
    const element = document.createElementNS(SVG_NS, "polygon");
    element.style.fill = fill;
    // A hairline stroke in the same colour closes the anti-aliasing seams
    // between neighbouring polygons (visible in Firefox)
    element.style.stroke = fill;
    element.style.strokeWidth = "1";
    element.style.strokeLinejoin = "round";
    edge.svg.append(element);
    edge.polygons.push({ element, corners });
  }

  // Generates a new edge for the box's current size: a jagged outline, an
  // inner line of corners behind it, and a strip of triangles zig-zagging
  // between the two. A base polygon (solid side up to the outline) is drawn
  // in one piece, so no seams show between triangles of the same colour;
  // only the coloured facets are drawn on top. Corners at both ends and on
  // the solid side stay put.
  function build(edge) {
    const { box, svg, config } = edge;
    const rect = box.getBoundingClientRect();
    if (!rect.height) return;
    const width = rect.width;
    const height = rect.height;
    if (edge.width === width && edge.height === height) return;
    edge.width = width;
    edge.height = height;
    edge.source = { height }; // 1 SVG unit = 1 px

    // Positions are generated along the edge (along) and away from its solid
    // side (depth), then turned into x/y for the solid side
    const length = width;
    const toPoint = (along, depth) =>
      config.solid === "top" ? [along, depth] : [along, height - depth];

    const outline = [];
    for (let along = 0; ; along += random(SPACING)) {
      const end = along >= length - SPACING[0];
      if (end) along = length;
      const depth = random(DEPTH) * height;
      outline.push({ along, depth, pinned: along === 0 || end });
      if (end) break;
    }
    // One inner corner between each pair of outline corners, plus both ends
    const behind = [];
    outline.forEach((corner, n) => {
      const next = outline[n + 1];
      if (n === 0) {
        behind.push({
          along: 0,
          depth: random(INNER) * corner.depth,
          pinned: true,
        });
      }
      if (next) {
        behind.push({
          along:
            corner.along + (next.along - corner.along) * random([0.25, 0.75]),
          depth: random(INNER) * Math.min(corner.depth, next.depth),
          pinned: false,
        });
      } else {
        behind.push({
          along: length,
          depth: random(INNER) * corner.depth,
          pinned: true,
        });
      }
    });
    const toVertex = ({ along, depth, pinned }) =>
      Object.assign(createVertex(...toPoint(along, depth), pinned), { along });
    const outer = outline.map(toVertex);
    const inner = behind.map(toVertex);

    const triangles = [];
    let i = 0;
    let j = 0;
    while (i < outer.length - 1 || j < inner.length - 1) {
      const advanceOuter =
        j >= inner.length - 1 ||
        (i < outer.length - 1 && outer[i + 1].along <= inner[j + 1].along);
      if (advanceOuter) {
        triangles.push([outer[i], outer[i + 1], inner[j]]);
        i++;
      } else {
        triangles.push([outer[i], inner[j + 1], inner[j]]);
        j++;
      }
    }

    const base = [
      createVertex(...toPoint(0, 0), true),
      ...outer,
      createVertex(...toPoint(length, 0), true),
    ];

    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.replaceChildren();
    edge.polygons = [];
    addPolygon(edge, base, config.base);
    if (config.facets.length) {
      for (const triangle of triangles) {
        if (Math.random() < FACET_CHANCE) {
          const fill =
            config.facets[Math.floor(Math.random() * config.facets.length)];
          addPolygon(edge, triangle, fill);
        }
      }
    }
    edge.vertices = [...new Set(edge.polygons.flatMap((p) => p.corners))];
    draw(edge);
  }

  function draw(edge) {
    for (const { element, corners } of edge.polygons) {
      element.setAttribute(
        "points",
        corners
          .map((v) => `${(v.x + v.dx).toFixed(2)},${(v.y + v.dy).toFixed(2)}`)
          .join(" "),
      );
    }
  }

  // Sets an edge ringing: its corners tick on their own for a while
  function excite(edge, strength, duration) {
    const seconds = performance.now() / 1000;
    if (excitement(edge, seconds) > strength) return;
    edge.excitedAt = seconds;
    edge.exciteStrength = strength;
    edge.exciteDuration = duration;
    requestFrame();
  }

  // Current excitement, fading linearly to 0
  function excitement(edge, seconds) {
    if (!edge.exciteDuration) return 0;
    const left = 1 - (seconds - edge.excitedAt) / edge.exciteDuration;
    return Math.max(0, left) * edge.exciteStrength;
  }

  // Runs while the mouse is near an edge, an edge is excited or corners are
  // still settling
  function update(time) {
    frame = 0;
    const seconds = time / 1000;
    let moving = false;

    // Drop blasts whose wave has crossed the whole screen and died down
    const reach = Math.hypot(innerWidth, innerHeight) / BLAST_SPEED;
    while (blasts.length && seconds > blasts[0].time + reach + BLAST_DURATION) {
      blasts.shift();
    }

    for (const edge of edges) {
      if (!edge.vertices) continue;
      const rect = edge.box.getBoundingClientRect();
      const near =
        mouse &&
        mouse.x > rect.left - WOBBLE_RADIUS &&
        mouse.x < rect.right + WOBBLE_RADIUS &&
        mouse.y > rect.top - WOBBLE_RADIUS &&
        mouse.y < rect.bottom + WOBBLE_RADIUS;
      const excited = excitement(edge, seconds);
      const blasted =
        blasts.length > 0 && rect.bottom > 0 && rect.top < innerHeight;
      if (!near && !excited && !blasted && !edge.active) continue;
      const scale = rect.height / edge.source.height; // px per SVG unit

      let active = near || excited > 0 || blasted;
      for (const vertex of edge.vertices) {
        let targetX = 0;
        let targetY = 0;
        if (!vertex.pinned) {
          let closeness = 0; // for the pull
          let stirred = 0; // for the ticking, over the larger radius
          if (near) {
            const offsetX = mouse.x - (rect.left + vertex.x * scale);
            const offsetY = mouse.y - (rect.top + vertex.y * scale);
            const distance = Math.hypot(offsetX, offsetY);
            stirred = Math.max(0, 1 - distance / WOBBLE_RADIUS);
            if (distance < RADIUS) {
              closeness = 1 - distance / RADIUS;
              const pull = STRENGTH * vertex.strength * closeness;
              const cos = Math.cos(vertex.angle);
              const sin = Math.sin(vertex.angle);
              const pullX = (offsetX * cos - offsetY * sin) * pull;
              const pullY = (offsetX * sin + offsetY * cos) * pull;
              targetX = Math.round(pullX / STEP) * STEP;
              targetY = Math.round(pullY / STEP) * STEP;
            }
          }

          // Shockwaves: once the ring reaches the corner, it is pushed away
          // from the click and rings, fading over BLAST_DURATION
          let shaken = 0;
          if (blasted) {
            const cornerX = rect.left + vertex.x * scale;
            const cornerY = rect.top + vertex.y * scale;
            for (const blast of blasts) {
              const awayX = cornerX - blast.x;
              const awayY = cornerY - blast.y;
              const distance = Math.hypot(awayX, awayY) || 1;
              const since = seconds - blast.time - distance / BLAST_SPEED;
              if (since < 0 || since > BLAST_DURATION) continue;
              const force =
                (1 - since / BLAST_DURATION) / (1 + distance / BLAST_FALLOFF);
              const push = BLAST_PUSH * vertex.strength * force;
              targetX += Math.round(((awayX / distance) * push) / STEP) * STEP;
              targetY += Math.round(((awayY / distance) * push) / STEP) * STEP;
              shaken = Math.max(shaken, force * 2);
            }
          }

          // On top of the pull, the corner snaps to a new random offset at
          // irregular intervals, so it ticks like crystal instead of
          // floating. Near the mouse it fades in at the rim of WOBBLE_RADIUS
          // and is full in the inner half; an excited edge ticks everywhere. The closer or
          // more excited, the shorter the hold (down to a quarter).
          const energy = Math.max(Math.min(1, stirred * 2), excited, shaken);
          if (energy > 0) {
            const [min, max] = WOBBLE_HOLD;
            const speedUp =
              1 - 0.75 * Math.min(1, Math.max(stirred, excited, shaken));
            if (
              seconds >= vertex.nextWobble ||
              // A long hold drawn while calmer is cut short
              vertex.nextWobble - seconds > max * speedUp
            ) {
              const hold = min + Math.random() * (max - min);
              vertex.nextWobble = seconds + hold * speedUp;
              vertex.wobbleX = Math.round((Math.random() * 2 - 1) * 2) / 2;
              vertex.wobbleY = Math.round((Math.random() * 2 - 1) * 2) / 2;
            }
            targetX += vertex.wobbleX * WOBBLE * energy;
            targetY += vertex.wobbleY * WOBBLE * energy;
          }
        }
        vertex.dx += (targetX / scale - vertex.dx) * EASE;
        vertex.dy += (targetY / scale - vertex.dy) * EASE;
        if (
          Math.abs(targetX / scale - vertex.dx) > 0.01 ||
          Math.abs(targetY / scale - vertex.dy) > 0.01
        ) {
          active = true;
        } else {
          vertex.dx = targetX / scale;
          vertex.dy = targetY / scale;
        }
      }
      draw(edge);
      edge.active = active;
      moving ||= active;
    }

    if (moving) requestFrame();
  }

  function requestFrame() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  // An edge shimmers briefly the first time it scrolls into view, then no
  // more, so scrolling back and forth stays calm
  const entering = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entering.unobserve(entry.target);
      const edge = edges.find((e) => e.box === entry.target);
      if (edge) excite(edge, ...ENTER_EXCITE);
    }
  });

  for (const config of EDGES) {
    for (const host of document.querySelectorAll(config.selector)) {
      const box = document.createElement("div");
      box.className = `magnetic_edge edge_${config.pseudo}`;
      box.setAttribute("aria-hidden", "true");
      const svg = document.createElementNS(SVG_NS, "svg");
      svg.setAttribute("preserveAspectRatio", "none");
      box.append(svg);
      if (config.pseudo === "before") host.prepend(box);
      else host.append(box);
      host.classList.add(`has_edge_${config.pseudo}`);

      const edge = { box, svg, config };
      edges.push(edge);
      build(edge);
      entering.observe(box);
    }
  }

  window.addEventListener("resize", () => {
    for (const edge of edges) build(edge);
  });

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    mouse = { x: event.clientX, y: event.clientY };
    requestFrame();
  });

  document.documentElement.addEventListener("pointerleave", () => {
    mouse = null;
    requestFrame();
  });

  window.addEventListener("scroll", requestFrame, { passive: true });

  // Clicks on these do their own job and stay calm (e.g. while filling in
  // the contact form)
  const INTERACTIVE =
    "a, button, input, textarea, select, label, summary, dialog, [tabindex]";

  // A click on empty space sends a shockwave outwards from the cursor
  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse") return;
    if (event.target.closest(INTERACTIVE)) return;
    blasts.push({
      x: event.clientX,
      y: event.clientY,
      time: performance.now() / 1000,
    });
    requestFrame();
  });
})();
