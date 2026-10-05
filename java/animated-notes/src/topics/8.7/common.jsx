// 8.7 shared visual language: reference arrows (one style per strength), objects that get
// collected, Reference objects, GC sweeps, heap gauges, small line charts, travelling tokens.
const { PAL, MOTION, track, pulse, hexA, toneColor, MONO, SANS, Txt, Box, Badge, clamp, lerp } = window.AN;
const E = MOTION.enter;

// One look per strength, used in every scene.
export const KIND = {
  strong: { color: PAL.flow, dash: null, w: 3.5, tone: 'flow', name: 'strong' },
  soft: { color: PAL.pull, dash: '16 9', w: 3.5, tone: 'pull', name: 'soft' },
  weak: { color: PAL.blue, dash: '2 9', w: 4, tone: 'blue', name: 'weak' },
  phantom: { color: PAL.violet, dash: '11 6 2 6', w: 3, tone: 'violet', name: 'phantom' },
  final: { color: PAL.pink, dash: '6 6', w: 3, tone: 'pink', name: 'final' },
  bad: { color: PAL.bad, dash: null, w: 4, tone: 'bad', name: 'leak' },
};

// Cut a polyline to the first fraction p of its length.
function partial(P, p) {
  if (p >= 1) return P;
  const seg = [];
  let total = 0;
  for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(l); total += l; }
  let left = total * clamp(p, 0, 1);
  const out = [P[0]];
  for (let i = 1; i < P.length; i++) {
    if (left >= seg[i - 1]) { out.push(P[i]); left -= seg[i - 1]; continue; }
    const f = seg[i - 1] ? left / seg[i - 1] : 0;
    out.push([lerp(P[i - 1][0], P[i][0], f), lerp(P[i - 1][1], P[i][1], f)]);
    break;
  }
  return out;
}
function midpoint(P) {
  let total = 0; const seg = [];
  for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(l); total += l; }
  let left = total / 2;
  for (let i = 1; i < P.length; i++) {
    if (left <= seg[i - 1]) { const f = left / seg[i - 1]; return [lerp(P[i - 1][0], P[i][0], f), lerp(P[i - 1][1], P[i][1], f)]; }
    left -= seg[i - 1];
  }
  return P[0];
}

