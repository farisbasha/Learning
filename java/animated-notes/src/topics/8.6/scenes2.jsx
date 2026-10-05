// 8.6 scenes, part 2: G1. Regions, remembered sets, concurrent marking + SATB, mixed collections, humongous objects.
const { PAL, MOTION, lin, lerp, win, pulse, step, track, hlAt, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Mark, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;
import { LogPanel, Lane, Legend } from './common.jsx';
import { REGION_TYPES, REGION_LIVE } from './data.jsx';

const RT = { E: ['flow', 'eden'], S: ['green', 'survivor'], O: ['blue', 'old'], H: ['pink', 'humongous'], C: ['pink', 'humongous'], F: [null, 'free'], A: ['ink', 'archive'] };
const COUNT = REGION_TYPES.split('').reduce((m, c) => ((m[c] = (m[c] || 0) + 1), m), {});

function Cell({ x, y, w, h, tone, a = 1, glow = 0, live, dashed, dim = 1, label }) {
  if (a <= 0.01) return null;
  const c = tone ? toneColor(tone) : PAL.ink3;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box', borderRadius: 5, opacity: clamp(a, 0, 1) * dim, overflow: 'hidden', background: tone ? hexA(c, live != null ? 0.06 : 0.28) : 'transparent', border: `1.5px ${dashed || !tone ? 'dashed' : 'solid'} ${tone ? hexA(c, glow > 0.01 ? 1 : 0.7) : PAL.line2}`, boxShadow: glow > 0.01 ? `0 0 ${18 * glow}px ${hexA(c, 0.8 * glow)}` : 'none' }}>
      {live != null && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${live * 100}%`, background: hexA(PAL.flow, 0.55) }}></div>}
      {live != null && <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: `${(1 - live) * 100}%`, background: hexA(PAL.bad, 0.16) }}></div>}
      {label && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 17px ${MONO}`, color: PAL.ink }}>{label}</div>}
    </div>
  );
}

