// 8.3 scenes, part 1: intro, the process map, NMT, frames push/pop, inside a frame.
const { PAL, MOTION, lin, lerp, win, pulse, step, track, hlAt, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Mark, Val, Brace, toneColor } = window.AN;
import { USERS_SRC, Tok, Frame, frameA, Slot, RealTag } from './common.jsx';
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

// ── Intro ──────────────────────────────────────────────────────────────────
export function SIntro({ t }) {
  const Y = 480;
  const lines = USERS_SRC.slice(1);
  return (
    <React.Fragment>
      <Txt x={96} y={150} mono fs={22} weight={600} color={PAL.pull} a={E(t, 0.3)} style={{ letterSpacing: '0.14em' }}>PART 08 · THE JVM · 8.3</Txt>
      <Txt x={92} y={192} fs={118} weight={700} lh={1} a={E(t, 0.6, 0.9)} style={{ letterSpacing: '-0.03em', transform: `translateY(${(1 - E(t, 0.6, 0.9)) * 24}px)` }}>Runtime memory areas</Txt>
      <Txt x={96} y={338} fs={36} color={PAL.ink2} a={E(t, 1.4, 0.8)}>Where your objects, your variables and your classes actually live.</Txt>

      <Code x={96} y={Y} w={620} h={365} fs={17} lh={27} title="Users.java" a={E(t, 2)} lines={lines}
        hl={6} hlA={win(t, 6, 16)} />
      <Txt x={406} y={Y + 380} anchor="mid" fs={20} color={PAL.ink2} a={E(t, 22)}>the running example</Txt>

      <Panel x={760} y={Y} w={330} h={365} title="stack" right="per thread" tone="flow" a={E(t, 2.6)} />
      <Box x={782} y={Y + 200} w={286} h={64} label="makeUser" sub="name · age · u" tone="flow" a={win(t, 7, 11.5)} fs={19} sfs={17} />
      <Box x={782} y={Y + 276} w={286} h={64} label="main" sub="args · ana" tone="flow" a={E(t, 6.4)} fs={19} sfs={17} glow={pulse(t, [9], 1.2)} />

      <Panel x={1130} y={Y} w={420} h={365} title="heap" right="shared" tone="pull" a={E(t, 3.0)} />
      <Node x={1160} y={Y + 70} w={360} h={110} kind="Users$User" rows={[['name', '"Ana"'], ['age', '30']]} tone="pull" a={E(t, 8)} />
      <Box x={1160} y={Y + 220} w={360} h={90} label={'User "Bob"'} sub="nothing points here" tone="bad" dashed a={E(t, 10.5)} fs={19} sfs={17} />
      <Arrow pts={[[1070, Y + 308], [1110, Y + 308], [1110, Y + 125], [1156, Y + 125]]} draw={M(t, 9, 0.7)} color={PAL.flow} />

      <Panel x={1590} y={Y} w={234} h={365} title="metaspace" tone="violet" a={E(t, 3.4)} />
      <Box x={1610} y={Y + 70} w={194} h={90} label="class User" sub="Klass" tone="violet" a={E(t, 13)} fs={19} sfs={17} />
      <Box x={1610} y={Y + 176} w={194} h={70} label="bytecode" tone="violet" a={E(t, 13.5)} fs={18} />
      <Box x={1610} y={Y + 262} w={194} h={70} label="constants" tone="violet" a={E(t, 14)} fs={18} />

      <Badge x={925} y={Y + 400} text="StackOverflowError" tone="bad" a={POP(t, 17.2)} fs={17} />
      <Badge x={1340} y={Y + 400} text="OOM: Java heap space" tone="bad" a={POP(t, 17.8)} fs={17} />
      <Badge x={1707} y={Y + 400} text="OOM: Metaspace" tone="bad" a={POP(t, 18.4)} fs={17} />
    </React.Fragment>
  );
}

