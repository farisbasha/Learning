// 8.2 scenes, part 1: intro, the three phases, Greeter phase by phase, the prepare/init gap,
// lazy loading in the real log, lazy resolution. All output is real JDK 17 output (see 8.2.jsx).
const { PAL, MOTION, lin, lerp, win, pulse, step, track, hlAt, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Mark, Val, Brace, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

export const GREETER_SRC = [
  'public class Greeter {',
  '    static final String HELLO = "Hello";  // constant',
  '    static int count = 5;',
  '    static {',
  '        System.out.println("  Greeter.<clinit> runs");',
  '    }',
  '    static String greet(String name) {',
  '        count++;',
  '        return HELLO + ", " + name;',
  '    }',
  '}',
];
export const MAIN_SRC = [
  'public class Main {',
  '    public static void main(String[] args) {',
  '        System.out.println("main starts");',
  '        Greeter[] arr = new Greeter[3];',
  '        System.out.println(Greeter.HELLO);',
  '        Class<?> c = Greeter.class;',
  '        System.out.println("about to call greet");',
  '        System.out.println(Greeter.greet("Ada"));',
  '        System.out.println("count = " + Greeter.count);',
  '    }',
  '}',
];

// A pill that travels along keyframes and fades (same idea as 8.1's Tok).
export function Tok({ t, keys, text, tone = 'flow', from, until, w = 220, h = 48, fs = 20, glowAt }) {
  const start = from == null ? keys[0][0] : from;
  if (t < start) return null;
  const [x, y] = track(t, keys);
  let a = E(t, start, 0.25);
  if (until != null) a *= 1 - E(t, until, 0.3);
  if (a <= 0.01) return null;
  const c = toneColor(tone);
  const g = glowAt != null ? pulse(t, [glowAt], 1.0) : 0;
  return <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, boxSizing: 'border-box', borderRadius: 10, opacity: a, background: hexA(c, 0.18), border: `2px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 ${fs}px ${MONO}`, color: PAL.ink, boxShadow: g > 0.01 ? `0 0 ${26 * g}px ${hexA(c, 0.7 * g)}` : 'none', whiteSpace: 'nowrap' }}>{text}</div>;
}

// A row of class states with the current one lit.
export function StateLane({ t, x, y, states, times, w = 220, h = 70, gap = 20, a = 1, fs = 19, badAt }) {
  const cur = times.filter((ti) => t >= ti).length - 1;
  return states.map((s, i) => {
    const bad = badAt != null && i === states.length - 1;
    const tone = i === cur ? (bad ? 'bad' : i === states.length - 1 ? 'flow' : 'pull') : i < cur ? 'ink' : 'dim';
    return <Box key={s} x={x + i * (w + gap)} y={y} w={w} h={h} label={s} fs={fs} tone={tone} a={a} glow={i === cur ? 0.7 : 0} dashed={i > cur} />;
  });
}

