// 8.4 scenes, part 4: compact object headers, their timeline, Project Valhalla, traps, recap.
// Compact-header layouts are real JOL 0.17 output on Temurin JDK 25.0.4.1 with -XX:+UseCompactObjectHeaders.
import { TONE, BitRow, hexToBits, Blk, Ruler, Lines } from './common.jsx';
const { PAL, MOTION, lerp, win, pulse, step, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Badge, Callout, Table, Bytes, Brace, Mark, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

// ── Compact object headers ─────────────────────────────────────────────────
const C = (n, label, tone, pad) => ({ n, label, tone, pad });
const CMP = [ // [name, before cells, after cells, before size, after size, at]
  ['Point', [C(8, 'mark', TONE.mark), C(4, 'cls', TONE.klass), C(4, 'x', TONE.field), C(4, 'y', TONE.field), C(4, '', 'ink', true)], [C(8, 'mark', TONE.mark), C(4, 'x', TONE.field), C(4, 'y', TONE.field)], 24, 16, 19],
  ['Integer', [C(8, 'mark', TONE.mark), C(4, 'cls', TONE.klass), C(4, 'val', TONE.field)], [C(8, 'mark', TONE.mark), C(4, 'val', TONE.field), C(4, '', 'ink', true)], 16, 16, 26],
  ['Order', [C(8, 'mark', TONE.mark), C(4, 'cls', TONE.klass), C(4, 'qty', TONE.field), C(8, 'id', TONE.field), C(1, '', TONE.field), C(3, '', 'ink', true), C(4, 'cust', TONE.ref)],
    [C(8, 'mark', TONE.mark), C(8, 'id', TONE.field), C(4, 'qty', TONE.field), C(1, '', TONE.field), C(3, '', 'ink', true), C(4, 'cust', TONE.ref), C(4, '', 'ink', true)], 32, 32, 32.5],
  ['int[3]', [C(8, 'mark', TONE.mark), C(4, 'cls', TONE.klass), C(4, 'len', TONE.len), C(12, '7  8  9', TONE.field), C(4, '', 'ink', true)], [C(8, 'mark', TONE.mark), C(4, 'len', TONE.len), C(12, '7  8  9', TONE.field)], 32, 24, 39.5],
];
export function SCompact({ t }) {
  const X = 128, CW = 26, U = 22, BX = 360, AX = 1110;
  const groups = [
    { from: 0, n: 22, tone: 'blue', label: 'class pointer · 22 bits', glow: win(t, 6, 12.4) },
    { from: 22, n: 31, tone: 'pull', label: 'identity hash · 31 bits' },
    { from: 53, n: 4, tone: 'dim', label: 'Valhalla', glow: 0 },
    { from: 57, n: 4, tone: 'green', label: 'age' },
    { from: 61, n: 1, tone: 'pink', label: 'f', glow: win(t, 12.5, 18.6) },
    { from: 62, n: 2, tone: 'flow', label: 'lock' },
  ];
  return (
    <React.Fragment>
      <Txt x={960} y={196} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 0.6)}>COMPACT HEADER · ONE 64-BIT WORD · JDK 25 LAYOUT (markWord.hpp)</Txt>
      <BitRow x={X} y={226} cw={CW} h={48} bits={hexToBits('010c800000000001')} groups={groups} a={E(t, 0.6)} />
      <Txt x={960} y={350} anchor="mid" mono fs={24} color={PAL.ink2} a={E(t, 6)}>fresh Point, JDK 25: mark = <span style={{ color: PAL.blue }}>0x010c8</span>00000000001  · JOL calls it “Lilliput”</Txt>

      <HeaderMerge t={t} />
      <Txt x={BX} y={410} mono fs={17} color={PAL.ink3} a={E(t, 18.6)}>DEFAULT HEADER · 12 BYTES</Txt>
      <Txt x={AX} y={410} mono fs={17} color={PAL.ink3} a={E(t, 18.6)}>-XX:+UseCompactObjectHeaders · 8 BYTES</Txt>
      {CMP.map(([name, before, after, bs, as, at], i) => {
        const y = 446 + i * 92;
        const a = E(t, at);
        let ob = 0, oa = 0;
        return (
          <React.Fragment key={name}>
            <Txt x={96} y={y + 6} mono fs={21} weight={600} color={PAL.ink} a={a}>{name}</Txt>
            <Txt x={96} y={y + 36} mono fs={19} color={as < bs ? PAL.flow : PAL.ink2} a={E(t, at + 1)}>{bs} → {as} B</Txt>
            {before.map((c, j) => { const el = <Blk key={'b' + j} x0={BX} y={y} unit={U} off={ob} n={c.n} h={62} label={c.label} tone={c.tone} pad={c.pad} a={a} fs={17} />; ob += c.n; return el; })}
            {after.map((c, j) => { const el = <Blk key={'a' + j} x0={AX} y={y} unit={U} off={oa} n={c.n} h={62} label={c.label} tone={c.tone} pad={c.pad} a={E(t, at + 0.6)} fs={17} glow={as < bs ? pulse(t, [at + 1], 1.2) : 0} />; oa += c.n; return el; })}
          </React.Fragment>
        );
      })}
      <Callout x={96} y={826} w={1728} tone="flow" a={E(t, 46)} fs={21} title="across a whole heap" text="Savings come in 8-byte steps, so small objects gain most. JEP 519 reports SPECjbb2015 using **22% less heap** and 8% less CPU time." />
    </React.Fragment>
  );
}

