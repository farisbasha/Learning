// 8.1 scenes, part 2: the stack machine, typed opcodes, main step by step, invokes, vtables, indy.
const { PAL, MOTION, lin, lerp, win, pulse, step, track, hlAt, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Mark, Val, Brace, Bytes, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

// A stack/slot value: a pill that can travel along keyframes and fade.
function Tok({ t, keys, text, tone = 'flow', from, until, w = 260, h = 52, fs = 24, glowAt, wKeys }) {
  if (wKeys) w = window.AN.track1(t, wKeys);
  if (t < (from == null ? keys[0][0] : from)) return null;
  const [x, y] = track(t, keys);
  let a = E(t, from == null ? keys[0][0] : from, 0.25);
  if (until != null) a *= 1 - E(t, until, 0.3);
  if (a <= 0.01) return null;
  const c = toneColor(tone);
  const g = glowAt != null ? pulse(t, [glowAt], 1.0) : 0;
  return <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, boxSizing: 'border-box', borderRadius: 10, opacity: a, background: hexA(c, 0.16), border: `2px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 ${fs}px ${MONO}`, color: PAL.ink, boxShadow: g > 0.01 ? `0 0 ${26 * g}px ${hexA(c, 0.7 * g)}` : 'none', whiteSpace: 'nowrap' }}>{text}</div>;
}
function Slot({ x, y, w = 180, h = 90, idx, name, value, tone, a = 1, glow = 0 }) {
  if (a <= 0.005) return null;
  return (
    <React.Fragment>
      <Txt x={x + w / 2} y={y - 30} anchor="mid" mono fs={16} color={PAL.ink3} a={a}>slot {idx}</Txt>
      <Box x={x} y={y} w={w} h={h} label={value} sub={name} tone={tone} a={a} glow={glow} fs={24} sfs={17} />
    </React.Fragment>
  );
}

// ── add(2, 3) on the operand stack ─────────────────────────────────────────
export function SStackAdd({ t }) {
  const SX = 1080, sp = (i) => 699 - i * 62; // operand stack positions
  const [hl, hA] = hlAt(t, [[17.5, 0], [24, 1], [30, 2], [37, 3], [43, -1]]);
  const trace = [[10.5, '[ ]'], [18.8, '[ 2 ]'], [25.2, '[ 2, 3 ]'], [31.4, '[ 5 ]'], [38.2, '[ ]']];
  return (
    <React.Fragment>
      <Code x={96} y={200} w={600} h={190} title="Calc.java" a={E(t, 0.5)} fs={24} lh={40} lines={['int add(int a, int b) {', '    return a + b;', '}']} />
      <Badge x={396} y={420} text="called as add(2, 3)" tone="pull" a={E(t, 12)} fs={18} />
      <Code x={96} y={460} w={600} h={300} title="javap -c" lang="bytecode" a={E(t, 2)} fs={30} lh={56} hl={hl} hlA={hA} lines={['0: iload_1', '1: iload_2', '2: iadd', '3: ireturn']} />
      <Callout x={96} y={790} w={600} tone="pull" a={E(t, 50)} fs={19} text="`max_stack = 2`, `max_locals = 3`: the frame's exact size. The **verifier** checks no path ever exceeds it." />

      <Panel x={760} y={200} w={640} h={590} title="frame · add(2, 3)" tone="flow" a={E(t, 4.5)} />
      <Txt x={790} y={262} mono fs={17} color={PAL.ink3} a={E(t, 5.5)}>LOCAL VARIABLES</Txt>
      <Slot x={790} y={320} idx={0} name="this" value="Calc@1b6d" tone="ink" a={E(t, 10.5)} />
      <Slot x={990} y={320} idx={1} name="a" value="2" tone="flow" a={E(t, 11)} glow={pulse(t, [17.5], 1)} />
      <Slot x={1190} y={320} idx={2} name="b" value="3" tone="flow" a={E(t, 11.5)} glow={pulse(t, [24], 1)} />
      <Panel x={900} y={440} w={360} h={330} title="operand stack" a={E(t, 6)} tone="pull" />
      <Tok t={t} text="2" keys={[[17.7, 1080, 365], [18.7, SX, sp(0)], [30.2, SX, sp(0)], [31, SX, sp(0) - 31]]} until={31} />
      <Tok t={t} text="3" keys={[[24.2, 1280, 365], [25.2, SX, sp(1)], [30.2, SX, sp(1)], [31, SX, sp(0) - 31]]} until={31} />
      <Tok t={t} text="5" tone="pull" keys={[[31.1, SX, sp(0)], [37.2, SX, sp(0)], [38.2, 1640, sp(0)]]} glowAt={31.1} until={39} />
      <Txt x={1080} y={sp(0) - 12} anchor="mid" mono fs={17} color={PAL.ink3} a={win(t, 6.5, 17.6)}>empty</Txt>
      <Txt x={1460} y={262} mono fs={17} color={PAL.ink3} a={E(t, 16)}>STACK OVER TIME</Txt>
      {trace.map(([at, s], i) => <Txt key={i} x={1460} y={310 + i * 56} mono fs={30} weight={600} color={i === trace.filter((x) => t >= x[0]).length - 1 ? PAL.pull : PAL.ink2} a={E(t, at)}>{s}</Txt>)}
      <Txt x={1640} y={sp(0) - 64} anchor="mid" mono fs={18} color={PAL.pull} a={E(t, 38)}>back to the caller</Txt>
      <Callout x={1440} y={800} w={384} tone="flow" a={E(t, 43.5)} fs={19} text="Every instruction: pop its inputs, push its output." />
    </React.Fragment>
  );
}

