// 8.6 shared pieces: the running example, a GC-log highlighter + panel, timeline lanes.
const { PAL, MOTION, clamp, hexA, MONO, SANS, Panel, toneColor } = window.AN;
const E = MOTION.enter;

// Condensed view of the real Orders.java used for every log in this topic (full source in the notes).
export const ORDERS_SRC = [
  'public class Orders {',
  '  static byte[][] recent = new byte[30_000][];  // the cache',
  '  static byte[][] reports = new byte[8][];',
  '',
  '  public static void main(String[] args) {',
  '    Random rnd = new Random(42);',
  '    for (long n = 0; running(); n++) {',
  '      byte[] request = new byte[4_000];      // dies young',
  '      handle(request);',
  '      if (n % 40 == 0)                        // kept a while',
  '        recent[rnd.nextInt(30_000)] = new byte[4_000];',
  '      if (n % 50_000 == 0)                    // big and rare',
  '        reports[(int) (n / 50_000 % 8)] = new byte[1_500_000];',
  '    }',
  '  }',
  '}',
];

export const ORDERS_FULL = `import java.util.Random;

public class Orders {
    static final byte[][] recent = new byte[30_000][];   // long-lived cache, ~120 MB when full
    static final byte[][] reports = new byte[8][];

    public static void main(String[] args) {
        long end = System.currentTimeMillis() + Long.parseLong(args[0]) * 1000;
        Random rnd = new Random(42);
        long n = 0, sum = 0;
        while (System.currentTimeMillis() < end) {
            byte[] request = new byte[4_000];                       // dies young
            for (int i = 0; i < request.length; i += 4) { request[i] = (byte) (n + i); sum += request[i]; }
            if (n % 40 == 0) recent[rnd.nextInt(recent.length)] = new byte[4_000]; // survives; replaces a random old entry
            if (n % 50_000 == 0) reports[(int) (n / 50_000 % 8)] = new byte[1_500_000];   // a big report
            n++;
        }
        System.out.println("orders: " + n + " " + (sum & 1));
    }
}`;

// Colour a unified-logging GC line: decorations dim, GC(n) amber, heap sizes teal, durations pink.
export function hiLog(s) {
  const re = /(^(?:\[[^\]]*\])+)|(GC\(\d+\))|(\d+[MK](?:\(\d+[MK]\))?->\d+[MK]\(\d+[MK]\)|\d+M\(\d+%\)->\d+M\(\d+%\))|((?:User|Real)=[\d.]+s)|(\d+(?:\.\d+)?\s?ms\b)|(Pause [A-Z][a-z]+(?: [A-Z][a-z]+)*(?: \([A-Za-z0-9 ]+\))?|Allocation Stall|Garbage Collection|Concurrent [A-Za-z -]+?(?= \d|$))|([\s\S])/g;
  const out = [];
  let m, k = 0, buf = '';
  const flush = () => { if (buf) { out.push(<span key={k++} style={{ color: PAL.ink2 }}>{buf}</span>); buf = ''; } };
  while ((m = re.exec(s))) {
    if (m[7] != null) { buf += m[7]; continue; }
    flush();
    const style = m[1] ? { color: PAL.ink3 } : m[2] ? { color: PAL.pull } : m[3] ? { color: PAL.flow, fontWeight: 600 } : m[4] ? { color: PAL.violet, fontWeight: 600 } : m[5] ? { color: PAL.pink, fontWeight: 600 } : { color: PAL.ink, fontWeight: 600 };
    out.push(<span key={k++} style={style}>{m[0]}</span>);
  }
  flush();
  return out;
}

// A panel of log lines. lines: [{at, s, hl (0..1 highlight), tone, dim}]
export function LogPanel({ x, y, w, h, title = 'gc.log · JDK 17', right, lines, t, a = 1, fs = 17, lh = 30, tone }) {
  if (a <= 0.005) return null;
  return (
    <Panel x={x} y={y} w={w} h={h} title={title} right={right} a={a} tone={tone}>
      <div style={{ padding: '10px 0' }}>
        {lines.map((L, i) => {
          const o = L.at == null ? 1 : E(t, L.at, 0.35);
          const c = toneColor(L.tone || 'pull');
          const hl = L.hl || 0;
          return (
            <div key={i} style={{ height: lh, display: 'flex', alignItems: 'center', padding: '0 18px', whiteSpace: 'pre', font: `400 ${fs}px ${MONO}`, opacity: o * (L.dim ? 0.45 : 1), background: hl > 0.01 ? hexA(c, 0.14 * hl) : 'transparent', boxShadow: hl > 0.01 ? `inset 3px 0 0 ${hexA(c, hl)}` : 'none' }}>{L.plain ? <span style={{ color: PAL.ink3 }}>{L.s}</span> : hiLog(L.s)}</div>
          );
        })}
      </div>
    </Panel>
  );
}

const KIND = {
  run: (c) => ({ background: hexA(PAL.flow, 0.28), border: `1px solid ${hexA(PAL.flow, 0.5)}` }),
  stw: () => ({ background: PAL.bad }),
  gc: () => ({ background: PAL.pull }),
  conc: () => ({ background: `repeating-linear-gradient(135deg, ${hexA(PAL.violet, 0.75)} 0 5px, ${hexA(PAL.violet, 0.3)} 5px 10px)` }),
  stall: () => ({ background: PAL.pull }),
  idle: () => ({ background: 'transparent', border: `1px dashed ${PAL.line2}` }),
};
// A timeline lane. segs: [[from, to, kind]] in data time [t0, t1]; reveal 0..1 sweeps it in left→right.
export function Lane({ x, y, w, h = 30, segs, t0, t1, a = 1, reveal = 1, minW = 2, bg = true }) {
  if (a <= 0.005) return null;
  const X = (v) => ((v - t0) / (t1 - t0)) * w;
  const cut = reveal * w;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: clamp(a, 0, 1) }}>
      {bg && <div style={{ position: 'absolute', inset: 0, borderRadius: 6, background: PAL.panel2, border: `1px solid ${PAL.line}` }}></div>}
      {segs.map(([s, e, kind], i) => {
        const l = X(s);
        if (l > cut) return null;
        const ww = Math.max(minW, Math.min(X(e), cut) - l);
        return <div key={i} style={{ position: 'absolute', left: l, top: kind === 'conc' ? h * 0.22 : 0, width: ww, height: kind === 'conc' ? h * 0.56 : h, borderRadius: 3, boxSizing: 'border-box', ...KIND[kind]() }}></div>;
      })}
    </div>
  );
}

// Small legend swatch row.
export function Legend({ x, y, items, a = 1, fs = 17, gap = 34 }) {
  if (a <= 0.005) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap, opacity: a, font: `400 ${fs}px ${MONO}`, color: PAL.ink2, whiteSpace: 'nowrap' }}>
      {items.map(([kind, label]) => (
        <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 26, height: 16, borderRadius: 3, boxSizing: 'border-box', ...(KIND[kind] ? KIND[kind]() : { background: toneColor(kind) }) }}></span>{label}
        </span>
      ))}
    </div>
  );
}

export { SANS };
