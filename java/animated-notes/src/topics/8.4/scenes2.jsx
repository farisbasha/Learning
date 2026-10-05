// 8.4 scenes, part 2: field layout and alignment, JOL, compressed oops and the 32 GB cliff.
// Layouts, flags, addresses and sizes are real JDK 17 output (JOL 0.17, PrintFlagsFinal, -Xlog).
import { ORDER_SRC, TONE, BitRow, Blk, Ruler, Tok, Lines } from './common.jsx';
const { PAL, MOTION, lerp, win, pulse, step, track, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Bytes, Brace, Stat, Mark, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

// ── If fields stayed in declaration order ──────────────────────────────────
export function SDeclOrder({ t }) {
  const X = 160, U = 40, Y = 610;
  const [hl, hA] = window.AN.hlAt(t, [[12.5, 1], [18.5, 2], [25.5, 3], [32, 4], [38, -1]]);
  const next = step(t, [[12.5, 12], [13.5, 13], [20, 20], [27, 32], [32.5, 36], [38.5, 40]], 0);
  const waste = step(t, [[18.5, 3], [25.5, 7], [38.5, 11]], 0);
  return (
    <React.Fragment>
      <Code x={96} y={196} w={700} h={310} title="Order.java" a={E(t, 0.5)} fs={21} lh={40} hl={hl} hlA={hA} lines={ORDER_SRC} />
      <Card x={840} y={196} w={984} h={150} a={E(t, 6)} tone="pull" num="natural alignment" title="A field of size n starts at an offset divisible by n." sub="ints at 4, 8, 12, 16…   longs at 8, 16, 24…" tfs={28} sfs={21} />
      <Stat x={840} y={392} w={560} label="next free offset" value={String(next)} a={E(t, 6.5)} />
      <Stat x={840} y={440} w={560} label="bytes wasted on padding" value={String(waste)} color={waste ? PAL.bad : PAL.ink} a={E(t, 6.5)} />
      <Badge x={1630} y={420} text="IF the JVM kept source order" tone="ink" a={E(t, 6.5)} fs={17} />

      <Txt x={X} y={Y - 40} mono fs={17} color={PAL.ink3} a={E(t, 1.5)}>DECLARATION ORDER · BYTE OFFSETS</Txt>
      <div style={{ position: 'absolute', left: X, top: Y, width: 40 * U, height: 70, boxSizing: 'border-box', borderRadius: 6, border: `2px dashed ${PAL.line2}`, opacity: E(t, 1.5) * (1 - E(t, 38.5)) }}></div>
      <Txt x={X + 20 * U} y={Y + 22} anchor="mid" mono fs={20} color={PAL.ink3} a={E(t, 1.5) * (1 - E(t, 12.3))}>where should each field go?</Txt>
      <Blk x0={X} y={Y} unit={U} off={0} n={8} label="mark" tone={TONE.mark} a={E(t, 12.5)} />
      <Blk x0={X} y={Y} unit={U} off={8} n={4} label="class" tone={TONE.klass} a={E(t, 12.8)} />
      <Blk x0={X} y={Y} unit={U} off={12} n={1} label="p" tone={TONE.field} a={E(t, 13.5)} glow={pulse(t, [13.5], 1)} fs={17} />
      <Blk x0={X} y={Y} unit={U} off={13} n={3} label="3" tone="bad" pad a={E(t, 18.5)} glow={pulse(t, [18.5], 1.2)} />
      <Blk x0={X} y={Y} unit={U} off={16} n={4} label="qty" tone={TONE.field} a={E(t, 20)} />
      <Blk x0={X} y={Y} unit={U} off={20} n={4} label="4" tone="bad" pad a={E(t, 25.5)} glow={pulse(t, [25.5], 1.2)} />
      <Blk x0={X} y={Y} unit={U} off={24} n={8} label="id" tone={TONE.field} a={E(t, 27)} />
      <Blk x0={X} y={Y} unit={U} off={32} n={4} label="cust" tone={TONE.ref} a={E(t, 32.5)} />
      <Blk x0={X} y={Y} unit={U} off={36} n={4} label="4" tone="bad" pad a={E(t, 38.5)} glow={pulse(t, [38.5], 1.2)} />
      <Ruler x0={X} y={Y + 78} unit={U} marks={[0, 8, 12]} a={E(t, 12.5)} />
      <Ruler x0={X} y={Y + 78} unit={U} marks={[13, 16]} a={E(t, 18.5)} />
      <Ruler x0={X} y={Y + 78} unit={U} marks={[20, 24]} a={E(t, 25.5)} />
      <Ruler x0={X} y={Y + 78} unit={U} marks={[32, 36]} a={E(t, 32)} />
      <Ruler x0={X} y={Y + 78} unit={U} marks={[40]} a={E(t, 38.5)} />
      {/* hops over padding */}
      <Arrow from={[X + 13 * U, Y - 8]} to={[X + 16 * U + 4, Y - 8]} curve={-34} draw={M(t, 18.8, 0.7)} color={PAL.bad} />
      <Txt x={X + 14.5 * U} y={Y - 92} anchor="mid" mono fs={17} color={PAL.bad} a={E(t, 19.4) * (1 - E(t, 25.3, 0.3))}>13 % 4 ≠ 0 → 16</Txt>
      <Arrow from={[X + 20 * U, Y - 8]} to={[X + 24 * U + 4, Y - 8]} curve={-34} draw={M(t, 25.8, 0.7)} color={PAL.bad} />
      <Txt x={X + 22 * U} y={Y - 92} anchor="mid" mono fs={17} color={PAL.bad} a={E(t, 26.4)}>20 % 8 ≠ 0 → 24</Txt>
      <Brace x={X + 36 * U} y={Y + 108} w={4 * U} label="to a multiple of 8" tone="bad" a={E(t, 39)} fs={17} />

      <Badge x={960} y={790} text="40 bytes · 11 of them padding" tone="bad" a={POP(t, 39.5)} fs={22} solid />
      <Callout x={96} y={840} w={1728} tone="flow" a={E(t, 45)} fs={21} text="HotSpot never uses this order. It computes a better layout when the class is loaded." />
    </React.Fragment>
  );
}

// ── The JVM reorders ───────────────────────────────────────────────────────
const MOVES = [ // [label, n, srcOff, dstOff, tone, at]
  ['id', 8, 24, 16, TONE.field, 5],
  ['qty', 4, 16, 12, TONE.field, 11.5],
  ['p', 1, 12, 24, TONE.field, 17.5],
  ['cust', 4, 32, 28, TONE.ref, 19.5],
];
export function SReorder({ t }) {
  const X = 96, U = 36, Y1 = 236, Y2 = 404;
  const dim = 1 - 0.6 * E(t, 4.5, 0.8);
  const RULES = [
    [5, '1', 'Longs and doubles first, then ints, shorts, bytes.'],
    [11.5, '2', 'Smaller fields drop into holes: `qty` fills 12–16.'],
    [17.5, '3', 'References grouped into one block, after the primitives.'],
    [38.5, '4', 'So the GC scans one run of pointers per object.'],
    [45.5, '5', 'Parent fields keep their offsets; since JDK 15 a subclass may fill their holes.'],
  ];
  return (
    <React.Fragment>
      <Txt x={X} y={200} mono fs={17} color={PAL.ink3} a={E(t, 0.5)}>SOURCE ORDER</Txt>
      <div style={{ opacity: dim }}>
        <Bytes x={X} y={Y1} unit={U} h={66} fs={17} sfs={17} ruler={false} a={E(t, 0.5)} cells={[
          { n: 8, label: 'mark', tone: TONE.mark }, { n: 4, label: 'class', tone: TONE.klass }, { n: 1, label: 'p', tone: TONE.field }, { n: 3, pad: true, tone: 'bad' },
          { n: 4, label: 'qty', tone: TONE.field }, { n: 4, pad: true, tone: 'bad' }, { n: 8, label: 'id', tone: TONE.field }, { n: 4, label: 'cust', tone: TONE.ref }, { n: 4, pad: true, tone: 'bad' },
        ]} />
      </div>
      <Badge x={1690} y={Y1 + 33} text="40 bytes" tone="bad" a={E(t, 0.8)} fs={18} />

      <Txt x={X} y={Y2 - 36} mono fs={17} color={PAL.ink3} a={E(t, 1)}>HOTSPOT ORDER · JDK 17 · AS JOL REPORTS IT</Txt>
      <Blk x0={X} y={Y2} unit={U} off={0} n={8} h={66} label="mark" tone={TONE.mark} a={E(t, 4.8)} fs={17} />
      <Blk x0={X} y={Y2} unit={U} off={8} n={4} h={66} label="class" tone={TONE.klass} a={E(t, 4.8)} fs={17} />
      {MOVES.map(([l, n, s, d, tone, at]) => {
        const p = M(t, at, 1.3);
        if (t < at) return null;
        return <Blk key={l} x0={X} y={lerp(Y1, Y2, p)} unit={U} off={lerp(s, d, p)} n={n} h={66} label={l} tone={tone} fs={17} glow={pulse(t, [at + 1.3], 1)} />;
      })}
      <Blk x0={X} y={Y2} unit={U} off={25} n={3} h={66} pad tone="bad" a={E(t, 21.2)} />
      <Ruler x0={X} y={Y2 + 74} unit={U} marks={[0, 8, 12, 16, 24, 25, 28, 32]} a={E(t, 21.5)} />
      <Badge x={1690} y={Y2 + 33} text="32 bytes" tone="flow" a={POP(t, 24.5)} fs={18} solid />
      <Txt x={1690} y={Y2 + 72} anchor="mid" mono fs={17} color={PAL.flow} a={E(t, 25)}>3 wasted, not 11</Txt>

      <Console x={96} y={530} w={1000} h={394} t={t} a={E(t, 1)} fs={18} lh={30} items={[
        { at: 1.4, text: 'java -jar jol-cli.jar internals -cp . Order', kind: 'cmd' },
        { at: 2, text: 'OFF  SZ               TYPE DESCRIPTION', kind: 'dim' },
        { at: 5, text: '  0   8                    (object header: mark)' },
        { at: 5.2, text: '  8   4                    (object header: class)' },
        { at: 12.9, text: ' 12   4                int Order.qty', kind: 'ok' },
        { at: 13.1, text: ' 16   8               long Order.id', kind: 'ok' },
        { at: 18.9, text: ' 24   1            boolean Order.paid', kind: 'ok' },
        { at: 21.2, text: ' 25   3                    (alignment/padding gap)' },
        { at: 21.4, text: ' 28   4   java.lang.Object Order.customer', kind: 'ok' },
        { at: 24.6, text: 'Instance size: 32 bytes', kind: 'ok' },
      ]} />
      <Panel x={1140} y={530} w={684} h={394} title="how HotSpot places fields" tone="flow" a={E(t, 1.2)}>
        <div style={{ padding: '10px 22px' }}>
          {RULES.map(([at, n, s]) => (
            <div key={n} style={{ display: 'flex', gap: 14, margin: '10px 0', opacity: E(t, at), font: `400 20px ${SANS}`, color: PAL.ink, lineHeight: 1.35 }}>
              <span style={{ font: `600 20px ${MONO}`, color: PAL.pull }}>{n}</span><span>{window.AN.fmt(s)}</span>
            </div>
          ))}
        </div>
      </Panel>
    </React.Fragment>
  );
}

// ── Why multiples of 8 ─────────────────────────────────────────────────────
export function SAlignment({ t }) {
  const X = 144, U = 17, Y = 250;
  const objs = [
    [0, [[12, 'hdr', TONE.mark], [8, 'x y', TONE.field], [4, '', 'ink', true]], 'Point · 24 B'],
    [24, [[12, 'hdr', TONE.mark], [4, 'qty', TONE.field], [8, 'id', TONE.field], [1, '', TONE.field], [3, '', 'bad', true], [4, 'c', TONE.ref]], 'Order · 32 B'],
    [56, [[12, 'hdr', TONE.mark], [8, 'x y', TONE.field], [4, '', 'ink', true]], 'Point · 24 B'],
  ];
  const bin = (h) => { const v = parseInt(h.slice(-2), 16).toString(2).padStart(8, '0'); return [v.slice(0, 4) + ' ' + v.slice(4, 5), v.slice(5)]; };
  const addrs = ['0x7ff4235b8', '0x7ff4235c8', '0x7ff4235d8', '0x70080269e8'];
  return (
    <React.Fragment>
      <Txt x={X + 96 * U} y={392} anchor="right" mono fs={17} color={PAL.ink3} a={E(t, 4.5)}>A STRETCH OF HEAP · TICKS EVERY 8 BYTES</Txt>
      {Array.from({ length: 13 }).map((_, k) => (
        <React.Fragment key={k}>
          <div style={{ position: 'absolute', left: X + k * 8 * U - 1, top: Y - 14, width: 2, height: 108, background: hexA(PAL.ink2, 0.35), opacity: E(t, 4.5 + k * 0.05) }}></div>
          <Txt x={X + k * 8 * U} y={Y + 100} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 4.5 + k * 0.05)}>{'+' + k * 8}</Txt>
        </React.Fragment>
      ))}
      {objs.map(([o, cells, name], i) => {
        let off = o;
        const a = E(t, 1 + i * 0.6);
        return (
          <React.Fragment key={i}>
            {cells.map(([n, l, tone, pad], j) => { const el = <Blk key={j} x0={X} y={Y} unit={U} off={off} n={n} h={80} label={l} tone={tone} pad={pad} a={a} fs={17} glow={(i === 0 && pad ? win(t, 11, 17.4) : 0) + (i === 1 && pad ? win(t, 17.5, 23.4) : 0)} />; off += n; return el; })}
            <Txt x={X + (o + (i === 1 ? 16 : 12)) * U} y={Y - 44} anchor="mid" mono fs={17} color={PAL.ink} a={a}>{name}</Txt>
          </React.Fragment>
        );
      })}
      <Blk x0={X} y={Y} unit={U} off={80} n={16} h={80} label="free" dashed tone="ink" a={E(t, 2.8)} fs={17} />
      <Brace x={X + 20 * U} y={Y + 128} w={4 * U} label="external loss: 4 B" tone="pull" a={E(t, 11.4)} fs={17} />
      <Brace x={X + 49 * U} y={Y + 128} w={3 * U} label="internal loss: 3 B" tone="bad" a={E(t, 17.8)} fs={17} />

      <Panel x={96} y={460} w={840} h={330} title="JOL · space losses (real output)" a={win(t, 11, 23.3)} tone="pull">
        <Lines fs={19} lh={1.7} pad="16px 22px" lines={[
          { s: 'Point:', c: PAL.ink }, { s: '  0 bytes internal + 4 bytes external', a: E(t, 11.4), c: PAL.pull },
          { s: 'Order:', c: PAL.ink, a: E(t, 17.5) }, { s: '  3 bytes internal + 0 bytes external', a: E(t, 17.9), c: PAL.bad },
        ]} />
      </Panel>
      <Panel x={96} y={460} w={840} h={330} title="one load or two" a={E(t, 23.5)} tone="flow">
        <div></div>
      </Panel>
      {[0, 1].map((r) => (
        <React.Fragment key={r}>
          <Blk x0={136} y={540 + r * 120} unit={40} off={0} n={8} h={56} label="word A" tone="ink" dashed a={E(t, 23.8)} fs={17} />
          <Blk x0={136} y={540 + r * 120} unit={40} off={8} n={8} h={56} label="word B" tone="ink" dashed a={E(t, 23.8)} fs={17} />
        </React.Fragment>
      ))}
      <Blk x0={136} y={604} unit={40} off={0} n={8} h={32} label="long @0" tone="flow" a={E(t, 24.4)} fs={17} />
      <Blk x0={136} y={724} unit={40} off={4} n={8} h={32} label="long @4" tone="bad" a={E(t, 25.4)} fs={17} />
      <Txt x={856} y={584} anchor="mid" mono fs={18} color={PAL.flow} a={E(t, 24.6)}>1 load</Txt>
      <Txt x={856} y={704} anchor="mid" mono fs={18} color={PAL.bad} a={E(t, 25.6)}>2 loads</Txt>
      <Txt x={856} y={730} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 25.6)}>+ stitching</Txt>

      <Panel x={980} y={460} w={844} h={330} title="real object addresses · JDK 17" right="JOL addressOf" a={E(t, 4.5)} tone="pull" glow={win(t, 30, 36) * 0.7}>
        <div style={{ padding: '14px 24px' }}>
          {addrs.map((h, i) => { const [hi, lo] = bin(h); return (
            <div key={h} style={{ display: 'flex', justifyContent: 'space-between', font: `500 22px ${MONO}`, color: PAL.ink, height: 56, alignItems: 'center', opacity: E(t, 5 + i * 0.4) }}>
              <span>{h}</span><span style={{ color: PAL.ink3, opacity: E(t, 30.4 + i * 0.4) }}>…{hi}<span style={{ color: PAL.pull, fontWeight: 700 }}>{lo}</span></span>
            </div>
          ); })}
        </div>
      </Panel>
      <Callout x={96} y={820} w={1728} tone="pull" a={E(t, 36)} fs={21} text="The low **three bits of every object address are 000**. Bits that are always zero don't need to be stored. That's the whole idea behind compressed oops." />
    </React.Fragment>
  );
}

