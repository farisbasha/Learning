// 8.2 scenes, part 3: the loader hierarchy, parent delegation, class identity, CNFE vs NCDFE.
const { PAL, MOTION, lin, lerp, win, pulse, step, track, hlAt, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Mark, Val, Brace, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;
import { Tok } from './scenes1.jsx';

// ── The three built-in loaders ─────────────────────────────────────────────
const WHO = [
  [1.5, 'java Who', 'cmd'],
  [13.6, 'String     -> null', 'ok'],
  [19.6, 'Connection -> jdk.internal.loader.ClassLoaders$PlatformClassLoader@bba30dd'],
  [32, 'Greeter    -> jdk.internal.loader.ClassLoaders$AppClassLoader@42110406', 'ok'],
  [33, '  parent   -> jdk.internal.loader.ClassLoaders$PlatformClassLoader@bba30dd', 'ok'],
  [34, '  parent   -> null', 'ok'],
  [38.6, 'DocumentBuilder -> null', 'err'],
  [39.2, 'Logger     -> null', 'err'],
  [39.8, 'HttpClient -> jdk.internal.loader.ClassLoaders$PlatformClassLoader@bba30dd'],
];
export function SHierarchy({ t }) {
  const L = [
    { y: 200, label: 'bootstrap', sub: 'native, inside the JVM · java.base, java.xml, java.logging …', tone: 'pull', at: 6.5, lit: [6.5, 19.5] },
    { y: 380, label: 'platform', sub: 'JDK modules: java.sql, java.net.http …', tone: 'violet', at: 19.5, lit: [19.5, 26] },
    { y: 560, label: 'application', sub: 'your classpath and module path', tone: 'flow', at: 26, lit: [26, 32] },
    { y: 740, label: 'custom loaders', sub: 'app servers · plugins · OSGi · test runners', tone: 'ink', at: 44, lit: [44, 50], dashed: true },
  ];
  return (
    <React.Fragment>
      {L.map((l, i) => (
        <React.Fragment key={l.label}>
          <Box x={96} y={l.y} w={760} h={i === 3 ? 100 : 120} align="left" label={l.label} sub={l.sub} fs={28} sfs={17} tone={l.tone} dashed={l.dashed} a={E(t, l.at)} glow={win(t, l.lit[0], l.lit[1]) * 0.8 + (i < 3 ? win(t, 32, 38) * 0.5 : 0)} />
          {i > 0 && <VArrow x={476} y1={l.y - 4} y2={L[i - 1].y + (i === 3 ? 124 : 124)} a={E(t, l.at + 0.4)} color={PAL.ink2} label="parent" lfs={17} />}
        </React.Fragment>
      ))}
      <Badge x={700} y={224} text="getClassLoader() → null" tone="pull" fs={17} a={E(t, 13.5)} />
      <Code x={900} y={200} w={924} h={160} title="Who.java (abridged)" a={E(t, 1)} fs={17} lh={26} lines={['System.out.println("String  -> " + String.class.getClassLoader());', 'ClassLoader l = Greeter.class.getClassLoader();', 'System.out.println("  parent -> " + l.getParent()); // …']} />
      <Console x={900} y={380} w={924} h={300} t={t} a={E(t, 1.2)} fs={17} lh={25} items={WHO.map(([at, text, kind]) => ({ at, text, kind }))} />
      <Callout x={900} y={704} w={924} tone="bad" a={E(t, 38.5)} fs={19} title="the split is per module" text="`java.xml` and `java.logging` print `null`: they are **bootstrap** modules, not platform ones. Many notes get this wrong." />
    </React.Fragment>
  );
}

// ── Parent delegation, animated ────────────────────────────────────────────
const LD = [{ y: 210, name: 'bootstrap', tone: 'pull' }, { y: 420, name: 'platform', tone: 'violet' }, { y: 630, name: 'app', tone: 'flow' }];
const RAILX = 180;
const cy = (i) => LD[i].y + 55;
export function SDelegation({ t }) {
  const [hl, hA] = hlAt(t, [[5.5, 2], [11.5, 4], [29, 6], [32, 8], [36.5, 2], [39.5, -1]]);
  const searchA = [win(t, 18, 23.6) + win(t, 46.6, 53), win(t, 24.4, 28.6), win(t, 29.6, 36)];
  const found = t >= 31.2;
  return (
    <React.Fragment>
      {LD.map((l, i) => (
        <React.Fragment key={l.name}>
          <Box x={290} y={l.y} w={360} h={110} label={l.name} sub={i === 2 && found ? 'cache: Greeter' : 'cache: —'} fs={28} sfs={17} tone={l.tone} a={E(t, 0.6 + i * 0.2)} glow={[win(t, 14.6, 23.6) + win(t, 46, 52), win(t, 12.4, 13.8) + win(t, 24.4, 28.6), win(t, 5.5, 11.5) + win(t, 29.6, 36) + pulse(t, [38.2], 1)][i]} />
          {i > 0 && <VArrow x={470} y1={l.y - 4} y2={LD[i - 1].y + 114} a={E(t, 1.2)} color={PAL.ink3} label="parent" lfs={17} />}
          <Arrow from={[654, cy(i)]} to={[696, cy(i)]} draw={searchA[i] > 0.05 ? 1 : 0} a={searchA[i]} color={i === 2 || (i === 0 && t > 46) ? PAL.flow : PAL.bad} />
        </React.Fragment>
      ))}
      <Box x={700} y={210} w={420} h={110} align="left" label="core modules" sub="jrt: java.base, java.xml, …" fs={22} sfs={17} tone="ink" a={E(t, 1.4)} />
      <Box x={700} y={420} w={420} h={110} align="left" label="platform modules" sub="jrt: java.sql, java.net.http, …" fs={22} sfs={17} tone="ink" a={E(t, 1.6)} />
      <Panel x={700} y={630} w={420} h={110} title="classpath: ./" a={E(t, 1.8)}>
        <div style={{ padding: '8px 18px', font: `500 18px ${MONO}`, color: PAL.ink2, lineHeight: 1.5 }}>
          <div style={{ color: found ? PAL.flow : PAL.ink2 }}>Greeter.class</div>
          <div style={{ color: PAL.bad, opacity: E(t, 42.4), textDecoration: t > 49 ? 'line-through' : 'none' }}>java/lang/String.class · fake</div>
        </div>
      </Panel>
      <Mark x={1094} y={232} ok={false} a={POP(t, 20) * (1 - E(t, 40))} />
      <Mark x={1094} y={442} ok={false} a={POP(t, 26.2) * (1 - E(t, 40))} />
      <Mark x={1094} y={652} ok a={POP(t, 31.2) * (1 - E(t, 40))} />
      <Mark x={1094} y={232} ok a={POP(t, 47.8)} />

      <Tok t={t} keys={[[5.5, RAILX, cy(2)], [11.8, RAILX, cy(2)], [12.8, RAILX, cy(1)], [13.8, RAILX, cy(1)], [14.8, RAILX, cy(0)], [24, RAILX, cy(0)], [25, RAILX, cy(1)], [29, RAILX, cy(1)], [30, RAILX, cy(2)]]} text="Greeter?" w={150} fs={18} tone="pull" until={36} />
      <Tok t={t} keys={[[37.4, RAILX, cy(2) + 120], [38.2, RAILX, cy(2)]]} text="Greeter?" w={150} fs={18} tone="flow" until={39.4} glowAt={38.2} />
      <Badge x={RAILX} y={cy(2) + 80} text="1 · cache hit" tone="flow" fs={17} a={win(t, 38.2, 41.6)} />
      <Tok t={t} keys={[[43.6, RAILX, cy(2)], [45.6, RAILX, cy(0)], [52, RAILX, cy(0)]]} text="String?" w={140} fs={18} tone="bad" until={53} />
      <Arrow pts={[[278, cy(2)], [278, cy(0)]]} draw={M(t, 44, 1.4)} a={1 - E(t, 53)} color={PAL.bad} dashed />
      <Badge x={RAILX} y={cy(1)} text="via java.base" tone="pull" fs={17} a={win(t, 45, 53)} />
      <Badge x={910} y={370} text="found: the real String" tone="pull" fs={17} a={win(t, 48, 53.4)} />

      <Code x={1170} y={210} w={654} h={368} title="java.lang.ClassLoader (simplified)" a={E(t, 2)} fs={17} lh={30} hl={hl} hlA={hA} lines={[
        'loadClass(name) {', '', '    c = findLoadedClass(name);       // 1', '    if (c == null) {', '        c = parent.loadClass(name);  // 2', '        if (c == null)', '            c = findClass(name);     // 3', '    }', '    return c;', '}',
      ]} />
      <Callout x={1170} y={598} w={654} tone="violet" a={E(t, 46)} fs={17} title="JDK 9+ detail" text="The built-in loaders first ask which **module** owns the package. `java.lang` lives in `java.base`, so the request goes straight to bootstrap." />
      <Console x={700} y={770} w={1124} h={168} t={t} a={E(t, 42.5)} fs={17} lh={25} items={[
        { at: 43, text: 'java -Xlog:class+load -cp out:. UseIt | grep "String "', kind: 'cmd' },
        { at: 49, text: '[0.009s][info][class,load] java.lang.String source: shared objects file', kind: 'ok' },
        { at: 54, text: 'java Prohibited    # defineClass("java.lang.String", …)', kind: 'cmd' },
        { at: 54.8, text: 'Exception in thread "main" java.lang.SecurityException: Prohibited package name: java.lang', kind: 'err' },
      ]} />
      <Callout x={96} y={790} w={560} tone="pull" a={E(t, 56)} fs={19} text="Delegation is **security**: nothing below bootstrap can replace a core class." />
    </React.Fragment>
  );
}

// ── Identity = name + loader ───────────────────────────────────────────────
const TWO = [
  'var a = new SimpleLoader(Path.of("plugins"), platform);',
  'var b = new SimpleLoader(Path.of("plugins"), platform);',
  'Class<?> ga = a.loadClass("Greeter");',
  'Class<?> gb = b.loadClass("Greeter");',
  'System.out.println(ga == gb);                  // false',
  'Object o = gb.getDeclaredConstructor().newInstance();',
  'Greeter g = (Greeter) o;                       // boom',
];
export function SIdentity({ t }) {
  const [hl, hA] = hlAt(t, [[7.5, 0], [9.5, 1], [13.5, 2], [15.5, 3], [20, 4], [27.5, 5], [33.5, 6]]);
  const cols = [
    { x: 1030, name: 'app loader', key: '(Greeter, app)', at: 20.5, tone: 'flow' },
    { x: 1300, name: 'loader a', key: '(Greeter, a)', at: 14, tone: 'violet' },
    { x: 1570, name: 'loader b', key: '(Greeter, b)', at: 16, tone: 'pink' },
  ];
  const boom = t >= 39.5;
  const shake = t > 39.5 && t < 40.6 ? Math.sin(t * 60) * 7 * (40.6 - t) : 0;
  return (
    <React.Fragment>
      <Code x={96} y={196} w={860} h={292} title="TwoLoaders.java (abridged)" a={E(t, 0.4)} fs={17} lh={32} hl={hl} hlA={hA} lines={TWO} />
      <Panel x={1000} y={196} w={824} h={470} title="metaspace · three classes named Greeter" tone="violet" a={E(t, 7.5)} />
      {cols.map((c, i) => (
        <React.Fragment key={c.name}>
          <Box x={c.x} y={262} w={240} h={66} label={c.name} fs={20} tone={c.tone} a={E(t, i === 0 ? 20.5 : 7.8 + i * 1.6)} />
          <VArrow x={c.x + 120} y1={332} y2={374} a={E(t, c.at)} color={toneColor(c.tone)} label="defines" lfs={17} />
          <Box x={c.x} y={378} w={240} h={100} label="Greeter" sub={c.key} fs={24} sfs={17} tone={c.tone} a={POP(t, c.at)} glow={pulse(t, [c.at + 0.1], 1.2) + (i === 0 ? win(t, 33.5, 39.5) * 0.7 : 0) + (i === 2 ? win(t, 27.5, 33.5) * 0.7 : 0)} />
        </React.Fragment>
      ))}
      <Badge x={1412} y={506} text="same name · same bytes · different classes" tone="pull" fs={17} a={win(t, 17.5, 27.5)} />
      <Box x={1570 + shake} y={560} w={240} h={80} label="o" sub="header → (Greeter, b)" fs={22} sfs={17} tone="pink" a={E(t, 28)} glow={boom ? 0.8 : 0} />
      <Arrow pts={[[1566, 600], [1150, 600], [1150, 482]]} draw={M(t, 34, 1)} color={boom ? PAL.bad : PAL.pull} dashed />
      <Badge x={1330} y={572} text="cast to (Greeter, app)?" tone={boom ? 'bad' : 'pull'} fs={17} a={E(t, 34.5)} />
      <Mark x={1150} y={540} ok={false} a={POP(t, 39.5)} />

      <Console x={96} y={508} w={860} h={200} t={t} a={E(t, 19.5)} fs={17} lh={26} items={[
        { at: 19.8, text: 'java TwoLoaders', kind: 'cmd' },
        { at: 20.4, text: 'Greeter == Greeter ? false', kind: 'ok' },
        { at: 28.2, text: '  Greeter.<clinit> runs' },
        { at: 28.8, text: "o's loader: SimpleLoader@8bcc55f" },
        { at: 33.8, text: "app Greeter's loader: jdk.internal.loader.ClassLoaders$AppClassLoader@42110406" },
      ]} />
      <Panel x={96} y={730} w={1728} h={196} title="stderr" tone="bad" a={E(t, 39.5)} glow={pulse(t, [39.6], 1.4)}>
        <div style={{ padding: '12px 22px', font: `500 19px ${MONO}`, color: PAL.bad, lineHeight: 1.45 }}>
          <div>{'Exception in thread "main" java.lang.ClassCastException: class Greeter cannot be cast to class Greeter'}</div>
          <div style={{ opacity: E(t, 47), color: E(t, 47) > 0.5 ? PAL.pull : PAL.bad }}>{"(Greeter is in unnamed module of loader SimpleLoader @8bcc55f; Greeter is in unnamed module of loader 'app')"}</div>
          <div style={{ color: PAL.ink2 }}>{'\tat TwoLoaders.main(TwoLoaders.java:13)'}</div>
        </div>
      </Panel>
    </React.Fragment>
  );
}

// ── ClassNotFoundException vs NoClassDefFoundError ─────────────────────────
export function SCnfeNcdfe({ t }) {
  return (
    <React.Fragment>
      <Txt x={96} y={192} mono fs={17} color={PAL.flow} a={E(t, 4.5)}>EXPLICIT LOOKUP</Txt>
      <Code x={96} y={222} w={640} h={110} title="Lookup.java" a={E(t, 5)} fs={20} lh={34} lines={['Class.forName("Greetr");    // typo']} />
      <Txt x={96} y={350} w={640} fs={20} color={PAL.ink2} a={E(t, 6)}>You asked a loader for a class **by name**. It isn't there, so the loader throws a checked exception.</Txt>
      <Console x={752} y={192} w={1072} h={268} t={t} a={E(t, 5)} fs={17} lh={25} items={[
        { at: 5.5, text: 'java Lookup', kind: 'cmd' },
        { at: 6.5, text: 'Exception in thread "main" java.lang.ClassNotFoundException: Greetr', kind: 'err' },
        { at: 7, text: '\tat java.base/jdk.internal.loader.BuiltinClassLoader.loadClass(BuiltinClassLoader.java:641)', kind: 'dim' },
        { at: 7.2, text: '\tat java.base/jdk.internal.loader.ClassLoaders$AppClassLoader.loadClass(ClassLoaders.java:188)', kind: 'dim' },
        { at: 7.4, text: '\tat java.base/java.lang.ClassLoader.loadClass(ClassLoader.java:525)', kind: 'dim' },
        { at: 7.6, text: '\tat java.base/java.lang.Class.forName0(Native Method)', kind: 'dim' },
        { at: 7.8, text: '\tat java.base/java.lang.Class.forName(Class.java:377)', kind: 'dim' },
        { at: 8, text: '\tat Lookup.main(Lookup.java:3)', kind: 'dim' },
      ]} />

      <Txt x={96} y={474} mono fs={17} color={PAL.bad} a={E(t, 20)}>IMPLICIT · THE JVM NEEDED IT</Txt>
      <Code x={96} y={504} w={640} h={142} title="Main.java · compiled fine" a={E(t, 20.5)} fs={18} lh={32} lines={['System.out.println("main starts");', { s: 'System.out.println(Greeter.greet("Ada"));', tone: 'bad', toneA: win(t, 27, 34) }]} />
      <Txt x={96} y={662} w={640} fs={20} color={PAL.ink2} a={E(t, 27)}>Then `rm Greeter.class`. Line 4's `invokestatic` can't resolve.</Txt>
      <Txt x={96} y={724} w={630} fs={19} color={PAL.pull} a={E(t, 41)}>{'3rd kind: `Could not initialize class X` means a `<clinit>` failed earlier.'}</Txt>
      <Console x={752} y={476} w={1072} h={293} t={t} a={E(t, 21)} fs={17} lh={25} items={[
        { at: 21.5, text: 'java Main', kind: 'cmd' },
        { at: 22.5, text: 'main starts' },
        { at: 27.5, text: 'Exception in thread "main" java.lang.NoClassDefFoundError: Greeter', kind: 'err' },
        { at: 27.8, text: '\tat Main.main(Main.java:4)', kind: 'dim' },
        { at: 33.5, text: 'Caused by: java.lang.ClassNotFoundException: Greeter', kind: 'ok' },
        { at: 33.8, text: '\tat java.base/jdk.internal.loader.BuiltinClassLoader.loadClass(BuiltinClassLoader.java:641)', kind: 'dim' },
        { at: 34, text: '\tat java.base/jdk.internal.loader.ClassLoaders$AppClassLoader.loadClass(ClassLoaders.java:188)', kind: 'dim' },
        { at: 34.2, text: '\tat java.base/java.lang.ClassLoader.loadClass(ClassLoader.java:525)', kind: 'dim' },
        { at: 34.4, text: '\t... 1 more', kind: 'dim' },
      ]} />
      <Table x={96} y={786} cols={[240, 744, 744]} head={['', 'ClassNotFoundException', 'NoClassDefFoundError']} a={E(t, 46)} fs={18} rh={36}
        colColors={[PAL.ink3, PAL.flow, PAL.bad]} rows={[['kind', 'checked Exception', 'Error'], ['trigger', 'explicit: forName, loadClass', 'implicit: the JVM linking or initialising'], ['usual cause', 'a typo · an absent optional dependency', 'classpath mismatch · or a failed <clinit>']]} />
    </React.Fragment>
  );
}