// ── G1: the region grid (real heap snapshot) ───────────────────────────────
export function SG1Regions({ t }) {
  const X0 = 96, Y0 = 236, CW = 50, CH = 32, G = 4, COLS = 32;
  const focus = t < 13 ? null : t < 14.5 ? 'E' : t < 16 ? 'S' : t < 17.5 ? 'O' : t < 19 ? 'HC' : null;
  const young = win(t, 19, 25.5), old = win(t, 21.5, 25.5);
  const DEMO = 442; // first eden region in the snapshot
  const demo = step(t, [[26.5, 'F'], [28, 'E'], [29.5, 'F'], [31, 'O']], null);
  const dimAll = 1 - 0.8 * win(t, 32, 55, 0.6);
  const rows = [['512 MB', '1 MB', '512'], ['4 GB', '2 MB', '2,048'], ['6 GB', '4 MB', '1,536'], ['16 GB', '8 MB', '2,048'], ['64 GB', '32 MB', '2,048'], ['128 GB', '32 MB', '4,096']];
  return (
    <React.Fragment>
      <Legend x={96} y={196} a={E(t, 6.5)} items={[['flow', `eden ${COUNT.E}`], ['green', `survivor ${COUNT.S}`], ['blue', `old ${COUNT.O}`], ['pink', `humongous ${COUNT.H + COUNT.C}`], ['ink', `archive ${COUNT.A}`], ['dim', `free ${COUNT.F}`]]} />
      {REGION_TYPES.split('').map((ty, i) => {
        const c = i % COLS, r = Math.floor(i / COLS);
        let typ = t > 6.6 + i * 0.009 ? ty : 'F';
        if (i === DEMO && demo) typ = demo;
        const [tone] = RT[typ];
        const isYoung = typ === 'E' || typ === 'S', isOld = typ === 'O';
        const fdim = focus ? (focus.includes(typ) ? 1 : 0.3) : 1;
        const glow = (isYoung ? young : 0) + (isOld ? old * 0.6 : 0) + (i === DEMO ? win(t, 25.5, 32) : 0);
        return <Cell key={i} x={X0 + c * (CW + G)} y={Y0 + r * (CH + G)} w={CW} h={CH} tone={tone} a={E(t, 0.6 + r * 0.12, 0.3)} dim={fdim * (i === DEMO && t > 25.5 && t < 32 ? 1 : dimAll)} glow={glow} />;
      })}
      <Badge x={1500} y={226 + 13 * 36 + 60} text="young generation: just a set of regions" tone="flow" a={win(t, 19.3, 25.5)} fs={17} solid />
      <Badge x={560} y={226 + 3 * 36} text="old generation: another set" tone="blue" a={win(t, 21.7, 25.5)} fs={17} solid />

      <Box x={700} y={540} w={480} h={110} label={demo ? `region #${DEMO}: ${RT[demo][1]}` : `region #${DEMO}`} sub="free → eden → free → old" tone={demo ? RT[demo][0] || 'ink' : 'ink'} a={win(t, 25.5, 32)} fs={26} sfs={18} />
      <Arrow pts={[[1182, 595], [1525, 595], [1525, 700]]} draw={M(t, 25.8, 0.6)} a={win(t, 25.5, 32)} color={PAL.ink2} />

      <Panel x={240} y={300} w={1440} h={470} a={win(t, 32, 55, 0.6)} title="how big is a region?" right="JDK 17 · -Xlog:gc+init" />
      <Table x={290} y={380} cols={[220, 240, 240]} head={['max heap', 'region size', 'regions']} rows={rows} a={win(t, 32.4, 55, 0.6)} fs={20} rh={48}
        marks={{ 0: ['pull', win(t, 39.5, 55)] }} rowA={rows.map((_, i) => E(t, 32.6 + i * 0.4))} colColors={[PAL.ink, PAL.flow, PAL.ink2]} />
      <Txt x={290} y={714} fs={19} color={PAL.ink2} w={700} a={win(t, 34, 55, 0.6)}>heap ÷ 2,048, rounded up to a power of two, kept between 1 and 32 MB.</Txt>
      <LogPanel x={1060} y={380} w={580} h={184} t={t} a={win(t, 39.5, 55, 0.6)} title="our run · startup" lines={[
        { s: '[0.013s][info][gc,init] Heap Region Size: 1M', hl: 1 },
        { s: '[0.013s][info][gc,init] Heap Max Capacity: 512M' },
        { s: '[0.013s][info][gc,init] Parallel Workers: 8' },
        { s: '[0.013s][info][gc,init] Concurrent Workers: 2' },
      ]} />
      <Callout x={1060} y={590} w={580} tone="flow" a={win(t, 46.5, 55, 0.6)} fs={20} title="why regions" text="G1 can collect **some** old regions in one pause, instead of the whole old generation." />
    </React.Fragment>
  );
}