// ── Intro ──────────────────────────────────────────────────────────────────
export function SIntro({ t }) {
  const Y = 470;
  const ph = [['loading', 'find bytes · make the Class'], ['linking', 'verify · prepare · resolve'], ['initialisation', 'run <clinit>']];
  const dotY = t < 7 ? null : track(t, [[7, 0, Y + 68], [8.4, 0, Y + 188], [9.8, 0, Y + 308]])[1];
  const st = step(t, [[7.2, 'loaded'], [8.6, 'linked'], [10, 'fully_initialized']], '');
  const errs = [['VerifyError', 'violet'], ['ExceptionInInitializerError', 'bad'], ['NoClassDefFoundError', 'bad'], ['Greeter cannot be cast to Greeter', 'pull']];
  return (
    <React.Fragment>
      <Txt x={96} y={150} mono fs={22} weight={600} color={PAL.pull} a={E(t, 0.3)} style={{ letterSpacing: '0.14em' }}>PART 08 · THE JVM · 8.2</Txt>
      <Txt x={92} y={192} fs={118} weight={700} lh={1} a={E(t, 0.6, 0.9)} style={{ letterSpacing: '-0.03em', transform: `translateY(${(1 - E(t, 0.6, 0.9)) * 24}px)` }}>Class loading</Txt>
      <Txt x={96} y={338} fs={36} color={PAL.ink2} a={E(t, 1.4, 0.8)}>How code gets into a running JVM, and why it fails so strangely.</Txt>

      <Code x={96} y={Y} w={620} h={370} fs={17} lh={27} title="Greeter.java" a={E(t, 2)} lines={GREETER_SRC} />
      <HArrow x1={722} x2={764} y={Y + 68} a={E(t, 6.6)} color={PAL.pull} />
      {ph.map(([l, s], i) => <Box key={l} x={770} y={Y + 20 + i * 120} w={380} h={96} label={l} sub={s} fs={24} sfs={17} tone={i === 2 ? 'pull' : i === 1 ? 'violet' : 'flow'} a={E(t, 6.6 + i * 0.4)} glow={pulse(t, [7.2 + i * 1.4], 1.2)} />)}
      <VArrow x={960} y1={Y + 118} y2={Y + 138} a={E(t, 7)} color={PAL.ink3} />
      <VArrow x={960} y1={Y + 238} y2={Y + 258} a={E(t, 7.4)} color={PAL.ink3} />
      {dotY != null && t < 10.2 && <Dot x={1176} y={dotY} r={9} color={PAL.pull} />}
      <HArrow x1={1156} x2={1214} y={Y + 308} a={E(t, 10)} color={PAL.pull} />

      <Panel x={1220} y={Y} w={604} h={370} title="JVM" right="a live class" a={E(t, 2.6)} tone="flow">
        <div style={{ padding: '20px 24px', font: `500 22px ${MONO}`, color: PAL.ink2, lineHeight: 1.9 }}>
          <div>class   <span style={{ color: t > 7.2 ? PAL.ink : PAL.ink3 }}>{t > 7.2 ? 'Greeter' : '—'}</span></div>
          <div>state   <span style={{ color: st === 'fully_initialized' ? PAL.flow : PAL.pull }}>{st || '—'}</span></div>
          <div>count   <span style={{ color: PAL.ink }}>{t < 8.6 ? '—' : t < 10 ? '0' : '5'}</span></div>
          <div style={{ color: PAL.flow, opacity: E(t, 10.4) }}>&gt;   Greeter.&lt;clinit&gt; runs</div>
        </div>
      </Panel>
      {errs.map(([e, tone], i) => <Badge key={e} x={[250, 640, 1080, 1520][i]} y={898} text={e} tone={tone} fs={18} a={POP(t, 12.8 + i * 0.5)} />)}
    </React.Fragment>
  );
}

// ── The three phases ───────────────────────────────────────────────────────
const PH = [
  { x: 96, w: 300, label: 'loading', at: 5, tone: 'flow', desc: 'Find the `.class` bytes, parse them, create the `Class` object.', ex: 'Greeter.class → Class' },
  { x: 470, w: 300, label: 'verify', at: 11.5, tone: 'violet', desc: 'Prove the bytecode is well-formed and type-safe.', ex: 'bytecode ✓' },
  { x: 792, w: 300, label: 'prepare', at: 18, tone: 'violet', desc: 'Allocate static fields, set to **defaults**: `0`, `null`, `false`.', ex: 'count = 0' },
  { x: 1114, w: 300, label: 'resolve', at: 25, tone: 'violet', desc: 'Symbolic references become direct ones. Lazily, on first use.', ex: '#7 → count field' },
  { x: 1488, w: 336, label: 'initialisation', at: 31.5, tone: 'pull', desc: 'Run `<clinit>`: static initialisers and static field assignments.', ex: 'count = 5' },
];
export function SPhases({ t }) {
  const cur = PH.filter((p) => t >= p.at).length - 1;
  return (
    <React.Fragment>
      <Panel x={436} y={208} w={1012} h={190} title="linking" tone="violet" a={E(t, 1.4)} glow={cur >= 1 && cur <= 3 && t < 37 ? 0.5 : 0} />
      {PH.map((p, i) => {
        const inLink = i >= 1 && i <= 3;
        const y = inLink ? 272 : 262, h = inLink ? 100 : 120;
        return (
          <React.Fragment key={p.label}>
            <Box x={p.x} y={y} w={p.w} h={h} label={p.label} fs={26} tone={i <= cur ? p.tone : 'dim'} a={E(t, 0.8 + i * 0.2)} glow={i === cur && t < 37 ? 0.8 : 0} s={i === cur && t < 37 ? 1.03 : 1} />
            <Txt x={p.x + 4} y={422} w={p.w - 8} fs={22} color={i === cur && t < 37 ? PAL.ink : PAL.ink2} a={E(t, p.at + 0.3)}>{p.desc}</Txt>
            <Box x={p.x} y={540} w={p.w} h={60} label={p.ex} fs={19} tone={p.tone} fill a={E(t, p.at + 1.2)} glow={pulse(t, [p.at + 1.3], 1.2)} />
          </React.Fragment>
        );
      })}
      <HArrow x1={400} x2={432} y={322} a={E(t, 1.2)} color={PAL.ink2} />
      <HArrow x1={1452} x2={1484} y={322} a={E(t, 1.2)} color={PAL.ink2} />
      <Txt x={96} y={228} mono fs={17} color={PAL.ink3} a={E(t, 1)}>ALWAYS IN THIS ORDER</Txt>

      <Code x={96} y={640} w={540} h={110} title="Greeter.java" fs={24} lh={36} a={E(t, 37.5)} lines={['static int count = 5;']} />
      <HArrow x1={644} x2={700} y={695} a={E(t, 38.2)} color={PAL.ink3} />
      <Box x={706} y={640} w={460} h={110} label="count = 0" sub="after prepare · the default" fs={30} tone="violet" a={E(t, 38.4)} glow={pulse(t, [38.6], 1.2)} />
      <HArrow x1={1174} x2={1300} y={695} a={E(t, 40)} color={PAL.pull} label="<clinit>" lfs={17} />
      <Box x={1306} y={640} w={518} h={110} label="count = 5" sub="after initialisation · your value" fs={30} tone="pull" a={E(t, 40.2)} glow={pulse(t, [40.4], 1.2)} />
      <Callout x={96} y={790} w={1728} tone="pull" a={E(t, 41)} fs={22} text="Between those two moments the field exists and holds `0`. That gap is real, and code can observe it." />
    </React.Fragment>
  );
}

