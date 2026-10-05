// 8.1 scenes, part 1: intro, two compilers, the class file, constant pool, descriptors, resolution, javap.
const { PAL, MOTION, lin, lerp, win, pulse, step, track, hlAt, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Mark, Val, Brace, Bytes, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

export const CALC_SRC = [
  'public class Calc {',
  '    int add(int a, int b) {',
  '        return a + b;',
  '    }',
  '    public static void main(String[] args) {',
  '        Calc c = new Calc();',
  '        int r = c.add(2, 3);',
  '        System.out.println("r = " + r);',
  '    }',
  '}',
];

// ── Intro ──────────────────────────────────────────────────────────────────
export function SIntro({ t }) {
  const Y = 560;
  const hex = ['ca fe ba be 00 00 00 3d', '00 33 0a 00 02 00 03 07', '00 04 0c 00 05 00 06 01', '00 10 6a 61 76 61 2f 6c', '61 6e 67 2f 4f 62 6a 65'];
  const ops = ['iload_1', 'iload_2', 'iadd', 'ireturn'];
  const lit = Math.floor(clamp((t - 12.5) / 1.1, -1, 40)) % 4;
  const travel = (s, x1, x2) => { const p = M(t, s, 1.2); return p > 0 && p < 1 ? <Dot x={lerp(x1, x2, p)} y={Y + 150} r={9} color={PAL.pull} /> : null; };
  return (
    <React.Fragment>
      <Txt x={96} y={150} mono fs={22} weight={600} color={PAL.pull} a={E(t, 0.3)} style={{ letterSpacing: '0.14em' }}>PART 08 · THE JVM · 8.1</Txt>
      <Txt x={92} y={192} fs={118} weight={700} lh={1} a={E(t, 0.6, 0.9)} style={{ letterSpacing: '-0.03em', transform: `translateY(${(1 - E(t, 0.6, 0.9)) * 24}px)` }}>From source to bytecode</Txt>
      <Txt x={96} y={338} fs={36} color={PAL.ink2} a={E(t, 1.4, 0.8)}>What `javac` produces, and how the JVM reads it.</Txt>

      <Code x={96} y={Y} w={500} h={330} fs={17} lh={26} title="Calc.java" a={E(t, 1.8)} lines={CALC_SRC} />
      <Txt x={346} y={Y + 342} anchor="mid" fs={20} color={PAL.ink2} a={E(t, 2.2)}>what you write</Txt>
      <Box x={626} y={Y + 115} w={150} h={70} label="javac" tone="pull" a={POP(t, 5.5)} glow={pulse(t, [6.2], 1.2)} />
      <HArrow x1={600} x2={622} y={Y + 150} a={E(t, 5.5)} color={PAL.pull} />
      <HArrow x1={780} x2={812} y={Y + 150} a={E(t, 6.4)} color={PAL.pull} />
      {travel(5.3, 600, 812)}
      <Panel x={816} y={Y} w={420} h={330} title="Calc.class" right="928 bytes" a={E(t, 6.6)} tone="flow">
        <div style={{ padding: '14px 22px' }}>
          {hex.map((h, i) => <div key={i} style={{ font: `500 22px ${MONO}`, color: i === 0 ? PAL.pull : PAL.ink2, height: 40, opacity: E(t, 7 + i * 0.35, 0.3) }}>{h}</div>)}
          <div style={{ font: `500 22px ${MONO}`, color: PAL.ink3, opacity: E(t, 9) }}>…</div>
        </div>
      </Panel>
      <Txt x={1026} y={Y + 342} anchor="mid" fs={20} color={PAL.ink2} a={E(t, 7.5)}>bytecode · same file on every OS</Txt>
      <HArrow x1={1240} x2={1290} y={Y + 150} a={E(t, 11)} color={PAL.flow} />
      {travel(10.8, 1240, 1290)}
      <Panel x={1294} y={Y} w={530} h={330} title="JVM" right="reads & runs it" a={E(t, 11.2)} tone="pull">
        <div style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ops.map((o, i) => (
            <div key={o} style={{ display: 'flex', alignItems: 'center', gap: 14, font: `600 24px ${MONO}`, color: lit === i && t > 12.5 ? PAL.pull : PAL.ink2, opacity: E(t, 11.6 + i * 0.25) }}>
              <span style={{ width: 12, height: 12, borderRadius: 6, background: lit === i && t > 12.5 ? PAL.pull : PAL.line2 }}></span>{o}
            </div>
          ))}
        </div>
      </Panel>
      <Txt x={1559} y={Y + 342} anchor="mid" fs={20} color={PAL.ink2} a={E(t, 12)}>what actually executes</Txt>
    </React.Fragment>
  );
}

