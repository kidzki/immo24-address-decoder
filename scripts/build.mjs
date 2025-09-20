// scripts/build.mjs
import { build } from 'esbuild';
import cpy from 'cpy';
import { mkdir } from 'node:fs/promises';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const outDir = path.join(root, 'dist');
const outChrome = path.join(outDir, 'chromium');
const outFirefox = path.join(outDir, 'firefox');

// Welche JS-Dateien minifizieren?
const jsEntries = [
  'content.js',
  'options.js',
  'bg.js'
];

// Statische Dateien (werden 1:1 kopiert)
const staticFiles = [
  'manifest.json',
  'options.html'
];

// Statische Verzeichnisse (rekursiv kopieren)
const staticDirs = [
  '_locales',
  'icons' // falls du Icons hast (z. B. icons/icon48.png, icon128.png)
];

async function buildJs(targetDir) {
  await build({
    entryPoints: jsEntries.map(f => path.join(root, f)),
    outdir: targetDir,
    bundle: false,       // kein bundling nötig, nur minify
    minify: true,
    target: ['chrome109', 'firefox109'], // modern genug
    format: 'iife',      // self-executing (passt für content scripts)
    logLevel: 'info'
  });
}

async function copyStatics(targetDir) {
  // Dateien
  await cpy(staticFiles, targetDir, { cwd: root, parents: false });

  // Verzeichnisse
  for (const dir of staticDirs) {
    await cpy(['**/*'], path.join(targetDir, dir), { cwd: path.join(root, dir), dot: true });
  }
}

async function patchManifestFor(target, targetDir) {
  const manifestPath = path.join(targetDir, 'manifest.json');
  const raw = await readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(raw);

  // Für beide Stores gilt Manifest V3. Firefox unterstützt MV3; du hast bereits browser_specific_settings.
  // Hier könntest du bei Bedarf Unterschiede setzen.
  if (target === 'chromium') {
    // Nichts besonderes – ggf. firefox-spezifisches entfernen (optional)
  } else if (target === 'firefox') {
    // Sicherstellen, dass browser_specific_settings gesetzt sind:
    manifest.browser_specific_settings = manifest.browser_specific_settings || {
      gecko: {
        id: "is24-address-decoder@example.com",
        strict_min_version: "109.0"
      }
    };
  }

  // Service Worker/JS-Files sind im Root der jeweiligen dist – Pfade sind identisch.
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
}

async function main() {
  await mkdir(outChrome, { recursive: true });
  await mkdir(outFirefox, { recursive: true });

  // CHROMIUM
  await buildJs(outChrome);
  await copyStatics(outChrome);
  await patchManifestFor('chromium', outChrome);

  // FIREFOX
  await buildJs(outFirefox);
  await copyStatics(outFirefox);
  await patchManifestFor('firefox', outFirefox);

  console.log('Build finished: dist/chromium and dist/firefox');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
