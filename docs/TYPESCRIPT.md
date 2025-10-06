# TypeScript Migration

This project has been successfully migrated from JavaScript to TypeScript.

## Project Structure

```
src/
├── bg.ts           # Service Worker (Background Script)
├── content.ts      # Content Script for IS24 pages
├── options.ts      # Options page script
├── types.ts        # Shared TypeScript types
└── globals.d.ts    # Ambient declarations for Browser APIs

scripts/
├── build.ts        # TypeScript build script
└── make-icons.ts   # Icon generation script
```

## Scripts

```bash
# TypeScript type checking
bun run typecheck

# Build (compiles TS → JS to dist/)
bun run build

# Generate icon PNGs from SVG
bun run icons

# Full build with TypeCheck and ZIPs
bun run build:all

# Clean build artifacts
bun run clean
```

## Development

### Prerequisites
- Bun or Node.js
- TypeScript 5.9+

### Dependencies
- `typescript` - TypeScript compiler
- `@types/node` - Node.js type definitions
- `@types/chrome` - Chrome Extension API types
- `@types/firefox-webext-browser` - Firefox WebExtension API types
- `esbuild` - Build tool (compiles .ts → .js)
- `sharp` - Image processing for icon generation

### Build Process
1. TypeScript source files are located in `src/` and `scripts/`
2. Build scripts are also written in TypeScript (executed via Bun)
3. esbuild compiles extension code to `dist/chromium` and `dist/firefox`
4. Output files: `bg.js`, `content.js`, `options.js`
5. **Version is automatically synced from `package.json` to `manifest.json`**
6. Manifest files and static assets are copied
7. Firefox: Manifest is converted from MV3 → MV2

## Version Management

The extension version is managed in a single place:

- **Source of truth:** `package.json` → `"version": "0.1.7"`
- **Auto-synced to:** `dist/*/manifest.json` during build

To update the version:
```bash
# Edit package.json version
# Then build - manifest.json will be updated automatically
bun run build
```

## Type Safety

The project uses strict TypeScript settings:
- `strict: true`
- Full typing of all functions
- Interface definitions for Settings, Address, Messages
- Type Guards and Assertions where needed

## Browser API Compatibility

The code works in both Chrome and Firefox:
```typescript
const API: any = (typeof browser !== 'undefined') ? browser : chrome;
```

Ambient declarations in `globals.d.ts` ensure TypeScript compatibility without runtime errors.
