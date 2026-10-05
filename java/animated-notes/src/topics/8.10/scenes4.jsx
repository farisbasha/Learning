// 8.10 scenes, part 4: GraalVM native image (documented behaviour: native-image is not installed on the
// machine used for this topic), everything side by side, the decision guide, traps, recap.
const { PAL, MOTION, lin, lerp, win, pulse, track, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Table, Mark, Val, Brace, Chip, toneColor } = window.AN;
import { Note, DocTag, MeasTag, HELLO_MAIN } from './scenes1.jsx';
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

// ── Native image: the idea ─────────────────────────────────────────────────
const NSTAGES = [['hello.jar', '+ JDK classes', 'ink', 0.8], ['analyse', 'what can main reach?', 'flow', 6], ['initialise', 'snapshot → image heap', 'pull', 12.5], ['compile', 'machine code, AOT', 'pink', 19.5], ['link', '+ Substrate VM', 'violet', 26]];
export function SNativeIdea({ t }) {
  return (
    <React.Fragment>
      {NSTAGES.map(([l, s, tone, at], i) => (
        <React.Fragment key={l}>
          <Box x={96 + i * 357} y={204} w={300} h={96} label={l} sub={s} tone={tone} a={E(t, at)} fs={23} glow={pulse(t, [at + 0.3], 1.2)} />
          {i > 0 && <HArrow x1={96 + i * 357 - 52} x2={96 + i * 357 - 6} y={252} a={E(t, at)} color={toneColor(tone)} />}
        </React.Fragment>
      ))}
      <Txt x={96} y={318} mono fs={18} color={PAL.ink3} a={E(t, 1.5)}>native-image -jar hello.jar     ·  all of this happens at build time</Txt>
      <DocTag x={1300} y={330} a={E(t, 1.5)} text="documented behaviour · not run here" />

      <Panel x={96} y={380} w={900} h={360} title="./hello · one native executable" tone="flow" a={E(t, 33)} glow={win(t, 33, 41) * 0.6} />
      <Box x={126} y={444} w={840} h={80} align="left" label="machine code" sub="only the methods main can reach" tone="pink" fill a={E(t, 19.8)} fs={22} />
      <Box x={126} y={538} w={840} h={80} align="left" label="image heap" sub="objects built by initialisers during the build" tone="pull" fill a={E(t, 13)} fs={22} />
      <Box x={126} y={632} w={840} h={80} align="left" label="Substrate VM" sub="garbage collector · threads · exceptions" tone="violet" fill a={E(t, 26.4)} fs={22} />

      <Txt x={1060} y={384} mono fs={18} color={PAL.ink3} a={E(t, 34)}>NOT AT RUN TIME</Txt>
      {['class loading', 'bytecode verification', 'interpreter', 'JIT compiler', 'bytecode at all'].map((l, i) => (
        <Box key={l} x={1060} y={420 + i * 64} w={764} h={52} label={l} fs={21} tone="bad" strike={t > 34.6 + i * 0.4} a={E(t, 34 + i * 0.4)} />
      ))}
      <Txt x={96} y={772} mono fs={18} color={PAL.ink3} a={E(t, 41)}>STARTING ./hello</Txt>
      {['map the binary', 'map the image heap', 'call main()'].map((l, i) => (
        <React.Fragment key={l}>
          <Box x={96 + i * 380} y={806} w={330} h={70} label={l} tone="flow" fs={21} a={E(t, 41.4 + i * 0.6)} />
          {i > 0 && <HArrow x1={96 + i * 380 - 46} x2={96 + i * 380 - 6} y={841} a={E(t, 41.4 + i * 0.6)} color={PAL.flow} />}
        </React.Fragment>
      ))}
      <Note x={1260} y={796} w={564} tone="violet" a={E(t, 49)} fs={20} text="All three startup costs, gone. The bill comes in another currency." />
    </React.Fragment>
  );
}