// ── Typed opcodes, two-slot longs ──────────────────────────────────────────
export function SPrefixes({ t }) {
  const rows = [['i', 'int', 'iload  istore  iadd  ireturn'], ['l', 'long', 'lload  lstore  ladd  lreturn'], ['f', 'float', 'fload  fstore  fadd  freturn'], ['d', 'double', 'dload  dstore  dadd  dreturn'], ['a', 'reference', 'aload  astore  areturn  (no aadd!)']];
  const [hl, hA] = hlAt(t, [[23, 0], [25, 1], [27, 2]]);
  return (
    <React.Fragment>
      <Table x={96} y={196} cols={[130, 210, 700]} head={['prefix', 'type', 'the same operation, typed']} rows={rows} a={E(t, 0.6)} rowA={rows.map((_, i) => E(t, 4 + i * 0.6))}
        colColors={[PAL.pull, PAL.ink, PAL.ink2]} fs={22} marks={{ 4: ['violet', win(t, 7, 16)] }} />
      <Callout x={1176} y={196} w={648} tone="pull" a={E(t, 16)} title="no small types" text="`boolean`, `byte`, `char` and `short` are loaded and computed as **int**. There is no `badd` or `cadd`." />
      <Txt x={96} y={540} mono fs={18} color={PAL.ink3} a={E(t, 22)}>long sum(long a, long b)  ·  LOCAL VARIABLES</Txt>
      {[[0, 1, 'this', 'ink'], [1, 2, 'a', 'flow'], [3, 2, 'b', 'pull']].map(([s, n, name, tone], i) => (
        <React.Fragment key={i}>
          <Box x={96 + s * 160} y={590} w={n * 160 - 10} h={100} label={name} sub={n === 2 ? 'long · 8 bytes' : 'reference'} tone={tone} a={E(t, 22.4 + i * 0.4)} glow={i === 2 ? win(t, 24.5, 29) : 0} />
          {Array.from({ length: n }).map((_, k) => <Txt key={k} x={96 + (s + k) * 160 + 75} y={706} anchor="mid" mono fs={16} color={PAL.ink3} a={E(t, 22.4 + i * 0.4)}>slot {s + k}</Txt>)}
        </React.Fragment>
      ))}
      <Code x={1176} y={540} w={648} h={250} title="javap -c" lang="bytecode" a={E(t, 23)} fs={26} lh={44} hl={hl} hlA={hA} lines={['0: lload_1', '1: lload_3      // b starts at slot 3', '2: ladd', '3: lreturn']} />
      <Bytes x={96} y={790} unit={70} h={64} ruler={false} a={E(t, 29.5)} fs={20} sfs={16} cells={[{ n: 3, label: 'lload_1', sub: '1F', tone: 'flow' }]} />
      <Txt x={320} y={808} mono fs={20} color={PAL.ink2} a={E(t, 30)}>one byte, slot baked in</Txt>
      <Bytes x={680} y={790} unit={70} h={64} ruler={false} a={E(t, 31.5)} fs={20} sfs={16} cells={[{ n: 3, label: 'lload', sub: '16', tone: 'pull' }, { n: 1, label: '05', sub: 'slot', tone: 'pull' }]} />
      <Txt x={970} y={808} mono fs={20} color={PAL.ink2} a={E(t, 32)}>slots 4+ need an operand byte</Txt>
    </React.Fragment>
  );
}

