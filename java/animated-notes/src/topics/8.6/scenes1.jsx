// 8.6 scenes, part 1: intro, the workload, the landscape, Serial, Parallel.
const { PAL, MOTION, lin, lerp, win, pulse, step, track, hlAt, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Mark, Val, Brace, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;
import { ORDERS_SRC, LogPanel, Lane, Legend } from './common.jsx';
import { P_Serial, P_Parallel, P_G1, P_Shenandoah, Z512_CYCLES, Z512_STALLS, Z1G_CYCLES, SHEN_CYCLES, G1_CONC } from './data.jsx';

// The same real second (uptime 3.0 → 4.0 s) of each 10-second run, as timeline segments.
const stw = (arr) => arr.map(([s, ms]) => [s, s + ms / 1000, 'stw']);
export const ROWS = [
  { name: 'Serial', segs: stw(P_Serial) },
  { name: 'Parallel', segs: stw(P_Parallel) },
  { name: 'G1', segs: [...G1_CONC.map(([a, b]) => [a, b, 'conc']), ...stw(P_G1)] },
  { name: 'ZGC · 512 MB', segs: [...Z512_CYCLES.map(([a, b]) => [a, b, 'conc']), ...Z512_STALLS.map(([s, ms]) => [s, s + ms / 1000, 'stall'])] },
  { name: 'ZGC · 1 GB', segs: Z1G_CYCLES.map(([a, b]) => [a, b, 'conc']) },
  { name: 'Shenandoah', segs: [...SHEN_CYCLES.map(([a, b]) => [a, b, 'conc']), ...stw(P_Shenandoah)] },
];

// A small square standing for an object in a heap diagram.
function Obj({ x, y, w = 30, h = 30, tone = 'flow', a = 1, dead, glow = 0, label }) {
  if (a <= 0.01) return null;
  const c = dead ? PAL.ink3 : toneColor(tone);
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box', borderRadius: 6, opacity: clamp(a, 0, 1), background: hexA(c, dead ? 0.12 : 0.3), border: `2px ${dead ? 'dashed' : 'solid'} ${hexA(c, dead ? 0.6 : 0.95)}`, boxShadow: glow > 0.01 ? `0 0 ${22 * glow}px ${hexA(c, 0.8 * glow)}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 17px ${MONO}`, color: PAL.ink, whiteSpace: 'nowrap' }}>{label}</div>;
}
const AreaLabel = ({ x, y, text, a, color }) => <Txt x={x} y={y} mono fs={17} color={color || PAL.ink3} a={a}>{text}</Txt>;

// ── Intro ──────────────────────────────────────────────────────────────────
export function SIntro({ t }) {
  const rows = ROWS.filter((r) => r.name !== 'ZGC · 1 GB');
  return (
    <React.Fragment>
      <Txt x={96} y={150} mono fs={22} weight={600} color={PAL.pull} a={E(t, 0.3)} style={{ letterSpacing: '0.14em' }}>PART 08 · THE JVM · 8.6</Txt>
      <Txt x={92} y={192} fs={118} weight={700} lh={1} a={E(t, 0.6, 0.9)} style={{ letterSpacing: '-0.03em', transform: `translateY(${(1 - E(t, 0.6, 0.9)) * 24}px)` }}>The collectors</Txt>
      <Txt x={96} y={338} fs={36} color={PAL.ink2} a={E(t, 1.4, 0.8)}>Serial, Parallel, G1, ZGC, Shenandoah: what each one stops, and what it costs.</Txt>

      <Code x={96} y={430} w={740} h={468} fs={17} lh={25} title="Orders.java · condensed · same heap, same workload" a={E(t, 11.5)} lines={ORDERS_SRC} />
      <Txt x={880} y={430} mono fs={17} color={PAL.ink3} a={E(t, 2.4)}>ONE REAL SECOND OF THE SAME RUN · JDK 17</Txt>
      {rows.map((r, i) => (
        <React.Fragment key={r.name}>
          <Txt x={880} y={486 + i * 66} mono fs={20} weight={600} color={PAL.ink} a={E(t, 2.6 + i * 0.3)}>{r.name}</Txt>
          <Lane x={1100} y={480 + i * 66} w={724} h={34} segs={r.segs} t0={3} t1={4} a={E(t, 2.6 + i * 0.3)} reveal={lin(t, 2.8 + i * 0.3, 5)} />
        </React.Fragment>
      ))}
      <Legend x={880} y={808} a={E(t, 6)} items={[['stw', 'app stopped'], ['conc', 'GC running alongside'], ['stall', 'app waiting']]} />
      <Callout x={880} y={846} w={944} tone="flow" a={E(t, 18.5)} fs={20} text="Spoiler: for most applications the right move is **to change nothing**." />
    </React.Fragment>
  );
}

// ── The workload ───────────────────────────────────────────────────────────
const REQ = Array.from({ length: 180 }, (_, k) => ({ at: 5 + k * 0.25, x: 990 + ((k * 137) % 440), y: 296 + ((k * 53) % 96) }));
const OLDS = Array.from({ length: 14 }, (_, k) => ({ x: 990 + (k % 7) * 112, y: 500 + Math.floor(k / 7) * 64, dieAt: k === 3 ? 21 : k === 9 ? 22.5 : null }));
export function SWorkload({ t }) {
  const [hl, hA] = hlAt(t, [[5, 7], [11.5, 10], [24.5, 12], [31, -1]]);
  const cx = track(t, [[12, 1320, 330], [15, 1320, 330], [16.2, 1563, 330], [19, 1563, 330], [20.4, 1102, 564]]);
  return (
    <React.Fragment>
      <Code x={96} y={196} w={800} h={468} fs={17} lh={25} title="Orders.java · condensed" a={E(t, 0.5)} lines={ORDERS_SRC} hl={hl} hlA={hA} />
      <Callout x={96} y={700} w={800} tone="flow" a={E(t, 45)} fs={20} text="Every log in this topic comes from this program, JDK 17, `-Xms512m -Xmx512m`, run for 10 seconds under each collector." />

      <Panel x={940} y={196} w={884} h={470} title="heap · -Xmx512m" a={E(t, 2)} />
      <Box x={966} y={262} w={520} h={170} tone="flow" a={E(t, 2.4)} glow={win(t, 31, 36) * 0.7} />
      <AreaLabel x={982} y={268} text="eden" a={E(t, 2.6)} />
      <Box x={1506} y={262} w={145} h={170} tone="green" a={E(t, 2.6)} glow={win(t, 33, 37) * 0.7} />
      <AreaLabel x={1520} y={268} text="S0" a={E(t, 2.8)} />
      <Box x={1665} y={262} w={145} h={170} tone="green" a={E(t, 2.8)} />
      <AreaLabel x={1679} y={268} text="S1" a={E(t, 3)} />
      <Box x={966} y={452} w={844} h={190} tone="blue" a={E(t, 3)} glow={win(t, 34, 38) * 0.7} />
      <AreaLabel x={982} y={458} text="old" a={E(t, 3.2)} />

      {REQ.map((r, k) => <Obj key={k} x={r.x} y={r.y} tone="flow" a={E(t, r.at, 0.15) * (1 - E(t, r.at + 1.1, 0.3)) * (t < 11.5 ? 1 : 0.45)} />)}
      <Badge x={1226} y={412} text="request · dead almost at once" tone="flow" a={win(t, 6, 11.5)} fs={17} />
      {/* the cache entry that survives */}
      <Obj x={cx[0]} y={cx[1]} tone="pull" a={E(t, 12)} glow={pulse(t, [12, 16.2, 20.4], 0.9)} />
      <Badge x={1320} y={412} text="cache entry · survives" tone="pull" a={win(t, 12.3, 18)} fs={17} />
      {OLDS.map((o, k) => <Obj key={k} x={o.x} y={o.y} tone="pull" a={E(t, 18 + k * 0.08)} dead={o.dieAt != null && t > o.dieAt} glow={o.dieAt ? pulse(t, [o.dieAt], 1) : 0} />)}
      {OLDS.filter((o) => o.dieAt).map((o, k) => <Mark key={k} x={o.x + 30} y={o.y} ok={false} a={win(t, o.dieAt, o.dieAt + 4) * 0.9} />)}
      <Badge x={1388} y={612} text="replaced at random → garbage in old" tone="bad" a={win(t, 21, 31)} fs={17} />
      {/* the big report */}
      <Obj x={1060} y={340} w={190} h={60} tone="violet" a={E(t, 25)} glow={pulse(t, [25.2], 1.2)} label="report · 1.5 MB" />

      <Badge x={1226} y={412} text="1 · born in eden" tone="flow" a={E(t, 31)} fs={17} solid />
      <Badge x={1658} y={412} text="2 · copied" tone="green" a={E(t, 33)} fs={17} solid />
      <Badge x={1388} y={624} text="3 · promoted after surviving several GCs" tone="blue" a={E(t, 34.5)} fs={17} solid />

      {[['~4 GB/s', 'allocated: garbage', 'pull'], ['~120 MB', 'live: the cache', 'flow'], ['512 MB', 'heap, every run', 'ink']].map(([v, s, tone], i) => (
        <Box key={v} x={940 + i * 302} y={700} w={280} h={120} label={v} sub={s} fs={34} sfs={17} tone={tone} a={E(t, 38.5 + i * 0.6)} />
      ))}
      <Txt x={940} y={840} fs={17} color={PAL.ink3} a={E(t, 40.5)} w={884}>4 GB/s: about 10 million orders × 4 KB in 10 seconds, measured from the run.</Txt>
    </React.Fragment>
  );
}

// ── The landscape ──────────────────────────────────────────────────────────
const COLS = [
  ['Serial', 'footprint', 'long · 1 thread', '-XX:+UseSerialGC'],
  ['Parallel', 'throughput', 'long · many threads', '-XX:+UseParallelGC'],
  ['G1', 'balance · default', 'goal 200 ms', '-XX:+UseG1GC'],
  ['ZGC', 'latency', '< 1 ms', '-XX:+UseZGC'],
  ['Shenandoah', 'latency', '~1–10 ms', '-XX:+UseShenandoahGC'],
  ['CMS', 'removed in 14', '—', 'refuses to start'],
];
export function SLandscape({ t }) {
  const T = [1480, 250], L = [1150, 770], R = [1810, 770];
  const at = (u, v) => [T[0] * (1 - u - v) + L[0] * u + R[0] * v, T[1] * (1 - u - v) + L[1] * u + R[1] * v]; // barycentric: u→latency, v→footprint
  const dots = [
    ['Parallel', at(0.08, 0.14), 'pull', 19], ['Serial', at(0.06, 0.74), 'ink', 19], ['G1', at(0.33, 0.3), 'flow', 19],
    ['ZGC', at(0.84, 0.04), 'violet', 27], ['Shenandoah', at(0.6, 0.2), 'violet', 27],
  ];
  const cardA = win(t, 4.5, 18.5, 0.5);
  return (
    <React.Fragment>
      <svg width="1920" height="1080" style={{ position: 'absolute', left: 0, top: 0, opacity: E(t, 0.6) }}>
        <polygon points={[T, L, R].map((p) => p.join(',')).join(' ')} fill={hexA(PAL.ink3, 0.06)} stroke={PAL.line2} strokeWidth="2" />
      </svg>
      <Txt x={T[0]} y={T[1] - 46} anchor="mid" mono fs={21} weight={600} color={PAL.pull} a={E(t, 4.5)}>throughput</Txt>
      <Txt x={L[0]} y={L[1] + 16} anchor="mid" mono fs={21} weight={600} color={PAL.violet} a={E(t, 9.5)}>latency</Txt>
      <Txt x={R[0] - 30} y={R[1] + 16} anchor="mid" mono fs={21} weight={600} color={PAL.ink2} a={E(t, 14)}>footprint</Txt>
      {dots.map(([n, [x, y], tone, at0], i) => (
        <React.Fragment key={n}>
          <Dot x={x} y={y} r={11} color={toneColor(tone)} a={POP(t, at0 + (i % 3) * 0.5)} />
          <Txt x={x} y={y + 18} anchor="mid" mono fs={18} weight={600} color={PAL.ink} a={E(t, at0 + (i % 3) * 0.5)}>{n}</Txt>
        </React.Fragment>
      ))}

      {[['throughput', 'Of all CPU time, how much goes to **your code** rather than to GC.', 'pull', 4.5],
        ['latency', 'The longest time any of your threads is **stopped** for GC.', 'violet', 9.5],
        ['footprint', 'Extra **memory and CPU** the collector needs to do its job.', 'ink', 14]].map(([h, s, tone, a0], i) => (
        <Card key={h} x={96} y={210 + i * 170} w={940} h={150} num={h} title={s} tfs={26} tone={tone} a={E(t, a0) * cardA} />
      ))}
      <Table x={96} y={200} cols={[180, 236, 256, 300]} head={['collector', 'optimises for', 'pauses', 'flag']} rows={COLS} a={E(t, 18.6)} fs={19} rh={52}
        rowA={COLS.map((_, i) => E(t, i < 3 ? 19 + i * 0.6 : i < 5 ? 27 + (i - 3) * 0.6 : 34))}
        marks={{ 2: ['flow', win(t, 19, 46) * 0.8], 5: ['bad', E(t, 34)] }} colColors={[PAL.ink, PAL.ink2, PAL.ink2, PAL.flow]} />

      <Txt x={96} y={624} mono fs={17} color={PAL.ink3} a={E(t, 39.5)}>WHO DOES THE WORK WHILE YOUR CODE IS STOPPED?</Txt>
      <div style={{ position: 'absolute', left: 96, top: 676, width: 970, height: 12, borderRadius: 6, opacity: E(t, 39.8), background: `linear-gradient(90deg, ${PAL.bad}, ${PAL.pull} 50%, ${PAL.violet})` }}></div>
      {[['Serial', 120], ['Parallel', 290], ['G1', 560], ['Shenandoah', 820], ['ZGC', 1000]].map(([n, x], i) => (
        <Badge key={n} x={x} y={724} text={n} tone={i < 2 ? 'bad' : i === 2 ? 'pull' : 'violet'} a={E(t, 40.2 + i * 0.3)} fs={17} />
      ))}
      <Txt x={96} y={770} fs={19} color={PAL.ink2} w={430} a={E(t, 41.5)}>**Stop-the-world**: all GC work happens in pauses.</Txt>
      <Txt x={600} y={770} fs={19} color={PAL.ink2} w={466} a={E(t, 42.5)}>**Mostly concurrent**: marking, or even moving, runs alongside your code.</Txt>
    </React.Fragment>
  );
}

// ── Serial ─────────────────────────────────────────────────────────────────
const EDEN = Array.from({ length: 32 }, (_, k) => ({ c: k % 8, r: Math.floor(k / 8), live: [5, 13, 22, 27].includes(k) }));
const OLDC = Array.from({ length: 28 }, (_, k) => ({ c: k % 7, r: Math.floor(k / 7), at: k < 8 ? 0 : 26 + (k - 8) * 0.45, dead: k >= 2 && (k % 3 === 1), dieAt: 31 + (k % 5) * 0.6 }));
export function SSerial({ t }) {
  const TL0 = 4, TL1 = 58;
  const app = [[4, 11, 'run'], [11, 23.5, 'stw'], [23.5, 37, 'run'], [37, 51.5, 'stw'], [51.5, 58, 'run']];
  const gc = [[11, 23.5, 'gc'], [37, 51.5, 'gc']];
  const rev = lin(t, TL0, TL1 - TL0);
  const LX = 330, LW = 1494, X = (v) => LX + ((v - TL0) / (TL1 - TL0)) * LW;
  const stopped = (t > 11 && t < 23.5) || (t > 37 && t < 51.5);
  // eden cells
  const ex = (c) => 112 + c * 92, ey = (r) => 398 + r * 40;
  const s0 = [[896, 398], [966, 398], [896, 438], [966, 438]];
  const ox = (c) => 1268 + c * 78, oy = (r) => 398 + r * 40;
  const liveOld = OLDC.filter((o) => !o.dead);
  const phase = t < 38 ? '' : t < 41 ? 'Phase 1 · mark live objects' : t < 43 ? 'Phase 2 · compute new addresses' : t < 44.5 ? 'Phase 3 · adjust pointers' : t < 51.5 ? 'Phase 4 · move objects' : '';
  return (
    <React.Fragment>
      <Txt x={96} y={218} mono fs={18} color={stopped ? PAL.bad : PAL.flow} a={E(t, 0.5)}>{stopped ? 'app thread · stopped' : 'app thread'}</Txt>
      <Txt x={96} y={270} mono fs={18} color={PAL.pull} a={E(t, 0.8)}>GC thread</Txt>
      <Lane x={LX} y={212} w={LW} h={36} segs={app} t0={TL0} t1={TL1} reveal={rev} a={E(t, 0.5)} />
      <Lane x={LX} y={264} w={LW} h={36} segs={gc} t0={TL0} t1={TL1} reveal={rev} a={E(t, 0.8)} />
      <Txt x={X(11)} y={308} mono fs={17} weight={600} color={PAL.bad} a={E(t, 11.2)}>▲ stop-the-world: Pause Young</Txt>
      <Txt x={X(37)} y={308} mono fs={17} weight={600} color={PAL.bad} a={E(t, 37.2)}>▲ stop-the-world: Pause Full</Txt>
      <Txt x={96} y={308} mono fs={17} color={PAL.ink3} a={E(t, 12)}>slow motion</Txt>

      <Box x={96} y={360} w={760} h={200} tone="flow" a={E(t, 2)} />
      <AreaLabel x={112} y={366} text="eden" a={E(t, 2)} />
      <Box x={876} y={360} w={170} h={200} tone="green" a={E(t, 2.2)} />
      <AreaLabel x={890} y={366} text="survivor" a={E(t, 2.2)} />
      <Box x={1062} y={360} w={170} h={200} tone="green" a={E(t, 2.4)} dashed />
      <AreaLabel x={1076} y={366} text="survivor" a={E(t, 2.4)} />
      <Box x={1252} y={360} w={572} h={200} tone="blue" a={E(t, 2.6)} glow={win(t, 37, 51.5) * 0.6} />
      <AreaLabel x={1268} y={366} text={phase ? 'old · ' + phase : 'old'} a={E(t, 2.6)} color={phase ? PAL.pull : undefined} />

      {EDEN.map((e, k) => {
        const born = 6 + k * 0.15;
        if (e.live) {
          const j = [5, 13, 22, 27].indexOf(k);
          const [x, y] = track(t, [[16.5 + j * 0.9, ex(e.c), ey(e.r)], [17.6 + j * 0.9, s0[j][0], s0[j][1]]]);
          return <Obj key={k} x={x} y={y} w={j < 4 ? 62 : 80} h={32} tone="pull" a={E(t, born, 0.2)} glow={win(t, 12, 16.5) * 0.8} />;
        }
        const gone = E(t, 22, 0.6);
        return <Obj key={k} x={ex(e.c)} y={ey(e.r)} w={80} h={32} tone="flow" dead={t > 11} a={E(t, born, 0.2) * (1 - gone)} />;
      })}
      {/* eden refills after the young pause */}
      {EDEN.slice(0, 20).map((e, k) => <Obj key={'r' + k} x={ex(e.c)} y={ey(e.r)} w={80} h={32} tone="flow" a={E(t, 25 + k * 0.5, 0.2) * (1 - E(t, 37, 0.5))} />)}
      {OLDC.map((o, k) => {
        const li = liveOld.indexOf(o);
        const tx = li >= 0 ? ox(li % 7) : ox(o.c), ty = li >= 0 ? oy(Math.floor(li / 7)) : oy(o.r);
        const [x, y] = li >= 0 ? track(t, [[44.6 + li * 0.12, ox(o.c), oy(o.r)], [45.6 + li * 0.12, tx, ty]]) : [ox(o.c), oy(o.r)];
        const deadNow = o.dead && t > o.dieAt;
        const a = E(t, o.at, 0.25) * (deadNow ? 1 - E(t, 45.5, 0.6) : 1);
        return <Obj key={k} x={x} y={y} w={70} h={32} tone="pull" dead={deadNow} a={a} glow={!deadNow ? win(t, 38.2, 41, 0.3) * 0.9 : 0} />;
      })}
      {s0.map(([x, y], j) => <Obj key={'s' + j} x={x} y={y} w={62} h={32} tone="pull" a={t > 17.6 + j * 0.9 ? 1 - E(t, 30, 0.6) : 0} />)}
      <Badge x={476} y={580} text="the dead ones are simply abandoned" tone="flow" a={win(t, 19, 24)} fs={17} />
      <Badge x={1538} y={580} text="cache entries promoted and replaced over time" tone="blue" a={win(t, 31, 37)} fs={17} />

      <LogPanel x={96} y={600} w={1150} h={268} t={t} a={E(t, 24)} fs={17} lh={30} lines={[
        { at: 24.5, s: '[1.465s][info][gc] GC(40) Pause Young (Allocation Failure) 298M->165M(494M) 4.733ms', hl: win(t, 24.5, 31) },
        { at: 38.5, s: '[3.276s][info][gc,phases] GC(87) Phase 1: Mark live objects 76.149ms', hl: win(t, 44, 50) },
        { at: 41, s: '[3.312s][info][gc,phases] GC(87) Phase 2: Compute new object addresses 36.340ms' },
        { at: 43, s: '[3.317s][info][gc,phases] GC(87) Phase 3: Adjust pointers 5.312ms' },
        { at: 44.5, s: '[3.339s][info][gc,phases] GC(87) Phase 4: Move objects 21.702ms' },
        { at: 46, s: '[3.339s][info][gc] GC(87) Pause Full (Allocation Failure) 482M->134M(494M) 139.855ms', hl: E(t, 46.5), tone: 'bad' },
      ]} />
      <Card x={1280} y={600} w={544} h={268} a={E(t, 1) * (1 - E(t, 51.6, 0.4))} num="-XX:+UseSerialGC" title="One GC thread" sub="young: **copying** into a survivor space · old: **mark-compact** · the app waits for all of it" tfs={30} sfs={21} />
      <Card x={1280} y={600} w={544} h={268} a={E(t, 52)} tone="flow" num="right when" title="1 CPU · tiny heap · CLI tool" sub="Smallest footprint of any collector. Not legacy: the right tool for its niche." tfs={30} sfs={21} glow={win(t, 52, 60) * 0.6} />
    </React.Fragment>
  );
}

// ── Parallel ───────────────────────────────────────────────────────────────
const WEND = [12.1, 12.5, 11.9, 12.3, 12.4, 12.0, 12.2, 12.5];
export function SParallel({ t }) {
  const TL0 = 3, TL1 = 32, LX = 330, LW = 1494;
  const rev = lin(t, TL0, 12);
  const barA = 1 - E(t, 42.6, 0.4);
  return (
    <React.Fragment>
      <Txt x={96} y={212} mono fs={18} color={t > 9 && t < 12.5 ? PAL.bad : PAL.flow} a={E(t, 0.5)}>app thread</Txt>
      <Lane x={LX} y={206} w={LW} h={30} segs={[[3, 9, 'run'], [9, 12.5, 'stw'], [12.5, 32, 'run']]} t0={TL0} t1={TL1} reveal={rev} a={E(t, 0.5)} />
      {WEND.map((e, i) => (
        <React.Fragment key={i}>
          <Txt x={96} y={248 + i * 23} mono fs={17} color={PAL.pull} a={E(t, 5.5 + i * 0.1)}>GC worker {i + 1}</Txt>
          <Lane x={LX} y={251 + i * 23} w={LW} h={16} segs={[[9, e, 'gc']]} t0={TL0} t1={TL1} reveal={rev} a={E(t, 5.5 + i * 0.1)} />
        </React.Fragment>
      ))}
      <Txt x={96} y={438} mono fs={17} color={PAL.ink3} a={E(t, 12)}>Serial, same work</Txt>
      <Lane x={LX} y={441} w={LW} h={16} segs={[[9, 9 + 3.4 * 6.5, 'idle']]} t0={TL0} t1={TL1} reveal={lin(t, 12, 4) * 0.9} a={E(t, 12) * 0.9} />
      <Txt x={LX + (13 - TL0) / (TL1 - TL0) * LW} y={464} mono fs={17} color={PAL.ink2} a={E(t, 12.5)}>one pause split 8 ways: same work, a much shorter wait</Txt>

      <Card x={96} y={500} w={1728} h={250} a={win(t, 5.5, 17.3, 0.5)} num="-XX:+UseParallelGC" title="Serial's algorithms, run by a team" sub="Young: parallel copying. Old: parallel mark-compact. The thread count comes from the core count: `ParallelGCThreads = 8` here, one per core up to 8, then 5 more for every 8 cores beyond." tfs={32} sfs={22} />
      <LogPanel x={96} y={494} w={1728} h={120} title="Serial · a full GC" t={t} a={E(t, 17.5)} fs={17} lh={30} lines={[
        { s: '[3.339s][info][gc] GC(87) Pause Full (Allocation Failure) 482M->134M(494M) 139.855ms', hl: win(t, 17.5, 28) },
        { at: 28.5, s: '[3.339s][info][gc,cpu] GC(87) User=0.03s Sys=0.07s Real=0.14s', hl: win(t, 36, 43) },
      ]} />
      <LogPanel x={96} y={628} w={1728} h={120} title="Parallel · a full GC" t={t} a={E(t, 23)} fs={17} lh={30} tone="pull" lines={[
        { s: '[6.309s][info][gc] GC(172) Pause Full (Ergonomics) 501M->126M(505M) 12.336ms', hl: win(t, 23, 28) },
        { at: 28.5, s: '[6.309s][info][gc,cpu] GC(172) User=0.07s Sys=0.01s Real=0.01s', hl: win(t, 36, 43) },
      ]} />
      {[['Serial', 139.855, '0.10 s CPU', 'bad', 17.5], ['Parallel', 12.336, '0.08 s CPU', 'pull', 23]].map(([n, ms, cpu, tone, a0], i) => (
        <React.Fragment key={n}>
          <Txt x={96} y={772 + i * 54} mono fs={19} weight={600} color={PAL.ink} a={E(t, a0 + 0.5) * barA}>{n}</Txt>
          <div style={{ position: 'absolute', left: 240, top: 768 + i * 54, height: 34, width: (ms / 140) * 1080 * M(t, a0 + 0.6, 1), borderRadius: 6, background: hexA(toneColor(tone), 0.85), opacity: E(t, a0 + 0.5) * barA }}></div>
          <Txt x={240 + (ms / 140) * 1080 + 18} y={772 + i * 54} mono fs={19} color={toneColor(tone)} a={E(t, a0 + 1.4) * barA}>{ms} ms wall</Txt>
          <Txt x={1824} y={772 + i * 54} anchor="right" mono fs={19} color={PAL.violet} a={E(t, 36) * barA}>{cpu} (User+Sys)</Txt>
        </React.Fragment>
      ))}
      <Callout x={96} y={772} w={1728} tone="pull" a={E(t, 43)} fs={21} title="the throughput collector" text="About the same CPU work, a tenth of the wall time. Default from Java 5 to 8 on server machines; still the best pick for batch jobs." />
    </React.Fragment>
  );
}
