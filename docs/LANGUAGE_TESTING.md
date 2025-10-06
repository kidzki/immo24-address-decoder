# Language Testing Guide

## 🌍 Available Languages

- **German (de)** - Default
- **English (en)** - Fixed on Oct 6, 2025
- **Spanish (es)**
- **Italian (it)**

## 🔧 Testing Language Override

### 1. In Options Page

1. Open extension options
2. Go to "Language" section
3. Select a language from dropdown
4. Click "Save"
5. Page will reload automatically
6. Verify all text is in selected language

### 2. In Content Script (Overlay)

**Important:** The content script needs to be reloaded after changing language!

**Method 1: Reload the page**
1. Change language in options
2. Go to an ImmobilienScout24 property page
3. Reload the page (F5 or Cmd+R)
4. Trigger overlay (Ctrl+B / Cmd+B)
5. Verify overlay text is in selected language

**Method 2: storage.onChanged listener**
1. Have the overlay open
2. Change language in options (different tab)
3. The overlay should automatically recreate with new language
4. If not, reload the page

## 🐛 Known Issues (Fixed)

### ✅ Fixed: English showing Spanish text
**Problem:** `_locales/en/messages.json` contained Spanish translations  
**Solution:** Replaced with proper English translations  
**Date:** October 6, 2025

### ✅ Fixed: Language not applying in options page
**Problem:** Options page didn't reload locale bundle on language change  
**Solution:** Implemented `loadLocaleBundle()` and automatic page reload  
**Date:** Previous fix

## 📝 Locale File Structure

Each locale directory contains `messages.json`:

```
_locales/
  ├── de/messages.json  (German - Default)
  ├── en/messages.json  (English)
  ├── es/messages.json  (Spanish)
  └── it/messages.json  (Italian)
```

### Message Keys

All locale files must have these keys:

**Extension Info:**
- `extName` - Extension name
- `extDesc` - Extension description
- `cmdToggle` - Keyboard command description

**UI (Overlay):**
- `uiTitle`, `uiCopy`, `uiCopied`, `uiCopyFail`
- `uiOpenMap`, `uiClose`, `uiNoAddress`

**Options Page:**
- `optTitle`, `optLegendMap`, `optLegendOverlay`, `optLegendLanguage`
- `optMapProvider`, `optPosition`, `optTheme`, `optLanguage`
- `optAutoCopy`, `optSave`, `optSaved`, `optVersion`

**Map Providers:**
- `optGoogle`, `optOsm`, `optApple`

**Positions:**
- `posBR`, `posBL`, `posTR`, `posTL`

**Themes:**
- `themeDark`, `themeLight`

**Languages:**
- `langAuto`, `langDe`, `langEn`, `langEs`, `langIt`

**Footer:**
- `loveMade`, `loveIn`, `loveRepo`

## 🧪 Testing Checklist

### Options Page
- [ ] Title shows in correct language
- [ ] All labels in correct language
- [ ] Map provider options in correct language
- [ ] Position options in correct language
- [ ] Theme options in correct language
- [ ] Language dropdown in correct language
- [ ] Save button in correct language
- [ ] Success message in correct language

### Content Script (Overlay)
- [ ] Overlay title in correct language
- [ ] Copy button in correct language
- [ ] "Copied" feedback in correct language
- [ ] "Open map" button in correct language
- [ ] Close button in correct language
- [ ] "No address found" message in correct language

### Manifest (Chrome/Firefox UI)
- [ ] Extension name matches locale
- [ ] Extension description matches locale
- [ ] Keyboard command description matches locale

## 🔄 How Language Override Works

### 1. Default Behavior (auto)
```typescript
// Uses browser's chrome.i18n.getMessage()
t = (k: string) => chrome.i18n.getMessage(k)
```

### 2. Override Behavior (de/en/es/it)
```typescript
// Loads locale bundle from _locales/{locale}/messages.json
const bundle = await loadLocaleBundle(locale);
t = (k: string) => bundle[k] || k;
```

### 3. Storage Sync
```typescript
// Settings saved to chrome.storage.sync
{
  localeOverride: 'en' | 'de' | 'es' | 'it' | 'auto'
}
```

### 4. Content Script Reload
```typescript
// Listens for storage changes
chrome.storage.onChanged.addListener((changes) => {
  if ('localeOverride' in changes) {
    // Reload bundle and recreate overlay
  }
});
```

## 📊 Translation Status

| Language | Complete | Native Speaker Verified |
|----------|----------|------------------------|
| German   | ✅ Yes   | ✅ Yes                 |
| English  | ✅ Yes   | ⚠️ Machine translation |
| Spanish  | ✅ Yes   | ⚠️ Machine translation |
| Italian  | ✅ Yes   | ⚠️ Machine translation |

## 🚀 Adding New Languages

1. Create directory: `_locales/{code}/`
2. Create `messages.json` with all required keys
3. Add to `types.ts`: `export type LocaleOverride = 'auto' | 'de' | 'en' | 'es' | 'it' | 'NEW';`
4. Add option in `options.html`:
   ```html
   <option value="NEW" data-i18n="langNEW">New Language</option>
   ```
5. Add translation for language name in all locales:
   ```json
   "langNEW": { "message": "New Language Name" }
   ```
6. Test thoroughly!

---

**Last Updated:** October 6, 2025  
**Status:** All languages working correctly ✅