// ── The process map: per-thread vs shared ──────────────────────────────────
const MK_PCS = [0, 2, 3, 6, 7, 8, 9, 12, 13];
export function SProcessMap({ t }) {
  const cols = [{ x: 126, name: 'main', who: '"Ana"', ph: 0 }, { x: 496, name: 'worker', who: '"Bob"', ph: 4 }];
  const merged = M(t, 26, 1.0);
  const pcOf = (ph) => (t < 12 ? 0 : MK_PCS[(Math.floor((t - 12) / 0.9) + ph) % MK_PCS.length]);
  return (
    <React.Fragment>
      <Panel x={96} y={190} w={1728} h={740} title="one JVM = one OS process" right="java TwoThreads" a={E(t, 0.4)} />
      <Txt x={126} y={252} mono fs={17} color={PAL.ink3} a={E(t, 2.5)}>PER THREAD</Txt>
      <Txt x={880} y={252} mono fs={17} color={PAL.ink3} a={E(t, 3)}>SHARED BY ALL THREADS</Txt>
      <div style={{ position: 'absolute', left: 862, top: 250, width: 2, height: 650, background: PAL.line2, opacity: E(t, 3) }}></div>
      {cols.map((c, i) => {
        const a0 = E(t, 6.4 + i * 0.5);
        return (
          <React.Fragment key={c.name}>
            <Txt x={c.x + 170} y={282} anchor="mid" mono fs={20} weight={600} color={PAL.flow} a={a0}>{`thread ${c.name}`}</Txt>
            <Box x={c.x} y={320} w={340} h={64} label={`pc = ${pcOf(c.ph)}`} sub="PC register" tone="flow" a={E(t, 12 + i * 0.4)} fs={22} sfs={17} glow={win(t, 12, 19) * 0.5} />
            <Panel x={c.x} y={404} w={340} h={330} title="JVM stack" tone="flow" a={E(t, 19 + i * 0.4)} />
            {i === 0 ? (
              <React.Fragment>
                <Box x={c.x + 16} y={470} w={308} h={118} label={'makeUser("Ana")'} sub="name · age=30 · u" tone="flow" a={E(t, 20)} fs={19} sfs={17} align="left" />
                <Box x={c.x + 16} y={600} w={308} h={110} label="main" sub="args · ana" tone="flow" a={E(t, 19.6)} fs={19} sfs={17} align="left" />
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Box x={c.x + 16} y={470} w={308} h={118} label={'makeUser("Bob")'} sub="name · age=30 · u" tone="flow" a={E(t, 20.4)} fs={19} sfs={17} align="left" />
                <Box x={c.x + 16} y={600} w={308} h={50} label="lambda$main$0" tone="flow" a={E(t, 20.2)} fs={17} align="left" />
                <Box x={c.x + 16} y={660} w={308} h={50} label="Thread.run" tone="flow" a={E(t, 20)} fs={17} align="left" />
              </React.Fragment>
            )}
            <Box x={c.x} y={lerp(756, 738, merged)} w={340} h={70} label="native method stack" sub={merged > 0.5 ? 'same OS stack in HotSpot' : 'JVM spec'} tone="pink" dashed={merged < 0.5} a={E(t, 26)} fs={17} sfs={17} />
            <div style={{ position: 'absolute', left: c.x - 8, top: 400, width: 356, height: 424, borderRadius: 16, border: `2px dashed ${PAL.ink2}`, opacity: E(t, 27.2) * 0.8, boxSizing: 'border-box' }}></div>
            <Txt x={c.x + 170} y={840} anchor="mid" mono fs={17} color={PAL.ink2} a={E(t, 27.4)}>one OS thread stack · 2 MB</Txt>
          </React.Fragment>
        );
      })}

      <Panel x={880} y={280} w={914} h={330} title="heap" tone="pull" a={E(t, 32.5)} glow={win(t, 33, 39) * 0.6} />
      <Node x={930} y={360} w={320} h={120} kind="Users$User" name={'"Ana"'} rows={[['age', '30']]} tone="pull" a={POP(t, 33.4)} glow={pulse(t, [52], 1.4)} />
      <Node x={1300} y={360} w={320} h={120} kind="Users$User" name={'"Bob"'} rows={[['age', '30']]} tone="pull" a={POP(t, 34)} />
      <Arrow pts={[[466, 530], [481, 530], [481, 393], [926, 393]]} draw={M(t, 34.4, 0.9)} color={PAL.flow} />
      <Arrow pts={[[836, 545], [858, 545], [858, 560], [1460, 560], [1460, 484]]} draw={M(t, 35, 0.9)} color={PAL.flow} />
      <Arrow pts={[[836, 505], [900, 505], [900, 450], [926, 450]]} draw={M(t, 51.5, 0.8)} color={PAL.pull} dashed />
      <Badge x={1110} y={520} text="worker → Ana too" tone="pull" a={E(t, 52.4)} fs={17} />

      <Panel x={880} y={640} w={440} h={200} title="metaspace" tone="violet" a={E(t, 39.5)} glow={win(t, 40, 45.5) * 0.6} />
      <Box x={904} y={704} w={392} h={84} label="Users$User" sub="Klass · methods · constant pool" tone="violet" a={E(t, 40)} fs={20} sfs={17} />
      <Txt x={1100} y={800} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 41)}>loaded once, used by every thread</Txt>
      <Panel x={1354} y={640} w={440} h={200} title="code cache" tone="blue" a={E(t, 45.5)} glow={win(t, 46, 51) * 0.6} />
      <Box x={1378} y={704} w={392} h={84} label="makeUser → machine code" sub="once the JIT compiles it (8.8)" tone="blue" a={E(t, 46)} fs={19} sfs={17} />
      <Callout x={880} y={862} w={914} tone="flow" a={E(t, 56)} fs={19} text="**Private stacks, shared heap.** That split explains pass-by-value, and why threads can race on one object (Part 09)." />
    </React.Fragment>
  );
}