// A reference arrow. kind picks colour + dash. cut 0..1: the reference is cleared (fades, red ✗).
export function RArrow({ pts, kind = 'strong', draw = 1, a = 1, cut = 0, label, lx, ly, lfs = 17, head = true, color, width, glow = 0 }) {
  if (a <= 0.005 || draw <= 0.001) return null;
  const K = KIND[kind];
  const c = color || K.color;
  const P = partial(pts, draw);
  const d = 'M' + P.map((q) => q.join(',')).join(' L');
  const end = P[P.length - 1], prev = P[P.length - 2] || P[0];
  const ang = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
  const hs = 14;
  const hp = `${end[0]},${end[1]} ${end[0] - hs * Math.cos(ang - 0.42)},${end[1] - hs * Math.sin(ang - 0.42)} ${end[0] - hs * Math.cos(ang + 0.42)},${end[1] - hs * Math.sin(ang + 0.42)}`;
  const op = clamp(a, 0, 1) * (1 - 0.72 * clamp(cut, 0, 1));
  const m = midpoint(pts);
  return (
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
      <g opacity={op}>
        {glow > 0.01 && <path d={d} fill="none" stroke={c} strokeWidth={(width || K.w) + 10} strokeOpacity={0.25 * glow} strokeLinecap="round" strokeLinejoin="round" />}
        <path d={d} fill="none" stroke={c} strokeWidth={width || K.w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={K.dash || undefined} />
        {head && draw > 0.97 && <polygon points={hp} fill={c} />}
        {label && <text x={lx} y={ly} fill={c} opacity={1 - clamp(cut * 1.5, 0, 1)} stroke={PAL.bg} strokeWidth="6" paintOrder="stroke" style={{ font: `600 ${lfs}px ${MONO}` }} textAnchor="middle">{label}</text>}
      </g>
      {cut > 0.01 && (
        <g transform={`translate(${m[0]},${m[1]}) scale(${0.6 + 0.4 * clamp(cut, 0, 1)})`} opacity={clamp(cut * 1.5, 0, 1)}>
          <circle r="17" fill={PAL.bg} stroke={PAL.bad} strokeWidth="3" />
          <path d="M-7,-7 L7,7 M7,-7 L-7,7" stroke={PAL.bad} strokeWidth="3.5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

// A heap object that can be collected: gone 0..1 turns it into a dashed ghost.
export function Obj({ x, y, w = 220, h = 66, name, sub, tone = 'ink', a = 1, gone = 0, glow = 0, fs = 21, sfs = 17, ghostSub = 'collected' }) {
  if (a <= 0.005) return null;
  const g = clamp(gone, 0, 1);
  const dead = g > 0.5;
  return <Box x={x} y={y} w={w} h={h} label={name} sub={dead ? ghostSub : sub} tone={g > 0.05 ? (dead ? 'dim' : 'bad') : tone} dashed={g > 0.05} strike={dead} a={a * (1 - 0.55 * g)} glow={g > 0.05 && !dead ? 0.8 : glow} fs={fs} sfs={sfs} />;
}

// A java.lang.ref.Reference object: its class name, and whether its referent is still set.
export function RefBox({ x, y, w = 290, h = 72, kind = 'weak', title, cleared = 0, a = 1, glow = 0, fs = 19, sfs = 17, sub }) {
  if (a <= 0.005) return null;
  const K = KIND[kind];
  const c = clamp(cleared, 0, 1) > 0.5;
  return <Box x={x} y={y} w={w} h={h} label={<span style={{ color: K.color }}>{title}</span>} sub={sub || (c ? 'referent = null' : 'referent →')} tone={c ? 'dim' : K.tone} a={a} glow={glow} fs={fs} sfs={sfs} />;
}

// A vertical scan line sweeping across a region: "the GC runs here".
export function GcSweep({ t, at, dur = 1.4, x, y, w, h, label = 'GC', tone = 'pull' }) {
  const p = (t - at) / dur;
  if (p < 0 || p > 1.25) return null;
  const c = toneColor(tone);
  const fade = p > 1 ? 1 - (p - 1) / 0.25 : 1;
  const lx = x + w * clamp(p, 0, 1);
  return (
    <React.Fragment>
      <div style={{ position: 'absolute', left: x, top: y, width: lx - x, height: h, background: `linear-gradient(90deg, ${hexA(c, 0)}, ${hexA(c, 0.10)})`, opacity: fade, borderRadius: 12, pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', left: lx - 2, top: y, width: 4, height: h, background: c, boxShadow: `0 0 24px ${c}`, opacity: fade }}></div>
      <Badge x={lx} y={y + 16} text={label} tone={tone} solid a={fade} fs={17} />
    </React.Fragment>
  );
}

// Horizontal heap gauge. value / max in MB.
export function Gauge({ x, y, w, h = 30, value, max, label = 'heap', a = 1, right, unit = 'M', fs = 18 }) {
  if (a <= 0.005) return null;
  const f = clamp(value / max, 0, 1);
  const c = f > 0.85 ? PAL.bad : f > 0.6 ? PAL.pull : PAL.flow;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, opacity: clamp(a, 0, 1) }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', font: `500 ${fs}px ${MONO}`, color: PAL.ink2, marginBottom: 8, whiteSpace: 'nowrap' }}>
        <span>{label}</span><span style={{ color: c }}>{right != null ? right : `${Math.round(value)}${unit} / ${max}${unit}`}</span>
      </div>
      <div style={{ position: 'relative', height: h, borderRadius: 8, background: PAL.panel2, border: `1.5px solid ${PAL.line2}`, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${f * 100}%`, background: `linear-gradient(90deg, ${hexA(c, 0.55)}, ${c})`, borderRadius: 6 }}></div>
      </div>
    </div>
  );
}

// A small line chart. series: [{pts: [[x, y]…], color, n (points shown, fractional ok), dots, label}].
export function Chart({ x, y, w, h, series, xmax, ymax, a = 1, yTicks = [], xTicks = [], yUnit = '', xLabel, title, right }) {
  if (a <= 0.005) return null;
  const px = (v) => x + 70 + (v / xmax) * (w - 100);
  const py = (v) => y + h - 50 - (v / ymax) * (h - 110);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: clamp(a, 0, 1) }}>
      <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box', borderRadius: 14, background: PAL.panel, border: `1.5px solid ${PAL.line2}` }}>
        {title && <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', borderBottom: `1px solid ${PAL.line}`, font: `500 18px ${MONO}`, color: PAL.ink2, whiteSpace: 'nowrap' }}><span>{title}</span>{right && <span style={{ color: PAL.ink3 }}>{right}</span>}</div>}
      </div>
      <svg width="1920" height="1080" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <line x1={px(0)} y1={py(0)} x2={px(xmax)} y2={py(0)} stroke={PAL.line2} strokeWidth="2" />
        {yTicks.map((v) => <g key={'y' + v}><line x1={px(0)} y1={py(v)} x2={px(xmax)} y2={py(v)} stroke={PAL.line} strokeWidth="1" /><text x={px(0) - 10} y={py(v) + 5} fill={PAL.ink3} textAnchor="end" style={{ font: `400 17px ${MONO}` }}>{v}{yUnit}</text></g>)}
        {xTicks.map(([v, l]) => <text key={'x' + v} x={px(v)} y={py(0) + 24} fill={PAL.ink3} textAnchor="middle" style={{ font: `400 17px ${MONO}` }}>{l}</text>)}
        {series.map((s, k) => {
          const n = s.n == null ? s.pts.length : s.n;
          const whole = Math.floor(n);
          const shown = s.pts.slice(0, Math.max(0, whole));
          if (whole < s.pts.length && whole >= 1 && n > whole) {
            const p0 = s.pts[whole - 1], p1 = s.pts[whole], f = n - whole;
            shown.push([lerp(p0[0], p1[0], f), lerp(p0[1], p1[1], f)]);
          }
          if (shown.length < 1) return null;
          return (
            <g key={k}>
              {shown.length > 1 && <polyline points={shown.map((p) => `${px(p[0])},${py(p[1])}`).join(' ')} fill="none" stroke={s.color} strokeWidth="3.5" strokeLinejoin="round" strokeDasharray={s.dash} />}
              {s.dots && shown.map((p, i) => <circle key={i} cx={px(p[0])} cy={py(p[1])} r="5" fill={s.color} />)}
            </g>
          );
        })}
      </svg>
      {xLabel && <div style={{ position: 'absolute', left: x + w - 20, top: y + h - 30, transform: 'translateX(-100%)', font: `400 17px ${MONO}`, color: PAL.ink3, whiteSpace: 'nowrap' }}>{xLabel}</div>}
    </div>
  );
}
export const chartXY = (x, y, w, h, xmax, ymax) => [(v) => x + 70 + (v / xmax) * (w - 100), (v) => y + h - 50 - (v / ymax) * (h - 110)];

// The four arrow styles, as a legend.
export function Legend({ x, y, a = 1, kinds = ['strong', 'soft', 'weak', 'phantom'], gap = 210, len = 90 }) {
  if (a <= 0.005) return null;
  return kinds.map((k, i) => (
    <React.Fragment key={k}>
      <RArrow pts={[[x + i * gap, y], [x + i * gap + len, y]]} kind={k} a={a} />
      <Txt x={x + i * gap + len + 14} y={y} anchor="left-center" mono fs={17} color={KIND[k].color} a={a}>{k}</Txt>
    </React.Fragment>
  ));
}

// "Leak n of 7" tag in the header's right corner.
export function LeakTag({ n, a = 1 }) {
  return <Badge x={1824} y={130} anchor="right" text={`LEAK ${n} OF 7`} tone="bad" a={a} fs={17} />;
}

// A pill that travels along keyframes and fades (8.1's Tok).
export function Tok({ t, keys, text, tone = 'flow', from, until, w = 220, h = 48, fs = 18, glowAt }) {
  const start = from == null ? keys[0][0] : from;
  if (t < start) return null;
  const [x, y] = track(t, keys);
  let a = E(t, start, 0.25);
  if (until != null) a *= 1 - E(t, until, 0.3);
  if (a <= 0.01) return null;
  const c = toneColor(tone);
  const g = glowAt != null ? pulse(t, [glowAt], 1.0) : 0;
  return <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, boxSizing: 'border-box', borderRadius: 10, opacity: a, background: PAL.panel2, border: `2px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 ${fs}px ${MONO}`, color: PAL.ink, boxShadow: g > 0.01 ? `0 0 ${26 * g}px ${hexA(c, 0.7 * g)}` : 'none', whiteSpace: 'nowrap' }}>{text}</div>;
}

// A labelled region (young/old gen, a thread's map…): dashed outline + small caps title.
export function Region({ x, y, w, h, title, tone = 'ink', a = 1, glow = 0, right }) {
  if (a <= 0.005) return null;
  const c = toneColor(tone);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box', borderRadius: 12, border: `2px dashed ${hexA(c, 0.6)}`, background: hexA(c, 0.04 + 0.08 * glow), opacity: clamp(a, 0, 1), boxShadow: glow > 0.01 ? `0 0 ${28 * glow}px ${hexA(c, 0.4 * glow)}` : 'none' }}>
      <div style={{ position: 'absolute', left: 14, top: 8, font: `600 17px ${MONO}`, color: c, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{title}</div>
      {right && <div style={{ position: 'absolute', right: 14, top: 8, font: `500 17px ${MONO}`, color: PAL.ink3, whiteSpace: 'nowrap' }}>{right}</div>}
    </div>
  );
}

// Console items helper: [[at, text, kind?], …] → Console items.
export const items = (rows) => rows.map(([at, text, kind]) => ({ at, text, kind }));
