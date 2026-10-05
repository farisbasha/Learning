// 8.4 scenes, part 1: intro, the header, the mark word (bits, states, ages), the class pointer.
// Values: JOL 0.17 on JDK 17 (Homebrew 17.0.17, macOS arm64) unless labelled JDK 25.
import { POINT_SRC, TONE, BitRow, hexToBits, Tok, Lines, Ruler } from './common.jsx';
const { PAL, MOTION, lerp, win, pulse, step, track, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Bytes, Brace, Chip, Mark, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

// ── Intro ──────────────────────────────────────────────────────────────────
export function SIntro({ t }) {
  const Y = 540, BX = 840, U = 40;
  const chips = ['mark word', 'class pointer', 'field order', 'padding', 'compressed oops', 'compact headers', 'Valhalla'];
  const cw = chips.map((c) => c.length * 10.8 + 34);
  const total = cw.reduce((s, w) => s + w, 0) + (chips.length - 1) * 18;
  let cx = 960 - total / 2;
  return (
    <React.Fragment>
      <Txt x={96} y={150} mono fs={22} weight={600} color={PAL.pull} a={E(t, 0.3)} style={{ letterSpacing: '0.14em' }}>PART 08 · THE JVM · 8.4</Txt>
      <Txt x={92} y={192} fs={110} weight={700} lh={1} a={E(t, 0.6, 0.9)} style={{ letterSpacing: '-0.03em', transform: `translateY(${(1 - E(t, 0.6, 0.9)) * 24}px)` }}>How an object is laid out</Txt>
      <Txt x={96} y={330} fs={34} color={PAL.ink2} a={E(t, 1.4, 0.8)}>Headers, padding, compressed oops and compact headers, byte by byte.</Txt>

      <Code x={96} y={Y - 30} w={520} h={216} fs={22} lh={36} title="Point.java" a={E(t, 1.8)} lines={POINT_SRC} />
      <Txt x={356} y={Y + 198} anchor="mid" fs={20} color={PAL.ink2} a={E(t, 2.2)}>two ints: 8 bytes of data</Txt>
      <HArrow x1={640} x2={820} y={Y + 80} a={E(t, 5.5)} color={PAL.pull} label="new Point()" lfs={17} />
      <Bytes x={BX} y={Y + 40} unit={U} h={84} fs={19} sfs={17} ruler={false} a={E(t, 5.6)} cells={[
        { n: 8, label: 'mark word', sub: '8 bytes', tone: TONE.mark, a: E(t, 6) },
        { n: 4, label: 'class', sub: '4 bytes', tone: TONE.klass, a: E(t, 6.5) },
        { n: 4, label: 'x', sub: 'int', tone: TONE.field, a: E(t, 7), glow: win(t, 5.5, 11) },
        { n: 4, label: 'y', sub: 'int', tone: TONE.field, a: E(t, 7.3), glow: win(t, 5.5, 11) },
        { n: 4, label: 'pad', sub: '4 bytes', pad: true, a: E(t, 7.8) },
      ]} />
      <Brace x={BX} y={Y + 26} w={12 * U} above label="header: 12 bytes" tone={TONE.mark} a={E(t, 11.2)} />
      <Brace x={BX + 12 * U} y={Y + 152} w={8 * U} label="your data: 8" tone="flow" a={E(t, 11.6)} />
      <Brace x={BX + 20 * U} y={Y + 152} w={4 * U} label="padding: 4" a={E(t, 12)} />
      <Txt x={BX + 12 * U} y={Y + 218} anchor="mid" fs={30} weight={600} a={E(t, 8.5)}>8 bytes of data → <span style={{ color: PAL.pull }}>24 bytes</span> on the heap</Txt>

      {chips.map((c, i) => { const x = cx + cw[i] / 2; cx += cw[i] + 18; return <Chip key={c} x={x} y={890} text={c} tone={i < 2 ? 'violet' : i < 4 ? 'flow' : 'pull'} fs={18} h={44} mono o={E(t, 17.5 + i * 0.25)} />; })}
    </React.Fragment>
  );
}

// ── Anatomy: every object starts with a header ─────────────────────────────
export function SAnatomy({ t }) {
  const X = 192, U = 64;
  const focus = t < 11.5 ? 0 : t < 17.5 ? 1 : t < 24 ? 2 : t < 31 ? 3 : -1;
  return (
    <React.Fragment>
      <Txt x={X} y={196} mono fs={17} color={PAL.ink3} a={E(t, 1)}>ONE Point OBJECT ON THE HEAP · OFFSETS IN BYTES</Txt>
      <div style={{ position: 'absolute', left: X, top: 230, width: 24 * U, height: 90, boxSizing: 'border-box', borderRadius: 6, border: `2px dashed ${PAL.line2}`, opacity: E(t, 0.6) * (1 - E(t, 24.5)) }}></div>
      <Bytes x={X} y={230} unit={U} h={90} fs={22} sfs={17} ruler={false} a={E(t, 0.6)} cells={[
        { n: 8, label: 'mark word', sub: '8 bytes', tone: TONE.mark, a: E(t, 5), glow: focus === 0 ? 0.8 : 0 },
        { n: 4, label: 'class pointer', sub: '4 bytes', tone: TONE.klass, a: E(t, 11.5), glow: focus === 1 ? 0.8 : 0 },
        { n: 4, label: 'int x', sub: 'offset 12', tone: TONE.field, a: E(t, 17.5), glow: focus === 2 ? 0.8 : 0 },
        { n: 4, label: 'int y', sub: 'offset 16', tone: TONE.field, a: E(t, 18.3), glow: focus === 2 ? 0.8 : 0 },
        { n: 4, label: 'padding', sub: '4 bytes', pad: true, a: E(t, 24), glow: focus === 3 ? 0.8 : 0 },
      ]} />
      <Ruler x0={X} y={328} unit={U} marks={[0, 8, 12, 16, 20, 24]} a={E(t, 1)} />
      <Brace x={X + 12 * U} y={358} w={8 * U} label="your data · 8 of 24 bytes" tone="flow" a={E(t, 38)} />

      <Card x={96} y={420} w={540} h={170} a={E(t, 5.4)} tone="violet" num="bytes 0–7" title="Mark word" sub="identity hash, GC age, lock state. One word, reused for different jobs." tfs={28} sfs={19} glow={focus === 0 ? 0.6 : 0} />
      <Card x={690} y={420} w={540} h={170} a={E(t, 11.9)} tone="blue" num="bytes 8–11" title="Class pointer" sub="which class this object is: a link into metaspace." tfs={28} sfs={19} glow={focus === 1 ? 0.6 : 0} />
      <Card x={1284} y={420} w={540} h={170} a={E(t, 17.9)} tone="flow" num="bytes 12–23" title="Fields, then padding" sub="your data, then filler up to a multiple of 8." tfs={28} sfs={19} glow={focus >= 2 ? 0.6 : 0} />

      <Console x={96} y={612} w={1728} h={312} t={t} a={E(t, 1)} fs={18} lh={29} items={[
        { at: 1.4, text: 'java -jar jol-cli.jar internals -cp . Point', kind: 'cmd' },
        { at: 2, text: 'OFF  SZ   TYPE DESCRIPTION               VALUE', kind: 'dim' },
        { at: 5.2, text: '  0   8        (object header: mark)     0x0000000000000001 (non-biasable; age: 0)' },
        { at: 11.7, text: '  8   4        (object header: class)    0x01015000' },
        { at: 17.7, text: ' 12   4    int Point.x                   0', kind: 'ok' },
        { at: 18.5, text: ' 16   4    int Point.y                   0', kind: 'ok' },
        { at: 24.2, text: ' 20   4        (object alignment gap)    ' },
        { at: 31, text: 'Instance size: 24 bytes', kind: 'ok' },
      ]} />
      <Badge x={1640} y={680} text="JDK 17 · real output" tone="ink" a={E(t, 2)} fs={17} />
    </React.Fragment>
  );
}

// ── The mark word, bit by bit (JDK 17 layout) ──────────────────────────────
const FRESH = hexToBits('0000000000000001');
const HASHED = hexToBits('00000033e5ccce01');
export function SMarkBits({ t }) {
  const X = 128, CW = 26;
  const fill = clamp((t - 25) / 2.2, 0, 1); // hash bits written left → right
  const reveal = (i) => (i >= 25 && i < 56 ? ((i - 25) / 31 < fill ? HASHED[i] : FRESH[i]) : FRESH[i]);
  const hashed = t >= 27.2;
  const groups = [
    { from: 0, n: 25, tone: 'dim', label: 'unused · 25 bits' },
    { from: 25, n: 31, tone: 'pull', label: 'identity hash · 31 bits', glow: win(t, 12, 18) + win(t, 25, 31) },
    { from: 56, n: 1, tone: 'dim' },
    { from: 57, n: 4, tone: 'green', label: 'age', glow: win(t, 38, 44.6) },
    { from: 61, n: 1, tone: 'bad', label: 'b', glow: win(t, 41, 44.6) },
    { from: 62, n: 2, tone: 'flow', label: 'lock', glow: win(t, 5.5, 11.5) + E(t, 45) },
  ];
  return (
    <React.Fragment>
      <Txt x={X + 12} y={198} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 0.8)}>63</Txt>
      <Txt x={X + 63 * CW + 12} y={198} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 0.8)}>0</Txt>
      <Txt x={960} y={198} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 0.8)}>MARK WORD OF A Point · 64 BITS · JDK 17 LAYOUT</Txt>
      <BitRow x={X} y={226} cw={CW} h={50} bits={FRESH} groups={groups} reveal={reveal} a={E(t, 0.6)} />
      <Txt x={960} y={366} anchor="mid" mono fs={40} weight={600} a={E(t, 1.2)}>
        mark = 0x<span style={{ color: hashed ? PAL.pull : PAL.ink2 }}>{hashed ? '00000033e5ccce' : '00000000000000'}</span><span style={{ color: PAL.flow }}>01</span>
      </Txt>
      <Val84 t={t} />

      <Console x={96} y={470} w={1120} h={300} t={t} a={E(t, 1)} fs={18} lh={32} items={[
        { at: 1.4, text: 'java -cp jol-cli.jar:. Marks        # columns trimmed', kind: 'cmd' },
        { at: 2.2, text: 'fresh:   mark 0x0000000000000001 (non-biasable; age: 0)' },
        { at: 19, text: 'identityHashCode = 0x33e5ccce', kind: 'ok' },
        { at: 27.3, text: 'hashed:  mark 0x00000033e5ccce01 (hash: 0x33e5ccce; age: 0)', kind: 'ok' },
        { at: 32, text: 'System.out.println(p)  →  Point@33e5ccce' },
      ]} />
      <Callout x={1260} y={470} w={564} tone="pull" a={win(t, 12, 44.6)} title="lazy" fs={20} text="No hash is computed at `new`. The first `identityHashCode` (or default `hashCode`) call generates one and stores it here. Every later call just reads it." />
      <Table x={1260} y={470} cols={[110, 454]} head={['bits', 'state']} rows={[['01', 'unlocked'], ['00', 'thin lock'], ['10', 'monitor · fat lock'], ['11', 'marked by the GC']]} a={E(t, 45)} fs={20} rh={52}
        rowA={[0, 1, 2, 3].map((i) => E(t, 45.3 + i * 0.3))} colColors={[PAL.flow, PAL.ink]} marks={{ 0: ['flow', E(t, 45.3)] }} />
      <Callout x={96} y={800} w={1120} tone="violet" a={E(t, 31.5)} fs={20} text={'`Object.toString()` is `getClass().getName() + "@" + Integer.toHexString(hashCode())`. The default `hashCode()` is this stored identity hash.'} />
    </React.Fragment>
  );
}
// floating hash value that drops into the header
function Val84({ t }) {
  return <Tok t={t} keys={[[18.8, 1500, 400], [25, 1500, 400], [26.4, 1181, 251]]} text="0x33e5ccce" tone="pull" w={210} h={48} fs={22} from={18.8} until={26.8} glowAt={19} />;
}