// ── Points-to analysis ─────────────────────────────────────────────────────
const GNODES = [
  { id: 'main', label: 'main', x: 1290, y: 206, w: 200, at: 6, tone: 'flow' },
  { id: 'log', label: 'Logger', sub: 'getLogger · info', x: 940, y: 316, w: 270, at: 12.5, tone: 'flow' },
  { id: 'dbf', label: 'DocumentBuilder…', sub: 'newInstance · parse', x: 1240, y: 316, w: 300, at: 13.3, tone: 'flow' },
  { id: 'list', label: 'List.of', sub: 'stream · collect', x: 1570, y: 316, w: 254, at: 14.1, tone: 'flow' },
  { id: 'hnd', label: 'handlers', sub: 'formatter', x: 940, y: 440, w: 270, at: 15, tone: 'flow' },
  { id: 'xer', label: 'Xerces', sub: 'scanner · DOM', x: 1240, y: 440, w: 300, at: 15.6, tone: 'flow' },
  { id: 'lam', label: 'lambda', sub: 'indy linked at build', x: 1570, y: 440, w: 254, at: 19.5, tone: 'flow' },
  { id: 'fn', label: 'Class.forName(impl)', sub: 'impl = a system property', x: 1140, y: 586, w: 400, at: 25.5, tone: 'pull' },
  { id: 'pol', label: 'app.Polite', sub: 'not in the image', x: 1140, y: 740, w: 400, at: 32, tone: 'bad' },
];
const GEDGES = [['main', 'log'], ['main', 'dbf'], ['main', 'list'], ['log', 'hnd'], ['dbf', 'xer'], ['list', 'lam']];
export function SPointsTo({ t }) {
  const N = Object.fromEntries(GNODES.map((n) => [n.id, n]));
  const lines = HELLO_MAIN.map((s, i) => {
    let tone = null, a = 0;
    if (i === 1 || i === 2) { tone = 'flow'; a = E(t, 12.5); }
    if (i >= 3 && i <= 6) { tone = 'flow'; a = E(t, 13.3); }
    if (i >= 7 && i <= 10) { tone = 'flow'; a = E(t, 14.1); }
    if (i >= 11 && i <= 13) { tone = t > 32 ? 'bad' : 'pull'; a = E(t, 25.5); }
    return tone ? { s, tone, toneA: a } : s;
  });
  return (
    <React.Fragment>
      <Code x={96} y={196} w={800} h={500} title="app/Main.java" fs={17} lh={27} a={E(t, 0.5)} lines={lines} />
      {GNODES.map((n) => (
        <Box key={n.id} x={n.x} y={n.y} w={n.w} h={n.sub ? 82 : 64} label={n.label} sub={n.sub} tone={n.tone} fill={n.id !== 'pol'} dashed={n.id === 'pol'} fs={20} sfs={17}
          a={n.id === 'pol' ? E(t, n.at) * (0.5 + 0.5 * E(t, 38.5)) : E(t, n.at)} glow={pulse(t, [n.at + 0.2], 1.1)} strike={n.id === 'pol' && t > 38.5} />
      ))}
      {GEDGES.map(([a, b], k) => {
        const A = N[a], B = N[b];
        const ax = A.x + A.w / 2, ay = A.y + (A.sub ? 82 : 64), bx = B.x + B.w / 2, by = B.y;
        const mid = (ay + by) / 2;
        return <Arrow key={k} pts={ax === bx ? [[ax, ay + 2], [bx, by - 4]] : [[ax, ay + 2], [ax, mid], [bx, mid], [bx, by - 4]]} draw={M(t, B.at - 0.4, 0.5)} color={PAL.flow} />;
      })}
      <Arrow pts={[[1340, 522], [1340, 582]]} draw={M(t, 25, 0.5)} color={PAL.pull} />
      <Txt x={1360} y={538} mono fs={17} color={PAL.pull} a={E(t, 25.3)}>from main</Txt>
      <Arrow pts={[[1340, 668], [1340, 736]]} draw={M(t, 32, 0.6)} color={PAL.bad} dashed />
      <Txt x={1364} y={688} mono fs={22} weight={700} color={PAL.bad} a={E(t, 32.3)}>?</Txt>
      <Note x={96} y={720} w={800} tone="bad" a={win(t, 32, 45)} fs={20} text="A string known only at run time. The analysis can't follow it, and nothing else mentions `app.Polite`." />
      <Note x={96} y={720} w={800} tone="flow" a={win(t, 45, 52.5)} fs={20} text={'`Class.forName("app.Polite")` with a **constant** would be folded by the analysis, and the class kept.'} />
      <Note x={96} y={720} w={800} tone="violet" a={E(t, 52.5)} fs={20} text="Whatever main can't reach is left out: Swing, `java.sql`, the compiler… That's why binaries are small." />
      <Badge x={1580} y={600} text="nothing fails at build time" tone="bad" a={E(t, 38.8)} fs={17} anchor="left" />
    </React.Fragment>
  );
}