// ── Native Memory Tracking: the map, measured ──────────────────────────────
const NMT = [
  // label, reserved KB, committed KB, tone, at, note
  ['Java Heap', 2097152, 133120, 'pull', 11, '2 GB reserved · 130 MB committed'],
  ['Class (metaspace)', 1048672, 224, 'violet', 19, '1 GB reserved · 224 KB committed'],
  ['Thread · 19 threads', 39187, 39187, 'flow', 27, '38 MB: about 2 MB of stack each'],
  ['Code (code cache)', 247747, 7635, 'blue', 35, '242 MB reserved · 7.5 MB committed'],
  ['GC (bookkeeping)', 128172, 55324, 'ink', 35.6, '125 MB reserved · 54 MB committed'],
];
export function SNmt({ t }) {
  const X0 = 940, W = 860, S = W / 2097152;
  return (
    <React.Fragment>
      <Console x={96} y={190} w={800} h={560} t={t} a={E(t, 0.4)} fs={17} lh={27} title="terminal · output condensed" items={[
        { at: 5.5, text: 'java -XX:NativeMemoryTracking=summary Live &', kind: 'cmd' },
        { at: 6.5, text: 'jcmd 874 VM.native_memory summary', kind: 'cmd' },
        { at: 7.5, text: 'Total: reserved=3646439KB, committed=251495KB' },
        { at: 11, text: '-  Java Heap (reserved=2097152KB, committed=133120KB)', kind: t >= 11 && t < 19 ? 'ok' : undefined },
        { at: 19, text: '-      Class (reserved=1048672KB, committed=224KB)', kind: t >= 19 && t < 27 ? 'ok' : undefined },
        { at: 19.2, text: '             (classes #668)', kind: 'dim' },
        { at: 27, text: '-     Thread (reserved=39187KB, committed=39187KB)', kind: t >= 27 && t < 35 ? 'ok' : undefined },
        { at: 27.2, text: '             (thread #19)', kind: 'dim' },
        { at: 35, text: '-       Code (reserved=247747KB, committed=7635KB)', kind: t >= 35 ? 'ok' : undefined },
        { at: 35.6, text: '-         GC (reserved=128172KB, committed=55324KB)' },
        { at: 36, text: '-  Shared class space (reserved=16384KB, committed=12032KB)', kind: 'dim' },
      ]} />
      <RealTag x={96} y={766} a={E(t, 7.5)} text="real output · JDK 17 · macOS arm64 · 8 GB" />

      <Txt x={X0} y={196} mono fs={17} color={PAL.ink3} a={E(t, 1.5)}>RESERVED (outline) vs COMMITTED (filled)</Txt>
      {NMT.map(([label, res, com, tone, at, note], i) => {
        const y = 240 + i * 132, a = E(t, at), c = toneColor(tone);
        const rw = Math.max(6, res * S * M(t, at, 1)), cw = Math.max(3, com * S * M(t, at + 0.6, 1));
        return (
          <React.Fragment key={label}>
            <Txt x={X0} y={y} fs={22} weight={600} color={PAL.ink} a={Math.max(E(t, 1.5 + i * 0.2) * 0.45, a)}>{label}</Txt>
            <div style={{ position: 'absolute', left: X0, top: y + 38, width: rw, height: 40, opacity: a, boxSizing: 'border-box', border: `2px dashed ${hexA(c, 0.8)}`, borderRadius: 6 }}></div>
            <div style={{ position: 'absolute', left: X0, top: y + 38, width: cw, height: 40, opacity: a, background: hexA(c, 0.75), borderRadius: 6 }}></div>
            <Txt x={X0} y={y + 88} mono fs={17} color={c} a={E(t, at + 0.8)}>{note}</Txt>
          </React.Fragment>
        );
      })}
      <Callout x={96} y={810} w={800} tone="pull" a={E(t, 37)} fs={19} text="**Reserve big, commit as needed.** Reserved is address space; committed is real memory." />
    </React.Fragment>
  );
}

