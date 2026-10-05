// 8.7 scenes, part 3: the seven leak shapes, each with real JDK 17 runs (abridged where long).
import { KIND, RArrow, Obj, RefBox, GcSweep, Gauge, Chart, Tok, Region, LeakTag } from './common.jsx';
import { LEAK_PTS } from './scenes1.jsx';
const { PAL, MOTION, lin, lerp, win, pulse, hlAt, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Dot, Card, Badge, Callout, Mark, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

// Real: java -Xmx32m -Xlog:gc Sessions fixed → each young GC drops back to 1M.
const FIX_PTS = [[0, 1], [0.379, 14], [0.38, 1], [0.837, 19], [0.838, 1], [1.29, 19], [1.291, 1], [1.743, 19], [1.744, 1], [2.196, 19], [2.197, 1]];

// ── 1. Static collections ──────────────────────────────────────────────────
export function SLeakStatic({ t }) {
  const fixed = t >= 34;
  const n = Math.round(lerp(0, 291, lin(t, 12, 14)));
  const filled = fixed ? 0 : Math.round((n / 291) * 120);
  return (
    <React.Fragment>
      <LeakTag n={1} a={E(t, 0.5)} />
      <Code x={96} y={196} w={800} h={324} title="Sessions.java" a={E(t, 0.4)} fs={18} lh={32} lines={[
        'private static final Map<String, Session> SESSIONS', { s: '        = new HashMap<>();          // a GC root', tone: 'pull', toneA: win(t, 5, 12) }, '', 'void handle(Request r) {',
        { s: '    SESSIONS.put(r.id(), new Session(r.user(), 100 KB));', tone: 'bad', toneA: win(t, 12, 34) },
        fixed ? { s: '    try { serve(r); }', tone: 'green' } : '    serve(r);',
        fixed ? { s: '    finally { SESSIONS.remove(r.id()); }   // the fix', tone: 'green' } : { s: '    // nothing ever removes it', tone: 'bad', toneA: win(t, 12, 34) }, '}',
      ]} />
      <Panel x={96} y={544} w={800} h={386} title="what the GC sees" a={E(t, 5)} />
      <Box x={120} y={610} w={250} h={84} label="Sessions.class" sub="static · GC root" tone="flow" a={E(t, 5.5)} fs={20} glow={pulse(t, [5.6], 1.2)} />
      <RArrow pts={[[370, 652], [426, 652]]} draw={M(t, 6, 0.4)} />
      <Box x={430} y={610} w={180} h={84} label="HashMap" sub="SESSIONS" tone="flow" a={E(t, 6.2)} fs={20} />
      <RArrow pts={[[610, 652], [646, 652]]} draw={M(t, 6.6, 0.3)} />
      {Array.from({ length: 120 }, (_, i) => {
        const c = i % 10, r = Math.floor(i / 10);
        const on = i < filled;
        return <div key={i} style={{ position: 'absolute', left: 650 + c * 23, top: 604 + r * 24, width: 19, height: 20, borderRadius: 4, background: on ? hexA(PAL.bad, 0.5) : PAL.panel2, border: `1.5px solid ${on ? PAL.bad : PAL.line}`, opacity: E(t, 6.6) }}></div>;
      })}
      <Txt x={120} y={730} mono fs={20} color={fixed ? PAL.flow : PAL.bad} a={E(t, 12)}>sessions: {fixed ? 0 : n}</Txt>
      <Txt x={120} y={770} mono fs={17} color={PAL.ink3} a={E(t, 12)} w={500}>{fixed ? 'removed when each request ends' : 'each square ≈ 2–3 sessions of 100 KB'}</Txt>
      <Chart x={940} y={196} w={884} h={480} a={E(t, 17.5)} title="heap used · -Xmx32m · real GC log" xmax={2.3} ymax={32} yTicks={[0, 16, 32]} yUnit="M" xTicks={[[0, '0 s'], [1, '1 s'], [2, '2 s']]}
        series={[{ pts: LEAK_PTS, color: PAL.bad, n: lerp(1, LEAK_PTS.length, lin(t, 18, 8)) }, { pts: FIX_PTS, color: PAL.flow, n: lerp(1, FIX_PTS.length, lin(t, 41, 6)) }]} />
      <Badge x={1180} y={300} text="OutOfMemoryError · request 292" tone="bad" solid a={POP(t, 26.4)} fs={17} />
      <Badge x={1560} y={560} text="back to 1M after every GC" tone="flow" a={E(t, 45)} fs={17} />
      <Console x={940} y={700} w={884} h={230} t={t} a={E(t, 18)} fs={17} lh={28} title="terminal · JDK 17 · abridged" items={[
        { at: 18.2, text: 'java -Xmx32m -Xlog:gc Sessions', kind: 'cmd' }, { at: 19, text: 'GC(0) Pause Young (Normal) (G1 Evacuation Pause) 14M->14M(32M)', kind: 'dim' },
        { at: 22, text: 'GC(10) Pause Young (Normal) (G1 Evacuation Pause) 24M->24M(32M)', kind: 'dim' }, { at: 25.6, text: 'GC(21) Pause Full (G1 Compaction Pause) 30M->29M(32M)', kind: 'dim' },
        { at: 26.4, text: 'java.lang.OutOfMemoryError: Java heap space at request 292', kind: 'err' },
        { at: 41, text: 'java -Xmx32m -Xlog:gc Sessions fixed', kind: 'cmd' }, { at: 42, text: 'GC(0) Pause Young (Normal) (G1 Evacuation Pause) 14M->1M(32M)', kind: 'ok' },
        { at: 43.5, text: 'GC(1) Pause Young (Normal) (G1 Evacuation Pause) 19M->1M(32M)', kind: 'ok' }, { at: 45, text: 'requests=1000  sessions=0', kind: 'ok' },
      ]} />
    </React.Fragment>
  );
}

// ── 2. Unremoved listeners ─────────────────────────────────────────────────
export function SLeakListeners({ t }) {
  const fixed = t >= 27;
  const count = fixed ? 0 : Math.round(lerp(0, 295, lin(t, 12, 7)));
  const rows = [0, 1, 2, 3, 4];
  const heap = fixed ? 2 : lerp(1, 31, lin(t, 12, 7.2));
  return (
    <React.Fragment>
      <LeakTag n={2} a={E(t, 0.5)} />
      <Code x={96} y={196} w={800} h={260} title="ImageViewer.java" a={E(t, 0.4)} fs={18} lh={32} lines={[
        'class ImageViewer {', '    final byte[] image = new byte[100 * 1024];', { s: '    final Consumer<String> onTheme = t -> repaint();', tone: 'pull', toneA: win(t, 5, 12) },
        '    void open()  { THEMES.add(onTheme); }', fixed ? { s: '    void close() { THEMES.remove(onTheme); }', tone: 'green' } : { s: '    void close() { }   // forgot THEMES.remove', tone: 'bad', toneA: win(t, 11.5, 27) }, '}',
      ]} />
      <Console x={96} y={480} w={800} h={238} t={t} a={E(t, 18.5)} fs={17} lh={28} title="terminal · JDK 17 · long line wrapped" items={[
        { at: 19, text: 'java -Xmx32m Listeners', kind: 'cmd' }, { at: 19.5, text: 'java.lang.OutOfMemoryError: Java heap space after 296 viewers;', kind: 'err' }, { at: 19.6, text: '    listeners still registered: 295', kind: 'err' },
        { at: 27.5, text: 'java -Xmx32m Listeners fixed', kind: 'cmd' }, { at: 28, text: 'opened 1000 viewers, listeners still registered: 0', kind: 'ok' },
      ]} />
      <Callout x={96} y={744} w={800} tone="violet" a={E(t, 33.5)} fs={20} text="A weak registry also works, **if** the viewer keeps its listener in a field. Otherwise the listener vanishes at the next GC." />

      <Panel x={940} y={196} w={884} h={480} title="reachable from THEMES" a={E(t, 4)} />
      <Box x={964} y={262} w={220} h={72} label="THEMES" sub="static · root" tone="flow" a={E(t, 4.5)} fs={20} />
      <RArrow pts={[[1184, 298], [1226, 298]]} draw={M(t, 5, 0.3)} />
      <Box x={1230} y={262} w={230} h={72} label="listeners" sub="ArrayList" tone="flow" a={E(t, 5.2)} fs={20} />
      {rows.map((i) => {
        const y = 262 + i * 80;
        const ra = (i === 0 ? E(t, 6) : E(t, 12 + i * 1.2)) * (1 - E(t, 27.2, 0.6));
        return (
          <React.Fragment key={i}>
            <RArrow pts={[[1460, 298], [1484, 298], [1484, y + 30], [1506, y + 30]]} draw={1} a={ra} />
            <Obj x={1510} y={y} w={110} h={60} name="λ" sub="theme" tone="pull" a={ra} fs={20} />
            <RArrow pts={[[1620, y + 30], [1656, y + 30]]} a={ra} kind={i === 0 && t < 11.5 ? 'strong' : 'bad'} />
            <Obj x={1660} y={y} w={150} h={60} name="Viewer" sub={t > 11.5 || i > 0 ? 'closed' : 'open'} tone={t > 11.5 || i > 0 ? 'bad' : 'flow'} a={ra} fs={19} />
          </React.Fragment>
        );
      })}
      <Txt x={964} y={420} mono fs={20} color={fixed ? PAL.flow : PAL.bad} a={E(t, 12)}>registered: {count}</Txt>
      <Txt x={964} y={460} mono fs={17} color={PAL.ink3} a={E(t, 12)} w={300}>each closed viewer still holds its 100 KB image</Txt>
      <Txt x={1660} y={650} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 14) * (1 - E(t, 27))}>… 290 more</Txt>
      <Gauge x={940} y={712} w={884} value={heap} max={32} label="heap · -Xmx32m" a={E(t, 12)} right={fixed ? 'stays low' : undefined} />
      <Badge x={1382} y={820} text="OutOfMemoryError after 296 viewers" tone="bad" solid a={win(t, 19.4, 27)} fs={17} />
    </React.Fragment>
  );
}