// ── One word, many jobs: lock states and GC forwarding ─────────────────────
const STATES = [
  ['unlocked', '01', '0x00000033e5ccce01', 'hash + age live in the word', 'flow', 5],
  ['thin lock', '00', '0x000000016dc3aae0', "→ lock record on the owner's stack", 'pull', 17.5],
  ['fat lock', '10', '0x0000000bdcdbce02', '→ ObjectMonitor', 'violet', 31.5],
  ['GC: marked', '11', 'forwarding pointer', '→ the new copy (during GC only)', 'pink', 38],
];
export function SMarkStates({ t }) {
  const cur = STATES.filter((s) => t >= s[5]).length - 1;
  const markNow = t < 17.5 ? '0x00000033e5ccce01' : t < 31.5 ? '0x000000016dc3aae0' : t < 38 ? '0x0000000bdcdbce02' : 'forward → copy | 11';
  const markTone = t < 17.5 ? PAL.flow : t < 31.5 ? PAL.pull : t < 38 ? PAL.violet : PAL.pink;
  const oldA = 1 - E(t, 37.6, 0.5);
  return (
    <React.Fragment>
      {STATES.map(([name, bits, hex, desc, tone, at], i) => (
        <Panel key={name} x={96 + i * 439} y={196} w={410} h={190} title={name} right={<span style={{ color: toneColor(tone), fontWeight: 700 }}>lock bits {bits}</span>} tone={tone} a={E(t, 1 + i * 0.2) * (cur >= i ? 1 : 0.35)} glow={cur === i ? 0.8 : 0}>
          <div style={{ padding: '16px 18px', font: `600 21px ${MONO}`, color: PAL.ink }}>{hex}</div>
          <div style={{ padding: '0 18px', font: `400 19px ${SANS}`, color: PAL.ink2, lineHeight: 1.35 }}>{desc}</div>
        </Panel>
      ))}

      {/* thread T1's stack with a lock record */}
      <Panel x={96} y={430} w={500} h={350} title="thread T1 · stack" tone="flow" a={E(t, 11) * oldA}>
        <div style={{ position: 'absolute', left: 22, top: 230, width: 452, height: 56, boxSizing: 'border-box', borderRadius: 10, border: `2px solid ${PAL.line2}`, display: 'flex', alignItems: 'center', padding: '0 16px', font: `500 19px ${MONO}`, color: PAL.ink2 }}>main()</div>
      </Panel>
      <Box x={118} y={500} w={456} h={130} label="lock record" sub="displaced mark: 0x…33e5ccce01" tone="pull" fs={21} sfs={17} a={E(t, 12) * oldA} glow={win(t, 12, 17.5) + pulse(t, [45.5], 1.2)} />
      <Txt x={346} y={640} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 12.4) * oldA}>{'synchronized (p) { … }'}</Txt>

      <Node x={700} y={450} w={520} h={200} kind="heap" name="Point p" tone="flow" a={E(t, 1.4)} rfs={20}
        rows={[['mark', markNow, markTone, pulse(t, [17.5, 31.5, 38], 1.2)], ['class', '→ Point'], ['x, y', '0, 0']]} glow={pulse(t, [17.5, 31.5, 38], 1.2)} />
      <Arrow from={[698, 563]} to={[578, 566]} draw={M(t, 17.6, 0.6)} color={PAL.pull} a={win(t, 17.6, 31.4)} />
      <Arrow from={[1222, 563]} to={[1320, 563]} draw={M(t, 31.6, 0.6)} color={PAL.violet} a={win(t, 31.6, 37.8)} />

      {/* inflated monitor */}
      <Panel x={1324} y={430} w={500} h={190} title="ObjectMonitor" tone="violet" a={win(t, 24.5, 37.8)} glow={pulse(t, [45.5], 1.2)}>
        <Lines fs={19} lines={['header:  0x…33e5ccce01', 'owner:   T1', 'waiting: T2']} />
      </Panel>
      <Box x={1324} y={640} w={500} h={70} label="thread T2" sub="blocked in synchronized (p)" tone="bad" fs={20} sfs={17} a={win(t, 24.5, 37.8)} />

      {/* copying GC: forwarding pointer */}
      <Node x={1324} y={450} w={500} h={200} kind="heap · to-space" name="Point p (new copy)" tone="pink" a={E(t, 38.6)} rfs={20}
        rows={[['mark', '0x00000033e5ccce01', PAL.flow], ['class', '→ Point'], ['x, y', '0, 0']]} />
      <Arrow from={[1222, 563]} to={[1320, 563]} draw={M(t, 39, 0.6)} color={PAL.pink} />
      <Txt x={1271} y={520} anchor="mid" mono fs={17} color={PAL.pink} a={E(t, 39.5)}>forward</Txt>
      <Txt x={960} y={680} anchor="mid" fs={19} color={PAL.ink2} w={520} align="center" a={E(t, 40)}>As the GC finds other references to the old copy, it reads this pointer and updates them to the new one.</Txt>

      <Callout x={96} y={810} w={1180} tone="pull" a={win(t, 45.5, 51.8)} fs={20} title="the hash survives" text="The displaced header (hash, age) waits in the lock record or the monitor and is put back on unlock." />
      <Callout x={96} y={810} w={1728} tone="violet" a={E(t, 52)} fs={20} title="JDK 23+ · lightweight locking" text="The header stays in place and only the lock bits flip to `00`; the owner goes on the thread's own lock-stack. JDK 25, same program: `0x…4fe304f801` → `0x…4fe304f800`." />
    </React.Fragment>
  );
}

