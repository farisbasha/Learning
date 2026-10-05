// 8.6 scenes, part 4: side by side, reading GC logs, tuning, choosing, traps, recap.
const { PAL, MOTION, lin, lerp, win, pulse, step, track, hlAt, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Mark, Brace, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;
import { LogPanel, Lane, Legend } from './common.jsx';
import { ROWS } from './scenes1.jsx';
import { LEAK } from './data.jsx';

// ── Side by side ───────────────────────────────────────────────────────────
const STATS = [
  ['Serial', '270', '1,019 ms', '140.6 ms', '—'],
  ['Parallel', '268', '434 ms', '13.4 ms', '—'],
  ['G1', '245', '675 ms', '53.0 ms', '—'],
  ['ZGC · 512 MB', '547', '3.2 ms', '0.015 ms', '276 · 605 ms'],
  ['ZGC · 1 GB', '301', '2.2 ms', '0.132 ms', '0'],
  ['Shenandoah', '484', '79.6 ms', '27.6 ms', '—'],
];
export function SSideBySide({ t }) {
  const LX = 330, LW = 1494;
  const focusAt = [6, 12.5, 18, 24.5, 32, 38];
  const cur = focusAt.filter((x) => t >= x).length - 1;
  return (
    <React.Fragment>
      {ROWS.map((r, i) => {
        const on = t < 44 && cur === i;
        return (
          <React.Fragment key={r.name}>
            <Txt x={96} y={218 + i * 54} mono fs={20} weight={600} color={on ? PAL.pull : PAL.ink} a={E(t, 0.6 + i * 0.2)}>{r.name}</Txt>
            <Lane x={LX} y={212 + i * 54} w={LW} h={34} segs={r.segs} t0={3} t1={4} a={E(t, 0.6 + i * 0.2) * (t < 44 && cur >= 0 && !on ? 0.45 : 1)} reveal={lin(t, 1 + i * 0.2, 4)} />
          </React.Fragment>
        );
      })}
      {Array.from({ length: 11 }, (_, k) => (
        <React.Fragment key={k}>
          <div style={{ position: 'absolute', left: LX + k * LW / 10, top: 540, width: 1, height: 10, background: PAL.ink3, opacity: E(t, 1) }}></div>
          <Txt x={LX + k * LW / 10} y={554} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 1)}>{(3 + k / 10).toFixed(1)}s</Txt>
        </React.Fragment>
      ))}
      <Legend x={LX} y={592} a={E(t, 2)} items={[['stw', 'app stopped (pause)'], ['conc', 'GC working alongside'], ['stall', 'app waiting for memory']]} />
      <Badge x={LX + ((3.1991 + 0.07 - 3) * LW)} y={196} text="Serial · Pause Full · 139.855 ms" tone="bad" a={win(t, 6.5, 12.3)} fs={17} />

      <Table x={96} y={640} cols={[230, 130, 190, 170, 220]} head={['10-second run', 'pauses', 'total paused', 'longest', 'stalls']} rows={STATS} fs={18} rh={40} a={E(t, 44)}
        rowA={STATS.map((_, i) => E(t, 44.3 + i * 0.4))} marks={{ 3: ['pull', E(t, 46.5)], 0: ['bad', E(t, 46)] }} colColors={[PAL.ink, PAL.ink2, PAL.ink, PAL.bad, PAL.pull]} />
      <Callout x={1080} y={640} w={744} tone="ink" a={E(t, 45)} fs={19} text="One run each on a busy 8-core laptop, JDK 17. Indicative, not a benchmark. Counted from the `-Xlog:gc*` files." />
      <Callout x={1080} y={760} w={744} tone="pull" a={E(t, 51)} fs={21} title="no free lunch" text="Serial: the longest stop. ZGC at 512 MB: the tiniest pauses, yet its stalls cost the app **more** time than all of Parallel's pauses." />
    </React.Fragment>
  );
}

