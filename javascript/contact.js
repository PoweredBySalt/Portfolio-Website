(() => {
  "use strict";

  const FALLBACK_MESSAGE =
    "Die Nachricht konnte leider nicht gesendet werden. Bitte versuchen Sie es später erneut.";

  const form = document.getElementById("contactForm");
  const status = document.getElementById("contact-status");
  if (!form || !status) return;
  const submitButton = form.querySelector('[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    status.textContent = "";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      const result = await response.json();
      if (result.status === "gesendet") {
        window.location.href = "/sent";
        return;
      }
      status.textContent = result.message || FALLBACK_MESSAGE;
    } catch (error) {
      console.error(error);
      status.textContent = FALLBACK_MESSAGE;
    }
    submitButton.disabled = false;
  });
})();
