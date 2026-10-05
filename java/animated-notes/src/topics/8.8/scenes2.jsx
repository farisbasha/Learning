// 8.8 scenes, part 2: OSR, inlining, inlining limits, escape analysis.
// All PrintCompilation / PrintInlining lines and timings are real JDK 17.0.17 output (Apple M1).
const { PAL, MOTION, lin, lerp, win, pulse, step, track, track1, hlAt, clamp, hexA, MONO, SANS, fmt,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Mark, Val, Brace, Bytes, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;
import { Tok, PcLine } from './scenes1.jsx';

// A terminal-like panel whose rows can be PrintCompilation lines, commands or plain text.
export function Term({ x, y, w, title = 'terminal · JDK 17.0.17', rows, t, a = 1, fs = 18, lh = 34, right }) {
  if (a <= 0.005) return null;
  const h = 44 + 24 + rows.length * lh;
  return (
    <Panel x={x} y={y} w={w} h={h} title={title} right={right} a={a}>
      <div style={{ padding: '12px 20px' }}>
        {rows.map((r, i) => {
          const o = r.at == null ? 1 : E(t, r.at, 0.3);
          if (r.pc) return <PcLine key={i} s={r.pc} fs={fs} h={lh} a={o} glow={r.glow || 0} dim={r.dim} />;
          const c = r.kind === 'cmd' ? PAL.ink : r.kind === 'dim' ? PAL.ink3 : r.kind === 'ok' ? PAL.flow : r.kind === 'bad' ? PAL.bad : r.kind === 'pull' ? PAL.pull : PAL.ink2;
          return (
            <div key={i} style={{ height: lh, display: 'flex', alignItems: 'center', whiteSpace: 'pre', font: `${r.kind === 'cmd' ? 500 : 400} ${fs}px ${MONO}`, color: c, opacity: o, background: r.glow ? hexA(PAL.pull, 0.14 * r.glow) : 'transparent', margin: '0 -20px', padding: '0 20px' }}>
              {r.kind === 'cmd' && <span style={{ color: PAL.ink3, marginRight: 10 }}>$</span>}{r.parts ? r.parts.map(([s, col], k) => <span key={k} style={{ color: col || c }}>{s}</span>) : r.text}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// ── OSR ────────────────────────────────────────────────────────────────────
export function SOsr({ t }) {
  const b = t < 6 ? 0 : t < 13 ? Math.floor(lin(t, 6, 7) * 60000) : Math.min(60412, 60000 + Math.floor((t - 13) * 60));
  const [hl, hA] = hlAt(t, [[6, 2], [13, 2]]);
  const mig = win(t, 13.5, 32.6);
  const SL = [['0', 'n', '1,000,000'], ['1–2', 'sum', 'double'], ['3', 'i', t < 20 ? '60,4…' : '60,412']];
  const FX = 96, FY = 540, CX = 1110;
  return (
    <React.Fragment>
      <Code x={96} y={196} w={780} h={306} fs={20} lh={34} title="Osr.java" a={E(t, 0.4)} hl={hl} hlA={hA * win(t, 6, 33)}
        lines={['static double sumAreas(int n) {', '    double sum = 0;', '    for (int i = 0; i < n; i++)    // bci 4: loop header', '        sum += Math.PI * i * i;', '    return sum;', '}', { s: '// main calls sumAreas(n) exactly once', tone: 'pull', toneA: E(t, 6) }]} />
      <Panel x={920} y={196} w={904} h={306} title="counters · Osr::sumAreas" a={E(t, 5.5)} />
      <Txt x={950} y={262} mono fs={18} color={PAL.ink3} a={E(t, 6)}>INVOCATIONS  i</Txt>
      <Txt x={950} y={290} mono fs={60} weight={700} color={PAL.ink} a={E(t, 6)}>1</Txt>
      <Txt x={1300} y={262} mono fs={18} color={PAL.ink3} a={E(t, 6)}>BACK-EDGES  b</Txt>
      <Txt x={1300} y={290} mono fs={60} weight={700} color={b >= 60000 ? PAL.pull : PAL.ink} a={E(t, 6)}>{b.toLocaleString('en-US')}</Txt>
      <div style={{ position: 'absolute', left: 950, top: 400, width: 840, height: 22, borderRadius: 11, background: PAL.panel2, border: `1.5px solid ${PAL.line2}`, opacity: E(t, 6) }}>
        <div style={{ width: `${Math.min(1, b / 70000) * 100}%`, height: '100%', borderRadius: 11, background: b >= 60000 ? PAL.pull : PAL.flow }}></div>
      </div>
      <div style={{ position: 'absolute', left: 950 + (60000 / 70000) * 840, top: 390, width: 3, height: 42, background: PAL.pull, opacity: E(t, 6) }}></div>
      <Txt x={950 + (60000 / 70000) * 840} y={442} anchor="mid" mono fs={17} color={PAL.pull} a={E(t, 6.5)}>60,000 · Tier3BackEdgeThreshold</Txt>

      {/* frame migration */}
      <Panel x={FX} y={FY} w={600} h={300} title="interpreter frame" tone="ink" a={mig} />
      {SL.map(([s, n, v], k) => (
        <React.Fragment key={k}>
          <Txt x={FX + 30} y={FY + 76 + k * 70} mono fs={17} color={PAL.ink3} a={mig}>{'slot ' + s}</Txt>
          <Box x={FX + 170} y={FY + 62 + k * 70} w={400} h={54} label={n + ' = ' + v} fs={20} tone="ink" a={mig} glow={pulse(t, [20.5 + k * 0.6], 1)} />
        </React.Fragment>
      ))}
      <Box x={760} y={FY + 110} w={290} h={80} label="OSR migration" sub="locals copied out" tone="violet" a={mig * E(t, 20)} fs={20} sfs={17} />
      <HArrow x1={700} x2={756} y={FY + 150} a={mig * E(t, 20)} color={PAL.violet} />
      <HArrow x1={1054} x2={CX - 6} y={FY + 150} a={mig * E(t, 20.5)} color={PAL.violet} />
      {SL.map(([, n], k) => <Tok key={k} t={t} keys={[[20.5 + k * 0.6, FX + 370, FY + 89 + k * 70], [21.9 + k * 0.6, CX + 357, FY + 89 + k * 70]]} text={n} tone="violet" w={120} h={40} fs={18} until={32} />)}
      <Panel x={CX} y={FY} w={714} h={300} title="OSR nmethod · tier 3 · entry at bci 4" tone="pull" a={mig * E(t, 13.5)} glow={pulse(t, [27], 1.4)} />
      <Txt x={CX + 30} y={FY + 76} fs={19} color={PAL.ink2} w={240} a={mig * E(t, 14)}>machine code for the loop, enterable mid-loop</Txt>
      <Badge x={CX + 560} y={FY + 250} text="loop continues at i = 60,412" tone="flow" a={mig * E(t, 27)} fs={17} />

      {/* real runs */}
      <Term x={96} y={530} w={1150} t={t} a={E(t, 33)} title="terminal · JDK 17.0.17" right="abridged" fs={18} lh={36} rows={[
        { kind: 'cmd', text: 'java -XX:+PrintCompilation Osr 10000 | grep Osr::', at: 33 },
        { kind: 'dim', text: '(no lines: never compiled)', at: 33.6 },
        { kind: 'cmd', text: 'java -XX:+PrintCompilation Osr 60000 | grep Osr::', at: 34.6 },
        { kind: 'dim', text: '(no lines)', at: 35.2 },
        { kind: 'cmd', text: 'java -XX:+PrintCompilation Osr 70000 | grep Osr::', at: 36.2 },
        { pc: '22    6 %     3       Osr::sumAreas @ 4 (29 bytes)', at: 36.8, glow: win(t, 37, 40) },
        { kind: 'cmd', text: 'java -XX:+PrintCompilation Osr 1000000 | grep Osr::', at: 40 },
        { pc: '21    8 %     4       Osr::sumAreas @ 4 (29 bytes)', at: 40.6 },
        { pc: '23    8 %     4       Osr::sumAreas @ 4 (29 bytes)   made not entrant', at: 42, glow: win(t, 42.5, 47) },
      ]} />
      <Panel x={1280} y={530} w={544} h={392} title="-XX:+LogCompilation (real)" tone="bad" a={E(t, 47)}>
        <div style={{ padding: '14px 20px', font: `400 17px ${MONO}`, color: PAL.ink2, lineHeight: 1.6 }}>
          <div>&lt;uncommon_trap</div>
          <div>  reason='<span style={{ color: PAL.bad }}>unstable_if</span>'</div>
          <div>  action='reinterpret'</div>
          <div>  compile_kind='osr' level='4'&gt;</div>
          <div>&lt;jvms bci='<span style={{ color: PAL.pull }}>6</span>' method='Osr sumAreas'/&gt;</div>
          <div style={{ marginTop: 14, font: `400 18px ${SANS}`, color: PAL.ink }}>bci 6 is `if_icmpge`: the loop test. Its exit had never been taken, so C2 compiled it as a trap.</div>
        </div>
      </Panel>
    </React.Fragment>
  );
}

// ── Inlining ───────────────────────────────────────────────────────────────
export function SInlineTree({ t }) {
  const LH = 34, BY = 196;
  const lineY = (y, i) => y + 44 + 12 + i * LH + LH / 2;
  const callP = t >= 5 && t < 11 ? ((t - 5) / 1.5) % 1 : -1;
  const AY = 196;
  const after = [
    'static double total(Shape[] shapes) {',
    '    double sum = 0;',
    '    for (Shape s : shapes) {',
    { s: '        if (s.klass != Circle) trap();   // guard', tone: 'bad', toneA: E(t, 17) },
    { s: '        double r = ((Circle) s).r;        // loaded once', tone: 'flow', toneA: win(t, 38, 45) },
    { s: '        sum += 3.141592653589793 * r * r;', tone: 'pull', toneA: win(t, 11.5, 17) + win(t, 38, 45) },
    '    }',
    '    return sum;',
    '}',
  ];
  return (
    <React.Fragment>
      <Code x={96} y={BY} w={820} h={44 + 24 + 9 * LH} fs={20} lh={LH} title="before · two methods" a={E(t, 0.4)} hl={3} hlA={win(t, 5, 11.5)}
        lines={['static double total(Shape[] shapes) {', '    double sum = 0;', '    for (Shape s : shapes)', '        sum += s.area();      // a call', '    return sum;', '}', '', '// in Circle:', 'public double area() { return Math.PI * r * r; }']} />
      <Arrow pts={[[700, lineY(BY, 3)], [860, lineY(BY, 3)], [860, lineY(BY, 8) - 8], [820, lineY(BY, 8) - 8]]} draw={M(t, 5, 0.6)} color={PAL.pull} a={1 - E(t, 11.5)} />
      {callP >= 0 && <Dot x={860} y={lerp(lineY(BY, 3), lineY(BY, 8), callP < 0.5 ? callP * 2 : 2 - callP * 2)} r={8} color={PAL.pull} />}
      <Badge x={706} y={lineY(BY, 5)} text="jump · frame · return, ×100" tone="pull" a={win(t, 5.5, 11.5)} fs={17} />

      <Code x={960} y={AY} w={864} h={44 + 24 + 9 * LH} fs={19} lh={LH} title="after · what C2 compiles (sketch)" tone="flow" a={E(t, 11)} lines={after} />
      <Tok t={t} keys={[[11, 560, lineY(BY, 8)], [12.4, 1380, lineY(AY, 5)]]} text="Math.PI * r * r" tone="pull" w={230} h={42} fs={19} until={12.6} />

      <Term x={96} y={590} w={820} t={t} a={E(t, 24)} title="-XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining" fs={18} lh={36} rows={[
        { pc: '61   13 %     4       Shapes::total @ 11 (42 bytes)', at: 24.3 },
        { kind: 'pull', text: '      @ 27   Circle::area (14 bytes)   inline (hot)', at: 24.8, glow: win(t, 25, 31) },
        { kind: 'ok', text: '       \\-> TypeProfile (163956/163956 counts) = Circle', at: 25.4 },
      ]} />

      <Panel x={960} y={590} w={864} h={196} title="what inlining unlocks" tone="flow" a={E(t, 31)}>
        <div style={{ padding: '12px 22px', font: `400 20px ${SANS}`, color: PAL.ink, lineHeight: 1.55 }}>
          <div style={{ opacity: E(t, 31.5) }}>· no call: no frame, no argument passing, no return</div>
          <div style={{ opacity: E(t, 38) }}>· `s.r` read once, `Math.PI` is a constant</div>
          <div style={{ opacity: E(t, 41) }}>· one body: unrolling, escape analysis and the rest can see it all</div>
        </div>
      </Panel>
      <Box x={960} y={812} w={330} h={76} label="p.getX() + p.getY()" fs={20} tone="ink" a={E(t, 45)} />
      <HArrow x1={1296} x2={1378} y={850} a={E(t, 45.6)} color={PAL.flow} label="inline" lfs={17} />
      <Box x={1384} y={812} w={250} h={76} label="p.x + p.y" fs={22} tone="flow" a={E(t, 46)} glow={pulse(t, [46.2], 1.2)} />
      <Txt x={1652} y={826} fs={18} color={PAL.ink2} w={172} a={E(t, 46.5)}>getters cost nothing</Txt>
      <Callout x={96} y={796} w={820} tone="pull" a={E(t, 51)} fs={20} text="Optimisations work **inside one compiled body**. Inlining decides how big that body is." />
    </React.Fragment>
  );
}

// ── Inlining limits ────────────────────────────────────────────────────────
const RX0 = 150, RX1 = 1770, RY = 400;
const rpos = (b) => { const f = b <= 35 ? (b / 35) * 0.35 : b <= 325 ? 0.35 + ((b - 35) / 290) * 0.45 : 0.8 + (Math.min(b, 500) - 325) / 175 * 0.2; return lerp(RX0, RX1, f); };
export function SInlineLimits({ t }) {
  const chips = [
    ['Point::x · 5', 5, 205, 'flow', 6.5], ['tiny · 8', 8, 255, 'flow', 7.2], ['Circle::area · 14', 14, 305, 'flow', 7.8],
    ['medium · 100', 100, 220, 'pull', 19.5], ['rare · 100', 100, 300, 'bad', 34], ['huge · 484', 484, 260, 'bad', 27],
  ];
  return (
    <React.Fragment>
      {/* zones */}
      {[[0, 35, 'flow', 'always a candidate', 6], [35, 325, 'pull', 'inlined only if hot', 13], [325, 500, 'bad', 'too big', 27]].map(([a0, a1, tone, l, at]) => (
        <React.Fragment key={l}>
          <div style={{ position: 'absolute', left: rpos(a0), top: RY, width: rpos(a1) - rpos(a0), height: 14, background: hexA(toneColor(tone), 0.55), opacity: E(t, at) }}></div>
          <Txt x={(rpos(a0) + rpos(a1)) / 2} y={RY + 54} anchor="mid" fs={20} color={toneColor(tone)} a={E(t, at)}>{l}</Txt>
        </React.Fragment>
      ))}
      <div style={{ position: 'absolute', left: RX0, top: RY + 6, width: RX1 - RX0, height: 2, background: PAL.line2, opacity: E(t, 0.6) }}></div>
      {[[0, '0'], [35, '35 · MaxInlineSize'], [325, '325 · FreqInlineSize'], [500, '500 bytes']].map(([v, l]) => (
        <React.Fragment key={v}>
          <div style={{ position: 'absolute', left: rpos(v) - 1, top: RY - 6, width: 3, height: 26, background: v === 35 || v === 325 ? PAL.ink : PAL.ink3, opacity: E(t, v === 35 ? 6 : v === 325 ? 13 : 0.6) }}></div>
          <Txt x={rpos(v)} y={RY + 22} anchor="mid" mono fs={17} color={PAL.ink2} a={E(t, v === 35 ? 6 : v === 325 ? 13 : 0.6)}>{l}</Txt>
        </React.Fragment>
      ))}
      <Txt x={RX0} y={196} mono fs={17} color={PAL.ink3} a={E(t, 0.6)}>BYTECODE SIZE OF THE CALLEE</Txt>
      {chips.map(([l, b, y, tone, at]) => {
        const x = rpos(b);
        const left = b > 300 ? x - 210 : b > 50 ? x + 14 : x + 14;
        return (
          <React.Fragment key={l}>
            <div style={{ position: 'absolute', left: x - 1, top: y + 18, width: 2, height: RY - y - 18, background: toneColor(tone), opacity: E(t, at) * 0.7 }}></div>
            <Dot x={x} y={y + 18} r={6} color={toneColor(tone)} a={E(t, at)} />
            <Badge x={left} y={y + 18} anchor="left" text={l} tone={tone} a={E(t, at)} fs={17} />
          </React.Fragment>
        );
      })}

      <Panel x={96} y={500} w={1000} h={44 + 24 + 8 * 36} title="-XX:+PrintInlining · Sizes.java" right="abridged" a={E(t, 19)}>
        <div style={{ padding: '12px 20px', font: `400 18px ${MONO}`, whiteSpace: 'pre' }}>
          {[
            ['C2 · tier 4 · Sizes::work (31 bytes)', PAL.ink3, 19.2, null],
            ['  @ 1   Sizes::tiny (8 bytes)   inline (hot)', PAL.flow, 19.6, 19.6],
            ['  @ 5   Sizes::medium (100 bytes)   inline (hot)', PAL.flow, 22, 22],
            ['  @ 10   Sizes::huge (484 bytes)   hot method too big', PAL.bad, 27, 27],
            ['  @ 24   Sizes::rare (100 bytes)   too big', PAL.bad, 34, 34],
            ['', PAL.ink3, 40, null],
            ['C1 · tier 3 · Sizes::work (31 bytes)', PAL.ink3, 40, null],
            ['  @ 5   Sizes::medium (100 bytes)   callee is too large', PAL.pull, 40.4, 40.4],
          ].map(([s, c, at, g], i) => <div key={i} style={{ height: 36, display: 'flex', alignItems: 'center', color: c, opacity: E(t, at, 0.3), background: g != null ? hexA(PAL.pull, 0.13 * win(t, g, g + 5)) : 'transparent', margin: '0 -20px', padding: '0 20px' }}>{s}</div>)}
        </div>
      </Panel>
      <Code x={1130} y={500} w={694} h={44 + 24 + 4 * 34} fs={17} lh={34} title="Sizes.work · hot" a={E(t, 19)}
        lines={['double x = tiny(r) + medium(r) + huge(r);', 'if (i % 100_000 == 0)', '    x += rare(r);       // rarely runs', 'return x;']} />
      <Callout x={1130} y={724} w={694} tone="violet" a={E(t, 41)} fs={18} title="other limits" text="`MaxInlineLevel=15`: how deep calls nest inside one compile. Recursion: `MaxRecursiveInlineLevel=1`. `InlineSmallCode=2500`: skip callees already compiled to big machine code." />
      <Callout x={96} y={868} w={1728} tone="flow" a={E(t, 46)} fs={20} text="Small methods aren't slow. **They're the ones that get inlined.** A huge method stays a call, and the optimiser can't see inside it." />
    </React.Fragment>
  );
}

// ── Escape analysis ────────────────────────────────────────────────────────
export function SEscape({ t }) {
  const HX = 1020, HY = 262, CW = 66, RHh = 38, COLS = 11, ROWS = 8, CAP = COLS * ROWS;
  const eaOn = t >= 33;
  const filling = t >= 6 && t < 33;
  const n = filling ? Math.floor((t - 6) * 16) : 0;
  const cycle = Math.floor(n / CAP), inCycle = n % CAP;
  const gcFlash = filling && cycle > 0 && inCycle < 6 ? 1 - inCycle / 6 : 0;
  const shown = eaOn ? Math.floor(((t < 33 ? 0 : 1) * 0)) : inCycle;
  const fade = 1 - E(t, 33, 0.8);
  const lastN = (() => { const nn = Math.floor((33 - 6) * 16); return nn % CAP; })();
  const cells = [];
  const count = t < 33 ? shown : lastN;
  for (let k = 0; k < count; k++) {
    const c = k % COLS, r = Math.floor(k / COLS);
    cells.push(<div key={k} style={{ position: 'absolute', left: HX + c * (CW + 4), top: HY + r * (RHh + 4), width: CW, height: RHh, boxSizing: 'border-box', borderRadius: 6, border: `1.5px solid ${k % 2 ? PAL.pink : PAL.violet}`, background: hexA(k % 2 ? PAL.pink : PAL.violet, 0.18), opacity: t < 33 ? 1 : fade, font: `500 17px ${MONO}`, color: PAL.ink2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k % 2 ? 'p2' : 'p1'}</div>);
  }
  const allocated = filling ? n * 32 : 0;
  const rowsAfter = [
    { a: 'p1 = new Point;  p1.x = x1;  p1.y = y1;', b: null, gone: true },
    { a: 'p2 = new Point;  p2.x = x2;  p2.y = y2;', b: null, gone: true },
    { a: 'dx = p2.x - p1.x;   dy = p2.y - p1.y;', b: 'dx = x2 - x1;       dy = y2 - y1;' },
    { a: 'return sqrt(dx*dx + dy*dy);', b: null },
  ];
  const swap = E(t, 27.5, 1.2);
  return (
    <React.Fragment>
      <Code x={96} y={196} w={880} h={44 + 24 + 6 * 34} fs={19} lh={34} title="record Point(double x, double y) {}" a={E(t, 0.4)}
        lines={['static double distance(double x1, double y1, double x2, double y2) {', { s: '    var p1 = new Point(x1, y1);', tone: 'violet', toneA: win(t, 6, 13) }, { s: '    var p2 = new Point(x2, y2);', tone: 'pink', toneA: win(t, 6, 13) }, '    double dx = p2.x() - p1.x(), dy = p2.y() - p1.y();', '    return Math.sqrt(dx * dx + dy * dy);', '}']} />
      <Panel x={HX - 20} y={196} w={824} h={418} title={eaOn ? 'heap · with escape analysis' : 'heap · TLAB · without escape analysis'} right={eaOn ? 'nothing allocated' : (allocated / 1e6).toFixed(1) + ' MB so far'} tone={eaOn ? 'flow' : 'pink'} a={E(t, 5.5)} glow={gcFlash} />
      {cells}
      {gcFlash > 0.05 && <Txt x={HX + 380} y={HY + 150} anchor="mid" mono fs={32} weight={700} color={PAL.bad} a={gcFlash}>GC</Txt>}
      {eaOn && <Txt x={HX + 382} y={HY + 150} anchor="mid" fs={30} weight={600} color={PAL.flow} a={E(t, 34)}>no `Point` is ever created</Txt>}
      <Txt x={HX} y={584} mono fs={17} color={PAL.ink3} a={E(t, 6) * (1 - E(t, 33))}>each cell = one Point, 32 bytes · two per call</Txt>

      <Panel x={96} y={500} w={880} h={44 + 24 + 4 * 38} title={t < 27.5 ? 'after inlining <init>, x(), y()' : 'after scalar replacement'} tone={t < 27.5 ? 'pull' : 'flow'} a={E(t, 13)}>
        <div style={{ padding: '12px 22px' }}>
          {rowsAfter.map((r, i) => (
            <div key={i} style={{ position: 'relative', height: 38, font: `400 19px ${MONO}`, whiteSpace: 'pre', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: r.gone ? (t > 33 ? PAL.ink3 : PAL.ink) : PAL.ink, opacity: r.b ? 1 - swap : r.gone ? 1 - 0.6 * E(t, 33) : 1, textDecoration: r.gone && t > 33 ? 'line-through' : 'none', position: r.b ? 'absolute' : 'static' }}>{r.a}</span>
              {r.b && <span style={{ color: PAL.flow, opacity: swap }}>{r.b}</span>}
            </div>
          ))}
        </div>
      </Panel>

      <Panel x={HX - 20} y={636} w={824} h={290} title="does p1 or p2 escape?" tone="violet" a={E(t, 20) * (1 - E(t, 46.6))}>
        <div style={{ padding: '10px 22px' }}>
          {[['stored in a field or array?', 20.5], ['returned from the method?', 22], ['passed to code C2 can’t see?', 23.5]].map(([q, at]) => (
            <div key={q} style={{ display: 'flex', justifyContent: 'space-between', height: 48, alignItems: 'center', font: `400 21px ${SANS}`, color: PAL.ink, opacity: E(t, at), borderBottom: `1px solid ${PAL.line}` }}>
              <span>{q}</span><span style={{ font: `700 21px ${MONO}`, color: PAL.flow }}>no</span>
            </div>
          ))}
          <div style={{ marginTop: 16, font: `600 24px ${MONO}`, color: PAL.flow, opacity: E(t, 25) }}>→ NoEscape: scalar-replace both</div>
        </div>
      </Panel>
      <Panel x={HX - 20} y={636} w={824} h={290} title="young collections (-Xlog:gc)" a={E(t, 47)}>
        <div style={{ display: 'flex', padding: '30px 30px', gap: 30 }}>
          <div style={{ flex: 1 }}><div style={{ font: `400 19px ${MONO}`, color: PAL.ink2 }}>escape analysis on</div><div style={{ font: `700 72px ${MONO}`, color: PAL.flow }}>0</div></div>
          <div style={{ flex: 1 }}><div style={{ font: `400 19px ${MONO}`, color: PAL.ink2 }}>-XX:-DoEscapeAnalysis</div><div style={{ font: `700 72px ${MONO}`, color: PAL.bad }}>34</div></div>
        </div>
      </Panel>
      <Term x={96} y={724} w={880} t={t} a={E(t, 40)} fs={17} lh={34} title="terminal · 100 million calls" rows={[
        { kind: 'cmd', text: 'java Escape', at: 40 },
        { kind: 'ok', text: '100M calls: 97 ms, allocated 216 bytes', at: 40.6, glow: win(t, 41, 46) },
        { kind: 'cmd', text: 'java -XX:-DoEscapeAnalysis Escape', at: 47 },
        { kind: 'bad', text: '100M calls: 448 ms, allocated 6,400,000,216 bytes', at: 47.6, glow: win(t, 48, 60) },
      ]} />
    </React.Fragment>
  );
}

// ── Escape states, lock elision ────────────────────────────────────────────
export function SEscapeStates({ t }) {
  const cols = [
    ['NoEscape', 'flow', 'only used inside this compiled body', 'var p = new Point(x, y);\nreturn p.x() + p.y();', 'scalar replaced · no allocation', 5],
    ['ArgEscape', 'pull', 'passed to a call that wasn’t inlined', 'var p = new Point(x, y);\nbigHelper(p);', 'allocated · its locks can go', 11],
    ['GlobalEscape', 'bad', 'stored in a field, returned or thrown', 'var p = new Point(x, y);\nlast = p;   // or: return p;', 'a real heap object', 18],
  ];
  return (
    <React.Fragment>
      {cols.map(([name, tone, what, code, out, at], i) => {
        const x = 96 + i * 590;
        return (
          <React.Fragment key={name}>
            <Panel x={x} y={196} w={558} h={300} title={name} tone={tone} a={E(t, at)} glow={win(t, at, at + 6) * 0.6} />
            <Txt x={x + 24} y={256} fs={21} w={510} color={PAL.ink} a={E(t, at + 0.2)}>{what}</Txt>
            <div style={{ position: 'absolute', left: x + 24, top: 310, width: 510, font: `400 18px ${MONO}`, color: PAL.ink2, whiteSpace: 'pre', lineHeight: 1.6, opacity: E(t, at + 0.5) }}>{window.AN.hiJava(code.split('\n')[0])}<br />{window.AN.hiJava(code.split('\n')[1])}</div>
            <Txt x={x + 24} y={430} mono fs={19} weight={600} color={toneColor(tone)} a={E(t, at + 1.2)}>{'→ ' + out}</Txt>
          </React.Fragment>
        );
      })}
      <Code x={96} y={530} w={860} h={44 + 24 + 4 * 32} fs={18} lh={32} title="Escape2.java · one line added" a={E(t, 24)}
        lines={['static Point last;', '    var p1 = new Point(x1, y1);', '    var p2 = new Point(x2, y2);', { s: '    last = p1;                // p1 escapes', tone: 'bad', toneA: E(t, 24.5) }]} />
      <Term x={96} y={738} w={860} t={t} a={E(t, 26)} fs={17} lh={34} rows={[{ kind: 'cmd', text: 'java Escape2', at: 26 }, { kind: 'bad', text: '100M calls: 466 ms, allocated 3,200,000,216 bytes', at: 26.6, glow: win(t, 27, 32) }]} />
      <Box x={720} y={760} w={110} h={56} label="p1" tone="violet" fill a={E(t, 28)} fs={20} />
      <Box x={840} y={760} w={110} h={56} label="p2" tone="pink" dashed strike a={E(t, 28.6)} fs={20} />
      <Txt x={720} y={830} fs={17} color={PAL.ink2} w={240} a={E(t, 29)}>p1 allocated, p2 still gone</Txt>

      <Code x={990} y={530} w={834} h={44 + 24 + 4 * 32} fs={18} lh={32} title="Locks.java · lock elision" a={E(t, 32)}
        lines={['static double area(double r) {', '    Object lock = new Object();   // never escapes', '    synchronized (lock) { return Math.PI * r * r; }', '}']} />
      <Term x={990} y={738} w={834} t={t} a={E(t, 38)} fs={17} lh={34} rows={[
        { kind: 'ok', parts: [['java Locks', PAL.ink], ['                      →  97 ms', PAL.flow]], at: 38 },
        { kind: 'bad', parts: [['java -XX:-EliminateLocks Locks', PAL.ink], ['  →  1,136 ms', PAL.bad]], at: 39.5 },
      ]} />
      <Callout x={96} y={880} w={1728} tone="pull" a={E(t, 44)} fs={19} text="Fragile: it works per compiled body, after inlining. One call too big to inline and the object escapes. Don't rely on it; do stop hand-pooling short-lived objects." />
    </React.Fragment>
  );
}
