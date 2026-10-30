import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

const target = process.argv[2] || 'chrome';

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function packageForTarget(browser) {
  const manifestSource = path.resolve(rootDir, `src/manifest.${browser}.json`);
  if (!fs.existsSync(manifestSource)) {
    console.error(`Manifest not found for ${browser}: ${manifestSource}`);
    return;
  }

  // Copy target manifest into dist/manifest.json
  const manifestDest = path.resolve(distDir, 'manifest.json');
  fs.copyFileSync(manifestSource, manifestDest);
  console.log(`[FormPilot] Manifest copied for ${browser} -> dist/manifest.json`);

  // Also maintain dedicated dist-<browser> directory
  const targetDir = path.resolve(rootDir, `dist-${browser}`);
  copyDir(distDir, targetDir);
  console.log(`[FormPilot] Packaged full extension for ${browser} -> dist-${browser}/`);
}

if (target === 'all') {
  packageForTarget('chrome');
  packageForTarget('firefox');
} else {
  packageForTarget(target);
}
