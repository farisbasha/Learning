// 8.10 scenes, part 2: CDS, AppCDS, archive validation, Project Leyden (shift, workflow, profiles).
const { PAL, MOTION, lin, lerp, win, pulse, step, track, track1, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Table, Mark, Val, Brace, Chip, toneColor } = window.AN;
import { Note, DocTag, MeasTag } from './scenes1.jsx';
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

// dots flowing along a path, for "classes being parsed"
function Stream({ t, from, to, start, n = 7, period = 1.6, color, until = 999, r = 7 }) {
  if (t < start || t > until) return null;
  const out = [];
  for (let k = 0; k < n; k++) {
    const p = ((t - start) / period + k / n) % 1;
    out.push(<Dot key={k} x={lerp(from[0], to[0], p)} y={lerp(from[1], to[1], p)} r={r} color={color} a={Math.min(1, p * 6, (1 - p) * 6) * E(t, start)} />);
  }
  return out;
}

// ── CDS: parse once, map forever ───────────────────────────────────────────
export function SCdsIdea({ t }) {
  return (
    <React.Fragment>
      <Panel x={96} y={196} w={846} h={320} title="without CDS · every start" tone="bad" a={E(t, 0.4)} />
      <Box x={126} y={290} w={220} h={90} label="lib/modules" sub="class bytes" a={E(t, 0.8)} fs={21} />
      <Box x={420} y={290} w={170} h={90} label="parse" sub="+ verify*" tone="pull" a={E(t, 1.2)} fs={21} glow={0.4 + 0.3 * Math.sin(t * 5)} />
      <Box x={664} y={290} w={250} h={90} label="metaspace" sub="private copy" tone="bad" a={E(t, 1.6)} fs={21} />
      <Stream t={t} from={[350, 335]} to={[414, 335]} start={1.4} n={3} period={0.8} color={PAL.pull} />
      <Stream t={t} from={[594, 335]} to={[658, 335]} start={1.8} n={3} period={0.8} color={PAL.bad} />
      <Txt x={126} y={410} fs={20} color={PAL.ink2} a={E(t, 2.4)} w={790}>The same 1,215 JDK classes, parsed again by every JVM, on every start. (*boot classes skip verification)</Txt>

      <Panel x={978} y={196} w={846} h={320} title="with CDS" tone="flow" a={E(t, 6)} />
      <Box x={1008} y={290} w={260} h={90} label="classes.jsa" sub="written once" tone="flow" a={E(t, 6.5)} fs={21} />
      <Txt x={1008} y={392} mono fs={17} color={PAL.ink3} a={E(t, 7.2)}>13.5 MB · lib/server/</Txt>
      <Arrow pts={[[1274, 335], [1500, 335]]} draw={M(t, 12.5, 0.8)} color={PAL.flow} width={10} />
      <Txt x={1387} y={290} anchor="mid" mono fs={20} weight={600} color={PAL.flow} a={E(t, 13)}>mmap</Txt>
      <Box x={1514} y={290} w={280} h={90} label="metaspace" sub="mapped region" tone="flow" a={E(t, 13.2)} fs={21} glow={pulse(t, [13.6], 1.2)} />
      <Txt x={1008} y={432} fs={20} color={PAL.ink2} a={E(t, 14)} w={790}>No reading, no parsing: the archive's pages simply become part of metaspace.</Txt>

      <Console x={96} y={540} w={1728} h={160} t={t} a={E(t, 19.5)} fs={17} lh={30} items={[
        { at: 19.7, text: 'java -Xlog:cds -jar hello.jar        (abridged)', kind: 'cmd' },
        { at: 20.4, text: '[0.015s][info][cds] Mapped static  region #0 at base 0x000000a000000000 top 0x000000a000454000 (ReadWrite)', kind: 'ok' },
        { at: 21.0, text: '[0.015s][info][cds] Mapped static  region #1 at base 0x000000a000454000 top 0x000000a000bc0000 (ReadOnly)', kind: 'ok' },
      ]} />

      <Box x={96} y={736} w={300} h={76} label="JVM  A" sub="hello.jar" a={E(t, 26.5)} fs={21} />
      <Box x={96} y={834} w={300} h={76} label="JVM  B" sub="another app" a={E(t, 27.2)} fs={21} />
      <Panel x={520} y={724} w={560} h={196} title="physical memory · page cache" a={E(t, 26.8)} />
      {Array.from({ length: 7 }, (_, k) => <Box key={k} x={546 + k * 74} y={790} w={62} h={56} r={6} tone="flow" fill label="RO" fs={17} a={E(t, 27.4 + k * 0.08)} glow={win(t, 33, 40) * 0.6} />)}
      <Txt x={546} y={858} mono fs={17} color={PAL.flow} a={E(t, 28)}>read-only region: one copy for all</Txt>
      <Arrow pts={[[400, 774], [460, 774], [460, 818], [540, 818]]} draw={M(t, 27.6, 0.7)} color={PAL.flow} />
      <Arrow pts={[[400, 872], [470, 872], [470, 826], [540, 826]]} draw={M(t, 28.2, 0.7)} color={PAL.flow} />
      <Note x={1120} y={736} w={704} tone="flow" a={win(t, 33, 40.3)} fs={20} title="shared" text="The read-only part is mapped by every JVM using that archive. Read-write pages are copied only when written." />
      <Note x={1120} y={736} w={704} tone="pull" a={win(t, 40.3, 47.3)} fs={20} title="pre-verified" text="Classes are verified when the archive is dumped, so mapping them skips verification too." />
      <Note x={1120} y={736} w={704} tone="violet" a={E(t, 47.3)} fs={20} title="on by default · JDK 12+" text="The JDK ships a default archive of its core classes: 1,189 in this JDK's class list. `-Xshare:off` disables it." />
    </React.Fragment>
  );
}