// ── Measure it with JOL ────────────────────────────────────────────────────
export function SJol({ t }) {
  return (
    <React.Fragment>
      <Console x={96} y={196} w={1000} h={290} t={t} a={E(t, 0.5)} fs={17} lh={30} items={[
        { at: 1.4, text: 'java -jar jol-cli.jar internals java.lang.Integer', kind: 'cmd' },
        { at: 5.8, text: 'OFF  SZ   TYPE DESCRIPTION               VALUE', kind: 'dim' },
        { at: 6.5, text: '  0   8        (object header: mark)     0x0000000000000001 (non-biasable; age: 0)' },
        { at: 6.8, text: '  8   4        (object header: class)    0x00040f28' },
        { at: 7.1, text: ' 12   4    int Integer.value             0', kind: 'ok' },
        { at: 7.4, text: 'Instance size: 16 bytes', kind: 'ok' },
        { at: 7.7, text: 'Space losses: 0 bytes internal + 0 bytes external = 0 bytes total', kind: 'dim' },
      ]} />
      <Bytes x={96} y={524} unit={50} h={72} fs={19} sfs={17} ruler={false} a={E(t, 6.5)} cells={[
        { n: 8, label: 'mark word', tone: TONE.mark }, { n: 4, label: 'class', tone: TONE.klass }, { n: 4, label: 'value', sub: 'int', tone: TONE.field, glow: win(t, 11.5, 17) },
      ]} />
      <Txt x={930} y={548} mono fs={22} color={PAL.flow} a={E(t, 7)}>16 B</Txt>
      <Code x={1140} y={196} w={684} h={380} title="Measure.java · jol-core" a={E(t, 3)} fs={19} lh={34} hl={t < 23.5 ? 3 : 7} hlA={win(t, 17.8, 30)} lines={[
        'import org.openjdk.jol.info.*;', '', "// shallow: one object's layout", 'ClassLayout.parseClass(Order.class)', '           .toPrintable();', '', '// deep: everything reachable', 'GraphLayout.parseInstance(map)', '           .totalSize();',
      ]} />
      <Code x={96} y={650} w={1728} h={270} lang="plain" title="GraphLayout.parseInstance(map).toFootprint()" right="HashMap<Integer,Integer> · 1M entries · JDK 17" a={E(t, 23.8)} fs={19} lh={32} hl={5} hlA={E(t, 30.5)} lines={[
        { s: '     COUNT       AVG       SUM   DESCRIPTION', o: 0.6 },
        '         1   8388624   8388624   [Ljava.util.HashMap$Node;',
        '   2000000        16  32000000   java.lang.Integer',
        '         1        48        48   java.util.HashMap',
        '   1000000        32  32000000   java.util.HashMap$Node',
        '   3000002            72388672   (total)',
      ]} />
      <Badge x={1482} y={612} text={'"I think this is big" → a number'} tone="pull" a={E(t, 37)} fs={18} />
    </React.Fragment>
  );
}