// ── 3. ThreadLocal in a pooled thread ──────────────────────────────────────
export function SLeakThreadLocal({ t }) {
  const user = t < 18.5 ? '' : t < 25.5 ? 'alice' : 'bob';
  const fixed = t >= 46.5;
  const memA = E(t, 38.6) * (1 - E(t, 54, 0.6));
  return (
    <React.Fragment>
      <LeakTag n={3} a={E(t, 0.5)} />
      <Code x={96} y={196} w={820} h={292} title="Pool.java" a={E(t, 0.4)} fs={18} lh={32} lines={[
        'static final ThreadLocal<UserContext> CONTEXT', '        = new ThreadLocal<>();', 'void handle(Request r) {', '    if (r.user() != null)',
        { s: '        CONTEXT.set(new UserContext(r.user(), 2 MB));', tone: 'pull', toneA: win(t, 5, 12) }, { s: '    UserContext c = CONTEXT.get();   // ...', tone: 'bad', toneA: win(t, 31, 39) }, '}',
      ]} />
      <Console x={96} y={510} w={820} h={262} t={t} a={E(t, 18)} fs={17} lh={28} title="terminal · JDK 17 · one pooled thread" items={[
        { at: 18.2, text: 'java Pool', kind: 'cmd' }, { at: 19, text: '  pool-1-thread-1 request user=alice  sees context of: alice' },
        { at: 26, text: '  pool-1-thread-1 request user=bob    sees context of: bob' }, { at: 31.5, text: '  pool-1-thread-1 request user=null   sees context of: bob', kind: 'err' },
        { at: 47, text: 'java Pool fixed', kind: 'cmd' }, { at: 47.6, text: '  pool-1-thread-1 request user=null   sees context of: nobody', kind: 'ok' },
      ]} />
      <Code x={96} y={796} w={820} h={128} title="the fix" a={E(t, 46.5)} fs={18} lh={30} lines={['try { handle(r); }', { s: 'finally { CONTEXT.remove(); }   // mandatory in pools', tone: 'green' }]} />

      <Box x={960} y={210} w={280} h={90} label="pool-1-thread-1" sub="reused · never dies" tone="flow" a={E(t, 4.5)} fs={21} glow={pulse(t, [18.6, 25.6, 31.2], 1)} />
      <RArrow pts={[[1240, 255], [1296, 255]]} draw={M(t, 5, 0.3)} label="threadLocals" lx={1268} ly={238} lfs={17} />
      <Box x={1300} y={210} w={260} h={90} label="ThreadLocalMap" sub="one per Thread" tone="flow" a={E(t, 5.3)} fs={20} />
      <RArrow pts={[[1430, 300], [1430, 366]]} draw={M(t, 6, 0.3)} />
      <Box x={1300} y={370} w={260} h={130} label="Entry" sub="extends WeakReference" tone="blue" a={E(t, 11.5)} fs={21} glow={pulse(t, [11.8], 1.2)} />
      <RArrow pts={[[1560, 402], [1616, 402]]} kind="weak" draw={M(t, 12, 0.4)} label="key" lx={1588} ly={390} lfs={17} />
      <Obj x={1620} y={370} w={204} h={64} name="CONTEXT" sub="the ThreadLocal" tone="blue" a={E(t, 12.2)} />
      <RArrow pts={[[1560, 476], [1616, 476]]} kind={fixed ? 'strong' : 'bad'} draw={M(t, 13.5, 0.4)} a={user && !(fixed && t > 48) ? 1 : 0.25} label="value" lx={1588} ly={464} lfs={17} />
      <Obj x={1620} y={448} w={204} h={80} name="UserContext" sub={fixed && t > 48 ? 'removed' : user ? `user = ${user}` : '(empty)'} tone={t > 31 && t < 46 ? 'bad' : 'pull'} a={E(t, 13.5)} glow={win(t, 31.2, 39) + pulse(t, [18.8, 25.8], 1)} gone={fixed && t > 48 ? 1 : 0} ghostSub="removed" />
      <Badge x={1722} y={556} text="bob's data, anonymous request" tone="bad" solid a={win(t, 31.4, 39)} fs={17} />
      {[['request · alice', 18], ['request · bob', 25], ['request · (anonymous)', 31]].map(([l, at], i) => (
        <Tok key={i} t={t} keys={[[at, 1100, 590], [at + 0.8, 1100, 320]]} text={l} tone={i === 2 ? 'bad' : 'pull'} w={270} until={at + 1.2} />
      ))}
      <Txt x={1100} y={330} anchor="mid" mono fs={17} color={PAL.ink3} a={win(t, 20, 25) + win(t, 27, 31)}>request finished · value still attached</Txt>

      <Panel x={960} y={620} w={864} h={310} title="8 pool threads · 4 MB buffer each · then a full GC" a={memA} />
      {Array.from({ length: 8 }, (_, i) => (
        <React.Fragment key={i}>
          <Box x={984 + i * 104} y={684} w={92} h={56} label={`T${i + 1}`} tone="flow" a={memA} fs={19} />
          <Box x={984 + i * 104} y={752} w={92} h={44} label="4 MB" tone="bad" a={memA * (fixed ? 1 - E(t, 48, 0.6) : E(t, 39 + i * 0.12))} fs={17} />
        </React.Fragment>
      ))}
      <Txt x={984} y={820} mono fs={19} color={PAL.bad} a={memA * E(t, 40.5)}>{'no remove(): GC(0) Pause Full (System.gc()) 36M->33M(120M)'}</Txt>
      <Txt x={984} y={862} mono fs={19} color={PAL.flow} a={memA * E(t, 48.4)}>{'remove():    GC(0) Pause Full (System.gc()) 36M->1M(10M)'}</Txt>
      <Callout x={960} y={640} w={864} tone="violet" a={E(t, 54.6)} title="classloader leak" fs={20} text="On an app server the pool belongs to the container. A value whose class came from your webapp pins that webapp's whole class loader, and every class it loaded, after a redeploy (8.2)." />
    </React.Fragment>
  );
}