// ── What breaks, and the fix ───────────────────────────────────────────────
export function SWhatBreaks({ t }) {
  return (
    <React.Fragment>
      <Box x={96} y={200} w={840} h={104} align="left" label="java -jar hello.jar" sub="prints “Good day, world.”" tone="flow" a={E(t, 0.6)} fs={22} sfs={19} />
      <Mark x={900} y={252} ok a={E(t, 1.4)} />
      <Box x={984} y={200} w={840} h={104} align="left" label="./hello" sub="Class.forName(impl) can't find app.Polite" tone="bad" a={E(t, 5.5)} fs={22} sfs={19} glow={pulse(t, [6.2], 1.2)} />
      <Mark x={1788} y={252} ok={false} a={E(t, 6.2)} />
      <Txt x={984} y={314} mono fs={17} color={PAL.violet} a={E(t, 6.5)}>documented: ClassNotFoundException in older releases, MissingReflectionRegistrationError in newer</Txt>
      <Txt x={96} y={364} mono fs={18} color={PAL.ink3} a={E(t, 12.5)}>INVISIBLE TO THE ANALYSIS UNLESS DECLARED</Txt>
      {['reflection', 'dynamic proxies', 'JNI', 'serialization', 'computed resource names'].map((l, i) => (
        <Chip key={l} x={[180, 420, 610, 800, 1100][i]} y={418} text={l} tone="pull" o={POP(t, 12.8 + i * 0.35)} fs={20} />
      ))}
      <Code x={96} y={470} w={840} h={44 + 24 + 7 * 30} lang="plain" fs={18} lh={30} title="META-INF/native-image/…/reachability-metadata.json" a={E(t, 19.5)} lines={[
        '{',
        '  "reflection": [',
        '    { "type": "app.Polite",',
        '      "methods": [',
        '        { "name": "<init>", "parameterTypes": [] } ] }',
        '  ]',
        '}',
      ].map((s, i) => ({ s, tone: i >= 2 && i <= 4 ? 'flow' : undefined, toneA: E(t, 21) }))} />
      <Note x={984} y={470} w={840} tone="violet" a={E(t, 26.5)} fs={19} text="One file in recent GraalVM releases. Older ones used `reflect-config.json`, `resource-config.json` and friends." />
      <Code x={984} y={590} w={840} h={44 + 24 + 2 * 32} lang="shell" fs={17} lh={32} title="let the JVM tell you: the tracing agent" a={E(t, 33.5)} lines={[
        '$ java -agentlib:native-image-agent=config-output-dir=cfg -jar hello.jar',
        '# writes the reflection, resources, proxies this run used',
      ]} />
      {['Spring Boot 3 · AOT processing', 'Quarkus · Micronaut', 'Reachability Metadata Repository'].map((l, i) => (
        <Box key={l} x={984 + (i === 2 ? 0 : i * 424)} y={i === 2 ? 834 : 768} w={i === 2 ? 840 : 416} h={56} label={l} fs={19} tone="flow" a={E(t, 41 + i * 0.4)} />
      ))}
      <Note x={96} y={810} w={840} tone="bad" a={E(t, 48)} fs={19} text="The pain: an old library doing reflection nobody declared. It passes the build and fails in production." />
    </React.Fragment>
  );
}

