import { describe, it, expect, vi } from 'vitest';

describe('Locale Bundle Loading', () => {
  async function loadLocaleBundle(locale: string): Promise<Record<string, string> | null> {
    try {
      const url = chrome.runtime.getURL(`_locales/${locale}/messages.json`);
      const res = await fetch(url);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      const flat: Record<string, string> = {};
      for (const [k, v] of Object.entries<any>(data)) {
        flat[k] = (v && v.message) || '';
      }
      return flat;
    } catch {
      return null;
    }
  }

  it('should construct correct URL for locale', () => {
    const getURL = vi.spyOn(chrome.runtime, 'getURL');
    
    loadLocaleBundle('de').catch(() => {});
    
    expect(getURL).toHaveBeenCalledWith('_locales/de/messages.json');
  });

  it('should return null on fetch error', async () => {
    // Mock fetch to fail
    global.fetch = vi.fn().mockResolvedValue({
      ok: false
    });

    const result = await loadLocaleBundle('invalid');
    expect(result).toBeNull();
  });

  it('should flatten message structure', async () => {
    const mockData = {
      optTitle: { message: 'Options' },
      optSave: { message: 'Save' }
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData
    });

    const result = await loadLocaleBundle('en');
    
    expect(result).toEqual({
      optTitle: 'Options',
      optSave: 'Save'
    });
  });

  it('should handle messages without message property', async () => {
    const mockData = {
      optTitle: { message: 'Options' },
      invalid: null,
      empty: {}
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData
    });

    const result = await loadLocaleBundle('en');
    
    expect(result).toEqual({
      optTitle: 'Options',
      invalid: '',
      empty: ''
    });
  });
});

describe('Settings Management', () => {
  interface Settings {
    mapProvider: string;
    autoCopy: boolean;
    position: string;
    theme: string;
    localeOverride: string;
  }

  const DEFAULTS: Settings = {
    mapProvider: 'google',
    autoCopy: false,
    position: 'bottom-right',
    theme: 'dark',
    localeOverride: 'auto'
  };

  async function getSettings(): Promise<Settings> {
    return new Promise((resolve) => {
      if (!chrome?.storage?.sync) {
        resolve(DEFAULTS);
        return;
      }
      chrome.storage.sync.get(DEFAULTS, (items: Settings) => {
        if (chrome.runtime.lastError) {
          resolve(DEFAULTS);
        } else {
          resolve(items);
        }
      });
    });
  }

  it('should return defaults when storage is unavailable', async () => {
    const originalStorage = chrome.storage;
    (chrome as any).storage = undefined;

    const settings = await getSettings();
    expect(settings).toEqual(DEFAULTS);

    (chrome as any).storage = originalStorage;
  });

  it('should return defaults on error', async () => {
    (chrome.runtime as any).lastError = { message: 'Storage error' };
    
    const settings = await getSettings();
    expect(settings).toEqual(DEFAULTS);
    
    (chrome.runtime as any).lastError = undefined;
  });

  it('should return stored settings', async () => {
    const storedSettings: Settings = {
      ...DEFAULTS,
      theme: 'light',
      localeOverride: 'en'
    };

    vi.spyOn(chrome.storage.sync, 'get').mockImplementation((defaults: any, callback: any) => {
      callback(storedSettings);
      return undefined as any;
    });

    const settings = await getSettings();
    expect(settings).toEqual(storedSettings);
  });
});

describe('Clipboard Operations', () => {
  async function copyToClipboard(text: string): Promise<boolean> {
    if (!text) return false;

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  it('should return false for empty text', async () => {
    const result = await copyToClipboard('');
    expect(result).toBe(false);
  });

  it('should return true on successful copy', async () => {
    Object.defineProperty(global.navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined)
      },
      configurable: true
    });

    const result = await copyToClipboard('Test address');
    expect(result).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test address');
  });

  it('should return false on clipboard error', async () => {
    Object.defineProperty(global.navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard error'))
      },
      configurable: true
    });

    const result = await copyToClipboard('Test');
    expect(result).toBe(false);
  });
});
