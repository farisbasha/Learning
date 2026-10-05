// 8.3 scenes, part 4: direct buffers, which error from which area, reading messages, escape analysis, traps, recap.
const { PAL, MOTION, lin, lerp, win, pulse, step, track, hlAt, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Mark, Val, Brace, toneColor } = window.AN;
import { RealTag } from './common.jsx';
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

// ── Direct buffers: memory outside the heap ────────────────────────────────
export function SOffHeap({ t }) {
  const n = t < 6 ? 0 : t < 26 ? Math.min(2, Math.floor((t - 6) / 2) + 1) : Math.min(16, 2 + Math.floor((t - 26) / 0.3));
  const failed = t >= 30.6;
  const blk = (i) => [910 + (i % 8) * 112, 268 + Math.floor(i / 8) * 100];
  const chip = (i) => [126 + (i % 8) * 80, 330 + Math.floor(i / 8) * 60];
  return (
    <React.Fragment>
      <Panel x={96} y={190} w={700} h={420} title="heap" tone="pull" a={E(t, 0.5)} />
      <Txt x={126} y={252} mono fs={17} color={PAL.ink3} a={E(t, 6)}>List keep → DirectByteBuffer objects (small)</Txt>
      {Array.from({ length: 16 }).map((_, i) => <Box key={i} x={chip(i)[0]} y={chip(i)[1]} w={66} h={44} label="DBB" tone="pull" fs={17} a={i < n ? E(t, i < 2 ? 6 + i * 2 : 26 + (i - 2) * 0.3, 0.2) : 0} />)}
      <Box x={chip(16)[0]} y={chip(16)[1]} w={66} h={44} label="DBB" tone="bad" dashed fs={17} a={E(t, 30.4) * (1 - E(t, 31.4))} />
      <Panel x={880} y={190} w={944} h={420} title="native memory · off-heap" right={t >= 19.5 ? 'MaxDirectMemorySize = 16 MB' : ''} tone="pink" a={E(t, 0.8)} />
      {Array.from({ length: 16 }).map((_, i) => <Box key={i} x={blk(i)[0]} y={blk(i)[1]} w={100} h={84} label="1 MB" tone="pink" fs={18} a={i < n ? E(t, i < 2 ? 6.4 + i * 2 : 26.2 + (i - 2) * 0.3, 0.2) : 0} glow={i < 2 ? win(t, 13, 19) * 0.6 : 0} />)}
      <Box x={910} y={468} w={100} h={84} label="1 MB?" tone="bad" dashed fs={18} a={E(t, 30.6)} strike />
      <Mark x={1000} y={476} ok={false} a={E(t, 30.8)} />
      <Arrow pts={[[159, 328], [159, 304], [850, 304], [850, 310], [906, 310]]} draw={M(t, 7, 0.8)} color={PAL.pink} />
      <Txt x={520} y={280} anchor="mid" mono fs={17} color={PAL.pink} a={E(t, 7.6)}>owns</Txt>
      <Badge x={1352} y={510} text="kernel reads/writes here directly · no copy" tone="pink" a={win(t, 13, 26)} fs={17} />
      <Badge x={1420} y={510} text="16 MB allocated = 16 MB limit" tone="bad" a={E(t, 30.6)} fs={17} solid />
      <Txt x={126} y={500} fs={19} w={640} color={PAL.ink2} a={E(t, 38.5)}>A buffer's native block is freed only when its tiny heap object is collected. The heap can look healthy while native memory runs out.</Txt>

      <Console x={96} y={640} w={1728} h={210} t={t} a={E(t, 26)} fs={17} lh={30} items={[
        { at: 26.2, text: 'java -XX:MaxDirectMemorySize=16m Direct      # keep allocateDirect(1 MB) in a list', kind: 'cmd' },
        { at: 30.8, text: 'Exception in thread "main" java.lang.OutOfMemoryError: Cannot reserve 1048576 bytes of direct buffer memory (allocated: 16777216, limit: 16777216)', kind: 'err' },
        { at: 31.2, text: '    at java.base/java.nio.Bits.reserveMemory(Bits.java:178)' },
        { at: 31.4, text: '    at java.base/java.nio.DirectByteBuffer.<init>(DirectByteBuffer.java:121)' },
      ]} />
      <RealTag x={96} y={862} a={E(t, 31)} />
    </React.Fragment>
  );
}

