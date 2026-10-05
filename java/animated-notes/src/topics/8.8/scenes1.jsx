// 8.8 scenes, part 1: intro, counters, tiers, PrintCompilation, the warm-up curve.
// Every log line and timing below is real JDK 17.0.17 output (Apple M1) from Shapes.java / Warm.java.
const { PAL, MOTION, lin, lerp, win, pulse, step, track, track1, hlAt, clamp, hexA, MONO, SANS, fmt,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Mark, Val, Brace, Bytes, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

export const SHAPES_SRC = [
  'interface Shape { double area(); }',
  '',
  'final class Circle implements Shape {',
  '    final double r;',
  '    public double area() { return Math.PI * r * r; }',
  '}',
  'static double total(Shape[] shapes) {',
  '    double sum = 0;',
  '    for (Shape s : shapes) sum += s.area();',
  '    return sum;',
  '}',
];

// A pill that travels along keyframes (same idea as 8.1's Tok).
export function Tok({ t, keys, text, tone = 'flow', from, until, w = 200, h = 48, fs = 20, glowAt, wKeys }) {
  if (wKeys) w = track1(t, wKeys);
  const st = from == null ? keys[0][0] : from;
  if (t < st) return null;
  const [x, y] = track(t, keys);
  let a = E(t, st, 0.25);
  if (until != null) a *= 1 - E(t, until, 0.3);
  if (a <= 0.01) return null;
  const c = toneColor(tone);
  const g = glowAt != null ? pulse(t, [glowAt], 1.0) : 0;
  return <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, boxSizing: 'border-box', borderRadius: 10, opacity: a, background: hexA(c, 0.16), border: `2px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 ${fs}px ${MONO}`, color: PAL.ink, boxShadow: g > 0.01 ? `0 0 ${26 * g}px ${hexA(c, 0.7 * g)}` : 'none', whiteSpace: 'nowrap' }}>{text}</div>;
}

export const tierTone = (d) => (d === '4' ? 'flow' : d === '3' || d === '2' ? 'pull' : 'blue');

// One -XX:+PrintCompilation line, coloured by column. Raw spacing is kept exactly as HotSpot printed it.
const PC_RE = /^(\s*\d+)(\s+)(\d+)(\s+)([%snb! ]*?)(\d)(\s+)(\S.*?)(\s+made not entrant)?$/;
export function PcLine({ s, fs = 19, dim, a = 1, glow = 0, h }) {
  const m = PC_RE.exec(s);
  const base = { font: `400 ${fs}px ${MONO}`, whiteSpace: 'pre', height: h, display: 'flex', alignItems: 'center', opacity: a };
  if (!m) return <div style={{ ...base, color: PAL.ink2 }}>{s}</div>;
  const [, tm, s1, id, s2, fl, tier, s3, meth, mne] = m;
  const tc = toneColor(tierTone(tier));
  const mc = dim ? PAL.ink3 : PAL.ink;
  return (
    <div style={{ ...base, background: glow > 0.01 ? hexA(PAL.pull, 0.14 * glow) : 'transparent', margin: '0 -20px', padding: '0 20px' }}>
      <span style={{ color: PAL.ink3 }}>{tm}{s1}</span><span style={{ color: dim ? PAL.ink3 : PAL.ink2 }}>{id}</span><span>{s2}</span>
      <span style={{ color: fl.includes('%') ? PAL.violet : PAL.ink3, fontWeight: 700 }}>{fl}</span>
      <span style={{ color: dim ? PAL.ink3 : tc, fontWeight: 700 }}>{tier}</span><span>{s3}</span>
      <span style={{ color: mc }}>{meth}</span>
      {mne && <span style={{ color: PAL.bad, fontWeight: 600 }}>{mne}</span>}
    </div>
  );
}

