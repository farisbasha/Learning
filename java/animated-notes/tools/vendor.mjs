// Copies React UMD builds and latin woff2 fonts into lib/ so pages work offline over file://.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const nm = (p) => join(root, 'node_modules', p);

copyFileSync(nm('react/umd/react.production.min.js'), join(root, 'lib/react.js'));
copyFileSync(nm('react-dom/umd/react-dom.production.min.js'), join(root, 'lib/react-dom.js'));

const faces = [
  ['IBM Plex Sans', 'ibm-plex-sans', [400, 500, 600, 700], ['normal']],
  ['JetBrains Mono', 'jetbrains-mono', [400, 500, 600, 700], ['normal', 'italic']],
];
let css = '';
for (const [family, pkg, weights, styles] of faces) {
  for (const w of weights) for (const s of styles) {
    if (s === 'italic' && w !== 400) continue;
    const file = `${pkg}-latin-${w}-${s}.woff2`;
    // inlined as data: URIs so no browser blocks them over file:// (Firefox restricts parent-dir fonts)
    const b64 = readFileSync(nm(`@fontsource/${pkg}/files/${file}`)).toString('base64');
    css += `@font-face{font-family:'${family}';font-style:${s};font-weight:${w};font-display:block;src:url(data:font/woff2;base64,${b64}) format('woff2');}\n`;
  }
}
writeFileSync(join(root, 'lib/fonts.css'), css);
console.log('vendored react, react-dom, fonts');