// ── Which error comes from which area ──────────────────────────────────────
const ERRS = [
  [5, 'StackOverflowError', 'stack', 'deep or endless recursion', 0, 'Exception in thread "main" java.lang.StackOverflowError'],
  [11, 'OOM: Java heap space', 'heap', 'a leak (8.7), or -Xmx too small', 1, 'Exception in thread "main" java.lang.OutOfMemoryError: Java heap space'],
  [18, 'OOM: GC overhead limit exceeded', 'heap', 'a leak; Parallel GC gives up early', 1, 'Exception in thread "main" java.lang.OutOfMemoryError: GC overhead limit exceeded'],
  [27, 'OOM: Metaspace', 'metaspace', 'class loader leak (8.2)', 2, 'Exception in thread "main" java.lang.OutOfMemoryError: Metaspace'],
  [33, 'OOM: Cannot reserve … direct buffer memory', 'direct', 'buffers never released', 3, 'java.lang.OutOfMemoryError: Cannot reserve 1048576 bytes of direct buffer memory (allocated: 16777216, limit: 16777216)'],
  [39.5, 'OOM: unable to create native thread', 'OS threads', 'too many threads, or OS limits', 4, 'java.lang.OutOfMemoryError: unable to create native thread: possibly out of memory or process/resource limits reached'],
  [46.5, 'OOM: Requested array size exceeds VM limit', 'heap', 'length near Integer.MAX_VALUE', 1, 'Exception in thread "main" java.lang.OutOfMemoryError: Requested array size exceeds VM limit'],
  [54, 'warning: CodeCache is full', 'code cache', 'JIT output outgrew the cache', 5, 'OpenJDK 64-Bit Server VM warning: CodeCache is full. Compiler has been disabled.'],
];
const AREAS = [['thread stacks', 'flow'], ['heap', 'pull'], ['metaspace', 'violet'], ['direct memory', 'pink'], ['OS threads', 'ink'], ['code cache', 'blue']];
export function SErrorMap({ t }) {
  const cur = ERRS.filter((e) => t >= e[0]).length - 1;
  const live = cur >= 0 && t < 61 ? ERRS[cur] : null;
  const marks = {};
  if (live) marks[cur] = [cur === 7 ? 'blue' : 'bad', 1];
  return (
    <React.Fragment>
      <Table x={96} y={196} cols={[600, 200, 520]} head={['message', 'area', 'usual cause']} a={E(t, 0.5)} fs={18} rh={60}
        rows={ERRS.map((e) => [e[1], e[2], e[3]])} rowA={ERRS.map((e) => E(t, e[0]))} marks={marks} colColors={[PAL.ink, PAL.pull, PAL.ink2]} />
      {AREAS.map(([l, tone], i) => {
        const on = live && live[4] === i;
        return <Box key={l} x={1470} y={196 + i * 90} w={354} h={74} label={l} tone={tone} a={E(t, 1 + i * 0.15)} glow={on ? 1 : 0} s={on ? 1.04 : 1} fs={21} fill={on ? true : undefined} />;
      })}
      <Console x={96} y={760} w={1728} h={110} t={t} a={E(t, 5) * (1 - E(t, 61, 0.4))} fs={17} lh={30} title="the message, exactly as printed (JDK 17)"
        items={ERRS.map((e, i) => ({ at: e[0] + 0.3, text: e[5], kind: i === 7 ? 'ok' : 'err' }))} />
      <Callout x={96} y={760} w={1728} tone="bad" a={E(t, 61.2)} fs={22} text="**Read the message, not just the class name.** Seven messages, six areas, different causes and fixes. “We got an OOM” is not a diagnosis." />
    </React.Fragment>
  );
}

