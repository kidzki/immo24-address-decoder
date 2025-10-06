// Browser API Adapter Pattern
// Provides unified interface for Chrome and Firefox APIs

export interface BrowserAPI {
  storage: {
    sync: {
      get(keys: any, callback: (items: any) => void): void;
      set(items: any, callback?: () => void): void;
    };
    onChanged: {
      addListener(callback: (changes: any, area: string) => void): void;
    };
  };
  runtime: {
    getURL(path: string): string;
    getManifest(): any;
    onMessage: {
      addListener(callback: (msg: any) => void): void;
    };
  };
  tabs: {
    query(query: any): Promise<any[]>;
    sendMessage(tabId: number, message: any): void;
  };
  commands: {
    onCommand: {
      addListener(callback: (command: string) => void): void;
    };
  };
  i18n?: {
    getMessage(key: string): string;
  };
}

class ChromeAPIAdapter implements BrowserAPI {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private chrome: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(chromeAPI: any) {
    this.chrome = chromeAPI;
  }

  get storage() {
    return this.chrome.storage;
  }

  get runtime() {
    return this.chrome.runtime;
  }

  get tabs() {
    return this.chrome.tabs;
  }

  get commands() {
    return this.chrome.commands;
  }

  get i18n() {
    return this.chrome.i18n;
  }
}

class FirefoxAPIAdapter implements BrowserAPI {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private browser: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(browserAPI: any) {
    this.browser = browserAPI;
  }

  get storage() {
    return this.browser.storage;
  }

  get runtime() {
    return this.browser.runtime;
  }

  get tabs() {
    return this.browser.tabs;
  }

  get commands() {
    return this.browser.commands;
  }

  get i18n() {
    return this.browser.i18n;
  }
}

// Factory function to create the appropriate adapter
export function createBrowserAPI(): BrowserAPI {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof browser !== 'undefined') {
    return new FirefoxAPIAdapter(browser as any);
  }
  return new ChromeAPIAdapter(chrome);
}
