// 8.10 scenes, part 1: intro, the startup timeline, the per-class pipeline, the cold JIT, who cares.
// Every number labelled JDK 17 was measured on the author's machine (Apple M1, OpenJDK 17.0.17)
// for the running example hello.jar (see the topic file header for the commands).
const { PAL, MOTION, lin, lerp, win, pulse, step, track, track1, hlAt, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Mark, Val, Brace, Bytes, Chip, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

// The running example: app.Main in module `hello` (plus app.Greeter, app.Polite).
export const HELLO_MAIN = [
  'public static void main(String[] args) throws Exception {',
  '    Logger log = Logger.getLogger("hello");',
  '    log.info("starting");',
  '    var xml = Main.class.getResourceAsStream("/greeting.xml");',
  '    String word = DocumentBuilderFactory.newInstance()',
  '            .newDocumentBuilder().parse(xml)',
  '            .getDocumentElement().getTextContent();',
  '    String names = List.of("ada", "linus", "grace").stream()',
  '            .map(String::toUpperCase)',
  '            .collect(Collectors.joining(", "));',
  '    System.out.println(word + ", " + names);',
  '    String impl = System.getProperty("greeter", "app.Polite");',
  '    Greeter g = (Greeter) Class.forName(impl)',
  '            .getDeclaredConstructor().newInstance();',
  '    System.out.println(g.greet("world"));',
  '}',
];

// Callout with a 17px title (the kit's Callout title is 16px, below the stage minimum).
export function Note({ x, y, w, text, title, tone = 'pull', a = 1, fs = 22 }) {
  if (a <= 0.005) return null;
  const c = toneColor(tone);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, boxSizing: 'border-box', opacity: clamp(a, 0, 1), transform: `translateY(${(1 - clamp(a, 0, 1)) * 10}px)`, background: hexA(c, 0.08), borderLeft: `4px solid ${c}`, borderRadius: '0 12px 12px 0', padding: '14px 20px' }}>
      {title && <div style={{ font: `600 17px ${MONO}`, color: c, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{title}</div>}
      <div style={{ font: `400 ${fs}px ${SANS}`, color: PAL.ink, lineHeight: 1.4, textWrap: 'pretty' }}>{typeof text === 'string' ? window.AN.fmt(text) : text}</div>
    </div>
  );
}

// A small "tag" used to mark documented (not measured) facts.
export function DocTag({ x, y, a = 1, text = 'documented · not measured here' }) {
  return <Badge x={x} y={y} text={text} tone="violet" a={a} fs={17} anchor="left" />;
}
export function MeasTag({ x, y, a = 1, text = 'measured · JDK 17' }) {
  return <Badge x={x} y={y} text={text} tone="flow" a={a} fs={17} anchor="left" />;
}

// ── Intro ──────────────────────────────────────────────────────────────────
export function SIntro({ t }) {
  const ms = Math.round(lin(t, 3.4, 2.6) * 122);
  const cls = Math.round(lin(t, 3.4, 2.6) * 1287);
  const chips = [['CDS', 'flow', 1120], ['Leyden', 'flow', 1240], ['jlink', 'pull', 1356], ['jpackage', 'pull', 1490], ['native image', 'violet', 1660]];
  return (
    <React.Fragment>
      <Txt x={96} y={150} mono fs={22} weight={600} color={PAL.pull} a={E(t, 0.3)} style={{ letterSpacing: '0.14em' }}>PART 08 · THE JVM · 8.10</Txt>
      <Txt x={92} y={192} fs={110} weight={700} lh={1} a={E(t, 0.6, 0.9)} style={{ letterSpacing: '-0.03em', transform: `translateY(${(1 - E(t, 0.6, 0.9)) * 24}px)` }}>Startup, packaging and AOT</Txt>
      <Txt x={96} y={330} fs={36} color={PAL.ink2} a={E(t, 1.4, 0.8)}>Why a JVM is slow to start, and every way to make it start faster or ship smaller.</Txt>

      <Console x={96} y={470} w={900} h={300} t={t} a={E(t, 1.8)} fs={20} lh={34} items={[
        { at: 2.4, text: 'java -Xshare:off -jar hello.jar', kind: 'cmd' },
        { at: 4.6, text: 'Oct 05, 2026 12:14:39 PM app.Main main', kind: 'dim' },
        { at: 4.8, text: 'INFO: starting', kind: 'dim' },
        { at: 5.4, text: 'Hello, ADA, LINUS, GRACE' },
        { at: 5.8, text: 'Good day, world.' },
      ]} />
      <Txt x={546} y={790} anchor="mid" fs={20} color={PAL.ink2} a={E(t, 6)}>the running example: `hello.jar`, three small classes</Txt>

      <Txt x={1080} y={470} mono fs={110} weight={700} lh={1} color={PAL.pull} a={E(t, 3.2)}>{ms} ms</Txt>
      <Txt x={1084} y={592} fs={22} color={PAL.ink2} a={E(t, 3.4)}>wall clock, median of 50 runs · JDK 17, sharing off</Txt>
      <Txt x={1080} y={640} mono fs={52} weight={600} lh={1} color={PAL.ink} a={E(t, 3.6)}>{cls.toLocaleString('en-US')} classes</Txt>
      <Txt x={1084} y={704} fs={22} color={PAL.ink2} a={E(t, 3.8)}>loaded to print two lines</Txt>
      {chips.map(([l, tone, x], i) => <Chip key={l} x={x} y={800} text={l} tone={tone} o={POP(t, 12.4 + i * 0.45)} fs={22} />)}
      <Txt x={1080} y={850} fs={20} color={PAL.ink3} a={E(t, 14.5)}>start faster · ship smaller · or stop being a JVM</Txt>
      <MeasTag x={96} y={880} a={E(t, 17.5)} text="every JDK 17 number in this topic was measured, not quoted" />
    </React.Fragment>
  );
}

