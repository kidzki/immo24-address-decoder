// content.js — IS24 Address Decoder (v1.4.x)

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

  async function loadLocaleBundle(locale) {
    try {
      const url = API.runtime.getURL(`_locales/${locale}/messages.json`);
      const res = await fetch(url);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      const flat = {};
      for (const [k, v] of Object.entries(data)) flat[k] = (v && v.message) || "";
      return flat;
    } catch {
      return null;
    }
  }

  const settings = await getSettings();

  // i18n: Browser-API oder Override-Bundle
  let t = (k) => (API?.i18n?.getMessage ? API.i18n.getMessage(k) : k);
  if (settings.localeOverride && settings.localeOverride !== "auto") {
    const bundle = await loadLocaleBundle(settings.localeOverride);
    if (bundle) t = (k) => (k in bundle ? bundle[k] : k);
  }

  // ---------- Robust decoding helpers --------------------------------------

  // Base64 URL-safe normalisieren
  function b64Normalize(b64) {
    return (b64 || "").replace(/-/g, '+').replace(/_/g, '/').replace(/\s+/g, '');
  }

  // Base64 -> Uint8Array
  function b64ToBytes(b64) {
    const norm = b64Normalize(b64);
    const pad = norm.length % 4 === 0 ? '' : '='.repeat(4 - (norm.length % 4));
    const bin = atob(norm + pad);
    return Uint8Array.from(bin, c => c.charCodeAt(0));
  }

  // Bytes -> String (UTF-8 → Win-1252 → ISO-8859-1 → Fallback)
  function bytesToStringSmart(bytes) {
    try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch {}
    try { return new TextDecoder('windows-1252', { fatal: true }).decode(bytes); } catch {}
    try { return new TextDecoder('iso-8859-1', { fatal: true }).decode(bytes); } catch {}

    // harte Fallbacks
    let s = '';
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i] & 0xff);
    try { return decodeURIComponent(escape(s)); } catch { return s; }
  }

  // Doppelt-UTF8-Heuristik (Ã¶ → ö)
  function fixDoubleUtf8(s) {
    if (!s) return s;
    if (!/[Ã][\x80-\xBF]/.test(s)) return s;
    const bytes = Uint8Array.from([...s].map(ch => ch.charCodeAt(0) & 0xff));
    try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { return s; }
  }

  function sanitizeText(s) {
    if (!s) return s;
    const fixed = fixDoubleUtf8(s);
    return fixed.replace(/\uFFFD/g, ''); // entferne Ersatzzeichen �
  }

  // Hauptdecoder für den IS24-Payload
  function decodeTelekomAddition(encoded) {
    if (!encoded) return null;

    // 0) URL-Decoding (mit + → %20 Fix)
    let urlDecoded;
    try {
      urlDecoded = decodeURIComponent(String(encoded).replace(/\+/g, '%20'));
    } catch {
      urlDecoded = encoded;
    }

    // 1) Base64-Weg: Base64 → Bytes → String → JSON
    let jsonCandidate = null;
    try {
      const bytes = b64ToBytes(urlDecoded);
      jsonCandidate = bytesToStringSmart(bytes);
    } catch {
      // kein Base64: probieren wir weiter unten JSON direkt
    }

    if (jsonCandidate) {
      jsonCandidate = fixDoubleUtf8(jsonCandidate);
      try { return JSON.parse(jsonCandidate); } catch {}
      try { return JSON.parse(decodeURIComponent(jsonCandidate)); } catch {}
    }

    // 2) ggf. war urlDecoded bereits ein JSON-String
    try { return JSON.parse(urlDecoded); } catch {}
    try { return JSON.parse(decodeURIComponent(urlDecoded)); } catch {}

    return null;
  }

  // Extrahiert den codierten String aus Scripts/HTML
  function extractEncodedFromScripts() {
    const re = /"obj_telekomInternetUrlAddition"\s*:\s*"([^"]+)"/g;

    for (const s of document.scripts) {
      const txt = s.textContent || "";
      let m;
      while ((m = re.exec(txt)) !== null) {
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

    const strasse = sanitizeText(address.strasse);
    const hausnummer = sanitizeText(address.hausnummer);
    const plz = sanitizeText(address.plz);
    const ort = sanitizeText(address.ort);
    const ortsteil = sanitizeText(address.ortsteil);

    const addrLine =
      [strasse, hausnummer].filter(Boolean).join(" ") +
      ((plz || ort) ? `\n${[plz, ort].filter(Boolean).join(" ")}` : "") +
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

  // Shortcut (Command) vom Service Worker (Ctrl/⌘+B)
  if (API.runtime && API.runtime.onMessage) {
    API.runtime.onMessage.addListener((msg) => {
      if (msg && msg.type === "IS24_TOGGLE_OVERLAY") {
        if (!overlayEl) runDecoderOnce(); // baut, falls noch nicht da
        toggleOverlay();
      }
    });
  }

  // Live-Änderungen der Optionen anwenden (inkl. Sprach-Override)
  if (API.storage && API.storage.onChanged) {
    API.storage.onChanged.addListener((changes, area) => {
      if (area !== "sync") return;

      // apply changes to settings
      Object.assign(settings, ...Object.keys(changes).map(k => ({ [k]: changes[k].newValue })));

      // Sprache geändert?
      if ("localeOverride" in changes) {
        if (settings.localeOverride && settings.localeOverride !== "auto") {
          loadLocaleBundle(settings.localeOverride).then(bundle => {
            if (bundle) {
              t = (k) => (k in bundle ? bundle[k] : k);
              if (overlayEl) { overlayEl.remove(); overlayEl = null; }
              if (overlayState !== "dismissed") runDecoderOnce();
            }
          });
          return;
        } else {
          // zurück zu Browser-i18n
          t = (k) => (API?.i18n?.getMessage ? API.i18n.getMessage(k) : k);
        }
      }

      // Overlay neu aufbauen mit neuen Einstellungen
      if (overlayEl) { overlayEl.remove(); overlayEl = null; }
      if (overlayState !== "dismissed") runDecoderOnce();
    });
  }
})();