// ── Greeter, phase by phase ────────────────────────────────────────────────
const TL_P = [[5, 'load'], [19, 'verify'], [25, 'prepare'], [32, 'resolve'], [38, 'initialise']];
const CLINIT = [' 0: iconst_5', ' 1: putstatic     #7   // Field count:I', ' 4: getstatic     #17  // System.out', ' 7: ldc           #23  // "  Greeter.<clinit> runs"', ' 9: invokevirtual #25  // println', '12: return'];
export function STimeline({ t }) {
  const cur = TL_P.filter((p) => t >= p[0]).length - 1;
  const [hl, hA] = hlAt(t, [[40.5, 0], [43, 1], [49.5, 2], [50.5, 3], [51.5, 4], [53, 5], [55, -1]]);
  const resolved = t >= 44;
  const count = t < 45 ? '0' : '5';
  const st = step(t, [[6.5, 'loaded'], [26, 'linked'], [38.5, 'being_initialized'], [54.5, 'fully_initialized']], '—');
  const srcTone = (i) => {
    if (i === 2 && t >= 25 && t < 32) return { tone: 'violet', toneA: 1 };
    if ((i === 2 || (i >= 3 && i <= 5)) && t >= 38) return { tone: 'pull', toneA: t < 55 ? 1 : 0.4 };
    return {};
  };
  return (
    <React.Fragment>
      {TL_P.map(([at, l], i) => <Box key={l} x={96 + i * 349} y={194} w={330} h={56} label={`${i + 1} · ${l}`} fs={20} tone={i === cur ? (i === 4 ? 'pull' : i === 0 ? 'flow' : 'violet') : i < cur ? 'ink' : 'dim'} dashed={i > cur} a={E(t, 0.6 + i * 0.12)} glow={i === cur ? 0.7 : 0} />)}

      <Code x={96} y={276} w={640} h={356} title="Greeter.java" a={E(t, 1)} fs={17} lh={26} lines={GREETER_SRC.map((s, i) => ({ s, ...srcTone(i) }))} />
      <Code x={96} y={652} w={640} h={250} title="<clinit> · javap -c (comments shortened)" lang="bytecode" a={E(t, 7.6) * (0.45 + 0.55 * E(t, 38.3))} fs={17} lh={30} hl={hl} hlA={hA} lines={CLINIT} />

      <Panel x={780} y={276} w={560} h={444} title="metaspace" right="class metadata" tone="violet" a={E(t, 5)} />
      <Tok t={t} keys={[[5.2, 760, 300], [6.4, 1060, 360]]} text="Greeter.class · 1039 B" w={300} tone="flow" until={6.4} />
      <Box x={804} y={334} w={512} h={58} label="InstanceKlass · Greeter" fs={21} tone="violet" a={E(t, 6.4)} glow={pulse(t, [6.5], 1.2)} />
      <Txt x={808} y={414} mono fs={16} color={PAL.ink3} a={E(t, 7)}>CONSTANT POOL (excerpt)</Txt>
      <Txt x={808} y={440} mono fs={19} color={PAL.ink} a={E(t, 7)}>#7 Fieldref Greeter.count:I</Txt>
      <Badge x={1256} y={452} text={resolved ? 'resolved' : 'symbolic'} tone={resolved ? 'flow' : 'pull'} fs={17} a={E(t, 7.2)} s={1 + 0.15 * pulse(t, [44], 1) + 0.1 * pulse(t, [32.3], 1)} />
      <Txt x={808} y={494} mono fs={16} color={PAL.ink3} a={E(t, 7.4)}>METHODS</Txt>
      <Txt x={808} y={520} mono fs={19} color={PAL.ink} a={E(t, 7.4)}>{'<clinit>()V · greet(String)'}</Txt>
      <Badge x={1256} y={532} text="verified ✓" tone="flow" fs={17} a={POP(t, 20.5)} />
      <Txt x={808} y={574} mono fs={16} color={PAL.ink3} a={E(t, 7.8)}>FIELDS</Txt>
      <Txt x={808} y={600} mono fs={19} color={PAL.ink} a={E(t, 7.8)}>{'HELLO  ConstantValue "Hello"'}</Txt>
      <Txt x={808} y={630} mono fs={19} color={PAL.ink} a={E(t, 7.8)}>count  int</Txt>
      <Txt x={808} y={678} mono fs={18} color={PAL.ink2} a={E(t, 6.6)}>state: <span style={{ color: st === 'fully_initialized' ? PAL.flow : st === 'being_initialized' ? PAL.pull : PAL.violet }}>{st}</span></Txt>

      <Panel x={1380} y={276} w={444} h={444} title="heap" tone="flow" a={E(t, 12)} />
      <Box x={1404} y={334} w={396} h={90} label="java.lang.Class" sub="the mirror of Greeter" fs={22} tone="flow" a={E(t, 12.4)} glow={pulse(t, [12.6], 1.2)} />
      <Arrow from={[1318, 363]} to={[1400, 372]} draw={M(t, 12.8, 0.6)} color={PAL.flow} />
      <Txt x={1404} y={456} mono fs={17} color={PAL.ink3} a={E(t, 25.3)}>STATIC FIELDS · stored in the mirror</Txt>
      <Box x={1404} y={488} w={396} h={90} label={`count = ${count}`} sub={t < 45 ? 'zeroed by prepare' : 'set by <clinit>'} fs={30} tone={t < 45 ? 'violet' : 'pull'} a={E(t, 25.5)} glow={pulse(t, [25.6, 45], 1.2)} />
      <Txt x={1602} y={600} anchor="mid" w={380} align="center" fs={18} color={PAL.ink2} a={E(t, 26.5)}>{"Greeter.class == the mirror you get in Java"}</Txt>

      <Console x={780} y={746} w={1044} h={156} t={t} title="stdout" a={E(t, 1.5)} items={[{ at: 52, text: '  Greeter.<clinit> runs', kind: 'ok' }]} />
    </React.Fragment>
  );
}

