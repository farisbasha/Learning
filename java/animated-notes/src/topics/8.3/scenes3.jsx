// 8.3 scenes, part 3: G1 regions, sizing, metaspace, PermGen, class loader leak, code cache.
const { PAL, MOTION, lin, lerp, win, pulse, step, track, hlAt, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Mark, Val, Brace, toneColor } = window.AN;
import { Gauge, RealTag } from './common.jsx';
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;
const fmtN = (n) => Math.round(n).toLocaleString('en-US');

// ── G1 regions ─────────────────────────────────────────────────────────────
const EDEN_A = [1, 2, 3, 5, 6, 9, 10, 12, 17, 18, 20, 21, 24, 27, 28, 30, 33, 35, 38, 40, 41, 44, 47];
const ORDER = Array.from({ length: 62 }, (_, i) => i).sort((a, b) => ((a * 29) % 62) - ((b * 29) % 62));
const EDEN_B = ORDER.filter((i) => i !== 13).slice(0, 37);
const HUM = (() => { for (let i = 0; i < 61; i++) if (![i, i + 1].some((j) => EDEN_B.includes(j) || j === 13) && (i % 16) !== 15) return [i, i + 1]; return [60, 61]; })();
const regXY = (i) => [96 + (i % 16) * 72, 236 + Math.floor(i / 16) * 72];
export function SG1Regions({ t }) {
  const role = (i) => {
    if ((i === 62 || i === 63) && t >= 13) return ['A', 'ink'];
    if (HUM.includes(i) && t >= 34.4) return ['H', 'pink'];
    if (i === 13 && t >= 20.6) return ['S', 'flow'];
    if (t >= 13 && t < 20.4 && EDEN_A.includes(i) && t >= 13 + EDEN_A.indexOf(i) * 0.08) return ['E', 'pull'];
    if (t >= 27 && EDEN_B.includes(i) && t >= 27 + EDEN_B.indexOf(i) * 0.05) return ['E', 'pull'];
    return null;
  };
  const sx = regXY(13);
  return (
    <React.Fragment>
      {Array.from({ length: 64 }).map((_, i) => {
        const [x, y] = regXY(i);
        const r = role(i);
        const c = r ? toneColor(r[1]) : PAL.line2;
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: 64, height: 64, boxSizing: 'border-box', borderRadius: 8, opacity: E(t, 7 + (i % 16) * 0.03 + Math.floor(i / 16) * 0.1), border: `2px solid ${r ? hexA(c, 0.9) : PAL.line2}`, background: r ? hexA(c, 0.2) : PAL.panel2, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 22px ${MONO}`, color: r ? PAL.ink : PAL.ink3 }}>{r ? r[0] : ''}</div>;
      })}
      <div style={{ position: 'absolute', left: regXY(HUM[0])[0] - 4, top: regXY(HUM[0])[1] - 4, width: 144, height: 72, borderRadius: 10, border: `2px dashed ${PAL.pink}`, opacity: E(t, 34.6), boxSizing: 'border-box' }}></div>
      {EDEN_A.slice(0, 8).map((i, k) => { const p = M(t, 19.6 + k * 0.06, 0.8); const [x, y] = regXY(i); return p > 0 && p < 1 ? <Dot key={k} x={lerp(x + 32, sx[0] + 32, p)} y={lerp(y + 32, sx[1] + 32, p)} r={7} color={PAL.flow} /> : null; })}
      {[['eden', 600, 'pull'], ['S0', 80, 'flow'], ['S1', 80, 'flow'], ['old', 944, 'green']].map(([l, w, tone], i, arr) => {
        const x = 96 + arr.slice(0, i).reduce((q, a) => q + a[1] + 8, 0);
        return <Box key={l} x={x} y={300} w={w} h={110} label={l} tone={tone} a={win(t, 0.6 + i * 0.2, 6.8, 0.5)} fs={22} />;
      })}
      <Txt x={96} y={440} mono fs={18} color={PAL.ink3} a={win(t, 1.4, 6.8, 0.5)}>Serial and Parallel: one contiguous range per space, fixed proportions</Txt>
      <Txt x={96} y={196} mono fs={17} color={PAL.ink3} a={E(t, 7)}>-Xmx64m · 64 regions of 1 MB (G1HeapRegionSize = 1048576)</Txt>

      {[['E', 'eden', 'pull'], ['S', 'survivor', 'flow'], ['O', 'old', 'green'], ['H', 'humongous (old)', 'pink'], ['A', 'archive (CDS)', 'ink'], ['', 'free', null]].map(([k, l, tone], i) => (
        <React.Fragment key={l}>
          <div style={{ position: 'absolute', left: 1290, top: 236 + i * 46, width: 36, height: 36, boxSizing: 'border-box', borderRadius: 6, border: `2px solid ${tone ? toneColor(tone) : PAL.line2}`, background: tone ? hexA(toneColor(tone), 0.2) : PAL.panel2, opacity: E(t, 13 + i * 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 17px ${MONO}`, color: PAL.ink }}>{k}</div>
          <Txt x={1342} y={242 + i * 46} mono fs={19} color={PAL.ink2} a={E(t, 13 + i * 0.15)}>{l}</Txt>
        </React.Fragment>
      ))}
      <Badge x={1560} y={530} text={t >= 27 ? 'eden target: 37 regions' : t >= 20.6 ? 'eden 23 → 0 · survivor 0 → 1' : 'eden: 23 regions'} tone="pull" a={E(t, 13.5)} fs={17} />

      <Txt x={96} y={526} mono fs={17} color={PAL.pink} a={E(t, 35)}>one array bigger than a region → contiguous humongous regions</Txt>
      <Console x={96} y={556} w={1728} h={244} t={t} a={E(t, 19)} fs={17} lh={25} items={[
        { at: 19.4, text: 'java -Xmx64m -Xlog:gc,gc+heap=info Churn', kind: 'cmd' },
        { at: 20, text: '[0.047s][info][gc,heap] GC(0) Eden regions: 23->0(37)', kind: 'ok' },
        { at: 20.4, text: '[0.047s][info][gc,heap] GC(0) Survivor regions: 0->1(3)' },
        { at: 20.8, text: '[0.047s][info][gc,heap] GC(0) Archive regions: 2->2', kind: 'dim' },
        { at: 21.2, text: '[0.047s][info][gc     ] GC(0) Pause Young (Normal) (G1 Evacuation Pause) 23M->1M(64M) 0.567ms' },
        { at: 34.4, text: 'java -Xmx256m -Xlog:gc,gc+heap=info Huge      # keeps 300 arrays of 600 KB', kind: 'cmd' },
        { at: 35, text: '[0.021s][info][gc     ] GC(0) Pause Young (Concurrent Start) (G1 Humongous Allocation) 57M->57M(130M) 0.328ms', kind: 'ok' },
      ]} />
      <Callout x={96} y={818} w={1728} tone="pull" a={E(t, 41)} fs={19} text="`NewRatio` and `SurvivorRatio` describe the classic fixed layout. G1 resizes young every cycle to meet its pause goal, `-XX:MaxGCPauseMillis` (200 ms by default). 8.6 compares the collectors." />
    </React.Fragment>
  );
}

