// 8.9 scenes, part 2: jstat, class histograms, shallow vs retained, dominators, heap dumps, JFR.
const { PAL, MOTION, lin, lerp, win, pulse, track1, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, HArrow, VArrow, Arrow, Dot, Badge, Callout, Table, Mark, Stat, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;
import { Term, Tok } from './kit89.jsx';
import { GCUTIL, GC, H_A, H_B, HEAPDUMP_OUT, OOM_OUT, GCUTIL_AFTER_OOM } from './data.jsx';

// split a right-aligned jstat line into fields using the header's token ends
const fieldSpans = (header) => { const out = []; const re = /\S+/g; let m, prev = 0; while ((m = re.exec(header))) { out.push([m[0], prev, m.index + m[0].length]); prev = m.index + m[0].length; } return out; };
const colorize = (line, spans, colors) => spans.map(([name, a, b]) => [line.slice(a, b), colors[name] || null]).concat([[line.slice(spans[spans.length - 1][2]), null]]);

// ── jstat ──────────────────────────────────────────────────────────────────
const GU = GCUTIL.slice(1).map((l) => l.trim().split(/\s+/));
const GB = GC.slice(1).map((l) => l.trim().split(/\s+/).map(Number));
export function SJstat({ t }) {
  const spans = fieldSpans(GCUTIL[0]);
  const hot = { E: t > 13.5 ? 'flow' : null, O: t > 20 ? 'pull' : null, FGC: t > 27 ? 'bad' : null, YGC: t > 13.5 && t < 20 ? 'flow' : null };
  if (t > 7 && t < 13.5) { hot.S0 = 'violet'; hot.S1 = 'violet'; hot.E = 'flow'; hot.O = 'pull'; }
  const RT = (i) => 3 + i * 0.45;
  const n = GU.filter((_, i) => t >= RT(i)).length;
  const shown = GU.map((r, i) => i).filter((i) => i < n).slice(-7);
  const streamA = 1 - E(t, 47.6);
  const lines = [{ parts: colorize(GCUTIL[0], spans, hot), color: 'ink' }, ...shown.map((i) => ({ parts: colorize(GCUTIL[i + 1], spans, hot), tone: GU[i][8] !== (GU[i - 1] || GU[i])[8] ? 'bad' : undefined }))];
  // charts
  const L = { x: 96, y: 510, w: 840, h: 390 }, Rr = { x: 984, y: 510, w: 840, h: 390 };
  const px = (c, i) => c.x + 60 + (i / 59) * (c.w - 90);
  const py = (c, v, max) => c.y + c.h - 40 - (v / max) * (c.h - 110);
  const line = (c, vals, max, upto) => vals.slice(0, Math.max(0, upto)).map((v, i) => `${px(c, i)},${py(c, v, max)}`).join(' ');
  const Ev = GU.map((r) => +r[2]), Ov = GU.map((r) => +r[3]);
  const fgcAt = GU.map((r, i) => (i > 0 && r[8] !== GU[i - 1][8] ? i : -1)).filter((i) => i >= 0);
  const ou = GB.map((r) => r[7] / 1024), oc = GB.map((r) => r[6] / 1024);
  const n2 = Math.round(lin(t, 40, 3) * 60);
  const fg = pulse(t, [27, 28.2], 1.2);
  return (
    <React.Fragment>
      <Term x={96} y={190} w={1728} h={44 + 20 + 8 * 27} t={t} a={E(t, 0.4) * streamA} title="jstat -gcutil 11027 1000" right={`one row per second · ${Math.min(n, 60)} of 60`} lines={lines} />
      <Term x={96} y={190} w={1728} h={44 + 20 + 3 * 27} t={t} a={E(t, 48)} title="the same program, an earlier run, after its OutOfMemoryError" tone="bad" lines={[
        { parts: colorize(GCUTIL_AFTER_OOM[0], fieldSpans(GCUTIL_AFTER_OOM[0]), {}) },
        { parts: colorize(GCUTIL_AFTER_OOM[1], fieldSpans(GCUTIL_AFTER_OOM[0]), { O: 'bad', FGC: 'bad', FGCT: 'bad' }), tone: 'bad' },
        { s: 'java.lang.OutOfMemoryError: Java heap space', k: 'err' },
      ]} />
      <Callout x={96} y={410} w={1728} tone="bad" fs={21} a={E(t, 49)} text="Old gen **99.9 %** full, **17** full GCs taking 3.5 s, and the next allocation fails." />

      <Panel x={L.x} y={L.y} w={L.w} h={L.h} title="-gcutil: percent of current capacity" a={E(t, 13.5) * streamA} />
      <svg width="1920" height="1080" style={{ position: 'absolute', left: 0, top: 0, opacity: E(t, 13.5) * streamA }}>
        {[0, 50, 100].map((v) => <line key={v} x1={L.x + 60} x2={L.x + L.w - 30} y1={py(L, v, 110)} y2={py(L, v, 110)} stroke={PAL.line2} strokeDasharray="4 6" />)}
        {fgcAt.filter((i) => i < n).map((i) => <line key={i} x1={px(L, i)} x2={px(L, i)} y1={L.y + 60} y2={L.y + L.h - 40} stroke={PAL.bad} strokeWidth={3 + 4 * fg} opacity={0.9} />)}
        <polyline points={line(L, Ev, 110, n)} fill="none" stroke={PAL.flow} strokeWidth="2.5" opacity="0.75" />
        {t > 20 && <polyline points={line(L, Ov, 110, n)} fill="none" stroke={PAL.pull} strokeWidth="4.5" />}
      </svg>
      {[0, 50, 100].map((v) => <Txt key={v} x={L.x + 50} y={py(L, v, 110) - 12} anchor="right" mono fs={17} color={PAL.ink3} a={E(t, 13.5) * streamA}>{v}</Txt>)}
      <Txt x={L.x + 70} y={L.y + 56} mono fs={18} color={PAL.flow} a={E(t, 13.5) * streamA}>E % (eden)</Txt>
      <Txt x={L.x + 250} y={L.y + 56} mono fs={18} color={PAL.pull} a={E(t, 20) * streamA}>O % (old)</Txt>
      <Txt x={L.x + 420} y={L.y + 56} mono fs={18} color={PAL.bad} a={E(t, 27) * streamA}>| full GC = our histogram</Txt>
      <Badge x={L.x + 560} y={py(L, 62, 110) + 44} text="keeps falling back to ~60 %" tone="pull" a={win(t, 33.5, 47.6)} fs={18} />

      <Panel x={Rr.x} y={Rr.y} w={Rr.w} h={Rr.h} title="-gc: old generation in MB" a={E(t, 40) * streamA} tone="pull" />
      <svg width="1920" height="1080" style={{ position: 'absolute', left: 0, top: 0, opacity: E(t, 40) * streamA }}>
        {[0, 200, 400, 600].map((v) => <line key={v} x1={Rr.x + 60} x2={Rr.x + Rr.w - 30} y1={py(Rr, v, 650)} y2={py(Rr, v, 650)} stroke={PAL.line2} strokeDasharray="4 6" />)}
        <polyline points={line(Rr, oc, 650, n2)} fill="none" stroke={PAL.ink2} strokeWidth="2.5" strokeDasharray="8 6" />
        <polyline points={line(Rr, ou, 650, n2)} fill="none" stroke={PAL.pull} strokeWidth="4.5" />
      </svg>
      {[0, 200, 400, 600].map((v) => <Txt key={v} x={Rr.x + 50} y={py(Rr, v, 650) - 12} anchor="right" mono fs={17} color={PAL.ink3} a={E(t, 40) * streamA}>{v}</Txt>)}
      <Txt x={Rr.x + 70} y={Rr.y + 56} mono fs={18} color={PAL.pull} a={E(t, 40) * streamA}>OU: old used</Txt>
      <Txt x={Rr.x + 260} y={Rr.y + 56} mono fs={18} color={PAL.ink2} a={E(t, 40) * streamA}>OC: old capacity (dashed)</Txt>
      <Badge x={Rr.x + 640} y={py(Rr, 391, 650) + 40} text="0 → 391 MB" tone="pull" a={E(t, 43) * streamA} fs={19} solid />
    </React.Fragment>
  );
}

// ── Class histogram, twice ─────────────────────────────────────────────────
const parseH = (rows) => rows.slice(3).map((l) => { const m = l.trim().split(/\s+/); return { n: +m[1], b: +m[2], cls: m[3] }; });
export function SHistogram({ t }) {
  const A = parseH(H_A), B = parseH(H_B);
  const fmtN = (v) => v.toLocaleString('en-US');
  const hl = (cls) => (cls === 'Shop$Session' ? 'pull' : undefined);
  const term = (rows, y, at, label) => (
    <Term x={96} y={y} w={960} h={44 + 20 + 9 * 26} lh={26} t={t} a={E(t, at)} title={label} right="top 5 · abridged" lines={[
      { k: 'cmd', s: 'jcmd 11027 GC.class_histogram' }, rows[1], rows[2],
      ...rows.slice(3).map((s, i) => ({ s, tone: hl(parseH(rows)[i].cls), toneA: E(t, 12.5) })),
      { s: '…', k: 'dim' },
    ]} />
  );
  const growth = A.map((r, i) => [(B[i].cls === '[B' ? '[B  (byte[])' : B[i].cls.replace('java.util.', '').replace('java.lang.', '')), '+' + fmtN(B[i].n - r.n)]);
  const parts = [['Session', 'pull'], ['HashMap$Node', 'flow'], ['Long', 'flow'], ['String', 'flow'], ['byte[] cart', 'violet'], ['byte[] name', 'violet']];
  return (
    <React.Fragment>
      {term(H_A, 190, 0.5, 'first run · t = 10 s')}
      {term(H_B, 508, 6.5, 'second run · t = 30 s')}
      <Table x={1100} y={190} cols={[360, 364]} head={['class', 'grew by (20 s)']} fs={21} rh={52} a={E(t, 12.5)}
        rows={growth} rowA={growth.map((_, i) => E(t, 12.8 + i * 0.3))} colColors={[PAL.ink, PAL.pull]}
        marks={{ 2: ['pull', E(t, 12.5)], 1: ['flow', win(t, 20, 27.5)], 3: ['flow', win(t, 20, 27.5)], 4: ['flow', win(t, 20, 27.5)], 0: ['violet', win(t, 27.5, 34)] }} />
      <Txt x={1100} y={530} mono fs={17} color={PAL.ink3} a={E(t, 20)}>ONE login() ALLOCATES</Txt>
      {parts.map(([l, tone], i) => <Box key={l} x={1100 + (i % 3) * 246} y={562 + Math.floor(i / 3) * 86} w={232} h={72} label={l} fs={19} tone={tone} a={E(t, i < 4 ? 20.3 + i * 0.3 : 27.8 + (i - 4) * 0.4)} />)}
      <Box x={1100} y={748} w={724} h={64} label="19,200,000 B ÷ 600,000 = 32 B per Session" fs={20} tone="pull" a={E(t, 34)} />
      <Txt x={1462} y={824} anchor="mid" fs={20} color={PAL.pull} a={E(t, 34.5)}>that's **shallow** size: the object alone</Txt>
      <Callout x={96} y={828} w={960} tone="bad" fs={20} a={E(t, 40.5)} text="Without `-all`, the histogram runs a **full GC** first, so it counts only live objects. On a big heap that pause is real." />
    </React.Fragment>
  );
}

// ── Shallow vs retained ────────────────────────────────────────────────────
export function SRetained({ t }) {
  const N = {
    root: [96, 390, 230, 90, 'SESSIONS', 'static field', 'violet'],
    map: [380, 390, 200, 90, 'HashMap', '48 B', 'ink'],
    tab: [630, 390, 220, 90, 'Node[] table', '≈ 4 MB', 'ink'],
    node: [900, 390, 200, 90, 'Node', '32 B', 'flow'],
    key: [1160, 250, 200, 80, 'Long key', '24 B', 'flow'],
    ses: [1160, 450, 200, 90, 'Session', '32 B', 'pull'],
    usr: [1420, 360, 190, 80, 'String user', '24 B', 'pull'],
    nm: [1660, 360, 164, 80, 'byte[]', '≈ 32 B', 'pull'],
    cart: [1420, 560, 190, 80, 'byte[] cart', '216 B', 'pull'],
  };
  const at = { root: 7, map: 7.5, tab: 8, node: 8.5, key: 9, ses: 9.3, usr: 9.8, nm: 10.2, cart: 10.4 };
  const box = (k) => { const [x, y, w, h, l, s, tone] = N[k]; return <Box key={k} x={x} y={y} w={w} h={h} label={l} sub={s} tone={tone} fs={21} sfs={18} a={E(t, k === 'ses' || k === 'node' ? 1 : at[k])} />; };
  const mid = (k, side) => { const [x, y, w, h] = N[k]; return side === 'r' ? [x + w + 4, y + h / 2] : side === 'l' ? [x - 4, y + h / 2] : side === 't' ? [x + w / 2, y - 4] : [x + w / 2, y + h + 4]; };
  const edge = (a, b, s1, s2, tm) => <Arrow key={a + b} from={mid(a, s1)} to={mid(b, s2)} draw={M(t, tm, 0.5)} color={PAL.ink2} />;
  const region = (x, y, w, h, tone, a) => <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 18, border: `2.5px dashed ${toneColor(tone)}`, background: hexA(toneColor(tone), 0.06), opacity: a }}></div>;
  const rS = win(t, 21, 28.5), rN = win(t, 28.5, 35), rM = win(t, 35, 99);
  const sum = (a) => <Txt x={960} y={676} anchor="mid" mono fs={24} weight={600} color={PAL.ink} a={a.a}>{a.s}</Txt>;
  return (
    <React.Fragment>
      {region(1146, 344, 688, 312, 'pull', rS)}
      {region(888, 236, 946, 420, 'flow', rN)}
      {region(368, 232, 1466, 428, 'violet', rM)}
      {Object.keys(N).map(box)}
      {edge('root', 'map', 'r', 'l', 7.4)}{edge('map', 'tab', 'r', 'l', 7.9)}{edge('tab', 'node', 'r', 'l', 8.4)}
      <Arrow from={mid('node', 'r')} to={mid('key', 'l')} draw={M(t, 8.9, 0.5)} color={PAL.ink2} />
      <Arrow from={mid('node', 'r')} to={mid('ses', 'l')} draw={M(t, 9.2, 0.5)} color={PAL.ink2} />
      <Arrow from={[1364, 470]} to={mid('usr', 'l')} draw={M(t, 9.7, 0.5)} color={PAL.ink2} />
      <Arrow from={[1364, 520]} to={mid('cart', 'l')} draw={M(t, 10.2, 0.5)} color={PAL.ink2} />
      {edge('usr', 'nm', 'r', 'l', 10.1)}
      <Txt x={1000} y={496} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 9)}>× 600,000</Txt>
      <Txt x={96} y={200} mono fs={17} color={PAL.ink3} a={E(t, 0.8)}>WHAT ONE login() LEAVES BEHIND · SHALLOW SIZES FROM THE HISTOGRAM</Txt>
      <Callout x={96} y={250} w={760} tone="flow" fs={21} a={win(t, 14.5, 21)} text="**Retained size**: how much memory would be freed if this object disappeared?" />
      {sum({ a: rS, s: 'retained(Session) = 32 + 24 + 32 + 216 = 304 B' })}
      {sum({ a: rN, s: 'retained(Node) = 32 + 24 + 304 = 360 B per login' })}
      {sum({ a: rM, s: 'retained(HashMap) ≈ 4 MB + 600,000 × 360 B ≈ 220 MB' })}
      <Table x={96} y={730} cols={[430, 260]} head={['sorted by shallow', 'size']} fs={20} rh={44} a={E(t, 43)}
        rows={[['byte[] cart (× 600,000)', '216 B each'], ['Session, Node, …', '24 to 32 B'], ['HashMap', '48 B']]} marks={{ 2: ['bad', E(t, 44)] }} colColors={[PAL.ink, PAL.ink2]} />
      <Table x={1134} y={730} cols={[430, 260]} head={['sorted by retained', 'size']} fs={20} rh={44} a={E(t, 45)}
        rows={[['HashMap (SESSIONS)', '≈ 220 MB'], ['Node[] table', '≈ 220 MB'], ['one Session', '304 B']]} marks={{ 0: ['pull', E(t, 46)] }} colColors={[PAL.ink, PAL.pull]} />
      <Txt x={960} y={790} anchor="mid" fs={22} color={PAL.ink2} a={E(t, 46)} w={300} align="center">the leak hides, or tops the list</Txt>
    </React.Fragment>
  );
}