// ── main(), instruction by instruction ─────────────────────────────────────
const MAIN = [
  ' 0: new           #7   // Calc', ' 3: dup', ' 4: invokespecial #9   // <init>', ' 7: astore_1', ' 8: aload_1', ' 9: iconst_2', '10: iconst_3',
  '11: invokevirtual #10  // add', '14: istore_2', '15: getstatic     #14  // System.out', '18: iload_2', '19: invokedynamic #20  // concat', '24: invokevirtual #24  // println', '27: return',
];
const MSTEPS = [[4, 0], [9.5, 1], [15, 2], [21, 3], [26.5, 4], [28.5, 5], [30.5, 6], [33.5, 7], [40, 8], [45, 9], [48, 10], [51.5, 11], [58, 12], [64, 13]];
export function SStackMain({ t }) {
  const SX = 1120, sp = (i) => 859 - i * 62;
  const slot = (i) => [950 + i * 170, 330];
  const OBJ = [1632, 300], STR = [1632, 470];
  const [hl, hA] = hlAt(t, MSTEPS);
  const ready = t >= 15.6;
  return (
    <React.Fragment>
      <Code x={96} y={190} w={700} h={740} title="main · javap -c" lang="bytecode" a={E(t, 0.4)} fs={20} lh={46} hl={hl} hlA={hA} lines={MAIN} />

      <Panel x={840} y={190} w={560} h={740} title="frame · main" tone="flow" a={E(t, 1)} />
      {['args', 'c', 'r'].map((n, i) => <React.Fragment key={n}><Txt x={slot(i)[0]} y={244} anchor="mid" mono fs={16} color={PAL.ink3} a={E(t, 1.4)}>slot {i}</Txt><Box x={slot(i)[0] - 75} y={290} w={150} h={80} sub={n} label={i === 0 ? 'String[]' : ''} tone={i === 0 ? 'ink' : 'flow'} a={E(t, 1.4)} fs={18} /></React.Fragment>)}
      <Panel x={900} y={420} w={440} h={490} title="operand stack" tone="pull" a={E(t, 1.6)} />
      <Badge x={SX} y={396} text="add(2, 3) runs in its own frame → 5" tone="pull" a={win(t, 34.2, 39.6)} fs={17} />

      <Panel x={1440} y={190} w={384} h={420} title="heap" a={E(t, 3.5)} />
      <Box x={OBJ[0] - 160} y={OBJ[1] - 50} w={320} h={100} label="Calc object" sub={ready ? 'constructed' : 'uninitialised'} tone={ready ? 'flow' : 'dim'} dashed={!ready} a={POP(t, 4.4)} glow={pulse(t, [15.6], 1.2)} />
      <Box x={STR[0] - 160} y={STR[1] - 50} w={320} h={100} label={'"r = 5"'} sub="String" tone="pink" a={POP(t, 54)} glow={pulse(t, [54], 1.2)} />
      <Console x={1440} y={640} w={384} h={290} t={t} title="console" a={E(t, 3.5)} items={[{ at: 60, text: 'r = 5', kind: 'ok' }]} fs={26} lh={40} />

      {/* stored locals */}
      <Tok t={t} text="→ Calc" keys={[[4.6, OBJ[0], OBJ[1]], [5.6, SX, sp(0)], [21.2, SX, sp(0)], [22.2, ...slot(1)]]} wKeys={[[21.2, 260], [22.2, 136]]} tone="flow" />
      <Tok t={t} text="→ Calc" keys={[[9.7, SX, sp(0)], [10.6, SX, sp(1)], [15.2, SX, sp(1)], [16.1, OBJ[0] - 160, OBJ[1]]]} until={15.9} w={260} tone="flow" />
      <Tok t={t} text="→ Calc" keys={[[26.7, ...slot(1)], [27.6, SX, sp(0)], [33.7, SX, sp(0)], [34.5, SX, 400]]} until={34.3} tone="flow" />
      <Tok t={t} text="2" keys={[[28.6, SX, sp(1) - 40], [29.1, SX, sp(1)], [33.7, SX, sp(1)], [34.5, SX, 400]]} until={34.3} tone="violet" />
      <Tok t={t} text="3" keys={[[30.6, SX, sp(2) - 40], [31.1, SX, sp(2)], [33.7, SX, sp(2)], [34.5, SX, 400]]} until={34.3} tone="violet" />
      <Tok t={t} text="5" keys={[[37.6, SX, 400], [38.4, SX, sp(0)], [40.2, SX, sp(0)], [41.2, ...slot(2)]]} glowAt={38.4} tone="pull" wKeys={[[40.2, 260], [41.2, 136]]} />
      <Tok t={t} text="System.out" keys={[[45.2, SX, sp(0) - 40], [45.8, SX, sp(0)], [58.2, SX, sp(0)], [59.2, 1632, 760]]} until={59} tone="blue" />
      <Tok t={t} text="5" keys={[[48.2, ...slot(2)], [49.1, SX, sp(1)], [51.7, SX, sp(1)], [52.8, STR[0], STR[1]]]} until={52.6} tone="pull" />
      <Tok t={t} text={'→ "r = 5"'} keys={[[54.4, STR[0], STR[1]], [55.4, SX, sp(1)], [58.2, SX, sp(1)], [59.2, 1632, 760]]} until={59} tone="pink" />
      <Arrow from={[slot(1)[0], 288]} to={[OBJ[0] - 164, OBJ[1] - 20]} curve={-70} draw={M(t, 22.4, 0.7)} color={PAL.flow} />

      <Txt x={SX} y={sp(0) - 12} anchor="mid" mono fs={17} color={PAL.ink3} a={win(t, 1.8, 4.4) + win(t, 22.4, 26.8) + win(t, 59.4, 64.2)}>empty</Txt>
      <Callout x={922} y={560} w={396} tone="pull" a={E(t, 64.5)} fs={20} text="3 lines of Java → **14 instructions**, 28 bytes. The frame is popped and `main` returns." />
    </React.Fragment>
  );
}

