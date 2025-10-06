# Status Badges Guide

This document explains all status badges used in the project README.

## 🎯 CI/CD Status Badges

### CI Pipeline
```markdown
[![CI](https://github.com/kidzki/immo24-address-decoder/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/kidzki/immo24-address-decoder/actions/workflows/ci.yml)
```

**Shows:** Overall CI pipeline status (type check + tests + build)  
**Updates:** On every push to master  
**Colors:**
- 🟢 Green = All tests passed
- 🔴 Red = Tests failed
- 🟡 Yellow = Running

---

### Test Pipeline
```markdown
[![Tests](https://github.com/kidzki/immo24-address-decoder/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/kidzki/immo24-address-decoder/actions/workflows/test.yml)
```

**Shows:** Test workflow status (unit + E2E + build)  
**Updates:** On every push to master  
**Same colors as CI badge**

---

## 📊 Project Information Badges

### Release Version
```markdown
[![Release](https://img.shields.io/github/v/release/kidzki/immo24-address-decoder?display_name=tag&sort=semver)](https://github.com/kidzki/immo24-address-decoder/releases)
```

**Shows:** Latest GitHub release version  
**Updates:** When new release is created  
**Example:** v0.1.6

---

### License
```markdown
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
```

**Shows:** Project license type  
**Static badge**

---

## 🛠️ Technology Stack Badges

### Bun Runtime
```markdown
[![Uses Bun](https://img.shields.io/badge/Uses-Bun-000000?logo=bun&logoColor=white)](https://bun.sh)
```

**Shows:** Built with Bun runtime  
**Links to:** Bun.sh homepage

---

### TypeScript
```markdown
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
```

**Shows:** TypeScript version used  
**Links to:** TypeScript homepage

---

## 🌐 Platform Badges

### Chrome Extension
```markdown
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=google-chrome&logoColor=white)](https://chrome.google.com/webstore/detail/IMMO24_EXTENSION_ID)
```

**Shows:** Available on Chrome Web Store  
**Links to:** Extension page (when published)

---

### Firefox Add-on
```markdown
[![Firefox Add-on](https://img.shields.io/badge/Firefox-Add--on-FF7139?logo=firefox-browser&logoColor=white)](https://addons.mozilla.org/firefox/addon/IMMO24_ADDON_SLUG)
```

**Shows:** Available on Firefox Add-ons  
**Links to:** Add-on page (when published)

---

## 🎨 Badge Layout

Badges are organized in two rows for better readability:

**Row 1:** Status & Project Info
- CI Status
- Test Status
- Release Version
- License

**Row 2:** Technology & Platforms
- Bun Runtime
- TypeScript Version
- Chrome Extension
- Firefox Add-on

---

## 🔧 Customization

### Change Badge Color
Replace the color code in the badge URL:
```markdown
https://img.shields.io/badge/Label-Text-COLOR
```

Common colors:
- `brightgreen` - Success
- `red` - Error
- `blue` - Info
- `yellow` - Warning
- `orange` - Alert
- Hex codes: `3178C6`, `000000`, etc.

### Add Logo
Add `logo=` parameter:
```markdown
https://img.shields.io/badge/Label-Text-COLOR?logo=LOGO_NAME&logoColor=white
```

Find logos at: https://simpleicons.org/

---

## 📈 Additional Badge Ideas

### Code Coverage (if Codecov configured)
```markdown
[![codecov](https://codecov.io/gh/kidzki/immo24-address-decoder/branch/master/graph/badge.svg)](https://codecov.io/gh/kidzki/immo24-address-decoder)
```

### Dependency Status
```markdown
[![Dependencies](https://img.shields.io/librariesio/github/kidzki/immo24-address-decoder)](https://github.com/kidzki/immo24-address-decoder)
```

### Last Commit
```markdown
[![Last Commit](https://img.shields.io/github/last-commit/kidzki/immo24-address-decoder)](https://github.com/kidzki/immo24-address-decoder/commits/master)
```

### Code Size
```markdown
[![Code Size](https://img.shields.io/github/languages/code-size/kidzki/immo24-address-decoder)](https://github.com/kidzki/immo24-address-decoder)
```

### Issues
```markdown
[![Issues](https://img.shields.io/github/issues/kidzki/immo24-address-decoder)](https://github.com/kidzki/immo24-address-decoder/issues)
```

---

## 🔍 Badge Status Meanings

### GitHub Actions Badges

| Status | Meaning |
|--------|---------|
| ![passing](https://img.shields.io/badge/build-passing-brightgreen) | All checks passed |
| ![failing](https://img.shields.io/badge/build-failing-red) | One or more checks failed |
| ![running](https://img.shields.io/badge/build-running-yellow) | Currently executing |
| ![no status](https://img.shields.io/badge/build-no%20status-lightgrey) | Never run or disabled |

---

## 📚 Resources

- [Shields.io Documentation](https://shields.io/)
- [GitHub Actions Badges](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/adding-a-workflow-status-badge)
- [Simple Icons](https://simpleicons.org/)
- [Badge Generator](https://shields.io/)

---

**Last Updated:** October 6, 2025  
**Total Badges:** 8
