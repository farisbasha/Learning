// 8.3 scenes, part 2: StackOverflowError, thread cost, generations, a minor GC, TLABs.
const { PAL, MOTION, lin, lerp, win, pulse, step, track, hlAt, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Mark, Val, Brace, toneColor } = window.AN;
import { Tok, RealTag } from './common.jsx';
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;
const fmtN = (n) => Math.round(n).toLocaleString('en-US');

// ── StackOverflowError ─────────────────────────────────────────────────────
const XSS = [['-Xss256k', '1,479'], ['-Xss512k', '4,210'], ['-Xss1m', '9,671'], ['-Xss2m  (default here)', '20,594'], ['-Xss4m', '42,439']];
export function SOverflow({ t }) {
  const BX = 870, BW = 320, TOP = 340, BOT = 910;
  const fill = lin(t, 16, 6.2);
  const hitT = 22.3;
  const depth = t < 6 ? 0 : t < 16 ? Math.min(4, 1 + Math.floor((t - 6) / 2)) : Math.round(lerp(4, 20594, fill));
  const hit = t >= hitT;
  const shake = t > hitT && t < hitT + 0.8 ? Math.sin(t * 70) * 6 : 0;
  return (
    <React.Fragment>
      <Code x={96} y={190} w={720} h={368} title="Deep.java" a={E(t, 0.4)} fs={18} lh={30} hl={2} hlA={win(t, 5, 16)} lines={[
        'public class Deep {', '    static int depth = 0;', '    static void down() { depth++; down(); }', '    public static void main(String[] args) {', '        try { down(); }',
        '        catch (StackOverflowError e) {', '            System.out.println("depth = " + depth);', '        }', '    }', '}',
      ]} />
      <Console x={96} y={590} w={720} h={340} t={t} a={E(t, 22.5)} fs={17} lh={28} items={[
        { at: 23, text: 'java -Xint Deep', kind: 'cmd' }, { at: 23.6, text: 'depth = 20594', kind: 'ok' },
        { at: 45.5, text: 'java Boom', kind: 'cmd' },
        { at: 46.1, text: 'Exception in thread "main" java.lang.StackOverflowError', kind: 'err' },
        { at: 46.4, text: '    at Boom.count(Boom.java:2)' }, { at: 46.6, text: '    at Boom.count(Boom.java:2)' }, { at: 46.8, text: '    at Boom.count(Boom.java:2)' },
        { at: 47.4, text: '    … 1,024 "at" lines in all, then it stops', kind: 'dim' },
      ]} />

      <div style={{ position: 'absolute', left: shake, top: 0 }}>
        <Panel x={BX} y={190} w={BW} h={740} title="main's stack" right="2 MB" tone={hit ? 'bad' : 'flow'} a={E(t, 3)} glow={Math.max(pulse(t, [hitT], 1.5), pulse(t, [10.6], 1.2))} />
        <Txt x={BX + BW / 2} y={250} anchor="mid" mono fs={24} weight={600} color={hit ? PAL.bad : PAL.ink} a={E(t, 5)}>{`depth ${fmtN(depth)}`}</Txt>
        <div style={{ position: 'absolute', left: BX + 16, top: 290, width: BW - 32, height: 44, opacity: E(t, 22), borderRadius: 8, background: `repeating-linear-gradient(45deg, ${hexA(PAL.pull, 0.5)} 0 8px, ${hexA(PAL.bad, 0.35)} 8px 16px)`, border: `2px solid ${hit ? PAL.bad : PAL.pull}` }}></div>
        <Txt x={BX + BW / 2} y={301} anchor="mid" mono fs={17} weight={600} color={PAL.ink} a={E(t, 22)}>guard pages</Txt>
        <Box x={BX + 16} y={BOT - 54} w={BW - 32} h={46} label="main" tone="flow" a={E(t, 4) * (1 - E(t, 16, 0.4))} fs={18} />
        {[0, 1, 2, 3].map((k) => <Box key={k} x={BX + 16} y={BOT - 108 - k * 54} w={BW - 32} h={46} label="down()" tone="flow" a={E(t, 6 + k * 2) * (1 - E(t, 16, 0.4))} fs={18} />)}
        <div style={{ position: 'absolute', left: BX + 16, top: BOT - (BOT - TOP) * fill, width: BW - 32, height: (BOT - TOP) * fill, opacity: E(t, 16, 0.3), borderRadius: 8, background: `repeating-linear-gradient(0deg, ${hexA(PAL.flow, 0.45)} 0 4px, ${hexA(PAL.flow, 0.12)} 4px 7px)`, border: `2px solid ${hexA(PAL.flow, 0.7)}`, boxSizing: 'border-box' }}></div>
        <Badge x={BX + BW / 2} y={376} text="StackOverflowError" tone="bad" solid a={POP(t, hitT)} fs={18} />
        <Txt x={BX + BW / 2} y={600} anchor="mid" mono fs={17} color={PAL.ink} a={win(t, 16.5, 22)}>~100 bytes per frame</Txt>
      </div>

      <Table x={1230} y={214} cols={[340, 254]} head={['stack size', 'depth (-Xint)']} rows={XSS} a={E(t, 29)} rowA={XSS.map((_, i) => E(t, 29.4 + i * 0.6))} fs={20} rh={52}
        colColors={[PAL.flow, PAL.ink]} marks={{ 3: ['flow', 1] }} />
      <Box x={1230} y={540} w={594} h={96} label="JIT on, -Xss2m, three runs" sub="55,115 · 47,594 · 44,664" tone="pull" a={E(t, 38)} fs={20} sfs={20} />
      <Txt x={1230} y={654} fs={19} w={594} color={PAL.ink2} a={E(t, 39)}>Compiled frames are smaller than interpreted ones, and the JIT kicks in at a different moment each run.</Txt>
      <RealTag x={1230} y={192} a={E(t, 29)} />
      <Callout x={1230} y={760} w={594} tone="flow" a={E(t, 53)} fs={20} title="the real fix" text="A base case, or a loop. A bigger `-Xss` only moves the wall." />
    </React.Fragment>
  );
}