// ── Frames push and pop as the running example executes ────────────────────
const MAIN_BC = [' 0: ldc           #12  // "Ana"', ' 2: invokestatic  #14  // makeUser', ' 5: astore_1           // ana', ' 6: ldc           #20  // "Bob"', ' 8: invokestatic  #14  // makeUser', '11: pop                // dropped!'];
export function SFrames({ t }) {
  const [hl, hA] = hlAt(t, [[4.5, 6], [9.5, 7], [12, 1], [17, 2], [22, 3], [30, 4], [34, 7], [43, 8], [45.5, 3], [48.5, 4], [50, 8], [63.5, 9], [67, 10], [70, -1]]);
  const [bh, bA] = hlAt(t, [[9.5, 0], [11, 1], [34, 2], [43, 3], [44, 4], [50, 5], [63.5, -1]]);
  const MF = { x: 800, y: 740, w: 480, h: 170 }, KF = { x: 800, y: 450, w: 480, h: 260 };
  const ana = frameA(t, 9.6, 31), bob = frameA(t, 43.6, 51.2), mainF = frameA(t, 4.5, 67);
  const bobDead = t >= 51.5, anaDead = t >= 67.6;
  return (
    <React.Fragment>
      <Code x={96} y={190} w={640} h={420} title="Users.java" a={E(t, 0.4)} fs={19} lh={32} hl={hl} hlA={hA} lines={USERS_SRC} />
      <Code x={96} y={630} w={640} h={260} title="javap -c Users · main" lang="bytecode" a={E(t, 1)} fs={18} lh={32} hl={bh} hlA={bA} lines={MAIN_BC} />

      <Panel x={780} y={190} w={520} h={740} title="stack · thread main" tone="flow" a={E(t, 0.6)} />
      <Frame t={t} {...MF} title="main" right="max_locals 2" push={4.5} pop={67}>
        <Slot x={20} y={70} w={200} idx={0} name="args" value="String[]" tone="ink" />
        <Slot x={260} y={70} w={200} idx={1} name="ana" value={t >= 31.6 ? '→ User' : ''} tone="flow" glow={pulse(t, [31.6], 1.2)} />
      </Frame>
      <Frame t={t} {...KF} title={'makeUser("Ana")'} right="max_locals 3" push={9.6} pop={31}>
        <Slot x={20} y={80} w={140} idx={0} name="name" value={'→ "Ana"'} fs={18} />
        <Slot x={175} y={80} w={140} idx={1} name="age" value={t >= 17.4 ? '30' : ''} tone="pull" glow={pulse(t, [17.4], 1.2)} />
        <Slot x={330} y={80} w={130} idx={2} name="u" value={t >= 24 ? '→ User' : ''} fs={18} glow={pulse(t, [24], 1.2)} />
        <Txt x={20} y={196} mono fs={17} color={PAL.ink3}>primitives by value · objects by reference</Txt>
      </Frame>
      <Frame t={t} {...KF} title={'makeUser("Bob")'} right="max_locals 3" push={43.6} pop={51.2}>
        <Slot x={20} y={80} w={140} idx={0} name="name" value={'→ "Bob"'} fs={18} />
        <Slot x={175} y={80} w={140} idx={1} name="age" value={t >= 45 ? '30' : ''} tone="pull" />
        <Slot x={330} y={80} w={130} idx={2} name="u" value={t >= 47.6 ? '→ User' : ''} fs={18} />
      </Frame>
      <Tok t={t} text="→ User" keys={[[30.2, 1195, 570], [31.4, 1160, 850]]} until={31.5} w={130} h={56} fs={18} />
      <Tok t={t} text="→ User" keys={[[49.6, 1195, 570], [50.6, 1040, 690]]} until={50.9} w={130} h={56} fs={18} tone="bad" />
      <Badge x={1040} y={300} text="stdout: Ana" tone="flow" a={E(t, 64.5)} fs={20} />
      <Callout x={800} y={380} w={480} tone="flow" a={E(t, 69)} fs={20} text="**Stack**: freed instantly, just by popping frames." />
      <Callout x={800} y={500} w={480} tone="pull" a={E(t, 70.5)} fs={20} text="**Heap**: objects stay until the GC finds them unreachable." />

      <Panel x={1350} y={190} w={474} h={740} title="heap · shared" tone="pull" a={E(t, 0.8)} />
      <Box x={1380} y={260} w={170} h={64} label={'"Ana"'} sub="String" tone="pink" a={E(t, 9.5)} fs={20} sfs={17} />
      <Node x={1380} y={350} w={420} h={130} kind="Users$User · 24 bytes" rows={[['name', '→ "Ana"'], ['age', '30']]} tone={anaDead ? 'dim' : 'pull'} a={POP(t, 22.6)} glow={pulse(t, [22.6], 1.2)} />
      <Arrow pts={[[1802, 410], [1814, 410], [1814, 292], [1556, 292]]} draw={M(t, 23.4, 0.6)} color={PAL.pink} />
      <Box x={1380} y={560} w={170} h={64} label={'"Bob"'} sub="String" tone="pink" a={E(t, 43.4)} fs={20} sfs={17} />
      <Node x={1380} y={650} w={420} h={130} kind="Users$User · 24 bytes" rows={[['name', '→ "Bob"'], ['age', '30']]} tone="pull" bad={bobDead} a={POP(t, 46.8)} shake={t > 51.5 && t < 52.3 ? Math.sin(t * 60) * 5 : 0} />
      <Arrow pts={[[1802, 710], [1814, 710], [1814, 592], [1556, 592]]} draw={M(t, 47.4, 0.6)} color={PAL.pink} />
      <Badge x={1590} y={812} text="unreachable · garbage" tone="bad" a={E(t, 56)} fs={17} />
      <Badge x={1590} y={510} text="unreachable once main returns" tone="dim" a={E(t, 68)} fs={17} />

      {/* stack → heap references */}
      <Arrow pts={[[1262, 570], [1310, 570], [1310, 415], [1376, 415]]} draw={M(t, 24.2, 0.7)} a={ana.a} color={PAL.flow} />
      <Arrow pts={[[1262, 850], [1325, 850], [1325, 440], [1376, 440]]} draw={M(t, 31.8, 0.8)} a={mainF.a} color={PAL.flow} />
      <Arrow pts={[[1262, 570], [1310, 570], [1310, 715], [1376, 715]]} draw={M(t, 47.8, 0.7)} a={bob.a} color={PAL.flow} />
    </React.Fragment>
  );
}