// ── Two compilers ──────────────────────────────────────────────────────────
export function STwoCompilers({ t }) {
  const Y = 330; // row centre for boxes
  const aL = E(t, 3.2), aR = E(t, 10);
  // the "add()" method token travelling through the tiers
  const tierX = [850, 1150, 1450, 1712];
  const pos = (() => {
    if (t < 20) return [tierX[0], Y + 88];
    if (t < 26.5) return [lerp(tierX[0], tierX[1], M(t, 20, 0.9)), Y + 88];
    if (t < 32.5) return [lerp(tierX[1], tierX[3], M(t, 26.5, 1.1)), Y + 88];
    if (t < 37) return [lerp(tierX[3], tierX[0], M(t, 33, 1.6)), lerp(Y + 88, Y + 88, 0) + Math.sin(clamp((t - 33) / 1.6, 0, 1) * Math.PI) * 110];
    return [lerp(tierX[0], tierX[3], M(t, 37, 1.6)), Y + 88];
  })();
  const calls = t < 14.5 ? 0 : t < 20 ? Math.round(lin(t, 14.5, 5.3) * 200) : t < 26.5 ? Math.round(200 + lin(t, 20, 6) * 4800) : t < 33 ? Math.round(5000 + lin(t, 26.5, 6) * 6000) : 11000 + Math.round(lin(t, 33, 8) * 3000);
  const tier = t < 20 ? 0 : t < 26.5 ? 1 : t < 33 ? 2 : t < 38.6 ? 0 : 2;
  const tierName = ['interpreted', 'C1 · profiling', 'C2 · optimised'][tier];
  // throughput graph
  const gx0 = 150, gx1 = 1780, gy0 = 870, gy1 = 690;
  const T0 = 14, T1 = 44;
  const level = (tt) => tt < 20 ? 0.12 : tt < 26.5 ? 0.45 : tt < 33 ? 0.95 : tt < 38.6 ? 0.18 : 0.95;
  const pts = [];
  for (let tt = T0; tt <= Math.min(t, T1); tt += 0.25) pts.push([lerp(gx0, gx1, (tt - T0) / (T1 - T0)), lerp(gy0, gy1, level(tt))]);
  return (
    <React.Fragment>
      <Panel x={96} y={210} w={560} h={360} title="ahead of time · once" a={aL} tone="pull" />
      <Box x={126} y={Y - 40} w={200} h={80} label="Calc.java" a={E(t, 3.6)} />
      <HArrow x1={330} x2={420} y={Y} a={E(t, 4.4)} color={PAL.pull} label="javac" />
      <Box x={426} y={Y - 40} w={200} h={80} label="Calc.class" tone="flow" a={E(t, 5)} />
      <Txt x={376} y={Y + 70} anchor="mid" fs={20} color={PAL.ink2} a={E(t, 5.6)} w={500} align="center">your build · portable bytecode, not machine code</Txt>

      <Panel x={700} y={210} w={1124} h={360} title="at runtime · continuously" a={aR} tone="flow" />
      {[['interpreter', 'starts instantly'], ['C1', 'quick · profiles'], ['C2', 'aggressive'], ['machine code', 'fast']].map(([l, s], i) => (
        <Box key={l} x={tierX[i] - (i === 3 ? 100 : 110)} y={Y - 50} w={i === 3 ? 200 : 220} h={84} label={l} sub={s} tone={i === 0 ? 'ink' : i === 3 ? 'flow' : 'pull'} a={E(t, [14.5, 20, 26.5, 27.5][i])} glow={tier === Math.min(i, 2) && i < 3 && t > 14.5 ? 0.6 : 0} />
      ))}
      <HArrow x1={962} x2={1038} y={Y - 8} a={E(t, 20)} color={PAL.pull} label="hot?" lfs={17} />
      <HArrow x1={1262} x2={1338} y={Y - 8} a={E(t, 26.5)} color={PAL.pull} label="hotter?" lfs={17} />
      <HArrow x1={1562} x2={1610} y={Y - 8} a={E(t, 27.5)} color={PAL.flow} />
      <Arrow pts={[[1712, Y + 36], [1712, Y + 170], [850, Y + 170], [850, Y + 40]]} draw={M(t, 32.5, 1.4)} color={PAL.bad} dashed width={2.5} />
      <Txt x={1281} y={Y + 180} anchor="mid" mono fs={19} color={PAL.bad} a={E(t, 33.4)}>deoptimise · assumption was wrong · re-profile</Txt>
      {t > 14.5 && <Val x={pos[0]} y={pos[1]} text="add()" tone={tier === 0 ? 'ink' : tier === 1 ? 'pull' : 'flow'} fs={18} h={36} o={E(t, 14.5)} />}
      <Txt x={884} y={Y + 118} mono fs={18} color={PAL.ink2} a={E(t, 15)}>calls: <span style={{ color: PAL.ink }}>{calls.toLocaleString('en-US')}</span> · {tierName}</Txt>
      <Txt x={1150} y={Y + 42} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 20.5)}>after ~200 calls</Txt>
      <Txt x={1450} y={Y + 42} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 27)}>after ~5,000+ calls</Txt>

      <Panel x={96} y={620} w={1728} h={310} title="throughput of this service" right="time →" a={E(t, 14)} />
      <svg width="1920" height="1080" style={{ position: 'absolute', left: 0, top: 0, opacity: E(t, 14.5) }}>
        <line x1={gx0} y1={gy0} x2={gx1} y2={gy0} stroke={PAL.line2} strokeWidth="2" />
        {pts.length > 1 && <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={PAL.flow} strokeWidth="4" strokeLinejoin="round" />}
      </svg>
      <Txt x={210} y={gy0 - 60} mono fs={17} color={PAL.ink3} a={E(t, 16)}>interpreted: slow</Txt>
      <Txt x={lerp(gx0, gx1, (21 - T0) / (T1 - T0))} y={lerp(gy0, gy1, 0.45) - 34} mono fs={17} color={PAL.pull} a={E(t, 21)}>C1</Txt>
      <Txt x={lerp(gx0, gx1, (27.5 - T0) / (T1 - T0))} y={lerp(gy0, gy1, 0.95) - 34} mono fs={17} color={PAL.flow} a={E(t, 28)}>C2: several × faster</Txt>
      <Txt x={lerp(gx0, gx1, (33.4 - T0) / (T1 - T0))} y={gy0 - 84} mono fs={17} color={PAL.bad} a={E(t, 33.5)}>deopt dip</Txt>
      <Brace x={gx0} y={gy0 + 6} w={lerp(0, gx1 - gx0, (27 - T0) / (T1 - T0))} label="warm-up: a benchmark here measures nothing" tone="pull" a={E(t, 40)} fs={17} />
    </React.Fragment>
  );
}

