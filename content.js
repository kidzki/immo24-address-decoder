(async function () {
  // ---------- Cross-browser API --------------------------------------------
  const API = (typeof browser !== 'undefined') ? browser : chrome;

  // ---------- Settings ------------------------------------------------------
  const DEFAULTS = {
    mapProvider: "google",          // "google" | "osm" | "apple"
    autoCopy: false,
    position: "bottom-right",       // "bottom-right" | "bottom-left" | "top-right" | "top-left"
    theme: "dark",                  // "dark" | "light"
    localeOverride: "auto"          // "auto" | "de" | "en" | "es" | "it"
  };

  function getSettings() {
    return new Promise(resolve => {
      try {
        API.storage.sync.get(DEFAULTS, items => resolve({ ...DEFAULTS, ...items }));
      } catch {
        resolve(DEFAULTS);
      }
    });
  }

  // Lädt ein messages.json aus _locales/<locale>/ (für manuellen Override)
  async function loadLocaleBundle(locale) {
    try {
      const url = API.runtime.getURL(`_locales/${locale}/messages.json`);
      const res = await fetch(url);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      // messages.json hat { key: { message: "..." } }
      const flat = {};
      for (const [k, v] of Object.entries(data)) flat[k] = v && v.message || "";
      return flat;
    } catch {
      return null;
    }
  }

  // Erst Settings laden, dann ggf. Übersetzungen
  const settings = await getSettings();

  let t = (k) => (API?.i18n?.getMessage ? API.i18n.getMessage(k) : k);
  if (settings.localeOverride && settings.localeOverride !== "auto") {
    const bundle = await loadLocaleBundle(settings.localeOverride);
    if (bundle) {
      t = (k) => (k in bundle ? bundle[k] : k);
    }
  }

  // ---------- Decoding helpers ---------------------------------------------
  function atobUtf8(b64) {
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    try {
      return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    } catch {
      return decodeURIComponent(Array.from(bytes).map(b => "%" + b.toString(16).padStart(2, "0")).join(""));
    }
  }

  function decodeTelekomAddition(encoded) {
    if (!encoded) return null;
    try {
      const urlDecoded = decodeURIComponent(encoded);
      let jsonString;
      try { jsonString = atobUtf8(urlDecoded); } catch { jsonString = urlDecoded; }
      return JSON.parse(jsonString);
    } catch { return null; }
  }

  function extractEncodedFromScripts() {
    const re = /"obj_telekomInternetUrlAddition"\s*:\s*"([^"]+)"/g;
    for (const s of document.scripts) {
      const t = s.textContent || "";
      let m;
      while ((m = re.exec(t)) !== null) {
        if (m[1]) return m[1];
      }
    }
    const html = document.documentElement.innerHTML;
    const m2 = html.match(/"obj_telekomInternetUrlAddition"\s*:\s*"([^"]+)"/);
    return m2 ? m2[1] : null;
  }

  // ---------- Clipboard -----------------------------------------------------
  async function copyToClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try { await navigator.clipboard.writeText(text); return true; } catch {}
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text; ta.readOnly = true;
      ta.style.position = "fixed"; ta.style.top = "-1000px"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch { return false; }
  }

  // ---------- Overlay UI ----------------------------------------------------
  let overlayEl = null;
  let overlayState = "hidden"; // "hidden" | "visible" | "dismissed"

  function overlayBaseStyle(theme, position) {
    const palette = (theme === "light")
      ? { bg: "#ffffff", fg: "#111827", border: "rgba(0,0,0,.1)", shadow: "rgba(0,0,0,.15)" }
      : { bg: "#111827", fg: "#ffffff", border: "rgba(255,255,255,.08)", shadow: "rgba(0,0,0,.25)" };

    const insetMap = {
      "bottom-right": "inset: auto 16px 16px auto;",
      "bottom-left":  "inset: auto auto 16px 16px;",
      "top-right":    "inset: 16px 16px auto auto;",
      "top-left":     "inset: 16px auto auto 16px;"
    };

    return `
      position: fixed; ${insetMap[position] || insetMap["bottom-right"]} z-index: 2147483647;
      background: ${palette.bg}; color: ${palette.fg}; font: 13px/1.35 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,sans-serif;
      border-radius: 12px; box-shadow: 0 8px 24px ${palette.shadow}; padding: 12px 14px; min-width: 280px; max-width: 360px;
      border: 1px solid ${palette.border}; display: none;
    `;
  }
  function buttonStyle(theme) {
    const primaryBg = "#2563eb";
    return `
      appearance: none; border: 0; border-radius: 10px; padding: 8px 10px; cursor: pointer;
      background: ${primaryBg}; color: #fff; font-weight: 600;
    `;
  }
  function ghostStyle(theme) {
    const border = (theme === "light") ? "rgba(17,24,39,.2)" : "rgba(255,255,255,.2)";
    const text = (theme === "light") ? "#111827" : "#fff";
    return `
      appearance: none; border: 1px solid ${border}; border-radius: 10px; padding: 8px 10px; cursor: pointer;
      background: transparent; color: ${text}; font-weight: 600;
    `;
  }

  function buildMapHref(provider, parts) {
    const q = encodeURIComponent(parts.filter(Boolean).join(" "));
    if (provider === "osm")   return `https://www.openstreetmap.org/search?query=${q}`;
    if (provider === "apple") return `https://maps.apple.com/?q=${q}`;
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }

  function createOverlay(address) {
    const { theme, position, mapProvider } = settings;
    const style = overlayBaseStyle(theme, position);
    const btn = buttonStyle(theme);
    const ghost = ghostStyle(theme);

    const div = document.createElement("div");
    div.id = "is24-address-decoder-overlay";
    div.setAttribute("style", style);

    const title = document.createElement("div");
    title.style.fontWeight = "700";
    title.style.marginBottom = "6px";
    title.textContent = t("uiTitle");

    const line = document.createElement("div");
    line.style.margin = "6px 0 10px";
    line.style.whiteSpace = "pre-wrap";

    const { strasse, hausnummer, plz, ort, ortsteil } = address;
    const addrLine =
      [strasse, hausnummer].filter(Boolean).join(" ") +
      (plz || ort ? `\n${[plz, ort].filter(Boolean).join(" ")}` : "") +
      (ortsteil ? `\n(${ortsteil})` : "");
    line.textContent = addrLine || t("uiNoAddress");

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "8px";
    actions.style.flexWrap = "wrap";

    const copyBtn = document.createElement("button");
    copyBtn.setAttribute("style", btn);
    copyBtn.textContent = t("uiCopy");
    copyBtn.addEventListener("click", async () => {
      const ok = await copyToClipboard(addrLine);
      copyBtn.textContent = ok ? t("uiCopied") : t("uiCopyFail");
      setTimeout(() => (copyBtn.textContent = t("uiCopy")), 1500);
    });

    const mapBtn = document.createElement("a");
    mapBtn.setAttribute("style", ghost + " text-decoration:none; display:inline-flex; align-items:center; justify-content:center;");
    mapBtn.href = buildMapHref(mapProvider, [strasse, hausnummer, plz, ort]);
    mapBtn.target = "_blank";
    mapBtn.rel = "noopener";
    mapBtn.textContent = t("uiOpenMap");

    const closeBtn = document.createElement("button");
    closeBtn.setAttribute("style", ghost);
    closeBtn.textContent = t("uiClose");
    closeBtn.addEventListener("click", () => {
      overlayState = "dismissed";     // dauerhaft für diese URL
      hideOverlay();
    });

    actions.append(copyBtn, mapBtn, closeBtn);
    div.append(title, line, actions);
    document.documentElement.appendChild(div);

    overlayEl = div;
  }

  function showOverlay() {
    if (!overlayEl) return;
    overlayEl.style.display = "block";
    overlayState = "visible";
  }
  function hideOverlay() {
    if (!overlayEl) return;
    overlayEl.style.display = "none";
    overlayState = (overlayState === "dismissed") ? "dismissed" : "hidden";
  }
  function toggleOverlay() {
    if (!overlayEl) return;
    if (overlayState === "visible") hideOverlay();
    else {
      overlayState = "hidden";  // Shortcut darf dismissed „überstimmen“
      showOverlay();
    }
  }

  // ---------- Main / Lifecycle ---------------------------------------------
  // SPA-URL-Wechsel erkennen → „dismissed“ zurücksetzen & neu aufbauen
  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      overlayState = "hidden";
      if (overlayEl) { overlayEl.remove(); overlayEl = null; }
      setTimeout(runDecoderOnce, 300);
    }
  }, 500);

  function runDecoderOnce() {
    if (overlayState === "dismissed") return; // Nutzer wollte es weg
    if (overlayEl) return;                     // bereits gebaut

    const enc = extractEncodedFromScripts();
    if (!enc) return;
    const obj = decodeTelekomAddition(enc);
    if (!obj) return;

    const address = {
      strasse: obj.strasse || obj.street || "",
      hausnummer: obj.hausnummer || obj.houseNumber || obj.housenumber || "",
      plz: obj.plz || obj.zip || obj.postalCode || "",
      ort: obj.ort || obj.city || "",
      ortsteil: obj.ortsteil || obj.district || ""
    };

    if (settings.autoCopy) {
      copyToClipboard([address.strasse, address.hausnummer, address.plz, address.ort].filter(Boolean).join(" "));
    }

    createOverlay(address);
    showOverlay();
  }

  // Start
  const start = () => setTimeout(runDecoderOnce, 0);
  if (document.readyState === "complete" || document.readyState === "interactive") start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });

  // MutationObserver: nur wenn NICHT dismissed und kein Overlay existiert
  const mo = new MutationObserver(() => {
    if (overlayState !== "dismissed" && !overlayEl) {
      setTimeout(runDecoderOnce, 300);
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

  // Shortcut (Command) vom Service Worker
  if (API.runtime && API.runtime.onMessage) {
    API.runtime.onMessage.addListener((msg) => {
      if (msg && msg.type === "IS24_TOGGLE_OVERLAY") {
        if (!overlayEl) runDecoderOnce(); // baut, falls noch nicht da
        toggleOverlay();
      }
    });
  }

  // Live-Änderungen der Optionen anwenden
  if (API.storage && API.storage.onChanged) {
    API.storage.onChanged.addListener((changes, area) => {
      if (area !== "sync") return;
      Object.assign(settings, ...Object.keys(changes).map(k => ({ [k]: changes[k].newValue })));

      // Wenn sich die Sprache ändert und nicht "auto" ist, bundle nachladen
      if ("localeOverride" in changes && settings.localeOverride !== "auto") {
        loadLocaleBundle(settings.localeOverride).then(bundle => {
          if (bundle) {
            t = (k) => (k in bundle ? bundle[k] : k);
            if (overlayEl) { overlayEl.remove(); overlayEl = null; }
            if (overlayState !== "dismissed") runDecoderOnce();
          }
        });
        return;
      }

      // Overlay neu aufbauen mit neuen Einstellungen
      if (overlayEl) { overlayEl.remove(); overlayEl = null; }
      if (overlayState !== "dismissed") runDecoderOnce();
    });
  }
})();
