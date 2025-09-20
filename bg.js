const API = (typeof browser !== 'undefined') ? browser : chrome;

API.commands.onCommand.addListener(async (command) => {
  if (command !== "toggle-overlay") return;
  try {
    const tabs = await API.tabs.query({ active: true, currentWindow: true });
    const tab = tabs && tabs[0];
    if (!tab || !tab.id) return;
    API.tabs.sendMessage(tab.id, { type: "IS24_TOGGLE_OVERLAY" });
  } catch (e) {
    // ignore
  }
});
