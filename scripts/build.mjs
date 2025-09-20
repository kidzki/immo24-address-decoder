// scripts/build.mjs
import { build } from 'esbuild';
import cpy from 'cpy';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const outDir = path.join(root, 'dist');
const outChrome = path.join(outDir, 'chromium');
const outFirefox = path.join(outDir, 'firefox');

const jsEntries = ['content.js', 'options.js', 'bg.js'];
const staticFiles = ['manifest.json', 'options.html'];
const staticDirs = ['_locales', 'icons']; // falls "icons" existiert

async function buildJs(targetDir) {
  await build({
    entryPoints: jsEntries.map(f => path.join(root, f)),
    outdir: targetDir,
    bundle: false,
    minify: true,
    target: ['chrome109', 'firefox109'],
    format: 'iife',
    logLevel: 'info'
  });
}

async function copyStatics(targetDir) {
  await cpy(staticFiles, targetDir, { cwd: root, parents: false });
  for (const dir of staticDirs) {
    await cpy(['**/*'], path.join(targetDir, dir), { cwd: path.join(root, dir), dot: true, overwrite: true }).catch(()=>{});
  }
}

async function patchManifestFor(target, targetDir) {
  const manifestPath = path.join(targetDir, 'manifest.json');
  const raw = await readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(raw);

  if (target === 'firefox') {
    manifest.browser_specific_settings = manifest.browser_specific_settings || {
      gecko: { id: "is24-address-decoder@example.com", strict_min_version: "109.0" }
    };
  }
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
}

async function main() {
  await mkdir(outChrome, { recursive: true });
  await mkdir(outFirefox, { recursive: true });

  // Chromium
  await buildJs(outChrome);
  await copyStatics(outChrome);
  await patchManifestFor('chromium', outChrome);

  // Firefox
  await buildJs(outFirefox);
  await copyStatics(outFirefox);
  await patchManifestFor('firefox', outFirefox);

  console.log('Build finished: dist/chromium and dist/firefox');
}
main().catch(e => { console.error(e); process.exit(1); });
