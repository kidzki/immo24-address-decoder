(function(){
  const API = (typeof browser !== 'undefined') ? browser : chrome;
  const t = (k) => (API?.i18n?.getMessage ? API.i18n.getMessage(k) : k);

  // i18n in DOM anwenden (Texte mit data-i18n ersetzen)
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const msg = t(key);
    if (!msg) return;
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.placeholder = msg;
    } else if (el.tagName === "TITLE") {
      document.title = msg;
    } else {
      el.textContent = msg;
    }
  });

  const DEFAULTS = {
    mapProvider: "google",
    autoCopy: false,
    position: "bottom-right",
    theme: "dark",
    localeOverride: "auto"   // "auto" | "de" | "en" | "es" | "it"
  };

  const form = document.getElementById("form");
  const status = document.getElementById("status");

  function load() {
    try {
      API.storage.sync.get(DEFAULTS, items => {
        form.mapProvider.value = items.mapProvider;
        form.autoCopy.checked = !!items.autoCopy;
        form.position.value = items.position;
        form.theme.value = items.theme;
        if (form.localeOverride) form.localeOverride.value = items.localeOverride || "auto";
      });
    } catch {
      // Fallback auf Defaults
      form.mapProvider.value = DEFAULTS.mapProvider;
      form.autoCopy.checked = DEFAULTS.autoCopy;
      form.position.value = DEFAULTS.position;
      form.theme.value = DEFAULTS.theme;
      if (form.localeOverride) form.localeOverride.value = DEFAULTS.localeOverride;
    }
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = {
      mapProvider: form.mapProvider.value,
      autoCopy: form.autoCopy.checked,
      position: form.position.value,
      theme: form.theme.value,
      localeOverride: form.localeOverride ? form.localeOverride.value : "auto"
    };
    try {
      API.storage.sync.set(data, () => {
        status.textContent = t("optSaved") || "Saved ✓";
        setTimeout(() => status.textContent = "", 1500);
      });
    } catch {
      status.textContent = t("optSaved") || "Saved ✓";
      setTimeout(() => status.textContent = "", 1500);
    }
  });

  load();
})();