// ── Compressed oops: decode a real reference ───────────────────────────────
const NARROW = '00000001000000000100110100111101'; // 0x01004d3d
export function SCoopsDecode({ t }) {
  const CW = 30, BY = 548;
  const sh = M(t, 13.5, 1.4);
  const x0 = lerp(760, 670, sh);
  const zeros = E(t, 15, 0.5);
  return (
    <React.Fragment>
      <Code x={96} y={196} w={620} h={176} title="Decode.java" a={E(t, 0.5)} fs={21} lh={36} lines={['class Line {', '    Point start = new Point();', '}']} />
      <Console x={760} y={196} w={1064} h={176} t={t} a={E(t, 1)} fs={17} lh={28} items={[
        { at: 1.4, text: 'java -Xmx16g -Xlog:gc+heap+coops=debug -cp jol-cli.jar:. Decode', kind: 'cmd' },
        { at: 2, text: 'Heap address: 0x0000007000800000, size: 16384 MB,', kind: 'dim' },
        { at: 2.3, text: 'Compressed Oops mode: Non-zero disjoint base: 0x0000007000000000, Oop shift amount: 3', kind: 'ok' },
      ]} />
      <Txt x={96} y={398} mono fs={17} color={PAL.ink3} a={E(t, 3)}>LINE OBJECT</Txt>
      <Bytes x={96} y={426} unit={40} h={70} fs={17} sfs={17} ruler={false} a={E(t, 3)} cells={[
        { n: 8, label: 'mark', tone: TONE.mark }, { n: 4, label: 'class', tone: TONE.klass }, { n: 4, label: '0x01004d3d', sub: 'start', tone: TONE.ref, glow: win(t, 7, 13) },
      ]} />
      <Arrow pts={[[656, 462], [720, 462], [720, BY + 24], [x0 - 8, BY + 24]]} draw={M(t, 8, 0.7)} color={PAL.pull} a={1 - E(t, 13.2, 0.3)} />

      <Txt x={96} y={BY + 8} mono fs={22} color={PAL.ink2} a={E(t, 8.6)}>{t < 15.4 ? 'stored value' : 'value << 3  (× 8)'}</Txt>
      <BitRow x={x0} y={BY} cw={CW} h={48} fs={18} bits={NARROW} labels={false} a={E(t, 8.6)} groups={[{ from: 0, n: 32, tone: 'pull' }]} />
      <BitRow x={670 + 32 * CW} y={BY} cw={CW} h={48} fs={18} bits="000" labels={false} a={zeros} groups={[{ from: 0, n: 3, tone: 'green', glow: win(t, 15, 26) }]} />
      <Txt x={1678} y={BY + 60} anchor="mid" mono fs={17} color={PAL.green} a={E(t, 19.5)}>always 000</Txt>

      <Panel x={96} y={636} w={1728} h={168} a={E(t, 8.6)} tone="pull">
        <Lines fs={28} lh={1.45} pad="14px 30px" lines={[
          { s: '  narrow oop      0x01004d3d', a: 1 },
          { s: '  << 3          = 0x00080269e8', a: E(t, 16) },
          { s: '+ heap base       0x7000000000', a: E(t, 27), c: PAL.violet },
        ]} />
      </Panel>
      <Panel x={1100} y={652} w={700} h={136} a={E(t, 33.5)} tone="flow" glow={pulse(t, [33.6], 1.4)}>
        <div style={{ padding: '18px 26px', font: `600 34px ${MONO}`, color: PAL.flow }}>= 0x70080269e8</div>
        <div style={{ padding: '0 26px', font: `400 18px ${MONO}`, color: PAL.ink2 }}>JOL addressOf(line.start) = 0x70080269e8</div>
      </Panel>
      <Mark x={1750} y={720} ok a={POP(t, 34.4)} />

      <Callout x={96} y={826} w={1728} tone="flow" a={win(t, 40.5, 46.8)} fs={21} title="cost" text="The JIT emits this decode on every reference load: one shift and one add. Cheap enough to be on by default." />
      <Callout x={96} y={826} w={1728} tone="violet" a={E(t, 47)} fs={21} title="zero-based mode · smaller heap" text="At `-Xmx2g` the base was 0, so the shift alone is the address: `0x610e4d3c << 3` = `0x3087269e0`, exactly where the Point was. HotSpot picks the simplest mode that fits the heap." />
    </React.Fragment>
  );
}