// ── Same program, different messages ───────────────────────────────────────
export function SReadTheMessage({ t }) {
  return (
    <React.Fragment>
      <Txt x={96} y={192} mono fs={17} color={PAL.ink3} a={E(t, 0.5)}>Overhead.java: map.put(i, "v" + i) forever, -Xmx64m</Txt>
      <Console x={96} y={226} w={880} h={190} t={t} a={E(t, 1)} fs={17} lh={30} title="Parallel GC" items={[
        { at: 5, text: 'java -XX:+UseParallelGC -Xmx64m Overhead', kind: 'cmd' },
        { at: 6.5, text: 'Exception in thread "main" java.lang.OutOfMemoryError: GC overhead limit exceeded', kind: 'err' },
        { at: 7, text: '# after 2.5 s: 98% of time in GC, under 2% freed', kind: 'dim' },
      ]} />
      <Console x={992} y={226} w={832} h={190} t={t} a={E(t, 1.4)} fs={17} lh={30} title="G1 (the default)" items={[
        { at: 13, text: 'java -Xmx64m Overhead', kind: 'cmd' },
        { at: 14, text: 'Exception in thread "main" java.lang.OutOfMemoryError: Java heap space', kind: 'err' },
        { at: 14.5, text: '# after 0.4 s: G1 has no overhead limit on JDK 17', kind: 'dim' },
      ]} />
      <Txt x={96} y={446} mono fs={17} color={PAL.ink3} a={E(t, 19)}>BigArray.java: new long[n], -Xmx64m</Txt>
      <Console x={96} y={480} w={1728} h={190} t={t} a={E(t, 19)} fs={17} lh={30} items={[
        { at: 19.4, text: 'java -Xmx64m BigArray 2147483645', kind: 'cmd' },
        { at: 20, text: 'Exception in thread "main" java.lang.OutOfMemoryError: Java heap space', kind: 'err' },
        { at: 25, text: 'java -Xmx64m BigArray 2147483646', kind: 'cmd' },
        { at: 25.6, text: 'Exception in thread "main" java.lang.OutOfMemoryError: Requested array size exceeds VM limit', kind: 'err' },
      ]} />
      <Badge x={1500} y={612} text="Integer.MAX_VALUE − 1: no heap size helps" tone="bad" a={E(t, 26)} fs={17} />
      <Txt x={96} y={700} mono fs={17} color={PAL.ink3} a={E(t, 32)}>Leak.java (the User cache) under G1, -Xmx32m</Txt>
      <Console x={96} y={734} w={1728} h={160} t={t} a={E(t, 32)} fs={17} lh={30} items={[
        { at: 32.4, text: 'java -Xmx32m Leak', kind: 'cmd' },
        { at: 33, text: '300000 users cached' },
        { at: 33.8, text: 'Exception: java.lang.OutOfMemoryError thrown from the UncaughtExceptionHandler in thread "main"', kind: 'err' },
      ]} />
      <Badge x={1500} y={706} text="even reporting the error needed memory" tone="bad" a={E(t, 35)} fs={17} />
    </React.Fragment>
  );
}

// ── Everything is on the heap: a useful lie ────────────────────────────────
export function SEscapeAnalysis({ t }) {
  const offN = Math.max(0, Math.min(10, Math.floor((t - 12) / 0.55) + 1));
  const cyc = t >= 25.5 ? ((t - 25.5) % 3.2) / 3.2 : -1;
  const [hl, hA] = hlAt(t, [[6, 5], [18, 5], [25.5, 6], [33, -1]]);
  return (
    <React.Fragment>
      <Code x={96} y={190} w={820} h={428} title="Escape.java" a={E(t, 0.4)} fs={18} lh={30} hl={hl} hlA={hA} lines={[
        'record Point(int x, int y) {}', '', 'static long sum(int n) {', '    long total = 0;', '    for (int i = 0; i < n; i++) {',
        '        var p = new Point(i, i + 1);   // allocate?', '        total += p.x() + p.y();', '    }', '    return total;', '}',
        '// main: warm up, then measure sum(100_000_000)', '//   with ThreadMXBean.getThreadAllocatedBytes',
      ]} />

      <Panel x={960} y={190} w={864} h={200} title="interpreted, or -XX:-DoEscapeAnalysis" tone="bad" a={E(t, 12)} />
      {Array.from({ length: 10 }).map((_, k) => <Box key={k} x={990 + k * 80} y={262} w={70} h={64} label="Point" sub="24 B" tone={k < offN - 3 ? 'dim' : 'pull'} fs={17} sfs={16} a={k < offN ? E(t, 12 + k * 0.55, 0.2) : 0} />)}
      <Txt x={990} y={344} mono fs={17} color={PAL.ink2} a={E(t, 13)}>a real heap object every iteration · garbage one line later</Txt>

      <Panel x={960} y={420} w={864} h={200} title="C2 + escape analysis (the default)" tone="flow" a={E(t, 18)} />
      <Txt x={990} y={480} mono fs={17} color={PAL.ink2} a={win(t, 18.5, 25.5)}>does p escape? stored in a field? returned? passed on?</Txt>
      <Badge x={1392} y={530} text="no: p never leaves sum()" tone="flow" a={win(t, 21.5, 25.5)} fs={18} />
      {cyc >= 0 && (
        <React.Fragment>
          <Box x={990} y={490} w={160} h={70} label="new Point" tone="pull" dashed fs={18} a={(1 - lin(cyc, 0.2, 0.25)) * E(t, 25.5)} strike={cyc > 0.15} />
          <HArrow x1={1160} x2={1310} y={525} a={E(t, 26)} color={PAL.flow} label="scalar replaced" lfs={17} />
          <Box x={1320} y={480} w={230} h={44} label="x → register" tone="flow" fs={17} a={E(t, 26.2)} glow={pulse(t, [26.4], 1)} />
          <Box x={1320} y={534} w={230} h={44} label="y → register" tone="flow" fs={17} a={E(t, 26.4)} glow={pulse(t, [26.6], 1)} />
          <Txt x={1576} y={512} mono fs={17} color={PAL.flow} a={E(t, 27)}>no object · no GC</Txt>
        </React.Fragment>
      )}

      <Table x={96} y={650} cols={[480, 360, 340]} head={['JDK 17 run', 'bytes allocated', 'young GCs (whole run)']} a={E(t, 33)} fs={20} rh={56} colColors={[PAL.ink, PAL.pull, PAL.ink2]}
        rows={[['default · escape analysis on', '0', '0'], ['-XX:-DoEscapeAnalysis', '2,400,000,000', '19'], ['-Xint · no JIT at all', '2,400,000,000', '32']]}
        rowA={[E(t, 33.4), E(t, 40), E(t, 42)]} marks={{ 0: ['flow', win(t, 33.4, 40)], 1: ['bad', win(t, 40, 48)] }} />
      <RealTag x={96} y={882} a={E(t, 33.4)} text="real output · 100,000,000 Points · 24 bytes each" />
      <Callout x={1316} y={650} w={508} tone="flow" a={E(t, 48)} fs={19} title="semantics" text="“Objects live on the heap” is the right model for sharing and pass-by-value." />
      <Callout x={1316} y={790} w={508} tone="pull" a={E(t, 54.5)} fs={19} title="performance" text="It's the wrong model for cost. Measure before you avoid `new` (8.8)." />
    </React.Fragment>
  );
}