// ── Why a million platform threads don't fit ───────────────────────────────
export function SThreadCost({ t }) {
  const n = t < 6 ? 1 : t < 12 ? Math.round(lerp(1, 1000, M(t, 6, 3))) : Math.round(lerp(1000, 1000000, M(t, 12, 3)));
  const gb = n * 2 / 1000;
  const sizeTxt = gb < 1 ? `${fmtN(n * 2)} MB` : gb < 1000 ? `${gb < 10 ? gb.toFixed(1).replace('.0', '') : Math.round(gb)} GB` : `${(gb / 1000).toFixed(1).replace('.0', '')} TB`;
  const bars = 40, shown = Math.min(bars, Math.ceil(lin(t, 1, 12) * bars));
  return (
    <React.Fragment>
      <Panel x={96} y={190} w={860} h={370} title="platform threads" right="1 OS thread each" tone="flow" a={E(t, 0.4)} />
      {Array.from({ length: shown }).map((_, i) => (
        <div key={i} style={{ position: 'absolute', left: 126 + (i % 20) * 40, top: 256 + Math.floor(i / 20) * 110, width: 30, height: 96, boxSizing: 'border-box', borderRadius: 5, border: `2px solid ${hexA(PAL.flow, 0.8)}`, background: `linear-gradient(0deg, ${hexA(PAL.flow, 0.5)} 0 14%, transparent 14%)` }}></div>
      ))}
      <Txt x={126} y={490} mono fs={17} color={PAL.ink3} a={E(t, 2)}>each bar: a 2 MB stack reserved · only the used bottom part is real memory</Txt>
      <Card x={990} y={190} w={834} h={170} a={E(t, 6)} tone={n >= 1000000 ? 'bad' : 'flow'} num={`${fmtN(n)} threads × 2 MB`} title={`= ${sizeTxt} of address space`} tfs={40} glow={n >= 1000000 ? win(t, 15, 19) : 0} />
      <Txt x={990} y={380} fs={20} w={834} color={PAL.ink2} a={E(t, 13)}>On Linux x64 the default is 1 MB, so a million threads would be 1 TB. Either way: no.</Txt>

      <Panel x={990} y={440} w={834} h={120} title="virtual threads · Java 21" tone="green" a={E(t, 32.5)} />
      {[60, 34, 90, 22, 48, 70, 30, 54, 40, 26, 80, 36].map((w, i) => (
        <div key={i} style={{ position: 'absolute', left: 1010 + i * 66, top: 500 + (i % 2) * 22, width: Math.min(58, w * 0.7), height: 18, borderRadius: 4, background: hexA(PAL.green, 0.55), opacity: E(t, 33 + i * 0.12) }}></div>
      ))}
      <Txt x={1010} y={566} mono fs={17} color={PAL.green} a={E(t, 34.5)}>stack chunks: small heap objects that grow as needed</Txt>
      <Badge x={1400} y={620} text="millions of them · a few carrier threads · Part 09" tone="green" a={E(t, 39.5)} fs={17} />

      <Console x={96} y={660} w={1728} h={240} t={t} a={E(t, 19)} fs={17} lh={30} items={[
        { at: 19.5, text: 'java Threads          # start sleeping threads until something breaks', kind: 'cmd' },
        { at: 21, text: '[0.105s][warning][os,thread] Failed to start thread "Unknown thread" - pthread_create failed (EAGAIN) for attributes: stacksize: 2048k, guardsize: 16k, detached.', kind: 'dim' },
        { at: 22.5, text: 'started 2026 threads, then: java.lang.OutOfMemoryError: unable to create native thread: possibly out of memory or process/resource limits reached', kind: 'err' },
        { at: 26, text: '# macOS: kern.num_taskthreads = 2048 per process (the JVM already runs ~20 of its own)', kind: 'dim' },
      ]} />
      <RealTag x={96} y={910} a={E(t, 21)} />
    </React.Fragment>
  );
}

