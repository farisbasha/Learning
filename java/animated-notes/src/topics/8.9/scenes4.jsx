// 8.9 scenes, part 4: PrintFlagsFinal, JMX, native memory tracking, the triage playbook, traps, recap.
const { PAL, MOTION, lin, lerp, win, pulse, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, HArrow, VArrow, Arrow, Card, Badge, Callout, Table, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;
import { Term } from './kit89.jsx';
import { FLAGS_OUT, FLAGS_XMX, MANAGEABLE, VMFLAGS_OUT, WATCH_OUT, NMT, SETFLAG_OUT, SETFLAG_BAD, AGENT_STATUS } from './data.jsx';

const ORIG = { '{ergonomic}': 'pull', '{default}': 'dim', '{command line}': 'flow', '{manageable}': 'violet' };
const flagParts = (l, on = true) => {
  const out = [];
  let rest = l;
  const re = /\{[a-z0-9_ ]+\}/g;
  let m, last = 0;
  while ((m = re.exec(l))) { out.push([l.slice(last, m.index), null]); out.push([m[0], on && ORIG[m[0]] ? ORIG[m[0]] : 'dim']); last = m.index + m[0].length; }
  out.push([l.slice(last), null]);
  return out;
};

// ── PrintFlagsFinal ────────────────────────────────────────────────────────
export function SFlags({ t }) {
  const L = FLAGS_OUT[1];
  const cx = (s) => 96 + 18 + (L.indexOf(s) + s.length / 2) * 10.2;
  const cols = [['size_t', 'type'], ['MaxHeapSize', 'flag'], ['2147483648', 'final value'], ['{product}', 'kind'], ['{ergonomic}', 'origin']];
  const lines = [
    { k: 'cmd', s: 'java -XX:+PrintFlagsFinal -version | grep -E "InitialHeapSize|MaxHeapSize|MaxRAMPercentage|ThreadStackSize|UseCompressedOops|UseG1GC"', at: 1 },
    ...FLAGS_OUT.map((l, i) => ({ parts: flagParts(l, t > 12.5), at: 2 + i * 0.2, tone: i === 1 ? 'pull' : i === 2 ? 'violet' : undefined, toneA: i === 1 ? win(t, 12.5, 26.5) : i === 2 ? win(t, 19, 26.5) : 0 })),
    { s: '' },
    { k: 'cmd', s: 'java -Xmx512m -XX:+PrintFlagsFinal -version | grep MaxHeapSize', at: 26.5 },
    { parts: flagParts(FLAGS_XMX), at: 27.2, tone: 'flow', toneA: E(t, 27.2) },
  ];
  const orig = [['{default}', 'the built-in default', 'ink'], ['{ergonomic}', 'the JVM chose it, from the machine', 'pull'], ['{command line}', 'you set it', 'flow']];
  return (
    <React.Fragment>
      <Term x={96} y={190} w={1728} h={44 + 20 + lines.length * 27} t={t} a={E(t, 0.4)} title="every flag, its final value, and where it came from" right="JDK 17 · 543 lines unfiltered" lines={lines} />
      {cols.map(([s, lab], i) => <Txt key={s} x={cx(s)} y={530} anchor="mid" mono fs={18} color={i === 4 ? PAL.pull : PAL.ink2} a={E(t, 6.5 + i * 0.5)}>↑ {lab}</Txt>)}
      {orig.map(([l, s, tone], i) => <Box key={l} x={96 + i * 584} y={580} w={560} h={86} label={l} sub={s} tone={tone} fs={22} sfs={18} a={E(t, 12.5 + i * 0.5)} glow={i === 2 ? pulse(t, [27.2], 1.2) : i === 1 ? win(t, 12.5, 19) * 0.7 : 0} />)}
      <Box x={96} y={700} w={1728} h={84} label="8 GB of RAM × MaxRAMPercentage 25 % = 2 GB = 2147483648 bytes" sub="in a container, the container's memory limit is the RAM" tone="violet" fs={24} sfs={19} a={win(t, 19, 31.8)} />
      <Term x={96} y={694} w={1728} h={44 + 20 + 3 * 27} t={t} a={win(t, 32, 38.3)} title="a running JVM: the flags in effect · abridged" lines={[
        { k: 'cmd', s: 'jcmd 6670 VM.flags' }, { s: '6670:' }, { s: VMFLAGS_OUT, color: 'ink' },
      ]} />
      <Term x={96} y={694} w={1728} h={44 + 20 + 7 * 27} t={t} a={E(t, 38.5)} title="manageable flags can change while it runs" lines={[
        { parts: flagParts(MANAGEABLE) },
        { k: 'cmd', s: 'jcmd 14768 VM.set_flag HeapDumpOnOutOfMemoryError true', at: 39.5 }, { s: SETFLAG_OUT[1], k: 'ok', at: 40.2 },
        { k: 'cmd', s: 'jcmd 14768 VM.set_flag MaxHeapSize 100000000', at: 42 }, { s: SETFLAG_BAD[1], k: 'err', at: 42.7 },
      ]} />
    </React.Fragment>
  );
}

// ── JMX ────────────────────────────────────────────────────────────────────
export function SJmx({ t }) {
  const src = [
    'var mem = ManagementFactory.getMemoryMXBean();',
    'System.out.println(mem.getHeapMemoryUsage());',
    'var threads = ManagementFactory.getThreadMXBean();',
    'for (ThreadInfo ti : threads.getThreadInfo(threads.findDeadlockedThreads()))',
    '    System.out.println(ti.getThreadName() + " waits for " + ti.getLockName()',
    '                       + " held by " + ti.getLockOwnerName());',
    'for (var gc : ManagementFactory.getGarbageCollectorMXBeans())',
    '    System.out.println(gc.getName() + " count=" + gc.getCollectionCount());',
    'System.out.println(ManagementFactory.getRuntimeMXBean().getInputArguments());',
  ];
  const tones = { 0: win(t, 13, 20), 1: win(t, 13, 20), 3: win(t, 13, 27.5) };
  const beans = [['MemoryMXBean', 'heap & non-heap usage'], ['ThreadMXBean', 'states, CPU, deadlocks'], ['GarbageCollectorMXBean ×2', 'counts and times'], ['RuntimeMXBean', 'uptime, JVM arguments'], ['OperatingSystemMXBean', 'CPU load, memory']];
  return (
    <React.Fragment>
      <Code x={96} y={190} w={1100} h={44 + 24 + src.length * 30} title="Watch.java · runs inside the deadlocked Shop" fs={17} lh={30} a={E(t, 6.5)} lines={src.map((s, i) => ({ s, tone: tones[i] != null ? 'pull' : undefined, toneA: tones[i] || 0 }))} />
      <Term x={96} y={560} w={1100} h={44 + 20 + 6 * 27} t={t} a={E(t, 15)} title="java -Xmx256m Watch" right="real output" lines={WATCH_OUT.map((s, i) => ({ s, at: 15.5 + i * 0.4, tone: i === 1 || i === 2 ? 'bad' : undefined, toneA: i === 1 || i === 2 ? E(t, 20) : 0 }))} />
      <Panel x={1240} y={190} w={584} h={444} title="platform MBeanServer" a={E(t, 0.8)} tone="violet" />
      {beans.map(([l, s], i) => <Box key={l} x={1264} y={250 + i * 74} w={536} h={64} label={l} sub={s} tone="violet" align="left" fs={19} sfs={17} a={E(t, 1.4 + i * 0.4)} glow={(i === 1 && win(t, 13, 27.5)) || (i === 0 && win(t, 13, 20)) ? 0.7 : 0} />)}
      <Box x={1240} y={660} w={584} h={84} label="JConsole · VisualVM · JMC" sub="connect over a remote JMX port" tone="pull" a={E(t, 27.5)} fs={21} />
      <Box x={1240} y={760} w={584} h={84} label="Micrometer → Prometheus" sub="export the numbers continuously" tone="flow" a={E(t, 34.5)} fs={21} />
      <Term x={96} y={806} w={1100} h={44 + 20 + 2 * 27} t={t} a={E(t, 39.5)} title="turn the agent on in a running JVM · abridged" lines={[
        { k: 'cmd', s: 'jcmd 14768 ManagementAgent.start jmxremote.port=9010 …' }, { s: SETFLAG_OUT[1], k: 'ok' },
      ]} />
      <Badge x={1532} y={880} text="secure it: this is remote control" tone="bad" a={E(t, 29)} fs={18} />
    </React.Fragment>
  );
}

// ── Native memory tracking ─────────────────────────────────────────────────
const pick = (re) => NMT.find((l) => re.test(l));
export function SNmt({ t }) {
  const lines = [
    { k: 'cmd', s: 'jcmd 6670 VM.native_memory summary', at: 7.5 },
    { s: pick(/^Total:/), at: 8.5, tone: 'ink', toneA: win(t, 13.5, 20.5) },
    { s: pick(/Java Heap \(/), at: 9, tone: 'pull', toneA: win(t, 20.5, 28.5) },
    { s: pick(/ Class \(/), at: 9.2, tone: 'violet', toneA: win(t, 20.5, 28.5) },
    { s: pick(/Thread \(/), at: 9.4, tone: 'blue', toneA: win(t, 28.5, 36) },
    { s: pick(/\(thread #/), at: 9.4, tone: 'blue', toneA: win(t, 28.5, 36) },
    { s: pick(/ Code \(/), at: 9.6, tone: 'green', toneA: win(t, 36, 43) },
    { s: pick(/ GC \(/), at: 9.8, tone: 'flow', toneA: win(t, 36, 43) },
    { s: pick(/Shared class space \(/), at: 10 },
    { s: pick(/ Metaspace \(/), at: 10.2, tone: 'green', toneA: win(t, 36, 43) },
  ];
  const R = [['heap', 1024, 'pull'], ['class space', 1024, 'violet'], ['code', 242, 'green'], ['GC', 88, 'flow'], ['threads', 66, 'blue'], ['meta', 64, 'green'], ['', 18, 'ink']];
  const C = [['heap 527', 527, 'pull'], ['GC 70', 70, 'flow'], ['thr 66', 66, 'blue'], ['', 22, 'ink']];
  const S = 0.6;
  const bar = (segs, y, at) => { let x = 96; return segs.map(([l, mb, tone], i) => { const w = mb * S; const el = <Box key={i} x={x} y={y} w={Math.max(w - 2, 2)} h={64} label={w > 70 ? l : ''} tone={tone} fs={18} r={4} a={E(t, at + i * 0.15)} />; x += w; return el; }); };
  return (
    <React.Fragment>
      <Term x={96} y={190} w={960} h={44 + 20 + lines.length * 27} t={t} a={E(t, 0.5)} title="started with -XX:NativeMemoryTracking=summary" right="abridged" lines={lines} />
      <Box x={1100} y={190} w={724} h={76} label="reserved" sub="address space set aside, not yet used" tone="ink" align="left" fs={22} sfs={18} a={E(t, 13.5)} />
      <Box x={1100} y={276} w={724} h={76} label="committed" sub="backed by real memory (RSS ≤ this)" tone="pull" align="left" fs={22} sfs={18} a={E(t, 14.5)} />
      <Box x={1100} y={362} w={724} h={76} label="33 threads × ≈ 2 MB of stack" sub="ThreadStackSize = 2048K here · 1 MB on Linux x64" tone="blue" align="left" fs={22} sfs={18} a={E(t, 28.5)} />
      <Box x={1100} y={448} w={724} h={76} label="GC 70 MB · code 7.5 MB" sub="remembered sets, mark bitmaps · compiled methods" tone="flow" align="left" fs={22} sfs={18} a={E(t, 36)} />
      <Txt x={96} y={556} mono fs={18} color={PAL.ink2} a={E(t, 20.5)}>RESERVED · 2,527 MB (same scale)</Txt>
      {bar(R, 586, 20.8)}
      <Txt x={96} y={672} mono fs={18} color={PAL.pull} a={E(t, 22)}>COMMITTED · 685 MB</Txt>
      {bar(C, 702, 22.3)}
      <Badge x={96 + 1024 * S + 512 * S} y={566} text="1 GB reserved, 128 KB committed" tone="violet" a={E(t, 24)} fs={17} />
      <Callout x={96} y={800} w={1728} tone="pull" fs={21} a={win(t, 43, 48.8)} text="`VM.native_memory baseline` now, `summary.diff` later: whichever area grew is your native leak." />
      <Callout x={96} y={800} w={1728} tone="bad" fs={21} a={E(t, 49)} text="NMT tracks only the JVM's own memory. Native libraries calling `malloc` are invisible: if NMT's total is far below RSS, look there." />
    </React.Fragment>
  );
}

// ── Triage playbook ────────────────────────────────────────────────────────
const PLAY = [
  ['slow · CPU high', 'JFR or async-profiler → flame graph', 'Shop: format', 'violet', 6],
  ['slow · CPU low', 'three thread dumps, 10 s apart', '', 'flow', 13],
  ['frozen', 'thread dump → scroll to the bottom', 'Shop: checkout ⇄ refund', 'bad', 19.5],
  ['memory grows', 'histogram ×2 → heap dump → retained', 'Shop: SESSIONS', 'pull', 25.5],
  ['OutOfMemoryError', 'open the HeapDumpOnOutOfMemoryError file', '', 'pull', 32],
  ['long pauses', '-Xlog:gc*,safepoint → GC work vs reaching it', '', 'blue', 37.5],
  ['RSS ≫ heap', 'NMT · VM.native_memory baseline / diff', '', 'green', 45],
  ['"what settings?"', 'jcmd VM.flags · -XX:+PrintFlagsFinal', '', 'ink', 47],
];
export function SPlaybook({ t }) {
  return (
    <React.Fragment>
      <Box x={96} y={196} w={200} h={692} label="start here" sub="jps → jcmd help" tone="pull" fs={24} sfs={17} a={E(t, 0.6)} glow={win(t, 51.5, 99)} />
      {PLAY.map(([sym, move, shop, tone, at], i) => {
        const y = 196 + i * 88;
        return (
          <React.Fragment key={sym}>
            <HArrow x1={300} x2={334} y={y + 38} a={E(t, at)} color={toneColor(tone)} />
            <Box x={340} y={y} w={400} h={76} label={sym} tone={tone} fs={22} align="left" a={E(t, at)} glow={pulse(t, [at + 0.1], 1)} />
            <HArrow x1={746} x2={786} y={y + 38} a={E(t, at + 0.5)} color={PAL.ink2} />
            <Box x={792} y={y} w={730} h={76} label={move} tone="ink" fs={20} align="left" a={E(t, at + 0.6)} />
            {shop && <Badge x={1680} y={y + 38} text={shop} tone={tone} a={POP(t, at + 1.4)} fs={18} solid />}
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
}

// ── Traps ──────────────────────────────────────────────────────────────────
const TRAPS = [
  [3.5, '“One thread dump is enough”', 'Take **three**, ~10 s apart. One photo can\'t tell stuck from passing through.'],
  [10, '“RUNNABLE means it\'s burning CPU”', 'Native code and blocking I/O look the same. Check `cpu=`.'],
  [16.5, '“Sort the heap dump by size”', 'Shallow size hides leaks: a 48-byte map retained 220 MB. Sort by **retained**.'],
  [23, '“The profiler shows reality”', 'Instrumenting defeats inlining; samplers misattribute without `DebugNonSafepoints`.'],
  [29.5, '“I\'ll add HeapDumpOnOutOfMemoryError after the next OOM”', 'Too late. Add it **now**: it costs nothing until it fires.'],
];
export function STraps({ t }) {
  return TRAPS.map(([at, myth, real], i) => {
    const y = 196 + i * 140;
    return (
      <React.Fragment key={i}>
        <Box x={96} y={y} w={760} h={120} label={myth} mono={false} fs={22} tone="bad" a={E(t, at)} strike={t > at + 2} style={{ whiteSpace: 'normal' }} />
        <HArrow x1={870} x2={940} y={y + 60} a={E(t, at + 1.5)} color={PAL.flow} />
        <Card x={956} y={y} w={868} h={120} a={E(t, at + 1.6)} tone="flow" title={real} tfs={23} />
      </React.Fragment>
    );
  });
}

// ── Recap ──────────────────────────────────────────────────────────────────
const RECAP = [
  [3, '1', 'Start here', '`jps`, then `jcmd <pid> help`: the menu of what this JVM can tell you.'],
  [9, '2', 'Thread dumps', 'States, `locked` / `waiting to lock`, three dumps, the deadlock check at the end.'],
  [15, '3', 'GC and heap', '`jstat`, histograms twice, heap dumps sorted by **retained** size.'],
  [18, '4', 'Dominators', 'Retained = what an object dominates. The path to GC roots names the bug.'],
  [21, '5', 'JFR and profiling', 'Always-on event ring. Flame graphs: read width. `DebugNonSafepoints`.'],
  [27, '6', 'Settings and native', '`PrintFlagsFinal`, `VM.flags`, JMX, and NMT for memory outside the heap.'],
];
export function SRecap({ t }) {
  return (
    <React.Fragment>
      {RECAP.map(([at, n, title, sub], i) => <Card key={n} x={96 + (i % 3) * 584} y={210 + Math.floor(i / 3) * 300} w={560} h={270} num={n} title={title} sub={sub} tfs={34} sfs={24} a={E(t, at)} tone={i === 0 ? 'pull' : undefined} glow={i === 0 ? win(t, 30, 40) : 0} />)}
    </React.Fragment>
  );
}
