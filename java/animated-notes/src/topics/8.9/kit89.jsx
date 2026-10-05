// 8.9 local primitives: a terminal panel with static, fading lines (real tool output) and a token pill.
const { PAL, MOTION, track, pulse, hexA, MONO, toneColor, Panel } = window.AN;
const E = MOTION.enter;

const colorOf = (c) => (c == null ? undefined : c.startsWith('#') || c.startsWith('rgb') ? c : toneColor(c));

// line: string | { s, at, k: 'cmd'|'dim'|'ok'|'err'|'hi', tone, toneA, parts: [[text, color|tone]] }
// Height needed = 44 + 20 + lines × lh.
export function Term({ x, y, w, h, title = 'terminal', right, t = 99, a = 1, lines, fs = 17, lh = 27, tone, glow = 0 }) {
  if (a <= 0.005) return null;
  return (
    <Panel x={x} y={y} w={w} h={h} title={title} right={right} a={a} tone={tone} glow={glow}>
      <div style={{ padding: '10px 18px' }}>
        {lines.map((ln, i) => {
          const L = typeof ln === 'string' ? { s: ln } : ln;
          const o = L.at == null ? 1 : E(t, L.at, 0.3);
          const col = L.k === 'cmd' ? PAL.ink : L.k === 'dim' ? PAL.ink3 : L.k === 'ok' ? PAL.flow : L.k === 'err' ? PAL.bad : L.k === 'hi' ? PAL.pull : colorOf(L.color) || PAL.ink2;
          const ta = L.toneA == null ? 1 : L.toneA;
          const tc = L.tone ? toneColor(L.tone) : null;
          return (
            <div key={i} style={{ height: lh, display: 'flex', alignItems: 'center', whiteSpace: 'pre', font: `${L.k === 'cmd' ? 500 : 400} ${fs}px ${MONO}`, color: col, opacity: o, margin: '0 -18px', padding: '0 18px', background: tc && ta > 0.01 ? hexA(tc, 0.15 * ta) : 'transparent', boxShadow: tc && ta > 0.01 ? `inset 3px 0 0 ${hexA(tc, ta)}` : 'none' }}>
              {L.k === 'cmd' ? <span style={{ color: PAL.ink3 }}>$ </span> : null}
              {L.parts ? L.parts.map(([s, c], j) => <span key={j} style={{ color: colorOf(c) }}>{s}</span>) : L.s}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// A pill that travels along keyframes [[t, x, y], …] and fades.
export function Tok({ t, keys, text, tone = 'flow', from, until, w = 200, h = 46, fs = 20, glowAt }) {
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

// Position along a closed/open polyline at fraction p (0..1).
export function along(pts, p) {
  const seg = [];
  let L = 0;
  for (let i = 0; i < pts.length - 1; i++) { const d = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); seg.push(d); L += d; }
  let r = ((p % 1) + 1) % 1 * L;
  for (let i = 0; i < seg.length; i++) {
    if (r <= seg[i]) { const f = seg[i] ? r / seg[i] : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; }
    r -= seg[i];
  }
  return pts[pts.length - 1];
}
