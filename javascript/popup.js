(() => {
  "use strict";

  const project_popup = document.getElementById("project_popup");
  const project_header = document.getElementById("project_popup_nav");
  const project_slider = document.getElementById("slider");
  const project_slider_list = project_slider.querySelector("ul");
  const project_slider_arrows = project_slider.querySelectorAll(
    ".controll_prev, .controll_next",
  );
  const project_description = document.getElementById("project_description");
  const description_left =
    project_description.querySelector("#description_left");
  const description_right =
    project_description.querySelector("#description_right");
  const toggle_button = document.getElementById("toggle_description");

  const MOBILE_LAYOUT = window.matchMedia("(max-width: 1200px)");
  const REDUCE_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)");

  const PIN_PAGE_WHILE_POPUP_OPEN = !CSS.supports("overflow", "clip");

  let is_description_open = false;
  let is_sliding = false;
  let slide_width = 0;
  let open_request = 0;
  let popup_information_request = null;
  let is_page_locked = false;
  let locked_scroll_y = 0;

  function load_popup_information() {
    if (!popup_information_request) {
      popup_information_request = fetch(project_popup.dataset.source)
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "JSON konnte nicht geladen werden: " + response.status,
            );
          }
          return response.json();
        })
        .catch((error) => {
          popup_information_request = null;
          throw error;
        });
    }
    return popup_information_request;
  }

  function lock_page_scroll() {
    if (is_page_locked) return;
    is_page_locked = true;
    locked_scroll_y = window.scrollY;

    document.documentElement.classList.add("popup_open");
    if (PIN_PAGE_WHILE_POPUP_OPEN) {
      document.body.style.position = "fixed";
      document.body.style.top = -locked_scroll_y + "px";
      document.body.style.width = "100%";
    }
  }

  function unlock_page_scroll() {
    if (!is_page_locked) return;
    is_page_locked = false;

    document.documentElement.classList.remove("popup_open");
    if (PIN_PAGE_WHILE_POPUP_OPEN) {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo({ top: locked_scroll_y, left: 0, behavior: "instant" });
    }
  }

  async function open_popup(popup_id) {
    const request = ++open_request;

    let popup_information;
    try {
      popup_information = (await load_popup_information())[popup_id];
    } catch (error) {
      console.error(error);
      return;
    }
    if (!popup_information) {
      console.error("Kein Eintrag für Popup " + popup_id + " gefunden");
      return;
    }

    update_popup_information(popup_information);
    update_slider_information(popup_information);

    await wait_for_first_slide();
    if (request !== open_request) return;

    lock_page_scroll();
    if (!project_popup.open) project_popup.showModal();
    void project_popup.offsetWidth;
    project_popup.style.opacity = "1";

    layout_slider();
    update_active_slide();
  }

  function close_popup() {
    project_popup.close();
  }

  function reset_popup() {
    open_request++;
    unlock_page_scroll();
    project_popup.style.opacity = "0";

    project_slider_list
      .querySelectorAll("video")
      .forEach((video) => video.pause());
    project_slider_list.style.width = "";
    project_slider_list.style.marginLeft = "";

    is_description_open = false;
    apply_description_state();
  }

  function apply_description_state() {
    if (MOBILE_LAYOUT.matches) {
      project_description.style.height = is_description_open ? "100%" : "0";
      project_description.inert = !is_description_open;
    } else {
      project_description.style.height = "auto";
      project_description.inert = false;
    }
    toggle_button.setAttribute("aria-expanded", String(is_description_open));
  }

  function toggle_description() {
    is_description_open = !is_description_open;
    apply_description_state();
  }

  function update_slider_information(popup_information) {
    project_slider_list
      .getAnimations()
      .forEach((animation) => animation.cancel());
    is_sliding = false;

    const media = [
      ...(popup_information.slider_images ?? []).map((image) => ({
        type: "image",
        src: image.image_path,
        description: image.image_description,
      })),
      ...(popup_information.slider_videos ?? []).map((video) => ({
        type: "video",
        src: video.video_path,
        description: video.video_description,
      })),
    ];

    const items = media.length === 2 ? [...media, ...media] : media;

    const middle = Math.floor(items.length / 2);
    const ordered = items.map(
      (_, index) => items[(index - middle + items.length) % items.length],
    );

    project_slider_list.style.width = "";
    project_slider_list.style.marginLeft = "";
    project_slider_list.replaceChildren(
      ...ordered.map((medium) => create_slide(medium)),
    );
    update_active_slide();

    project_slider_arrows.forEach((arrow) => {
      arrow.style.display = items.length > 1 ? "block" : "none";
    });
  }

  function create_slide(medium) {
    const li = document.createElement("li");

    if (medium.type === "video") {
      const video = document.createElement("video");
      video.src = medium.src;
      video.preload = "none";
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.controls = true;
      video.setAttribute("aria-label", medium.description);
      li.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = medium.src;
      img.alt = medium.description;
      li.appendChild(img);
    }

    return li;
  }

  function update_active_slide() {
    const slides = [...project_slider_list.children];
    const middle = Math.floor(slides.length / 2);

    slides.forEach((li, index) => {
      const is_active = index === middle;
      li.inert = !is_active;

      const video = li.querySelector("video");
      if (!video) return;
      if (is_active && project_popup.open) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }

  function wait_for_first_slide() {
    const middle = Math.floor(project_slider_list.children.length / 2);
    const img = project_slider_list.children[middle]?.querySelector("img");
    if (!img) return Promise.resolve();

    return Promise.race([
      img.decode().catch(() => {}),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);
  }

  function layout_slider() {
    const slides = project_slider_list.children;
    if (slides.length === 0) return;

    const width = slides[0].getBoundingClientRect().width;
    if (width === 0) return;

    slide_width = width;
    project_slider_list.style.width = width * slides.length + "px";
    project_slider_list.style.marginLeft =
      slides.length % 2 === 0 ? -width + "px" : "0px";
  }

  function slide(direction) {
    if (is_sliding || project_slider_list.children.length < 2) return;
    is_sliding = true;

    const animation = project_slider_list.animate(
      [{ left: "0px" }, { left: -direction * slide_width + "px" }],
      {
        duration: REDUCE_MOTION.matches ? 0 : 200,
        easing: "cubic-bezier(0.37, 0, 0.63, 1)",
        fill: "forwards",
      },
    );

    animation.finished
      .then(() => {
        if (direction > 0) {
          project_slider_list.append(project_slider_list.firstElementChild);
        } else {
          project_slider_list.prepend(project_slider_list.lastElementChild);
        }
        animation.cancel();
        update_active_slide();
      })
      .catch(() => {})
      .finally(() => {
        is_sliding = false;
      });
  }

  function update_popup_information(popup_information) {
    project_header.querySelector("h2").textContent = popup_information.name;
    project_header.querySelector("span").textContent =
      popup_information.short_description;

    description_left.querySelector("p").innerHTML =
      popup_information.description;

    const [worksteps_list, software_list] =
      description_right.querySelectorAll("ul");

    worksteps_list.replaceChildren(
      ...popup_information.worksteps.map((workstep) => {
        const li = document.createElement("li");
        li.textContent = workstep;
        return li;
      }),
    );

    software_list.replaceChildren(
      ...popup_information.used_software.map(
        ({ programm_name, programm_description, programm_path }) => {
          const li = document.createElement("li");

          const img = document.createElement("img");
          img.src = programm_path;
          img.alt = "";

          const span_container = document.createElement("div");
          const span_programm = document.createElement("span");
          const span_programm_description = document.createElement("span");
          span_programm.textContent = programm_name;
          span_programm_description.textContent = programm_description;

          span_container.append(span_programm, span_programm_description);
          li.append(img, span_container);
          return li;
        },
      ),
    );
  }

  document.querySelectorAll(".project_tile[data-project]").forEach((tile) =>
    tile.addEventListener("click", () =>
      open_popup(Number(tile.dataset.project)),
    ),
  );
  document.getElementById("close_popup").addEventListener("click", close_popup);
  project_slider
    .querySelector(".controll_next")
    .addEventListener("click", () => slide(-1));
  project_slider
    .querySelector(".controll_prev")
    .addEventListener("click", () => slide(1));
  toggle_button.addEventListener("click", toggle_description);

  project_popup.addEventListener("click", (event) => {
    if (event.target === project_popup) close_popup();
  });
  project_popup.addEventListener("close", reset_popup);

  MOBILE_LAYOUT.addEventListener("change", () => {
    is_description_open = false;
    apply_description_state();
  });

  new ResizeObserver(layout_slider).observe(project_slider);
  apply_description_state();
})();
