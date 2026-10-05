// 8.3 shared helpers: running example source, travelling tokens, stack frames, gauges.
const { PAL, MOTION, track, pulse, hexA, toneColor, MONO, Txt, Box, clamp } = window.AN;
const E = MOTION.enter;

// Area colours, used consistently across the topic.
export const AREA = { stack: 'flow', heap: 'pull', meta: 'violet', code: 'blue', off: 'pink', err: 'bad' };

// The running example (compiled and run with JDK 17; prints "Ana").
export const USERS_SRC = [
  'record User(String name, int age) {}',
  'static User makeUser(String name) {',
  '    int age = 30;',
  '    User u = new User(name, age);',
  '    return u;',
  '}',
  'public static void main(String[] args) {',
  '    User ana = makeUser("Ana");',
  '    makeUser("Bob");        // result dropped',
  '    System.out.println(ana.name());',
  '}',
];

// A value pill that travels along keyframes and fades (same idea as 8.1's Tok).
export function Tok({ t, keys, text, tone = 'flow', from, until, w = 180, h = 46, fs = 20, glowAt, wKeys }) {
  if (wKeys) w = window.AN.track1(t, wKeys);
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

// Frame appearance: slides down into place when pushed, up and out when popped.
export function frameA(t, push, pop) {
  const ain = E(t, push, 0.5), aout = pop == null ? 0 : E(t, pop, 0.5);
  return { a: ain * (1 - aout), dy: (1 - ain) * -36 - aout * 36 };
}

// A stack frame block. Children are positioned relative to the frame.
export function Frame({ t, x, y, w, h, title, right, push, pop, tone = 'flow', children, glow = 0 }) {
  const { a, dy } = frameA(t, push, pop);
  if (a <= 0.01) return null;
  const c = toneColor(tone);
  return (
    <div style={{ position: 'absolute', left: x, top: y + dy, width: w, height: h, opacity: clamp(a, 0, 1), boxSizing: 'border-box', borderRadius: 12, border: `2px solid ${hexA(c, glow > 0.01 ? 1 : 0.75)}`, background: hexA(c, 0.06), boxShadow: glow > 0.01 ? `0 0 ${28 * glow}px ${hexA(c, 0.5 * glow)}` : 'none' }}>
      <div style={{ position: 'absolute', left: 16, top: 8, font: `600 19px ${MONO}`, color: c, whiteSpace: 'nowrap' }}>{title}</div>
      {right && <div style={{ position: 'absolute', right: 16, top: 10, font: `400 17px ${MONO}`, color: PAL.ink3, whiteSpace: 'nowrap' }}>{right}</div>}
      {children}
    </div>
  );
}

// A local-variable slot (label above, value box). Coordinates relative to the parent.
export function Slot({ x, y, w = 150, h = 72, idx, name, value, tone = 'flow', a = 1, glow = 0, fs = 20 }) {
  if (a <= 0.005) return null;
  return (
    <React.Fragment>
      <Txt x={x + w / 2} y={y - 26} anchor="mid" mono fs={16} color={PAL.ink3} a={a}>{`slot ${idx}`}</Txt>
      <Box x={x} y={y} w={w} h={h} label={value} sub={name} tone={tone} a={a} glow={glow} fs={fs} sfs={17} />
    </React.Fragment>
  );
}

// Vertical gauge that fills from the bottom. frac 0..1, optional cap line label.
export function Gauge({ x, y, w, h, frac, tone = 'violet', a = 1, label, capLabel, glow = 0 }) {
  if (a <= 0.005) return null;
  const c = toneColor(tone);
  const f = clamp(frac, 0, 1);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: clamp(a, 0, 1), boxSizing: 'border-box', border: `2px solid ${hexA(c, 0.7)}`, borderRadius: 10, background: PAL.panel2, overflow: 'hidden', boxShadow: glow > 0.01 ? `0 0 ${30 * glow}px ${hexA(c, 0.6 * glow)}` : 'none' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${f * 100}%`, background: `linear-gradient(0deg, ${hexA(c, 0.55)}, ${hexA(c, 0.25)})` }}></div>
      {capLabel && <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 3, background: PAL.bad }}></div>}
      {label && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 10, textAlign: 'center', font: `600 18px ${MONO}`, color: PAL.ink }}>{label}</div>}
    </div>
  );
}

// "real output" tag
export function RealTag({ x, y, a = 1, text = 'real output · JDK 17' }) {
  if (a <= 0.01) return null;
  return <div style={{ position: 'absolute', left: x, top: y, opacity: a, font: `600 16px ${MONO}`, color: PAL.ink3, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{text}</div>;
}
