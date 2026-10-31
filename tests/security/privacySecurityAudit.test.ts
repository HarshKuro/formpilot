import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Security & Privacy Audit', () => {
  it('manifests request least privilege permissions', () => {
    const chromeManifestPath = path.resolve(__dirname, '../../src/manifest.chrome.json');
    const firefoxManifestPath = path.resolve(__dirname, '../../src/manifest.firefox.json');

    const chromeManifest = JSON.parse(fs.readFileSync(chromeManifestPath, 'utf8'));
    const firefoxManifest = JSON.parse(fs.readFileSync(firefoxManifestPath, 'utf8'));

    // Storage, activeTab, and scripting permissions are permitted for local autofill
    expect(chromeManifest.permissions).toEqual(['storage', 'activeTab', 'scripting']);
    expect(firefoxManifest.permissions).toEqual(['storage', 'activeTab', 'scripting']);

    // Host permissions strictly restricted to Google Forms
    expect(chromeManifest.host_permissions).toEqual(['https://docs.google.com/forms/*']);
    expect(firefoxManifest.host_permissions).toEqual(['https://docs.google.com/forms/*']);

    // Content script match pattern strictly restricted to Google Forms
    expect(chromeManifest.content_scripts[0].matches).toEqual(['https://docs.google.com/forms/*']);
    expect(firefoxManifest.content_scripts[0].matches).toEqual(['https://docs.google.com/forms/*']);
  });

  it('contains zero remote script tags or external network endpoints', () => {
    const srcDir = path.resolve(__dirname, '../../src');

    function scanFiles(dir: string): string[] {
      const results: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results.push(...scanFiles(fullPath));
        } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const files = scanFiles(srcDir);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      // Ensure no fetch, XMLHttpRequest, or analytics APIs are called
      expect(content).not.toMatch(/fetch\s*\(/i);
      expect(content).not.toMatch(/XMLHttpRequest/i);
      expect(content).not.toMatch(/axios/i);
      expect(content).not.toMatch(/google-analytics/i);
      expect(content).not.toMatch(/mixpanel/i);
      expect(content).not.toMatch(/segment\.io/i);
    }
  });
});
