// 8.9 scenes, part 3: JFR internals and commands, sampling vs instrumenting, safepoint bias, flame graphs.
const { PAL, MOTION, lin, lerp, win, pulse, track, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, HArrow, VArrow, Arrow, Dot, Badge, Callout, Table, Brace, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;
import { Term, Tok } from './kit89.jsx';
import { SAMPLES_DEFAULT, SAMPLES_DNS } from './data.jsx';

const frac = (v) => v - Math.floor(v);

// ── JFR: buffers, chunks, a ring ───────────────────────────────────────────
const EV = [['ExecutionSample', 'violet'], ['ObjectAllocationSample', 'pull'], ['ThreadSleep', 'blue'], ['GCPhasePause', 'flow'], ['SafepointBegin', 'green']];
export function SJfrRing({ t }) {
  const lanes = [['http-worker-1', [0, 1], 0.5, 0.9], ['login-handler', [1, 2], 0.3, 1.3], ['VM Thread', [3, 4], 0.25, 1.7]];
  const LY = (i) => 290 + i * 120;
  const dots = [];
  lanes.forEach(([, ev, , period], li) => {
    for (let k = 0; k < 80; k++) {
      const s = 7 + k * period + li * 0.2;
      if (s > t) break;
      const p = M(t, s, 1.0);
      if (p >= 1) continue;
      dots.push(<Dot key={li + '-' + k} x={lerp(336, 556, p)} y={LY(li)} r={9} color={toneColor(EV[ev[k % 2]][1])} />);
    }
  });
  const toks = [];
  lanes.forEach(([, , r], li) => {
    for (let k = 1; k < 20; k++) {
      const tf = 14.5 + k / r;
      if (tf > t) break;
      if (t < tf + 0.9) toks.push(<Tok key={'f' + li + k} t={t} keys={[[tf, 720, LY(li)], [tf + 0.8, 930, 330 + li * 100]]} until={tf + 0.75} text="buffer" tone="violet" w={110} h={40} fs={17} />);
    }
  });
  const shift = Math.max(0, (t - 28) / 2);
  const chunks = [];
  for (let i = 0; i < 16; i++) {
    const tc = 22 + 2 * i;
    if (tc > t) break;
    const slot = i - shift;
    if (slot < -1) continue;
    const a = E(t, tc, 0.4) * clamp(1 + slot, 0, 1);
    chunks.push(<Box key={'c' + i} x={1220 + slot * 150} y={330} w={130} h={100} label={`chunk ${i + 1}`} sub={slot < -0.2 ? 'dropped' : 'on disk'} tone={slot < -0.2 ? 'bad' : 'violet'} fs={19} sfs={17} a={a} />);
  }
  const flushTok = (() => { const k = Math.floor((t - 22) / 2); if (k < 0) return null; const tc = 22 + 2 * k; return <Tok t={t} keys={[[tc - 0.6, 1060, 430], [tc, 1300 + Math.min(k, 3) * 150 - 150 * Math.max(0, (tc - 28) / 2 - (k - Math.min(k, 3))), 380]]} until={tc - 0.05} text="write" tone="violet" w={90} h={36} fs={17} />; })();
  return (
    <React.Fragment>
      {lanes.map(([n, , r], li) => {
        const fill = t < 14.5 ? clamp((t - 7) / 7.5, 0, 1) * 0.3 : frac((t - 14.5) * r);
        return (
          <React.Fragment key={n}>
            <Box x={96} y={LY(li) - 35} w={230} h={70} label={n} fs={20} tone="ink" a={E(t, 1 + li * 0.3)} />
            <Box x={560} y={LY(li) - 35} w={160} h={70} label="" tone="violet" a={E(t, 14.5)} />
            <div style={{ position: 'absolute', left: 564, top: LY(li) - 31, width: 152 * fill, height: 62, borderRadius: 9, background: hexA(PAL.violet, 0.35), opacity: E(t, 14.5) }}></div>
            <Txt x={640} y={LY(li)} anchor="center" mono fs={17} color={PAL.ink} a={E(t, 14.5)}>thread buffer</Txt>
          </React.Fragment>
        );
      })}
      {dots}{toks}
      <Panel x={800} y={230} w={300} h={380} title="global buffers" a={E(t, 21.5)} tone="violet" />
      {[0, 1, 2].map((s) => <div key={s} style={{ position: 'absolute', left: 830, top: 300 + s * 100, width: 240 * frac((t - 21.5 + s * 0.9) / 2.2), height: 60, borderRadius: 8, background: hexA(PAL.violet, 0.3), border: `2px solid ${hexA(PAL.violet, 0.7)}`, opacity: E(t, 21.8) }}></div>)}
      <Panel x={1160} y={230} w={664} h={380} title="disk repository" right="maxsize · maxage" a={E(t, 21.5)} tone="violet" />
      {chunks}{flushTok}
      <Txt x={1492} y={470} anchor="mid" mono fs={18} color={PAL.bad} a={E(t, 30)}>full: oldest chunk dropped, newest added</Txt>
      <Txt x={1492} y={506} anchor="mid" fs={20} color={PAL.ink2} a={E(t, 30.5)}>a rolling window of recent history</Txt>
      <Txt x={96} y={200} mono fs={17} color={PAL.ink3} a={E(t, 1)}>THREADS EMIT EVENTS</Txt>
      {EV.map(([n, tone], i) => (
        <React.Fragment key={n}>
          <Dot x={110 + (i % 3) * 230} y={662 + Math.floor(i / 3) * 40} r={8} color={toneColor(tone)} a={E(t, 7 + i * 0.3)} />
          <Txt x={126 + (i % 3) * 230} y={651 + Math.floor(i / 3) * 40} mono fs={17} color={PAL.ink2} a={E(t, 7 + i * 0.3)}>{n.length > 18 ? 'ObjAllocationSample' : n}</Txt>
        </React.Fragment>
      ))}
      <VArrow x={1490} y1={612} y2={690} a={E(t, 36)} color={PAL.pull} label="JFR.dump" />
      <Box x={1290} y={694} w={400} h={80} label="rec.jfr" sub="the last N minutes, on demand" tone="pull" a={POP(t, 36.5)} fs={24} />
      <Box x={96} y={750} w={540} h={92} label="default.jfc" sub="samples every 20 ms · < 1 % overhead" tone="flow" align="left" fs={22} sfs={18} a={E(t, 43)} />
      <Box x={660} y={750} w={540} h={92} label="profile.jfc" sub="every 10 ms · more events · ≈ 2 %" tone="pull" align="left" fs={22} sfs={18} a={E(t, 44)} />
      <Badge x={1490} y={820} text="open source since JDK 11 · JEP 328" tone="flow" a={E(t, 49.5)} fs={18} />
    </React.Fragment>
  );
}

// ── JFR commands ───────────────────────────────────────────────────────────
export function SJfrCommands({ t }) {
  return (
    <React.Fragment>
      <Term x={96} y={190} w={960} h={44 + 20 + 12 * 27} t={t} a={E(t, 0.4)} title="jcmd · JFR on a live process" right="pid lines omitted" lines={[
        { k: 'cmd', s: 'jcmd 7196 JFR.start name=rec settings=profile', at: 1 },
        { s: 'Started recording 1. No limit specified, using maxsize=250MB as default.', at: 2, tone: 'pull', toneA: win(t, 6, 12) },
        { s: 'Use jcmd 7196 JFR.dump name=rec filename=FILEPATH to copy recording data to file.', at: 2.3, k: 'dim' },
        { k: 'cmd', s: 'jcmd 7196 JFR.check', at: 4 },
        { s: 'Recording 1: name=rec maxsize=250.0MB (running)', at: 4.8 },
        { s: '' },
        { k: 'cmd', s: 'jcmd 7196 JFR.dump name=rec filename=$PWD/rec.jfr', at: 12 },
        { s: 'Dumped recording "rec", 3.4 MB written to:', at: 13, k: 'ok' },
        { s: '/…/j89/rec.jfr', at: 13.2 },
        { k: 'cmd', s: 'jcmd 7196 JFR.stop name=rec', at: 15.5 },
        { s: 'Stopped recording "rec".', at: 16.3 },
        { s: '' },
      ]} />
      <Term x={1100} y={190} w={724} h={44 + 20 + 11 * 27} t={t} a={E(t, 18.5)} title="jfr summary rec.jfr" right="abridged" lines={[
        { s: ' Duration: 21 s', at: 19, tone: 'pull', toneA: win(t, 19, 25) },
        { s: '' },
        { s: ' Event Type                                   Count  Size (bytes) ', at: 19.4, k: 'dim' },
        { s: '==================================================================', at: 19.4, k: 'dim' },
        { s: ' jdk.GCPhaseParallel                         107911       2769046', at: 19.8 },
        { s: ' jdk.ObjectAllocationSample                    6294         97493', at: 20 },
        { s: ' jdk.ExecutionSample                           1580         17361', at: 20.2, tone: 'violet', toneA: E(t, 25) },
        { s: ' jdk.SafepointBegin                             296          4075', at: 20.4 },
        { s: ' jdk.GarbageCollection                          292          5757', at: 20.6 },
        { s: ' jdk.GCPhasePause                               292          6633', at: 20.8 },
        { s: ' jdk.CPULoad                                     20           380', at: 21 },
      ]} />
      <Term x={1100} y={590} w={724} h={44 + 20 + 9 * 27} t={t} a={E(t, 31.5)} title="jfr print --events ExecutionSample" right="first event" lines={[
        'jdk.ExecutionSample {', '  startTime = 12:12:03.461',
        { s: '  sampledThread = "http-worker-1" (javaThreadId = 14)', tone: 'violet' }, '  state = "STATE_RUNNABLE"', '  stackTrace = [',
        '    java.text.DecimalFormatSymbols.getInstance(Locale) line: 180', '    …', '  ]', '}',
      ]} />
      <Term x={96} y={612} w={960} h={44 + 20 + 4 * 27} t={t} a={E(t, 39)} title="or record from launch" lines={[
        { k: 'cmd', s: 'java -XX:+UnlockDiagnosticVMOptions -XX:+DebugNonSafepoints \\' },
        { s: '    -XX:StartFlightRecording=duration=20s,filename=rec2.jfr,settings=profile Shop cpu', color: 'ink' },
        { s: '[0.230s][info][jfr,startup] Started recording 1. The result will be written to:', at: 40 },
        { s: '[0.230s][info][jfr,startup] /…/j89/rec2.jfr', at: 40.3 },
      ]} />
      <Callout x={96} y={810} w={960} tone="violet" fs={19} a={E(t, 46)} text="Newer JDKs: `jfr view hot-methods` and `jfr scrub` (21). In 25: CPU-time sampling (JEP 509, Linux only), cooperative sampling (JEP 518), method timing and tracing (JEP 520)." />
    </React.Fragment>
  );
}

// ── Sampling vs instrumenting ──────────────────────────────────────────────
const STRIP = [['parse', 0, 0.022, 'blue'], ['query', 0.022, 0.282, 'violet'], ['toJson', 0.282, 0.311, 'green'], ['format', 0.311, 1, 'pull']];
export function SInstrument({ t }) {
  const inj = E(t, 5.5);
  const X0 = 1014, W = 780;
  const ticks = Array.from({ length: 12 }, (_, k) => (k + 0.5) / 12);
  const leafAt = (f) => { const g = f % 0.5 / 0.5; return STRIP.find(([, a, b]) => g >= a && g < b); };
  const tally = {};
  ticks.forEach((f, k) => { if (t >= 27 + k * 0.4) { const l = leafAt(f)[0]; tally[l] = (tally[l] || 0) + 1; } });
  return (
    <React.Fragment>
      <Panel x={96} y={190} w={840} h={480} title="instrumenting" tone="bad" a={E(t, 4.5)} />
      <Code x={120} y={250} w={792} h={44 + 24 + 5 * 34} title="Order.java · after the profiler rewrote it" fs={18} lh={34} a={E(t, 5)} lines={[
        { s: 'int total() {' },
        { s: '    long t0 = System.nanoTime();          // injected', tone: 'bad', toneA: inj, o: inj },
        { s: '    try { return price * qty; }' },
        { s: '    finally { Profiler.exit("total", t0); } // injected', tone: 'bad', toneA: inj, o: inj },
        { s: '}' },
      ]} />
      <Txt x={120} y={520} mono fs={17} color={PAL.ink3} a={E(t, 11.5)}>ONE CALL, DRAWN TO SCALE (ROUGHLY)</Txt>
      <div style={{ position: 'absolute', left: 120, top: 552, width: 12, height: 40, borderRadius: 4, background: PAL.flow, opacity: E(t, 11.5) }}></div>
      <div style={{ position: 'absolute', left: 140, top: 552, width: 520 * E(t, 12, 1.2), height: 40, borderRadius: 4, background: hexA(PAL.bad, 0.6), opacity: E(t, 11.8) }}></div>
      <Txt x={120} y={604} mono fs={17} color={PAL.flow} a={E(t, 11.5)}>work</Txt>
      <Txt x={300} y={604} mono fs={17} color={PAL.bad} a={E(t, 12.5)}>timing probes</Txt>
      <Badge x={800} y={572} text="can't be inlined" tone="bad" a={POP(t, 14)} fs={18} solid />
      <Callout x={120} y={690} w={792} tone="bad" fs={20} a={win(t, 19, 41.3)} text="Tiny methods now **look** expensive. Overall the program runs **2 to 10×** slower, and differently." />

      <Panel x={984} y={190} w={840} h={480} title="sampling" tone="flow" a={E(t, 26.5)} />
      {[0, 1].map((c) => STRIP.map(([n, a, b, tone]) => {
        const x = X0 + (c * 0.5 + a * 0.5) * W, w = (b - a) * 0.5 * W;
        return (
          <React.Fragment key={c + n}>
            <Box x={x} y={420} w={w} h={56} label={w > 60 ? n : ''} tone={tone} fs={18} r={4} a={E(t, 27)} />
            <Box x={x} y={360} w={w} h={56} label={w > 120 ? (n === 'parse' || n === 'query' ? 'handle' : 'render') : ''} tone="ink" fs={18} r={4} a={E(t, 27)} />
          </React.Fragment>
        );
      }))}
      <Box x={X0} y={480} w={W} h={50} label="serve, serve, serve …" tone="ink" fs={18} r={4} a={E(t, 27)} />
      <Txt x={X0} y={256} mono fs={17} color={PAL.ink3} a={E(t, 27)}>ONE THREAD'S STACK OVER TIME · A TICK EVERY 10 MS</Txt>
      {ticks.map((f, k) => {
        const x = X0 + f * W, a = E(t, 27 + k * 0.4, 0.2);
        return <React.Fragment key={k}>
          <div style={{ position: 'absolute', left: x - 1, top: 300, width: 2, height: 240, background: PAL.flow, opacity: a * 0.8 }}></div>
          <Dot x={x} y={448} r={7} color={PAL.ink} a={a} />
        </React.Fragment>;
      })}
      <Txt x={X0} y={560} mono fs={19} color={PAL.ink} a={E(t, 34)}>{Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join('  ·  ')}</Txt>
      <Txt x={X0} y={600} fs={20} color={PAL.flow} a={E(t, 35)}>count where the samples land: statistical, but cheap</Txt>

      <Table x={96} y={700} cols={[300, 714, 714]} head={['', 'instrumenting', 'sampling']} fs={20} rh={44} a={E(t, 41.5)}
        rows={[['overhead', '2–10×', '≈ 1 %'], ['result', 'exact call counts', 'share of samples'], ['distortion', 'defeats inlining (8.8)', 'minimal'], ['use it for', 'narrow, local questions', 'production, the first look']]}
        colColors={[PAL.ink2, PAL.bad, PAL.flow]} />
    </React.Fragment>
  );
}

// ── Safepoint bias, and the real JFR experiment ────────────────────────────
const POLLS = [0.012, 0.30, 0.40, 0.52, 0.66, 0.80, 0.92, 1.0];
export function SSafepointBias({ t }) {
  const X0 = 146, W = 1628, BY = 300;
  const ticks = Array.from({ length: 16 }, (_, k) => (k + 0.5) / 16);
  const slide = M(t, 19.5, 1.6);
  const counts = {};
  const dots = ticks.map((f, k) => {
    const p = POLLS.find((q) => q >= f);
    const n = counts[p] = (counts[p] || 0) + 1;
    const x = lerp(X0 + f * W, X0 + p * W, slide);
    const y = lerp(BY + 104, BY + 104 + (n - 1) * 20, slide);
    return <Dot key={k} x={x} y={y} r={7} color={PAL.pull} a={E(t, 7.4 + k * 0.08) * (1 - E(t, 40.6))} />;
  });
  const topA = 1 - E(t, 40.6) * 0.0;
  const rows = [['format', 'pull'], ['query', 'violet'], ['toJson', 'green'], ['parse', 'blue']];
  const BX = 380, BW = 1150, MAX = 930;
  return (
    <React.Fragment>
      <Panel x={96} y={190} w={1728} h={360} title="one pass through serve(), drawn as time" right="an illustration" a={E(t, 0.5) * topA} />
      {STRIP.map(([n, a, b, tone]) => <Box key={n} x={X0 + a * W} y={BY - 30} w={(b - a) * W} h={60} label={(b - a) * W > 80 ? n : ''} tone={tone} fs={20} r={4} a={E(t, 7)} />)}
      <Txt x={X0 + 0.011 * W} y={BY + 40} anchor="mid" mono fs={17} color={PAL.blue} a={E(t, 7)}>parse</Txt>
      <Txt x={X0 + 0.296 * W} y={BY + 40} anchor="mid" mono fs={17} color={PAL.green} a={E(t, 7)}>toJson</Txt>
      {POLLS.map((p, i) => <Txt key={i} x={X0 + p * W} y={BY - 70} anchor="mid" fs={24} color={PAL.flow} a={E(t, 13 + i * 0.15)}>▼</Txt>)}
      <Txt x={X0} y={BY - 104} mono fs={17} color={PAL.flow} a={E(t, 13)}>▼ safepoint poll: method calls, loop back-edges</Txt>
      <Txt x={X0 + 0.152 * W} y={BY - 72} anchor="mid" mono fs={17} color={PAL.violet} a={E(t, 15)}>counted loop, inlined: no poll</Txt>
      {ticks.map((f, k) => <div key={k} style={{ position: 'absolute', left: X0 + f * W - 1, top: BY + 34, width: 2, height: 40, background: PAL.pull, opacity: E(t, 7.4 + k * 0.08) * 0.8 }}></div>)}
      {dots}
      <Txt x={1824 - 30} y={BY + 110} anchor="right" mono fs={19} color={PAL.pull} a={E(t, 21.5) * (1 - E(t, 40.6))}>query: 0 samples · toJson: 5</Txt>

      <Callout x={96} y={590} w={1728} tone="flow" fs={21} a={win(t, 26.5, 33.3)} text="**JFR** and **async-profiler** interrupt the thread wherever it is: no waiting for a safepoint. Better, but not the whole story." />
      <Callout x={96} y={590} w={1728} tone="violet" fs={21} a={win(t, 33.5, 40.8)} text="Compiled code records *which method and line am I in?* (debug info, inlined frames included) only at **calls and safepoint polls**. A sample taken in between is credited to the nearest record." />

      <Panel x={96} y={566} w={1728} h={350} title="real JFR samples of http-worker-1 · JDK 17 · 20 s each" right="Shop frames only" a={E(t, 41)} tone="pull" />
      <Txt x={BX} y={618} mono fs={17} color={PAL.bad} a={E(t, 41)}>■ default</Txt>
      <Txt x={BX + 180} y={618} mono fs={17} color={PAL.flow} a={E(t, 48)}>■ -XX:+UnlockDiagnosticVMOptions -XX:+DebugNonSafepoints</Txt>
      {rows.map(([n, tone], i) => {
        const y = 652 + i * 66, d = SAMPLES_DEFAULT[n], s = SAMPLES_DNS[n];
        const wd = (d / MAX) * BW * M(t, 41.5, 1), ws = (s / MAX) * BW * M(t, 48.3, 1);
        return (
          <React.Fragment key={n}>
            <Txt x={126} y={y + 10} mono fs={22} weight={600} color={toneColor(tone)} a={E(t, 41)}>{n}</Txt>
            <div style={{ position: 'absolute', left: BX, top: y, width: Math.max(wd, 2), height: 24, borderRadius: 4, background: hexA(PAL.bad, 0.7), opacity: E(t, 41.3) }}></div>
            <Txt x={BX + wd + 12} y={y - 1} mono fs={17} color={PAL.bad} a={E(t, 42.5)}>{d}</Txt>
            <div style={{ position: 'absolute', left: BX, top: y + 28, width: Math.max(ws, 2), height: 24, borderRadius: 4, background: hexA(PAL.flow, 0.75), opacity: E(t, 48) }}></div>
            <Txt x={BX + ws + 12} y={y + 27} mono fs={17} color={PAL.flow} a={E(t, 49.3)}>{s}</Txt>
          </React.Fragment>
        );
      })}
      <Badge x={1640} y={740} text="query's time was blamed on toJson" tone="bad" a={E(t, 50)} fs={18} />
    </React.Fragment>
  );
}

// ── Building a flame graph ─────────────────────────────────────────────────
const SAMP = [['run', 'serve', 'render', 'format'], ['run', 'serve', 'handle', 'query'], ['run', 'serve', 'render', 'format'], ['run', 'serve', 'render'],
  ['run', 'serve', 'render', 'format'], ['run', 'serve', 'handle', 'query'], ['run', 'serve', 'handle', 'parse'], ['run', 'serve', 'render', 'format']];
const FTONE = { run: 'ink', serve: 'ink', handle: 'blue', render: 'pull', format: 'pull', query: 'violet', parse: 'blue', toJson: 'green' };
export function SFlameBuild({ t }) {
  const order = SAMP.map((s, i) => i).sort((a, b) => { const A = SAMP[a], B = SAMP[b]; for (let d = 0; d < Math.max(A.length, B.length); d++) { if (A[d] == null) return -1; if (B[d] == null) return 1; if (A[d] !== B[d]) return A[d] < B[d] ? -1 : 1; } return a - b; });
  const pos = SAMP.map((_, i) => order.indexOf(i));
  const CW = 200, X0 = 160, FH = 66, BASE = 820;
  const yOf = (d) => BASE - (d + 1) * (FH + 6);
  const mv = M(t, 12.8, 1.4);
  const sepA = 1 - E(t, 19.6, 0.6);
  const cols = SAMP.map((s, i) => {
    const x = lerp(X0 + i * CW, X0 + pos[i] * CW, mv);
    return (
      <React.Fragment key={i}>
        {s.map((f, d) => <Box key={d} x={x + 5} y={yOf(d)} w={CW - 10} h={FH} label={f} tone={FTONE[f]} fs={19} r={6} a={E(t, 1 + i * 0.35 + d * 0.06) * sepA} />)}
        <Txt x={x + CW / 2} y={BASE + 10} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 1 + i * 0.35) * sepA}>#{i + 1}</Txt>
      </React.Fragment>
    );
  });
  // merged boxes from the sorted order
  const merged = [];
  for (let d = 0; d < 4; d++) {
    let k = 0;
    while (k < order.length) {
      const f = SAMP[order[k]][d];
      if (f == null) { k++; continue; }
      const pre = SAMP[order[k]].slice(0, d + 1).join('>');
      let j = k;
      while (j + 1 < order.length && SAMP[order[j + 1]].slice(0, d + 1).join('>') === pre) j++;
      merged.push({ d, f, x: X0 + k * CW, w: (j - k + 1) * CW, n: j - k + 1 });
      k = j + 1;
    }
  }
  const hot = (f) => (f === 'serve' ? win(t, 27, 34) : f === 'render' || f === 'handle' ? win(t, 28.5, 34) : f === 'format' ? win(t, 30, 41) : 0);
  return (
    <React.Fragment>
      <Badge x={1700} y={210} text="8 samples · an illustration" tone="ink" a={E(t, 0.5)} fs={18} />
      <Txt x={X0} y={200} mono fs={17} color={PAL.ink3} a={win(t, 0.5, 12.5)}>IN THE ORDER THEY WERE TAKEN →</Txt>
      <Txt x={X0} y={200} mono fs={17} color={PAL.pull} a={win(t, 12.5, 19.5)}>SORTED ALPHABETICALLY, FRAME BY FRAME</Txt>
      {cols}
      {merged.map((m, i) => <Box key={i} x={m.x + 3} y={yOf(m.d)} w={m.w - 6} h={FH} label={`${m.f}${m.w > 220 ? ' · ' + m.n : ''}`} tone={FTONE[m.f]} fs={20} r={6} a={E(t, 19.8 + m.d * 0.5)} glow={hot(m.f)} />)}
      <Txt x={X0} y={BASE + 22} mono fs={20} color={PAL.bad} a={E(t, 34.5)} style={{ textDecoration: 'line-through' }}>time →</Txt>
      <Txt x={X0 + 150} y={BASE + 22} mono fs={20} color={PAL.flow} a={E(t, 35.2)}>alphabetical: the x-order carries no meaning</Txt>
      <Brace x={X0 + 4 * CW} y={yOf(3) - 30} w={4 * CW} label="width = 4 of 8 samples = 50 %" tone="pull" above a={E(t, 41.5)} fs={19} />
      <VArrow x={X0 - 40} y1={BASE} y2={yOf(3)} a={E(t, 42.5)} color={PAL.ink2} />
      <Txt x={X0 - 52} y={yOf(1)} anchor="right" mono fs={17} color={PAL.ink2} a={E(t, 42.5)} w={70} align="right">depth</Txt>
      <div style={{ position: 'absolute', left: X0 + 3 * CW + 3, top: yOf(3), width: CW - 6, height: FH, borderRadius: 6, border: `3px dashed ${PAL.flow}`, background: hexA(PAL.flow, 0.12), opacity: E(t, 47.5) }}></div>
      <Txt x={X0 + 3.5 * CW} y={yOf(3) + 20} anchor="mid" mono fs={18} color={PAL.flow} a={E(t, 47.8)}>render's self time</Txt>
    </React.Fragment>
  );
}

