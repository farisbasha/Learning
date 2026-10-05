// Build: vendor libs (once), bundle engine + topics to IIFE scripts, write topic pages.
import { build } from 'esbuild';
import { existsSync, readdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { genPages } from './tools/gen-pages.mjs';

const root = dirname(fileURLToPath(import.meta.url));
if (!existsSync(join(root, 'lib/react.js'))) execFileSync('node', [join(root, 'tools/vendor.mjs')], { stdio: 'inherit' });

const common = { bundle: true, format: 'iife', target: 'es2020', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment', logLevel: 'warning', legalComments: 'none' };
const only = process.argv[2];

if (!only || only === 'engine') {
  await build({ ...common, entryPoints: [join(root, 'src/engine/index.jsx')], outfile: join(root, 'lib/an-engine.js') });
  copyFileSync(join(root, 'src/engine/an.css'), join(root, 'lib/an.css'));
}
const all = readdirSync(join(root, 'src/topics')).filter((f) => f.endsWith('.jsx'));
const topics = only === 'engine' ? [] : only ? all.filter((f) => f === `${only}.jsx`) : all;
for (const f of topics) {
  await build({ ...common, entryPoints: [join(root, 'src/topics', f)], outfile: join(root, 'lib/topics', f.replace(/\.jsx$/, '.js')) });
}
const pages = genPages();
console.log(`built engine${topics.length ? ' + ' + topics.map((f) => f.replace('.jsx', '')).join(', ') : ''} · ${pages.length} pages`);