// ── Reading a GC log line ──────────────────────────────────────────────────
const LINE = '[2.822s][info][gc] GC(45) Pause Young (Concurrent Start) (G1 Humongous Allocation) 330M->243M(512M) 2.051ms';
const TOKS = [
  [[['[2.822s]', 'uptime', 'ink', 5], ['[info]', 'level', 'ink', 6], ['[gc]', 'tags', 'violet', 7], ['GC(45)', 'collection #', 'pull', 12], ['Pause Young (Concurrent Start)', 'what kind of pause', 'bad', 18]], 286],
  [[['(G1 Humongous Allocation)', 'why: the cause', 'pink', 20.5], ['330M', 'used before', 'flow', 25.5], ['->', '', 'dim', 26], ['243M', 'used after', 'flow', 26.8], ['(512M)', 'heap committed', 'blue', 28], ['2.051ms', 'app stopped', 'bad', 32]], 446],
];
const XLOG = [['-Xlog:', '', 'dim'], ['gc*', 'what: tags (+level)', 'violet'], [':', '', 'dim'], ['file=gc.log', 'where', 'flow'], [':', '', 'dim'], ['time,uptime,level,tags', 'decorations', 'pull']];
function TokenRow({ t, y, toks, fade = 1 }) {
  const ws = toks.map(([s, m]) => Math.max(s.length * 15.6 + 28, m ? m.length * 10.4 + 20 : 0, 40));
  const W = ws.reduce((a, b) => a + b, 0) + (toks.length - 1) * 18;
  let x = 960 - W / 2;
  return toks.map(([s, m, tone, at], j) => {
    const w = ws[j], x0 = x;
    x += w + 18;
    const a = E(t, at == null ? 0 : at, 0.5) * fade;
    const c = toneColor(tone);
    return (
      <React.Fragment key={j}>
        <div style={{ position: 'absolute', left: x0, top: y, width: w, height: 70, boxSizing: 'border-box', borderRadius: 10, opacity: a, transform: `translateY(${(1 - a) * -24}px)`, background: tone === 'dim' ? 'transparent' : hexA(c, 0.12), border: tone === 'dim' ? 'none' : `2px solid ${hexA(c, 0.8)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 26px ${MONO}`, color: tone === 'dim' ? PAL.ink2 : PAL.ink, whiteSpace: 'nowrap' }}>{s}</div>
        {m && <Txt x={x0 + w / 2} y={y + 80} anchor="mid" mono fs={18} color={c} a={a}>{m}</Txt>}
      </React.Fragment>
    );
  });
}
export function SLogLine({ t }) {
  return (
    <React.Fragment>
      <LogPanel x={96} y={196} w={1728} h={84} t={t} a={E(t, 0.5)} title="our G1 run · one line" lines={[{ s: LINE }]} />
      {TOKS.map(([toks, y], i) => <TokenRow key={i} t={t} y={y + 20} toks={toks} fade={1 - 0.5 * E(t, 37.5)} />)}
      <TokenRow t={t} y={640} toks={XLOG.map(([s, m, tone]) => [s, m, tone, 38])} />
      <LogPanel x={96} y={790} w={1728} h={84} t={t} a={E(t, 45)} title="-Xlog:gc:file=dec.log:time,uptime,level,tags · same program" tone="pull" lines={[{ s: '[2026-10-05T12:14:01.874+0530][0.045s][info][gc] GC(0) Pause Young (Normal) (G1 Evacuation Pause) 27M->3M(512M) 1.797ms' }]} />
    </React.Fragment>
  );
}