// ── GC age bits ────────────────────────────────────────────────────────────
const GCS = [11.5, 17, 19.5, 22]; // young GCs shown in the animation
export function SAges({ t }) {
  const age = t < 24 ? GCS.filter((g) => t >= g + 0.6).length : clamp(4 + Math.floor((t - 24) / 0.45), 4, 15);
  const promoted = t >= 28.6;
  const low = (age << 3) | 1;
  const bits = low.toString(2).padStart(8, '0');
  const eden = [380, 420], s0 = [820, 344], s1 = [820, 478], old = [546, 600];
  const keys = [[0, ...eden], [11.5, ...eden], [12.3, ...s0], [17, ...s0], [17.8, ...s1], [19.5, ...s1], [20.3, ...s0], [22, ...s0], [22.8, ...s1], [28.2, ...s1], [29.2, ...old]];
  return (
    <React.Fragment>
      <Panel x={96} y={196} w={900} h={340} title="young generation · Serial GC" a={E(t, 0.5)} />
      <Box x={120} y={256} w={520} h={260} label="eden" tone="ink" a={E(t, 0.8)} fs={20} style={{ justifyContent: 'flex-start', paddingTop: 14 }} />
      <Box x={658} y={256} w={324} h={140} label="survivor 0" tone="ink" a={E(t, 1)} fs={18} style={{ justifyContent: 'flex-start', paddingTop: 10 }} />
      <Box x={658} y={406} w={324} h={110} label="survivor 1" tone="ink" a={E(t, 1.2)} fs={18} style={{ justifyContent: 'flex-start', paddingTop: 10 }} />
      <Box x={96} y={560} w={900} h={80} label="old generation" tone={promoted ? 'pull' : 'ink'} a={E(t, 1.4)} fs={20} glow={pulse(t, [29.2], 1.2)} style={{ alignItems: 'flex-start', paddingLeft: 20 }} />
      <Tok t={t} keys={keys} text={`Point · age ${age}`} tone="green" w={250} h={48} fs={19} from={1.5} glowAt={-1} />
      {GCS.map((g, i) => <Badge key={i} x={380} y={490} text={`young GC ${i + 1}`} tone="bad" a={win(t, g, g + 1.6, 0.25)} fs={17} />)}
      <Badge x={380} y={490} text="…more GCs" tone="bad" a={win(t, 24, 28.4, 0.25)} fs={17} />

      <Console x={1040} y={196} w={784} h={340} t={t} a={E(t, 1)} fs={18} lh={30} items={[
        { at: 1.4, text: 'java -XX:+UseSerialGC … Ages   # trimmed', kind: 'cmd' },
        { at: 2, text: 'start:  0x0000007a81197d01  (age: 0)' },
        { at: 12.3, text: 'GC 1:   0x0000007a81197d09  (age: 1)', kind: 'ok' },
        { at: 17.8, text: 'GC 2:   0x0000007a81197d11  (age: 2)', kind: 'ok' },
        { at: 20.3, text: 'GC 3:   0x0000007a81197d19  (age: 3)', kind: 'ok' },
        { at: 22.8, text: 'GC 4:   0x0000007a81197d21  (age: 4)', kind: 'ok' },
        { at: 23.4, text: 'GC 5:   0x0000007a81197d29  (age: 5)', kind: 'ok' },
      ]} />
      <Txt x={1040} y={560} mono fs={17} color={PAL.ink3} a={E(t, 1.5)}>LOW BYTE OF THE MARK WORD</Txt>
      <BitRow x={1040} y={596} cw={96} h={70} fs={28} lfs={17} bits={bits} a={E(t, 1.5)} groups={[
        { from: 0, n: 1, tone: 'dim', label: 'gap' }, { from: 1, n: 4, tone: 'green', label: `age = ${age}`, glow: pulse(t, GCS.map((g) => g + 0.6), 0.9) },
        { from: 5, n: 1, tone: 'bad', label: 'b' }, { from: 6, n: 2, tone: 'flow', label: 'lock 01' },
      ]} />
      <Txt x={1040} y={720} mono fs={22} color={PAL.ink2} a={E(t, 1.5)}>= 0x<span style={{ color: PAL.green }}>{low.toString(16).padStart(2, '0')}</span></Txt>

      <Callout x={96} y={668} w={900} tone="green" a={E(t, 30)} fs={20} title="4 bits" text="The age counts 0 to 15 and can't go higher. Promotion by age has to happen by 15." />
      <Console x={96} y={790} w={1728} h={134} t={t} a={E(t, 35.5)} fs={18} lh={30} items={[
        { at: 35.8, text: 'java -XX:MaxTenuringThreshold=17 -version', kind: 'cmd' },
        { at: 36.4, text: 'uintx MaxTenuringThreshold=17 is outside the allowed range [ 0 ... 16 ]', kind: 'err' },
      ]} />
      <Badge x={1640} y={810} text="16 = never promote by age" tone="ink" a={E(t, 37)} fs={17} />
    </React.Fragment>
  );
}

