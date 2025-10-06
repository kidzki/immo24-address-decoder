# Design Patterns Directory

This directory contains the implementation of various software design patterns used throughout the project.

## Quick Reference

| Directory | Pattern | Purpose |
|-----------|---------|---------|
| `adapters/` | Adapter | Browser API abstraction |
| `strategies/` | Strategy + Chain | Decoding algorithms |
| `services/` | Singleton | Settings management |
| `factories/` | Factory | Object creation |
| `builders/` | Builder | Complex object construction |
| `commands/` | Command | Action encapsulation |

## Usage Guide

### Browser API Adapter
```typescript
import { createBrowserAPI } from './adapters/browser-api.js';

const api = createBrowserAPI(); // Auto-detects Chrome/Firefox
api.storage.sync.get(defaults, callback);
```

### Decoding Strategies
```typescript
import { createDefaultDecodingChain } from './strategies/decoding-strategies.js';

const decoder = createDefaultDecodingChain();
const result = decoder.decode(encodedData);
```

### Settings Manager (Singleton)
```typescript
import { SettingsManager } from './services/settings-manager.js';

const manager = await SettingsManager.create(api);
const theme = manager.get('theme');
await manager.save({ theme: 'dark' });
```

### Overlay Factory
```typescript
import { OverlayStyleFactory } from './factories/overlay-factory.js';

const style = OverlayStyleFactory.createBaseStyle('dark', 'bottom-right');
const btnStyle = OverlayStyleFactory.createButtonStyle();
```

### Overlay Builder
```typescript
import { OverlayBuilder } from './builders/overlay-builder.ts';

const overlay = new OverlayBuilder(settings, address, translator)
  .withCopyHandler(async (text) => copyToClipboard(text))
  .withCloseHandler(() => dismissOverlay())
  .build();
```

### User Commands
```typescript
import { CopyToClipboardCommand } from './commands/user-commands.js';

const cmd = new CopyToClipboardCommand(
  text,
  () => showSuccess(),
  () => showError()
);
await cmd.execute();
```

## Benefits

- ✅ **Modular** - Each pattern in its own file
- ✅ **Testable** - Easy to mock and test
- ✅ **Reusable** - Patterns can be reused
- ✅ **Maintainable** - Clear separation of concerns
- ✅ **Extensible** - Easy to add new implementations

For detailed documentation, see [DESIGN_PATTERNS.md](../DESIGN_PATTERNS.md)
