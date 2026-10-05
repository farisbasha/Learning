// 8.10 scenes, part 3: jdeps, jlink, where jlink bites, jpackage. All sizes are real (JDK 17, macOS arm64).
const { PAL, MOTION, lin, lerp, win, pulse, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Table, Mark, Brace, Chip, toneColor } = window.AN;
import { Note, DocTag, MeasTag } from './scenes1.jsx';
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;

// `java --list-modules` on this JDK 17 (70 modules, alphabetical)
const MODULES = ['java.base', 'java.compiler', 'java.datatransfer', 'java.desktop', 'java.instrument', 'java.logging', 'java.management', 'java.management.rmi', 'java.naming', 'java.net.http', 'java.prefs', 'java.rmi', 'java.scripting', 'java.se', 'java.security.jgss', 'java.security.sasl', 'java.smartcardio', 'java.sql', 'java.sql.rowset', 'java.transaction.xa', 'java.xml', 'java.xml.crypto', 'jdk.accessibility', 'jdk.attach', 'jdk.charsets', 'jdk.compiler', 'jdk.crypto.cryptoki', 'jdk.crypto.ec', 'jdk.dynalink', 'jdk.editpad', 'jdk.hotspot.agent', 'jdk.httpserver', 'jdk.incubator.foreign', 'jdk.incubator.vector', 'jdk.internal.ed', 'jdk.internal.jvmstat', 'jdk.internal.le', 'jdk.internal.opt', 'jdk.internal.vm.ci', 'jdk.internal.vm.compiler', 'jdk.internal.vm.compiler.management', 'jdk.jartool', 'jdk.javadoc', 'jdk.jcmd', 'jdk.jconsole', 'jdk.jdeps', 'jdk.jdi', 'jdk.jdwp.agent', 'jdk.jfr', 'jdk.jlink', 'jdk.jpackage', 'jdk.jshell', 'jdk.jsobject', 'jdk.jstatd', 'jdk.localedata', 'jdk.management', 'jdk.management.agent', 'jdk.management.jfr', 'jdk.naming.dns', 'jdk.naming.rmi', 'jdk.net', 'jdk.nio.mapmode', 'jdk.random', 'jdk.sctp', 'jdk.security.auth', 'jdk.security.jgss', 'jdk.unsupported', 'jdk.unsupported.desktop', 'jdk.xml.dom', 'jdk.zipfs'];
const NEEDED = new Set(['java.base', 'java.logging', 'java.xml']);

// ── jdeps ──────────────────────────────────────────────────────────────────
export function SJdeps({ t }) {
  const COLS = 7, CW = 247;
  const pick = E(t, 19, 0.8);
  return (
    <React.Fragment>
      <Txt x={96} y={196} mono fs={18} color={PAL.ink3} a={E(t, 0.5)}>JAVA --LIST-MODULES · JDK 17 · 70 MODULES</Txt>
      {MODULES.map((m, i) => {
        const need = NEEDED.has(m), loc = m === 'jdk.localedata';
        const x = 96 + (i % COLS) * CW, y = 232 + Math.floor(i / COLS) * 32;
        const a = E(t, 0.8 + i * 0.03) * (need ? 1 : 1 - 0.78 * pick);
        const c = need && pick > 0.1 ? PAL.flow : loc && t > 40 ? PAL.pull : PAL.ink2;
        return <div key={m} style={{ position: 'absolute', left: x, top: y, width: CW - 10, height: 28, boxSizing: 'border-box', borderRadius: 6, padding: '0 8px', opacity: a, background: need && pick > 0.1 ? hexA(PAL.flow, 0.18) : PAL.panel2, border: `1.5px solid ${need && pick > 0.1 ? PAL.flow : loc && t > 40 ? PAL.pull : PAL.line2}`, font: `500 17px ${MONO}`, color: c, lineHeight: '25px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m}</div>;
      })}
      <Console x={96} y={572} w={900} h={44 + 24 + 8 * 30} t={t} a={E(t, 6)} fs={17} lh={30} items={[
        { at: 6.5, text: 'jdeps --print-module-deps hello.jar', kind: 'cmd' },
        { at: 12.8, text: 'java.base,java.logging,java.xml', kind: 'ok' },
        { at: 19.5, text: 'jdeps hello.jar          (abridged)', kind: 'cmd' },
        { at: 20.2, text: 'hello -> java.base' },
        { at: 20.4, text: 'hello -> java.logging' },
        { at: 20.6, text: 'hello -> java.xml' },
        { at: 21.0, text: '   app  -> javax.xml.parsers     java.xml', kind: 'dim' },
      ]} />
      <Box x={1290} y={584} w={260} h={64} label="hello" sub="our module" tone="flow" fill a={E(t, 19.5)} fs={21} />
      <Box x={1070} y={704} w={280} h={64} label="java.logging" tone="flow" a={E(t, 20.5)} fs={21} />
      <Box x={1490} y={704} w={280} h={64} label="java.xml" tone="flow" a={E(t, 20.8)} fs={21} />
      <Box x={1290} y={830} w={260} h={64} label="java.base" tone="flow" a={E(t, 21.4)} fs={21} />
      <Arrow pts={[[1340, 652], [1340, 676], [1210, 676], [1210, 700]]} draw={M(t, 20.5, 0.6)} color={PAL.flow} />
      <Arrow pts={[[1500, 652], [1500, 676], [1630, 676], [1630, 700]]} draw={M(t, 20.8, 0.6)} color={PAL.flow} />
      <Arrow pts={[[1210, 772], [1210, 800], [1360, 800], [1360, 826]]} draw={M(t, 21.6, 0.6)} color={PAL.ink2} />
      <Arrow pts={[[1630, 772], [1630, 800], [1480, 800], [1480, 826]]} draw={M(t, 21.8, 0.6)} color={PAL.ink2} />
      <Txt x={1420} y={760} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 22)}>requires</Txt>
      <Note x={1060} y={572} w={764} tone="pull" a={win(t, 26, 33)} fs={20} text="Our `module-info.java` already says `requires java.logging; requires java.xml;`. jlink can follow that itself." />
      <Note x={1060} y={572} w={764} tone="flow" a={win(t, 33, 40)} fs={20} text="For a plain jar with no `module-info`, `jdeps` is how you get the list." />
      <Note x={1060} y={572} w={764} tone="bad" a={E(t, 40)} fs={20} text="It sees static references only. Our run also loaded classes from `jdk.localedata`, which it never listed." />
    </React.Fragment>
  );
}