// ── Build-time initialisation ──────────────────────────────────────────────
export function SBuildInit({ t }) {
  const objs = [['Map', 0], ['"en" → "Hello"', 1], ['"fr" → "Bonjour"', 2]];
  return (
    <React.Fragment>
      <Code x={96} y={196} w={1000} h={44 + 24 + 4 * 34} fs={19} lh={34} title="Greetings.java" a={E(t, 0.5)} lines={[
        'class Greetings {',
        { s: '    static final Map<String, String> BY_LANG = loadTable();', tone: 'pull', toneA: win(t, 6, 19.5) },
        { s: '    static final long BUILT_AT = System.currentTimeMillis();', tone: 'bad', toneA: E(t, 19.5) },
        '}',
      ]} />
      <Code x={1140} y={196} w={684} h={44 + 24 + 2 * 34} lang="shell" fs={18} lh={34} title="opt in, per class or package" a={E(t, 33.5)} lines={['$ native-image --initialize-at-build-time=app.Greetings \\', '      -jar hello.jar']} />
      <Panel x={96} y={440} w={820} h={300} title="build machine · native-image" tone="pull" a={E(t, 6)} />
      <Box x={126} y={504} w={260} h={70} label="<clinit> runs" tone="pull" a={E(t, 6.6)} fs={21} glow={pulse(t, [7], 1)} />
      <Box x={126} y={600} w={340} h={70} label="BUILT_AT" sub="build machine's clock" tone="bad" a={E(t, 20)} fs={20} />
      <Panel x={1004} y={440} w={820} h={300} title="./hello · image heap" tone="flow" a={E(t, 8)} />
      {objs.map(([l, i]) => {
        const [x, y] = track(t, [[7.4 + i * 0.3, 600 + 0, 530 + i * 64], [9.5 + i * 0.3, 600, 530 + i * 64], [11 + i * 0.3, 1290, 530 + i * 64]]);
        return <Val key={l} x={x + 50} y={y} text={l} tone={i === 0 ? 'pull' : 'ink'} o={E(t, 7.4 + i * 0.3)} fs={19} h={44} />;
      })}
      <Val x={lerp(560, 1340, M(t, 21.5, 1.4))} y={700} text="BUILT_AT" tone="bad" o={E(t, 21)} fs={19} h={40} />
      <Txt x={1034} y={504} fs={20} color={PAL.flow} a={E(t, 13)}>already there at start: no &lt;clinit&gt;, no parsing</Txt>
      <Note x={96} y={770} w={1728} tone="bad" a={win(t, 19.5, 33.5)} fs={21} text="Frozen at build time: a timestamp, a random seed, an environment variable, a host name. Every copy of the binary gets the build machine's value." />
      <Note x={96} y={770} w={1728} tone="pull" a={win(t, 33.5, 41)} fs={21} text="So **application classes initialise at run time** by default. Build-time initialisation is an explicit choice." />
      <Note x={96} y={770} w={1728} tone="flow" a={E(t, 41)} fs={21} text="Frameworks lean on it: Quarkus and Spring's AOT mode do much of their wiring during the build, so it isn't repeated at start." />
    </React.Fragment>
  );
}

// ── The bill for native image ──────────────────────────────────────────────
export function SNativeCosts({ t }) {
  const rows = [
    ['startup', 'hundreds of ms or more', 'a few to tens of ms'],
    ['memory', 'larger: JIT, metadata', 'often several × smaller'],
    ['peak throughput', 'higher: C2 + live profile', 'usually lower'],
    ['build', 'seconds', 'minutes, GBs of RAM'],
    ['GC', 'every HotSpot GC', 'Serial (CE) · G1 (Oracle, Linux)'],
    ['tools', 'JFR, jcmd, agents, JMX', 'a different, smaller set'],
  ];
  const marks = { 0: ['flow', win(t, 6, 13)], 1: ['flow', win(t, 6, 13)], 2: ['bad', win(t, 13, 26.5)], 3: ['bad', win(t, 33, 39)], 4: ['pull', win(t, 39, 45.5)], 5: ['pull', E(t, 45.5)] };
  const gx0 = 160, gx1 = 1780, gy0 = 890, gy1 = 700;
  const jvm = (p) => p < 0.08 ? 0.05 : p < 0.5 ? lerp(0.05, 0.95, (p - 0.08) / 0.42) : 0.95;
  const pts = (f, upTo) => { const a = []; for (let p = 0; p <= upTo; p += 0.01) a.push([lerp(gx0, gx1, p), lerp(gy0, gy1, f(p))].join(',')); return a.join(' '); };
  const up = lin(t, 20, 5);
  return (
    <React.Fragment>
      <DocTag x={96} y={204} a={E(t, 0.6)} text="typical reported ranges · not measured here" />
      <Table x={96} y={232} cols={[250, 370, 440]} head={['', 'JVM', 'native image']} rows={rows} fs={21} rh={52} a={E(t, 0.8)} marks={marks}
        rowA={rows.map((_, i) => E(t, 1 + i * 0.3))} colColors={[PAL.ink2, PAL.ink, PAL.ink]} />
      <Note x={1200} y={232} w={624} tone="pull" a={win(t, 26.5, 33)} fs={20} title="PGO" text="Profile-guided optimisation in Oracle GraalVM: build, run a training workload, rebuild with its profile. Recovers much of the gap." />
      <Note x={1200} y={232} w={624} tone="bad" a={win(t, 13, 26.5)} fs={20} title="why lower" text="No runtime profile, so no speculative inlining or devirtualisation based on what really happens." />
      <Note x={1200} y={232} w={624} tone="violet" a={E(t, 33)} fs={20} title="different pipeline" text="Minutes per build, a different debugging story, and every reflective library needs metadata." />
      <Panel x={96} y={652} w={1728} h={268} title="throughput over time" right="illustrative" a={E(t, 19.5)} />
      <svg width="1920" height="1080" style={{ position: 'absolute', left: 0, top: 0, opacity: E(t, 20) }}>
        <line x1={gx0} y1={gy0} x2={gx1} y2={gy0} stroke={PAL.line2} strokeWidth="2" />
        {up > 0.01 && <polyline points={pts(jvm, up)} fill="none" stroke={PAL.flow} strokeWidth="4" />}
        {up > 0.01 && <polyline points={pts(() => 0.66, up)} fill="none" stroke={PAL.violet} strokeWidth="4" strokeDasharray="12 8" />}
        <line x1={gx0} y1={lerp(gy0, gy1, 0.85)} x2={gx1} y2={lerp(gy0, gy1, 0.85)} stroke={PAL.pull} strokeWidth="2" strokeDasharray="4 8" opacity={E(t, 27)} />
      </svg>
      <Txt x={gx0 + 20} y={lerp(gy0, gy1, 0.66) - 32} mono fs={18} color={PAL.violet} a={E(t, 21)}>native: fast from the first request</Txt>
      <Txt x={lerp(gx0, gx1, 0.62)} y={lerp(gy0, gy1, 0.95) - 2} mono fs={18} color={PAL.flow} a={E(t, 23)}>JVM after warm-up</Txt>
      <Txt x={lerp(gx0, gx1, 0.62)} y={lerp(gy0, gy1, 0.85) - 2} mono fs={17} color={PAL.pull} a={E(t, 27)}>native + PGO</Txt>
    </React.Fragment>
  );
}