// 12-byte header → 8: the class word slides into the top of the mark word (fades before the grid arrives).
function HeaderMerge({ t }) {
  const a = E(t, 0.8) * (1 - E(t, 18, 0.5));
  if (a <= 0.01) return null;
  const X0 = 560, U = 50, Y = 470;
  const p = M(t, 3.5, 1.6);
  const cw = lerp(4 * U, (22 / 64) * 8 * U, p);
  return (
    <div style={{ opacity: a }}>
      <Txt x={960} y={420} anchor="mid" mono fs={20} color={PAL.ink2}>{p < 0.5 ? 'default: mark word + class pointer = 12 bytes' : 'compact: one 8-byte word'}</Txt>
      <Blk x0={X0} y={Y} unit={U} off={0} n={8} h={86} label={p < 0.5 ? 'mark word' : ''} sub={p < 0.5 ? '8 bytes' : ''} tone={TONE.mark} fs={22} />
      {p >= 0.5 && <Txt x={X0 + (cw + 8 * U) / 2} y={Y + 28} anchor="mid" mono fs={20} color={PAL.ink}>hash · age · lock</Txt>}
      <div style={{ position: 'absolute', left: lerp(X0 + 8 * U, X0, p), top: Y, width: cw, height: 86, boxSizing: 'border-box', borderRadius: 6, background: hexA(PAL.blue, 0.22), border: `2px solid ${PAL.blue}`, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 20px ${MONO}`, color: PAL.ink, whiteSpace: 'nowrap', overflow: 'hidden' }}>{p < 0.5 ? 'class · 4 B' : 'class · 22 bits'}</div>
      <Txt x={X0 + lerp(12, 8, p) * U + 20} y={Y + 28} mono fs={26} weight={600} color={p < 0.5 ? PAL.ink2 : PAL.flow}>{p < 0.5 ? '12 B' : '8 B'}</Txt>
      <Ruler x0={X0} y={Y + 96} unit={U} marks={p < 0.5 ? [0, 8, 12] : [0, 8]} />
    </div>
  );
}

// ── When you get it ────────────────────────────────────────────────────────
const REL = [
  ['JDK 24', 'Mar 2025', 'Experimental', 'JEP 450', 'needs UnlockExperimentalVMOptions', 'ink', 4],
  ['JDK 25 · LTS', 'Sep 2025', 'Product feature', 'JEP 519', 'one flag, off by default', 'flow', 10.5],
  ['JDK 26', 'Mar 2026', 'Product feature', '', 'still off by default', 'flow', 14],
  ['JDK 27', 'Sep 2026', 'On by default', 'JEP 534', 'opt out with a minus', 'pull', 17],
];
export function SCompactTimeline({ t }) {
  const [hl, hA] = window.AN.hlAt(t, [[4, 1], [10.5, 3], [17, 5], [24, 5]]);
  return (
    <React.Fragment>
      <div style={{ position: 'absolute', left: 150, top: 452, width: 1620, height: 4, background: PAL.line2, opacity: E(t, 1) }}></div>
      {REL.map(([v, d, what, jep, sub, tone, at], i) => {
        const x = 96 + i * 440;
        return (
          <React.Fragment key={v}>
            <Card x={x} y={196} w={408} h={190} a={E(t, at)} tone={tone} num={jep ? `${v} · ${jep}` : v} title={what} sub={sub} tfs={28} sfs={20} glow={win(t, at, at + 6) * 0.8} />
            <div style={{ position: 'absolute', left: x + 204 - 12, top: 442, width: 24, height: 24, borderRadius: 12, background: E(t, at) > 0.5 ? toneColor(tone) : PAL.panel2, border: `2px solid ${PAL.line2}`, opacity: E(t, 1) }}></div>
            <Txt x={x + 204} y={482} anchor="mid" mono fs={18} color={PAL.ink3} a={E(t, 1)}>{d}</Txt>
            <Txt x={x + 204} y={404} anchor="mid" mono fs={20} weight={600} color={PAL.ink} a={E(t, 1) * (1 - E(t, at - 0.3))}>{v.split(' ·')[0]}</Txt>
          </React.Fragment>
        );
      })}
      <Code x={96} y={540} w={1728} h={290} lang="shell" title="turning it on (or off)" a={E(t, 4)} fs={22} lh={36} hl={hl} hlA={hA} lines={[
        '# JDK 24 (experimental)',
        '$ java -XX:+UnlockExperimentalVMOptions -XX:+UseCompactObjectHeaders -jar app.jar',
        '# JDK 25 and 26 (product, off by default)',
        '$ java -XX:+UseCompactObjectHeaders -jar app.jar',
        '# JDK 27+: on by default. To go back to 12-byte headers:',
        '$ java -XX:-UseCompactObjectHeaders -jar app.jar',
      ]} />
      <Callout x={96} y={850} w={1728} tone="pull" a={E(t, 30)} fs={20} text="On 25 or 26? Run JOL twice, with and without the flag, and compare `Instance size`. The old layout is still there in 27; JEP 534 plans to deprecate it later." />
    </React.Fragment>
  );
}

// ── Project Valhalla ───────────────────────────────────────────────────────
export function SValhalla({ t }) {
  const U = 25, AY = 400;
  const refX = (i) => 96 + (16 + i * 4 + 2) * U;
  const boxes = [96, 366, 636];
  return (
    <React.Fragment>
      <Code x={96} y={196} w={820} h={140} title="today" a={E(t, 0.5)} fs={21} lh={36} lines={['record Point(int x, int y) {}', 'Point[] ps = new Point[3];']} />
      <Code x={1004} y={196} w={820} h={140} title="Valhalla · JEP 401 (preview)" tone="violet" a={E(t, 11)} fs={21} lh={36} lines={['value record Point(int x, int y) {}', 'Point[] ps = new Point[3];']} />

      <Txt x={96} y={AY - 34} mono fs={17} color={PAL.ink3} a={E(t, 2)}>TODAY · Point[3] · 32 B ARRAY + 3 × 24 B OBJECTS</Txt>
      <Bytes x={96} y={AY} unit={U} h={64} fs={17} sfs={17} ruler={false} a={E(t, 2)} cells={[
        { n: 8, label: 'mark', tone: TONE.mark }, { n: 4, label: 'cls', tone: TONE.klass }, { n: 4, label: 'len', tone: TONE.len },
        { n: 4, label: '→', tone: TONE.ref }, { n: 4, label: '→', tone: TONE.ref }, { n: 4, label: '→', tone: TONE.ref }, { n: 4, pad: true },
      ]} />
      {boxes.map((bx, i) => (
        <React.Fragment key={i}>
          <Box x={bx} y={560} w={250} h={84} label="Point · 24 B" sub="header + x + y" tone="pull" fs={19} sfs={17} a={E(t, 3 + i * 0.4)} />
          <Arrow from={[refX(i), AY + 66]} to={[bx + 125, 556]} draw={M(t, 3.2 + i * 0.4, 0.6)} color={PAL.pull} />
        </React.Fragment>
      ))}

      <Card x={1004} y={366} w={820} h={190} a={E(t, 11.5)} tone="violet" num="no identity" title="`==` compares the fields" sub="`new Point(17, 3) == new Point(17, 3)` is true. No identity hash, no `synchronized` on it." tfs={26} sfs={20} />

      <Panel x={1004} y={584} w={820} h={220} title="JEP 401's example: a flattened Integer[5]" tone="violet" a={win(t, 24, 30.8)}>
        <div style={{ display: 'flex', gap: 12, padding: '22px 22px 10px' }}>
          {['1|1996', '1|2006', '1|1996', '0|0', '0|0'].map((v, i) => <div key={i} style={{ flex: 1, height: 64, borderRadius: 8, border: `2px solid ${PAL.violet}`, background: hexA(PAL.violet, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 20px ${MONO}`, color: PAL.ink }}>{v}</div>)}
        </div>
        <div style={{ padding: '6px 22px', font: `400 19px ${SANS}`, color: PAL.ink2 }}>null flag + the int, one 64-bit word each. No pointers, no objects.</div>
      </Panel>
      <Panel x={1004} y={584} w={820} h={220} title="value record Point(int x, int y), flattened?" tone="bad" a={E(t, 31)}>
        <div style={{ position: 'relative', height: 120 }}>
          <Blk x0={24} y={26} unit={11.4} off={0} n={1.6} h={56} label="" tone="bad" />
          <Blk x0={24} y={26} unit={11.4} off={1.6} n={32} h={56} label="x · 32 bits" tone={TONE.field} />
          <Blk x0={24} y={26} unit={11.4} off={33.6} n={32} h={56} label="y · 32 bits" tone={TONE.field} />
          <div style={{ position: 'absolute', left: 24 + 64 * 11.4, top: 10, width: 3, height: 90, background: PAL.bad }}></div>
          <div style={{ position: 'absolute', left: 24 + 64 * 11.4 - 70, top: 98, font: `600 17px ${MONO}`, color: PAL.bad }}>64-bit limit</div>
        </div>
        <div style={{ padding: '0 22px', font: `400 19px ${SANS}`, color: PAL.ink2 }}>null flag + 64 bits of data = 65 bits: too big to read atomically.</div>
      </Panel>

      <Callout x={96} y={680} w={820} tone="violet" a={win(t, 17.5, 38.3)} fs={20} title="flattening" text="Without identity, the JVM may store a value's fields directly inside the array or the field that holds it. JEP 401 lets it; it doesn't promise it." />
      <Callout x={96} y={680} w={820} tone="pull" a={E(t, 38.5)} fs={20} title="status · October 2026" text="JEP 401, value objects, is a **preview** integrated for JDK 28 (due March 2027). No released JDK has it. `List<int>` is further out still." />
      <Badge x={1414} y={860} text="today: int[] and IntStream" tone="pull" a={E(t, 45.5)} fs={22} solid />
    </React.Fragment>
  );
}

