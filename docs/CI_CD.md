# CI/CD Pipeline Documentation

This project uses GitHub Actions for continuous integration and deployment.

## 🔄 Workflows

### 1. CI Pipeline (`.github/workflows/ci.yml`)

**Trigger:** Push to `main`, `master`, `develop` or Pull Requests

**Jobs:**

#### Test Suite
- ✅ TypeScript type checking
- ✅ Unit tests (Vitest) with coverage
- ✅ E2E tests (Playwright - Chromium & Firefox)
- ✅ Coverage upload to Codecov
- ✅ Test artifacts upload

#### Build
- 📦 Build Chromium extension (MV3)
- 📦 Build Firefox extension (MV2)
- 📦 Create ZIP packages
- ✅ Upload build artifacts (90 days retention)

**Artifacts:**
- `playwright-report/` - E2E test results
- `coverage/` - Code coverage HTML report
- `extension-builds/` - Built extension ZIPs

### 2. Test Pipeline (`.github/workflows/test.yml`)

**Trigger:** Push to `main`, `master` or Pull Requests

**Jobs:**

#### Unit Tests
- TypeScript compilation check
- Vitest unit tests
- Coverage generation
- Codecov upload

#### E2E Tests
- Playwright browser installation
- Extension build
- E2E test execution
- Test report upload

#### Build
- Extension packaging
- ZIP artifact upload

## 📊 Test Coverage

The CI automatically:
1. Runs all unit tests with coverage
2. Generates coverage reports (LCOV, HTML, JSON)
3. Uploads to Codecov (if token configured)
4. Saves HTML report as artifact

**View coverage:**
- In PR: Check Codecov bot comment
- Locally: `bun run test:coverage` → open `coverage/index.html`
- CI Artifacts: Download from workflow run

## 🧪 Running Tests Locally

### All Tests
```bash
# Unit tests
bunx vitest run

# E2E tests (requires build first)
bun run build
bun run test:e2e

# All tests
bunx vitest run && bun run test:e2e
```

### With Coverage
```bash
bunx vitest run --coverage
open coverage/index.html
```

### Interactive Mode
```bash
# Unit tests with UI
bunx vitest --ui

# E2E tests with UI
bun run test:e2e:ui
```

## 🔒 Secrets Required

### Optional
- `CODECOV_TOKEN` - For coverage uploads (optional, works without)

## 📦 Artifacts

### Test Reports (30 days)
- `playwright-report/` - Interactive HTML report
  - Screenshots on failure
  - Test execution traces
  - Error context

### Coverage Reports (30 days)
- `coverage/` - HTML coverage report
  - Line coverage
  - Branch coverage
  - Function coverage
  - Statement coverage

### Build Artifacts (90 days)
- `immo24-chromium.zip` - Chrome/Edge extension
- `immo24-firefox.zip` - Firefox extension

## 🚀 Deployment

### Manual Release
1. Create a git tag: `git tag v0.1.x`
2. Push tag: `git push origin v0.1.x`
3. CI builds and creates GitHub release
4. Download ZIPs from release

### Automatic Release (if configured)
- Push to `main` triggers build
- Semantic version from package.json
- Automated release creation

## 📈 Status Badges

### CI Status
```markdown
[![CI](https://github.com/kidzki/immo24-address-decoder/actions/workflows/ci.yml/badge.svg)](https://github.com/kidzki/immo24-address-decoder/actions/workflows/ci.yml)
```

### Test Status
```markdown
[![Tests](https://github.com/kidzki/immo24-address-decoder/actions/workflows/test.yml/badge.svg)](https://github.com/kidzki/immo24-address-decoder/actions/workflows/test.yml)
```

### Coverage Status (requires Codecov)
```markdown
[![codecov](https://codecov.io/gh/kidzki/immo24-address-decoder/branch/master/graph/badge.svg)](https://codecov.io/gh/kidzki/immo24-address-decoder)
```

## 🐛 Debugging CI Failures

### Unit Test Failures
1. Check test output in Actions log
2. Run locally: `bunx vitest run`
3. Check for TypeScript errors: `bun run typecheck`

### E2E Test Failures
1. Download `playwright-report` artifact
2. Extract and open `index.html`
3. View screenshots and traces
4. Run locally: `bun run test:e2e:ui`

### Build Failures
1. Check build log in Actions
2. Verify manifest.json is valid
3. Run locally: `bun run build:all`

## 📋 Workflow Matrix

| Workflow | TypeCheck | Unit Tests | E2E Tests | Build | Coverage |
|----------|-----------|------------|-----------|-------|----------|
| CI       | ✅        | ✅         | ✅        | ✅    | ✅       |
| Test     | ✅        | ✅         | ✅        | ✅    | ✅       |

## 🔄 Update Workflows

### Add New Test
1. Add test file in `tests/unit/` or `tests/e2e/`
2. Tests run automatically in CI
3. No workflow changes needed

### Change Node/Bun Version
Update in workflows:
```yaml
- name: Setup Bun
  uses: oven-sh/setup-bun@v1
  with:
    bun-version: 1.2.21  # Specify version
```

### Add New Browser for E2E
Update Playwright config and CI:
```yaml
- name: Install Playwright browsers
  run: bunx playwright install --with-deps chromium firefox webkit
```

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright CI Guide](https://playwright.dev/docs/ci)
- [Vitest CI Integration](https://vitest.dev/guide/ci.html)
- [Codecov Documentation](https://docs.codecov.com/)

---

**Last Updated:** October 6, 2025  
**Status:** ✅ All workflows operational
