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