// ── The five invokes ───────────────────────────────────────────────────────
const INV = [
  ['invokestatic', 'static methods', 'Integer.valueOf(5)', 'fixed target', 'flow', 4],
  ['invokespecial', 'constructors · private · super.x()', 'new Calc() → <init>', 'fixed target', 'flow', 9.5],
  ['invokevirtual', 'normal instance methods', 'c.add(2, 3)', "target = receiver's class", 'pull', 16],
  ['invokeinterface', 'calls through an interface', 'list.iterator()', "target = receiver's class", 'pull', 22.5],
  ['invokedynamic', 'lambdas · string + · records', '"r = " + r', 'target chosen by code', 'violet', 28.5],
];
export function SInvokes({ t }) {
  return (
    <React.Fragment>
      {INV.map(([op, use, ex, how, tone, at], i) => {
        const a = E(t, at);
        const x = 96 + i * 350;
        return (
          <React.Fragment key={op}>
            <Panel x={x} y={210} w={334} h={400} a={a} tone={tone} glow={win(t, at, at + 6) * 0.7} />
            <Txt x={x + 22} y={236} mono fs={22} weight={700} color={toneColor(tone)} a={a}>{op}</Txt>
            <Txt x={x + 22} y={290} fs={22} w={290} color={PAL.ink} a={a}>{use}</Txt>
            <Txt x={x + 22} y={410} mono fs={16} color={PAL.ink3} a={a}>EXAMPLE</Txt>
            <Txt x={x + 22} y={438} mono fs={19} color={PAL.ink2} w={290} a={a}>{ex}</Txt>
            <Txt x={x + 22} y={540} fs={19} w={290} color={toneColor(tone)} a={a}>{how}</Txt>
          </React.Fragment>
        );
      })}
      <div style={{ position: 'absolute', left: 120, top: 700, width: 1680, height: 10, borderRadius: 5, opacity: E(t, 35.5), background: `linear-gradient(90deg, ${PAL.flow}, ${PAL.pull} 55%, ${PAL.violet})` }}></div>
      <Txt x={120} y={730} mono fs={20} color={PAL.flow} a={E(t, 35.8)}>decided at compile time</Txt>
      <Txt x={960} y={730} anchor="mid" mono fs={20} color={PAL.pull} a={E(t, 36.3)}>decided by the object's class</Txt>
      <Txt x={1800} y={730} anchor="right" mono fs={20} color={PAL.violet} a={E(t, 36.8)}>decided by a bootstrap method</Txt>
    </React.Fragment>
  );
}

