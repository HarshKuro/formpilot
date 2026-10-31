import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const version = pkg.version || '1.0.0';

const releasesDir = path.resolve(rootDir, 'releases');
if (!fs.existsSync(releasesDir)) {
  fs.mkdirSync(releasesDir, { recursive: true });
}

function createZip(sourceDir, zipName) {
  if (!fs.existsSync(sourceDir)) {
    console.error(`[FormPilot] Source directory not found: ${sourceDir}`);
    return;
  }

  const zip = new AdmZip();
  zip.addLocalFolder(sourceDir);
  const zipPath = path.join(releasesDir, zipName);
  zip.writeZip(zipPath);

  const stats = fs.statSync(zipPath);
  console.log(`[FormPilot] Created release archive: ${zipName} (${(stats.size / 1024).toFixed(1)} KB)`);
}

console.log(`[FormPilot] Packaging release archives for version v${version}...`);
createZip(path.resolve(rootDir, 'dist-chrome'), `formpilot-chrome-v${version}.zip`);
createZip(path.resolve(rootDir, 'dist-firefox'), `formpilot-firefox-v${version}.zip`);