// ── G1: remembered sets and the young collection ───────────────────────────
export function SRemSets({ t }) {
  const moved = t > 45;
  const ep = track(t, [[45, 340, 615], [46.4, 900, 620]]);
  const freed = t > 51.5;
  const cardDirty = t > 24.6;
  const tok = track(t, [[24.8, 298, 467], [26.2, 825, 600], [30.5, 825, 600], [31.6, 1135, 600], [32.6, 1135, 600], [33.6, 1562, 330]]);
  const midA = win(t, 17, 37, 0.5);
  return (
    <React.Fragment>
      <Box x={96} y={210} w={520} h={230} tone="blue" a={E(t, 0.5)} />
      <Txt x={112} y={218} mono fs={17} color={PAL.ink3} a={E(t, 0.5)}>old region A</Txt>
      <Txt x={120} y={252} mono fs={19} weight={600} color={PAL.ink} a={E(t, 0.8)}>recent · byte[30_000][]</Txt>
      {[5, 6, 7, 8, 9, 10].map((n, k) => <Box key={n} x={120 + k * 78} y={296} w={70} h={40} label={`[${n}]`} fs={17} tone={n === 7 ? 'pull' : 'ink'} a={E(t, 1 + k * 0.1)} glow={n === 7 ? pulse(t, [17.5, 24], 1) : 0} />)}
      <Txt x={120} y={460} mono fs={17} color={PAL.ink3} a={E(t, 22)}>card table of A · 1 byte per 512 B</Txt>
      {Array.from({ length: 12 }, (_, k) => <Cell key={k} x={120 + k * 40} y={490} w={34} h={26} tone={k === 4 && cardDirty ? 'bad' : 'ink'} a={E(t, 22.2 + k * 0.04)} glow={k === 4 ? pulse(t, [24.6], 1.2) + win(t, 38, 44) : 0} />)}

      <Box x={96} y={560} w={520} h={200} tone={freed ? null : 'flow'} dashed={freed} a={E(t, 0.6)} glow={win(t, 37.5, 45) * 0.8} />
      <Txt x={112} y={568} mono fs={17} color={freed ? PAL.ink2 : PAL.ink3} a={E(t, 0.6)}>{freed ? 'region E · back on the free list' : 'eden region E'}</Txt>
      <Box x={ep[0]} y={ep[1]} w={180} h={50} label="byte[4000]" sub="" fs={18} tone="pull" a={E(t, 1.2)} glow={pulse(t, [45], 1)} />
      <Arrow pts={moved ? [[311, 336], [311, 420], [660, 420], [660, 645], [896, 645]] : [[311, 336], [311, 420], [650, 420], [650, 640], [524, 640]]} draw={moved ? M(t, 46.4, 0.6) : M(t, 2, 0.8)} color={PAL.pull} />
      <Badge x={356} y={724} text="old → young pointer" tone="pull" a={win(t, 3, 10.5)} fs={17} />

      {/* the naive way */}
      {Array.from({ length: 32 }, (_, k) => <Cell key={k} x={1300 + (k % 8) * 64} y={220 + Math.floor(k / 8) * 50} w={56} h={40} tone="blue" a={win(t, 6, 10.5)} />)}
      <div style={{ position: 'absolute', left: 1300 + lin(t, 6.4, 3.5) * 512, top: 212, width: 4, height: 206, background: PAL.bad, opacity: win(t, 6.4, 10.3), boxShadow: `0 0 12px ${PAL.bad}` }}></div>
      <Badge x={1556} y={450} text="scan all 512 regions? defeats the point" tone="bad" a={win(t, 7, 10.5)} fs={17} />

      <Panel x={1300} y={210} w={524} h={230} title="remembered set of E" right="who points in" tone="flow" a={E(t, 10.8)} />
      <Txt x={1324} y={276} fs={19} color={PAL.ink3} w={470} a={win(t, 11, 33.4)}>empty so far</Txt>
      <Box x={1324} y={290} w={476} h={70} label="region A · card 4" sub="" fs={20} tone="bad" a={E(t, 33.6)} glow={win(t, 38, 44)} />
      <Badge x={1562} y={400} text="scan just this card of A" tone="bad" a={win(t, 38, 45)} fs={17} />

      <Code x={700} y={210} w={560} h={308} fs={17} lh={30} title="recent[i] = entry, compiled" a={midA}
        hl={t < 24 ? 0 : 5} hlA={win(t, 17.5, 37)} lines={[
          'recent[i] = entry;          // the store',
          { s: '// + G1 post-write barrier (simplified)', tone: 'violet', toneA: 1 },
          'if (regionOf(&recent[i]) != regionOf(entry)',
          '    && entry != null) {',
          '  card = cardOf(&recent[i]);',
          '  if (card != DIRTY) {',
          '    card = DIRTY;  enqueue(card);',
          '  } }',
        ]} />
      <Box x={700} y={556} w={250} h={90} label="dirty card queue" fs={19} tone="bad" a={E(t, 24.5) * midA} />
      <HArrow x1={954} x2={1006} y={601} a={E(t, 30) * midA} color={PAL.ink2} />
      <Box x={1010} y={556} w={250} h={90} label="refinement" sub="8 background threads" fs={19} sfs={17} tone="violet" a={E(t, 30) * midA} glow={win(t, 30.5, 33.5) * 0.8} />
      <Arrow pts={[[1262, 601], [1562, 601], [1562, 444]]} draw={M(t, 32.4, 0.6)} a={midA} color={PAL.violet} />
      {t > 24.8 && t < 33.8 && <Cell x={tok[0] - 17} y={tok[1] - 13} w={34} h={26} tone="bad" glow={0.8} />}

      <Card x={700} y={210} w={560} h={308} a={win(t, 37.3, 58, 0.5)} tone="flow" num="young collection" title="collection set: every eden and survivor region" sub="G1 scans the **roots** plus the **remembered sets** of those regions. Nothing else in the old generation." tfs={27} sfs={21} />
      <Box x={700} y={556} w={560} h={200} tone="green" a={E(t, 44.5)} />
      <Txt x={716} y={564} mono fs={17} color={PAL.ink3} a={E(t, 44.5)}>survivor region S</Txt>
      <Badge x={980} y={724} text="evacuated · pointer fixed" tone="green" a={E(t, 47)} fs={17} />
      <LogPanel x={96} y={784} w={1728} h={144} t={t} a={E(t, 44.5)} lines={[
        { at: 44.5, s: '[2.820s][info][gc,task] GC(45) Using 8 workers of 8 for evacuation' },
        { at: 46, s: '[2.822s][info][gc,heap] GC(45) Eden regions: 89->0(202)', hl: win(t, 51.5, 58) },
        { at: 46.5, s: '[2.822s][info][gc,heap] GC(45) Survivor regions: 15->12(27)' },
      ]} />
      <Callout x={1300} y={480} w={524} tone="flow" a={E(t, 51.5)} fs={20} text="All 89 eden regions are free again. **No sweeping**: evacuating the live objects is the cleanup." />
    </React.Fragment>
  );
}