// ── 4. Inner class references ──────────────────────────────────────────────
export function SLeakInner({ t }) {
  const fixed = t >= 26.5;
  const n = fixed ? 1000 : Math.round(lerp(0, 291, lin(t, 13, 6.5)));
  const stack = fixed ? 0 : Math.min(4, Math.floor(n / 60));
  return (
    <React.Fragment>
      <LeakTag n={4} a={E(t, 0.5)} />
      <Code x={96} y={196} w={820} h={292} title="ImageViewer.java" a={E(t, 0.4)} fs={18} lh={32} lines={[
        'class ImageViewer {', '    final byte[] image = new byte[100 * 1024];',
        fixed ? { s: '    static class StaticRefresh implements Runnable {', tone: 'green' } : { s: '    class Refresh implements Runnable {   // inner', tone: 'bad', toneA: win(t, 5, 26) },
        fixed ? { s: '        final String url;  // copies only this', tone: 'green' } : '        public void run() { … }', '    }', '}',
        fixed ? { s: 'SCHEDULER.add(new StaticRefresh(viewer.url));', tone: 'green' } : 'SCHEDULER.add(viewer.new Refresh());',
      ]} />
      <Console x={96} y={510} w={820} h={190} t={t} a={E(t, 5) * (1 - E(t, 26.5, 0.4))} fs={17} lh={28} title="javap -p · JDK 17" items={[
        { at: 5.4, text: "javap -p 'ImageViewer$Refresh'", kind: 'cmd' }, { at: 6, text: 'class ImageViewer$Refresh implements java.lang.Runnable {' },
        { at: 6.6, text: '  final ImageViewer this$0;', kind: 'err' }, { at: 7, text: '  ImageViewer$Refresh(ImageViewer);' },
      ]} />
      <Console x={96} y={510} w={820} h={190} t={t} a={E(t, 26.8)} fs={17} lh={28} title="javap -p · JDK 17" items={[
        { at: 27, text: "javap -p 'ImageViewer$StaticRefresh'", kind: 'cmd' }, { at: 27.5, text: 'class ImageViewer$StaticRefresh implements java.lang.Runnable {' },
        { at: 28, text: '  final java.lang.String url;', kind: 'ok' }, { at: 28.4, text: '  ImageViewer$StaticRefresh(java.lang.String);' },
      ]} />
      <Console x={96} y={722} w={820} h={208} t={t} a={E(t, 19)} fs={17} lh={28} title="terminal · JDK 17 · long line wrapped" items={[
        { at: 19.4, text: 'java -Xmx32m ImageViewer', kind: 'cmd' }, { at: 20, text: 'java.lang.OutOfMemoryError: Java heap space after 292 viewers', kind: 'err' }, { at: 20.1, text: '    (291 tiny tasks queued)', kind: 'err' },
        { at: 32.5, text: 'java -Xmx32m ImageViewer fixed', kind: 'cmd' }, { at: 33, text: '1000 viewers closed, 1000 tasks queued, heap fine', kind: 'ok' },
      ]} />

      {Array.from({ length: stack }, (_, k) => (
        <React.Fragment key={k}>
          <div style={{ position: 'absolute', left: 1280 + (k + 1) * 8, top: 220 + (k + 1) * 8, width: 220, height: 76, borderRadius: 12, border: `2px solid ${hexA(PAL.pull, 0.4)}`, background: PAL.panel2, zIndex: 0 }}></div>
          <div style={{ position: 'absolute', left: 1560 + (k + 1) * 8, top: 220 + (k + 1) * 8, width: 264, height: 76, borderRadius: 12, border: `2px solid ${hexA(PAL.bad, 0.4)}`, background: PAL.panel2 }}></div>
        </React.Fragment>
      ))}
      <Box x={960} y={220} w={260} h={76} label="SCHEDULER" sub="static List · root" tone="flow" a={E(t, 12.5)} fs={20} />
      <RArrow pts={[[1220, 258], [1276, 258]]} draw={M(t, 13, 0.3)} />
      <Obj x={1280} y={220} w={220} h={76} name={fixed ? 'StaticRefresh' : 'Refresh'} sub={fixed ? 'url only' : 'a tiny task'} tone={fixed ? 'green' : 'pull'} a={E(t, 13.2)} fs={fixed ? 19 : 21} />
      <RArrow pts={[[1500, 258], [1556, 258]]} kind="bad" draw={M(t, 13.6, 0.3)} cut={fixed ? 1 : 0} label="this$0" lx={1528} ly={242} lfs={17} glow={win(t, 13.6, 26)} />
      <Obj x={1560} y={220} w={264} h={76} name="ImageViewer" sub="closed" tone="bad" a={E(t, 13.8)} gone={fixed ? 1 : 0} ghostSub="collected" />
      <RArrow pts={[[1692, 296], [1692, 356]]} draw={M(t, 14, 0.3)} a={fixed ? 0.3 : 1} />
      <Obj x={1560} y={360} w={264} h={76} name="byte[]" sub="100 KB image" tone="bad" a={E(t, 14.2)} gone={fixed ? 1 : 0} ghostSub="collected" />
      <Txt x={960} y={340} mono fs={20} color={fixed ? PAL.flow : PAL.bad} a={E(t, 13)}>tasks queued: {n}</Txt>
      <Txt x={960} y={380} mono fs={17} color={PAL.ink3} w={290} a={E(t, 14)}>{fixed ? 'tasks keep only a String' : 'each one drags a closed viewer along'}</Txt>
      <Gauge x={960} y={480} w={864} value={fixed ? 3 : lerp(1, 31, lin(t, 13, 6.5))} max={32} label="heap · -Xmx32m" right={fixed ? 'fine' : undefined} a={E(t, 13)} />
      <Callout x={960} y={600} w={864} tone="pull" a={E(t, 33)} fs={20} text="Anonymous classes, and lambdas that use a field or method of `this`, capture the enclosing instance the same way." />
    </React.Fragment>
  );
}