// ── AppCDS ─────────────────────────────────────────────────────────────────
// Real class-source counts (JDK 17, -Xlog:class+load) and wall-clock medians of 50 runs.
const SRC = [
  { name: '-Xshare:off', ms: 122, at: 23, seg: [['parsed', 1215], ['jar', 3], ['gen', 69]] },
  { name: 'default CDS archive', ms: 81, at: 29, seg: [['shared', 987], ['parsed', 245], ['jar', 3], ['gen', 44]] },
  { name: '+ AppCDS (app.jsa)', ms: 75, at: 35, seg: [['shared', 1246], ['gen', 27]] },
];
const STONE = { shared: 'flow', parsed: 'pull', jar: 'blue', gen: 'green' };
export function SAppCds({ t }) {
  const BX = 1000, U = 0.53;
  return (
    <React.Fragment>
      <Console x={96} y={196} w={860} h={404} t={t} a={E(t, 2)} fs={18} lh={32} items={[
        { at: 5, text: 'java -XX:ArchiveClassesAtExit=app.jsa -jar hello.jar', kind: 'cmd' },
        { at: 6.4, text: 'Hello, ADA, LINUS, GRACE' },
        { at: 6.6, text: 'Good day, world.' },
        { at: 12, text: 'ls -l app.jsa', kind: 'cmd' },
        { at: 12.6, text: '-r--r--r--  1 basha  wheel  2244608  5 Oct 12:18 app.jsa', kind: 'ok' },
        { at: 18, text: 'java -XX:SharedArchiveFile=app.jsa -jar hello.jar', kind: 'cmd' },
        { at: 18.8, text: 'Hello, ADA, LINUS, GRACE' },
        { at: 19.0, text: 'Good day, world.' },
      ]} />
      <Box x={96} y={630} w={860} h={84} align="left" label="top layer · app.jsa · 2.2 MB" sub="your classes + the JDK classes this app needed" tone="pull" fs={21} a={E(t, 13)} />
      <Box x={96} y={724} w={860} h={84} align="left" label="base layer · classes.jsa · 13.5 MB" sub="the JDK's default archive" tone="flow" fs={21} a={E(t, 1)} />

      <Txt x={BX} y={196} mono fs={18} color={PAL.ink3} a={E(t, 22.5)}>WHERE 1,280 CLASSES COME FROM</Txt>
      {SRC.map((s, i) => {
        const y = 250 + i * 128;
        let x = BX;
        return (
          <React.Fragment key={s.name}>
            <Txt x={BX} y={y} fs={21} weight={600} a={E(t, s.at)}>{s.name}</Txt>
            {s.seg.map(([k, n], j) => {
              const w = n * U * M(t, s.at + 0.2 + j * 0.25, 0.8), x0 = x;
              x += n * U;
              return <Box key={j} x={x0} y={y + 36} w={Math.max(w, 0)} h={50} r={4} tone={STONE[k]} fill a={w > 1 ? 1 : 0} label={n > 150 ? n.toLocaleString('en-US') : ''} fs={18} />;
            })}
            <Txt x={1824} y={y + 44} anchor="right" mono fs={28} weight={700} color={i === 0 ? PAL.bad : PAL.flow} a={E(t, 42.5 + i * 0.6)}>{s.ms} ms</Txt>
          </React.Fragment>
        );
      })}
      {[['shared', 'mapped from an archive'], ['parsed', 'parsed from lib/modules'], ['jar', 'hello.jar'], ['gen', 'generated at runtime']].map(([k, l], i) => (
        <div key={k} style={{ position: 'absolute', left: BX + (i % 2) * 412, top: 632 + Math.floor(i / 2) * 34, display: 'flex', alignItems: 'center', gap: 10, opacity: E(t, 23.5), font: `500 18px ${MONO}`, color: PAL.ink2 }}>
          <span style={{ width: 16, height: 16, borderRadius: 3, background: toneColor(STONE[k]) }}></span>{l}
        </div>
      ))}
      <MeasTag x={BX} y={720} a={E(t, 42.5)} text="wall clock · median of 50 runs · JDK 17 · M1" />
      <Note x={BX} y={752} w={824} tone="pull" a={win(t, 49, 54.6)} fs={20} text="The default archive gave most of our win for free. The more classes your app loads, the more AppCDS adds." />
      <Note x={BX} y={752} w={824} tone="violet" a={E(t, 54.6)} fs={20} text="JDK 19+: `-XX:+AutoCreateSharedArchive -XX:SharedArchiveFile=app.jsa` does both steps. On 17: **Unrecognized VM option**." />
      <Note x={96} y={832} w={860} tone="flow" a={E(t, 35.5)} fs={19} text="The 27 left over are method-handle classes spun at runtime: this archive can't hold them." />
    </React.Fragment>
  );
}