// ── Traps ──────────────────────────────────────────────────────────────────
const TRAPS = [
  [3, '“We got an OOM”', 'Which one? Each message names a different area, cause and fix.'],
  [9, '“OOM: Metaspace means too many classes”', 'Almost always a **class loader leak**: old loaders that never die.'],
  [15, '“The container’s memory is my heap”', 'By default it is **25%**: a 1 GB container gets a 256 MB heap.'],
  [21, '“The stack is garbage collected”', 'Frames just pop. Only heap objects wait for the GC.'],
  [27, '“Every `new` allocates on the heap”', 'Escape analysis can delete the object entirely.'],
  [33, '“Catch OutOfMemoryError and carry on”', 'The handler needs memory too, and state may be half-updated. Let it die; restart.'],
];
export function STraps({ t }) {
  return TRAPS.map(([at, myth, real], i) => {
    const y = 196 + i * 120;
    return (
      <React.Fragment key={i}>
        <Box x={96} y={y} w={760} h={104} label={myth} mono={false} fs={22} tone="bad" a={E(t, at)} strike={t > at + 2} />
        <HArrow x1={870} x2={940} y={y + 52} a={E(t, at + 1.5)} color={PAL.flow} />
        <Card x={956} y={y} w={868} h={104} a={E(t, at + 1.6)} tone="flow" title={real} tfs={22} />
      </React.Fragment>
    );
  });
}

// ── Recap ──────────────────────────────────────────────────────────────────
const RECAP = [
  [3, '1', 'The map', 'Per thread: PC register + stack. Shared: heap, metaspace, code cache.'],
  [8.5, '2', 'The stack', 'Frames push and pop. Fixed size → `StackOverflowError`. 1–2 MB per platform thread.'],
  [14, '3', 'The heap', 'Every object. Eden → survivors → old. TLABs make `new` a pointer bump.'],
  [19.5, '4', 'Metaspace', 'Class metadata in native memory, unlimited by default. Leak → `OOM: Metaspace`.'],
  [25, '5', 'Read the message', 'Each `OutOfMemoryError` names the area that ran out.'],
  [30, '6', 'A useful lie', 'Escape analysis can remove an allocation entirely.'],
];
export function SRecap({ t }) {
  return (
    <React.Fragment>
      {RECAP.map(([at, n, title, sub], i) => <Card key={n} x={96 + (i % 3) * 584} y={210 + Math.floor(i / 3) * 290} w={560} h={260} num={n} title={title} sub={sub} tfs={34} sfs={23} a={E(t, at)} tone={i === 4 ? 'pull' : undefined} glow={i === 4 ? win(t, 25, 40) : 0} />)}
    </React.Fragment>
  );
}