// ── jlink ──────────────────────────────────────────────────────────────────
const SIZES = [
  ['full JDK 17 (jmods, tools, everything)', 305, 'bad', 19],
  ['runtime with all 70 modules', 154, 'ink', 21],
  ['our 3 modules, plain jlink', 52, 'pull', 25.5],
  ['+ strip debug · no headers · compress=2', 28, 'flow', 27.2],
  ['+ --generate-cds-archive', 50, 'violet', 45.5],
];
export function SJlink({ t }) {
  const BX = 1010, U = 2.45;
  const startup = [['JDK, default CDS', 81, 'flow', 38.5], ['jlink runtime', 110, 'bad', 39.2], ['jlink + CDS archive', 75, 'violet', 45.8]];
  return (
    <React.Fragment>
      <Console x={96} y={196} w={880} h={44 + 24 + 8 * 30} t={t} a={E(t, 0.5)} fs={17} lh={30} items={[
        { at: 6, text: 'jlink --module-path hello.jar --add-modules hello \\', kind: 'cmd' },
        { at: 6.3, text: '      --strip-debug --no-header-files --no-man-pages \\' },
        { at: 6.6, text: '      --compress=2 --output rt' },
        { at: 8.5, text: 'rt/bin/java --list-modules', kind: 'cmd' },
        { at: 9.1, text: 'hello', kind: 'ok' },
        { at: 9.3, text: 'java.base@17.0.17', kind: 'ok' },
        { at: 9.5, text: 'java.logging@17.0.17     java.xml@17.0.17', kind: 'ok' },
      ]} />
      <Note x={96} y={540} w={880} tone="bad" a={E(t, 12.5)} fs={19} title="JDK 17 vs 21+" text="`--compress=zip-6` is JDK 21+ syntax. JDK 17 answers **Error: Invalid compression level zip-6**." />

      {SIZES.map(([l, mb, tone, at], i) => {
        const y = 200 + i * 86;
        const w = mb * U * M(t, at + 0.2, 1.0);
        return (
          <React.Fragment key={l}>
            <Txt x={BX} y={y} fs={20} color={PAL.ink2} a={E(t, at)}>{l}</Txt>
            {i === 3 && t > 32 ? (
              <React.Fragment>
                <Box x={BX} y={y + 32} w={14 * U} h={40} r={4} tone="violet" fill a={1} />
                <Box x={BX + 14 * U} y={y + 32} w={12 * U} h={40} r={4} tone="blue" fill a={1} />
                <Box x={BX + 26 * U} y={y + 32} w={2 * U} h={40} r={4} tone="ink" fill a={1} />
                <Txt x={BX + 28 * U + 90} y={y + 40} mono fs={18} color={PAL.ink2} a={E(t, 32)}>libjvm 14 · classes 12 · rest 2</Txt>
              </React.Fragment>
            ) : <Box x={BX} y={y + 32} w={Math.max(1, w)} h={40} r={4} tone={tone} fill a={w > 1 ? 1 : 0} />}
            <Txt x={BX + mb * U + 12} y={y + 38} mono fs={22} weight={700} color={toneColor(tone)} a={E(t, at + 1)}>{mb} MB</Txt>
          </React.Fragment>
        );
      })}
      <MeasTag x={BX} y={650} a={E(t, 19.5)} text="du -sh · JDK 17 · macOS arm64" />

      <Txt x={96} y={690} mono fs={18} color={PAL.ink3} a={E(t, 38.5)}>STARTUP · MEDIAN OF 50 RUNS</Txt>
      {startup.map(([l, ms, tone, at], i) => (
        <React.Fragment key={l}>
          <Txt x={96} y={734 + i * 58} fs={20} color={PAL.ink2} a={E(t, at)}>{l}</Txt>
          <Box x={340} y={726 + i * 58} w={ms * 4.6 * M(t, at + 0.2, 0.8)} h={40} r={4} tone={tone} fill a={E(t, at)} />
          <Txt x={350 + ms * 4.6} y={732 + i * 58} mono fs={21} weight={700} color={toneColor(tone)} a={E(t, at + 0.8)}>{ms} ms</Txt>
        </React.Fragment>
      ))}
      <Note x={BX} y={700} w={814} tone="bad" a={win(t, 39.5, 46)} fs={20} text="A fresh jlink image has **no CDS archive**, so every start parses its classes again." />
      <Note x={BX} y={700} w={814} tone="violet" a={win(t, 46, 53)} fs={20} text="`--generate-cds-archive` dumps one into the image: +22 MB, and startup is back." />
      <Note x={BX} y={700} w={814} tone="flow" a={E(t, 53)} fs={20} text="For containers: a **28–50 MB** runtime layer instead of a 300 MB JDK. Faster pulls, smaller registries." />
    </React.Fragment>
  );
}

