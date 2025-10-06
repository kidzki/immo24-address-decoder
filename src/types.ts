// Shared types for the extension

export type MapProvider = 'google' | 'osm' | 'apple';
export type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
export type Theme = 'dark' | 'light';
export type LocaleOverride = 'auto' | 'de' | 'en' | 'es' | 'it';

export interface Settings {
  mapProvider: MapProvider;
  autoCopy: boolean;
  position: Position;
  theme: Theme;
  localeOverride: LocaleOverride;
}

export interface Address {
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  ortsteil: string;
}

export interface ToggleOverlayMessage { type: 'IS24_TOGGLE_OVERLAY'; }