// ── The gap between prepare and init ──────────────────────────────────────
const GAP_SRC = [
  'public class Greeter {',
  '    static final Greeter DEFAULT = new Greeter();  // runs first',
  '    static int count = 5;',
  '    Greeter() {',
  '        System.out.println("constructor sees count = " + count);',
  '    }',
  '}',
];
const GAP_CL = [' 0: new           #14  // class Greeter', ' 3: dup', ' 4: invokespecial #29  // "<init>":()V', ' 7: putstatic     #30  // DEFAULT', '10: iconst_5', '11: putstatic     #13  // count', '14: return'];
export function SPrepareGap({ t }) {
  const [hl, hA] = hlAt(t, [[12.5, 0], [14, 1], [15.5, 2], [24.5, 3], [26, 4], [27.5, 5], [30, 6], [31.5, -1]]);
  const srcHl = (i) => (i === 1 && t >= 12.5 && t < 26 ? { tone: 'pull' } : i === 4 && t >= 18.5 && t < 26 ? { tone: 'violet' } : i === 2 && t >= 26 && t < 32 ? { tone: 'pull' } : {});
  const def = t < 24.8 ? 'null' : '→ Greeter@…';
  const cnt = t < 28 ? '0' : '5';
  const inCtor = t >= 16 && t < 24.5;
  return (
    <React.Fragment>
      <Code x={96} y={196} w={900} h={296} title="Greeter.java" a={E(t, 0.5)} fs={18} lh={32} lines={GAP_SRC.map((s, i) => ({ s, ...srcHl(i) }))} />
      <Code x={96} y={516} w={900} h={296} title="<clinit> · javap -c" lang="bytecode" a={E(t, 11.5)} fs={18} lh={32} hl={hl} hlA={hA} lines={GAP_CL} />
      <Badge x={760} y={660} text="constructor running…" tone="violet" fs={17} a={win(t, 16, 24.5)} />

      <Panel x={1040} y={196} w={784} h={330} title="Greeter mirror · static fields" tone="flow" a={E(t, 6.5)} />
      <Txt x={1070} y={262} mono fs={17} color={PAL.ink3} a={E(t, 7)}>AFTER PREPARE: DEFAULTS</Txt>
      <Box x={1070} y={300} w={724} h={86} align="left" label={<span>DEFAULT <span style={{ color: PAL.ink3 }}>=</span> {def}</span>} fs={26} tone={t < 24.8 ? 'violet' : 'flow'} a={E(t, 7)} glow={pulse(t, [24.8], 1.2)} />
      <Box x={1070} y={404} w={724} h={86} align="left" label={<span>count <span style={{ color: PAL.ink3 }}>=</span> {cnt}</span>} fs={26} tone={t < 28 ? 'violet' : 'pull'} a={E(t, 7.4)} glow={pulse(t, [20, 28], 1.4)} s={inCtor && t > 19 ? 1.02 : 1} />
      <Badge x={1640} y={447} text="read here → 0" tone="bad" fs={17} a={win(t, 19.5, 27.5)} />

      <Console x={1040} y={556} w={784} h={190} t={t} a={E(t, 31.5)} items={[{ at: 32, text: 'java Main', kind: 'cmd' }, { at: 32.8, text: 'constructor sees count = 0', kind: 'err' }, { at: 33.4, text: 'after init, count = 5', kind: 'ok' }]} />
      <Callout x={1040} y={770} w={784} tone="pull" a={E(t, 38)} fs={20} text="Static initialisers run **top to bottom**. Anything that reads a static before its line runs sees the default." />
    </React.Fragment>
  );
}

