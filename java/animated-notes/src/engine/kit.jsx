// Visual kit: motion helpers + stage primitives. Ported from the Streams tutorial and extended
// for JVM diagrams. All positions are 1920×1080 stage pixels. Every primitive takes `a`
// (0..1 appearance) and renders nothing when a≈0.

export const SANS = "'IBM Plex Sans', system-ui, sans-serif";
export const MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace";

// ── easing + motion ────────────────────────────────────────────────────────
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const Easing = {
  linear: (t) => t,
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeOutBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
const ramp = (t, s, d, ease) => (d <= 0 ? (t >= s ? 1 : 0) : ease(clamp((t - s) / d, 0, 1)));
export const MOTION = {
  enter: (t, s, d = 0.6) => ramp(t, s, d, Easing.easeOutCubic),
  move: (t, s, d = 0.8) => ramp(t, s, d, Easing.easeInOutCubic),
  pop: (t, s, d = 0.5) => ramp(t, s, d, Easing.easeOutBack),
};
export const lerp = (a, b, p) => a + (b - a) * p;
export const lin = (t, s, d) => clamp((t - s) / d, 0, 1);
// visible between a and b, fading in/out over d
export const win = (t, a, b, d = 0.4) => Math.min(MOTION.enter(t, a, d), 1 - MOTION.enter(t, b - d, d));
// 1→0 flash after each time in `times`
export const pulse = (t, times, d = 0.6) => times.reduce((m, ti) => (t >= ti && t < ti + d ? Math.max(m, 1 - (t - ti) / d) : m), 0);
export const countAt = (t, times) => times.filter((ti) => t >= ti).length;
// keyframes [[time, x, y, 'lin'?], …] → [x, y]
export function track(t, keys) {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t < b[0]) {
      const p = b[3] === 'lin' ? lin(t, a[0], b[0] - a[0]) : MOTION.move(t, a[0], b[0] - a[0]);
      return [lerp(a[1], b[1], p), lerp(a[2], b[2], p)];
    }
  }
  const l = keys[keys.length - 1];
  return [l[1], l[2]];
}
// keyframes [[time, value], …] → value
export function track1(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (t < keys[i + 1][0]) return lerp(keys[i][1], keys[i + 1][1], MOTION.move(t, keys[i][0], keys[i + 1][0] - keys[i][0]));
  }
  return keys[keys.length - 1][1];
}
// discrete step: value of the last key whose time ≤ t
export function step(t, keys, initial) {
  let v = initial;
  for (const [ti, val] of keys) if (t >= ti) v = val;
  return v;
}
// moving line highlight: steps [[time, lineIndex | -1], …] → [line (fractional), alpha]
export function hlAt(t, steps) {
  let cur = -2, prev = -2, at = -Infinity, lastValid = -1;
  for (const [ti, li] of steps) {
    if (t >= ti) { prev = cur; cur = li; at = ti; if (li >= 0) lastValid = li; }
  }
  if (cur === -2) return [-1, 0];
  if (cur === -1) return [lastValid, 1 - MOTION.enter(t, at, 0.25)];
  if (prev < 0) return [cur, MOTION.enter(t, at, 0.25)];
  return [lerp(prev, cur, MOTION.move(t, at, 0.3)), 1];
}
export function hexA(hex, a) {
  let m = String(hex).replace('#', '');
  if (m.length === 3) m = m.split('').map((c) => c + c).join('');
  const n = parseInt(m.slice(0, 6), 16) || 0;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

// ── palette + clock ────────────────────────────────────────────────────────
export const PAL = {
  bg: '#0b0d11', panel: '#10131a', panel2: '#171b23', line: 'rgba(255,255,255,0.08)', line2: 'rgba(255,255,255,0.17)',
  ink: '#eceef2', ink2: '#a6adb9', ink3: '#6b7280', flow: '#56d4c4', pull: '#f2b84b', bad: '#f07a6a', str: '#e8a99f',
  violet: '#b29cff', blue: '#7cb4ff', green: '#a6dc6e', pink: '#f08bb4',
};
export const usePal = () => PAL;
export const toneColor = (tone) => ({ bad: PAL.bad, pull: PAL.pull, dim: PAL.ink3, ink: PAL.ink2, violet: PAL.violet, blue: PAL.blue, green: PAL.green, pink: PAL.pink, flow: PAL.flow }[tone] || PAL.flow);
export const ClockCtx = React.createContext(0);
export const useT = () => React.useContext(ClockCtx);

// ── text formatting ────────────────────────────────────────────────────────
// `code` → mono flow; **bold** → bright
export function fmt(text, codeColor = PAL.flow) {
  const out = [];
  String(text).split('`').forEach((part, i) => {
    if (i % 2) { out.push(<span key={'c' + i} style={{ font: `500 0.9em ${MONO}`, color: codeColor }}>{part}</span>); return; }
    part.split('**').forEach((q, j) => {
      out.push(j % 2 ? <b key={i + '-' + j} style={{ color: PAL.ink, fontWeight: 600 }}>{q}</b> : <React.Fragment key={i + '-' + j}>{q}</React.Fragment>);
    });
  });
  return out;
}

const KW = new Set(('new return try var for if else break continue void boolean long int double float char byte short interface throws throw class record static public private protected final ' +
  'null true false while do this super extends implements import package abstract enum switch case default catch finally instanceof synchronized volatile transient native sealed permits yield when').split(' '));
export function hiJava(s) {
  const re = /(\/\/.*$)|("(?:[^"\\]|\\.)*"?)|('(?:[^'\\]|\\.)*'?)|(@\w+)|(\b\d[\d_.]*[LlFfDd]?\b)|([A-Za-z_$][\w$]*)|(\s+)|([\s\S])/g;
  const out = [];
  let m, k = 0;
  while ((m = re.exec(s))) {
    let color = PAL.ink, w = 400, fs;
    if (m[1]) { color = PAL.ink3; fs = 'italic'; }
    else if (m[2] || m[3]) color = PAL.str;
    else if (m[4]) color = PAL.violet;
    else if (m[5]) color = PAL.bad;
    else if (m[6]) {
      if (KW.has(m[6])) color = PAL.pull;
      else if (/^[A-Z]/.test(m[6])) color = PAL.flow;
      else if (s[re.lastIndex] === '(') { color = PAL.ink; w = 600; }
      else color = '#cfd4dc';
    } else if (m[8]) color = PAL.ink2;
    out.push(<span key={k++} style={{ color, fontWeight: w, fontStyle: fs }}>{m[0]}</span>);
  }
  return out;
}
// javap-style bytecode: "  4: invokevirtual #7  // Method …"
export function hiByte(s) {
  const re = /(\/\/.*$)|(^\s*\d+:)|(#\d+)|(\b[a-z][a-z0-9_]*\b)|(-?\b\d+\b)|([\s\S])/g;
  const out = [];
  let m, k = 0, sawOp = false;
  while ((m = re.exec(s))) {
    let color = PAL.ink2, w = 400, fs;
    if (m[1]) { color = PAL.ink3; fs = 'italic'; }
    else if (m[2]) color = PAL.ink3;
    else if (m[3]) color = PAL.violet;
    else if (m[4]) { if (!sawOp) { color = PAL.pull; w = 600; sawOp = true; } else color = PAL.ink; }
    else if (m[5]) color = PAL.bad;
    out.push(<span key={k++} style={{ color, fontWeight: w, fontStyle: fs }}>{m[0]}</span>);
  }
  return out;
}
export function hiShell(s) {
  if (/^\s*[$>]/.test(s)) {
    const i = s.indexOf(s.trim()[0]) + 1;
    return [<span key="p" style={{ color: PAL.ink3 }}>{s.slice(0, i)}</span>, <span key="c" style={{ color: PAL.ink, fontWeight: 500 }}>{s.slice(i)}</span>];
  }
  if (/^\s*#/.test(s)) return [<span key="c" style={{ color: PAL.ink3, fontStyle: 'italic' }}>{s}</span>];
  return [<span key="o" style={{ color: PAL.ink2 }}>{s}</span>];
}
export const highlight = (s, lang) => (lang === 'bytecode' ? hiByte(s) : lang === 'shell' ? hiShell(s) : lang === 'plain' ? [<span key="p">{s}</span>] : hiJava(s));

// ── primitives ─────────────────────────────────────────────────────────────
export function Txt({ x, y, children, fs = 22, color, mono, w, a = 1, weight = 400, align = 'left', anchor, lh = 1.3, style }) {
  if (a <= 0.005) return null;
  const tr = anchor === 'center' ? 'translate(-50%, -50%)' : anchor === 'mid' ? 'translateX(-50%)' : anchor === 'right' ? 'translateX(-100%)' : anchor === 'left-center' ? 'translateY(-50%)' : 'none';
  const kids = typeof children === 'string' ? fmt(children) : children;
  return <div style={{ position: 'absolute', left: x, top: y, width: w, transform: tr, opacity: clamp(a, 0, 1), font: `${weight} ${fs}px ${mono ? MONO : SANS}`, lineHeight: lh, color: color || PAL.ink, textAlign: align, whiteSpace: w ? 'normal' : 'nowrap', textWrapStyle: w ? 'pretty' : undefined, ...style }}>{kids}</div>;
}

export function Panel({ x, y, w, h, title, right, a = 1, tone, dashed, glow = 0, children, titleColor, fill }) {
  if (a <= 0.005) return null;
  const tc = tone ? toneColor(tone) : null;
  const bc = glow > 0.01 && tc ? tc : tc ? hexA(tc, 0.75) : PAL.line2;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: clamp(a, 0, 1), transform: `translateY(${(1 - clamp(a, 0, 1)) * 14}px)`, background: fill || PAL.panel, border: `1.5px ${dashed ? 'dashed' : 'solid'} ${bc}`, borderRadius: 14, boxSizing: 'border-box', overflow: 'hidden', boxShadow: glow > 0.01 && tc ? `0 0 ${36 * glow}px ${hexA(tc, 0.4 * glow)}` : '0 14px 40px rgba(0,0,0,0.35)' }}>
      {title != null && (
        <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '0 18px', borderBottom: `1px solid ${PAL.line}`, font: `500 19px ${MONO}`, color: titleColor || (tc ? tc : PAL.ink2), whiteSpace: 'nowrap' }}>
          <span>{title}</span>{right != null ? <span style={{ color: PAL.ink3 }}>{right}</span> : null}
        </div>
      )}
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}