// ── What to look for ───────────────────────────────────────────────────────
export function SLogSignals({ t }) {
  const PX0 = 180, PX1 = 1070, PY0 = 600, PY1 = 250;
  const px = (s) => PX0 + (s / 8.8) * (PX1 - PX0), py = (mb) => PY0 - (mb / 512) * (PY0 - PY1);
  const shownUntil = t < 11.5 ? -1 : lerp(0, 8.8, lin(t, 12, 22));
  const pts = LEAK.filter((p) => p[0] <= shownUntil);
  const leakA = win(t, 11.5, 46, 0.5);
  const notes = [[1.04, 80], [3.13, 249], [5.12, 398], [6.75, 504]];
  return (
    <React.Fragment>
      <Panel x={96} y={196} w={1010} h={444} title="after-GC heap · Orders with the leak · G1 · 512 MB" tone="bad" a={E(t, 11.5)} />
      <svg width="1920" height="1080" style={{ position: 'absolute', left: 0, top: 0, opacity: E(t, 11.8) }}>
        <line x1={PX0} y1={PY0} x2={PX1} y2={PY0} stroke={PAL.line2} strokeWidth="2" />
        <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} stroke={PAL.line2} strokeWidth="2" />
        <line x1={PX0} y1={py(512)} x2={PX1} y2={py(512)} stroke={hexA(PAL.bad, 0.6)} strokeWidth="2" strokeDasharray="8 6" />
        {pts.length > 1 && <polyline points={pts.map((p) => `${px(p[0])},${py(p[1])}`).join(' ')} fill="none" stroke={PAL.flow} strokeWidth="3" />}
        {pts.map((p, i) => <circle key={i} cx={px(p[0])} cy={py(p[1])} r={p[2] === 'F' ? 5 : 4} fill={p[2] === 'F' ? PAL.bad : PAL.flow} />)}
      </svg>
      <Txt x={PX0 - 12} y={py(512) - 12} anchor="right" mono fs={17} color={PAL.bad} a={E(t, 12)}>512M</Txt>
      <Txt x={PX0 - 12} y={PY0 - 12} anchor="right" mono fs={17} color={PAL.ink3} a={E(t, 12)}>0</Txt>
      <Txt x={PX1} y={PY0 + 10} anchor="right" mono fs={17} color={PAL.ink3} a={E(t, 12)}>8.8 s</Txt>
      {notes.map(([s, mb], i) => <Txt key={i} x={px(s) + 8} y={py(mb) + 4} mono fs={17} color={PAL.flow} a={E(t, 12 + (s / 8.8) * 22 + 0.3)}>{mb}M</Txt>)}
      <Txt x={px(7.3)} y={py(512) + 14} anchor="mid" mono fs={17} color={PAL.bad} a={E(t, 31.5)}>Full GC × 129</Txt>
      <Txt x={px(8.4)} y={py(300)} anchor="mid" mono fs={18} weight={600} color={PAL.bad} a={E(t, 34)}>OOM</Txt>

      {[['big drop · healthy', '444M->241M: most of it died young', 'flow', 5], ['small drop · live set growing', '473M->451M: survivors pile up', 'pull', 25], ['Pause Full, again and again', '509M->502M … 509M->509M', 'bad', 31.5], ['pause ≫ GC work', 'check the time to safepoint', 'violet', 46]].map(([h, s, tone, a0], i) => (
        <Box key={h} x={1140} y={196 + i * 112} w={684} h={100} label={h} sub={s} fs={23} sfs={18} tone={tone} align="left" a={E(t, a0)} glow={win(t, a0, a0 + 5) * 0.7} />
      ))}

      <LogPanel x={96} y={660} w={1728} h={84} t={t} a={win(t, 5, 11.3, 0.5)} title="our healthy G1 run" lines={[{ s: '[2.800s][info][gc] GC(44) Pause Young (Normal) (G1 Evacuation Pause) 444M->241M(512M) 2.261ms', hl: 1, tone: 'flow' }]} />
      <LogPanel x={96} y={660} w={1728} h={234} t={t} a={leakA} title="the leak run · abridged" tone="bad" lines={[
        { at: 13, s: '[0.958s][info][gc] GC(11) Pause Young (Normal) (G1 Evacuation Pause) 353M->73M(512M) 4.945ms' },
        { at: 20, s: '[3.946s][info][gc] GC(63) Pause Young (Normal) (G1 Evacuation Pause) 446M->313M(512M) 1.866ms' },
        { at: 25, s: '[5.939s][info][gc] GC(215) Pause Young (Normal) (G1 Evacuation Pause) 473M->451M(512M) 1.585ms', hl: win(t, 25, 31.5) },
        { at: 31.5, s: '[6.868s][info][gc] GC(442) Pause Full (G1 Compaction Pause) 509M->502M(512M) 9.532ms', hl: win(t, 31.5, 39), tone: 'bad' },
        { at: 33, s: '[8.717s][info][gc] GC(933) Pause Full (G1 Compaction Pause) 509M->509M(512M) 24.157ms', tone: 'bad' },
        { at: 34, s: 'Exception: java.lang.OutOfMemoryError thrown from the UncaughtExceptionHandler in thread "main"', plain: true },
      ]} />
      <LogPanel x={96} y={660} w={1728} h={144} t={t} a={E(t, 46.3)} title="-Xlog:gc,safepoint · healthy run · long line wrapped" tone="violet" lines={[
        { s: '[0.032s][info][gc] GC(0) Pause Young (Normal) (G1 Evacuation Pause) 27M->3M(512M) 1.586ms' },
        { s: '[0.032s][info][safepoint] Safepoint "G1CollectForAllocation", Time since last: 19156875 ns,', plain: true },
        { s: '    Reaching safepoint: 2542 ns, Cleanup: 2167 ns, At safepoint: 1659833 ns, Total: 1664542 ns', hl: win(t, 53.5, 60), tone: 'violet' },
      ]} />
      <Callout x={96} y={824} w={1728} tone="violet" a={E(t, 53.5)} fs={20} text="2.5 µs to stop every thread, 1.66 ms stopped. If reaching the safepoint took longer than the GC itself, the culprit is a thread that won't stop (8.5)." />
    </React.Fragment>
  );
}