// ── Why 32 GB ──────────────────────────────────────────────────────────────
export function SCoops32({ t }) {
  const X = 160, W = 1600, Y = 370;
  const gx = (g) => X + (g / 32) * W;
  const marks = [[4, 16.5], [16, 17.5], [31, 22.5]];
  return (
    <React.Fragment>
      <Txt x={960} y={206} anchor="mid" mono fs={46} weight={600} a={E(t, 4.5)}>2<sup style={{ fontSize: 26 }}>32</sup> = 4,294,967,296 values</Txt>
      <Txt x={960} y={278} anchor="mid" mono fs={30} color={PAL.pull} a={E(t, 9.5)}>× 8 bytes per value = 32 GB of addressable heap</Txt>

      <div style={{ position: 'absolute', left: X, top: Y, width: W, height: 90, boxSizing: 'border-box', borderRadius: 10, border: `2px solid ${PAL.pull}`, background: hexA(PAL.pull, 0.08), opacity: E(t, 1),
        backgroundImage: `repeating-linear-gradient(90deg, transparent 0 24px, ${hexA(PAL.pull, 0.22)} 24px 25px)` }}></div>
      {[0, 4, 8, 12, 16, 20, 24, 28, 32].map((g) => <Txt key={g} x={gx(g)} y={Y + 100} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 1.2)}>{g} GB</Txt>)}
      <Txt x={X + W} y={Y - 34} anchor="right" mono fs={17} color={PAL.ink3} a={E(t, 1)}>THE 32 GB WINDOW A 4-BYTE REFERENCE CAN REACH</Txt>
      {marks.map(([g, at]) => (
        <React.Fragment key={g}>
          <div style={{ position: 'absolute', left: X, top: Y + 18, width: (g / 32) * W * E(t, at, 1), height: 54, borderRadius: 8, background: hexA(PAL.flow, 0.16), border: `2px solid ${hexA(PAL.flow, 0.7)}`, boxSizing: 'border-box', opacity: g === 31 ? E(t, at, 0.3) : win(t, at, at + (g === 4 ? 1 : 5)) }}></div>
          <Txt x={gx(g) - 12} y={Y + 32} anchor="right" mono fs={20} color={PAL.flow} a={g === 31 ? E(t, at + 0.6) : win(t, at + 0.4, at + (g === 4 ? 1 : 5))}>{`-Xmx${g}g ✓`}</Txt>
        </React.Fragment>
      ))}
      <Blk x0={X} y={Y + 18} unit={W / 32} off={0} n={0.35} h={54} pad tone="violet" a={E(t, 30.5)} />
      <Txt x={X + 30} y={Y - 34} mono fs={17} color={PAL.violet} a={E(t, 30.8)}>↙ protected page at the base</Txt>
      <Box x={1564} y={Y + 132} w={260} h={70} label="-Xmx32g ✗" sub="doesn't fit" tone="bad" fs={20} sfs={17} a={E(t, 26)} glow={pulse(t, [26], 1.2)} />

      <Console x={96} y={600} w={1100} h={200} t={t} a={E(t, 22.5)} fs={17} lh={30} items={[
        { at: 22.8, text: 'java -Xmx31g -XX:+PrintFlagsFinal -version | grep -w UseCompressedOops', kind: 'cmd' },
        { at: 23.3, text: '     bool UseCompressedOops   = true    {product lp64_product} {ergonomic}', kind: 'ok' },
        { at: 25.5, text: 'java -Xmx32g -XX:+PrintFlagsFinal -version | grep -w UseCompressedOops', kind: 'cmd' },
        { at: 26, text: '     bool UseCompressedOops   = false   {product lp64_product} {default}', kind: 'err' },
      ]} />
      <Callout x={1240} y={600} w={584} tone="violet" a={E(t, 30.5)} fs={19} title="why not exactly 32g?" text="The window must also cover a protected page at the heap base (16 MB at -Xmx31g, per the log). A full 32 GB heap can't fit." />
      <Callout x={96} y={826} w={1728} tone="pull" a={E(t, 37)} fs={21} title="ObjectAlignmentInBytes=16" text="Shift by 4 instead of 3 and the window becomes 64 GB (JDK 17: `-Xmx60g` keeps compressed oops). The price: every object is padded to 16, and `Point` grows from 24 to 32 bytes." />
    </React.Fragment>
  );
}