// ── What a frame holds, and real stacks from jcmd ──────────────────────────
export function SFrameAnatomy({ t }) {
  const nat = t >= 38.5 ? 'ok' : undefined;
  const ops = [['→ User', 'flow', 'new'], ['→ User', 'flow', 'dup'], ['→ "Ana"', 'pink', 'aload_0'], ['30', 'pull', 'iload_1']];
  return (
    <React.Fragment>
      <Panel x={96} y={190} w={800} h={560} title={'frame · makeUser("Ana")'} tone="flow" a={E(t, 0.4)} />
      <Txt x={126} y={252} mono fs={17} color={PAL.flow} a={E(t, 4)}>1 · LOCAL VARIABLES</Txt>
      <Slot x={126} y={316} w={220} idx={0} name="name" value={'→ "Ana"'} a={E(t, 4.4)} />
      <Slot x={366} y={316} w={220} idx={1} name="age" value="30" tone="pull" a={E(t, 4.8)} />
      <Slot x={606} y={316} w={250} idx={2} name="u" value="(not yet)" tone="ink" a={E(t, 5.2)} />
      <Txt x={126} y={418} mono fs={17} color={PAL.pull} a={E(t, 10.5)}>2 · OPERAND STACK  <span style={{ color: PAL.ink3 }}>bottom → top</span></Txt>
      {ops.map(([v, tone, op], i) => (
        <React.Fragment key={i}>
          <Box x={126 + i * 184} y={456} w={168} h={58} label={v} tone={tone} a={E(t, 11 + i * 0.8)} fs={19} glow={pulse(t, [11 + i * 0.8], 1)} />
          <Txt x={210 + i * 184} y={522} anchor="mid" mono fs={16} color={PAL.ink3} a={E(t, 11.2 + i * 0.8)}>{`after ${op}`}</Txt>
        </React.Fragment>
      ))}
      <Txt x={126} y={572} mono fs={17} color={PAL.violet} a={E(t, 17.5)}>3 · FRAME DATA</Txt>
      <Box x={126} y={608} w={350} h={84} label="return address" sub="back to main, pc 5" tone="violet" a={E(t, 18)} fs={20} sfs={17} />
      <Box x={496} y={608} w={370} h={84} label="constant pool link" sub="→ Users, in metaspace" tone="violet" a={E(t, 18.6)} fs={20} sfs={17} />
      <Callout x={96} y={780} w={800} tone="pull" a={E(t, 24)} fs={20} text="Size fixed before the call: `max_locals = 3`, `max_stack = 4`, straight from the class file (8.1)." />

      <Code x={940} y={190} w={884} h={428} title="javap -c Users · makeUser" lang="bytecode" a={win(t, 0.8, 29.6)} fs={20} lh={36}
        hl={hlAt(t, [[11, 2], [11.8, 3], [12.6, 4], [13.4, 5], [24, -1]])[0]} hlA={hlAt(t, [[11, 2], [11.8, 3], [12.6, 4], [13.4, 5], [24, -1]])[1]} lines={[
          ' 0: bipush        30', ' 2: istore_1                 // age = 30', ' 3: new           #7   // class Users$User', ' 6: dup', ' 7: aload_0                  // name', ' 8: iload_1                  // age',
          ' 9: invokespecial #9   // User.<init>   ← next', '12: astore_2                 // u', '13: aload_2', '14: areturn',
        ]} />
      <Callout x={940} y={640} w={884} tone="pull" a={win(t, 14, 29.6)} fs={19} text="`<init>` will pop all four. The leftover `dup` copy is then stored in `u` by `astore_2`." />
      <Console x={940} y={190} w={884} h={560} t={t} a={E(t, 30)} fs={17} lh={27} title="terminal" items={[
        { at: 30.4, text: 'jcmd <pid> Thread.print', kind: 'cmd' },
        { at: 31, text: '"main" #1 prio=5 os_prio=31 … [0x000000016fa46000]' },
        { at: 31.2, text: '   java.lang.Thread.State: TIMED_WAITING (sleeping)', kind: 'dim' },
        { at: 31.4, text: '    at java.lang.Thread.sleep(java.base@17.0.17/Native Method)', kind: nat },
        { at: 31.6, text: '    at TwoThreads.makeUser(TwoThreads.java:7)' },
        { at: 31.8, text: '    at TwoThreads.main(TwoThreads.java:16)' },
        { at: 32.4, text: '"worker" #14 prio=5 os_prio=31 … [0x0000000172036000]' },
        { at: 32.6, text: '   java.lang.Thread.State: TIMED_WAITING (sleeping)', kind: 'dim' },
        { at: 32.8, text: '    at java.lang.Thread.sleep(java.base@17.0.17/Native Method)', kind: nat },
        { at: 33, text: '    at TwoThreads.makeUser(TwoThreads.java:7)' },
        { at: 33.2, text: '    at TwoThreads.lambda$main$0(TwoThreads.java:13)' },
        { at: 33.4, text: '    at TwoThreads$$Lambda$1/0x0000007001000a08.run(Unknown Source)' },
        { at: 33.6, text: '    at java.lang.Thread.run(java.base@17.0.17/Thread.java:840)' },
      ]} />
      <Callout x={940} y={780} w={884} tone={t >= 38.5 ? 'pink' : 'flow'} a={E(t, 34)} fs={19} text={t >= 38.5 ? 'Top frame: `Thread.sleep` is a **native** method. Its frame sits on the same OS thread stack, above the Java frames.' : 'TwoThreads.java: `makeUser` with a `Thread.sleep` inside, called by `main` and by a `worker` thread. Two stacks, two addresses.'} />
    </React.Fragment>
  );
}
