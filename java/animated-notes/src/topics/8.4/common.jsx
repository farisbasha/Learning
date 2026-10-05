// 8.4 shared helpers: the two running examples, bit rows, sliding byte blocks, travelling tokens.
// Every hex value used in this topic comes from a real run (JDK 17 unless labelled JDK 25).
const { PAL, MOTION, track, pulse, hexA, toneColor, MONO, Txt, clamp } = window.AN;
const E = MOTION.enter;

// Colour language used in every scene.
export const TONE = { mark: 'violet', klass: 'blue', field: 'flow', ref: 'pull', pad: 'ink', bad: 'bad', len: 'pink' };

export const POINT_SRC = ['public class Point {', '    int x;', '    int y;', '}'];
export const ORDER_SRC = [
  'public class Order {',
  '    boolean paid;      // 1 byte',
  '    int     qty;       // 4 bytes',
  '    long    id;        // 8 bytes',
  '    Object  customer;  // 4 bytes (compressed)',
  '}',
];

export const hexToBits = (hex) => hex.split('').map((h) => parseInt(h, 16).toString(2).padStart(4, '0')).join('');

// A row of bit cells. bits: string of '0'/'1' (msb first). groups: [{from, n, tone, label, glow}].
// reveal(i) → optional override char for cell i (for animations).
export function BitRow({ x, y, bits, groups = [], cw = 26, h = 48, a = 1, fs = 17, lfs = 17, labels = true, reveal, labelY }) {
  if (a <= 0.005) return null;
  const gOf = (i) => groups.find((g) => i >= g.from && i < g.from + g.n);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: clamp(a, 0, 1) }}>
      {bits.split('').map((b0, i) => {
        const g = gOf(i);
        const b = reveal ? reveal(i, b0) : b0;
        const c = g && g.tone !== 'dim' ? toneColor(g.tone) : PAL.ink3;
        const glow = g && g.glow ? g.glow : 0;
        return (
          <div key={i} style={{ position: 'absolute', left: x + i * cw, top: y, width: cw - 2, height: h, boxSizing: 'border-box', borderRadius: 4,
            background: g && g.tone !== 'dim' ? hexA(c, 0.10 + 0.18 * glow) : 'transparent', border: `1.5px solid ${hexA(c, g && g.tone !== 'dim' ? 0.75 : 0.35)}`,
            boxShadow: glow > 0.01 ? `0 0 ${16 * glow}px ${hexA(c, 0.6 * glow)}` : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 ${fs}px ${MONO}`, color: b === '1' ? PAL.ink : PAL.ink3 }}>{b}</div>
        );
      })}
      {labels && groups.filter((g) => g.label).map((g, k) => {
        const c = g.tone !== 'dim' ? toneColor(g.tone) : PAL.ink3;
        const ly = labelY == null ? y + h + 8 : labelY;
        return (
          <React.Fragment key={k}>
            <div style={{ position: 'absolute', left: x + g.from * cw, top: ly, width: g.n * cw - 2, height: 8, borderLeft: `2px solid ${c}`, borderRight: `2px solid ${c}`, borderBottom: `2px solid ${c}`, boxSizing: 'border-box', opacity: g.la == null ? 1 : g.la }}></div>
            <div style={{ position: 'absolute', left: x + g.from * cw + (g.n * cw) / 2, top: ly + 14, transform: 'translateX(-50%)', font: `500 ${lfs}px ${MONO}`, color: c, whiteSpace: 'nowrap', opacity: g.la == null ? 1 : g.la }}>{g.label}</div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// One block of memory placed by byte offset (for strips whose cells slide around).
export function Blk({ x0, y, unit, off, n, h = 70, label, sub, tone, pad, a = 1, glow = 0, fs = 18, sfs = 17, dashed }) {
  if (a <= 0.005) return null;
  const col = tone ? toneColor(tone) : PAL.ink3;
  return (
    <div style={{ position: 'absolute', left: x0 + off * unit, top: y, width: n * unit, height: h, boxSizing: 'border-box', opacity: clamp(a, 0, 1), borderRadius: 6,
      background: pad ? `repeating-linear-gradient(45deg, transparent 0 7px, ${hexA(col, 0.3)} 7px 9px)` : hexA(col, 0.16),
      border: `2px ${dashed || pad ? 'dashed' : 'solid'} ${hexA(col, 0.85)}`, boxShadow: glow > 0.01 ? `0 0 ${24 * glow}px ${hexA(col, 0.6 * glow)}` : 'none',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {label && <div style={{ font: `600 ${fs}px ${MONO}`, color: pad ? PAL.ink3 : PAL.ink, whiteSpace: 'nowrap' }}>{label}</div>}
      {sub && <div style={{ font: `400 ${sfs}px ${MONO}`, color: pad ? PAL.ink3 : col, whiteSpace: 'nowrap', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// Offset labels under a strip at the given byte offsets.
export function Ruler({ x0, y, unit, marks, a = 1, fs = 17, color }) {
  if (a <= 0.005) return null;
  return marks.map((m) => <Txt key={m} x={x0 + m * unit} y={y} anchor="mid" mono fs={fs} color={color || PAL.ink3} a={a}>{String(m)}</Txt>);
}

// A pill that travels along keyframes and fades (same idea as 8.1's Tok).
export function Tok({ t, keys, text, tone = 'flow', from, until, w = 180, h = 46, fs = 20, glowAt }) {
  const start = from == null ? keys[0][0] : from;
  if (t < start) return null;
  const [x, y] = track(t, keys);
  let a = E(t, start, 0.25);
  if (until != null) a *= 1 - E(t, until, 0.3);
  if (a <= 0.01) return null;
  const c = toneColor(tone);
  const g = glowAt != null ? pulse(t, [glowAt], 1.0) : 0;
  return <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, boxSizing: 'border-box', borderRadius: 10, opacity: a, background: hexA(c, 0.16), border: `2px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 ${fs}px ${MONO}`, color: PAL.ink, boxShadow: g > 0.01 ? `0 0 ${26 * g}px ${hexA(c, 0.7 * g)}` : 'none', whiteSpace: 'nowrap' }}>{text}</div>;
}

// Monospace lines inside a Panel body (for decoded values etc.).
export function Lines({ lines, fs = 20, lh = 1.65, pad = '14px 22px', color }) {
  return (
    <div style={{ padding: pad, font: `500 ${fs}px ${MONO}`, color: color || PAL.ink2, lineHeight: lh, whiteSpace: 'pre' }}>
      {lines.map((l, i) => <div key={i} style={{ opacity: l.a == null ? 1 : l.a, color: l.c || undefined }}>{l.s == null ? l : l.s}</div>)}
    </div>
  );
}
