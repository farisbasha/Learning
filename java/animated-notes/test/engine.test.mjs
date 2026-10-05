// Engine behaviour in a real browser, against test/fixture/broken.html.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const url = pathToFileURL(join(root, 'test/fixture/broken.html')).href;

async function withPage(suffix, fn) {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1360, height: 900 } });
    await page.goto(url + suffix);
    await page.waitForTimeout(200);
    await fn(page);
  } finally { await browser.close(); }
}

test('a scene error clears when playback moves to another scene', () => withPage('?shot=1', async (page) => {
  assert.ok(await page.evaluate(() => document.body.innerText.includes('failed to render')), 'error shown in Bad');
  await page.evaluate(() => window.__anSeek(12));
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => document.body.innerText.includes('failed to render')), false, 'error cleared in Good');
  assert.ok(await page.locator('#good-scene').count(), 'good scene renders');
}));

test('a malformed notes block does not blank the page', () => withPage('', async (page) => {
  assert.ok(await page.locator('.an-video').count(), 'video still rendered');
  assert.ok(await page.getByText('fine paragraph').count(), 'other blocks still rendered');
}));

test('keyboard shortcuts work after changing speed', () => withPage('#t=12', async (page) => {
  await page.selectOption('.an-sel', '1.25');
  await page.keyboard.press(' ');
  await page.waitForTimeout(150);
  assert.equal(await page.locator('.an-controls .an-btn').first().innerText(), '❚❚', 'Space started playback');
}));

test('a bad #t= deep link falls back to a valid time', () => withPage('#t=abc', async (page) => {
  assert.equal(await page.locator('.an-time').first().innerText().then((s) => s.includes('NaN')), false);
}));
