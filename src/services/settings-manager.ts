// Singleton Pattern for Settings Management

import type { Settings } from '../types.js';
import type { BrowserAPI } from '../adapters/browser-api.js';

export class SettingsManager {
  private static instance: SettingsManager;
  private settings: Settings;
  private readonly defaults: Settings = {
    mapProvider: 'google',
    autoCopy: false,
    position: 'bottom-right',
    theme: 'dark',
    localeOverride: 'auto'
  };

  private constructor(
    private api: BrowserAPI,
    initialSettings?: Settings
  ) {
    this.settings = initialSettings || this.defaults;
  }

  static async create(api: BrowserAPI): Promise<SettingsManager> {
    if (!SettingsManager.instance) {
      const settings = await SettingsManager.loadSettings(api);
      SettingsManager.instance = new SettingsManager(api, settings);
    }
    return SettingsManager.instance;
  }

  static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      throw new Error('SettingsManager not initialized. Call create() first.');
    }
    return SettingsManager.instance;
  }

  private static loadSettings(api: BrowserAPI): Promise<Settings> {
    const defaults: Settings = {
      mapProvider: 'google',
      autoCopy: false,
      position: 'bottom-right',
      theme: 'dark',
      localeOverride: 'auto'
    };

    return new Promise(resolve => {
      try {
        api.storage.sync.get(defaults, (items: Partial<Settings>) => {
          resolve({ ...defaults, ...items });
        });
      } catch {
        resolve(defaults);
      }
    });
  }

  get current(): Settings {
    return { ...this.settings };
  }

  update(newSettings: Partial<Settings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  async save(settings: Partial<Settings>): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.api.storage.sync.set(settings, () => {
          this.update(settings);
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  get(key: keyof Settings): Settings[keyof Settings] {
    return this.settings[key];
  }

  getAll(): Settings {
    return this.current;
  }
}