// ── Traps ──────────────────────────────────────────────────────────────────
const TRAPS = [
  [1.5, '“Fields sit in memory in source order”', 'HotSpot reorders: big primitives first, holes filled, references grouped.'],
  [9, '“A bigger -Xmx always means more room”', 'At 32g compressed oops switch off. 31g can hold more than 32g.'],
  [15.5, '“Integer is a bit bigger than int”', '16-byte object + 4-byte reference: 5× per element, plus a pointer chase.'],
  [22, '“Integer[] is contiguous, like int[]”', "It's contiguous references to objects that can be anywhere."],
  [28, '“Object size = sum of the fields”', 'Add the 12-byte header (8 compact) and padding to 8. Measure with JOL.'],
];
export function STraps({ t }) {
  return TRAPS.map(([at, myth, real], i) => {
    const y = 196 + i * 146;
    return (
      <React.Fragment key={i}>
        <Box x={96} y={y} w={760} h={124} label={myth} mono={false} fs={23} tone="bad" a={E(t, at)} strike={t > at + 2} style={{ whiteSpace: 'normal' }} />
        <HArrow x1={870} x2={940} y={y + 62} a={E(t, at + 1.5)} color={PAL.flow} />
        <Card x={956} y={y} w={868} h={124} a={E(t, at + 1.6)} tone="flow" title={real} tfs={23} />
      </React.Fragment>
    );
  });
}

// ── Recap ──────────────────────────────────────────────────────────────────
const RECAP = [
  [3, '1', 'Header', '8-byte mark word (hash, age, lock) + 4-byte class pointer = 12 bytes.'],
  [8.5, '2', 'Layout', 'Fields reordered, holes filled; every object a multiple of 8.'],
  [14, '3', 'Compressed oops', '32-bit value × 8 + base. 4-byte references up to `-Xmx31g`.'],
  [19.5, '4', 'Boxing', '`Integer` = 16 B + a 4 B reference. `int` = 4 B.'],
  [25, '5', 'Locality', '`Integer[]` is a pointer chase; `int[]` streams through cache lines.'],
  [30, '6', 'Compact headers', '8-byte headers, default in JDK 27. Check it all with **JOL**.'],
];
export function SRecap({ t }) {
  return RECAP.map(([at, n, title, sub], i) => <Card key={n} x={96 + (i % 3) * 584} y={210 + Math.floor(i / 3) * 290} w={560} h={260} num={n} title={title} sub={sub} tfs={36} sfs={25} a={E(t, at)} tone={i === 5 ? 'pull' : undefined} glow={i === 5 ? win(t, 30, 40) : 0} />);
}
