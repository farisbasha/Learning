// 8.5 scenes, part 2: the three algorithm families on one small heap, the comparison, generations in motion.
const { PAL, MOTION, lin, lerp, win, pulse, step, track, track1, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, HArrow, VArrow, Arrow, Dot, Card, Badge, Callout, Mark, Table, Brace, Bytes, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

// One small heap shared by mark-sweep, mark-compact and copying: [name, slot, size, live]
const HEAP = [['A', 0, 2, 1], ['B', 2, 1, 0], ['C', 3, 2, 1], ['D', 5, 1, 0], ['E', 6, 2, 1], ['F', 8, 2, 0], ['G', 10, 1, 0], ['H', 11, 2, 1], ['I', 13, 1, 0], ['J', 14, 2, 1]];
const OBJ = Object.fromEntries(HEAP.map((o) => [o[0], o]));

// A heap cell spanning slots [s, s+n) of a strip at (x, y).
function Cell({ x, y, unit, s, n, h = 90, label, sub, tone, a = 1, glow = 0, dashed, free, dot, sfs = 17, fs = 26 }) {
  if (a <= 0.01) return null;
  const c = free ? PAL.ink3 : tone ? toneColor(tone) : PAL.ink2;
  return (
    <div style={{ position: 'absolute', left: x + s * unit + 3, top: y, width: n * unit - 6, height: h, boxSizing: 'border-box', borderRadius: 8, opacity: clamp(a, 0, 1),
      background: free ? `repeating-linear-gradient(45deg, transparent 0 7px, ${hexA(PAL.ink3, 0.22)} 7px 9px)` : hexA(c, tone ? 0.16 : 0.08),
      border: `2px ${dashed || free ? 'dashed' : 'solid'} ${hexA(c, free ? 0.6 : 0.9)}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      boxShadow: glow > 0.01 ? `0 0 ${26 * glow}px ${hexA(c, 0.6 * glow)}` : 'none', overflow: 'hidden' }}>
      {label != null && <div style={{ font: `600 ${fs}px ${MONO}`, color: free ? PAL.ink3 : PAL.ink, whiteSpace: 'nowrap' }}>{label}</div>}
      {sub != null && <div style={{ font: `500 ${sfs}px ${MONO}`, color: free ? PAL.ink3 : c, whiteSpace: 'nowrap', marginTop: 2 }}>{sub}</div>}
      {dot > 0.01 && <div style={{ position: 'absolute', left: 8, top: 8, width: 12, height: 12, borderRadius: 6, background: PAL.flow, opacity: dot, boxShadow: `0 0 10px ${PAL.flow}` }}></div>}
    </div>
  );
}
function Ruler({ x, y, unit, n = 16, a }) {
  return Array.from({ length: n + 1 }).map((_, i) => <Txt key={i} x={x + i * unit} y={y} anchor="mid" mono fs={17} color={PAL.ink3} a={a}>{i}</Txt>);
}
// arc above a strip (bulges up) or below (bulges down)
const arcUp = (x1, x2, y, k, props) => <Arrow from={[x1, y]} to={[x2, y]} curve={x2 > x1 ? -k : k} {...props} />;
const arcDown = (x1, x2, y, k, props) => <Arrow from={[x1, y]} to={[x2, y]} curve={x2 > x1 ? k : -k} {...props} />;

const X0 = 160, U = 100, SY = 400, SH = 90;
const cxOf = (s, n) => X0 + (s + n / 2) * U;
const REFS = [['A', 'C', 64], ['C', 'H', 110], ['E', 'J', 72], ['B', 'D', 46], ['F', 'G', 40]];

// ── Mark-sweep ─────────────────────────────────────────────────────────────
export function SMarkSweep({ t }) {
  const markAt = { A: 6.5, C: 7.2, H: 7.9, E: 8.6, J: 9.3 };
  const sweepX = X0 + lin(t, 12, 6) * 16 * U;
  const passed = (s) => t >= 12 + 6 * (s / 16);
  const holes = [[2, 1], [5, 1], [8, 3], [13, 1]];
  const tries = [32.9, 34.2, 35.5, 36.8];
  const tryIdx = step(t, tries.map((ti, i) => [ti, i]), -1);
  const dt = tryIdx >= 0 ? t - tries[tryIdx] : 0;
  const shake = tryIdx >= 0 && dt > 0.2 && dt < 0.7 ? Math.sin(dt * 50) * 7 : 0;
  const hc = (i) => X0 + (holes[i][0] + holes[i][1] / 2) * U;
  const hx = (i) => clamp(hc(i) - 200, 160, 1420);
  const tokX = track1(t, [[32.2, 1360], [32.9, hx(0)], [33.8, hx(0)], [34.2, hx(1)], [35.1, hx(1)], [35.5, hx(2)], [36.4, hx(2)], [36.8, hx(3)]]);
  return (
    <React.Fragment>
      <Txt x={X0} y={200} mono fs={17} color={PAL.ink3} a={E(t, 0.5)}>HEAP · 16 SLOTS · 10 OBJECTS</Txt>
      {REFS.map(([a, b, k]) => {
        const A = OBJ[a], B = OBJ[b], dead = !A[3];
        const freed = dead && passed(A[1]);
        return <React.Fragment key={a + b}>{arcUp(cxOf(A[1], A[2]) + 10, cxOf(B[1], B[2]) - 10, SY - 4, k, { a: E(t, 1.5) * (dead ? 0.5 : 1) * (freed ? 0 : 1), color: dead ? PAL.ink3 : t >= markAt[b] ? PAL.flow : PAL.ink2, width: 2.2 })}</React.Fragment>;
      })}
      {HEAP.filter((o) => !(t >= 12 && passed(10) && ['F', 'G'].includes(o[0]))).map(([n, s, sz, live]) => {
        const freed = !live && t >= 12 && passed(s);
        return <Cell key={n} x={X0} y={SY} unit={U} s={s} n={sz} h={SH} label={freed ? 'free' : n} sub={freed ? `${sz} slot${sz > 1 ? 's' : ''}` : undefined} free={freed} fs={freed ? 18 : 26}
          tone={live && t >= markAt[n] ? 'flow' : undefined} a={E(t, 0.6 + s * 0.04)} glow={live ? pulse(t, [markAt[n]], 1) : 0} dot={live && t >= markAt[n] && !passed(s) ? 1 : 0} />;
      })}
      {t >= 12 && passed(10) && <Cell x={X0} y={SY} unit={U} s={8} n={3} h={SH} label="free" sub="3 slots, merged" free fs={18} a={1} />}
      <Ruler x={X0} y={SY + SH + 8} unit={U} a={E(t, 1)} />
      {t >= 12 && t < 18.6 && <div style={{ position: 'absolute', left: sweepX - 2, top: SY - 30, width: 4, height: SH + 60, background: PAL.pull, boxShadow: `0 0 16px ${PAL.pull}` }}></div>}
      {t >= 12 && t < 18.6 && <Txt x={sweepX} y={SY - 60} anchor="mid" mono fs={17} color={PAL.pull}>sweep →</Txt>}

      {[['r1', 'A'], ['r2', 'E']].map(([r, o]) => {
        const x = cxOf(OBJ[o][1], OBJ[o][2]);
        return <React.Fragment key={r}><Box x={x - 70} y={576} w={140} h={62} label={r} sub="root" fs={18} sfs={17} tone="violet" a={E(t, 1)} /><VArrow x={x} y1={572} y2={SY + SH + 34} a={E(t, 1.2)} color={PAL.violet} /></React.Fragment>;
      })}

      <Txt x={X0} y={660} mono fs={17} color={PAL.ink3} a={E(t, 19)}>FREE LIST</Txt>
      <Box x={X0} y={690} w={150} h={56} label="head" fs={19} tone="pull" a={E(t, 19.2)} />
      {holes.map(([s, n], i) => (
        <React.Fragment key={s}>
          <HArrow x1={X0 + 154 + i * 240} x2={X0 + 196 + i * 240} y={718} a={E(t, 19.6 + i * 0.5)} color={PAL.pull} />
          <Box x={X0 + 200 + i * 240} y={690} w={190} h={56} label={`@${s} · ${n}`} sub="address · size" fs={20} sfs={17} tone="ink" a={E(t, 19.8 + i * 0.5)} />
        </React.Fragment>
      ))}
      {holes.map(([s, n], i) => <Brace key={'b' + s} x={X0 + s * U + 6} y={SY + SH + 34} w={n * U - 12} label={String(n)} tone="bad" a={win(t, 26, 38.4)} fs={17} />)}
      <Txt x={1340} y={702} fs={22} color={PAL.bad} a={E(t, 26.5)}>6 slots free · largest hole: 3</Txt>

      <Box x={tokX + shake} y={232} w={400} h={64} label="new object · needs 4" fs={20} tone={t >= 37.4 ? 'bad' : 'pull'} a={E(t, 32) * (1 - 0.3 * E(t, 38.5))} dashed />
      {tries.map((ti, i) => <Mark key={i} x={X0 + holes[i][0] * U + holes[i][1] * U / 2} y={350} ok={false} a={E(t, ti + 0.6) * win(t, ti + 0.6, 38.4)} />)}
      <Badge x={1500} y={760} text="allocation fails with 6 slots free" tone="bad" a={E(t, 37.4)} fs={17} solid />
      <Callout x={X0} y={800} w={1664} tone="pull" a={E(t, 38.5)} fs={20} title="cost" text="Marking scales with **live** objects, sweeping with the **whole heap**. Nothing moves, so no pointer fixing, but allocation must search a free list." />
    </React.Fragment>
  );
}

// ── Mark-compact ───────────────────────────────────────────────────────────
const NEWS = { A: 0, C: 2, E: 4, H: 6, J: 8 };
export function SMarkCompact({ t }) {
  const fwdAt = { A: 6.5, C: 8, E: 9.5, H: 11, J: 12.5 };
  const slideAt = { A: 27, C: 27.6, E: 28.6, H: 29.6, J: 30.6 };
  const live = HEAP.filter((o) => o[3]);
  const sOf = (o) => lerp(o[1], NEWS[o[0]], M(t, slideAt[o[0]], 0.9));
  const pass = t < 5.5 ? 0 : t < 19.5 ? 1 : t < 27 ? 2 : t < 34 ? 3 : 4;
  const refRows = [['r1  (root)', '@0', '@0', 20.2], ['r2  (root)', '@6', '@4', 21.4], ['A.next', '@3', '@2', 22.6], ['C.next', '@11', '@6', 23.8], ['E.next', '@14', '@8', 25]];
  const scanX = X0 + lin(t, 5.5, 8) * 16 * U;
  return (
    <React.Fragment>
      <Txt x={X0} y={200} mono fs={17} color={PAL.ink3} a={E(t, 0.5)}>SAME HEAP · MARKED</Txt>
      {REFS.filter(([a]) => OBJ[a][3]).map(([a, b, k]) => {
        const A = OBJ[a], B = OBJ[b];
        return <React.Fragment key={a + b}>{arcUp(cxOf(sOf(A), A[2]) + 10, cxOf(sOf(B), B[2]) - 10, SY - 4, k * (1 - 0.35 * M(t, 27, 4)), { a: E(t, 1.2), color: pass === 2 ? PAL.violet : PAL.flow, width: 2.2 })}</React.Fragment>;
      })}
      {HEAP.filter((o) => !o[3]).map(([n, s, sz]) => <Cell key={n} x={X0} y={SY} unit={U} s={s} n={sz} h={SH} label={n} a={E(t, 0.6) * (1 - E(t, 26.5, 0.5))} />)}
      {live.map((o) => {
        const [n, s, sz] = o;
        const moved = t >= slideAt[n] + 0.9;
        return <Cell key={n} x={X0} y={SY} unit={U} s={sOf(o)} n={sz} h={SH} label={n} tone="flow" a={E(t, 0.6)} dot={1 - E(t, 33)}
          sub={t >= fwdAt[n] && !moved ? `fwd @${NEWS[n]}` : moved ? `@${NEWS[n]}` : `@${s}`} glow={pulse(t, [fwdAt[n], slideAt[n] + 0.9], 1)} sfs={17} />;
      })}
      {t >= 34 && <Cell x={X0} y={SY} unit={U} s={10} n={6} h={SH} label="free" sub="one block · 6 slots" free fs={20} a={E(t, 34)} />}
      <Ruler x={X0} y={SY + SH + 8} unit={U} a={E(t, 1)} />
      {pass === 1 && <div style={{ position: 'absolute', left: scanX - 2, top: SY - 30, width: 4, height: SH + 60, background: PAL.violet, boxShadow: `0 0 16px ${PAL.violet}`, opacity: 1 - E(t, 13.5) }}></div>}
      <div style={{ position: 'absolute', left: X0 + 10 * U - 12, top: SY + SH + 36, width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderBottom: `18px solid ${PAL.pull}`, opacity: E(t, 34.5) }}></div>
      <Txt x={X0 + 10 * U + 22} y={SY + SH + 40} mono fs={18} color={PAL.pull} a={E(t, 34.5)}>top: the next allocation goes here</Txt>

      <Txt x={X0} y={600} mono fs={17} color={PAL.ink3} a={E(t, 2)}>EVERY REFERENCE TO A MOVING OBJECT</Txt>
      <Table x={X0} y={630} cols={[220, 150, 150]} head={['reference', 'before', 'after']} a={E(t, 2)} fs={19} rh={44}
        rows={refRows.map(([r, b, a2, at]) => [r, t >= at ? <span style={{ color: PAL.ink3, textDecoration: 'line-through' }}>{b}</span> : b, <span style={{ color: PAL.flow, opacity: E(t, at) }}>{a2}</span>])}
        marks={Object.fromEntries(refRows.map((r, i) => [i, ['violet', pulse(t, [r[3]], 1.2)]]))} />
      <Callout x={720} y={600} w={1104} tone="violet" a={win(t, 5.5, 19.3)} fs={21} title="pass 1 · compute" text="Walk the heap in address order. Each live object's new address is the total size of the live objects before it." />
      <Callout x={720} y={600} w={1104} tone="violet" a={win(t, 19.5, 26.8)} fs={21} title="pass 2 · update" text="Rewrite every reference, in roots and in object fields, to the new address. Nothing has moved yet." />
      <Callout x={720} y={600} w={1104} tone="flow" a={win(t, 27, 33.8)} fs={21} title="pass 3 · move" text="Slide each object down to its new home, lowest address first, so nothing live is overwritten." />
      <Callout x={720} y={600} w={1104} tone="flow" a={E(t, 34)} fs={21} title="result" text="No holes. All free space is one block, so allocating is just bumping `top`." />
      <Callout x={720} y={760} w={1104} tone="pull" a={E(t, 40.5)} fs={20} title="cost" text="Several passes over the heap, and every survivor may move: the slowest of the three. Its reward is zero fragmentation with no spare space." />
    </React.Fragment>
  );
}

// ── Copying (Cheney) ───────────────────────────────────────────────────────
const CX0 = 300, CU = 90, FY = 290, TY = 610, CH = 80;
const ccx = (s, n) => CX0 + (s + n / 2) * CU;
const COPIES = [['A', 0, 5.2], ['E', 2, 6.8], ['C', 4, 19.5], ['J', 6, 25.5], ['H', 8, 28]];
const CREFS = [['A', 'C', 60], ['C', 'H', 90], ['E', 'J', 60], ['B', 'D', 40], ['F', 'G', 34]];
export function SCopying({ t }) {
  const cp = Object.fromEntries(COPIES.map((c) => [c[0], c]));
  const S = track1(t, [[0, 0], [12, 0], [21, 0], [21.5, 2], [26.6, 2], [27, 4], [29.4, 4], [29.8, 6], [30.6, 6], [31, 8], [34.6, 8], [35, 10]]);
  const F = track1(t, [[0, 0], [5.4, 0], [6.2, 2], [7.0, 2], [7.8, 4], [19.7, 4], [20.5, 6], [25.7, 6], [26.5, 8], [28.2, 8], [29, 10]]);
  const cleared = E(t, 45.5, 0.8);
  const scanning = t >= 18.5 && t < 21.5 ? 'A' : t >= 25 && t < 27 ? 'E' : t >= 27 && t < 29.8 ? 'C' : t >= 29.8 && t < 31 ? 'J' : t >= 32 && t < 35 ? 'H' : null;
  const toRefs = [['A', 'C', 20.5, 70, 10, -10], ['E', 'J', 26.5, 56, 10, -10], ['C', 'H', 29, 50, 10, -10], ['H', 'C', 33, 95, 10, 10]];
  const r1To = t >= 6.2, r2To = t >= 7.8;
  return (
    <React.Fragment>
      <Txt x={96} y={FY + 24} mono fs={18} weight={600} color={cleared > 0.5 ? PAL.ink3 : PAL.ink2} a={E(t, 0.4)}>from-space</Txt>
      <Txt x={96} y={TY + 24} mono fs={18} weight={600} color={PAL.flow} a={E(t, 0.6)}>to-space</Txt>
      <Txt x={96} y={TY + 50} mono fs={17} color={PAL.ink3} a={E(t, 0.6)}>empty at start</Txt>
      <div style={{ position: 'absolute', left: CX0, top: TY, width: 16 * CU, height: CH, boxSizing: 'border-box', border: `2px dashed ${PAL.line2}`, borderRadius: 8, opacity: E(t, 0.6) }}></div>
      {CREFS.map(([a, b, k]) => {
        const A = OBJ[a], B = OBJ[b], dead = !A[3];
        const back = a === 'H';
        return <React.Fragment key={a + b}>{arcUp(ccx(A[1], A[2]) + (back ? 10 : 8), ccx(B[1], B[2]) - 8, FY - 4, k, { a: E(t, 1.2) * (dead ? 0.45 : 0.9) * (1 - cleared), color: PAL.ink3, width: 2 })}</React.Fragment>;
      })}
      {arcUp(ccx(11, 2) + 14, ccx(3, 2) + 8, FY - 4, 140, { a: E(t, 1.2) * 0.9 * (1 - cleared), color: PAL.ink3, width: 2 })}
      {HEAP.map(([n, s, sz, live]) => {
        const c = cp[n];
        const fwd = c && t >= c[2] + 1;
        return <Cell key={n} x={CX0} y={FY} unit={CU} s={s} n={sz} h={CH} label={n} fs={24} sfs={17} tone={fwd ? 'violet' : live ? 'ink' : undefined}
          sub={fwd ? `→ to@${c[1]}` : undefined} a={E(t, 0.5 + s * 0.03) * (1 - cleared)} glow={n === 'C' ? pulse(t, [33], 1.4) : 0} dashed={!live && cleared > 0} />;
      })}
      {cleared > 0.01 && <Cell x={CX0} y={FY} unit={CU} s={0} n={16} h={CH} label="all free" sub="next GC copies the other way" free fs={22} a={cleared} />}
      <Ruler x={CX0} y={FY + CH + 6} unit={CU} a={E(t, 0.8) * (1 - cleared)} />

      {COPIES.map(([n, to, at]) => {
        const o = OBJ[n];
        const p = M(t, at, 1);
        if (p <= 0) return null;
        const x = lerp(CX0 + o[1] * CU, CX0 + to * CU, p), y = lerp(FY, TY, p);
        const done = p >= 1;
        return <Cell key={n} x={x} y={y} unit={CU} s={0} n={o[2]} h={CH} label={n + "'"} fs={24} tone="flow" a={1} glow={(scanning === n ? 0.8 : 0) + pulse(t, [at + 1], 1)} sub={done ? `@${to}` : undefined} sfs={17} />;
      })}
      {toRefs.map(([a, b, at, k, oa, ob]) => {
        const xa = ccx(cp[a][1], 2) + oa, xb = ccx(cp[b][1], 2) + ob;
        return <React.Fragment key={a + b}>{arcDown(xa, xb, TY + CH + 4, k, { draw: M(t, at, 0.6), color: PAL.flow, width: 2.2 })}</React.Fragment>;
      })}

      <Box x={96} y={430} w={170} h={44} label="root r1" fs={17} tone="violet" a={E(t, 1)} />
      <Box x={96} y={490} w={170} h={44} label="root r2" fs={17} tone="violet" a={E(t, 1)} />
      <Arrow pts={r1To ? [[268, 452], [390, 452], [390, TY - 32]] : [[268, 452], [390, 452], [390, FY + CH + 30]]} color={r1To ? PAL.flow : PAL.violet} a={E(t, 1.2)} width={2.2} />
      <Arrow pts={r2To ? [[268, 512], [570, 512], [570, TY - 32]] : [[268, 512], [930, 512], [930, FY + CH + 30]]} color={r2To ? PAL.flow : PAL.violet} a={E(t, 1.2)} width={2.2} />

      {[[S, 'scan', PAL.pull, 12], [F, 'free', PAL.flow, 12]].map(([v, lbl, c, at], i) => (
        <React.Fragment key={lbl}>
          <div style={{ position: 'absolute', left: CX0 + v * CU - 11, top: 790 + i * 56, width: 0, height: 0, borderLeft: '11px solid transparent', borderRight: '11px solid transparent', borderBottom: `16px solid ${c}`, opacity: E(t, at) }}></div>
          <Txt x={CX0 + v * CU + 18} y={790 + i * 56 - 4} mono fs={18} weight={600} color={c} a={E(t, at)}>{lbl} = {Math.round(v)}</Txt>
        </React.Fragment>
      ))}
      <Badge x={1580} y={812} text="scan = free → done" tone="flow" a={E(t, 39)} fs={18} solid />
      <Callout x={1100} y={420} w={724} tone="pull" a={E(t, 45.5)} fs={20} title="cost" text="Work scales with **live** objects only. The price: a second space as big as the first." />
      <Badge x={1180} y={540} text="already forwarded: follow it, don't copy" tone="violet" a={win(t, 32.5, 38.5)} fs={17} />
    </React.Fragment>
  );
}

// ── The three families compared ────────────────────────────────────────────
const MINI = {
  sweep: [[0, 2, 1], [2, 1, 0], [3, 2, 1], [5, 1, 0], [6, 2, 1], [8, 3, 0], [11, 2, 1], [13, 1, 0], [14, 2, 1]],
  compact: [[0, 2, 1], [2, 2, 1], [4, 2, 1], [6, 2, 1], [8, 2, 1], [10, 6, 0]],
  copyTo: [[0, 2, 1], [2, 2, 1], [4, 2, 1], [6, 2, 1], [8, 2, 1], [10, 6, 0]],
};
function MiniStrip({ x, y, cells, u = 30, h = 34, a }) {
  return cells.map(([s, n, live], i) => (
    <div key={i} style={{ position: 'absolute', left: x + s * u + 2, top: y, width: n * u - 4, height: h, boxSizing: 'border-box', borderRadius: 5, opacity: a,
      background: live ? hexA(PAL.flow, 0.28) : `repeating-linear-gradient(45deg, transparent 0 5px, ${hexA(PAL.ink3, 0.3)} 5px 7px)`, border: `1.5px ${live ? 'solid' : 'dashed'} ${live ? PAL.flow : PAL.ink3}` }}></div>
  ));
}
export function SFamilies({ t }) {
  const rows = [
    ['Mark-sweep', 'mark live, free the rest in place', 'live + whole heap', 'yes', 'none', 'free-list search'],
    ['Mark-compact', 'mark, then slide survivors down', 'live + whole heap', 'none', 'none', 'pointer bump'],
    ['Copying', 'evacuate survivors to empty space', 'live only', 'none', '2× space', 'pointer bump'],
  ];
  const marks = { 0: ['pull', win(t, 3.5, 9.3)], 1: ['violet', win(t, 9.5, 15.3)], 2: ['flow', win(t, 15.5, 22)] };
  const minis = [
    [3.5, 'mark-sweep · after', 'holes stay where they were', 'pull', [['sweep', 0]]],
    [9.5, 'mark-compact · after', 'one free block at the end', 'violet', [['compact', 0]]],
    [15.5, 'copying · after', 'to-space packed · from-space all free', 'flow', [['copyTo', 0], ['free', 1]]],
  ];
  const dots = (n, live, x, y, at) => Array.from({ length: n }).map((_, i) => {
    const on = live.includes(i);
    return <div key={i} style={{ position: 'absolute', left: x + (i % 20) * 38, top: y + Math.floor(i / 20) * 38, width: 30, height: 30, borderRadius: 6, boxSizing: 'border-box', opacity: E(t, at + i * 0.01), background: hexA(on ? PAL.flow : PAL.ink3, on ? 0.3 : 0.08), border: `2px ${on ? 'solid' : 'dashed'} ${hexA(on ? PAL.flow : PAL.ink3, on ? 1 : 0.5)}` }}></div>;
  });
  return (
    <React.Fragment>
      <Table x={96} y={196} cols={[230, 420, 250, 220, 220, 388]} head={['family', 'how', 'work scales with', 'fragments?', 'extra space', 'allocation']} rows={rows} a={E(t, 0.5)}
        rowA={rows.map((_, i) => E(t, [3.5, 9.5, 15.5][i]))} fs={19} rh={56} marks={marks} colColors={[PAL.ink, PAL.ink2, PAL.ink, PAL.ink, PAL.ink, PAL.ink]} />
      {minis.map(([at, title, sub, tone, strips], i) => {
        const x = 96 + i * 584, a = E(t, at + 0.5);
        return (
          <React.Fragment key={i}>
            <Panel x={x} y={420} w={560} h={170} title={title} tone={tone} a={a} glow={win(t, at + 0.5, at + 6) * 0.6} />
            {strips.map(([k, row]) => k === 'free'
              ? <MiniStrip key={k} x={x + 40} y={480 + row * 42} cells={[[0, 16, 0]]} a={a} />
              : <MiniStrip key={k} x={x + 40} y={480 + row * 42} cells={MINI[k]} a={a} />)}
            <Txt x={x + 40} y={strips.length > 1 ? 562 : 532} fs={18} color={PAL.ink2} a={a}>{sub}</Txt>
          </React.Fragment>
        );
      })}
      <Panel x={96} y={620} w={840} h={250} title="young generation" right="copying" tone="flow" a={E(t, 22)} />
      {dots(40, [5, 19, 30], 130, 684, 22.4)}
      <Txt x={130} y={772} fs={21} color={PAL.ink} w={780} a={E(t, 23.5)}>Mostly dead. Copy the few survivors out; the space is empty again.</Txt>
      <Txt x={130} y={826} mono fs={17} color={PAL.flow} a={E(t, 24.5)}>cheap · compacts for free · survivor spaces, not a 2× heap</Txt>
      <Panel x={984} y={620} w={840} h={250} title="old generation" right="mark-compact / mark-sweep" tone="pull" a={E(t, 28.5)} />
      {dots(40, Array.from({ length: 40 }).map((_, i) => i).filter((i) => i % 7 !== 3), 1018, 684, 28.8)}
      <Txt x={1018} y={772} fs={21} color={PAL.ink} w={780} a={E(t, 29.5)}>Mostly alive. Copying all of it would cost time and a second heap.</Txt>
      <Txt x={1018} y={826} mono fs={17} color={PAL.pull} a={E(t, 30.5)}>collect rarely · mark in place · compact when needed</Txt>
      <Badge x={960} y={900} text="G1 copies regions of both generations · ZGC and Shenandoah move objects concurrently → 8.6" tone="ink" a={E(t, 32)} fs={17} />
    </React.Fragment>
  );
}

// ── Generations in motion ──────────────────────────────────────────────────
const EV0 = [96, 196], S0X = 1130, S1X = 1494;
const edenPos = (i) => [116 + (i % 14) * 68, 256 + Math.floor(i / 14) * 66];
const survPos = (r, k) => [(r === 'S0' ? S0X : S1X) + 22 + (k % 4) * 76, 258 + Math.floor(k / 4) * 66];
const oldPos = (k) => [126 + k * 76, 604];
const FILLS = [[6.5, 12], [19.5, 25], [36, 41.5]];
const CLEAR = [18.8, 31.8, 51.3];
const TRACKED = { 4: 'C1', 19: 'C2', 33: 'C3', 9: 's', 27: 's' };
// tracked objects: [name, fill, edenIdx, moves: [[time, pos]], ages: [[time, age]], deadAt, goneAt, tone]
const MOVES = (() => {
  const born = (f, i) => FILLS[f][0] + (i / 42) * (FILLS[f][1] - FILLS[f][0]);
  const L = [];
  ['C1', 'C2', 'C3'].forEach((n, j) => {
    const i = [4, 19, 33][j];
    L.push({ n, born: born(0, i), keys: [[born(0, i), edenPos(i)], [16.5 + j * 0.3, edenPos(i)], [17.4 + j * 0.3, survPos('S0', j)], [29.5 + j * 0.3, survPos('S0', j)], [30.4 + j * 0.3, survPos('S1', j)], [49 + j * 0.3, survPos('S1', j)], [50 + j * 0.3, oldPos(j)]], ages: [[17.4 + j * 0.3, 1], [30.4 + j * 0.3, 2], [50 + j * 0.3, null]], dead: 99, gone: 99, tone: 'flow' });
  });
  [[0, 'sA', 22, 31.8, ['S0', 3]], [1, 'sB', 39, 51.3, ['S1', 3]], [2, 'sC', 99, 99, ['S0', 0]]].forEach(([f, base, dead, gone, [reg, k0]]) => {
    [9, 27].forEach((i, j) => {
      const gc = [16.5, 29.5, 49][f] + 1 + j * 0.3;
      L.push({ n: base + (j + 1), born: born(f, i), keys: [[born(f, i), edenPos(i)], [gc, edenPos(i)], [gc + 0.9, survPos(reg, k0 + j)]], ages: [[gc + 0.9, 1]], dead, gone, tone: 'pull' });
    });
  });
  return L;
})();
export function SMinorGC({ t }) {
  const gcs = [12.5, 25.5, 42];
  const status = t < 6.5 ? 'heap layout' : t < 12.5 ? 'requests allocate in eden…' : t < 19 ? 'minor GC 1: eden → S0' : t < 25.5 ? 'allocating again…' : t < 32 ? 'minor GC 2: eden + S0 → S1' : t < 42 ? 'allocating again…' : t < 49 ? 'eden full: minor GC 3' : 'minor GC 3: promote age 2 → old';
  const role = (r) => {
    const p = t < 18.8 ? 0 : t < 31.8 ? 1 : t < 51.3 ? 2 : 3;
    const s0 = ['to-space', 'from', 'to-space', 'from'][p], s1 = ['empty', 'to-space', 'from', 'to-space'][p];
    return r === 'S0' ? s0 : s1;
  };
  const temps = [];
  FILLS.forEach(([fs, fe], f) => {
    for (let i = 0; i < 42; i++) {
      if (TRACKED[i]) continue;
      const at = fs + (i / 42) * (fe - fs);
      const a = E(t, at, 0.2) * (1 - E(t, CLEAR[f], 0.4));
      if (a < 0.01) continue;
      const dead = E(t, at + 0.7, 0.4);
      const [x, y] = edenPos(i);
      temps.push(<div key={f + '-' + i} style={{ position: 'absolute', left: x, top: y, width: 58, height: 52, boxSizing: 'border-box', borderRadius: 7, opacity: a * (1 - 0.55 * dead), background: hexA(PAL.ink2, 0.1), border: `2px ${dead > 0.5 ? 'dashed' : 'solid'} ${hexA(PAL.ink2, 0.5)}` }}></div>);
    }
  });
  const c1 = MOVES[0];
  const c1age = step(t, c1.ages, 0);
  const promoted = t >= 50;
  return (
    <React.Fragment>
      <Panel x={EV0[0]} y={EV0[1]} w={1000} h={300} title="eden" right={t > 12.5 && t < 19 ? 'allocation failure' : t > 25.5 && t < 32 ? 'allocation failure' : t > 42 && t < 51.3 ? 'allocation failure' : 'young generation'} tone="flow" a={E(t, 0.5)} glow={pulse(t, gcs, 1.4)} />
      <Panel x={S0X} y={196} w={330} h={300} title="S0" right={role('S0')} tone="pull" a={E(t, 1.2)} />
      <Panel x={S1X} y={196} w={330} h={300} title="S1" right={role('S1')} tone="pull" a={E(t, 1.5)} />
      <Panel x={96} y={540} w={1100} h={180} title="old generation (tenured)" right="collected rarely" tone="violet" a={E(t, 2)} />
      {temps}
      {MOVES.map((o) => {
        if (t < o.born) return null;
        const [x, y] = track(t, o.keys.map(([ti, [px, py]]) => [ti, px, py]));
        const age = step(t, o.ages, 0);
        const dead = t >= o.dead;
        const a = E(t, o.born, 0.2) * (1 - E(t, o.gone, 0.4));
        if (a < 0.01) return null;
        const c = dead ? PAL.ink3 : toneColor(o.tone);
        const inOld = age === null;
        return (
          <div key={o.n} style={{ position: 'absolute', left: x, top: y, width: inOld ? 64 : 58, height: 52, boxSizing: 'border-box', borderRadius: 7, opacity: a * (dead ? 0.6 : 1), background: hexA(c, 0.2), border: `2px ${dead ? 'dashed' : 'solid'} ${c}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: inOld || age ? `0 0 ${12 * pulse(t, o.ages.map((k) => k[0]), 1)}px ${c}` : 'none' }}>
            <div style={{ font: `600 17px ${MONO}`, color: PAL.ink }}>{o.n.replace(/[0-9]/, '')}</div>
            <div style={{ font: `500 17px ${MONO}`, color: c }}>{dead ? 'dead' : inOld ? 'old' : age ? `age ${age}` : 'new'}</div>
          </div>
        );
      })}

      <Panel x={1230} y={540} w={594} h={180} title="mark word · a cache entry" right="64 bits" tone="pull" a={E(t, 42)} />
      <Bytes x={1254} y={600} unit={8.4} h={46} ruler={false} a={E(t, 42.4)} fs={17} cells={[
        { n: 25, label: 'unused', tone: 'dim' }, { n: 31, label: 'identity hash', tone: 'ink' }, { n: 1, tone: 'dim' },
        { n: 4, tone: 'pull', glow: pulse(t, [42.6, 49], 1.2) }, { n: 1, tone: 'dim' }, { n: 2, tone: 'dim' }]} />
      <Txt x={1750} y={652} anchor="mid" mono fs={17} color={PAL.pull} a={E(t, 42.6)}>age</Txt>
      <Txt x={1254} y={680} mono fs={19} color={PAL.ink2} a={E(t, 43)}>age bits: <span style={{ color: PAL.pull, fontWeight: 600 }}>{promoted ? 'promoted' : (c1age || 0).toString(2).padStart(4, '0')}</span>   <span style={{ color: PAL.ink3 }}>· 4 bits → max 15</span></Txt>

      <Txt x={96} y={752} mono fs={24} weight={600} color={PAL.ink} a={E(t, 1)}>{status}</Txt>
      {[['GC 1', 'eden → S0 · 5 copied', 16.5], ['GC 2', 'eden + S0 → S1 · 2 dead skipped', 29.5], ['GC 3', '3 promoted · 2 dead skipped', 49]].map(([n, s, at], i) => (
        <React.Fragment key={n}>
          <Box x={96 + i * 420} y={800} w={396} h={72} align="left" label={n} sub={s} fs={20} sfs={17} tone={i === 2 ? 'violet' : 'flow'} a={E(t, at)} glow={pulse(t, [at], 1)} />
        </React.Fragment>
      ))}
      <Badge x={1560} y={768} text="tenuring threshold here: 2 · HotSpot max: 15" tone="pull" a={E(t, 56.5)} fs={17} />
    </React.Fragment>
  );
}