// ── Everything on one chart ────────────────────────────────────────────────
const MEAS = [['-Xshare:off', 122, 'bad', 6, 'everything parsed'], ['default CDS', 81, 'flow', 7, 'JDK classes mapped'], ['+ AppCDS', 75, 'flow', 8, 'app classes mapped too'], ['jlink, no archive', 110, 'pull', 13, 'small, but parses again'], ['jlink + CDS', 75, 'violet', 14, 'small and mapped']];
export function SAllTogether({ t }) {
  const BX = 520, U = 7.6;
  return (
    <React.Fragment>
      <MeasTag x={96} y={204} a={E(t, 0.6)} text="measured · hello.jar · JDK 17 · median of 50 runs" />
      {MEAS.map(([l, ms, tone, at, why], i) => {
        const y = 236 + i * 72;
        return (
          <React.Fragment key={l}>
            <Txt x={96} y={y + 12} fs={23} color={PAL.ink} a={E(t, at)}>{l}</Txt>
            <Box x={BX} y={y} w={ms * U * M(t, at + 0.2, 0.9)} h={52} r={6} tone={tone} fill a={E(t, at)} />
            <Txt x={BX + ms * U + 14} y={y + 10} mono fs={24} weight={700} color={toneColor(tone)} a={E(t, at + 0.9)}>{ms} ms</Txt>
            <Txt x={BX + ms * U + 130} y={y + 14} mono fs={18} color={PAL.ink3} a={E(t, 35 + i * 0.3)}>{why}</Txt>
          </React.Fragment>
        );
      })}
      <DocTag x={96} y={624} a={E(t, 21)} text="documented · JEP 483 · Spring PetClinic" />
      {[['JDK 23', 4.486, 'bad'], ['JDK 24 + AOT cache', 2.604, 'pull']].map(([l, s, tone], i) => (
        <React.Fragment key={l}>
          <Txt x={96} y={666 + i * 70} fs={23} a={E(t, 21.5 + i * 0.6)}>{l}</Txt>
          <Box x={BX} y={654 + i * 70} w={s * 240 * M(t, 21.7 + i * 0.6, 0.9)} h={52} r={6} tone={tone} fill a={E(t, 21.5 + i * 0.6)} />
          <Txt x={BX + s * 240 + 14} y={664 + i * 70} mono fs={24} weight={700} color={toneColor(tone)} a={E(t, 22.4 + i * 0.6)}>{s.toFixed(3)} s</Txt>
        </React.Fragment>
      ))}
      <Txt x={BX + 2.604 * 240 + 160} y={738} mono fs={18} color={PAL.ink3} a={E(t, 35.8)}>loaded and linked too</Txt>
      <Note x={96} y={810} w={1728} tone="violet" a={E(t, 28)} fs={21} text="Native image would start fastest of all, in milliseconds by most reports. But it is no longer a JVM, and it bills you differently." />
    </React.Fragment>
  );
}