// ── The startup timeline ───────────────────────────────────────────────────
// Phase boundaries (ms) from -Xlog:startuptime,class+load (uptimenanos), median of 15 runs, -Xshare:off.
const PH_OFF = [0, 35.1, 45.5, 102.8, 119.9, 123.9];
const PHASES = [
  { name: 'JVM boot', tone: 'violet', cls: '', at: 6 },
  { name: 'launcher', tone: 'blue', cls: '531 classes so far', at: 13 },
  { name: 'first log line', tone: 'pull', cls: '+538 classes', at: 20 },
  { name: 'XML', tone: 'pink', cls: '+190', at: 28 },
  { name: '', tone: 'green', cls: '+28', at: 35 },
];
export function STimeline({ t }) {
  const X0 = 170, S = 13, BY = 770, BH = 70;
  const tone = (a, b, tn) => ({ tone: tn, toneA: win(t, a, b, 0.3) });
  const lines = HELLO_MAIN.map((s, i) => {
    let o = {};
    if (i === 1 || i === 2) o = tone(20, 28, 'pull');
    if (i >= 3 && i <= 6) o = tone(28, 35, 'pink');
    if (i >= 7 && i <= 14) o = tone(35, 42, 'green');
    return { s, ...o };
  });
  return (
    <React.Fragment>
      <Code x={96} y={196} w={790} h={500} title="app/Main.java" a={E(t, 0.4)} fs={17} lh={27} lines={lines} />
      <Console x={930} y={196} w={894} h={232} t={t} a={E(t, 0.8)} fs={17} lh={30} items={[
        { at: 1.2, text: 'java -Xshare:off -Xlog:startuptime -jar hello.jar', kind: 'cmd' },
        { at: 6.2, text: '[0.026s][info][startuptime] Initialize java.lang classes, 0.0124152 secs', kind: 'dim' },
        { at: 6.6, text: '[0.039s][info][startuptime] Initialize module system, 0.0117862 secs', kind: 'dim' },
        { at: 7.0, text: '[0.039s][info][startuptime] Create VM, 0.0372228 secs', kind: 'ok' },
      ]} />
      <Note x={930} y={452} w={894} tone="violet" a={win(t, 6.5, 13)} title="before main · 35 ms" fs={20} text="Reserve the heap, generate the interpreter, create `java.lang` objects (`String`, `Thread`, `System`), boot the module system." />
      <Note x={930} y={452} w={894} tone="blue" a={win(t, 13.3, 20)} title="launcher · 10 ms" fs={20} text="`LauncherHelper` opens the jar, reads `Main-Class` from the manifest, loads and links `app.Main`." />
      <Note x={930} y={452} w={894} tone="pull" a={win(t, 20.3, 28)} title="first log line · 57 ms" fs={20} text="`Logger`, `ConsoleHandler`, `SimpleFormatter`, the time-zone database, locale data. All interpreted, all first-time." />
      <Note x={930} y={452} w={894} tone="pink" a={win(t, 28.3, 35)} title="xml · 17 ms" fs={20} text="`DocumentBuilderFactory` finds its implementation, then Xerces: scanners, validators, DOM nodes. 164 classes from `java.xml`." />
      <Note x={930} y={452} w={894} tone="green" a={win(t, 35.3, 42)} title="the rest · 4 ms" fs={20} text="`List.of`, the stream, the lambda's `invokedynamic`, then `Class.forName` loads `app.Greeter` and `app.Polite`." />
      <Note x={930} y={452} w={894} tone="flow" a={E(t, 42.3)} title="1,287 classes" fs={20} text="Three of them are ours. The rest is the platform waking up, the same way, on every start." />

      <Txt x={96} y={BY - 52} mono fs={17} color={PAL.ink3} a={E(t, 5)}>TIME SINCE LAUNCH · JDK 17 · -Xshare:off</Txt>
      {PHASES.map((p, i) => {
        const w = (PH_OFF[i + 1] - PH_OFF[i]) * S * M(t, p.at, 1.0);
        if (w < 1) return null;
        const label = w > 120 ? p.name : '';
        return <Box key={i} x={X0 + PH_OFF[i] * S} y={BY} w={w} h={BH} r={6} tone={p.tone} fill label={label} sub={w > 120 ? `${(PH_OFF[i + 1] - PH_OFF[i]).toFixed(0)} ms` : null} fs={18} sfs={17} glow={pulse(t, [p.at + 1], 1)} />;
      })}
      {[0, 20, 40, 60, 80, 100, 120].map((ms) => (
        <Txt key={ms} x={X0 + ms * S} y={BY + BH + 8} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 5.5)}>{ms}</Txt>
      ))}
      {PHASES.map((p, i) => p.cls && <Txt key={'c' + i} x={X0 + PH_OFF[i + 1] * S - 6} y={BY + BH + 34} anchor="right" mono fs={17} color={toneColor(p.tone)} a={E(t, p.at + 0.8)}>{p.cls}</Txt>)}
      <Txt x={X0 + 123.9 * S + 10} y={BY + 18} mono fs={18} weight={600} color={PAL.ink} a={E(t, 42.5)}>124</Txt>
      <Txt x={X0 + 119 * S} y={BY - 26} anchor="mid" mono fs={17} color={PAL.green} a={E(t, 36)}>4 ms</Txt>
    </React.Fragment>
  );
}