// ── Lazy loading, in the real log ──────────────────────────────────────────
const LOGP = 'file:…/lazy/';
const LAZY_LOG = [
  [1, 'java -Xlog:class+load,class+init Main', 'cmd'],
  [6.3, `[0.019s][info][class,load] Main source: ${LOGP}`, 'dim'],
  [6.9, '[0.019s][info][class,init] Start class verification for: Main', 'dim'],
  [7.3, '[0.019s][info][class,init] End class verification for: Main', 'dim'],
  [8, "[0.019s][info][class,init] 288 Initializing 'Main'(no method) (0x0000000401000800)", 'dim'],
  [13.3, 'main starts'],
  [19.4, `[0.019s][info][class,load] Greeter source: ${LOGP}`, 'ok'],
  [26.6, 'Hello'],
  [40, 'about to call greet'],
  [41.2, '[0.020s][info][class,init] Start class verification for: Greeter', 'ok'],
  [41.7, '[0.020s][info][class,init] End class verification for: Greeter', 'ok'],
  [42.6, "[0.020s][info][class,init] 292 Initializing 'Greeter' (0x0000000401000a08)", 'ok'],
  [53.3, '  Greeter.<clinit> runs'],
  [54.2, 'Hello, Ada'],
  [55.2, 'count = 6'],
];
export function SLazyLog({ t }) {
  const [hl, hA] = hlAt(t, [[6, 1], [13, 2], [18.5, 3], [26, 4], [33.5, 5], [39.5, 6], [40.6, 7], [55, 8], [58, -1]]);
  const [bl, bA] = hlAt(t, [[18.5, 0], [26, 1], [33.5, 2], [40.6, 3], [55, 4], [58, -1]]);
  return (
    <React.Fragment>
      <Code x={96} y={196} w={740} h={442} title="Main.java" a={E(t, 0.4)} fs={18} lh={34} hl={hl} hlA={hA} lines={MAIN_SRC} />
      <Code x={96} y={660} w={740} h={232} title="javap -c Main (the lines that name Greeter)" lang="bytecode" a={E(t, 18)} fs={17} lh={32} hl={bl} hlA={bA}
        lines={[' 9: anewarray     #21  // class Greeter', '16: ldc           #23  // String Hello', '21: ldc           #21  // class Greeter', '37: invokestatic  #29  // Method Greeter.greet', '46: getstatic     #33  // Field Greeter.count:I']} />
      <Badge x={700} y={782} text="constant copied in" tone="pull" fs={17} a={win(t, 27, 33.3)} />
      <Console x={880} y={196} w={944} h={486} t={t} a={E(t, 0.8)} fs={17} lh={27} items={LAZY_LOG.map(([at, text, kind]) => ({ at, text, kind }))} />
      <Txt x={880} y={704} mono fs={17} color={PAL.ink3} a={E(t, 12)}>GREETER</Txt>
      <StateLane t={t} x={880} y={734} w={221} h={66} fs={19} a={E(t, 12)} states={['not loaded', 'loaded', 'linked', 'initialised']} times={[0, 19.4, 41.7, 42.6]} />
      <Callout x={880} y={824} w={944} tone="flow" a={E(t, 58.5)} fs={19} text="**497** classes load for this tiny program; 485 come from the CDS archive (`shared objects file`). Yours load on demand." />
    </React.Fragment>
  );
}

