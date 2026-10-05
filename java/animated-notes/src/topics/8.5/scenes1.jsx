// 8.5 scenes, part 1: intro, GC roots, marking, cycles, the generational hypothesis, survivor cost.
// All numbers come from real JDK 17 runs of Server.java / Cycle.java (see the notes for commands).
const { PAL, MOTION, lin, lerp, win, pulse, step, track, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Badge, Callout, Mark, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

export const SERVER_SRC = [
  'public class Server {',
  '    static final Map<Integer, byte[]> CACHE = new HashMap<>();',
  '    static final int N = Integer.getInteger("sessions", 20_000);',
  '    static final Object[] sessions = new Object[N];',
  '',
  '    static int handle(int id) {',
  '        var sb = new StringBuilder("GET /user/").append(id % 500);',
  '        byte[] body = new byte[1024];',
  '        CACHE.computeIfAbsent(id % 500, k -> new byte[2048]);',
  '        sessions[id % N] = new byte[48];',
  '        return sb.length() + body.length;',
  '    }',
  '}',
];

// ── Intro ──────────────────────────────────────────────────────────────────
export function SIntro({ t }) {
  const cols = 13, rows = 7, cw = 58, chh = 40, gap = 8, HX = 902, HY = 488;
  const kind = (i) => ([3, 17, 30].includes(i) ? 'cache' : i % 9 === 5 ? 'session' : 'temp');
  const dead = t > 12.5;
  const cells = [];
  for (let i = 0; i < cols * rows; i++) {
    const at = 4 + i * 0.085;
    const a = E(t, at, 0.25);
    if (a < 0.01) continue;
    const k = kind(i);
    const c = k === 'cache' ? PAL.flow : k === 'session' ? PAL.pull : PAL.ink2;
    const gone = k === 'temp' ? E(t, 12.5 + (i % 13) * 0.05, 0.5) : 0;
    const x = HX + (i % cols) * (cw + gap), y = HY + Math.floor(i / cols) * (chh + gap);
    cells.push(<div key={i} style={{ position: 'absolute', left: x, top: y, width: cw, height: chh, boxSizing: 'border-box', borderRadius: 7, opacity: a * (1 - 0.7 * gone), background: hexA(c, k === 'temp' ? 0.12 : 0.22), border: `2px ${gone > 0.5 ? 'dashed' : 'solid'} ${hexA(c, k === 'temp' ? 0.5 : 0.9)}`, boxShadow: dead && k !== 'temp' ? `0 0 14px ${hexA(c, 0.5)}` : 'none' }}></div>);
  }
  const tone = (i) => (i === 6 || i === 7 ? 'bad' : i === 8 ? 'flow' : i === 9 ? 'pull' : undefined);
  return (
    <React.Fragment>
      <Txt x={96} y={150} mono fs={22} weight={600} color={PAL.pull} a={E(t, 0.3)} style={{ letterSpacing: '0.14em' }}>PART 08 · THE JVM · 8.5</Txt>
      <Txt x={92} y={192} fs={100} weight={700} lh={1} a={E(t, 0.6, 0.9)} style={{ letterSpacing: '-0.03em', transform: `translateY(${(1 - E(t, 0.6, 0.9)) * 24}px)` }}>Garbage collection: the theory</Txt>
      <Txt x={96} y={322} fs={34} color={PAL.ink2} a={E(t, 1.4, 0.8)}>How the JVM decides what is garbage, and what it costs to clean up.</Txt>

      <Code x={96} y={430} w={760} h={406} fs={17} lh={26} title="Server.java · the running example" a={E(t, 1.8)}
        lines={SERVER_SRC.map((s, i) => ({ s, tone: tone(i), toneA: E(t, 18.5) }))} />
      <Panel x={880} y={430} w={944} h={406} title="heap · eden" right={dead ? 'most of it is already dead' : 'filling, one request at a time'} a={E(t, 3.4)} tone="flow" />
      {cells}
      <Badge x={900} y={872} text="dies at return" tone="ink" a={E(t, 18.8)} fs={17} anchor="left" />
      <Badge x={1110} y={872} text="session: lives a while" tone="pull" a={E(t, 19.2)} fs={17} anchor="left" />
      <Badge x={1400} y={872} text="cache: lives forever" tone="flow" a={E(t, 19.6)} fs={17} anchor="left" />
      <Txt x={96} y={858} fs={20} color={PAL.ink2} a={E(t, 12.5)}>reachability · generations · algorithms · card tables · safepoints · TLABs</Txt>
    </React.Fragment>
  );
}

// ── GC roots ───────────────────────────────────────────────────────────────
function RootRow({ x, y, name, note, a, tone = 'violet', glow = 0 }) {
  return <Box x={x} y={y} w={420} h={50} align="left" tone={tone} a={a} glow={glow} fs={19}
    label={<span>{name}<span style={{ color: PAL.ink3, fontWeight: 400, marginLeft: 14, fontSize: 17 }}>{note}</span></span>} />;
}
export function SRoots({ t }) {
  const mk = { sb: 33.4, val: 34.4, body: 33.8, map: 34.6, tab: 35.2, node: 35.8, b2k: 36.4, sess: 34.9, s48: 35.6 };
  const live = (k) => (t >= mk[k] ? 'flow' : 'ink');
  const lg = (k) => pulse(t, [mk[k]], 1.0);
  const gBad = t >= 39.5;
  const G = (x, y, label, sub) => <Box x={x} y={y} w={200} h={50} label={label} fs={19} tone={gBad ? 'bad' : 'dim'} dashed={gBad} a={E(t, 3.2) * (gBad ? 0.85 : 0.7)} />;
  const O = (k, x, y, label, at) => <Box x={x} y={y} w={200} h={50} label={label} fs={19} tone={live(k)} a={E(t, at)} glow={lg(k)} />;
  const ra = (k) => (t >= mk[k] ? PAL.flow : PAL.ink3);
  return (
    <React.Fragment>
      <Panel x={96} y={196} w={540} h={630} title="GC roots" tone="violet" a={E(t, 6.5)} />
      <Txt x={120} y={256} mono fs={17} color={PAL.ink3} a={E(t, 13)}>THREAD main · frame handle(42)</Txt>
      <RootRow x={120} y={286} name="id = 42" note="an int, not a reference" tone="dim" a={E(t, 13.2)} />
      <RootRow x={120} y={346} name="sb" note="local slot" a={E(t, 13.6)} glow={pulse(t, [33], 1)} />
      <RootRow x={120} y={406} name="body" note="local slot" a={E(t, 14)} glow={pulse(t, [33], 1)} />
      <Txt x={120} y={486} mono fs={17} color={PAL.ink3} a={E(t, 20)}>STATIC FIELDS · class Server</Txt>
      <RootRow x={120} y={516} name="CACHE" note="static field" a={E(t, 20.3)} glow={pulse(t, [33], 1)} />
      <RootRow x={120} y={576} name="sessions" note="static field" a={E(t, 20.7)} glow={pulse(t, [33], 1)} />
      <Txt x={120} y={656} mono fs={17} color={PAL.ink3} a={E(t, 26.5)}>ALSO ROOTS</Txt>
      {['JNI handles', 'Thread objects', 'classes, loaders', 'JVM internals'].map((s, i) => (
        <Box key={s} x={120 + (i % 2) * 220} y={686 + Math.floor(i / 2) * 62} w={200} h={50} label={s} fs={17} tone="violet" a={E(t, 26.8 + i * 0.4)} />
      ))}

      <Panel x={690} y={196} w={1134} h={630} title="heap" right="who can be reached?" a={E(t, 2.5)} />
      {O('sb', 740, 346, 'StringBuilder', 3)}{O('val', 1000, 346, 'byte[26]', 3.2)}
      <HArrow x1={942} x2={996} y={371} a={E(t, 3.3)} color={ra('val')} />
      {O('body', 740, 406, 'byte[1024]', 3.3)}
      {O('map', 740, 516, 'HashMap', 3.5)}{O('tab', 1000, 516, 'Node[1024]', 3.6)}{O('node', 1260, 516, 'Node', 3.7)}{O('b2k', 1520, 516, 'byte[2048]', 3.8)}
      <HArrow x1={942} x2={996} y={541} a={E(t, 3.8)} color={ra('tab')} />
      <HArrow x1={1202} x2={1256} y={541} a={E(t, 3.8)} color={ra('node')} />
      <HArrow x1={1462} x2={1516} y={541} a={E(t, 3.8)} color={ra('b2k')} />
      <Badge x={1772} y={541} text="×500" tone="flow" a={E(t, 4)} fs={17} />
      {O('sess', 740, 576, 'Object[20000]', 3.9)}{O('s48', 1000, 576, 'byte[48]', 4)}
      <HArrow x1={942} x2={996} y={601} a={E(t, 4)} color={ra('s48')} />
      <Badge x={1262} y={601} text="×20,000" tone="pull" a={E(t, 4.1)} fs={17} />

      <Txt x={740} y={680} mono fs={17} color={gBad ? PAL.bad : PAL.ink3} a={E(t, 3.2)}>LEFT OVER FROM EARLIER REQUESTS</Txt>
      {G(740, 710, 'StringBuilder', 'unreachable')}{G(1000, 710, 'byte[26]', 'unreachable')}{G(1260, 710, 'byte[1024]', 'unreachable')}{G(1520, 710, 'byte[48]', 'unreachable')}
      <HArrow x1={942} x2={996} y={735} a={E(t, 3.3) * 0.6} color={PAL.ink3} />

      {[[371, 'sb', 13.8], [431, 'body', 14.2], [541, 'map', 20.6], [601, 'sess', 21]].map(([y, k, at]) => (
        <HArrow key={k} x1={544} x2={736} y={y} a={E(t, at)} color={t >= 33 ? PAL.flow : PAL.violet} />
      ))}
      <Badge x={1420} y={690} text="no path from any root" tone="bad" a={E(t, 40)} fs={17} />
      <Callout x={96} y={846} w={1728} tone="flow" a={E(t, 45)} fs={20} text="Reachable means live. Unreachable means garbage, **by definition**: no code can ever obtain a reference to it again." />
    </React.Fragment>
  );
}

// ── Marking with three colours ─────────────────────────────────────────────
const MN = {
  SB: [330, 236, 'StringBuilder'], val: [560, 236, 'byte[26]'], gOld: [1020, 236, 'byte[48]'],
  body: [330, 316, 'byte[1024]'], g1: [790, 316, 'byte[1024]'],
  map: [330, 416, 'HashMap'], tab: [560, 416, 'Node[]'], n1: [790, 416, 'Node'], b1: [1020, 416, 'byte[2048]'],
  n2: [790, 496, 'Node'], b2: [1020, 496, 'byte[2048]'],
  sess: [330, 596, 'Object[]'], s1: [560, 596, 'byte[48]'], s2: [560, 676, 'byte[48]'],
  g2: [790, 646, 'StringBuilder'], g3: [1020, 646, 'byte[26]'],
};
const MW = 180, MH = 52;
const MEV = [
  [12, 'push', 'SB'], [12.4, 'push', 'body'], [12.8, 'push', 'map'], [13.2, 'push', 'sess'],
  [18, 'pop', 'sess'], [19, 'push', 's1'], [19.4, 'push', 's2'], [21, 'pop', 's2'], [22.5, 'pop', 's1'],
  [26, 'pop', 'map'], [26.8, 'push', 'tab'], [28, 'pop', 'tab'], [28.8, 'push', 'n1'], [29.2, 'push', 'n2'],
  [30.5, 'pop', 'n2'], [31.2, 'push', 'b2'], [32.2, 'pop', 'b2'], [33.2, 'pop', 'n1'], [33.9, 'push', 'b1'],
  [35, 'pop', 'b1'], [36, 'pop', 'body'], [37, 'pop', 'SB'], [37.7, 'push', 'val'], [38.6, 'pop', 'val'],
];
const MEDGES = [['SB', 'val'], ['map', 'tab'], ['tab', 'n1'], ['tab', 'n2'], ['n1', 'b1'], ['n2', 'b2'], ['sess', 's1'], ['sess', 's2'], ['g2', 'g3']];
const SHORT = { SB: 'SB', val: 'b[26]', body: 'b[1024]', g1: 'b[1024]', map: 'Map', gOld: 'b[48]', tab: 'Node[]', n1: 'Node', g2: 'SB', b1: 'b[2048]', n2: 'Node', g3: 'b[26]', b2: 'b[2048]', sess: 'Obj[]', s1: 'b[48]', s2: 'b[48]' };
const BITMAP = ['SB', 'g1', 'val', 'body', 'map', 'gOld', 'tab', 'n1', 'g2', 'b1', 'n2', 'g3', 'b2', 'sess', 's1', 's2'];
export function SMarking({ t }) {
  const state = {}, stack = [], popAt = {}, pushAt = {};
  for (const [ti, op, id] of MEV) {
    if (t < ti) break;
    if (op === 'push') { state[id] = 'grey'; stack.push(id); pushAt[id] = ti; } else { state[id] = 'black'; stack.pop(); popAt[id] = ti; }
  }
  const garbageA = E(t, 42);
  const toneOf = (id) => (state[id] === 'grey' ? 'pull' : state[id] === 'black' ? 'flow' : id[0] === 'g' && garbageA > 0.5 ? 'bad' : undefined);
  const edge = ([p, c]) => {
    const [px, py] = MN[p], [cx, cy] = MN[c];
    const lit = popAt[p] != null;
    const col = lit ? PAL.flow : PAL.ink3;
    const a = E(t, 1.5) * (p[0] === 'g' ? 0.6 : 1);
    if (py === cy) return <HArrow key={p + c} x1={px + MW + 2} x2={cx - 4} y={py + MH / 2} a={a} color={col} />;
    const mx = px + MW + 25;
    return <Arrow key={p + c} pts={[[px + MW + 2, py + MH / 2], [mx, py + MH / 2], [mx, cy + MH / 2], [cx - 4, cy + MH / 2]]} a={a} color={col} width={2} />;
  };
  const roots = [['sb', 'SB'], ['body', 'body'], ['CACHE', 'map'], ['sessions', 'sess']];
  const lastPop = MEV.filter(([ti, op]) => op === 'pop' && t >= ti).pop();
  return (
    <React.Fragment>
      <Txt x={96} y={200} mono fs={17} color={PAL.ink3} a={E(t, 0.5)}>ROOTS</Txt>
      {roots.map(([n, id]) => (
        <React.Fragment key={n}>
          <Box x={96} y={MN[id][1]} w={170} h={MH} label={n} fs={19} tone="violet" a={E(t, 0.8)} glow={pulse(t, [12], 1)} />
          <HArrow x1={268} x2={326} y={MN[id][1] + MH / 2} a={E(t, 0.9)} color={t >= 12 ? PAL.pull : PAL.violet} />
        </React.Fragment>
      ))}
      <Panel x={300} y={196} w={930} h={560} title="heap" a={E(t, 0.6)}
        right={<span style={{ opacity: E(t, 5) }}><span style={{ color: PAL.ink2 }}>○ white: unseen</span>   <span style={{ color: PAL.pull }}>● grey: found</span>   <span style={{ color: PAL.flow }}>● black: scanned</span></span>} />
      {MEDGES.map(edge)}
      {Object.entries(MN).map(([id, [x, y, label]]) => (
        <Box key={id} x={x} y={y} w={MW} h={MH} label={label} fs={18} tone={toneOf(id)} fill={state[id] === 'black' ? true : undefined}
          dashed={id[0] === 'g' && garbageA > 0.5} a={E(t, 1.2) * (id[0] === 'g' && garbageA > 0.5 ? 0.8 : 1)}
          glow={pulse(t, [pushAt[id] ?? -9, popAt[id] ?? -9], 0.9)} />
      ))}
      <Badge x={1110} y={738} text="still white → garbage" tone="bad" a={garbageA} fs={17} />

      <Panel x={1270} y={196} w={554} h={560} title="mark stack" right={stack.length ? `depth ${stack.length}` : t > 12 ? 'empty' : ''} tone="pull" a={E(t, 11.5)} />
      <Txt x={1296} y={258} mono fs={17} color={PAL.ink2} a={E(t, 18) * (t < 39.5 ? 1 : 0)}>scanning: <span style={{ color: PAL.flow }}>{lastPop ? MN[lastPop[2]][2] : ''}</span></Txt>
      {stack.map((id, i) => (
        <Box key={id} x={1397} y={680 - i * 60} w={300} h={50} label={MN[id][2]} sub={undefined} fs={19} tone="pull" a={E(t, pushAt[id], 0.3)} />
      ))}
      <Callout x={1296} y={300} w={502} tone="flow" a={E(t, 49)} fs={20} title="the cost" text="Marking visits **live** objects only. The dead ones are never touched: nobody points at them." />

      <Txt x={96} y={776} mono fs={17} color={PAL.ink3} a={E(t, 36)}>MARK BITMAP · one bit per object, in address order</Txt>
      {BITMAP.map((id, i) => {
        const on = state[id] != null;
        return <Box key={id} x={96 + i * 108} y={804} w={100} h={56} label={on ? '1' : '0'} sub={SHORT[id]} fs={22} sfs={17}
          tone={on ? 'flow' : id[0] === 'g' && garbageA > 0.5 ? 'bad' : 'dim'} a={E(t, 36.3 + i * 0.04)} glow={pulse(t, [pushAt[id] ?? -9], 0.8)} />;
      })}
    </React.Fragment>
  );
}

// ── Cycles: reference counting vs tracing ──────────────────────────────────
export function SCycle({ t }) {
  const dropped = t >= 18;
  const leaked = t >= 24.5;
  const traced = t >= 31;
  const pair = (X, mode) => {
    const rc = mode === 'rc';
    const dTone = rc ? (leaked ? 'bad' : 'pull') : traced ? 'bad' : 'pull';
    const gone = !rc && t >= 33.5 ? E(t, 33.5, 0.8) : 0;
    const dCount = dropped ? 1 : 2;
    return (
      <React.Fragment>
        <Box x={X + 34} y={300} w={200} h={64} label={rc ? 'local d' : 'GC roots'} sub={rc ? 'in handle()' : 'stacks, statics'} fs={20} sfs={17} tone="violet" a={E(t, rc ? 2 : 31)} />
        <HArrow x1={X + 238} x2={X + 330} y={332} a={E(t, rc ? 2.4 : 31.4) * (1 - E(t, 18, 0.6))} color={PAL.violet} />
        {dropped && <Mark x={X + 284} y={332} ok={false} a={E(t, 18.2) * (1 - E(t, 23, 0.5))} />}
        <Box x={X + 334} y={290} w={160} h={84} label="D" sub={rc ? `count ${dCount}` : 'unmarked'} fs={30} sfs={17} tone={dTone} dashed={gone > 0.5} a={E(t, rc ? 2.6 : 30) * (1 - 0.6 * gone)} glow={rc ? pulse(t, [18.2], 1.2) + pulse(t, [5.8], 1.2) : 0} />
        <Box x={X + 610} y={290} w={160} h={84} label="E" sub={rc ? 'count 1' : 'unmarked'} fs={30} sfs={17} tone={dTone} dashed={gone > 0.5} a={E(t, rc ? 2.9 : 30.3) * (1 - 0.6 * gone)} glow={rc ? pulse(t, [6.2], 1.2) : 0} />
        <Arrow from={[X + 498, 306]} to={[X + 606, 306]} curve={-26} a={E(t, rc ? 3.2 : 30.5) * (1 - 0.6 * gone)} color={leaked && rc ? PAL.bad : PAL.ink2} />
        <Arrow from={[X + 606, 358]} to={[X + 498, 358]} curve={-26} a={E(t, rc ? 3.2 : 30.5) * (1 - 0.6 * gone)} color={leaked && rc ? PAL.bad : PAL.ink2} />
      </React.Fragment>
    );
  };
  return (
    <React.Fragment>
      <Panel x={96} y={196} w={840} h={420} title="reference counting" right="CPython · Swift · shared_ptr" tone="pull" a={E(t, 0.5)} />
      <Txt x={130} y={262} fs={20} color={PAL.ink2} w={780} a={E(t, 5.5)}>every object counts its incoming references; free it when the count hits 0</Txt>
      {pair(96, 'rc')}
      <Callout x={130} y={430} w={772} tone="bad" a={E(t, 24.5)} fs={20} title="leak" text="Neither count can reach zero. Both stay allocated forever, unless the runtime adds a separate cycle detector." />

      <Panel x={984} y={196} w={840} h={420} title="tracing · what Java does" tone="flow" a={E(t, 1)} />
      <Txt x={1018} y={262} fs={20} color={PAL.ink2} w={780} a={E(t, 30)}>no counts: follow references from the roots, keep what you reach</Txt>
      {t >= 29.5 && pair(984, 'trace')}
      <Callout x={1018} y={430} w={772} tone="flow" a={E(t, 34)} fs={20} title="collected" text="The cycle is never reached from a root, so both objects are garbage. Pointing at each other doesn't matter." />

      <Code x={96} y={650} w={900} h={236} title="Cycle.java" fs={17} lh={28} a={E(t, 3.5)} hl={step(t, [[12, 1], [18, 3], [31, 4], [37.5, 5]], -1)} hlA={E(t, 12.5)}
        lines={['Node d = new Node(), e = new Node();', 'd.next = e;  e.next = d;                  // a cycle', 'var watch = new WeakReference<>(d);       // sees D, keeps nothing alive', 'd = null;  e = null;                      // no root reaches the cycle', 'System.gc();', 'System.out.println("D collected? " + (watch.get() == null));']} />
      <Console x={1030} y={650} w={794} h={236} t={t} a={E(t, 37)} fs={17} lh={30} title="terminal · JDK 17" items={[
        { at: 37.5, text: 'java -Xlog:gc Cycle', kind: 'cmd' },
        { at: 38.2, text: '[0.004s][info][gc] Using G1', kind: 'dim' },
        { at: 38.7, text: '[0.018s][info][gc] GC(0) Pause Full (System.gc()) 3M->0M(10M) 0.815ms' },
        { at: 39.3, text: 'D collected? true', kind: 'ok' },
      ]} />
    </React.Fragment>
  );
}

// ── The weak generational hypothesis ───────────────────────────────────────
export function SLifetimes({ t }) {
  const [hl, hA] = [step(t, [[5.5, 1], [13, 4], [19, 3], [25, -1]], -1), win(t, 5.5, 25)];
  const BX0 = 1000, BASE = 760, TOP = 330;
  const bars = [
    [5.5, 94.6, '94.6%', 'dies in the request', 'bad'],
    [13, 5.4, '5.4%', 'dies 20k requests later', 'pull'],
    [19, 0.09, '< 0.1%', 'lives forever', 'flow'],
  ];
  return (
    <React.Fragment>
      <Code x={96} y={196} w={800} h={306} title="what handle() allocates" fs={17} lh={34} a={E(t, 0.4)} hl={hl} hlA={hA}
        lines={['static int handle(int id) {', '    var sb = new StringBuilder("GET /user/").append(id % 500);', '    byte[] body = new byte[1024];', '    CACHE.computeIfAbsent(id % 500, k -> new byte[2048]);', '    sessions[id % N] = new byte[48];', '    return sb.length() + body.length;', '}'].map((s, i) => ({ s, tone: [1, 2].includes(i) ? 'bad' : i === 4 ? 'pull' : i === 3 ? 'flow' : undefined, toneA: E(t, 25) }))} />
      <Box x={96} y={530} w={800} h={90} align="left" tone="bad" a={E(t, 6)} fs={20} sfs={17} label="≈ 1,124 bytes per request · dead at return" sub="StringBuilder 24 B + its byte[] 48 B + body 1,040 B + boxed key ≈ 12 B" />
      <Box x={96} y={636} w={800} h={90} align="left" tone="pull" a={E(t, 13.3)} fs={20} sfs={17} label="64 bytes per request · dead 20,000 requests later" sub="the byte[48] session, until its slot is overwritten" />
      <Box x={96} y={742} w={800} h={90} align="left" tone="flow" a={E(t, 19.3)} fs={20} sfs={17} label="2 KB × 500 entries · once · alive forever" sub="the cache: only the first 500 requests allocate" />

      <Panel x={940} y={196} w={884} h={636} title="bytes allocated, by lifetime" right="1M requests" a={E(t, 4.5)} />
      <div style={{ position: 'absolute', left: 970, top: BASE, width: 824, height: 2, background: PAL.line2, opacity: E(t, 5) }}></div>
      {bars.map(([at, pct, lbl, what, tone], i) => {
        const h = Math.max(3, (pct / 100) * (BASE - TOP)) * M(t, at + 0.3, 1.2);
        const x = BX0 + i * 270;
        const c = toneColor(tone);
        return (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', left: x, top: BASE - h, width: 190, height: h, background: hexA(c, 0.3), border: `2px solid ${c}`, borderBottom: 'none', borderRadius: '8px 8px 0 0', opacity: E(t, at) }}></div>
            <Txt x={x + 95} y={BASE - h - 40} anchor="mid" mono fs={24} weight={600} color={c} a={E(t, at + 1)}>{lbl}</Txt>
            <Txt x={x + 95} y={BASE + 14} anchor="mid" fs={18} color={PAL.ink2} w={240} align="center" a={E(t, at)}>{what}</Txt>
          </React.Fragment>
        );
      })}
      <Callout x={1270} y={262} w={526} tone="pull" a={E(t, 32)} fs={21} title="weak generational hypothesis" text="**Most objects die young.** True for nearly every real program, not just this one." />
      <Callout x={1270} y={430} w={526} tone="violet" a={E(t, 39)} fs={20} title="second observation" text="Old objects rarely point to young ones. Hold that thought: the card table depends on it." />
    </React.Fragment>
  );
}

// ── Dead objects are free ──────────────────────────────────────────────────
export function SSurvivorCost({ t }) {
  const N = 40, liveIdx = [3, 14, 22, 31];
  const cx = (i) => 120 + (i % 20) * 53, cy = (i) => 262 + Math.floor(i / 20) * 50;
  const wiped = E(t, 9, 0.5);
  const runs = [
    ['N = 1', '0 KB survive', 0.076, '104M->1M(123M) 0.069ms', 'flow'],
    ['N = 20,000', '1,250 KB survive', 1.051, '105M->2M(123M) 0.917ms', 'pull'],
    ['N = 80,000', '5,000 KB survive', 4.895, '109M->6M(123M) 4.964ms', 'bad'],
  ];
  return (
    <React.Fragment>
      <Panel x={96} y={196} w={1100} h={170} title="eden" right={t > 9 ? 'empty again: one pointer reset' : 'full'} a={E(t, 0.4)} />
      {Array.from({ length: N }).map((_, i) => {
        const live = liveIdx.includes(i);
        const c = live ? PAL.flow : PAL.ink3;
        return <div key={i} style={{ position: 'absolute', left: cx(i), top: cy(i), width: 45, height: 40, boxSizing: 'border-box', borderRadius: 6, opacity: E(t, 0.6 + i * 0.02) * (1 - wiped), background: hexA(c, live ? 0.25 : 0.08), border: `2px ${live ? 'solid' : 'dashed'} ${hexA(c, live ? 1 : 0.5)}`, boxShadow: live && t > 4.5 ? `0 0 ${16 * pulse(t, [4.6], 1.2)}px ${PAL.flow}` : 'none' }}></div>;
      })}
      <Panel x={1240} y={196} w={584} h={170} title="survivor space" tone="flow" a={E(t, 4.5)} />
      {liveIdx.map((i, k) => {
        const p = M(t, 5.2 + k * 0.5, 0.9);
        if (p <= 0) return null;
        return <div key={i} style={{ position: 'absolute', left: lerp(cx(i), 1270 + k * 60, p), top: lerp(cy(i), 286, p), width: 45, height: 40, boxSizing: 'border-box', borderRadius: 6, background: hexA(PAL.flow, 0.25), border: `2px solid ${PAL.flow}` }}></div>;
      })}
      <Txt x={1520} y={292} mono fs={18} color={PAL.ink2} a={E(t, 7.5)}>4 objects copied</Txt>
      <Txt x={96} y={382} fs={21} color={PAL.ink2} a={E(t, 11)}>visited: <b style={{ color: PAL.flow }}>4 live objects</b>   ·   touched: <b style={{ color: PAL.ink }}>0 of the 36 dead ones</b></Txt>

      <Panel x={96} y={440} w={1728} h={420} title="Server, Serial GC, -Xmn128m: same eden, only the live sessions change" right="JDK 17 · median of 31 minor GCs" a={E(t, 10.5)} />
      {runs.map(([n, surv, ms, line, tone], i) => {
        const y = 510 + i * 116;
        const at = 24 + i * 1.6;
        const w = (ms / 4.895) * 760 * M(t, at, 1);
        const c = toneColor(tone);
        return (
          <React.Fragment key={n}>
            <Txt x={126} y={y} mono fs={21} weight={600} color={PAL.ink} a={E(t, 17 + i * 0.4)}>{n}</Txt>
            <Txt x={126} y={y + 32} mono fs={17} color={c} a={E(t, 17 + i * 0.4)}>{surv}</Txt>
            <div style={{ position: 'absolute', left: 420, top: y + 2, width: Math.max(w, 4), height: 40, borderRadius: 6, background: hexA(c, 0.3), border: `2px solid ${c}`, boxSizing: 'border-box', opacity: E(t, at) }}></div>
            <Txt x={430 + Math.max(w, 4)} y={y + 6} mono fs={22} weight={600} color={c} a={E(t, at + 0.6)}>{ms.toFixed(ms < 1 ? 3 : 2)} ms</Txt>
            <Txt x={420} y={y + 54} mono fs={17} color={PAL.ink3} a={E(t, 17.5 + i * 0.4)}>e.g. GC(20) Pause Young (Allocation Failure) {line}</Txt>
          </React.Fragment>
        );
      })}
      <Callout x={1400} y={500} w={394} tone="pull" a={E(t, 31)} fs={20} text="Pause time follows the **survivors**. ~100 MB of garbage per GC costs nothing extra." />
    </React.Fragment>
  );
}