// ── The archive is checked ─────────────────────────────────────────────────
export function SCdsCheck({ t }) {
  return (
    <React.Fragment>
      <Node x={96} y={196} w={560} h={262} kind="app.jsa header (simplified)" name="what it was built against" tone="pull" a={E(t, 0.5)}
        rows={[['JDK build', '17.0.17+0'], ['class path', 'hello.jar', null, win(t, 5, 11)], ['jar size', 'recorded', null, win(t, 5, 11)], ['jar modified time', 'recorded', null, win(t, 5, 11)], ['GC, compressed oops', 'recorded']]} rfs={20} />
      <Box x={700} y={210} w={420} h={100} label="same jar" sub="regions mapped" tone="flow" a={win(t, 2, 11.8)} fs={24} />
      <Mark x={1100} y={216} ok a={win(t, 2.5, 11.8)} />
      <HArrow x1={1130} x2={1220} y={260} a={win(t, 2.5, 11.8)} color={PAL.flow} />
      <Box x={1230} y={210} w={594} h={100} label="fast start" sub="75 ms" tone="flow" a={win(t, 3, 11.8)} fs={24} />
      <Box x={700} y={210} w={420} h={100} label="rebuilt jar" sub="mtime changed" tone="bad" a={win(t, 12, 32.5)} fs={24} />
      <Mark x={1100} y={216} ok={false} a={win(t, 17.6, 32.5)} />
      <HArrow x1={1130} x2={1220} y={260} a={win(t, 17.6, 32.5)} color={PAL.bad} />
      <Box x={1230} y={210} w={594} h={100} label="archive skipped" sub="back to ~81 ms, one warning line" tone="bad" a={win(t, 17.8, 32.5)} fs={24} />
      <Txt x={700} y={340} fs={21} color={PAL.ink2} a={win(t, 5, 32.5)} w={1100}>Change any of these and the archive no longer describes what's on disk.</Txt>
      <Note x={700} y={210} w={1124} tone="pull" a={E(t, 32.5)} fs={23} title="rule" text="Regenerate the archive in the **same build step** that produces the jar, and ship them together." />

      <Console x={96} y={486} w={1728} h={196} t={t} a={E(t, 11.5)} fs={18} lh={32} items={[
        { at: 11.8, text: 'touch hello.jar          # a rebuild, even with identical content', kind: 'cmd' },
        { at: 13.2, text: 'java -XX:SharedArchiveFile=app.jsa -jar hello.jar', kind: 'cmd' },
        { at: 17.6, text: '[0.008s][warning][cds,dynamic] Unable to use shared archive. The top archive failed to load: app.jsa', kind: 'err' },
        { at: 18.4, text: 'Oct 05, 2026 12:17:47 PM app.Main main       ← and it runs anyway, without the archive', kind: 'dim' },
      ]} />
      <Console x={96} y={704} w={1728} h={196} t={t} a={E(t, 25)} fs={18} lh={32} items={[
        { at: 25.2, text: 'java -XX:SharedArchiveFile=app.jsa -Xshare:on -version', kind: 'cmd' },
        { at: 26.2, text: 'An error has occurred while processing the shared archive file.', kind: 'err' },
        { at: 26.6, text: 'shared class paths mismatch (hint: enable -Xlog:class+path=info to diagnose the failure)', kind: 'err' },
        { at: 27.0, text: 'Error occurred during initialization of VM', kind: 'err' },
      ]} />
    </React.Fragment>
  );
}