// ── Intro ──────────────────────────────────────────────────────────────────
export function SIntro({ t }) {
  const tiers = [['interpreter', 'tier 0', 'ink'], ['C1 + profile', 'tier 3', 'pull'], ['C2', 'tier 4', 'flow']];
  const TX = [830, 1160, 1490], TY = 480;
  const at = t < 11 ? 0 : t < 13 ? 1 : 2;
  const tokX = t < 11 ? TX[0] + 150 : t < 13 ? lerp(TX[0] + 150, TX[1] + 150, M(t, 11, 0.9)) : lerp(TX[1] + 150, TX[2] + 150, M(t, 13, 0.9));
  const bars = [[5.8, 'interpreter', 3450, 'ink', '3,450 ns'], [11.4, 'C1, profiling', 310, 'pull', '≈ 310 ns'], [13.4, 'C2', 80, 'flow', '≈ 80 ns']];
  const BX = 1000, BW = 800;
  return (
    <React.Fragment>
      <Txt x={96} y={150} mono fs={22} weight={600} color={PAL.pull} a={E(t, 0.3)} style={{ letterSpacing: '0.14em' }}>PART 08 · THE JVM · 8.8</Txt>
      <Txt x={92} y={192} fs={118} weight={700} lh={1} a={E(t, 0.6, 0.9)} style={{ letterSpacing: '-0.03em', transform: `translateY(${(1 - E(t, 0.6, 0.9)) * 24}px)` }}>JIT compilation</Txt>
      <Txt x={96} y={338} fs={36} color={PAL.ink2} a={E(t, 1.4, 0.8)}>How hot bytecode becomes machine code, and why naive benchmarks lie.</Txt>

      <Code x={96} y={460} w={680} h={398} fs={19} lh={30} title="Shapes.java · our running example" a={E(t, 1.8)} lines={SHAPES_SRC.map((s, i) => ({ s, tone: i === 8 ? 'pull' : undefined, toneA: win(t, 4, 24) }))} />
      {tiers.map(([l, s, tone], i) => (
        <Box key={l} x={TX[i]} y={TY} w={300} h={104} label={l} sub={s} tone={tone} a={E(t, [5.5, 11, 13][i])} glow={at === i && t > 5.5 ? 0.7 : 0} fs={24} />
      ))}
      <HArrow x1={1134} x2={1156} y={TY + 52} a={E(t, 11)} color={PAL.pull} />
      <HArrow x1={1464} x2={1486} y={TY + 52} a={E(t, 13)} color={PAL.flow} />
      <Tok t={t} keys={[[5.6, tokX, TY + 150]]} text="total()" tone={['ink', 'pull', 'flow'][at]} from={5.6} w={180} />
      {t >= 5.6 && <Val x={tokX} y={TY + 150} text="total()" tone={['ink', 'pull', 'flow'][at]} fs={20} h={44} o={E(t, 5.6)} />}

      <Txt x={830} y={680} mono fs={17} color={PAL.ink3} a={E(t, 5.8)}>NS PER total() CALL · 100 CIRCLES · REAL</Txt>
      {bars.map(([s, l, v, tone, txt], i) => {
        const p = E(t, s, 1.2);
        const y = 720 + i * 62;
        return (
          <React.Fragment key={l}>
            <Txt x={830} y={y + 6} mono fs={19} color={PAL.ink2} a={E(t, s)}>{l}</Txt>
            <div style={{ position: 'absolute', left: BX, top: y, width: Math.max(6, (v / 3450) * BW * p), height: 36, borderRadius: 6, background: hexA(toneColor(tone), 0.5), border: `2px solid ${toneColor(tone)}`, opacity: E(t, s) }}></div>
            <Txt x={BX + Math.max(6, (v / 3450) * BW * p) + 14} y={y + 5} mono fs={20} weight={600} color={toneColor(tone)} a={E(t, s + 0.6)}>{txt}</Txt>
          </React.Fragment>
        );
      })}
      <Badge x={1412} y={918} text="same bytecode · JDK 17 · Apple M1" tone="pull" a={E(t, 17)} fs={17} />
    </React.Fragment>
  );
}