// Generic labelled rectangle (memory region, class, frame, byte cell…).
export function Box({ x, y, w, h, a = 1, label, sub, tone, fill, dashed, glow = 0, r = 12, fs = 22, sfs = 17, mono = true, align = 'center', children, s = 1, strike, labelColor, style }) {
  if (a <= 0.005) return null;
  const c = tone ? toneColor(tone) : null;
  const bg = fill === true && c ? hexA(c, 0.14) : fill || PAL.panel2;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box', borderRadius: r, opacity: clamp(a, 0, 1), transform: `scale(${s * (0.94 + 0.06 * clamp(a, 0, 1))})`, background: bg, border: `2px ${dashed ? 'dashed' : 'solid'} ${c ? (glow > 0.01 ? c : hexA(c, 0.8)) : PAL.line2}`, boxShadow: glow > 0.01 && c ? `0 0 ${30 * glow}px ${hexA(c, 0.55 * glow)}` : 'none', display: 'flex', flexDirection: 'column', alignItems: align === 'left' ? 'flex-start' : 'center', justifyContent: 'center', padding: align === 'left' ? '0 16px' : 0, textAlign: align, overflow: 'hidden', ...style }}>
      {label != null && <div style={{ font: `600 ${fs}px ${mono ? MONO : SANS}`, color: labelColor || (c && tone !== 'ink' ? PAL.ink : PAL.ink), whiteSpace: 'nowrap', textDecoration: strike ? 'line-through' : 'none' }}>{typeof label === 'string' ? fmt(label) : label}</div>}
      {sub != null && <div style={{ font: `400 ${sfs}px ${mono ? MONO : SANS}`, color: c || PAL.ink2, marginTop: 3, whiteSpace: 'nowrap' }}>{typeof sub === 'string' ? fmt(sub, PAL.ink) : sub}</div>}
      {children}
    </div>
  );
}

