// 8.9 scenes, part 1: intro, attaching (jps / jcmd / the attach mechanism), thread dumps, deadlocks.
// All terminal text is real JDK 17.0.17 output from the Shop demo (see data.jsx).
const { PAL, MOTION, lin, lerp, win, pulse, step, track, hlAt, clamp, hexA, MONO, SANS,
  Txt, Panel, Box, Code, HArrow, VArrow, Arrow, Dot, Card, Badge, Callout, Table, Mark, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;
import { Term, along } from './kit89.jsx';
import { TD_CHECKOUT, TD_REFH, TD_FIN, TD_MAIN, TD_T1, TD_ATTACH, TD_DEADLOCK, TD_RL_DEADLOCK, SHOP_FILE, THREE, HELP } from './data.jsx';

const abr = (s, n) => (s.length > n ? s.slice(0, n) + ' …' : s);

// ── Intro ──────────────────────────────────────────────────────────────────
export function SIntro({ t }) {
  const Y = 520;
  const sessions = Math.floor(Math.max(0, t - 6.5) * 20000);
  const cpu = t > 6.5 ? 0.92 + 0.08 * Math.abs(Math.sin(t * 7)) : 0;
  const rows = [
    ['checkout', t > 6.5 ? 'BLOCKED' : 'RUNNABLE', 'bad'],
    ['refund', t > 6.5 ? 'BLOCKED' : 'RUNNABLE', 'bad'],
    ['login-handler', `SESSIONS ${sessions.toLocaleString('en-US')}`, 'pull'],
    ['http-worker-1', 'CPU', 'violet'],
  ];
  const sym = [['frozen', 'checkout never returns', 'bad', 7.5], ['leaking', 'heap grows until OOM', 'pull', 9], ['hot', 'one core pinned at 100%', 'violet', 10.5]];
  const tools = [['jcmd Thread.print', 'thread dump', 'bad'], ['GC.class_histogram', 'then a heap dump', 'pull'], ['JFR', 'then a flame graph', 'violet']];
  return (
    <React.Fragment>
      <Txt x={96} y={150} mono fs={22} weight={600} color={PAL.pull} a={E(t, 0.3)} style={{ letterSpacing: '0.14em' }}>PART 08 · THE JVM · 8.9</Txt>
      <Txt x={92} y={192} fs={112} weight={700} lh={1} a={E(t, 0.6, 0.9)} style={{ letterSpacing: '-0.03em', transform: `translateY(${(1 - E(t, 0.6, 0.9)) * 24}px)` }}>Observing a running JVM</Txt>
      <Txt x={96} y={330} fs={36} color={PAL.ink2} a={E(t, 1.4, 0.8)}>Why is production slow? Find out without a restart or a code change.</Txt>

      <Panel x={96} y={Y} w={560} h={370} title="Shop" right="pid 6498" a={E(t, 2)} tone="flow" />
      {rows.map(([n, st, tone], i) => {
        const y = Y + 76 + i * 72;
        const a = E(t, 2.6 + i * 0.25);
        return (
          <React.Fragment key={n}>
            <Txt x={126} y={y} mono fs={22} color={PAL.ink} a={a}>{n}</Txt>
            {i < 3 && <Txt x={626} y={y + 2} anchor="right" mono fs={19} weight={600} color={t > 6.5 ? toneColor(tone) : PAL.ink3} a={a}>{st}</Txt>}
            {i === 3 && (
              <div style={{ position: 'absolute', left: 430, top: y + 6, width: 196, height: 18, borderRadius: 9, background: PAL.panel2, border: `1.5px solid ${PAL.line2}`, opacity: a, overflow: 'hidden' }}>
                <div style={{ width: `${cpu * 100}%`, height: '100%', background: PAL.violet }}></div>
              </div>
            )}
          </React.Fragment>
        );
      })}
      <Txt x={126} y={Y + 330} fs={19} color={PAL.ink3} a={E(t, 3.5)}>three bugs, one process, still running</Txt>

      {sym.map(([l, s, tone, at], i) => (
        <React.Fragment key={l}>
          <HArrow x1={662} x2={716} y={Y + 70 + i * 120} a={E(t, at)} color={toneColor(tone)} />
          <Box x={722} y={Y + 22 + i * 120} w={460} h={96} label={l} sub={s} tone={tone} a={E(t, at)} fs={26} sfs={19} glow={pulse(t, [at + 0.1], 1)} />
        </React.Fragment>
      ))}
      {tools.map(([l, s, tone], i) => (
        <React.Fragment key={l}>
          <HArrow x1={1188} x2={1262} y={Y + 70 + i * 120} a={E(t, 13.5 + i * 0.8)} color={PAL.ink2} />
          <Box x={1268} y={Y + 22 + i * 120} w={556} h={96} label={l} sub={s} tone="flow" a={E(t, 13.5 + i * 0.8)} fs={24} sfs={19} />
        </React.Fragment>
      ))}
      <Txt x={1546} y={Y - 34} anchor="mid" mono fs={18} color={PAL.flow} a={E(t, 13.5)}>tools that ship with every JDK</Txt>
    </React.Fragment>
  );
}

// ── jps, then jcmd help ────────────────────────────────────────────────────
const GROUPS = [
  ['Thread.', 'print', 'bad'],
  ['GC.', 'class_histogram  heap_dump  heap_info  run  finalizer_info  …', 'pull'],
  ['VM.', 'flags  system_properties  native_memory  set_flag  uptime  info  … (20)', 'flow'],
  ['JFR.', 'start  dump  stop  check  configure', 'violet'],
  ['Compiler.', 'codecache  codelist  queue  directives_add  …', 'blue'],
  ['ManagementAgent.', 'start  start_local  status  stop', 'green'],
  ['JVMTI.', 'agent_load  data_dump', 'pink'],
];
export function SAttach({ t }) {
  const lines = [
    { k: 'cmd', s: 'jps -l', at: 1 },
    { s: '6498 Shop', at: 2, tone: 'pull', toneA: win(t, 6.5, 13.5) },
    { s: '6512 jdk.jcmd/sun.tools.jps.Jps', at: 2.3 },
    { s: '(other JVMs on this machine omitted)', k: 'dim', at: 2.6 },
    { k: 'cmd', s: 'jps -lvm', at: 7 },
    { s: '6498 Shop deadlock', at: 8, tone: 'pull', toneA: win(t, 8, 13.5) },
    { s: '' },
    { k: 'cmd', s: 'jcmd 6498 help', at: 13.5 },
    { s: '6498:', at: 14.6 },
    { s: 'The following commands are available:', at: 14.8 },
    ...HELP.slice(0, 7).map((s, i) => ({ s, at: 15 + i * 0.12 })),
    { s: '… 40 more, abridged …', k: 'dim', at: 16 },
    { s: 'help', at: 16.1 },
  ];
  return (
    <React.Fragment>
      <Term x={96} y={190} w={800} h={44 + 20 + lines.length * 27} t={t} a={E(t, 0.4)} lines={lines} />
      <Panel x={940} y={190} w={884} h={420} title="jcmd 6498 help · grouped" right={`${HELP.length} commands`} a={E(t, 19)} tone="flow" />
      {GROUPS.map(([p, rest, tone], i) => {
        const a = E(t, 26 + i * 0.4);
        return (
          <React.Fragment key={p}>
            <Txt x={966} y={252 + i * 50} mono fs={20} weight={600} color={toneColor(tone)} a={a}>{p}</Txt>
            <Txt x={1170} y={254 + i * 50} mono fs={18} color={PAL.ink2} a={a}>{rest}</Txt>
          </React.Fragment>
        );
      })}
      <Txt x={966} y={262} fs={21} color={PAL.ink2} a={win(t, 19.3, 26)} w={820}>Diagnostic commands built into the JVM itself. Nothing to install, no agent.</Txt>
      <Table x={940} y={646} cols={[330, 554]} head={['older tool', 'jcmd equivalent']} a={E(t, 33)} fs={20} rh={44}
        rows={[['jstack <pid>', 'Thread.print'], ['jmap -histo <pid>', 'GC.class_histogram'], ['jmap -dump:… <pid>', 'GC.heap_dump'], ['jinfo <pid>', 'VM.flags · VM.system_properties'], ['jstat -gcutil <pid> 1s', 'none: still worth knowing']]}
        rowA={[0, 1, 2, 3, 4].map((i) => E(t, 33.4 + i * 0.5))} colColors={[PAL.ink2, PAL.flow]} marks={{ 4: ['pull', E(t, 40.5)] }} />
      <Callout x={96} y={826} w={800} tone="pull" a={E(t, 46)} fs={22} text="The habit: `jps` → `jcmd <pid> help` → pick the command." />
    </React.Fragment>
  );
}

// ── The attach mechanism ───────────────────────────────────────────────────
export function SAttachMech({ t }) {
  const JX = 1100;
  const paused = win(t, 29, 34.5);
  const back = (k) => { const p = M(t, 31 + k * 0.6, 0.9); return p > 0 && p < 1 ? <Dot key={k} x={lerp(960, 360, p)} y={lerp(475, 375, p)} color={PAL.flow} r={8} /> : null; };
  return (
    <React.Fragment>
      <Box x={96} y={300} w={260} h={110} label="jcmd" sub="pid 7101 · a separate JVM" tone="pull" a={E(t, 0.6)} fs={30} />
      <Panel x={470} y={250} w={520} h={300} title="temp directory" a={E(t, 1.2)} />
      <Box x={500} y={320} w={460} h={76} label=".attach_pid6498" sub="empty trigger file" tone="pull" a={POP(t, 5.5)} fs={22} glow={pulse(t, [5.6, 16.4], 1)} />
      <Box x={500} y={440} w={460} h={76} label=".java_pid6498" sub="Unix domain socket" tone="flow" a={POP(t, 22.5)} fs={22} glow={pulse(t, [22.6], 1)} />
      <Arrow from={[358, 340]} to={[496, 352]} draw={M(t, 5.5, 0.5)} color={PAL.pull} />

      <Panel x={JX} y={210} w={724} h={540} title="Shop JVM · pid 6498" a={E(t, 1.6)} tone="flow" />
      <Box x={JX + 30} y={280} w={330} h={80} label="Signal Dispatcher" sub="receives the signal" tone="ink" a={E(t, 2)} fs={20} glow={pulse(t, [12.3], 1.2)} />
      <Box x={JX + 30} y={420} w={330} h={80} label="Attach Listener" sub="started on demand" tone="flow" a={POP(t, 16.5)} fs={20} glow={pulse(t, [16.6, 23.5], 1)} />
      <Box x={JX + 30} y={560} w={330} h={80} label="VM Thread" sub="runs safepoint ops" tone="violet" a={E(t, 2.2)} fs={20} glow={win(t, 29, 34.5) * 0.8} />
      {['checkout', 'refund', 'main', 'worker'].map((n, i) => (
        <Box key={n} x={JX + 420} y={280 + i * 104} w={270} h={80} label={n} sub={paused > 0.5 ? 'paused at safepoint' : 'app thread'} tone={paused > 0.5 ? 'violet' : 'ink'} a={E(t, 2.4 + i * 0.15)} fs={20} />
      ))}
      <Arrow pts={[[226, 412], [226, 610], [1060, 610], [1060, 320], [JX + 26, 320]]} draw={M(t, 11, 1.2)} color={PAL.bad} />
      <Txt x={640} y={622} anchor="mid" mono fs={19} color={PAL.bad} a={E(t, 11.8)}>SIGQUIT  (same as kill -3)</Txt>
      <Arrow from={[JX + 30, 300]} to={[964, 350]} draw={M(t, 16, 0.5)} color={PAL.pull} dashed />
      <Txt x={1040} y={268} anchor="mid" mono fs={17} color={PAL.pull} a={win(t, 16, 22.5)}>file there?</Txt>
      <VArrow x={JX + 195} y1={362} y2={416} a={E(t, 16.8)} color={PAL.flow} />
      <Arrow from={[JX + 26, 470]} to={[964, 478]} draw={M(t, 22.5, 0.5)} color={PAL.flow} />
      <Arrow from={[358, 380]} to={[496, 470]} draw={M(t, 23.5, 0.6)} color={PAL.pull} />
      <Txt x={300} y={470} mono fs={18} color={PAL.pull} a={E(t, 24)}>"Thread.print"</Txt>
      <VArrow x={JX + 195} y1={502} y2={556} a={E(t, 28.5)} color={PAL.violet} />
      {[0, 1, 2, 3].map(back)}

      <Callout x={96} y={672} w={940} tone="violet" fs={20} a={win(t, 28.5, 40.6)} text="Thread dumps, heap dumps and histograms run as **safepoint operations**: every Java thread is paused briefly while the VM Thread does the work." />
      <Callout x={96} y={672} w={940} tone="bad" fs={20} a={E(t, 41)} text="No trigger file? `kill -3 <pid>` just prints a thread dump to the JVM's own stdout. Attaching needs the **same OS user**." />
      <Term x={96} y={790} w={1728} h={44 + 20 + 2 * 27} t={t} a={E(t, 35.5)} title="from our real thread dump · abridged" lines={[
        { parts: [['"Attach Listener" #16 daemon prio=9 os_prio=31 cpu=0.86ms ', null], ['elapsed=0.18s', 'pull'], [' …', 'dim']] },
        { parts: [['"main" #1 prio=5 os_prio=31 cpu=19.31ms ', null], ['elapsed=7.09s', 'flow'], [' …', 'dim']] },
      ]} />
    </React.Fragment>
  );
}

// ── Anatomy of one thread ──────────────────────────────────────────────────
const HDR = [
  ['"checkout"', 'thread name', 'pull'], ['#14', 'Java thread id', 'ink'], ['prio=5 os_prio=31', 'priorities', 'ink'], ['cpu=0.55ms', 'CPU used so far', 'flow'], ['elapsed=7.07s', 'age', 'flow'],
  ['tid=0x0000000c3cd6cc00', 'JVM thread pointer', 'ink'], ['nid=0x8003', 'OS thread id (hex)', 'violet'], ['waiting for monitor entry', "the VM's view", 'bad'],
];
export function SDumpAnatomy({ t }) {
  const phaseA = win(t, 5.6, 27.2, 0.5), phaseB = E(t, 27.2);
  const lineTone = (i) => [['pull', win(t, 6, 27)], ['bad', E(t, 27)], ['pull', E(t, 33)], ['bad', E(t, 38.5)], ['green', E(t, 44.5)]][i] || [null, 0];
  const lines = TD_CHECKOUT.map((s, i) => { const [tone, ta] = lineTone(i); return { s, tone, toneA: ta }; });
  // header chips, laid out in two rows
  const chips = [];
  let x = 96, row = 0;
  HDR.forEach(([tok, lab, tone], i) => {
    if (i === 5) { x = 96; row = 1; }
    const w = Math.max(tok.length * 13.2 + 34, lab.length * 9.6 + 24);
    chips.push({ tok, lab, tone, x, y: 490 + row * 160, w, at: 6 + i * 0.45 });
    x += w + 22;
  });
  const focus = (i) => (i === 0 ? win(t, 6, 12.5) : i === 3 || i === 4 ? win(t, 12.5, 20) : i === 6 ? win(t, 20, 27) : 0);
  const src = SHOP_FILE.slice(7, 13).map((s, i) => ({ s: `${String(8 + i).padStart(2)}  ${s.slice(4)}`, tone: i === 3 ? 'bad' : i === 1 ? 'green' : undefined, toneA: i === 3 ? E(t, 33) : i === 1 ? E(t, 44.5) : 0 }));
  const notes = [
    [27, 'BLOCKED (on object monitor)', 'waiting to enter a synchronized block', 'bad'],
    [33, 'at Shop.checkout(Shop.java:11)', 'top frame: where the thread is right now', 'pull'],
    [38.5, '- waiting to lock <…c878>', 'it wants this monitor; someone else holds it', 'bad'],
    [44.5, '- locked <…c868>', 'it already holds this one (taken at line 9)', 'green'],
  ];
  return (
    <React.Fragment>
      <Term x={96} y={190} w={1728} h={44 + 20 + lines.length * 27} t={t} a={E(t, 0.4)} title="jcmd 6498 Thread.print · one thread" right="JDK 17" lines={lines} />
      {chips.map((c, i) => {
        const a = phaseA * E(t, c.at, 0.4);
        const col = toneColor(c.tone);
        const f = focus(i);
        return (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', left: c.x, top: c.y, width: c.w, height: 70, boxSizing: 'border-box', borderRadius: 10, opacity: a, transform: `translateY(${(1 - E(t, c.at, 0.4)) * -30}px)`, background: hexA(col, 0.12 + 0.14 * f), border: `2px solid ${hexA(col, 0.6 + 0.4 * f)}`, boxShadow: f > 0.01 ? `0 0 ${24 * f}px ${hexA(col, 0.5 * f)}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 22px ${MONO}`, color: PAL.ink, whiteSpace: 'nowrap' }}>{c.tok}</div>
            <Txt x={c.x + c.w / 2} y={c.y + 80} anchor="mid" fs={19} color={col} a={a}>{c.lab}</Txt>
          </React.Fragment>
        );
      })}
      <Callout x={1210} y={480} w={614} tone="flow" fs={21} a={phaseA * win(t, 12.5, 27.2)} text="0.55 ms of CPU in 7 seconds of life: this thread is doing **nothing**." />
      <Callout x={1040} y={800} w={784} tone="violet" fs={21} a={phaseA * win(t, 20, 27.2)} text="`nid` is the OS thread id: 0x8003 = 32771. `top -H` lists threads by that id, so a hot one maps straight to its stack." />

      <Code x={96} y={480} w={860} h={44 + 24 + 6 * 38} title="Shop.java" a={phaseB} fs={19} lh={38} lines={src} />
      {notes.map(([at, l, s, tone], i) => <Box key={i} x={1000} y={480 + i * 106} w={824} h={90} label={l} sub={s} tone={tone} align="left" fs={21} sfs={18} a={phaseB * E(t, at)} glow={pulse(t, [at + 0.1], 1.1)} />)}
      <Callout x={96} y={790} w={860} tone="pull" fs={22} a={E(t, 51)} text="Holding one lock while waiting for another: the recipe for a deadlock." />
    </React.Fragment>
  );
}

// ── Thread states ──────────────────────────────────────────────────────────
export function SStates({ t }) {
  const rows = [
    ['BLOCKED', 'waiting to enter `synchronized`', '- waiting to lock <0x…>'],
    ['WAITING', 'wait(), join(), park(): no timeout', '- waiting on <0x…>   or   - parking to wait for <0x…>'],
    ['TIMED_WAITING', 'the same, with a timeout; sleep()', 'TIMED_WAITING (sleeping)  ·  (on object monitor)  ·  (parking)'],
    ['RUNNABLE', 'running, or inside native code', 'no lock line: look at cpu= instead'],
  ];
  const ats = [5.5, 12, 26, 32];
  const cur = ats.filter((a) => t >= a).length - 1;
  const marks = cur >= 0 ? { [cur]: [cur === 3 ? 'bad' : 'pull', 1] } : {};
  const snip = (at, end, title, lines) => <Term key={title} x={96} y={500} w={1728} h={44 + 20 + lines.length * 27} t={t} a={win(t, at, end, 0.5)} title={title} right="abridged" lines={lines} />;
  return (
    <React.Fragment>
      <Table x={96} y={196} cols={[250, 560, 918]} head={['state', 'means', 'the line you will see']} rows={rows} fs={20} rh={56} a={E(t, 0.6)}
        rowA={ats.map((a) => E(t, a))} colColors={[PAL.pull, PAL.ink, PAL.flow]} marks={marks} />
      {snip(5.5, 12, '"checkout"', TD_CHECKOUT.slice(1, 5).map((s, i) => ({ s, tone: i === 2 ? 'bad' : undefined })))}
      {snip(12, 19.5, '"Finalizer"', TD_FIN.slice(1, 4).map((s, i) => ({ s, tone: i === 2 ? 'pull' : undefined })))}
      {snip(19.5, 26, '"t1" · a ReentrantLock waiter', TD_T1.slice(1, 4).map((s, i) => ({ s, tone: i === 2 ? 'pull' : i === 0 ? 'violet' : undefined })))}
      {snip(26, 32, '"main"', TD_MAIN.slice(1, 4).map((s, i) => ({ s, tone: i === 0 ? 'pull' : undefined })))}
      {snip(32, 99, '"Reference Handler"', [
        { parts: [['"Reference Handler" #2 daemon prio=10 os_prio=31 ', null], ['cpu=0.12ms elapsed=7.08s', 'bad'], [' …', 'dim']], tone: 'bad', toneA: E(t, 38.5) },
        { s: TD_REFH[1], tone: 'flow' }, TD_REFH[2],
      ])}
      <Callout x={96} y={720} w={1728} tone="violet" fs={22} a={win(t, 19.5, 26)} text="A `ReentrantLock` waiter is `WAITING (parking)`, never `BLOCKED`. Search for `parking to wait for` as well as `waiting to lock`." />
      <Callout x={96} y={720} w={1728} tone="ink" fs={22} a={win(t, 26, 32)} text="`NEW` and `TERMINATED` never appear: a dump lists only live threads." />
      <Callout x={96} y={720} w={1728} tone="bad" fs={22} a={E(t, 38.5)} text="`RUNNABLE` with 0.12 ms of CPU in 7 s: it's sitting in native code. Blocking socket reads look exactly like this. Trust `cpu=`, not the state." />
    </React.Fragment>
  );
}

// ── The deadlock, drawn ────────────────────────────────────────────────────
export function SDeadlock({ t }) {
  const tones = { 1: ['flow', E(t, 8)], 7: ['violet', E(t, 8.6)], 3: ['bad', E(t, 14)], 9: ['bad', E(t, 20)] };
  const src = SHOP_FILE.slice(7, 18).map((s, i) => ({ s: `${String(8 + i).padStart(2)}  ${s.slice(4)}`, tone: tones[i] ? tones[i][0] : undefined, toneA: tones[i] ? tones[i][1] : 0 }));
  const C = [1120, 425], R = [1684, 425], I = [1412, 265], L = [1412, 585];
  const cyc = t >= 33 ? along([[1240, 425], [1282, 585], [1564, 425], [1542, 265], [1240, 425]], (t - 33) / 3.5) : null;
  const bottomA = win(t, 39.5, 46, 0.5);
  const A878 = 'pull', A868 = 'green';
  return (
    <React.Fragment>
      <Code x={96} y={190} w={820} h={44 + 24 + src.length * 32} title="Shop.java" a={E(t, 0.5)} fs={17} lh={32} lines={src} />
      <Box x={C[0] - 120} y={C[1] - 45} w={240} h={90} label="checkout" sub={t > 14 ? 'BLOCKED' : 'thread'} tone="flow" a={E(t, 4)} fs={24} glow={pulse(t, [14], 1)} />
      <Box x={R[0] - 120} y={R[1] - 45} w={240} h={90} label="refund" sub={t > 20 ? 'BLOCKED' : 'thread'} tone="violet" a={E(t, 4.3)} fs={24} glow={pulse(t, [20], 1)} />
      <Box x={I[0] - 130} y={I[1] - 45} w={260} h={90} label="INVENTORY" sub="monitor <…c868>" tone={A868} a={E(t, 4.6)} fs={22} />
      <Box x={L[0] - 130} y={L[1] - 45} w={260} h={90} label="LEDGER" sub="monitor <…c878>" tone={A878} a={E(t, 4.9)} fs={22} />
      <Arrow from={[I[0] - 132, 280]} to={[1130, 377]} draw={M(t, 8, 0.6)} color={PAL.green} width={3} />
      <Txt x={1150} y={292} anchor="mid" mono fs={17} color={PAL.green} a={E(t, 8.4)}>held by</Txt>
      <Arrow from={[L[0] + 132, 570]} to={[1674, 473]} draw={M(t, 8.6, 0.6)} color={PAL.green} width={3} />
      <Txt x={1680} y={560} anchor="mid" mono fs={17} color={PAL.green} a={E(t, 9)}>held by</Txt>
      <Arrow from={[1130, 473]} to={[L[0] - 134, 585]} draw={M(t, 14, 0.6)} color={PAL.bad} width={3} dashed />
      <Txt x={1150} y={560} anchor="mid" mono fs={17} color={PAL.bad} a={E(t, 14.4)}>wants</Txt>
      <Arrow from={[1674, 377]} to={[I[0] + 134, 265]} draw={M(t, 20, 0.6)} color={PAL.bad} width={3} dashed />
      <Txt x={1680} y={292} anchor="mid" mono fs={17} color={PAL.bad} a={E(t, 20.4)}>wants</Txt>
      {cyc && <Dot x={cyc[0]} y={cyc[1]} color={PAL.bad} r={10} a={E(t, 33)} />}
      <Badge x={1412} y={425} text="a cycle = deadlock" tone="bad" a={POP(t, 33)} fs={19} solid />
      <Txt x={1412} y={128 + 520} anchor="mid" fs={19} color={PAL.ink2} a={win(t, 26, 46)} w={760} align="center">thread → lock it wants · lock → its owner</Txt>

      <Term x={96} y={640} w={820} h={44 + 20 + 6 * 27} t={t} a={bottomA} title="the two threads · abridged" lines={[
        { parts: [['"checkout"  ', null], ['BLOCKED', 'bad']] },
        { parts: [['    - waiting to lock ', null], ['<0x0000000787f1c878>', A878]] },
        { parts: [['    - locked ', null], ['<0x0000000787f1c868>', A868]] },
        { parts: [['"refund"  ', null], ['BLOCKED', 'bad']] },
        { parts: [['    - waiting to lock ', null], ['<0x0000000787f1c868>', A868]] },
        { parts: [['    - locked ', null], ['<0x0000000787f1c878>', A878]] },
      ]} />
      <Callout x={980} y={690} w={844} tone="pull" fs={21} a={bottomA} text="Each thread's `waiting to lock` address is the other thread's `locked` address." />
      <Term x={96} y={672} w={1728} h={44 + 20 + 8 * 27} t={t} a={E(t, 46)} title="the end of the same thread dump" right="JDK 17" tone="bad" lines={[
        { s: TD_DEADLOCK[0], k: 'err' }, TD_DEADLOCK[1], TD_DEADLOCK[2], TD_DEADLOCK[3], TD_DEADLOCK[4], TD_DEADLOCK[6], TD_DEADLOCK[7], TD_DEADLOCK[8],
      ].map((l) => (typeof l === 'string' ? { s: l } : l))} />
    </React.Fragment>
  );
}

// ── What the detector can see ──────────────────────────────────────────────
export function SDeadlockDetect({ t }) {
  const chain = [['checkout', 'flow'], ['LEDGER', 'pull'], ['refund', 'violet'], ['INVENTORY', 'green']];
  const lit = Math.floor(clamp((t - 1.5) / 1.3, -1, 3.99));
  const kinds = [
    ['synchronized monitor', 'the monitor records its owner thread', true, 14.5],
    ['ReentrantLock · RRWL write lock', 'AbstractOwnableSynchronizer keeps the owner', true, 15.3],
    ['Semaphore · CountDownLatch', 'permits have no owner', false, 28.5],
    ['database or distributed locks', 'outside the JVM entirely', false, 29.3],
    ['futures, queues, thread pools', 'waiting on work, not on a lock', false, 30.1],
  ];
  return (
    <React.Fragment>
      {chain.map(([l, tone], i) => (
        <React.Fragment key={l}>
          <Box x={96 + i * 222} y={240} w={180} h={80} label={l} fs={i % 2 ? 19 : 21} tone={tone} a={E(t, 0.8 + i * 0.3)} glow={lit === i ? 0.9 : 0} />
          {i < 3 && <HArrow x1={278 + i * 222} x2={316 + i * 222} y={280} a={E(t, 1.5 + i * 1.3)} color={i % 2 ? PAL.green : PAL.bad} />}
        </React.Fragment>
      ))}
      <Arrow pts={[[186 + 3 * 222, 322], [186 + 3 * 222, 380], [186, 380], [186, 326]]} draw={M(t, 6.5, 1)} color={PAL.bad} width={3} />
      <Txt x={520} y={392} anchor="mid" mono fs={18} color={PAL.bad} a={E(t, 7.5)}>back to a thread already visited: cycle</Txt>
      <Txt x={96} y={200} mono fs={17} color={PAL.ink3} a={E(t, 0.6)}>THE WALK: THREAD → WANTED LOCK → OWNER → …</Txt>
      <Callout x={96} y={460} w={850} tone="flow" fs={21} a={win(t, 7.5, 35.3)} text="The walk only works if every lock knows its **owner**." />
      <Callout x={96} y={460} w={850} tone="pull" fs={21} a={E(t, 35.5)} text="No owner, no detection. Look for many threads `parking to wait for` the same object, by eye." />

      <Txt x={1000} y={200} mono fs={17} color={PAL.ink3} a={E(t, 14)}>CAN THE JVM DETECT A CYCLE THROUGH…</Txt>
      {kinds.map(([l, s, ok, at], i) => (
        <React.Fragment key={l}>
          <Box x={1000} y={236 + i * 86} w={760} h={74} label={l} sub={s} tone={ok ? 'flow' : 'bad'} align="left" fs={20} sfs={17} a={E(t, at)} />
          <Mark x={1792} y={273 + i * 86} ok={ok} a={POP(t, at + 0.4)} />
        </React.Fragment>
      ))}
      <Term x={96} y={680} w={1728} h={44 + 20 + 5 * 27} t={t} a={E(t, 15)} title="jcmd Thread.print · two ReentrantLocks in a cycle" right="JDK 17" lines={[
        { s: TD_RL_DEADLOCK[0], k: 'err' }, { s: TD_RL_DEADLOCK[1] }, { s: TD_RL_DEADLOCK[2] },
        { s: TD_RL_DEADLOCK[3], tone: 'pull', toneA: E(t, 22) }, { s: TD_RL_DEADLOCK[4] },
      ]} />
    </React.Fragment>
  );
}

// ── Three dumps ────────────────────────────────────────────────────────────
export function SThreeDumps({ t }) {
  const rowsY = [290, 450, 610];
  const names = [['checkout', 'BLOCKED', 'bad'], ['http-worker-1', 'RUNNABLE', 'violet'], ['login-handler', 'TIMED_WAITING', 'flow']];
  const keys = ['checkout', 'worker', 'login'];
  const focus = [win(t, 13, 20.5), win(t, 20.5, 28.5), win(t, 28.5, 35.5)];
  const verdict = [['STUCK', 'same frame · flat cpu', 'bad', 14.5], ['BUSY · HOT', 'frame moves · cpu climbs', 'violet', 22], ['HEALTHY', 'sleeps, works, sleeps', 'flow', 30]];
  return (
    <React.Fragment>
      {names.map(([n, st, tone], r) => (
        <React.Fragment key={n}>
          <Txt x={96} y={rowsY[r] + 14} mono fs={22} weight={600} color={PAL.ink} a={E(t, 1 + r * 0.3)}>{n}</Txt>
          <Txt x={96} y={rowsY[r] + 50} mono fs={18} color={toneColor(tone)} a={E(t, 1 + r * 0.3)}>{st}</Txt>
          <div style={{ position: 'absolute', left: 86, top: rowsY[r] - 14, width: 1748, height: 130, borderRadius: 14, border: `2px solid ${hexA(toneColor(tone), focus[r])}`, background: hexA(toneColor(tone), 0.06 * focus[r]), opacity: focus[r] > 0.01 ? 1 : 0 }}></div>
        </React.Fragment>
      ))}
      {THREE.map((d, i) => {
        const x = 370 + i * 410, a = E(t, 6 + i * 0.8);
        return (
          <React.Fragment key={i}>
            <Panel x={x} y={196} w={390} h={570} title={`dump ${i + 1}`} right={`t = ${i * 10} s`} a={a} />
            {keys.map((k, r) => (
              <React.Fragment key={k}>
                <Txt x={x + 20} y={rowsY[r] + 4} mono fs={18} color={PAL.ink} a={a}>{d[k][0]}</Txt>
                <Txt x={x + 20} y={rowsY[r] + 46} mono fs={20} color={PAL.ink2} a={a}>cpu=<span style={{ color: k === 'worker' ? PAL.violet : k === 'checkout' ? PAL.bad : PAL.flow, fontWeight: 600 }}>{d[k][1]}</span></Txt>
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      })}
      {verdict.map(([l, s, tone, at], r) => <Box key={l} x={1610} y={rowsY[r] - 4} w={214} h={96} label={l} sub={s} tone={tone} a={POP(t, at)} fs={21} sfs={17} style={{ whiteSpace: 'normal' }} />)}
      <Txt x={1717} y={214} anchor="mid" mono fs={17} color={PAL.ink3} a={E(t, 14)}>VERDICT</Txt>
      <Callout x={96} y={796} w={1728} tone="pull" fs={22} a={E(t, 35.5)} text="Same frame + flat `cpu=` → **stuck**. Moving frame → **busy**. Busy and burning CPU → **profile it** (next chapters)." />
    </React.Fragment>
  );
}