// ── One class, then 1,287 of them ──────────────────────────────────────────
// Real composition of the 1,287 loads with -Xshare:off: java.base 1011, java.xml 164, java.logging 36,
// jdk.localedata 4, hello.jar 3, generated at runtime 69. Order follows the measured phases.
const GRID = (() => {
  const out = [];
  const rnd = (i) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const phase = (n, mix) => {
    const arr = [];
    for (const [k, c] of mix) for (let j = 0; j < c; j++) arr.push(k);
    while (arr.length < n) arr.push('base');
    // deterministic shuffle
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd(out.length + i) * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  };
  out.push(...phase(530, [['gen', 10]]), 'app');                           // boot + launcher: app.Main last
  out.push(...phase(538, [['log', 36], ['loc', 4], ['gen', 30]]));        // first log line
  out.push(...phase(190, [['xml', 164], ['gen', 3]]));                    // XML
  out.push('gen', 'app', 'app', ...phase(25, [['gen', 25]]));            // lambda, Greeter, Polite, method-handle classes
  return out;
})();
const GTONE = { base: PAL.blue, xml: PAL.pink, log: PAL.pull, loc: PAL.violet, app: PAL.flow, gen: PAL.green };
const VERIFIED = (() => { const v = []; GRID.forEach((k, i) => { if (k === 'app' || k === 'loc') v.push(i); }); v.push(GRID.indexOf('gen', 1259)); return new Set(v); })();
const STEPS = [
  ['find', 'jrt:/java.xml, inside lib/modules'],
  ['read + parse', 'class file → InstanceKlass in metaspace'],
  ['verify', "type-check every method's bytecode"],
  ['link', 'rewrite bytecodes · lay out the vtable'],
  ['initialise', 'run the static initialiser <clinit>'],
];
export function SClassFlood({ t }) {
  const GX = 900, GY = 252, P = 17, D = 13, COLS = 52;
  const n = Math.round(lin(t, 1, 18) * GRID.length);
  const focusV = win(t, 28, 43, 0.6);
  const cur = t < 6 ? 0 : t < 9.5 ? (t < 7.5 ? 0 : 1) : t < 13 ? 1 : Math.min(4, 2 + Math.floor((t - 13) / 1.8));
  return (
    <React.Fragment>
      <Txt x={96} y={200} mono fs={18} color={PAL.ink3} a={E(t, 0.5)}>FOLLOW ONE: javax.xml.parsers.DocumentBuilderFactory</Txt>
      {STEPS.map(([l, s], i) => {
        const on = t > 6 && i <= cur;
        const isVerify = i === 2;
        return <Box key={l} x={96} y={244 + i * 86} w={740} h={72} align="left" label={l} sub={s} fs={22} sfs={17}
          tone={isVerify && focusV > 0.1 ? 'bad' : on ? 'pull' : 'ink'} a={E(t, 1 + i * 0.3)} glow={(t > 6 && i === cur && t < 21) ? 0.7 : isVerify ? focusV * 0.8 : 0} />;
      })}
      <Badge x={500} y={244 + 2 * 86 + 36} text="skipped for JDK boot classes" tone="bad" a={E(t, 35)} fs={17} anchor="left" />
      <Console x={96} y={700} w={740} h={158} t={t} a={E(t, 28)} fs={17} lh={30} items={[
        { at: 28.2, text: "java -Xshare:off -Xlog:class+init -jar hello.jar \\", kind: 'cmd' },
        { at: 28.4, text: "    | grep -c 'Start class verification'" },
        { at: 29.4, text: '8', kind: 'ok' },
      ]} />

      <Txt x={GX} y={200} mono fs={18} color={PAL.ink3} a={E(t, 1)}>CLASSES LOADED, IN ORDER · {n.toLocaleString('en-US')}</Txt>
      <div style={{ position: 'absolute', left: GX, top: GY, opacity: E(t, 1) }}>
        {GRID.slice(0, n).map((k, i) => {
          const isV = VERIFIED.has(i);
          const o = focusV > 0.01 ? (isV ? 1 : 1 - 0.75 * focusV) : 1;
          return <div key={i} style={{ position: 'absolute', left: (i % COLS) * P, top: Math.floor(i / COLS) * P, width: D, height: D, borderRadius: 3, background: GTONE[k], opacity: o * 0.9, boxShadow: isV && focusV > 0.01 ? `0 0 0 3px ${hexA(PAL.ink, focusV)}` : 'none' }}></div>;
        })}
      </div>
      {[['base', 'java.base 1,011'], ['xml', 'java.xml 164'], ['log', 'java.logging 36'], ['gen', 'generated 69'], ['loc', 'jdk.localedata 4'], ['app', 'hello.jar 3']].map(([k, l], i) => (
        <div key={k} style={{ position: 'absolute', left: GX + (i % 3) * 300, top: 690 + Math.floor(i / 3) * 34, display: 'flex', alignItems: 'center', gap: 10, opacity: E(t, 20 + i * 0.5), font: `500 18px ${MONO}`, color: PAL.ink2 }}>
          <span style={{ width: 16, height: 16, borderRadius: 3, background: GTONE[k] }}></span>{l}
        </div>
      ))}
      <Note x={GX} y={772} w={924} tone="bad" a={win(t, 28.5, 35)} fs={20} text="Only **8** classes were verified: `app.Main`, `app.Greeter`, `app.Polite`, a lambda class, and 4 locale classes." />
      <Note x={GX} y={772} w={924} tone="pull" a={win(t, 35.3, 43)} fs={20} text="Boot classes are trusted (`-XX:-BytecodeVerificationLocal` is the default). App and library classes are always verified." />
      <Note x={GX} y={772} w={924} tone="flow" a={E(t, 43.3)} fs={20} text="A Spring Boot app loads thousands of **library** classes, all verified. JEP 483 counts about **21,000** for Spring PetClinic." />
    </React.Fragment>
  );
}