// ── Where jlink bites ──────────────────────────────────────────────────────
export function SJlinkTraps({ t }) {
  return (
    <React.Fragment>
      <Txt x={96} y={196} mono fs={18} color={PAL.pull} a={E(t, 4)}>1 · ONLY EXPLICIT MODULES</Txt>
      <Box x={96} y={232} w={330} h={74} label="user.jar" sub="module user · requires util" tone="flow" a={E(t, 4.3)} fs={20} sfs={17} />
      <Box x={456} y={232} w={380} h={74} label="util-1.0.jar" sub="no module-info → automatic" tone="pull" a={E(t, 5)} fs={20} sfs={17} />
      <HArrow x1={846} x2={920} y={269} a={E(t, 6)} color={PAL.ink2} />
      <Box x={930} y={232} w={200} h={74} label="jlink" tone={t > 10.5 ? 'bad' : 'ink'} a={E(t, 6.2)} fs={22} glow={pulse(t, [10.8], 1.2)} />
      <Mark x={1110} y={238} ok={false} a={E(t, 11)} />
      <Console x={96} y={326} w={1728} h={44 + 24 + 2 * 30} t={t} a={E(t, 10.5)} fs={17} lh={30} items={[
        { at: 10.6, text: 'jlink -p user.jar:util-1.0.jar --add-modules user --output rt', kind: 'cmd' },
        { at: 11.4, text: 'Error: automatic module cannot be used with jlink: util from file:///…/auto/util-1.0.jar', kind: 'err' },
      ]} />
      <Code x={96} y={478} w={1728} h={44 + 24 + 3 * 32} lang="shell" fs={18} lh={32} title="the usual workaround: jlink only the JDK, keep your jars on the class path" a={E(t, 17)} lines={[
        '$ jdeps --print-module-deps --ignore-missing-deps -cp "lib/*" app.jar',
        '$ jlink --add-modules java.base,java.logging,java.xml --output rt',
        '$ rt/bin/java -cp "app.jar:lib/*" com.example.Main',
      ]} />

      <Txt x={96} y={666} mono fs={18} color={PAL.pull} a={E(t, 24)}>2 · JDEPS SEES STATIC REFERENCES ONLY</Txt>
      <Console x={96} y={700} w={1728} h={44 + 24 + 3 * 30} t={t} a={E(t, 24.3)} fs={17} lh={30} items={[
        { at: 30.5, text: 'java -Xlog:class+load -jar hello.jar | grep jdk.localedata        (abridged)', kind: 'cmd' },
        { at: 31.2, text: '[0.052s][info][class,load] sun.util.resources.cldr.provider.CLDRLocaleDataMetaInfo source: jrt:/jdk.localedata', kind: 'ok' },
        { at: 31.5, text: '[0.055s][info][class,load] sun.text.resources.cldr.ext.FormatData_en_001 source: jrt:/jdk.localedata', kind: 'ok' },
      ]} />
      <Note x={96} y={866} w={1728} tone="bad" a={E(t, 37)} fs={20} text="Loaded through a service lookup, invisible to `jdeps`. Test the trimmed runtime itself, and add modules like `jdk.localedata` by hand." />
    </React.Fragment>
  );
}