// ── 5. Unclosed resources ──────────────────────────────────────────────────
export function SLeakResources({ t }) {
  const fixed = t >= 25;
  const reads = fixed ? 0 : Math.round(lerp(0, 253, lin(t, 12, 6.5)));
  const open = fixed ? 4 : Math.min(256, 4 + reads);
  return (
    <React.Fragment>
      <LeakTag n={5} a={E(t, 0.5)} />
      <Code x={96} y={196} w={820} h={196} title="Unclosed.java" a={E(t, 0.4)} fs={18} lh={32} lines={[
        'int readHeader(String path) throws IOException {', { s: '    var in = new FileInputStream(path);   // never closed', tone: 'bad', toneA: win(t, 5, 25) }, '    return in.read();', '}',
      ]} />
      <Console x={96} y={420} w={820} h={226} t={t} a={E(t, 18)} fs={17} lh={28} title="terminal · JDK 17 · long line wrapped" items={[
        { at: 18.4, text: '(ulimit -n 256; java -XX:-MaxFDLimit Unclosed)', kind: 'cmd' }, { at: 19, text: 'after 253 reads: java.io.FileNotFoundException: cat.png', kind: 'err' }, { at: 19.1, text: '    (Too many open files)', kind: 'err' },
        { at: 26, text: '(ulimit -n 256; java -XX:-MaxFDLimit Unclosed fixed)', kind: 'cmd' }, { at: 26.6, text: 'read 5000 headers, fine', kind: 'ok' },
      ]} />
      <Code x={96} y={670} w={820} h={164} title="the fix" a={E(t, 25)} fs={18} lh={32} lines={[{ s: 'try (var in = new FileInputStream(path)) {', tone: 'green' }, '    return in.read();', '}   // closed here, every time']} />
      <Txt x={96} y={856} mono fs={17} color={PAL.ink3} a={E(t, 31.5)} w={820}>-XX:-MaxFDLimit stops HotSpot raising the limit on macOS, so ulimit applies</Txt>

      <Panel x={960} y={196} w={864} h={520} title="process file descriptors" right="ulimit -n 256" a={E(t, 4.5)} />
      {Array.from({ length: 256 }, (_, i) => {
        const c = i % 16, r = Math.floor(i / 16);
        const on = i < open;
        const sys = i < 4;
        const last = !fixed && reads >= 253 && i >= 250;
        const col = sys ? PAL.ink3 : last ? PAL.bad : PAL.pull;
        return <div key={i} style={{ position: 'absolute', left: 980 + c * 52, top: 256 + r * 28, width: 46, height: 22, borderRadius: 4, background: on ? hexA(col, 0.45) : PAL.panel2, border: `1.5px solid ${on ? col : PAL.line}`, opacity: E(t, 5 + r * 0.03) }}></div>;
      })}
      <Txt x={980} y={740} mono fs={20} color={fixed ? PAL.flow : open >= 256 ? PAL.bad : PAL.pull} a={E(t, 12)}>open: {open} / 256   ·   reads: {fixed ? '5000 (each closed)' : reads}</Txt>
      <Gauge x={960} y={790} w={864} value={2} max={64} label="heap: nearly empty, so no GC runs and nothing is released" right="" a={E(t, 12)} />
      <Callout x={960} y={880} w={864} tone="pull" a={E(t, 31.5)} fs={18} text="The JDK's internal cleaner closes them after a GC, eventually. Never rely on it." />
    </React.Fragment>
  );
}