// ── Resolution is lazy too ─────────────────────────────────────────────────
const RES_SRC = [
  'public class Main {',
  '    public static void main(String[] args) {',
  '        System.out.println("main starts");',
  '        if (args.length > 0) {',
  '            System.out.println(Greeter.greet("Ada"));',
  '        }',
  '        System.out.println("main ends");',
  '    }',
  '}',
];
export function SLazyResolve({ t }) {
  const lines = RES_SRC.map((s, i) => (i === 4 ? { s, tone: t >= 14 ? 'bad' : 'violet', toneA: win(t, 7, 12.8) + E(t, 14) * (1 - E(t, 27.5)) } : s));
  return (
    <React.Fragment>
      <Code x={96} y={196} w={880} h={374} title="Main.java" a={E(t, 0.4)} fs={19} lh={34} lines={lines} />
      <Badge x={880} y={405} text="never runs" tone="violet" fs={17} a={win(t, 7.5, 12.8)} />
      <Badge x={880} y={405} text="runs → resolve" tone="bad" fs={17} a={win(t, 14.3, 27.5)} />

      <Box x={1020} y={196} w={380} h={80} label="Main.class" tone="flow" a={E(t, 2)} fs={22} />
      <Box x={1444} y={196} w={380} h={80} label="Greeter.class" sub={t > 3.6 ? '$ rm Greeter.class' : ''} tone={t > 3.6 ? 'bad' : 'flow'} dashed={t > 3.6} strike={t > 3.6} a={E(t, 2.3)} glow={pulse(t, [3.6], 1.2)} fs={22} />
      <Console x={1020} y={300} w={804} h={196} t={t} a={E(t, 6.5)} items={[{ at: 6.8, text: 'java Main', kind: 'cmd' }, { at: 8, text: 'main starts' }, { at: 8.6, text: 'main ends', kind: 'ok' }]} />
      <Mark x={1790} y={346} ok a={POP(t, 9)} />
      <Console x={1020} y={520} w={804} h={226} t={t} title="terminal · first lines" a={E(t, 14)} fs={17} items={[
        { at: 14.3, text: 'java Main go', kind: 'cmd' }, { at: 15.2, text: 'main starts' },
        { at: 21, text: 'Exception in thread "main" java.lang.NoClassDefFoundError: Greeter', kind: 'err' },
        { at: 21.6, text: '\tat Main.main(Main.java:5)', kind: 'err' },
      ]} />
      <Mark x={1790} y={566} ok={false} a={POP(t, 21.2)} />
      <Box x={96} y={604} w={880} h={150} align="left" label="18: invokestatic #23 // Greeter.greet" sub={t < 14 ? 'symbolic until the first time it executes' : 'executes → resolve → load Greeter → not found'} fs={22} sfs={18} tone={t < 14 ? 'violet' : 'bad'} a={E(t, 10)} glow={pulse(t, [16.5], 1.2)} />
      <Callout x={96} y={790} w={1728} tone="pull" a={E(t, 28)} fs={22} text="A missing class is not a startup error. It fails the **first time a line that needs it executes**, maybe hours into a run." />
    </React.Fragment>
  );
}