export function Chip({ x, y, text, tone, o = 1, s = 1, ghost, glow = 0, fs = 22, h = 48, mono }) {
  if (o <= 0.01) return null;
  const c = ghost ? PAL.ink3 : toneColor(tone);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, opacity: clamp(o, 0, 1), display: 'flex', alignItems: 'center', height: h, padding: '0 16px', borderRadius: h / 2, boxSizing: 'border-box', background: ghost ? 'rgba(11,13,17,0.6)' : PAL.panel2, border: `2px ${ghost ? 'dashed' : 'solid'} ${c}`, boxShadow: glow > 0.01 ? `0 0 ${26 * glow}px ${hexA(c, 0.6 * glow)}` : '0 4px 14px rgba(0,0,0,0.35)', color: ghost ? PAL.ink3 : PAL.ink, font: `600 ${fs}px ${mono ? MONO : SANS}`, whiteSpace: 'nowrap' }}>{text}</div>
  );
}

const valStyle = (tone, ghost, glow, fs, h) => {
  const c = ghost ? PAL.ink3 : toneColor(tone);
  return { height: h, minWidth: h, padding: '0 14px', boxSizing: 'border-box', borderRadius: h / 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: ghost ? 'transparent' : PAL.panel2, border: `2px ${ghost ? 'dashed' : 'solid'} ${c}`, font: `600 ${fs}px ${MONO}`, color: ghost ? PAL.ink3 : PAL.ink, whiteSpace: 'nowrap', boxShadow: glow > 0.01 ? `0 0 ${22 * glow}px ${hexA(c, 0.6 * glow)}` : 'none' };
};
// A value token (number, reference) centred on (x, y).
export function Val({ x, y, text, tone, o = 1, s = 1, glow = 0, fs = 22, h = 44, ghost }) {
  if (o <= 0.01) return null;
  return <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, opacity: clamp(o, 0, 1), ...valStyle(tone, ghost, glow, fs, h) }}>{text}</div>;
}
// Moves a Val along keyframes; optional fade-out time.
export function Mover({ t, keys, text, tone, fadeAt, s = 1, glowAt, fs, h }) {
  if (t < keys[0][0]) return null;
  const [x, y] = track(t, keys);
  let o = MOTION.enter(t, keys[0][0], 0.15);
  if (fadeAt != null) o *= 1 - MOTION.enter(t, fadeAt, 0.3);
  if (o <= 0.01) return null;
  return <Val x={x} y={y} text={text} tone={tone} o={o} s={s} glow={glowAt != null ? pulse(t, [glowAt], 1.0) : 0} fs={fs || 22} h={h || 44} />;
}