// ── Generations: the classic layout, measured ──────────────────────────────
const GEN = [['eden', 34944, 'pull'], ['S0', 4352, 'flow'], ['S1', 4352, 'flow'], ['tenured (old)', 87424, 'green']];
export function SGenerations({ t }) {
  const X = 96, W = 1728, Y = 300, H = 110, TOT = 131072;
  let x = X;
  const segs = GEN.map(([l, kb, tone], i) => { const w = (kb / TOT) * W; const s = { l, kb, tone, x, w, i }; x += w; return s; });
  const ats = [12, 19.5, 19.5, 25];
  const used = lin(t, 41, 4) * 0.54;
  return (
    <React.Fragment>
      <div style={{ position: 'absolute', left: X + 2, top: Y, width: W - 4, height: H, boxSizing: 'border-box', borderRadius: 10, opacity: win(t, 1, 12.2, 0.5), border: `2px solid ${hexA(PAL.pull, 0.8)}`, background: hexA(PAL.pull, 0.06), display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 24px ${MONO}`, color: PAL.ink }}>heap (-Xmx256m): one big pool?</div>
      <Brace x={segs[0].x} y={262} w={segs[0].w + segs[1].w + segs[2].w} above label="young generation · 43,648 K" tone="pull" a={E(t, 12)} />
      <Brace x={segs[3].x + 4} y={262} w={segs[3].w - 4} above label="old generation · 87,424 K" tone="green" a={E(t, 25)} />
      {segs.map((s) => (
        <div key={s.l} style={{ position: 'absolute', left: s.x + 2, top: Y, width: s.w - 4, height: H, boxSizing: 'border-box', borderRadius: 10, opacity: E(t, s.i === 3 ? 25 : 12), border: `2px solid ${hexA(toneColor(s.tone), 0.85)}`, background: hexA(toneColor(s.tone), 0.1), boxShadow: (s.i === 0 && win(t, 12, 19) > 0.5) || (s.i > 0 && s.i < 3 && win(t, 19.5, 25) > 0.5) ? `0 0 26px ${hexA(toneColor(s.tone), 0.5)}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 22px ${MONO}`, color: PAL.ink, overflow: 'hidden' }}>
          {s.i === 0 ? '' : s.l}
        </div>
      ))}
      <div style={{ position: 'absolute', left: segs[0].x + 6, top: Y + 6, width: (segs[0].w - 12) * used, height: H - 12, borderRadius: 6, background: `repeating-linear-gradient(90deg, ${hexA(PAL.pull, 0.55)} 0 10px, ${hexA(PAL.pull, 0.2)} 10px 13px)`, opacity: E(t, 41) }}></div>
      <Txt x={segs[0].x + segs[0].w / 2} y={Y + H / 2} anchor="center" mono fs={22} weight={600} a={E(t, 12)}>eden</Txt>
      <Txt x={segs[0].x + segs[0].w / 2} y={Y + H + 14} anchor="mid" mono fs={17} color={PAL.pull} a={E(t, 12.5)}>{t >= 41 ? '34,944 K · 54% used' : '34,944 K'}</Txt>
      <Txt x={segs[2].x} y={Y + H + 14} anchor="mid" mono fs={17} color={PAL.flow} a={E(t, 19.5)}>4,352 K each</Txt>
      <Txt x={segs[3].x + segs[3].w / 2} y={Y + H + 14} anchor="mid" mono fs={17} color={PAL.green} a={E(t, 25.5)}>87,424 K</Txt>

      <Console x={96} y={480} w={1000} h={300} t={t} a={E(t, 5.5)} fs={17} lh={28} title="terminal · addresses trimmed" items={[
        { at: 6, text: 'java -XX:+UseSerialGC -Xmx256m Live &', kind: 'cmd' }, { at: 6.6, text: 'jcmd 913 GC.heap_info', kind: 'cmd' },
        { at: 7.4, text: ' def new generation   total 39296K, used 18952K' },
        { at: 7.6, text: '  eden space 34944K,  54% used', kind: t >= 41 ? 'ok' : undefined },
        { at: 7.8, text: '  from space 4352K,   0% used' }, { at: 8, text: '  to   space 4352K,   0% used' },
        { at: 8.2, text: ' tenured generation   total 87424K, used 0K' },
      ]} />
      <RealTag x={96} y={792} a={E(t, 7)} />
      <Box x={1140} y={480} w={684} h={90} label="-XX:SurvivorRatio=8" sub="eden : S0 : S1 = 8 : 1 : 1" tone="flow" a={E(t, 19.5)} fs={22} sfs={18} />
      <Box x={1140} y={590} w={684} h={90} label="-XX:NewRatio=2" sub="old : young = 2 : 1" tone="green" a={E(t, 25.5)} fs={22} sfs={18} />
      <Callout x={1140} y={700} w={684} tone="pull" a={E(t, 33)} fs={20} title="why split by age" text="Most objects die young. Collect only the young part, and nearly everything you look at is garbage: cheap." />
    </React.Fragment>
  );
}

// ── A minor GC, step by step ───────────────────────────────────────────────
const LIVE_A = [3, 17, 29], LIVE_B = [8, 22];
const cellXY = (i) => [116 + (i % 10) * 88, 262 + Math.floor(i / 10) * 66];
const survXY = (side, k) => [(side === 0 ? 1046 : 1316) + 36 + (k % 2) * 100, 262 + Math.floor(k / 2) * 66];
const oldXY = (k) => [130 + k * 100, 650];
function Cell({ x, y, a = 1, tone = 'pull', dead, label, sub, glow = 0 }) {
  if (a <= 0.01) return null;
  const c = dead ? PAL.ink3 : toneColor(tone);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 78, height: 56, boxSizing: 'border-box', borderRadius: 8, opacity: a * (dead ? 0.45 : 1), border: `2px ${dead ? 'dashed' : 'solid'} ${hexA(c, 0.85)}`, background: hexA(c, dead ? 0.05 : 0.16), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', font: `600 17px ${MONO}`, color: dead ? PAL.ink3 : PAL.ink, boxShadow: glow > 0.01 ? `0 0 ${22 * glow}px ${hexA(c, 0.6 * glow)}` : 'none' }}>
      <div>{label}</div>{sub && <div style={{ font: `500 16px ${MONO}`, color: c }}>{sub}</div>}
    </div>
  );
}
export function SMinorGC({ t }) {
  // GC index after time t (−1 = none yet). Fast-forward ticks g = 2..14, then GC 15.
  const ffT = (g) => 44 + (g - 2) * 0.6;
  let g = -1;
  if (t >= 14) g = 0;
  if (t >= 30) g = 1;
  for (let k = 2; k <= 14; k++) if (t >= ffT(k)) g = k;
  if (t >= 52.5) g = 15;
  const cells = [];
  // round A in eden
  for (let i = 0; i < 40; i++) {
    const at = 4 + i * 0.12;
    if (LIVE_A.includes(i)) continue;
    cells.push(<Cell key={'a' + i} x={cellXY(i)[0]} y={cellXY(i)[1]} label="User" a={E(t, at, 0.2) * (1 - E(t, 19.6, 0.5))} dead={t >= 9.6 + i * 0.03} />);
  }
  for (let i = 0; i < 40; i++) {
    const at = 24 + i * 0.12;
    if (LIVE_B.includes(i)) continue;
    cells.push(<Cell key={'b' + i} x={cellXY(i)[0]} y={cellXY(i)[1]} label="User" a={E(t, at, 0.2) * (1 - E(t, 31.4, 0.5))} dead={t >= 28.9 + i * 0.02} />);
  }
  // survivors from round A: 3 and 29 survive long; 17 dies after GC 0
  const survA = LIVE_A.map((i, k) => {
    const keys = [[4 + i * 0.12, ...cellXY(i)], [14, ...cellXY(i)], [15, ...survXY(0, k)]];
    if (i !== 17) {
      const kk = i === 3 ? 0 : 1;
      keys.push([30, ...survXY(0, k)], [31, ...survXY(1, kk)]);
      for (let gg = 2; gg <= 14; gg++) keys.push([ffT(gg), ...survXY((gg + 1) % 2, kk)], [ffT(gg) + 0.4, ...survXY(gg % 2, kk)]);
      keys.push([52.5, ...survXY(0, kk)], [53.6, ...oldXY(kk)]);
    }
    const [x, y] = track(t, keys.map((q) => [q[0], q[1], q[2]]));
    const age = g < 0 ? null : Math.min(g + 1, 15);
    const dead17 = i === 17 && t >= 27;
    const a = E(t, 4 + i * 0.12, 0.2) * (i === 17 ? 1 - E(t, 30.4, 0.5) : 1);
    return <Cell key={'sa' + i} x={x} y={y} label="User" sub={age ? (t >= 53.6 ? 'old' : `age ${age}`) : null} tone={t >= 53.6 ? 'green' : 'flow'} dead={dead17} a={a} glow={pulse(t, [14.2, 30.2, 52.7], 0.8)} />;
  });
  const survB = LIVE_B.map((i, k) => {
    const keys = [[24 + i * 0.12, ...cellXY(i)], [30, ...cellXY(i)], [31, ...survXY(1, 2 + k)]];
    for (let gg = 2; gg <= 14; gg++) keys.push([ffT(gg), ...survXY((gg + 1) % 2, 2 + k)], [ffT(gg) + 0.4, ...survXY(gg % 2, 2 + k)]);
    keys.push([52.5, ...survXY(0, 2 + k)], [53.2, ...survXY(1, 2 + k)]);
    const [x, y] = track(t, keys);
    const age = g < 1 ? null : Math.min(g, 15);
    return <Cell key={'sb' + i} x={x} y={y} label="User" sub={age ? `age ${age}` : null} tone="flow" a={E(t, 24 + i * 0.12, 0.2)} glow={pulse(t, [30.2], 0.8)} />;
  });
  const gcs = g + 1;
  const gLate = (() => { let q = -1; if (t >= 14.6) q = 0; if (t >= 30.6) q = 1; for (let k = 2; k <= 14; k++) if (t >= ffT(k) + 0.25) q = k; if (t >= 53) q = 15; return q; })();
  const sideNow = gLate < 0 ? -1 : gLate % 2;
  return (
    <React.Fragment>
      <Panel x={96} y={200} w={920} h={350} title="eden" right={t >= 19.6 && t < 24 ? 'empty' : 'new objects'} tone="pull" a={E(t, 0.4)} glow={pulse(t, [14, 30], 1.2)} />
      <Panel x={1046} y={200} w={250} h={350} title="S0" right={sideNow === 0 ? 'in use' : sideNow === 1 ? 'empty' : ''} tone="flow" a={E(t, 0.8)} />
      <Panel x={1316} y={200} w={250} h={350} title="S1" right={sideNow === 1 ? 'in use' : sideNow === 0 ? 'empty' : ''} tone="flow" a={E(t, 1)} />
      <Panel x={1596} y={200} w={228} h={350} title="counters" a={E(t, 1.2)} />
      <Txt x={1710} y={262} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 1.4)}>minor GCs</Txt>
      <Txt x={1710} y={290} anchor="mid" mono fs={56} weight={700} color={PAL.ink} a={E(t, 1.4)}>{String(Math.max(0, gcs))}</Txt>
      <Txt x={1710} y={390} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 44)}>MaxTenuringThreshold</Txt>
      <Txt x={1710} y={418} anchor="mid" mono fs={40} weight={700} color={PAL.green} a={E(t, 44)}>15</Txt>
      <Badge x={556} y={530} text="cleared in one step: dead objects are never touched" tone="pull" a={win(t, 19.6, 24)} fs={17} />
      <Badge x={1306} y={530} text="S0 ⇄ S1 swap every GC" tone="flow" a={win(t, 38, 52)} fs={17} />

      <Panel x={96} y={580} w={1728} h={140} title="old generation" right="tenured · collected rarely" tone="green" a={E(t, 1.6)} glow={pulse(t, [53.6], 1.4)} />
      <Badge x={460} y={676} text="promoted at age 15" tone="green" a={E(t, 54)} fs={17} />
      {cells}{survA}{survB}

      <Txt x={96} y={752} mono fs={18} color={PAL.ink2} a={E(t, 4) * (1 - E(t, 58, 0.4))}>legend:  <span style={{ color: PAL.pull }}>■ new object</span>   <span style={{ color: PAL.flow }}>■ still referenced (from a stack slot, a static…)</span>   <span style={{ color: PAL.ink3 }}>▢ garbage: nothing points to it</span></Txt>
      <Console x={96} y={736} w={1728} h={196} t={t} a={E(t, 58.5)} fs={17} lh={30} items={[
        { at: 59, text: 'java -XX:+UseSerialGC -Xmx64m -Xlog:gc,gc+heap=info Churn', kind: 'cmd' },
        { at: 59.8, text: '[0.075s][info][gc,heap] GC(0) DefNew: 17472K(19648K)->582K(19648K) Eden: 17472K(17472K)->0K(17472K) From: 0K(2176K)->582K(2176K)' },
        { at: 60.4, text: '[0.075s][info][gc     ] GC(0) Pause Young (Allocation Failure) 17M->0M(61M) 0.822ms', kind: 'ok' },
        { at: 66.5, text: '[0.137s][info][gc,heap] GC(15) Tenured: 0K(43712K)->581K(43712K)', kind: 'ok' },
      ]} />
    </React.Fragment>
  );
}

// ── TLABs ──────────────────────────────────────────────────────────────────
const MAIN_ALLOCS = Array.from({ length: 13 }, (_, k) => 17 + k * 1.05);
const WORK_ALLOCS = Array.from({ length: 13 }, (_, k) => 24 + k * 0.55);
const MAIN2_ALLOCS = Array.from({ length: 9 }, (_, k) => 34 + k * 0.5);
export function STLAB({ t }) {
  const SY = 290, SH = 100, OW = 30, OG = 2;
  const A = { x: 136, w: 420 }, B = { x: 576, w: 420 }, A2 = { x: 1016, w: 420 };
  const nA = MAIN_ALLOCS.filter((s) => t >= s).length, nB = WORK_ALLOCS.filter((s) => t >= s).length, nA2 = MAIN2_ALLOCS.filter((s) => t >= s).length;
  const edenTop = t < 11.5 ? 136 : t < 32 ? lerp(996, 1016, 1) : lerp(1016, 1436, M(t, 32, 0.6));
  const tlab = (r, tone, label, a, n, times, retired) => {
    const c = toneColor(tone);
    const top = r.x + 4 + n * (OW + OG);
    return (
      <React.Fragment>
        <div style={{ position: 'absolute', left: r.x, top: SY, width: r.w, height: SH, opacity: a * (retired ? 0.5 : 1), boxSizing: 'border-box', borderRadius: 8, border: `2px solid ${hexA(c, 0.9)}`, background: hexA(c, 0.06) }}></div>
        <Txt x={r.x + 6} y={SY - 30} mono fs={16} weight={600} color={c} a={a}>{label}</Txt>
        {times.map((s, k) => t >= s && <div key={k} style={{ position: 'absolute', left: r.x + 4 + k * (OW + OG), top: SY + 10, width: OW, height: SH - 20, borderRadius: 4, opacity: a * (retired ? 0.5 : 1) * E(t, s, 0.2), background: hexA(c, 0.55), boxShadow: pulse(t, [s], 0.5) > 0.01 ? `0 0 16px ${c}` : 'none' }}></div>)}
        {!retired && a > 0.5 && <React.Fragment>
          <div style={{ position: 'absolute', left: top - 1, top: SY - 6, width: 3, height: SH + 12, background: c, opacity: a }}></div>
          <Txt x={top} y={SY + SH + 10} anchor="mid" mono fs={16} color={c} a={a}>top</Txt>
        </React.Fragment>}
      </React.Fragment>
    );
  };
  const naive = win(t, 5, 11.3);
  const reset = 1 - E(t, 55.5, 0.6);
  return (
    <React.Fragment>
      <Panel x={96} y={200} w={1728} h={230} title="eden" right="shared by all threads" tone="pull" a={E(t, 0.4)} />
      {naive > 0.01 && (
        <React.Fragment>
          <Badge x={300} y={262} text="main" tone="flow" a={naive} fs={17} />
          <Badge x={560} y={262} text="worker" tone="pink" a={naive} fs={17} />
          <Arrow from={[300, 276]} to={[140, 330]} curve={-20} a={naive} color={PAL.flow} />
          <Arrow from={[560, 276]} to={[146, 336]} curve={30} a={naive} color={PAL.pink} />
          <div style={{ position: 'absolute', left: 134, top: SY - 6, width: 4, height: SH + 12, background: PAL.bad, opacity: naive }}></div>
          <Badge x={760} y={340} text="one shared top: every new needs an atomic CAS" tone="bad" a={naive} fs={17} s={1 + 0.05 * pulse(t, [6, 7, 8, 9, 10], 0.5)} />
        </React.Fragment>
      )}
      {tlab(A, 'flow', 'TLAB · main', E(t, 11.5) * reset, Math.min(nA, 13), MAIN_ALLOCS, t >= 31.4)}
      {tlab(B, 'pink', 'TLAB · worker', E(t, 12.2) * reset, nB, WORK_ALLOCS, false)}
      {tlab(A2, 'flow', 'new TLAB · main', E(t, 32.4) * reset, nA2, MAIN2_ALLOCS, false)}
      <Badge x={960} y={340} text="minor GC: eden is empty again, TLABs start fresh" tone="pull" a={E(t, 56)} fs={18} solid />
      {t >= 11.5 && <React.Fragment>
        <div style={{ position: 'absolute', left: edenTop + 18, top: SY - 6, width: 3, height: SH + 12, background: PAL.pull, opacity: E(t, 13) * reset }}></div>
        <Txt x={edenTop + 30} y={SY + 36} mono fs={17} color={PAL.pull} a={E(t, 13) * reset}>eden top (shared)</Txt>
      </React.Fragment>}
      <Badge x={1226} y={262} text="CAS: grab 349 KB" tone="pull" a={win(t, 31.6, 36)} fs={17} solid />
      <Badge x={346} y={262} text="full · retired" tone="dim" a={E(t, 31.4) * reset} fs={17} />

      <Code x={96} y={460} w={860} h={324} title="allocation fast path (simplified HotSpot logic)" a={E(t, 11.5)} fs={18} lh={32} hl={hlAt(t, [[17.5, 1], [18.5, 2], [19.5, 3], [31, 7], [38, -1]])[0]} hlA={hlAt(t, [[17.5, 1], [18.5, 2], [19.5, 3], [31, 7], [38, -1]])[1]} lines={[
        '// new User(name, age), per thread',
        'obj = tlab.top;',
        'if (obj + 24 <= tlab.end) {       // fits?',
        '    tlab.top = obj + 24;          // bump: no lock',
        '    write header, zero the fields;',
        '    return obj;',
        '}',
        'slow path: retire TLAB, CAS a new chunk from eden',
      ]} />
      <Callout x={96} y={810} w={860} tone="flow" a={E(t, 48)} fs={20} text="A handful of instructions. That's why small objects are cheap to **create**; the GC decides what they cost to **keep**." />
      <Table x={1000} y={460} cols={[520, 304]} head={['per eden fill · Serial · -Xmx64m', '']} a={E(t, 39)} fs={19} rh={46} colColors={[PAL.ink2, PAL.ink]}
        rows={[['objects allocated (User+String+byte[])', '≈ 750,000'], ['TLAB size (desired_size)', '349 KB'], ['TLAB refills', '≈ 51'], ['slow allocations', '0'], ['wasted space', '0.3%']]}
        rowA={[0, 1, 2, 3, 4].map((i) => E(t, 39.4 + i * 0.6))} marks={{ 2: ['pull', win(t, 41, 48)] }} />
      <Console x={1000} y={748} w={824} h={116} t={t} a={E(t, 42)} fs={17} lh={26} title="-Xlog:gc+tlab=debug" items={[
        { at: 42.4, text: 'GC(1) TLAB totals: thrds: 1  refills: 52 … slow allocs: 0 … waste:  0.3%' },
      ]} />
      <RealTag x={1000} y={874} a={E(t, 42)} text="real output · numbers per GC from the log" />
    </React.Fragment>
  );
}