// ── 6. Mutated map keys ────────────────────────────────────────────────────
export function SLeakMutatedKey({ t }) {
  const RY = (i) => 252 + i * 42;
  const mutated = t >= 12.5;
  const probe1 = win(t, 18.5, 22.5), probe2 = win(t, 22.5, 26);
  return (
    <React.Fragment>
      <LeakTag n={6} a={E(t, 0.5)} />
      <Code x={96} y={196} w={820} h={324} title="MutKey.java" a={E(t, 0.4)} fs={18} lh={32} hl={t < 6 ? -1 : t < 12.5 ? 5 : t < 18.5 ? 6 : 7} hlA={E(t, 6) * (1 - E(t, 26))} lines={[
        'final class ImageKey {', { s: '    String url; int width;           // mutable!', tone: 'bad', toneA: win(t, 6, 34) }, '    public int hashCode() { return Objects.hash(url, width); }', '}',
        'var key = new ImageKey("cat.png", 100);', 'cache.put(key, "100px thumbnail");', 'key.width = 200;', 'cache.get(key);   // ?',
      ]} />
      <Console x={96} y={540} w={820} h={262} t={t} a={E(t, 18)} fs={17} lh={28} title="terminal · JDK 17" items={[
        { at: 18.4, text: 'java MutKey', kind: 'cmd' }, { at: 19.5, text: 'get(key)         = null', kind: 'err' }, { at: 23, text: 'get(cat.png,100) = null', kind: 'err' },
        { at: 24, text: 'containsKey(key) = false', kind: 'err' }, { at: 26.4, text: 'size()           = 1' }, { at: 28.5, text: 'after put again, size() = 2', kind: 'err' },
      ]} />
      <Code x={96} y={822} w={820} h={100} title="the fix" a={E(t, 34)} fs={18} lh={32} lines={[{ s: 'record ImageKey(String url, int width) {}   // immutable', tone: 'green' }]} />

      <Panel x={980} y={196} w={844} h={734} title="HashMap table · 16 buckets" right="(h ^ h>>>16) & 15" a={E(t, 2)} />
      {Array.from({ length: 16 }, (_, i) => (
        <React.Fragment key={i}>
          <Txt x={1000} y={RY(i) + 6} mono fs={17} color={i === 11 || i === 7 ? PAL.ink : PAL.ink3} a={E(t, 2.4)}>[{i}]</Txt>
          <div style={{ position: 'absolute', left: 1060, top: RY(i), width: 120, height: 34, borderRadius: 6, background: PAL.panel2, border: `1.5px solid ${PAL.line}`, opacity: E(t, 2.4) }}></div>
        </React.Fragment>
      ))}
      <RArrow pts={[[1180, RY(11) + 17], [1206, RY(11) + 17]]} draw={M(t, 6.4, 0.3)} />
      <Box x={1210} y={RY(11)} w={330} h={34} label={mutated ? 'key(cat.png, 200) → 100px' : 'key(cat.png, 100) → 100px'} tone={t > 26 ? 'bad' : mutated ? 'pull' : 'flow'} a={POP(t, 6.4)} fs={17} glow={pulse(t, [12.6], 1.2) + win(t, 26, 34) * 0.8} />
      <Txt x={1560} y={RY(11) + 6} mono fs={17} color={PAL.flow} a={win(t, 6.6, 12.5)}>hash for width 100</Txt>
      <Txt x={1560} y={RY(11) + 6} mono fs={17} color={PAL.bad} a={E(t, 26.4)}>unreachable by lookup</Txt>
      <Badge x={1395} y={RY(9) + 17} text="hash for width 200 now says bucket 7" tone="pull" a={win(t, 13, 18.5)} fs={17} />
      <Tok t={t} keys={[[18.6, 1700, 210 + 20], [19.6, 1640, RY(7) + 17]]} text="get(key) → [7]" tone="bad" w={220} until={22.4} />
      <Mark x={1210} y={RY(7) + 17} ok={false} a={probe1} />
      <Tok t={t} keys={[[22.6, 1700, 230], [23.4, 1660, RY(11) + 17]]} text="new key(100) → [11]" tone="bad" w={250} until={25.8} />
      <Badge x={1395} y={RY(13) + 17} text="found, but equals() fails: 200 ≠ 100" tone="bad" a={probe2} fs={17} />
      <RArrow pts={[[1180, RY(7) + 17], [1206, RY(7) + 17]]} draw={M(t, 28.2, 0.3)} />
      <Box x={1210} y={RY(7)} w={330} h={34} label="key(cat.png, 200) → 200px" tone="flow" a={POP(t, 28.2)} fs={17} />
      <Txt x={1000} y={RY(15) + 46} mono fs={19} color={t > 28.4 ? PAL.bad : PAL.ink} a={E(t, 26.4)}>size() = {t > 28.4 ? 2 : 1}</Txt>
    </React.Fragment>
  );
}

