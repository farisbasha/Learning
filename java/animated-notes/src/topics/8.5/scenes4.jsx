// 8.5 scenes, part 4: TLAB allocation, the three-way trade, leaks, traps, recap.
const { PAL, MOTION, lin, lerp, win, pulse, step, track, track1, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Badge, Callout, Mark, Brace, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

// ── Allocation is a pointer bump ───────────────────────────────────────────
const REQ_BLOCKS = [[20, 'sb', 'ink'], [30, '', 'ink'], [120, 'body', 'ink'], [16, '', 'ink'], [36, 'sess', 'pull']];
export function STLAB({ t }) {
  const SY = 262, SH = 100;
  // T1's first TLAB spans 96..596; allocations fill it from the left
  const allocs = [];
  let x = 100;
  for (let r = 0; r < 3; r++) REQ_BLOCKS.forEach(([w, l, tone], k) => { allocs.push({ x, w, l, tone, at: (r === 0 ? 12.8 : r === 1 ? 20.5 : 23) + k * (r === 0 ? 1.2 : 0.35) }); x += w + 2; });
  const fit = allocs.filter((a) => a.x + a.w <= 592);
  const overflow = allocs.find((a) => a.x + a.w > 592);
  const shown = fit.filter((a) => t >= a.at);
  const top = shown.length ? shown[shown.length - 1].x + shown[shown.length - 1].w + 2 : 100;
  const refill = t >= 27.5;
  const edenTop = track1(t, [[0, 1408], [27.6, 1408], [28.6, 1808]]);
  const newTop = refill ? 1412 + (t >= 29.2 ? 122 : 0) : null;
  const tl = (x0, w, label, tone, a) => (
    <React.Fragment>
      <div style={{ position: 'absolute', left: x0, top: SY, width: w, height: SH, boxSizing: 'border-box', borderRadius: 8, border: `2px solid ${toneColor(tone)}`, background: hexA(toneColor(tone), 0.05), opacity: a }}></div>
      <Txt x={x0 + 8} y={SY + SH + 8} mono fs={17} color={toneColor(tone)} a={a}>{label}</Txt>
    </React.Fragment>
  );
  return (
    <React.Fragment>
      <Txt x={96} y={196} mono fs={17} color={PAL.ink3} a={E(t, 0.5)}>{t < 6 ? 'EDEN · after a GC: one contiguous free block' : 'EDEN · carved into per-thread TLABs'}</Txt>
      <div style={{ position: 'absolute', left: 96, top: SY, width: 1728, height: SH, boxSizing: 'border-box', borderRadius: 8, border: `2px dashed ${PAL.flow}`, background: hexA(PAL.flow, 0.04), opacity: E(t, 0.8) * (1 - E(t, 6)) }}></div>
      {tl(96, 500, 'TLAB · thread http-1', 'flow', E(t, 6))}
      {tl(600, 400, 'TLAB · http-2', 'blue', E(t, 6.5))}
      {tl(1004, 400, 'TLAB · http-3', 'violet', E(t, 7))}
      <div style={{ position: 'absolute', left: 1408, top: SY, width: 416, height: SH, boxSizing: 'border-box', borderRadius: 8, border: `2px dashed ${PAL.line2}`, opacity: E(t, 0.8) }}></div>
      <Txt x={1416} y={SY + SH + 8} mono fs={17} color={PAL.ink3} a={E(t, 0.8) * (1 - E(t, 27.5))}>not handed out yet</Txt>
      {refill && tl(1408, 400, 'new TLAB · http-1', 'flow', E(t, 28.6))}
      {[[640, 520], [1044, 360]].map(([x0, w], i) => <div key={i} style={{ position: 'absolute', left: x0, top: SY + 30, width: w * (0.5 + 0.4 * lin(t, 8, 40)) * 0.6, height: 40, borderRadius: 6, background: hexA(i ? PAL.violet : PAL.blue, 0.22), opacity: E(t, 7.5) }}></div>)}
      {shown.map((a, i) => <div key={i} style={{ position: 'absolute', left: a.x, top: SY + 28, width: a.w, height: 44, boxSizing: 'border-box', borderRadius: 4, background: hexA(toneColor(a.tone), a.l === 'body' ? 0.25 : 0.4), border: `1.5px solid ${toneColor(a.tone)}`, font: `500 17px ${MONO}`, color: PAL.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{a.l === 'body' ? 'body' : ''}</div>)}
      {refill && <div style={{ position: 'absolute', left: top, top: SY + 28, width: 592 - top, height: 44, borderRadius: 4, background: `repeating-linear-gradient(45deg, transparent 0 6px, ${hexA(PAL.ink3, 0.4)} 6px 8px)`, opacity: E(t, 27.6) }}></div>}
      {t >= 29.2 && <div style={{ position: 'absolute', left: 1412, top: SY + 28, width: 120, height: 44, boxSizing: 'border-box', borderRadius: 4, background: hexA(PAL.ink2, 0.25), border: `1.5px solid ${PAL.ink2}`, font: `500 17px ${MONO}`, color: PAL.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>body</div>}
      {/* pointers */}
      {!refill && <React.Fragment>
        <div style={{ position: 'absolute', left: top - 10, top: SY - 26, width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: `16px solid ${PAL.pull}`, opacity: E(t, 12) }}></div>
        <Txt x={top + 14} y={SY - 34} mono fs={18} weight={600} color={PAL.pull} a={E(t, 12)}>top</Txt>
        <div style={{ position: 'absolute', left: 586, top: SY - 26, width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: `16px solid ${PAL.bad}`, opacity: E(t, 12) }}></div>
        <Txt x={520} y={SY - 34} anchor="right" mono fs={18} weight={600} color={PAL.bad} a={E(t, 12) * (top < 470 ? 1 : 0)}>end</Txt>
      </React.Fragment>}
      {refill && <React.Fragment>
        <div style={{ position: 'absolute', left: newTop - 10, top: SY - 26, width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: `16px solid ${PAL.pull}` }}></div>
        <Txt x={newTop + 14} y={SY - 34} mono fs={18} weight={600} color={PAL.pull}>top</Txt>
      </React.Fragment>}
      <div style={{ position: 'absolute', left: edenTop - 2, top: SY - 8, width: 4, height: SH + 16, background: PAL.ink, opacity: E(t, 1) * 0.8 }}></div>
      <Txt x={edenTop - 8} y={SY + SH + 40} anchor="right" mono fs={17} color={PAL.ink2} a={E(t, 1)}>eden top (shared, CAS)</Txt>
      {overflow && <Box x={640} y={392} w={300} h={42} label="next body · 1,040 B: no room" fs={17} tone="bad" a={win(t, 26, 28.4)} dashed />}

      <Code x={96} y={440} w={900} h={280} title="fast path · new byte[1024] (1,040 bytes)" fs={18} lh={34} a={E(t, 12.3)} hl={step(t, [[12.5, 1], [14.5, 2], [16.5, 3], [18.5, 4], [20, 5], [26, 3]], -1)} hlA={E(t, 12.5)}
        lines={['// all of this is inlined into the compiled method', 'obj  = tlab.top;', 'next = obj + 1040;', 'if (next > tlab.end) goto slow_path;    // rare', 'tlab.top = next;                        // the bump', 'write mark word + klass + length;  zero the body']} />
      <Panel x={1030} y={440} w={794} h={280} title="slow path · TLAB exhausted" tone="pull" a={win(t, 26, 39.6)}>
        <div style={{ padding: '16px 24px', font: `400 21px ${SANS}`, color: PAL.ink, lineHeight: 1.55 }}>
          {['1. retire the old TLAB: fill its tail with a dummy object', '2. claim a new TLAB: one CAS on eden\'s shared top', '3. eden can\'t supply one? → minor GC', '4. back to the bump in the new TLAB'].map((s, i) => <div key={i} style={{ opacity: E(t, 26.5 + i * 0.9) }}>{s}</div>)}
        </div>
      </Panel>
      <Callout x={1030} y={440} w={794} tone="flow" a={E(t, 40)} fs={21} title="per eden fill" text="Around 200,000 objects (≈45,000 requests). Only **51** of them took the slow path." />
      <Callout x={1030} y={598} w={794} tone="pull" a={E(t, 45.5)} fs={21} title="vs malloc" text="Search free lists, split blocks, coordinate threads. 'Don't allocate in a loop' is dated advice." />

      <Console x={96} y={746} w={1728} h={158} t={t} fs={17} lh={30} title="terminal · JDK 17 · Serial GC · abridged" a={E(t, 33)} items={[
        { at: 33.2, text: 'java -XX:+UseSerialGC -Xmx256m -Xmn64m -Xlog:gc+tlab=debug,gc Server 1000000', kind: 'cmd' },
        { at: 34, text: '[0.127s][debug][gc,tlab] GC(1) TLAB totals: thrds: 1  refills: 51 max: 51 slow allocs: 0 max 0 waste:  0.1% …', kind: 'ok' },
        { at: 34.6, text: '(trace level shows each refill: desired_size: 1049KB)', kind: 'dim' },
      ]} />
    </React.Fragment>
  );
}

// ── The three-way trade ────────────────────────────────────────────────────
export function STradeOff({ t }) {
  const V = { T: [400, 250], L: [150, 660], F: [650, 660] };
  const dot = track(t, [[0, 400, 520], [12, 400, 520], [13, 470, 400], [20, 470, 400], [21, 240, 560], [40, 240, 560], [41, 570, 600]]);
  const TX0 = 800, TW = 990;
  const tx = (f) => TX0 + f * TW;
  const bar = (y, h, segs, a) => segs.map(([f0, f1, k, lbl], i) => {
    const c = { app: PAL.flow, stw: PAL.bad, gc: PAL.violet }[k];
    return <div key={i} style={{ position: 'absolute', left: tx(f0), top: y, width: (f1 - f0) * TW * M(t, 0, 0.01), height: h, boxSizing: 'border-box', borderRadius: 4, background: hexA(c, k === 'app' ? 0.25 : 0.45), border: `1.5px solid ${c}`, opacity: a, font: `500 17px ${MONO}`, color: PAL.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', whiteSpace: 'nowrap' }}>{lbl}</div>;
  });
  const gauge = lin(t, 34, 5);
  return (
    <React.Fragment>
      <svg width="1920" height="1080" style={{ position: 'absolute', left: 0, top: 0, opacity: E(t, 0.5) }}>
        <polygon points={`${V.T.join(',')} ${V.L.join(',')} ${V.F.join(',')}`} fill={hexA(PAL.ink3, 0.06)} stroke={PAL.line2} strokeWidth="2" />
      </svg>
      <Txt x={V.T[0]} y={V.T[1] - 52} anchor="mid" mono fs={22} weight={600} color={PAL.flow} a={E(t, 5)}>THROUGHPUT</Txt>
      <Txt x={V.T[0]} y={V.T[1] - 26} anchor="mid" fs={17} color={PAL.ink2} a={E(t, 5.5)}>time spent in your code</Txt>
      <Txt x={V.L[0]} y={V.L[1] + 14} anchor="mid" mono fs={22} weight={600} color={PAL.pull} a={E(t, 6)}>LATENCY</Txt>
      <Txt x={V.L[0]} y={V.L[1] + 42} anchor="mid" fs={17} color={PAL.ink2} a={E(t, 6.5)}>short pauses</Txt>
      <Txt x={V.F[0]} y={V.F[1] + 14} anchor="mid" mono fs={22} weight={600} color={PAL.violet} a={E(t, 7)}>FOOTPRINT</Txt>
      <Txt x={V.F[0]} y={V.F[1] + 42} anchor="mid" fs={17} color={PAL.ink2} a={E(t, 7.5)}>small heap</Txt>
      <Dot x={dot[0]} y={dot[1]} r={14} color={PAL.pull} a={E(t, 10)} />
      <Txt x={dot[0] + 22} y={dot[1] - 12} mono fs={17} color={PAL.pull} a={E(t, 12) * (t < 40 ? 1 : 0)}>{t < 20 ? 'stop-the-world' : 'concurrent'}</Txt>
      <Txt x={dot[0] - 22} y={dot[1] - 40} anchor="right" mono fs={17} color={PAL.pull} a={E(t, 41)}>small heap</Txt>
      <Callout x={96} y={760} w={640} tone="pull" a={E(t, 44)} fs={20} text="Move toward one corner and you move away from another. 8.6 places each collector here." />

      <Panel x={770} y={196} w={1054} h={706} title="what the app experiences" right="time →" a={E(t, 11.5)} />
      <Txt x={800} y={256} mono fs={18} weight={600} color={PAL.ink} a={E(t, 12)}>stop-the-world</Txt>
      {bar(290, 44, [[0, 0.3, 'app'], [0.3, 0.42, 'stw', 'pause'], [0.42, 0.78, 'app'], [0.78, 0.9, 'stw', 'pause'], [0.9, 1, 'app']], E(t, 12.5))}
      <Txt x={800} y={346} fs={18} color={PAL.ink2} a={E(t, 14)}>all cores collect at once: least total work, but pauses grow with the live data</Txt>

      <Txt x={800} y={410} mono fs={18} weight={600} color={PAL.ink} a={E(t, 20)}>concurrent</Txt>
      {bar(444, 44, [[0, 0.2, 'app'], [0.2, 0.21, 'stw'], [0.21, 0.6, 'app'], [0.6, 0.61, 'stw'], [0.61, 1, 'app']], E(t, 20.5))}
      {bar(496, 34, [[0.2, 0.6, 'gc', 'GC threads, concurrently']], E(t, 21.5))}
      <Txt x={800} y={544} fs={18} color={PAL.ink2} a={E(t, 27)}>pauses of a few ms · costs CPU, plus barriers on every reference access</Txt>

      <Txt x={800} y={604} mono fs={18} weight={600} color={PAL.ink} a={E(t, 33.5)}>headroom · heap during a concurrent cycle</Txt>
      <div style={{ position: 'absolute', left: tx(0), top: 640, width: TW, height: 44, borderRadius: 6, border: `2px solid ${PAL.line2}`, boxSizing: 'border-box', opacity: E(t, 33.5) }}></div>
      <div style={{ position: 'absolute', left: tx(0) + 2, top: 642, width: (0.45 + 0.35 * gauge) * (TW - 4), height: 40, borderRadius: 5, background: `linear-gradient(90deg, ${hexA(PAL.flow, 0.35)} 0 ${0.45 / (0.45 + 0.35 * gauge + 1e-6) * 100}%, ${hexA(PAL.pull, 0.4)} 0)`, opacity: E(t, 33.5) }}></div>
      <Txt x={tx(0.47)} y={694} fs={18} color={PAL.pull} a={E(t, 35)}>allocated while the GC was still working →</Txt>

      <Txt x={800} y={754} mono fs={18} weight={600} color={PAL.ink} a={E(t, 40)}>small heap</Txt>
      {bar(788, 44, Array.from({ length: 9 }).flatMap((_, i) => [[i / 9, i / 9 + 0.085, 'app'], [i / 9 + 0.085, (i + 1) / 9, 'stw']]), E(t, 40.5))}
      <Txt x={800} y={844} fs={18} color={PAL.ink2} a={E(t, 41.5)}>less memory, so collections come far more often</Txt>
    </React.Fragment>
  );
}

// ── A leak is unintentional reachability ───────────────────────────────────
export function SLeak({ t }) {
  const grow = lin(t, 9, 19);
  const n = Math.floor(grow * 70);
  const after = step(t, [[20.5, 7], [21.5, 16], [22.5, 24], [23.5, 24], [24.5, 30], [28, 30]], 0);
  return (
    <React.Fragment>
      <Code x={96} y={196} w={860} h={238} title="Leak.java · the server's cache, with one bug" fs={17} lh={34} a={E(t, 0.5)} hl={3} hlA={E(t, 7)}
        lines={['static final Map<Integer, byte[]> CACHE = new HashMap<>();  // a GC root', '', 'static void handle(int id) {', '    CACHE.computeIfAbsent(id, k -> new byte[2048]);  // bug: not id % 500', '}']} />
      <Panel x={96} y={460} w={860} h={330} title="heap · everything reachable from CACHE" tone="bad" a={E(t, 7.5)} />
      <Box x={126} y={530} w={200} h={60} label="CACHE" sub="GC root" fs={20} sfs={17} tone="violet" a={E(t, 8)} glow={pulse(t, [14.2], 1.4)} />
      <HArrow x1={330} x2={376} y={560} a={E(t, 8.4)} color={PAL.violet} />
      <Box x={380} y={530} w={180} h={60} label="HashMap" fs={20} tone="ink" a={E(t, 8.4)} />
      {Array.from({ length: n }).map((_, i) => {
        const c = i % 10, r = Math.floor(i / 10);
        const hl = i === 47 && t >= 35;
        return <div key={i} style={{ position: 'absolute', left: 590 + c * 34, top: 520 + r * 34, width: 28, height: 28, borderRadius: 5, boxSizing: 'border-box', background: hexA(hl ? PAL.pull : PAL.bad, 0.3), border: `2px solid ${hl ? PAL.pull : PAL.bad}`, boxShadow: hl ? `0 0 16px ${PAL.pull}` : 'none' }}></div>;
      })}
      <Txt x={126} y={620} fs={19} color={PAL.ink2} w={430} a={E(t, 14)}>One new 2 KB entry per request. Every one is reachable from a root, so every one is **live**.</Txt>
      <Arrow pts={[[590 + 7 * 34 + 14, 520 + 4 * 34 + 30], [590 + 7 * 34 + 14, 770], [110, 770], [110, 560], [122, 560]]} draw={M(t, 35.4, 1)} color={PAL.pull} width={3} />
      <Txt x={300} y={738} mono fs={17} color={PAL.pull} a={E(t, 36.2)}>path to GC root</Txt>

      <Console x={990} y={196} w={834} h={420} t={t} fs={17} lh={30} title="terminal · JDK 17 · abridged" a={E(t, 19.5)} items={[
        { at: 20, text: 'java -XX:+UseSerialGC -Xmx32m -Xlog:gc Leak', kind: 'cmd' },
        { at: 20.5, text: 'GC(0) Pause Young (Allocation Failure) 8M->7M(30M)' },
        { at: 21.5, text: 'GC(1) Pause Young (Allocation Failure) 16M->16M(30M)' },
        { at: 22.5, text: 'GC(2) Pause Young (Allocation Failure) 24M->24M(30M)' },
        { at: 23.5, text: 'GC(3) Pause Full (Allocation Failure) 24M->24M(30M)', kind: 'err' },
        { at: 24.5, text: 'GC(4) Pause Full (Allocation Failure) 30M->30M(30M)', kind: 'err' },
        { at: 25.5, text: '…  12 more full GCs, 30M->30M each', kind: 'dim' },
        { at: 27, text: '15000 requests, cache size 15001', kind: 'dim' },
        { at: 28, text: 'Exception in thread "main"', kind: 'err' },
        { at: 28.3, text: '    java.lang.OutOfMemoryError: Java heap space', kind: 'err' },
      ]} />
      <Panel x={990} y={640} w={834} h={150} title="heap in use after each GC" right={after ? `${after} MB of 30` : ''} tone="bad" a={E(t, 20)} />
      <div style={{ position: 'absolute', left: 1014, top: 706, width: 786, height: 50, borderRadius: 8, border: `2px solid ${PAL.line2}`, boxSizing: 'border-box', opacity: E(t, 20) }}></div>
      <div style={{ position: 'absolute', left: 1016, top: 708, width: 782 * (after / 30) * M(t, 20.4, 0.01), height: 46, borderRadius: 6, background: hexA(PAL.bad, 0.4), transition: 'none' }}></div>
      <Callout x={96} y={812} w={1100} tone="pull" a={E(t, 35)} fs={20} title="hunting it" text="Not 'who forgot to free?' but 'which path from a root keeps this alive?' Take a heap dump (8.9)." />
      <Card x={1230} y={812} w={594} h={96} a={E(t, 42)} tone="flow" title="Garbage = unreachable. Not 'unused'." tfs={24} />
    </React.Fragment>
  );
}

// ── Traps ──────────────────────────────────────────────────────────────────
const TRAPS = [
  [3.5, '“Java counts references”', 'It traces **reachability** from GC roots. Cycles are collected.'],
  [10, '“Frequent full GCs? Give old gen more room”', 'Often **premature promotion**: grow the **young** gen.'],
  [16.5, '“Allocation is expensive”', 'A **pointer bump** in a TLAB; dead objects cost nothing to collect.'],
  [23, "“A long pause is the collector's work”", 'Check **time to safepoint**: one counted loop can stall every thread.'],
  [29.5, '“Low pauses, high throughput, small heap”', 'Pick a point on the trade-off. Each gain is paid for elsewhere.'],
];
export function STraps({ t }) {
  return TRAPS.map(([at, myth, real], i) => {
    const y = 196 + i * 142;
    return (
      <React.Fragment key={i}>
        <Box x={96} y={y} w={760} h={122} label={myth} mono={false} fs={23} tone="bad" a={E(t, at)} strike={t > at + 2} style={{ whiteSpace: 'normal' }} />
        <HArrow x1={870} x2={940} y={y + 61} a={E(t, at + 1.5)} color={PAL.flow} />
        <Card x={956} y={y} w={868} h={122} a={E(t, at + 1.6)} tone="flow" title={real} tfs={24} />
      </React.Fragment>
    );
  });
}

// ── Recap ──────────────────────────────────────────────────────────────────
const RECAP = [
  [3, '1', 'Reachability', 'Live = reachable from GC roots: stacks, statics, JNI, threads. Cycles are collected.'],
  [8, '2', 'Die young', 'Most objects die young. A minor GC pays for survivors only; garbage is free.'],
  [13, '3', 'Three families', 'Mark-sweep fragments, mark-compact moves everything, copying needs space.'],
  [18.5, '4', 'Ages + promotion', 'Age in 4 mark-word bits. Too-small young gen → premature promotion.'],
  [24, '5', 'Barriers + safepoints', 'Card table finds old→young refs. Pause = time to safepoint + GC work.'],
  [29.5, '6', 'Bump + leaks', 'Allocation is a TLAB pointer bump. A leak is unintentional reachability.'],
];
export function SRecap({ t }) {
  return RECAP.map(([at, n, title, sub], i) => <Card key={n} x={96 + (i % 3) * 584} y={210 + Math.floor(i / 3) * 330} w={560} h={300} num={n} title={title} sub={sub} tfs={36} sfs={26} a={E(t, at)} tone={i === 5 ? 'pull' : undefined} glow={i === 5 ? win(t, 30, 40) : 0} />);
}