// ── The class file: hex dump ───────────────────────────────────────────────
const BYTES = [
  'ca fe ba be 00 00 00 3d 00 33 0a 00 02 00 03 07',
  '00 04 0c 00 05 00 06 01 00 10 6a 61 76 61 2f 6c',
  '61 6e 67 2f 4f 62 6a 65 63 74 01 00 06 3c 69 6e',
  '69 74 3e 01 00 03 28 29 56 07 00 08 01 00 04 43',
].join(' ').split(' ');
// groups: [from, to, tone, appearTime]
const GROUPS = [
  [0, 3, 'pull', 5], [4, 5, 'ink', 11], [6, 7, 'flow', 11], [8, 9, 'violet', 22.5],
  [10, 10, 'blue', 28], [11, 12, 'blue', 29], [13, 14, 'blue', 30],
  [15, 15, 'green', 35], [16, 17, 'green', 35.6], [18, 18, 'pink', 37], [19, 20, 'pink', 37.6], [21, 22, 'pink', 38.2],
  [23, 23, 'pull', 41.5], [24, 25, 'pull', 42.3], [26, 41, 'pull', 43.2],
];
export function SHexDump({ t }) {
  const cx = 286, cw = 56, gap = 8, rowY = [430, 520, 610, 700];
  const groupOf = (i) => GROUPS.find((g) => i >= g[0] && i <= g[1]);
  const focus = (() => { let f = null; for (const g of GROUPS) if (t >= g[3]) f = g; return f; })();
  const decode = [
    [5, 'pull', 'ca fe ba be', 'magic number'],
    [11, 'flow', '00 00 · 00 3d', 'minor 0 · major 61 → Java 17'],
    [22.5, 'violet', '00 33', 'constant pool count 51 → 50 entries'],
    [28, 'blue', '0a 0002 0003', '#1 Methodref → #2 . #3'],
    [35, 'green', '07 0004', '#2 Class → #4'],
    [37, 'pink', '0c 0005 0006', '#3 NameAndType → #5 : #6'],
    [41.5, 'pull', '01 0010 …', '#4 Utf8, 16 bytes: java/lang/Object'],
  ];
  return (
    <React.Fragment>
      <Console x={96} y={190} w={820} h={180} t={t} a={E(t, 0.3)} items={[{ at: 0.8, text: 'javac Calc.java', kind: 'cmd' }, { at: 2.2, text: 'xxd Calc.class | head -4', kind: 'cmd' }]} />
      {rowY.map((y, r) => (
        <React.Fragment key={r}>
          <Txt x={96} y={y + 12} mono fs={24} color={PAL.ink3} a={E(t, 2.8 + r * 0.2)}>{(r * 16).toString(16).padStart(8, '0')}:</Txt>
          {BYTES.slice(r * 16, r * 16 + 16).map((b, k) => {
            const i = r * 16 + k;
            const g = groupOf(i);
            const on = g && t >= g[3];
            const isFocus = focus && g === focus;
            const c = on ? toneColor(g[2]) : null;
            const ascii = i >= 26 && i <= 41 && t >= 43.2;
            return (
              <React.Fragment key={k}>
                <div style={{ position: 'absolute', left: cx + k * (cw + gap), top: y, width: cw, height: 54, boxSizing: 'border-box', borderRadius: 8, opacity: E(t, 2.8 + r * 0.2 + k * 0.02, 0.3), background: on ? hexA(c, isFocus ? 0.3 : 0.14) : PAL.panel2, border: `2px solid ${on ? c : PAL.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 24px ${MONO}`, color: on ? PAL.ink : PAL.ink2, boxShadow: isFocus ? `0 0 18px ${hexA(c, 0.5)}` : 'none' }}>{b}</div>
                {ascii && <div style={{ position: 'absolute', left: cx + k * (cw + gap), top: y + 58, width: cw, textAlign: 'center', font: `600 18px ${MONO}`, color: PAL.pull, opacity: E(t, 43.2 + (i - 26) * 0.08, 0.2) }}>{String.fromCharCode(parseInt(b, 16))}</div>}
              </React.Fragment>
            );
          })}
        </React.Fragment>
      ))}
      <Panel x={1352} y={190} w={472} h={620} title="decoded" a={E(t, 4.5)}>
        <div style={{ padding: '10px 18px' }}>
          {decode.map(([at, tone, bytes, what], i) => (
            <div key={i} style={{ opacity: E(t, at, 0.4), transform: `translateX(${(1 - E(t, at, 0.4)) * 16}px)`, borderLeft: `4px solid ${toneColor(tone)}`, padding: '6px 12px', margin: '8px 0', background: hexA(toneColor(tone), 0.07), borderRadius: '0 8px 8px 0' }}>
              <div style={{ font: `600 18px ${MONO}`, color: toneColor(tone) }}>{bytes}</div>
              <div style={{ font: `400 18px ${SANS}`, color: PAL.ink, marginTop: 2 }}>{what}</div>
            </div>
          ))}
        </div>
      </Panel>
      <Callout x={96} y={810} w={1210} tone="flow" a={win(t, 15.5, 22.3, 0.5)} title="version" text="0x3D = 61 = **Java 17**, the JDK this was compiled with. A Java 25 `javac` writes `0x45` = **69**." />
      <Callout x={96} y={810} w={1210} tone="violet" a={win(t, 22.5, 41.3, 0.5)} title="constant pool" text="Each entry starts with a one-byte **tag** saying what kind it is, then its data. References to other entries are 2-byte indexes." />
      <Callout x={96} y={810} w={1210} tone="pull" a={E(t, 47)} title="no magic" text="Tags, indexes and text. You could decode the whole 928-byte file by hand with this table." />
    </React.Fragment>
  );
}