// ── 7. Caches with no eviction ─────────────────────────────────────────────
export function SLeakCache({ t }) {
  const k = Math.max(0, Math.floor((t - 20) / 0.9));
  const f = t < 20 ? 0 : M(t, 20 + k * 0.9, 0.5);
  const ids = Array.from({ length: 9 }, (_, i) => k + i + 1);
  return (
    <React.Fragment>
      <LeakTag n={7} a={E(t, 0.5)} />
      <Code x={96} y={196} w={820} h={196} title="Cache.java · unbounded" a={E(t, 0.4)} fs={18} lh={32} lines={[
        { s: 'Map<String, byte[]> cache = new HashMap<>();   // unbounded', tone: 'bad', toneA: win(t, 1, 13.5) }, 'byte[] thumb(String url) {', '    return cache.computeIfAbsent(url, Cache::decode);', '}',
      ]} />
      <Code x={96} y={414} w={820} h={278} title="the fix · a bounded LRU" a={E(t, 13.5)} fs={17} lh={30} lines={[
        'class Lru<K, V> extends LinkedHashMap<K, V> {', '    final int max;', { s: '    Lru(int max) { super(16, 0.75f, true); this.max = max; }', tone: 'green', toneA: win(t, 14, 20) },
        { s: '    protected boolean removeEldestEntry(Map.Entry<K, V> e) {', tone: 'green', toneA: win(t, 20, 28) }, { s: '        return size() > max;', tone: 'green', toneA: win(t, 20, 28) }, '    }', '}',
      ]} />
      <Console x={96} y={714} w={820} h={216} t={t} a={E(t, 6)} fs={17} lh={28} title="terminal · JDK 17 · long line wrapped" items={[
        { at: 6.4, text: 'java -Xmx32m Cache unbounded', kind: 'cmd' }, { at: 7, text: 'unbounded: java.lang.OutOfMemoryError: Java heap space', kind: 'err' }, { at: 7.1, text: '    at image 289, cache size = 288', kind: 'err' },
        { at: 28, text: 'java -Xmx32m Cache lru', kind: 'cmd' }, { at: 28.6, text: 'lru: 2000 distinct images requested, cache size = 100', kind: 'ok' },
      ]} />

      <Panel x={960} y={196} w={864} h={230} title="LinkedHashMap · access order" right="max = 100 · 8 drawn" a={E(t, 19.5)} />
      <Txt x={984} y={258} mono fs={17} color={PAL.bad} a={E(t, 20)}>head = eldest → evicted</Txt>
      <Txt x={1800} y={258} anchor="right" mono fs={17} color={PAL.flow} a={E(t, 20)}>tail = newest / just used</Txt>
      {t >= 19.5 && ids.map((id, i) => {
        const x = 984 + (i - f) * 102;
        const a = i === 0 ? 1 - f : i === 8 ? f : 1;
        return <Box key={id} x={x} y={300 + (i === 0 ? f * 40 : 0)} w={92} h={60} label={`img${id}`} tone={i === 0 ? 'bad' : i >= 7 ? 'flow' : 'ink'} a={a * E(t, 19.5)} fs={17} />;
      })}
      <Chart x={960} y={450} w={864} h={480} a={E(t, 5)} title="cache size vs distinct images requested" xmax={2000} ymax={300} yTicks={[0, 100, 200, 300]} xTicks={[[0, '0'], [1000, '1000'], [2000, '2000']]}
        series={[{ pts: [[0, 0], [288, 288]], color: PAL.bad, n: lerp(1, 2, lin(t, 6, 5)) }, { pts: [[0, 0], [100, 100], [2000, 100]], color: PAL.flow, n: lerp(1, 3, lin(t, 28, 5)) }]} />
      <Badge x={1210} y={540} text="OOM at image 289" tone="bad" solid a={POP(t, 11)} fs={17} />
      <Badge x={1560} y={770} text="capped at 100" tone="flow" a={E(t, 32)} fs={17} />
      <Callout x={980} y={520} w={540} tone="pull" a={E(t, 35)} fs={19} text="Production: **Caffeine**. Size or weight bounds, expiry, stats, concurrency." />
    </React.Fragment>
  );
}