// ── vtable dispatch ────────────────────────────────────────────────────────
export function SVTable({ t }) {
  const vt = (name, rows, x, at, marks) => (
    <React.Fragment>
      <Txt x={x} y={300} mono fs={19} weight={600} color={PAL.ink} a={E(t, at)}>{name} <span style={{ color: PAL.ink3, fontWeight: 400 }}>· klass · vtable</span></Txt>
      <Table x={x} y={336} cols={[80, 250]} head={['slot', 'method']} rows={rows} a={E(t, at + 0.2)} fs={18} rh={46} marks={marks} colColors={[PAL.pull, PAL.ink]} />
    </React.Fragment>
  );
  const AX = 1130, DX = 1484;
  const dogRow5 = [DX + 330, 336 + 42 + 1 * 46 + 23];
  return (
    <React.Fragment>
      <Code x={96} y={190} w={640} h={330} title="Animals.java" a={E(t, 0.5)} fs={21} lh={36} lines={[
        'class Animal {', '    void speak() { … }', '    void eat()   { … }', '}', 'class Dog extends Animal {', '    void speak() { … }  // override', '}',
      ].map((s, i) => ({ s, tone: i === 5 ? 'pull' : undefined, toneA: win(t, 5, 24) }))} />
      <Code x={96} y={550} w={640} h={160} title="caller" a={E(t, 24)} fs={21} lh={38} hl={1} hlA={win(t, 24.5, 41)} lines={['Animal a = new Dog();', 'a.speak();  // invokevirtual Animal.speak']} />

      <Panel x={1110} y={200} w={714} h={600} title="metaspace" tone="violet" a={E(t, 11)} />
      {vt('Animal', [['0–4', 'Object methods'], ['5', 'speak → Animal.speak'], ['6', 'eat → Animal.eat']], AX, 11.5, { 1: ['pull', win(t, 16.5, 24)] })}
      {vt('Dog', [['0–4', 'Object methods'], ['5', 'speak → Dog.speak'], ['6', 'eat → Animal.eat']], DX, 14, { 1: ['pull', Math.max(win(t, 16.5, 24), win(t, 35.5, 47))], 2: ['ink', win(t, 16.5, 24)] })}
      <Box x={AX} y={690} w={330} h={70} label="Animal.speak()" fs={20} a={E(t, 12)} />
      <Box x={DX} y={690} w={330} h={70} label="Dog.speak()" fs={20} tone="flow" a={E(t, 14.5)} glow={pulse(t, [38], 1.6)} />
      <Badge x={1472} y={600} text="same slot in parent and child" tone="pull" a={win(t, 17, 24)} fs={17} />
      <Badge x={928} y={360} text="resolved once: speak = slot 5" tone="pull" a={win(t, 25, 46)} fs={17} />

      <Node x={790} y={560} w={280} h={150} kind="heap" name="Dog object" rows={[['mark word', '…'], ['klass', '→ Dog', PAL.flow, win(t, 30, 36)]]} a={E(t, 24.5)} glow={pulse(t, [30], 1.2)} tone="flow" />
      <Arrow from={[742, 663]} to={[788, 640]} curve={-6} draw={M(t, 30, 0.6)} color={PAL.pull} />
      <Arrow pts={[[1072, 640], [1472, 640], [1472, 312], [DX - 4, 312]]} draw={M(t, 31.6, 0.9)} color={PAL.flow} />
      <Arrow from={[dogRow5[0] - 6, dogRow5[1]]} to={[DX + 250, 688]} curve={-50} draw={M(t, 36.2, 0.8)} color={PAL.pull} />
      <Callout x={96} y={760} w={980} tone="flow" a={win(t, 41.5, 47.3)} fs={21} text="One memory load (the klass), one indexed load (the slot), one jump. Whatever the declared type." />
      <Callout x={96} y={760} w={980} tone="violet" a={E(t, 47.5)} fs={20} title="invokeinterface" text="A class can implement many interfaces, so there's no fixed slot. The JVM first searches the class's **itable** for that interface, then indexes into it." />
      <Badge x={1472} y={860} text="hot code: the JIT's inline caches skip both → 8.8" tone="pull" a={E(t, 55)} fs={17} />
    </React.Fragment>
  );
}