// ── Version numbers ────────────────────────────────────────────────────────
export function SVersions({ t }) {
  const rows = [['52', 'Java 8'], ['55', 'Java 11'], ['61', 'Java 17'], ['65', 'Java 21'], ['69', 'Java 25']];
  // scenario 1: v69 class into JVM 17 → rejected
  const s1x = t < 7 ? 720 : t < 10 ? lerp(720, 1080, M(t, 7, 1.2)) : lerp(1080, 720, M(t, 10, 0.8));
  const shake = t > 10 && t < 11 ? Math.sin(t * 60) * 6 * (11 - t) : 0;
  const s2x = t < 21 ? 720 : lerp(720, 1110, M(t, 21, 1.4));
  return (
    <React.Fragment>
      <Table x={96} y={200} cols={[150, 220]} head={['major', 'release']} rows={rows} a={E(t, 0.4)} rowA={rows.map((_, i) => E(t, 0.8 + i * 0.5))} marks={{ 2: ['pull', win(t, 6, 20)], 4: ['flow', win(t, 6, 20)], 0: ['flow', win(t, 20, 32)] }} fs={22} />
      <Code x={96} y={560} w={520} h={140} lang="shell" title="the fix" a={E(t, 32)} fs={20} lines={['$ javac --release 17 Calc.java', '# → major version 61, runs on 17+']} />

      <Txt x={720} y={196} mono fs={18} color={PAL.ink3} a={E(t, 6)}>NEWER CLASS · OLDER JVM</Txt>
      <Box x={s1x + shake} y={240} w={300} h={84} label="Calc.class" sub="major 69" tone="flow" a={E(t, 6)} />
      <Box x={1430} y={226} w={394} h={112} label="JVM 17" sub="understands up to 61" tone={t > 10 ? 'bad' : 'ink'} a={E(t, 6.3)} glow={pulse(t, [10], 1.4)} />
      <Mark x={1804} y={232} ok={false} a={E(t, 10.2) * win(t, 10.2, 20)} />
      <Console x={720} y={370} w={1104} h={200} t={t} a={E(t, 12)} fs={18} lh={30} items={[
        { at: 12, text: 'Exception in thread "main" java.lang.UnsupportedClassVersionError:', kind: 'err' },
        { at: 12.6, text: '  Calc has been compiled by a more recent version of the Java Runtime', kind: 'err' },
        { at: 13.2, text: '  (class file version 69.0), this version only recognizes up to 61.0', kind: 'err' },
      ]} />

      <Txt x={720} y={596} mono fs={18} color={PAL.ink3} a={E(t, 20)}>OLDER CLASS · NEWER JVM</Txt>
      <Box x={s2x} y={640} w={300} h={84} label="Old.class" sub="major 52" tone="green" a={E(t, 20)} />
      <Box x={1430} y={626} w={394} h={112} label="JVM 25" sub="understands up to 69" tone={t > 22.4 ? 'flow' : 'ink'} a={E(t, 20.3)} glow={pulse(t, [22.4], 1.4)} />
      <Mark x={1804} y={632} ok a={E(t, 22.5)} />
      <Callout x={720} y={790} w={1104} tone="pull" a={E(t, 27)} title="the rule" text="Java runs **older** class files forever, never **newer** ones." />
    </React.Fragment>
  );
}