// ── Reading Shop's real flame graph ────────────────────────────────────────
export function SFlameRead({ t }) {
  const T = SAMPLES_DNS.total, X0 = 160, W = 1600, FH = 66, BASE = 860;
  const sx = (v) => X0 + (v / T) * W;
  const yOf = (d) => BASE - (d + 1) * (FH + 6);
  const hd = SAMPLES_DNS.parse + SAMPLES_DNS.query, rd = SAMPLES_DNS.format + SAMPLES_DNS.toJson + SAMPLES_DNS.render;
  const pct = (v) => `${Math.round((v / T) * 100)} %`;
  const F = [
    [0, 'all samples · 1,333', 0, T, 'ink', 0.5],
    [1, 'serve', 0, hd + rd, 'ink', 1],
    [2, `handle · ${pct(hd)}`, 0, hd, 'blue', 1.5], [2, `render · ${pct(rd)}`, hd, hd + rd, 'pull', 1.5],
    [3, 'parse', 0, SAMPLES_DNS.parse, 'blue', 2], [3, `query · ${pct(SAMPLES_DNS.query)}`, SAMPLES_DNS.parse, hd, 'violet', 2],
    [3, `format · ${pct(SAMPLES_DNS.format)}`, hd, hd + SAMPLES_DNS.format, 'pull', 2], [3, '', hd + SAMPLES_DNS.format, hd + SAMPLES_DNS.format + SAMPLES_DNS.toJson, 'green', 2],
  ];
  const glow = (lab) => (lab === 'serve' ? win(t, 7.5, 13.5) : lab.startsWith('handle') || lab.startsWith('render') ? win(t, 13.5, 19.5) : lab.startsWith('format') ? win(t, 19.5, 27) + win(t, 40.5, 99) : lab.startsWith('query') ? win(t, 27, 34) : 0);
  const jdk = [[SAMPLES_DNS.parse ? 0 : 0, SAMPLES_DNS.parse], [hd, hd + SAMPLES_DNS.format], [hd + SAMPLES_DNS.format, hd + SAMPLES_DNS.format + SAMPLES_DNS.toJson]];
  return (
    <React.Fragment>
      <Txt x={96} y={196} mono fs={18} color={PAL.ink2} a={E(t, 0.5)}>Built from real JFR ExecutionSample stacks · JDK 17 · -XX:+DebugNonSafepoints · Shop frames only</Txt>
      {F.map(([d, lab, a, b, tone, at], i) => <Box key={i} x={sx(a) + 2} y={yOf(d)} w={Math.max(sx(b) - sx(a) - 4, 3)} h={FH} label={lab} tone={tone} fs={20} r={6} a={E(t, at)} glow={glow(lab)} />)}
      {jdk.map(([a, b], i) => <div key={i} style={{ position: 'absolute', left: sx(a) + 2, top: yOf(4), width: Math.max(sx(b) - sx(a) - 4, 3), height: FH, borderRadius: 6, opacity: E(t, 2.5), background: `repeating-linear-gradient(45deg, transparent 0 8px, ${hexA(PAL.ink3, 0.35)} 8px 11px)`, border: `1.5px dashed ${PAL.ink3}` }}></div>)}
      <Txt x={sx(hd + SAMPLES_DNS.format / 2)} y={yOf(4) + 22} anchor="mid" mono fs={18} color={PAL.ink2} a={E(t, 2.5)}>String.format → java.util.Formatter … (JDK frames, folded)</Txt>
      <Txt x={sx(SAMPLES_DNS.parse + SAMPLES_DNS.query / 2)} y={yOf(4) + 22} anchor="mid" mono fs={18} color={PAL.violet} a={E(t, 27)}>nothing above query: all self time</Txt>
      <Badge x={sx(SAMPLES_DNS.parse / 2) + 30} y={yOf(3) - 26} text="parse 2 %" tone="blue" a={E(t, 30)} fs={17} />
      <Badge x={sx(T) - 90} y={yOf(3) - 26} text="toJson 3 %" tone="green" a={E(t, 30)} fs={17} />
      <Callout x={96} y={236} w={860} tone="pull" fs={21} a={win(t, 19.5, 34)} text="Wide at the top = hot. `format` alone: **68 %** of the samples, two thirds of a core spent in `String.format`." />
      <Callout x={96} y={236} w={860} tone="ink" fs={21} a={win(t, 34, 40.3)} text="Tall, thin towers are just deep call chains. They only matter if they're **wide**." />
      <Callout x={96} y={236} w={860} tone="flow" fs={21} a={E(t, 40.5)} text="Fix the widest plateau first: build that string without `String.format` in the hot path. Then profile again." />
    </React.Fragment>
  );
}