// ── G1: concurrent marking and SATB ────────────────────────────────────────
export function SG1Cycle({ t }) {
  const LX = 330, LW = 1494, T0 = 1, T1 = 62, X = (v) => LX + ((v - T0) / (T1 - T0)) * LW;
  const rev = lin(t, T0, T1 - T0);
  const app = [[1, 12.5, 'run'], [12.5, 13.5, 'stw'], [13.5, 46.5, 'run'], [46.5, 47.2, 'stw'], [47.2, 48.5, 'run'], [48.5, 49, 'stw'], [49, 62, 'run']];
  const mark = [[13.5, 46.5, 'conc'], [47.2, 48.5, 'conc']];
  const occ = t < 6.5 ? 0.3 : t < 12.5 ? lerp(0.3, 240123904 / 536870912, M(t, 6.8, 4.5)) : 241623920 / 536870912;
  const BX = 130, BW = 860;
  // SATB story
  const sA = win(t, 26, 46.3, 0.5);
  const lost = t > 30.4 && t < 32;
  const satb = t >= 33.5;
  const [hl, hA] = hlAt(t, [[28.5, 0], [30, 1], [33, 4], [35, 5], [40, -1]]);
  const node = (x, y, name, state, at, glow = 0) => {
    const tone = state === 'marked' ? 'flow' : state === 'grey' ? 'pull' : state === 'lost' ? 'bad' : state === 'new' ? 'green' : null;
    return <Box x={x} y={y} w={110} h={64} label={name} sub={state === 'grey' ? 'scanning' : state === 'marked' ? 'marked' : state === 'lost' ? 'freed!' : state === 'new' ? 'new: live' : 'unmarked'} fs={24} sfs={17} tone={tone || 'ink'} dashed={!tone} a={E(t, at) * sA} glow={glow} />;
  };
  const bState = lost ? 'lost' : satb && t > 34.5 ? 'marked' : 'white';
  return (
    <React.Fragment>
      <Txt x={96} y={212} mono fs={18} color={PAL.flow} a={E(t, 0.5)}>app thread</Txt>
      <Txt x={96} y={254} mono fs={18} color={PAL.violet} a={E(t, 0.8)}>marking × 2</Txt>
      <Lane x={LX} y={206} w={LW} h={30} segs={app} t0={T0} t1={T1} reveal={rev} a={E(t, 0.5)} />
      <Lane x={LX} y={248} w={LW} h={30} segs={mark} t0={T0} t1={T1} reveal={rev} a={E(t, 0.8)} />
      <Txt x={X(12.5)} y={288} mono fs={17} color={PAL.bad} a={E(t, 12.6)}>▲ Concurrent Start</Txt>
      <Txt x={X(46.5) + 8} y={288} anchor="right" mono fs={17} color={PAL.bad} a={E(t, 46.6)}>Remark ▲</Txt>
      <Txt x={X(48.5)} y={288} mono fs={17} color={PAL.bad} a={E(t, 48.6)}>▲ Cleanup</Txt>

      <Panel x={96} y={330} w={924} h={300} title="old generation occupancy" right="IHOP = 45% of heap" a={win(t, 6, 26, 0.5)} />
      <div style={{ position: 'absolute', left: BX, top: 404, width: BW, height: 50, borderRadius: 8, background: PAL.panel2, border: `1px solid ${PAL.line2}`, opacity: win(t, 6.2, 26, 0.5) }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: occ * BW, borderRadius: 8, background: hexA(t > 12.5 ? PAL.bad : PAL.blue, 0.6) }}></div>
      </div>
      <div style={{ position: 'absolute', left: BX + 0.45 * BW, top: 392, width: 3, height: 74, background: PAL.pull, opacity: win(t, 6.5, 26, 0.5) }}></div>
      <Txt x={BX + 0.45 * BW + 12} y={466} mono fs={17} color={PAL.pull} a={win(t, 6.5, 26, 0.5)}>threshold 241,591,910 B</Txt>
      <Txt x={BX} y={466} mono fs={17} color={PAL.ink2} a={win(t, 7, 26, 0.5)}>{Math.round(occ * 512)} MB used</Txt>
      <LogPanel x={116} y={506} w={884} h={110} t={t} title="-Xlog:gc+ergo+ihop=debug · abridged" a={win(t, 12.5, 26, 0.5)} lines={[
        { s: 'Request concurrent cycle initiation (occupancy higher than threshold)' },
        { s: 'occupancy: 240123904B allocation request: 1500016B threshold: 241591910B', hl: 1 },
      ]} />
      <Card x={1060} y={330} w={764} h={300} a={win(t, 13, 26, 0.5)} tone="pull" num="concurrent start" title="Marking rides on a young pause" sub="That young collection already scans the roots, so G1 starts marking from there. Then marking threads trace the heap **while the order loop keeps running**." tfs={28} sfs={21} />

      {/* SATB */}
      <Box x={110} y={440} w={100} h={60} label="stack" fs={19} tone="ink" a={E(t, 26) * sA} />
      {node(330, 350, 'D', 'marked', 26.2)}
      {node(330, 540, 'A', t > 31 ? 'marked' : 'grey', 26.4, pulse(t, [31], 1))}
      {node(700, 445, 'B', bState, 26.6, pulse(t, [34.5], 1.2))}
      {node(870, 350, 'N', 'new', 40, pulse(t, [40], 1))}
      <Arrow from={[212, 460]} to={[326, 390]} draw={1} a={E(t, 26) * sA} color={PAL.ink2} />
      <Arrow from={[212, 480]} to={[326, 565]} draw={1} a={E(t, 26) * sA} color={PAL.ink2} />
      <Arrow from={[442, 572]} to={[696, 490]} draw={1} a={E(t, 26.6) * sA * (1 - E(t, 30, 0.4))} color={PAL.ink2} />
      <Arrow from={[442, 378]} to={[696, 462]} draw={M(t, 28.5, 0.7)} a={sA} color={PAL.pull} />
      <Badge x={570} y={380} text="d.f = a.f" tone="pull" a={win(t, 28.6, 33)} fs={17} />
      <Badge x={570} y={590} text="a.f = null" tone="bad" a={win(t, 30, 33)} fs={17} />
      <Callout x={96} y={640} w={924} tone="bad" a={win(t, 30.4, 32.6, 0.3)} fs={19} text="Without help: D was already scanned, A no longer points at B. **B is never marked, and gets freed while in use.**" />
      <Box x={600} y={548} w={300} h={64} label="SATB queue: B" fs={19} tone="violet" a={E(t, 33.5) * sA} glow={pulse(t, [33.6], 1)} />
      <Code x={1060} y={330} w={764} h={248} fs={18} lh={30} title="what the app does during marking" a={sA} hl={hl} hlA={hA} lines={[
        'd.f = a.f;          // copy the pointer…',
        'a.f = null;         // …then erase the old path',
        '',
        { s: '// G1 pre-write barrier, before a.f = null:', tone: 'violet', toneA: 1 },
        'if (markingActive && a.f != null)',
        '    satbQueue.add(a.f);   // log the OLD value',
      ]} />
      <Callout x={1060} y={590} w={764} tone="green" a={E(t, 40) * sA} fs={19} text="Objects allocated after marking began sit above **TAMS** (top-at-mark-start) and count as live." />

      {[['Concurrent Start', '2.051 ms', 'bad', 46.6], ['Remark', '0.244 ms', 'bad', 47], ['Cleanup', '0.120 ms', 'bad', 48.6], ['whole marking cycle', '7.011 ms · app running', 'violet', 53]].map(([l, v, tone, a0], i) => (
        <Box key={l} x={96 + i * 436} y={360} w={416} h={110} label={v} sub={l} fs={28} sfs={18} tone={tone} a={E(t, a0)} />
      ))}
      <Callout x={96} y={500} w={1728} tone="flow" a={E(t, 53.5)} fs={21} text="Result: G1 now knows exactly how many **live bytes** each old region holds. That is what the next scene uses." />

      <LogPanel x={96} y={660} w={1728} h={250} t={t} a={E(t, 12.5)} fs={17} lh={28} lines={[
        { at: 12.5, s: '[2.822s][info][gc] GC(45) Pause Young (Concurrent Start) (G1 Humongous Allocation) 330M->243M(512M) 2.051ms', hl: win(t, 12.6, 20) },
        { at: 20, s: '[2.822s][info][gc] GC(46) Concurrent Mark Cycle' },
        { at: 20.5, s: '[2.822s][info][gc,task] GC(46) Using 2 workers of 2 for marking', hl: win(t, 20.5, 26) },
        { at: 46.5, s: '[2.826s][info][gc] GC(46) Pause Remark 261M->261M(512M) 0.244ms', hl: win(t, 46.6, 53) },
        { at: 47.3, s: '[2.828s][info][gc,marking] GC(46) Concurrent Rebuild Remembered Sets 1.888ms' },
        { at: 48.5, s: '[2.828s][info][gc] GC(46) Pause Cleanup 269M->269M(512M) 0.120ms', hl: win(t, 48.6, 53) },
        { at: 53, s: '[2.829s][info][gc] GC(46) Concurrent Mark Cycle 7.011ms', hl: E(t, 53.2) },
      ]} />
    </React.Fragment>
  );
}

