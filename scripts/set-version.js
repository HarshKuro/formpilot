import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let targetVersion = process.argv[2];

const pkgPath = path.join(rootDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

if (!targetVersion || targetVersion === 'auto') {
  // If no version given, bump patch version: 1.0.0 -> 1.0.1
  const parts = (pkg.version || '1.0.0').split('.').map(n => parseInt(n, 10));
  if (parts.length === 3) {
    parts[2] = parts[2] + 1;
    targetVersion = parts.join('.');
  } else {
    targetVersion = '1.0.1';
  }
}

// Strip leading 'v' if present (Chrome manifests require pure numbers like 1.0.1)
targetVersion = targetVersion.replace(/^v/, '');

console.log(`[FormPilot] Setting version to ${targetVersion}...`);

// 1. Update package.json
pkg.version = targetVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

// 2. Update Chrome manifest
const chromeManifestPath = path.join(rootDir, 'src/manifest.chrome.json');
if (fs.existsSync(chromeManifestPath)) {
  const chromeManifest = JSON.parse(fs.readFileSync(chromeManifestPath, 'utf8'));
  chromeManifest.version = targetVersion;
  fs.writeFileSync(chromeManifestPath, JSON.stringify(chromeManifest, null, 2) + '\n', 'utf8');
}

// 3. Update Firefox manifest
const firefoxManifestPath = path.join(rootDir, 'src/manifest.firefox.json');
if (fs.existsSync(firefoxManifestPath)) {
  const firefoxManifest = JSON.parse(fs.readFileSync(firefoxManifestPath, 'utf8'));
  firefoxManifest.version = targetVersion;
  fs.writeFileSync(firefoxManifestPath, JSON.stringify(firefoxManifest, null, 2) + '\n', 'utf8');
}

console.log(`[FormPilot] Version successfully updated to ${targetVersion} across package.json and manifests.`);
