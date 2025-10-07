import type { ToggleOverlayMessage } from './types.js';

// Cross-browser API handle
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const API: any = (typeof browser !== 'undefined') ? (browser as any) : chrome;

API.commands.onCommand.addListener(async (command: string) => {
  if (command !== 'toggle-overlay') return;
  try {
    const tabs = await API.tabs.query({ active: true, currentWindow: true });
    const tab = tabs && tabs[0];
    if (!tab || tab.id == null) return;
    const msg: ToggleOverlayMessage = { type: 'IS24_TOGGLE_OVERLAY' };
    API.tabs.sendMessage(tab.id, msg);
  } catch {
    // ignore
  }
});

// Handle locale data requests from content scripts
API.runtime.onMessage.addListener((message: any, sender: any, sendResponse: (response: any) => void) => {
  if (message.type === 'getLocaleData') {
    const { locale } = message;
    const localeUrl = API.runtime.getURL(`_locales/${locale}/messages.json`);
    
    fetch(localeUrl)
      .then(res => res.json())
      .then(data => {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries<any>(data)) {
          flat[k] = (v && v.message) || '';
        }
        sendResponse({ data: flat });
      })
      .catch(err => {
        console.error('[ImmoScout24 Decoder] Failed to load locale:', err);
        sendResponse({ data: null });
      });
    
    return true; // Keep channel open for async response
  }
});