// ── Sizing flags and containers ────────────────────────────────────────────
const FLAGS = [
  ['-Xmx', '2 GB', 'max heap · 25% of RAM'], ['-Xms', '128 MB', 'initial heap · 1/64 of RAM'],
  ['-XX:NewRatio', '2', 'old : young'], ['-XX:SurvivorRatio', '8', 'eden : one survivor'],
  ['-XX:MaxTenuringThreshold', '15', 'age before promotion'], ['-XX:MaxRAMPercentage', '25', 'what -Xmx defaults to'],
];
const CONT = [['4 GB', 4096, 1024, '1 GB'], ['1 GB', 1024, 256, '256 MB'], ['512 MB', 512, 128, '128 MB'], ['256 MB', 256, 128, '128 MB · 50%'], ['128 MB', 128, 64, '64 MB · 50%']];
export function SSizing({ t }) {
  const S = 1000 / 4096;
  return (
    <React.Fragment>
      <Table x={96} y={196} cols={[340, 190, 470]} head={['flag', 'default here', 'meaning']} rows={FLAGS} a={E(t, 0.5)} fs={20} rh={54}
        rowA={FLAGS.map((_, i) => E(t, [6, 12.5, 20, 20.4, 20.8, 25.5][i]))} colColors={[PAL.flow, PAL.pull, PAL.ink2]}
        marks={{ 0: ['pull', win(t, 6, 12.3)], 1: ['pull', win(t, 12.5, 20)], 5: ['pull', win(t, 25.5, 40)] }} />
      <Console x={1140} y={196} w={684} h={380} t={t} a={E(t, 1)} fs={17} lh={28} title="terminal · columns trimmed" items={[
        { at: 1.5, text: 'java -XX:+PrintFlagsFinal -version | grep …', kind: 'cmd' },
        { at: 2.2, text: '  size_t MaxHeapSize          = 2147483648' },
        { at: 2.4, text: '  size_t InitialHeapSize      = 134217728' },
        { at: 2.6, text: '   uintx NewRatio             = 2' },
        { at: 2.8, text: '   uintx SurvivorRatio        = 8' },
        { at: 3, text: '   uintx MaxTenuringThreshold = 15' },
        { at: 3.2, text: '  double MaxRAMPercentage     = 25.000000' },
        { at: 3.4, text: '# this Mac: 8 GB RAM', kind: 'dim' },
      ]} />
      {(() => { const a = win(t, 6, 25, 0.5); if (a < 0.01) return null; const RW = 1600; return (
        <React.Fragment>
          <Txt x={96} y={612} mono fs={17} color={PAL.ink3} a={a}>THIS MAC · 8 GB RAM</Txt>
          <div style={{ position: 'absolute', left: 96, top: 650, width: RW, height: 56, boxSizing: 'border-box', border: `2px dashed ${PAL.ink3}`, borderRadius: 8, opacity: a }}></div>
          <div style={{ position: 'absolute', left: 96, top: 650, width: RW * 0.25 * M(t, 6.5, 1), height: 56, background: hexA(PAL.pull, 0.35), border: `2px solid ${PAL.pull}`, boxSizing: 'border-box', borderRadius: 8, opacity: a }}></div>
          <div style={{ position: 'absolute', left: 96, top: 650, width: Math.max(4, RW / 64) * E(t, 12.5), height: 56, background: hexA(PAL.pull, 0.85), borderRadius: 6, opacity: a }}></div>
          <Txt x={96 + RW * 0.25 + 16} y={664} mono fs={20} color={PAL.pull} a={a * E(t, 7)}>-Xmx default: 2 GB = 25%</Txt>
          <Txt x={96} y={724} mono fs={20} color={PAL.pull} a={a * E(t, 12.8)}>-Xms default: 128 MB = 1/64, grown on demand up to -Xmx</Txt>
          <Txt x={96 + RW - 8} y={664} anchor="right" mono fs={20} color={PAL.ink3} a={a}>8 GB</Txt>
        </React.Fragment>); })()}
      <Txt x={96} y={604} mono fs={17} color={PAL.ink3} a={E(t, 25.5)}>CONTAINER LIMIT → DEFAULT MAX HEAP · simulated with -XX:MaxRAM · real PrintFlagsFinal values</Txt>
      {CONT.map(([l, mb, heap, ht], i) => {
        const y = 642 + i * 54, a = E(t, 26 + i * 0.5);
        return (
          <React.Fragment key={l}>
            <Txt x={96} y={y + 8} mono fs={19} color={PAL.ink} a={a}>{l}</Txt>
            <div style={{ position: 'absolute', left: 260, top: y, width: mb * S, height: 40, opacity: a, boxSizing: 'border-box', border: `2px dashed ${PAL.ink3}`, borderRadius: 6 }}></div>
            <div style={{ position: 'absolute', left: 260, top: y, width: heap * S * M(t, 26.5 + i * 0.5, 0.8), height: 40, opacity: a, background: hexA(PAL.pull, 0.7), borderRadius: 6 }}></div>
            <Txt x={260 + Math.max(mb * S, 80) + 16} y={y + 8} mono fs={19} color={PAL.pull} a={a}>{`heap ${ht}`}</Txt>
          </React.Fragment>
        );
      })}
      <Card x={1460} y={642} w={364} h={130} a={E(t, 31.5)} tone="bad" title="1 GB container → 256 MB heap" sub="set `-Xmx` or `-XX:MaxRAMPercentage`" tfs={22} sfs={18} glow={win(t, 31.5, 40)} />
      <Badge x={1642} y={810} text="1 CPU → Serial GC is chosen" tone="pull" a={E(t, 40.5)} fs={17} />
    </React.Fragment>
  );
}