// ── G1: mixed collections, garbage first ───────────────────────────────────
const OLD = [];
REGION_TYPES.split('').forEach((ty, i) => { if (ty === 'O') OLD.push({ i, d: +REGION_LIVE[i] }); });
const SORTED = OLD.map((o, k) => ({ ...o, k })).sort((a, b) => a.d - b.d || a.k - b.k);
SORTED.forEach((o, j) => { OLD[o.k].j = j; });
export function SMixed({ t }) {
  const X0 = 96, Y0 = 206, CW = 64, CH = 40, G = 6, C = 24;
  const pos = (n) => [X0 + (n % C) * (CW + G), Y0 + Math.floor(n / C) * (CH + G)];
  const sortP = (k) => M(t, 12 + (k % 24) * 0.04, 2.6);
  const group = (j) => (j < 52 ? 1 : j < 104 ? 2 : j < 125 ? 3 : j < 191 ? 'pruned' : 'live');
  return (
    <React.Fragment>
      {OLD.map((o, k) => {
        const [x1, y1] = pos(k), [x2, y2] = pos(o.j);
        const p = sortP(k);
        const g = group(o.j);
        const out = t > 18.5 && (g === 'pruned' || g === 'live');
        const sel = t > 26 && typeof g === 'number';
        const gone = typeof g === 'number' ? E(t, 46.5 + g * 1.4, 0.5) : 0;
        const tone = sel ? (g === 1 ? 'pull' : g === 2 ? 'pink' : 'violet') : 'blue';
        return <Cell key={k} x={lerp(x1, x2, p)} y={lerp(y1, y2, p)} w={CW} h={CH} tone={tone} live={(o.d + 0.5) / 10} a={E(t, 0.6 + (k % 24) * 0.02) * (1 - gone)} dim={out ? 0.3 : 1} dashed={out && g === 'pruned'} glow={sel ? win(t, 26 + (g - 1) * 1.6, 33) * 0.8 : 0} />;
      })}
      <Legend x={96} y={640} a={E(t, 5)} items={[['flow', 'live bytes'], ['bad', 'garbage']]} />
      <Txt x={560} y={640} mono fs={17} color={PAL.ink2} a={win(t, 5, 12)}>our 216 old regions after marking, in address order</Txt>
      <Txt x={560} y={640} mono fs={17} color={PAL.ink2} a={win(t, 12.2, 18.5)}>sorted: most garbage first (G1 really sorts by predicted efficiency)</Txt>
      <Txt x={560} y={640} mono fs={17} color={PAL.ink2} a={win(t, 18.7, 26)}>dim: 25 too live (over 85%) · dashed: 66 pruned, not worth copying</Txt>
      <div style={{ position: 'absolute', left: 560, top: 636, display: 'flex', gap: 26, opacity: E(t, 26.2), font: `500 17px ${MONO}`, color: PAL.ink2 }}>
        <span style={{ color: PAL.pull }}>■ mixed 1: 52 regions</span><span style={{ color: PAL.pink }}>■ mixed 2: 52</span><span style={{ color: PAL.violet }}>■ mixed 3: 21</span><span>= 125</span>
      </div>

      <LogPanel x={96} y={686} w={1100} h={174} t={t} title="-Xlog:gc+ergo+cset=debug · abridged" a={E(t, 18.5)} lines={[
        { at: 18.5, s: 'GC(46) Pruned 66 regions out of 191, leaving 26596256 bytes waste', hl: win(t, 18.6, 26) },
        { at: 26, s: 'GC(48) Start adding old regions. Min 16 regions, max 52 regions,', hl: win(t, 26.1, 33.5) },
        { at: 26.3, s: '       time remaining 199.33ms', hl: win(t, 33.5, 40) },
        { at: 47, s: 'GC(50) Old candidate collection set empty.' },
      ]} />
      <Table x={1230} y={686} cols={[146, 150, 140, 154]} head={['pause', 'eden', 'old', 'time']} fs={18} rh={42} a={E(t, 40.5)}
        rows={[['prepare', '202→0(9)', '216→216', '1.906 ms'], ['mixed 1', '9→0(24)', '216→187', '4.588 ms'], ['mixed 2', '24→0(24)', '187→149', '3.108 ms'], ['mixed 3', '24→0(288)', '149→136', '2.097 ms']]}
        rowA={[E(t, 40.7), E(t, 47.5), E(t, 48.9), E(t, 50.3)]} marks={{ 0: ['pull', win(t, 40.7, 47.5)] }} colColors={[PAL.ink, PAL.flow, PAL.blue, PAL.pink]} />
      <Callout x={96} y={872} w={1100} tone="pull" a={E(t, 54.5)} fs={19} text="`MaxGCPauseMillis=200` is the budget G1 plans with: a **goal**, not a guarantee." />
    </React.Fragment>
  );
}

