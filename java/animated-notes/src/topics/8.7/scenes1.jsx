// 8.7 scenes, part 1: intro, reachability, the four strengths, soft vs weak.
// Every console line is real JDK 17 output (G1, macOS); -Xlog:gc decorations are trimmed.
import { KIND, RArrow, Obj, RefBox, GcSweep, Gauge, Chart, Legend, Tok, Region } from './common.jsx';
const { PAL, MOTION, lin, lerp, win, pulse, step, track1, hlAt, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Mark, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

// Real: java -Xmx32m -Xlog:gc Sessions (leak 1). [seconds, heap MB] before/after each GC.
export const LEAK_PTS = [[0, 1], [0.39, 14], [0.465, 17], [0.513, 19], [0.539, 20], [0.565, 21], [0.59, 22], [0.616, 23], [0.642, 24], [0.668, 25], [0.693, 26], [0.718, 27], [0.744, 28], [0.769, 29], [0.794, 30]];

// ── Intro ──────────────────────────────────────────────────────────────────
export function SIntro({ t }) {
  const rows = [['strong', 'a.png'], ['soft', 'b.png'], ['weak', 'c.png'], ['phantom', 'd.png']];
  return (
    <React.Fragment>
      <Txt x={96} y={150} mono fs={22} weight={600} color={PAL.pull} a={E(t, 0.3)} style={{ letterSpacing: '0.14em' }}>PART 08 · THE JVM · 8.7</Txt>
      <Txt x={92} y={192} fs={110} weight={700} lh={1} a={E(t, 0.6, 0.9)} style={{ letterSpacing: '-0.03em', transform: `translateY(${(1 - E(t, 0.6, 0.9)) * 24}px)` }}>References and reachability</Txt>
      <Txt x={96} y={330} fs={34} color={PAL.ink2} a={E(t, 1.4, 0.8)}>Who keeps an object alive, how to hold one loosely, and why Java still leaks.</Txt>

      <Box x={96} y={480} w={200} h={360} label="GC root" sub="main() locals" tone="flow" a={E(t, 2)} fs={24} />
      {rows.map(([k, f], i) => {
        const y = 520 + i * 92;
        return (
          <React.Fragment key={k}>
            <RArrow pts={[[300, y], [600, y]]} kind={k} draw={M(t, 6 + i * 1.1, 0.8)} label={k} lx={450} ly={y - 14} lfs={17} />
            <Obj x={606} y={y - 30} w={230} h={60} name={f} sub="1 MB of pixels" a={E(t, 6.5 + i * 1.1)} tone={KIND[k].tone} />
          </React.Fragment>
        );
      })}
      <Txt x={96} y={862} fs={20} color={PAL.ink2} a={E(t, 10.5)}>each arrow: a different promise about when the GC may take the image</Txt>

      <Chart x={1000} y={470} w={824} h={420} a={E(t, 12)} title="heap after each GC" right="a leak" xmax={0.85} ymax={32} yTicks={[0, 16, 32]} yUnit="M"
        series={[{ pts: LEAK_PTS, color: PAL.bad, n: lerp(1, LEAK_PTS.length, lin(t, 12.6, 4.4)) }]} xLabel="time →" />
      <Badge x={1412} y={560} text="OutOfMemoryError" tone="bad" solid a={POP(t, 17)} fs={18} />
      <Badge x={1412} y={918} text="running example: an image viewer and its picture cache" tone="pull" a={E(t, 18.2)} fs={17} />
    </React.Fragment>
  );
}

// ── Reachability ───────────────────────────────────────────────────────────
export function SReachability({ t }) {
  const mk = (at) => (t >= at ? 'flow' : 'ink');
  const dot = (s, x1, y1, x2, y2) => { const p = M(t, s, 0.7); return p > 0 && p < 1 ? <Dot x={lerp(x1, x2, p)} y={lerp(y1, y2, p)} r={8} color={PAL.flow} /> : null; };
  const islandGone = M(t, 17, 1);
  const fields = [['referent', 'private T referent;'], ['queue', 'volatile ReferenceQueue queue;'], ['next', 'volatile Reference next;'], ['discovered', 'transient Reference discovered;']];
  const ladder = [['strongly', 'flow'], ['softly', 'pull'], ['weakly', 'blue'], ['phantom', 'violet'], ['unreachable', 'dim']];
  return (
    <React.Fragment>
      <Panel x={96} y={200} w={340} h={330} title="GC roots" tone="flow" a={E(t, 0.6)} />
      <Box x={120} y={262} w={292} h={72} label="viewer" sub="local · main()" tone="flow" a={E(t, 1.2)} />
      <Box x={120} y={356} w={292} h={72} label="CACHE" sub="static field" tone="flow" a={E(t, 1.6)} />
      <Txt x={120} y={452} fs={17} mono color={PAL.ink3} a={E(t, 2.2)} w={300}>also: other threads, JNI handles, classes…</Txt>

      <Panel x={480} y={200} w={1344} h={330} title="heap" a={E(t, 2.5)} />
      <Obj x={520} y={262} w={230} h={66} name="ImageViewer" tone={mk(7.6)} a={E(t, 3)} glow={pulse(t, [7.6], 1)} />
      <Obj x={820} y={262} w={230} h={66} name="Image" sub="cat.png" tone={mk(8.4)} a={E(t, 3.2)} glow={pulse(t, [8.4], 1)} />
      <Obj x={1120} y={262} w={230} h={66} name="byte[]" sub="1 MB pixels" tone={mk(9.2)} a={E(t, 3.4)} glow={pulse(t, [9.2], 1)} />
      <Obj x={520} y={380} w={230} h={66} name="HashMap" tone={mk(9.6)} a={E(t, 3.6)} glow={pulse(t, [9.6], 1)} />
      <Obj x={820} y={380} w={230} h={66} name="Image" sub="dog.png" tone={mk(10.4)} a={E(t, 3.8)} glow={pulse(t, [10.4], 1)} />
      <Obj x={1120} y={380} w={230} h={66} name="byte[]" sub="1 MB pixels" tone={mk(11.2)} a={E(t, 4)} glow={pulse(t, [11.2], 1)} />
      <Obj x={1440} y={262} w={230} h={66} name="Image" sub="old.png" a={E(t, 4.2)} tone={t > 13 ? 'bad' : 'ink'} gone={islandGone} ghostSub="reclaimed" />
      <Obj x={1440} y={400} w={230} h={66} name="Thumb" sub="old.png" a={E(t, 4.4)} tone={t > 13 ? 'bad' : 'ink'} gone={islandGone} ghostSub="reclaimed" />
      <RArrow pts={[[412, 298], [516, 298]]} draw={M(t, 4.6, 0.5)} />
      <RArrow pts={[[412, 392], [470, 392], [470, 413], [516, 413]]} draw={M(t, 4.8, 0.5)} />
      <RArrow pts={[[750, 295], [816, 295]]} draw={M(t, 5, 0.4)} />
      <RArrow pts={[[1050, 295], [1116, 295]]} draw={M(t, 5.2, 0.4)} />
      <RArrow pts={[[750, 413], [816, 413]]} draw={M(t, 5.4, 0.4)} />
      <RArrow pts={[[1050, 413], [1116, 413]]} draw={M(t, 5.6, 0.4)} />
      <RArrow pts={[[1520, 328], [1520, 396]]} draw={M(t, 5.8, 0.4)} a={1 - 0.6 * islandGone} />
      <RArrow pts={[[1600, 400], [1600, 332]]} draw={M(t, 6, 0.4)} a={1 - 0.6 * islandGone} />
      <Txt x={1555} y={480} anchor="mid" mono fs={17} color={PAL.bad} a={E(t, 13.5)}>a cycle · unreachable</Txt>
      {dot(7, 412, 298, 516, 298)}{dot(7.8, 750, 295, 816, 295)}{dot(8.6, 1050, 295, 1116, 295)}
      {dot(9, 412, 392, 516, 413)}{dot(9.8, 750, 413, 816, 413)}{dot(10.6, 1050, 413, 1116, 413)}

      <Callout x={96} y={590} w={860} tone="flow" a={win(t, 13.5, 26.6)} fs={22} text="Marked objects survive. Unmarked ones are reclaimed, **cycle or not**. The collector never counts references; it only asks: can a root reach you?" />
      <Callout x={1000} y={590} w={824} tone="bad" a={win(t, 20, 26.6)} fs={22} text="So a Java leak is never “the GC missed it”. Something reachable still points at it." />
      <Box x={96} y={640} w={240} h={80} label="ref" sub="local · main()" tone="flow" a={E(t, 27)} />
      <RArrow pts={[[336, 680], [436, 680]]} draw={M(t, 27.5, 0.5)} />
      <Panel x={440} y={590} w={470} h={250} title="WeakReference<Image>" right="javap -p" tone="blue" a={E(t, 27.8)}>
        <div style={{ padding: '8px 0' }}>
          {fields.map(([f, s], i) => {
            const lit = f === 'referent' && t > 33;
            return <div key={f} style={{ height: 46, display: 'flex', alignItems: 'center', padding: '0 20px', font: `500 18px ${MONO}`, color: lit ? PAL.ink : PAL.ink2, background: lit ? hexA(PAL.pull, 0.14) : 'transparent', borderLeft: `3px solid ${lit ? PAL.pull : 'transparent'}`, opacity: E(t, 33 + i * 0.3) }}>{s}</div>;
          })}
        </div>
      </Panel>
      <RArrow pts={[[910, 665], [996, 665]]} kind="weak" draw={M(t, 34, 0.6)} />
      <Obj x={1000} y={632} w={240} h={66} name="Image" sub="cat.png" tone="blue" a={E(t, 34.4)} />
      <Badge x={1120} y={736} text="not followed while marking" tone="pull" a={E(t, 40)} fs={17} />
      <Callout x={1290} y={590} w={534} tone="pull" a={E(t, 39)} fs={20} text="Marking follows every field **except** `referent`. The GC notes the Reference on a list and decides about it after marking." />
      <Callout x={1290} y={738} w={534} tone="flow" a={E(t, 53)} fs={20} text="An object's level is its **strongest** path. One strong path beats any number of weak ones." />
      {ladder.map(([l, tone], i) => (
        <React.Fragment key={l}>
          <Box x={96 + i * 346} y={866} w={300} h={56} label={l} sub={i < 4 ? 'reachable' : ''} tone={tone} a={E(t, 47 + i * 0.5)} fs={19} sfs={17} />
          {i < 4 && <Txt x={96 + i * 346 + 323} y={894} anchor="center" mono fs={22} color={PAL.ink3} a={E(t, 47 + i * 0.5)}>›</Txt>}
        </React.Fragment>
      ))}
    </React.Fragment>
  );
}

// ── The four strengths under a GC cycle ────────────────────────────────────
export function SFourStrengths({ t }) {
  const R = [276, 386, 496, 606];
  const [hl, hA] = hlAt(t, [[1, 1], [7, 2], [9, 3], [11, 4], [19, 5], [38, 6]]);
  const heap = t < 19 ? 9 : t < 38 ? lerp(9, 5, M(t, 19.5, 0.8)) : t < 51.5 ? lerp(5, 61, lin(t, 38.5, 11.5)) : lerp(61, 59, M(t, 52, 0.6));
  const cutC = M(t, 20, 0.6), goneC = M(t, 20.6, 0.8), goneD = M(t, 21.2, 0.8), cutD = M(t, 26, 0.6);
  const cutB = M(t, 52, 0.6), goneB = M(t, 52.6, 0.8);
  const slotX = (i) => 1070 + i * 300;
  return (
    <React.Fragment>
      <Code x={96} y={196} w={760} h={290} title="Strengths.java" a={E(t, 0.4)} fs={17} lh={30} hl={hl} hlA={hA} lines={[
        'var queue = new ReferenceQueue<Image>();', 'Image a = new Image("a.png");', 'var b = new SoftReference<>(new Image("b.png"), queue);',
        'var c = new WeakReference<>(new Image("c.png"), queue);', 'var d = new PhantomReference<>(new Image("d.png"), queue);', 'System.gc();', '// then: allocate 1 MB blocks until b is cleared',
      ]} />
      <Console x={96} y={506} w={760} h={424} t={t} a={E(t, 1)} fs={17} lh={27} title="terminal · JDK 17 · log trimmed" items={[
        { at: 15, text: 'java -Xmx64m -Xlog:gc Strengths', kind: 'cmd' }, { at: 15.6, text: 'phantom.get() = null' },
        { at: 19.6, text: 'GC(0) Pause Full (System.gc()) 9M->5M(24M)', kind: 'dim' }, { at: 21, text: 'after GC  : a=a.png  b=alive  c=cleared  d=cleared' },
        { at: 27, text: '  queue.poll() -> weak c', kind: 'ok' }, { at: 27.6, text: '  queue.poll() -> phantom d', kind: 'ok' },
        { at: 45, text: 'GC(13) Pause Full (G1 Compaction Pause) 59M->59M(64M)', kind: 'dim' }, { at: 47, text: 'GC(17) Pause Full (G1 Compaction Pause) 61M->61M(64M)', kind: 'dim' },
        { at: 52, text: 'GC(18) Pause Full (G1 Compaction Pause) 61M->59M(64M)', kind: 'ok' }, { at: 53, text: 'pressure  : soft b cleared after allocating 29 MB' },
        { at: 55, text: '  queue.poll() -> soft b', kind: 'ok' }, { at: 59, text: 'a is still a.png (strong: never collected while reachable)' },
      ]} />

      <Region x={900} y={196} w={200} h={470} title="main()" tone="flow" a={E(t, 1.6)} />
      {['a', 'b', 'c', 'd'].map((n, i) => <Box key={n} x={916} y={R[i] - 30} w={168} h={60} label={n} sub="local" tone="flow" a={E(t, [1.8, 7, 9, 11][i])} fs={22} sfs={17} glow={i === 0 ? pulse(t, [59.5], 1.4) : 0} />)}
      <RArrow pts={[[1084, R[0]], [1586, R[0]]]} draw={M(t, 2.2, 0.8)} label="strong" lx={1330} ly={R[0] - 14} lfs={17} glow={win(t, 59.5, 66)} />
      <Obj x={1590} y={R[0] - 32} w={234} h={64} name="a.png" sub="1 MB" tone="flow" a={E(t, 2.8)} glow={pulse(t, [59.5], 1.4)} />
      {[['b', 'soft', 'SoftReference', 7.3, cutB, goneB], ['c', 'weak', 'WeakReference', 9.3, cutC, goneC], ['d', 'phantom', 'PhantomReference', 11.3, cutD, goneD]].map(([n, k, title, at, cut, gone], j) => {
        const y = R[j + 1];
        return (
          <React.Fragment key={n}>
            <RArrow pts={[[1084, y], [1176, y]]} draw={M(t, at, 0.4)} />
            <RefBox x={1180} y={y - 36} w={290} h={72} kind={k} title={title} cleared={k === 'phantom' ? (t > 13.6 ? 1 : 0) : cut} a={E(t, at + 0.3)} glow={k === 'phantom' ? pulse(t, [13.8], 1.2) : 0} sub={k === 'phantom' && t > 13.6 && t < 26 ? 'get() → null' : undefined} />
            <RArrow pts={[[1470, y], [1586, y]]} kind={k} draw={M(t, at + 0.6, 0.5)} cut={cut} label={k} lx={1528} ly={y - 14} lfs={17} />
            <Obj x={1590} y={y - 32} w={234} h={64} name={`${n}.png`} sub="1 MB" tone={KIND[k].tone} a={E(t, at + 0.9)} gone={gone} />
          </React.Fragment>
        );
      })}
      <GcSweep t={t} at={19} x={1100} y={196} w={724} h={470} label="System.gc()" />
      <GcSweep t={t} at={44} dur={1.6} x={1100} y={196} w={724} h={470} label="young + full GCs" tone="ink" />
      <GcSweep t={t} at={50.6} x={1100} y={196} w={724} h={470} label="last-ditch full GC" tone="bad" />

      <Panel x={900} y={690} w={924} h={116} title="ReferenceQueue<Image>" right="poll() · remove()" tone="violet" a={E(t, 13.5)} />
      <Tok t={t} keys={[[26.2, 1325, R[2]], [27.4, slotX(0), 768]]} text="WeakReference c" tone="blue" w={270} />
      <Tok t={t} keys={[[26.8, 1325, R[3]], [28, slotX(1), 768]]} text="PhantomReference d" tone="violet" w={270} />
      <Tok t={t} keys={[[54, 1325, R[1]], [55.2, slotX(2), 768]]} text="SoftReference b" tone="pull" w={270} />
      <Gauge x={900} y={826} w={924} value={heap} max={64} label="heap · -Xmx64m" a={E(t, 14)} />
      <Badge x={1362} y={160} text="memory pressure: allocating 1 MB blocks" tone="bad" a={win(t, 38.5, 52)} fs={17} />
    </React.Fragment>
  );
}

// ── The four strengths: summary table ──────────────────────────────────────
export function SStrengthTable({ t }) {
  const name = (k) => <span style={{ color: KIND[k].color, font: `600 22px ${MONO}` }}>{k}</span>;
  const rows = [
    [name('strong'), 'never, while strongly reachable', 'the object', 'everything normal'],
    [name('soft'), 'when memory is short · all of them before an OOM', 'object, or null', 'memory-sensitive caches (poorly)'],
    [name('weak'), 'at the next GC that sees it only weakly reachable', 'object, or null', 'canonical maps · metadata · listeners'],
    [name('phantom'), 'after collection: enqueued (cleared too, Java 9+)', 'always null', 'post-mortem cleanup (Cleaner)'],
  ];
  return (
    <React.Fragment>
      <Table x={96} y={210} cols={[190, 640, 250, 648]} head={['strength', 'referent cleared…', 'get() returns', 'use it for']} rows={rows} a={E(t, 0.5)} mono={false} fs={22} rh={88}
        rowA={rows.map((_, i) => E(t, [4, 9, 16, 22][i]))} marks={{ 0: ['flow', win(t, 4, 9)], 1: ['pull', win(t, 9, 16)], 2: ['blue', win(t, 16, 22)], 3: ['violet', win(t, 22, 28)] }} />
      <Legend x={130} y={690} a={E(t, 1.5)} gap={420} len={150} />
      <Txt x={96} y={736} fs={19} color={PAL.ink3} mono a={E(t, 2)}>strongest  ›  soft  ›  weak  ›  phantom  ›  weakest</Txt>
      <Callout x={96} y={796} w={1728} tone="bad" a={E(t, 28)} title="correcting the source note" fs={21} text="The GC does not clear them “in that order when it needs memory”. Only **soft** references wait for memory pressure. A **weak** reference is cleared by any GC that finds its referent only weakly reachable, however much memory is free." />
    </React.Fragment>
  );
}

// ── One object, all four references: the strongest path decides ───────────
export function SStrongestPath({ t }) {
  const Y = { soft: 266, img: 416, weak: 566, phantom: 706 };
  const [hl, hA] = hlAt(t, [[0.8, 0], [2, 1], [3, 2], [4, 3], [6, 4], [12.5, 5]]);
  const cut = M(t, 27.4, 0.6), gone = M(t, 28.2, 0.8);
  const level = t < 6.5 ? 'strongly reachable' : t < 27.6 ? 'softly reachable' : '';
  const qx = (i) => 1280 + i * 215;
  return (
    <React.Fragment>
      <Code x={96} y={196} w={720} h={262} title="SameObject.java" a={E(t, 0.4)} fs={17} lh={32} hl={hl} hlA={hA} lines={[
        'Image img = new Image("cat.png");', 'var soft    = new SoftReference<>(img, queue);', 'var weak    = new WeakReference<>(img, queue);', 'var phantom = new PhantomReference<>(img, queue);', 'img = null;', 'System.gc();   // later: memory pressure',
      ]} />
      <Console x={96} y={480} w={720} h={300} t={t} a={E(t, 1)} fs={17} lh={27} title="terminal · JDK 17" items={[
        { at: 13, text: 'java -Xmx64m SameObject', kind: 'cmd' }, { at: 15, text: 'after System.gc(): soft=alive weak=alive phantom=alive' }, { at: 16, text: '  queue.poll() -> null', kind: 'dim' },
        { at: 28.4, text: 'after pressure:    soft=cleared weak=cleared phantom=cleared' }, { at: 32, text: '  queue.poll() -> soft', kind: 'ok' }, { at: 32.4, text: '  queue.poll() -> weak', kind: 'ok' }, { at: 32.8, text: '  queue.poll() -> phantom', kind: 'ok' },
      ]} />
      <Callout x={96} y={804} w={720} tone="pull" a={E(t, 38)} fs={20} text="Soft and weak references to one object are cleared **atomically**, in the same GC. Then the phantom is enqueued." />

      <Region x={880} y={196} w={210} h={580} title="main()" tone="flow" a={E(t, 1.2)} />
      {['soft', 'img', 'weak', 'phantom'].map((n, i) => <Box key={n} x={896} y={Y[n] - 30} w={178} h={60} label={n} sub="local" tone="flow" a={E(t, [2, 1.4, 3, 4][i])} fs={21} sfs={17} />)}
      <RArrow pts={[[1074, Y.img], [1556, Y.img]]} draw={M(t, 1.8, 0.8)} a={1 - E(t, 7, 0.8)} label="strong" lx={1300} ly={Y.img - 14} lfs={17} />
      <Txt x={1300} y={Y.img + 14} anchor="mid" mono fs={17} color={PAL.bad} a={E(t, 7.2)}>img = null</Txt>
      {[['soft', 'SoftReference', [[1440, Y.soft], [1500, Y.soft], [1500, 400], [1556, 400]], 2.2], ['weak', 'WeakReference', [[1440, Y.weak], [1500, Y.weak], [1500, 450], [1556, 450]], 3.2], ['phantom', 'PhantomReference', [[1440, Y.phantom], [1690, Y.phantom], [1690, 474]], 4.2]].map(([k, title, pts, at]) => (
        <React.Fragment key={k}>
          <RArrow pts={[[1074, Y[k]], [1156, Y[k]]]} draw={M(t, at, 0.4)} />
          <RefBox x={1160} y={Y[k] - 36} w={280} kind={k} title={title} cleared={k === 'phantom' ? 0 : cut} a={E(t, at + 0.2)} sub={k === 'phantom' ? (cut > 0.5 ? 'referent = null' : 'get() → null') : undefined} />
          <RArrow pts={pts} kind={k} draw={M(t, at + 0.5, 0.6)} cut={cut} glow={k === 'soft' ? win(t, 19, 26) : 0} />
        </React.Fragment>
      ))}
      <Obj x={1560} y={380} w={264} h={90} name="cat.png" sub={level} tone={t < 6.5 ? 'flow' : 'pull'} a={E(t, 1)} gone={gone} fs={24} />
      <Badge x={1300} y={345} text="weak waits: a soft path exists" tone="pull" a={win(t, 19, 26.5)} fs={17} />
      <GcSweep t={t} at={12.8} x={1100} y={196} w={724} h={580} label="System.gc()" />
      <GcSweep t={t} at={26.2} x={1100} y={196} w={724} h={580} label="memory pressure" tone="bad" />
      <Panel x={1160} y={790} w={664} h={116} title="ReferenceQueue" tone="violet" a={E(t, 4.5)} />
      {[['soft', 'pull'], ['weak', 'blue'], ['phantom', 'violet']].map(([k, tone], i) => (
        <Tok key={k} t={t} keys={[[31.6 + i * 0.4, 1300, Y[k]], [32.8 + i * 0.4, qx(i), 868]]} text={k} tone={tone} w={196} />
      ))}
      <Txt x={1492} y={862} anchor="mid" mono fs={17} color={PAL.ink3} a={win(t, 16, 31.5)}>queue.poll() → null</Txt>
    </React.Fragment>
  );
}

// ── How HotSpot decides "memory is short" + the all-or-nothing soft cache ──
export function SSoftPolicy({ t }) {
  // grace window on a 0..3 s axis
  const AX0 = 140, AX1 = 1150, sx = (s) => AX0 + (clamp(s, 0, 3) / 3) * (AX1 - AX0);
  const grace = t < 23 ? 63 : 0.63;
  const a1 = 1 - E(t, 32.2, 0.6), a2 = E(t, 33);
  const bars = [[4, 200, 34], [8, 200, 35.5], [12, 200, 37], [16, 0, 39], [20, 0, 40]];
  const BX = 190, BY = 690, BH = 340;
  return (
    <React.Fragment>
      {a1 > 0.01 && (
        <React.Fragment>
          <Code x={96} y={196} w={1000} h={140} title="javap -p java.lang.ref.SoftReference" a={a1 * E(t, 0.6)} fs={20} lh={36} lines={['private static long clock;     // set by the GC, at the end of each cycle', 'private long timestamp;        // = clock, at construction and each get()']} />
          <Callout x={1140} y={196} w={684} tone="pull" a={a1 * E(t, 6)} fs={20} text="So `clock − timestamp` is how long ago, in GC time, this referent was last used." />
          <Box x={96} y={356} w={1728} h={110} label="keep if   clock − timestamp  ≤  freeMB × SoftRefLRUPolicyMSPerMB" sub="freeMB = max heap − used at the last GC   ·   default factor: 1000 ms per MB" tone="pull" a={a1 * E(t, 12)} fs={26} sfs={19} glow={pulse(t, [12.2], 1.2)} />
          <Panel x={96} y={486} w={1100} h={210} title="grace window for an idle soft referent" a={a1 * E(t, 19.5)} />
          <Txt x={AX0} y={548} mono fs={19} color={t < 23 ? PAL.flow : PAL.bad} a={a1 * E(t, 20.4)}>{t < 23 ? '63 MB free × 1000 ms = 63 s   (bar runs off the axis)' : '63 MB free × 10 ms = 0.63 s'}</Txt>
          <div style={{ position: 'absolute', left: AX0, top: 588, width: sx(grace) - AX0, height: 30, borderRadius: 6, background: hexA(t < 23 ? PAL.flow : PAL.bad, 0.4), border: `2px solid ${t < 23 ? PAL.flow : PAL.bad}`, opacity: a1 * E(t, 20) }}></div>
          <div style={{ position: 'absolute', left: AX0, top: 630, width: AX1 - AX0, height: 2, background: PAL.line2, opacity: a1 * E(t, 19.5) }}></div>
          {[0, 1, 2, 3].map((s) => <Txt key={s} x={sx(s)} y={642} anchor="mid" mono fs={17} color={PAL.ink3} a={a1 * E(t, 19.5)}>{s} s</Txt>)}
          <div style={{ position: 'absolute', left: sx(1.5) - 1, top: 578, width: 3, height: 60, background: PAL.pull, opacity: a1 * E(t, 21) }}></div>
          <Txt x={sx(1.5) + 12} y={642} mono fs={17} color={PAL.pull} a={a1 * E(t, 21)}>idle 1.5 s</Txt>
          <Callout x={96} y={720} w={1100} tone="violet" a={a1 * E(t, 24)} fs={20} text="So idle soft referents can be cleared with plenty of memory free, while busy ones survive until the last-ditch GC before an OOM." />
          <Console x={1240} y={486} w={584} h={274} t={t} a={a1 * E(t, 26.5)} fs={17} lh={27} title="terminal · JDK 17" items={[
            { at: 27, text: 'java -XX:SoftRefLRUPolicyMSPerMB=<f> SoftClock', kind: 'cmd' },
            { at: 27.5, text: 'SoftRefLRUPolicyMSPerMB=1000', kind: 'dim' }, { at: 27.8, text: 'soft ref after 1.5 s idle + GC: alive', kind: 'ok' },
            { at: 28.6, text: 'SoftRefLRUPolicyMSPerMB=10', kind: 'dim' }, { at: 28.9, text: 'soft ref after 1.5 s idle + GC: cleared', kind: 'err' },
            { at: 29.7, text: 'SoftRefLRUPolicyMSPerMB=0', kind: 'dim' }, { at: 30, text: 'soft ref after 1.5 s idle + GC: cleared', kind: 'err' },
          ]} />
        </React.Fragment>
      )}
      {a2 > 0.01 && (
        <React.Fragment>
          <Panel x={96} y={196} w={1000} h={600} title="soft cache: 200 thumbnails of 100 KB" right="-Xmx48m" a={a2} />
          <Txt x={130} y={258} mono fs={18} color={PAL.ink3} a={a2}>entries still alive, as the app holds more memory</Txt>
          <div style={{ position: 'absolute', left: 140, top: BY, width: 900, height: 2, background: PAL.line2, opacity: a2 }}></div>
          {bars.map(([mb, v, at], i) => {
            const a = E(t, at), h = (v / 200) * BH * E(t, at, 0.5);
            return (
              <React.Fragment key={mb}>
                <div style={{ position: 'absolute', left: BX + i * 175, top: BY - h, width: 120, height: Math.max(h, 3), borderRadius: '8px 8px 0 0', background: hexA(v ? PAL.pull : PAL.bad, 0.45), border: `2px solid ${v ? PAL.pull : PAL.bad}`, boxSizing: 'border-box', opacity: a }}></div>
                <Txt x={BX + i * 175 + 60} y={BY - h - 36} anchor="mid" mono fs={24} weight={600} color={v ? PAL.pull : PAL.bad} a={a}>{v}</Txt>
                <Txt x={BX + i * 175 + 60} y={BY + 14} anchor="mid" mono fs={18} color={PAL.ink2} a={a2}>{mb} MB</Txt>
              </React.Fragment>
            );
          })}
          <Badge x={880} y={420} text="200 → 0 in one GC" tone="bad" solid a={POP(t, 39.5)} fs={19} />
          <Console x={1140} y={196} w={684} h={290} t={t} a={a2} fs={17} lh={28} title="terminal · JDK 17" items={[
            { at: 33.3, text: 'java -Xmx48m Cache soft', kind: 'cmd' }, { at: 33.5, text: 'soft: cached 200 thumbnails (~20 MB)' },
            { at: 34, text: '  app holds 4 MB -> cache entries still alive: 200' }, { at: 35.5, text: '  app holds 8 MB -> cache entries still alive: 200' },
            { at: 37, text: '  app holds 12 MB -> cache entries still alive: 200' }, { at: 39, text: '  app holds 16 MB -> cache entries still alive: 0', kind: 'err' },
            { at: 40, text: '  app holds 20 MB -> cache entries still alive: 0', kind: 'err' },
          ]} />
          <Callout x={1140} y={510} w={684} tone="flow" a={E(t, 46)} fs={21} text="Full or empty, never in between. Use a **bounded** cache (Caffeine) instead." />
          <Callout x={96} y={820} w={1000} tone="pull" a={E(t, 41)} fs={20} text="The clearing GC is the one out of options, so it clears every soft referent it may." />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}


// ── "Next GC" means the next GC that examines the referent ─────────────────
export function SWeakOldGen({ t }) {
  const sweeps = Array.from({ length: 13 }, (_, k) => 13.9 + k * 0.5);
  const ygc = sweeps.filter((s) => t >= s).length;
  const cutY = M(t, 14.1, 0.5), goneY = M(t, 14.5, 0.6), cutO = M(t, 27.8, 0.5), goneO = M(t, 28.3, 0.6);
  const log = [];
  const young = [['2M->1M(10M)'], ['4M->0M(10M)'], ['4M->1M(10M)'], ['5M->1M(37M)'], ['22M->1M(37M)'], ['22M->1M(37M)'], ['22M->1M(37M)'], ['22M->1M(37M)'], ['22M->1M(40M)'], ['24M->1M(40M)'], ['24M->1M(40M)'], ['24M->1M(40M)'], ['24M->1M(40M)']];
  young.forEach(([s], k) => log.push({ at: sweeps[k] + 0.2, text: `GC(${k + 1}) Pause Young (Normal) (G1 Evacuation Pause) ${s}`, kind: 'dim' }));
  return (
    <React.Fragment>
      <RefBox x={180} y={196} w={290} h={68} kind="weak" title="wYoung" sub="WeakReference" a={E(t, 6.5)} cleared={cutY} />
      <RefBox x={720} y={196} w={290} h={68} kind="weak" title="wOld" sub="WeakReference" a={E(t, 7)} cleared={cutO} />
      <Panel x={96} y={300} w={1000} h={330} title="heap · G1" a={E(t, 0.5)} />
      <Region x={120} y={360} w={440} h={250} title="young" tone="flow" a={E(t, 1)} glow={win(t, 13.8, 20.4) * 0.6} />
      <Region x={590} y={360} w={480} h={250} title="old" tone="violet" a={E(t, 1.4)} glow={pulse(t, [27], 1.5)} />
      <RArrow pts={[[325, 264], [325, 446]]} kind="weak" draw={M(t, 7.2, 0.6)} cut={cutY} />
      <RArrow pts={[[865, 264], [865, 446]]} kind="weak" draw={M(t, 7.6, 0.6)} cut={cutO} />
      <Obj x={200} y={450} w={250} h={70} name="new Object()" sub="young" tone="flow" a={E(t, 6.4)} gone={goneY} />
      <Obj x={735} y={450} w={260} h={70} name="new Object()" sub="old · promoted" tone="violet" a={E(t, 6)} gone={goneO} glow={win(t, 20.5, 27) * 0.7} />
      <Txt x={140} y={570} mono fs={18} color={PAL.flow} a={E(t, 13.9)}>young GCs: {ygc}</Txt>
      <Txt x={610} y={570} mono fs={18} color={PAL.violet} a={win(t, 15, 27)}>not scanned by young GCs</Txt>
      {sweeps.map((s, k) => <GcSweep key={k} t={t} at={s} dur={0.42} x={120} y={360} w={440} h={250} label="young GC" tone="flow" />)}
      <GcSweep t={t} at={26.6} dur={1.3} x={96} y={300} w={1000} h={330} label="full GC" tone="bad" />
      <Callout x={96} y={660} w={1000} tone="pull" a={E(t, 33)} fs={21} text="“Next GC” really means **the next GC that collects the referent’s region**. G1’s young GCs never look at old regions; an old referent waits for a mixed or full GC." />
      <Console x={1140} y={196} w={684} h={734} t={t} a={E(t, 5.5)} fs={17} lh={26} title="terminal · JDK 17 · -Xlog:gc (trimmed)" items={[
        { at: 6, text: 'java -Xmx64m -Xlog:gc OldWeak', kind: 'cmd' }, { at: 7, text: 'GC(0) Pause Full (System.gc()) 1M->0M(10M)', kind: 'dim' },
        ...log,
        { at: 21, text: 'after young GCs: young referent cleared, old referent alive', kind: 'ok' },
        { at: 27.5, text: 'GC(14) Pause Full (System.gc()) 21M->1M(10M)', kind: 'dim' }, { at: 29, text: 'after full GC:   old referent cleared', kind: 'ok' },
      ]} />
    </React.Fragment>
  );
}