// ── The class pointer: 4 bytes into metaspace ──────────────────────────────
export function SKlass({ t }) {
  const X = 96, U = 40;
  return (
    <React.Fragment>
      <Txt x={X} y={196} mono fs={17} color={PAL.ink3} a={E(t, 0.6)}>Point · JOL: “Compressed class pointers: 0-bit shift and 0x8800000000 base”</Txt>
      <Bytes x={X} y={232} unit={U} h={84} fs={18} sfs={17} ruler={false} a={E(t, 0.6)} cells={[
        { n: 8, label: 'mark word', tone: TONE.mark },
        { n: 4, label: '0x01015000', sub: 'class', tone: TONE.klass, glow: win(t, 5.5, 18) },
        { n: 4, label: 'x', tone: TONE.field }, { n: 4, label: 'y', tone: TONE.field }, { n: 4, label: 'pad', pad: true },
      ]} />
      <Panel x={X} y={370} w={960} h={210} title="decode the class word" tone="blue" a={E(t, 5.5)}>
        <Lines fs={26} lh={1.7} lines={[
          { s: 'narrow klass   0x01015000', a: E(t, 5.8) },
          { s: '+ class base   0x8800000000   (shift 0)', a: E(t, 12), c: PAL.ink2 },
          { s: '= Klass*       0x8801015000', a: E(t, 15), c: PAL.blue },
        ]} />
      </Panel>
      <Arrow pts={[[1060, 548], [1090, 548], [1090, 330], [1116, 330]]} draw={M(t, 18, 0.7)} color={PAL.blue} />

      <Panel x={1120} y={196} w={704} h={386} title="metaspace · the Klass of Point" tone="violet" a={Math.max(0.45 * E(t, 1), E(t, 18))} glow={win(t, 25, 31) * 0.7}>
        <div style={{ padding: '6px 0' }}>
          {[['name', 'Point'], ['super', 'java.lang.Object'], ['instance size', '24 bytes'], ['field layout', 'x @12 · y @16'], ['vtable', 'equals, hashCode, toString, …'], ['mirror', '→ the Point.class object']].map(([k, v], i) => (
            <div key={k} style={{ display: 'flex', padding: '10px 22px', borderTop: i ? `1px solid ${PAL.line}` : 'none', font: `400 20px ${MONO}`, opacity: E(t, 18.4 + i * 0.35) }}>
              <span style={{ width: 210, color: PAL.ink3 }}>{k}</span><span style={{ color: PAL.ink }}>{v}</span>
            </div>
          ))}
        </div>
      </Panel>

      {[['p.getClass()', 'reads the mirror'], ['x instanceof Point', 'compares Klass*'], ['p.toString()', 'vtable slot (8.1)']].map(([l, s], i) => (
        <React.Fragment key={l}>
          <Box x={96 + i * 340} y={650} w={316} h={96} label={l} sub={s} tone="pull" fs={20} sfs={17} a={E(t, 25 + i * 0.8)} glow={pulse(t, [25 + i * 0.8], 1)} />
        </React.Fragment>
      ))}
      <Arrow pts={[[1052, 698], [1240, 698], [1240, 588]]} draw={M(t, 27.4, 0.7)} color={PAL.pull} />
      <Txt x={1272} y={668} mono fs={17} color={PAL.pull} a={E(t, 28)}>all start from the class word</Txt>

      <Callout x={96} y={790} w={1728} tone="blue" a={E(t, 32)} fs={21} title="compressed class space" text="Every Klass lives in one reserved region, 1 GB by default (`CompressedClassSpaceSize`). A 32-bit offset reaches all of it, so the class word needs only 4 bytes. Turn compressed class pointers off and it takes 8, making the header 16." />
    </React.Fragment>
  );
}
