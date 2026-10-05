// Writes one thin HTML shell per manifest topic whose compiled script exists.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export function loadManifest() {
  const ctx = { window: {} };
  vm.runInNewContext(readFileSync(join(root, 'manifest.js'), 'utf8'), ctx);
  return ctx.window.AN_MANIFEST;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function genPages() {
  const m = loadManifest();
  const out = [];
  for (const part of m.parts) {
    mkdirSync(join(root, part.dir), { recursive: true });
    for (const t of part.topics) {
      if (!existsSync(join(root, 'lib/topics', `${t.id}.js`))) continue;
      const file = join(part.dir, `${t.id}-${t.slug}.html`);
      writeFileSync(join(root, file), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t.id + ' ' + t.title)}</title>
<link rel="stylesheet" href="../lib/fonts.css">
<link rel="stylesheet" href="../lib/an.css">
</head>
<body>
<div id="root"></div>
<script src="../lib/react.js"></script>
<script src="../lib/react-dom.js"></script>
<script src="../manifest.js"></script>
<script src="../lib/an-engine.js"></script>
<script src="../lib/topics/${t.id}.js"></script>
<script>AN.mountTopic(${JSON.stringify(t.id)});</script>
</body>
</html>
`);
      out.push(file);
    }
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(genPages().join('\n'));