// ── The tuning rule ────────────────────────────────────────────────────────
const EDEN_T = [['GC(0)', 55], ['GC(44)', 201], ['GC(47)', 9], ['GC(48)', 24], ['GC(50)', 288], ['GC(51)', 281]];
const STEPS = [
  [25.5, 'Is it actually GC?', 'read -Xlog:gc*; check safepoints'],
  [31.5, 'Is the heap big enough?', 'the most common real fix'],
  [36.5, 'Is there a leak?', 'heap dump (8.9), after-GC size'],
  [39.5, 'Is the app over-allocating?', 'profile allocations'],
  [43.5, 'Only now: another collector', 'one flag at a time, measure'],
];
export function STuning({ t }) {
  const BX = 1180, BY = 560, BH = 260, BW = 90;
  const flat = win(t, 19.5, 25.3, 0.5);
  return (
    <React.Fragment>
      <Code x={96} y={200} w={1020} h={170} lang="shell" title="the whole tuning" a={E(t, 4.5)} fs={20} lh={34} lines={[
        { s: '-Xms4g -Xmx4g               # fixed heap: no resize pauses', at: 4.7, cps: 90 },
        { s: '-XX:MaxGCPauseMillis=200    # G1 only: the pause goal', at: 6, cps: 90 },
        { s: '-Xlog:gc*:file=gc.log       # so you can see what happens', at: 7.3, cps: 90 },
      ]} />
      {STEPS.map(([at, h, s], i) => (
        <React.Fragment key={h}>
          <Box x={96} y={404 + i * 92} w={1020} h={80} align="left" label={`${i + 1}.  ${h}`} sub={s} fs={23} sfs={18} tone={i === 4 ? 'pull' : i === 1 ? 'flow' : 'ink'} a={E(t, at)} glow={win(t, at, at + 4) * 0.6} />
        </React.Fragment>
      ))}

      <Panel x={1160} y={200} w={664} h={656} title="G1 resizing eden by itself" right="our run" a={E(t, 11.5)} />
      <Txt x={1184} y={262} fs={19} color={PAL.ink2} w={620} a={E(t, 11.8)}>Target eden size (regions) after each pause, from `Eden regions: a->b(target)`:</Txt>
      {EDEN_T.map(([g, v], i) => {
        const h = (v / 288) * BH * M(t, 12.5 + i * 0.5, 0.7);
        const hf = (100 / 288) * BH;
        return (
          <React.Fragment key={g}>
            <div style={{ position: 'absolute', left: BX + 22 + i * 104, top: BY + 220 - h, width: BW, height: h, borderRadius: '6px 6px 0 0', background: hexA(PAL.flow, 0.7), opacity: 1 - flat * 0.75 }}></div>
            <div style={{ position: 'absolute', left: BX + 22 + i * 104, top: BY + 220 - hf, width: BW, height: hf, borderRadius: '6px 6px 0 0', border: `2px dashed ${PAL.bad}`, boxSizing: 'border-box', opacity: flat }}></div>
            <Txt x={BX + 22 + i * 104 + BW / 2} y={BY + 220 - h - 28} anchor="mid" mono fs={18} color={PAL.ink} a={E(t, 13 + i * 0.5) * (1 - flat)}>{v}</Txt>
            <Txt x={BX + 22 + i * 104 + BW / 2} y={BY + 232} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 12.5)}>{g}</Txt>
          </React.Fragment>
        );
      })}
      <Badge x={1492} y={BY + 290} text="pin it (e.g. -Xmn) and G1 stops adapting" tone="bad" a={flat} fs={17} />
      <Card x={1160} y={200} w={664} h={656} a={E(t, 49.5)} tone="pull" num="in a container" title="Set -Xmx yourself" sub="Without it, the heap defaults to a quarter of the container's memory limit: `MaxRAMPercentage = 25`. That surprises more teams than any collector choice." tfs={34} sfs={23} glow={win(t, 49.5, 56) * 0.6} />
    </React.Fragment>
  );
}

