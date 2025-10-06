# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD automation.

## 📋 Available Workflows

### `ci.yml` - Main CI Pipeline ⭐
**Trigger:** Push to `main`, `master`, `develop` or Pull Requests

**What it does:**
1. ✅ TypeScript type checking
2. ✅ Unit tests (26 tests)
3. ✅ E2E tests (18 tests)
4. ✅ Coverage reporting
5. �� Build extension for Chrome & Firefox
6. 📤 Upload artifacts

**Use this for:** Comprehensive testing before merge

---

### `test.yml` - Separated Test Jobs
**Trigger:** Push to `main`, `master` or Pull Requests

**Jobs:**
- `unit-tests` - Run unit tests with coverage
- `e2e-tests` - Run E2E tests with Playwright
- `build` - Build extension packages

**Use this for:** Parallel test execution

---

## 🔧 Local Testing

Test what CI will run:

```bash
# Type check
bun run typecheck

# Unit tests
bunx vitest run

# E2E tests
bun run build
bun run test:e2e

# Build
bun run build:all
```

## 📊 Status

View workflow runs: [Actions Tab](https://github.com/kidzki/immo24-address-decoder/actions)

## 🎯 Coverage

Coverage reports are uploaded to Codecov on every push.

## 📦 Artifacts

- **Playwright Report** - E2E test results (30 days)
- **Coverage Report** - Code coverage HTML (30 days)
- **Extension Builds** - ZIP files (90 days)

---

For detailed documentation, see [docs/CI_CD.md](../../docs/CI_CD.md)