// ── The 32 GB cliff ────────────────────────────────────────────────────────
export function SCliff({ t }) {
  const X = 96, U = 30;
  const R = 1.226; // measured: 88,777,296 / 72,388,672
  // capacity chart
  const cx = (g) => 300 + ((g - 24) / 24) * 1440, cy = (g) => 880 - ((g - 22) / 20) * 210;
  const draw = clamp((t - 26.5) / 5, 0, 1);
  const pts = [];
  for (let g = 24; g <= 48.001; g += 0.25) {
    if (g > 24 + 24 * draw) break;
    const v = g < 32 ? Math.min(g, 31) : g / R;
    if (g >= 32 && pts.length && pts[pts.length - 1][2] < 32) pts.push([cx(32), cy(31), 32]);
    pts.push([cx(g), cy(v), g]);
  }
  return (
    <React.Fragment>
      <Txt x={X} y={194} mono fs={17} color={PAL.ink3} a={E(t, 0.5)}>Order · COMPRESSED OOPS (DEFAULT)</Txt>
      <Bytes x={X} y={222} unit={U} h={56} fs={17} sfs={17} ruler={false} a={E(t, 0.5)} cells={[
        { n: 8, label: 'mark', tone: TONE.mark }, { n: 4, label: 'class', tone: TONE.klass }, { n: 4, label: 'qty', tone: TONE.field }, { n: 8, label: 'id', tone: TONE.field },
        { n: 1, tone: TONE.field }, { n: 3, pad: true }, { n: 4, label: 'cust', tone: TONE.ref },
      ]} />
      <Badge x={1120} y={250} text="32 B" tone="flow" a={E(t, 1)} fs={20} />
      <Txt x={X} y={302} mono fs={17} color={PAL.ink3} a={E(t, 5.5)}>Order · -XX:-UseCompressedOops</Txt>
      <Bytes x={X} y={330} unit={U} h={56} fs={17} sfs={17} ruler={false} a={E(t, 5.5)} cells={[
        { n: 8, label: 'mark', tone: TONE.mark }, { n: 4, label: 'class', tone: TONE.klass, glow: win(t, 13, 19.4) }, { n: 4, label: 'qty', tone: TONE.field }, { n: 8, label: 'id', tone: TONE.field },
        { n: 1, tone: TONE.field }, { n: 7, pad: true, tone: 'bad' }, { n: 8, label: 'customer', tone: TONE.ref, glow: win(t, 6.5, 13) },
      ]} />
      <Badge x={1400} y={358} text="40 B (+25%)" tone="bad" a={POP(t, 7.5)} fs={20} />
      <Txt x={X + 12 * U} y={396} anchor="mid" mono fs={17} color={PAL.blue} a={E(t, 13.3)}>class word still 4 B: compressed class pointers stay on (JDK 15+)</Txt>

      <Txt x={X} y={444} mono fs={17} color={PAL.ink3} a={E(t, 19.5)}>HashMap&lt;Integer,Integer&gt; · 1M ENTRIES · GraphLayout.totalSize()</Txt>
      {[['compressed', 72.39, 'flow', 19.8], ['uncompressed', 88.78, 'bad', 20.6]].map(([l, mb, tone, at], i) => (
        <React.Fragment key={l}>
          <Txt x={X} y={480 + i * 48} mono fs={19} color={PAL.ink2} a={E(t, at)}>{l}</Txt>
          <div style={{ position: 'absolute', left: 300, top: 476 + i * 48, height: 34, width: mb * 13 * E(t, at, 0.8), borderRadius: 6, background: hexA(toneColor(tone), 0.3), border: `2px solid ${toneColor(tone)}`, boxSizing: 'border-box', opacity: E(t, at) }}></div>
          <Txt x={300 + mb * 13 + 16} y={480 + i * 48} mono fs={19} color={toneColor(tone)} a={E(t, at + 0.6)}>{mb.toFixed(1)} MB</Txt>
        </React.Fragment>
      ))}

      <Panel x={96} y={590} w={1728} h={340} title="how much of that data fits, by -Xmx" right="illustration · uses the measured 1.23× growth" a={E(t, 26.5)} />
      <svg width="1920" height="1080" style={{ position: 'absolute', left: 0, top: 0, opacity: E(t, 26.8) }}>
        <rect x={cx(32)} y={cy(31)} width={cx(38) - cx(32)} height={cy(22) - cy(31)} fill={hexA(PAL.bad, 0.12 * E(t, 40))} />
        <line x1={cx(24)} y1={cy(31)} x2={cx(48)} y2={cy(31)} stroke={PAL.ink3} strokeWidth="1.5" strokeDasharray="6 6" />
        <line x1={cx(24)} y1={cy(22)} x2={cx(48)} y2={cy(22)} stroke={PAL.line2} strokeWidth="2" />
        {pts.length > 1 && <polyline points={pts.map((p) => p[0] + ',' + p[1]).join(' ')} fill="none" stroke={PAL.flow} strokeWidth="4" strokeLinejoin="round" />}
      </svg>
      {[24, 28, 31, 32, 38, 44, 48].map((g) => <Txt key={g} x={cx(g)} y={cy(22) + 8} anchor="mid" mono fs={17} color={g === 32 ? PAL.bad : PAL.ink3} a={E(t, 27)}>{g}g</Txt>)}
      <Txt x={cx(24) + 6} y={cy(31) - 30} mono fs={17} color={PAL.ink2} a={E(t, 27.5)}>what -Xmx31g holds</Txt>
      <Txt x={cx(32) - 14} y={cy(32 / R) + 8} anchor="right" mono fs={17} color={PAL.bad} a={E(t, 33)}>32g holds what 26g held →</Txt>
      <Txt x={cx(35)} y={cy(22) - 30} anchor="mid" mono fs={18} weight={600} color={PAL.bad} a={E(t, 40)}>dead zone</Txt>
      <Txt x={cx(38) + 12} y={cy(31) + 8} mono fs={17} color={PAL.flow} a={E(t, 40.5)}>break-even ≈ 38g</Txt>
      <Badge x={1580} y={650} text="stay ≤ 31g, or go well past 40g" tone="pull" a={E(t, 47)} fs={18} solid />
    </React.Fragment>
  );
}