// ── Choosing ───────────────────────────────────────────────────────────────
const CHOICE = [
  [3.5, 'Almost everything', 'G1 · the default · change nothing', 'flow'],
  [8.5, 'Strict p99 latency, big heap, spare CPU', 'ZGC', 'violet'],
  [14.5, 'Batch / ETL: only total run time matters', 'Parallel', 'pull'],
  [20, 'One CPU, tiny heap, short CLI tool', 'Serial', 'ink'],
  [25.5, 'A blog post told you to use CMS', 'it no longer exists', 'bad'],
];
export function SChoosing({ t }) {
  return (
    <React.Fragment>
      {CHOICE.map(([at, sit, gc, tone], i) => (
        <React.Fragment key={sit}>
          <Box x={96} y={200 + i * 120} w={620} h={100} label={sit} fs={21} mono={false} align="left" tone="ink" a={E(t, at)} style={{ whiteSpace: 'normal' }} />
          <HArrow x1={728} x2={790} y={250 + i * 120} a={E(t, at + 0.4)} color={toneColor(tone)} />
          <Box x={800} y={200 + i * 120} w={380} h={100} label={gc} fs={i === 0 ? 20 : 26} tone={tone} a={E(t, at + 0.5)} glow={i === 0 ? win(t, 4, 30) * 0.7 : 0} strike={i === 4} />
        </React.Fragment>
      ))}
      <Console x={1230} y={200} w={594} h={300} t={t} a={E(t, 31)} fs={17} lh={30} title="JDK 17 · first line only" items={[
        { at: 31.5, text: 'java -Xlog:gc -version', kind: 'cmd' },
        { at: 32.2, text: '[0.004s][info][gc] Using G1', kind: 'ok' },
        { at: 37.5, text: 'java -XX:ActiveProcessorCount=1 \\', kind: 'cmd' },
        { at: 37.6, text: '     -Xlog:gc -version' },
        { at: 38.3, text: '[0.004s][info][gc] Using Serial', kind: 'err' },
      ]} />
      <Callout x={1230} y={524} w={594} tone="ink" a={E(t, 39)} fs={19} text="JDK 9 to 26 pick Serial when the machine is not “server class”: fewer than 2 CPUs, or under about 1.8 GB of memory." />
      <Card x={1230} y={700} w={594} h={150} a={E(t, 45)} tone="flow" num="jdk 27 · jep 523" title="G1 is the default everywhere" tfs={28} glow={win(t, 45, 50) * 0.6} />
    </React.Fragment>
  );
}

// ── Traps ──────────────────────────────────────────────────────────────────
const TRAPS = [
  [3, '“These GC flags from a blog will help”', 'Usually CMS or Parallel advice for Java 8. Check the date.'],
  [9, '“MaxGCPauseMillis is a guarantee”', "It's a goal. Too low, and G1 shrinks eden and collects constantly."],
  [16, '“ZGC is strictly better”', 'Tiny pauses, paid in CPU and headroom: 276 stalls at 512 MB.'],
  [23, '“Tuning GC will fix my leak”', 'The leak run reached Full GC after Full GC, then OOM. Fix the code.'],
  [30, '“More flags = better tuned”', 'Each flag switches off adaptation. Heap size, pause goal, logging.'],
];
export function STraps({ t }) {
  return TRAPS.map(([at, myth, real], i) => {
    const y = 196 + i * 142;
    return (
      <React.Fragment key={i}>
        <Box x={96} y={y} w={720} h={120} label={myth} mono={false} fs={23} tone="bad" a={E(t, at)} strike={t > at + 2} style={{ whiteSpace: 'normal' }} />
        <HArrow x1={830} x2={900} y={y + 60} a={E(t, at + 1.5)} color={PAL.flow} />
        <Card x={916} y={y} w={908} h={120} a={E(t, at + 1.6)} tone="flow" title={real} tfs={23} />
      </React.Fragment>
    );
  });
}

// ── Recap ──────────────────────────────────────────────────────────────────
const RECAP = [
  [2.5, '1', 'Serial · Parallel', 'Stop-the-world, generational. One thread for footprint; many for throughput.'],
  [7.5, '2', 'G1 · the default', 'Regions, remembered sets, SATB marking, mixed collections under a pause goal.'],
  [13, '3', 'ZGC', 'Coloured pointers + load barriers: relocation while you run. Needs headroom.'],
  [18.5, '4', 'Shenandoah · CMS', 'Shenandoah: concurrent evacuation. CMS: removed in 14; its advice is dead.'],
  [23.5, '5', 'Read the log', '`before->after(heap) pause`. Creeping after-size means a leak.'],
  [28.5, '6', 'The tuning rule', 'Heap size + pause goal + `-Xlog:gc*`. Measure. Nothing else without evidence.'],
];
export function SRecap({ t }) {
  return RECAP.map(([at, n, title, sub], i) => <Card key={n} x={96 + (i % 3) * 584} y={210 + Math.floor(i / 3) * 300} w={560} h={276} num={n} title={title} sub={sub} tfs={34} sfs={24} a={E(t, at)} tone={i === 5 ? 'pull' : undefined} glow={i === 5 ? win(t, 29, 40) : 0} />);
}