// ── Class-file structure ───────────────────────────────────────────────────
const SECTIONS = [
  ['magic', 'u4 · CAFEBABE', 0.6, 'ink'], ['version', 'u2 minor · u2 major', 0.9, 'ink'],
  ['constant pool', '50 entries · 703 of 928 bytes', 1.2, 'violet', 230],
  ['access flags', 'public · final · …', 4, 'ink'], ['this · super', '#7 Calc · #2 Object', 4.5, 'ink'],
  ['interfaces', 'none', 5, 'ink'], ['fields', 'none', 5.5, 'ink'], ['methods', '<init> · add · main', 10, 'flow', 100], ['attributes', 'SourceFile · BootstrapMethods …', 6.5, 'ink'],
];
export function SStructure({ t }) {
  let y = 196, mY = 0;
  const boxes = SECTIONS.map(([l, sub, at, tone, big], i) => {
    const h = big || 46;
    const glow = (i === 2 ? win(t, 23, 32) : 0) + (i === 7 ? win(t, 10, 23) * 0.8 : 0);
    const el = big
      ? <Box key={l} x={96} y={y} w={600} h={h} label={l} sub={sub} tone={tone} align="left" fs={22} sfs={17} a={E(t, at)} glow={glow} />
      : <Box key={l} x={96} y={y} w={600} h={h} align="left" fs={19} tone={tone} a={E(t, at)} glow={glow} label={<span>{l}<span style={{ color: PAL.ink3, fontWeight: 400, marginLeft: 16 }}>{sub}</span></span>} />;
    if (i === 7) mY = y + h / 2;
    y += h + 8;
    return el;
  });
  const codeBytes = [{ n: 1, label: '1b', sub: 'iload_1', tone: 'flow' }, { n: 1, label: '1c', sub: 'iload_2', tone: 'flow' }, { n: 1, label: '60', sub: 'iadd', tone: 'pull' }, { n: 1, label: 'ac', sub: 'ireturn', tone: 'pink' }];
  return (
    <React.Fragment>
      {boxes}
      <Arrow pts={[[700, mY], [750, mY], [750, 420], [794, 420]]} draw={M(t, 10.4, 0.8)} color={PAL.flow} />
      <Panel x={800} y={196} w={1024} h={470} title="methods[1] · add" right="descriptor (II)I" a={E(t, 10.6)} tone="flow">
        <div style={{ padding: '18px 26px', font: `400 20px ${SANS}`, color: PAL.ink2 }}>Code attribute</div>
      </Panel>
      <Bytes x={860} y={300} unit={150} h={84} fs={26} sfs={18} cells={codeBytes.map((c, i) => ({ ...c, a: E(t, 11.5 + i * 0.4) }))} a={E(t, 11.4)} />
      <Txt x={860} y={418} fs={20} color={PAL.ink2} a={E(t, 13.5)}>four bytes of bytecode: one opcode byte each</Txt>
      <Node x={860} y={470} w={420} h={160} kind="frame size, computed by javac" name="" rows={[['max_stack', '2', PAL.pull, win(t, 16.5, 23)], ['max_locals', '3', PAL.pull, win(t, 16.5, 23)], ['code_length', '4']]} a={E(t, 16)} />
      <Callout x={1310} y={470} w={480} tone="pull" a={E(t, 17.5)} text="The JVM can size this method's frame **before** running a single instruction." />
      <Panel x={800} y={700} w={1024} h={190} title="where the 928 bytes go" a={E(t, 23)} />
      <Bytes x={830} y={770} unit={964 / 928} h={60} ruler={false} a={E(t, 23.3)} fs={18} sfs={16}
        cells={[{ n: 10, tone: 'ink' }, { n: 703, label: 'constant pool · 76%', tone: 'violet', glow: win(t, 24, 32) }, { n: 215, label: 'everything else', tone: 'ink' }]} />
    </React.Fragment>
  );
}