// ── The cold JIT ───────────────────────────────────────────────────────────
export function SColdJit({ t }) {
  // throughput sketch: x = log time, illustrative
  const gx0 = 150, gx1 = 1780, gy0 = 890, gy1 = 690;
  const xAt = (sec) => lerp(gx0, gx1, (Math.log10(sec) + 2) / 5); // 10 ms … 1000 s
  const level = (sec) => sec < 0.15 ? 0.1 : sec < 2 ? lerp(0.1, 0.42, (Math.log10(sec) - Math.log10(0.15)) / (Math.log10(2) - Math.log10(0.15))) : sec < 20 ? lerp(0.42, 0.95, (Math.log10(sec) - Math.log10(2)) / 1) : 0.95;
  const drawTo = lerp(-2, 3, lin(t, 25, 9));
  const pts = [];
  for (let e = -2; e <= drawTo; e += 0.04) pts.push([xAt(Math.pow(10, e)), lerp(gy0, gy1, level(Math.pow(10, e)))]);
  const bars = [['interpreter', 'every method starts here', null, 'ink', 1], ['C1 + profiling (tier 3)', '223 methods', 223, 'pull', 11.5], ['C1 trivial (tier 1)', '24 methods', 24, 'pull', 12], ['C2 (tier 4)', '21 methods', 21, 'flow', 12.5]];
  return (
    <React.Fragment>
      <Console x={96} y={196} w={960} h={420} t={t} a={E(t, 3)} fs={17} lh={29} items={[
        { at: 5.8, text: 'java -XX:+PrintCompilation -jar hello.jar', kind: 'cmd' },
        { at: 6.6, text: '  54    1       3       java.lang.Object::<init> (1 bytes)', kind: 'dim' },
        { at: 6.8, text: '  57    2       3       java.lang.String::isLatin1 (19 bytes)', kind: 'dim' },
        { at: 7.0, text: '  57    3       3       java.lang.String::charAt (25 bytes)', kind: 'dim' },
        { at: 7.2, text: '   …' , kind: 'dim' },
        { at: 18, text: '  75   71       4       java.lang.String::charAt (25 bytes)', kind: 'ok' },
        { at: 18.3, text: '  94  213       4       java.lang.String::hashCode (60 bytes)', kind: 'ok' },
        { at: 18.6, text: ' 114  317       4       java.lang.String::equals (56 bytes)', kind: 'ok' },
        { at: 19, text: "grep -c 'app\\.'   →   0", kind: 'cmd' },
      ]} />
      <Txt x={1100} y={196} mono fs={17} color={PAL.ink3} a={E(t, 0.6)}>ONE RUN OF hello.jar · JDK 17</Txt>
      {bars.map(([l, s, n, tone, at], i) => (
        <React.Fragment key={l}>
          <Box x={1100} y={236 + i * 92} w={724} h={76} align="left" label={l} sub={s} tone={tone} fs={21} sfs={17} a={E(t, at)} glow={i === 3 ? win(t, 18, 25) : 0} />
          {n != null && <div style={{ position: 'absolute', left: 1500, top: 236 + i * 92 + 30, height: 16, width: 300 * M(t, at + 0.3, 1.0) * n / 223, background: hexA(toneColor(tone), 0.7), borderRadius: 4 }}></div>}
        </React.Fragment>
      ))}
      <Panel x={96} y={650} w={1728} h={270} title="throughput over time (illustrative)" right="log time →" a={E(t, 24.5)} />
      <svg width="1920" height="1080" style={{ position: 'absolute', left: 0, top: 0, opacity: E(t, 25) }}>
        <line x1={gx0} y1={gy0} x2={gx1} y2={gy0} stroke={PAL.line2} strokeWidth="2" />
        {pts.length > 1 && <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={PAL.flow} strokeWidth="4" strokeLinejoin="round" />}
        <line x1={xAt(0.08)} y1={gy1 - 4} x2={xAt(0.08)} y2={gy0} stroke={PAL.bad} strokeWidth="2.5" strokeDasharray="7 6" opacity={E(t, 26)} />
      </svg>
      {['10 ms', '100 ms', '1 s', '10 s', '100 s'].map((l, i) => <Txt key={l} x={xAt(Math.pow(10, i - 2))} y={gy0 + 4} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 25)}>{l}</Txt>)}
      <Txt x={xAt(0.08) + 12} y={gy1 + 4} mono fs={17} color={PAL.bad} a={E(t, 26)}>hello.jar exits here</Txt>
      <Txt x={xAt(0.6)} y={lerp(gy0, gy1, 0.32) - 40} mono fs={17} color={PAL.pull} a={E(t, 29)}>C1 code</Txt>
      <Txt x={xAt(40)} y={gy1 + 18} mono fs={17} color={PAL.flow} a={E(t, 32)}>C2 · several × faster</Txt>
      <Card x={1100} y={236} w={724} h={360} a={win(t, 38.5, 99)} tone="pull" num="three costs" title="Loading · verifying · a cold interpreter" sub="Every technique in this topic attacks one or more of them. Remember which one, and every trade-off later makes sense." tfs={40} sfs={28} />
    </React.Fragment>
  );
}

