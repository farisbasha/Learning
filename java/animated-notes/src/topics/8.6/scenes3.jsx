// 8.6 scenes, part 3: ZGC (coloured pointers, load barrier, a real cycle), Shenandoah, CMS.
const { PAL, MOTION, lin, lerp, win, pulse, step, track, hlAt, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Mark, Brace, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;
import { LogPanel, Lane, Legend } from './common.jsx';

// ── ZGC: coloured pointers (JDK 17 layout) ─────────────────────────────────
const GROUPS = [
  { from: 63, to: 46, name: 'unused · always 0', tone: 'dim', at: 6.5 },
  { from: 45, to: 45, name: 'F', tone: 'pink', at: 13.6 },
  { from: 44, to: 44, name: 'R', tone: 'green', at: 13.4 },
  { from: 43, to: 43, name: 'M1', tone: 'violet', at: 13.2 },
  { from: 42, to: 42, name: 'M0', tone: 'pull', at: 13 },
  { from: 41, to: 0, name: 'object address · 42 bits', tone: 'flow', at: 6.5 },
];
export function SZPointers({ t }) {
  const BW = 26, X0 = 128, Y = 266;
  const bx = (bit) => X0 + (63 - bit) * BW;
  const good = step(t, [[27, 'M0'], [29.5, 'R'], [32, 'M1']], 'M0');
  const tableA = win(t, 13, 40, 0.5);
  const mapA = win(t, 40, 47.6, 0.5);
  const ptrs = [
    { y: 640, label: 'recent[7]', col: 'M0', at: 33.5 },
    { y: 730, label: 'recent[9]', col: 'R', at: 34 },
  ];
  const colTone = { M0: 'pull', M1: 'violet', R: 'green' };
  return (
    <React.Fragment>
      <Txt x={X0} y={208} mono fs={18} color={PAL.ink3} a={E(t, 0.6)}>A 64-BIT REFERENCE UNDER ZGC · JDK 17 LAYOUT</Txt>
      {Array.from({ length: 64 }, (_, i) => {
        const bit = 63 - i;
        const g = GROUPS.find((q) => bit <= q.from && bit >= q.to);
        const c = toneColor(g.tone);
        const on = t > g.at;
        const isGood = g.name === good && t > 27;
        return <div key={i} style={{ position: 'absolute', left: bx(bit), top: Y, width: BW - 2, height: 60, boxSizing: 'border-box', borderRadius: 4, opacity: E(t, 0.8 + i * 0.02, 0.2), background: on ? hexA(c, g.tone === 'dim' ? 0.08 : isGood ? 0.6 : 0.25) : PAL.panel2, border: `1.5px solid ${on ? hexA(c, 0.8) : PAL.line2}`, boxShadow: isGood ? `0 0 16px ${hexA(c, 0.8)}` : 'none' }}></div>;
      })}
      {GROUPS.map((g) => {
        const x1 = bx(g.from), x2 = bx(g.to) + BW - 2;
        const single = g.from === g.to;
        return (
          <React.Fragment key={g.name}>
            <Txt x={(x1 + x2) / 2} y={Y + 18} anchor="mid" mono fs={single ? 17 : 19} weight={600} color={single ? PAL.ink : toneColor(g.tone === 'dim' ? 'ink' : g.tone)} a={E(t, g.at)}>{g.name}</Txt>
            <Txt x={x1} y={Y + 70} mono fs={17} color={PAL.ink3} a={E(t, g.at)}>{g.from}</Txt>
          </React.Fragment>
        );
      })}
      <Txt x={bx(0) + 4} y={Y + 70} mono fs={17} color={PAL.ink3} a={E(t, 6.5)}>0</Txt>
      <Brace x={bx(45)} y={Y + 100} w={4 * BW - 2} label="colour" tone="pull" a={E(t, 14)} fs={18} />

      <Table x={96} y={420} cols={[110, 200, 760]} head={['bit', 'name', 'meaning']} fs={20} rh={50} a={tableA}
        rows={[['42', 'Marked0', 'reached by marking in an even cycle'], ['43', 'Marked1', 'reached by marking in an odd cycle'], ['44', 'Remapped', 'known to point at the object\'s current copy'], ['45', 'Finalizable', 'reachable only through a finalizer']]}
        rowA={[0, 1, 2, 3].map((i) => E(t, 20 + i * 0.4))} colColors={[PAL.ink3, PAL.ink, PAL.ink2]}
        marks={{ 0: ['pull', good === 'M0' ? win(t, 27, 40) : 0], 1: ['violet', good === 'M1' ? win(t, 27, 40) : 0], 2: ['green', good === 'R' ? win(t, 27, 40) : 0] }} />
      <Box x={1260} y={420} w={564} h={140} label={`good colour: ${good === 'M0' ? 'Marked0' : good === 'M1' ? 'Marked1' : 'Remapped'}`} sub={good === 'R' ? 'set at Relocate Start' : 'set at Mark Start, alternating'} fs={26} sfs={18} tone={colTone[good]} a={E(t, 27) * tableA} glow={pulse(t, [27, 29.5, 32], 1.2)} />
      {ptrs.map((p) => {
        const ok = p.col === good;
        return (
          <React.Fragment key={p.label}>
            <Box x={96} y={p.y} w={300} h={70} label={p.label} fs={22} tone="ink" a={E(t, p.at) * tableA} />
            <Box x={420} y={p.y} w={180} h={70} label={p.col} sub="colour" fs={22} sfs={17} tone={colTone[p.col]} a={E(t, p.at) * tableA} />
            <Box x={620} y={p.y} w={400} h={70} label="address bits unchanged" fs={19} tone="flow" a={E(t, p.at) * tableA} />
            <Mark x={1060} y={p.y + 35} ok={ok} a={E(t, p.at + 0.4) * tableA} />
            <Txt x={1096} y={p.y + 22} fs={20} color={ok ? PAL.flow : PAL.bad} a={E(t, p.at + 0.4) * tableA}>{ok ? 'good: use it directly' : 'stale: must be checked and fixed'}</Txt>
          </React.Fragment>
        );
      })}

      {['Marked0 view', 'Marked1 view', 'Remapped view'].map((v, i) => (
        <React.Fragment key={v}>
          <Box x={96 + i * 380} y={440} w={340} h={90} label={v} sub="8192M of virtual addresses" fs={22} sfs={17} tone={['pull', 'violet', 'green'][i]} a={mapA} />
          <Arrow from={[266 + i * 380, 534]} to={[620, 650]} draw={M(t, 41 + i * 0.3, 0.6)} a={mapA} color={toneColor(['pull', 'violet', 'green'][i])} />
        </React.Fragment>
      ))}
      <Box x={330} y={654} w={580} h={90} label="the same physical memory: the 512 MB heap" fs={21} tone="flow" a={mapA} />
      <LogPanel x={1260} y={440} w={564} h={150} t={t} title="our run · ZGC startup" a={mapA} lines={[
        { s: 'Address Space Type: Contiguous/Unrestricted/Complete', plain: true },
        { s: 'Address Space Size: 8192M x 3 = 24576M', hl: 1 },
        { s: 'GC Workers: 2 (dynamic)', plain: true },
      ]} />
      <Txt x={1260} y={610} fs={19} color={PAL.ink2} w={564} a={mapA}>8192M is 16 × the heap, reserved once per colour, so any colour still points at the right bytes.</Txt>
      <Callout x={96} y={820} w={1728} tone="violet" a={E(t, 47.5)} fs={20} title="jdk 21+ · generational zgc" text="Colour bits moved to the **low** 16 bits of stored references, the triple mapping is gone, and stores get a barrier too (to track old → young pointers). The idea is the same: the reference itself says whether it can be trusted." />
    </React.Fragment>
  );
}

// ── ZGC: load barrier + concurrent relocation ──────────────────────────────
export function SZBarrier({ t }) {
  const [hl, hA] = hlAt(t, [[1, 0], [7, 4], [27, 4], [28.5, 5], [40, 6], [45.5, 5], [52, -1]]);
  const P1 = [980, 220], P2 = [1424, 220];
  const xP = track(t, [[14, 1000, 270], [15.4, 1444, 270]]);
  const yP = track(t, [[16, 1130, 340], [17.4, 1580, 270]]);
  const zP = track(t, [[46.5, 1250, 410], [48, 1444, 350]]);
  const healed = t > 39;
  const healed2 = t > 49.5;
  const p1free = t > 53;
  const fwd = [['X', 'P2 · slot 0', 15.4], ['Y', 'P2 · slot 1', 17.4], ['Z', 'P2 · slot 2', 48]];
  return (
    <React.Fragment>
      <Code x={96} y={200} w={820} h={292} fs={19} lh={32} title="a reference load, compiled" a={E(t, 0.5)} hl={hl} hlA={hA} lines={[
        'Order o = recent[7];         // a heap load',
        '',
        { s: '// what the JIT emits (JDK 17, simplified):', tone: 'violet', toneA: 1 },
        'ref = recent[7];',
        'if (ref & BAD_MASK)           // colour not good?',
        '    ref = slowPath(&recent[7], ref);',
        'o = ref;',
      ]} />
      <Box x={96} y={530} w={820} h={110} label="fast path: one test, one branch not taken" sub="the colour is good, which is almost every load" fs={22} sfs={18} tone="flow" a={win(t, 7, 26.8, 0.5)} />
      <Box x={96} y={530} w={820} h={110} label="slow path: find the current copy, then heal" sub="look it up in the forwarding table, or move the object yourself" fs={22} sfs={18} tone="pull" a={E(t, 27)} glow={pulse(t, [27.2], 1)} />
      <Callout x={96} y={670} w={820} tone="flow" a={E(t, 53)} fs={20} text="Relocation never stops the app: whoever touches a not-yet-moved object first moves it. Nobody waits for the whole page." />

      <Panel x={P1[0]} y={P1[1]} w={400} h={260} title={p1free ? 'page P1 · free' : 'page P1 · being emptied'} tone={p1free ? undefined : 'bad'} dashed={p1free} a={E(t, 13.5)} />
      <Panel x={P2[0]} y={P2[1]} w={400} h={260} title="page P2 · new copies" tone="green" a={E(t, 13.8)} />
      {!p1free && [[1000, 410, 110], [1130, 410, 100], [1260, 290, 100]].map(([x, y, w], i) => <div key={i} style={{ position: 'absolute', left: x, top: y, width: w, height: 50, borderRadius: 6, background: `repeating-linear-gradient(45deg, transparent 0 6px, ${hexA(PAL.ink3, 0.3)} 6px 8px)`, opacity: E(t, 13.6) }}></div>)}
      <Box x={xP[0]} y={xP[1]} w={110} h={50} label="X" fs={20} tone={t > 15.4 ? 'green' : 'pull'} a={E(t, 13.6)} />
      <Box x={yP[0]} y={yP[1]} w={110} h={50} label="Y" fs={20} tone={t > 17.4 ? 'green' : 'pull'} a={E(t, 13.6)} glow={pulse(t, [33, 38.5], 1)} />
      <Box x={zP[0]} y={zP[1]} w={110} h={50} label="Z" fs={20} tone={t > 48 ? 'green' : 'pull'} a={E(t, 13.6) * (p1free && t < 48 ? 0 : 1)} glow={pulse(t, [46.5], 1)} />
      {/* ghost old copies */}
      <Box x={1000} y={270} w={110} h={50} label="X" fs={20} tone="dim" dashed a={t > 15.4 && !p1free ? 0.5 : 0} />
      <Box x={1130} y={340} w={110} h={50} label="Y" fs={20} tone="dim" dashed a={t > 17.4 && !p1free ? 0.5 : 0} />
      <Badge x={1400} y={210} text="GC threads copy live objects · app keeps running" tone="green" a={win(t, 14, 26.5)} fs={17} />

      <Panel x={980} y={520} w={400} h={200} title="forwarding table · P1" right="off-heap" tone="violet" a={E(t, 20)} />
      {fwd.map(([o, to, at], i) => (
        <div key={o} style={{ position: 'absolute', left: 1000, top: 578 + i * 44, width: 360, height: 38, display: 'flex', alignItems: 'center', padding: '0 12px', boxSizing: 'border-box', borderRadius: 6, font: `500 19px ${MONO}`, color: PAL.ink, opacity: E(t, Math.max(at, 20.2)), background: (o === 'Y' && t > 33 && t < 39) || (o === 'Z' && t > 48 && t < 50) ? hexA(PAL.violet, 0.25) : 'transparent' }}>{o} → {to}</div>
      ))}

      <Box x={1424} y={520} w={400} h={110} label="recent[7]" sub={healed ? 'colour: good · → P2 · Y' : 'colour: stale · → P1 · Y'} fs={22} sfs={18} tone={healed ? 'green' : 'bad'} a={E(t, 26.5)} glow={pulse(t, [39], 1.2)} />
      <Box x={1424} y={650} w={400} h={70} label="recent[3]" sub={healed2 ? 'good · → P2 · Z' : 'stale · → P1 · Z'} fs={20} sfs={17} tone={healed2 ? 'green' : 'bad'} a={E(t, 45.5)} glow={pulse(t, [49.5], 1.2)} />
      <Arrow from={[1430, 540]} to={[1244, 392]} curve={30} draw={M(t, 27, 0.6)} a={healed ? 0 : 1} color={PAL.bad} dashed />
      <Arrow from={[1640, 518]} to={[1640, 324]} draw={M(t, 39, 0.6)} color={PAL.green} />
      <Badge x={1624} y={760} text="healed: the next load is fast" tone="green" a={win(t, 39.5, 45.3)} fs={17} />
      <Badge x={1624} y={760} text="app thread moves Z itself" tone="pull" a={win(t, 45.6, 53)} fs={17} />
      <Badge x={1180} y={760} text="P1 reused at once · only the table stays" tone="violet" a={E(t, 53.3)} fs={17} />
    </React.Fragment>
  );
}

// ── ZGC: one real cycle, and its costs ─────────────────────────────────────
export function SZCycle({ t }) {
  const T0 = 2.1455, T1 = 2.1565, LX = 330, LW = 1494;
  const X = (v) => LX + ((v - T0) / (T1 - T0)) * LW;
  // phase ends from the log (timestamps are rounded to 1 ms; durations are exact)
  const ph = [['MS', 2.146, 0.000004, 'stw'], ['Concurrent Mark', 2.146, 0.005087, 'conc'], ['ME', 2.151087, 0.000007, 'stw'], ['refs', 2.151094, 0.000168, 'conc'], ['Select Relocation Set', 2.151262, 0.001884, 'conc'], ['RS', 2.153146, 0.000006, 'stw'], ['Concurrent Relocate', 2.153152, 0.002903, 'conc']];
  const rev = lin(t, 1, 4);
  const gc = ph.filter((p) => p[3] === 'conc').map(([, s, d]) => [s, s + d, 'conc']);
  const app = [[T0, T1, 'run'], ...ph.filter((p) => p[3] === 'stw').map(([, s, d]) => [s, s + d, 'stw'])];
  const right1 = win(t, 18, 46.3, 0.5);
  return (
    <React.Fragment>
      <Txt x={96} y={212} mono fs={18} color={PAL.flow} a={E(t, 0.5)}>app thread</Txt>
      <Txt x={96} y={256} mono fs={18} color={PAL.violet} a={E(t, 0.7)}>ZGC threads</Txt>
      <Lane x={LX} y={206} w={LW} h={32} segs={app} t0={T0} t1={T1} reveal={rev} a={E(t, 0.5)} minW={3} />
      <Lane x={LX} y={250} w={LW} h={32} segs={gc} t0={T0} t1={T1} reveal={rev} a={E(t, 0.7)} />
      {[['Mark Start 0.004 ms', 2.146], ['Mark End 0.007 ms', 2.151087], ['Relocate Start 0.006 ms', 2.153146]].map(([l, at], i) => (
        <Txt key={l} x={X(at)} y={292} mono fs={17} color={PAL.bad} a={E(t, 5 + i * 0.6)}>▲ {l}</Txt>
      ))}
      <Txt x={1824} y={320} anchor="right" mono fs={17} color={PAL.ink3} a={E(t, 4)}>GC(20) · 1 GB heap · 10 ms shown · pauses drawn 3 px wide</Txt>

      <LogPanel x={96} y={356} w={930} h={294} t={t} a={E(t, 1)} title="gc.log · JDK 17 · abridged" lines={[
        { at: 1.2, s: '[2.146s][info][gc,phases] GC(20) Pause Mark Start 0.004ms', hl: win(t, 5, 12) },
        { at: 1.4, s: '[2.151s][info][gc,phases] GC(20) Concurrent Mark 5.087ms', hl: win(t, 12, 18) },
        { at: 1.6, s: '[2.151s][info][gc,phases] GC(20) Pause Mark End 0.007ms', hl: win(t, 5.6, 12) },
        { at: 1.8, s: '[2.151s][info][gc,phases] GC(20) Concurrent Process Non-Strong References 0.168ms' },
        { at: 2, s: '[2.153s][info][gc,phases] GC(20) Concurrent Select Relocation Set 1.884ms', hl: win(t, 12, 18) },
        { at: 2.2, s: '[2.153s][info][gc,phases] GC(20) Pause Relocate Start 0.006ms', hl: win(t, 6.2, 12) },
        { at: 2.4, s: '[2.156s][info][gc,phases] GC(20) Concurrent Relocate 2.903ms', hl: win(t, 12, 18) },
        { at: 2.6, s: '[2.156s][info][gc] GC(20) Garbage Collection (Allocation Rate) 612M(60%)->192M(19%)' },
      ]} />
      <Card x={1060} y={356} w={764} h={294} a={win(t, 18, 25, 0.5)} tone="violet" num="why so short" title="Pauses touch only roots: thread stacks and a few globals" sub="Not the heap. So they don't grow with it: about the same on 1 GB as on 16 TB (since JDK 16 even stacks are scanned concurrently)." tfs={27} sfs={21} />
      <Card x={1060} y={356} w={764} h={294} a={win(t, 25, 46.3, 0.5)} tone="pull" num="the price" title="CPU and headroom" sub="Barriers on every reference load, GC threads competing with yours, and spare heap: the app keeps allocating **during** the cycle." tfs={30} sfs={21} />
      <Table x={1060} y={356} cols={[110, 654]} head={['JDK', 'ZGC']} fs={19} rh={48} a={E(t, 46.5)}
        rows={[['15', 'production-ready (JEP 377)'], ['16', 'sub-ms pauses: concurrent stack scanning (JEP 376)'], ['21', 'generational mode, opt-in: -XX:+ZGenerational (JEP 439)'], ['23', 'generational by default (JEP 474)'], ['24', 'non-generational mode removed (JEP 490)']]}
        rowA={[0, 1, 2, 3, 4].map((i) => E(t, 46.8 + i * 0.5))} colColors={[PAL.pull, PAL.ink]} marks={{ 0: ['flow', 0.6] }} />

      <LogPanel x={96} y={680} w={930} h={160} t={t} a={E(t, 32)} title="512 MB heap · same workload" tone="bad" lines={[
        { at: 32.2, s: '[3.023s][info][gc] Allocation Stall (main) 6.329ms' },
        { at: 32.6, s: '[3.123s][info][gc] Allocation Stall (main) 6.661ms' },
        { at: 33.4, s: '276 stalls in 10 s · 605 ms total · worst 36.3 ms', plain: true },
      ]} />
      <Box x={1060} y={680} w={764} h={160} label="1 GB heap: 0 stalls" sub="longest pause 0.132 ms · the only change: headroom" fs={30} sfs={19} tone="flow" a={E(t, 40)} glow={pulse(t, [40], 1.2)} />
      <Callout x={96} y={864} w={1728} tone="violet" a={E(t, 54)} fs={20} text="Use ZGC when **p99 latency** matters more than throughput, and you can give it CPU and memory to spare." />
    </React.Fragment>
  );
}

// ── Shenandoah ─────────────────────────────────────────────────────────────
export function SShenandoah({ t }) {
  const T0 = 0.1848, T1 = 0.1906, LX = 330, LW = 1494;
  const X = (v) => LX + ((v - T0) / (T1 - T0)) * LW;
  const P = [['Init Mark', 0.18505, 0.000086], ['Final Mark', 0.18705, 0.00023], ['Init Update Refs', 0.18885, 0.000075], ['Final Update Refs', 0.19, 0.000084]];
  const C = [[0.18515, 0.18705], [0.1875, 0.18885], [0.1889, 0.19]];
  const rev = lin(t, 6, 5);
  const fwdA = win(t, 25, 48, 0.5);
  return (
    <React.Fragment>
      <Txt x={96} y={212} mono fs={18} color={PAL.flow} a={E(t, 0.5)}>app thread</Txt>
      <Txt x={96} y={256} mono fs={18} color={PAL.violet} a={E(t, 0.7)}>Shenandoah</Txt>
      <Lane x={LX} y={206} w={LW} h={32} segs={[[T0, T1, 'run'], ...P.map(([, s, d]) => [s, s + d, 'stw'])]} t0={T0} t1={T1} reveal={rev} a={E(t, 0.5)} minW={4} />
      <Lane x={LX} y={250} w={LW} h={32} segs={C.map(([a, b]) => [a, b, 'conc'])} t0={T0} t1={T1} reveal={rev} a={E(t, 0.7)} />
      {P.map(([l, s], i) => <Txt key={l} x={X(s) + (i === 3 ? 6 : 0)} y={i % 2 ? 318 : 292} anchor={i === 3 ? 'right' : undefined} mono fs={17} color={PAL.bad} a={E(t, 12.5 + Math.floor(i / 2) * 6.5)}>{i === 3 ? `${l} ▲` : `▲ ${l}`}</Txt>)}
      <Txt x={X(0.186)} y={292} mono fs={17} color={PAL.violet} a={E(t, 13)}>mark</Txt>
      <Txt x={X(0.1879)} y={318} mono fs={17} color={PAL.violet} a={E(t, 15)}>evacuate</Txt>

      <LogPanel x={96} y={370} w={930} h={294} t={t} a={E(t, 5.5)} title="gc.log · JDK 17 · GC(2) · abridged" lines={[
        { at: 6, s: '[0.185s][info][gc] GC(2) Pause Init Mark (unload classes) 0.086ms', hl: win(t, 12.5, 19) },
        { at: 6.3, s: '[0.187s][info][gc] GC(2) Concurrent marking (unload classes) 0.955ms' },
        { at: 6.6, s: '[0.187s][info][gc] GC(2) Pause Final Mark (unload classes) 0.230ms', hl: win(t, 12.5, 19) },
        { at: 6.9, s: '[0.189s][info][gc] GC(2) Concurrent evacuation 0.854ms', hl: win(t, 15, 19) },
        { at: 7.2, s: '[0.189s][info][gc] GC(2) Pause Init Update Refs 0.075ms', hl: win(t, 19, 25) },
        { at: 7.5, s: '[0.189s][info][gc] GC(2) Concurrent update references 0.682ms', hl: win(t, 19, 25) },
        { at: 7.8, s: '[0.190s][info][gc] GC(2) Pause Final Update Refs 0.084ms', hl: win(t, 19, 25) },
        { at: 8.1, s: '[0.190s][info][gc] GC(2) Concurrent cleanup 135M->17M(512M) 0.054ms' },
      ]} />
      <LogPanel x={1060} y={370} w={764} h={120} t={t} a={win(t, 1, 25, 0.5)} title="startup" lines={[
        { s: '[0.009s][info][gc,init] Mode: Snapshot-At-The-Beginning (SATB)' },
        { s: '[0.009s][info][gc,init] Heuristics: Adaptive' },
      ]} />
      <Txt x={1060} y={510} fs={20} color={PAL.ink2} w={764} a={win(t, 2, 25, 0.5)}>Same marking idea as G1: SATB. The difference is what comes next: Shenandoah also **moves** objects concurrently.</Txt>

      {/* forwarding: then and now */}
      <Txt x={1060} y={370} mono fs={17} color={PAL.ink3} a={fwdA}>JDK 12 · BROOKS POINTER</Txt>
      <Box x={1060} y={404} w={170} h={64} label="fwd ptr" fs={18} tone="pink" a={fwdA} />
      <Box x={1230} y={404} w={170} h={64} label="header" fs={18} tone="ink" a={fwdA} />
      <Box x={1400} y={404} w={200} h={64} label="fields…" fs={18} tone="ink" a={fwdA} />
      <Txt x={1620} y={414} fs={19} color={PAL.ink2} w={200} a={fwdA}>+1 word on every object</Txt>
      <Txt x={1060} y={510} mono fs={17} color={PAL.ink3} a={E(t, 33) * fwdA}>JDK 13+ · FORWARDING IN THE HEADER</Txt>
      <Box x={1060} y={544} w={260} h={64} label="old copy: header" sub="holds → new copy" fs={18} sfs={17} tone="bad" a={E(t, 33) * fwdA} />
      <Arrow from={[1324, 576]} to={[1476, 576]} draw={M(t, 34, 0.5)} a={fwdA} color={PAL.green} />
      <Box x={1480} y={544} w={344} h={64} label="new copy: header · fields" fs={18} tone="green" a={E(t, 34.2) * fwdA} />
      <Txt x={1060} y={624} fs={19} color={PAL.ink2} w={764} a={E(t, 35) * fwdA}>A **load-reference barrier** follows it, so the app only ever sees the new copy.</Txt>

      <Box x={96} y={700} w={560} h={130} label="generational mode" sub="JDK 24 experimental · JDK 25 product" fs={24} sfs={18} tone="violet" a={E(t, 40.5)} />
      <Box x={680} y={700} w={560} h={130} label="not the default" sub="-XX:ShenandoahGCMode=generational" fs={24} sfs={18} tone="pull" a={E(t, 42)} />
      <Box x={1264} y={700} w={560} h={130} label="in most OpenJDK builds" sub="not in Oracle's JDK · yes in this Homebrew 17" fs={24} sfs={18} tone="flow" a={E(t, 43.5)} />
    </React.Fragment>
  );
}

// ── CMS, and other dead flags ──────────────────────────────────────────────
export function SCMS({ t }) {
  const yrs = [[2, 'Java 8', '2014', 'CMS widely used', 'ink'], [6, 'Java 9', '2017', 'CMS deprecated (JEP 291) · G1 default', 'pull'], [8, 'Java 14', '2020', 'CMS removed (JEP 363)', 'bad']];
  return (
    <React.Fragment>
      <div style={{ position: 'absolute', left: 120, top: 268, width: 760, height: 4, background: PAL.line2, opacity: E(t, 1) }}></div>
      {yrs.map(([at, j, y, what, tone], i) => (
        <React.Fragment key={j}>
          <Dot x={140 + i * 340} y={270} r={11} color={toneColor(tone)} a={POP(t, at)} />
          <Txt x={140 + i * 340} y={214} anchor="mid" mono fs={22} weight={600} color={PAL.ink} a={E(t, at)}>{j}</Txt>
          <Txt x={140 + i * 340} y={292} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, at)}>{y}</Txt>
          <Txt x={140 + i * 340} y={322} anchor="mid" fs={18} color={toneColor(tone)} w={300} align="center" a={E(t, at + 0.3)}>{what}</Txt>
        </React.Fragment>
      ))}
      <Card x={96} y={430} w={800} h={250} a={E(t, 6.5)} tone="bad" num="dead flags you will still meet" title="-XX:+UseConcMarkSweepGC · -XX:+UseParNewGC · -XX:CMSInitiatingOccupancyFraction=70" tfs={24} />
      <Callout x={96} y={710} w={800} tone="pull" a={E(t, 32.5)} fs={20} title="check the date" text="Mentions **PermGen**? Written before Java 8. Mentions **CMS**? Java 8 or older. Either way, not for your JVM." />

      <Console x={960} y={196} w={864} h={700} t={t} a={E(t, 12)} fs={17} lh={30} title="terminal · JDK 17" items={[
        { at: 12.5, text: 'java -XX:+UseConcMarkSweepGC -version', kind: 'cmd' },
        { at: 13.2, text: "Unrecognized VM option 'UseConcMarkSweepGC'", kind: 'err' },
        { at: 13.4, text: 'Error: Could not create the Java Virtual Machine.', kind: 'err' },
        { at: 19, text: 'java -XX:+UseParNewGC -version', kind: 'cmd' },
        { at: 19.6, text: "Unrecognized VM option 'UseParNewGC'", kind: 'err' },
        { at: 21.5, text: 'java -XX:+PrintGCDateStamps -version', kind: 'cmd' },
        { at: 22.1, text: "Unrecognized VM option 'PrintGCDateStamps'", kind: 'err' },
        { at: 25.5, text: 'java -XX:+PrintGCDetails -version', kind: 'cmd' },
        { at: 26.1, text: '[0.002s][warning][gc] -XX:+PrintGCDetails is', kind: 'ok' },
        { at: 26.2, text: '  deprecated. Will use -Xlog:gc* instead.', kind: 'ok' },
        { at: 27, text: '[0.011s][info   ][gc] Using G1', kind: 'dim' },
      ]} />
    </React.Fragment>
  );
}
