import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const root = process.cwd();
const manifestPath = join(root, 'public', 'manifest.webmanifest');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
  start_url: string;
  scope: string;
  display: string;
  theme_color: string;
  icons: Array<{ src: string; sizes: string; type: string }>;
};

test('PWA manifest has a standalone entry point and valid local icon files', () => {
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.theme_color, '#0B0C0E');
  assert.ok(manifest.icons.length > 0);

  for (const icon of manifest.icons) {
    assert.ok(icon.src.startsWith('/'), `PWA icon must be same-origin: ${icon.src}`);
    assert.ok(existsSync(join(root, 'public', icon.src.slice(1))), `PWA icon file missing: ${icon.src}`);
    assert.equal(icon.type, 'image/svg+xml');
  }
});

test('production entry point registers the service worker without registering it in development', () => {
  const entry = readFileSync(join(root, 'src', 'main.tsx'), 'utf8');
  assert.match(entry, /import\.meta\.env\.PROD/);
  assert.match(entry, /navigator\.serviceWorker\.register\('\/sw\.js'\)/);
});

test('service worker does not cache cross-origin or API responses', () => {
  const worker = readFileSync(join(root, 'public', 'sw.js'), 'utf8');
  assert.match(worker, /url\.origin !== self\.location\.origin/);
  assert.match(worker, /url\.pathname\.startsWith\('\/api\/'\)/);
  assert.match(worker, /request\.method !== 'GET'/);
});