// ── Leyden: shift work earlier ─────────────────────────────────────────────
const WORK = [
  ['parse class files', 13, 'CDS', 'flow'],
  ['verify bytecode', 13, 'CDS', 'flow'],
  ['load: classes appear in loaders', 19.5, 'JEP 483 · JDK 24', 'pull'],
  ['link: wire classes together', 27.5, 'JEP 483 · JDK 24', 'pull'],
  ['profile hot methods', 34, 'JEP 515 · JDK 25', 'pink'],
  ['JIT-compile hot code', null, 'stays at run time', 'violet'],
];
export function SLeydenShift({ t }) {
  const LX = 116, RX = 1224, BW = 580, ry = (i) => 262 + i * 86;
  const chips = [['JDK 12 · default CDS', 'flow', 13], ['JDK 13 · dynamic AppCDS', 'flow', 13.5], ['JDK 24 · JEP 483', 'pull', 19.5], ['JDK 25 · JEP 514, 515', 'pink', 34], ['JDK 26 · JEP 516', 'violet', 41]];
  let cx = 96;
  return (
    <React.Fragment>
      <Panel x={96} y={196} w={620} h={600} title="training run · once" tone="flow" a={E(t, 0.6)} />
      <Panel x={1204} y={196} w={620} h={600} title="every production start" tone="bad" a={E(t, 0.6)} />
      {WORK.map(([l, at, tag, tone], i) => {
        const p = at == null ? 0 : M(t, at, 1.3);
        const x = lerp(RX, LX, p);
        const stay = at == null;
        return (
          <React.Fragment key={l}>
            <Box x={x} y={ry(i)} w={BW} h={70} align="left" label={l} fs={22} tone={p > 0.5 ? tone : stay ? (t > 48 ? 'violet' : 'ink') : 'ink'} fill={p > 0.5 || (stay && t > 48)} a={E(t, 6 + i * 0.5)} glow={stay ? win(t, 48, 58) * 0.8 : pulse(t, [at + 1.3], 1)} />
            <Txt x={960} y={ry(i) + 22} anchor="mid" mono fs={18} weight={600} color={toneColor(tone)} a={stay ? E(t, 48) : E(t, at + 1)}>{stay ? '← stays' : tag}</Txt>
          </React.Fragment>
        );
      })}
      <div style={{ position: 'absolute', left: 106, top: ry(2) - 9, width: 600, borderTop: `2px dashed ${PAL.bad}`, opacity: E(t, 14.5) }}></div>
      <Txt x={706} y={ry(2) - 36} anchor="right" mono fs={17} color={PAL.bad} a={E(t, 14.5)}>JDK 17 stops here</Txt>
      {chips.map(([l, tone, at], i) => {
        const w = l.length * 11 + 40, x = cx;
        cx += w + 14;
        return <Box key={l} x={x} y={826} w={w} h={50} r={25} label={l} fs={18} tone={tone} a={E(t, at)} glow={i === 4 ? win(t, 41, 48) : 0} />;
      })}
      <Txt x={96} y={890} fs={19} color={PAL.ink2} a={E(t, 41.5)}>JEP 516: cached objects work with every GC, including ZGC, which JEP 483 couldn't use.</Txt>
    </React.Fragment>
  );
}