// ── Metaspace: where classes live ──────────────────────────────────────────
export function SMetaspace({ t }) {
  return (
    <React.Fragment>
      <Box x={96} y={232} w={320} h={96} label="Users$User.class" sub="1,254 bytes on disk" tone="ink" a={E(t, 0.6)} fs={20} sfs={17} />
      <HArrow x1={420} x2={466} y={280} a={E(t, 1.4)} color={PAL.violet} />
      <Txt x={256} y={344} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 1.4)}>loaded by a class loader</Txt>

      <Panel x={470} y={190} w={760} h={460} title="metaspace" right="native memory · outside the heap" tone="violet" a={E(t, 1)} />
      <Node x={500} y={244} w={340} h={216} kind="Klass" name="Users$User" tone="violet" a={E(t, 6)} glow={win(t, 6, 13) * 0.8} rows={[['super', 'java.lang.Record'], ['fields', 'name · age'], ['vtable', 'toString, equals, …'], ['mirror', '→ Class (heap)']]} />
      <Node x={870} y={244} w={330} h={216} kind="Method × 6" name="+ their bytecode" tone="violet" a={E(t, 13)} glow={win(t, 13, 17.5) * 0.8} nfs={20} rows={[['<init>', '15 bytes'], ['name() · age()', ''], ['toString · equals', ''], ['hashCode', '']]} />
      <Box x={500} y={494} w={700} h={126} label="runtime constant pool · 60 entries" sub="names, descriptors, string literals + resolved-entry cache (8.1)" tone="violet" a={E(t, 17.5)} fs={20} sfs={17} glow={win(t, 17.5, 23) * 0.8} />

      <Panel x={1270} y={190} w={554} h={460} title="heap" tone="pull" a={E(t, 23)} />
      <Node x={1300} y={250} w={494} h={150} kind="instance · 24 bytes" name={'User "Ana"'} tone="pull" a={E(t, 23.4)} rows={[['header · klass', '→ Klass', PAL.violet, win(t, 23.5, 31)], ['name · age', '→ "Ana" · 30']]} />
      <Node x={1300} y={430} w={494} h={190} kind="java.lang.Class · the mirror" name="User.class" tone="pull" a={E(t, 31)} glow={win(t, 31, 40) * 0.7} rows={[['describes', 'Users$User'], ['static fields', 'stored here'], ['returned by', 'getClass()']]} />
      <Arrow pts={[[1298, 340], [1250, 340], [1250, 477], [670, 477], [670, 464]]} draw={M(t, 24, 0.9)} color={PAL.violet} />

      <Console x={96} y={680} w={860} h={250} t={t} a={E(t, 40)} fs={17} lh={28} items={[
        { at: 40.4, text: "jcmd 1730 GC.class_histogram | grep -E 'java.lang.Class$|Live\\$User'", kind: 'cmd' },
        { at: 41, text: '   3:         20000         480000  Live$User' },
        { at: 41.3, text: '   4:          1461         179968  java.lang.Class (java.base@17.0.17)', kind: 'ok' },
        { at: 47, text: 'java -XX:+PrintFlagsFinal -version | grep MaxMetaspaceSize', kind: 'cmd' },
        { at: 47.6, text: '   size_t MaxMetaspaceSize = 18446744073709551615', kind: 'ok' },
      ]} />
      <Callout x={1000} y={680} w={824} tone="pull" a={win(t, 41, 47)} fs={19} title="proof" text="`Class` objects are counted in the **heap** histogram like any other object. The note's “loaded Class objects live in metaspace” is not quite right: the **Klass** does." />
      <Callout x={1000} y={680} w={824} tone="violet" a={E(t, 47.2)} fs={19} title="no limit by default" text="2⁶⁴ − 1: metaspace grows until the machine runs out. `-XX:MaxMetaspaceSize=256m` makes a runaway **fail fast** instead." />
      <Badge x={1412} y={860} text="MetaspaceSize = 21 MB: only the first GC trigger" tone="violet" a={E(t, 55)} fs={17} />
    </React.Fragment>
  );
}