// ── G1: humongous objects ──────────────────────────────────────────────────
export function SHumongous({ t }) {
  const types = ['O', 'F', 'F', 'O', 'F', 'O', 'F', 'O'];
  const RW = 196, RX = (i) => 96 + i * 206;
  const rep = track(t, [[6, 760, 236], [8, RX(1) + 4, 236]]);
  const placed = t > 8.2;
  const frag = ['O', 'F', 'O', 'O', 'F', 'O', 'F', 'F', 'O', 'O', 'F', 'O', 'F', 'O', 'O', 'F'];
  const probe = Math.floor(clamp((t - 27.5) / 0.35, 0, 13.99));
  const fragA = win(t, 26, 38.3, 0.5);
  return (
    <React.Fragment>
      {types.map((ty, i) => (
        <React.Fragment key={i}>
          <Cell x={RX(i)} y={210} w={RW} h={130} tone={ty === 'O' ? 'blue' : null} a={E(t, 0.6 + i * 0.1)} />
          <Txt x={RX(i) + RW / 2} y={350} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 0.8 + i * 0.1)}>{i === 1 && placed ? 'HUMS' : i === 2 && placed ? 'HUMC' : ty === 'O' ? 'old' : 'free'} · 1 MB</Txt>
        </React.Fragment>
      ))}
      {/* the 1.5 MB report */}
      {!placed && <Box x={rep[0]} y={rep[1]} w={RW * 1.5} h={78} label="report · 1.5 MB" fs={20} tone="violet" a={E(t, 6)} />}
      <Cell x={RX(1)} y={210} w={RW} h={130} tone="pink" live={1} a={placed ? 1 : 0} glow={pulse(t, [8.2], 1)} label="1,048,576 B" />
      <Cell x={RX(2)} y={210} w={RW} h={130} tone="pink" a={placed ? 1 : 0} glow={pulse(t, [8.4], 1)} />
      <div style={{ position: 'absolute', left: RX(2), top: 210, width: RW * (451440 / 1048576), height: 130, borderRadius: '5px 0 0 5px', background: hexA(PAL.pink, 0.5), opacity: placed ? 1 : 0 }}></div>
      <div style={{ position: 'absolute', left: RX(2) + RW * (451440 / 1048576), top: 212, width: RW * (1 - 451440 / 1048576) - 2, height: 126, background: `repeating-linear-gradient(45deg, transparent 0 7px, ${hexA(PAL.bad, 0.35)} 7px 9px)`, opacity: E(t, 12.5) }}></div>
      <Badge x={RX(2) + RW / 2} y={398} text="597,136 B wasted" tone="bad" a={E(t, 13)} fs={17} />
      <Badge x={RX(5)} y={398} text="needs 2 contiguous free regions" tone="violet" a={win(t, 6.5, 12.5)} fs={17} />

      <LogPanel x={96} y={436} w={1728} h={114} t={t} a={E(t, 12.5)} title="-Xlog:gc+liveness=trace · abridged · type, address range, used, prev-live, next-live (bytes)" lines={[
        { s: 'HUMS 0x00000007e0000000-0x00000007e0100000    1048576    1048576    1048576' },
        { s: 'HUMC 0x00000007e0100000-0x00000007e0200000    1048576    1048576     451440', hl: win(t, 12.6, 19) },
      ]} />

      {[['skips eden', 'allocated straight into free regions', 19], ['never copied', 'young and mixed GCs leave it in place', 20.2], ['can start marking', 'GC(45) … (G1 Humongous Allocation)', 21.4]].map(([h, s, a0], i) => (
        <Box key={h} x={96 + i * 584} y={590} w={560} h={110} label={h} sub={s} fs={24} sfs={18} tone="pink" a={win(t, a0, 26, 0.5)} />
      ))}

      <Txt x={96} y={584} mono fs={17} color={PAL.ink3} a={fragA}>A HEAP LATER ON · A 2.5 MB ARRAY NEEDS 3 FREE REGIONS IN A ROW</Txt>
      {frag.map((ty, i) => <Cell key={i} x={96 + i * 108} y={620} w={100} h={70} tone={ty === 'O' ? 'blue' : null} a={fragA} glow={t > 27.5 && t < 32.5 && i >= probe && i < probe + 3 ? 0.9 : 0} />)}
      {t > 27.5 && t < 32.5 && <div style={{ position: 'absolute', left: 96 + probe * 108 - 4, top: 614, width: 3 * 108 + 0, height: 82, border: `2px solid ${PAL.violet}`, borderRadius: 8, boxSizing: 'border-box', opacity: fragA }}></div>}
      <Badge x={960} y={736} text="7 of 16 regions free, never 3 together → Full GC" tone="bad" a={win(t, 32.5, 38.3)} fs={18} solid />

      <Code x={96} y={600} w={840} h={170} lang="shell" title="the fixes" a={E(t, 38.5)} fs={19} lh={34} lines={['# fewer giant arrays (chunk them), or bigger regions:', '-XX:G1HeapRegionSize=4m', '# half a region = 2 MB > 1.5 MB → an ordinary object']} />
      <Cell x={1000} y={600} w={824} h={170} tone="flow" a={E(t, 45)} />
      <Txt x={1016} y={608} mono fs={17} color={PAL.ink3} a={E(t, 45)}>one 4 MB region · eden</Txt>
      <Box x={1040} y={650} w={300} h={80} label="report · 1.5 MB" fs={20} tone="violet" a={POP(t, 45.6)} />
      <Box x={1360} y={650} w={110} h={80} label="…" fs={20} tone="flow" a={E(t, 46)} />
      <Txt x={1490} y={668} fs={19} color={PAL.ink2} w={320} a={E(t, 46.4)}>just another young object</Txt>
    </React.Fragment>
  );
}
