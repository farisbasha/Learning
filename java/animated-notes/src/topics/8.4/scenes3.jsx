// 8.4 scenes, part 3: boxing costs, a million values, arrays of references, cache lines.
// Sizes: JOL GraphLayout on JDK 17. Timings and addresses: one real run on this machine (JDK 17, Apple arm64).
import { TONE, Blk, Ruler, Tok, Lines } from './common.jsx';
const { PAL, MOTION, lerp, win, pulse, step, track, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Bytes, Brace, Stat, Mark, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

// ── Integer vs int ─────────────────────────────────────────────────────────
export function SBoxing({ t }) {
  const OX = 1060, U = 40;
  return (
    <React.Fragment>
      <Panel x={96} y={196} w={520} h={300} title="int n = 1000;" tone="flow" a={E(t, 0.5)}>
        <div style={{ padding: '18px 22px', font: `400 19px ${SANS}`, color: PAL.ink2 }}>the value sits right in the slot</div>
      </Panel>
      <Box x={196} y={300} w={320} h={100} label="1000" sub="n · 4 bytes" tone="flow" fs={34} sfs={18} a={E(t, 1)} glow={pulse(t, [1.2], 1)} />

      <Panel x={660} y={196} w={1164} h={300} title="Integer m = 1000;" tone="pull" a={E(t, 5.5)}>
        <div style={{ padding: '18px 22px', font: `400 19px ${SANS}`, color: PAL.ink2 }}>the slot holds a reference; the value lives in an object</div>
      </Panel>
      <Box x={700} y={300} w={240} h={100} label="→ ref" sub="m · 4 bytes" tone="pull" fs={28} sfs={18} a={E(t, 12)} glow={pulse(t, [12.2], 1)} />
      <Arrow from={[944, 350]} to={[OX - 8, 350]} draw={M(t, 12.4, 0.6)} color={PAL.pull} />
      <Bytes x={OX} y={300} unit={U} h={100} fs={20} sfs={17} ruler={false} a={E(t, 6)} cells={[
        { n: 8, label: 'mark word', sub: '8', tone: TONE.mark, a: E(t, 6) }, { n: 4, label: 'class', sub: '4', tone: TONE.klass, a: E(t, 6.6) }, { n: 4, label: '1000', sub: 'value', tone: TONE.field, a: E(t, 7.2), glow: win(t, 7.2, 11) },
      ]} />
      <Txt x={OX + 8 * U} y={418} anchor="mid" mono fs={18} color={PAL.ink2} a={E(t, 7.6)}>Integer object · 16 bytes (JOL)</Txt>

      <Txt x={356} y={530} anchor="mid" mono fs={40} weight={600} color={PAL.flow} a={E(t, 17.5)}>4 bytes</Txt>
      <Txt x={1242} y={530} anchor="mid" mono fs={40} weight={600} color={PAL.pull} a={E(t, 17.5) * (1 - E(t, 37.6, 0.4))}>4 + 16 = 20 bytes</Txt>
      <Txt x={1242} y={530} anchor="mid" mono fs={34} weight={600} color={PAL.bad} a={E(t, 38)}>no compressed oops: 8 + 16 = 24</Txt>
      <Badge x={780} y={556} text="5× per element" tone="bad" a={POP(t, 19)} fs={22} solid />

      {/* Integer cache */}
      <Panel x={96} y={630} w={840} h={290} title="Integer.valueOf(100) · twice" tone="flow" a={E(t, 24)} />
      <Box x={130} y={700} w={150} h={70} label="a" sub="ref" tone="pull" fs={22} sfs={17} a={E(t, 24.4)} />
      <Box x={130} y={810} w={150} h={70} label="b" sub="ref" tone="pull" fs={22} sfs={17} a={E(t, 24.8)} />
      <Box x={520} y={740} w={360} h={100} label="Integer(100)" sub="IntegerCache: -128…127" tone="flow" fs={22} sfs={17} a={E(t, 25.2)} glow={pulse(t, [26.6], 1.2)} />
      <Arrow from={[284, 735]} to={[516, 776]} draw={M(t, 25.6, 0.6)} color={PAL.flow} />
      <Arrow from={[284, 845]} to={[516, 806]} draw={M(t, 26, 0.6)} color={PAL.flow} />
      <Badge x={700} y={688} text="a == b  → true" tone="flow" a={E(t, 27)} fs={18} />

      <Panel x={984} y={630} w={840} h={290} title="Integer.valueOf(1000) · twice" tone="pull" a={E(t, 31)} />
      <Box x={1018} y={700} w={150} h={70} label="c" sub="ref" tone="pull" fs={22} sfs={17} a={E(t, 31.4)} />
      <Box x={1018} y={810} w={150} h={70} label="d" sub="ref" tone="pull" fs={22} sfs={17} a={E(t, 31.8)} />
      <Box x={1420} y={690} w={360} h={84} label="Integer(1000)" sub="new · 16 B" tone="pull" fs={22} sfs={17} a={E(t, 32.2)} />
      <Box x={1420} y={800} w={360} h={84} label="Integer(1000)" sub="new · 16 B" tone="pull" fs={22} sfs={17} a={E(t, 32.8)} />
      <Arrow from={[1172, 735]} to={[1416, 732]} draw={M(t, 32.4, 0.6)} color={PAL.pull} />
      <Arrow from={[1172, 845]} to={[1416, 842]} draw={M(t, 33, 0.6)} color={PAL.pull} />
      <Badge x={1300} y={790} text="c == d  → false" tone="bad" a={E(t, 34)} fs={18} />
    </React.Fragment>
  );
}

// ── A million values ───────────────────────────────────────────────────────
const MB = 16.2; // px per MB
const ROWS = [
  ['int[]', 5, [[4.0, 'ints', 'flow']], '4.0 MB · 1×'],
  ['Integer[]', 10.5, [[4.0, 'refs', 'violet'], [16.0, '1M Integer objects', 'pull']], '20.0 MB · 5×'],
  ['ArrayList<Integer>', 17, [[4.86, 'array', 'violet'], [16.0, '1M Integer objects', 'pull']], '20.9 MB'],
  ['HashMap<Integer,Integer>', 22.5, [[8.39, 'table', 'blue'], [32.0, '1M Node objects', 'violet'], [32.0, '2M Integer objects', 'pull']], '72.4 MB · 18×'],
];
export function SMillion({ t }) {
  return (
    <React.Fragment>
      <Txt x={96} y={196} mono fs={17} color={PAL.ink3} a={E(t, 0.5)}>1,000,000 VALUES (1000…1000999) · GraphLayout.totalSize() · JDK 17</Txt>
      {ROWS.map(([name, at, segs, total], i) => {
        const y = 246 + i * 104;
        let x = 400;
        return (
          <React.Fragment key={name}>
            <Txt x={96} y={y + 24} mono fs={20} color={PAL.ink} a={E(t, 1 + i * 0.3)}>{name}</Txt>
            {segs.map(([mb, l, tone], j) => {
              const w = mb * MB, x0 = x; x += w;
              const a = E(t, at + 0.3 + j * 0.5, 0.6);
              return (
                <div key={j} style={{ position: 'absolute', left: x0, top: y, width: w * a, height: 76, boxSizing: 'border-box', borderRadius: 6, background: hexA(toneColor(tone), 0.22), border: `2px solid ${toneColor(tone)}`, opacity: a, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', font: `600 18px ${MONO}`, color: PAL.ink, whiteSpace: 'nowrap' }}>{w > 70 ? l : ''}</div>
              );
            })}
            <Txt x={x + 16} y={y + 24} mono fs={20} weight={600} color={i === 3 ? PAL.bad : PAL.ink2} a={E(t, at + 1.2)}>{total}</Txt>
          </React.Fragment>
        );
      })}
      <Txt x={96} y={686} mono fs={17} color={PAL.ink3} a={E(t, 30)}>ONE HashMap.Node · 32 BYTES</Txt>
      <Bytes x={96} y={718} unit={40} h={80} fs={19} sfs={17} ruler={false} a={E(t, 30)} cells={[
        { n: 8, label: 'mark word', tone: TONE.mark }, { n: 4, label: 'class', tone: TONE.klass }, { n: 4, label: 'hash', sub: 'int', tone: TONE.field },
        { n: 4, label: 'key', sub: 'ref', tone: TONE.ref }, { n: 4, label: 'value', sub: 'ref', tone: TONE.ref }, { n: 4, label: 'next', sub: 'ref', tone: TONE.ref }, { n: 4, label: 'pad', pad: true },
      ]} />
      <Ruler x0={96} y={806} unit={40} marks={[0, 8, 12, 16, 20, 24, 28, 32]} a={E(t, 30)} />
      <Callout x={1440} y={704} w={384} tone="bad" a={E(t, 37)} fs={20} text="The numbers themselves: 2M × 4 B = **8 MB** of the 72." />
    </React.Fragment>
  );
}

// ── int[] vs Integer[] ─────────────────────────────────────────────────────
export function SArrays({ t }) {
  const X = 96, U = 44, Y1 = 236, Y2 = 410;
  const objs = [[150, 640], [900, 700], [1500, 640]]; // Integer objects in the heap
  const refX = (i) => X + (16 + i * 4 + 2) * U;
  const chase = (i) => { const s = 31.5 + i * 1.6; const p = M(t, s, 1.1); if (p <= 0 || p >= 1) return null; const [ox, oy] = objs[i];
    return <Dot key={i} x={lerp(refX(i), ox + 130, p)} y={lerp(Y2 + 70, oy, p)} color={PAL.pull} r={9} />; };
  return (
    <React.Fragment>
      <Txt x={X} y={200} mono fs={18} color={PAL.ink2} a={E(t, 0.5)}>new int[]{'{'}7, 8, 9{'}'}  ·  JOL: 32 bytes</Txt>
      <Bytes x={X} y={Y1} unit={U} h={74} fs={19} sfs={17} ruler={false} a={E(t, 0.6)} cells={[
        { n: 8, label: 'mark word', tone: TONE.mark, a: E(t, 1.2) }, { n: 4, label: 'class', tone: TONE.klass, a: E(t, 1.5) }, { n: 4, label: '3', sub: 'length', tone: TONE.len, a: E(t, 1.8), glow: win(t, 6, 12) },
        { n: 4, label: '7', tone: TONE.field, a: E(t, 2.1) }, { n: 4, label: '8', tone: TONE.field, a: E(t, 2.3) }, { n: 4, label: '9', tone: TONE.field, a: E(t, 2.5) }, { n: 4, label: 'pad', pad: true, a: E(t, 2.8) },
      ]} />
      <Ruler x0={X} y={Y1 + 80} unit={U} marks={[0, 8, 12, 16, 20, 24, 28, 32]} a={E(t, 2)} />
      <Badge x={1650} y={Y1 + 37} text="1 object" tone="flow" a={E(t, 25)} fs={20} />

      <Txt x={X} y={Y2 - 36} mono fs={18} color={PAL.ink2} a={E(t, 12.5)}>new Integer[]{'{'}1000, 2000, 3000{'}'}  ·  same shape, 32 bytes</Txt>
      <Bytes x={X} y={Y2} unit={U} h={74} fs={19} sfs={17} ruler={false} a={E(t, 12.5)} cells={[
        { n: 8, label: 'mark word', tone: TONE.mark }, { n: 4, label: 'class', tone: TONE.klass }, { n: 4, label: '3', sub: 'length', tone: TONE.len },
        { n: 4, label: '→', sub: 'ref', tone: TONE.ref, glow: win(t, 18.5, 24) }, { n: 4, label: '→', sub: 'ref', tone: TONE.ref, glow: win(t, 18.5, 24) }, { n: 4, label: '→', sub: 'ref', tone: TONE.ref, glow: win(t, 18.5, 24) }, { n: 4, label: 'pad', pad: true },
      ]} />
      <Badge x={1650} y={Y2 + 37} text="1 + 3 objects" tone="bad" a={E(t, 25)} fs={20} />

      <Panel x={96} y={540} w={1728} h={250} title="heap" a={E(t, 18.5)} />
      {objs.map(([ox, oy], i) => (
        <React.Fragment key={i}>
          <Box x={ox} y={oy} w={260} h={74} label={`Integer(${(i + 1) * 1000})`} sub="16 B" tone="pull" fs={20} sfs={17} a={E(t, 19 + i * 0.5)} glow={pulse(t, [32.6 + i * 1.6], 0.9)} />
          <Arrow from={[refX(i), Y2 + 76]} to={[ox + 130, oy - 4]} draw={M(t, 19.2 + i * 0.5, 0.7)} color={PAL.pull} />
        </React.Fragment>
      ))}
      {[0, 1, 2].map(chase)}
      <Callout x={96} y={810} w={1728} tone="pull" a={win(t, 25, 37.8)} fs={21} text="`int[1000]` is **one** object. `Integer[1000]` is **1,001**: the array plus a thousand separate objects, each reached by following a pointer." />
      <Callout x={96} y={810} w={1728} tone="violet" a={E(t, 38)} fs={21} title="2D arrays too" text="`int[1000][1000]` is an array of 1,000 references to 1,000 separate row arrays: 1,001 objects, and the rows can sit anywhere." />
    </React.Fragment>
  );
}

// ── Cache lines ────────────────────────────────────────────────────────────
// Phase A (int[]): 3 lines of 16 ints. Phase B (Integer[] scattered): refs line + objects in random lines.
const LX = 230, LY = 272, CW = 52, LH = 70;
const B_OBJ = [[3, 9], [1, 2], [4, 12], [2, 6], [3, 1], [1, 11], [4, 4], [2, 13]]; // [line, cell] of each Integer
export function SCacheLines({ t }) {
  const phaseB = t >= 18.6;
  const aA = win(t, 1.2, 18.6, 0.4), aB = E(t, 19, 0.4);
  // Phase A cursor: element k at time
  const kA = Math.floor(clamp((t - 6.5) / 0.22, -1, 43));
  const lineOf = (k) => (k < 12 ? 0 : k < 28 ? 1 : 2);
  const missesA = kA < 0 ? 0 : lineOf(kA) + 1;
  // Phase B: element j accessed every 1.2 s from 19.5
  const jB = Math.floor(clamp((t - 19.5) / 1.1, -1, 7));
  const missesB = jB < 0 ? 0 : 1 + (jB + 1);
  const cellA = (line, c) => { const idx = line * 16 + c - 4; return idx; };
  return (
    <React.Fragment>
      <Panel x={96} y={196} w={1100} h={452} title={phaseB ? 'memory · Integer[] with scattered objects' : 'memory · int[] in 64-byte cache lines'} a={E(t, 0.5)} tone={phaseB ? 'bad' : 'flow'} />
      {[0, 1, 2, 3, 4].map((ln) => <Txt key={ln} x={120} y={LY + ln * LH + 14} mono fs={17} color={PAL.ink3} a={E(t, 1)}>{`line ${ln}`}</Txt>)}
      {/* phase A */}
      {aA > 0.01 && [0, 1, 2].map((ln) => Array.from({ length: 16 }).map((_, c) => {
        const idx = cellA(ln, c);
        const hdr = idx < 0;
        const read = !hdr && idx <= kA;
        const lineLoaded = kA >= 0 && (ln <= lineOf(kA) || (t > 12.5 && ln === lineOf(kA) + 1));
        const c0 = hdr ? PAL.ink3 : read ? PAL.green : lineLoaded ? PAL.flow : PAL.ink3;
        return <div key={ln + '-' + c} style={{ position: 'absolute', left: LX + c * CW, top: LY + ln * LH, width: CW - 4, height: LH - 14, boxSizing: 'border-box', borderRadius: 5, opacity: aA, border: `2px solid ${hexA(c0, 0.8)}`, background: hexA(c0, read ? 0.25 : 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 17px ${MONO}`, color: hdr ? PAL.ink3 : PAL.ink }}>{hdr ? 'h' : idx}</div>;
      }))}
      {aA > 0.01 && t > 12.5 && <Badge x={LX + 16 * CW + 66} y={LY + 2 * LH + 28} text="prefetched" tone="flow" a={aA * E(t, 12.5)} fs={17} />}
      {/* phase B */}
      {aB > 0.01 && Array.from({ length: 16 }).map((_, c) => {
        const isRef = c >= 4 && c < 12;
        const j = c - 4;
        const read = isRef && j <= jB;
        const c0 = !isRef ? PAL.ink3 : read ? PAL.green : PAL.pull;
        return <div key={'r' + c} style={{ position: 'absolute', left: LX + c * CW, top: LY, width: CW - 4, height: LH - 14, boxSizing: 'border-box', borderRadius: 5, opacity: aB, border: `2px solid ${hexA(c0, 0.8)}`, background: hexA(c0, read ? 0.22 : 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 17px ${MONO}`, color: isRef ? PAL.ink : PAL.ink3 }}>{c < 4 ? 'h' : isRef ? '→' : '·'}</div>;
      })}
      {aB > 0.01 && [1, 2, 3, 4].map((ln) => Array.from({ length: 16 }).map((_, c) => {
        const k = B_OBJ.findIndex(([l, cc]) => l === ln && c >= cc && c < cc + 1);
        const hit = k >= 0 && k <= jB;
        const c0 = k >= 0 ? (hit ? PAL.bad : PAL.pull) : PAL.ink3;
        return <div key={ln + 'b' + c} style={{ position: 'absolute', left: LX + c * CW, top: LY + ln * LH, width: CW - 4, height: LH - 14, boxSizing: 'border-box', borderRadius: 5, opacity: aB * (k >= 0 ? 1 : 0.5), border: `2px solid ${hexA(c0, k >= 0 ? 0.9 : 0.3)}`, background: hexA(c0, hit ? 0.3 : 0.05), display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 17px ${MONO}`, color: k >= 0 ? PAL.ink : PAL.ink3 }}>{k >= 0 ? 'I' : ''}</div>;
      }))}
      {aB > 0.01 && jB >= 0 && (() => { const [l, c] = B_OBJ[jB]; const p = M(t, 19.5 + jB * 1.1, 0.5);
        return <Arrow from={[LX + (4 + jB) * CW + 25, LY + 56]} to={[lerp(LX + (4 + jB) * CW + 25, LX + c * CW + 25, p), lerp(LY + 56, LY + l * LH, p)]} color={PAL.bad} width={2.5} a={aB} />; })()}
      <Txt x={LX} y={LY + 5 * LH - 4} mono fs={17} color={PAL.ink3} a={E(t, 1.5)}>{phaseB ? 'I = an Integer object · → = a reference in the array' : 'h = array header · each cell = one 4-byte int'}</Txt>

      <Panel x={1240} y={196} w={584} h={452} title="CPU view" a={E(t, 3)}>
        <div style={{ padding: '18px 24px', font: `400 20px ${SANS}`, color: PAL.ink2, lineHeight: 1.5 }}>
          <div>one cache line = <b style={{ color: PAL.ink }}>64 bytes</b> = 16 ints</div>
          <div style={{ marginTop: 18, font: `600 22px ${MONO}`, color: phaseB ? PAL.bad : PAL.flow }}>{phaseB ? `elements read: ${Math.max(0, jB + 1)}` : `elements read: ${Math.max(0, Math.min(kA + 1, 44))}`}</div>
          <div style={{ font: `600 22px ${MONO}`, color: PAL.bad }}>lines fetched: {phaseB ? missesB : Math.min(3, missesA)}</div>
          <div style={{ marginTop: 18, opacity: E(t, 26) }}>cache hit ≈ <b style={{ color: PAL.green }}>1 ns</b></div>
          <div style={{ opacity: E(t, 26.4) }}>miss to DRAM ≈ <b style={{ color: PAL.bad }}>~100 ns</b></div>
          <div style={{ opacity: E(t, 27), marginTop: 8, fontSize: 18, color: PAL.ink3 }}>(order of magnitude; varies by CPU)</div>
        </div>
      </Panel>

      <Txt x={96} y={672} mono fs={17} color={PAL.ink3} a={E(t, 33)}>SUM OF 10M VALUES · JDK 17 · THIS MACHINE · AFTER WARM-UP (ONE OF 3 SIMILAR RUNS)</Txt>
      {[['int[]', 6.5, 'flow', 33.2], ['Integer[] · scattered', 49.2, 'bad', 34.2], ['Integer[] · allocation order', 6.7, 'pull', 41]].map(([l, ms, tone, at], i) => (
        <React.Fragment key={l}>
          <Txt x={96} y={712 + i * 56} mono fs={19} color={PAL.ink} a={E(t, at)}>{l}</Txt>
          <div style={{ position: 'absolute', left: 520, top: 706 + i * 56, width: ms * 22 * E(t, at, 0.9), height: 38, borderRadius: 6, background: hexA(toneColor(tone), 0.28), border: `2px solid ${toneColor(tone)}`, boxSizing: 'border-box', opacity: E(t, at) }}></div>
          <Txt x={520 + ms * 22 + 16} y={712 + i * 56} mono fs={19} weight={600} color={toneColor(tone)} a={E(t, at + 0.7)}>{ms} ms</Txt>
        </React.Fragment>
      ))}
      <Badge x={980} y={842} text="7.5× slower" tone="bad" a={POP(t, 35.5) * (1 - E(t, 40.6, 0.3))} fs={22} solid />
      <Txt x={720} y={892} mono fs={17} color={PAL.pull} a={E(t, 42)}>fresh Integers sat 16 bytes apart: 0x7ff4235b8, …5c8, …5d8, …5e8</Txt>
    </React.Fragment>
  );
}