// ── Leyden workflow ────────────────────────────────────────────────────────
export function SLeydenWorkflow({ t }) {
  const steps = [['1 · record', 'training run', 5.5, 'pull', 96], ['app.aotconf', 'what was loaded', 8, 'ink', 452], ['2 · create', 'no app runs', 12, 'pull', 808], ['app.aot', 'the AOT cache', 14, 'flow', 1164], ['3 · run', 'every start', 18, 'flow', 1520]];
  return (
    <React.Fragment>
      {steps.map(([l, s, at, tone, x], i) => (
        <React.Fragment key={l}>
          <Box x={x} y={200} w={304} h={88} label={l} sub={s} tone={tone} fill={i % 2 === 1} dashed={i % 2 === 1} a={E(t, at)} fs={22} glow={pulse(t, [at + 0.3], 1)} />
          {i > 0 && <HArrow x1={x - 50} x2={x - 6} y={244} a={E(t, at - 0.2)} color={toneColor(tone)} />}
        </React.Fragment>
      ))}
      <Code x={96} y={316} w={1728} h={44 + 24 + 6 * 34} lang="shell" title="JDK 24+ · exact forms from JEP 483 and JEP 514" fs={18} lh={34} t={t} a={E(t, 5)} lines={[
        { s: '$ java -XX:AOTMode=record -XX:AOTConfiguration=app.aotconf -cp app.jar com.example.App', at: 5.6, cps: 80 },
        { s: '$ java -XX:AOTMode=create -XX:AOTConfiguration=app.aotconf -XX:AOTCache=app.aot -cp app.jar', at: 12.2, cps: 80 },
        { s: '$ java -XX:AOTCache=app.aot -cp app.jar com.example.App', at: 18.2, cps: 80 },
        { s: '# JDK 25, JEP 514: record + create in one step', at: 24, cps: 80 },
        { s: '$ java -XX:AOTCacheOutput=app.aot -cp app.jar com.example.App', at: 24.4, cps: 80 },
        { s: '# none of these flags exist on the JDK 17 used for this topic', at: 0.8, cps: 200 },
      ]} />
      <DocTag x={96} y={652} a={E(t, 30.5)} text="documented in the JEPs · not measured here" />
      <Table x={96} y={680} cols={[470, 150, 200, 110, 160]} head={['program', 'before', 'with cache', 'gain', 'cache size']} fs={20} rh={48} a={E(t, 30.5)}
        rows={[['HelloStream (JEP 483)', '0.031 s', '0.018 s', '42%', '11.4 MB'], ['Spring PetClinic · ~21,000 classes', '4.486 s', '2.604 s', '42%', '130 MB'], ['HelloStreamWarmup + profiles (515)', '90 ms', '73 ms', '19%', '+250 KB']]}
        rowA={[E(t, 31), E(t, 31.5), E(t, 45)]} marks={{ 1: ['pull', win(t, 31, 45)], 2: ['pink', E(t, 45)] }} colColors={[PAL.ink, PAL.ink2, PAL.flow, PAL.pull, PAL.ink2]} />
      <Note x={1220} y={680} w={604} tone="bad" a={E(t, 38)} fs={19} title="the price" text="Same JDK release, OS and CPU architecture for every run. Class path of JARs only. Consistent module options. A cache can be big." />
    </React.Fragment>
  );
}