// Code panel. lines: string | {s, at (typing start), o, tone (line tint)}. hl/hlA from hlAt().
export function Code({ x, y, w, h, title = 'Main.java', right, lines, t = 99, a = 1, hl = -1, hlA = 0, fs = 22, lh = 36, cps = 55, lang = 'java', tone, hlTone = 'pull' }) {
  if (a <= 0.005) return null;
  const hc = toneColor(hlTone);
  return (
    <Panel x={x} y={y} w={w} h={h} title={title} right={right} a={a} tone={tone}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 12 + hl * lh, height: lh, background: hexA(hc, 0.13), borderLeft: `3px solid ${hc}`, opacity: hl < 0 ? 0 : hlA }}></div>
      <div style={{ padding: '12px 22px', position: 'relative' }}>
        {lines.map((ln, i) => {
          const L = typeof ln === 'string' ? { s: ln } : ln;
          let txt = L.s, caret = false, op = 1;
          if (L.at != null) {
            const n = Math.floor(clamp((t - L.at) * (L.cps || cps), 0, L.s.length));
            op = t >= L.at ? 1 : 0;
            txt = L.s.slice(0, n);
            caret = t >= L.at && n < L.s.length;
          }
          if (L.o != null) op *= L.o;
          return (
            <div key={i} style={{ height: lh, display: 'flex', alignItems: 'center', whiteSpace: 'pre', font: `400 ${fs}px ${MONO}`, color: PAL.ink, opacity: op, background: L.tone ? hexA(toneColor(L.tone), 0.12 * (L.toneA == null ? 1 : L.toneA)) : 'transparent', margin: '0 -22px', padding: '0 22px' }}>
              {highlight(txt, L.lang || lang)}{caret && <span style={{ width: 2, height: fs * 1.1, background: PAL.pull, marginLeft: 1 }}></span>}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// Terminal. items: [{at, text, kind: 'err'|'dim'|'cmd'|undefined}]
export function Console({ x, y, w, h, items, t, a = 1, fs = 20, lh = 32, title = 'terminal' }) {
  if (a <= 0.005) return null;
  const vis = items.filter((it) => t >= it.at);
  const max = Math.max(1, Math.floor((h - 44 - 24) / lh));
  const shown = vis.slice(-max);
  const blink = Math.floor(t * 2) % 2 === 0;
  return (
    <Panel x={x} y={y} w={w} h={h} title={title} a={a}>
      <div style={{ padding: '12px 20px' }}>
        {shown.map((it, i) => (
          <div key={it.at + ':' + i} style={{ height: lh, display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'pre', font: `${it.kind === 'cmd' ? 500 : 400} ${fs}px ${MONO}`, color: it.kind === 'err' ? PAL.bad : it.kind === 'dim' ? PAL.ink3 : it.kind === 'ok' ? PAL.flow : PAL.ink, opacity: MOTION.enter(t, it.at, 0.3) }}>
            {it.kind === 'cmd' ? <span style={{ color: PAL.ink3 }}>$</span> : null}<span>{it.text}</span>
          </div>
        ))}
        {shown.length < max && <div style={{ height: lh, display: 'flex', alignItems: 'center', font: `400 ${fs}px ${MONO}`, color: PAL.ink3 }}>{blink ? '▍' : ' '}</div>}
      </div>
    </Panel>
  );
}

export function Mark({ x, y, ok, a }) {
  if (a <= 0.01) return null;
  const c = ok ? PAL.flow : PAL.bad;
  return <div style={{ position: 'absolute', left: x - 20, top: y - 20, width: 40, height: 40, borderRadius: 20, background: c, color: PAL.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 24px ${SANS}`, transform: `scale(${a})`, opacity: clamp(a, 0, 1) }}>{ok ? '✓' : '✗'}</div>;
}
export const markA = (t, at, hold = 1.0) => MOTION.pop(t, at, 0.4) * (1 - MOTION.enter(t, at + hold, 0.3));

export function HArrow({ x1, x2, y, a = 1, color, label, dashed, labelBelow, lfs = 18 }) {
  if (a <= 0.005) return null;
  const c = color || PAL.ink2;
  const left = Math.min(x1, x2), w = Math.abs(x2 - x1), r = x2 >= x1;
  const head = r ? { right: 0, borderLeft: `12px solid ${c}` } : { left: 0, borderRight: `12px solid ${c}` };
  return (
    <div style={{ position: 'absolute', left, top: y - 10, width: w, height: 20, opacity: a }}>
      <div style={{ position: 'absolute', left: r ? 0 : 10, right: r ? 10 : 0, top: 9, borderTop: `2px ${dashed ? 'dashed' : 'solid'} ${c}` }}></div>
      <div style={{ position: 'absolute', top: 3, width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', ...head }}></div>
      {label && <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: labelBelow ? 22 : -26, font: `500 ${lfs}px ${MONO}`, color: c, whiteSpace: 'nowrap' }}>{label}</div>}
    </div>
  );
}
export function VArrow({ x, y1, y2, a = 1, color, label, lfs = 18 }) {
  if (a <= 0.005) return null;
  const c = color || PAL.ink2;
  const top = Math.min(y1, y2), h = Math.abs(y2 - y1), d = y2 >= y1;
  const head = d ? { bottom: 0, borderTop: `12px solid ${c}` } : { top: 0, borderBottom: `12px solid ${c}` };
  return (
    <div style={{ position: 'absolute', left: x - 10, top, width: 20, height: h, opacity: a }}>
      <div style={{ position: 'absolute', left: 9, top: d ? 0 : 10, bottom: d ? 10 : 0, borderLeft: `2px solid ${c}` }}></div>
      <div style={{ position: 'absolute', left: 3, width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', ...head }}></div>
      {label && <div style={{ position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)', font: `500 ${lfs}px ${MONO}`, color: c, whiteSpace: 'nowrap' }}>{label}</div>}
    </div>
  );
}

// SVG arrow along points, optionally curved; draw 0..1 animates it being drawn.
// pts: [[x,y], …]. curve > 0 bends a 2-point arrow (perpendicular offset in px).
export function Arrow({ pts, from, to, curve = 0, draw = 1, a = 1, color, width = 2.5, dashed, label, lx, ly, lfs = 18, head = true, tone }) {
  const id = React.useId().replace(/:/g, '');
  if (a <= 0.005 || draw <= 0.001) return null;
  const P = pts || [from, to];
  const c = color || (tone ? toneColor(tone) : PAL.ink2);
  let d;
  let end = P[P.length - 1], prev = P[P.length - 2];
  if (P.length === 2 && curve) {
    const [x1, y1] = P[0], [x2, y2] = P[1];
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const cx = mx - ((y2 - y1) / len) * curve, cy = my + ((x2 - x1) / len) * curve;
    d = `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
    prev = [cx, cy];
  } else d = 'M' + P.map((p) => p.join(',')).join(' L');
  const ang = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
  const hs = 13;
  const hp = `${end[0]},${end[1]} ${end[0] - hs * Math.cos(ang - 0.42)},${end[1] - hs * Math.sin(ang - 0.42)} ${end[0] - hs * Math.cos(ang + 0.42)},${end[1] - hs * Math.sin(ang + 0.42)}`;
  return (
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: clamp(a, 0, 1), pointerEvents: 'none' }}>
      {dashed && draw < 1 && <defs><mask id={'m' + id}><path d={d} pathLength="1" fill="none" stroke="#fff" strokeWidth={width + 6} strokeDasharray="1" strokeDashoffset={1 - draw} /></mask></defs>}
      <path d={d} fill="none" stroke={c} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" pathLength={dashed ? undefined : 1}
        strokeDasharray={dashed ? '8 7' : '1'} strokeDashoffset={dashed ? 0 : 1 - draw} mask={dashed && draw < 1 ? `url(#m${id})` : undefined} />
      {head && draw > 0.97 && <polygon points={hp} fill={c} />}
      {label && <text x={lx} y={ly} fill={c} style={{ font: `500 ${lfs}px ${MONO}` }} textAnchor="middle">{label}</text>}
    </svg>
  );
}

export function Dot({ x, y, a = 1, color, r = 10 }) {
  if (a <= 0.01) return null;
  const c = color || PAL.flow;
  return <div style={{ position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: r, background: c, boxShadow: `0 0 20px ${c}`, opacity: a }}></div>;
}

export function Card({ x, y, w, h, a = 1, num, title, sub, glow = 0, tone, tfs = 32, sfs = 23 }) {
  if (a <= 0.005) return null;
  const c = toneColor(tone);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box', padding: '26px 28px', opacity: clamp(a, 0, 1), transform: `translateY(${(1 - clamp(a, 0, 1)) * 16}px)`, background: PAL.panel, borderRadius: 14, border: `1.5px solid ${glow > 0.01 ? c : PAL.line2}`, boxShadow: glow > 0.01 ? `0 0 ${36 * glow}px ${hexA(c, 0.35 * glow)}` : '0 14px 40px rgba(0,0,0,0.35)' }}>
      {num != null && <div style={{ font: `600 20px ${MONO}`, color: tone ? c : PAL.pull }}>{num}</div>}
      <div style={{ font: `600 ${tfs}px ${SANS}`, color: PAL.ink, marginTop: num != null ? 10 : 0, lineHeight: 1.15 }}>{typeof title === 'string' ? fmt(title) : title}</div>
      {sub && <div style={{ font: `400 ${sfs}px ${SANS}`, color: PAL.ink2, marginTop: 12, lineHeight: 1.35, textWrap: 'pretty' }}>{typeof sub === 'string' ? fmt(sub) : sub}</div>}
    </div>
  );
}

export function Stat({ x, y, label, value, color, a = 1, w = 600, fs = 28 }) {
  if (a <= 0.005) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', opacity: a, whiteSpace: 'nowrap' }}>
      <span style={{ font: `400 22px ${SANS}`, color: PAL.ink2 }}>{label}</span>
      <span style={{ font: `600 ${fs}px ${MONO}`, color: color || PAL.ink }}>{value}</span>
    </div>
  );
}

// Object/structure card: kind line, name line, rows [[key, value, color?, highlight 0..1?]].
export function Node({ x, y, w, h, kind, name, rows = [], a = 1, glow = 0, tone, nfs = 24, rfs = 19, shake = 0, bad }) {
  if (a <= 0.005) return null;
  const c = bad ? PAL.bad : toneColor(tone);
  const lit = glow > 0.01 || bad;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box', opacity: clamp(a, 0, 1), transform: `translateX(${shake}px) scale(${0.9 + 0.1 * clamp(a, 0, 1)})`, background: PAL.panel, borderRadius: 14, border: `1.5px solid ${lit ? c : tone ? hexA(c, 0.7) : PAL.line2}`, boxShadow: lit ? `0 0 ${30 * Math.max(glow, bad ? 1 : 0)}px ${hexA(c, 0.45)}` : '0 14px 40px rgba(0,0,0,0.35)', padding: '14px 18px' }}>
      {kind && <div style={{ font: `500 17px ${MONO}`, color: PAL.ink2, letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>{kind}</div>}
      {name && <div style={{ font: `600 ${nfs}px ${MONO}`, color: tone ? c : PAL.ink, marginTop: kind ? 4 : 0, whiteSpace: 'nowrap' }}>{name}</div>}
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: i ? 5 : 12, font: `400 ${rfs}px ${MONO}`, color: PAL.ink2, whiteSpace: 'nowrap' }}>
          <span>{r[0]}</span><span style={{ color: r[2] || PAL.ink, background: r[3] ? hexA(PAL.pull, 0.25 * r[3]) : 'transparent', borderRadius: 4, padding: '0 4px' }}>{r[1]}</span>
        </div>
      ))}
    </div>
  );
}

