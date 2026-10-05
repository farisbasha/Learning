// 8.5 scenes, part 3: the real age table, premature promotion, card table + write barrier, safepoints, counted loops.
// Every log line shown here was printed by JDK 17 (Homebrew 17.0.17) running Server.java / Tts.java.
const { PAL, MOTION, lin, lerp, win, pulse, step, track, track1, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Badge, Callout, Mark, Brace, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

// ── The age table, for real ────────────────────────────────────────────────
export function SAgeLog({ t }) {
  // which GC the histogram shows
  const g = t < 6.5 ? -1 : t < 12 ? 0 : t < 19.5 ? 1 : t < 26.5 ? Math.min(14, 1 + Math.floor((t - 19.5) / 0.5)) : t < 27 ? 14 : 15;
  const ages = g < 0 ? {} : g === 0 ? { 1: 2959976 } : g === 15 ? { 1: 1280072 } : { 1: 1280072, [g + 1]: 1679824 };
  const PX = 1130, BASE = 600, SC = 300 / 2959976;
  const tenured = g === 15 ? E(t, 27.2, 0.8) : 0;
  return (
    <React.Fragment>
      <Console x={96} y={196} w={1000} h={704} t={t} fs={17} lh={28} title="terminal · JDK 17 · Serial GC · abridged" a={E(t, 0.4)} items={[
        { at: 0.8, text: 'java -XX:+UseSerialGC -Xmx256m -Xmn64m \\', kind: 'cmd' },
        { at: 0.9, text: '    -Xlog:gc,gc+age=trace,gc+heap=info Server 1000000' },
        { at: 6.5, text: '[0.038s][trace][gc,age] GC(0) Age table with threshold 15 (max threshold 15)', kind: 'dim' },
        { at: 6.8, text: '[0.038s][trace][gc,age] GC(0) - age   1:    2959976 bytes,    2959976 total' },
        { at: 7.1, text: '[0.038s][info ][gc     ] GC(0) Pause Young (Allocation Failure) 51M->2M(121M) 2.800ms', kind: 'dim' },
        { at: 12, text: '[0.049s][trace][gc,age ] GC(1) - age   1:    1280072 bytes,    1280072 total' },
        { at: 12.4, text: '[0.049s][trace][gc,age ] GC(1) - age   2:    1679824 bytes,    2959896 total', kind: 'ok' },
        { at: 12.7, text: '[0.049s][info ][gc     ] GC(1) Pause Young (Allocation Failure) 54M->2M(121M) 1.790ms', kind: 'dim' },
        { at: 20, text: '[0.059s][trace][gc,age ] GC(2) - age   1:    1280072 bytes,    1280072 total' },
        { at: 20.2, text: '[0.059s][trace][gc,age ] GC(2) - age   3:    1679824 bytes,    2959896 total', kind: 'ok' },
        { at: 20.5, text: '[0.067s][trace][gc,age ] GC(3) - age   1:    1280072 bytes,    1280072 total' },
        { at: 20.7, text: '[0.067s][trace][gc,age ] GC(3) - age   4:    1679824 bytes,    2959896 total', kind: 'ok' },
        { at: 21.5, text: '   …' , kind: 'dim' },
        { at: 26.5, text: '[0.142s][trace][gc,age ] GC(14) - age   1:    1280072 bytes,    1280072 total' },
        { at: 26.7, text: '[0.142s][trace][gc,age ] GC(14) - age  15:    1679824 bytes,    2959896 total', kind: 'ok' },
        { at: 27.2, text: '[0.149s][trace][gc,age ] GC(15) - age   1:    1280072 bytes,    1280072 total' },
        { at: 27.5, text: '[0.149s][info ][gc,heap] GC(15) Tenured: 0K(65536K)->1640K(65536K)', kind: 'ok' },
        { at: 34.5, text: 'java -XX:MaxTenuringThreshold=17 Server 1000', kind: 'cmd' },
        { at: 35.2, text: 'uintx MaxTenuringThreshold=17 is outside the allowed range [ 0 ... 16 ]', kind: 'err' },
        { at: 35.6, text: 'Error: Could not create the Java Virtual Machine.', kind: 'err' },
      ]} />
      <Panel x={PX} y={196} w={694} h={470} title="age table" right={g >= 0 ? `GC(${g})` : ''} tone="pull" a={E(t, 1.2)} />
      <div style={{ position: 'absolute', left: PX + 24, top: BASE, width: 646, height: 2, background: PAL.line2, opacity: E(t, 1.4) }}></div>
      {Array.from({ length: 15 }).map((_, i) => {
        const age = i + 1, v = ages[age] || 0;
        const h = v * SC;
        const c = age === 1 ? (g === 0 ? PAL.ink2 : PAL.pull) : PAL.flow;
        const x = PX + 30 + i * 42;
        return (
          <React.Fragment key={age}>
            {v > 0 && <div style={{ position: 'absolute', left: x, top: BASE - h, width: 34, height: h, background: hexA(c, 0.32), border: `2px solid ${c}`, borderBottom: 'none', borderRadius: '6px 6px 0 0', boxSizing: 'border-box' }}></div>}
            <Txt x={x + 17} y={BASE + 10} anchor="mid" mono fs={17} color={v > 0 ? PAL.ink : PAL.ink3} a={E(t, 1.4)}>{age}</Txt>
          </React.Fragment>
        );
      })}
      <Txt x={PX + 24} y={BASE + 34} mono fs={17} color={PAL.ink3} a={E(t, 1.4)}>age (minor GCs survived) →</Txt>
      <Badge x={PX + 347} y={290} text="age 1: 1,280,072 B = 20,000 × 64 B · sessions" tone="pull" a={win(t, 12.5, 26.5)} fs={17} />
      <Badge x={PX + 347} y={330} text="1,679,824 B · cache + sessions array + startup" tone="flow" a={win(t, 19.8, 34.3)} fs={17} />
      <Panel x={PX} y={690} w={694} h={150} title="old generation" right={tenured > 0.01 ? '0 KB → 1,640 KB' : '0 KB'} tone="violet" a={E(t, 1.6)} />
      <div style={{ position: 'absolute', left: PX + 24, top: 760, width: 646, height: 50, borderRadius: 8, border: `2px solid ${PAL.line2}`, boxSizing: 'border-box', opacity: E(t, 7) }}></div>
      <div style={{ position: 'absolute', left: PX + 26, top: 762, width: 240 * tenured, height: 46, borderRadius: 6, background: hexA(PAL.flow, 0.35), boxShadow: tenured > 0.5 ? `0 0 20px ${hexA(PAL.flow, 0.6 * pulse(t, [28], 1.5))}` : 'none' }}></div>
      <Txt x={PX + 290} y={772} mono fs={17} color={PAL.flow} a={tenured}>promoted at GC(15)</Txt>
      <Callout x={PX} y={856} w={694} tone="pull" a={E(t, 36)} fs={17} text="16 is allowed and means **never promote by age**. 17 does not fit in 4 bits." />
    </React.Fragment>
  );
}

// ── Premature promotion ────────────────────────────────────────────────────
export function SPremature({ t }) {
  // old-gen occupancy (fraction of 45,056 KB): real endpoints only are labelled
  const occ = t < 26 ? 3986 / 45056 : t < 32.5 ? lerp(4161, 45035, lin(t, 26, 6.3)) / 45056 : lerp(45035, 3664, M(t, 32.5, 0.8)) / 45056;
  const full = t >= 32.5;
  const spill = M(t, 13, 1.4);
  const OX = 820, OW = 1004;
  return (
    <React.Fragment>
      <Box x={96} y={220} w={360} h={150} label="eden" sub="3,328 KB · fills fast" tone="flow" a={E(t, 0.6)} fs={26} sfs={17} glow={pulse(t, [26.5, 27.5, 28.5, 29.5, 30.5, 31.5], 0.5) * 0.6} />
      <HArrow x1={460} x2={516} y={295} a={E(t, 6.5)} color={PAL.flow} />
      <Box x={520} y={245} w={230} h={100} label="survivor" sub="384 KB each" tone="pull" a={E(t, 6.5)} fs={22} sfs={17} glow={win(t, 6.5, 13) * 0.6} />
      <Box x={520 + spill * 40} y={385 - spill * 10} w={300} h={56} label="sessions · 1,250 KB" fs={18} tone="bad" a={E(t, 7.5) * (1 - E(t, 19.5, 0.5))} />
      <Arrow pts={[[750, 280], [785, 280], [785, 312], [OX - 6, 312]]} draw={M(t, 13, 0.8)} color={PAL.bad} width={3} />
      <Txt x={760} y={196} mono fs={17} color={PAL.bad} a={E(t, 13.4)}>overflow → promoted early</Txt>
      <Badge x={635} y={226} text="new threshold 2" tone="pull" a={E(t, 12.8) * (1 - E(t, 40, 0.5))} fs={17} />

      <Panel x={OX} y={230} w={OW} h={170} title="old generation" right="45,056 KB" tone={full && t < 36 ? 'bad' : 'violet'} a={E(t, 0.8)} glow={pulse(t, [32.5], 1.6)} />
      <div style={{ position: 'absolute', left: OX + 24, top: 296, width: OW - 48, height: 60, borderRadius: 8, border: `2px solid ${PAL.line2}`, boxSizing: 'border-box', opacity: E(t, 1) }}></div>
      <div style={{ position: 'absolute', left: OX + 26, top: 298, width: (OW - 52) * occ, height: 56, borderRadius: 6, opacity: E(t, 1),
        background: `repeating-linear-gradient(90deg, ${hexA(PAL.flow, 0.4)} 0 ${(OW - 52) * (3664 / 45056)}px, ${hexA(PAL.bad, 0.35)} ${(OW - 52) * (3664 / 45056)}px 100%)` }}></div>
      <Txt x={OX + 30} y={364} mono fs={17} color={PAL.flow} a={E(t, 2)}>live: cache etc.</Txt>
      <Txt x={OX + OW - 30} y={364} anchor="right" mono fs={17} color={PAL.bad} a={win(t, 20, 36)}>dead sessions pile up here</Txt>

      <Console x={96} y={440} w={1728} h={340} t={t} fs={17} lh={30} title="terminal · JDK 17 · -Xmx48m -Xmn4m · abridged" a={E(t, 0.8)} items={[
        { at: 1, text: 'java -XX:+UseSerialGC -Xmx48m -Xmn4m -Xlog:gc,gc+age=debug,gc+heap=info Server 3000000', kind: 'cmd' },
        { at: 7, text: '[0.081s][info ][gc,heap] GC(16) DefNew: 3677K(3712K)->349K(3712K) Eden: 3328K(3328K)->0K(3328K) From: 349K(384K)->349K(384K)' },
        { at: 12.6, text: '[0.081s][debug][gc,age ] GC(16) Desired survivor size 196608 bytes, new threshold 2 (max threshold 15)', kind: 'ok' },
        { at: 26, text: '[0.081s][info ][gc,heap] GC(16) Tenured: 3986K(45056K)->4161K(45056K)' },
        { at: 26.8, text: '[0.082s][info ][gc,heap] GC(17) Tenured: 4161K(45056K)->4336K(45056K)' },
        { at: 27.6, text: '[0.083s][info ][gc,heap] GC(18) Tenured: 4336K(45056K)->4511K(45056K)' },
        { at: 28.6, text: '   …  233 more minor GCs, ~175K promoted each time  …', kind: 'dim' },
        { at: 32.5, text: '[0.274s][info ][gc,heap] GC(252) Tenured: 45035K(45056K)->3664K(45056K)', kind: 'err' },
        { at: 33, text: '[0.274s][info ][gc     ] GC(252) Pause Full (Allocation Failure) 47M->3M(47M) 9.411ms', kind: 'err' },
      ]} />
      <Box x={96} y={796} w={560} h={104} align="left" label="-Xmn4m" sub="1,074 minor GCs · 4 full GCs" tone="bad" a={E(t, 40)} fs={26} sfs={20} />
      <Box x={680} y={796} w={560} h={104} align="left" label="-Xmn32m" sub="133 minor GCs · 0 full GCs" tone="flow" a={E(t, 41)} fs={26} sfs={20} />
      <Callout x={1264} y={796} w={560} tone="pull" a={E(t, 47)} fs={20} title="the fix" text="A **bigger young gen**: the sessions die there, cheaply, and never reach old." />
    </React.Fragment>
  );
}

// ── Card table + write barrier ─────────────────────────────────────────────
export function SCardTable({ t }) {
  const NC = 24, CW = 70, OX = 120, OY = 510;
  const cardX = (i) => OX + i * CW;
  const dirtyAt = { 11: 31.8, 14: 33.6 };
  const cleaned = t >= 46;
  const isDirty = (i) => dirtyAt[i] != null && t >= dirtyAt[i] && !cleaned;
  const gcScan = win(t, 39, 46);
  const youngLive = t >= 40;
  const bigScan = t >= 18.5 && t < 24 ? lin(t, 18.5, 4) : -1;
  const youngObjs = [[150, 300, 6], [330, 300, 7.2], [510, 300, 8.4], [690, 300, 9.6]];
  const olds = [[0, 4, 'byte[2048]', 'ink'], [4, 4, 'byte[2048]', 'ink'], [9, 8, 'sessions · Object[20000]', 'pull'], [18, 3, 'byte[2048]', 'ink'], [21, 3, 'Node[]', 'ink']];
  return (
    <React.Fragment>
      <Panel x={96} y={196} w={780} h={210} title="young generation" right="minor GC scans this" tone="flow" a={E(t, 0.5)} />
      {youngObjs.map(([x, y, at], i) => (
        <Box key={i} x={x} y={y} w={150} h={56} label="byte[48]" fs={18} tone={youngLive ? 'flow' : t >= 12 && t < 18.5 ? 'bad' : 'pull'} a={E(t, at)} glow={youngLive ? pulse(t, [40.5 + i * 0.2], 1) : 0} />
      ))}
      <Badge x={490} y={260} text="reachable only from old?" tone="bad" a={win(t, 12, 18.3)} fs={17} />
      <Code x={920} y={196} w={904} h={210} title="sessions[id % N] = new byte[48];  → the JIT emits" lang="plain" fs={17} lh={34} a={E(t, 6)}
        hl={t < 31.5 ? 0 : 2} hlA={E(t, 6.5)}
        lines={['store [elem], obj         ; the reference store', 'shr   card, elem, 9        ; address / 512 = card index', 'mov   byte [ct + card], 0  ; mark the card dirty', '                            (Serial/Parallel, conceptually)'].map((s, i) => ({ s, o: i === 0 ? 1 : E(t, 31.5 + i * 0.3) }))} />

      <Panel x={96} y={450} w={1728} h={170} title={t >= 25.5 ? 'old generation · cut into 512-byte cards' : 'old generation'} tone="violet" a={E(t, 1)} />
      {olds.map(([c, n, l, tone], i) => (
        <Box key={i} x={cardX(c) + 4} y={OY + 10} w={n * CW - 8} h={64} label={l} fs={n > 4 ? 19 : 16} tone={tone} a={E(t, 1.4 + i * 0.1)} glow={i === 2 ? win(t, 6, 12) * 0.7 : 0} />
      ))}
      {t >= 25.5 && Array.from({ length: NC + 1 }).map((_, i) => <div key={i} style={{ position: 'absolute', left: cardX(i), top: OY - 6, width: 0, height: 98, borderLeft: `1.5px dashed ${hexA(PAL.violet, 0.5)}`, opacity: E(t, 25.5 + i * 0.03) }}></div>)}
      {isDirty(11) || isDirty(14) || gcScan > 0 ? [11, 14].map((i) => <div key={i} style={{ position: 'absolute', left: cardX(i), top: OY - 6, width: CW, height: 98, background: hexA(PAL.pull, isDirty(i) ? 0.16 + 0.25 * gcScan : 0), opacity: 1 }}></div>) : null}
      {bigScan >= 0 && <div style={{ position: 'absolute', left: OX, top: OY - 6, width: NC * CW * bigScan, height: 98, background: hexA(PAL.bad, 0.12), borderRight: `3px solid ${PAL.bad}` }}></div>}
      <Badge x={1460} y={470} text="scan the whole old gen every minor GC? far too slow" tone="bad" a={win(t, 19, 25.3)} fs={17} />

      {[[11, 0], [14, 2]].map(([c, yi]) => {
        const sx = cardX(c) + CW / 2;
        const [yx] = youngObjs[yi];
        return <Arrow key={c} pts={[[sx, OY + 8], [sx, 428], [yx + 75, 428], [yx + 75, 360]]} a={E(t, 6.5 + yi * 1.2)} color={youngLive ? PAL.flow : PAL.pull} width={2.4} />;
      })}

      <Txt x={OX} y={650} mono fs={17} color={PAL.ink3} a={E(t, 25.5)}>CARD TABLE · one byte per card · ff = clean, 00 = dirty</Txt>
      {Array.from({ length: NC }).map((_, i) => {
        const d = isDirty(i);
        return <Box key={i} x={cardX(i) + 3} y={678} w={CW - 6} h={52} label={d ? '00' : 'ff'} fs={19} tone={d ? 'pull' : 'dim'} a={E(t, 25.8 + i * 0.03)} glow={d ? pulse(t, [dirtyAt[i]], 1.2) + gcScan * 0.6 : 0} />;
      })}
      <Txt x={OX} y={746} fs={20} color={PAL.flow} a={gcScan}>minor GC: treat objects on dirty cards as extra roots → scanned <b>2 of 24</b> cards</Txt>
      <Txt x={OX} y={746} fs={20} color={PAL.ink2} a={E(t, 46) * (1 - E(t, 52.6, 0.4))}>after the GC the cards are cleaned (ff) until the next store</Txt>

      <Console x={96} y={790} w={1728} h={128} t={t} fs={17} lh={30} title="G1 · JDK 17 · gc+phases=debug" a={E(t, 53)} items={[
        { at: 53.2, text: "java -Xmx256m -Xlog:gc+phases=debug Server 6000000 | grep -E 'GC\\(9\\).*Scan'", kind: 'cmd' },
        { at: 54, text: '[0.308s][debug][gc,phases] GC(9)       Scanned Cards:                 Min: 44, Avg: 56.7, Max: 73, Diff: 29, Sum: 170, Workers: 3', kind: 'ok' },
      ]} />
    </React.Fragment>
  );
}

// ── Safepoints: a timeline ─────────────────────────────────────────────────
const LX = (s) => 360 + (s - 2) * 32;
function Lane({ y, t, label, sub, a, segs, polls, pollA }) {
  // segs: [[from, to, kind]] kinds: run | park | native | wait | gc | blocked
  const col = { run: PAL.flow, park: PAL.ink3, native: PAL.violet, wait: PAL.pull, gc: PAL.flow, blocked: PAL.bad, idle: PAL.ink3 };
  return (
    <React.Fragment>
      <Txt x={96} y={y + 2} mono fs={18} weight={600} color={PAL.ink} a={a}>{label}</Txt>
      <Txt x={96} y={y + 26} mono fs={17} color={PAL.ink3} a={a}>{sub}</Txt>
      <div style={{ position: 'absolute', left: LX(2), top: y + 22, width: LX(46) - LX(2), height: 2, background: PAL.line, opacity: a }}></div>
      {segs.map(([s0, s1, k, lbl], i) => {
        if (t < s0) return null;
        const e = Math.min(t, s1);
        const c = col[k];
        const hatched = k === 'park' || k === 'native' || k === 'blocked' || k === 'idle';
        return (
          <div key={i} style={{ position: 'absolute', left: LX(s0), top: y + 4, width: Math.max(0, LX(e) - LX(s0)), height: 38, boxSizing: 'border-box', borderRadius: 6, opacity: a,
            background: hatched ? `repeating-linear-gradient(45deg, ${hexA(c, 0.12)} 0 6px, ${hexA(c, 0.32)} 6px 9px)` : hexA(c, k === 'gc' ? 0.45 : 0.28), border: `1.5px solid ${hexA(c, 0.9)}`,
            font: `500 17px ${MONO}`, color: PAL.ink, display: 'flex', alignItems: 'center', paddingLeft: 8, whiteSpace: 'nowrap', overflow: 'hidden' }}>{lbl}</div>
        );
      })}
      {(polls || []).map((p, i) => <div key={'p' + i} style={{ position: 'absolute', left: LX(p) - 1.5, top: y - 6, width: 3, height: 58, background: PAL.pull, opacity: a * (t >= p - 6 ? 0.9 : 0.35) * (pollA == null ? 1 : pollA) }}></div>)}
    </React.Fragment>
  );
}
export function SSafepoints({ t }) {
  const REQ = 20.5, P1 = 21.4, P2 = 24.6, GC0 = 24.8, GC1 = 37.8;
  const now = Math.min(t, 46);
  const pollA = 0.5 + 0.5 * win(t, 13, 19.5);
  return (
    <React.Fragment>
      <Txt x={LX(2)} y={200} mono fs={17} color={PAL.ink3} a={E(t, 0.5)}>TIME →</Txt>
      <Txt x={1824} y={196} anchor="right" mono fs={17} color={PAL.pull} a={E(t, 0.8)}>orange ticks = polls in compiled code</Txt>
      <Lane y={250} t={t} a={E(t, 1)} label="http-1" sub="running Java" polls={[5, 8.6, 12.2, 15.8, 19.2, 21.4, 29, 33, 41.5, 44.5]} pollA={pollA}
        segs={[[2, P1, 'run'], [P1, GC1, 'park', 'parked at poll'], [GC1, 46, 'run']]} />
      <Lane y={350} t={t} a={E(t, 1.2)} label="http-2" sub="running Java" polls={[6.2, 11.5, 16.8, 24.6, 30, 35, 42.6]} pollA={pollA}
        segs={[[2, P2, 'run'], [P2, GC1, 'park', 'parked'], [GC1, 46, 'run']]} />
      <Lane y={450} t={t} a={E(t, 1.4)} label="http-3" sub="in native: socket read" segs={[[2, 30, 'native', 'native code · already safe'], [30, GC1, 'blocked', 'waits to re-enter Java'], [GC1, 46, 'run']]} />
      <Lane y={550} t={t} a={E(t, 1.6)} label="VM thread" sub="runs the GC" segs={[[2, REQ, 'idle'], [REQ, GC0, 'wait', 'waiting…'], [GC0, GC1, 'gc', 'at safepoint: GC work (mark, copy)'], [GC1, 46, 'idle']]} />
      <div style={{ position: 'absolute', left: LX(now) - 1, top: 236, width: 2, height: 380, background: PAL.ink, opacity: 0.55 * E(t, 1) }}></div>
      <div style={{ position: 'absolute', left: LX(REQ) - 1, top: 236, width: 2, height: 380, background: PAL.bad, opacity: E(t, REQ) }}></div>
      <Badge x={LX(REQ) + 8} y={226} text="safepoint requested: polls armed" tone="bad" a={E(t, REQ)} fs={17} anchor="left" />
      <Brace x={LX(REQ)} y={630} w={LX(P2) - LX(REQ)} label="time to safepoint" tone="pull" a={E(t, 33)} fs={17} />
      <Brace x={LX(REQ)} y={690} w={LX(GC1) - LX(REQ)} label="pause the app sees = TTS + GC work" tone="bad" a={E(t, 40)} fs={17} />
      <Callout x={96} y={770} w={1728} tone="violet" a={win(t, 6.5, 12.8)} fs={20} title="oop maps" text="For each poll site, the JIT records which stack slots and registers hold object references. That map is only valid **at** a safepoint." />
      <Callout x={96} y={770} w={1728} tone="pull" a={win(t, 13, 19.3)} fs={20} title="the poll" text="A load of a per-thread polling word. Disarmed, it costs almost nothing. Armed, it traps the thread into the VM (thread-local handshakes, JDK 10+)." />
      <Callout x={96} y={770} w={1728} tone="violet" a={win(t, 26.5, 32.8)} fs={20} title="native code" text="A thread in JNI code touches no raw Java pointers, so it counts as stopped. Only its return into Java is blocked." />
    </React.Fragment>
  );
}

// ── Counted loops and time to safepoint ────────────────────────────────────
const TX = (s) => 1010 + (s - 6) * 23;
export function SCountedLoop({ t }) {
  const REQ = 13.5, END = 26.5, GCE = 27.3;
  const lane = (y, label, segs, a) => (
    <React.Fragment>
      <Txt x={1010} y={y - 26} mono fs={17} color={PAL.ink2} a={a}>{label}</Txt>
      {segs.map(([s0, s1, k, lbl], i) => {
        if (t < s0) return null;
        const c = { run: PAL.flow, loop: PAL.pull, park: PAL.ink3, gc: PAL.flow }[k];
        const hatched = k === 'park';
        return <div key={i} style={{ position: 'absolute', left: TX(s0), top: y, width: Math.max(0, TX(Math.min(t, s1)) - TX(s0)), height: 30, boxSizing: 'border-box', borderRadius: 5, opacity: a, overflow: 'hidden', whiteSpace: 'nowrap',
          background: hatched ? `repeating-linear-gradient(45deg, ${hexA(c, 0.12)} 0 6px, ${hexA(c, 0.34)} 6px 9px)` : hexA(c, 0.3), border: `1.5px solid ${c}`, font: `500 17px ${MONO}`, color: PAL.ink, paddingLeft: 6, display: 'flex', alignItems: 'center' }}>{lbl}</div>;
      })}
    </React.Fragment>
  );
  const fixA = E(t, 35);
  return (
    <React.Fragment>
      <Code x={96} y={196} w={860} h={300} title="Tts.java" fs={18} lh={30} a={E(t, 0.5) * (1 - fixA)} hl={2} hlA={win(t, 1, 34)}
        lines={['static int spin(int n) {', '    int h = 1;', '    for (int i = 0; i < n; i++) h = h * 31 + i;   // counted', '    return h;', '}', '// worker: spin(Integer.MAX_VALUE)', '// main:   sleep 100 ms, then time System.gc()']} />
      <Code x={96} y={196} w={860} h={300} title="what C2 emits with loop strip mining" fs={18} lh={30} a={fixA}
        lines={['for (int i = 0; i < n; ) {                // outer loop', '    int end = Math.min(i + 1000, n);', '    for (; i < end; i++) h = h * 31 + i;   // inner: no poll', '    safepoint_poll();                     // every 1,000', '}', '// -XX:+UseCountedLoopSafepoints', '// -XX:LoopStripMiningIter=1000'].map((s, i) => ({ s, tone: i === 3 ? 'flow' : undefined }))} />

      <Panel x={990} y={196} w={834} h={300} title="threads" right="time →" a={E(t, 6.5)} />
      {lane(270, 'worker · inside spin()', [[7.5, END, 'loop', 'counted loop · no poll inside'], [END, GCE, 'park'], [GCE, 40, 'run']], E(t, 7))}
      {lane(346, 'main · System.gc()', [[6, REQ, 'run'], [REQ, GCE, 'park', 'waiting for the VM operation'], [GCE, 40, 'run']], E(t, 7.2))}
      {lane(422, 'other threads', [[6, 14.2, 'run'], [14.2, GCE, 'park', 'parked at a poll · waiting'], [GCE, 40, 'run']], E(t, 7.4))}
      <div style={{ position: 'absolute', left: TX(REQ) - 1, top: 236, width: 2, height: 224, background: PAL.bad, opacity: E(t, REQ) }}></div>
      <div style={{ position: 'absolute', left: TX(END) - 1, top: 236, width: 2, height: 224, background: PAL.flow, opacity: E(t, END) }}></div>
      <Badge x={TX(REQ) + 6} y={476} text="armed" tone="bad" a={E(t, REQ)} fs={17} anchor="left" />
      <Badge x={TX(END) + 6} y={476} text="GC: ~5 ms" tone="flow" a={E(t, END)} fs={17} anchor="left" />

      <Console x={96} y={516} w={1728} h={400} t={t} fs={17} lh={30} title="terminal · JDK 17 · real output, abridged" a={E(t, 19.5)} items={[
        { at: 20, text: "java -XX:+UseParallelGC -Xlog:safepoint,gc Tts | grep -E 'System|Safepoint \"Par|returned'", kind: 'cmd' },
        { at: 20.6, text: '[2.364s][info][gc] GC(0) Pause Young (System.gc()) 1M->0M(123M) 0.946ms', kind: 'dim' },
        { at: 20.8, text: '[2.367s][info][gc] GC(1) Pause Full (System.gc()) 0M->0M(123M) 3.503ms', kind: 'dim' },
        { at: 21.3, text: '[2.367s][info][safepoint] Safepoint "ParallelGCSystemGC", … Reaching safepoint: 2211175541 ns, … At safepoint: 4655167 ns, Total: 2215969208 ns', kind: 'err' },
        { at: 22, text: 'System.gc() returned after 2216 ms', kind: 'err' },
        { at: 42, text: "java -XX:+UseG1GC -Xlog:safepoint Tts | grep -E 'G1CollectFull|returned'", kind: 'cmd' },
        { at: 42.6, text: '[0.148s][info][safepoint] Safepoint "G1CollectFull", … Reaching safepoint: 37209 ns, … At safepoint: 1102292 ns, Total: 1141959 ns', kind: 'ok' },
        { at: 43, text: 'System.gc() returned after 1 ms', kind: 'ok' },
        { at: 49, text: "java -XX:+UseParallelGC -Xlog:safepoint TtsLong | grep -E 'SystemGC|returned'     # for (long i = 0; …)", kind: 'cmd' },
        { at: 49.6, text: '[2.327s][info][safepoint] Safepoint "ParallelGCSystemGC", … Reaching safepoint: 2160828334 ns, … At safepoint: 3839250 ns, Total: 2164754750 ns', kind: 'err' },
        { at: 50, text: 'System.gc() returned after 2165 ms', kind: 'err' },
      ]} />
      <Badge x={1500} y={542} text="reaching: 2.21 s · GC work: 4.7 ms" tone="bad" a={win(t, 28, 41.6)} fs={17} solid />
    </React.Fragment>
  );
}