// ── invokedynamic ──────────────────────────────────────────────────────────
export function SIndy({ t }) {
  const linked = t >= 26.5;
  const execs = t < 26.5 ? (t >= 8.5 ? 1 : 0) : 1 + Math.floor(lin(t, 27, 6) * 9999);
  const fast = (k) => { const s = 27.5 + k * 1.1; const p = M(t, s, 0.6); return p > 0 && p < 1 ? <Dot key={k} x={lerp(1310, 1460, p)} y={530} color={PAL.flow} r={8} /> : null; };
  return (
    <React.Fragment>
      <Code x={96} y={190} w={800} h={150} title="Calc.main" a={E(t, 0.5)} fs={20} lh={36} lines={['System.out.println("r = " + r);', { s: '19: invokedynamic #20, 0   // makeConcatWithConstants', lang: 'bytecode' }]} />
      <Panel x={96} y={370} w={800} h={210} title="BootstrapMethods attribute (in Calc.class)" a={E(t, 4.5)} tone="violet">
        <div style={{ padding: '16px 22px', font: `500 20px ${MONO}`, color: PAL.ink2, lineHeight: 1.65 }}>
          <div>0: <span style={{ color: PAL.violet }}>REF_invokeStatic</span></div>
          <div style={{ color: PAL.ink }}>   StringConcatFactory.makeConcatWithConstants</div>
          <div>   recipe: <span style={{ color: PAL.str }}>"r = \u0001"</span>  <span style={{ color: PAL.ink3 }}>// \u0001 = where r goes</span></div>
        </div>
      </Panel>

      <Box x={1000} y={210} w={300} h={110} label="call site #20" sub={linked ? 'linked' : t >= 8.5 ? 'unlinked · no target' : ''} tone={linked ? 'flow' : 'dim'} dashed={!linked} a={E(t, 8.5)} glow={pulse(t, [26.5], 1.4)} />
      <Arrow from={[1300, 265]} to={[1460, 265]} draw={M(t, 13, 0.6)} color={PAL.violet} label="1st time only" lx={1380} ly={248} lfs={17} />
      <Box x={1464} y={210} w={360} h={110} label="bootstrap method" sub="StringConcatFactory" tone="violet" a={E(t, 13.2)} glow={win(t, 13.5, 20) * 0.8} />
      <VArrow x={1644} y1={322} y2={470} a={E(t, 20)} color={PAL.violet} label="returns" lfs={17} />
      <Box x={1464} y={474} w={360} h={110} label="CallSite" sub="→ MethodHandle (target)" tone="flow" a={E(t, 20.4)} glow={pulse(t, [20.5], 1.2)} />
      <Arrow pts={[[1150, 322], [1150, 530], [1460, 530]]} draw={M(t, 26.5, 0.8)} color={PAL.flow} width={3} />
      {[0, 1, 2, 3, 4].map(fast)}
      <Txt x={1176} y={360} mono fs={19} color={PAL.ink2} a={E(t, 9)}>executions: <span style={{ color: PAL.ink }}>{execs.toLocaleString('en-US')}</span></Txt>
      <Txt x={1176} y={392} mono fs={19} color={PAL.ink2} a={E(t, 14)}>bootstrap calls: <span style={{ color: PAL.violet }}>1</span></Txt>

      <Txt x={96} y={632} mono fs={18} color={PAL.ink3} a={E(t, 33)}>LAMBDAS · SAME MECHANISM</Txt>
      {[['invokedynamic', 'returns a Runnable', 'violet'], ['LambdaMetafactory', 'the bootstrap', 'violet'], ['hidden class', 'implements Runnable', 'pull'], ['lambda$new$0()', 'your lambda body', 'flow']].map(([l, s, tone], i) => (
        <React.Fragment key={l}>
          <Box x={96 + i * 440} y={670} w={380} h={96} label={l} sub={s} tone={tone} a={E(t, 33.4 + i * 0.9)} fs={21} />
          {i > 0 && <HArrow x1={96 + i * 440 - 58} x2={96 + i * 440 - 4} y={718} a={E(t, 33.4 + i * 0.9)} color={PAL.ink2} />}
        </React.Fragment>
      ))}
      <Callout x={96} y={800} w={1728} tone="pull" a={win(t, 41, 46.3)} fs={21} text="The payoff: the **strategy lives in the JDK**, not in your class file. A newer JDK can link the same call site to better code." />
      <Callout x={96} y={800} w={1728} tone="flow" a={E(t, 46.5)} fs={21} title="java 9 · JEP 280" text="String `+` moved from `StringBuilder` bytecode to `invokedynamic`. Anything compiled with javac 9+ gets each JDK's improvements **without recompiling**." />
    </React.Fragment>
  );
}