export function Badge({ x, y, text, tone = 'pull', a = 1, s = 1, fs = 17, anchor = 'center', solid }) {
  if (a <= 0.01) return null;
  const c = toneColor(tone);
  const tr = anchor === 'center' ? 'translate(-50%, -50%)' : anchor === 'left' ? 'translateY(-50%)' : 'none';
  return <div style={{ position: 'absolute', left: x, top: y, transform: `${tr} scale(${s})`, opacity: clamp(a, 0, 1), padding: '4px 12px', borderRadius: 999, background: solid ? c : hexA(c, 0.14), border: `1.5px solid ${hexA(c, 0.7)}`, color: solid ? PAL.bg : c, font: `600 ${fs}px ${MONO}`, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{text}</div>;
}

// Explanatory note with an accent bar.
export function Callout({ x, y, w, text, title, tone = 'pull', a = 1, fs = 22 }) {
  if (a <= 0.005) return null;
  const c = toneColor(tone);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, boxSizing: 'border-box', opacity: clamp(a, 0, 1), transform: `translateY(${(1 - clamp(a, 0, 1)) * 10}px)`, background: hexA(c, 0.08), borderLeft: `4px solid ${c}`, borderRadius: '0 12px 12px 0', padding: '14px 20px' }}>
      {title && <div style={{ font: `600 16px ${MONO}`, color: c, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>{title}</div>}
      <div style={{ font: `400 ${fs}px ${SANS}`, color: PAL.ink, lineHeight: 1.4, textWrap: 'pretty' }}>{typeof text === 'string' ? fmt(text) : text}</div>
    </div>
  );
}

// Horizontal bracket under/over a span with a label.
export function Brace({ x, y, w, label, a = 1, tone, above, fs = 18 }) {
  if (a <= 0.005) return null;
  const c = tone ? toneColor(tone) : PAL.ink2;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: 14, opacity: clamp(a, 0, 1) }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: above ? 12 : 0, height: 2, background: c }}></div>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 2, height: 14, background: c }}></div>
      <div style={{ position: 'absolute', right: 0, top: 0, width: 2, height: 14, background: c }}></div>
      {label && <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: above ? -28 : 20, font: `500 ${fs}px ${MONO}`, color: c, whiteSpace: 'nowrap' }}>{typeof label === 'string' ? fmt(label, c) : label}</div>}
    </div>
  );
}

