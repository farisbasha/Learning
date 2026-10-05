// 8.8 scenes, part 4: naive benchmarks, JMH, Graal, traps, recap.
// Timings are real runs (JDK 17.0.17, Apple M1, JMH 1.37).
const { PAL, MOTION, lin, lerp, win, pulse, step, track, track1, hlAt, clamp, hexA, MONO, SANS, fmt, hiJava,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Mark, Val, Brace, Bytes, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;
import { Term } from './scenes2.jsx';

// ── The naive benchmark ────────────────────────────────────────────────────
export function SNaiveBench({ t }) {
  const [hl, hA] = hlAt(t, [[6, 3], [10, 8], [20, 3], [28, 8]]);
  const g0 = win(t, 13, 27.6);
  return (
    <React.Fragment>
      <Code x={96} y={196} w={860} h={44 + 24 + 11 * 32} fs={18} lh={32} title="Naive.java (abridged)" a={E(t, 0.4)} hl={hl} hlA={hA * win(t, 6, 34)}
        lines={['for (int round = 1; round <= 5; round++) {', '    long start = System.nanoTime();', '    for (int i = 0; i < 10_000_000; i++)', '        area(i);                     // result ignored', '    long ignored = System.nanoTime() - start;', '    start = System.nanoTime();', '    double sum = 0;', '    for (int i = 0; i < 10_000_000; i++)', '        sum += area(i);              // result used', '    long used = System.nanoTime() - start;', '    // print ignored, used, sum']} />
      <Term x={990} y={196} w={834} t={t} a={E(t, 5.5)} fs={18} lh={36} rows={[
        { kind: 'cmd', text: 'java Naive', at: 6 },
        { text: 'round 1: ignored   3.328 ms   used  12.639 ms', at: 7, glow: win(t, 13, 20) },
        { text: 'round 2: ignored  12.309 ms   used  11.185 ms', at: 7.4, glow: win(t, 34, 40) },
        { kind: 'bad', text: 'round 3: ignored   0.000 ms   used  12.276 ms', at: 7.8, glow: g0 },
        { kind: 'bad', text: 'round 4: ignored   0.000 ms   used  10.594 ms', at: 8.2, glow: g0 },
        { kind: 'bad', text: 'round 5: ignored   0.000 ms   used  10.727 ms', at: 8.6, glow: g0 },
        { kind: 'cmd', text: 'java -Xint Naive', at: 34.5 },
        { kind: 'pull', text: 'round 1: ignored 220.55 ms   used 229.52 ms', at: 35.2 },
        { kind: 'pull', text: 'round 2: ignored 220.98 ms   used 226.17 ms', at: 35.6 },
      ]} />
      <Badge x={1407} y={612} text="(sum=1.047e+21) printed on each line, trimmed here" tone="ink" a={E(t, 9)} fs={17} />
      <Box x={990} y={644} w={834} h={70} label="10,000,000 calls in 0.000 ms = no calls at all" tone="bad" fs={22} a={win(t, 20, 41)} glow={pulse(t, [20.3], 1.2)} />
      <Table x={96} y={644} cols={[400, 1328]} head={['problem', 'what you actually measured']} fs={19} rh={42} a={E(t, 41)}
        rowA={[41.3, 41.8, 42.3, 42.8, 43.3, 43.8].map((s) => E(t, s))} colColors={[PAL.pull, PAL.ink]}
        rows={[['no warm-up', 'the interpreter, C1 and OSR code (rounds 1 and 2)'], ['dead code elimination', 'an empty loop: the unused result let C2 delete the calls'], ['constant folding', 'constant inputs get computed once, at compile time'], ['on-stack replacement', 'loops in `main` run OSR code, compiled differently from normal calls'], ['GC interference', 'one collection in the middle skews the average'], ['loop unrolling', "the loop you wrote isn't the loop that ran"]]} />
    </React.Fragment>
  );
}

// ── JMH ────────────────────────────────────────────────────────────────────
export function SJmh({ t }) {
  const cell = (f, k) => {
    const s = 6.5 + f * 1.2 + k * 0.45;
    const warm = k < 5;
    return <div key={k} style={{ position: 'absolute', left: 1150 + k * 64 + (warm ? 0 : 20), top: 268 + f * 104, width: 54, height: 54, borderRadius: 8, boxSizing: 'border-box', border: `2px solid ${warm ? PAL.ink3 : PAL.flow}`, background: t >= s ? hexA(warm ? PAL.ink3 : PAL.flow, warm ? 0.3 : 0.4) : 'transparent', opacity: E(t, 6 + f * 0.3) }}></div>;
  };
  const expl = t < 45 ? 0 : t < 53 ? 1 : 2;
  return (
    <React.Fragment>
      <Code x={96} y={196} w={860} h={44 + 24 + 12 * 30} fs={17} lh={30} title="AreaBench.java (abridged)" a={E(t, 0.4)}
        lines={[
          { s: '@BenchmarkMode(Mode.AverageTime)', tone: 'flow', toneA: 0 },
          { s: '@Warmup(iterations = 5, time = 1)', tone: 'pull', toneA: win(t, 12, 19) },
          { s: '@Measurement(iterations = 5, time = 1)', tone: 'pull', toneA: win(t, 12, 19) },
          { s: '@Fork(3)', tone: 'pull', toneA: win(t, 6, 12) },
          { s: '@State(Scope.Benchmark)', tone: 'pull', toneA: win(t, 26, 32) },
          'public class AreaBench {',
          { s: '  @Benchmark public void ignored() {', tone: 'bad', toneA: win(t, 38, 45) },
          '      for (int i = 0; i < 1000; i++) area(i); }',
          { s: '  @Benchmark public double returned() {', tone: 'pull', toneA: win(t, 19, 26) + win(t, 45, 53) },
          '      double s = 0; for (…) s += area(i); return s; }',
          { s: '  @Benchmark public void blackhole(Blackhole bh) {', tone: 'flow', toneA: win(t, 19, 26) + win(t, 53, 59) },
          '      for (int i = 0; i < 1000; i++) bh.consume(area(i)); } }',
        ]} />
      <Panel x={990} y={196} w={834} h={400} title="3 forks · 5 warm-up + 5 measured" a={E(t, 6)} />
      {[0, 1, 2].map((f) => (
        <React.Fragment key={f}>
          <Box x={1014} y={260 + f * 104} w={116} h={70} label="JVM" sub={'fork ' + (f + 1)} tone="violet" fs={20} sfs={17} a={E(t, 6 + f * 0.3)} />
          {Array.from({ length: 10 }).map((_, k) => cell(f, k))}
        </React.Fragment>
      ))}
      <Txt x={1150} y={570} mono fs={17} color={PAL.ink3} a={E(t, 12)}>warm-up: discarded</Txt>
      <Txt x={1490} y={570} mono fs={17} color={PAL.flow} a={E(t, 12)}>measured</Txt>

      <Term x={96} y={622} w={1150} t={t} a={E(t, 32)} fs={18} lh={36} title="JMH 1.37 · real output (abridged)" rows={[
        { kind: 'dim', text: '# VM version: JDK 17.0.17, OpenJDK 64-Bit Server VM, 17.0.17+0', at: 32.2 },
        { text: 'Benchmark            Mode  Cnt    Score    Error  Units', at: 32.6 },
        { kind: 'ok', text: 'AreaBench.blackhole  avgt   15  241.969 ±  2.087  ns/op', at: 33, glow: win(t, 53, 59) },
        { kind: 'bad', text: 'AreaBench.ignored    avgt   15    0.642 ±  0.068  ns/op', at: 33.4, glow: win(t, 38, 45) },
        { kind: 'pull', text: 'AreaBench.returned   avgt   15  938.996 ± 56.728  ns/op', at: 33.8, glow: win(t, 45, 53) },
      ]} />
      <Panel x={1280} y={622} w={544} h={248} title={['ignored', 'returned', 'blackhole'][expl]} tone={['bad', 'pull', 'flow'][expl]} a={E(t, 38)}>
        <div style={{ padding: '16px 22px', font: `400 21px ${SANS}`, color: PAL.ink, lineHeight: 1.45 }}>
          {[
            '1,000 calls in 0.642 ns: deleted. JMH consumes what you **return**; it can\'t rescue a result you threw away.',
            'One chain of 1,000 **dependent** additions: each waits for the last, ≈ 3 cycles each.',
            'Each result consumed separately, so the CPU **overlaps** the independent work.',
          ].map((s, i) => <div key={i} style={{ display: expl === i ? 'block' : 'none', opacity: E(t, [38, 45, 53][i]) }}>{fmt(s)}</div>)}
        </div>
      </Panel>
      <Callout x={96} y={884} w={1728} tone="pull" a={E(t, 59)} fs={19} text="JMH makes the measurement sound. **You** still choose what to measure, and read the result critically." />
    </React.Fragment>
  );
}

// ── Graal ──────────────────────────────────────────────────────────────────
export function SGraal({ t }) {
  const swap = M(t, 6, 1.2);
  return (
    <React.Fragment>
      <Panel x={96} y={196} w={1100} h={360} title="HotSpot JVM · written in C++" a={E(t, 0.4)} />
      <Box x={126} y={290} w={240} h={100} label="interpreter" sub="tier 0" tone="ink" fs={22} a={E(t, 1)} />
      <Box x={396} y={290} w={240} h={100} label="C1" sub="tiers 1–3" tone="pull" fs={26} a={E(t, 1.3)} />
      <Box x={666} y={290} w={240} h={100} label="C2" sub="tier 4 · C++" tone="flow" fs={26} a={E(t, 1.6) * (1 - 0.7 * swap)} dashed={swap > 0.5} strike={swap > 0.5} />
      <Box x={936} y={270} w={230} h={140} label="JVMCI" sub="compiler interface" tone="violet" fs={24} a={E(t, 5)} glow={pulse(t, [5.2], 1.2)} />
      <Box x={1260} y={270} w={564} h={140} label="Graal" sub="a JIT compiler written in Java" tone="green" fs={30} a={E(t, 5.4)} glow={win(t, 6, 11) * 0.7} />
      <HArrow x1={1256} x2={1170} y={340} a={E(t, 6)} color={PAL.green} label="plugs in" lfs={17} />
      <Txt x={786} y={410} anchor="mid" mono fs={17} color={PAL.green} a={E(t, 7)}>Graal takes tier 4</Txt>
      <Panel x={1260} y={430} w={564} h={126} a={E(t, 11)} tone="green">
        <div style={{ padding: '14px 20px', font: `400 19px ${SANS}`, color: PAL.ink, lineHeight: 1.45 }}>
          <div>+ deeper inlining, partial escape analysis: good on streams and lambdas</div>
          <div style={{ color: PAL.ink2 }}>− itself needs warming up; some numeric code is slower</div>
        </div>
      </Panel>
      <Term x={96} y={596} w={1728} t={t} a={E(t, 18)} fs={19} lh={38} title="stock OpenJDK 17.0.17 · real" rows={[
        { kind: 'cmd', text: 'java -XX:+UnlockExperimentalVMOptions -XX:+UseJVMCICompiler Escape', at: 18.5 },
        { kind: 'bad', text: 'Cannot use JVMCI compiler: No JVMCI compiler found', at: 24, glow: win(t, 24, 31) },
      ]} />
      <Callout x={96} y={760} w={1728} tone="violet" a={win(t, 25, 31.6)} fs={20} title="jdk 17 · jep 410" text="The experimental Graal JIT was removed from OpenJDK builds. JVMCI remains; to use Graal as your JIT, run a **GraalVM** JDK, where it is the default top-tier compiler." />
      <Callout x={96} y={760} w={1728} tone="pull" a={E(t, 32)} fs={20} title="not native image" text="GraalVM **native image** (8.10) compiles ahead of time and has no JIT at all. Same project, opposite ends." />
    </React.Fragment>
  );
}

// ── Traps ──────────────────────────────────────────────────────────────────
const TRAPS = [
  [3.5, '“A nanoTime loop measures my code”', 'It measured the interpreter, C1, or a deleted loop. **Use JMH.**'],
  [10, '“Interfaces and getters are slow”', 'One type at a site: inlined behind a check. A getter is 5 bytes.'],
  [16.5, '“Small methods add call overhead”', 'Small methods are the ones that get inlined. Huge ones block the optimiser.'],
  [23, '“Once warm, performance is stable”', 'A newly loaded class can deoptimise hot code; a third type goes megamorphic.'],
  [29.5, '“Escape analysis makes allocation free”', 'Only when C2 sees the whole lifetime. One call too big to inline and it is real.'],
];
export function STraps({ t }) {
  return TRAPS.map(([at, myth, real], i) => {
    const y = 196 + i * 146;
    return (
      <React.Fragment key={i}>
        <Box x={96} y={y} w={760} h={124} label={myth} mono={false} fs={23} tone="bad" a={E(t, at)} strike={t > at + 2} style={{ whiteSpace: 'normal' }} />
        <HArrow x1={870} x2={940} y={y + 62} a={E(t, at + 1.5)} color={PAL.flow} />
        <Card x={956} y={y} w={868} h={124} a={E(t, at + 1.6)} tone="flow" title={real} tfs={23} />
      </React.Fragment>
    );
  });
}

// ── Recap ──────────────────────────────────────────────────────────────────
const RECAP = [
  [3, '1', 'Tiers', 'Interpreter → C1 with a profile → C2. Two counters, calls and back-edges, decide.'],
  [8.5, '2', 'OSR', 'A long loop swaps to compiled code mid-loop, after 60,000+ back-edges.'],
  [13.5, '3', 'Inlining', 'The enabler. ≤ 35 bytes always a candidate, ≤ 325 if hot. Tiny methods are free.'],
  [18.5, '4', 'Escape analysis', 'Objects that never escape are scalar-replaced: no allocation, no lock.'],
  [23.5, '5', 'Call sites', '1 or 2 types: inlined behind a guard. 3+: megamorphic, a real dispatch.'],
  [28.5, '6', 'Deopt · JMH', 'Speculate, guard, undo. Benchmark with JMH, never with `nanoTime`.'],
];
export function SRecap({ t }) {
  return (
    <React.Fragment>
      {RECAP.map(([at, n, title, sub], i) => <Card key={n} x={96 + (i % 3) * 584} y={210 + Math.floor(i / 3) * 330} w={560} h={300} num={n} title={title} sub={sub} tfs={36} sfs={24} a={E(t, at)} tone={i === 5 ? 'pull' : undefined} glow={i === 5 ? win(t, 29, 40) : 0} />)}
    </React.Fragment>
  );
}
