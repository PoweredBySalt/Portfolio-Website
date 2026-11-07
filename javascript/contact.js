(() => {
  "use strict";

  const FALLBACK_MESSAGE =
    "Die Nachricht konnte leider nicht gesendet werden. Bitte versuchen Sie es später erneut.";

  const form = document.getElementById("contactForm");
  const status = document.getElementById("contact-status");
  if (!form || !status) return;
  const submitButton = form.querySelector('[type="submit"]');
  const buttonText = submitButton.textContent;

  // The hover layer of the button shows a copy of the label (data-text).
  function setLabel(text) {
    submitButton.textContent = text;
    submitButton.dataset.text = text;
  }

  // Shows an error and moves focus to it, so keyboard and screen reader users
  // (and small screens, where it sits below the fold) notice it.
  function showError(message) {
    status.textContent = message;
    status.focus();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    setLabel("Wird gesendet…");
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
      showError(result.message || FALLBACK_MESSAGE);
    } catch (error) {
      console.error(error);
      showError(FALLBACK_MESSAGE);
    }
    submitButton.disabled = false;
    setLabel(buttonText);
  });
})();
