(() => {
  // src/topics/8.2/scenes1.jsx
  var {
    PAL,
    MOTION,
    lin,
    lerp,
    win,
    pulse,
    step,
    track,
    hlAt,
    clamp,
    hexA,
    MONO,
    SANS,
    Txt,
    Panel,
    Box,
    Code,
    Console,
    HArrow,
    VArrow,
    Arrow,
    Dot,
    Card,
    Node,
    Badge,
    Callout,
    Table,
    Mark,
    Val,
    Brace,
    toneColor
  } = window.AN;
  var E = MOTION.enter;
  var M = MOTION.move;
  var POP = MOTION.pop;
  var GREETER_SRC = [
    "public class Greeter {",
    '    static final String HELLO = "Hello";  // constant',
    "    static int count = 5;",
    "    static {",
    '        System.out.println("  Greeter.<clinit> runs");',
    "    }",
    "    static String greet(String name) {",
    "        count++;",
    '        return HELLO + ", " + name;',
    "    }",
    "}"
  ];
  var MAIN_SRC = [
    "public class Main {",
    "    public static void main(String[] args) {",
    '        System.out.println("main starts");',
    "        Greeter[] arr = new Greeter[3];",
    "        System.out.println(Greeter.HELLO);",
    "        Class<?> c = Greeter.class;",
    '        System.out.println("about to call greet");',
    '        System.out.println(Greeter.greet("Ada"));',
    '        System.out.println("count = " + Greeter.count);',
    "    }",
    "}"
  ];
  function Tok({ t, keys, text, tone = "flow", from, until, w = 220, h = 48, fs = 20, glowAt }) {
    const start = from == null ? keys[0][0] : from;
    if (t < start) return null;
    const [x, y] = track(t, keys);
    let a = E(t, start, 0.25);
    if (until != null) a *= 1 - E(t, until, 0.3);
    if (a <= 0.01) return null;
    const c = toneColor(tone);
    const g = glowAt != null ? pulse(t, [glowAt], 1) : 0;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, boxSizing: "border-box", borderRadius: 10, opacity: a, background: hexA(c, 0.18), border: `2px solid ${c}`, display: "flex", alignItems: "center", justifyContent: "center", font: `600 ${fs}px ${MONO}`, color: PAL.ink, boxShadow: g > 0.01 ? `0 0 ${26 * g}px ${hexA(c, 0.7 * g)}` : "none", whiteSpace: "nowrap" } }, text);
  }
  function StateLane({ t, x, y, states, times, w = 220, h = 70, gap = 20, a = 1, fs = 19, badAt }) {
    const cur = times.filter((ti) => t >= ti).length - 1;
    return states.map((s, i) => {
      const bad = badAt != null && i === states.length - 1;
      const tone = i === cur ? bad ? "bad" : i === states.length - 1 ? "flow" : "pull" : i < cur ? "ink" : "dim";
      return /* @__PURE__ */ React.createElement(Box, { key: s, x: x + i * (w + gap), y, w, h, label: s, fs, tone, a, glow: i === cur ? 0.7 : 0, dashed: i > cur });
    });
  }
  function SIntro({ t }) {
    const Y = 470;
    const ph = [["loading", "find bytes \xB7 make the Class"], ["linking", "verify \xB7 prepare \xB7 resolve"], ["initialisation", "run <clinit>"]];
    const dotY = t < 7 ? null : track(t, [[7, 0, Y + 68], [8.4, 0, Y + 188], [9.8, 0, Y + 308]])[1];
    const st = step(t, [[7.2, "loaded"], [8.6, "linked"], [10, "fully_initialized"]], "");
    const errs = [["VerifyError", "violet"], ["ExceptionInInitializerError", "bad"], ["NoClassDefFoundError", "bad"], ["Greeter cannot be cast to Greeter", "pull"]];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 150, mono: true, fs: 22, weight: 600, color: PAL.pull, a: E(t, 0.3), style: { letterSpacing: "0.14em" } }, "PART 08 \xB7 THE JVM \xB7 8.2"), /* @__PURE__ */ React.createElement(Txt, { x: 92, y: 192, fs: 118, weight: 700, lh: 1, a: E(t, 0.6, 0.9), style: { letterSpacing: "-0.03em", transform: `translateY(${(1 - E(t, 0.6, 0.9)) * 24}px)` } }, "Class loading"), /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 338, fs: 36, color: PAL.ink2, a: E(t, 1.4, 0.8) }, "How code gets into a running JVM, and why it fails so strangely."), /* @__PURE__ */ React.createElement(Code, { x: 96, y: Y, w: 620, h: 370, fs: 17, lh: 27, title: "Greeter.java", a: E(t, 2), lines: GREETER_SRC }), /* @__PURE__ */ React.createElement(HArrow, { x1: 722, x2: 764, y: Y + 68, a: E(t, 6.6), color: PAL.pull }), ph.map(([l, s], i) => /* @__PURE__ */ React.createElement(Box, { key: l, x: 770, y: Y + 20 + i * 120, w: 380, h: 96, label: l, sub: s, fs: 24, sfs: 17, tone: i === 2 ? "pull" : i === 1 ? "violet" : "flow", a: E(t, 6.6 + i * 0.4), glow: pulse(t, [7.2 + i * 1.4], 1.2) })), /* @__PURE__ */ React.createElement(VArrow, { x: 960, y1: Y + 118, y2: Y + 138, a: E(t, 7), color: PAL.ink3 }), /* @__PURE__ */ React.createElement(VArrow, { x: 960, y1: Y + 238, y2: Y + 258, a: E(t, 7.4), color: PAL.ink3 }), dotY != null && t < 10.2 && /* @__PURE__ */ React.createElement(Dot, { x: 1176, y: dotY, r: 9, color: PAL.pull }), /* @__PURE__ */ React.createElement(HArrow, { x1: 1156, x2: 1214, y: Y + 308, a: E(t, 10), color: PAL.pull }), /* @__PURE__ */ React.createElement(Panel, { x: 1220, y: Y, w: 604, h: 370, title: "JVM", right: "a live class", a: E(t, 2.6), tone: "flow" }, /* @__PURE__ */ React.createElement("div", { style: { padding: "20px 24px", font: `500 22px ${MONO}`, color: PAL.ink2, lineHeight: 1.9 } }, /* @__PURE__ */ React.createElement("div", null, "class   ", /* @__PURE__ */ React.createElement("span", { style: { color: t > 7.2 ? PAL.ink : PAL.ink3 } }, t > 7.2 ? "Greeter" : "\u2014")), /* @__PURE__ */ React.createElement("div", null, "state   ", /* @__PURE__ */ React.createElement("span", { style: { color: st === "fully_initialized" ? PAL.flow : PAL.pull } }, st || "\u2014")), /* @__PURE__ */ React.createElement("div", null, "count   ", /* @__PURE__ */ React.createElement("span", { style: { color: PAL.ink } }, t < 8.6 ? "\u2014" : t < 10 ? "0" : "5")), /* @__PURE__ */ React.createElement("div", { style: { color: PAL.flow, opacity: E(t, 10.4) } }, ">   Greeter.<clinit> runs"))), errs.map(([e, tone], i) => /* @__PURE__ */ React.createElement(Badge, { key: e, x: [250, 640, 1080, 1520][i], y: 898, text: e, tone, fs: 18, a: POP(t, 12.8 + i * 0.5) })));
  }
  var PH = [
    { x: 96, w: 300, label: "loading", at: 5, tone: "flow", desc: "Find the `.class` bytes, parse them, create the `Class` object.", ex: "Greeter.class \u2192 Class" },
    { x: 470, w: 300, label: "verify", at: 11.5, tone: "violet", desc: "Prove the bytecode is well-formed and type-safe.", ex: "bytecode \u2713" },
    { x: 792, w: 300, label: "prepare", at: 18, tone: "violet", desc: "Allocate static fields, set to **defaults**: `0`, `null`, `false`.", ex: "count = 0" },
    { x: 1114, w: 300, label: "resolve", at: 25, tone: "violet", desc: "Symbolic references become direct ones. Lazily, on first use.", ex: "#7 \u2192 count field" },
    { x: 1488, w: 336, label: "initialisation", at: 31.5, tone: "pull", desc: "Run `<clinit>`: static initialisers and static field assignments.", ex: "count = 5" }
  ];
  function SPhases({ t }) {
    const cur = PH.filter((p) => t >= p.at).length - 1;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel, { x: 436, y: 208, w: 1012, h: 190, title: "linking", tone: "violet", a: E(t, 1.4), glow: cur >= 1 && cur <= 3 && t < 37 ? 0.5 : 0 }), PH.map((p, i) => {
      const inLink = i >= 1 && i <= 3;
      const y = inLink ? 272 : 262, h = inLink ? 100 : 120;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: p.label }, /* @__PURE__ */ React.createElement(Box, { x: p.x, y, w: p.w, h, label: p.label, fs: 26, tone: i <= cur ? p.tone : "dim", a: E(t, 0.8 + i * 0.2), glow: i === cur && t < 37 ? 0.8 : 0, s: i === cur && t < 37 ? 1.03 : 1 }), /* @__PURE__ */ React.createElement(Txt, { x: p.x + 4, y: 422, w: p.w - 8, fs: 22, color: i === cur && t < 37 ? PAL.ink : PAL.ink2, a: E(t, p.at + 0.3) }, p.desc), /* @__PURE__ */ React.createElement(Box, { x: p.x, y: 540, w: p.w, h: 60, label: p.ex, fs: 19, tone: p.tone, fill: true, a: E(t, p.at + 1.2), glow: pulse(t, [p.at + 1.3], 1.2) }));
    }), /* @__PURE__ */ React.createElement(HArrow, { x1: 400, x2: 432, y: 322, a: E(t, 1.2), color: PAL.ink2 }), /* @__PURE__ */ React.createElement(HArrow, { x1: 1452, x2: 1484, y: 322, a: E(t, 1.2), color: PAL.ink2 }), /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 228, mono: true, fs: 17, color: PAL.ink3, a: E(t, 1) }, "ALWAYS IN THIS ORDER"), /* @__PURE__ */ React.createElement(Code, { x: 96, y: 640, w: 540, h: 110, title: "Greeter.java", fs: 24, lh: 36, a: E(t, 37.5), lines: ["static int count = 5;"] }), /* @__PURE__ */ React.createElement(HArrow, { x1: 644, x2: 700, y: 695, a: E(t, 38.2), color: PAL.ink3 }), /* @__PURE__ */ React.createElement(Box, { x: 706, y: 640, w: 460, h: 110, label: "count = 0", sub: "after prepare \xB7 the default", fs: 30, tone: "violet", a: E(t, 38.4), glow: pulse(t, [38.6], 1.2) }), /* @__PURE__ */ React.createElement(HArrow, { x1: 1174, x2: 1300, y: 695, a: E(t, 40), color: PAL.pull, label: "<clinit>", lfs: 17 }), /* @__PURE__ */ React.createElement(Box, { x: 1306, y: 640, w: 518, h: 110, label: "count = 5", sub: "after initialisation \xB7 your value", fs: 30, tone: "pull", a: E(t, 40.2), glow: pulse(t, [40.4], 1.2) }), /* @__PURE__ */ React.createElement(Callout, { x: 96, y: 790, w: 1728, tone: "pull", a: E(t, 41), fs: 22, text: "Between those two moments the field exists and holds `0`. That gap is real, and code can observe it." }));
  }
  var TL_P = [[5, "load"], [19, "verify"], [25, "prepare"], [32, "resolve"], [38, "initialise"]];
  var CLINIT = [" 0: iconst_5", " 1: putstatic     #7   // Field count:I", " 4: getstatic     #17  // System.out", ' 7: ldc           #23  // "  Greeter.<clinit> runs"', " 9: invokevirtual #25  // println", "12: return"];
  function STimeline({ t }) {
    const cur = TL_P.filter((p) => t >= p[0]).length - 1;
    const [hl, hA] = hlAt(t, [[40.5, 0], [43, 1], [49.5, 2], [50.5, 3], [51.5, 4], [53, 5], [55, -1]]);
    const resolved = t >= 44;
    const count = t < 45 ? "0" : "5";
    const st = step(t, [[6.5, "loaded"], [26, "linked"], [38.5, "being_initialized"], [54.5, "fully_initialized"]], "\u2014");
    const srcTone = (i) => {
      if (i === 2 && t >= 25 && t < 32) return { tone: "violet", toneA: 1 };
      if ((i === 2 || i >= 3 && i <= 5) && t >= 38) return { tone: "pull", toneA: t < 55 ? 1 : 0.4 };
      return {};
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, TL_P.map(([at, l], i) => /* @__PURE__ */ React.createElement(Box, { key: l, x: 96 + i * 349, y: 194, w: 330, h: 56, label: `${i + 1} \xB7 ${l}`, fs: 20, tone: i === cur ? i === 4 ? "pull" : i === 0 ? "flow" : "violet" : i < cur ? "ink" : "dim", dashed: i > cur, a: E(t, 0.6 + i * 0.12), glow: i === cur ? 0.7 : 0 })), /* @__PURE__ */ React.createElement(Code, { x: 96, y: 276, w: 640, h: 356, title: "Greeter.java", a: E(t, 1), fs: 17, lh: 26, lines: GREETER_SRC.map((s, i) => ({ s, ...srcTone(i) })) }), /* @__PURE__ */ React.createElement(Code, { x: 96, y: 652, w: 640, h: 250, title: "<clinit> \xB7 javap -c (comments shortened)", lang: "bytecode", a: E(t, 7.6) * (0.45 + 0.55 * E(t, 38.3)), fs: 17, lh: 30, hl, hlA: hA, lines: CLINIT }), /* @__PURE__ */ React.createElement(Panel, { x: 780, y: 276, w: 560, h: 444, title: "metaspace", right: "class metadata", tone: "violet", a: E(t, 5) }), /* @__PURE__ */ React.createElement(Tok, { t, keys: [[5.2, 760, 300], [6.4, 1060, 360]], text: "Greeter.class \xB7 1039 B", w: 300, tone: "flow", until: 6.4 }), /* @__PURE__ */ React.createElement(Box, { x: 804, y: 334, w: 512, h: 58, label: "InstanceKlass \xB7 Greeter", fs: 21, tone: "violet", a: E(t, 6.4), glow: pulse(t, [6.5], 1.2) }), /* @__PURE__ */ React.createElement(Txt, { x: 808, y: 414, mono: true, fs: 16, color: PAL.ink3, a: E(t, 7) }, "CONSTANT POOL (excerpt)"), /* @__PURE__ */ React.createElement(Txt, { x: 808, y: 440, mono: true, fs: 19, color: PAL.ink, a: E(t, 7) }, "#7 Fieldref Greeter.count:I"), /* @__PURE__ */ React.createElement(Badge, { x: 1256, y: 452, text: resolved ? "resolved" : "symbolic", tone: resolved ? "flow" : "pull", fs: 17, a: E(t, 7.2), s: 1 + 0.15 * pulse(t, [44], 1) + 0.1 * pulse(t, [32.3], 1) }), /* @__PURE__ */ React.createElement(Txt, { x: 808, y: 494, mono: true, fs: 16, color: PAL.ink3, a: E(t, 7.4) }, "METHODS"), /* @__PURE__ */ React.createElement(Txt, { x: 808, y: 520, mono: true, fs: 19, color: PAL.ink, a: E(t, 7.4) }, "<clinit>()V \xB7 greet(String)"), /* @__PURE__ */ React.createElement(Badge, { x: 1256, y: 532, text: "verified \u2713", tone: "flow", fs: 17, a: POP(t, 20.5) }), /* @__PURE__ */ React.createElement(Txt, { x: 808, y: 574, mono: true, fs: 16, color: PAL.ink3, a: E(t, 7.8) }, "FIELDS"), /* @__PURE__ */ React.createElement(Txt, { x: 808, y: 600, mono: true, fs: 19, color: PAL.ink, a: E(t, 7.8) }, 'HELLO  ConstantValue "Hello"'), /* @__PURE__ */ React.createElement(Txt, { x: 808, y: 630, mono: true, fs: 19, color: PAL.ink, a: E(t, 7.8) }, "count  int"), /* @__PURE__ */ React.createElement(Txt, { x: 808, y: 678, mono: true, fs: 18, color: PAL.ink2, a: E(t, 6.6) }, "state: ", /* @__PURE__ */ React.createElement("span", { style: { color: st === "fully_initialized" ? PAL.flow : st === "being_initialized" ? PAL.pull : PAL.violet } }, st)), /* @__PURE__ */ React.createElement(Panel, { x: 1380, y: 276, w: 444, h: 444, title: "heap", tone: "flow", a: E(t, 12) }), /* @__PURE__ */ React.createElement(Box, { x: 1404, y: 334, w: 396, h: 90, label: "java.lang.Class", sub: "the mirror of Greeter", fs: 22, tone: "flow", a: E(t, 12.4), glow: pulse(t, [12.6], 1.2) }), /* @__PURE__ */ React.createElement(Arrow, { from: [1318, 363], to: [1400, 372], draw: M(t, 12.8, 0.6), color: PAL.flow }), /* @__PURE__ */ React.createElement(Txt, { x: 1404, y: 456, mono: true, fs: 17, color: PAL.ink3, a: E(t, 25.3) }, "STATIC FIELDS \xB7 stored in the mirror"), /* @__PURE__ */ React.createElement(Box, { x: 1404, y: 488, w: 396, h: 90, label: `count = ${count}`, sub: t < 45 ? "zeroed by prepare" : "set by <clinit>", fs: 30, tone: t < 45 ? "violet" : "pull", a: E(t, 25.5), glow: pulse(t, [25.6, 45], 1.2) }), /* @__PURE__ */ React.createElement(Txt, { x: 1602, y: 600, anchor: "mid", w: 380, align: "center", fs: 18, color: PAL.ink2, a: E(t, 26.5) }, "Greeter.class == the mirror you get in Java"), /* @__PURE__ */ React.createElement(Console, { x: 780, y: 746, w: 1044, h: 156, t, title: "stdout", a: E(t, 1.5), items: [{ at: 52, text: "  Greeter.<clinit> runs", kind: "ok" }] }));
  }
  var GAP_SRC = [
    "public class Greeter {",
    "    static final Greeter DEFAULT = new Greeter();  // runs first",
    "    static int count = 5;",
    "    Greeter() {",
    '        System.out.println("constructor sees count = " + count);',
    "    }",
    "}"
  ];
  var GAP_CL = [" 0: new           #14  // class Greeter", " 3: dup", ' 4: invokespecial #29  // "<init>":()V', " 7: putstatic     #30  // DEFAULT", "10: iconst_5", "11: putstatic     #13  // count", "14: return"];
  function SPrepareGap({ t }) {
    const [hl, hA] = hlAt(t, [[12.5, 0], [14, 1], [15.5, 2], [24.5, 3], [26, 4], [27.5, 5], [30, 6], [31.5, -1]]);
    const srcHl = (i) => i === 1 && t >= 12.5 && t < 26 ? { tone: "pull" } : i === 4 && t >= 18.5 && t < 26 ? { tone: "violet" } : i === 2 && t >= 26 && t < 32 ? { tone: "pull" } : {};
    const def = t < 24.8 ? "null" : "\u2192 Greeter@\u2026";
    const cnt = t < 28 ? "0" : "5";
    const inCtor = t >= 16 && t < 24.5;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code, { x: 96, y: 196, w: 900, h: 296, title: "Greeter.java", a: E(t, 0.5), fs: 18, lh: 32, lines: GAP_SRC.map((s, i) => ({ s, ...srcHl(i) })) }), /* @__PURE__ */ React.createElement(Code, { x: 96, y: 516, w: 900, h: 296, title: "<clinit> \xB7 javap -c", lang: "bytecode", a: E(t, 11.5), fs: 18, lh: 32, hl, hlA: hA, lines: GAP_CL }), /* @__PURE__ */ React.createElement(Badge, { x: 760, y: 660, text: "constructor running\u2026", tone: "violet", fs: 17, a: win(t, 16, 24.5) }), /* @__PURE__ */ React.createElement(Panel, { x: 1040, y: 196, w: 784, h: 330, title: "Greeter mirror \xB7 static fields", tone: "flow", a: E(t, 6.5) }), /* @__PURE__ */ React.createElement(Txt, { x: 1070, y: 262, mono: true, fs: 17, color: PAL.ink3, a: E(t, 7) }, "AFTER PREPARE: DEFAULTS"), /* @__PURE__ */ React.createElement(Box, { x: 1070, y: 300, w: 724, h: 86, align: "left", label: /* @__PURE__ */ React.createElement("span", null, "DEFAULT ", /* @__PURE__ */ React.createElement("span", { style: { color: PAL.ink3 } }, "="), " ", def), fs: 26, tone: t < 24.8 ? "violet" : "flow", a: E(t, 7), glow: pulse(t, [24.8], 1.2) }), /* @__PURE__ */ React.createElement(Box, { x: 1070, y: 404, w: 724, h: 86, align: "left", label: /* @__PURE__ */ React.createElement("span", null, "count ", /* @__PURE__ */ React.createElement("span", { style: { color: PAL.ink3 } }, "="), " ", cnt), fs: 26, tone: t < 28 ? "violet" : "pull", a: E(t, 7.4), glow: pulse(t, [20, 28], 1.4), s: inCtor && t > 19 ? 1.02 : 1 }), /* @__PURE__ */ React.createElement(Badge, { x: 1640, y: 447, text: "read here \u2192 0", tone: "bad", fs: 17, a: win(t, 19.5, 27.5) }), /* @__PURE__ */ React.createElement(Console, { x: 1040, y: 556, w: 784, h: 190, t, a: E(t, 31.5), items: [{ at: 32, text: "java Main", kind: "cmd" }, { at: 32.8, text: "constructor sees count = 0", kind: "err" }, { at: 33.4, text: "after init, count = 5", kind: "ok" }] }), /* @__PURE__ */ React.createElement(Callout, { x: 1040, y: 770, w: 784, tone: "pull", a: E(t, 38), fs: 20, text: "Static initialisers run **top to bottom**. Anything that reads a static before its line runs sees the default." }));
  }
  var LOGP = "file:\u2026/lazy/";
  var LAZY_LOG = [
    [1, "java -Xlog:class+load,class+init Main", "cmd"],
    [6.3, `[0.019s][info][class,load] Main source: ${LOGP}`, "dim"],
    [6.9, "[0.019s][info][class,init] Start class verification for: Main", "dim"],
    [7.3, "[0.019s][info][class,init] End class verification for: Main", "dim"],
    [8, "[0.019s][info][class,init] 288 Initializing 'Main'(no method) (0x0000000401000800)", "dim"],
    [13.3, "main starts"],
    [19.4, `[0.019s][info][class,load] Greeter source: ${LOGP}`, "ok"],
    [26.6, "Hello"],
    [40, "about to call greet"],
    [41.2, "[0.020s][info][class,init] Start class verification for: Greeter", "ok"],
    [41.7, "[0.020s][info][class,init] End class verification for: Greeter", "ok"],
    [42.6, "[0.020s][info][class,init] 292 Initializing 'Greeter' (0x0000000401000a08)", "ok"],
    [53.3, "  Greeter.<clinit> runs"],
    [54.2, "Hello, Ada"],
    [55.2, "count = 6"]
  ];
  function SLazyLog({ t }) {
    const [hl, hA] = hlAt(t, [[6, 1], [13, 2], [18.5, 3], [26, 4], [33.5, 5], [39.5, 6], [40.6, 7], [55, 8], [58, -1]]);
    const [bl, bA] = hlAt(t, [[18.5, 0], [26, 1], [33.5, 2], [40.6, 3], [55, 4], [58, -1]]);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code, { x: 96, y: 196, w: 740, h: 442, title: "Main.java", a: E(t, 0.4), fs: 18, lh: 34, hl, hlA: hA, lines: MAIN_SRC }), /* @__PURE__ */ React.createElement(
      Code,
      {
        x: 96,
        y: 660,
        w: 740,
        h: 232,
        title: "javap -c Main (the lines that name Greeter)",
        lang: "bytecode",
        a: E(t, 18),
        fs: 17,
        lh: 32,
        hl: bl,
        hlA: bA,
        lines: [" 9: anewarray     #21  // class Greeter", "16: ldc           #23  // String Hello", "21: ldc           #21  // class Greeter", "37: invokestatic  #29  // Method Greeter.greet", "46: getstatic     #33  // Field Greeter.count:I"]
      }
    ), /* @__PURE__ */ React.createElement(Badge, { x: 700, y: 782, text: "constant copied in", tone: "pull", fs: 17, a: win(t, 27, 33.3) }), /* @__PURE__ */ React.createElement(Console, { x: 880, y: 196, w: 944, h: 486, t, a: E(t, 0.8), fs: 17, lh: 27, items: LAZY_LOG.map(([at, text, kind]) => ({ at, text, kind })) }), /* @__PURE__ */ React.createElement(Txt, { x: 880, y: 704, mono: true, fs: 17, color: PAL.ink3, a: E(t, 12) }, "GREETER"), /* @__PURE__ */ React.createElement(StateLane, { t, x: 880, y: 734, w: 221, h: 66, fs: 19, a: E(t, 12), states: ["not loaded", "loaded", "linked", "initialised"], times: [0, 19.4, 41.7, 42.6] }), /* @__PURE__ */ React.createElement(Callout, { x: 880, y: 824, w: 944, tone: "flow", a: E(t, 58.5), fs: 19, text: "**497** classes load for this tiny program; 485 come from the CDS archive (`shared objects file`). Yours load on demand." }));
  }
  var RES_SRC = [
    "public class Main {",
    "    public static void main(String[] args) {",
    '        System.out.println("main starts");',
    "        if (args.length > 0) {",
    '            System.out.println(Greeter.greet("Ada"));',
    "        }",
    '        System.out.println("main ends");',
    "    }",
    "}"
  ];
  function SLazyResolve({ t }) {
    const lines = RES_SRC.map((s, i) => i === 4 ? { s, tone: t >= 14 ? "bad" : "violet", toneA: win(t, 7, 12.8) + E(t, 14) * (1 - E(t, 27.5)) } : s);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code, { x: 96, y: 196, w: 880, h: 374, title: "Main.java", a: E(t, 0.4), fs: 19, lh: 34, lines }), /* @__PURE__ */ React.createElement(Badge, { x: 880, y: 405, text: "never runs", tone: "violet", fs: 17, a: win(t, 7.5, 12.8) }), /* @__PURE__ */ React.createElement(Badge, { x: 880, y: 405, text: "runs \u2192 resolve", tone: "bad", fs: 17, a: win(t, 14.3, 27.5) }), /* @__PURE__ */ React.createElement(Box, { x: 1020, y: 196, w: 380, h: 80, label: "Main.class", tone: "flow", a: E(t, 2), fs: 22 }), /* @__PURE__ */ React.createElement(Box, { x: 1444, y: 196, w: 380, h: 80, label: "Greeter.class", sub: t > 3.6 ? "$ rm Greeter.class" : "", tone: t > 3.6 ? "bad" : "flow", dashed: t > 3.6, strike: t > 3.6, a: E(t, 2.3), glow: pulse(t, [3.6], 1.2), fs: 22 }), /* @__PURE__ */ React.createElement(Console, { x: 1020, y: 300, w: 804, h: 196, t, a: E(t, 6.5), items: [{ at: 6.8, text: "java Main", kind: "cmd" }, { at: 8, text: "main starts" }, { at: 8.6, text: "main ends", kind: "ok" }] }), /* @__PURE__ */ React.createElement(Mark, { x: 1790, y: 346, ok: true, a: POP(t, 9) }), /* @__PURE__ */ React.createElement(Console, { x: 1020, y: 520, w: 804, h: 226, t, title: "terminal \xB7 first lines", a: E(t, 14), fs: 17, items: [
      { at: 14.3, text: "java Main go", kind: "cmd" },
      { at: 15.2, text: "main starts" },
      { at: 21, text: 'Exception in thread "main" java.lang.NoClassDefFoundError: Greeter', kind: "err" },
      { at: 21.6, text: "	at Main.main(Main.java:5)", kind: "err" }
    ] }), /* @__PURE__ */ React.createElement(Mark, { x: 1790, y: 566, ok: false, a: POP(t, 21.2) }), /* @__PURE__ */ React.createElement(Box, { x: 96, y: 604, w: 880, h: 150, align: "left", label: "18: invokestatic #23 // Greeter.greet", sub: t < 14 ? "symbolic until the first time it executes" : "executes \u2192 resolve \u2192 load Greeter \u2192 not found", fs: 22, sfs: 18, tone: t < 14 ? "violet" : "bad", a: E(t, 10), glow: pulse(t, [16.5], 1.2) }), /* @__PURE__ */ React.createElement(Callout, { x: 96, y: 790, w: 1728, tone: "pull", a: E(t, 28), fs: 22, text: "A missing class is not a startup error. It fails the **first time a line that needs it executes**, maybe hours into a run." }));
  }

  // src/topics/8.2/scenes2.jsx
  var {
    PAL: PAL2,
    MOTION: MOTION2,
    lin: lin2,
    lerp: lerp2,
    win: win2,
    pulse: pulse2,
    step: step2,
    track: track2,
    hlAt: hlAt2,
    clamp: clamp2,
    hexA: hexA2,
    MONO: MONO2,
    SANS: SANS2,
    Txt: Txt2,
    Panel: Panel2,
    Box: Box2,
    Code: Code2,
    Console: Console2,
    HArrow: HArrow2,
    VArrow: VArrow2,
    Arrow: Arrow2,
    Dot: Dot2,
    Card: Card2,
    Node: Node2,
    Badge: Badge2,
    Callout: Callout2,
    Table: Table2,
    Mark: Mark2,
    Val: Val2,
    Brace: Brace2,
    Bytes,
    toneColor: toneColor2
  } = window.AN;
  var E2 = MOTION2.enter;
  var M2 = MOTION2.move;
  var POP2 = MOTION2.pop;
  var CHECKS = [
    [6, "the operand stack never under- or overflows", "its depth stays within max_stack on every path"],
    [11.5, "types match on every path", "no int used as a reference, no reference used as an int"],
    [18, "final is respected", "no subclass of a final class, no stray writes to final fields"],
    [19, "jumps land on instruction boundaries", "never into the middle of an instruction"],
    [20, "locals are assigned before use", "no reading a slot that was never written"]
  ];
  function SVerifyChecks({ t }) {
    const blocked = t > 9 && t < 25;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, CHECKS.map(([at, l, s], i) => /* @__PURE__ */ React.createElement(Box2, { key: l, x: 96, y: 196 + i * 112, w: 900, h: 96, align: "left", label: l, sub: s, mono: false, fs: 25, sfs: 19, tone: i === 1 ? "pull" : "flow", a: E2(t, at), glow: pulse2(t, [at + 0.1], 1.2) })), /* @__PURE__ */ React.createElement(Box2, { x: 1100, y: 196, w: 724, h: 80, label: "untrusted .class bytes", sub: "from disk, network, a generator\u2026", fs: 22, tone: "ink", a: E2(t, 1) }), /* @__PURE__ */ React.createElement(VArrow2, { x: 1462, y1: 280, y2: 330, a: E2(t, 1.4), color: PAL2.ink2 }), /* @__PURE__ */ React.createElement(Box2, { x: 1100, y: 334, w: 724, h: 100, label: "verifier", sub: "runs once per class, at link time", fs: 30, tone: "pull", a: E2(t, 1.6), glow: 0.3 + 0.5 * pulse2(t, [6, 11.5, 18], 1.2) }), /* @__PURE__ */ React.createElement(VArrow2, { x: 1350, y1: 438, y2: 494, a: E2(t, 2.4), color: PAL2.flow, label: "proven safe", lfs: 17 }), /* @__PURE__ */ React.createElement(Box2, { x: 1100, y: 498, w: 500, h: 80, label: "JVM executes it", fs: 22, tone: "flow", a: E2(t, 2.6) }), /* @__PURE__ */ React.createElement(VArrow2, { x: 1712, y1: 438, y2: 516, a: E2(t, 3), color: PAL2.bad, label: "rejected", lfs: 17 }), /* @__PURE__ */ React.createElement(Badge2, { x: 1740, y: 538, text: "VerifyError", tone: "bad", fs: 17, a: E2(t, 3.2), s: blocked ? 1 + 0.08 * Math.sin(t * 6) : 1 }), ["cannot forge a reference", "cannot read arbitrary memory", "cannot escape the type system"].map((s, i) => /* @__PURE__ */ React.createElement(Badge2, { key: s, x: 1100, y: 624 + i * 46, anchor: "left", text: "\u2717 " + s, tone: "violet", fs: 18, a: E2(t, 25.5 + i * 0.7) })), /* @__PURE__ */ React.createElement(Console2, { x: 96, y: 780, w: 1728, h: 158, t, a: E2(t, 32), fs: 17, lh: 30, items: [
      { at: 32.3, text: "java -XX:+UnlockDiagnosticVMOptions -XX:+PrintFlagsFinal -version | grep BytecodeVerification", kind: "cmd" },
      { at: 33.2, text: "     bool BytecodeVerificationLocal                = false                                  {diagnostic} {default}", kind: "dim" },
      { at: 33.6, text: "     bool BytecodeVerificationRemote               = true                                   {diagnostic} {default}", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(Badge2, { x: 1460, y: 881, anchor: "left", text: "\u2190 boot loader: trusted", tone: "pull", fs: 17, a: E2(t, 35) }), /* @__PURE__ */ React.createElement(Badge2, { x: 1460, y: 911, anchor: "left", text: "\u2190 every other loader: verified", tone: "flow", fs: 17, a: E2(t, 36) }));
  }
  var BAD_SRC = ["public class Bad {", "    static int twice(String s, int x) {", "        return x + x;", "    }", "    public static void main(String[] args) {", '        System.out.println(twice("hi", 21));', "    }", "}"];
  function SVerifyError({ t }) {
    const patched = t >= 9;
    const [hl, hA] = hlAt2(t, [[1.5, 0], [3, 1], [4.5, 2], [6, 3], [7, -1], [20.8, 0], [23, 1], [25.2, 2]]);
    const left = 1 - E2(t, 41.2, 0.5);
    const fail = t >= 26;
    const shake = t > 25.6 && t < 26.6 ? Math.sin(t * 60) * 6 * (26.6 - t) : 0;
    const steps = [["0: aload_0", "push String", 20.8], ["1: iload_1", "push int", 23], ["2: iadd", "needs int, int", 25.2]];
    const dv = 1 - 0.75 * E2(t, 41.5);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 196, w: 760, h: 308, title: "Bad.java", a: E2(t, 0.4), fs: 18, lh: 30, lines: BAD_SRC.map((s, i) => i === 2 ? { s, tone: "pull", toneA: win2(t, 1, 8) } : s) }), /* @__PURE__ */ React.createElement(
      Code2,
      {
        x: 96,
        y: 524,
        w: 760,
        h: 204,
        title: "javap -c \xB7 twice",
        lang: "bytecode",
        a: E2(t, 1) * left,
        fs: 22,
        lh: 34,
        hl,
        hlA: hA,
        lines: [patched ? { s: "0: aload_0      // patched", tone: "bad" } : "0: iload_1", "1: iload_1", "2: iadd", "3: ireturn"]
      }
    ), /* @__PURE__ */ React.createElement(Bytes, { x: 96, y: 750, unit: 120, h: 72, ruler: false, a: E2(t, 7) * left, fs: 24, sfs: 17, cells: [
      { n: 1, label: patched ? "2a" : "1b", sub: patched ? "aload_0" : "iload_1", tone: patched ? "bad" : "flow", glow: pulse2(t, [9], 1.2) },
      { n: 1, label: "1b", sub: "iload_1", tone: "flow" },
      { n: 1, label: "60", sub: "iadd", tone: "pull" },
      { n: 1, label: "ac", sub: "ireturn", tone: "pink" }
    ] }), /* @__PURE__ */ React.createElement(Txt2, { x: 600, y: 770, mono: true, fs: 18, color: PAL2.ink2, w: 250, a: E2(t, 9.4) * left }, "one byte changed in Bad.class"), /* @__PURE__ */ React.createElement("div", { style: { opacity: dv } }, /* @__PURE__ */ React.createElement(Panel2, { x: 900, y: 196, w: 924, h: 380, title: "verifier \xB7 tracks types, not values", tone: "pull", a: E2(t, 14) }), /* @__PURE__ */ React.createElement(Txt2, { x: 930, y: 258, mono: true, fs: 16, color: PAL2.ink3, a: E2(t, 15) }, "LOCALS AT ENTRY"), /* @__PURE__ */ React.createElement(Box2, { x: 930, y: 286, w: 200, h: 64, label: "String", sub: "slot 0 \xB7 s", fs: 21, sfs: 17, tone: "violet", a: E2(t, 15.4) }), /* @__PURE__ */ React.createElement(Box2, { x: 1146, y: 286, w: 200, h: 64, label: "int", sub: "slot 1 \xB7 x", fs: 21, sfs: 17, tone: "flow", a: E2(t, 15.8) }), /* @__PURE__ */ React.createElement(Txt2, { x: 930, y: 384, mono: true, fs: 16, color: PAL2.ink3, a: E2(t, 16) }, "OPERAND STACK"), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 930, top: 414, width: 420, height: 84, border: `1.5px dashed ${PAL2.line2}`, borderRadius: 12, opacity: E2(t, 16) } }), /* @__PURE__ */ React.createElement(Tok, { t, keys: [[20.9, 1030, 318], [21.8, 1030 + shake, 456]], text: "String", tone: fail ? "bad" : "violet", w: 180, glowAt: fail ? 26 : null }), /* @__PURE__ */ React.createElement(Tok, { t, keys: [[23.1, 1246, 318], [24, 1246, 456]], text: "int", tone: "flow", w: 180 }), steps.map(([ins, what, at], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: ins }, /* @__PURE__ */ React.createElement(Txt2, { x: 1400, y: 262 + i * 64, mono: true, fs: 20, weight: 600, color: i === 2 && fail ? PAL2.bad : PAL2.pull, a: E2(t, at) }, ins), /* @__PURE__ */ React.createElement(Txt2, { x: 1580, y: 264 + i * 64, mono: true, fs: 18, color: PAL2.ink2, a: E2(t, at + 0.3) }, what))), /* @__PURE__ */ React.createElement(Mark2, { x: 1790, y: 402, ok: false, a: POP2(t, 26) }), /* @__PURE__ */ React.createElement(Txt2, { x: 1400, y: 450, w: 400, fs: 19, color: PAL2.bad, a: E2(t, 26.4) }, "stack holds { String, int }: rejected")), /* @__PURE__ */ React.createElement(Badge2, { x: 1362, y: 386, text: "verifier switched off", tone: "bad", fs: 22, solid: true, a: POP2(t, 42) }), /* @__PURE__ */ React.createElement(Console2, { x: 900, y: 596, w: 924, h: 276, t, a: E2(t, 26.5) * left, fs: 17, lh: 25, items: [
      { at: 26.6, text: "java Bad", kind: "cmd" },
      { at: 27.2, text: "Error: Unable to initialize main class Bad", kind: "err" },
      { at: 27.6, text: "Caused by: java.lang.VerifyError: Bad type on operand stack", kind: "err" },
      { at: 28, text: "Exception Details:" },
      { at: 28.2, text: "  Location:" },
      { at: 28.4, text: "    Bad.twice(Ljava/lang/String;I)I @2: iadd", kind: "ok" },
      { at: 28.6, text: "  Reason:" },
      { at: 28.8, text: "    Type 'java/lang/String' (current frame, stack[0]) is not assignable to integer", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(Console2, { x: 96, y: 600, w: 1728, h: 172, t, a: E2(t, 41.5), fs: 17, lh: 26, items: [
      { at: 42, text: "java -Xverify:none Bad", kind: "cmd" },
      { at: 43, text: "OpenJDK 64-Bit Server VM warning: Options -Xverify:none and -noverify were deprecated in JDK 13 and will likely be removed in a future release.", kind: "dim" },
      { at: 48, text: "-2014206267", kind: "err" }
    ] }), /* @__PURE__ */ React.createElement(Callout2, { x: 96, y: 796, w: 1728, tone: "bad", a: E2(t, 49), fs: 21, title: "what just happened", text: "`iadd` added the `String` reference's raw bits to 21 and printed the result. A reference was read as a number. The verifier exists so that can never happen." }));
  }
  var TRIG = [
    [4.5, "1", "an instance is created", "new Greeter()", "new"],
    [10, "2", "a static method is called", 'Greeter.greet("Ada")', "invokestatic"],
    [15, "3", "a static field is read or written", "Greeter.count++", "getstatic \xB7 putstatic"],
    [22, "4", "a subclass is initialised", "new Sub()  // Base goes first", "superclass first, up to Object"],
    [28.5, "5", "it is the main class", "java Main", "before main() runs"],
    [34, "6", "reflection asks for it", 'Class.forName("Greeter")', "forName \xB7 newInstance \xB7 invoke"]
  ];
  function STriggers({ t }) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, TRIG.map(([at, n, title, code, bc], i) => {
      const x = 96 + i % 3 * 584, y = 196 + Math.floor(i / 3) * 312;
      const a = E2(t, at);
      const isInsn = i < 3;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: n }, /* @__PURE__ */ React.createElement(Panel2, { x, y, w: 560, h: 292, a, tone: isInsn ? "pull" : "flow", glow: win2(t, at, at + 5.5) * 0.8 + (isInsn ? win2(t, 40, 48) * 0.6 : 0) }), /* @__PURE__ */ React.createElement(Txt2, { x: x + 26, y: y + 22, mono: true, fs: 20, weight: 600, color: isInsn ? PAL2.pull : PAL2.flow, a }, n), /* @__PURE__ */ React.createElement(Txt2, { x: x + 26, y: y + 54, fs: 28, weight: 600, w: 510, a }, title), /* @__PURE__ */ React.createElement(Box2, { x: x + 26, y: y + 140, w: 508, h: 60, align: "left", label: /* @__PURE__ */ React.createElement("span", null, window.AN.hiJava(code)), fs: 20, a }), /* @__PURE__ */ React.createElement(Badge2, { x: x + 26, y: y + 246, anchor: "left", text: bc, tone: isInsn ? "pull" : "flow", fs: 17, a: E2(t, at + 0.6) }));
    }), /* @__PURE__ */ React.createElement(Badge2, { x: 1562, y: 442, anchor: "left", text: "\u2717 not for constants", tone: "bad", fs: 17, a: E2(t, 18) }), /* @__PURE__ */ React.createElement(Callout2, { x: 96, y: 836, w: 1728, tone: "pull", a: E2(t, 40), fs: 21, text: "Three of the six are bytecode instructions. A class initialises the first time one of them **executes**, never earlier." }));
  }
  var NT_SRC = [
    "Loud[] arr = new Loud[10];         // 1",
    "System.out.println(Loud.NAME);     // 2",
    "Class<?> c = Loud.class;           // 3",
    'Class.forName("Loud", false, ld);  // 4',
    "System.out.println(Sub.shared);    // 5",
    "System.out.println(Loud.ITEMS);    // 6",
    "new Sub();                         // 7"
  ];
  var NT_DEFS = [
    'class Loud { static { print("Loud initialised"); }',
    '  static final String NAME = "x";                // constant',
    "  static final List<String> ITEMS = List.of(); } // not one",
    "class Base { static int shared = 1; static { print(\u2026); } }",
    "class Sub extends Base { static { print(\u2026); } }"
  ];
  var NTP = "file:\u2026/";
  var NT_LOG = [
    [1, "java -Xlog:class+load,class+init T", "cmd"],
    [6.3, "1. new Loud[10]"],
    [7.2, `[0.020s][info][class,load] Loud source: ${NTP}`, "dim"],
    [13.8, "2. Loud.NAME"],
    [14.6, "x"],
    [21.3, "3. Loud.class"],
    [24.3, '4. Class.forName("Loud", false, ...)'],
    [28.3, "5. Sub.shared   (field declared in Base)"],
    [29, `[0.021s][info][class,load] Base source: ${NTP}`, "dim"],
    [29.4, `[0.021s][info][class,load] Sub source: ${NTP}`, "dim"],
    [30.2, "[0.021s][info][class,init] 292 Initializing 'Base' (0x0000007001000400)", "ok"],
    [30.8, "  Base initialised", "ok"],
    [31.4, "1"],
    [42.3, "6. Loud.ITEMS"],
    [43.4, "[0.021s][info][class,init] 293 Initializing 'Loud' (0x0000007001000a08)", "ok"],
    [44, "  Loud initialised", "ok"],
    [44.6, "[]"],
    [50.3, "7. new Sub()"],
    [51, "[0.021s][info][class,init] 295 Initializing 'Sub' (0x0000007001001000)", "ok"],
    [51.6, "  Sub initialised", "ok"]
  ];
  function SNotTriggers({ t }) {
    const [hl, hA] = hlAt2(t, [[6, 0], [13.5, 1], [21, 2], [24, 3], [28, 4], [42, 5], [50, 6]]);
    const yes = (at) => t >= at ? "\u2713" : "\u2014";
    const rows = [["Loud", yes(7.2), yes(43.4)], ["Base", yes(29), yes(30.2)], ["Sub", yes(29.4), yes(51)]];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 196, w: 820, h: 306, title: "T.java \xB7 main (abridged)", a: E2(t, 0.4), fs: 18, lh: 34, hl, hlA: hA, lines: NT_SRC }), /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 522, w: 820, h: 226, title: "the classes (abridged)", a: E2(t, 1), fs: 17, lh: 30, lines: NT_DEFS.map((s, i) => ({ s, tone: i === 1 ? "violet" : i === 2 ? "pull" : void 0, toneA: i === 1 ? win2(t, 13.5, 21) : i === 2 ? win2(t, 42, 50) : 0 })) }), /* @__PURE__ */ React.createElement(
      Table2,
      {
        x: 96,
        y: 770,
        cols: [300, 260, 260],
        head: ["class", "loaded", "initialised"],
        rows,
        a: E2(t, 4),
        fs: 20,
        rh: 42,
        colColors: [PAL2.ink, PAL2.violet, PAL2.pull],
        marks: { 0: ["pull", win2(t, 42, 50)], 1: ["flow", win2(t, 28, 36.5)], 2: ["violet", win2(t, 36.5, 42) + win2(t, 50, 56)] }
      }
    ), /* @__PURE__ */ React.createElement(Console2, { x: 960, y: 196, w: 864, h: 596, t, title: "terminal \xB7 log filtered to these classes", a: E2(t, 0.8), fs: 17, lh: 25, items: NT_LOG.map(([at, text, kind]) => ({ at, text, kind })) }), /* @__PURE__ */ React.createElement(Callout2, { x: 960, y: 812, w: 864, tone: "pull", a: E2(t, 56), fs: 20, text: "**Loaded is not initialised.** Initialisation waits for one of the six triggers." }));
  }
  var LOCK_SRC = ["public class Greeter {", "    static int count;", "    static {", '        System.out.println(name() + ": <clinit> starts");', "        Thread.sleep(3000);", "        count = 5;", '        System.out.println(name() + ": <clinit> done");', "    }", "}"];
  var HOLDER = ["class Lazy {", "    private static class Holder {", "        static final Expensive INSTANCE = new Expensive();", "    }", "    static Expensive get() { return Holder.INSTANCE; }", "}"];
  function SInitLock({ t }) {
    const X0 = 1060, X1 = 1700, T0 = 6.5, T1 = 34.5;
    const p = clamp2((t - T0) / (T1 - T0), 0, 1);
    const xNow = lerp2(X0, X1, p);
    const t2x = X0 + 0.1 / 3.1 * (X1 - X0);
    const done = t >= T1;
    const tail = E2(t, T1, 1.2) * 96;
    const owned = t >= T0;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 196, w: 780, h: 338, title: "Greeter.java (abridged)", a: E2(t, 0.4), fs: 17, lh: 30, lines: LOCK_SRC.map((s, i) => i >= 3 && i <= 6 ? { s, tone: "pull", toneA: win2(t, 6.5, 34.8) } : s) }), /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 556, w: 780, h: 188, title: "jcmd <pid> Thread.print \xB7 T2 (excerpt)", lang: "plain", a: win2(t, 20, 41.8, 0.5), fs: 17, lh: 30, lines: [
      '"T2" #15 prio=5 os_prio=31 ... in Object.wait()',
      { s: "   java.lang.Thread.State: RUNNABLE", tone: "pull", toneA: win2(t, 27, 34) },
      "        at Race.lambda$main$0(Race.java:3)",
      { s: "        - waiting on the Class initialization monitor for Greeter", tone: "bad", toneA: win2(t, 20.5, 27) }
    ] }), /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 556, w: 780, h: 248, title: "the holder idiom", a: E2(t, 42), fs: 17, lh: 30, lines: HOLDER.map((s, i) => i === 2 || i === 4 ? { s, tone: "flow", toneA: E2(t, 49) } : s) }), /* @__PURE__ */ React.createElement(Panel2, { x: 920, y: 196, w: 904, h: 360, title: "two threads call Greeter.greet()", tone: "flow", a: E2(t, 2) }), /* @__PURE__ */ React.createElement(Txt2, { x: 944, y: 290, mono: true, fs: 22, weight: 600, color: PAL2.pull, a: E2(t, 6.5) }, "T1"), /* @__PURE__ */ React.createElement(Txt2, { x: 944, y: 386, mono: true, fs: 22, weight: 600, color: PAL2.blue, a: E2(t, 13.5) }, "T2"), owned && /* @__PURE__ */ React.createElement(Box2, { x: X0, y: 276, w: Math.max(10, xNow - X0), h: 56, label: xNow - X0 > 200 ? "runs <clinit>" : "", fs: 18, tone: "pull", fill: true }), done && /* @__PURE__ */ React.createElement(Box2, { x: X1 + 6, y: 276, w: tail, h: 56, label: tail > 90 ? "greet" : "", fs: 17, tone: "flow", fill: true }), t >= 13.5 && /* @__PURE__ */ React.createElement(Box2, { x: t2x, y: 372, w: Math.max(10, xNow - t2x), h: 56, label: xNow - t2x > 260 ? "waits for the init lock" : "", fs: 18, tone: "bad", dashed: true }), done && /* @__PURE__ */ React.createElement(Box2, { x: X1 + 6, y: 372, w: tail, h: 56, label: tail > 90 ? "greet" : "", fs: 17, tone: "flow", fill: true }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: X0, top: 450, width: X1 - X0, height: 2, background: PAL2.line2, opacity: E2(t, 6.5) } }), /* @__PURE__ */ React.createElement(Txt2, { x: X0, y: 458, mono: true, fs: 16, color: PAL2.ink3, a: E2(t, 6.5) }, "0 s"), /* @__PURE__ */ React.createElement(Txt2, { x: X1, y: 458, anchor: "mid", mono: true, fs: 16, color: PAL2.ink3, a: E2(t, 6.5) }, "3 s"), /* @__PURE__ */ React.createElement(Box2, { x: 944, y: 488, w: 856, h: 52, label: done ? "Greeter: fully_initialized" : owned ? "Greeter: being_initialized \xB7 owner T1" : "Greeter: linked", fs: 20, tone: done ? "flow" : owned ? "pull" : "ink", a: E2(t, 3), glow: pulse2(t, [6.5, T1], 1.2) }), /* @__PURE__ */ React.createElement(Console2, { x: 920, y: 580, w: 904, h: 236, t, a: E2(t, 6.5), fs: 17, lh: 28, items: [
      { at: 6.7, text: "java Race", kind: "cmd" },
      { at: 7.4, text: "T1: <clinit> starts" },
      { at: 27.5, text: "T2 state while T1 runs <clinit>: RUNNABLE", kind: "dim" },
      { at: 35, text: "T1: <clinit> done" },
      { at: 35.6, text: "T1: Hello, Ada (count=5)", kind: "ok" },
      { at: 36.2, text: "T2: Hello, Ada (count=5)", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(Callout2, { x: 920, y: 836, w: 904, tone: "flow", a: E2(t, 49), fs: 19, text: "`Holder` initialises on the first `get()`: lazy, exactly once, thread-safe. The JVM's init lock does the locking." }));
  }
  var BROKEN = ["public class Greeter {", '    static int count = Integer.parseInt(System.getProperty("greet.count"));', '    static String greet(String name) { count++; return "Hello, " + name; }', "}"];
  var LOOP = ["for (int i = 1; i <= 3; i++) {", '    try { System.out.println(Greeter.greet("Ada")); }', '    catch (Throwable e) { System.out.println("call " + i + ": " + e); }', "}", 'Greeter.greet("Bob");   // uncaught: full stack trace'];
  function SFailedInit({ t }) {
    const [hl, hA] = hlAt2(t, [[6.5, 1], [21, 1], [26.5, 1], [41, 4]]);
    const err = t >= 13.5;
    const calls = [
      { at: 6.5, label: "call 1", res: "ran <clinit> \u2192 ExceptionInInitializerError", tone: "bad", y: 480 },
      { at: 21, label: "call 2", res: "refused at once \u2192 NoClassDefFoundError", tone: "pull", y: 524 },
      { at: 30.5, label: "call 3", res: "refused at once \u2192 NoClassDefFoundError", tone: "pull", y: 568 }
    ];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 196, w: 900, h: 172, title: "Greeter.java", a: E2(t, 0.4), fs: 17, lh: 26, lines: BROKEN.map((s, i) => i === 1 ? { s, tone: "bad", toneA: win2(t, 6.5, 14) } : s) }), /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 382, w: 900, h: 198, title: "Main.java \xB7 main", a: E2(t, 1), fs: 17, lh: 26, hl, hlA: hA, lines: LOOP }), /* @__PURE__ */ React.createElement(Box2, { x: 1040, y: 204, w: 320, h: 66, label: "linked", fs: 21, tone: "ink", a: E2(t, 2) }), /* @__PURE__ */ React.createElement(HArrow2, { x1: 1364, x2: 1436, y: 237, a: E2(t, 6.5), color: PAL2.pull }), /* @__PURE__ */ React.createElement(Box2, { x: 1440, y: 204, w: 384, h: 66, label: "being_initialized", fs: 21, tone: "pull", a: E2(t, 6.6), glow: win2(t, 6.6, 13.5) }), /* @__PURE__ */ React.createElement(Arrow2, { pts: [[1560, 274], [1560, 312], [1200, 312], [1200, 346]], draw: E2(t, 7), color: PAL2.ink3, dashed: true }), /* @__PURE__ */ React.createElement(Box2, { x: 1040, y: 350, w: 320, h: 66, label: "fully_initialized", sub: "never reached", fs: 20, sfs: 17, tone: "dim", dashed: true, a: E2(t, 7) }), /* @__PURE__ */ React.createElement(VArrow2, { x: 1700, y1: 274, y2: 346, a: E2(t, 13.5), color: PAL2.bad, label: "threw", lfs: 17 }), /* @__PURE__ */ React.createElement(Box2, { x: 1440, y: 350, w: 384, h: 66, label: "initialization_error", fs: 20, tone: "bad", a: POP2(t, 13.5), glow: err ? 0.5 + 0.5 * pulse2(t, [13.6, 21.3, 30.8], 1.2) : 0 }), /* @__PURE__ */ React.createElement(Badge2, { x: 1632, y: 438, text: "permanent", tone: "bad", fs: 17, a: E2(t, 15) }), calls.map((c) => /* @__PURE__ */ React.createElement(React.Fragment, { key: c.label }, /* @__PURE__ */ React.createElement(Badge2, { x: 1040, y: c.y, anchor: "left", text: c.label, tone: c.tone, fs: 17, a: E2(t, c.at) }), /* @__PURE__ */ React.createElement(Txt2, { x: 1150, y: c.y - 12, mono: true, fs: 17, color: c.tone === "bad" ? PAL2.bad : PAL2.pull, a: E2(t, c.at + (c.label === "call 1" ? 7 : 5.5)) }, c.res))), /* @__PURE__ */ React.createElement(Console2, { x: 96, y: 597, w: 1728, h: 343, t, a: E2(t, 12), fs: 17, lh: 25, items: [
      { at: 12.5, text: "java Main", kind: "cmd" },
      { at: 14, text: "call 1: java.lang.ExceptionInInitializerError", kind: "err" },
      { at: 27, text: "call 2: java.lang.NoClassDefFoundError: Could not initialize class Greeter", kind: "err" },
      { at: 31, text: "call 3: java.lang.NoClassDefFoundError: Could not initialize class Greeter", kind: "err" },
      { at: 41.5, text: 'Exception in thread "main" java.lang.NoClassDefFoundError: Could not initialize class Greeter', kind: "err" },
      { at: 41.8, text: "	at Main.main(Main.java:10)" },
      { at: 42.5, text: 'Caused by: java.lang.ExceptionInInitializerError: Exception java.lang.NumberFormatException: Cannot parse null string [in thread "main"]', kind: "ok" },
      { at: 42.8, text: "	at java.base/java.lang.Integer.parseInt(Integer.java:630)" },
      { at: 43, text: "	at java.base/java.lang.Integer.parseInt(Integer.java:786)" },
      { at: 43.2, text: "	at Greeter.<clinit>(Greeter.java:2)", kind: "ok" },
      { at: 43.4, text: "	at Main.main(Main.java:5)" }
    ] }));
  }

  // src/topics/8.2/scenes3.jsx
  var {
    PAL: PAL3,
    MOTION: MOTION3,
    lin: lin3,
    lerp: lerp3,
    win: win3,
    pulse: pulse3,
    step: step3,
    track: track3,
    hlAt: hlAt3,
    clamp: clamp3,
    hexA: hexA3,
    MONO: MONO3,
    SANS: SANS3,
    Txt: Txt3,
    Panel: Panel3,
    Box: Box3,
    Code: Code3,
    Console: Console3,
    HArrow: HArrow3,
    VArrow: VArrow3,
    Arrow: Arrow3,
    Dot: Dot3,
    Card: Card3,
    Node: Node3,
    Badge: Badge3,
    Callout: Callout3,
    Table: Table3,
    Mark: Mark3,
    Val: Val3,
    Brace: Brace3,
    toneColor: toneColor3
  } = window.AN;
  var E3 = MOTION3.enter;
  var M3 = MOTION3.move;
  var POP3 = MOTION3.pop;
  var WHO = [
    [1.5, "java Who", "cmd"],
    [13.6, "String     -> null", "ok"],
    [19.6, "Connection -> jdk.internal.loader.ClassLoaders$PlatformClassLoader@bba30dd"],
    [32, "Greeter    -> jdk.internal.loader.ClassLoaders$AppClassLoader@42110406", "ok"],
    [33, "  parent   -> jdk.internal.loader.ClassLoaders$PlatformClassLoader@bba30dd", "ok"],
    [34, "  parent   -> null", "ok"],
    [38.6, "DocumentBuilder -> null", "err"],
    [39.2, "Logger     -> null", "err"],
    [39.8, "HttpClient -> jdk.internal.loader.ClassLoaders$PlatformClassLoader@bba30dd"]
  ];
  function SHierarchy({ t }) {
    const L = [
      { y: 200, label: "bootstrap", sub: "native, inside the JVM \xB7 java.base, java.xml, java.logging \u2026", tone: "pull", at: 6.5, lit: [6.5, 19.5] },
      { y: 380, label: "platform", sub: "JDK modules: java.sql, java.net.http \u2026", tone: "violet", at: 19.5, lit: [19.5, 26] },
      { y: 560, label: "application", sub: "your classpath and module path", tone: "flow", at: 26, lit: [26, 32] },
      { y: 740, label: "custom loaders", sub: "app servers \xB7 plugins \xB7 OSGi \xB7 test runners", tone: "ink", at: 44, lit: [44, 50], dashed: true }
    ];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, L.map((l, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: l.label }, /* @__PURE__ */ React.createElement(Box3, { x: 96, y: l.y, w: 760, h: i === 3 ? 100 : 120, align: "left", label: l.label, sub: l.sub, fs: 28, sfs: 17, tone: l.tone, dashed: l.dashed, a: E3(t, l.at), glow: win3(t, l.lit[0], l.lit[1]) * 0.8 + (i < 3 ? win3(t, 32, 38) * 0.5 : 0) }), i > 0 && /* @__PURE__ */ React.createElement(VArrow3, { x: 476, y1: l.y - 4, y2: L[i - 1].y + (i === 3 ? 124 : 124), a: E3(t, l.at + 0.4), color: PAL3.ink2, label: "parent", lfs: 17 }))), /* @__PURE__ */ React.createElement(Badge3, { x: 700, y: 224, text: "getClassLoader() \u2192 null", tone: "pull", fs: 17, a: E3(t, 13.5) }), /* @__PURE__ */ React.createElement(Code3, { x: 900, y: 200, w: 924, h: 160, title: "Who.java (abridged)", a: E3(t, 1), fs: 17, lh: 26, lines: ['System.out.println("String  -> " + String.class.getClassLoader());', "ClassLoader l = Greeter.class.getClassLoader();", 'System.out.println("  parent -> " + l.getParent()); // \u2026'] }), /* @__PURE__ */ React.createElement(Console3, { x: 900, y: 380, w: 924, h: 300, t, a: E3(t, 1.2), fs: 17, lh: 25, items: WHO.map(([at, text, kind]) => ({ at, text, kind })) }), /* @__PURE__ */ React.createElement(Callout3, { x: 900, y: 704, w: 924, tone: "bad", a: E3(t, 38.5), fs: 19, title: "the split is per module", text: "`java.xml` and `java.logging` print `null`: they are **bootstrap** modules, not platform ones. Many notes get this wrong." }));
  }
  var LD = [{ y: 210, name: "bootstrap", tone: "pull" }, { y: 420, name: "platform", tone: "violet" }, { y: 630, name: "app", tone: "flow" }];
  var RAILX = 180;
  var cy = (i) => LD[i].y + 55;
  function SDelegation({ t }) {
    const [hl, hA] = hlAt3(t, [[5.5, 2], [11.5, 4], [29, 6], [32, 8], [36.5, 2], [39.5, -1]]);
    const searchA = [win3(t, 18, 23.6) + win3(t, 46.6, 53), win3(t, 24.4, 28.6), win3(t, 29.6, 36)];
    const found = t >= 31.2;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, LD.map((l, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: l.name }, /* @__PURE__ */ React.createElement(Box3, { x: 290, y: l.y, w: 360, h: 110, label: l.name, sub: i === 2 && found ? "cache: Greeter" : "cache: \u2014", fs: 28, sfs: 17, tone: l.tone, a: E3(t, 0.6 + i * 0.2), glow: [win3(t, 14.6, 23.6) + win3(t, 46, 52), win3(t, 12.4, 13.8) + win3(t, 24.4, 28.6), win3(t, 5.5, 11.5) + win3(t, 29.6, 36) + pulse3(t, [38.2], 1)][i] }), i > 0 && /* @__PURE__ */ React.createElement(VArrow3, { x: 470, y1: l.y - 4, y2: LD[i - 1].y + 114, a: E3(t, 1.2), color: PAL3.ink3, label: "parent", lfs: 17 }), /* @__PURE__ */ React.createElement(Arrow3, { from: [654, cy(i)], to: [696, cy(i)], draw: searchA[i] > 0.05 ? 1 : 0, a: searchA[i], color: i === 2 || i === 0 && t > 46 ? PAL3.flow : PAL3.bad }))), /* @__PURE__ */ React.createElement(Box3, { x: 700, y: 210, w: 420, h: 110, align: "left", label: "core modules", sub: "jrt: java.base, java.xml, \u2026", fs: 22, sfs: 17, tone: "ink", a: E3(t, 1.4) }), /* @__PURE__ */ React.createElement(Box3, { x: 700, y: 420, w: 420, h: 110, align: "left", label: "platform modules", sub: "jrt: java.sql, java.net.http, \u2026", fs: 22, sfs: 17, tone: "ink", a: E3(t, 1.6) }), /* @__PURE__ */ React.createElement(Panel3, { x: 700, y: 630, w: 420, h: 110, title: "classpath: ./", a: E3(t, 1.8) }, /* @__PURE__ */ React.createElement("div", { style: { padding: "8px 18px", font: `500 18px ${MONO3}`, color: PAL3.ink2, lineHeight: 1.5 } }, /* @__PURE__ */ React.createElement("div", { style: { color: found ? PAL3.flow : PAL3.ink2 } }, "Greeter.class"), /* @__PURE__ */ React.createElement("div", { style: { color: PAL3.bad, opacity: E3(t, 42.4), textDecoration: t > 49 ? "line-through" : "none" } }, "java/lang/String.class \xB7 fake"))), /* @__PURE__ */ React.createElement(Mark3, { x: 1094, y: 232, ok: false, a: POP3(t, 20) * (1 - E3(t, 40)) }), /* @__PURE__ */ React.createElement(Mark3, { x: 1094, y: 442, ok: false, a: POP3(t, 26.2) * (1 - E3(t, 40)) }), /* @__PURE__ */ React.createElement(Mark3, { x: 1094, y: 652, ok: true, a: POP3(t, 31.2) * (1 - E3(t, 40)) }), /* @__PURE__ */ React.createElement(Mark3, { x: 1094, y: 232, ok: true, a: POP3(t, 47.8) }), /* @__PURE__ */ React.createElement(Tok, { t, keys: [[5.5, RAILX, cy(2)], [11.8, RAILX, cy(2)], [12.8, RAILX, cy(1)], [13.8, RAILX, cy(1)], [14.8, RAILX, cy(0)], [24, RAILX, cy(0)], [25, RAILX, cy(1)], [29, RAILX, cy(1)], [30, RAILX, cy(2)]], text: "Greeter?", w: 150, fs: 18, tone: "pull", until: 36 }), /* @__PURE__ */ React.createElement(Tok, { t, keys: [[37.4, RAILX, cy(2) + 120], [38.2, RAILX, cy(2)]], text: "Greeter?", w: 150, fs: 18, tone: "flow", until: 39.4, glowAt: 38.2 }), /* @__PURE__ */ React.createElement(Badge3, { x: RAILX, y: cy(2) + 80, text: "1 \xB7 cache hit", tone: "flow", fs: 17, a: win3(t, 38.2, 41.6) }), /* @__PURE__ */ React.createElement(Tok, { t, keys: [[43.6, RAILX, cy(2)], [45.6, RAILX, cy(0)], [52, RAILX, cy(0)]], text: "String?", w: 140, fs: 18, tone: "bad", until: 53 }), /* @__PURE__ */ React.createElement(Arrow3, { pts: [[278, cy(2)], [278, cy(0)]], draw: M3(t, 44, 1.4), a: 1 - E3(t, 53), color: PAL3.bad, dashed: true }), /* @__PURE__ */ React.createElement(Badge3, { x: RAILX, y: cy(1), text: "via java.base", tone: "pull", fs: 17, a: win3(t, 45, 53) }), /* @__PURE__ */ React.createElement(Badge3, { x: 910, y: 370, text: "found: the real String", tone: "pull", fs: 17, a: win3(t, 48, 53.4) }), /* @__PURE__ */ React.createElement(Code3, { x: 1170, y: 210, w: 654, h: 368, title: "java.lang.ClassLoader (simplified)", a: E3(t, 2), fs: 17, lh: 30, hl, hlA: hA, lines: [
      "loadClass(name) {",
      "",
      "    c = findLoadedClass(name);       // 1",
      "    if (c == null) {",
      "        c = parent.loadClass(name);  // 2",
      "        if (c == null)",
      "            c = findClass(name);     // 3",
      "    }",
      "    return c;",
      "}"
    ] }), /* @__PURE__ */ React.createElement(Callout3, { x: 1170, y: 598, w: 654, tone: "violet", a: E3(t, 46), fs: 17, title: "JDK 9+ detail", text: "The built-in loaders first ask which **module** owns the package. `java.lang` lives in `java.base`, so the request goes straight to bootstrap." }), /* @__PURE__ */ React.createElement(Console3, { x: 700, y: 770, w: 1124, h: 168, t, a: E3(t, 42.5), fs: 17, lh: 25, items: [
      { at: 43, text: 'java -Xlog:class+load -cp out:. UseIt | grep "String "', kind: "cmd" },
      { at: 49, text: "[0.009s][info][class,load] java.lang.String source: shared objects file", kind: "ok" },
      { at: 54, text: 'java Prohibited    # defineClass("java.lang.String", \u2026)', kind: "cmd" },
      { at: 54.8, text: 'Exception in thread "main" java.lang.SecurityException: Prohibited package name: java.lang', kind: "err" }
    ] }), /* @__PURE__ */ React.createElement(Callout3, { x: 96, y: 790, w: 560, tone: "pull", a: E3(t, 56), fs: 19, text: "Delegation is **security**: nothing below bootstrap can replace a core class." }));
  }
  var TWO = [
    'var a = new SimpleLoader(Path.of("plugins"), platform);',
    'var b = new SimpleLoader(Path.of("plugins"), platform);',
    'Class<?> ga = a.loadClass("Greeter");',
    'Class<?> gb = b.loadClass("Greeter");',
    "System.out.println(ga == gb);                  // false",
    "Object o = gb.getDeclaredConstructor().newInstance();",
    "Greeter g = (Greeter) o;                       // boom"
  ];
  function SIdentity({ t }) {
    const [hl, hA] = hlAt3(t, [[7.5, 0], [9.5, 1], [13.5, 2], [15.5, 3], [20, 4], [27.5, 5], [33.5, 6]]);
    const cols = [
      { x: 1030, name: "app loader", key: "(Greeter, app)", at: 20.5, tone: "flow" },
      { x: 1300, name: "loader a", key: "(Greeter, a)", at: 14, tone: "violet" },
      { x: 1570, name: "loader b", key: "(Greeter, b)", at: 16, tone: "pink" }
    ];
    const boom = t >= 39.5;
    const shake = t > 39.5 && t < 40.6 ? Math.sin(t * 60) * 7 * (40.6 - t) : 0;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 196, w: 860, h: 292, title: "TwoLoaders.java (abridged)", a: E3(t, 0.4), fs: 17, lh: 32, hl, hlA: hA, lines: TWO }), /* @__PURE__ */ React.createElement(Panel3, { x: 1e3, y: 196, w: 824, h: 470, title: "metaspace \xB7 three classes named Greeter", tone: "violet", a: E3(t, 7.5) }), cols.map((c, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: c.name }, /* @__PURE__ */ React.createElement(Box3, { x: c.x, y: 262, w: 240, h: 66, label: c.name, fs: 20, tone: c.tone, a: E3(t, i === 0 ? 20.5 : 7.8 + i * 1.6) }), /* @__PURE__ */ React.createElement(VArrow3, { x: c.x + 120, y1: 332, y2: 374, a: E3(t, c.at), color: toneColor3(c.tone), label: "defines", lfs: 17 }), /* @__PURE__ */ React.createElement(Box3, { x: c.x, y: 378, w: 240, h: 100, label: "Greeter", sub: c.key, fs: 24, sfs: 17, tone: c.tone, a: POP3(t, c.at), glow: pulse3(t, [c.at + 0.1], 1.2) + (i === 0 ? win3(t, 33.5, 39.5) * 0.7 : 0) + (i === 2 ? win3(t, 27.5, 33.5) * 0.7 : 0) }))), /* @__PURE__ */ React.createElement(Badge3, { x: 1412, y: 506, text: "same name \xB7 same bytes \xB7 different classes", tone: "pull", fs: 17, a: win3(t, 17.5, 27.5) }), /* @__PURE__ */ React.createElement(Box3, { x: 1570 + shake, y: 560, w: 240, h: 80, label: "o", sub: "header \u2192 (Greeter, b)", fs: 22, sfs: 17, tone: "pink", a: E3(t, 28), glow: boom ? 0.8 : 0 }), /* @__PURE__ */ React.createElement(Arrow3, { pts: [[1566, 600], [1150, 600], [1150, 482]], draw: M3(t, 34, 1), color: boom ? PAL3.bad : PAL3.pull, dashed: true }), /* @__PURE__ */ React.createElement(Badge3, { x: 1330, y: 572, text: "cast to (Greeter, app)?", tone: boom ? "bad" : "pull", fs: 17, a: E3(t, 34.5) }), /* @__PURE__ */ React.createElement(Mark3, { x: 1150, y: 540, ok: false, a: POP3(t, 39.5) }), /* @__PURE__ */ React.createElement(Console3, { x: 96, y: 508, w: 860, h: 200, t, a: E3(t, 19.5), fs: 17, lh: 26, items: [
      { at: 19.8, text: "java TwoLoaders", kind: "cmd" },
      { at: 20.4, text: "Greeter == Greeter ? false", kind: "ok" },
      { at: 28.2, text: "  Greeter.<clinit> runs" },
      { at: 28.8, text: "o's loader: SimpleLoader@8bcc55f" },
      { at: 33.8, text: "app Greeter's loader: jdk.internal.loader.ClassLoaders$AppClassLoader@42110406" }
    ] }), /* @__PURE__ */ React.createElement(Panel3, { x: 96, y: 730, w: 1728, h: 196, title: "stderr", tone: "bad", a: E3(t, 39.5), glow: pulse3(t, [39.6], 1.4) }, /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 22px", font: `500 19px ${MONO3}`, color: PAL3.bad, lineHeight: 1.45 } }, /* @__PURE__ */ React.createElement("div", null, 'Exception in thread "main" java.lang.ClassCastException: class Greeter cannot be cast to class Greeter'), /* @__PURE__ */ React.createElement("div", { style: { opacity: E3(t, 47), color: E3(t, 47) > 0.5 ? PAL3.pull : PAL3.bad } }, "(Greeter is in unnamed module of loader SimpleLoader @8bcc55f; Greeter is in unnamed module of loader 'app')"), /* @__PURE__ */ React.createElement("div", { style: { color: PAL3.ink2 } }, "	at TwoLoaders.main(TwoLoaders.java:13)"))));
  }
  function SCnfeNcdfe({ t }) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt3, { x: 96, y: 192, mono: true, fs: 17, color: PAL3.flow, a: E3(t, 4.5) }, "EXPLICIT LOOKUP"), /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 222, w: 640, h: 110, title: "Lookup.java", a: E3(t, 5), fs: 20, lh: 34, lines: ['Class.forName("Greetr");    // typo'] }), /* @__PURE__ */ React.createElement(Txt3, { x: 96, y: 350, w: 640, fs: 20, color: PAL3.ink2, a: E3(t, 6) }, "You asked a loader for a class **by name**. It isn't there, so the loader throws a checked exception."), /* @__PURE__ */ React.createElement(Console3, { x: 752, y: 192, w: 1072, h: 268, t, a: E3(t, 5), fs: 17, lh: 25, items: [
      { at: 5.5, text: "java Lookup", kind: "cmd" },
      { at: 6.5, text: 'Exception in thread "main" java.lang.ClassNotFoundException: Greetr', kind: "err" },
      { at: 7, text: "	at java.base/jdk.internal.loader.BuiltinClassLoader.loadClass(BuiltinClassLoader.java:641)", kind: "dim" },
      { at: 7.2, text: "	at java.base/jdk.internal.loader.ClassLoaders$AppClassLoader.loadClass(ClassLoaders.java:188)", kind: "dim" },
      { at: 7.4, text: "	at java.base/java.lang.ClassLoader.loadClass(ClassLoader.java:525)", kind: "dim" },
      { at: 7.6, text: "	at java.base/java.lang.Class.forName0(Native Method)", kind: "dim" },
      { at: 7.8, text: "	at java.base/java.lang.Class.forName(Class.java:377)", kind: "dim" },
      { at: 8, text: "	at Lookup.main(Lookup.java:3)", kind: "dim" }
    ] }), /* @__PURE__ */ React.createElement(Txt3, { x: 96, y: 474, mono: true, fs: 17, color: PAL3.bad, a: E3(t, 20) }, "IMPLICIT \xB7 THE JVM NEEDED IT"), /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 504, w: 640, h: 142, title: "Main.java \xB7 compiled fine", a: E3(t, 20.5), fs: 18, lh: 32, lines: ['System.out.println("main starts");', { s: 'System.out.println(Greeter.greet("Ada"));', tone: "bad", toneA: win3(t, 27, 34) }] }), /* @__PURE__ */ React.createElement(Txt3, { x: 96, y: 662, w: 640, fs: 20, color: PAL3.ink2, a: E3(t, 27) }, "Then `rm Greeter.class`. Line 4's `invokestatic` can't resolve."), /* @__PURE__ */ React.createElement(Txt3, { x: 96, y: 724, w: 630, fs: 19, color: PAL3.pull, a: E3(t, 41) }, "3rd kind: `Could not initialize class X` means a `<clinit>` failed earlier."), /* @__PURE__ */ React.createElement(Console3, { x: 752, y: 476, w: 1072, h: 293, t, a: E3(t, 21), fs: 17, lh: 25, items: [
      { at: 21.5, text: "java Main", kind: "cmd" },
      { at: 22.5, text: "main starts" },
      { at: 27.5, text: 'Exception in thread "main" java.lang.NoClassDefFoundError: Greeter', kind: "err" },
      { at: 27.8, text: "	at Main.main(Main.java:4)", kind: "dim" },
      { at: 33.5, text: "Caused by: java.lang.ClassNotFoundException: Greeter", kind: "ok" },
      { at: 33.8, text: "	at java.base/jdk.internal.loader.BuiltinClassLoader.loadClass(BuiltinClassLoader.java:641)", kind: "dim" },
      { at: 34, text: "	at java.base/jdk.internal.loader.ClassLoaders$AppClassLoader.loadClass(ClassLoaders.java:188)", kind: "dim" },
      { at: 34.2, text: "	at java.base/java.lang.ClassLoader.loadClass(ClassLoader.java:525)", kind: "dim" },
      { at: 34.4, text: "	... 1 more", kind: "dim" }
    ] }), /* @__PURE__ */ React.createElement(
      Table3,
      {
        x: 96,
        y: 786,
        cols: [240, 744, 744],
        head: ["", "ClassNotFoundException", "NoClassDefFoundError"],
        a: E3(t, 46),
        fs: 18,
        rh: 36,
        colColors: [PAL3.ink3, PAL3.flow, PAL3.bad],
        rows: [["kind", "checked Exception", "Error"], ["trigger", "explicit: forName, loadClass", "implicit: the JVM linking or initialising"], ["usual cause", "a typo \xB7 an absent optional dependency", "classpath mismatch \xB7 or a failed <clinit>"]]
      }
    ));
  }

  // src/topics/8.2/scenes4.jsx
  var {
    PAL: PAL4,
    MOTION: MOTION4,
    lin: lin4,
    lerp: lerp4,
    win: win4,
    pulse: pulse4,
    step: step4,
    track: track4,
    hlAt: hlAt4,
    clamp: clamp4,
    hexA: hexA4,
    MONO: MONO4,
    SANS: SANS4,
    Txt: Txt4,
    Panel: Panel4,
    Box: Box4,
    Code: Code4,
    Console: Console4,
    HArrow: HArrow4,
    VArrow: VArrow4,
    Arrow: Arrow4,
    Dot: Dot4,
    Card: Card4,
    Node: Node4,
    Badge: Badge4,
    Callout: Callout4,
    Table: Table4,
    Mark: Mark4,
    Val: Val4,
    Brace: Brace4,
    toneColor: toneColor4
  } = window.AN;
  var E4 = MOTION4.enter;
  var M4 = MOTION4.move;
  var POP4 = MOTION4.pop;
  var SIMPLE_LOADER = [
    "public class SimpleLoader extends ClassLoader {",
    "    private final Path dir;",
    "",
    "    public SimpleLoader(Path dir, ClassLoader parent) {",
    "        super(parent);                     // preserve delegation",
    "        this.dir = dir;",
    "    }",
    "",
    "    @Override",
    "    protected Class<?> findClass(String name) throws ClassNotFoundException {",
    "        try {",
    "            byte[] bytes = Files.readAllBytes(",
    `                    dir.resolve(name.replace('.', '/') + ".class"));`,
    "            return defineClass(name, bytes, 0, bytes.length);",
    "        } catch (IOException e) {",
    "            throw new ClassNotFoundException(name, e);",
    "        }",
    "    }",
    "}"
  ];
  function SCustomLoader({ t }) {
    const lines = SIMPLE_LOADER.map((s, i) => {
      if (i === 4 && t >= 6.5 && t < 12) return { s, tone: "pull" };
      if (i >= 11 && i <= 13 && t >= 12 && t < 19.5) return { s, tone: "flow" };
      if (i === 9 && t >= 12) return { s, tone: "flow", toneA: t < 19.5 ? 1 : 0.5 };
      return s;
    });
    const flow = [
      ["findLoadedClass(name)", "1 \xB7 already loaded? return it", "ink"],
      ["parent.loadClass(name)", "2 \xB7 delegate upward first", "violet"],
      ["findClass(name)", "3 \xB7 yours: find bytes, defineClass", "flow"]
    ];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code4, { x: 96, y: 196, w: 830, h: 572, title: "SimpleLoader.java (imports omitted)", a: E4(t, 0.4), fs: 17, lh: 26, lines }), /* @__PURE__ */ React.createElement(Panel4, { x: 950, y: 196, w: 874, h: 384, title: "loadClass(name) \xB7 inherited template", right: "don't override", tone: "bad", a: E4(t, 19.5) }), flow.map(([l, s, tone], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: l }, /* @__PURE__ */ React.createElement(Box4, { x: 976, y: 262 + i * 104, w: 822, h: 84, align: "left", label: l, sub: s, fs: 21, sfs: 17, tone, a: E4(t, 20 + i * 1.2), glow: i === 2 ? win4(t, 26.5, 34) : pulse4(t, [20.3 + i * 1.2], 1) }), i > 0 && /* @__PURE__ */ React.createElement(VArrow4, { x: 1387, y1: 262 + i * 104 - 18, y2: 262 + i * 104 - 2, a: E4(t, 20 + i * 1.2), color: PAL4.ink3 }))), /* @__PURE__ */ React.createElement(Badge4, { x: 1700, y: 512, text: "\u2713 override this", tone: "flow", fs: 17, a: E4(t, 27) }), /* @__PURE__ */ React.createElement(Console4, { x: 950, y: 604, w: 874, h: 164, t, a: E4(t, 33.5), fs: 17, lh: 26, items: [
      { at: 34, text: "java Delegation", kind: "cmd" },
      { at: 35.5, text: "parent=app      -> jdk.internal.loader.ClassLoaders$AppClassLoader@42110406", kind: "dim" },
      { at: 42, text: "parent=platform -> SimpleLoader@58644d46", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(Callout4, { x: 96, y: 796, w: 1728, tone: "pull", a: E4(t, 26.5), fs: 20, text: "Override `findClass`, **not** `loadClass`. `loadClass` is where delegation lives; replace it and a plugin can shadow anything its parent would have provided." }));
  }
  var RELOAD = [
    "for (int v = 1; v <= 3; v++) {",
    '    var loader = new SimpleLoader(Path.of("plugins"), platform);',
    '    Class<?> c = loader.loadClass("Greeter");',
    "    Object g = c.getDeclaredConstructor().newInstance();",
    '    System.out.println("v" + v + ": " + greet(g) + "  class@" + idHash(c));',
    "}"
  ];
  var VERS = [[11, "7f31245a"], [17.5, "266474c2"], [22.5, "66d3c617"]];
  function SHotReload({ t }) {
    const [hl, hA] = hlAt4(t, [[5.5, 1], [7.5, 2], [11, 4], [13, 1], [17.5, 4], [21, 1], [22.5, 4], [24, -1]]);
    const newest = VERS.filter((v) => t >= v[0]).length - 1;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code4, { x: 96, y: 196, w: 900, h: 260, title: "Reload.java (abridged)", a: E4(t, 0.4), fs: 17, lh: 32, hl, hlA: hA, lines: RELOAD }), /* @__PURE__ */ React.createElement(Console4, { x: 96, y: 478, w: 900, h: 318, t, title: "terminal \xB7 filtered to Greeter", a: E4(t, 5), fs: 17, lh: 25, items: [
      { at: 5.5, text: "java -Xlog:class+load,class+unload Reload", kind: "cmd" },
      { at: 9.5, text: "[0.026s][info][class,load] Greeter source: __JVM_DefineClass__", kind: "dim" },
      { at: 10.2, text: "  Greeter.<clinit> runs" },
      { at: 11, text: "v1: Hello, Ada  class@7f31245a", kind: "ok" },
      { at: 16.2, text: "[0.035s][info][class,load] Greeter source: __JVM_DefineClass__", kind: "dim" },
      { at: 16.8, text: "  Greeter.<clinit> runs" },
      { at: 17.5, text: "v2: Hello, Ada  class@266474c2", kind: "ok" },
      { at: 21.4, text: "[0.035s][info][class,load] Greeter source: __JVM_DefineClass__", kind: "dim" },
      { at: 22, text: "  Greeter.<clinit> runs" },
      { at: 22.5, text: "v3: Hello, Ada  class@66d3c617", kind: "ok" }
    ] }), VERS.map(([at, h], i) => {
      const old = i < newest;
      const y = 206 + i * 150;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: h }, /* @__PURE__ */ React.createElement(Box4, { x: 1040, y, w: 290, h: 110, label: `SimpleLoader #${i + 1}`, sub: old ? "old" : "new", fs: 21, sfs: 17, tone: old ? "dim" : "violet", a: E4(t, at - 1.5) }), /* @__PURE__ */ React.createElement(HArrow4, { x1: 1334, x2: 1416, y: y + 55, a: E4(t, at - 1), color: old ? PAL4.ink3 : PAL4.violet, label: "defines", lfs: 17 }), /* @__PURE__ */ React.createElement(Box4, { x: 1420, y, w: 404, h: 110, label: `Greeter \xB7 class@${h}`, sub: "own statics \xB7 own <clinit> run", fs: 21, sfs: 17, tone: old ? "dim" : "flow", a: POP4(t, at), glow: pulse4(t, [at + 0.1], 1.2) }));
    }), /* @__PURE__ */ React.createElement(Callout4, { x: 1040, y: 666, w: 784, tone: "bad", a: E4(t, 30), fs: 19, text: "An object made by v1 is a `(Greeter, #1)`. Cast it to v3's `Greeter` and you get `Greeter cannot be cast to Greeter`." }), /* @__PURE__ */ React.createElement(Callout4, { x: 1040, y: 800, w: 784, tone: "pull", a: E4(t, 37.5), fs: 19, text: "A class can never change once defined. To reload, you **replace the loader**." }));
  }
  var LEAKS = ["a ThreadLocal on a pooled thread", "a JDBC driver in DriverManager", "a shutdown hook", "a logger holding the context loader"];
  function SUnloading({ t }) {
    const dead = t >= 24.5;
    const dA = dead ? 1 - 0.65 * E4(t, 24.5, 1) : 1;
    const tone = (tn) => dead ? "dim" : tn;
    const reps = t < 37.5 ? 0 : Math.min(20, 1 + Math.floor((t - 37.5) / 0.25));
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Box4, { x: 96, y: 384, w: 180, h: 84, label: "GC roots", sub: "stacks \xB7 statics", fs: 21, sfs: 17, tone: "ink", a: E4(t, 18.5) }), /* @__PURE__ */ React.createElement(Arrow4, { pts: [[278, 410], [320, 410], [320, 275], [356, 275]], draw: M4(t, 18.8, 0.6), a: dead ? 1 - E4(t, 24, 0.5) : 1, color: PAL4.pull, width: 3 }), /* @__PURE__ */ React.createElement(Badge4, { x: 186, y: 350, text: "one reference", tone: "pull", fs: 17, a: win4(t, 19, 24.3) }), /* @__PURE__ */ React.createElement(Box4, { x: 360, y: 232, w: 280, h: 86, label: "a Greeter object", sub: "heap", fs: 21, sfs: 17, tone: tone("pink"), a: E4(t, 5.5) * dA }), /* @__PURE__ */ React.createElement(HArrow4, { x1: 644, x2: 706, y: 275, a: E4(t, 6.4) * dA, color: PAL4.ink2, label: "klass", lfs: 17 }), /* @__PURE__ */ React.createElement(Box4, { x: 710, y: 232, w: 300, h: 86, label: "class Greeter", sub: "klass + mirror", fs: 21, sfs: 17, tone: tone("flow"), a: E4(t, 6.2) * dA }), /* @__PURE__ */ React.createElement(VArrow4, { x: 860, y1: 322, y2: 446, a: E4(t, 8) * dA, color: PAL4.ink2, label: "its loader", lfs: 17 }), /* @__PURE__ */ React.createElement(Box4, { x: 710, y: 450, w: 300, h: 86, label: "SimpleLoader", sub: "defined these classes", fs: 21, sfs: 17, tone: tone("violet"), a: E4(t, 1) * dA }), /* @__PURE__ */ React.createElement(HArrow4, { x1: 706, x2: 644, y: 493, a: E4(t, 12.4) * dA, color: PAL4.ink2, label: "holds", lfs: 17 }), /* @__PURE__ */ React.createElement(Box4, { x: 360, y: 450, w: 280, h: 86, label: "every other class", sub: "it defined + their statics", fs: 20, sfs: 17, tone: tone("violet"), a: E4(t, 12.2) * dA }), ["class Greeter", "SimpleLoader", "other classes"].map((s, i) => /* @__PURE__ */ React.createElement(Badge4, { key: s, x: [860, 860, 500][i], y: [230, 448, 448][i], text: "unloaded", tone: "bad", fs: 17, a: POP4(t, 26 + i * 0.4) })), /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: 580, mono: true, fs: 16, color: PAL4.ink3, a: E4(t, 44.5) }, "USUAL LEAK CULPRITS"), LEAKS.map((l, i) => /* @__PURE__ */ React.createElement(Badge4, { key: l, x: 96 + i % 2 * 510, y: 626 + Math.floor(i / 2) * 44, anchor: "left", text: l, tone: "pull", fs: 17, a: E4(t, 45 + i * 0.6) })), /* @__PURE__ */ React.createElement(Console4, { x: 1040, y: 196, w: 784, h: 212, t, title: "Reload \xB7 class+unload", a: E4(t, 24), fs: 17, lh: 25, items: [
      { at: 24.2, text: "v3: Hello, Ada  class@66d3c617", kind: "dim" },
      { at: 26, text: "[0.035s][info][class,unload] unloading class Greeter 0x0000007001005400", kind: "ok" },
      { at: 26.4, text: "[0.035s][info][class,unload] unloading class Greeter 0x0000007001005800", kind: "ok" },
      { at: 26.8, text: "[0.035s][info][class,unload] unloading class Greeter 0x0000007001001000", kind: "ok" },
      { at: 27.4, text: "after GC" }
    ] }), /* @__PURE__ */ React.createElement(Console4, { x: 1040, y: 430, w: 784, h: 268, t, title: "Reload keep \xB7 one instance kept in a static list", a: E4(t, 31.5), fs: 17, lh: 25, items: [
      { at: 31.8, text: "java -Xlog:class+unload Reload keep", kind: "cmd" },
      { at: 32.2, text: "  Greeter.<clinit> runs" },
      { at: 32.4, text: "v1: Hello, Ada  class@7f31245a" },
      { at: 32.6, text: "  Greeter.<clinit> runs" },
      { at: 32.8, text: "v2: Hello, Ada  class@266474c2" },
      { at: 33, text: "  Greeter.<clinit> runs" },
      { at: 33.2, text: "v3: Hello, Ada  class@66d3c617" },
      { at: 34, text: "after GC", kind: "err" }
    ] }), /* @__PURE__ */ React.createElement(Badge4, { x: 1700, y: 673, text: "nothing unloaded", tone: "bad", fs: 17, a: E4(t, 34.5) }), /* @__PURE__ */ React.createElement(Panel4, { x: 96, y: 730, w: 1728, h: 176, title: "metaspace \xB7 one copy of every class per redeploy", right: reps ? `${reps} redeploy${reps > 1 ? "s" : ""}` : "", tone: reps >= 20 ? "bad" : "violet", a: E4(t, 37.5) }), Array.from({ length: reps }).map((_, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { position: "absolute", left: 124 + i * 66, top: 800, width: 58, height: 70, borderRadius: 6, background: hexA4(PAL4.violet, 0.22), border: `2px solid ${hexA4(reps >= 20 ? PAL4.bad : PAL4.violet, 0.8)}` } })), /* @__PURE__ */ React.createElement(Badge4, { x: 1640, y: 835, text: "OutOfMemoryError: Metaspace", tone: "bad", fs: 17, solid: true, a: POP4(t, 44.5) }));
  }
  var TRAPS = [
    [3, "\u201CNoClassDefFoundError means a jar is missing\u201D", "Often a static initialiser threw earlier. Search back for `ExceptionInInitializerError`."],
    [9.5, "\u201CGreeter cannot be cast to Greeter is impossible\u201D", "Two loaders, two classes. Print `getClassLoader()` on both sides."],
    [16, "\u201CI\u2019ll override loadClass\u201D", "That breaks parent delegation. Override `findClass`."],
    [22, "\u201CThe static block runs when the class loads\u201D", "Initialisation is lazy, and compile-time constants never trigger it."],
    [28.5, "\u201COld classes get unloaded after a redeploy\u201D", "Only when the whole loader is unreachable. One stray reference leaks it all."]
  ];
  function STraps({ t }) {
    return TRAPS.map(([at, myth, real], i) => {
      const y = 196 + i * 140;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, /* @__PURE__ */ React.createElement(Box4, { x: 96, y, w: 780, h: 120, label: myth, mono: false, fs: 23, tone: "bad", a: E4(t, at), strike: t > at + 2, style: { whiteSpace: "normal" } }), /* @__PURE__ */ React.createElement(HArrow4, { x1: 888, x2: 948, y: y + 60, a: E4(t, at + 1.5), color: PAL4.flow }), /* @__PURE__ */ React.createElement(Card4, { x: 960, y, w: 864, h: 120, a: E4(t, at + 1.6), tone: "flow", title: real, tfs: 23 }));
    });
  }
  var RECAP = [
    [3, "1", "Three phases", "load \u2192 verify, prepare, resolve \u2192 initialise. Defaults first, your values in `<clinit>`."],
    [9, "2", "Lazy, once, locked", "Loaded when first needed, initialised on the first trigger, exactly once, under a lock."],
    [15, "3", "Verification", "A real security boundary. Bad bytecode is rejected before any of it runs."],
    [20.5, "4", "Failed init", "Erroneous for good. Later uses throw `NoClassDefFoundError: Could not initialize`."],
    [26, "5", "Delegation", "Ask the parent first. Nobody can replace `java.lang.String`."],
    [31.5, "6", "Identity", "Name **+ loader**. Explains `X cannot be cast to X`, hot reload, and leaks."]
  ];
  function SRecap({ t }) {
    return RECAP.map(([at, n, title, sub], i) => /* @__PURE__ */ React.createElement(Card4, { key: n, x: 96 + i % 3 * 584, y: 200 + Math.floor(i / 3) * 330, w: 560, h: 300, num: n, title, sub, tfs: 34, sfs: 24, a: E4(t, at), tone: i === 5 ? "pull" : void 0, glow: i === 5 ? win4(t, 32, 40) : 0 }));
  }

  // src/topics/8.2.jsx
  var chapters = ["Intro", "Three phases", "Lazy loading", "Verification", "Initialisation", "Failed init", "Loaders & delegation", "Class identity", "CNFE vs NCDFE", "Custom loaders", "Unloading", "Traps", "Recap"];
  var scenes = [
    { name: "Intro", dur: 24, ch: 0, title: "", C: SIntro },
    { name: "Phases", dur: 44, ch: 1, title: "Three phases, always in order", C: SPhases },
    { name: "Timeline", dur: 62, ch: 1, title: "`Greeter`, phase by phase", C: STimeline },
    { name: "PrepareGap", dur: 46, ch: 1, title: "The gap between prepare and init", C: SPrepareGap },
    { name: "LazyLog", dur: 68, ch: 2, title: "Lazy loading, in the real log", C: SLazyLog },
    { name: "LazyResolve", dur: 38, ch: 2, title: "Resolution is lazy too", C: SLazyResolve },
    { name: "VerifyChecks", dur: 42, ch: 3, title: "Verification: a security boundary", C: SVerifyChecks },
    { name: "VerifyError", dur: 60, ch: 3, title: "Break one byte, meet the verifier", C: SVerifyError },
    { name: "Triggers", dur: 48, ch: 4, title: "Exactly when a class initialises", C: STriggers },
    { name: "NotTriggers", dur: 62, ch: 4, title: "What does not initialise a class", C: SNotTriggers },
    { name: "InitLock", dur: 56, ch: 4, title: "Once, and under a lock", C: SInitLock },
    { name: "FailedInit", dur: 62, ch: 5, title: "When a static initialiser throws", C: SFailedInit },
    { name: "Hierarchy", dur: 50, ch: 6, title: "Three built-in loaders", C: SHierarchy },
    { name: "Delegation", dur: 64, ch: 6, title: "Parent delegation: ask upward first", C: SDelegation },
    { name: "Identity", dur: 62, ch: 7, title: "A class is its name plus its loader", C: SIdentity },
    { name: "CnfeNcdfe", dur: 54, ch: 8, title: "`ClassNotFoundException` vs `NoClassDefFoundError`", C: SCnfeNcdfe },
    { name: "CustomLoader", dur: 56, ch: 9, title: "Writing a loader: override `findClass`", C: SCustomLoader },
    { name: "HotReload", dur: 46, ch: 9, title: "Hot reload: replace the loader", C: SHotReload },
    { name: "Unloading", dur: 58, ch: 10, title: "Unloading: the whole loader or nothing", C: SUnloading },
    { name: "Traps", dur: 38, ch: 11, title: "Traps", C: STraps },
    { name: "Recap", dur: 40, ch: 12, title: "Recap", C: SRecap }
  ];
  var captions = {
    Intro: [[0.8, "Your program is a pile of `.class` files. How does one become a live class inside the JVM?"], [6.5, "Three phases: **loading**, **linking**, **initialisation**. Each has rules, and each can fail."], [12.5, "This is the layer frameworks live in, and it produces the most baffling errors in Java."], [18, "One small class, `Greeter`, with a static initialiser, carries us all the way through."]],
    Phases: [[0.5, "Getting a class into the JVM happens in three phases, always in this order."], [5, "**Loading** finds the `.class` bytes, parses them, and creates the `Class` object."], [11.5, "**Linking** has three steps. First, **verify**: prove the bytecode is safe to run."], [18, "Then **prepare**: allocate the static fields and set them to defaults: `0`, `null`, `false`."], [25, "Then **resolve**: turn symbolic names into direct references. HotSpot does this lazily, on first use."], [31.5, "**Initialisation** runs the static initialisers: the class's `<clinit>` method."], [37.5, "So `static int count = 5` is `0` after prepare, and only becomes `5` during initialisation."]],
    Timeline: [[0.5, "Now follow `Greeter` through each phase, and watch what exists in memory after each one."], [5, "**Load**: the loader reads `Greeter.class`, and the JVM parses it into a class structure in **metaspace**."], [12, "It also creates a `java.lang.Class` object on the heap: the mirror you get from `Greeter.class`."], [19, "**Verify**: the bytecode of every method is checked before any of it may run."], [25, "**Prepare**: static storage is allocated and zeroed. In HotSpot, statics live in the mirror. `count` is `0`."], [32, "**Resolve**: entries like `#7 Fieldref Greeter.count:I` stay symbolic. HotSpot resolves each on first use."], [38, "**Initialise**: the JVM runs `<clinit>`, the method `javac` built from your static initialisers."], [42.5, "`iconst_5`, then `putstatic #7`: the first use of `#7`, so it is resolved right now. `count` becomes `5`."], [49.5, "The static block prints its line, and `<clinit>` returns."], [54.5, "`Greeter` is now `fully_initialized`. Only now may `greet` run. Every step happened once."]],
    PrepareGap: [[0.5, "Here is that gap, made visible. `DEFAULT` is created before `count` is assigned."], [6.5, "After prepare, both statics hold defaults: `DEFAULT` is `null`, `count` is `0`."], [12.5, "`<clinit>` runs the initialisers top to bottom. First: `new Greeter()`."], [18.5, "The constructor reads `count`. Initialisation hasn't reached that line yet, so it sees `0`."], [26, "Only then do `iconst_5` and `putstatic count` run. Now `count` is `5`."], [32, "Real output: the constructor printed 0. No error, no warning."], [38, "Order matters in static initialisers, and circular initialisation between two classes hits the same gap."]],
    LazyLog: [[0.5, "Proof that loading is lazy: run `Main` with class-load and class-init logging switched on."], [6, "The JVM loads `Main`, verifies it, and initialises it. `(no method)` means it has no `<clinit>`."], [13, "`main starts`, and `Greeter` is not loaded yet. Nothing has needed it."], [18.5, "`new Greeter[3]`: `anewarray` must resolve the class, so `Greeter` is **loaded**. Not initialised."], [26, "`Greeter.HELLO` prints `Hello` without touching `Greeter`: `javac` copied the constant into `Main`."], [33.5, "`Greeter.class` hands you the `Class` object. Still no initialisation."], [39.5, "`Greeter.greet` is a static call: a trigger. Verification, then initialisation, right now."], [46.5, "Notice verification waited until this moment too. HotSpot links lazily, just before initialising."], [53, "`<clinit>` prints, `greet` runs, and `count` is 6."], [58.5, "About 500 classes load for this program, nearly all JDK classes from the CDS archive. Yours load on demand."]],
    LazyResolve: [[0.5, "Resolution is lazy as well. Compile this, then delete `Greeter.class`."], [6.5, "Run it. It works: the line that names `Greeter` never runs, so nothing resolves it."], [14, "Pass an argument and the branch runs. `invokestatic` resolves `Greeter`, the load fails\u2026"], [21, "\u2026and you get `NoClassDefFoundError` at line 5, after `main starts` was already printed."], [28, "A missing class is not a startup error. It explodes the first time a line that needs it executes."]],
    VerifyChecks: [[0.5, "Before any method of a class may run, the verifier proves its bytecode cannot break the machine."], [6, "The operand stack never underflows or overflows: its depth stays within `max_stack` on every path."], [11.5, "Types match: an `int` is never used as a reference, and a reference is never used as an `int`."], [18, "`final` is respected, jumps land on real instruction boundaries, and every local is assigned before use."], [25, "That makes the JVM a sandbox: bytecode cannot forge a pointer or read arbitrary memory."], [32, "HotSpot verifies classes from your loaders. Core classes from the boot loader are trusted and skip it."]],
    VerifyError: [[0.5, "Watch the verifier work. `twice` returns `x + x`: `iload_1`, `iload_1`, `iadd`, `ireturn`."], [7, "Now patch one byte of the class file. `1b` becomes `2a`: the first instruction is now `aload_0`."], [14, "The verifier runs the method on **types**, not values. The locals start as `String` and `int`."], [20.5, "`aload_0` pushes a `String`. `iload_1` pushes an `int`. Then `iadd` demands two ints."], [27, "Rejected: `VerifyError: Bad type on operand stack`. The class fails as a whole, so even `main` never runs."], [34.5, "The report is precise: method `twice`, byte 2, `iadd`. A `String` is not assignable to integer."], [41.5, "Now switch verification off with `-Xverify:none`. JDK 17 prints a deprecation warning, then obeys."], [48, "It prints `-2014206267`: the reference's raw bits, added as if they were a number."], [54.5, "That is the sandbox the verifier gives you. Never run without it."]],
    Triggers: [[0.5, "A class is initialised on the **first** of six events, and never again."], [4.5, "One: an instance is created. The `new` instruction is a trigger."], [10, "Two: a static method is invoked: `invokestatic`."], [15, "Three: a static field is read or written: `getstatic`, `putstatic`. Unless it is a compile-time constant."], [22, "Four: a subclass is initialised. The superclass always goes first, all the way up to `Object`."], [28.5, "Five: it is the main class. The JVM initialises it before calling `main`."], [34, 'Six: reflection. `Class.forName("Greeter")` initialises by default.'], [40, "Three of the six are bytecode instructions. Initialisation happens the first time one of them executes."]],
    NotTriggers: [[0.5, "Now the opposite: things that look like uses but do not initialise. Real output on the right."], [6, "`new Loud[10]` loads `Loud`, to make the array type. It creates no `Loud` object, so no initialisation."], [13.5, '`Loud.NAME` is a compile-time constant. `javac` copied `"x"` into this class, so `Loud` is never touched.'], [21, '`Loud.class`, and `Class.forName(name, false, loader)`: that `false` means "load, but don\'t initialise".'], [28, "`Sub.shared` compiles to `getstatic Sub.shared`, but the field lives in `Base`. Only the declaring class initialises."], [36.5, "`Sub` was loaded, its superclass first, but its static block did not run."], [42, "`Loud.ITEMS` is `static final` too, but `List.of()` is not a constant expression. That one initialises."], [50, "And `new Sub()` finally initialises `Sub`. `Base` is already done, so it is not repeated."], [56, "Rule of thumb: loaded is not initialised. Initialisation waits for a real trigger."]],
    InitLock: [[0.5, "What if two threads trigger initialisation at the same moment? The JVM holds a lock per class."], [6.5, "`T1` calls `greet` first. `Greeter` becomes `being_initialized`, owned by `T1`, and `<clinit>` starts."], [13.5, "`T2` calls `greet` 100 ms later. It must not see a half-built class, so it waits."], [20, "A thread dump shows it: waiting on the Class initialization monitor for `Greeter`."], [27, "Its Java state still says `RUNNABLE`: the wait is inside the VM, so init deadlocks hide well."], [34.5, "`T1` finishes: `count` is 5, the class is `fully_initialized`, and `T2` wakes up and sees 5."], [42, "This is why the holder idiom is lazy and thread-safe with no `synchronized` of your own."], [49, "`Holder` initialises on the first `get()`, exactly once, and the JVM does the locking."]],
    FailedInit: [[0.5, "What if `<clinit>` throws? Here `count` parses a system property that isn't set."], [6.5, "Call 1 triggers initialisation. `parseInt(null)` throws `NumberFormatException` inside `<clinit>`."], [13.5, "The JVM wraps it in `ExceptionInInitializerError` and marks the class **erroneous**. Permanently."], [21, "Call 2. The class is in the error state, so `<clinit>` never runs again\u2026"], [26.5, "\u2026and you get `NoClassDefFoundError: Could not initialize class Greeter`. Call 3: the same."], [34, "That message looks like a missing class. But `Greeter.class` is right there. It failed to initialise."], [41.5, "This JDK 17 even adds a `Caused by` naming the original exception and the thread it happened in."], [49, "In production the first failure is usually far above. Search backwards for `ExceptionInInitializerError`."], [56, "The only cure is a fresh class: restart the JVM, or load it again through a new class loader."]],
    Hierarchy: [[0.5, "Every class is loaded by a class loader. The JVM ships three, chained by a `parent` link."], [6.5, "At the top, **bootstrap**: native code inside the JVM. It loads `java.base` and the other core modules."], [13.5, "It has no Java object, so `String.class.getClassLoader()` returns `null`."], [19.5, "Below it, the **platform** loader: JDK modules such as `java.sql` and `java.net.http`."], [26, "Then the **application** loader: your classpath. That is who loaded `Greeter`."], [32, "Ask Java and it shows exactly that chain: app, then platform, then `null`."], [38.5, "Careful: `java.xml` and `java.logging` are bootstrap, not platform. The split is by module."], [44, "Below them sit custom loaders: app servers, plugin systems, test runners."]],
    Delegation: [[0.5, "Every loader follows one rule before loading anything itself: ask the parent first."], [5.5, "`Main` needs `Greeter`, so the app loader is asked. Step 1: already loaded? No."], [11.5, "Step 2: it delegates to its parent, the platform loader, which delegates to bootstrap."], [18, "Bootstrap looks in the core modules. No `Greeter` there, so it comes back empty-handed."], [24, "Back down: platform looks in its modules. Not there either."], [29, "Step 3: only now does the app loader search the classpath. It finds `Greeter.class` and defines the class."], [36.5, "Next time, step 1 answers at once: each loader caches the classes it has loaded."], [42, "Now ship your own `java/lang/String.class` on the classpath, and ask for `java.lang.String`\u2026"], [48, "\u2026the request goes to bootstrap, which owns `java.lang` and returns the real one. Your fake is never read."], [54, "And defining a class in `java.lang` yourself is refused: `SecurityException: Prohibited package name`."]],
    Identity: [[0.5, "The rule behind Java's most baffling error: a class is identified by its name **and** its loader."], [7.5, "Two custom loaders, `a` and `b`, both read the same `Greeter.class` from `plugins/`."], [13.5, "Each defines its own class. Same name, same bytes, two separate classes in metaspace."], [20, "`ga == gb` prints `false`. And `Main`'s own `Greeter` came from the app loader: a third one."], [27.5, "Create an object from `b`'s class. Its header points to `Greeter` as defined by `b`."], [33.5, "Now cast it to `Greeter` as written in this code, which means `Greeter` defined by the app loader."], [39.5, "`ClassCastException`: `Greeter` cannot be cast to `Greeter`. Not impossible. Two different types."], [47, "JDK 17 names both loaders in the message. Older JDKs printed only `Greeter cannot be cast to Greeter`."], [54, "You meet this in app servers, plugin systems, hot reload, and with a jar on two classpaths."]],
    CnfeNcdfe: [[0.5, "Two errors with almost the same name and very different causes."], [5, "`ClassNotFoundException`: you asked for a class **by name**, with `Class.forName` or `loadClass`, and it isn't there."], [12.5, "It's a checked exception, thrown straight from the loader. Usually a typo, or an absent optional dependency."], [20, "`NoClassDefFoundError`: the JVM itself needed the class, while running code that compiled fine."], [27, "Here `Greeter.class` was deleted after compiling. The `invokestatic` on line 4 cannot resolve."], [33.5, "Look at the cause: underneath, the loader threw `ClassNotFoundException`. The JVM wrapped it in an `Error`."], [41, "And the other kind: `Could not initialize class`. The class is there; its initialiser failed earlier."], [46.5, "Explicit lookup by name: an exception. The JVM linking or initialising: an error."]],
    CustomLoader: [[0.5, "Writing a class loader once makes plugins and hot reload make sense. This is the whole thing."], [6.5, "The constructor passes a parent to `super`. That keeps delegation intact."], [12, "`findClass` reads the bytes from a directory and calls `defineClass`. That is where loading really happens."], [19.5, "`loadClass`, inherited, is the template: cache check, then the parent, then your `findClass`."], [26.5, "So override `findClass`, never `loadClass`. Replacing `loadClass` throws away delegation and its protection."], [34, "Try it. With the app loader as parent, the app loader finds `Greeter` first. Yours never looks."], [41.5, "With the platform loader as parent, nobody above knows `Greeter`, so `SimpleLoader` defines it."], [48.5, "After `defineClass`, the usual pipeline applies: link and initialise on demand."]],
    HotReload: [[0.5, "Hot reload does not reload a class. A class can never change once it is defined."], [5.5, "Instead, create a **new loader** and load the class again through it."], [11, "Version 1: a fresh `SimpleLoader` defines `Greeter`, and its `<clinit>` runs."], [17.5, "Version 2: another loader, another `Greeter`. A different identity hash: a different `Class` object."], [24, "Each copy has its own statics, and runs its own `<clinit>` again."], [30, "That is why hot reload causes `Greeter cannot be cast to Greeter`: old objects belong to the old class."], [37.5, "And the old classes? They can only go away once their loader is unreachable."]],
    Unloading: [[0.5, "A class is unloaded only when its entire loader is unreachable."], [5.5, "Why the whole loader? Every object points to its class, and every class points to its loader."], [12, "And the loader holds every class it defined. It is one graph: loader, classes, statics, instances."], [18.5, "One live reference into any part of it keeps all of it in metaspace."], [24, "Drop the last reference and let GC run: the whole graph goes. The log shows three `Greeter`s unloaded."], [31.5, "Keep one instance in a static list and run again: nothing is unloaded."], [37.5, "That is a classloader leak. Redeploy 20 times and 20 copies of every class pile up in metaspace\u2026"], [44.5, "\u2026until `OutOfMemoryError: Metaspace`. The usual culprits are tiny references like these."], [52, "The built-in loaders live as long as the JVM, so their classes are never unloaded."]],
    Traps: [[0.5, "Five traps worth avoiding."], [3, "`NoClassDefFoundError` often means a static initialiser threw, not that a jar is missing."], [9.5, "`Greeter cannot be cast to Greeter` means two loaders. Print the loader on both sides."], [16, "Never override `loadClass`. Override `findClass`."], [22, "Static blocks run lazily, on a real trigger. Constants never trigger them."], [28.5, "Classes are unloaded only with their whole loader."]],
    Recap: [[0.5, "Recap."], [3, "Load, then verify, prepare and resolve, then initialise. Defaults first, your values in `<clinit>`."], [9, "Loaded when first needed, initialised on the first trigger, exactly once, under a lock."], [15, "The verifier is a real security boundary."], [20.5, "A failed initialiser is permanent, and shows up later as `NoClassDefFoundError`."], [26, "Loaders ask their parent first, so core classes cannot be replaced."], [31.5, "And a class is its name plus its loader. That explains `X cannot be cast to X`, hot reload and leaks."]]
  };
  var GREETER = GREETER_SRC.join("\n");
  var MAIN = MAIN_SRC.join("\n");
  var notes = [
    { ch: 1, blocks: [
      { p: "Getting a class into a running JVM happens in **three phases**, always in this order. Linking is itself three steps." },
      { mini: { scene: "Phases" } },
      { table: { head: ["phase", "does"], rows: [["**Loading**", "A class loader finds the `.class` bytes; the JVM parses them, builds the class metadata and creates the `java.lang.Class` object"], ["**Linking: verify**", "Proves the bytecode is well-formed and type-safe (chapter 3)"], ["**Linking: prepare**", "Allocates static fields and sets them to **default** values (`0`, `null`, `false`)"], ["**Linking: resolve**", "Turns symbolic references (`#7 Fieldref Greeter.count:I`) into direct ones. Lazy in HotSpot"], ["**Initialisation**", "Runs `<clinit>`: static initialisers and static field assignments, in source order"]] } },
      { p: "Our running example, used for the rest of the topic:" },
      { code: GREETER, title: "Greeter.java" },
      { code: MAIN, title: "Main.java" },
      { h: "Greeter, phase by phase" },
      { mini: { scene: "Timeline" } },
      { p: "`javac` gathers every static initialiser and static field assignment, in source order, into one method named `<clinit>` (`static {}` in `javap`). Initialisation is simply the JVM running it." },
      { tryit: { cmd: "$ javap -c -p Greeter.class", out: "  static {};\n    Code:\n       0: iconst_5\n       1: putstatic     #7                  // Field count:I\n       4: getstatic     #17                 // Field java/lang/System.out:Ljava/io/PrintStream;\n       7: ldc           #23                 // String   Greeter.<clinit> runs\n       9: invokevirtual #25                 // Method java/io/PrintStream.println:(Ljava/lang/String;)V\n      12: return", outLang: "bytecode" } },
      { callout: { tone: "violet", title: "deeper: where things live in HotSpot", text: "The parsed class is an `InstanceKlass` in **metaspace** (8.3). The `java.lang.Class` object is a normal heap object, the **mirror**, and HotSpot stores the **static fields inside the mirror**. HotSpot tracks each class through states: `loaded` \u2192 `linked` \u2192 `being_initialized` \u2192 `fully_initialized` (or `initialization_error`). It actually allocates and zeroes the static storage when it creates the mirror during loading; the spec only requires that by the end of preparation. Either way, nothing can read a static before it holds its default." } },
      { callout: { tone: "violet", title: "deeper: what about HELLO?", text: "`HELLO` has a `ConstantValue` attribute (`javap -v` shows `ConstantValue: String Hello`). The spec sets such fields at the start of initialisation, before `<clinit>` runs, which is why `<clinit>` has no instruction for it. And since `javac` copies the value into every caller, other classes almost never read the field at all." } },
      { h: "The prepare/init gap is observable" },
      { mini: { scene: "PrepareGap" } },
      { code: 'public class Greeter {\n    static final Greeter DEFAULT = new Greeter();  // runs first\n    static int count = 5;\n    Greeter() {\n        System.out.println("constructor sees count = " + count);\n    }\n}', title: "Greeter.java (gap version)" },
      { tryit: { note: "Main just reads `Greeter.DEFAULT`, then prints `Greeter.count`.", cmd: "$ javac Greeter.java Main.java\n$ java Main", out: "constructor sees count = 0\nafter init, count = 5" } },
      { callout: { tone: "violet", title: "deeper: why no infinite loop?", text: "The constructor reads `count` while `Greeter` is still `being_initialized`. The spec says that when the **same thread** that is initialising a class asks for it again, the request returns immediately, and the thread sees the half-initialised class. That rule is what makes circular initialisation (`A` reads `B.y` while `B` reads `A.x`) produce defaults instead of a deadlock or an error." } }
    ] },
    { ch: 2, blocks: [
      { p: "The JVM does not load your whole program at startup. A class is **loaded** when something first needs it, and **initialised** later still, on the first real trigger. You can watch it happen." },
      { mini: { scene: "LazyLog" } },
      { tryit: { note: "Output filtered to our two classes (the full log is 497 class loads, 485 of them from the CDS archive).", cmd: "$ java -Xlog:class+load,class+init -cp . Main", out: "[0.019s][info][class,load] Main source: file:\u2026/lazy/\n[0.019s][info][class,init] Start class verification for: Main\n[0.019s][info][class,init] End class verification for: Main\n[0.019s][info][class,init] 288 Initializing 'Main'(no method) (0x0000000401000800)\nmain starts\n[0.019s][info][class,load] Greeter source: file:\u2026/lazy/\nHello\nabout to call greet\n[0.020s][info][class,init] Start class verification for: Greeter\n[0.020s][info][class,init] End class verification for: Greeter\n[0.020s][info][class,init] 292 Initializing 'Greeter' (0x0000000401000a08)\n  Greeter.<clinit> runs\nHello, Ada\ncount = 6" } },
      { list: ["`new Greeter[3]` compiles to `anewarray #21 // class Greeter`. Creating the array type needs the class **loaded**, but no `Greeter` object exists, so it is not initialised.", '`Greeter.HELLO` compiled to `ldc "Hello"` inside `Main`. `Greeter` is not involved at all.', "`Greeter.class` compiles to `ldc #21 // class Greeter`: it gives you the `Class` object, nothing more.", "`Greeter.greet(...)` is `invokestatic`: a trigger. Note that **verification** of `Greeter` also waited until this moment: HotSpot links a class just before it initialises it."] },
      { callout: { tone: "pull", text: "`-verbose:class` is the old spelling of `-Xlog:class+load`. Add `class+init` to see verification and initialisation, and `class+unload` to see classes leave (chapter 10)." } },
      { h: "Resolution is lazy too" },
      { mini: { scene: "LazyResolve" } },
      { tryit: { cmd: "$ javac Main.java Greeter.java && rm Greeter.class\n$ java Main\n$ java Main go", out: 'main starts\nmain ends\nmain starts\nException in thread "main" java.lang.NoClassDefFoundError: Greeter\n	at Main.main(Main.java:5)\nCaused by: java.lang.ClassNotFoundException: Greeter\n	\u2026' } },
      { callout: { tone: "violet", title: "deeper", text: 'The spec lets a JVM resolve eagerly or lazily, but any error must surface **as if** resolution were lazy: at the instruction that first uses the reference. HotSpot really is lazy, and caches each resolved entry beside the constant pool (8.1). One exception to "nothing loads early": the verifier may load a class sooner to check that one type is assignable to another.' } }
    ] },
    { ch: 3, blocks: [
      { p: "Before any method of a class runs, the **verifier** proves the bytecode cannot break the machine. It runs once per class, during linking." },
      { mini: { scene: "VerifyChecks" } },
      { list: ["The operand stack never underflows or overflows (it stays within `max_stack`, 8.1).", "Types match on every path: no `int` used as a reference, no reference used as an `int`.", "`final` classes are not subclassed; `final` fields are not assigned outside their initialiser.", "Jumps land on real instruction boundaries.", "Every local variable is assigned before it is read."] },
      { p: "**Why it matters:** this is what makes the JVM a sandbox. Handcrafted or corrupted bytecode cannot forge a reference, read arbitrary memory, or escape the type system. Running untrusted code (applets, once) was only conceivable because of the verifier." },
      { h: "Breaking one byte" },
      { mini: { scene: "VerifyError" } },
      { tryit: { note: "Patch the first instruction of `twice` from `iload_1` (0x1b) to `aload_0` (0x2a).", cmd: `$ javac Bad.java
$ python3 -c "b=open('Bad.class','rb').read(); i=b.index(bytes([0x1b,0x1b,0x60,0xac])); open('Bad.class','wb').write(b[:i]+b'\\x2a'+b[i+1:])"
$ java Bad`, out: "Error: Unable to initialize main class Bad\nCaused by: java.lang.VerifyError: Bad type on operand stack\nException Details:\n  Location:\n    Bad.twice(Ljava/lang/String;I)I @2: iadd\n  Reason:\n    Type 'java/lang/String' (current frame, stack[0]) is not assignable to integer\n  Current Frame:\n    bci: @2\n    flags: { }\n    locals: { 'java/lang/String', integer }\n    stack: { 'java/lang/String', integer }\n  Bytecode:\n    0000000: 2a1b 60ac" } },
      { tryit: { note: "The same patched class with the verifier switched off:", cmd: "$ java -Xverify:none Bad", out: "OpenJDK 64-Bit Server VM warning: Options -Xverify:none and -noverify were deprecated in JDK 13 and will likely be removed in a future release.\n-2014206267" } },
      { callout: { tone: "bad", title: "correction to the source note", text: 'The note says `-Xverify:none` was "removed" and is now ignored. On JDK 17 it is **deprecated, not removed**: it prints a warning and still disables verification, as the garbage number above proves. Treat it as gone anyway; never use it.' } },
      { callout: { tone: "violet", title: "deeper: fast verification", text: "Since Java 6, `javac` writes a `StackMapTable` attribute: the expected types at each jump target. The verifier then only **checks** those frames in one linear pass instead of inferring types itself, which is why verification is cheap. It is mandatory for class files version 51 (Java 7) and newer." } },
      { tryit: { note: "Who gets verified? Classes from the boot loader are trusted.", cmd: "$ java -XX:+UnlockDiagnosticVMOptions -XX:+PrintFlagsFinal -version | grep BytecodeVerification", out: "     bool BytecodeVerificationLocal                = false                                  {diagnostic} {default}\n     bool BytecodeVerificationRemote               = true                                   {diagnostic} {default}" } }
    ] },
    { ch: 4, blocks: [
      { p: 'Static initialisers running "later than you expect" is a real bug class, so the rules are worth knowing exactly. A class initialises on the **first** of these:' },
      { mini: { scene: "Triggers" } },
      { table: { head: ["trigger", "example", "in bytecode"], rows: [["an instance is created", "`new Greeter()`", "`new`"], ["a static method is invoked", '`Greeter.greet("Ada")`', "`invokestatic`"], ["a static field is read or written, **unless it is a compile-time constant**", "`Greeter.count++`", "`getstatic` / `putstatic`"], ["a subclass is initialised (superclass first)", "`new Sub()` initialises `Base` first", "\u2014"], ["it is the main class", "`java Main`", "\u2014"], ["reflection", '`Class.forName("Greeter")`, `newInstance`, `Method.invoke`', "\u2014"]] } },
      { h: "What does not initialise" },
      { mini: { scene: "NotTriggers" } },
      { table: { head: ["action", "loads?", "initialises?", "why"], rows: [["declaring a variable `Loud x;`", "no", "no", "no use yet"], ["`new Loud[10]`", "yes", "no", "the array type needs the class, but no `Loud` object exists"], ['reading `static final String NAME = "x"`', "no", "no", "**inlined at compile time**"], ["`Loud.class`", "yes", "no", "just the `Class` object"], ['`Class.forName("Loud", false, loader)`', "yes", "no", "`false` = do not initialise"], ['`loader.loadClass("Loud")`', "yes", "no", "loading only"], ["`Sub.shared` where `shared` is declared in `Base`", "both", "only `Base`", "only the declaring class initialises"]] } },
      { tryit: { note: "Output with the class log filtered to Loud, Base and Sub:", cmd: "$ java -Xlog:class+load,class+init T", out: `1. new Loud[10]
[0.020s][info][class,load] Loud source: file:\u2026/
2. Loud.NAME
x
3. Loud.class
4. Class.forName("Loud", false, ...)
5. Sub.shared   (field declared in Base)
[0.021s][info][class,load] Base source: file:\u2026/
[0.021s][info][class,load] Sub source: file:\u2026/
[0.021s][info][class,init] 292 Initializing 'Base' (0x0000007001000400)
  Base initialised
1
6. Loud.ITEMS
[0.021s][info][class,init] 293 Initializing 'Loud' (0x0000007001000a08)
  Loud initialised
[]
7. new Sub()
[0.021s][info][class,init] 295 Initializing 'Sub' (0x0000007001001000)
  Sub initialised` } },
      { callout: { tone: "violet", title: "deeper: what counts as a constant", text: 'A **compile-time constant** is a `static final` field of primitive or `String` type whose initialiser is a constant expression (`"x"`, `42`, `"a" + 1`). `List.of()`, `new Object()` or any method call is not, so `ITEMS` is a real field read. Interfaces follow their own rule: initialising a class does **not** initialise the interfaces it implements, unless they declare default methods.' } },
      { h: "Once, under a lock" },
      { mini: { scene: "InitLock" } },
      { tryit: { note: "While T1 sleeps inside `<clinit>`, a thread dump of T2:", cmd: "$ jcmd <pid> Thread.print", out: '"T2" #15 prio=5 os_prio=31 cpu=0.05ms elapsed=1.85s tid=0x00000008ccdf0c00 nid=0xa903 in Object.wait()  [0x000000017227e000]\n   java.lang.Thread.State: RUNNABLE\n	at Race.lambda$main$0(Race.java:3)\n	- waiting on the Class initialization monitor for Greeter' } },
      { p: "**Initialisation is thread-safe and happens exactly once.** The JVM keeps a per-class init lock: the first thread marks the class `being_initialized` and runs `<clinit>`; any other thread waits until it is `fully_initialized` (or erroneous). That guarantee is what makes the enum singleton (2.7) and the holder idiom correct with no synchronisation of your own:" },
      { code: "class Lazy {\n    private static class Holder {                 // not initialised until first use\n        static final Expensive INSTANCE = new Expensive();\n    }\n    static Expensive get() { return Holder.INSTANCE; }   // thread-safe, lazy, no locks\n}", title: "the holder idiom" },
      { callout: { tone: "bad", title: "class-init deadlock", text: 'If thread 1 initialises `A`, whose `<clinit>` touches `B`, while thread 2 initialises `B`, whose `<clinit>` touches `A`, each waits for the other forever. Both threads show `RUNNABLE` with "waiting on the Class initialization monitor". Keep static initialisers small and free of cross-class cycles.' } }
    ] },
    { ch: 5, blocks: [
      { p: "If a static initialiser **throws**, the class is marked erroneous **permanently**. The first access throws `ExceptionInInitializerError`; every later access throws `NoClassDefFoundError: Could not initialize class \u2026`, which looks like a missing class and is not." },
      { mini: { scene: "FailedInit" } },
      { code: 'public class Greeter {\n    static int count = Integer.parseInt(System.getProperty("greet.count"));  // property missing!\n    static String greet(String name) { count++; return "Hello, " + name; }\n}', title: "Greeter.java (broken)" },
      { tryit: { cmd: "$ java Main", out: 'call 1: java.lang.ExceptionInInitializerError\ncall 2: java.lang.NoClassDefFoundError: Could not initialize class Greeter\ncall 3: java.lang.NoClassDefFoundError: Could not initialize class Greeter\nException in thread "main" java.lang.NoClassDefFoundError: Could not initialize class Greeter\n	at Main.main(Main.java:10)\nCaused by: java.lang.ExceptionInInitializerError: Exception java.lang.NumberFormatException: Cannot parse null string [in thread "main"]\n	at java.base/java.lang.Integer.parseInt(Integer.java:630)\n	at java.base/java.lang.Integer.parseInt(Integer.java:786)\n	at Greeter.<clinit>(Greeter.java:2)\n	at Main.main(Main.java:5)' } },
      { steps: ["See `NoClassDefFoundError: Could not initialize class X`? The class file is **present**. Do not chase the classpath.", "Search the log **backwards** for the first `ExceptionInInitializerError` mentioning `X`.", "Its `Caused by` is the real bug: here a missing system property.", "Fix it and restart. A class in `initialization_error` never recovers in that loader."] },
      { callout: { tone: "violet", title: "deeper", text: 'Only exceptions are wrapped: if `<clinit>` throws an `Error` (say `OutOfMemoryError`), the JVM rethrows that error as is. The `Caused by: \u2026 [in thread "main"]` on the later `NoClassDefFoundError` is recent; this output is from JDK 17.0.17, and older JDKs print the bare message with no cause, which is why "search backwards" is the habit to keep.' } }
    ] },
    { ch: 6, blocks: [
      { p: "Every class is loaded by a **class loader**. The JVM provides three, linked by a `parent` reference; frameworks add their own below them." },
      { mini: { scene: "Hierarchy" } },
      { table: { head: ["loader", "loads", "getClassLoader()"], rows: [["**bootstrap**", "`java.base` and the other core modules (`java.xml`, `java.logging`, `java.desktop`\u2026)", "`null`: native, no Java object"], ["**platform**", "other JDK modules (`java.sql`, `java.net.http`\u2026)", "`PlatformClassLoader`"], ["**application**", "your classpath / module path", "`AppClassLoader` (= `ClassLoader.getSystemClassLoader()`)"], ["custom", "web apps, plugins, OSGi bundles, test runners", "whatever you create"]] } },
      { tryit: { cmd: "$ java Who", out: "String     -> null\nConnection -> jdk.internal.loader.ClassLoaders$PlatformClassLoader@bba30dd\nGreeter    -> jdk.internal.loader.ClassLoaders$AppClassLoader@42110406\n  parent   -> jdk.internal.loader.ClassLoaders$PlatformClassLoader@bba30dd\n  parent   -> null\nDocumentBuilder -> null\nLogger     -> null\nHttpClient -> jdk.internal.loader.ClassLoaders$PlatformClassLoader@bba30dd" } },
      { callout: { tone: "bad", title: "correction to the source note", text: 'The note lists `java.xml` under the platform loader. It is a **bootstrap** module: `javax.xml.parsers.DocumentBuilder.class.getClassLoader()` returns `null` (output above), as does `java.util.logging.Logger`. The platform loader gets modules like `java.sql` and `java.net.http`. The split is decided per module, not "java.base versus the rest".' } },
      { h: "Parent delegation" },
      { mini: { scene: "Delegation" } },
      { code: "load(name):\n    1. already loaded by me?   \u2192 return it\n    2. ask the PARENT first    (bootstrap if there is no parent)\n    3. only if that fails, look myself: findClass(name)", lang: "plain", title: "the rule every loader follows" },
      { p: "**Why it exists: security and consistency.** You cannot ship a class called `java.lang.String` and have it used. The request reaches bootstrap, which finds the real one, so your copy is never read. And as a second wall, `defineClass` refuses any package starting with `java.`:" },
      { tryit: { cmd: '$ java -Xlog:class+load -cp out:. UseIt | grep "String "\n$ java Prohibited', out: '[0.009s][info][class,load] java.lang.String source: shared objects file\nException in thread "main" java.lang.SecurityException: Prohibited package name: java.lang\n	at java.base/java.lang.ClassLoader.preDefineClass(ClassLoader.java:900)' } },
      { callout: { tone: "violet", title: "deeper: JDK 9+ delegation is module-aware", text: "The built-in loaders first look up which **module** owns the package. If it is a named module, the request goes straight to that module's loader (`java.lang` \u2192 `java.base` \u2192 bootstrap), skipping the walk. Only classes in no known module (your classpath) use the classic parent-first walk you saw for `Greeter`." } },
      { callout: { tone: "pull", title: "the deliberate exception", text: 'Some JDK code must load classes it cannot see, such as a JDBC driver or a `ServiceLoader` provider on your classpath. It asks the **thread context class loader** (`Thread.currentThread().getContextClassLoader()`), usually the app or web-app loader. That is how lookups go "downward", and a common source of leaks (chapter 10).' } }
    ] },
    { ch: 7, blocks: [
      { p: "**Two classes with the same fully-qualified name, loaded by different loaders, are different types.** Internally the JVM keys every class by the pair **(name, defining loader)**." },
      { mini: { scene: "Identity" } },
      { tryit: { cmd: "$ java TwoLoaders", out: `Greeter == Greeter ? false
  Greeter.<clinit> runs
o's loader: SimpleLoader@8bcc55f
app Greeter's loader: jdk.internal.loader.ClassLoaders$AppClassLoader@42110406
Exception in thread "main" java.lang.ClassCastException: class Greeter cannot be cast to class Greeter (Greeter is in unnamed module of loader SimpleLoader @8bcc55f; Greeter is in unnamed module of loader 'app')
	at TwoLoaders.main(TwoLoaders.java:13)` } },
      { p: "**Where it happens:**" },
      { list: ["Application servers (Tomcat, WebLogic): one loader per deployed app.", "OSGi, plugin systems, hot reloading.", "A jar present on **both** the app classpath and a plugin's classpath."] },
      { code: "System.out.println(a.getClass().getClassLoader());\nSystem.out.println(b.getClass().getClassLoader());     // different? that's your answer", title: "how to diagnose" },
      { callout: { tone: "violet", title: "deeper: loader constraints", text: "When a method call crosses two loaders, the JVM records a **loader constraint**: both loaders must agree on what each class name in the signature means. If they later disagree, linking fails with `LinkageError: loader constraint violation` instead of letting two `Greeter`s mix silently." } }
    ] },
    { ch: 8, blocks: [
      { p: "**Different causes.** Telling them apart saves hours." },
      { mini: { scene: "CnfeNcdfe" } },
      { table: { head: ["", "`ClassNotFoundException`", "`NoClassDefFoundError`"], rows: [["type", "checked **Exception** (4.1)", "**Error**"], ["trigger", "**explicit** lookup: `Class.forName`, `loadClass`", "**implicit**: the JVM needed it while linking or initialising"], ["means", "you asked for a class by name and it is not there", "it was there at compile time and is not now, **or it failed to initialise**"], ["usual cause", "a typo, or an absent optional dependency", "**classpath mismatch**, or a static initialiser that threw earlier"]] } },
      { tryit: { cmd: '$ java Lookup        # Class.forName("Greetr")', out: 'Exception in thread "main" java.lang.ClassNotFoundException: Greetr\n	at java.base/jdk.internal.loader.BuiltinClassLoader.loadClass(BuiltinClassLoader.java:641)\n	at java.base/jdk.internal.loader.ClassLoaders$AppClassLoader.loadClass(ClassLoaders.java:188)\n	at java.base/java.lang.ClassLoader.loadClass(ClassLoader.java:525)\n	at java.base/java.lang.Class.forName0(Native Method)\n	at java.base/java.lang.Class.forName(Class.java:377)\n	at Lookup.main(Lookup.java:3)' } },
      { tryit: { cmd: "$ rm Greeter.class && java Main", out: 'main starts\nException in thread "main" java.lang.NoClassDefFoundError: Greeter\n	at Main.main(Main.java:4)\nCaused by: java.lang.ClassNotFoundException: Greeter\n	at java.base/jdk.internal.loader.BuiltinClassLoader.loadClass(BuiltinClassLoader.java:641)\n	at java.base/jdk.internal.loader.ClassLoaders$AppClassLoader.loadClass(ClassLoaders.java:188)\n	at java.base/java.lang.ClassLoader.loadClass(ClassLoader.java:525)\n	... 1 more' } },
      { callout: { tone: "pull", title: "the trap worth remembering", text: "`NoClassDefFoundError: Could not initialize class X` almost never means X is missing. It means X's static initialiser threw, probably much earlier in the log. Search backwards for `ExceptionInInitializerError` (chapter 5)." } }
    ] },
    { ch: 9, blocks: [
      { p: "Write one class loader, once, and plugin systems and hot reload stop being magic." },
      { mini: { scene: "CustomLoader" } },
      { code: "import java.io.IOException;\nimport java.nio.file.*;\n\n" + SIMPLE_LOADER.join("\n"), title: "SimpleLoader.java" },
      { callout: { tone: "pull", title: "override findClass, not loadClass", text: "`loadClass` implements the template: cache check, parent, then `findClass`. Overriding it breaks delegation, and with it the guarantee that core and shared classes come from one place. `findClass` is the hook it calls only when the parent fails." } },
      { tryit: { note: "Same loader, two different parents:", cmd: "$ java Delegation", out: "parent=app      -> jdk.internal.loader.ClassLoaders$AppClassLoader@42110406\nparent=platform -> SimpleLoader@58644d46" } },
      { h: "Hot reload" },
      { mini: { scene: "HotReload" } },
      { p: "**Hot reloading works by throwing the loader away**, not by reloading a class. A defined class never changes; a new loader defines a new class with a new identity, new statics, and a fresh `<clinit>` run." },
      { code: 'var loader = new SimpleLoader(dir, parent);\nvar clazz = loader.loadClass("com.example.Plugin");\n// ... later, to "reload":\nloader = new SimpleLoader(dir, parent);      // a NEW loader \u2192 a NEW class identity', title: "reload = new loader" },
      { p: "Which is exactly why hot reload produces `X cannot be cast to X`: objects created before the reload belong to the old class." }
    ] },
    { ch: 10, blocks: [
      { p: "A class can be unloaded **only when its entire loader is unreachable**: the loader, every class it defined, and every instance of those classes (8.7)." },
      { mini: { scene: "Unloading" } },
      { code: "object \u2192 its Class \u2192 its ClassLoader \u2192 all its other Classes \u2192 their static fields \u2192 \u2026", lang: "plain", title: "one graph" },
      { tryit: { note: "The Reload loop from chapter 9, then `System.gc()`:", cmd: "$ java -Xlog:class+load,class+unload Reload", out: "[0.035s][info][class,unload] unloading class Greeter 0x0000007001005400\n[0.035s][info][class,unload] unloading class Greeter 0x0000007001005800\n[0.035s][info][class,unload] unloading class Greeter 0x0000007001001000\nafter GC" } },
      { tryit: { note: "Same program, but each instance is kept in a static list:", cmd: "$ java -Xlog:class+unload Reload keep", out: "  Greeter.<clinit> runs\nv1: Hello, Ada  class@7f31245a\n  Greeter.<clinit> runs\nv2: Hello, Ada  class@266474c2\n  Greeter.<clinit> runs\nv3: Hello, Ada  class@66d3c617\nafter GC          \u2190 no unloading lines at all" } },
      { list: ["**Bootstrap, platform and application loaders are never unloaded**: they live as long as the JVM.", "Custom loaders **can** be, if nothing references them.", "A **classloader leak** is the classic app-server bug: redeploy 20 times and 20 copies of every class stay in metaspace (8.3), until `OutOfMemoryError: Metaspace`."] },
      { p: "Common causes: a `ThreadLocal` value on a pooled thread, a JDBC driver registered in `DriverManager`, a shutdown hook, a logging framework holding the context class loader, a thread started by the app and never stopped." },
      { callout: { tone: "violet", title: "deeper", text: "Unloading is done by the garbage collector, during a cycle that processes class metadata (with G1, the remark of a concurrent cycle or a full GC). There is no `unload()` method: you make the loader unreachable and wait." } }
    ] }
  ];
  var traps = [
    "`NoClassDefFoundError` is not always a missing jar. **Could not initialize class X** means X's static initialiser threw earlier: find the first `ExceptionInInitializerError`.",
    "`X cannot be cast to X` is not impossible: two loaders defined two classes. Print `getClassLoader()` on both sides.",
    "Overriding `loadClass` breaks parent delegation. Override `findClass`.",
    "A static block does not run when a class is declared, referenced as `Foo.class`, used in `new Foo[n]`, or read for a compile-time constant. Initialisation is lazy.",
    "Static initialisers run top to bottom: a static read before its own line runs sees `0` or `null`.",
    "Classes are unloaded only when their whole loader is unreachable. One stray reference (a `ThreadLocal`, a driver registry) leaks every class of a redeployed app."
  ];
  var recap = [
    "**Phases**: load \u2192 verify, prepare, resolve \u2192 initialise. Prepare sets defaults; `<clinit>` sets your values.",
    "**Lazy**: loaded on first need, linked just before initialisation, resolved per entry on first use.",
    "**Verification**: a real security boundary; `-Xverify:none` is deprecated (and dangerous, as the garbage `-2014206267` shows).",
    "**Initialisation**: on the first of six triggers, **exactly once, thread-safe**; constants and `new Foo[n]` do not trigger it.",
    "**Failed init**: the class is erroneous permanently; later uses throw `NoClassDefFoundError: Could not initialize class`.",
    "**Delegation**: ask the parent first; you cannot replace `java.lang.String`. `java.xml` is a bootstrap module.",
    "**Identity**: **name + loader**. Explains `X cannot be cast to X` and hot reload.",
    "**CNFE vs NCDFE**: explicit lookup by name vs an implicit link or init failure.",
    "**Unloading**: only when the entire loader graph is unreachable."
  ];
  var quiz = [
    { q: "`NoClassDefFoundError: Could not initialize class Config`. The jar is definitely on the classpath. What do you look for?", options: ["A second copy of Config.class on another classpath entry", "The first `ExceptionInInitializerError` for Config earlier in the log", "A typo in a `Class.forName` call", "A corrupt jar file"], answer: 1, why: '"Could not initialize" means Config is in the `initialization_error` state: its `<clinit>` threw once, earlier. That first failure was reported as `ExceptionInInitializerError` and holds the real cause.' },
    { q: '`class Config { static final int MAX = 10; static { System.out.println("init"); } }`. Another class prints `Config.MAX`. What is printed?', options: ["10 only: the constant was copied into the caller, Config is not even loaded", "init, then 10", "10, then init", "init only"], answer: 0, why: "`MAX` is a compile-time constant, so `javac` emits `bipush 10` in the caller. Nothing references Config at runtime." },
    { q: "What does `Greeter[] arr = new Greeter[3];` do to `Greeter`?", options: ["Nothing at all", "Loads and initialises it", "Loads it, but does not initialise it", "Initialises it three times"], answer: 2, why: "`anewarray` must resolve the element class to build the array type, so the class is loaded. No `Greeter` instance exists, so no initialisation (the real log showed the load line with no Initializing line)." },
    { q: "A static initialiser creates an instance whose constructor reads `count`, declared on the next line as `static int count = 5;`. What does the constructor see?", options: ["5", "It throws IllegalStateException", "It deadlocks", "0"], answer: 3, why: "Preparation set `count` to 0. `<clinit>` runs the initialisers top to bottom, and has not reached `count = 5` yet. The same thread re-entering a class it is initialising is allowed through." },
    { q: "Two `URLClassLoader`s, both with the platform loader as parent, load `com.example.User` from the same jar. Why does casting one's instance to the other's class fail?", options: ["A class is identified by name plus defining loader, so these are two distinct types", "The bytes differ slightly each load", "Casting across loaders is forbidden by the security manager", "Because User was not initialised"], answer: 0, why: "Each loader defines its own class. The JVM keys classes by (name, loader), so the cast fails with `class User cannot be cast to class User`, and JDK 17 names both loaders in the message." },
    { q: "Why should a custom class loader override `findClass` and not `loadClass`?", options: ["`loadClass` is final", "`findClass` is faster", "`loadClass` implements parent delegation; overriding it can let your loader shadow core or shared classes", "`defineClass` can only be called from `findClass`"], answer: 2, why: "`loadClass` does cache check \u2192 parent \u2192 `findClass`. Override `findClass` and you only run when every parent has failed, keeping delegation and its security." },
    { q: "Why is the holder idiom thread-safe without `synchronized`?", options: ["Static fields are volatile", "The JIT removes the race", "Holder is initialised at JVM startup", "The JVM initialises a class exactly once under a per-class init lock; other threads wait until it is done"], answer: 3, why: "`Holder` initialises on its first use (`get()`), and the JVM's initialisation protocol guarantees one thread runs `<clinit>` while others block, then all see the finished value." },
    { q: "You put your own `java/lang/String.class` first on the classpath. What happens?", options: ["Your String replaces the JDK's", "It is ignored: the request reaches the bootstrap loader, which returns the real String", "The JVM fails to start", "Both are loaded and you get a ClassCastException"], answer: 1, why: "Delegation (and in JDK 9+ module ownership of `java.lang`) sends the request to bootstrap first; the classpath copy is never read. Defining it yourself fails with `SecurityException: Prohibited package name`." },
    { q: "Bytecode that adds a `String` reference to an `int` is run with `-Xverify:none`. What does that demonstrate?", options: ["Without the verifier, a reference can be read as a number: the type system is no longer enforced", "The JIT fixes the types", "The JVM throws VerifyError anyway", "It runs normally and prints 42"], answer: 0, why: "The real run printed `-2014206267`, the reference's bits used as an int. The verifier is what stops bytecode from forging or reading pointers." },
    { q: "When can a class loaded by a custom loader be unloaded?", options: ["As soon as no instances exist", "When its `Class` object is unreachable", "When the loader, all classes it defined, and all their instances are unreachable, and a GC processes them", "Never"], answer: 2, why: "Objects point to their class, classes point to their loader, and the loader holds all its classes. Any live reference into that graph keeps the whole thing in metaspace." }
  ];
  window.AN.registerTopic({
    id: "8.2",
    part: "08",
    title: "Class loading",
    kicker: "Part 08 \xB7 The JVM",
    lede: "How code gets into a running JVM: loading, linking and initialisation, the loaders that do it, and why this layer produces Java's most baffling errors. Every log line here is real.",
    chapters,
    scenes,
    captions,
    notes,
    traps,
    recap,
    quiz
  });
})();