// ── Constant pool chain ────────────────────────────────────────────────────
const POOL = [
  ['#1', 'Methodref', '#2.#3', 'java/lang/Object."<init>":()V'],
  ['#2', 'Class', '#4', 'java/lang/Object'],
  ['#3', 'NameAndType', '#5:#6', '"<init>":()V'],
  ['#4', 'Utf8', '', 'java/lang/Object'],
  ['#5', 'Utf8', '', '<init>'],
  ['#6', 'Utf8', '', '()V'],
  ['#7', 'Class', '#8', 'Calc'],
  ['#8', 'Utf8', '', 'Calc'],
  ['#9', 'Methodref', '#7.#3', 'Calc."<init>":()V'],
  ['#10', 'Methodref', '#7.#11', 'Calc.add:(II)I'],
  ['#11', 'NameAndType', '#12:#13', 'add:(II)I'],
  ['#12', 'Utf8', '', 'add'],
  ['#13', 'Utf8', '', '(II)I'],
];
export function SPoolTable({ t }) {
  const TX = 940, TY = 196, RH = 48;
  const ry = (i) => TY + 42 + i * RH + RH / 2;
  const R = TX + 830;
  const marks = {
    9: ['pull', win(t, 6, 34)], 6: ['green', win(t, 11, 34)], 7: ['green', win(t, 13, 34)],
    10: ['pink', win(t, 17, 34)], 11: ['pink', win(t, 19, 34)], 12: ['pink', win(t, 22, 34)],
    2: ['violet', E(t, 34.5)], 0: ['violet', E(t, 36)], 8: ['violet', E(t, 36)],
  };
  const [hl, hA] = hlAt(t, [[1, 3]]);
  return (
    <React.Fragment>
      <Code x={96} y={196} w={800} h={290} lang="bytecode" title="main · javap -c" a={E(t, 0.3)} fs={20} lh={36} hl={hl} hlA={hA}
        lines={['   8: aload_1', '   9: iconst_2', '  10: iconst_3', '  11: invokevirtual #10  // add:(II)I', '  14: istore_2', '  15: getstatic     #14']} />
      <Table x={TX} y={TY} cols={[80, 200, 150, 400]} head={['#', 'kind', 'points to', 'means']} rows={POOL} a={E(t, 4)} fs={18} rh={RH} marks={marks}
        rowA={POOL.map((_, i) => E(t, 4.2 + i * 0.12))} colColors={[PAL.pull, PAL.ink2, PAL.violet, PAL.ink]} />
      <Arrow from={[760, 196 + 44 + 12 + 3 * 36 + 18]} to={[TX - 8, ry(9)]} curve={-40} draw={M(t, 6.2, 0.8)} color={PAL.pull} />
      <Arrow from={[R, ry(9)]} to={[R, ry(6)]} curve={-50} draw={M(t, 11, 0.8)} color={PAL.green} />
      <Arrow from={[R, ry(6)]} to={[R, ry(7)]} curve={-24} draw={M(t, 13, 0.6)} color={PAL.green} />
      <Arrow from={[R, ry(9)]} to={[R, ry(10)]} curve={-24} draw={M(t, 17, 0.6)} color={PAL.pink} />
      <Arrow from={[R + 30, ry(10)]} to={[R + 30, ry(11)]} curve={-24} draw={M(t, 19, 0.6)} color={PAL.pink} />
      <Arrow from={[R + 30, ry(10)]} to={[R + 30, ry(12)]} curve={-40} draw={M(t, 22, 0.7)} color={PAL.pink} />
      <Arrow from={[TX - 6, ry(0)]} to={[TX - 6, ry(2)]} curve={40} draw={M(t, 36, 0.7)} color={PAL.violet} />
      <Arrow from={[TX - 6, ry(8)]} to={[TX - 6, ry(2)]} curve={-70} draw={M(t, 36.4, 0.9)} color={PAL.violet} />
      <Card x={96} y={530} w={800} h={170} a={E(t, 27.5)} tone="pull" num="invokevirtual #10" title="call `Calc.add`" sub="taking `(int, int)`, returning `int`" tfs={30} sfs={22} />
      <Callout x={96} y={730} w={800} tone="violet" a={E(t, 34.5)} title="stored once" text={'`"<init>":()V` is one entry, shared by `Object`\'s and `Calc`\'s constructor references.'} />
      <Callout x={96} y={860} w={800} tone="flow" a={E(t, 42)} fs={20} text="Every class name, method name, string literal and descriptor: once, by index." />
    </React.Fragment>
  );
}

