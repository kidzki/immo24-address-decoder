// scripts/build.mjs
import { build as esbuild } from 'esbuild';
import { mkdir, readFile, writeFile, stat, cp as fscp } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const outDir = path.join(root, 'dist');
const outChrome = path.join(outDir, 'chromium');
const outFirefox = path.join(outDir, 'firefox');

const jsEntries = ['content.js', 'options.js', 'bg.js'];
const staticFiles = ['manifest.json', 'options.html'];
const staticDirs = ['_locales', 'icons']; // icons optional

async function exists(p){ try{ await stat(p); return true; } catch{ return false; } }

async function buildJs(targetDir){
  await esbuild({
    entryPoints: jsEntries.map(f => path.join(root, f)),
    outdir: targetDir,
    bundle: false,
    minify: true,
    target: ['chrome109','firefox109'],
    format: 'iife',
    logLevel: 'info'
  });
}

async function copyStatics(targetDir){
  // einzelne Dateien 1:1 kopieren
  for (const f of staticFiles){
    const src = path.join(root, f);
    if (await exists(src)){
      const dst = path.join(targetDir, f);
      await mkdir(path.dirname(dst), { recursive: true });
      await fscp(src, dst);
    }
  }
  // Verzeichnisse rekursiv kopieren (robust, ohne Glob)
  for (const dir of staticDirs){
    const srcDir = path.join(root, dir);
    if (await exists(srcDir)){
      const dstDir = path.join(targetDir, dir);
      await mkdir(path.dirname(dstDir), { recursive: true });
      await fscp(srcDir, dstDir, { recursive: true });
    }
  }
}

function ensureFirefoxGecko(manifest){
  manifest.browser_specific_settings = manifest.browser_specific_settings || {};
  const gecko = manifest.browser_specific_settings.gecko || {};
  manifest.browser_specific_settings.gecko = {
    id: gecko.id || 'is24-address-decoder@example.com',
    strict_min_version: gecko.strict_min_version || '109.0',
    data_collection_permissions: {
      required: ["none"],
      collects_browsing_data: false,
      collects_search_terms: false,
      collects_private_browsing_data: false
    }
  };
}

function mv3toFirefoxMv2(manifest){
  manifest.manifest_version = 2;
  delete manifest.background;
  manifest.background = { scripts: ['bg.js'] };
  if (manifest.host_permissions && manifest.host_permissions.length){
    manifest.permissions = Array.from(new Set([...(manifest.permissions||[]), ...manifest.host_permissions]));
    delete manifest.host_permissions;
  }
  ensureFirefoxGecko(manifest);
  return manifest;
}

async function patchManifestFor(target, targetDir){
  const manifestPath = path.join(targetDir, 'manifest.json');
  const raw = await readFile(manifestPath, 'utf8');
  let manifest = JSON.parse(raw);

  // nach dem Kopieren prüfen, ob default_locale vorhanden ist
  if (manifest.default_locale){
    const locFile = path.join(targetDir, '_locales', manifest.default_locale, 'messages.json');
    if (!(await exists(locFile))){
      // Versuch eines Fallback-Copies aus dem Repo-Root (falls der Verzeichniskopiervorgang schiefging)
      const srcLoc = path.join(root, '_locales', manifest.default_locale, 'messages.json');
      if (await exists(srcLoc)){
        await mkdir(path.dirname(locFile), { recursive: true });
        await fscp(srcLoc, locFile);
      } else {
        throw new Error(`Missing localization: _locales/${manifest.default_locale}/messages.json`);
      }
    }
  }

  if (target === 'firefox'){
    manifest = mv3toFirefoxMv2(manifest);
  }
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
}

function zipDir(srcDir, outZip){
  execFileSync('zip', ['-r', outZip, '.'], { cwd: srcDir, stdio: 'inherit' });
}

async function main(){
  await mkdir(outChrome, { recursive: true });
  await mkdir(outFirefox, { recursive: true });

  // Chromium (MV3)
  await buildJs(outChrome);
  await copyStatics(outChrome);
  await patchManifestFor('chromium', outChrome);

  // Firefox (MV2)
  await buildJs(outFirefox);
  await copyStatics(outFirefox);
  await patchManifestFor('firefox', outFirefox);

  // ZIPs
//   zipDir(outChrome, path.join(outDir, 'immo24-chromium.zip'));
//   zipDir(outFirefox, path.join(outDir, 'immo24-firefox.zip'));

  console.log('\nBuild finished:\n - dist/chromium\n - dist/firefox\n - dist/immo24-chromium.zip\n - dist/immo24-firefox.zip\n');
}

main().catch(err => { console.error(err); process.exit(1); });