// A strip of memory. cells: [{n: bytes, label, sub, tone, a, glow, dashed}]; unit = px per byte.
// ruler: show byte offsets under cell boundaries.
export function Bytes({ x, y, cells, unit = 40, h = 70, a = 1, ruler = true, fs = 18, sfs = 15 }) {
  if (a <= 0.005) return null;
  let off = 0;
  const marks = [0];
  const out = cells.map((c, i) => {
    const left = off * unit, w = c.n * unit;
    off += c.n; marks.push(off);
    const ca = c.a == null ? 1 : c.a;
    const col = c.tone ? toneColor(c.tone) : PAL.ink3;
    return (
      <div key={i} style={{ position: 'absolute', left, top: 0, width: w, height: h, boxSizing: 'border-box', opacity: ca, background: c.pad ? `repeating-linear-gradient(45deg, transparent 0 7px, ${hexA(PAL.ink3, 0.25)} 7px 9px)` : hexA(col, 0.16), border: `2px ${c.dashed || c.pad ? 'dashed' : 'solid'} ${hexA(col, 0.85)}`, borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: c.glow ? `0 0 ${24 * c.glow}px ${hexA(col, 0.6 * c.glow)}` : 'none' }}>
        {c.label && <div style={{ font: `600 ${fs}px ${MONO}`, color: c.pad ? PAL.ink3 : PAL.ink, whiteSpace: 'nowrap' }}>{c.label}</div>}
        {c.sub && <div style={{ font: `400 ${sfs}px ${MONO}`, color: c.pad ? PAL.ink3 : col, whiteSpace: 'nowrap', marginTop: 2 }}>{c.sub}</div>}
      </div>
    );
  });
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: off * unit, height: h, opacity: clamp(a, 0, 1) }}>
      {out}
      {ruler && marks.map((m, i) => <div key={'r' + i} style={{ position: 'absolute', left: m * unit, top: h + 6, transform: 'translateX(-50%)', font: `400 15px ${MONO}`, color: PAL.ink3 }}>{m}</div>)}
    </div>
  );
}

