// 8.2 scenes, part 2: verification, initialisation triggers, non-triggers, the init lock, failed init.
const { PAL, MOTION, lin, lerp, win, pulse, step, track, hlAt, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Mark, Val, Brace, Bytes, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;
import { Tok, StateLane } from './scenes1.jsx';

// ── Verification: what it checks ───────────────────────────────────────────
const CHECKS = [
  [6, 'the operand stack never under- or overflows', 'its depth stays within max_stack on every path'],
  [11.5, 'types match on every path', 'no int used as a reference, no reference used as an int'],
  [18, 'final is respected', 'no subclass of a final class, no stray writes to final fields'],
  [19, 'jumps land on instruction boundaries', 'never into the middle of an instruction'],
  [20, 'locals are assigned before use', 'no reading a slot that was never written'],
];
export function SVerifyChecks({ t }) {
  const blocked = t > 9 && t < 25;
  return (
    <React.Fragment>
      {CHECKS.map(([at, l, s], i) => (
        <Box key={l} x={96} y={196 + i * 112} w={900} h={96} align="left" label={l} sub={s} mono={false} fs={25} sfs={19} tone={i === 1 ? 'pull' : 'flow'} a={E(t, at)} glow={pulse(t, [at + 0.1], 1.2)} />
      ))}
      <Box x={1100} y={196} w={724} h={80} label="untrusted .class bytes" sub="from disk, network, a generator…" fs={22} tone="ink" a={E(t, 1)} />
      <VArrow x={1462} y1={280} y2={330} a={E(t, 1.4)} color={PAL.ink2} />
      <Box x={1100} y={334} w={724} h={100} label="verifier" sub="runs once per class, at link time" fs={30} tone="pull" a={E(t, 1.6)} glow={0.3 + 0.5 * pulse(t, [6, 11.5, 18], 1.2)} />
      <VArrow x={1350} y1={438} y2={494} a={E(t, 2.4)} color={PAL.flow} label="proven safe" lfs={17} />
      <Box x={1100} y={498} w={500} h={80} label="JVM executes it" fs={22} tone="flow" a={E(t, 2.6)} />
      <VArrow x={1712} y1={438} y2={516} a={E(t, 3)} color={PAL.bad} label="rejected" lfs={17} />
      <Badge x={1740} y={538} text="VerifyError" tone="bad" fs={17} a={E(t, 3.2)} s={blocked ? 1 + 0.08 * Math.sin(t * 6) : 1} />
      {['cannot forge a reference', 'cannot read arbitrary memory', 'cannot escape the type system'].map((s, i) => (
        <Badge key={s} x={1100} y={624 + i * 46} anchor="left" text={'✗ ' + s} tone="violet" fs={18} a={E(t, 25.5 + i * 0.7)} />
      ))}
      <Console x={96} y={780} w={1728} h={158} t={t} a={E(t, 32)} fs={17} lh={30} items={[
        { at: 32.3, text: 'java -XX:+UnlockDiagnosticVMOptions -XX:+PrintFlagsFinal -version | grep BytecodeVerification', kind: 'cmd' },
        { at: 33.2, text: '     bool BytecodeVerificationLocal                = false                                  {diagnostic} {default}', kind: 'dim' },
        { at: 33.6, text: '     bool BytecodeVerificationRemote               = true                                   {diagnostic} {default}', kind: 'ok' },
      ]} />
      <Badge x={1460} y={881} anchor="left" text="← boot loader: trusted" tone="pull" fs={17} a={E(t, 35)} />
      <Badge x={1460} y={911} anchor="left" text="← every other loader: verified" tone="flow" fs={17} a={E(t, 36)} />
    </React.Fragment>
  );
}

// ── Break the bytecode ─────────────────────────────────────────────────────
const BAD_SRC = ['public class Bad {', '    static int twice(String s, int x) {', '        return x + x;', '    }', '    public static void main(String[] args) {', '        System.out.println(twice("hi", 21));', '    }', '}'];
export function SVerifyError({ t }) {
  const patched = t >= 9;
  const [hl, hA] = hlAt(t, [[1.5, 0], [3, 1], [4.5, 2], [6, 3], [7, -1], [20.8, 0], [23, 1], [25.2, 2]]);
  const left = 1 - E(t, 41.2, 0.5);
  const fail = t >= 26;
  const shake = t > 25.6 && t < 26.6 ? Math.sin(t * 60) * 6 * (26.6 - t) : 0;
  const steps = [['0: aload_0', 'push String', 20.8], ['1: iload_1', 'push int', 23], ['2: iadd', 'needs int, int', 25.2]];
  const dv = 1 - 0.75 * E(t, 41.5);
  return (
    <React.Fragment>
      <Code x={96} y={196} w={760} h={308} title="Bad.java" a={E(t, 0.4)} fs={18} lh={30} lines={BAD_SRC.map((s, i) => (i === 2 ? { s, tone: 'pull', toneA: win(t, 1, 8) } : s))} />
      <Code x={96} y={524} w={760} h={204} title="javap -c · twice" lang="bytecode" a={E(t, 1) * left} fs={22} lh={34} hl={hl} hlA={hA}
        lines={[patched ? { s: '0: aload_0      // patched', tone: 'bad' } : '0: iload_1', '1: iload_1', '2: iadd', '3: ireturn']} />
      <Bytes x={96} y={750} unit={120} h={72} ruler={false} a={E(t, 7) * left} fs={24} sfs={17} cells={[
        { n: 1, label: patched ? '2a' : '1b', sub: patched ? 'aload_0' : 'iload_1', tone: patched ? 'bad' : 'flow', glow: pulse(t, [9], 1.2) },
        { n: 1, label: '1b', sub: 'iload_1', tone: 'flow' }, { n: 1, label: '60', sub: 'iadd', tone: 'pull' }, { n: 1, label: 'ac', sub: 'ireturn', tone: 'pink' }]} />
      <Txt x={600} y={770} mono fs={18} color={PAL.ink2} w={250} a={E(t, 9.4) * left}>one byte changed in Bad.class</Txt>

      <div style={{ opacity: dv }}>
      <Panel x={900} y={196} w={924} h={380} title="verifier · tracks types, not values" tone="pull" a={E(t, 14)} />
      <Txt x={930} y={258} mono fs={16} color={PAL.ink3} a={E(t, 15)}>LOCALS AT ENTRY</Txt>
      <Box x={930} y={286} w={200} h={64} label="String" sub="slot 0 · s" fs={21} sfs={17} tone="violet" a={E(t, 15.4)} />
      <Box x={1146} y={286} w={200} h={64} label="int" sub="slot 1 · x" fs={21} sfs={17} tone="flow" a={E(t, 15.8)} />
      <Txt x={930} y={384} mono fs={16} color={PAL.ink3} a={E(t, 16)}>OPERAND STACK</Txt>
      <div style={{ position: 'absolute', left: 930, top: 414, width: 420, height: 84, border: `1.5px dashed ${PAL.line2}`, borderRadius: 12, opacity: E(t, 16) }}></div>
      <Tok t={t} keys={[[20.9, 1030, 318], [21.8, 1030 + shake, 456]]} text="String" tone={fail ? 'bad' : 'violet'} w={180} glowAt={fail ? 26 : null} />
      <Tok t={t} keys={[[23.1, 1246, 318], [24, 1246, 456]]} text="int" tone="flow" w={180} />
      {steps.map(([ins, what, at], i) => (
        <React.Fragment key={ins}>
          <Txt x={1400} y={262 + i * 64} mono fs={20} weight={600} color={i === 2 && fail ? PAL.bad : PAL.pull} a={E(t, at)}>{ins}</Txt>
          <Txt x={1580} y={264 + i * 64} mono fs={18} color={PAL.ink2} a={E(t, at + 0.3)}>{what}</Txt>
        </React.Fragment>
      ))}
      <Mark x={1790} y={402} ok={false} a={POP(t, 26)} />
      <Txt x={1400} y={450} w={400} fs={19} color={PAL.bad} a={E(t, 26.4)}>{'stack holds { String, int }: rejected'}</Txt>
      </div>
      <Badge x={1362} y={386} text="verifier switched off" tone="bad" fs={22} solid a={POP(t, 42)} />
      <Console x={900} y={596} w={924} h={276} t={t} a={E(t, 26.5) * left} fs={17} lh={25} items={[
        { at: 26.6, text: 'java Bad', kind: 'cmd' },
        { at: 27.2, text: 'Error: Unable to initialize main class Bad', kind: 'err' },
        { at: 27.6, text: 'Caused by: java.lang.VerifyError: Bad type on operand stack', kind: 'err' },
        { at: 28, text: 'Exception Details:' }, { at: 28.2, text: '  Location:' },
        { at: 28.4, text: '    Bad.twice(Ljava/lang/String;I)I @2: iadd', kind: 'ok' },
        { at: 28.6, text: '  Reason:' },
        { at: 28.8, text: "    Type 'java/lang/String' (current frame, stack[0]) is not assignable to integer", kind: 'ok' },
      ]} />

      <Console x={96} y={600} w={1728} h={172} t={t} a={E(t, 41.5)} fs={17} lh={26} items={[
        { at: 42, text: 'java -Xverify:none Bad', kind: 'cmd' },
        { at: 43, text: 'OpenJDK 64-Bit Server VM warning: Options -Xverify:none and -noverify were deprecated in JDK 13 and will likely be removed in a future release.', kind: 'dim' },
        { at: 48, text: '-2014206267', kind: 'err' },
      ]} />
      <Callout x={96} y={796} w={1728} tone="bad" a={E(t, 49)} fs={21} title="what just happened" text="`iadd` added the `String` reference's raw bits to 21 and printed the result. A reference was read as a number. The verifier exists so that can never happen." />
    </React.Fragment>
  );
}

// ── The six triggers ───────────────────────────────────────────────────────
const TRIG = [
  [4.5, '1', 'an instance is created', 'new Greeter()', 'new'],
  [10, '2', 'a static method is called', 'Greeter.greet("Ada")', 'invokestatic'],
  [15, '3', 'a static field is read or written', 'Greeter.count++', 'getstatic · putstatic'],
  [22, '4', 'a subclass is initialised', 'new Sub()  // Base goes first', 'superclass first, up to Object'],
  [28.5, '5', 'it is the main class', 'java Main', 'before main() runs'],
  [34, '6', 'reflection asks for it', 'Class.forName("Greeter")', 'forName · newInstance · invoke'],
];
export function STriggers({ t }) {
  return (
    <React.Fragment>
      {TRIG.map(([at, n, title, code, bc], i) => {
        const x = 96 + (i % 3) * 584, y = 196 + Math.floor(i / 3) * 312;
        const a = E(t, at);
        const isInsn = i < 3;
        return (
          <React.Fragment key={n}>
            <Panel x={x} y={y} w={560} h={292} a={a} tone={isInsn ? 'pull' : 'flow'} glow={win(t, at, at + 5.5) * 0.8 + (isInsn ? win(t, 40, 48) * 0.6 : 0)} />
            <Txt x={x + 26} y={y + 22} mono fs={20} weight={600} color={isInsn ? PAL.pull : PAL.flow} a={a}>{n}</Txt>
            <Txt x={x + 26} y={y + 54} fs={28} weight={600} w={510} a={a}>{title}</Txt>
            <Box x={x + 26} y={y + 140} w={508} h={60} align="left" label={<span>{window.AN.hiJava(code)}</span>} fs={20} a={a} />
            <Badge x={x + 26} y={y + 246} anchor="left" text={bc} tone={isInsn ? 'pull' : 'flow'} fs={17} a={E(t, at + 0.6)} />
          </React.Fragment>
        );
      })}
      <Badge x={1562} y={442} anchor="left" text="✗ not for constants" tone="bad" fs={17} a={E(t, 18)} />
      <Callout x={96} y={836} w={1728} tone="pull" a={E(t, 40)} fs={21} text="Three of the six are bytecode instructions. A class initialises the first time one of them **executes**, never earlier." />
    </React.Fragment>
  );
}

// ── What does NOT initialise ───────────────────────────────────────────────
const NT_SRC = [
  'Loud[] arr = new Loud[10];         // 1',
  'System.out.println(Loud.NAME);     // 2',
  'Class<?> c = Loud.class;           // 3',
  'Class.forName("Loud", false, ld);  // 4',
  'System.out.println(Sub.shared);    // 5',
  'System.out.println(Loud.ITEMS);    // 6',
  'new Sub();                         // 7',
];
const NT_DEFS = [
  'class Loud { static { print("Loud initialised"); }',
  '  static final String NAME = "x";                // constant',
  '  static final List<String> ITEMS = List.of(); } // not one',
  'class Base { static int shared = 1; static { print(…); } }',
  'class Sub extends Base { static { print(…); } }',
];
const NTP = 'file:…/';
const NT_LOG = [
  [1, 'java -Xlog:class+load,class+init T', 'cmd'],
  [6.3, '1. new Loud[10]'], [7.2, `[0.020s][info][class,load] Loud source: ${NTP}`, 'dim'],
  [13.8, '2. Loud.NAME'], [14.6, 'x'],
  [21.3, '3. Loud.class'], [24.3, '4. Class.forName("Loud", false, ...)'],
  [28.3, '5. Sub.shared   (field declared in Base)'],
  [29, `[0.021s][info][class,load] Base source: ${NTP}`, 'dim'], [29.4, `[0.021s][info][class,load] Sub source: ${NTP}`, 'dim'],
  [30.2, "[0.021s][info][class,init] 292 Initializing 'Base' (0x0000007001000400)", 'ok'], [30.8, '  Base initialised', 'ok'], [31.4, '1'],
  [42.3, '6. Loud.ITEMS'], [43.4, "[0.021s][info][class,init] 293 Initializing 'Loud' (0x0000007001000a08)", 'ok'], [44, '  Loud initialised', 'ok'], [44.6, '[]'],
  [50.3, '7. new Sub()'], [51, "[0.021s][info][class,init] 295 Initializing 'Sub' (0x0000007001001000)", 'ok'], [51.6, '  Sub initialised', 'ok'],
];
export function SNotTriggers({ t }) {
  const [hl, hA] = hlAt(t, [[6, 0], [13.5, 1], [21, 2], [24, 3], [28, 4], [42, 5], [50, 6]]);
  const yes = (at) => (t >= at ? '✓' : '—');
  const rows = [['Loud', yes(7.2), yes(43.4)], ['Base', yes(29), yes(30.2)], ['Sub', yes(29.4), yes(51)]];
  return (
    <React.Fragment>
      <Code x={96} y={196} w={820} h={306} title="T.java · main (abridged)" a={E(t, 0.4)} fs={18} lh={34} hl={hl} hlA={hA} lines={NT_SRC} />
      <Code x={96} y={522} w={820} h={226} title="the classes (abridged)" a={E(t, 1)} fs={17} lh={30} lines={NT_DEFS.map((s, i) => ({ s, tone: i === 1 ? 'violet' : i === 2 ? 'pull' : undefined, toneA: i === 1 ? win(t, 13.5, 21) : i === 2 ? win(t, 42, 50) : 0 }))} />
      <Table x={96} y={770} cols={[300, 260, 260]} head={['class', 'loaded', 'initialised']} rows={rows} a={E(t, 4)} fs={20} rh={42}
        colColors={[PAL.ink, PAL.violet, PAL.pull]} marks={{ 0: ['pull', win(t, 42, 50)], 1: ['flow', win(t, 28, 36.5)], 2: ['violet', win(t, 36.5, 42) + win(t, 50, 56)] }} />
      <Console x={960} y={196} w={864} h={596} t={t} title="terminal · log filtered to these classes" a={E(t, 0.8)} fs={17} lh={25} items={NT_LOG.map(([at, text, kind]) => ({ at, text, kind }))} />
      <Callout x={960} y={812} w={864} tone="pull" a={E(t, 56)} fs={20} text="**Loaded is not initialised.** Initialisation waits for one of the six triggers." />
    </React.Fragment>
  );
}

// ── Initialisation runs once, under a lock ─────────────────────────────────
const LOCK_SRC = ['public class Greeter {', '    static int count;', '    static {', '        System.out.println(name() + ": <clinit> starts");', '        Thread.sleep(3000);', '        count = 5;', '        System.out.println(name() + ": <clinit> done");', '    }', '}'];
const HOLDER = ['class Lazy {', '    private static class Holder {', '        static final Expensive INSTANCE = new Expensive();', '    }', '    static Expensive get() { return Holder.INSTANCE; }', '}'];
export function SInitLock({ t }) {
  const X0 = 1060, X1 = 1700, T0 = 6.5, T1 = 34.5;
  const p = clamp((t - T0) / (T1 - T0), 0, 1);
  const xNow = lerp(X0, X1, p);
  const t2x = X0 + 0.1 / 3.1 * (X1 - X0);
  const done = t >= T1;
  const tail = E(t, T1, 1.2) * 96;
  const owned = t >= T0;
  return (
    <React.Fragment>
      <Code x={96} y={196} w={780} h={338} title="Greeter.java (abridged)" a={E(t, 0.4)} fs={17} lh={30} lines={LOCK_SRC.map((s, i) => (i >= 3 && i <= 6 ? { s, tone: 'pull', toneA: win(t, 6.5, 34.8) } : s))} />
      <Code x={96} y={556} w={780} h={188} title="jcmd <pid> Thread.print · T2 (excerpt)" lang="plain" a={win(t, 20, 41.8, 0.5)} fs={17} lh={30} lines={[
        '"T2" #15 prio=5 os_prio=31 ... in Object.wait()',
        { s: '   java.lang.Thread.State: RUNNABLE', tone: 'pull', toneA: win(t, 27, 34) },
        '        at Race.lambda$main$0(Race.java:3)',
        { s: '        - waiting on the Class initialization monitor for Greeter', tone: 'bad', toneA: win(t, 20.5, 27) },
      ]} />
      <Code x={96} y={556} w={780} h={248} title="the holder idiom" a={E(t, 42)} fs={17} lh={30} lines={HOLDER.map((s, i) => (i === 2 || i === 4 ? { s, tone: 'flow', toneA: E(t, 49) } : s))} />

      <Panel x={920} y={196} w={904} h={360} title="two threads call Greeter.greet()" tone="flow" a={E(t, 2)} />
      <Txt x={944} y={290} mono fs={22} weight={600} color={PAL.pull} a={E(t, 6.5)}>T1</Txt>
      <Txt x={944} y={386} mono fs={22} weight={600} color={PAL.blue} a={E(t, 13.5)}>T2</Txt>
      {owned && <Box x={X0} y={276} w={Math.max(10, xNow - X0)} h={56} label={xNow - X0 > 200 ? 'runs <clinit>' : ''} fs={18} tone="pull" fill />}
      {done && <Box x={X1 + 6} y={276} w={tail} h={56} label={tail > 90 ? 'greet' : ''} fs={17} tone="flow" fill />}
      {t >= 13.5 && <Box x={t2x} y={372} w={Math.max(10, xNow - t2x)} h={56} label={xNow - t2x > 260 ? 'waits for the init lock' : ''} fs={18} tone="bad" dashed />}
      {done && <Box x={X1 + 6} y={372} w={tail} h={56} label={tail > 90 ? 'greet' : ''} fs={17} tone="flow" fill />}
      <div style={{ position: 'absolute', left: X0, top: 450, width: X1 - X0, height: 2, background: PAL.line2, opacity: E(t, 6.5) }}></div>
      <Txt x={X0} y={458} mono fs={16} color={PAL.ink3} a={E(t, 6.5)}>0 s</Txt>
      <Txt x={X1} y={458} anchor="mid" mono fs={16} color={PAL.ink3} a={E(t, 6.5)}>3 s</Txt>
      <Box x={944} y={488} w={856} h={52} label={done ? 'Greeter: fully_initialized' : owned ? 'Greeter: being_initialized · owner T1' : 'Greeter: linked'} fs={20} tone={done ? 'flow' : owned ? 'pull' : 'ink'} a={E(t, 3)} glow={pulse(t, [6.5, T1], 1.2)} />

      <Console x={920} y={580} w={904} h={236} t={t} a={E(t, 6.5)} fs={17} lh={28} items={[
        { at: 6.7, text: 'java Race', kind: 'cmd' }, { at: 7.4, text: 'T1: <clinit> starts' },
        { at: 27.5, text: 'T2 state while T1 runs <clinit>: RUNNABLE', kind: 'dim' },
        { at: 35, text: 'T1: <clinit> done' }, { at: 35.6, text: 'T1: Hello, Ada (count=5)', kind: 'ok' }, { at: 36.2, text: 'T2: Hello, Ada (count=5)', kind: 'ok' },
      ]} />
      <Callout x={920} y={836} w={904} tone="flow" a={E(t, 49)} fs={19} text="`Holder` initialises on the first `get()`: lazy, exactly once, thread-safe. The JVM's init lock does the locking." />
    </React.Fragment>
  );
}

// ── When a static initialiser throws ───────────────────────────────────────
const BROKEN = ['public class Greeter {', '    static int count = Integer.parseInt(System.getProperty("greet.count"));', '    static String greet(String name) { count++; return "Hello, " + name; }', '}'];
const LOOP = ['for (int i = 1; i <= 3; i++) {', '    try { System.out.println(Greeter.greet("Ada")); }', '    catch (Throwable e) { System.out.println("call " + i + ": " + e); }', '}', 'Greeter.greet("Bob");   // uncaught: full stack trace'];
export function SFailedInit({ t }) {
  const [hl, hA] = hlAt(t, [[6.5, 1], [21, 1], [26.5, 1], [41, 4]]);
  const err = t >= 13.5;
  const calls = [
    { at: 6.5, label: 'call 1', res: 'ran <clinit> → ExceptionInInitializerError', tone: 'bad', y: 480 },
    { at: 21, label: 'call 2', res: 'refused at once → NoClassDefFoundError', tone: 'pull', y: 524 },
    { at: 30.5, label: 'call 3', res: 'refused at once → NoClassDefFoundError', tone: 'pull', y: 568 },
  ];
  return (
    <React.Fragment>
      <Code x={96} y={196} w={900} h={172} title="Greeter.java" a={E(t, 0.4)} fs={17} lh={26} lines={BROKEN.map((s, i) => (i === 1 ? { s, tone: 'bad', toneA: win(t, 6.5, 14) } : s))} />
      <Code x={96} y={382} w={900} h={198} title="Main.java · main" a={E(t, 1)} fs={17} lh={26} hl={hl} hlA={hA} lines={LOOP} />

      <Box x={1040} y={204} w={320} h={66} label="linked" fs={21} tone="ink" a={E(t, 2)} />
      <HArrow x1={1364} x2={1436} y={237} a={E(t, 6.5)} color={PAL.pull} />
      <Box x={1440} y={204} w={384} h={66} label="being_initialized" fs={21} tone="pull" a={E(t, 6.6)} glow={win(t, 6.6, 13.5)} />
      <Arrow pts={[[1560, 274], [1560, 312], [1200, 312], [1200, 346]]} draw={E(t, 7)} color={PAL.ink3} dashed />
      <Box x={1040} y={350} w={320} h={66} label="fully_initialized" sub="never reached" fs={20} sfs={17} tone="dim" dashed a={E(t, 7)} />
      <VArrow x={1700} y1={274} y2={346} a={E(t, 13.5)} color={PAL.bad} label="threw" lfs={17} />
      <Box x={1440} y={350} w={384} h={66} label="initialization_error" fs={20} tone="bad" a={POP(t, 13.5)} glow={err ? 0.5 + 0.5 * pulse(t, [13.6, 21.3, 30.8], 1.2) : 0} />
      <Badge x={1632} y={438} text="permanent" tone="bad" fs={17} a={E(t, 15)} />
      {calls.map((c) => (
        <React.Fragment key={c.label}>
          <Badge x={1040} y={c.y} anchor="left" text={c.label} tone={c.tone} fs={17} a={E(t, c.at)} />
          <Txt x={1150} y={c.y - 12} mono fs={17} color={c.tone === 'bad' ? PAL.bad : PAL.pull} a={E(t, c.at + (c.label === 'call 1' ? 7 : 5.5))}>{c.res}</Txt>
        </React.Fragment>
      ))}

      <Console x={96} y={597} w={1728} h={343} t={t} a={E(t, 12)} fs={17} lh={25} items={[
        { at: 12.5, text: 'java Main', kind: 'cmd' },
        { at: 14, text: 'call 1: java.lang.ExceptionInInitializerError', kind: 'err' },
        { at: 27, text: 'call 2: java.lang.NoClassDefFoundError: Could not initialize class Greeter', kind: 'err' },
        { at: 31, text: 'call 3: java.lang.NoClassDefFoundError: Could not initialize class Greeter', kind: 'err' },
        { at: 41.5, text: 'Exception in thread "main" java.lang.NoClassDefFoundError: Could not initialize class Greeter', kind: 'err' },
        { at: 41.8, text: '\tat Main.main(Main.java:10)' },
        { at: 42.5, text: 'Caused by: java.lang.ExceptionInInitializerError: Exception java.lang.NumberFormatException: Cannot parse null string [in thread "main"]', kind: 'ok' },
        { at: 42.8, text: '\tat java.base/java.lang.Integer.parseInt(Integer.java:630)' },
        { at: 43, text: '\tat java.base/java.lang.Integer.parseInt(Integer.java:786)' },
        { at: 43.2, text: '\tat Greeter.<clinit>(Greeter.java:2)', kind: 'ok' },
        { at: 43.4, text: '\tat Main.main(Main.java:5)' },
      ]} />
    </React.Fragment>
  );
}