// ── Decision guide ─────────────────────────────────────────────────────────
const DECIDE = [
  ['Long-running server', 'Plain JVM. Startup amortises to nothing; keep the JIT\'s peak.', 5, 'flow'],
  ['Deploys or restarts often', 'JVM + AppCDS now, + the AOT cache on JDK 24+. A flag, not a rewrite.', 11, 'flow'],
  ['Image size matters', 'Add `jlink`, with `--generate-cds-archive` so startup doesn\'t regress.', 18, 'pull'],
  ['Scales out constantly', 'Native image or JVM + AOT cache. Measure both under real load.', 24.5, 'pull'],
  ['Serverless · CLI tool', 'Native image: cold start is the product.', 31.5, 'violet'],
  ['Desktop application', '`jpackage`: users never install Java.', 38, 'pink'],
];
export function SDecide({ t }) {
  return (
    <React.Fragment>
      {DECIDE.map(([w, c, at, tone], i) => {
        const y = 196 + i * 96;
        return (
          <React.Fragment key={w}>
            <Box x={96} y={y} w={520} h={80} align="left" label={w} fs={23} mono={false} tone="ink" a={E(t, at)} />
            <HArrow x1={626} x2={690} y={y + 40} a={E(t, at + 0.6)} color={toneColor(tone)} />
            <Box x={700} y={y} w={1124} h={80} align="left" label={c} fs={22} mono={false} tone={tone} fill a={E(t, at + 0.8)} glow={pulse(t, [at + 1], 1)} />
          </React.Fragment>
        );
      })}
      <Note x={96} y={790} w={1728} tone="pull" a={E(t, 44)} fs={22} title="the honest default" text="Plain JVM plus the AOT cache when you're on JDK 24+. Native image is a commitment: take it when cold start is the actual requirement." />
    </React.Fragment>
  );
}

// ── Traps ──────────────────────────────────────────────────────────────────
const TRAPS = [
  [3.5, '“AOT means no JIT”', 'Leyden keeps the JIT. Only native image removes it.'],
  [9.5, '“Native image is strictly better”', 'Lower peak, slow builds, reflection metadata. Wrong for long-running servers.'],
  [15.5, '“jlink takes any jar”', 'Automatic modules are refused. jlink the JDK, keep jars on the class path.'],
  [21.5, '“My CDS archive is being used”', 'A rebuilt jar silently invalidates it. `-Xshare:on` turns that into an error.'],
  [27.5, '“A trimmed runtime starts faster”', 'Without `--generate-cds-archive` it starts slower: 110 ms vs 81 ms here.'],
];
export function STraps({ t }) {
  return TRAPS.map(([at, myth, real], i) => {
    const y = 196 + i * 142;
    return (
      <React.Fragment key={i}>
        <Box x={96} y={y} w={700} h={122} label={myth} mono={false} fs={24} tone="bad" a={E(t, at)} strike={t > at + 2} style={{ whiteSpace: 'normal' }} />
        <HArrow x1={810} x2={880} y={y + 61} a={E(t, at + 1.5)} color={PAL.flow} />
        <Card x={896} y={y} w={928} h={122} a={E(t, at + 1.6)} tone="flow" title={real} tfs={24} />
      </React.Fragment>
    );
  });
}

// ── Recap ──────────────────────────────────────────────────────────────────
const RECAP = [
  [3, '1', 'Why startup is slow', 'Loading and verifying classes, and an interpreter with no profile.'],
  [8.5, '2', 'CDS · AppCDS', 'Parse once, `mmap` forever. Shared pages, pre-verified. 122 → 75 ms here.'],
  [14, '3', 'Leyden AOT cache', 'JDK 24: loaded + linked classes. JDK 25: profiles. Keeps the JIT.'],
  [19.5, '4', 'jlink · jpackage', 'Only the modules you need: 305 → 28 MB. Add a CDS archive back.'],
  [25, '5', 'Native image', 'Closed world, build-time init, no JIT. Millisecond starts, real costs.'],
  [30, '6', 'Default', 'Plain JVM + AOT cache. Native image when cold start is the requirement.'],
];
export function SRecap({ t }) {
  return (
    <React.Fragment>
      {RECAP.map(([at, n, title, sub], i) => <Card key={n} x={96 + (i % 3) * 584} y={210 + Math.floor(i / 3) * 300} w={560} h={270} num={n} title={title} sub={sub} tfs={34} sfs={24} a={E(t, at)} tone={i === 5 ? 'pull' : undefined} glow={i === 5 ? win(t, 30.5, 40) : 0} />)}
    </React.Fragment>
  );
}
