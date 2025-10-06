// Test setup file
import { vi } from 'vitest';

// Mock browser APIs for unit tests
globalThis.chrome = {
  runtime: {
    getURL: vi.fn((path: string) => `chrome-extension://mock-id/${path}`),
    getManifest: vi.fn(() => ({ version: '0.1.7' })),
    lastError: undefined,
  },
  storage: {
    sync: {
      get: vi.fn((defaults, callback) => {
        callback(defaults);
      }),
      set: vi.fn((data, callback) => {
        callback?.();
      }),
    },
    onChanged: {
      addListener: vi.fn(),
    },
  },
  i18n: {
    getMessage: vi.fn((key: string) => key),
    getUILanguage: vi.fn(() => 'de'),
  },
  commands: {
    onCommand: {
      addListener: vi.fn(),
    },
  },
  tabs: {
    sendMessage: vi.fn(),
  },
} as any;

// Also make it available as 'browser' for Firefox
(globalThis as any).browser = globalThis.chrome;
