// Minimal ambient declarations so TypeScript doesn't complain when the
// webextension types are not installed (they are optional for this project).
// If @types/chrome or firefox-webext-browser are installed, they will augment.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const chrome: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const browser: any;