// ── Descriptors ────────────────────────────────────────────────────────────
const LETTERS = [['B', 'byte'], ['C', 'char'], ['D', 'double'], ['F', 'float'], ['I', 'int'], ['J', 'long'], ['S', 'short'], ['Z', 'boolean'], ['V', 'void'], ['L…;', 'class'], ['[', 'array of']];
const EXAMPLES = [
  { at: 17, end: 24, tokens: [['(', 'dim'], ['I', 'flow', 'int'], ['I', 'flow', 'int'], [')', 'dim'], ['I', 'pull', 'returns int']], read: 'add(int, int) → int' },
  { at: 24, end: 31, tokens: [['(', 'dim'], ['[', 'violet', 'array of'], ['Ljava/lang/String;', 'flow', 'String'], [')', 'dim'], ['V', 'pull', 'returns void']], read: 'main(String[]) → void' },
  { at: 31, end: 99, tokens: [['(', 'dim'], ['J', 'flow', 'long'], ['Z', 'flow', 'boolean'], [')', 'dim'], ['[', 'violet', 'array of'], ['D', 'pull', 'double']], read: '(long, boolean) → double[]' },
];
export function SDescriptors({ t }) {
  return (
    <React.Fragment>
      {LETTERS.map(([l, m], i) => {
        const odd = l === 'J' || l === 'Z';
        return <Box key={l} x={96 + i * 158} y={200} w={146} h={108} label={l} sub={m} fs={30} sfs={17} tone={odd ? 'pull' : l.length > 1 ? 'violet' : 'ink'} a={E(t, 0.8 + i * 0.15)} glow={odd ? win(t, 4.5, 11.5) : (l.length > 1 ? win(t, 11.5, 17) : 0)} s={odd ? 1 + 0.06 * win(t, 4.5, 11.5) : 1} />;
      })}
      {EXAMPLES.map((ex, k) => {
        const a = win(t, ex.at, ex.end, 0.5);
        if (a < 0.01) return null;
        // exploded: one cell per token, wide enough for its label
        const cells = ex.tokens.map(([txt, , meaning]) => Math.max(txt.length * 26 + 28, meaning ? meaning.length * 11.5 + 28 : 0, 44));
        const W = cells.reduce((s, w) => s + w, 0) + (cells.length - 1) * 14;
        let x = 960 - W / 2;
        return (
          <React.Fragment key={k}>
            <Txt x={960} y={366} anchor="mid" mono fs={44} weight={600} a={a}>{ex.tokens.map(([txt, tone], j) => <span key={j} style={{ color: toneColor(tone) }}>{txt}</span>)}</Txt>
            {ex.tokens.map(([txt, tone, meaning], j) => {
              const w = cells[j], x0 = x;
              x += w + 14;
              const ta = E(t, ex.at + 0.8 + j * 0.45, 0.4);
              const c = toneColor(tone);
              return (
                <React.Fragment key={j}>
                  <div style={{ position: 'absolute', left: x0, top: 450, width: w, height: 84, boxSizing: 'border-box', borderRadius: 10, opacity: a * ta, transform: `translateY(${(1 - ta) * -40}px)`, background: tone === 'dim' ? 'transparent' : hexA(c, 0.12), border: tone === 'dim' ? 'none' : `2px solid ${hexA(c, 0.8)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 40px ${MONO}`, color: c }}>{txt}</div>
                  {meaning && <Txt x={x0 + w / 2} y={548} anchor="mid" mono fs={19} color={c} a={a * ta}>{meaning}</Txt>}
                </React.Fragment>
              );
            })}
            <Txt x={960} y={620} anchor="mid" mono fs={36} weight={600} color={PAL.ink} a={a * E(t, ex.at + 3.4)}>{ex.read}</Txt>
          </React.Fragment>
        );
      })}
      <Callout x={96} y={730} w={1728} tone="violet" a={E(t, 37.5)} title="return type included" text="A method is identified by **name + full descriptor**. `javac` forbids overloading on return type alone, but the JVM itself would accept it: `foo:()I` and `foo:()J` are different methods." />
    </React.Fragment>
  );
}

