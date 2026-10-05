// Loads the hub and every built topic page over file:// in headless Chrome.
// Fails on any page error or console error, on horizontal overflow at 900px,
// and on a scene error boundary rendering at any caption time.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';
import { loadManifest } from '../tools/gen-pages.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const m = loadManifest();
const pages = m.parts.flatMap((p) => p.topics.filter((t) => existsSync(join(root, 'lib/topics', `${t.id}.js`))).map((t) => ({ id: t.id, file: join(root, p.dir, `${t.id}-${t.slug}.html`) })));

async function open(browser, url, width = 1360) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.goto(url);
  await page.waitForTimeout(300);
  return { page, errors };
}

test('hub and topic pages render without errors', async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  try {
    const hub = await open(browser, pathToFileURL(join(root, 'index.html')).href);
    assert.deepEqual(hub.errors, [], 'hub errors');
    assert.ok(await hub.page.locator('.an-card').count() > 0, 'hub shows topic cards');
    for (const p of pages) {
      const { page, errors } = await open(browser, pathToFileURL(p.file).href, 900);
      assert.deepEqual(errors, [], `${p.id} page errors`);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(sw <= 901, `${p.id} has no horizontal overflow at 900px (got ${sw})`);
      assert.ok(await page.locator('.an-quiz .q').count() > 0, `${p.id} has a quiz`);
      // every caption moment renders without a scene error boundary
      const shot = await open(browser, pathToFileURL(p.file).href + '?shot=0', 1920);
      const times = await shot.page.evaluate(() => window.__anTimes().caps.map((c) => (c[0] + c[1]) / 2));
      for (const T of times) {
        await shot.page.evaluate((x) => window.__anSeek(x), T);
        const bad = await shot.page.evaluate(() => document.body.innerText.includes('failed to render'));
        assert.equal(bad, false, `${p.id} scene error at t=${T.toFixed(1)}`);
      }
      assert.deepEqual(shot.errors, [], `${p.id} shot-mode errors`);
    }
  } finally {
    await browser.close();
  }
});
