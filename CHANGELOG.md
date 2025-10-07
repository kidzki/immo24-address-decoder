# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-10-07

### 🎉 Major Changes

#### TypeScript Migration
- Complete migration from JavaScript to TypeScript with strict mode enabled
- Full type safety across all components
- Improved developer experience and code maintainability

#### Dynamic Locale Switching
- **New Feature**: Overlay language now updates immediately when changing language in options
- No page reload required - seamless user experience
- Implemented message passing architecture between content and background scripts
- Resolves Content Security Policy limitations

### ✨ Features

- **Architecture Refactoring**:
  - Introduced clean architecture patterns (Strategy, Factory, Builder, Adapter)
  - Separated concerns into distinct modules (builders, factories, strategies, services)
  - Added browser API adapter for cross-browser compatibility
  - Improved code organization and testability

- **Enhanced Build System**:
  - Modern TypeScript build pipeline with esbuild
  - Automated version synchronization between package.json and manifest.json
  - Optimized bundle size (6.9kb final size)
  - Separate builds for Chromium and Firefox

### 🐛 Bug Fixes

- **Spanish Locale**: Added 7 missing translation keys for language selection
- **Spanish Grammar**: Fixed position descriptions ("Abajo a la derecha" instead of "Abajo derecha")
- **Italian Locale**: Removed technical references from user-facing descriptions
- **English Locale**: Corrected multiple translation inconsistencies

### 🧪 Testing

- **Comprehensive Test Suite**:
  - 45 unit tests (Vitest)
  - 54 E2E tests (Playwright)
  - **99 total tests** with 100% pass rate
  
- **Test Coverage**:
  - Translation logic and locale switching
  - Decoding strategies (Base64, ROT13, URL encoding)
  - Overlay builder and factory patterns
  - Options page functionality
  - Locale file completeness and quality
  - User interaction workflows

### 🔧 CI/CD

- **GitHub Actions Workflows**:
  - Automated testing on push and pull requests
  - Build verification for both Chromium and Firefox
  - Status badges in README
  - Continuous integration pipeline

### 📚 Documentation

- Comprehensive architecture documentation
- Migration guide from 0.1.x to 0.2.0
- Testing strategy and guidelines
- CI/CD workflow documentation
- Updated README with build instructions and testing info

### 🔄 Refactoring

- Removed Storybook (incompatible with Bun runtime)
- Replaced with Vitest + Playwright testing stack
- Cleaned up legacy code and documentation
- Improved .gitignore (added .DS_Store for macOS)

### 🌍 Localization

All 4 locales (German, English, Spanish, Italian) are now:
- ✅ Complete (39 keys each)
- ✅ Grammatically correct
- ✅ User-friendly (no technical jargon)
- ✅ Fully tested with E2E validation

### 🔒 Security

- Implemented CSP-compliant message passing for locale loading
- No direct fetch from content scripts
- Secure communication between extension contexts

---

## [0.1.6] - Previous Release

### Changes
- Basic functionality for decoding hidden addresses on ImmoScout24
- Support for 4 languages (German, English, Spanish, Italian)
- Configurable overlay position and language

---

## Installation

Download the appropriate package for your browser:
- **Chromium/Chrome/Edge**: `immo24-chromium-0.2.0.zip`
- **Firefox**: `immo24-firefox-0.2.0.zip`

## Migration from 0.1.x

This release is fully backward compatible. Your existing settings will be preserved.

## Contributors

- [@kidzki](https://github.com/kidzki)

## Links

- [GitHub Repository](https://github.com/kidzki/immo24-address-decoder)
- [Issues](https://github.com/kidzki/immo24-address-decoder/issues)
- [Privacy Policy](docs/PRIVACY_POLICY.md)