// Vertical stack (operand stack, call stack). items bottom→top: [{text, tone, a, glow, sub}].
export function StackView({ x, y, w, h, title, items, slotH = 54, a = 1, gap = 8, fs = 22, empty = 'empty', tone, right }) {
  if (a <= 0.005) return null;
  const vis = items.filter((it) => (it.a == null ? 1 : it.a) > 0.01);
  return (
    <Panel x={x} y={y} w={w} h={h} title={title} a={a} tone={tone} right={right}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: h - 44 }}>
        {items.map((it, i) => {
          const ia = it.a == null ? 1 : it.a;
          if (ia <= 0.01) return null;
          const c = toneColor(it.tone);
          const bottom = 14 + i * (slotH + gap) + (1 - ia) * 30;
          return (
            <div key={i} style={{ position: 'absolute', left: 16, right: 16, bottom, height: slotH, boxSizing: 'border-box', opacity: clamp(ia, 0, 1), borderRadius: 10, background: hexA(c, 0.14), border: `2px solid ${hexA(c, 0.85)}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', font: `600 ${fs}px ${MONO}`, color: PAL.ink, whiteSpace: 'nowrap', boxShadow: it.glow ? `0 0 ${24 * it.glow}px ${hexA(c, 0.6 * it.glow)}` : 'none' }}>
              <span>{it.text}</span>{it.sub != null && <span style={{ font: `400 ${fs - 5}px ${MONO}`, color: c }}>{it.sub}</span>}
            </div>
          );
        })}
        {vis.length === 0 && empty && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 24, textAlign: 'center', font: `400 18px ${MONO}`, color: PAL.ink3 }}>{empty}</div>}
      </div>
    </Panel>
  );
}

// Table: cols = widths; head = [..]; rows = [[..], ..]; rowA = per-row alpha array; hl = row index highlight.
// marks: {rowIndex: [tone, alpha]} for several highlighted rows at once.
export function Table({ x, y, cols, head, rows, a = 1, rowA, hl = -1, hlA = 1, fs = 20, rh = 48, tone = 'pull', mono = true, colColors = [], marks = {} }) {
  if (a <= 0.005) return null;
  const c = toneColor(tone);
  const W = cols.reduce((s, v) => s + v, 0);
  const cell = (txt, j, isHead) => (
    <div key={j} style={{ width: cols[j], flex: 'none', padding: '0 16px', boxSizing: 'border-box', font: `${isHead ? 600 : 400} ${isHead ? fs - 3 : fs}px ${mono && !isHead ? MONO : isHead ? MONO : SANS}`, color: isHead ? PAL.ink3 : colColors[j] || PAL.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: isHead ? '0.06em' : 0, textTransform: isHead ? 'uppercase' : 'none' }}>{typeof txt === 'string' ? fmt(txt) : txt}</div>
  );
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: W, opacity: clamp(a, 0, 1), background: PAL.panel, border: `1.5px solid ${PAL.line2}`, borderRadius: 12, overflow: 'hidden' }}>
      {head && <div style={{ display: 'flex', alignItems: 'center', height: rh - 6, borderBottom: `1px solid ${PAL.line2}` }}>{head.map((h, j) => cell(h, j, true))}</div>}
      {rows.map((r, i) => {
        const ra = rowA ? (rowA[i] == null ? 1 : rowA[i]) : 1;
        const mk = marks[i];
        const mc = mk ? toneColor(mk[0]) : c, ma = mk ? mk[1] : i === hl ? hlA : 0;
        return <div key={i} style={{ display: 'flex', alignItems: 'center', height: rh, opacity: ra, borderTop: i ? `1px solid ${PAL.line}` : 'none', background: ma > 0.01 ? hexA(mc, 0.15 * ma) : 'transparent', boxShadow: ma > 0.01 ? `inset 4px 0 0 ${hexA(mc, ma)}` : 'none' }}>{r.map((v, j) => cell(v, j, false))}</div>;
      })}
    </div>
  );
}

export function Backdrop() {
  const T = useT();
  return (
    <React.Fragment>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1.2px, transparent 1.7px)', backgroundSize: '40px 40px', backgroundPosition: `${(-T * 4) % 40}px ${(-T * 2) % 40}px` }}></div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,0.55) 100%)' }}></div>
    </React.Fragment>
  );
}

export function Header({ kicker, title }) {
  if (!title) return null;
  return (
    <div style={{ position: 'absolute', left: 96, top: 58 }}>
      <div style={{ font: `600 20px ${MONO}`, color: PAL.pull, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{kicker}</div>
      <div style={{ font: `600 54px ${SANS}`, color: PAL.ink, marginTop: 8, letterSpacing: '-0.01em' }}>{fmt(title)}</div>
    </div>
  );
}