// ── jpackage ───────────────────────────────────────────────────────────────
export function SJpackage({ t }) {
  const tree = [
    ['Hello.app/Contents/', PAL.ink, ''],
    ['  MacOS/Hello', PAL.pull, 'native launcher'],
    ['  app/hello.jar', PAL.flow, 'our jar'],
    ['  app/Hello.cfg', PAL.flow, 'main class, class path'],
    ['  runtime/', PAL.violet, 'a private JVM'],
    ['  Info.plist', PAL.ink2, ''],
  ];
  return (
    <React.Fragment>
      {[['hello.jar', 'the app', 'flow'], ['jlink runtime', 'built for you', 'violet'], ['native launcher', 'starts the JVM', 'pull']].map(([l, s, tone], i) => (
        <Box key={l} x={96} y={210 + i * 104} w={300} h={84} label={l} sub={s} tone={tone} a={E(t, 5.5 + i * 0.5)} fs={21} />
      ))}
      {[0, 1, 2].map((i) => <Arrow key={i} pts={[[400, 252 + i * 104], [440, 252 + i * 104], [440, 356], [476, 356]]} draw={M(t, 7 + i * 0.2, 0.6)} color={PAL.ink2} />)}
      <Box x={480} y={314} w={220} h={84} label="jpackage" tone="pull" a={POP(t, 7.6)} fs={24} glow={pulse(t, [8], 1.2)} />
      <HArrow x1={704} x2={756} y={356} a={E(t, 12)} color={PAL.pull} />
      <Panel x={760} y={196} w={580} h={340} title="--type app-image · real layout" tone="flow" a={E(t, 12)}>
        <div style={{ padding: '14px 20px' }}>
          {tree.map(([p, c, d], i) => (
            <div key={p} style={{ display: 'flex', justifyContent: 'space-between', height: 44, alignItems: 'center', font: `500 19px ${MONO}`, color: c, opacity: E(t, 12.4 + i * 0.35), whiteSpace: 'pre' }}>
              <span>{p}</span><span style={{ font: `400 17px ${SANS}`, color: PAL.ink3 }}>{d}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Txt x={1380} y={200} mono fs={18} color={PAL.ink3} a={E(t, 19.5)}>SIZE · REAL</Txt>
      {[['default runtime', '125 MB', 'bad', 19.5], ['--add-modules (our 3)', '29 MB', 'flow', 22], ['Hello-1.0.dmg', '18.8 MB', 'pull', 27.5]].map(([l, v, tone, at], i) => (
        <React.Fragment key={l}>
          <Txt x={1380} y={240 + i * 98} fs={20} color={PAL.ink2} a={E(t, at)}>{l}</Txt>
          <Txt x={1380} y={268 + i * 98} mono fs={40} weight={700} color={toneColor(tone)} a={E(t, at + 0.3)}>{v}</Txt>
        </React.Fragment>
      ))}
      <Console x={96} y={572} w={1728} h={44 + 24 + 3 * 30} t={t} a={E(t, 27)} fs={17} lh={30} items={[
        { at: 27.2, text: 'jpackage --name Hello --input input --main-jar hello.jar --main-class app.Main \\', kind: 'cmd' },
        { at: 27.5, text: '         --type dmg --add-modules java.base,java.logging,java.xml' },
        { at: 28.6, text: 'ls dmg/   →   Hello-1.0.dmg   (18,829,607 bytes)', kind: 'ok' },
      ]} />
      {[['macOS', 'dmg · pkg'], ['Windows', 'msi · exe'], ['Linux', 'deb · rpm']].map(([os, f], i) => (
        <Box key={os} x={96 + i * 410} y={766} w={390} h={96} label={os} sub={f} fs={24} sfs={19} tone={i === 0 ? 'flow' : 'ink'} a={E(t, 29 + i * 0.4)} glow={i === 0 ? win(t, 29, 34) * 0.6 : 0} />
      ))}
      <Note x={1356} y={762} w={468} tone="pull" a={win(t, 34.5, 41)} fs={19} text="No cross-building: each OS's installer is made on that OS, usually by CI." />
      <Note x={1356} y={762} w={468} tone="violet" a={E(t, 41)} fs={19} text="Packaging, not speed. It starts exactly as fast as the JVM inside it." />
    </React.Fragment>
  );
}
