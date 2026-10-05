// 8.2 scenes, part 4: a custom class loader, hot reload, unloading, traps, recap.
const { PAL, MOTION, lin, lerp, win, pulse, step, track, hlAt, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Mark, Val, Brace, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

export const SIMPLE_LOADER = [
  'public class SimpleLoader extends ClassLoader {',
  '    private final Path dir;',
  '',
  '    public SimpleLoader(Path dir, ClassLoader parent) {',
  '        super(parent);                     // preserve delegation',
  '        this.dir = dir;',
  '    }',
  '',
  '    @Override',
  '    protected Class<?> findClass(String name) throws ClassNotFoundException {',
  '        try {',
  '            byte[] bytes = Files.readAllBytes(',
  '                    dir.resolve(name.replace(\'.\', \'/\') + ".class"));',
  '            return defineClass(name, bytes, 0, bytes.length);',
  '        } catch (IOException e) {',
  '            throw new ClassNotFoundException(name, e);',
  '        }',
  '    }',
  '}',
];

// ── Writing a class loader ─────────────────────────────────────────────────
export function SCustomLoader({ t }) {
  const lines = SIMPLE_LOADER.map((s, i) => {
    if (i === 4 && t >= 6.5 && t < 12) return { s, tone: 'pull' };
    if (i >= 11 && i <= 13 && t >= 12 && t < 19.5) return { s, tone: 'flow' };
    if (i === 9 && t >= 12) return { s, tone: 'flow', toneA: t < 19.5 ? 1 : 0.5 };
    return s;
  });
  const flow = [
    ['findLoadedClass(name)', '1 · already loaded? return it', 'ink'],
    ['parent.loadClass(name)', '2 · delegate upward first', 'violet'],
    ['findClass(name)', '3 · yours: find bytes, defineClass', 'flow'],
  ];
  return (
    <React.Fragment>
      <Code x={96} y={196} w={830} h={572} title="SimpleLoader.java (imports omitted)" a={E(t, 0.4)} fs={17} lh={26} lines={lines} />
      <Panel x={950} y={196} w={874} h={384} title="loadClass(name) · inherited template" right="don't override" tone="bad" a={E(t, 19.5)} />
      {flow.map(([l, s, tone], i) => (
        <React.Fragment key={l}>
          <Box x={976} y={262 + i * 104} w={822} h={84} align="left" label={l} sub={s} fs={21} sfs={17} tone={tone} a={E(t, 20 + i * 1.2)} glow={i === 2 ? win(t, 26.5, 34) : pulse(t, [20.3 + i * 1.2], 1)} />
          {i > 0 && <VArrow x={1387} y1={262 + i * 104 - 18} y2={262 + i * 104 - 2} a={E(t, 20 + i * 1.2)} color={PAL.ink3} />}
        </React.Fragment>
      ))}
      <Badge x={1700} y={512} text="✓ override this" tone="flow" fs={17} a={E(t, 27)} />
      <Console x={950} y={604} w={874} h={164} t={t} a={E(t, 33.5)} fs={17} lh={26} items={[
        { at: 34, text: 'java Delegation', kind: 'cmd' },
        { at: 35.5, text: 'parent=app      -> jdk.internal.loader.ClassLoaders$AppClassLoader@42110406', kind: 'dim' },
        { at: 42, text: 'parent=platform -> SimpleLoader@58644d46', kind: 'ok' },
      ]} />
      <Callout x={96} y={796} w={1728} tone="pull" a={E(t, 26.5)} fs={20} text="Override `findClass`, **not** `loadClass`. `loadClass` is where delegation lives; replace it and a plugin can shadow anything its parent would have provided." />
    </React.Fragment>
  );
}

// ── Hot reload ─────────────────────────────────────────────────────────────
const RELOAD = [
  'for (int v = 1; v <= 3; v++) {',
  '    var loader = new SimpleLoader(Path.of("plugins"), platform);',
  '    Class<?> c = loader.loadClass("Greeter");',
  '    Object g = c.getDeclaredConstructor().newInstance();',
  '    System.out.println("v" + v + ": " + greet(g) + "  class@" + idHash(c));',
  '}',
];
const VERS = [[11, '7f31245a'], [17.5, '266474c2'], [22.5, '66d3c617']];
export function SHotReload({ t }) {
  const [hl, hA] = hlAt(t, [[5.5, 1], [7.5, 2], [11, 4], [13, 1], [17.5, 4], [21, 1], [22.5, 4], [24, -1]]);
  const newest = VERS.filter((v) => t >= v[0]).length - 1;
  return (
    <React.Fragment>
      <Code x={96} y={196} w={900} h={260} title="Reload.java (abridged)" a={E(t, 0.4)} fs={17} lh={32} hl={hl} hlA={hA} lines={RELOAD} />
      <Console x={96} y={478} w={900} h={318} t={t} title="terminal · filtered to Greeter" a={E(t, 5)} fs={17} lh={25} items={[
        { at: 5.5, text: 'java -Xlog:class+load,class+unload Reload', kind: 'cmd' },
        { at: 9.5, text: '[0.026s][info][class,load] Greeter source: __JVM_DefineClass__', kind: 'dim' },
        { at: 10.2, text: '  Greeter.<clinit> runs' }, { at: 11, text: 'v1: Hello, Ada  class@7f31245a', kind: 'ok' },
        { at: 16.2, text: '[0.035s][info][class,load] Greeter source: __JVM_DefineClass__', kind: 'dim' },
        { at: 16.8, text: '  Greeter.<clinit> runs' }, { at: 17.5, text: 'v2: Hello, Ada  class@266474c2', kind: 'ok' },
        { at: 21.4, text: '[0.035s][info][class,load] Greeter source: __JVM_DefineClass__', kind: 'dim' },
        { at: 22, text: '  Greeter.<clinit> runs' }, { at: 22.5, text: 'v3: Hello, Ada  class@66d3c617', kind: 'ok' },
      ]} />
      {VERS.map(([at, h], i) => {
        const old = i < newest;
        const y = 206 + i * 150;
        return (
          <React.Fragment key={h}>
            <Box x={1040} y={y} w={290} h={110} label={`SimpleLoader #${i + 1}`} sub={old ? 'old' : 'new'} fs={21} sfs={17} tone={old ? 'dim' : 'violet'} a={E(t, at - 1.5)} />
            <HArrow x1={1334} x2={1416} y={y + 55} a={E(t, at - 1)} color={old ? PAL.ink3 : PAL.violet} label="defines" lfs={17} />
            <Box x={1420} y={y} w={404} h={110} label={`Greeter · class@${h}`} sub={'own statics · own <clinit> run'} fs={21} sfs={17} tone={old ? 'dim' : 'flow'} a={POP(t, at)} glow={pulse(t, [at + 0.1], 1.2)} />
          </React.Fragment>
        );
      })}
      <Callout x={1040} y={666} w={784} tone="bad" a={E(t, 30)} fs={19} text="An object made by v1 is a `(Greeter, #1)`. Cast it to v3's `Greeter` and you get `Greeter cannot be cast to Greeter`." />
      <Callout x={1040} y={800} w={784} tone="pull" a={E(t, 37.5)} fs={19} text="A class can never change once defined. To reload, you **replace the loader**." />
    </React.Fragment>
  );
}

// ── Unloading ──────────────────────────────────────────────────────────────
const LEAKS = ['a ThreadLocal on a pooled thread', 'a JDBC driver in DriverManager', 'a shutdown hook', 'a logger holding the context loader'];
export function SUnloading({ t }) {
  const dead = t >= 24.5;
  const dA = dead ? 1 - 0.65 * E(t, 24.5, 1) : 1;
  const tone = (tn) => (dead ? 'dim' : tn);
  const reps = t < 37.5 ? 0 : Math.min(20, 1 + Math.floor((t - 37.5) / 0.25));
  return (
    <React.Fragment>
      <Box x={96} y={384} w={180} h={84} label="GC roots" sub="stacks · statics" fs={21} sfs={17} tone="ink" a={E(t, 18.5)} />
      <Arrow pts={[[278, 410], [320, 410], [320, 275], [356, 275]]} draw={M(t, 18.8, 0.6)} a={dead ? 1 - E(t, 24, 0.5) : 1} color={PAL.pull} width={3} />
      <Badge x={186} y={350} text="one reference" tone="pull" fs={17} a={win(t, 19, 24.3)} />
      <Box x={360} y={232} w={280} h={86} label="a Greeter object" sub="heap" fs={21} sfs={17} tone={tone('pink')} a={E(t, 5.5) * dA} />
      <HArrow x1={644} x2={706} y={275} a={E(t, 6.4) * dA} color={PAL.ink2} label="klass" lfs={17} />
      <Box x={710} y={232} w={300} h={86} label="class Greeter" sub="klass + mirror" fs={21} sfs={17} tone={tone('flow')} a={E(t, 6.2) * dA} />
      <VArrow x={860} y1={322} y2={446} a={E(t, 8) * dA} color={PAL.ink2} label="its loader" lfs={17} />
      <Box x={710} y={450} w={300} h={86} label="SimpleLoader" sub="defined these classes" fs={21} sfs={17} tone={tone('violet')} a={E(t, 1) * dA} />
      <HArrow x1={706} x2={644} y={493} a={E(t, 12.4) * dA} color={PAL.ink2} label="holds" lfs={17} />
      <Box x={360} y={450} w={280} h={86} label="every other class" sub="it defined + their statics" fs={20} sfs={17} tone={tone('violet')} a={E(t, 12.2) * dA} />
      {['class Greeter', 'SimpleLoader', 'other classes'].map((s, i) => <Badge key={s} x={[860, 860, 500][i]} y={[230, 448, 448][i]} text="unloaded" tone="bad" fs={17} a={POP(t, 26 + i * 0.4)} />)}
      <Txt x={96} y={580} mono fs={16} color={PAL.ink3} a={E(t, 44.5)}>USUAL LEAK CULPRITS</Txt>
      {LEAKS.map((l, i) => <Badge key={l} x={96 + (i % 2) * 510} y={626 + Math.floor(i / 2) * 44} anchor="left" text={l} tone="pull" fs={17} a={E(t, 45 + i * 0.6)} />)}

      <Console x={1040} y={196} w={784} h={212} t={t} title="Reload · class+unload" a={E(t, 24)} fs={17} lh={25} items={[
        { at: 24.2, text: 'v3: Hello, Ada  class@66d3c617', kind: 'dim' },
        { at: 26, text: '[0.035s][info][class,unload] unloading class Greeter 0x0000007001005400', kind: 'ok' },
        { at: 26.4, text: '[0.035s][info][class,unload] unloading class Greeter 0x0000007001005800', kind: 'ok' },
        { at: 26.8, text: '[0.035s][info][class,unload] unloading class Greeter 0x0000007001001000', kind: 'ok' },
        { at: 27.4, text: 'after GC' },
      ]} />
      <Console x={1040} y={430} w={784} h={268} t={t} title="Reload keep · one instance kept in a static list" a={E(t, 31.5)} fs={17} lh={25} items={[
        { at: 31.8, text: 'java -Xlog:class+unload Reload keep', kind: 'cmd' },
        { at: 32.2, text: '  Greeter.<clinit> runs' }, { at: 32.4, text: 'v1: Hello, Ada  class@7f31245a' },
        { at: 32.6, text: '  Greeter.<clinit> runs' }, { at: 32.8, text: 'v2: Hello, Ada  class@266474c2' },
        { at: 33, text: '  Greeter.<clinit> runs' }, { at: 33.2, text: 'v3: Hello, Ada  class@66d3c617' },
        { at: 34, text: 'after GC', kind: 'err' },
      ]} />
      <Badge x={1700} y={673} text="nothing unloaded" tone="bad" fs={17} a={E(t, 34.5)} />

      <Panel x={96} y={730} w={1728} h={176} title="metaspace · one copy of every class per redeploy" right={reps ? `${reps} redeploy${reps > 1 ? 's' : ''}` : ''} tone={reps >= 20 ? 'bad' : 'violet'} a={E(t, 37.5)} />
      {Array.from({ length: reps }).map((_, i) => <div key={i} style={{ position: 'absolute', left: 124 + i * 66, top: 800, width: 58, height: 70, borderRadius: 6, background: hexA(PAL.violet, 0.22), border: `2px solid ${hexA(reps >= 20 ? PAL.bad : PAL.violet, 0.8)}` }}></div>)}
      <Badge x={1640} y={835} text="OutOfMemoryError: Metaspace" tone="bad" fs={17} solid a={POP(t, 44.5)} />
    </React.Fragment>
  );
}

// ── Traps ──────────────────────────────────────────────────────────────────
const TRAPS = [
  [3, '“NoClassDefFoundError means a jar is missing”', 'Often a static initialiser threw earlier. Search back for `ExceptionInInitializerError`.'],
  [9.5, '“Greeter cannot be cast to Greeter is impossible”', 'Two loaders, two classes. Print `getClassLoader()` on both sides.'],
  [16, '“I’ll override loadClass”', 'That breaks parent delegation. Override `findClass`.'],
  [22, '“The static block runs when the class loads”', 'Initialisation is lazy, and compile-time constants never trigger it.'],
  [28.5, '“Old classes get unloaded after a redeploy”', 'Only when the whole loader is unreachable. One stray reference leaks it all.'],
];
export function STraps({ t }) {
  return TRAPS.map(([at, myth, real], i) => {
    const y = 196 + i * 140;
    return (
      <React.Fragment key={i}>
        <Box x={96} y={y} w={780} h={120} label={myth} mono={false} fs={23} tone="bad" a={E(t, at)} strike={t > at + 2} style={{ whiteSpace: 'normal' }} />
        <HArrow x1={888} x2={948} y={y + 60} a={E(t, at + 1.5)} color={PAL.flow} />
        <Card x={960} y={y} w={864} h={120} a={E(t, at + 1.6)} tone="flow" title={real} tfs={23} />
      </React.Fragment>
    );
  });
}

// ── Recap ──────────────────────────────────────────────────────────────────
const RECAP = [
  [3, '1', 'Three phases', 'load → verify, prepare, resolve → initialise. Defaults first, your values in `<clinit>`.'],
  [9, '2', 'Lazy, once, locked', 'Loaded when first needed, initialised on the first trigger, exactly once, under a lock.'],
  [15, '3', 'Verification', 'A real security boundary. Bad bytecode is rejected before any of it runs.'],
  [20.5, '4', 'Failed init', 'Erroneous for good. Later uses throw `NoClassDefFoundError: Could not initialize`.'],
  [26, '5', 'Delegation', 'Ask the parent first. Nobody can replace `java.lang.String`.'],
  [31.5, '6', 'Identity', 'Name **+ loader**. Explains `X cannot be cast to X`, hot reload, and leaks.'],
];
export function SRecap({ t }) {
  return RECAP.map(([at, n, title, sub], i) => <Card key={n} x={96 + (i % 3) * 584} y={200 + Math.floor(i / 3) * 330} w={560} h={300} num={n} title={title} sub={sub} tfs={34} sfs={24} a={E(t, at)} tone={i === 5 ? 'pull' : undefined} glow={i === 5 ? win(t, 32, 40) : 0} />);
}