// ── When startup is the workload ───────────────────────────────────────────
export function SWhoCares({ t }) {
  const X = 560, W = 1264;
  const row = (i) => 214 + i * 172;
  const lab = (i, title, sub, at) => (
    <React.Fragment>
      <Txt x={96} y={row(i) + 8} fs={26} weight={600} a={E(t, at)}>{title}</Txt>
      <Txt x={96} y={row(i) + 46} fs={19} color={PAL.ink2} a={E(t, at + 0.2)} w={430}>{sub}</Txt>
    </React.Fragment>
  );
  const scale = Array.from({ length: 12 }, (_, k) => k);
  return (
    <React.Fragment>
      {lab(0, 'Long-running server', 'up for three weeks', 1.5)}
      <Box x={X} y={row(0)} w={W * M(t, 5.2, 1.2)} h={64} r={8} tone="flow" fill a={E(t, 5)} label={t > 6.2 ? 'serving requests' : ''} fs={20} />
      <div style={{ position: 'absolute', left: X, top: row(0) - 6, width: 3, height: 76, background: PAL.bad, opacity: E(t, 6.5) }}></div>
      <Txt x={X} y={row(0) + 78} mono fs={17} color={PAL.bad} a={E(t, 6.8)}>startup: under 0.0001% of its life</Txt>

      {lab(1, 'Autoscaling container', 'new instances all day', 11)}
      {scale.map((k) => {
        const x = X + k * (W / 12), at = 11.3 + k * 0.35;
        return (
          <React.Fragment key={k}>
            <Box x={x} y={row(1)} w={(W / 12 - 12) * 0.35} h={64} r={6} tone="bad" fill a={E(t, at)} />
            <Box x={x + (W / 12 - 12) * 0.35} y={row(1)} w={(W / 12 - 12) * 0.65} h={64} r={6} tone="flow" fill a={E(t, at + 0.15)} />
          </React.Fragment>
        );
      })}
      <Txt x={X} y={row(1) + 78} mono fs={17} color={PAL.bad} a={E(t, 13)}>every scale-out waits for startup while traffic queues</Txt>

      {lab(2, 'Serverless function', '200 ms of real work', 18)}
      <Box x={X} y={row(2)} w={760 * M(t, 18.3, 1.0)} h={64} r={8} tone="bad" fill a={E(t, 18.2)} label={t > 19 ? 'cold start' : ''} fs={20} />
      <Box x={X + 772} y={row(2)} w={260 * M(t, 19.4, 0.8)} h={64} r={8} tone="flow" fill a={E(t, 19.4)} label={t > 20 ? 'work' : ''} fs={20} />
      <Brace x={X} y={row(2) + 76} w={1032} label="billed" tone="pull" a={E(t, 21)} fs={17} />

      {lab(3, 'Command-line tool', 'runs for a moment', 25)}
      <Box x={X} y={row(3)} w={420 * M(t, 25.3, 0.8)} h={64} r={8} tone="bad" fill a={E(t, 25.2)} label={t > 26 ? 'startup' : ''} fs={20} />
      <Box x={X + 432} y={row(3)} w={90 * M(t, 26.2, 0.6)} h={64} r={8} tone="flow" fill a={E(t, 26.2)} />
      <Txt x={X + 540} y={row(3) + 20} mono fs={18} color={PAL.ink2} a={E(t, 26.8)}>the user feels all of it</Txt>
      <Note x={96} y={row(3) + 110} w={1728} tone="pull" a={E(t, 31)} fs={22} text="Here Java loses to Go and Node. That's why this corner of the JVM is changing fastest." />
    </React.Fragment>
  );
}