// ── PermGen → Metaspace ────────────────────────────────────────────────────
export function SPermGen({ t }) {
  const fillP = lin(t, 8, 5);
  return (
    <React.Fragment>
      <Txt x={96} y={200} mono fs={18} color={PAL.ink3} a={E(t, 0.5)}>JAVA 7 AND EARLIER</Txt>
      <Box x={96} y={240} w={250} h={130} label="young" tone="pull" a={E(t, 0.8)} />
      <Box x={356} y={240} w={300} h={130} label="old" tone="green" a={E(t, 1)} />
      <div style={{ position: 'absolute', left: 666, top: 240, width: 234, height: 130, boxSizing: 'border-box', borderRadius: 12, border: `2px dashed ${PAL.bad}`, background: PAL.panel2, opacity: E(t, 1.4), overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${20 + fillP * 80}%`, background: hexA(PAL.violet, 0.4) }}></div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 22, textAlign: 'center', font: `600 22px ${MONO}`, color: PAL.ink }}>PermGen</div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 56, textAlign: 'center', font: `400 17px ${MONO}`, color: PAL.ink2 }}>fixed size</div>
      </div>
      <Brace x={96} y={384} w={804} label="all managed by the GC as one heap" tone="ink" a={E(t, 2)} />
      <Box x={666} y={440} w={234} h={52} label="classes" tone="violet" a={E(t, 2.5)} fs={17} />
      <Box x={666} y={500} w={234} h={52} label="interned strings" tone="pink" a={E(t, 3)} fs={17} strike={t > 14.5} />
      <Box x={666} y={560} w={234} h={52} label="static fields" tone="pink" a={E(t, 3.5)} fs={17} strike={t > 14.5} />
      <Txt x={96} y={452} fs={20} w={540} color={PAL.ink2} a={E(t, 7)}>Sized with `-XX:MaxPermSize`. App servers that redeployed a few times filled it.</Txt>
      <Badge x={366} y={560} text="OutOfMemoryError: PermGen space" tone="bad" a={POP(t, 12.5)} fs={18} solid />
      <Txt x={96} y={620} fs={19} w={540} color={PAL.pink} a={E(t, 14.5)}>Java 7: interned strings and statics moved to the normal heap.</Txt>

      <Txt x={1000} y={200} mono fs={18} color={PAL.ink3} a={E(t, 19.5)}>JAVA 8 AND LATER</Txt>
      <Box x={1000} y={240} w={330} h={130} label="young" tone="pull" a={E(t, 19.8)} />
      <Box x={1340} y={240} w={484} h={130} label="old" sub="+ interned strings, Class mirrors, statics" tone="green" a={E(t, 20)} sfs={17} />
      <Brace x={1000} y={384} w={824} label="Java heap" tone="ink" a={E(t, 20.3)} />
      <Panel x={1000} y={440} w={824} h={200} title="metaspace" right="native memory · grows on demand" tone="violet" a={E(t, 21)} glow={win(t, 21, 25) * 0.6} />
      <Box x={1030} y={510} w={360} h={90} label="class metadata" sub="Klass · methods · constant pools" tone="violet" a={E(t, 21.5)} fs={20} sfs={17} />
      <Box x={1420} y={510} w={374} h={90} label="no fixed size" sub="cap it: -XX:MaxMetaspaceSize" tone="violet" a={E(t, 22)} fs={20} sfs={17} />
      <HArrow x1={910} x2={990} y={540} a={E(t, 19.5)} color={PAL.violet} label="Java 8" lfs={17} />
      <Callout x={96} y={700} w={1728} tone="bad" a={E(t, 25.5)} fs={21} text="The **leak** that filled PermGen still exists in metaspace. Only the error message changed. Let's cause it on purpose." />
    </React.Fragment>
  );
}

// ── Class loader leak → OutOfMemoryError: Metaspace ────────────────────────
export function SClassLoaderLeak({ t }) {
  const leakN = t < 5 ? 0 : t < 19.5 ? Math.floor(lerp(1, 6, lin(t, 5, 12))) : Math.round(lerp(6, 5000, lin(t, 19.5, 5.5)));
  const fixed = t >= 41;
  const deploys = fixed ? Math.round(lerp(1, 200000, lin(t, 42, 6))) : leakN;
  const gaugeLeak = t < 19.5 ? lerp(0.05, 0.12, lin(t, 5, 14)) : lerp(0.12, 1, lin(t, 19.5, 5.5));
  const saw = 0.12 + 0.1 * (((t - 42) * 1.3) % 1);
  const frac = fixed ? lerp(1, saw, M(t, 41, 1)) : gaugeLeak;
  const rows = Math.min(6, Math.max(0, leakN));
  return (
    <React.Fragment>
      <Code x={96} y={190} w={860} h={292} title={fixed ? 'Redeploy2.java: the same loop without the list' : 'Redeploy.java (core)'} a={E(t, 0.4)} fs={19} lh={32} hl={hlAt(t, [[5, 3], [12, 4], [41, -1]])[0]} hlA={hlAt(t, [[5, 3], [12, 4], [41, -1]])[1]} lines={[
        { s: 'static List<Object> leaked = new ArrayList<>();', tone: fixed ? 'bad' : undefined },
        '',
        'for (int deploy = 1; ; deploy++) {',
        '    Class<?> c = new AppLoader().load(bytes);',
        { s: '    leaked.add(c);       // the leak', tone: fixed ? 'bad' : undefined },
        '}',
        '// AppLoader.load: defineClass("Users$User", bytes, …)',
      ]} />

      <Panel x={1000} y={190} w={440} h={520} title="heap" right="class loaders" tone="pull" a={E(t, 4.5)} />
      <Box x={1030} y={250} w={380} h={60} label={fixed ? 'leaked (removed)' : 'static List leaked'} tone={fixed ? 'dim' : 'bad'} strike={fixed} a={E(t, 12)} fs={18} glow={win(t, 12, 19) * 0.7} />
      {Array.from({ length: 6 }).map((_, i) => (
        <Box key={i} x={1030} y={330 + i * 58} w={380} h={48} label={`AppLoader #${i + 1}  → User copy`} tone={fixed ? 'dim' : 'pull'} dashed={fixed} fs={17} a={(i < rows ? E(t, 5 + i * 2.2, 0.4) : 0) * (fixed ? 1 - E(t, 42.5 + i * 0.15, 0.5) : 1)} />
      ))}
      <Txt x={1220} y={680} anchor="mid" mono fs={17} color={fixed ? PAL.flow : PAL.ink2} a={E(t, 19.5)}>{fixed ? 'old loaders → garbage → classes unloaded' : `+ ${fmtN(Math.max(0, leakN - 6))} more, all still reachable`}</Txt>

      <Txt x={1632} y={196} anchor="mid" mono fs={18} color={PAL.ink3} a={E(t, 5)}>deploys</Txt>
      <Txt x={1632} y={222} anchor="mid" mono fs={40} weight={700} color={fixed ? PAL.flow : t >= 25 ? PAL.bad : PAL.ink} a={E(t, 5)}>{fmtN(deploys) + (!fixed && t >= 25 ? '+' : '')}</Txt>
      <Gauge x={1500} y={322} w={264} h={470} frac={frac} tone="violet" a={E(t, 5)} capLabel label={fixed ? 'reused' : 'metaspace'} glow={pulse(t, [25], 1.5)} />
      <Txt x={1632} y={292} anchor="mid" mono fs={17} color={PAL.bad} a={E(t, 19.5)}>MaxMetaspaceSize = 32 MB</Txt>
      <Badge x={1632} y={830} text="OutOfMemoryError: Metaspace" tone="bad" solid a={POP(t, 25) * (1 - E(t, 41, 0.4))} fs={17} />

      <Console x={96} y={510} w={860} h={420} t={t} a={E(t, 19.5)} fs={17} lh={25} items={[
        { at: 19.6, text: 'java -XX:MaxMetaspaceSize=32m Redeploy', kind: 'cmd' },
        { at: 20.4, text: 'deploy 1000' }, { at: 21.4, text: 'deploy 2000' }, { at: 22.4, text: 'deploy 3000' }, { at: 23.4, text: 'deploy 4000' }, { at: 24.4, text: 'deploy 5000' },
        { at: 25, text: 'Exception in thread "main" java.lang.OutOfMemoryError: Metaspace', kind: 'err' },
        { at: 25.3, text: '    at java.base/java.lang.ClassLoader.defineClass1(Native Method)', kind: 'err' },
        { at: 32, text: 'java -XX:MaxMetaspaceSize=32m -Xlog:gc+metaspace Redeploy', kind: 'cmd' },
        { at: 32.8, text: '… GC(15) Metaspace: 12724K(32768K)->12724K(32768K) NonClass: …', kind: 'ok' },
        { at: 42, text: 'java -XX:MaxMetaspaceSize=32m Redeploy2', kind: 'cmd' },
        { at: 46, text: 'deploy 150000' }, { at: 47.4, text: 'deploy 200000' },
        { at: 48, text: 'done: no leak, metaspace was reclaimed', kind: 'ok' },
      ]} />
      <Callout x={1000} y={740} w={440} tone="violet" a={win(t, 32.5, 41)} fs={17} text="**12.7 MB used, 32 MB committed.** Each loader owns its own metaspace chunks, mostly empty." />
      <Callout x={1000} y={740} w={440} tone="flow" a={E(t, 50)} fs={18} text="**OOM: Metaspace ≈ a class loader leak**, not “too many classes”." />
    </React.Fragment>
  );
}

