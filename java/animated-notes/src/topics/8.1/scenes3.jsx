// 8.1 scenes, part 3: desugaring, string switch, verifying erasure & lambdas, Class-File API, traps, recap.
const { PAL, MOTION, lin, lerp, win, pulse, step, track, hlAt, clamp, hexA, MONO, SANS, fmt,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Mark, Val, Brace, Bytes, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

// ── What javac desugars ────────────────────────────────────────────────────
const SUGAR = [
  [4, 'for (String n : names) { … }', 'it = names.iterator(); while (it.hasNext()) n = (String) it.next();'],
  [11, 'for (int x : arr) { … }', 'for (int i = 0; i < arr.length; i++) x = arr[i];'],
  [16, 'Integer i = 5;   int x = i;', 'Integer.valueOf(5)        ·        i.intValue()'],
  [22, '"r = " + r', 'invokedynamic makeConcatWithConstants  "r = \\u0001"'],
  [27.5, 'Runnable job = () -> work();', 'invokedynamic run()  +  private static void lambda$new$0()'],
  [33.5, 'enum Color { RED, GREEN }', 'final class Color extends Enum<Color> + static Color[] $VALUES'],
  [39.5, 'record Point(int x, int y) {}', 'final class Point extends Record + indy equals/hashCode/toString'],
  [46.5, 'String s = list.get(0);', 'String s = (String) list.get(0);   // get returns Object'],
];
export function SDesugar({ t }) {
  const cur = SUGAR.filter((s) => t >= s[0]).length - 1;
  return (
    <React.Fragment>
      <Txt x={96} y={186} mono fs={17} color={PAL.ink3} a={E(t, 1)}>YOU WRITE</Txt>
      <Txt x={900} y={186} mono fs={17} color={PAL.ink3} a={E(t, 1)}>JAVAC EMITS (as Java-ish pseudocode)</Txt>
      {SUGAR.map(([at, l, r], i) => {
        const a = E(t, at), y = 218 + i * 86;
        const focus = i === cur && t < 52 ? 1 : 0;
        return (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', left: 96, top: y, width: 740, height: 70, boxSizing: 'border-box', borderRadius: 12, opacity: a, background: PAL.panel2, border: `2px solid ${focus ? PAL.pull : PAL.line2}`, display: 'flex', alignItems: 'center', padding: '0 20px', font: `500 20px ${MONO}`, whiteSpace: 'pre' }}>{window.AN.hiJava(l)}</div>
            <HArrow x1={846} x2={890} y={y + 35} a={E(t, at + 0.5)} color={focus ? PAL.pull : PAL.ink3} />
            <div style={{ position: 'absolute', left: 900, top: y, width: 924, height: 70, boxSizing: 'border-box', borderRadius: 12, opacity: E(t, at + 0.7), transform: `translateX(${(1 - E(t, at + 0.7)) * 20}px)`, background: hexA(PAL.flow, focus ? 0.12 : 0.05), border: `2px solid ${focus ? PAL.flow : hexA(PAL.flow, 0.3)}`, display: 'flex', alignItems: 'center', padding: '0 20px', font: `500 18px ${MONO}`, whiteSpace: 'pre', overflow: 'hidden' }}>{window.AN.hiJava(r)}</div>
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
}

// ── String switch ──────────────────────────────────────────────────────────
const SW = [
  ' 4: aload_1; invokevirtual hashCode', ' 8: lookupswitch { 97: 36, 98: 50, default: 61 }', '36: aload_1; ldc "a"; invokevirtual equals', '42: ifeq 61; iconst_0; istore_2',
  '50: aload_1; ldc "b"; invokevirtual equals', '56: ifeq 61; iconst_1; istore_2', '61: iload_2', '62: lookupswitch { 0: 88, 1: 92, default: 96 }',
  '88: iconst_1 → ireturn', '92: iconst_2 → ireturn', '96: iconst_0 → ireturn',
];
export function SStringSwitch({ t }) {
  const [hl, hA] = hlAt(t, [[5, 0], [10.5, 1], [17.5, 4], [24, 5], [29, 7], [31.5, 9]]);
  const X = 940;
  const tbl = (y, rows, litIdx, at, title) => (
    <React.Fragment>
      <Txt x={X} y={y - 30} mono fs={17} color={PAL.ink3} a={E(t, at)}>{title}</Txt>
      {rows.map(([k, v], i) => <Box key={i} x={X + i * 200} y={y} w={184} h={72} label={k} sub={'→ ' + v} fs={22} sfs={17} tone={i === litIdx && t > at + 1.2 ? 'pull' : 'ink'} a={E(t, at + i * 0.2)} glow={i === litIdx ? win(t, at + 1.2, at + 6) : 0} />)}
    </React.Fragment>
  );
  return (
    <React.Fragment>
      <Code x={96} y={190} w={780} h={134} title="Sugar.java" a={E(t, 0.5)} fs={19} lh={34} lines={['int r = switch (s) {', '    case "a" -> 1;  case "b" -> 2;  default -> 0; };']} />
      <Code x={96} y={340} w={780} h={580} title="javap -c (condensed)" lang="bytecode" a={E(t, 2)} fs={19} lh={46} hl={hl} hlA={hA} lines={SW} />
      <Box x={X} y={196} w={260} h={80} label={'s = "b"'} tone="pull" a={E(t, 1)} fs={26} />
      <Box x={X + 300} y={196} w={584} h={80} label="s.hashCode() = 98" sub="'b' is char 98" tone="flow" a={E(t, 5.2)} fs={24} glow={pulse(t, [5.4], 1.2)} />
      {tbl(350, [['97', 'case "a"'], ['98', 'case "b"'], ['default', 'none']], 1, 10.5, 'STEP 1 · LOOKUPSWITCH ON THE HASH')}
      <Box x={X} y={466} w={884} h={80} label={'"b".equals("b") → true · index = 1'} tone="flow" a={E(t, 17.5)} fs={22} glow={pulse(t, [24], 1.2)} />
      <Callout x={X} y={566} w={884} tone="bad" a={E(t, 16.5)} fs={19} title="why equals too?" text={'Hashes collide: `"Aa".hashCode()` and `"BB".hashCode()` are both **2112**.'} />
      {tbl(736, [['0', 'return 1'], ['1', 'return 2'], ['default', 'return 0']], 1, 29, 'STEP 2 · SWITCH ON THE INDEX')}
      <Badge x={X + 760} y={846} text="result: 2" tone="pull" a={POP(t, 31.8)} fs={22} solid />
      <Badge x={X + 280} y={866} text="2 lines of source · ~30 instructions" tone="ink" a={E(t, 35.5)} fs={17} />
    </React.Fragment>
  );
}

// ── Verify erasure ─────────────────────────────────────────────────────────
export function SErasure({ t }) {
  const [hl, hA] = hlAt(t, [[29.5, 1]]);
  const gone = M(t, 12.5, 1.2);
  return (
    <React.Fragment>
      <Code x={96} y={190} w={860} h={170} title="Erase.java" a={E(t, 0.5)} fs={21} lh={36} lines={['List<String> f(List<Integer> in) {', '    return new ArrayList<>();', '}']} />
      <Console x={1000} y={190} w={824} h={160} t={t} a={E(t, 4.5)} fs={17} lh={28} items={[
        { at: 5, text: 'javap -s Erase.class', kind: 'cmd' },
        { at: 5.6, text: 'java.util.List<java.lang.String> f(java.util.List<java.lang.Integer>);' },
        { at: 6.2, text: '  descriptor: (Ljava/util/List;)Ljava/util/List;', kind: 'ok' },
      ]} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 410, textAlign: 'center', opacity: E(t, 10), font: `600 46px ${MONO}`, color: PAL.ink }}>
        (Ljava/util/List<span style={{ display: 'inline-block', color: PAL.bad, textDecoration: 'line-through', maxWidth: (1 - gone) * 300, overflow: 'hidden', verticalAlign: 'bottom', opacity: 1 - gone }}>&lt;Integer&gt;</span>;)Ljava/util/List<span style={{ display: 'inline-block', color: PAL.bad, textDecoration: 'line-through', maxWidth: (1 - gone) * 300, overflow: 'hidden', verticalAlign: 'bottom', opacity: 1 - gone }}>&lt;String&gt;</span>;
      </div>
      <Txt x={960} y={480} anchor="mid" fs={22} color={PAL.bad} a={E(t, 11.5)}>the descriptor the JVM uses has no type arguments</Txt>
      <Panel x={96} y={540} w={1728} h={130} title="Signature attribute  (javap -v)" tone="violet" a={E(t, 17.5)}>
        <div style={{ padding: '14px 22px', font: `500 19px ${MONO}`, color: PAL.ink }}>(Ljava/util/List&lt;Ljava/lang/Integer;&gt;;)Ljava/util/List&lt;Ljava/lang/String;&gt;;</div>
      </Panel>
      <Badge x={1530} y={644} text="read by javac + reflection ✓" tone="flow" a={E(t, 19)} fs={17} />
      <Badge x={1180} y={644} text="ignored when executing ✗" tone="bad" a={E(t, 20)} fs={17} />
      <Code x={96} y={710} w={860} h={150} title="a caller" a={E(t, 25)} fs={21} lh={36} lines={['List<String> names = List.of("Ana");', 'String s = names.get(0);']} />
      <Code x={1000} y={710} w={824} h={150} title="javap -c" lang="bytecode" a={E(t, 26)} fs={19} lh={36} hl={hl} hlA={hA} lines={['invokeinterface List.get:(I)Ljava/lang/Object;', 'checkcast     java/lang/String   // inserted']} />
      <Badge x={960} y={900} text="erasure = Object everywhere + casts the compiler wrote for you" tone="pull" a={E(t, 36.5)} fs={18} />
    </React.Fragment>
  );
}

// ── Verify lambdas (and boxing) ────────────────────────────────────────────
export function SLambdas({ t }) {
  const [hl, hA] = hlAt(t, [[15.5, 3], [22, 1]]);
  const file = (x, y, name, at, tone, ghost) => <Box x={x} y={y} w={250} h={70} label={name} fs={20} tone={ghost ? 'bad' : tone} dashed={ghost} strike={ghost} a={E(t, at)} />;
  return (
    <React.Fragment>
      <Txt x={96} y={186} mono fs={17} color={PAL.ink3} a={E(t, 0.5)}>ANONYMOUS CLASS</Txt>
      <Txt x={984} y={186} mono fs={17} color={PAL.ink3} a={E(t, 0.5)}>LAMBDA</Txt>
      <Code x={96} y={216} w={840} h={210} title="Anon.java" a={E(t, 0.8)} fs={18} lh={30} lines={['public class Anon {', '  Runnable r = new Runnable() {', '    public void run() { System.out.println("hi"); }', '  };', '}']} />
      <Code x={984} y={216} w={840} h={210} title="Lam.java" a={E(t, 1.2)} fs={18} lh={30} lines={['public class Lam {', '  Runnable r = () -> System.out.println("hi");', '}']} />
      <Txt x={96} y={448} mono fs={17} color={PAL.ink2} a={E(t, 4.5)}>$ javac Anon.java && ls</Txt>
      {file(96, 482, 'Anon.class', 4.8, 'flow')}{file(366, 482, 'Anon$1.class', 5.4, 'pull')}
      <Badge x={796} y={517} text="+1 file per anonymous class" tone="pull" a={E(t, 6)} fs={17} />
      <Txt x={984} y={448} mono fs={17} color={PAL.ink2} a={E(t, 10)}>$ javac Lam.java && ls</Txt>
      {file(984, 482, 'Lam.class', 10.3, 'flow')}{file(1254, 482, 'Lam$1.class', 11, 'flow', true)}
      <Code x={984} y={590} w={840} h={320} title="javap -c -p Lam.class" lang="bytecode" a={E(t, 15)} fs={18} lh={36} hl={hl} hlA={hA} lines={[
        'Lam():', '   5: invokedynamic #7, 0   // run:()Runnable', '  10: putfield      #11      // r', 'private static void lambda$new$0():', '   0: getstatic     System.out', '   3: ldc           "hi"', '   5: invokevirtual println',
      ]} />
      <Callout x={96} y={600} w={840} tone="violet" a={win(t, 29, 36.3)} fs={20} title="where's the class?" text="Generated at runtime, on first use, by `LambdaMetafactory`: a hidden class in memory. Nothing on disk." />
      <Code x={96} y={600} w={840} h={150} title="Integer i = 5;  → javap -c" lang="bytecode" a={E(t, 36.5)} fs={19} lh={36} lines={['0: iconst_5', '1: invokestatic  Integer.valueOf:(I)Ljava/lang/Integer;']} hl={1} hlA={E(t, 37.5)} />
      <Txt x={96} y={770} fs={20} color={PAL.ink2} w={840} a={E(t, 38.5)}>Autoboxing, made visible: it's an ordinary static method call.</Txt>
    </React.Fragment>
  );
}

// ── Class-File API ─────────────────────────────────────────────────────────
export function SClassFileApi({ t }) {
  const rel = [17, 18, 19, 20, 21, 22, 23, 24, 25];
  const x = (i) => 200 + i * 190;
  const cur = Math.floor(clamp((t - 9.5) / 0.75, -1, 8));
  const fws = ['Spring', 'Hibernate', 'Mockito', 'JaCoCo'];
  const broken = t > 9.5 && t < 16 && ((t - 9.5) % 0.75) < 0.45;
  return (
    <React.Fragment>
      {fws.map((f, i) => <Box key={f} x={200 + i * 300} y={210} w={270} h={90} label={f} sub={t > 16.5 ? 'java.lang.classfile' : 'bundles ASM'} tone={t > 16.5 ? 'flow' : broken ? 'bad' : 'ink'} a={E(t, 0.6 + i * 0.3)} glow={broken ? 0.6 : 0} />)}
      <Badge x={1530} y={255} text={t > 16.5 ? 'always current' : 'ASM must catch up'} tone={t > 16.5 ? 'flow' : 'bad'} a={E(t, 5.5)} fs={17} />
      <div style={{ position: 'absolute', left: 170, top: 440, width: 1580, height: 4, background: PAL.line2, opacity: E(t, 8) }}></div>
      {rel.map((r, i) => (
        <React.Fragment key={r}>
          <div style={{ position: 'absolute', left: x(i) - 12, top: 430, width: 24, height: 24, borderRadius: 12, background: i <= cur ? (r === 24 && t > 16 ? PAL.flow : PAL.pull) : PAL.panel2, border: `2px solid ${PAL.line2}`, opacity: E(t, 8 + i * 0.05) }}></div>
          <Txt x={x(i)} y={380} anchor="mid" mono fs={20} weight={600} color={PAL.ink} a={E(t, 8 + i * 0.05)}>JDK {r}</Txt>
          <Txt x={x(i)} y={470} anchor="mid" mono fs={16} color={PAL.ink3} a={E(t, 8 + i * 0.05)}>v{r + 44}</Txt>
        </React.Fragment>
      ))}
      <Badge x={x(7)} y={530} text="Class-File API final · JEP 484" tone="flow" a={POP(t, 16)} fs={18} solid />
      <Code x={96} y={620} w={1100} h={210} title="ReadIt.java" a={E(t, 18)} fs={19} lh={36} lines={['ClassModel cm = ClassFile.of().parse(Path.of("Calc.class"));', 'for (MethodModel m : cm.methods())', '    System.out.println(m.methodName() + " " + m.methodType());']} />
      <Console x={1240} y={620} w={584} h={210} t={t} a={E(t, 19)} fs={20} items={[{ at: 20, text: '<init> ()V' }, { at: 20.4, text: 'add (II)I' }, { at: 20.8, text: 'main ([Ljava/lang/String;)V' }]} />
    </React.Fragment>
  );
}

// ── Traps ──────────────────────────────────────────────────────────────────
const TRAPS = [
  [3.5, '“UnsupportedClassVersionError means a class is missing”', "It's a **version** mismatch: a newer class file on an older JVM."],
  [10, '“Generics are in the bytecode”', 'Only in a `Signature` attribute. Execution uses the erased descriptor.'],
  [16.5, '“Every lambda makes a class file”', '`invokedynamic` spins its class up at runtime. No `$1.class`.'],
  [23, '“Bytecode is what runs”', 'Only at first. Hot methods are compiled to machine code by the JIT (8.8).'],
];
export function STraps({ t }) {
  return TRAPS.map(([at, myth, real], i) => {
    const y = 200 + i * 172;
    return (
      <React.Fragment key={i}>
        <Box x={96} y={y} w={760} h={140} label={myth} mono={false} fs={23} tone="bad" a={E(t, at)} strike={t > at + 2} style={{ whiteSpace: 'normal' }} />
        <HArrow x1={870} x2={940} y={y + 70} a={E(t, at + 1.5)} color={PAL.flow} />
        <Card x={956} y={y} w={868} h={140} a={E(t, at + 1.6)} tone="flow" title={real} tfs={24} />
      </React.Fragment>
    );
  });
}

// ── Recap ──────────────────────────────────────────────────────────────────
const RECAP = [
  [3, '1', 'Two compilers', '`javac` once to bytecode; the JIT compiles hot code at runtime.'],
  [9, '2', 'The class file', '`CAFEBABE`, a version, a constant pool, then fields, methods, attributes.'],
  [12, '3', 'Constant pool', 'Every name and literal, stored once, referenced as `#n`.'],
  [15, '4', 'Stack machine', 'Local slots + an operand stack. Typed opcodes: `iload`, `aload`, `iadd`.'],
  [21, '5', 'Five invokes', '`static`, `special`, `virtual`, `interface`, **`dynamic`**.'],
  [26.5, '6', 'javap', '`javap -c -p -v` shows you all of it. Use it.'],
];
export function SRecap({ t }) {
  return (
    <React.Fragment>
      {RECAP.map(([at, n, title, sub], i) => <Card key={n} x={96 + (i % 3) * 584} y={210 + Math.floor(i / 3) * 290} w={560} h={260} num={n} title={title} sub={sub} tfs={36} sfs={25} a={E(t, at)} tone={i === 5 ? 'pull' : undefined} glow={i === 5 ? win(t, 27, 40) : 0} />)}
    </React.Fragment>
  );
}