// ── Two counters ───────────────────────────────────────────────────────────
// i and b over time; frozen at the real queue moment (count=103, backedge_count=10240).
function countersAt(t) {
  let i, p;
  if (t < 5) return [0, 0];
  if (t < 17) { const k = (t - 5) / 2.4; i = Math.floor(k) + 1; p = Math.floor((k % 1) * 100); }
  else if (t < 31) { const f = (t - 17) / 14; const x = 5 + f * f * (102.4 - 5); i = Math.floor(x) + 1; p = Math.floor((x % 1) * 100); }
  else if (t < 38) return [103, 10240];
  else { const x = 102.4 + (t - 38) * 4.2; i = Math.floor(x) + 1; p = Math.floor((x % 1) * 100); }
  return [i, (i - 1) * 100 + p];
}
export function SCounters({ t }) {
  const [ic, bc] = countersAt(t);
  const loopP = t >= 10.5 && t < 17 ? ((t - 10.5) * 1.6) % 1 : -1;
  const [hl, hA] = hlAt(t, [[5, 0], [10.5, 2]]);
  const RX = 940;
  const ruleRows = [
    ['i > 200', 'Tier3InvocationThreshold', 0],
    ['i > 100  &&  i + b > 2,000', 'Tier3MinInvocation / CompileThreshold', 1],
    ['b > 60,000   → OSR', 'Tier3BackEdgeThreshold', 2],
  ];
  const r2 = [['i > 5,000', 'Tier4InvocationThreshold'], ['i > 600  &&  i + b > 15,000', 'Tier4Min… / Tier4CompileThreshold'], ['b > 40,000   → OSR', 'Tier4BackEdgeThreshold']];
  const ok = t >= 31;
  const compiled = t >= 42;
  return (
    <React.Fragment>
      <Code x={96} y={196} w={780} h={272} fs={20} lh={34} title="Shapes.total · interpreted" a={E(t, 0.4)} hl={hl} hlA={hA * win(t, 5, 31)}
        lines={['static double total(Shape[] shapes) {', '    double sum = 0;', '    for (Shape s : shapes)', '        sum += s.area();', '    return sum;', '}']} />
      <Badge x={762} y={274} text="call → i++" tone="pull" a={E(t, 5)} fs={17} />
      <Arrow pts={[[560, 365], [700, 365], [700, 343], [600, 343]]} draw={M(t, 10.5, 0.6)} color={PAL.flow} width={2.5} />
      <Badge x={790} y={354} text="jump back → b++" tone="flow" a={E(t, 10.8)} fs={17} />
      {loopP >= 0 && <Dot x={loopP < 0.5 ? lerp(560, 700, loopP * 2) : lerp(700, 600, (loopP - 0.5) * 2)} y={loopP < 0.5 ? 365 : 343} r={7} color={PAL.flow} />}

      <Panel x={96} y={500} w={780} h={300} title="counters · Shapes::total" right={compiled ? 'running tier 3 code' : 'running interpreted'} tone={compiled ? 'pull' : undefined} a={E(t, 2)} />
      <Txt x={130} y={570} mono fs={18} color={PAL.ink3} a={E(t, 2.4)}>INVOCATIONS  i</Txt>
      <Txt x={130} y={600} mono fs={64} weight={700} color={ok ? PAL.pull : PAL.ink} a={E(t, 2.4)}>{ic.toLocaleString('en-US')}</Txt>
      <Txt x={500} y={570} mono fs={18} color={PAL.ink3} a={E(t, 2.4)}>BACK-EDGES  b</Txt>
      <Txt x={500} y={600} mono fs={64} weight={700} color={ok ? PAL.flow : PAL.ink} a={E(t, 2.4)}>{bc.toLocaleString('en-US')}</Txt>
      <Txt x={130} y={710} mono fs={18} color={PAL.ink2} w={720} a={E(t, 17)}>the interpreter asks the policy every <span style={{ color: PAL.pull }}>128</span> calls (2^7) or <span style={{ color: PAL.flow }}>1,024</span> back-edges (2^10)</Txt>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => <div key={k} style={{ position: 'absolute', left: 130 + k * 88, top: 762, width: 70, height: 10, borderRadius: 5, background: pulse(t, [17.4 + k * 0.5], 0.5) > 0.05 ? PAL.pull : PAL.line2, opacity: E(t, 17) }}></div>)}

      <Panel x={RX} y={196} w={884} h={420} title="compile policy · real JDK 17 defaults" tone="violet" a={E(t, 23.5)}>
        <div style={{ padding: '14px 22px' }}>
          <div style={{ font: `600 17px ${MONO}`, color: PAL.pull, letterSpacing: '0.08em', marginBottom: 8 }}>TIER 0 → 3   (C1 + profiling)</div>
          {ruleRows.map(([r, f, k]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 44, padding: '0 10px', borderRadius: 8, background: k === 1 && t > 24 ? hexA(PAL.pull, 0.14 * win(t, 24, 58)) : 'transparent' }}>
              <span style={{ font: `600 21px ${MONO}`, color: PAL.ink }}>{r}</span><span style={{ font: `400 17px ${MONO}`, color: PAL.ink3 }}>{f}</span>
            </div>
          ))}
          <div style={{ font: `600 17px ${MONO}`, color: PAL.flow, letterSpacing: '0.08em', margin: '18px 0 8px', opacity: E(t, 51.5) }}>TIER 3 → 4   (C2)</div>
          {r2.map(([r, f], k) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 40, padding: '0 10px', opacity: E(t, 51.8 + k * 0.3) }}>
              <span style={{ font: `600 20px ${MONO}`, color: PAL.ink }}>{r}</span><span style={{ font: `400 17px ${MONO}`, color: PAL.ink3 }}>{f}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Mark x={1790} y={316} ok a={POP(t, 31.4)} />

      <Panel x={RX} y={640} w={884} h={150} title="-XX:+LogCompilation · task_queued (real)" a={E(t, 31)}>
        <div style={{ padding: '12px 20px', font: `400 17px ${MONO}`, color: PAL.ink2, lineHeight: 1.75 }}>
          <div style={{ opacity: E(t, 31.2) }}>method='Shapes total' <span style={{ color: PAL.pull }}>count='103'</span> <span style={{ color: PAL.flow }}>backedge_count='10240'</span> level='3'</div>
          <div style={{ opacity: E(t, 45) }}>method='Circle area'   <span style={{ color: PAL.pull }}>count='256'</span> level='3'</div>
        </div>
      </Panel>
      <Box x={RX} y={814} w={260} h={80} label="compile queue" fs={19} tone="violet" a={E(t, 38)} />
      <HArrow x1={RX + 264} x2={RX + 330} y={854} a={E(t, 38.5)} color={PAL.violet} />
      <Box x={RX + 334} y={814} w={300} h={80} label="C1 compiler thread" sub={compiled ? 'done · code installed' : 'compiling…'} fs={19} sfs={17} tone="pull" a={E(t, 38.6)} glow={t > 38.6 && t < 42 ? 0.4 + 0.4 * Math.sin(t * 6) : pulse(t, [42], 1)} />
      <Tok t={t} keys={[[38, 300, 650], [39.2, RX + 130, 854], [40.4, RX + 484, 854]]} text="total" tone="pull" until={41.6} w={110} h={40} fs={17} />
      <Txt x={RX + 660} y={826} fs={18} color={PAL.ink2} w={224} a={E(t, 39.5)}>meanwhile `total` keeps running interpreted</Txt>
    </React.Fragment>
  );
}