// ── Dominator tree ─────────────────────────────────────────────────────────
export function SDominators({ t }) {
  const G = { R: [480, 230], A: [300, 370], B: [660, 370], E: [180, 510], C: [480, 510], D: [480, 640] };
  const sz = { A: 16, B: 16, C: 24, D: 400, E: 200 };
  const gone = win(t, 6, 18.3);
  const dead = win(t, 11, 18.3);
  const node = (k, x, y, extra = {}) => {
    const isR = k === 'R';
    return <Box key={k + x} x={x - (isR ? 100 : 46)} y={y - 34} w={isR ? 200 : 92} h={68} r={isR ? 14 : 34} label={isR ? 'GC roots' : k} fs={isR ? 21 : 26} tone={extra.tone || (isR ? 'violet' : 'ink')} dashed={extra.dashed} strike={extra.strike} a={extra.a == null ? 1 : extra.a} glow={extra.glow || 0} />;
  };
  const e = (a, b, tm, color, w = 2.5) => { const [x1, y1] = G[a], [x2, y2] = G[b]; const d = Math.hypot(x2 - x1, y2 - y1); const o = 38; return <Arrow key={a + b} from={[x1 + (x2 - x1) / d * o, y1 + (y2 - y1) / d * o]} to={[x2 - (x2 - x1) / d * o, y2 - (y2 - y1) / d * o]} draw={M(t, tm, 0.5)} color={color || PAL.ink2} width={w} />; };
  const T = { R: [1400, 230], A: [1150, 400], B: [1400, 400], C: [1650, 400], E: [1150, 560], D: [1650, 560] };
  const te = (a, b, tm) => <Arrow key={'t' + a + b} from={[T[a][0], T[a][1] + 38]} to={[T[b][0], T[b][1] - 38]} draw={M(t, tm, 0.5)} color={PAL.flow} />;
  const ret = { A: sz.A + sz.E, B: sz.B, C: sz.C + sz.D, D: sz.D, E: sz.E };
  const path = [['Shop$Session', 'one of 600,000', 'pull'], ['HashMap$Node', '', 'ink'], ['Node[] table', '', 'ink'], ['HashMap', '', 'ink'], ['SESSIONS', 'static field', 'violet'], ['class Shop', '', 'violet'], ['class loader', 'a GC root', 'violet']];
  return (
    <React.Fragment>
      <Txt x={96} y={196} mono fs={17} color={PAL.ink3} a={E(t, 0.5)}>A HEAP WITH SHARING</Txt>
      {e('R', 'A', 1)}{e('R', 'B', 1.3)}{e('A', 'E', 1.6)}{e('A', 'C', 1.9)}{e('B', 'C', 2.2, win(t, 11, 18.3) > 0.5 ? PAL.flow : null, 2.5 + 2 * win(t, 11, 18.3))}{e('C', 'D', 2.5)}
      {node('R', ...G.R, { a: E(t, 0.8) })}
      {node('A', ...G.A, { a: E(t, 1) * (1 - 0.6 * gone), dashed: gone > 0.5, strike: gone > 0.5, tone: gone > 0.5 ? 'bad' : 'ink' })}
      {node('B', ...G.B, { a: E(t, 1.3) })}
      {node('E', ...G.E, { a: E(t, 1.6) * (1 - 0.6 * dead), dashed: dead > 0.5, tone: dead > 0.5 ? 'bad' : 'ink' })}
      {node('C', ...G.C, { a: E(t, 1.9), glow: win(t, 11, 18.3) * 0.8, tone: win(t, 11, 18.3) > 0.5 ? 'flow' : 'ink' })}
      {node('D', ...G.D, { a: E(t, 2.5) })}
      {Object.entries(sz).map(([k, v]) => <Txt key={k} x={G[k][0] + 54} y={G[k][1] - 12} mono fs={17} color={PAL.ink3} a={E(t, 3)}>{v} B</Txt>)}
      <Badge x={180} y={584} text="unreachable" tone="bad" a={win(t, 11.4, 18.3)} fs={17} />
      <Badge x={660} y={510} text="still reached via B" tone="flow" a={win(t, 11.8, 18.3)} fs={17} />

      <Txt x={1000} y={196} mono fs={17} color={PAL.ink3} a={E(t, 26.5)}>ITS DOMINATOR TREE</Txt>
      {te('R', 'A', 27)}{te('R', 'B', 27.3)}{te('R', 'C', 27.6)}{te('A', 'E', 28.2)}{te('C', 'D', 28.5)}
      {Object.entries(T).map(([k, [x, y]]) => node(k, x, y, { a: E(t, k === 'R' ? 26.6 : k === 'E' || k === 'D' ? 28.4 : 27.2), tone: k === 'R' ? 'violet' : 'flow' }))}
      {['A', 'B', 'C'].map((k) => <Txt key={k} x={T[k][0]} y={T[k][1] + 44} anchor="mid" mono fs={18} color={PAL.pull} a={E(t, 32.5)}>retains {ret[k]} B</Txt>)}

      <Callout x={96} y={724} w={1728} tone="flow" fs={22} a={win(t, 18.5, 40.3)} text="`X` **dominates** `Y` when every path from a GC root to `Y` goes through `X`. Retained size of `X` = the total of everything it dominates." />
      <Txt x={96} y={700} mono fs={17} color={PAL.ink3} a={E(t, 40.5)}>PATH TO GC ROOTS · ONE SUSPECT Shop$Session</Txt>
      {path.map(([l, s, tone], i) => (
        <React.Fragment key={l}>
          <Box x={96 + i * 252} y={736} w={216} h={84} label={l} sub={s || null} tone={tone} fs={19} sfs={17} a={E(t, 41 + i * 0.6)} glow={i === 4 ? win(t, 46.5, 99) : 0} />
          {i > 0 && <HArrow x1={96 + i * 252 - 6} x2={96 + i * 252 - 30} y={778} a={E(t, 41 + i * 0.6)} color={PAL.ink2} />}
        </React.Fragment>
      ))}
      <Callout x={96} y={846} w={1728} tone="pull" fs={21} a={E(t, 46.5)} text="The path names the bug: a **static map** that is only ever added to." />
    </React.Fragment>
  );
}

