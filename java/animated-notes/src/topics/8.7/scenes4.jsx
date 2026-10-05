// 8.7 scenes, part 4: System.gc(), traps, recap.
import { Gauge } from './common.jsx';
const { PAL, MOTION, lin, lerp, win, pulse, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, Card, Badge, Callout, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

// Real: java -Xmx512m -Xlog:gc ExplicitGc (JDK 17, G1): pause ms per GC.
const PAUSES = [[23.523, 'young'], [7.596, 'young'], [2.743, 'young'], [2.53, 'young'], [2.708, 'young'], [0.605, 'young'], [0.345, 'young'], [0.334, 'young'], [19.162, 'FULL']];

export function SSystemGc({ t }) {
  const cards = [
    ['Usually a full GC', 'Stop-the-world, whole heap: 19 ms here, against 0.3 ms young pauses.', 12.5, 'bad'],
    ['It undoes adaptive sizing', 'G1 had grown the heap to 283M. The full GC shrank it to 144M.', 20, 'pull'],
    ['It is only a hint', '`-XX:+DisableExplicitGC` makes it a no-op.', 27, 'violet'],
    ['It fixes nothing', 'Leaked objects are reachable. Leak 1: full GCs went 30M → 29M.', 33.5, 'bad'],
  ];
  const BX = 900, BASE = 560, MAXH = 260;
  const committed = t < 6 ? 130 : t < 20 ? lerp(130, 283, lin(t, 6, 5)) : lerp(283, 144, M(t, 20.2, 0.8));
  return (
    <React.Fragment>
      <Code x={96} y={196} w={700} h={112} title="anywhere in production code" a={E(t, 0.4)} fs={24} lh={44} lines={[{ s: 'System.gc();      // ❌', tone: 'bad' }]} />
      {cards.map(([title, sub, at, tone], i) => <Card key={title} x={96} y={330 + i * 146} w={700} h={132} a={E(t, at)} title={title} sub={sub} tfs={25} sfs={19} tone={tone} glow={win(t, at, at + 6) * 0.8} />)}

      <Panel x={840} y={196} w={984} h={400} title="pause per GC (ms) · -Xlog:gc · JDK 17 · G1" a={E(t, 5.5)} />
      {PAUSES.map(([ms, kind], i) => {
        const at = i < 8 ? 6 + i * 0.6 : 12.5;
        const h = (ms / 25) * MAXH * E(t, at, 0.5);
        const full = kind === 'FULL';
        const c = full ? PAL.bad : PAL.flow;
        return (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', left: BX + i * 100, top: BASE - h, width: 70, height: Math.max(h, 2), borderRadius: '6px 6px 0 0', background: hexA(c, 0.45), border: `2px solid ${c}`, boxSizing: 'border-box', opacity: E(t, at) }}></div>
            <Txt x={BX + i * 100 + 35} y={BASE - h - 30} anchor="mid" mono fs={17} color={c} a={E(t, at)}>{ms < 1 ? ms.toFixed(2) : ms.toFixed(1)}</Txt>
            <Txt x={BX + i * 100 + 35} y={BASE + 8} anchor="mid" mono fs={17} color={full ? PAL.bad : PAL.ink3} a={E(t, at)}>{full ? 'gc()' : `GC${i}`}</Txt>
          </React.Fragment>
        );
      })}
      <Badge x={1250} y={300} text="warm-up" tone="ink" a={E(t, 8)} fs={17} />
      <Badge x={1600} y={300} text="Pause Full (System.gc())" tone="bad" solid a={POP(t, 12.8)} fs={17} />
      <Gauge x={840} y={616} w={984} value={committed} max={300} label="committed heap (G1 adaptive sizing)" right={`${Math.round(committed)}M`} a={E(t, 6)} />
      <Console x={840} y={712} w={984} h={218} t={t} a={E(t, 12)} fs={17} lh={28} title="terminal · JDK 17 · abridged" items={[
        { at: 12.2, text: 'java -Xmx512m -Xlog:gc ExplicitGc', kind: 'cmd' }, { at: 12.5, text: 'calling System.gc()' }, { at: 12.9, text: 'GC(8) Pause Full (System.gc()) 203M->39M(144M) 19.162ms', kind: 'err' },
        { at: 27.4, text: 'java -Xmx512m -Xlog:gc -XX:+DisableExplicitGC ExplicitGc', kind: 'cmd' }, { at: 27.9, text: 'GC(7) Pause Young (Normal) (G1 Evacuation Pause) 61M->40M(283M)', kind: 'dim' },
        { at: 28.4, text: 'calling System.gc()', kind: 'ok' }, { at: 28.8, text: 'live arrays: 2000' },
      ]} />
      <Badge x={1640} y={846} text="no GC line follows" tone="flow" a={E(t, 28.6)} fs={17} />
      <Badge x={1824} y={130} anchor="right" text="legitimate: tests and benchmark setup only" tone="pull" a={E(t, 47)} fs={17} />
    </React.Fragment>
  );
}

const TRAPS = [
  [3, '“SoftReference makes a good cache”', 'Opaque LRU-clock policy, full or empty. Use Caffeine or a bounded LRU.'],
  [8.5, '“WeakHashMap values are weak”', '**Keys** are weak. A value that points at its key keeps the entry forever.'],
  [14, '“Weak refs clear at the very next GC”', 'At the next GC that covers the referent, and only if no soft path is left.'],
  [19.5, '“Cleaner replaces try-with-resources”', 'A backstop only. And its action must never capture `this`.'],
  [25, '“ThreadLocal is fine without remove()”', 'Pooled threads keep the value: memory, and data across requests.'],
  [30.5, '“System.gc() before heavy work helps”', 'A full GC and discarded sizing. If it seems to help, find the leak.'],
];
export function STraps({ t }) {
  return TRAPS.map(([at, myth, real], i) => {
    const y = 196 + i * 122;
    return (
      <React.Fragment key={i}>
        <Box x={96} y={y} w={760} h={108} label={myth} mono={false} fs={22} tone="bad" a={E(t, at)} strike={t > at + 2} />
        <HArrow x1={870} x2={940} y={y + 54} a={E(t, at + 1.5)} color={PAL.flow} />
        <Card x={956} y={y} w={868} h={108} a={E(t, at + 1.6)} tone="flow" title={real} tfs={22} />
      </React.Fragment>
    );
  });
}

const RECAP = [
  [3, '1', 'Reachability', 'Alive = reachable from a root. The **strongest** path decides the level.'],
  [8, '2', 'Soft and weak', 'Soft: cleared when memory is short (LRU clock). Weak: the next GC that sees it.'],
  [13, '3', 'Phantom + queues', '`get()` is always null. Enqueued after collection. Keep the Reference reachable.'],
  [18, '4', 'WeakHashMap', 'Weak keys, strong values. Stale entries leave when you next touch the map.'],
  [23, '5', 'Cleanup', '`finalize()`: deprecated for removal. try-with-resources first, `Cleaner` as backstop.'],
  [28, '6', 'Leaks', 'Static maps, listeners, ThreadLocal, inner classes, resources, keys, caches. Not `System.gc()`.'],
];
export function SRecap({ t }) {
  return RECAP.map(([at, n, title, sub], i) => <Card key={n} x={96 + (i % 3) * 584} y={210 + Math.floor(i / 3) * 330} w={560} h={300} num={n} title={title} sub={sub} tfs={34} sfs={24} a={E(t, at)} tone={i === 5 ? 'bad' : undefined} glow={i === 5 ? win(t, 28.5, 40) : 0} />);
}
