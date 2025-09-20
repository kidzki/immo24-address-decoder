# Immo24 Address Decoder

# Immo24 Address Decoder

[![Build](https://img.shields.io/github/actions/workflow/status/kidzki/immo24-address-decoder/build.yml?branch=main)](https://github.com/kidzki/immo24-address-decoder/actions/workflows/build-release.yml)
[![Release](https://img.shields.io/github/v/release/kidzki/immo24-address-decoder?display_name=tag&sort=semver)](https://github.com/kidzki/immo24-address-decoder/releases)
[![Uses Bun](https://img.shields.io/badge/Uses-Bun-000000?logo=bun&logoColor=white)](https://bun.sh)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=google-chrome&logoColor=white)](https://chrome.google.com/webstore/detail/IMMO24_EXTENSION_ID)
[![Firefox Add-on](https://img.shields.io/badge/Firefox-Add--on-FF7139?logo=firefox-browser&logoColor=white)](https://addons.mozilla.org/firefox/addon/IMMO24_ADDON_SLUG)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)



A simple browser extension for Chrome/Chromium and Firefox that decodes hidden address information on ImmobilienScout24 listings and makes it visible.

## ✨ Features

- Works on ImmobilienScout24 expose pages (`https://www.immobilienscout24.de/expose/*`)
- Overlay toggle via **Ctrl+B** / **⌘+B**
- Supports multiple languages: **German**, **English**, **Spanish**, **Italian**
- Options page with language selection, repo link, and version display
- Minimalistic extension icon in ImmoScout24 colors
- Separate builds for **Chromium (MV3)** and **Firefox (MV2)**

## 🛠️ Development

### Requirements
- [Bun](https://bun.sh/) ≥ v2 latest  
- `zip` CLI installed (for packaging)

### Install dependencies
```bash
bun install
```

### Build
```bash
bun run build:all
```

Outputs:
- `dist/chromium/` – unpacked MV3 build for Chromium-based browsers
- `dist/firefox/` – unpacked MV2 build for Firefox
- `dist/immo24-chromium.zip` – packaged Chromium extension
- `dist/immo24-firefox.zip` – packaged Firefox extension

### Load unpacked
- **Chrome/Edge/Brave**: open `chrome://extensions`, enable developer mode, *Load unpacked*, select `dist/chromium/`.
- **Firefox**: open `about:debugging#/runtime/this-firefox`, *Load Temporary Add-on*, select `dist/firefox/manifest.json`.

## 📦 Release Process

1. Bump version in `manifest.json` and `package.json`.
2. Commit and tag:
   ```bash
   git add manifest.json package.json
   git commit -m "chore: bump version to x.y.z"
   git tag vX.Y.Z
   git push origin main vX.Y.Z
   ```
3. GitHub Actions will:
   - Build & minify extension
   - Create ZIPs for Chromium & Firefox
   - Commit them into `packages/<version>/`
   - Attach them to a GitHub Release

## 🔒 Firefox Notes

- Firefox requires Manifest V2 → the build script automatically converts MV3 → MV2:
  - `background.service_worker` → `background.scripts`
  - `host_permissions` moved into `permissions`
  - Adds `browser_specific_settings.gecko` with:
    - `id`
    - `strict_min_version`
    - `data_collection_permissions` (with `required: ["none"]` if no data is collected)

## 📂 Project Structure

```
├── _locales/         # translations (de, en, es, it)
├── icons/            # extension icons (16,32,48,128 px)
├── bg.js             # background script
├── content.js        # content script
├── options.html      # options page
├── options.js        # options page logic
├── manifest.json     # base manifest (MV3 for Chromium)
├── scripts/build.mjs # build script
```

## ❤️ Contributing

PRs welcome! Please open an issue first for discussion if you want to add a new feature.

---

<div align="center">
Made with ❤️ in Germany ·  
<a href="https://github.com/kidzki/immo24-address-decoder">GitHub Repo</a>
</div>