// ── Heap dumps ─────────────────────────────────────────────────────────────
export function SHeapDump({ t }) {
  const opts = [['GC.heap_dump <file>', 'live objects only: runs a full GC first', 'flow'], ['-all', 'also dump unreachable objects', 'ink'], ['-gz=1', 'compress while writing', 'ink']];
  const steps = [['1  open it', 'Eclipse MAT · VisualVM · IntelliJ'], ['2  dominator tree', 'sort by retained size'], ['3  path to GC roots', 'exclude weak/soft refs'], ['4  read the bug', 'what holds it, and why']];
  const gap = E(t, 13.5);
  return (
    <React.Fragment>
      <Term x={96} y={190} w={1100} h={44 + 20 + 9 * 27} t={t} a={E(t, 0.4)} title="terminal · paths abridged" lines={[
        { k: 'cmd', s: 'jcmd 8730 GC.heap_dump /…/j89/heap.hprof', at: 1 }, { s: '8730:', at: 1.8 },
        { s: HEAPDUMP_OUT[0], at: 2.2 }, { s: HEAPDUMP_OUT[1], at: 3.2, k: 'ok' }, { s: '' },
        { k: 'cmd', s: 'java -Xmx1g -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=. Shop leak', at: 21 },
        { s: OOM_OUT[0], at: 27.5, k: 'err' }, { s: OOM_OUT[1], at: 28.2 }, { s: OOM_OUT[2], at: 29, k: 'ok' },
      ]} />
      {opts.map(([l, s, tone], i) => <Box key={l} x={1240} y={190 + i * 102} w={584} h={86} label={l} sub={s} tone={tone} align="left" fs={21} sfs={18} a={E(t, 6.5 + i * 0.7)} />)}
      <Txt x={96} y={528} mono fs={17} color={PAL.ink3} a={E(t, 13.5)}>APPLICATION THREADS DURING THE DUMP</Txt>
      <div style={{ position: 'absolute', left: 96, top: 560, width: 1728, height: 34, borderRadius: 8, opacity: gap, background: `linear-gradient(90deg, ${hexA(PAL.flow, 0.5)} 0 40%, ${hexA(PAL.bad, 0.55)} 40% 62%, ${hexA(PAL.flow, 0.5)} 62% 100%)` }}></div>
      <Txt x={96 + 1728 * 0.51} y={606} anchor="mid" mono fs={19} color={PAL.bad} a={E(t, 14)}>paused · 275 MB written in 1.1 s</Txt>
      <Txt x={96 + 1728 * 0.2} y={606} anchor="mid" mono fs={19} color={PAL.flow} a={E(t, 14)}>running</Txt>
      <Txt x={96 + 1728 * 0.81} y={606} anchor="mid" mono fs={19} color={PAL.flow} a={E(t, 14)}>running</Txt>
      <Badge x={1532} y={496} text="the dump ≈ the size of the live heap: check the disk" tone="pull" a={E(t, 16)} fs={17} />
      {steps.map(([l, s], i) => (
        <React.Fragment key={l}>
          <Box x={96 + i * 440} y={680} w={408} h={96} label={l} sub={s} tone={i === 1 ? 'pull' : 'flow'} align="left" fs={22} sfs={18} a={E(t, 34.5 + i * 0.6)} />
          {i > 0 && <HArrow x1={96 + i * 440 - 30} x2={96 + i * 440 - 4} y={728} a={E(t, 34.5 + i * 0.6)} color={PAL.ink2} />}
        </React.Fragment>
      ))}
      <Callout x={96} y={806} w={1728} tone="violet" fs={21} a={E(t, 40.5)} text="Usual names at the end of the path: **static collections**, `ThreadLocal`s on pooled threads, listeners never removed, caches without eviction." />
    </React.Fragment>
  );
}
