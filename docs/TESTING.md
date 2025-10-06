# Testing Documentation

This project has comprehensive test coverage using two testing approaches.

## 🧪 Test Types

### 1. Unit Tests (Vitest)
- **Location:** `tests/unit/`
- **Framework:** Vitest with Happy DOM
- **Coverage:** Logic and utility functions

### 2. E2E Tests (Playwright)
- **Location:** `tests/e2e/`
- **Framework:** Playwright
- **Coverage:** Full extension functionality in browser

## 🚀 Running Tests

### Unit Tests

```bash
# Run all unit tests
bun run test

# Run tests in watch mode
bun test --watch

# Run tests with UI
bun run test:ui

# Generate coverage report
bun run test:coverage
```

**Coverage Output:**
- HTML Report: `coverage/index.html`
- Text summary in terminal
- LCOV format for CI integration

### E2E Tests

```bash
# Run E2E tests
bun run test:e2e

# Run with UI mode
bun run test:e2e:ui

# Debug mode
bun run test:e2e:debug
```

**Browsers Tested:**
- ✅ Chromium (Chrome, Edge, Brave)
- ✅ Firefox

## 📊 Test Coverage

### Unit Tests Coverage

#### `tests/unit/decoding.test.ts`
- ✅ Base64 Normalization (4 tests)
  - URL-safe to standard base64
  - Whitespace removal
  - Empty string handling
  - Already normalized base64

- ✅ Base64 to Bytes Conversion (3 tests)
  - Valid base64 decoding
  - URL-safe base64 decoding
  - Empty string handling

- ✅ Telekom Address Decoding (4 tests)
  - Valid JSON decoding
  - Invalid base64 handling
  - Empty string handling
  - Invalid JSON handling

- ✅ Address Extraction (5 tests)
  - Complete address extraction
  - Partial address extraction
  - Empty object handling
  - Null input handling
  - Type conversion (numbers to strings)

#### `tests/unit/utils.test.ts`
- ✅ Locale Bundle Loading (4 tests)
  - URL construction
  - Fetch error handling
  - Message structure flattening
  - Missing message properties

- ✅ Settings Management (3 tests)
  - Default fallback when storage unavailable
  - Error handling
  - Stored settings retrieval

- ✅ Clipboard Operations (3 tests)
  - Empty text handling
  - Successful copy
  - Clipboard API errors

**Total:** 26 unit tests ✅

### E2E Tests Coverage

#### `tests/e2e/options.spec.ts`
- ✅ Options Page Loading
- ✅ Form Fields Visibility
- ✅ Default Values
- ✅ Map Provider Options
- ✅ Position Options
- ✅ Theme Options
- ✅ Locale Options
- ✅ Version Display
- ✅ GitHub Link

**Total:** 9 E2E tests ✅

## 🎯 Test Results

```
✓ tests/unit/decoding.test.ts (16 tests) 4ms
✓ tests/unit/utils.test.ts (10 tests) 7ms

Test Files  2 passed (2)
     Tests  26 passed (26)
  Duration  366ms
```

## 🔧 Configuration Files

### `vitest.config.ts`
```typescript
{
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['tests/e2e/**/*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov']
    }
  }
}
```

### `playwright.config.ts`
```typescript
{
  testDir: './tests/e2e',
  projects: [
    { name: 'chromium' },
    { name: 'firefox' }
  ],
  webServer: {
    command: 'bun run build'
  }
}
```

## 🧩 Test Utilities

### Browser API Mocks (`tests/setup.ts`)

Provides mocked Chrome/Firefox APIs:
- `chrome.runtime` - Extension runtime
- `chrome.storage` - Storage API
- `chrome.i18n` - Internationalization
- `chrome.commands` - Keyboard commands
- `chrome.tabs` - Tab management

```typescript
globalThis.chrome = {
  runtime: {
    getURL: vi.fn(),
    getManifest: vi.fn(() => ({ version: '0.1.7' }))
  },
  storage: {
    sync: {
      get: vi.fn(),
      set: vi.fn()
    }
  }
  // ...
};
```

## 📈 CI/CD Integration

### GitHub Actions Example

```yaml
name: Test

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run test:coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bunx playwright install --with-deps
      - run: bun run test:e2e
```

## 🐛 Debugging Tests

### Debug Unit Tests
```bash
# Run specific test file
bunx vitest tests/unit/decoding.test.ts

# Run specific test
bunx vitest -t "should decode valid base64"

# Debug mode
bunx vitest --inspect-brk
```

### Debug E2E Tests
```bash
# Run in headed mode
bunx playwright test --headed

# Run specific test
bunx playwright test -g "should load options page"

# Debug with inspector
bunx playwright test --debug
```

## 📝 Writing New Tests

### Unit Test Template

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something', () => {
    const result = yourFunction();
    expect(result).toBe(expected);
  });
});
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';

test('should do something', async ({ page }) => {
  await page.goto('...');
  await expect(page.locator('...')).toBeVisible();
});
```

## 🎨 Best Practices

### Unit Tests
- ✅ Test pure functions
- ✅ Mock external dependencies
- ✅ Test edge cases and errors
- ✅ Aim for >80% coverage

### E2E Tests
- ✅ Test user workflows
- ✅ Test cross-browser compatibility
- ✅ Keep tests independent
- ✅ Use data-testid for selectors

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Test Coverage:** 26 Unit Tests | 9 E2E Tests  
**Last Updated:** October 6, 2025
