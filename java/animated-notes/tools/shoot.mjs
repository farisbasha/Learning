// Screenshot a topic: one frame per caption (or --times), contact sheets, notes page segments.
// Fails (exit 1) on any page error or console error.
//   node tools/shoot.mjs 8.1 [--times 3,10.5] [--scene Name] [--notes] [--narrow] [--hub]
import { chromium } from 'playwright-core';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadManifest } from './gen-pages.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const args = process.argv.slice(2);
const id = args[0] && !args[0].startsWith('--') ? args[0] : null;
const opt = (k) => { const i = args.indexOf('--' + k); return i < 0 ? null : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };

const m = loadManifest();
let page_rel = null;
for (const p of m.parts) for (const t of p.topics) if (t.id === id) page_rel = `${p.dir}/${t.id}-${t.slug}.html`;
if (!page_rel && !opt('hub')) { console.error('unknown topic ' + id); process.exit(2); }

const errors = [];
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const watch = (page) => {
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push('console: ' + msg.text()); });
};
const out = join(root, 'shots', id || 'hub');
mkdirSync(out, { recursive: true });

async function sheet(files, name, labels) {
  // 2 columns × 3 rows of 960×540 frames, labelled
  const html = `<html><body style="margin:0;background:#000;display:grid;grid-template-columns:960px 960px;gap:4px">${files.map((f, i) => `<div style="position:relative"><img src="${pathToFileURL(f)}" style="width:960px;height:540px;display:block"><div style="position:absolute;left:6px;top:6px;background:#000c;color:#ff0;font:bold 20px monospace;padding:2px 6px">${labels[i]}</div></div>`).join('')}</body></html>`;
  const hp = join(out, '_sheet.html');
  writeFileSync(hp, html);
  const p = await ctx.newPage();
  await p.setViewportSize({ width: 1924, height: Math.ceil(files.length / 2) * 544 });
  await p.goto(pathToFileURL(hp).href);
  await p.waitForTimeout(150);
  await p.screenshot({ path: join(out, name) });
  await p.close();
}

if (opt('hub')) {
  const p = await ctx.newPage(); watch(p);
  await p.goto(pathToFileURL(join(root, 'index.html')).href);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: join(out, 'hub.png'), fullPage: true });
} else if (opt('notes') || opt('narrow')) {
  const width = opt('narrow') ? 900 : 1360;
  const p = await ctx.newPage(); watch(p);
  await p.setViewportSize({ width, height: 1000 });
  await p.goto(pathToFileURL(join(root, page_rel)).href);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  if (sw > width + 1) errors.push(`horizontal overflow: scrollWidth ${sw} > ${width}`);
  const seg = 1800;
  const tag = opt('narrow') ? 'narrow' : 'notes';
  for (let y = 0, i = 0; y < H; y += seg, i++) {
    await p.setViewportSize({ width, height: Math.min(seg, H - y) });
    await p.evaluate((yy) => window.scrollTo(0, yy), y);
    await p.waitForTimeout(250);
    await p.screenshot({ path: join(out, `${tag}-${String(i).padStart(2, '0')}.png`) });
  }
  console.log(`${tag}: ${H}px in ${Math.ceil(H / seg)} segments`);
} else {
  const p = await ctx.newPage(); watch(p);
  await p.goto(pathToFileURL(join(root, page_rel)).href + '?shot=0');
  await p.evaluate(() => document.fonts.ready);
  const info = await p.evaluate(() => window.__anTimes());
  let times;
  if (opt('times')) times = String(opt('times')).split(',').map(Number);
  else {
    const sc = opt('scene');
    const caps = info.caps.filter((c) => !sc || info.scenes.some(([n, st, d]) => n === sc && c[0] >= st && c[0] < st + d));
    // 75% through each caption: the state that caption describes, before any fade-out
    times = caps.map((c) => Math.min(c[1] - 0.4, c[0] + 0.75 * (c[1] - c[0])));
  }
  for (const f of await (await import('node:fs/promises')).readdir(out)) if (f.endsWith('.png')) rmSync(join(out, f));
  const files = [], labels = [];
  for (const T of times) {
    await p.evaluate((x) => window.__anSeek(x), T);
    await p.waitForTimeout(60);
    const f = join(out, `f-${T.toFixed(2).padStart(8, '0')}.png`);
    await p.screenshot({ path: f });
    files.push(f);
    const cap = info.caps.find((c) => T >= c[0] && T < c[1]);
    labels.push(`${T.toFixed(1)}s`);
    void cap;
  }
  for (let i = 0; i < files.length; i += 6) await sheet(files.slice(i, i + 6), `sheet-${String(i / 6).padStart(2, '0')}.png`, labels.slice(i, i + 6));
  console.log(`${files.length} frames, ${Math.ceil(files.length / 6)} sheets → ${out}  (total ${info.total.toFixed(1)}s)`);
}
await browser.close();
if (errors.length) { console.error('ERRORS:\n' + [...new Set(errors)].join('\n')); process.exit(1); }
console.log('no page errors');