// ── The code cache ─────────────────────────────────────────────────────────
const SEGS = [['non-nmethods', 5712, 1085, 'ink', 'interpreter, stubs'], ['profiled nmethods', 120016, 206, 'pull', 'C1 code, still profiling'], ['non-profiled nmethods', 120032, 86, 'flow', 'C2 code, fully optimised']];
export function SCodeCache({ t }) {
  const X = 126, W = 1668, TOT = 245760;
  let x = X;
  const segs = SEGS.map(([l, kb, used, tone, d], i) => { const w = (kb / TOT) * W; const s = { l, kb, used, tone, d, x, w, i }; x += w + (i === 0 ? 0 : 0); return s; });
  const jit = (k) => { const s = 2.5 + k * 0.6; const p = M(t, s, 1); const tx = k % 2 ? segs[2].x + 40 + k * 22 : segs[1].x + 40 + k * 22; return p > 0 && p < 1 ? <Dot key={k} x={lerp(1600, tx, p)} y={lerp(456, 320, p)} r={8} color={k % 2 ? PAL.flow : PAL.pull} /> : null; };
  return (
    <React.Fragment>
      <Panel x={96} y={190} w={1728} h={300} title="code cache" right="ReservedCodeCacheSize = 240 MB · shared" tone="blue" a={E(t, 0.5)} />
      {segs.map((s) => (
        <React.Fragment key={s.l}>
          <div style={{ position: 'absolute', left: s.x + 2, top: 280, width: s.w - 4, height: 80, boxSizing: 'border-box', borderRadius: 8, border: `2px solid ${hexA(toneColor(s.tone), 0.85)}`, background: hexA(toneColor(s.tone), 0.08), opacity: E(t, 1.5 + s.i * 0.3) }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: Math.max(3, (s.used / s.kb) * (s.w - 4)), background: hexA(toneColor(s.tone), 0.7), borderRadius: 6 }}></div>
          </div>
          <Txt x={s.i === 0 ? s.x : s.x + 14} y={s.i === 0 ? 372 : 372} mono fs={17} weight={600} color={toneColor(s.tone)} a={E(t, 1.8 + s.i * 0.3)}>{s.i === 0 ? '' : s.l}</Txt>
          <Txt x={s.x + 14} y={400} mono fs={17} color={PAL.ink2} a={E(t, 7 + s.i * 0.5)}>{s.i === 0 ? '' : `${fmtN(s.kb)} KB · ${s.d}`}</Txt>
        </React.Fragment>
      ))}
      <Txt x={segs[0].x} y={244} mono fs={17} color={PAL.ink2} a={E(t, 7)}>non-nmethods · 5,712 KB · interpreter, stubs ↓</Txt>
      {[0, 1, 2, 3, 4, 5, 6, 7].map(jit)}
      <Badge x={1680} y={456} text="JIT: C1 · C2" tone="blue" a={E(t, 2)} fs={17} />
      <Txt x={126} y={440} mono fs={17} color={PAL.ink3} a={E(t, 13.5)}>filled bars: used by a small running program (1,085 KB · 206 KB · 86 KB)</Txt>

      <Console x={96} y={506} w={1728} h={218} t={t} a={E(t, 13.5)} fs={17} lh={25} title="terminal · bounds lines trimmed" items={[
        { at: 13.8, text: 'jcmd 1700 Compiler.codecache', kind: 'cmd' },
        { at: 14.4, text: "CodeHeap 'non-profiled nmethods': size=120032Kb used=86Kb max_used=86Kb free=119946Kb" },
        { at: 14.6, text: "CodeHeap 'profiled nmethods': size=120016Kb used=206Kb max_used=206Kb free=119809Kb" },
        { at: 14.8, text: "CodeHeap 'non-nmethods': size=5712Kb used=1085Kb max_used=1115Kb free=4626Kb" },
        { at: 15, text: ' total_blobs=545 nmethods=175 adapters=287' },
        { at: 15.2, text: ' compilation: enabled', kind: 'ok' },
      ]} />
      <Console x={96} y={740} w={1100} h={200} t={t} a={E(t, 19)} fs={17} lh={25} title="terminal · abridged · Many.java: 3,000 small methods, each called once" items={[
        { at: 19.4, text: 'java -Xcomp -XX:ReservedCodeCacheSize=2496k \\', kind: 'cmd' },
        { at: 19.6, text: '     -XX:-UseCodeCacheFlushing -XX:-SegmentedCodeCache Many', kind: 'dim' },
        { at: 26, text: '[0.688s][warning][codecache] CodeCache is full. Compiler has been disabled.', kind: 'err' },
        { at: 27.4, text: ' compilation: disabled (not enough contiguous free space left)', kind: 'dim' },
        { at: 32, text: 'done 1738101675', kind: 'ok' },
      ]} />
      <RealTag x={1228} y={906} a={E(t, 26)} />
      <Callout x={1228} y={740} w={596} tone="blue" a={E(t, 32.5)} fs={19} text="**No exception.** The app keeps running, interpreted. Fix: a bigger `-XX:ReservedCodeCacheSize`." />
    </React.Fragment>
  );
}
