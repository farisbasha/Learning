// 8.8 scenes, part 3: call-site profiles, inline caches, deoptimisation, guards, other optimisations.
// PrintInlining / PrintCompilation / LogCompilation lines are real JDK 17.0.17 output from Phases.java.
const { PAL, MOTION, lin, lerp, win, pulse, step, track, track1, hlAt, clamp, hexA, MONO, SANS, fmt, hiJava,
  Txt, Panel, Box, Code, Console, HArrow, VArrow, Arrow, Dot, Card, Node, Badge, Callout, Table, Mark, Val, Brace, Bytes, toneColor } = window.AN;
const E = MOTION.enter, M = MOTION.move, POP = MOTION.pop;
import { Tok } from './scenes1.jsx';
import { Term } from './scenes2.jsx';

const mono = (s, fs = 18, color) => <div style={{ font: `400 ${fs}px ${MONO}`, whiteSpace: 'pre', color: color || PAL.ink, lineHeight: 1.55 }}>{color ? s : hiJava(s)}</div>;

// ── Monomorphic / bimorphic / megamorphic ─────────────────────────────────
export function SMorphism({ t }) {
  const ph = t < 26 ? 1 : t < 39 ? 2 : 3;
  const emit = {
    1: ['if (s.klass == Circle)', '    sum += PI * s.r * s.r;        // inlined', 'else', '    uncommon_trap();             // deoptimise'],
    2: ['if (s.klass == Circle)', '    sum += PI * s.r * s.r;        // inlined', 'else if (s.klass == Square)', '    sum += s.side * s.side;      // inlined', 'else', '    uncommon_trap();'],
    3: ['sum += s.area();     // a real virtual call', '                     // no body to optimise'],
  }[ph];
  const rowA = E(t, 6);
  const sq = E(t, 27);
  const cards = [
    ['1 · only Circle', 'monomorphic', 'flow', ['@ 27   Circle::area (14 bytes)   inline (hot)', '\\-> TypeProfile (760993/760993 counts) = Circle'], '0.97', 12],
    ['2 · Circle + Square', 'bimorphic', 'pull', ['@ 27   Circle::area (14 bytes)   inline (hot)', '@ 27   Square::area (10 bytes)   inline (hot)'], '0.94', 26],
    ['3 · + Triangle', 'megamorphic', 'bad', ['@ 27   Shape::area (0 bytes)   virtual call'], '3.65', 39],
  ];
  return (
    <React.Fragment>
      <Code x={96} y={196} w={820} h={44 + 24 + 34} fs={20} lh={34} title="Phases.total · the call site" a={E(t, 0.4)} lines={['for (Shape s : shapes) sum += s.area();   // bci 27']} />
      <Panel x={96} y={326} w={820} h={250} title="type profile at bci 27" right="2 rows + other" tone="violet" a={E(t, 1)}>
        <div style={{ padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ height: 50, borderRadius: 10, border: `2px solid ${PAL.flow}`, background: hexA(PAL.flow, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', font: `600 21px ${MONO}`, color: PAL.ink, opacity: rowA }}>
            <span>Circle</span><span style={{ color: PAL.flow }}>{t < 19 ? '…' : ph === 1 ? '760,993' : '1,197,989'}</span>
          </div>
          <div style={{ height: 50, borderRadius: 10, border: `2px ${ph >= 2 ? 'solid' : 'dashed'} ${ph >= 2 ? PAL.pull : PAL.line2}`, background: ph >= 2 ? hexA(PAL.pull, 0.12) : 'transparent', display: 'flex', alignItems: 'center', justifyContent: ph >= 2 ? 'space-between' : 'center', padding: '0 16px', font: `${ph >= 2 ? 600 : 400} 21px ${MONO}`, color: ph >= 2 ? PAL.ink : PAL.ink3, opacity: rowA }}>
            {ph >= 2 ? <React.Fragment><span>Square</span><span style={{ color: PAL.pull, opacity: sq }}>43,500</span></React.Fragment> : 'row 2 · empty'}
          </div>
          <div style={{ height: 50, borderRadius: 10, border: `2px ${ph === 3 ? 'solid' : 'dashed'} ${ph === 3 ? PAL.bad : PAL.line2}`, background: ph === 3 ? hexA(PAL.bad, 0.12) : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `400 20px ${MONO}`, color: ph === 3 ? PAL.ink : PAL.ink3, opacity: rowA }}>
            {ph === 3 ? 'Triangle: no row left → counted as "other"' : 'other · 0'}
          </div>
        </div>
      </Panel>
      <Tok t={t} keys={[[26.4, 1200, 160], [27.4, 506, 445]]} text="Square" tone="pull" until={27.6} w={140} h={42} fs={18} />
      <Tok t={t} keys={[[39.4, 1200, 160], [40.4, 506, 507]]} text="Triangle" tone="bad" until={40.6} w={160} h={42} fs={18} />

      <Panel x={960} y={196} w={864} h={380} title="what C2 emits (sketch)" tone={['flow', 'pull', 'bad'][ph - 1]} a={E(t, 12)} glow={pulse(t, [12, 32, 45], 1.2)}>
        <div style={{ padding: '16px 24px' }}>{emit.map((s, i) => <div key={ph + '-' + i} style={{ opacity: E(t, [12, 32, 45][ph - 1] + i * 0.2) }}>{mono(s, 20)}</div>)}</div>
      </Panel>

      {cards.map(([title, kind, tone, lines, ns, at], i) => {
        const x = 96 + i * 590;
        return (
          <React.Fragment key={title}>
            <Panel x={x} y={610} w={558} h={290} title={title} right={kind} tone={tone} a={E(t, at)} glow={ph === i + 1 ? 0.5 : 0} />
            <div style={{ position: 'absolute', left: x + 18, top: 670, opacity: E(t, at + (i === 0 ? 7 : 6)) }}>{lines.map((l, k) => <div key={k}>{mono(l, 17, k === 1 && i === 0 ? PAL.flow : toneColor(tone))}</div>)}</div>
            <Txt x={x + 22} y={790} mono fs={17} color={PAL.ink3} a={E(t, at + 7)}>NS PER area() CALL</Txt>
            <Txt x={x + 22} y={818} mono fs={52} weight={700} color={toneColor(tone)} a={E(t, at + 7)}>{ns}</Txt>
          </React.Fragment>
        );
      })}
      <Callout x={96} y={910} w={1728} tone="pull" a={win(t, 59, 70)} fs={19} text="One implementation at a call site costs nothing. It's the **third** type at a **hot** site that costs." />
    </React.Fragment>
  );
}

// ── Inline caches ──────────────────────────────────────────────────────────
export function SInlineCache({ t }) {
  const st = t < 11 ? 0 : t < 24 ? 1 : 2;
  const S = [['clean', 'not yet called', 'ink', 5], ['monomorphic', 'cached klass = Circle', 'flow', 11], ['megamorphic', 'vtable / itable stub', 'bad', 24]];
  const body = [
    ['call resolve_virtual_call     // into the JVM', 'the runtime finds the target,', 'then patches this call site'],
    ['if (s.klass == Circle)  jump Circle::area', 'else                    call ic_miss', '// a compare and a direct jump'],
    ['jump itable_stub:', '    load s.klass → scan itable for Shape', '    load method slot → jump    // 8.1’s lookup'],
  ][st];
  return (
    <React.Fragment>
      {S.map(([l, s, tone, at], i) => (
        <React.Fragment key={l}>
          <Box x={96 + i * 600} y={210} w={528} h={110} label={l} sub={s} tone={tone} fs={28} sfs={18} a={E(t, at)} glow={st === i ? 0.7 : 0} />
          {i > 0 && <HArrow x1={96 + i * 600 - 66} x2={96 + i * 600 - 6} y={265} a={E(t, at)} color={toneColor(tone)} />}
        </React.Fragment>
      ))}
      <Txt x={96 + 600 - 36} y={334} anchor="mid" mono fs={17} color={PAL.flow} a={E(t, 11)}>1st call</Txt>
      <Txt x={96 + 1200 - 36} y={334} anchor="mid" mono fs={17} color={PAL.bad} a={E(t, 24)}>a miss</Txt>
      <Panel x={96} y={380} w={1100} h={240} title={'compiled call site · s.area() · ' + S[st][0]} tone={S[st][2]} a={E(t, 5)}>
        <div style={{ padding: '18px 26px' }}>{body.map((s, i) => <div key={st + '-' + i} style={{ opacity: E(t, S[st][3] + 0.3 + i * 0.3) }}>{mono(s, 21, i === 0 ? PAL.ink : PAL.ink2)}</div>)}</div>
      </Panel>
      <Panel x={1230} y={380} w={594} h={240} title="receivers arriving" a={E(t, 5)} />
      {[['Circle', 'flow', 6], ['Circle', 'flow', 14], ['Circle', 'flow', 18], ['Square', 'pull', 24]].map(([n, tone, at], k) => (
        <Tok key={k} t={t} keys={[[at, 1760, 470 + (k % 2) * 60], [at + 1.2, 1300, 470 + (k % 2) * 60]]} text={n} tone={tone} until={at + 1.6} w={140} h={44} fs={18} />
      ))}
      <Txt x={1260} y={560} fs={19} color={PAL.ink2} w={540} a={E(t, 18)}>{st === 2 ? 'a `Square` missed the cached check' : 'same class every time: the check passes'}</Txt>
      <Callout x={96} y={650} w={1728} tone="violet" a={win(t, 32, 37.6)} fs={20} title="megamorphic dispatch" text="The vtable or itable lookup from 8.1: a few dependent loads and an **indirect jump** the CPU must predict. Fine once; costly in a hot loop." />
      <Panel x={96} y={650} w={1728} h={260} title="C2's 90% rule · TypeProfileMajorReceiverPercent=90" tone="pull" a={E(t, 38)}>
        <div style={{ padding: '16px 24px' }}>
          <div style={{ font: `400 20px ${SANS}`, color: PAL.ink }}>If one class makes up at least 90% of a megamorphic site, C2 inlines that class behind a check and makes a virtual call for the rest.</div>
          <div style={{ marginTop: 14, opacity: E(t, 45) }}>{mono('@ 27   Circle::area (14 bytes)   inline (hot)', 18, PAL.pull)}{mono('\\-> TypeProfile (1215087/1292834 counts) = Circle      // phase 3, another run', 18, PAL.flow)}</div>
        </div>
      </Panel>
      <div style={{ position: 'absolute', left: 1500, top: 742, width: 280, height: 26, borderRadius: 13, background: PAL.panel2, border: `1.5px solid ${PAL.line2}`, opacity: E(t, 45.5) }}>
        <div style={{ width: `${94 * E(t, 45.8, 1)}%`, height: '100%', borderRadius: 13, background: PAL.flow }}></div>
      </div>
      <Txt x={1640} y={780} anchor="mid" mono fs={19} weight={600} color={PAL.flow} a={E(t, 46.5)}>94% Circle · stale counts</Txt>
    </React.Fragment>
  );
}

// ── Deoptimisation ─────────────────────────────────────────────────────────
export function SDeopt({ t }) {
  const AX = 1010, AY = 214, CW2 = 92;
  const arr = ['S', 'C', 'S', 'C', 'S', 'C', 'S', 'C'];
  const failed = t >= 6.6;
  const frames = win(t, 13, 37.6);
  const slots = [['0', 'shapes', '→ Shape[1000]'], ['1–2', 'sum', '0.0 (double)'], ['3', 'array copy', '→ Shape[1000]'], ['4', 'length', '1000'], ['5', 'i', '0'], ['6', 's', '→ Square']];
  return (
    <React.Fragment>
      <Code x={96} y={196} w={860} h={44 + 24 + 6 * 34} fs={19} lh={34} title="nmethod #39 · C2 · Phases::total (sketch)" tone="flow" a={E(t, 0.4)} hl={3} hlA={win(t, 6.6, 13)} hlTone="bad"
        lines={['for (i = 0; i < len; i++) {', '    s = shapes[i];', '    if (s.klass == Circle) sum += PI * s.r * s.r;', '    else uncommon_trap(class_check, bci 27);', '}', 'return sum;']} />
      <Txt x={AX} y={190} mono fs={17} color={PAL.ink3} a={E(t, 5.5)}>shapes[] · phase 2</Txt>
      {arr.map((c, k) => <Box key={k} x={AX + k * (CW2 + 8)} y={AY + 10} w={CW2} h={64} label={c === 'S' ? 'Sq' : 'Ci'} tone={c === 'S' ? 'pull' : 'flow'} fs={20} a={E(t, 5.6 + k * 0.05)} glow={k === 0 && failed ? win(t, 6.6, 13) : 0} />)}
      <Txt x={AX + 46} y={AY + 82} anchor="mid" mono fs={18} color={PAL.pull} a={E(t, 6)}>i = 0</Txt>
      <Box x={AX} y={350} w={814} h={100} label="uncommon trap · class_check" sub="“my assumption broke, at bci 27”" tone="bad" fs={24} sfs={19} a={POP(t, 11)} glow={pulse(t, [11.2], 1.4)} />

      {/* frame rebuild */}
      <Panel x={96} y={490} w={600} h={330} title="compiled frame · registers" tone="flow" a={frames} />
      {[['sum', 0], ['i', 1], ['s', 2], ['shapes, len…', 3]].map(([n, k]) => <Box key={n} x={126} y={556 + k * 62} w={540} h={50} label={'reg ← ' + n} fs={19} tone="flow" a={frames * E(t, 17.4 + k * 0.2)} />)}
      <Box x={736} y={612} w={230} h={86} label="deoptimise" sub="rebuild the frame" tone="bad" fs={22} sfs={17} a={frames * E(t, 17)} />
      <HArrow x1={700} x2={732} y={655} a={frames * E(t, 17)} color={PAL.bad} />
      <HArrow x1={970} x2={1004} y={655} a={frames * E(t, 17.5)} color={PAL.bad} />
      <Panel x={1010} y={490} w={814} h={44 + 20 + slots.length * 52} title="interpreter frame · Phases::total" tone="ink" a={frames} />
      {slots.map(([s, n, v], k) => (
        <React.Fragment key={s}>
          <Txt x={1036} y={558 + k * 52} mono fs={17} color={PAL.ink3} a={frames * E(t, 18 + k * 0.4)}>{'slot ' + s}</Txt>
          <Box x={1170} y={546 + k * 52} w={624} h={44} align="left" fs={19} tone={k === 1 || k === 4 || k === 5 ? 'pull' : 'ink'} a={frames * E(t, 18 + k * 0.4)} glow={(k === 1 || k === 4 || k === 5) ? win(t, 25, 31.6) : 0} label={<span>{n}<span style={{ color: PAL.ink2, fontWeight: 400, marginLeft: 18 }}>{v}</span></span>} />
        </React.Fragment>
      ))}
      <Badge x={396} y={858} text="resume in the interpreter at bci 27 · invokeinterface Shape.area" tone="pull" a={frames * E(t, 32)} fs={18} />

      <Term x={96} y={490} w={1100} t={t} a={E(t, 38)} fs={18} lh={36} title="-XX:+PrintCompilation · real" right="abridged" rows={[
        { kind: 'dim', text: '---- Circle + Square', at: 38 },
        { pc: '162  126       3       Square::area (10 bytes)', at: 38.4 },
        { pc: '163   39       4       Phases::total (42 bytes)   made not entrant', at: 38.8, glow: win(t, 39, 52) },
        { pc: '163   38 %     4       Phases::total @ 11 (42 bytes)   made not entrant', at: 39.2 },
        { pc: '163  127       4       Phases::total (42 bytes)', at: 52, glow: win(t, 52.2, 58) },
        { pc: '164  129 %     4       Phases::total @ 11 (42 bytes)', at: 52.6 },
      ]} />
      <Panel x={1230} y={490} w={594} h={284} title="-XX:+LogCompilation · real" tone="bad" a={E(t, 45)}>
        <div style={{ padding: '14px 20px', font: `400 17px ${MONO}`, color: PAL.ink2, lineHeight: 1.6 }}>
          <div>&lt;uncommon_trap reason='<span style={{ color: PAL.bad }}>class_check</span>'</div>
          <div>  action='maybe_recompile'</div>
          <div>  compile_id='<span style={{ color: PAL.pull }}>39</span>' compiler='c2'&gt;</div>
          <div>&lt;jvms bci='<span style={{ color: PAL.pull }}>27</span>'</div>
          <div>  method='Phases total ([LShape;)D'/&gt;</div>
        </div>
      </Panel>
      <Callout x={96} y={800} w={1728} tone="flow" a={win(t, 52, 57.6)} fs={20} text="Compile **127** replaces it: the new profile has two classes, so this time C2 inlines both. Speed is back." />
      <Callout x={96} y={800} w={1728} tone="pull" a={E(t, 58)} fs={20} title="speculate · guard · undo" text="This loop is what lets the JIT be bolder than a static compiler: it optimises for what **has** happened, and can take it back." />
    </React.Fragment>
  );
}

// ── Guards ─────────────────────────────────────────────────────────────────
export function SGuards({ t }) {
  const rows = [
    ['only `Circle` reaches `s.area()`', 'class check before the inlined body', 'class_check'],
    ['this branch is never taken', 'the branch is compiled as a trap', 'unstable_if'],
    ['`s` is never null', 'no check: a hardware fault is the check', 'null_check'],
    ['`Circle.area` is the only `Shape.area`', 'no code at all: a recorded dependency', 'dependency_failed'],
  ];
  const at = [5, 11, 18, 24];
  return (
    <React.Fragment>
      <Table x={96} y={196} cols={[640, 650, 438]} head={['C2 assumes…', 'guarded by…', 'when it fails (log)']} rows={rows} fs={20} rh={64} a={E(t, 0.6)}
        rowA={at.map((s) => E(t, s))} colColors={[PAL.ink, PAL.ink2, PAL.bad]} marks={{ 1: ['pull', win(t, 11, 17.6)], 3: ['violet', win(t, 24, 44)] }} />
      <Panel x={96} y={540} w={1100} h={200} title="-XX:+LogCompilation · when Square loaded (real, abridged)" tone="violet" a={E(t, 30)}>
        <div style={{ padding: '14px 22px', font: `400 18px ${MONO}`, color: PAL.ink2, lineHeight: 1.65 }}>
          <div>&lt;dependency_failed type='<span style={{ color: PAL.violet }}>unique_concrete_method_4</span>'</div>
          <div>    ctxk='Shape' x='<span style={{ color: PAL.ink }}>Circle area ()D</span>' x3='Shape area ()D' …/&gt;</div>
          <div style={{ color: PAL.ink3 }}>“Circle.area was the unique concrete Shape.area”: no longer true</div>
        </div>
      </Panel>
      {[['Square loads', 'pull', 31], ['check dependencies', 'violet', 34], ['invalidate dependents', 'bad', 38]].map(([l, tone, s], i) => (
        <React.Fragment key={l}>
          <Box x={1236} y={540 + i * 72} w={588} h={58} label={l} tone={tone} fs={20} a={E(t, s)} glow={pulse(t, [s], 1)} />
          {i > 0 && <VArrow x={1530} y1={540 + i * 72 - 14} y2={540 + i * 72 - 2} a={E(t, s)} color={toneColor(tone)} />}
        </React.Fragment>
      ))}
      <Callout x={96} y={770} w={1728} tone="bad" a={E(t, 44)} fs={20} title="consequence" text="Loading a class can slow down code that was already fast: a plugin, a lazily created implementation, a mock in a test. Each can deoptimise hot production paths." />
      <Callout x={96} y={880} w={1728} tone="flow" a={E(t, 46)} fs={19} text="A C++ compiler must assume any subclass might exist. The JVM knows what is loaded **now**, and can undo." />
    </React.Fragment>
  );
}

// ── Other optimisations ────────────────────────────────────────────────────
const OPTS = [
  ['loop unrolling', 'for (i = 0; i < n; i++)\n    sum += a[i];', 'for (i = 0; i < n; i += 4) {\n    sum += a[i];   sum += a[i+1];\n    sum += a[i+2]; sum += a[i+3];\n}   // + a short tail loop', 5],
  ['range-check elimination', 'for (i = 0; i < n; i++)\n    check(i < a.length); sum += a[i];', 'check(n <= a.length);    // once\nfor (i = 0; i < n; i++)\n    sum += a[i];', 12],
  ['lock coarsening', 'synchronized (sb) { sb.add(x); }\nsynchronized (sb) { sb.add(y); }', 'synchronized (sb) {\n    sb.add(x);  sb.add(y);\n}', 20],
  ['constant folding', 'double c = 2 * Math.PI * 10;', 'double c = 62.83185307179586;', 27],
  ['loop-invariant hoisting', 'for (i = 0; i < n; i++)\n    sum += a[i] * (scale * k);', 'double f = scale * k;\nfor (i = 0; i < n; i++)\n    sum += a[i] * f;', 33],
  ['dead code elimination', 'double unused = area(r);\nreturn 1;', 'return 1;      // area() never runs', 40],
];
export function SOtherOpts({ t }) {
  return (
    <React.Fragment>
      {OPTS.map(([title, before, after, at], i) => {
        const x = 96 + (i % 3) * 590, y = 196 + Math.floor(i / 3) * 370;
        const dce = i === 5;
        return (
          <React.Fragment key={title}>
            <Panel x={x} y={y} w={558} h={344} title={title} right="sketch" tone={dce ? 'bad' : 'flow'} a={E(t, at)} glow={dce ? win(t, 47, 56) : win(t, at, at + 5) * 0.5} />
            <div style={{ position: 'absolute', left: x + 20, top: y + 58, width: 518, opacity: E(t, at + 0.3) }}>
              {before.split('\n').map((s, k) => <div key={k}>{mono(s, 17)}</div>)}
            </div>
            <div style={{ position: 'absolute', left: x + 20, top: y + 58 + before.split('\n').length * 27 + 12, width: 518, height: 2, background: PAL.line2, opacity: E(t, at + 1) }}></div>
            <div style={{ position: 'absolute', left: x + 20, top: y + 58 + before.split('\n').length * 27 + 26, width: 518, opacity: E(t, at + 1.2), transform: `translateY(${(1 - E(t, at + 1.2)) * 10}px)` }}>
              {after.split('\n').map((s, k) => <div key={k}>{mono(s, 17, k === 0 || !s.startsWith(' ') ? undefined : undefined)}</div>)}
            </div>
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
}