// ── Five tiers ─────────────────────────────────────────────────────────────
export function STiers({ t }) {
  const BW = 290, G = 64, BY = 262, BH = 116;
  const bx = (i) => 96 + i * (BW + G);
  const cx = (i) => bx(i) + BW / 2;
  const T = [['interpreter', 'tier 0', 'ink'], ['C1', 'tier 1 · no profile', 'blue'], ['C1', 'tier 2 · light profile', 'pull'], ['C1', 'tier 3 · full profile', 'pull'], ['C2', 'tier 4 · optimised', 'flow']];
  const main = win(t, 12, 60);
  const bars = [['tier 3 (C1 + profile)', 310, 'pull', '≈ 310 ns', 34.5], ['tier 1 (C1, no profile)', 122, 'blue', '122 ns', 35.3], ['tier 4 (C2)', 80, 'flow', '≈ 80 ns', 36.1]];
  return (
    <React.Fragment>
      {T.map(([l, s, tone], i) => (
        <Box key={i} x={bx(i)} y={BY} w={BW} h={BH} label={l} sub={s} tone={tone} fs={30} sfs={17} a={E(t, 5 + i * 0.35)}
          glow={(i === 0 || i === 3 || i === 4) ? win(t, 12, 19) * 0.8 : (i === 1 ? win(t, 47, 53) : i === 2 ? win(t, 53, 60) : 0)} />
      ))}
      {/* usual path: 0 → 3 below, 3 → 4 in the gap */}
      <Arrow pts={[[cx(0), BY + BH + 4], [cx(0), BY + BH + 60], [cx(3), BY + BH + 60], [cx(3), BY + BH + 8]]} draw={M(t, 12.2, 1)} color={PAL.flow} width={4} a={main} />
      <Txt x={(cx(0) + cx(3)) / 2} y={BY + BH + 70} anchor="mid" mono fs={18} color={PAL.flow} a={E(t, 13)}>the usual path: 0 → 3 → 4</Txt>
      <HArrow x1={bx(3) + BW + 4} x2={bx(4) - 4} y={BY + BH / 2} a={E(t, 13.2)} color={PAL.flow} />
      {/* trivial: 0 → 1 */}
      <HArrow x1={bx(0) + BW + 4} x2={bx(1) - 4} y={BY + BH / 2} a={E(t, 47)} color={PAL.blue} />
      <Txt x={cx(1)} y={BY - 36} anchor="mid" mono fs={17} color={PAL.blue} a={E(t, 47.3)}>trivial methods stop here</Txt>
      {/* C2 busy: 0 → 2 → 3 above */}
      <Arrow pts={[[cx(0), BY - 4], [cx(0), BY - 46], [cx(2) - 40, BY - 46], [cx(2) - 40, BY - 6]]} draw={M(t, 53, 0.9)} color={PAL.pull} dashed width={2.5} />
      <HArrow x1={bx(2) + BW + 4} x2={bx(3) - 4} y={BY + BH / 2} a={E(t, 53.8)} color={PAL.pull} />
      <Txt x={cx(2) + 60} y={BY - 36} anchor="mid" mono fs={17} color={PAL.pull} a={E(t, 53.4)}>C2 queue busy</Txt>

      <Panel x={96} y={520} w={880} h={330} title="MethodData · Shapes::total" right="filled by tier 3 code" tone="pull" a={E(t, 19)}>
        <div style={{ padding: '10px 22px' }}>
          {[
            ['counters', 'calls · back-edges', PAL.ink, 19.5],
            ['bci 15  if_icmpge', 'branch taken / not taken', PAL.ink, 20.3],
            ['bci 27  invokeinterface area', 'receiver types seen:', PAL.ink, 21.1],
          ].map(([k, v, c, at]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', height: 48, alignItems: 'center', borderBottom: `1px solid ${PAL.line}`, opacity: E(t, at), font: `400 19px ${MONO}` }}>
              <span style={{ color: PAL.violet }}>{k}</span><span style={{ color: c }}>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 14, marginTop: 14, opacity: E(t, 22) }}>
            <div style={{ flex: 1, height: 56, borderRadius: 10, border: `2px solid ${PAL.flow}`, background: hexA(PAL.flow, 0.12 + 0.2 * win(t, 27, 34)), display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', font: `600 21px ${MONO}`, color: PAL.ink }}><span>Circle</span><span style={{ color: PAL.flow }}>{t > 27 ? '163,956' : '…'}</span></div>
            <div style={{ flex: 1, height: 56, borderRadius: 10, border: `2px dashed ${PAL.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `400 19px ${MONO}`, color: PAL.ink3 }}>row 2 · empty</div>
          </div>
          <div style={{ marginTop: 14, font: `400 17px ${MONO}`, color: PAL.ink2, opacity: E(t, 27.5) }}>PrintInlining: <span style={{ color: PAL.flow }}>TypeProfile (163956/163956 counts) = Circle</span></div>
        </div>
      </Panel>

      <Panel x={1010} y={520} w={814} h={330} title="ns per total() · real · steady state" a={E(t, 34)}>
        <div style={{ padding: '14px 22px', font: `400 17px ${MONO}`, color: PAL.ink3 }}>interpreter: 3,450 ns (off this scale)</div>
      </Panel>
      {bars.map(([l, v, tone, txt, at], i) => {
        const y = 630 + i * 70, w = (v / 330) * 420 * E(t, at, 1);
        return (
          <React.Fragment key={l}>
            <Txt x={1036} y={y + 6} mono fs={17} color={PAL.ink2} a={E(t, at)}>{l}</Txt>
            <div style={{ position: 'absolute', left: 1300, top: y, width: Math.max(4, w), height: 34, borderRadius: 6, background: hexA(toneColor(tone), 0.5), border: `2px solid ${toneColor(tone)}`, opacity: E(t, at) }}></div>
            <Txt x={1300 + w + 12} y={y + 4} mono fs={19} weight={600} color={toneColor(tone)} a={E(t, at + 0.6)}>{txt}</Txt>
          </React.Fragment>
        );
      })}
      <Badge x={1417} y={880} text="profiling costs: tier 3 is a short stop on the way to C2" tone="pull" a={E(t, 41)} fs={17} />
    </React.Fragment>
  );
}

// ── PrintCompilation ───────────────────────────────────────────────────────
const PC_LINES = [
  ['33    1       3       java.lang.Object::<init> (1 bytes)', true, 6],
  ['37    2       3       java.lang.String::hashCode (60 bytes)', true, 6.4],
  ['40    4       3       java.lang.String::length (11 bytes)', true, 6.8],
  ['40    5     n 0       jdk.internal.misc.Unsafe::getReferenceVolatile (native)', true, 7.2],
  ['42   10       3       Circle::area (14 bytes)', false, 18],
  ['42   11       4       Circle::area (14 bytes)', false, 20.5],
  ['42   12       3       Shapes::total (42 bytes)', false, 23],
  ['42   10       3       Circle::area (14 bytes)   made not entrant', false, 25],
  ['43   13 %     4       Shapes::total @ 11 (42 bytes)', false, 32],
  ['47   14       4       Shapes::total (42 bytes)', false, 39],
  ['52   12       3       Shapes::total (42 bytes)   made not entrant', false, 41],
];
export function SPrintComp({ t }) {
  const LH = 38, FS = 19, PX = 96, PY = 196, CW = FS * 0.6;
  const rowY = (i) => PY + 44 + 12 + LH + i * LH;
  const focus = (() => { let f = -1; PC_LINES.forEach(([, , at], i) => { if (t >= at && at >= 18) f = i; }); return f; })();
  // column bands (char offsets in the raw line)
  const band = (c0, c1, a, tone) => a > 0.01 && <div style={{ position: 'absolute', left: PX + 20 + c0 * CW - 4, top: PY + 44 + 8, width: (c1 - c0) * CW + 8, height: LH * (PC_LINES.length + 1) + 6, borderRadius: 8, background: hexA(toneColor(tone), 0.12 * a), border: `1.5px solid ${hexA(toneColor(tone), 0.6 * a)}` }}></div>;
  const lane = (y, name, chips) => (
    <React.Fragment>
      <Txt x={1250} y={y} mono fs={19} weight={600} color={PAL.ink} a={E(t, 18)}>{name}</Txt>
      {chips.map(([lbl, tone, at, dead, x, w], k) => (
        <React.Fragment key={k}>
          <Box x={x} y={y + 36} w={w} h={66} label={lbl} tone={dead && t >= dead ? 'dim' : tone} fs={18} a={E(t, at)} strike={dead && t >= dead} dashed={dead && t >= dead} glow={pulse(t, [at], 1)} />
        </React.Fragment>
      ))}
    </React.Fragment>
  );
  return (
    <React.Fragment>
      <Panel x={PX} y={PY} w={1110} h={44 + 24 + LH * (PC_LINES.length + 1)} title="terminal · JDK 17.0.17" a={E(t, 0.4)}>
        <div style={{ padding: '12px 20px' }}>
          <div style={{ height: LH, display: 'flex', alignItems: 'center', font: `500 ${FS}px ${MONO}`, color: PAL.ink, opacity: E(t, 0.8) }}><span style={{ color: PAL.ink3, marginRight: 10 }}>$</span>java -XX:+PrintCompilation Shapes</div>
          {PC_LINES.map(([s, dim, at], i) => <PcLine key={i} s={s} dim={dim} fs={FS} h={LH} a={E(t, at, 0.3)} glow={i === focus ? 1 : 0} />)}
        </div>
      </Panel>
      {band(0, 2, win(t, 12, 15.2), 'ink')}
      {band(4, 7, win(t, 15, 18), 'violet')}
      {band(14, 15, win(t, 18, 24.6), 'pull')}
      {band(8, 9, win(t, 32, 38.6), 'violet')}
      {band(22, 50, win(t, 46, 52.6), 'flow')}
      <Badge x={PX + 20 + 1 * CW} y={PY + 30} text="ms" tone="ink" a={win(t, 12, 15.2)} fs={17} />
      <Badge x={PX + 20 + 5.5 * CW} y={PY + 30} text="compile id" tone="violet" a={win(t, 15, 18)} fs={17} />
      <Badge x={PX + 20 + 14.5 * CW} y={PY + 30} text="tier" tone="pull" a={win(t, 18, 24.6)} fs={17} />
      <Badge x={PX + 20 + 8.5 * CW} y={PY + 30} text="% = OSR" tone="violet" a={win(t, 32, 38.6)} fs={17} />
      <Badge x={PX + 20 + 36 * CW} y={PY + 30} text="bytecode size" tone="flow" a={win(t, 46, 52.6)} fs={17} />

      <Panel x={1236} y={196} w={588} h={494} title="what happened" a={E(t, 17.5)} />
      {lane(262, 'Circle::area', [['T3 #10', 'pull', 18, 25, 1250, 170], ['T4 #11', 'flow', 20.5, 0, 1440, 170]])}
      <HArrow x1={1422} x2={1438} y={331} a={E(t, 20.5)} color={PAL.flow} />
      {lane(430, 'Shapes::total', [['T3 #12', 'pull', 23, 41, 1250, 170], ['T4 % #13', 'flow', 32, 0, 1440, 170], ['T4 #14', 'flow', 39, 0, 1630, 170]])}
      <HArrow x1={1422} x2={1438} y={499} a={E(t, 32)} color={PAL.flow} />
      <HArrow x1={1612} x2={1628} y={499} a={E(t, 39)} color={PAL.flow} />
      <Txt x={1250} y={590} fs={18} color={PAL.ink2} w={560} a={E(t, 25.5)}>struck out = `made not entrant`: existing frames may finish, but no new call can enter</Txt>
      <Txt x={1440 + 85} y={548} anchor="mid" mono fs={17} color={PAL.violet} a={E(t, 33)}>entered at bci 11</Txt>

      <Callout x={96} y={744} w={1110} tone="violet" a={win(t, 32, 45.6)} fs={20} title="% · on-stack replacement" text="`@ 11` is the bytecode index of the loop header. This version can be jumped into **while the loop is running**." />
      <Callout x={96} y={744} w={1110} tone="flow" a={win(t, 46, 52.6)} fs={20} title="(14 bytes)" text="Bytecode size, not machine code. C2's inlining limits are measured in these bytes." />
      <Callout x={96} y={744} w={1110} tone="pull" a={E(t, 53)} fs={20} title="flags column" text="`%` OSR  ·  `s` synchronized  ·  `!` has exception handlers  ·  `b` blocking  ·  `n` native wrapper" />
    </React.Fragment>
  );
}

// ── The warm-up curve (real data) ──────────────────────────────────────────
export const WARM = [1256.7, 313.3, 303.8, 303.9, 303.9, 305.4, 305.2, 306.1, 305.5, 304.4, 306.2, 305.0, 306.9, 342.8, 349.9, 344.7, 342.9, 347.0, 341.5, 353.3,
  339.5, 348.8, 348.3, 266.2, 79.8, 79.5, 79.8, 79.0, 79.4, 78.8, 79.8, 78.6, 79.7, 78.7, 79.5, 78.9, 79.7, 79.8, 80.1, 79.1];
export function SWarmCurve({ t }) {
  const X0 = 200, X1 = 1220, Y0 = 790, YT = 290, MAX = 1300;
  const px = (i) => lerp(X0, X1, i / (WARM.length - 1));
  const py = (v) => lerp(Y0, YT, Math.min(v, MAX) / MAX);
  const shown = Math.floor(clamp((t - 4) / 16, 0, 1) * WARM.length);
  const pts = WARM.slice(0, shown).map((v, i) => [px(i), py(v)]);
  const rows = [['-Xint', 'interpreter only', '3,450', 'ink', 25], ['default', 'tiered: C1 then C2', '≈ 80', 'flow', 26], ['-XX:TieredStopAtLevel=1', 'C1 only', '122', 'blue', 31], ['-XX:-TieredCompilation', 'C2 only, after 4 slow batches', '73', 'green', 32.5]];
  return (
    <React.Fragment>
      <Panel x={96} y={196} w={1180} h={680} title="ns per total() · one dot per batch of 500 calls" right="JDK 17 · M1 · real" a={E(t, 0.4)} />
      <svg width="1920" height="1080" style={{ position: 'absolute', left: 0, top: 0, opacity: E(t, 1) }}>
        {[0, 400, 800, 1200].map((v) => <line key={v} x1={X0} x2={X1} y1={py(v)} y2={py(v)} stroke={PAL.line} strokeWidth="1.5" />)}
        <line x1={X0} x2={X1} y1={py(122)} y2={py(122)} stroke={PAL.blue} strokeWidth="2" strokeDasharray="8 7" opacity={E(t, 31)} />
        {pts.length > 1 && <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={PAL.flow} strokeWidth="3" strokeLinejoin="round" />}
        {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={6} fill={i === 0 ? PAL.ink2 : WARM[i] > 200 ? PAL.pull : PAL.flow} />)}
      </svg>
      {[0, 400, 800, 1200].map((v) => <Txt key={v} x={X0 - 16} y={py(v) - 12} anchor="right" mono fs={17} color={PAL.ink3} a={E(t, 1)}>{v}</Txt>)}
      {[1, 10, 20, 30, 40].map((b) => <Txt key={b} x={px(b - 1)} y={Y0 + 14} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 1)}>{b}</Txt>)}
      <Txt x={(X0 + X1) / 2} y={Y0 + 44} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 1)}>batch →</Txt>

      <Txt x={px(0) + 22} y={py(1256.7) - 10} mono fs={18} color={PAL.ink2} a={E(t, 6)}>batch 1: 1,257 ns · interpreter, then C1</Txt>
      <Brace x={px(1)} y={py(360) - 30} w={px(22) - px(1)} above label="tier 3 plateau ≈ 305–350 ns: collecting a profile" tone="pull" a={E(t, 12)} fs={17} />
      <Txt x={px(24) + 10} y={py(80) - 44} mono fs={18} color={PAL.flow} a={E(t, 18.5)}>batch 25: C2 installed → 80 ns</Txt>
      <Txt x={X1 - 4} y={py(122) - 30} anchor="right" mono fs={17} color={PAL.blue} a={E(t, 31)}>C1 only: 122</Txt>
      <Badge x={X1 - 120} y={YT - 40} text="↑ -Xint: 3,450 ns, every batch" tone="ink" a={E(t, 25)} fs={17} />

      <Panel x={1310} y={196} w={514} h={680} title="same loop, other modes" a={E(t, 24.5)}>
        <div style={{ padding: '6px 20px' }}>
          {rows.map(([flag, what, v, tone, at]) => (
            <div key={flag} style={{ padding: '14px 0', borderBottom: `1px solid ${PAL.line}`, opacity: E(t, at) }}>
              <div style={{ font: `600 18px ${MONO}`, color: toneColor(tone) }}>{flag}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
                <span style={{ font: `400 18px ${SANS}`, color: PAL.ink2 }}>{what}</span>
                <span style={{ font: `700 30px ${MONO}`, color: PAL.ink }}>{v}<span style={{ font: `400 17px ${MONO}`, color: PAL.ink3 }}> ns</span></span>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 16, font: `400 17px ${MONO}`, color: PAL.ink3, lineHeight: 1.5, opacity: E(t, 33) }}>C2 only, first batches:<br /><span style={{ color: PAL.green }}>2,643 → 1,995 → 2,181 → 1,882 → 492 → 74</span></div>
        </div>
      </Panel>
      <Callout x={96} y={892} w={1728} tone="pull" a={win(t, 38, 43.2)} fs={20} text="Tiered compilation: C1's quick start, then C2's peak speed. That is why a Java service warms up." />
      <Callout x={96} y={892} w={1728} tone="bad" a={E(t, 43.4)} fs={20} text="A benchmark that stops at batch 10 measured tier 3 code, about **4× slower** than what production runs." />
    </React.Fragment>
  );
}
