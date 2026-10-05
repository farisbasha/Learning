// 8.7 scenes, part 2: ReferenceQueue delivery, WeakHashMap, finalize(), Cleaner.
// Every console line is real JDK 17 output.
import { KIND, RArrow, Obj, RefBox, GcSweep, Gauge, Tok, Region } from './common.jsx';
const { PAL, MOTION, lin, lerp, win, pulse, hlAt, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Badge, Callout, Mark, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

// ── ReferenceQueue: lifecycle, then a phantom-based cleanup thread ─────────
export function SRefQueue({ t }) {
  const a1 = 1 - E(t, 30.2, 0.6), a2 = E(t, 30.8);
  const states = [
    ['active', 'referent set', 'blue', 5.5],
    ['pending', 'referent cleared', 'pull', 11],
    ['enqueued', 'on your queue', 'violet', 18],
    ['inactive', 'polled · done', 'dim', 24.5],
  ];
  const sx = (i) => 150 + i * 440;
  const cur = states.filter((s) => t >= s[3]).length - 1;
  const R = { sea: 250, sun: 370, sky: 490 };
  const gone = M(t, 39.2, 0.7), seaRefA = 1 - E(t, 43, 0.4), sunRefGone = M(t, 40, 0.8);
  return (
    <React.Fragment>
      {a1 > 0.01 && (
        <React.Fragment>
          {states.map(([l, sub, tone, at], i) => (
            <React.Fragment key={l}>
              <Box x={sx(i)} y={290} w={300} h={130} label={l} sub={sub} tone={tone} a={a1 * E(t, at - 0.3)} fs={30} sfs={17} glow={cur === i ? 0.7 : 0} />
              {i < 3 && <HArrow x1={sx(i) + 306} x2={sx(i) + 434} y={355} a={a1 * E(t, states[i + 1][3] - 0.5)} color={PAL.ink2} label={['GC', 'handler', 'poll()'][i]} lfs={17} />}
            </React.Fragment>
          ))}
          <Txt x={sx(1) + 150} y={436} anchor="mid" mono fs={17} color={PAL.ink3} a={a1 * E(t, 12)}>linked through `discovered`</Txt>
          <Txt x={sx(2) + 150} y={436} anchor="mid" mono fs={17} color={PAL.ink3} a={a1 * E(t, 19)}>linked through `next`</Txt>
          <Tok t={t} keys={[[5.6, sx(0) + 150, 500], [11.2, sx(0) + 150, 500], [12.2, sx(1) + 150, 500], [18.3, sx(1) + 150, 500], [19.3, sx(2) + 150, 500], [24.8, sx(2) + 150, 500], [25.8, sx(3) + 150, 500]]} text="WeakReference c" tone="blue" w={260} until={30} />
          <Obj x={sx(0) + 40} y={560} w={220} h={60} name="c.png" tone="blue" a={a1 * E(t, 6)} gone={M(t, 11.4, 0.6)} />
          <Console x={300} y={660} w={1320} h={190} t={t} a={a1 * E(t, 17.5)} fs={17} lh={30} title="jcmd <pid> Thread.print · JDK 17 (trimmed)" items={[
            { at: 18, text: '"Reference Handler" #2 daemon prio=10 os_prio=31 ... waiting on condition', kind: 'ok' },
            { at: 18.4, text: '"Finalizer" #3 daemon prio=8 os_prio=31 ... in Object.wait()' },
            { at: 18.8, text: '"Common-Cleaner" #13 daemon prio=8 os_prio=31 ... in Object.wait()' },
          ]} />
        </React.Fragment>
      )}
      {a2 > 0.01 && (
        <React.Fragment>
          <Code x={96} y={196} w={860} h={428} title="Tracker.java" a={a2} fs={17} lh={30} hl={t > 44 ? 9 : 8} hlA={win(t, 38, 50)} lines={[
            'class TextureRef extends PhantomReference<Texture> {', '    final long handle;          // copied out: get() is null', '    TextureRef(Texture t, ReferenceQueue<Texture> q, long h) {', '        super(t, q); handle = h; }', '}',
            'static final Set<TextureRef> LIVE = new HashSet<>();', '// cleanup thread:', 'while (true) {', '    var r = (TextureRef) QUEUE.remove();   // blocks', '    freeGpu(r.handle);  LIVE.remove(r);', '}',
          ]} />
          <Console x={96} y={648} w={860} h={200} t={t} a={a2} fs={17} lh={27} title="terminal · JDK 17" items={[
            { at: 37, text: 'java Tracker', kind: 'cmd' }, { at: 38.5, text: 'System.gc()' },
            { at: 45, text: '  cleanup thread: freeing GPU handle of sea.png  (get() = null)', kind: 'ok' },
            { at: 51, text: 'sky.png still in use: sky.png; sun.png was never reported', kind: 'err' },
          ]} />
          <Box x={1000} y={210} w={220} h={300} label="LIVE" sub="static Set" tone="flow" a={a2 * E(t, 30)} />
          <Box x={1000} y={560} w={220} h={64} label="sky" sub="local" tone="flow" a={a2 * E(t, 30.4)} fs={20} sfs={17} />
          {[['sea', 30.6, seaRefA], ['sun', 31, 1 - 0.7 * sunRefGone], ['sky', 31.4, 1]].map(([n, at, ra]) => (
            <React.Fragment key={n}>
              {n !== 'sun' && <RArrow pts={[[1220, R[n]], [1286, R[n]]]} draw={M(t, at, 0.4)} a={a2 * ra} />}
              <RefBox x={1290} y={R[n] - 34} w={270} h={68} kind="phantom" title="TextureRef" sub={`${n}.png · handle`} a={a2 * E(t, at + 0.2) * ra} />
              <RArrow pts={[[1560, R[n]], [1626, R[n]]]} kind="phantom" draw={M(t, at + 0.4, 0.4)} a={a2 * ra} />
              <Obj x={1630} y={R[n] - 32} w={194} h={64} name={`${n}.png`} sub="Texture" tone={n === 'sky' ? 'flow' : 'violet'} a={a2 * E(t, at + 0.6)} gone={n === 'sky' ? 0 : gone} />
            </React.Fragment>
          ))}
          <Txt x={1425} y={R.sun + 40} anchor="mid" mono fs={17} color={PAL.bad} a={a2 * E(t, 32)}>nothing holds this Reference</Txt>
          <RArrow pts={[[1220, 592], [1590, 592], [1590, 512], [1626, 512]]} draw={M(t, 31.6, 0.6)} a={a2} />
          <Box x={1290} y={650} w={534} h={80} label="texture-cleanup thread" sub={t > 46.4 ? 'freed GPU handle of sea.png' : 'blocked in QUEUE.remove()'} tone="pull" a={a2 * E(t, 37.5)} glow={pulse(t, [46.4], 1.6)} fs={20} />
          <Panel x={1290} y={756} w={534} h={110} title="QUEUE" tone="violet" a={a2 * E(t, 37.5)} />
          <Tok t={t} keys={[[43, 1425, R.sea], [44.2, 1557, 828], [45.4, 1557, 828], [46.2, 1557, 690]]} text="TextureRef sea" tone="violet" w={250} until={46.2} />
          <GcSweep t={t} at={38.4} x={1000} y={200} w={824} h={440} label="GC" />
          <Badge x={1425} y={R.sun - 50} text="the Reference itself was collected" tone="bad" a={a2 * E(t, 51)} fs={17} />
          <Callout x={96} y={866} w={860} tone="pull" a={E(t, 57)} fs={19} text="Keep Reference objects **strongly reachable** until they are processed." />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

// ── WeakHashMap: the entry is a WeakReference; expunging happens later ─────
function EntryBox({ x, y, w = 520, h = 130, a, stale = 0, glow = 0, n }) {
  if (a <= 0.005) return null;
  const s = stale > 0.5;
  return (
    <React.Fragment>
      <Box x={x} y={y} w={w} h={h} tone={s ? 'bad' : 'blue'} dashed={s} a={a} glow={glow} />
      <Txt x={x + 20} y={y + 12} mono fs={18} weight={600} color={PAL.blue} a={a}>Entry extends WeakReference</Txt>
      <Txt x={x + w - 20} y={y + 12} anchor="right" mono fs={17} color={PAL.violet} a={a}>queue: map's</Txt>
      <Txt x={x + 20} y={y + 50} mono fs={18} color={PAL.ink2} a={a}>referent (key)</Txt>
      <Txt x={x + 210} y={y + 50} mono fs={18} color={s ? PAL.bad : PAL.ink} a={a}>{s ? '= null' : `→ Page${n}`}</Txt>
      <Txt x={x + 20} y={y + 92} mono fs={18} color={PAL.ink2} a={a}>value</Txt>
      <Txt x={x + 210} y={y + 92} mono fs={18} color={PAL.ink} a={a}>→ Thumbnail (strong)</Txt>
    </React.Fragment>
  );
}
export function SWeakMapVanish({ t }) {
  const rows = [{ y: 280, n: 1, cell: 1 }, { y: 470, n: 2, cell: 4 }];
  const k = (y) => y + 62, v = (y) => y + 104;
  const dropP1 = E(t, 19.4, 0.6), cutK = M(t, 25.4, 0.5), goneP1 = M(t, 25.8, 0.7);
  const stale = t > 26 ? 1 : 0, expunged = E(t, 40, 0.8), goneThumb = M(t, 45.5, 0.8);
  return (
    <React.Fragment>
      <Panel x={96} y={200} w={940} h={560} title="WeakHashMap<Page, Thumbnail>" right="table" tone="blue" a={E(t, 0.5)} />
      {Array.from({ length: 6 }, (_, i) => {
        const used = rows.some((r) => r.cell === i) && !(i === 1 && expunged > 0.5);
        return <Box key={i} x={120} y={270 + i * 58} w={70} h={50} label={used ? '●' : ''} tone={used ? 'blue' : undefined} a={E(t, 0.8 + i * 0.05)} fs={18} />;
      })}
      {rows.map((r, j) => {
        const ea = E(t, 1.5 + j) * (j === 0 ? 1 - expunged : 1);
        const cy = 270 + r.cell * 58 + 25;
        return (
          <React.Fragment key={r.n}>
            <RArrow pts={[[190, cy], [256, cy]]} draw={M(t, 1.6 + j, 0.4)} a={j === 0 ? 1 - expunged : 1} />
            <EntryBox x={260} y={r.y} a={ea} n={r.n} stale={j === 0 ? stale : 0} glow={j === 0 ? win(t, 31, 38) : pulse(t, [7.2], 1.2)} />
            <RArrow pts={[[780, k(r.y)], [1096, k(r.y)]]} kind="weak" draw={M(t, 7.5 + j * 0.3, 0.6)} cut={j === 0 ? cutK : 0} a={j === 0 ? 1 - expunged : 1} label="weak" lx={940} ly={k(r.y) - 12} lfs={17} />
            <RArrow pts={[[780, v(r.y)], [1376, v(r.y)]]} draw={M(t, 8.1 + j * 0.3, 0.6)} a={j === 0 ? 1 - expunged : 1} glow={j === 0 ? win(t, 31, 38) : 0} />
            <Obj x={1100} y={k(r.y) - 26} w={220} h={52} name={`Page${r.n}`} tone="blue" a={E(t, 2 + j)} gone={j === 0 ? goneP1 : 0} fs={20} />
            <Obj x={1380} y={v(r.y) - 26} w={250} h={52} name="Thumbnail" sub="" tone="flow" a={E(t, 2.3 + j)} gone={j === 0 ? goneThumb : 0} fs={19} glow={j === 0 ? win(t, 31, 38) : 0} ghostSub="" />
            <Box x={1680} y={k(r.y) - 26} w={144} h={52} label={`p${r.n}`} tone="flow" a={E(t, 2.6 + j) * (j === 0 ? 1 - 0.6 * dropP1 : 1)} strike={j === 0 && dropP1 > 0.5} fs={20} />
            <RArrow pts={[[1676, k(r.y)], [1324, k(r.y)]]} draw={M(t, 2.8 + j, 0.5)} a={j === 0 ? 1 - dropP1 : 1} />
          </React.Fragment>
        );
      })}
      <Txt x={1752} y={k(280) + 32} anchor="mid" mono fs={17} color={PAL.bad} a={E(t, 19.6)}>p1 = null</Txt>
      <Region x={120} y={636} w={890} h={100} title="queue · private ReferenceQueue" tone="violet" a={E(t, 13.5)} />
      <Tok t={t} keys={[[26.4, 520, 345], [27.6, 560, 700], [39.4, 560, 700]]} text="Entry (Page1)" tone="bad" w={230} until={39.6} />
      <Badge x={860} y={690} text="size() → expungeStaleEntries()" tone="pull" a={win(t, 38.6, 50)} fs={17} />
      <GcSweep t={t} at={24.6} x={1040} y={200} w={784} h={420} label="GC" />
      <Console x={96} y={780} w={1728} h={160} t={t} a={E(t, 30.5)} fs={17} lh={27} title="terminal · JDK 17 · Expunge.java (reads WeakHashMap fields via reflection)" items={[
        { at: 31, text: 'java --add-opens java.base/java.util=ALL-UNNAMED Expunge', kind: 'cmd' },
        { at: 32, text: 'after GC, before touching the map: internal size field = 2, table slots in use = 2', kind: 'err' },
        { at: 40.2, text: 'm.size() = 1   <- expungeStaleEntries() ran inside size()', kind: 'ok' },
        { at: 45.5, text: 'after size(): internal size field = 1, table slots in use = 1' },
      ]} />
    </React.Fragment>
  );
}

// ── WeakHashMap traps ──────────────────────────────────────────────────────
export function SWeakMapTraps({ t }) {
  const P = [96, 680, 1264];
  const live = [[4, 19], [19, 26], [26, 48]];
  const cutL = M(t, 33.4, 0.5), goneL = M(t, 33.8, 0.6);
  return (
    <React.Fragment>
      {[['1 · value points at its key', 'bad'], ['2 · string literal keys', 'bad'], ['3 · weak listener registry', 'bad']].map(([title, tone], i) => (
        <Panel key={i} x={P[i]} y={196} w={560} h={690} title={title} tone={win(t, live[i][0], live[i][1]) > 0.5 ? 'pull' : undefined} glow={win(t, live[i][0], live[i][1]) * 0.6} a={E(t, [4, 19, 26][i] - 0.5)} />
      ))}
      {/* 1: value → key */}
      <Box x={116} y={262} w={200} h={64} label="Entry" tone="blue" a={E(t, 4.5)} fs={20} />
      <RArrow pts={[[316, 294], [436, 294]]} kind="weak" draw={M(t, 5, 0.5)} label="key" lx={376} ly={282} lfs={17} />
      <Obj x={440} y={262} w={196} h={64} name="Page3" tone={t > 12 ? 'bad' : 'blue'} a={E(t, 5.2)} glow={win(t, 9, 19) * 0.8} />
      <RArrow pts={[[216, 326], [216, 396]]} draw={M(t, 5.6, 0.4)} label="value" lx={262} ly={366} lfs={17} />
      <Obj x={116} y={400} w={300} h={64} name="BadThumbnail" tone="flow" a={E(t, 5.8)} />
      <RArrow pts={[[416, 432], [538, 432], [538, 330]]} kind="bad" draw={M(t, 7, 0.6)} label="page field" lx={480} ly={458} lfs={17} glow={win(t, 9, 19)} />
      <Console x={116} y={500} w={520} h={180} t={t} a={E(t, 11)} fs={17} lh={27} title="terminal · JDK 17" items={[{ at: 11.5, text: 'java Thumbs', kind: 'cmd' }, { at: 12, text: 'value refers to key: after gc,', kind: 'err' }, { at: 12.2, text: '  size = 1  keys = [Page3]', kind: 'err' }]} />
      <Code x={116} y={700} w={520} h={160} title="fix" a={E(t, 15)} fs={17} lh={30} lines={['record Thumbnail(byte[] px) {}', '// no Page inside the value,', '// or hold it as a WeakReference']} />
      {/* 2: literal keys */}
      <Box x={700} y={262} w={230} h={64} label="string table" sub="held by the JVM" tone="flow" a={E(t, 19.5)} fs={19} sfs={17} />
      <RArrow pts={[[930, 294], [986, 294]]} draw={M(t, 20, 0.4)} />
      <Obj x={990} y={262} w={230} h={64} name={'"logo.png"'} sub="interned literal" tone="pull" a={E(t, 20.2)} sfs={17} />
      <Box x={700} y={400} w={230} h={64} label="Entry" tone="blue" a={E(t, 20.6)} fs={20} />
      <RArrow pts={[[930, 432], [1105, 432], [1105, 330]]} kind="weak" draw={M(t, 21, 0.6)} label="key" lx={1018} ly={420} lfs={17} />
      <Console x={700} y={500} w={520} h={180} t={t} a={E(t, 22)} fs={17} lh={27} title="terminal · JDK 17" items={[{ at: 22.5, text: 'java Thumbs', kind: 'cmd' }, { at: 23, text: 'string literal key: after gc, size = 1', kind: 'err' }]} />
      <Code x={700} y={700} w={520} h={160} title="fix" lang="plain" a={E(t, 24)} fs={17} lh={30} lines={['use keys whose lifetime you own:', 'new Page(…), not "logo.png"', '(small boxed Integers are cached too)']} />
      {/* 3: listener registry */}
      <Obj x={1284} y={262} w={230} h={64} name="ImageViewer" sub="alive · open" tone="flow" a={E(t, 26.5)} sfs={17} />
      <RArrow pts={[[1514, 294], [1556, 294]]} draw={M(t, 27, 0.3)} />
      <Obj x={1560} y={262} w={244} h={64} name="λ onTheme" sub="held by a field" tone="flow" a={E(t, 27.2)} sfs={17} />
      <Box x={1284} y={400} w={230} h={64} label="registry" sub="WeakHashMap" tone="blue" a={E(t, 27.6)} fs={20} sfs={17} />
      <RArrow pts={[[1514, 420], [1536, 420], [1536, 340], [1600, 340], [1600, 330]]} kind="weak" draw={M(t, 28, 0.5)} />
      <RArrow pts={[[1514, 444], [1556, 444]]} kind="weak" draw={M(t, 28.4, 0.4)} cut={cutL} />
      <Obj x={1560} y={412} w={244} h={64} name="λ inline" sub="held only by the map" tone="pull" a={E(t, 28.6)} gone={goneL} sfs={17} />
      <GcSweep t={t} at={32.6} x={1264} y={240} w={560} h={250} label="GC" />
      <Console x={1284} y={490} w={520} h={196} t={t} a={E(t, 33)} fs={17} lh={25} title="terminal · JDK 17 · wrapped" items={[
        { at: 33.5, text: 'java WeakRegistry', kind: 'cmd' }, { at: 34, text: 'registered: 2' }, { at: 34.5, text: 'after gc:   1', kind: 'err' }, { at: 34.6, text: '    (viewer A is still alive and open)', kind: 'err' }, { at: 35, text: '  viewer A repaints for dark' },
      ]} />
      <Code x={1284} y={700} w={520} h={160} title="fix" a={E(t, 40)} fs={17} lh={30} lines={['final Consumer<String> onTheme = …;', 'registry.put(onTheme, true);', '// the viewer holds it in a field']} />
    </React.Fragment>
  );
}

// ── finalize(): resurrection, step by step ─────────────────────────────────
export function SFinalize({ t }) {
  const [hl, hA] = hlAt(t, [[6, 6], [13, 8], [13.8, 9], [32, 3], [46, 10], [46.8, 11]]);
  const phases = [['phase 1', 'reconsider soft', 15], ['phase 2', 'clear soft & weak', 19], ['phase 3', 'keep finalizable', 25], ['phase 4', 'notify phantom', 29]];
  const ph = t >= 13.6 && t < 31 ? phases.filter((p) => t >= p[2]).length - 1 : -1;
  const zTone = t < 13 ? 'flow' : t < 25 ? 'bad' : t < 32.5 ? 'pull' : 'flow';
  const zSub = t < 13 ? 'cat.png · reachable' : t < 25 ? 'unreachable' : t < 32.5 ? 'kept alive for finalize()' : t < 46 ? 'resurrected' : 'unreachable again';
  const goneZ = M(t, 47.6, 0.8), cutW = M(t, 19.6, 0.5);
  return (
    <React.Fragment>
      <Code x={96} y={196} w={800} h={428} title="Zombie.java" a={E(t, 0.4)} fs={17} lh={30} hl={hl} hlA={hA} lines={[
        'class Zombie {', '    static Zombie saved;              // a GC root', '    @Override protected void finalize() {', '        saved = this;                 // resurrection', '    }', '}',
        'var z = new Zombie("cat.png");', 'var weak = new WeakReference<>(z);', 'z = null;', 'System.gc();                          // GC #1', 'saved = null;', 'System.gc();                          // GC #2',
      ]} />
      <Console x={96} y={644} w={800} h={286} t={t} a={E(t, 1)} fs={17} lh={27} title="terminal · JDK 17" items={[
        { at: 1.2, text: 'javac Zombie.java', kind: 'cmd' }, { at: 1.6, text: 'Note: Zombie.java uses or overrides a deprecated API.', kind: 'dim' },
        { at: 13, text: 'java Zombie', kind: 'cmd' }, { at: 13.8, text: 'GC #1' },
        { at: 32.6, text: '  finalize() running on thread: Finalizer', kind: 'ok' }, { at: 39.5, text: '  saved = cat.png, weak ref cleared', kind: 'ok' },
        { at: 46.6, text: 'GC #2' }, { at: 48.4, text: '  saved = null   (finalize() never runs twice)' },
      ]} />
      {phases.map(([l, s, at], i) => <Box key={l} x={950 + i * 218} y={196} w={208} h={70} label={l} sub={s} tone={ph === i ? 'pull' : 'ink'} glow={ph === i ? 0.8 : 0} a={E(t, 13.4 + i * 0.15)} fs={18} sfs={17} />)}
      <Txt x={950} y={276} mono fs={17} color={PAL.ink3} a={win(t, 14, 32.8)}>HotSpot reference processing, from -Xlog:gc+phases+ref=debug</Txt>
      <Box x={950} y={330} w={250} h={72} label="Zombie.saved" sub="static field · root" tone="flow" a={E(t, 1.5)} fs={19} sfs={17} />
      <Box x={950} y={466} w={250} h={64} label="z" sub="local" tone="flow" a={E(t, 2)} strike={t > 13} fs={20} sfs={17} />
      <RefBox x={950} y={570} w={250} h={64} kind="weak" title="WeakReference" cleared={cutW} a={E(t, 2.4)} fs={18} sfs={17} />
      <Obj x={1400} y={330} w={300} h={90} name="Zombie" sub={zSub} tone={zTone} a={E(t, 1.8)} gone={goneZ} ghostSub="collected · no finalize()" fs={24} glow={pulse(t, [25, 33], 1.4)} />
      <Badge x={1550} y={308} text="back from the dead" tone="flow" solid a={win(t, 33.4, 46)} fs={17} />
      <RArrow pts={[[1200, 366], [1396, 366]]} draw={M(t, 32.8, 0.6)} a={1 - E(t, 46.2, 0.5)} glow={win(t, 33, 46)} label="saved = this" lx={1298} ly={354} lfs={17} />
      <RArrow pts={[[1200, 498], [1420, 498], [1420, 424]]} draw={M(t, 2.2, 0.5)} a={1 - E(t, 13, 0.6)} />
      <RArrow pts={[[1200, 602], [1460, 602], [1460, 424]]} kind="weak" draw={M(t, 2.8, 0.5)} cut={cutW} />
      <RefBox x={1520} y={520} w={300} h={72} kind="final" title="Finalizer (hidden)" sub="a FinalReference" a={E(t, 6.5) * (1 - E(t, 26, 0.4))} fs={19} sfs={17} glow={pulse(t, [6.8], 1.2)} />
      <RArrow pts={[[1650, 520], [1650, 424]]} kind="final" draw={M(t, 7, 0.5)} a={1 - E(t, 26, 0.4)} />
      <Tok t={t} keys={[[26, 1670, 556], [27.2, 1610, 742], [32.4, 1610, 742]]} text="Finalizer ref" tone="pink" w={200} until={32.4} />
      <Box x={1400} y={700} w={420} h={84} label="Finalizer thread" sub={t > 32.4 && t < 40 ? 'running finalize()' : 'prio 8 · daemon'} tone="pink" a={E(t, 7.5)} glow={win(t, 32.2, 34.5)} fs={21} />
      <GcSweep t={t} at={13.6} dur={1.6} x={940} y={300} w={884} h={500} label="GC #1" />
      <GcSweep t={t} at={46.8} x={940} y={300} w={884} h={500} label="GC #2" />
      <Callout x={950} y={820} w={874} tone="bad" a={E(t, 53)} fs={19} text="Every finalizable object needs **at least two GCs** to die, plus a turn on one thread you don't control." />
    </React.Fragment>
  );
}

// ── finalize(): the problems, and its real status ──────────────────────────
export function SFinalizeProblems({ t }) {
  const cards = [
    ['May never run', 'No guarantee, not even at exit. If the heap never fills, it never runs.', 1.2],
    ['Unpredictable timing', 'Runs later, on the Finalizer thread, in no particular order.', 4.5],
    ['Slows collection', 'At least two GC cycles to reclaim. A slow finalize() backs up the queue.', 10.5],
    ['Can resurrect', '`finalize()` can store `this` anywhere: the object comes back.', 12],
    ['Exceptions swallowed', 'A throw inside it is ignored. Cleanup stops half-way, silently.', 13.5],
    ['A security hole', 'Finalizer attack: a subclass grabs a half-built object whose constructor threw.', 18],
  ];
  const nodes = [['Java 1.0', 'finalize() arrives', 200, 'ink'], ['Java 9', 'deprecated', 700, 'pull'], ['Java 18', 'JEP 421: deprecated for removal', 1200, 'bad'], ['Java 25', 'still present · still deprecated', 1700, 'bad']];
  return (
    <React.Fragment>
      {cards.map(([title, sub, at], i) => <Card key={title} x={96 + (i % 3) * 584} y={196 + Math.floor(i / 3) * 214} w={560} h={196} a={E(t, at)} num={String(i + 1)} title={title} sub={sub} tfs={26} sfs={19} tone="bad" />)}
      <div style={{ position: 'absolute', left: 140, top: 712, width: 1640, height: 4, borderRadius: 2, background: PAL.line2, opacity: E(t, 25) }}></div>
      {nodes.map(([v, s, x, tone], i) => (
        <React.Fragment key={v}>
          <div style={{ position: 'absolute', left: x - 12, top: 702, width: 24, height: 24, borderRadius: 12, background: toneColor(tone), opacity: E(t, 25 + i * 0.7) }}></div>
          <Txt x={x} y={658} anchor="mid" mono fs={21} weight={600} a={E(t, 25 + i * 0.7)}>{v}</Txt>
          <Txt x={x} y={740} anchor="mid" mono fs={17} color={toneColor(tone)} a={E(t, 25 + i * 0.7)}>{s}</Txt>
        </React.Fragment>
      ))}
      <Txt x={1200} y={766} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 27.5)}>adds --finalization=disabled</Txt>
      <Callout x={96} y={810} w={1728} tone="bad" a={E(t, 33)} title="correcting the source note" fs={20} text="The note calls `finalize()` **removed**. It isn't: deprecated in 9, deprecated for removal in 18, still there in Java 25. Run with `--finalization=disabled` (18+) to check you don't depend on it." />
    </React.Fragment>
  );
}

// ── Cleaner vs try-with-resources ──────────────────────────────────────────
export function SCleanerVsTwr({ t }) {
  const [hl, hA] = hlAt(t, [[6, 5], [13, 7], [19.5, 10], [26, -1]]);
  const L1 = 716, L2 = 846;
  const chip = (x, y, label, sub, tone, at, glow) => <Box x={x - 115} y={y - 28} w={230} h={56} label={label} sub={sub} tone={tone} a={E(t, at)} fs={17} sfs={17} glow={glow} />;
  return (
    <React.Fragment>
      <Code x={96} y={196} w={860} h={398} title="Texture.java" a={E(t, 0.4)} fs={17} lh={30} hl={hl} hlA={hA} lines={[
        'class Texture implements AutoCloseable {', '    static final Cleaner CLEANER = Cleaner.create();', '    private final Cleaner.Cleanable cleanable;', '    Texture(String name) {', '        long handle = allocGpu(name);',
        '        cleanable = CLEANER.register(this, new Free(handle));', '    }', '    private record Free(long handle) implements Runnable {', '        public void run() { freeGpu(handle); }', '    }', '    public void close() { cleanable.clean(); }',
      ]} />
      <Box x={1000} y={210} w={250} h={72} label="CLEANER" sub="thread Cleaner-0" tone="pull" a={E(t, 6)} fs={20} sfs={17} />
      <RArrow pts={[[1250, 246], [1296, 246]]} draw={M(t, 6.6, 0.3)} />
      <RefBox x={1300} y={210} w={300} h={72} kind="phantom" title="PhantomCleanable" a={E(t, 7)} fs={19} sfs={17} />
      <RArrow pts={[[1600, 246], [1646, 246]]} draw={M(t, 13.2, 0.3)} />
      <Obj x={1650} y={210} w={174} h={72} name="Free" sub="handle only" tone="flow" a={E(t, 13.4)} sfs={17} glow={win(t, 13.4, 19)} />
      <RArrow pts={[[1400, 282], [1400, 396]]} kind="phantom" draw={M(t, 8, 0.5)} label="phantom" lx={1350} ly={344} lfs={17} />
      <RArrow pts={[[1520, 396], [1520, 286]]} draw={M(t, 9, 0.5)} label="cleanable" lx={1586} ly={344} lfs={17} />
      <Obj x={1300} y={400} w={300} h={72} name="Texture" sub="sky.png · GPU handle" tone="ink" a={E(t, 6.8)} sfs={17} />
      <RArrow pts={[[1737, 282], [1737, 436], [1604, 436]]} kind="bad" draw={M(t, 14.5, 0.6)} cut={E(t, 15.2)} label="no path back" lx={1737} ly={500} lfs={17} />
      <Panel x={96} y={620} w={1728} h={310} title="when does the GPU memory come back?" a={E(t, 19)} />
      <Txt x={120} y={L1 - 12} mono fs={18} weight={600} color={PAL.flow} a={E(t, 19.5)}>try-with-resources</Txt>
      <Txt x={120} y={L2 - 12} mono fs={18} weight={600} color={PAL.bad} a={E(t, 32.5)}>forgot close()</Txt>
      <div style={{ position: 'absolute', left: 360, top: L1, width: 1440, height: 2, background: PAL.line2, opacity: E(t, 19.5) }}></div>
      <div style={{ position: 'absolute', left: 360, top: L2, width: 1440, height: 2, background: PAL.line2, opacity: E(t, 32.5) }}></div>
      {chip(500, L1, 'alloc sky.png', 'main', 'ink', 20.5)}{chip(760, L1, 'using sky.png', 'main', 'ink', 22)}
      {chip(1020, L1, 'free sky.png', 'on thread main', 'flow', 24, pulse(t, [24.2], 1.4))}{chip(1280, L1, 'block ended', '', 'ink', 25.4)}
      <Badge x={1020} y={L1 - 46} text="exactly here" tone="flow" a={E(t, 27)} fs={17} />
      {chip(500, L2, 'alloc sea.png', 'main', 'ink', 33)}{chip(760, L2, 'dropped sea.png', 'no close()', 'bad', 34.5)}
      <div style={{ position: 'absolute', left: 890, top: L2 - 22, width: 560, height: 44, borderRadius: 10, border: `2px dashed ${PAL.ink3}`, opacity: E(t, 36), display: 'flex', alignItems: 'center', justifyContent: 'center', font: `400 17px ${MONO}`, color: PAL.ink3 }}>… until a GC notices · maybe never …</div>
      <Badge x={1480} y={L2} text="GC" tone="pull" solid a={POP(t, 39.6)} fs={17} />
      {chip(1640, L2, 'free sea.png', 'on thread Cleaner-0', 'pull', 40.4, pulse(t, [40.6], 1.4))}
      <Badge x={1600} y={652} text="clean() twice → the action runs once" tone="violet" a={E(t, 47)} fs={17} />
    </React.Fragment>
  );
}

// ── The Cleaner trap: an action that captures this ─────────────────────────
export function SCleanerTrap({ t }) {
  const hot = win(t, 11, 26);
  return (
    <React.Fragment>
      <Code x={96} y={196} w={860} h={200} title="LeakyTexture.java" a={E(t, 0.4)} fs={17} lh={32} lines={[
        'LeakyTexture(String name) {', '    this.name = name;', { s: '    CLEANER.register(this, () -> freeGpu(this.name));', tone: 'bad', toneA: E(t, 5.5) }, '}',
      ]} />
      <Box x={1000} y={220} w={240} h={72} label="Cleaner-0" sub="thread · GC root" tone="flow" a={E(t, 11)} fs={20} sfs={17} />
      <RArrow pts={[[1240, 256], [1296, 256]]} kind={hot > 0.5 ? 'bad' : 'strong'} draw={M(t, 11.4, 0.3)} />
      <RefBox x={1300} y={220} w={260} h={72} kind="phantom" title="PhantomCleanable" a={E(t, 11.2)} fs={18} sfs={17} />
      <RArrow pts={[[1560, 256], [1606, 256]]} kind={hot > 0.5 ? 'bad' : 'strong'} draw={M(t, 12, 0.3)} />
      <Obj x={1610} y={220} w={214} h={72} name="lambda" sub="captured this" tone="bad" a={E(t, 12.2)} sfs={17} />
      <RArrow pts={[[1717, 292], [1717, 436]]} kind="bad" draw={M(t, 12.8, 0.5)} label="this" lx={1760} ly={370} lfs={17} glow={hot} />
      <RArrow pts={[[1430, 292], [1430, 476], [1606, 476]]} kind="phantom" draw={M(t, 13.4, 0.5)} />
      <Obj x={1610} y={440} w={214} h={72} name="LeakyTexture" sub="sun.png" tone="pull" a={E(t, 13)} sfs={17} glow={win(t, 18, 26) * 0.8} />
      <Badge x={1717} y={548} text="still strongly reachable" tone="bad" a={E(t, 21)} fs={17} />
      <GcSweep t={t} at={18.2} dur={1} x={1000} y={210} w={824} h={320} label="GC" />
      <GcSweep t={t} at={19.8} dur={1} x={1000} y={210} w={824} h={320} label="GC" />
      <Console x={96} y={416} w={860} h={190} t={t} a={E(t, 18)} fs={17} lh={26} title="terminal · JDK 17 · Tex.java, case 3" items={[
        { at: 18.5, text: 'java Tex', kind: 'cmd' }, { at: 19, text: '3) cleanup action captures this' }, { at: 21.5, text: '  ...nothing. sun.png is reachable from the Cleaner forever', kind: 'err' },
      ]} />
      <Code x={96} y={640} w={860} h={210} title="fix: a static nested record" a={E(t, 32)} fs={17} lh={28} lines={[
        'CLEANER.register(this, new Free(name, handle));', 'private record Free(String name, long handle)', '        implements Runnable {', '    public void run() { freeGpu(handle); }', '}',
      ]} />
      <Callout x={1000} y={600} w={824} tone="pull" a={E(t, 26)} fs={19} text="A leak and a missed cleanup in one: the same hidden `this` that inner classes and capturing lambdas carry." />
      <Callout x={1000} y={730} w={824} tone="violet" a={E(t, 38.5)} title="the opposite trap · Java 9+" fs={18} text="An object can become unreachable while its own method still runs. The Cleaner could free the handle mid-call. Use `Reference.reachabilityFence(this)` in a `finally`." />
    </React.Fragment>
  );
}