// ── AOT doesn't mean no JIT ────────────────────────────────────────────────
export function SProfiles({ t }) {
  const gx0 = 160, gx1 = 1780, gy0 = 680, gy1 = 300, T = 10;
  const X = (s) => lerp(gx0, gx1, s / T), Y = (v) => lerp(gy0, gy1, v);
  const cold = (s) => s < 1 ? 0.1 : s < 3 ? lerp(0.1, 0.45, (s - 1) / 2) : s < 7 ? lerp(0.45, 0.92, (s - 3) / 4) : 0.92;
  const aot = (s) => {
    let v = s < 0.3 ? 0.22 : s < 3.2 ? lerp(0.22, 0.92, (s - 0.3) / 2.9) : 0.92;
    if (t > 27 && s > 5.4 && s < 6.6) v -= 0.3 * Math.sin(((s - 5.4) / 1.2) * Math.PI) * E(t, 27, 1);
    return v;
  };
  const path = (f, upTo) => { const p = []; for (let s = 0; s <= upTo; s += 0.05) p.push([X(s), Y(f(s))]); return p.map((q) => q.join(',')).join(' '); };
  const c1 = lerp(0, T, lin(t, 6, 6)), c2 = lerp(0, T, lin(t, 13, 6));
  return (
    <React.Fragment>
      <Panel x={96} y={196} w={1728} h={540} title="throughput over time" right="illustrative shape, not a measurement" a={E(t, 0.5)} />
      <svg width="1920" height="1080" style={{ position: 'absolute', left: 0, top: 0, opacity: E(t, 1) }}>
        <line x1={gx0} y1={gy0} x2={gx1} y2={gy0} stroke={PAL.line2} strokeWidth="2" />
        <line x1={gx0} y1={Y(0.92)} x2={gx1} y2={Y(0.92)} stroke={PAL.ink3} strokeWidth="1.5" strokeDasharray="6 8" opacity={E(t, 20)} />
        {c1 > 0.05 && <polyline points={path(cold, c1)} fill="none" stroke={PAL.flow} strokeWidth="4" strokeLinejoin="round" />}
        {c2 > 0.05 && <polyline points={path(aot, c2)} fill="none" stroke={PAL.pull} strokeWidth="4" strokeLinejoin="round" />}
        <line x1={gx0} y1={Y(0.68)} x2={gx1} y2={Y(0.68)} stroke={PAL.violet} strokeWidth="3" strokeDasharray="10 8" opacity={E(t, 34)} />
      </svg>
      <Txt x={X(1.2)} y={Y(0.1) + 12} mono fs={18} color={PAL.flow} a={E(t, 7)}>cold JVM: interpreter → C1 → C2</Txt>
      <Txt x={X(0.4)} y={Y(0.5)} mono fs={18} color={PAL.pull} a={E(t, 14)}>AOT cache + profiles</Txt>
      <Txt x={X(7.6)} y={Y(0.92) - 34} mono fs={18} color={PAL.ink2} a={E(t, 20)}>same peak: the same C2</Txt>
      <Txt x={X(5.0)} y={Y(0.55)} mono fs={18} color={PAL.bad} a={E(t, 27.5)}>deopt · re-profile · recompile</Txt>
      <Txt x={X(7.6)} y={Y(0.68) + 10} mono fs={18} color={PAL.violet} a={E(t, 34)}>native image: no JIT</Txt>
      <Txt x={gx1} y={gy0 + 10} anchor="right" mono fs={17} color={PAL.ink3} a={E(t, 1)}>time →</Txt>
      <Note x={96} y={764} w={1728} tone="flow" a={win(t, 0.5, 20)} fs={21} text="The best machine code depends on what your program actually does in production. Only the JIT can see that." />
      <Note x={96} y={764} w={1728} tone="pull" a={win(t, 20, 34)} fs={21} text="Cached profiles are a head start, not a contract. The JVM keeps profiling, and a wrong bet just deoptimises." />
      <Note x={96} y={764} w={1728} tone="violet" a={E(t, 34)} fs={21} text="**AOT cache ≠ no JIT.** Leyden keeps the interpreter, C1, C2 and deoptimisation. Only native image drops them." />
    </React.Fragment>
  );
}