// ── Resolution ─────────────────────────────────────────────────────────────
export function SResolution({ t }) {
  const resolved = t >= 24;
  const runs = [
    { at: 10.5, slow: true }, { at: 31, slow: false }, { at: 33, slow: false }, { at: 35, slow: false },
  ];
  const steps = ['find class Calc', 'find add:(II)I', 'check access', 'cache the result'];
  return (
    <React.Fragment>
      <Panel x={96} y={210} w={470} h={250} title="Calc.class · on disk" a={E(t, 0.5)}>
        <div style={{ padding: '18px 22px', font: `500 21px ${MONO}`, color: PAL.ink2, lineHeight: 1.7 }}>
          <div>#7  Class      Calc</div><div style={{ color: PAL.ink }}>#10 Methodref  Calc.add:(II)I</div><div>#11 NameAndType add:(II)I</div><div>…</div>
        </div>
      </Panel>
      <HArrow x1={574} x2={700} y={335} a={E(t, 4.5)} color={PAL.violet} label="loads" lfs={17} />
      <Panel x={706} y={210} w={600} h={250} title="metaspace · runtime constant pool" tone="violet" a={E(t, 4.8)}>
        <div style={{ padding: '22px 22px', font: `500 22px ${MONO}`, color: PAL.ink }}>
          <div style={{ color: PAL.ink2 }}>#10 Methodref</div>
          <div style={{ marginTop: 10, color: resolved ? PAL.ink3 : PAL.pull, textDecoration: resolved ? 'line-through' : 'none' }}>symbolic: "Calc.add:(II)I"</div>
          <div style={{ marginTop: 10, color: PAL.flow, opacity: E(t, 24) }}>resolved → Method* Calc::add</div>
        </div>
      </Panel>
      <Panel x={1366} y={210} w={458} h={250} title="cp cache (HotSpot)" tone="flow" a={E(t, 24)}>
        <div style={{ padding: '22px 22px', font: `500 21px ${MONO}`, color: PAL.ink2, lineHeight: 1.6 }}>
          <div>entry for #10:</div><div style={{ color: PAL.flow }}>→ Calc::add, ready</div>
        </div>
      </Panel>
      <Txt x={96} y={520} mono fs={20} color={PAL.ink3} a={E(t, 10)}>EXECUTING  invokevirtual #10</Txt>
      {steps.map((s, i) => <Box key={s} x={300 + i * 330} y={600} w={290} h={80} label={s} fs={19} tone={i === 3 ? 'flow' : 'pull'} a={E(t, 16.5 + i * 1.6)} glow={pulse(t, [17 + i * 1.6], 1)} />)}
      {steps.slice(1).map((_, i) => <HArrow key={i} x1={592 + i * 330} x2={628 + i * 330} y={640} a={E(t, 17.4 + i * 1.6)} color={PAL.pull} />)}
      <Box x={96} y={600} w={170} h={80} label="1st call" fs={19} tone="bad" a={E(t, 10.5)} />
      <HArrow x1={268} x2={296} y={640} a={E(t, 16.5)} color={PAL.pull} />
      <Box x={96} y={760} w={170} h={80} label="2nd, 3rd…" fs={19} tone="flow" a={E(t, 30.5)} />
      <Arrow pts={[[268, 800], [1580, 800]]} draw={M(t, 31, 0.8)} color={PAL.flow} width={3} />
      <Box x={1590} y={760} w={234} h={80} label="Calc::add" fs={20} tone="flow" a={E(t, 31.6)} glow={pulse(t, [31.8, 33.8, 35.8], 0.8)} />
      <Txt x={924} y={812} anchor="mid" mono fs={18} color={PAL.flow} a={E(t, 31.6)}>straight through the cache · no lookup</Txt>
      {runs.slice(1).map((r, i) => { const p = M(t, r.at, 0.9); return p > 0 && p < 1 ? <Dot key={i} x={lerp(268, 1580, p)} y={800} color={PAL.flow} /> : null; })}
      <Callout x={96} y={880} w={1728} tone="pull" a={E(t, 34)} fs={20} text="Resolution is **lazy**: each entry is resolved the first time it's used, then never again." />
    </React.Fragment>
  );
}

// ── javap ──────────────────────────────────────────────────────────────────
const FLAGS = [
  [5, 'javap', 'non-private signatures'], [9.5, '-p', 'adds private members'], [13.5, '-c', 'disassembles every method'],
  [18, '-v', 'constant pool, flags, stack sizes, attributes'], [23, '-s', 'type descriptors'],
];
export function SJavap({ t }) {
  return (
    <React.Fragment>
      <Console x={96} y={200} w={900} h={700} t={t} a={E(t, 0.4)} fs={20} lh={31} items={[
        { at: 5, text: 'javap Calc.class', kind: 'cmd' },
        { at: 5.6, text: 'public class Calc {' }, { at: 5.8, text: '  public Calc();' }, { at: 6, text: '  int add(int, int);' }, { at: 6.2, text: '  public static void main(java.lang.String[]);' }, { at: 6.4, text: '}' },
        { at: 13.5, text: 'javap -c Calc.class', kind: 'cmd' },
        { at: 14.1, text: '  int add(int, int);' }, { at: 14.3, text: '    Code:' }, { at: 14.5, text: '       0: iload_1', kind: 'ok' }, { at: 14.7, text: '       1: iload_2', kind: 'ok' }, { at: 14.9, text: '       2: iadd', kind: 'ok' }, { at: 15.1, text: '       3: ireturn', kind: 'ok' },
        { at: 18, text: 'javap -v Calc.class | grep stack', kind: 'cmd' },
        { at: 18.6, text: '      stack=2, locals=3, args_size=3' },
        { at: 23, text: 'javap -s Calc.class | grep descriptor', kind: 'cmd' },
        { at: 23.6, text: '    descriptor: (II)I' },
      ]} />
      {FLAGS.map(([at, f, d], i) => (
        <Box key={f} x={1040} y={200 + i * 112} w={784} h={96} align="left" label={f} sub={d} fs={28} sfs={19} tone={i === 2 ? 'pull' : 'flow'} a={E(t, at)} glow={pulse(t, [at + 0.1], 1.2)} />
      ))}
      <Card x={1040} y={780} w={784} h={120} a={E(t, 27.5)} tone="pull" title="`javap -c -p -v Calc`" sub="the answer to “what does this compile to?”" tfs={28} sfs={20} />
    </React.Fragment>
  );
}
