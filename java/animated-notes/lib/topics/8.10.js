(() => {
  // src/topics/8.10/scenes1.jsx
  var {
    PAL,
    MOTION,
    lin,
    lerp,
    win,
    pulse,
    step,
    track,
    track1,
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
    Bytes,
    Chip,
    toneColor
  } = window.AN;
  var E = MOTION.enter;
  var M = MOTION.move;
  var POP = MOTION.pop;
  var HELLO_MAIN = [
    "public static void main(String[] args) throws Exception {",
    '    Logger log = Logger.getLogger("hello");',
    '    log.info("starting");',
    '    var xml = Main.class.getResourceAsStream("/greeting.xml");',
    "    String word = DocumentBuilderFactory.newInstance()",
    "            .newDocumentBuilder().parse(xml)",
    "            .getDocumentElement().getTextContent();",
    '    String names = List.of("ada", "linus", "grace").stream()',
    "            .map(String::toUpperCase)",
    '            .collect(Collectors.joining(", "));',
    '    System.out.println(word + ", " + names);',
    '    String impl = System.getProperty("greeter", "app.Polite");',
    "    Greeter g = (Greeter) Class.forName(impl)",
    "            .getDeclaredConstructor().newInstance();",
    '    System.out.println(g.greet("world"));',
    "}"
  ];
  function Note({ x, y, w, text, title, tone = "pull", a = 1, fs = 22 }) {
    if (a <= 5e-3) return null;
    const c = toneColor(tone);
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, width: w, boxSizing: "border-box", opacity: clamp(a, 0, 1), transform: `translateY(${(1 - clamp(a, 0, 1)) * 10}px)`, background: hexA(c, 0.08), borderLeft: `4px solid ${c}`, borderRadius: "0 12px 12px 0", padding: "14px 20px" } }, title && /* @__PURE__ */ React.createElement("div", { style: { font: `600 17px ${MONO}`, color: c, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 } }, title), /* @__PURE__ */ React.createElement("div", { style: { font: `400 ${fs}px ${SANS}`, color: PAL.ink, lineHeight: 1.4, textWrap: "pretty" } }, typeof text === "string" ? window.AN.fmt(text) : text));
  }
  function DocTag({ x, y, a = 1, text = "documented \xB7 not measured here" }) {
    return /* @__PURE__ */ React.createElement(Badge, { x, y, text, tone: "violet", a, fs: 17, anchor: "left" });
  }
  function MeasTag({ x, y, a = 1, text = "measured \xB7 JDK 17" }) {
    return /* @__PURE__ */ React.createElement(Badge, { x, y, text, tone: "flow", a, fs: 17, anchor: "left" });
  }
  function SIntro({ t }) {
    const ms = Math.round(lin(t, 3.4, 2.6) * 122);
    const cls = Math.round(lin(t, 3.4, 2.6) * 1287);
    const chips = [["CDS", "flow", 1120], ["Leyden", "flow", 1240], ["jlink", "pull", 1356], ["jpackage", "pull", 1490], ["native image", "violet", 1660]];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 150, mono: true, fs: 22, weight: 600, color: PAL.pull, a: E(t, 0.3), style: { letterSpacing: "0.14em" } }, "PART 08 \xB7 THE JVM \xB7 8.10"), /* @__PURE__ */ React.createElement(Txt, { x: 92, y: 192, fs: 110, weight: 700, lh: 1, a: E(t, 0.6, 0.9), style: { letterSpacing: "-0.03em", transform: `translateY(${(1 - E(t, 0.6, 0.9)) * 24}px)` } }, "Startup, packaging and AOT"), /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 330, fs: 36, color: PAL.ink2, a: E(t, 1.4, 0.8) }, "Why a JVM is slow to start, and every way to make it start faster or ship smaller."), /* @__PURE__ */ React.createElement(Console, { x: 96, y: 470, w: 900, h: 300, t, a: E(t, 1.8), fs: 20, lh: 34, items: [
      { at: 2.4, text: "java -Xshare:off -jar hello.jar", kind: "cmd" },
      { at: 4.6, text: "Oct 05, 2026 12:14:39 PM app.Main main", kind: "dim" },
      { at: 4.8, text: "INFO: starting", kind: "dim" },
      { at: 5.4, text: "Hello, ADA, LINUS, GRACE" },
      { at: 5.8, text: "Good day, world." }
    ] }), /* @__PURE__ */ React.createElement(Txt, { x: 546, y: 790, anchor: "mid", fs: 20, color: PAL.ink2, a: E(t, 6) }, "the running example: `hello.jar`, three small classes"), /* @__PURE__ */ React.createElement(Txt, { x: 1080, y: 470, mono: true, fs: 110, weight: 700, lh: 1, color: PAL.pull, a: E(t, 3.2) }, ms, " ms"), /* @__PURE__ */ React.createElement(Txt, { x: 1084, y: 592, fs: 22, color: PAL.ink2, a: E(t, 3.4) }, "wall clock, median of 50 runs \xB7 JDK 17, sharing off"), /* @__PURE__ */ React.createElement(Txt, { x: 1080, y: 640, mono: true, fs: 52, weight: 600, lh: 1, color: PAL.ink, a: E(t, 3.6) }, cls.toLocaleString("en-US"), " classes"), /* @__PURE__ */ React.createElement(Txt, { x: 1084, y: 704, fs: 22, color: PAL.ink2, a: E(t, 3.8) }, "loaded to print two lines"), chips.map(([l, tone, x], i) => /* @__PURE__ */ React.createElement(Chip, { key: l, x, y: 800, text: l, tone, o: POP(t, 12.4 + i * 0.45), fs: 22 })), /* @__PURE__ */ React.createElement(Txt, { x: 1080, y: 850, fs: 20, color: PAL.ink3, a: E(t, 14.5) }, "start faster \xB7 ship smaller \xB7 or stop being a JVM"), /* @__PURE__ */ React.createElement(MeasTag, { x: 96, y: 880, a: E(t, 17.5), text: "every JDK 17 number in this topic was measured, not quoted" }));
  }
  var PH_OFF = [0, 35.1, 45.5, 102.8, 119.9, 123.9];
  var PHASES = [
    { name: "JVM boot", tone: "violet", cls: "", at: 6 },
    { name: "launcher", tone: "blue", cls: "531 classes so far", at: 13 },
    { name: "first log line", tone: "pull", cls: "+538 classes", at: 20 },
    { name: "XML", tone: "pink", cls: "+190", at: 28 },
    { name: "", tone: "green", cls: "+28", at: 35 }
  ];
  function STimeline({ t }) {
    const X0 = 170, S = 13, BY = 770, BH = 70;
    const tone = (a, b, tn) => ({ tone: tn, toneA: win(t, a, b, 0.3) });
    const lines = HELLO_MAIN.map((s, i) => {
      let o = {};
      if (i === 1 || i === 2) o = tone(20, 28, "pull");
      if (i >= 3 && i <= 6) o = tone(28, 35, "pink");
      if (i >= 7 && i <= 14) o = tone(35, 42, "green");
      return { s, ...o };
    });
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code, { x: 96, y: 196, w: 790, h: 500, title: "app/Main.java", a: E(t, 0.4), fs: 17, lh: 27, lines }), /* @__PURE__ */ React.createElement(Console, { x: 930, y: 196, w: 894, h: 232, t, a: E(t, 0.8), fs: 17, lh: 30, items: [
      { at: 1.2, text: "java -Xshare:off -Xlog:startuptime -jar hello.jar", kind: "cmd" },
      { at: 6.2, text: "[0.026s][info][startuptime] Initialize java.lang classes, 0.0124152 secs", kind: "dim" },
      { at: 6.6, text: "[0.039s][info][startuptime] Initialize module system, 0.0117862 secs", kind: "dim" },
      { at: 7, text: "[0.039s][info][startuptime] Create VM, 0.0372228 secs", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(Note, { x: 930, y: 452, w: 894, tone: "violet", a: win(t, 6.5, 13), title: "before main \xB7 35 ms", fs: 20, text: "Reserve the heap, generate the interpreter, create `java.lang` objects (`String`, `Thread`, `System`), boot the module system." }), /* @__PURE__ */ React.createElement(Note, { x: 930, y: 452, w: 894, tone: "blue", a: win(t, 13.3, 20), title: "launcher \xB7 10 ms", fs: 20, text: "`LauncherHelper` opens the jar, reads `Main-Class` from the manifest, loads and links `app.Main`." }), /* @__PURE__ */ React.createElement(Note, { x: 930, y: 452, w: 894, tone: "pull", a: win(t, 20.3, 28), title: "first log line \xB7 57 ms", fs: 20, text: "`Logger`, `ConsoleHandler`, `SimpleFormatter`, the time-zone database, locale data. All interpreted, all first-time." }), /* @__PURE__ */ React.createElement(Note, { x: 930, y: 452, w: 894, tone: "pink", a: win(t, 28.3, 35), title: "xml \xB7 17 ms", fs: 20, text: "`DocumentBuilderFactory` finds its implementation, then Xerces: scanners, validators, DOM nodes. 164 classes from `java.xml`." }), /* @__PURE__ */ React.createElement(Note, { x: 930, y: 452, w: 894, tone: "green", a: win(t, 35.3, 42), title: "the rest \xB7 4 ms", fs: 20, text: "`List.of`, the stream, the lambda's `invokedynamic`, then `Class.forName` loads `app.Greeter` and `app.Polite`." }), /* @__PURE__ */ React.createElement(Note, { x: 930, y: 452, w: 894, tone: "flow", a: E(t, 42.3), title: "1,287 classes", fs: 20, text: "Three of them are ours. The rest is the platform waking up, the same way, on every start." }), /* @__PURE__ */ React.createElement(Txt, { x: 96, y: BY - 52, mono: true, fs: 17, color: PAL.ink3, a: E(t, 5) }, "TIME SINCE LAUNCH \xB7 JDK 17 \xB7 -Xshare:off"), PHASES.map((p, i) => {
      const w = (PH_OFF[i + 1] - PH_OFF[i]) * S * M(t, p.at, 1);
      if (w < 1) return null;
      const label = w > 120 ? p.name : "";
      return /* @__PURE__ */ React.createElement(Box, { key: i, x: X0 + PH_OFF[i] * S, y: BY, w, h: BH, r: 6, tone: p.tone, fill: true, label, sub: w > 120 ? `${(PH_OFF[i + 1] - PH_OFF[i]).toFixed(0)} ms` : null, fs: 18, sfs: 17, glow: pulse(t, [p.at + 1], 1) });
    }), [0, 20, 40, 60, 80, 100, 120].map((ms) => /* @__PURE__ */ React.createElement(Txt, { key: ms, x: X0 + ms * S, y: BY + BH + 8, anchor: "mid", mono: true, fs: 17, color: PAL.ink3, a: E(t, 5.5) }, ms)), PHASES.map((p, i) => p.cls && /* @__PURE__ */ React.createElement(Txt, { key: "c" + i, x: X0 + PH_OFF[i + 1] * S - 6, y: BY + BH + 34, anchor: "right", mono: true, fs: 17, color: toneColor(p.tone), a: E(t, p.at + 0.8) }, p.cls)), /* @__PURE__ */ React.createElement(Txt, { x: X0 + 123.9 * S + 10, y: BY + 18, mono: true, fs: 18, weight: 600, color: PAL.ink, a: E(t, 42.5) }, "124"), /* @__PURE__ */ React.createElement(Txt, { x: X0 + 119 * S, y: BY - 26, anchor: "mid", mono: true, fs: 17, color: PAL.green, a: E(t, 36) }, "4 ms"));
  }
  var GRID = (() => {
    const out = [];
    const rnd = (i) => {
      const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    const phase = (n, mix) => {
      const arr = [];
      for (const [k, c] of mix) for (let j = 0; j < c; j++) arr.push(k);
      while (arr.length < n) arr.push("base");
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rnd(out.length + i) * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    out.push(...phase(530, [["gen", 10]]), "app");
    out.push(...phase(538, [["log", 36], ["loc", 4], ["gen", 30]]));
    out.push(...phase(190, [["xml", 164], ["gen", 3]]));
    out.push("gen", "app", "app", ...phase(25, [["gen", 25]]));
    return out;
  })();
  var GTONE = { base: PAL.blue, xml: PAL.pink, log: PAL.pull, loc: PAL.violet, app: PAL.flow, gen: PAL.green };
  var VERIFIED = (() => {
    const v = [];
    GRID.forEach((k, i) => {
      if (k === "app" || k === "loc") v.push(i);
    });
    v.push(GRID.indexOf("gen", 1259));
    return new Set(v);
  })();
  var STEPS = [
    ["find", "jrt:/java.xml, inside lib/modules"],
    ["read + parse", "class file \u2192 InstanceKlass in metaspace"],
    ["verify", "type-check every method's bytecode"],
    ["link", "rewrite bytecodes \xB7 lay out the vtable"],
    ["initialise", "run the static initialiser <clinit>"]
  ];
  function SClassFlood({ t }) {
    const GX = 900, GY = 252, P = 17, D = 13, COLS = 52;
    const n = Math.round(lin(t, 1, 18) * GRID.length);
    const focusV = win(t, 28, 43, 0.6);
    const cur = t < 6 ? 0 : t < 9.5 ? t < 7.5 ? 0 : 1 : t < 13 ? 1 : Math.min(4, 2 + Math.floor((t - 13) / 1.8));
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 200, mono: true, fs: 18, color: PAL.ink3, a: E(t, 0.5) }, "FOLLOW ONE: javax.xml.parsers.DocumentBuilderFactory"), STEPS.map(([l, s], i) => {
      const on = t > 6 && i <= cur;
      const isVerify = i === 2;
      return /* @__PURE__ */ React.createElement(
        Box,
        {
          key: l,
          x: 96,
          y: 244 + i * 86,
          w: 740,
          h: 72,
          align: "left",
          label: l,
          sub: s,
          fs: 22,
          sfs: 17,
          tone: isVerify && focusV > 0.1 ? "bad" : on ? "pull" : "ink",
          a: E(t, 1 + i * 0.3),
          glow: t > 6 && i === cur && t < 21 ? 0.7 : isVerify ? focusV * 0.8 : 0
        }
      );
    }), /* @__PURE__ */ React.createElement(Badge, { x: 600, y: 244 + 2 * 86 + 36, text: "skipped for JDK boot classes", tone: "bad", a: E(t, 35), fs: 17, anchor: "left" }), /* @__PURE__ */ React.createElement(Console, { x: 96, y: 700, w: 740, h: 150, t, a: E(t, 28), fs: 17, lh: 30, items: [
      { at: 28.2, text: "java -Xshare:off -Xlog:class+init -jar hello.jar \\", kind: "cmd" },
      { at: 28.4, text: "    | grep -c 'Start class verification'" },
      { at: 29.4, text: "8", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(Txt, { x: GX, y: 200, mono: true, fs: 18, color: PAL.ink3, a: E(t, 1) }, "CLASSES LOADED, IN ORDER \xB7 ", n.toLocaleString("en-US")), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: GX, top: GY, opacity: E(t, 1) } }, GRID.slice(0, n).map((k, i) => {
      const isV = VERIFIED.has(i);
      const o = focusV > 0.01 ? isV ? 1 : 1 - 0.75 * focusV : 1;
      return /* @__PURE__ */ React.createElement("div", { key: i, style: { position: "absolute", left: i % COLS * P, top: Math.floor(i / COLS) * P, width: D, height: D, borderRadius: 3, background: GTONE[k], opacity: o * 0.9, boxShadow: isV && focusV > 0.01 ? `0 0 0 3px ${hexA(PAL.ink, focusV)}` : "none" } });
    })), [["base", "java.base 1,011"], ["xml", "java.xml 164"], ["log", "java.logging 36"], ["gen", "generated 69"], ["loc", "jdk.localedata 4"], ["app", "hello.jar 3"]].map(([k, l], i) => /* @__PURE__ */ React.createElement("div", { key: k, style: { position: "absolute", left: GX + i % 3 * 300, top: 690 + Math.floor(i / 3) * 34, display: "flex", alignItems: "center", gap: 10, opacity: E(t, 20 + i * 0.5), font: `500 18px ${MONO}`, color: PAL.ink2 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 16, height: 16, borderRadius: 3, background: GTONE[k] } }), l)), /* @__PURE__ */ React.createElement(Note, { x: GX, y: 772, w: 924, tone: "bad", a: win(t, 28.5, 35), fs: 20, text: "Only **8** classes were verified: `app.Main`, `app.Greeter`, `app.Polite`, a lambda class, and 4 locale classes." }), /* @__PURE__ */ React.createElement(Note, { x: GX, y: 772, w: 924, tone: "pull", a: win(t, 35.3, 43), fs: 20, text: "Boot classes are trusted (`-XX:-BytecodeVerificationLocal` is the default). App and library classes are always verified." }), /* @__PURE__ */ React.createElement(Note, { x: GX, y: 772, w: 924, tone: "flow", a: E(t, 43.3), fs: 20, text: "A Spring Boot app loads thousands of **library** classes, all verified. JEP 483 counts about **21,000** for Spring PetClinic." }));
  }
  function SColdJit({ t }) {
    const gx0 = 150, gx1 = 1780, gy0 = 890, gy1 = 690;
    const xAt = (sec) => lerp(gx0, gx1, (Math.log10(sec) + 2) / 5);
    const level = (sec) => sec < 0.15 ? 0.1 : sec < 2 ? lerp(0.1, 0.42, (Math.log10(sec) - Math.log10(0.15)) / (Math.log10(2) - Math.log10(0.15))) : sec < 20 ? lerp(0.42, 0.95, (Math.log10(sec) - Math.log10(2)) / 1) : 0.95;
    const drawTo = lerp(-2, 3, lin(t, 25, 9));
    const pts = [];
    for (let e = -2; e <= drawTo; e += 0.04) pts.push([xAt(Math.pow(10, e)), lerp(gy0, gy1, level(Math.pow(10, e)))]);
    const bars = [["interpreter", "every method starts here", null, "ink", 6], ["C1 + profiling (tier 3)", "223 methods", 223, "pull", 11.5], ["C1 trivial (tier 1)", "24 methods", 24, "pull", 12], ["C2 (tier 4)", "21 methods", 21, "flow", 12.5]];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Console, { x: 96, y: 196, w: 960, h: 420, t, a: E(t, 5.5), fs: 17, lh: 29, items: [
      { at: 5.8, text: "java -XX:+PrintCompilation -jar hello.jar", kind: "cmd" },
      { at: 6.6, text: "  54    1       3       java.lang.Object::<init> (1 bytes)", kind: "dim" },
      { at: 6.8, text: "  57    2       3       java.lang.String::isLatin1 (19 bytes)", kind: "dim" },
      { at: 7, text: "  57    3       3       java.lang.String::charAt (25 bytes)", kind: "dim" },
      { at: 7.2, text: "   \u2026", kind: "dim" },
      { at: 18, text: "  75   71       4       java.lang.String::charAt (25 bytes)", kind: "ok" },
      { at: 18.3, text: "  94  213       4       java.lang.String::hashCode (60 bytes)", kind: "ok" },
      { at: 18.6, text: " 114  317       4       java.lang.String::equals (56 bytes)", kind: "ok" },
      { at: 19, text: "grep -c 'app\\.'   \u2192   0", kind: "cmd" }
    ] }), /* @__PURE__ */ React.createElement(Txt, { x: 1100, y: 196, mono: true, fs: 17, color: PAL.ink3, a: E(t, 0.6) }, "ONE RUN OF hello.jar \xB7 JDK 17"), bars.map(([l, s, n, tone, at], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: l }, /* @__PURE__ */ React.createElement(Box, { x: 1100, y: 236 + i * 92, w: 724, h: 76, align: "left", label: l, sub: s, tone, fs: 21, sfs: 17, a: E(t, at), glow: i === 3 ? win(t, 18, 25) : 0 }), n != null && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 1500, top: 236 + i * 92 + 30, height: 16, width: 300 * M(t, at + 0.3, 1) * n / 223, background: hexA(toneColor(tone), 0.7), borderRadius: 4 } }))), /* @__PURE__ */ React.createElement(Panel, { x: 96, y: 650, w: 1728, h: 270, title: "throughput over time (illustrative)", right: "log time \u2192", a: E(t, 24.5) }), /* @__PURE__ */ React.createElement("svg", { width: "1920", height: "1080", style: { position: "absolute", left: 0, top: 0, opacity: E(t, 25) } }, /* @__PURE__ */ React.createElement("line", { x1: gx0, y1: gy0, x2: gx1, y2: gy0, stroke: PAL.line2, strokeWidth: "2" }), pts.length > 1 && /* @__PURE__ */ React.createElement("polyline", { points: pts.map((p) => p.join(",")).join(" "), fill: "none", stroke: PAL.flow, strokeWidth: "4", strokeLinejoin: "round" }), /* @__PURE__ */ React.createElement("line", { x1: xAt(0.08), y1: gy1 - 4, x2: xAt(0.08), y2: gy0, stroke: PAL.bad, strokeWidth: "2.5", strokeDasharray: "7 6", opacity: E(t, 26) })), ["10 ms", "100 ms", "1 s", "10 s", "100 s"].map((l, i) => /* @__PURE__ */ React.createElement(Txt, { key: l, x: xAt(Math.pow(10, i - 2)), y: gy0 + 4, anchor: "mid", mono: true, fs: 17, color: PAL.ink3, a: E(t, 25) }, l)), /* @__PURE__ */ React.createElement(Txt, { x: xAt(0.08) + 12, y: gy1 + 4, mono: true, fs: 17, color: PAL.bad, a: E(t, 26) }, "hello.jar exits here"), /* @__PURE__ */ React.createElement(Txt, { x: xAt(0.6), y: lerp(gy0, gy1, 0.32) - 6, mono: true, fs: 17, color: PAL.pull, a: E(t, 29) }, "C1 code"), /* @__PURE__ */ React.createElement(Txt, { x: xAt(40), y: gy1 + 4, mono: true, fs: 17, color: PAL.flow, a: E(t, 32) }, "C2 \xB7 several \xD7 faster"), /* @__PURE__ */ React.createElement(Card, { x: 1100, y: 236, w: 724, h: 360, a: win(t, 38.5, 99), tone: "pull", num: "three costs", title: "Loading \xB7 verifying \xB7 a cold interpreter", sub: "Every technique in this topic attacks one or more of them. Remember which, and the trade-offs make sense.", tfs: 30, sfs: 22 }));
  }
  function SWhoCares({ t }) {
    const X = 560, W = 1264;
    const row = (i) => 214 + i * 172;
    const lab = (i, title, sub, at) => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt, { x: 96, y: row(i) + 8, fs: 26, weight: 600, a: E(t, at) }, title), /* @__PURE__ */ React.createElement(Txt, { x: 96, y: row(i) + 46, fs: 19, color: PAL.ink2, a: E(t, at + 0.2), w: 430 }, sub));
    const scale = Array.from({ length: 12 }, (_, k) => k);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, lab(0, "Long-running server", "up for three weeks", 5), /* @__PURE__ */ React.createElement(Box, { x: X, y: row(0), w: W * M(t, 5.2, 1.2), h: 64, r: 8, tone: "flow", fill: true, a: E(t, 5), label: t > 6.2 ? "serving requests" : "", fs: 20 }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: X, top: row(0) - 6, width: 3, height: 76, background: PAL.bad, opacity: E(t, 6.5) } }), /* @__PURE__ */ React.createElement(Txt, { x: X, y: row(0) + 78, mono: true, fs: 17, color: PAL.bad, a: E(t, 6.8) }, "startup: under 0.0001% of its life"), lab(1, "Autoscaling container", "new instances all day", 11), scale.map((k) => {
      const x = X + k * (W / 12), at = 11.3 + k * 0.35;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: k }, /* @__PURE__ */ React.createElement(Box, { x, y: row(1), w: (W / 12 - 12) * 0.35, h: 64, r: 6, tone: "bad", fill: true, a: E(t, at) }), /* @__PURE__ */ React.createElement(Box, { x: x + (W / 12 - 12) * 0.35, y: row(1), w: (W / 12 - 12) * 0.65, h: 64, r: 6, tone: "flow", fill: true, a: E(t, at + 0.15) }));
    }), /* @__PURE__ */ React.createElement(Txt, { x: X, y: row(1) + 78, mono: true, fs: 17, color: PAL.bad, a: E(t, 13) }, "every scale-out waits for startup while traffic queues"), lab(2, "Serverless function", "200 ms of real work", 18), /* @__PURE__ */ React.createElement(Box, { x: X, y: row(2), w: 760 * M(t, 18.3, 1), h: 64, r: 8, tone: "bad", fill: true, a: E(t, 18.2), label: t > 19 ? "cold start" : "", fs: 20 }), /* @__PURE__ */ React.createElement(Box, { x: X + 772, y: row(2), w: 260 * M(t, 19.4, 0.8), h: 64, r: 8, tone: "flow", fill: true, a: E(t, 19.4), label: t > 20 ? "work" : "", fs: 20 }), /* @__PURE__ */ React.createElement(Brace, { x: X, y: row(2) + 76, w: 1032, label: "billed", tone: "pull", a: E(t, 21), fs: 17 }), lab(3, "Command-line tool", "runs for a moment", 25), /* @__PURE__ */ React.createElement(Box, { x: X, y: row(3), w: 420 * M(t, 25.3, 0.8), h: 64, r: 8, tone: "bad", fill: true, a: E(t, 25.2), label: t > 26 ? "startup" : "", fs: 20 }), /* @__PURE__ */ React.createElement(Box, { x: X + 432, y: row(3), w: 90 * M(t, 26.2, 0.6), h: 64, r: 8, tone: "flow", fill: true, a: E(t, 26.2) }), /* @__PURE__ */ React.createElement(Txt, { x: X + 540, y: row(3) + 20, mono: true, fs: 18, color: PAL.ink2, a: E(t, 26.8) }, "the user feels all of it"), /* @__PURE__ */ React.createElement(Note, { x: 1100, y: row(3) - 10, w: 724, tone: "pull", a: E(t, 31), fs: 20, text: "Here Java loses to Go and Node. That's why this corner of the JVM is changing fastest." }));
  }

  // src/topics/8.10/scenes2.jsx
  var {
    PAL: PAL2,
    MOTION: MOTION2,
    lin: lin2,
    lerp: lerp2,
    win: win2,
    pulse: pulse2,
    step: step2,
    track: track2,
    track1: track12,
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
    Table: Table2,
    Mark: Mark2,
    Val: Val2,
    Brace: Brace2,
    Chip: Chip2,
    toneColor: toneColor2
  } = window.AN;
  var E2 = MOTION2.enter;
  var M2 = MOTION2.move;
  var POP2 = MOTION2.pop;
  function Stream({ t, from, to, start, n = 7, period = 1.6, color, until = 999, r = 7 }) {
    if (t < start || t > until) return null;
    const out = [];
    for (let k = 0; k < n; k++) {
      const p = ((t - start) / period + k / n) % 1;
      out.push(/* @__PURE__ */ React.createElement(Dot2, { key: k, x: lerp2(from[0], to[0], p), y: lerp2(from[1], to[1], p), r, color, a: Math.min(1, p * 6, (1 - p) * 6) * E2(t, start) }));
    }
    return out;
  }
  function SCdsIdea({ t }) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel2, { x: 96, y: 196, w: 846, h: 320, title: "without CDS \xB7 every start", tone: "bad", a: E2(t, 0.4) }), /* @__PURE__ */ React.createElement(Box2, { x: 126, y: 290, w: 220, h: 90, label: "lib/modules", sub: "class bytes", a: E2(t, 0.8), fs: 21 }), /* @__PURE__ */ React.createElement(Box2, { x: 420, y: 290, w: 170, h: 90, label: "parse", sub: "+ verify*", tone: "pull", a: E2(t, 1.2), fs: 21, glow: 0.4 + 0.3 * Math.sin(t * 5) }), /* @__PURE__ */ React.createElement(Box2, { x: 664, y: 290, w: 250, h: 90, label: "metaspace", sub: "private copy", tone: "bad", a: E2(t, 1.6), fs: 21 }), /* @__PURE__ */ React.createElement(Stream, { t, from: [350, 335], to: [414, 335], start: 1.4, n: 3, period: 0.8, color: PAL2.pull }), /* @__PURE__ */ React.createElement(Stream, { t, from: [594, 335], to: [658, 335], start: 1.8, n: 3, period: 0.8, color: PAL2.bad }), /* @__PURE__ */ React.createElement(Txt2, { x: 126, y: 410, fs: 20, color: PAL2.ink2, a: E2(t, 2.4), w: 790 }, "The same 1,215 JDK classes, parsed again by every JVM, on every start. (*boot classes skip verification)"), /* @__PURE__ */ React.createElement(Panel2, { x: 978, y: 196, w: 846, h: 320, title: "with CDS", tone: "flow", a: E2(t, 6) }), /* @__PURE__ */ React.createElement(Box2, { x: 1008, y: 290, w: 260, h: 90, label: "classes.jsa", sub: "written once", tone: "flow", a: E2(t, 6.5), fs: 21 }), /* @__PURE__ */ React.createElement(Txt2, { x: 1008, y: 392, mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 7.2) }, "13.5 MB \xB7 lib/server/"), /* @__PURE__ */ React.createElement(Arrow2, { pts: [[1274, 335], [1500, 335]], draw: M2(t, 12.5, 0.8), color: PAL2.flow, width: 10 }), /* @__PURE__ */ React.createElement(Txt2, { x: 1387, y: 290, anchor: "mid", mono: true, fs: 20, weight: 600, color: PAL2.flow, a: E2(t, 13) }, "mmap"), /* @__PURE__ */ React.createElement(Box2, { x: 1514, y: 290, w: 280, h: 90, label: "metaspace", sub: "mapped region", tone: "flow", a: E2(t, 13.2), fs: 21, glow: pulse2(t, [13.6], 1.2) }), /* @__PURE__ */ React.createElement(Txt2, { x: 1008, y: 432, fs: 20, color: PAL2.ink2, a: E2(t, 14), w: 790 }, "No reading, no parsing: the archive's pages simply become part of metaspace."), /* @__PURE__ */ React.createElement(Console2, { x: 96, y: 540, w: 1728, h: 160, t, a: E2(t, 19.5), fs: 17, lh: 30, items: [
      { at: 19.7, text: "java -Xlog:cds -jar hello.jar        (abridged)", kind: "cmd" },
      { at: 20.4, text: "[0.004s][info][cds] Mapped static  region #0 at base 0x000000d800000000 top 0x000000d800454000 (ReadWrite)", kind: "ok" },
      { at: 21, text: "[0.004s][info][cds] Mapped static  region #1 at base 0x000000d800454000 top 0x000000d800bc0000 (ReadOnly)", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(Box2, { x: 96, y: 736, w: 300, h: 76, label: "JVM  A", sub: "hello.jar", a: E2(t, 26.5), fs: 21 }), /* @__PURE__ */ React.createElement(Box2, { x: 96, y: 834, w: 300, h: 76, label: "JVM  B", sub: "another app", a: E2(t, 27.2), fs: 21 }), /* @__PURE__ */ React.createElement(Panel2, { x: 520, y: 724, w: 560, h: 196, title: "physical memory \xB7 page cache", a: E2(t, 26.8) }), Array.from({ length: 7 }, (_, k) => /* @__PURE__ */ React.createElement(Box2, { key: k, x: 546 + k * 74, y: 790, w: 62, h: 56, r: 6, tone: "flow", fill: true, label: "RO", fs: 17, a: E2(t, 27.4 + k * 0.08), glow: win2(t, 33, 40) * 0.6 })), /* @__PURE__ */ React.createElement(Txt2, { x: 546, y: 858, mono: true, fs: 17, color: PAL2.flow, a: E2(t, 28) }, "read-only region: one copy for all"), /* @__PURE__ */ React.createElement(Arrow2, { pts: [[400, 774], [460, 774], [460, 818], [540, 818]], draw: M2(t, 27.6, 0.7), color: PAL2.flow }), /* @__PURE__ */ React.createElement(Arrow2, { pts: [[400, 872], [470, 872], [470, 826], [540, 826]], draw: M2(t, 28.2, 0.7), color: PAL2.flow }), /* @__PURE__ */ React.createElement(Note, { x: 1120, y: 736, w: 704, tone: "flow", a: win2(t, 33, 40.3), fs: 20, title: "shared", text: "The read-only part is mapped by every JVM using that archive. Read-write pages are copied only when written." }), /* @__PURE__ */ React.createElement(Note, { x: 1120, y: 736, w: 704, tone: "pull", a: win2(t, 40.3, 47.3), fs: 20, title: "pre-verified", text: "Classes are verified when the archive is dumped, so mapping them skips verification too." }), /* @__PURE__ */ React.createElement(Note, { x: 1120, y: 736, w: 704, tone: "violet", a: E2(t, 47.3), fs: 20, title: "on by default \xB7 JDK 12+", text: "The JDK ships a default archive of its core classes: 1,189 in this JDK's class list. `-Xshare:off` disables it." }));
  }
  var SRC = [
    { name: "-Xshare:off", ms: 122, at: 23, seg: [["parsed", 1215], ["jar", 3], ["gen", 69]] },
    { name: "default CDS archive", ms: 81, at: 29, seg: [["shared", 987], ["parsed", 245], ["jar", 3], ["gen", 44]] },
    { name: "+ AppCDS (app.jsa)", ms: 75, at: 35, seg: [["shared", 1246], ["gen", 27]] }
  ];
  var STONE = { shared: "flow", parsed: "pull", jar: "blue", gen: "green" };
  function SAppCds({ t }) {
    const BX = 1e3, U = 0.53;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Console2, { x: 96, y: 196, w: 860, h: 404, t, a: E2(t, 4.5), fs: 18, lh: 32, items: [
      { at: 5, text: "java -XX:ArchiveClassesAtExit=app.jsa -jar hello.jar", kind: "cmd" },
      { at: 6.4, text: "Hello, ADA, LINUS, GRACE" },
      { at: 6.6, text: "Good day, world." },
      { at: 12, text: "ls -l app.jsa", kind: "cmd" },
      { at: 12.6, text: "-r--r--r--  1 basha  wheel  2244608  5 Oct 12:18 app.jsa", kind: "ok" },
      { at: 18, text: "java -XX:SharedArchiveFile=app.jsa -jar hello.jar", kind: "cmd" },
      { at: 18.8, text: "Hello, ADA, LINUS, GRACE" },
      { at: 19, text: "Good day, world." }
    ] }), /* @__PURE__ */ React.createElement(Box2, { x: 96, y: 630, w: 860, h: 84, align: "left", label: "top layer \xB7 app.jsa \xB7 2.2 MB", sub: "your classes + the JDK classes this app needed", tone: "pull", fs: 21, a: E2(t, 13) }), /* @__PURE__ */ React.createElement(Box2, { x: 96, y: 724, w: 860, h: 84, align: "left", label: "base layer \xB7 classes.jsa \xB7 13.5 MB", sub: "the JDK's default archive", tone: "flow", fs: 21, a: E2(t, 13.4) }), /* @__PURE__ */ React.createElement(Txt2, { x: BX, y: 196, mono: true, fs: 18, color: PAL2.ink3, a: E2(t, 22.5) }, "WHERE 1,280 CLASSES COME FROM"), SRC.map((s, i) => {
      const y = 250 + i * 128;
      let x = BX;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: s.name }, /* @__PURE__ */ React.createElement(Txt2, { x: BX, y, fs: 21, weight: 600, a: E2(t, s.at) }, s.name), s.seg.map(([k, n], j) => {
        const w = n * U * M2(t, s.at + 0.2 + j * 0.25, 0.8), x0 = x;
        x += n * U;
        return /* @__PURE__ */ React.createElement(Box2, { key: j, x: x0, y: y + 36, w: Math.max(w, 0), h: 50, r: 4, tone: STONE[k], fill: true, a: w > 1 ? 1 : 0, label: n > 150 ? n.toLocaleString("en-US") : "", fs: 18 });
      }), /* @__PURE__ */ React.createElement(Txt2, { x: 1824, y: y + 44, anchor: "right", mono: true, fs: 28, weight: 700, color: i === 0 ? PAL2.bad : PAL2.flow, a: E2(t, 42.5 + i * 0.6) }, s.ms, " ms"));
    }), [["shared", "mapped from an archive"], ["parsed", "parsed from lib/modules"], ["jar", "hello.jar"], ["gen", "generated at runtime"]].map(([k, l], i) => /* @__PURE__ */ React.createElement("div", { key: k, style: { position: "absolute", left: BX + i % 2 * 412, top: 632 + Math.floor(i / 2) * 34, display: "flex", alignItems: "center", gap: 10, opacity: E2(t, 23.5), font: `500 18px ${MONO2}`, color: PAL2.ink2 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 16, height: 16, borderRadius: 3, background: toneColor2(STONE[k]) } }), l)), /* @__PURE__ */ React.createElement(MeasTag, { x: BX, y: 720, a: E2(t, 42.5), text: "wall clock \xB7 median of 50 runs \xB7 JDK 17 \xB7 M1" }), /* @__PURE__ */ React.createElement(Note, { x: BX, y: 752, w: 824, tone: "pull", a: win2(t, 49, 54.6), fs: 20, text: "The default archive gave most of our win for free. The more classes your app loads, the more AppCDS adds." }), /* @__PURE__ */ React.createElement(Note, { x: BX, y: 752, w: 824, tone: "violet", a: E2(t, 54.6), fs: 20, text: "JDK 19+: `-XX:+AutoCreateSharedArchive -XX:SharedArchiveFile=app.jsa` does both steps. On 17: **Unrecognized VM option**." }), /* @__PURE__ */ React.createElement(Note, { x: 96, y: 832, w: 860, tone: "flow", a: E2(t, 35.5), fs: 19, text: "The 27 left over are method-handle classes spun at runtime: this archive can't hold them." }));
  }
  function SCdsCheck({ t }) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      Node2,
      {
        x: 96,
        y: 196,
        w: 560,
        h: 262,
        kind: "app.jsa header (simplified)",
        name: "what it was built against",
        tone: "pull",
        a: E2(t, 0.5),
        rows: [["JDK build", "17.0.17+0"], ["class path", "hello.jar", null, win2(t, 5, 11)], ["jar size", "recorded", null, win2(t, 5, 11)], ["jar modified time", "recorded", null, win2(t, 5, 11)], ["GC, compressed oops", "recorded"]],
        rfs: 20
      }
    ), /* @__PURE__ */ React.createElement(Box2, { x: 700, y: 210, w: 420, h: 100, label: "same jar", sub: "regions mapped", tone: "flow", a: win2(t, 2, 32.5), fs: 24 }), /* @__PURE__ */ React.createElement(Mark2, { x: 1100, y: 216, ok: true, a: win2(t, 2.5, 32.5) }), /* @__PURE__ */ React.createElement(HArrow2, { x1: 1130, x2: 1220, y: 260, a: win2(t, 2.5, 32.5), color: PAL2.flow }), /* @__PURE__ */ React.createElement(Box2, { x: 1230, y: 210, w: 594, h: 100, label: "fast start", sub: "75 ms", tone: "flow", a: win2(t, 3, 32.5), fs: 24 }), /* @__PURE__ */ React.createElement(Txt2, { x: 700, y: 340, fs: 21, color: PAL2.ink2, a: win2(t, 5, 32.5), w: 1100 }, "Change any of these and the archive no longer describes what's on disk."), /* @__PURE__ */ React.createElement(Note, { x: 700, y: 210, w: 1124, tone: "pull", a: E2(t, 32.5), fs: 23, title: "rule", text: "Regenerate the archive in the **same build step** that produces the jar, and ship them together." }), /* @__PURE__ */ React.createElement(Console2, { x: 96, y: 486, w: 1728, h: 196, t, a: E2(t, 11.5), fs: 18, lh: 32, items: [
      { at: 11.8, text: "touch hello.jar          # a rebuild, even with identical content", kind: "cmd" },
      { at: 13.2, text: "java -XX:SharedArchiveFile=app.jsa -jar hello.jar", kind: "cmd" },
      { at: 17.6, text: "[0.008s][warning][cds,dynamic] Unable to use shared archive. The top archive failed to load: app.jsa", kind: "err" },
      { at: 18.4, text: "Oct 05, 2026 12:17:47 PM app.Main main       \u2190 and it runs anyway, without the archive", kind: "dim" }
    ] }), /* @__PURE__ */ React.createElement(Console2, { x: 96, y: 704, w: 1728, h: 196, t, a: E2(t, 25), fs: 18, lh: 32, items: [
      { at: 25.2, text: "java -XX:SharedArchiveFile=app.jsa -Xshare:on -version", kind: "cmd" },
      { at: 26.2, text: "An error has occurred while processing the shared archive file.", kind: "err" },
      { at: 26.6, text: "shared class paths mismatch (hint: enable -Xlog:class+path=info to diagnose the failure)", kind: "err" },
      { at: 27, text: "Error occurred during initialization of VM", kind: "err" }
    ] }));
  }
  var WORK = [
    ["parse class files", 13, "CDS", "flow"],
    ["verify bytecode", 13, "CDS", "flow"],
    ["load: classes appear in loaders", 19.5, "JEP 483 \xB7 JDK 24", "pull"],
    ["link: wire classes together", 27.5, "JEP 483 \xB7 JDK 24", "pull"],
    ["profile hot methods", 34, "JEP 515 \xB7 JDK 25", "pink"],
    ["JIT-compile hot code", null, "stays at run time", "violet"]
  ];
  function SLeydenShift({ t }) {
    const LX = 116, RX = 1224, BW = 580, ry = (i) => 262 + i * 86;
    const chips = [["JDK 12 \xB7 default CDS", "flow", 13], ["JDK 13 \xB7 dynamic AppCDS", "flow", 13.5], ["JDK 24 \xB7 JEP 483", "pull", 19.5], ["JDK 25 \xB7 JEP 514, 515", "pink", 34], ["JDK 26 \xB7 JEP 516", "violet", 41]];
    let cx = 96;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel2, { x: 96, y: 196, w: 620, h: 600, title: "training run \xB7 once", tone: "flow", a: E2(t, 0.6) }), /* @__PURE__ */ React.createElement(Panel2, { x: 1204, y: 196, w: 620, h: 600, title: "every production start", tone: "bad", a: E2(t, 0.6) }), WORK.map(([l, at, tag, tone], i) => {
      const p = at == null ? 0 : M2(t, at, 1.3);
      const x = lerp2(RX, LX, p);
      const stay = at == null;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: l }, /* @__PURE__ */ React.createElement(Box2, { x, y: ry(i), w: BW, h: 70, align: "left", label: l, fs: 22, tone: p > 0.5 ? tone : stay ? t > 48 ? "violet" : "ink" : "ink", fill: p > 0.5 || stay && t > 48, a: E2(t, 6 + i * 0.5), glow: stay ? win2(t, 48, 58) * 0.8 : pulse2(t, [at + 1.3], 1) }), /* @__PURE__ */ React.createElement(Txt2, { x: 960, y: ry(i) + 22, anchor: "mid", mono: true, fs: 18, weight: 600, color: toneColor2(tone), a: stay ? E2(t, 48) : E2(t, at + 1) }, stay ? "\u2190 stays" : tag));
    }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 106, top: ry(2) - 9, width: 600, borderTop: `2px dashed ${PAL2.bad}`, opacity: E2(t, 14.5) } }), /* @__PURE__ */ React.createElement(Txt2, { x: 706, y: ry(2) - 36, anchor: "right", mono: true, fs: 17, color: PAL2.bad, a: E2(t, 14.5) }, "JDK 17 stops here"), chips.map(([l, tone, at], i) => {
      const w = l.length * 11 + 40, x = cx;
      cx += w + 14;
      return /* @__PURE__ */ React.createElement(Box2, { key: l, x, y: 826, w, h: 50, r: 25, label: l, fs: 18, tone, a: E2(t, at), glow: i === 4 ? win2(t, 41, 48) : 0 });
    }), /* @__PURE__ */ React.createElement(Txt2, { x: 96, y: 890, fs: 19, color: PAL2.ink2, a: E2(t, 41.5) }, "JEP 516: cached objects work with every GC, including ZGC, which JEP 483 couldn't use."));
  }
  function SLeydenWorkflow({ t }) {
    const steps = [["1 \xB7 record", "training run", 5.5, "pull", 96], ["app.aotconf", "what was loaded", 8, "ink", 452], ["2 \xB7 create", "no app runs", 12, "pull", 808], ["app.aot", "the AOT cache", 14, "flow", 1164], ["3 \xB7 run", "every start", 18, "flow", 1520]];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, steps.map(([l, s, at, tone, x], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: l }, /* @__PURE__ */ React.createElement(Box2, { x, y: 200, w: 304, h: 88, label: l, sub: s, tone, fill: i % 2 === 1, dashed: i % 2 === 1, a: E2(t, at), fs: 22, glow: pulse2(t, [at + 0.3], 1) }), i > 0 && /* @__PURE__ */ React.createElement(HArrow2, { x1: x - 50, x2: x - 6, y: 244, a: E2(t, at - 0.2), color: toneColor2(tone) }))), /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 316, w: 1728, h: 44 + 24 + 6 * 34, lang: "shell", title: "JDK 24+ \xB7 exact forms from JEP 483 and JEP 514", fs: 18, lh: 34, t, a: E2(t, 5), lines: [
      { s: "$ java -XX:AOTMode=record -XX:AOTConfiguration=app.aotconf -cp app.jar com.example.App", at: 5.6, cps: 80 },
      { s: "$ java -XX:AOTMode=create -XX:AOTConfiguration=app.aotconf -XX:AOTCache=app.aot -cp app.jar", at: 12.2, cps: 80 },
      { s: "$ java -XX:AOTCache=app.aot -cp app.jar com.example.App", at: 18.2, cps: 80 },
      { s: "# JDK 25, JEP 514: record + create in one step", at: 24, cps: 80 },
      { s: "$ java -XX:AOTCacheOutput=app.aot -cp app.jar com.example.App", at: 24.4, cps: 80 },
      { s: "# none of these flags exist on the JDK 17 used for this topic", at: 0.8, cps: 200 }
    ] }), /* @__PURE__ */ React.createElement(DocTag, { x: 96, y: 652, a: E2(t, 30.5), text: "documented in the JEPs \xB7 not measured here" }), /* @__PURE__ */ React.createElement(
      Table2,
      {
        x: 96,
        y: 680,
        cols: [470, 150, 200, 110, 160],
        head: ["program", "before", "with cache", "gain", "cache size"],
        fs: 20,
        rh: 48,
        a: E2(t, 30.5),
        rows: [["HelloStream (JEP 483)", "0.031 s", "0.018 s", "42%", "11.4 MB"], ["Spring PetClinic \xB7 ~21,000 classes", "4.486 s", "2.604 s", "42%", "130 MB"], ["HelloStreamWarmup + profiles (515)", "90 ms", "73 ms", "19%", "+250 KB"]],
        rowA: [E2(t, 31), E2(t, 31.5), E2(t, 45)],
        marks: { 1: ["pull", win2(t, 31, 45)], 2: ["pink", E2(t, 45)] },
        colColors: [PAL2.ink, PAL2.ink2, PAL2.flow, PAL2.pull, PAL2.ink2]
      }
    ), /* @__PURE__ */ React.createElement(Note, { x: 1220, y: 680, w: 604, tone: "bad", a: E2(t, 38), fs: 19, title: "the price", text: "Same JDK release, OS and CPU architecture for every run. Class path of JARs only. Consistent module options. A cache can be big." }));
  }
  function SProfiles({ t }) {
    const gx0 = 160, gx1 = 1780, gy0 = 680, gy1 = 300, T = 10;
    const X = (s) => lerp2(gx0, gx1, s / T), Y = (v) => lerp2(gy0, gy1, v);
    const cold = (s) => s < 1 ? 0.1 : s < 3 ? lerp2(0.1, 0.45, (s - 1) / 2) : s < 7 ? lerp2(0.45, 0.92, (s - 3) / 4) : 0.92;
    const aot = (s) => {
      let v = s < 0.3 ? 0.22 : s < 3.2 ? lerp2(0.22, 0.92, (s - 0.3) / 2.9) : 0.92;
      if (t > 27 && s > 5.4 && s < 6.6) v -= 0.3 * Math.sin((s - 5.4) / 1.2 * Math.PI) * E2(t, 27, 1);
      return v;
    };
    const path = (f, upTo) => {
      const p = [];
      for (let s = 0; s <= upTo; s += 0.05) p.push([X(s), Y(f(s))]);
      return p.map((q) => q.join(",")).join(" ");
    };
    const c1 = lerp2(0, T, lin2(t, 6, 6)), c2 = lerp2(0, T, lin2(t, 13, 6));
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel2, { x: 96, y: 196, w: 1728, h: 540, title: "throughput over time", right: "illustrative shape, not a measurement", a: E2(t, 0.5) }), /* @__PURE__ */ React.createElement("svg", { width: "1920", height: "1080", style: { position: "absolute", left: 0, top: 0, opacity: E2(t, 1) } }, /* @__PURE__ */ React.createElement("line", { x1: gx0, y1: gy0, x2: gx1, y2: gy0, stroke: PAL2.line2, strokeWidth: "2" }), /* @__PURE__ */ React.createElement("line", { x1: gx0, y1: Y(0.92), x2: gx1, y2: Y(0.92), stroke: PAL2.ink3, strokeWidth: "1.5", strokeDasharray: "6 8", opacity: E2(t, 20) }), c1 > 0.05 && /* @__PURE__ */ React.createElement("polyline", { points: path(cold, c1), fill: "none", stroke: PAL2.flow, strokeWidth: "4", strokeLinejoin: "round" }), c2 > 0.05 && /* @__PURE__ */ React.createElement("polyline", { points: path(aot, c2), fill: "none", stroke: PAL2.pull, strokeWidth: "4", strokeLinejoin: "round" }), /* @__PURE__ */ React.createElement("line", { x1: gx0, y1: Y(0.68), x2: gx1, y2: Y(0.68), stroke: PAL2.violet, strokeWidth: "3", strokeDasharray: "10 8", opacity: E2(t, 34) })), /* @__PURE__ */ React.createElement(Txt2, { x: X(1.2), y: Y(0.1) + 12, mono: true, fs: 18, color: PAL2.flow, a: E2(t, 7) }, "cold JVM: interpreter \u2192 C1 \u2192 C2"), /* @__PURE__ */ React.createElement(Txt2, { x: X(0.4), y: Y(0.5), mono: true, fs: 18, color: PAL2.pull, a: E2(t, 14) }, "AOT cache + profiles"), /* @__PURE__ */ React.createElement(Txt2, { x: X(7.6), y: Y(0.92) - 34, mono: true, fs: 18, color: PAL2.ink2, a: E2(t, 20) }, "same peak: the same C2"), /* @__PURE__ */ React.createElement(Txt2, { x: X(5), y: Y(0.55), mono: true, fs: 18, color: PAL2.bad, a: E2(t, 27.5) }, "deopt \xB7 re-profile \xB7 recompile"), /* @__PURE__ */ React.createElement(Txt2, { x: X(7.6), y: Y(0.68) + 10, mono: true, fs: 18, color: PAL2.violet, a: E2(t, 34) }, "native image: no JIT"), /* @__PURE__ */ React.createElement(Txt2, { x: gx1, y: gy0 + 10, anchor: "right", mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 1) }, "time \u2192"), /* @__PURE__ */ React.createElement(Note, { x: 96, y: 764, w: 1728, tone: "flow", a: win2(t, 0.5, 20), fs: 21, text: "The best machine code depends on what your program actually does in production. Only the JIT can see that." }), /* @__PURE__ */ React.createElement(Note, { x: 96, y: 764, w: 1728, tone: "pull", a: win2(t, 20, 34), fs: 21, text: "Cached profiles are a head start, not a contract. The JVM keeps profiling, and a wrong bet just deoptimises." }), /* @__PURE__ */ React.createElement(Note, { x: 96, y: 764, w: 1728, tone: "violet", a: E2(t, 34), fs: 21, text: "**AOT cache \u2260 no JIT.** Leyden keeps the interpreter, C1, C2 and deoptimisation. Only native image drops them." }));
  }

  // src/topics/8.10/scenes3.jsx
  var {
    PAL: PAL3,
    MOTION: MOTION3,
    lin: lin3,
    lerp: lerp3,
    win: win3,
    pulse: pulse3,
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
    Table: Table3,
    Mark: Mark3,
    Brace: Brace3,
    Chip: Chip3,
    toneColor: toneColor3
  } = window.AN;
  var E3 = MOTION3.enter;
  var M3 = MOTION3.move;
  var POP3 = MOTION3.pop;
  var MODULES = ["java.base", "java.compiler", "java.datatransfer", "java.desktop", "java.instrument", "java.logging", "java.management", "java.management.rmi", "java.naming", "java.net.http", "java.prefs", "java.rmi", "java.scripting", "java.se", "java.security.jgss", "java.security.sasl", "java.smartcardio", "java.sql", "java.sql.rowset", "java.transaction.xa", "java.xml", "java.xml.crypto", "jdk.accessibility", "jdk.attach", "jdk.charsets", "jdk.compiler", "jdk.crypto.cryptoki", "jdk.crypto.ec", "jdk.dynalink", "jdk.editpad", "jdk.hotspot.agent", "jdk.httpserver", "jdk.incubator.foreign", "jdk.incubator.vector", "jdk.internal.ed", "jdk.internal.jvmstat", "jdk.internal.le", "jdk.internal.opt", "jdk.internal.vm.ci", "jdk.internal.vm.compiler", "jdk.internal.vm.compiler.management", "jdk.jartool", "jdk.javadoc", "jdk.jcmd", "jdk.jconsole", "jdk.jdeps", "jdk.jdi", "jdk.jdwp.agent", "jdk.jfr", "jdk.jlink", "jdk.jpackage", "jdk.jshell", "jdk.jsobject", "jdk.jstatd", "jdk.localedata", "jdk.management", "jdk.management.agent", "jdk.management.jfr", "jdk.naming.dns", "jdk.naming.rmi", "jdk.net", "jdk.nio.mapmode", "jdk.random", "jdk.sctp", "jdk.security.auth", "jdk.security.jgss", "jdk.unsupported", "jdk.unsupported.desktop", "jdk.xml.dom", "jdk.zipfs"];
  var NEEDED = /* @__PURE__ */ new Set(["java.base", "java.logging", "java.xml"]);
  function SJdeps({ t }) {
    const COLS = 7, CW = 247;
    const pick = E3(t, 19, 0.8);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt3, { x: 96, y: 196, mono: true, fs: 18, color: PAL3.ink3, a: E3(t, 0.5) }, "JAVA --LIST-MODULES \xB7 JDK 17 \xB7 70 MODULES"), MODULES.map((m, i) => {
      const need = NEEDED.has(m), loc = m === "jdk.localedata";
      const x = 96 + i % COLS * CW, y = 232 + Math.floor(i / COLS) * 32;
      const a = E3(t, 0.8 + i * 0.03) * (need ? 1 : 1 - 0.78 * pick);
      const c = need && pick > 0.1 ? PAL3.flow : loc && t > 40 ? PAL3.pull : PAL3.ink2;
      return /* @__PURE__ */ React.createElement("div", { key: m, style: { position: "absolute", left: x, top: y, width: CW - 10, height: 28, boxSizing: "border-box", borderRadius: 6, padding: "0 8px", opacity: a, background: need && pick > 0.1 ? hexA3(PAL3.flow, 0.18) : PAL3.panel2, border: `1.5px solid ${need && pick > 0.1 ? PAL3.flow : loc && t > 40 ? PAL3.pull : PAL3.line2}`, font: `500 17px ${MONO3}`, color: c, lineHeight: "25px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, m);
    }), /* @__PURE__ */ React.createElement(Console3, { x: 96, y: 572, w: 900, h: 44 + 24 + 8 * 30, t, a: E3(t, 6), fs: 17, lh: 30, items: [
      { at: 6.5, text: "jdeps --print-module-deps hello.jar", kind: "cmd" },
      { at: 12.8, text: "java.base,java.logging,java.xml", kind: "ok" },
      { at: 19.5, text: "jdeps hello.jar          (abridged)", kind: "cmd" },
      { at: 20.2, text: "hello -> java.base" },
      { at: 20.4, text: "hello -> java.logging" },
      { at: 20.6, text: "hello -> java.xml" },
      { at: 21, text: "   app  -> javax.xml.parsers     java.xml", kind: "dim" }
    ] }), /* @__PURE__ */ React.createElement(Box3, { x: 1290, y: 584, w: 260, h: 64, label: "hello", sub: "our module", tone: "flow", fill: true, a: E3(t, 19.5), fs: 21 }), /* @__PURE__ */ React.createElement(Box3, { x: 1070, y: 704, w: 280, h: 64, label: "java.logging", tone: "flow", a: E3(t, 20.5), fs: 21 }), /* @__PURE__ */ React.createElement(Box3, { x: 1490, y: 704, w: 280, h: 64, label: "java.xml", tone: "flow", a: E3(t, 20.8), fs: 21 }), /* @__PURE__ */ React.createElement(Box3, { x: 1290, y: 830, w: 260, h: 64, label: "java.base", tone: "flow", a: E3(t, 21.4), fs: 21 }), /* @__PURE__ */ React.createElement(Arrow3, { pts: [[1340, 652], [1340, 676], [1210, 676], [1210, 700]], draw: M3(t, 20.5, 0.6), color: PAL3.flow }), /* @__PURE__ */ React.createElement(Arrow3, { pts: [[1500, 652], [1500, 676], [1630, 676], [1630, 700]], draw: M3(t, 20.8, 0.6), color: PAL3.flow }), /* @__PURE__ */ React.createElement(Arrow3, { pts: [[1210, 772], [1210, 800], [1360, 800], [1360, 826]], draw: M3(t, 21.6, 0.6), color: PAL3.ink2 }), /* @__PURE__ */ React.createElement(Arrow3, { pts: [[1630, 772], [1630, 800], [1480, 800], [1480, 826]], draw: M3(t, 21.8, 0.6), color: PAL3.ink2 }), /* @__PURE__ */ React.createElement(Txt3, { x: 1420, y: 760, anchor: "mid", mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 22) }, "requires"), /* @__PURE__ */ React.createElement(Note, { x: 1060, y: 572, w: 764, tone: "pull", a: win3(t, 26, 33), fs: 20, text: "Our `module-info.java` already says `requires java.logging; requires java.xml;`. jlink can follow that itself." }), /* @__PURE__ */ React.createElement(Note, { x: 1060, y: 572, w: 764, tone: "flow", a: win3(t, 33, 40), fs: 20, text: "For a plain jar with no `module-info`, `jdeps` is how you get the list." }), /* @__PURE__ */ React.createElement(Note, { x: 1060, y: 572, w: 764, tone: "bad", a: E3(t, 40), fs: 20, text: "It sees static references only. Our run also loaded classes from `jdk.localedata`, which it never listed." }));
  }
  var SIZES = [
    ["full JDK 17 (jmods, tools, everything)", 305, "bad", 19],
    ["runtime with all 70 modules", 154, "ink", 21],
    ["our 3 modules, plain jlink", 52, "pull", 25.5],
    ["+ strip debug \xB7 no headers \xB7 compress=2", 28, "flow", 27.2],
    ["+ --generate-cds-archive", 50, "violet", 45.5]
  ];
  function SJlink({ t }) {
    const BX = 1010, U = 2.45;
    const startup = [["JDK, default CDS", 81, "flow", 38.5], ["jlink runtime", 110, "bad", 39.2], ["jlink + CDS archive", 75, "violet", 45.8]];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Console3, { x: 96, y: 196, w: 880, h: 44 + 24 + 8 * 30, t, a: E3(t, 0.5), fs: 17, lh: 30, items: [
      { at: 6, text: "jlink --module-path hello.jar --add-modules hello \\", kind: "cmd" },
      { at: 6.3, text: "      --strip-debug --no-header-files --no-man-pages \\" },
      { at: 6.6, text: "      --compress=2 --output rt" },
      { at: 8.5, text: "rt/bin/java --list-modules", kind: "cmd" },
      { at: 9.1, text: "hello", kind: "ok" },
      { at: 9.3, text: "java.base@17.0.17", kind: "ok" },
      { at: 9.5, text: "java.logging@17.0.17     java.xml@17.0.17", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(Note, { x: 96, y: 540, w: 880, tone: "bad", a: E3(t, 12.5), fs: 19, title: "JDK 17 vs 21+", text: "`--compress=zip-6` is JDK 21+ syntax. JDK 17 answers **Error: Invalid compression level zip-6**." }), SIZES.map(([l, mb, tone, at], i) => {
      const y = 200 + i * 86;
      const w = mb * U * M3(t, at + 0.2, 1);
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: l }, /* @__PURE__ */ React.createElement(Txt3, { x: BX, y, fs: 20, color: PAL3.ink2, a: E3(t, at) }, l), i === 3 && t > 32 ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Box3, { x: BX, y: y + 32, w: 14 * U, h: 40, r: 4, tone: "violet", fill: true, a: 1 }), /* @__PURE__ */ React.createElement(Box3, { x: BX + 14 * U, y: y + 32, w: 12 * U, h: 40, r: 4, tone: "blue", fill: true, a: 1 }), /* @__PURE__ */ React.createElement(Box3, { x: BX + 26 * U, y: y + 32, w: 2 * U, h: 40, r: 4, tone: "ink", fill: true, a: 1 }), /* @__PURE__ */ React.createElement(Txt3, { x: BX + 28 * U + 90, y: y + 40, mono: true, fs: 18, color: PAL3.ink2, a: E3(t, 32) }, "libjvm 14 \xB7 classes 12 \xB7 rest 2")) : /* @__PURE__ */ React.createElement(Box3, { x: BX, y: y + 32, w: Math.max(1, w), h: 40, r: 4, tone, fill: true, a: w > 1 ? 1 : 0 }), /* @__PURE__ */ React.createElement(Txt3, { x: BX + mb * U + 12, y: y + 38, mono: true, fs: 22, weight: 700, color: toneColor3(tone), a: E3(t, at + 1) }, mb, " MB"));
    }), /* @__PURE__ */ React.createElement(MeasTag, { x: BX, y: 650, a: E3(t, 19.5), text: "du -sh \xB7 JDK 17 \xB7 macOS arm64" }), /* @__PURE__ */ React.createElement(Txt3, { x: 96, y: 690, mono: true, fs: 18, color: PAL3.ink3, a: E3(t, 38.5) }, "STARTUP \xB7 MEDIAN OF 50 RUNS"), startup.map(([l, ms, tone, at], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: l }, /* @__PURE__ */ React.createElement(Txt3, { x: 96, y: 734 + i * 58, fs: 20, color: PAL3.ink2, a: E3(t, at) }, l), /* @__PURE__ */ React.createElement(Box3, { x: 340, y: 726 + i * 58, w: ms * 4.6 * M3(t, at + 0.2, 0.8), h: 40, r: 4, tone, fill: true, a: E3(t, at) }), /* @__PURE__ */ React.createElement(Txt3, { x: 350 + ms * 4.6, y: 732 + i * 58, mono: true, fs: 21, weight: 700, color: toneColor3(tone), a: E3(t, at + 0.8) }, ms, " ms"))), /* @__PURE__ */ React.createElement(Note, { x: BX, y: 700, w: 814, tone: "bad", a: win3(t, 39.5, 46), fs: 20, text: "A fresh jlink image has **no CDS archive**, so every start parses its classes again." }), /* @__PURE__ */ React.createElement(Note, { x: BX, y: 700, w: 814, tone: "violet", a: win3(t, 46, 53), fs: 20, text: "`--generate-cds-archive` dumps one into the image: +22 MB, and startup is back." }), /* @__PURE__ */ React.createElement(Note, { x: BX, y: 700, w: 814, tone: "flow", a: E3(t, 53), fs: 20, text: "For containers: a **28\u201350 MB** runtime layer instead of a 300 MB JDK. Faster pulls, smaller registries." }));
  }
  function SJlinkTraps({ t }) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt3, { x: 96, y: 196, mono: true, fs: 18, color: PAL3.pull, a: E3(t, 4) }, "1 \xB7 ONLY EXPLICIT MODULES"), /* @__PURE__ */ React.createElement(Box3, { x: 96, y: 232, w: 330, h: 74, label: "user.jar", sub: "module user \xB7 requires util", tone: "flow", a: E3(t, 4.3), fs: 20, sfs: 17 }), /* @__PURE__ */ React.createElement(Box3, { x: 456, y: 232, w: 380, h: 74, label: "util-1.0.jar", sub: "no module-info \u2192 automatic", tone: "pull", a: E3(t, 5), fs: 20, sfs: 17 }), /* @__PURE__ */ React.createElement(HArrow3, { x1: 846, x2: 920, y: 269, a: E3(t, 6), color: PAL3.ink2 }), /* @__PURE__ */ React.createElement(Box3, { x: 930, y: 232, w: 200, h: 74, label: "jlink", tone: t > 10.5 ? "bad" : "ink", a: E3(t, 6.2), fs: 22, glow: pulse3(t, [10.8], 1.2) }), /* @__PURE__ */ React.createElement(Mark3, { x: 1110, y: 238, ok: false, a: E3(t, 11) }), /* @__PURE__ */ React.createElement(Console3, { x: 96, y: 326, w: 1728, h: 44 + 24 + 2 * 30, t, a: E3(t, 10.5), fs: 17, lh: 30, items: [
      { at: 10.6, text: "jlink -p user.jar:util-1.0.jar --add-modules user --output rt", kind: "cmd" },
      { at: 11.4, text: "Error: automatic module cannot be used with jlink: util from file:///\u2026/auto/util-1.0.jar", kind: "err" }
    ] }), /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 478, w: 1728, h: 44 + 24 + 3 * 32, lang: "shell", fs: 18, lh: 32, title: "the usual workaround: jlink only the JDK, keep your jars on the class path", a: E3(t, 17), lines: [
      '$ jdeps --print-module-deps --ignore-missing-deps -cp "lib/*" app.jar',
      "$ jlink --add-modules java.base,java.logging,java.xml --output rt",
      '$ rt/bin/java -cp "app.jar:lib/*" com.example.Main'
    ] }), /* @__PURE__ */ React.createElement(Txt3, { x: 96, y: 666, mono: true, fs: 18, color: PAL3.pull, a: E3(t, 24) }, "2 \xB7 JDEPS SEES STATIC REFERENCES ONLY"), /* @__PURE__ */ React.createElement(Console3, { x: 96, y: 700, w: 1728, h: 44 + 24 + 3 * 30, t, a: E3(t, 24.3), fs: 17, lh: 30, items: [
      { at: 30.5, text: "java -Xlog:class+load -jar hello.jar | grep jdk.localedata        (abridged)", kind: "cmd" },
      { at: 31.2, text: "[0.052s][info][class,load] sun.util.resources.cldr.provider.CLDRLocaleDataMetaInfo source: jrt:/jdk.localedata", kind: "ok" },
      { at: 31.5, text: "[0.055s][info][class,load] sun.text.resources.cldr.ext.FormatData_en_001 source: jrt:/jdk.localedata", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(Note, { x: 96, y: 866, w: 1728, tone: "bad", a: E3(t, 37), fs: 20, text: "Loaded through a service lookup, invisible to `jdeps`. Test the trimmed runtime itself, and add modules like `jdk.localedata` by hand." }));
  }
  function SJpackage({ t }) {
    const tree = [
      ["Hello.app/Contents/", PAL3.ink, ""],
      ["  MacOS/Hello", PAL3.pull, "native launcher"],
      ["  app/hello.jar", PAL3.flow, "our jar"],
      ["  app/Hello.cfg", PAL3.flow, "main class, class path"],
      ["  runtime/", PAL3.violet, "a private JVM"],
      ["  Info.plist", PAL3.ink2, ""]
    ];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, [["hello.jar", "the app", "flow"], ["jlink runtime", "built for you", "violet"], ["native launcher", "starts the JVM", "pull"]].map(([l, s, tone], i) => /* @__PURE__ */ React.createElement(Box3, { key: l, x: 96, y: 210 + i * 104, w: 300, h: 84, label: l, sub: s, tone, a: E3(t, 5.5 + i * 0.5), fs: 21 })), [0, 1, 2].map((i) => /* @__PURE__ */ React.createElement(Arrow3, { key: i, pts: [[400, 252 + i * 104], [440, 252 + i * 104], [440, 356], [476, 356]], draw: M3(t, 7 + i * 0.2, 0.6), color: PAL3.ink2 })), /* @__PURE__ */ React.createElement(Box3, { x: 480, y: 314, w: 220, h: 84, label: "jpackage", tone: "pull", a: POP3(t, 7.6), fs: 24, glow: pulse3(t, [8], 1.2) }), /* @__PURE__ */ React.createElement(HArrow3, { x1: 704, x2: 756, y: 356, a: E3(t, 12), color: PAL3.pull }), /* @__PURE__ */ React.createElement(Panel3, { x: 760, y: 196, w: 580, h: 340, title: "--type app-image \xB7 real layout", tone: "flow", a: E3(t, 12) }, /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 20px" } }, tree.map(([p, c, d], i) => /* @__PURE__ */ React.createElement("div", { key: p, style: { display: "flex", justifyContent: "space-between", height: 44, alignItems: "center", font: `500 19px ${MONO3}`, color: c, opacity: E3(t, 12.4 + i * 0.35), whiteSpace: "pre" } }, /* @__PURE__ */ React.createElement("span", null, p), /* @__PURE__ */ React.createElement("span", { style: { font: `400 17px ${SANS3}`, color: PAL3.ink3 } }, d))))), /* @__PURE__ */ React.createElement(Txt3, { x: 1380, y: 200, mono: true, fs: 18, color: PAL3.ink3, a: E3(t, 19.5) }, "SIZE \xB7 REAL"), [["default runtime", "125 MB", "bad", 19.5], ["--add-modules (our 3)", "29 MB", "flow", 22], ["Hello-1.0.dmg", "18.8 MB", "pull", 27.5]].map(([l, v, tone, at], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: l }, /* @__PURE__ */ React.createElement(Txt3, { x: 1380, y: 240 + i * 98, fs: 20, color: PAL3.ink2, a: E3(t, at) }, l), /* @__PURE__ */ React.createElement(Txt3, { x: 1380, y: 268 + i * 98, mono: true, fs: 40, weight: 700, color: toneColor3(tone), a: E3(t, at + 0.3) }, v))), /* @__PURE__ */ React.createElement(Console3, { x: 96, y: 572, w: 1728, h: 44 + 24 + 3 * 30, t, a: E3(t, 27), fs: 17, lh: 30, items: [
      { at: 27.2, text: "jpackage --name Hello --input input --main-jar hello.jar --main-class app.Main \\", kind: "cmd" },
      { at: 27.5, text: "         --type dmg --add-modules java.base,java.logging,java.xml" },
      { at: 28.6, text: "ls dmg/   \u2192   Hello-1.0.dmg   (18,829,607 bytes)", kind: "ok" }
    ] }), [["macOS", "dmg \xB7 pkg"], ["Windows", "msi \xB7 exe"], ["Linux", "deb \xB7 rpm"]].map(([os, f], i) => /* @__PURE__ */ React.createElement(Box3, { key: os, x: 96 + i * 410, y: 766, w: 390, h: 96, label: os, sub: f, fs: 24, sfs: 19, tone: i === 0 ? "flow" : "ink", a: E3(t, 29 + i * 0.4), glow: i === 0 ? win3(t, 29, 34) * 0.6 : 0 })), /* @__PURE__ */ React.createElement(Note, { x: 1356, y: 762, w: 468, tone: "pull", a: win3(t, 34.5, 41), fs: 19, text: "No cross-building: each OS's installer is made on that OS, usually by CI." }), /* @__PURE__ */ React.createElement(Note, { x: 1356, y: 762, w: 468, tone: "violet", a: E3(t, 41), fs: 19, text: "Packaging, not speed. It starts exactly as fast as the JVM inside it." }));
  }

  // src/topics/8.10/scenes4.jsx
  var {
    PAL: PAL4,
    MOTION: MOTION4,
    lin: lin4,
    lerp: lerp4,
    win: win4,
    pulse: pulse4,
    track: track3,
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
    Table: Table4,
    Mark: Mark4,
    Val: Val3,
    Brace: Brace4,
    Chip: Chip4,
    toneColor: toneColor4
  } = window.AN;
  var E4 = MOTION4.enter;
  var M4 = MOTION4.move;
  var POP4 = MOTION4.pop;
  var NSTAGES = [["hello.jar", "+ JDK classes", "ink", 0.8], ["analyse", "what can main reach?", "flow", 6], ["initialise", "snapshot \u2192 image heap", "pull", 12.5], ["compile", "machine code, AOT", "pink", 19.5], ["link", "+ Substrate VM", "violet", 26]];
  function SNativeIdea({ t }) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, NSTAGES.map(([l, s, tone, at], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: l }, /* @__PURE__ */ React.createElement(Box4, { x: 96 + i * 357, y: 204, w: 300, h: 96, label: l, sub: s, tone, a: E4(t, at), fs: 23, glow: pulse4(t, [at + 0.3], 1.2) }), i > 0 && /* @__PURE__ */ React.createElement(HArrow4, { x1: 96 + i * 357 - 52, x2: 96 + i * 357 - 6, y: 252, a: E4(t, at), color: toneColor4(tone) }))), /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: 318, mono: true, fs: 18, color: PAL4.ink3, a: E4(t, 1.5) }, "native-image -jar hello.jar     \xB7  all of this happens at build time"), /* @__PURE__ */ React.createElement(DocTag, { x: 1300, y: 330, a: E4(t, 1.5), text: "documented behaviour \xB7 not run here" }), /* @__PURE__ */ React.createElement(Panel4, { x: 96, y: 380, w: 900, h: 360, title: "./hello \xB7 one native executable", tone: "flow", a: E4(t, 33), glow: win4(t, 33, 41) * 0.6 }), /* @__PURE__ */ React.createElement(Box4, { x: 126, y: 444, w: 840, h: 80, align: "left", label: "machine code", sub: "only the methods main can reach", tone: "pink", fill: true, a: E4(t, 19.8), fs: 22 }), /* @__PURE__ */ React.createElement(Box4, { x: 126, y: 538, w: 840, h: 80, align: "left", label: "image heap", sub: "objects built by initialisers during the build", tone: "pull", fill: true, a: E4(t, 13), fs: 22 }), /* @__PURE__ */ React.createElement(Box4, { x: 126, y: 632, w: 840, h: 80, align: "left", label: "Substrate VM", sub: "garbage collector \xB7 threads \xB7 exceptions", tone: "violet", fill: true, a: E4(t, 26.4), fs: 22 }), /* @__PURE__ */ React.createElement(Txt4, { x: 1060, y: 384, mono: true, fs: 18, color: PAL4.ink3, a: E4(t, 34) }, "NOT AT RUN TIME"), ["class loading", "bytecode verification", "interpreter", "JIT compiler", "bytecode at all"].map((l, i) => /* @__PURE__ */ React.createElement(Box4, { key: l, x: 1060, y: 420 + i * 64, w: 764, h: 52, label: l, fs: 21, tone: "bad", strike: t > 34.6 + i * 0.4, a: E4(t, 34 + i * 0.4) })), /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: 772, mono: true, fs: 18, color: PAL4.ink3, a: E4(t, 41) }, "STARTING ./hello"), ["map the binary", "map the image heap", "call main()"].map((l, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: l }, /* @__PURE__ */ React.createElement(Box4, { x: 96 + i * 380, y: 806, w: 330, h: 70, label: l, tone: "flow", fs: 21, a: E4(t, 41.4 + i * 0.6) }), i > 0 && /* @__PURE__ */ React.createElement(HArrow4, { x1: 96 + i * 380 - 46, x2: 96 + i * 380 - 6, y: 841, a: E4(t, 41.4 + i * 0.6), color: PAL4.flow }))), /* @__PURE__ */ React.createElement(Note, { x: 1260, y: 796, w: 564, tone: "violet", a: E4(t, 49), fs: 20, text: "All three startup costs, gone. The bill comes in another currency." }));
  }
  var GNODES = [
    { id: "main", label: "main", x: 1290, y: 206, w: 200, at: 6, tone: "flow" },
    { id: "log", label: "Logger", sub: "getLogger \xB7 info", x: 940, y: 316, w: 270, at: 12.5, tone: "flow" },
    { id: "dbf", label: "DocumentBuilder\u2026", sub: "newInstance \xB7 parse", x: 1240, y: 316, w: 300, at: 13.3, tone: "flow" },
    { id: "list", label: "List.of", sub: "stream \xB7 collect", x: 1570, y: 316, w: 254, at: 14.1, tone: "flow" },
    { id: "hnd", label: "handlers", sub: "formatter", x: 940, y: 440, w: 270, at: 15, tone: "flow" },
    { id: "xer", label: "Xerces", sub: "scanner \xB7 DOM", x: 1240, y: 440, w: 300, at: 15.6, tone: "flow" },
    { id: "lam", label: "lambda", sub: "indy linked at build", x: 1570, y: 440, w: 254, at: 19.5, tone: "flow" },
    { id: "fn", label: "Class.forName(impl)", sub: "impl = a system property", x: 1140, y: 586, w: 400, at: 25.5, tone: "pull" },
    { id: "pol", label: "app.Polite", sub: "not in the image", x: 1140, y: 740, w: 400, at: 32, tone: "bad" }
  ];
  var GEDGES = [["main", "log"], ["main", "dbf"], ["main", "list"], ["log", "hnd"], ["dbf", "xer"], ["list", "lam"]];
  function SPointsTo({ t }) {
    const N = Object.fromEntries(GNODES.map((n) => [n.id, n]));
    const lines = HELLO_MAIN.map((s, i) => {
      let tone = null, a = 0;
      if (i === 1 || i === 2) {
        tone = "flow";
        a = E4(t, 12.5);
      }
      if (i >= 3 && i <= 6) {
        tone = "flow";
        a = E4(t, 13.3);
      }
      if (i >= 7 && i <= 10) {
        tone = "flow";
        a = E4(t, 14.1);
      }
      if (i >= 11 && i <= 13) {
        tone = t > 32 ? "bad" : "pull";
        a = E4(t, 25.5);
      }
      return tone ? { s, tone, toneA: a } : s;
    });
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code4, { x: 96, y: 196, w: 800, h: 500, title: "app/Main.java", fs: 17, lh: 27, a: E4(t, 0.5), lines }), GNODES.map((n) => /* @__PURE__ */ React.createElement(
      Box4,
      {
        key: n.id,
        x: n.x,
        y: n.y,
        w: n.w,
        h: n.sub ? 82 : 64,
        label: n.label,
        sub: n.sub,
        tone: n.tone,
        fill: n.id !== "pol",
        dashed: n.id === "pol",
        fs: 20,
        sfs: 17,
        a: n.id === "pol" ? E4(t, n.at) * (0.5 + 0.5 * E4(t, 38.5)) : E4(t, n.at),
        glow: pulse4(t, [n.at + 0.2], 1.1),
        strike: n.id === "pol" && t > 38.5
      }
    )), GEDGES.map(([a, b], k) => {
      const A = N[a], B = N[b];
      const ax = A.x + A.w / 2, ay = A.y + (A.sub ? 82 : 64), bx = B.x + B.w / 2, by = B.y;
      const mid = (ay + by) / 2;
      return /* @__PURE__ */ React.createElement(Arrow4, { key: k, pts: ax === bx ? [[ax, ay + 2], [bx, by - 4]] : [[ax, ay + 2], [ax, mid], [bx, mid], [bx, by - 4]], draw: M4(t, B.at - 0.4, 0.5), color: PAL4.flow });
    }), /* @__PURE__ */ React.createElement(Arrow4, { pts: [[1340, 522], [1340, 582]], draw: M4(t, 25, 0.5), color: PAL4.pull }), /* @__PURE__ */ React.createElement(Txt4, { x: 1360, y: 538, mono: true, fs: 17, color: PAL4.pull, a: E4(t, 25.3) }, "from main"), /* @__PURE__ */ React.createElement(Arrow4, { pts: [[1340, 668], [1340, 736]], draw: M4(t, 32, 0.6), color: PAL4.bad, dashed: true }), /* @__PURE__ */ React.createElement(Txt4, { x: 1364, y: 688, mono: true, fs: 22, weight: 700, color: PAL4.bad, a: E4(t, 32.3) }, "?"), /* @__PURE__ */ React.createElement(Note, { x: 96, y: 720, w: 800, tone: "bad", a: win4(t, 32, 45), fs: 20, text: "A string known only at run time. The analysis can't follow it, and nothing else mentions `app.Polite`." }), /* @__PURE__ */ React.createElement(Note, { x: 96, y: 720, w: 800, tone: "flow", a: win4(t, 45, 52.5), fs: 20, text: '`Class.forName("app.Polite")` with a **constant** would be folded by the analysis, and the class kept.' }), /* @__PURE__ */ React.createElement(Note, { x: 96, y: 720, w: 800, tone: "violet", a: E4(t, 52.5), fs: 20, text: "Whatever main can't reach is left out: Swing, `java.sql`, the compiler\u2026 That's why binaries are small." }), /* @__PURE__ */ React.createElement(Badge4, { x: 1580, y: 600, text: "nothing fails at build time", tone: "bad", a: E4(t, 38.8), fs: 17, anchor: "left" }));
  }
  function SWhatBreaks({ t }) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Box4, { x: 96, y: 200, w: 840, h: 104, align: "left", label: "java -jar hello.jar", sub: "prints \u201CGood day, world.\u201D", tone: "flow", a: E4(t, 0.6), fs: 22, sfs: 19 }), /* @__PURE__ */ React.createElement(Mark4, { x: 900, y: 252, ok: true, a: E4(t, 1.4) }), /* @__PURE__ */ React.createElement(Box4, { x: 984, y: 200, w: 840, h: 104, align: "left", label: "./hello", sub: "Class.forName(impl) can't find app.Polite", tone: "bad", a: E4(t, 5.5), fs: 22, sfs: 19, glow: pulse4(t, [6.2], 1.2) }), /* @__PURE__ */ React.createElement(Mark4, { x: 1788, y: 252, ok: false, a: E4(t, 6.2) }), /* @__PURE__ */ React.createElement(Txt4, { x: 984, y: 314, mono: true, fs: 17, color: PAL4.violet, a: E4(t, 6.5) }, "documented: ClassNotFoundException in older releases, MissingReflectionRegistrationError in newer"), /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: 364, mono: true, fs: 18, color: PAL4.ink3, a: E4(t, 12.5) }, "INVISIBLE TO THE ANALYSIS UNLESS DECLARED"), ["reflection", "dynamic proxies", "JNI", "serialization", "computed resource names"].map((l, i) => /* @__PURE__ */ React.createElement(Chip4, { key: l, x: [180, 420, 610, 800, 1100][i], y: 418, text: l, tone: "pull", o: POP4(t, 12.8 + i * 0.35), fs: 20 })), /* @__PURE__ */ React.createElement(Code4, { x: 96, y: 470, w: 840, h: 44 + 24 + 7 * 30, lang: "plain", fs: 18, lh: 30, title: "META-INF/native-image/\u2026/reachability-metadata.json", a: E4(t, 19.5), lines: [
      "{",
      '  "reflection": [',
      '    { "type": "app.Polite",',
      '      "methods": [',
      '        { "name": "<init>", "parameterTypes": [] } ] }',
      "  ]",
      "}"
    ].map((s, i) => ({ s, tone: i >= 2 && i <= 4 ? "flow" : void 0, toneA: E4(t, 21) })) }), /* @__PURE__ */ React.createElement(Note, { x: 984, y: 470, w: 840, tone: "violet", a: E4(t, 26.5), fs: 19, text: "One file in recent GraalVM releases. Older ones used `reflect-config.json`, `resource-config.json` and friends." }), /* @__PURE__ */ React.createElement(Code4, { x: 984, y: 590, w: 840, h: 44 + 24 + 2 * 32, lang: "shell", fs: 17, lh: 32, title: "let the JVM tell you: the tracing agent", a: E4(t, 33.5), lines: [
      "$ java -agentlib:native-image-agent=config-output-dir=cfg -jar hello.jar",
      "# writes the reflection, resources, proxies this run used"
    ] }), ["Spring Boot 3 \xB7 AOT processing", "Quarkus \xB7 Micronaut", "Reachability Metadata Repository"].map((l, i) => /* @__PURE__ */ React.createElement(Box4, { key: l, x: 984 + (i === 2 ? 0 : i * 424), y: i === 2 ? 834 : 768, w: i === 2 ? 840 : 416, h: 56, label: l, fs: 19, tone: "flow", a: E4(t, 41 + i * 0.4) })), /* @__PURE__ */ React.createElement(Note, { x: 96, y: 810, w: 840, tone: "bad", a: E4(t, 48), fs: 19, text: "The pain: an old library doing reflection nobody declared. It passes the build and fails in production." }));
  }
  function SBuildInit({ t }) {
    const objs = [["Map", 0], ['"en" \u2192 "Hello"', 1], ['"fr" \u2192 "Bonjour"', 2]];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code4, { x: 96, y: 196, w: 1e3, h: 44 + 24 + 4 * 34, fs: 19, lh: 34, title: "Greetings.java", a: E4(t, 0.5), lines: [
      "class Greetings {",
      { s: "    static final Map<String, String> BY_LANG = loadTable();", tone: "pull", toneA: win4(t, 6, 19.5) },
      { s: "    static final long BUILT_AT = System.currentTimeMillis();", tone: "bad", toneA: E4(t, 19.5) },
      "}"
    ] }), /* @__PURE__ */ React.createElement(Code4, { x: 1140, y: 196, w: 684, h: 44 + 24 + 2 * 34, lang: "shell", fs: 18, lh: 34, title: "opt in, per class or package", a: E4(t, 33.5), lines: ["$ native-image --initialize-at-build-time=app.Greetings \\", "      -jar hello.jar"] }), /* @__PURE__ */ React.createElement(Panel4, { x: 96, y: 440, w: 820, h: 300, title: "build machine \xB7 native-image", tone: "pull", a: E4(t, 6) }), /* @__PURE__ */ React.createElement(Box4, { x: 126, y: 504, w: 260, h: 70, label: "<clinit> runs", tone: "pull", a: E4(t, 6.6), fs: 21, glow: pulse4(t, [7], 1) }), /* @__PURE__ */ React.createElement(Box4, { x: 126, y: 600, w: 340, h: 70, label: "BUILT_AT", sub: "build machine's clock", tone: "bad", a: E4(t, 20), fs: 20 }), /* @__PURE__ */ React.createElement(Panel4, { x: 1004, y: 440, w: 820, h: 300, title: "./hello \xB7 image heap", tone: "flow", a: E4(t, 8) }), objs.map(([l, i]) => {
      const [x, y] = track3(t, [[7.4 + i * 0.3, 600 + 0, 530 + i * 64], [9.5 + i * 0.3, 600, 530 + i * 64], [11 + i * 0.3, 1290, 530 + i * 64]]);
      return /* @__PURE__ */ React.createElement(Val3, { key: l, x: x + 50, y, text: l, tone: i === 0 ? "pull" : "ink", o: E4(t, 7.4 + i * 0.3), fs: 19, h: 44 });
    }), /* @__PURE__ */ React.createElement(Val3, { x: lerp4(560, 1340, M4(t, 21.5, 1.4)), y: 700, text: "BUILT_AT", tone: "bad", o: E4(t, 21), fs: 19, h: 40 }), /* @__PURE__ */ React.createElement(Txt4, { x: 1034, y: 504, fs: 20, color: PAL4.flow, a: E4(t, 13) }, "already there at start: no <clinit>, no parsing"), /* @__PURE__ */ React.createElement(Note, { x: 96, y: 770, w: 1728, tone: "bad", a: win4(t, 19.5, 33.5), fs: 21, text: "Frozen at build time: a timestamp, a random seed, an environment variable, a host name. Every copy of the binary gets the build machine's value." }), /* @__PURE__ */ React.createElement(Note, { x: 96, y: 770, w: 1728, tone: "pull", a: win4(t, 33.5, 41), fs: 21, text: "So **application classes initialise at run time** by default. Build-time initialisation is an explicit choice." }), /* @__PURE__ */ React.createElement(Note, { x: 96, y: 770, w: 1728, tone: "flow", a: E4(t, 41), fs: 21, text: "Frameworks lean on it: Quarkus and Spring's AOT mode do much of their wiring during the build, so it isn't repeated at start." }));
  }
  function SNativeCosts({ t }) {
    const rows = [
      ["startup", "hundreds of ms or more", "a few to tens of ms"],
      ["memory", "larger: JIT, metadata", "often several \xD7 smaller"],
      ["peak throughput", "higher: C2 + live profile", "usually lower"],
      ["build", "seconds", "minutes, GBs of RAM"],
      ["GC", "every HotSpot GC", "Serial (CE) \xB7 G1 (Oracle, Linux)"],
      ["tools", "JFR, jcmd, agents, JMX", "a different, smaller set"]
    ];
    const marks = { 0: ["flow", win4(t, 6, 13)], 1: ["flow", win4(t, 6, 13)], 2: ["bad", win4(t, 13, 26.5)], 3: ["bad", win4(t, 33, 39)], 4: ["pull", win4(t, 39, 45.5)], 5: ["pull", E4(t, 45.5)] };
    const gx0 = 160, gx1 = 1780, gy0 = 890, gy1 = 700;
    const jvm = (p) => p < 0.08 ? 0.05 : p < 0.5 ? lerp4(0.05, 0.95, (p - 0.08) / 0.42) : 0.95;
    const pts = (f, upTo) => {
      const a = [];
      for (let p = 0; p <= upTo; p += 0.01) a.push([lerp4(gx0, gx1, p), lerp4(gy0, gy1, f(p))].join(","));
      return a.join(" ");
    };
    const up = lin4(t, 20, 5);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(DocTag, { x: 96, y: 204, a: E4(t, 0.6), text: "typical reported ranges \xB7 not measured here" }), /* @__PURE__ */ React.createElement(
      Table4,
      {
        x: 96,
        y: 232,
        cols: [250, 370, 440],
        head: ["", "JVM", "native image"],
        rows,
        fs: 21,
        rh: 52,
        a: E4(t, 0.8),
        marks,
        rowA: rows.map((_, i) => E4(t, 1 + i * 0.3)),
        colColors: [PAL4.ink2, PAL4.ink, PAL4.ink]
      }
    ), /* @__PURE__ */ React.createElement(Note, { x: 1200, y: 232, w: 624, tone: "pull", a: win4(t, 26.5, 33), fs: 20, title: "PGO", text: "Profile-guided optimisation in Oracle GraalVM: build, run a training workload, rebuild with its profile. Recovers much of the gap." }), /* @__PURE__ */ React.createElement(Note, { x: 1200, y: 232, w: 624, tone: "bad", a: win4(t, 13, 26.5), fs: 20, title: "why lower", text: "No runtime profile, so no speculative inlining or devirtualisation based on what really happens." }), /* @__PURE__ */ React.createElement(Note, { x: 1200, y: 232, w: 624, tone: "violet", a: E4(t, 33), fs: 20, title: "different pipeline", text: "Minutes per build, a different debugging story, and every reflective library needs metadata." }), /* @__PURE__ */ React.createElement(Panel4, { x: 96, y: 652, w: 1728, h: 268, title: "throughput over time", right: "illustrative", a: E4(t, 19.5) }), /* @__PURE__ */ React.createElement("svg", { width: "1920", height: "1080", style: { position: "absolute", left: 0, top: 0, opacity: E4(t, 20) } }, /* @__PURE__ */ React.createElement("line", { x1: gx0, y1: gy0, x2: gx1, y2: gy0, stroke: PAL4.line2, strokeWidth: "2" }), up > 0.01 && /* @__PURE__ */ React.createElement("polyline", { points: pts(jvm, up), fill: "none", stroke: PAL4.flow, strokeWidth: "4" }), up > 0.01 && /* @__PURE__ */ React.createElement("polyline", { points: pts(() => 0.66, up), fill: "none", stroke: PAL4.violet, strokeWidth: "4", strokeDasharray: "12 8" }), /* @__PURE__ */ React.createElement("line", { x1: gx0, y1: lerp4(gy0, gy1, 0.85), x2: gx1, y2: lerp4(gy0, gy1, 0.85), stroke: PAL4.pull, strokeWidth: "2", strokeDasharray: "4 8", opacity: E4(t, 27) })), /* @__PURE__ */ React.createElement(Txt4, { x: gx0 + 20, y: lerp4(gy0, gy1, 0.66) - 32, mono: true, fs: 18, color: PAL4.violet, a: E4(t, 21) }, "native: fast from the first request"), /* @__PURE__ */ React.createElement(Txt4, { x: lerp4(gx0, gx1, 0.62), y: lerp4(gy0, gy1, 0.95) - 2, mono: true, fs: 18, color: PAL4.flow, a: E4(t, 23) }, "JVM after warm-up"), /* @__PURE__ */ React.createElement(Txt4, { x: lerp4(gx0, gx1, 0.62), y: lerp4(gy0, gy1, 0.85) - 2, mono: true, fs: 17, color: PAL4.pull, a: E4(t, 27) }, "native + PGO"));
  }
  var MEAS = [["-Xshare:off", 122, "bad", 6, "everything parsed"], ["default CDS", 81, "flow", 7, "JDK classes mapped"], ["+ AppCDS", 75, "flow", 8, "app classes mapped too"], ["jlink, no archive", 110, "pull", 13, "small, but parses again"], ["jlink + CDS", 75, "violet", 14, "small and mapped"]];
  function SAllTogether({ t }) {
    const BX = 520, U = 7.6;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(MeasTag, { x: 96, y: 204, a: E4(t, 0.6), text: "measured \xB7 hello.jar \xB7 JDK 17 \xB7 median of 50 runs" }), MEAS.map(([l, ms, tone, at, why], i) => {
      const y = 236 + i * 72;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: l }, /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: y + 12, fs: 23, color: PAL4.ink, a: E4(t, at) }, l), /* @__PURE__ */ React.createElement(Box4, { x: BX, y, w: ms * U * M4(t, at + 0.2, 0.9), h: 52, r: 6, tone, fill: true, a: E4(t, at) }), /* @__PURE__ */ React.createElement(Txt4, { x: BX + ms * U + 14, y: y + 10, mono: true, fs: 24, weight: 700, color: toneColor4(tone), a: E4(t, at + 0.9) }, ms, " ms"), /* @__PURE__ */ React.createElement(Txt4, { x: BX + ms * U + 130, y: y + 14, mono: true, fs: 18, color: PAL4.ink3, a: E4(t, 35 + i * 0.3) }, why));
    }), /* @__PURE__ */ React.createElement(DocTag, { x: 96, y: 624, a: E4(t, 21), text: "documented \xB7 JEP 483 \xB7 Spring PetClinic" }), [["JDK 23", 4.486, "bad"], ["JDK 24 + AOT cache", 2.604, "pull"]].map(([l, s, tone], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: l }, /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: 666 + i * 70, fs: 23, a: E4(t, 21.5 + i * 0.6) }, l), /* @__PURE__ */ React.createElement(Box4, { x: BX, y: 654 + i * 70, w: s * 240 * M4(t, 21.7 + i * 0.6, 0.9), h: 52, r: 6, tone, fill: true, a: E4(t, 21.5 + i * 0.6) }), /* @__PURE__ */ React.createElement(Txt4, { x: BX + s * 240 + 14, y: 664 + i * 70, mono: true, fs: 24, weight: 700, color: toneColor4(tone), a: E4(t, 22.4 + i * 0.6) }, s.toFixed(3), " s"))), /* @__PURE__ */ React.createElement(Txt4, { x: BX + 2.604 * 240 + 160, y: 738, mono: true, fs: 18, color: PAL4.ink3, a: E4(t, 35.8) }, "loaded and linked too"), /* @__PURE__ */ React.createElement(Note, { x: 96, y: 810, w: 1728, tone: "violet", a: E4(t, 28), fs: 21, text: "Native image would start fastest of all, in milliseconds by most reports. But it is no longer a JVM, and it bills you differently." }));
  }
  var DECIDE = [
    ["Long-running server", "Plain JVM. Startup amortises to nothing; keep the JIT's peak.", 5, "flow"],
    ["Deploys or restarts often", "JVM + AppCDS now, + the AOT cache on JDK 24+. A flag, not a rewrite.", 11, "flow"],
    ["Image size matters", "Add `jlink`, with `--generate-cds-archive` so startup doesn't regress.", 18, "pull"],
    ["Scales out constantly", "Native image or JVM + AOT cache. Measure both under real load.", 24.5, "pull"],
    ["Serverless \xB7 CLI tool", "Native image: cold start is the product.", 31.5, "violet"],
    ["Desktop application", "`jpackage`: users never install Java.", 38, "pink"]
  ];
  function SDecide({ t }) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, DECIDE.map(([w, c, at, tone], i) => {
      const y = 196 + i * 96;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: w }, /* @__PURE__ */ React.createElement(Box4, { x: 96, y, w: 520, h: 80, align: "left", label: w, fs: 23, mono: false, tone: "ink", a: E4(t, at) }), /* @__PURE__ */ React.createElement(HArrow4, { x1: 626, x2: 690, y: y + 40, a: E4(t, at + 0.6), color: toneColor4(tone) }), /* @__PURE__ */ React.createElement(Box4, { x: 700, y, w: 1124, h: 80, align: "left", label: c, fs: 22, mono: false, tone, fill: true, a: E4(t, at + 0.8), glow: pulse4(t, [at + 1], 1) }));
    }), /* @__PURE__ */ React.createElement(Note, { x: 96, y: 790, w: 1728, tone: "pull", a: E4(t, 44), fs: 22, title: "the honest default", text: "Plain JVM plus the AOT cache when you're on JDK 24+. Native image is a commitment: take it when cold start is the actual requirement." }));
  }
  var TRAPS = [
    [3.5, "\u201CAOT means no JIT\u201D", "Leyden keeps the JIT. Only native image removes it."],
    [9.5, "\u201CNative image is strictly better\u201D", "Lower peak, slow builds, reflection metadata. Wrong for long-running servers."],
    [15.5, "\u201Cjlink takes any jar\u201D", "Automatic modules are refused. jlink the JDK, keep jars on the class path."],
    [21.5, "\u201CMy CDS archive is being used\u201D", "A rebuilt jar silently invalidates it. `-Xshare:on` turns that into an error."],
    [27.5, "\u201CA trimmed runtime starts faster\u201D", "Without `--generate-cds-archive` it starts slower: 110 ms vs 81 ms here."]
  ];
  function STraps({ t }) {
    return TRAPS.map(([at, myth, real], i) => {
      const y = 196 + i * 142;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, /* @__PURE__ */ React.createElement(Box4, { x: 96, y, w: 700, h: 122, label: myth, mono: false, fs: 24, tone: "bad", a: E4(t, at), strike: t > at + 2, style: { whiteSpace: "normal" } }), /* @__PURE__ */ React.createElement(HArrow4, { x1: 810, x2: 880, y: y + 61, a: E4(t, at + 1.5), color: PAL4.flow }), /* @__PURE__ */ React.createElement(Card4, { x: 896, y, w: 928, h: 122, a: E4(t, at + 1.6), tone: "flow", title: real, tfs: 24 }));
    });
  }
  var RECAP = [
    [3, "1", "Why startup is slow", "Loading and verifying classes, and an interpreter with no profile."],
    [8.5, "2", "CDS \xB7 AppCDS", "Parse once, `mmap` forever. Shared pages, pre-verified. 122 \u2192 75 ms here."],
    [14, "3", "Leyden AOT cache", "JDK 24: loaded + linked classes. JDK 25: profiles. Keeps the JIT."],
    [19.5, "4", "jlink \xB7 jpackage", "Only the modules you need: 305 \u2192 28 MB. Add a CDS archive back."],
    [25, "5", "Native image", "Closed world, build-time init, no JIT. Millisecond starts, real costs."],
    [30, "6", "Default", "Plain JVM + AOT cache. Native image when cold start is the requirement."]
  ];
  function SRecap({ t }) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, RECAP.map(([at, n, title, sub], i) => /* @__PURE__ */ React.createElement(Card4, { key: n, x: 96 + i % 3 * 584, y: 210 + Math.floor(i / 3) * 300, w: 560, h: 270, num: n, title, sub, tfs: 34, sfs: 24, a: E4(t, at), tone: i === 5 ? "pull" : void 0, glow: i === 5 ? win4(t, 30.5, 40) : 0 })));
  }

  // src/topics/8.10.jsx
  var chapters = ["Intro", "Why startup is slow", "CDS and AppCDS", "Project Leyden", "jlink", "jpackage", "Native image", "Choosing", "Traps", "Recap"];
  var scenes = [
    { name: "Intro", dur: 22, ch: 0, title: "", C: SIntro },
    { name: "Timeline", dur: 50, ch: 1, title: "Where 124 milliseconds go", C: STimeline },
    { name: "ClassFlood", dur: 52, ch: 1, title: "One class, then 1,287 of them", C: SClassFlood },
    { name: "ColdJit", dur: 50, ch: 1, title: "An interpreter that has learned nothing", C: SColdJit },
    { name: "WhoCares", dur: 38, ch: 1, title: "When startup is the workload", C: SWhoCares },
    { name: "CdsIdea", dur: 56, ch: 2, title: "Class Data Sharing: parse once, map every time", C: SCdsIdea },
    { name: "AppCds", dur: 62, ch: 2, title: "AppCDS: archive your own classes too", C: SAppCds },
    { name: "CdsCheck", dur: 40, ch: 2, title: "The archive is checked, then quietly skipped", C: SCdsCheck },
    { name: "LeydenShift", dur: 58, ch: 3, title: "Project Leyden: move work earlier, keep the JIT", C: SLeydenShift },
    { name: "LeydenWorkflow", dur: 56, ch: 3, title: "The AOT cache \xB7 JDK 24+", C: SLeydenWorkflow },
    { name: "Profiles", dur: 42, ch: 3, title: "AOT does not mean no JIT", C: SProfiles },
    { name: "Jdeps", dur: 48, ch: 4, title: "jdeps: which modules does it need?", C: SJdeps },
    { name: "Jlink", dur: 60, ch: 4, title: "jlink: a runtime with only those modules", C: SJlink },
    { name: "JlinkTraps", dur: 44, ch: 4, title: "Where jlink bites", C: SJlinkTraps },
    { name: "Jpackage", dur: 48, ch: 5, title: "jpackage: an installer with its own runtime", C: SJpackage },
    { name: "NativeIdea", dur: 56, ch: 6, title: "GraalVM native image: no JVM at run time", C: SNativeIdea },
    { name: "PointsTo", dur: 60, ch: 6, title: "The closed world: reachable from main, or gone", C: SPointsTo },
    { name: "WhatBreaks", dur: 56, ch: 6, title: "What breaks, and the fix", C: SWhatBreaks },
    { name: "BuildInit", dur: 48, ch: 6, title: "Build-time initialisation: a frozen heap", C: SBuildInit },
    { name: "NativeCosts", dur: 52, ch: 6, title: "The bill for native image", C: SNativeCosts },
    { name: "AllTogether", dur: 44, ch: 7, title: "The same app, every technique", C: SAllTogether },
    { name: "Decide", dur: 54, ch: 7, title: "Which one, when", C: SDecide },
    { name: "Traps", dur: 36, ch: 8, title: "Traps", C: STraps },
    { name: "Recap", dur: 38, ch: 9, title: "Recap", C: SRecap }
  ];
  var captions = {
    Intro: [[0.8, "Every Java program pays a bill before it does anything useful: startup."], [5.5, "Our running example, a tiny `hello.jar`, takes about 120 ms and loads almost 1,300 classes to print two lines."], [12, "This topic is about shrinking that bill, and the box you ship: CDS, Leyden, jlink, jpackage and native image."], [17.5, "Every JDK 17 number you see was measured on this machine."]],
    Timeline: [[0.5, "Run `hello.jar` with class-data sharing switched off, and log where the time goes."], [6, "Before `main` even starts: 35 ms. The JVM sets up its heap, generates the interpreter and boots the module system."], [13, "Then the launcher opens the jar, reads the manifest and loads `app.Main`. 531 classes are loaded by now."], [20, "The first log line costs 57 ms: `Logger`, handlers, time-zone rules, locale data. 538 more classes."], [28, "Parsing a one-line XML file: 17 ms and 190 classes, mostly from `java.xml`."], [35, "The stream, the lambda and the reflective lookup: 4 ms and 28 classes, many generated on the fly."], [42.3, "Total: 1,287 classes to print two lines. Three of them are ours."]],
    ClassFlood: [[0.5, "Each of those classes goes through the same pipeline. Follow one: `DocumentBuilderFactory`."], [6, "Find its bytes, here inside the JDK's `lib/modules` file, and parse the class file into a structure in metaspace."], [13, "Verify it, link it, then run its static initialiser. Per class, per process, on every start."], [20, "Now multiply. `java.base` alone: 1,011 classes. Then `java.xml`, `java.logging`, and 69 generated at runtime."], [28, "How many were verified? Only 8: our three classes, a lambda, and four locale classes."], [35, "HotSpot trusts the JDK's own boot classes and skips verifying them. Application and library classes are always verified."], [43, "A Spring Boot app loads thousands of library classes, all verified. JEP 483 counts about 21,000 for Spring PetClinic."]],
    ColdJit: [[0.5, "The third cost: every method starts in the interpreter, with an empty profile."], [5.5, "`-XX:+PrintCompilation` shows what the JIT managed during one short run."], [11.5, "223 methods got a quick C1 compile with profiling. Only 21 reached C2."], [18, "And those C2 methods are tiny JDK helpers, like `String.charAt` and `String.hashCode`. None of our code."], [25, "So our program runs mostly interpreted, and exits long before the JIT pays off."], [31.5, "A long-running service gets there eventually: thousands of requests later, several times faster."], [38.5, "So startup is three costs: loading classes, verifying them, and an interpreter that knows nothing yet."], [44.5, "Every technique in this topic attacks one or more of those three."]],
    WhoCares: [[0.5, "Does any of this matter? It depends on how long the process lives."], [5, "A server that runs for three weeks pays startup once. It's a rounding error."], [11, "A container that autoscales pays it on every scale-out, while traffic waits."], [18, "A serverless function with 200 ms of real work can spend most of its billed time starting up."], [25, "A command-line tool runs for a moment. Startup is the whole experience."], [31, "That's where Java loses to Go and Node, and why this corner of the JVM is changing fastest."]],
    CdsIdea: [[0.5, "Without help, every JVM parses the same JDK classes into the same structures, on every start."], [6, "Class Data Sharing does that work once and writes the result to an archive file."], [12.5, "On the next start the JVM parses nothing. It memory-maps the archive straight into metaspace."], [19.5, "`-Xlog:cds` shows it: regions of the archive mapped at startup, one read-write and one read-only."], [26.5, "Mapped pages live in the OS page cache, so a second JVM using the same archive maps the same pages."], [33, "The read-only part is shared by every JVM using it: less memory per process on a busy host."], [40.3, "Archived classes were verified when the archive was made, so that cost disappears too."], [47.3, "Since JDK 12 the JDK ships a default archive of its core classes. It's on unless you turn it off."]],
    AppCds: [[0.5, "The default archive only holds classes the JDK picked. AppCDS archives the ones your app uses."], [5, "Step one, a training run: `-XX:ArchiveClassesAtExit` writes every class this run loaded into `app.jsa`."], [12, "For us that's 2.2 MB, a layer on top of the JDK's 13.5 MB base archive."], [18, "Step two: start with `-XX:SharedArchiveFile=app.jsa`."], [23, "Now count where classes come from. With sharing off: 1,215 parsed from the JDK image."], [29, "Default archive: 987 mapped, but 245 still parsed. Logging, XML and locale classes weren't in it."], [35, "With AppCDS: 1,246 mapped, none parsed. Only classes generated at runtime are left."], [42.5, "Wall clock, median of 50 runs: 122 ms, then 81, then 75."], [49, "Most of our win came free from the default archive. The bigger your app, the more AppCDS adds."], [54.6, "Since JDK 19, `-XX:+AutoCreateSharedArchive` does both steps. On 17 it's an unrecognised option."]],
    CdsCheck: [[0.5, "An archive is only valid for the exact setup that created it."], [5, "It records the JDK build and the class path, including each jar's size and modification time."], [11.5, "Rebuild the jar, even with identical content, and the next start can't use the archive."], [17.5, "The JVM prints one warning and carries on without it, slower. Easy to miss in a log."], [25, "Add `-Xshare:on` and a mismatch becomes a hard failure. Useful in CI, to catch a stale archive."], [32.5, "The rule: regenerate the archive in the same build step that produces the jar."]],
    LeydenShift: [[0.5, "Project Leyden asks: what else could move from every start into one earlier training run?"], [6, "At startup the JVM parses, verifies, loads and links classes, profiles methods, then compiles the hot ones."], [13, "CDS already moved parsing and verification out. That's where JDK 17 stops."], [19.5, "JDK 24, JEP 483: the AOT cache stores classes already loaded. They appear in their class loaders instantly."], [27.5, "And already linked, so the JVM skips wiring them together again."], [34, "JDK 25, JEP 515: it also stores method profiles, so the JIT can compile hot code right away."], [41, "JDK 26, JEP 516: cached objects now work with any collector, including ZGC."], [48, "What stays: the interpreter, the JIT and deoptimisation. Still a full JVM, just a well-prepared one."]],
    LeydenWorkflow: [[0.5, "The AOT cache takes three steps. JDK 17 has none of this, so the numbers here come from the JEPs."], [5.5, "Record: run the app with `-XX:AOTMode=record`. The JVM notes what it loads and links."], [12, "Create: `-XX:AOTMode=create` turns that configuration into the cache file. No application code runs."], [18, "Run: every production start passes `-XX:AOTCache=app.aot`."], [24, "JDK 25's JEP 514 folds the first two into one flag: `-XX:AOTCacheOutput`."], [30.5, "JEP 483 reports Spring PetClinic, about 21,000 classes, starting in 2.6 s instead of 4.5 s: 42% faster."], [38, "The price: a 130 MB cache, and the same JDK, OS and CPU architecture for every run."], [45, "JEP 515's profiles cut a warm-up benchmark from 90 ms to 73 ms, for 250 KB more cache."], [51, "No code changes. Your app stays a normal JVM app."]],
    Profiles: [[0.5, "Why keep the JIT at all? Because the best code depends on what the program does in production."], [6, "A cold JVM climbs: interpreter, then C1 with profiling, then C2. That climb is warm-up."], [13, "With cached profiles, C2 has data from the start, so the climb is shorter."], [20, "The peak is the same. It's the same C2, still free to re-profile and recompile."], [27, "If production behaves differently from training, it deoptimises and learns. Nothing breaks."], [34, "That's the big contrast with native image, coming up: no JIT at all."]],
    Jdeps: [[0.5, "A full JDK 17 has 70 modules: the compiler, the debugger, Swing, JShell and much more."], [6.5, "`jdeps` reads our bytecode and lists the modules it actually references."], [12.5, "`--print-module-deps` prints one line: `java.base,java.logging,java.xml`."], [19, "Three modules out of seventy. And `java.logging` and `java.xml` each need only `java.base`."], [26, "Our `module-info.java` already says this, so jlink can follow the `requires` lines by itself."], [33, "For a plain jar without a module descriptor, `jdeps` is how you get the list."], [40, "But it only sees static references. Anything found by reflection or a service lookup, it can miss."]],
    Jlink: [[0.5, "`jlink` assembles a custom runtime: the modules you name, plus everything they require."], [6, "Point it at our module, and it follows `requires` to pull in exactly three JDK modules."], [12.5, "On JDK 17, compression is `--compress=2`. The `zip-6` form in many guides needs JDK 21 or later."], [19, "The full JDK on this machine: 305 MB. A runtime with every module: 154 MB."], [25.5, "Our three modules: 52 MB. Strip debug info, headers and man pages, compress: 28 MB."], [32, "Half of what's left is the JVM itself: `libjvm` is 14 MB. The class library is 12."], [38.5, "A surprise: the trimmed runtime starts slower, 110 ms instead of 81. It has no CDS archive."], [46, "Add `--generate-cds-archive`: 50 MB, and back to 75 ms. Size against startup, your choice."], [53, "For containers, that's the win: a 28 to 50 MB runtime layer instead of a 300 MB JDK."]],
    JlinkTraps: [[0.5, "Two places where jlink bites."], [4, "One: every module it links must be a real, explicit module. Automatic modules are refused."], [10.5, "A plain jar on the module path, like this old `util-1.0.jar`, gets exactly this error."], [17, "So most teams jlink only the JDK modules from `jdeps`, and keep their jars on the class path."], [24, "Two: `jdeps` sees only static references. Services and reflection are invisible to it."], [30.5, "Our run quietly loaded classes from `jdk.localedata`. Leave it out and you get English-only locale data."], [37, "Test the trimmed runtime itself, and add modules like `jdk.localedata` by hand."]],
    Jpackage: [[0.5, "`jpackage` goes one step further: a native app the user installs, with no Java required."], [5.5, "It runs jlink for you, adds a native launcher, and wraps it all in the platform's format."], [12, "On macOS, `--type app-image` builds `Hello.app`: a launcher, our jar with a config file, and a private runtime."], [19.5, "Left to its defaults, jpackage bundled a 125 MB runtime. Naming our three modules: 29 MB."], [27, "`--type dmg` wraps it into an 18.8 MB disk image. Windows gets `msi` or `exe`, Linux `deb` or `rpm`."], [34.5, "There's no cross-building: you make each installer on its own OS, usually in CI."], [41, "It's packaging, not speed. It starts exactly as fast as the JVM inside it."]],
    NativeIdea: [[0.5, "GraalVM native image goes the other way: do everything at build time, then leave the JVM behind."], [6, "`native-image` starts from `main` and works out every method the program could ever reach."], [12.5, "It can run static initialisers during the build and keep the objects they create: the image heap."], [19.5, "It compiles every reachable method to machine code, ahead of time. No bytecode survives."], [26, "Then it links in Substrate VM, a small runtime with a garbage collector and thread support."], [33, "Out comes one executable. At run time: no class loading, no verification, no interpreter, no JIT."], [41, "Starting it means: map the binary, map the image heap, call `main`."], [49, "All three startup costs, gone. The price is paid in a different currency."]],
    PointsTo: [[0.5, "Native image assumes a closed world: everything that can run must be visible at build time."], [6, "The points-to analysis starts at `main` and follows every call, field and type it can prove."], [12.5, "`Logger`, the XML parser, `List.of`, the stream: all reachable, so all compiled in."], [19.5, "Lambdas are fine: their `invokedynamic` call sites are linked during the build."], [25.5, "Then this line. The class name comes from a system property, known only at run time."], [32, "The analysis can't follow a string it can't see, and nothing else mentions `app.Polite`."], [38.5, "So `app.Polite` is not in the binary. And nothing fails at build time."], [45, 'With a constant, `Class.forName("app.Polite")`, the analysis would fold the call and keep the class.'], [52.5, "Everything main can't reach is left out too. That's why the binaries are small."]],
    WhatBreaks: [[0.5, "On the JVM our app works. As a native binary it builds cleanly, then fails when it runs."], [5.5, "`Class.forName` can't produce `app.Polite`: the class was never registered, so the image doesn't have it."], [12.5, "Reflection, proxies, JNI, serialization, resources with computed names: invisible unless declared."], [19.5, "The fix is metadata: a JSON file telling the build what will be used reflectively."], [26.5, "Recent GraalVM reads one `reachability-metadata.json`. Older releases used `reflect-config.json` and friends."], [33.5, "You rarely write it by hand. Run on the JVM with the tracing agent, and it records what was used."], [41, "Frameworks do it for you: Spring Boot 3, Quarkus and Micronaut generate metadata during the build."], [48, "The real pain: old libraries doing reflection nobody declared. They fail in production, not in the build."]],
    BuildInit: [[0.5, "Native image can run static initialisers at build time and keep the objects they create."], [6, "Here `<clinit>` builds a lookup map during the build. The map is written into the binary's image heap."], [13, "At run time it's simply there: no initialiser, no parsing, no allocation."], [19.5, "But whatever a build-time initialiser captures is frozen: a timestamp, a random seed, an environment variable."], [26, "This field would hold the build machine's clock, forever, in every copy of the binary."], [33.5, "So application classes initialise at run time by default. You opt in with `--initialize-at-build-time`."], [41, "Frameworks lean on this hard: Quarkus and Spring's AOT mode do much of their wiring during the build."]],
    NativeCosts: [[0.5, "Here's the trade, in ranges commonly reported. Not measured here: GraalVM isn't on this machine."], [6, "Startup and memory: native wins, often by a wide margin."], [13, "Peak throughput: native is usually lower. Without a runtime profile, C2's speculative tricks aren't available."], [20, "Over time, the warmed-up JVM climbs past native and stays there."], [26.5, "Profile-guided optimisation, a training run in Oracle GraalVM, recovers much of that gap."], [33, "Builds take minutes and gigabytes of memory, instead of seconds."], [39, "Collectors: Serial in Community Edition. G1 only in Oracle GraalVM, on Linux."], [45.5, "And the tools differ: many JVM agents and diagnostics don't apply, or work differently."]],
    AllTogether: [[0.5, "Put the measured numbers side by side: `hello.jar` on JDK 17, median of 50 runs."], [6, "Sharing off: 122 ms. The default CDS archive: 81. Our own AppCDS archive: 75."], [13, "jlink alone: 110, slower than the full JDK. jlink with a CDS archive: 75, in a runtime a sixth the size."], [21, "The AOT cache isn't in JDK 17. JEP 483 reports 42% off Spring PetClinic's start."], [28, "Native image would start fastest of all, but it's no longer a JVM, and the bill is different."], [35, "Each bar is one idea: skip parsing, skip linking, or stop being a JVM."]],
    Decide: [[0.5, "So which one? Start from how long the process lives."], [5, "A long-running server: plain JVM. Startup is amortised, and you want the JIT's peak."], [11, "Deploying often? Add AppCDS today, or the AOT cache from JDK 24. It's a flag, not a rewrite."], [18, "Image size matters? Add jlink, and give the runtime a CDS archive."], [24.5, "Scaling out constantly? Try both native image and the AOT cache, and measure under real load."], [31.5, "Serverless functions and CLI tools: native image, where cold start is the product."], [38, "Desktop apps: jpackage, so users never install Java."], [44, "The honest default: plain JVM plus the AOT cache. Take native image when cold start truly matters."]],
    Traps: [[0.5, "Five traps worth avoiding."], [3.5, "AOT doesn't mean no JIT. Leyden keeps it. Only native image removes it."], [9.5, "Native image is not strictly better: lower peak, slow builds, reflection metadata."], [15.5, "jlink refuses automatic modules. jlink the JDK, keep your jars on the class path."], [21.5, "A rebuilt jar silently invalidates your CDS archive. `-Xshare:on` makes that loud."], [27.5, "And a trimmed runtime without a CDS archive starts slower than the full JDK."]],
    Recap: [[0.5, "Recap."], [3, "Startup costs: loading classes, verifying them, and an interpreter with no profile."], [8.5, "CDS and AppCDS parse once and map every time. 122 down to 75 ms here."], [14, "Leyden's AOT cache adds loaded and linked classes, then profiles, and keeps the JIT."], [19.5, "jlink trims the runtime; jpackage ships it as an installer."], [25, "Native image removes the JVM: millisecond starts, a closed world, and real costs."], [30, "The default: plain JVM plus the AOT cache. Native image only when cold start is the requirement."]]
  };
  var MAIN_FULL = ["package app;", "", "import java.util.List;", "import java.util.logging.Logger;", "import java.util.stream.Collectors;", "import javax.xml.parsers.DocumentBuilderFactory;", "", "public class Main {", ...HELLO_MAIN.map((l) => "    " + l), "}"].join("\n");
  var notes = [
    { ch: 1, blocks: [
      { p: "The running example for the whole topic is a three-class module. It logs a line, reads a word from an XML resource, uppercases a list with a stream, and loads a greeter **by name** (that last line matters in the native-image chapter)." },
      { code: MAIN_FULL, title: "src/hello/app/Main.java" },
      { code: 'module hello {\n    requires java.logging;\n    requires java.xml;\n}\n\n// app/Greeter.java:  public interface Greeter { String greet(String name); }\n// app/Polite.java:   public class Polite implements Greeter { \u2026 "Good day, " + name + "." }\n// greeting.xml:      <greeting>Hello</greeting>', title: "module-info.java and friends" },
      { tryit: { note: "Build it as a modular jar (JDK 17):", cmd: "$ javac -d out --module-source-path src -m hello\n$ cp src/hello/greeting.xml out/hello/\n$ jar --create --file hello.jar --main-class app.Main -C out/hello .\n$ java -jar hello.jar", out: "Oct 05, 2026 12:14:39 PM app.Main main\nINFO: starting\nHello, ADA, LINUS, GRACE\nGood day, world." } },
      { h: "Where the time goes" },
      { mini: { scene: "Timeline" } },
      { tryit: { note: "HotSpot can time its own boot. JDK 17 output, sharing off (abridged):", cmd: "$ java -Xshare:off -Xlog:startuptime -jar hello.jar", out: "[0.013s][info][startuptime] Interpreter generation, 0.0006410 secs\n[0.026s][info][startuptime] Initialize java.lang classes, 0.0124152 secs\n[0.039s][info][startuptime] Initialize module system, 0.0117862 secs\n[0.039s][info][startuptime] Create VM, 0.0372228 secs" } },
      { table: { head: ["phase (ms since launch)", "-Xshare:off", "default CDS", "AppCDS"], rows: [["JVM created (`Create VM`)", "35", "19", "18.5"], ["`app.Main` loaded", "45.5", "25", "24"], ["first log line done, XML parsing starts", "103", "68", "64"], ["XML done, lambda created", "120", "85", "73"], ["last class loaded", "124", "87", "76"]] } },
      { p: "Medians of 15 runs with `-Xlog:startuptime,class+load` and nanosecond timestamps. Logging adds a little overhead; plain wall-clock medians over 50 runs were **122 / 81 / 75 ms**. The surprise is the **first log line**: `java.util.logging` pulls in handlers, a formatter, the time-zone database and locale data, roughly 540 classes, all executed by a cold interpreter." },
      { h: "One class, then 1,287" },
      { mini: { scene: "ClassFlood" } },
      { steps: ["**Find** the bytes: a jar entry, or a resource inside the JDK's `lib/modules` jimage file.", "**Parse** the class file and build an `InstanceKlass` (plus its methods and constant pool) in metaspace (8.2, 8.5).", "**Verify** each method's bytecode with the type-checking verifier, using the `StackMapTable`.", "**Link**: prepare static fields, rewrite some bytecodes into faster internal forms, lay out the vtable and itable.", "**Initialise**: run `<clinit>` the first time the class is actively used."] },
      { tryit: { note: "Count them yourself. Real JDK 17 numbers:", cmd: "$ java -Xshare:off -Xlog:class+load:file=cl.txt -jar hello.jar\n$ wc -l < cl.txt\n$ grep -c 'source: jrt:/java.base' cl.txt\n$ grep -c 'source: jrt:/java.xml' cl.txt", out: "1287\n1011\n164" } },
      { callout: { tone: "violet", title: "deeper: who gets verified", text: "The source note says every method is verified on every start. Not quite. HotSpot runs with `-XX:-BytecodeVerificationLocal` (classes from the **boot** loader, i.e. most of the JDK, are trusted) and `-XX:+BytecodeVerificationRemote` (everything else is verified). In our run, `-Xlog:class+init` shows only **8** verifications: our three classes, one lambda class, and four `jdk.localedata` classes (platform loader). In a framework app the cost is real, because almost all of its tens of thousands of classes are library classes. Classes taken from a CDS archive were verified when the archive was dumped." } },
      { h: "The cold JIT" },
      { mini: { scene: "ColdJit" } },
      { tryit: { note: "One run, counted by tier (the counts vary slightly run to run):", cmd: `$ java -XX:+PrintCompilation -jar hello.jar > pc.txt
$ awk '$3=="3"||$4=="3"' pc.txt | wc -l     # C1 with full profiling
$ awk '$3=="4"||$4=="4"' pc.txt | wc -l     # C2
$ grep -c 'app\\.' pc.txt`, out: "223\n21\n0" } },
      { p: "In 80 ms the JIT compiled a couple of hundred JDK methods with C1 and a handful of tiny ones (`String.charAt`, `String.hashCode`, `Object.<init>`) with C2. None of our code got compiled at all. A short-lived process runs almost entirely in the interpreter and C1. That is the third cost, and the one only a cached **profile** (Leyden) or **no JIT at all** (native image) addresses." },
      { h: "When it matters" },
      { mini: { scene: "WhoCares" } },
      { list: ["**Long-running server**: startup is paid once per deploy. Irrelevant next to weeks of uptime.", "**Autoscaling containers**: paid on every scale-out, exactly when traffic is spiking.", "**Serverless functions**: a cold start is billed and felt by the caller.", "**CLI tools**: the user waits for the whole thing, every time."] }
    ] },
    { ch: 2, blocks: [
      { p: "**Class Data Sharing** takes the result of loading, parsing and verifying classes, writes it to an archive, and on later starts **memory-maps** that archive into metaspace instead of redoing the work." },
      { mini: { scene: "CdsIdea" } },
      { tryit: { note: "Watch the mapping happen (JDK 17, abridged):", cmd: "$ java -XX:SharedArchiveFile=app.jsa -Xlog:cds -jar hello.jar", out: "[0.004s][info][cds] Mapped static  region #0 at base 0x000000d800000000 top 0x000000d800454000 (ReadWrite)\n[0.004s][info][cds] Mapped static  region #1 at base 0x000000d800454000 top 0x000000d800bc0000 (ReadOnly)\n[0.007s][info][cds] Mapped dynamic region #0 at base 0x000000d800bc0000 top 0x000000d800ca0000 (ReadWrite)\n[0.007s][info][cds] Mapped dynamic region #1 at base 0x000000d800ca0000 top 0x000000d800dd4000 (ReadOnly)\n[0.008s][info][cds] Trying to map heap data: region[3] at 0x0000000380700000, size =   475136 bytes" } },
      { callout: { tone: "violet", title: "deeper: what is in the archive", text: 'A **static** archive (the JDK\'s `lib/server/classes.jsa`, 13.5 MB here) holds metadata for about 1,200 core classes, split into a **read-write** region (things the JVM updates, like some class state) and a **read-only** region (method bytecodes, constant pools, symbols) that every process maps from the same page-cache pages. A **dynamic** archive (`app.jsa`) is a second layer on top. With G1, the archive also carries **heap objects**: interned strings, the boot module graph and some `Class` mirrors, mapped straight into the Java heap ("Trying to map heap data").' } },
      { h: "AppCDS: your classes too" },
      { mini: { scene: "AppCds" } },
      { code: "# 1. training run: archive every class this run loaded\njava -XX:ArchiveClassesAtExit=app.jsa -jar hello.jar\n\n# 2. every later start\njava -XX:SharedArchiveFile=app.jsa -jar hello.jar\n\n# JDK 19+: one step (creates the archive if missing or stale)\njava -XX:+AutoCreateSharedArchive -XX:SharedArchiveFile=app.jsa -jar hello.jar", lang: "shell", title: "AppCDS" },
      { table: { head: ["JDK 17 \xB7 hello.jar", "mapped from archive", "parsed from lib/modules", "wall clock (median of 50)"], rows: [["`-Xshare:off`", "0", "1,215", "**122 ms**"], ["default CDS archive", "987", "245", "**81 ms**"], ["+ `app.jsa` (2.2 MB)", "1,246", "0", "**75 ms**"]] } },
      { p: "For a tiny app, the JDK's default archive delivers most of the gain for free. AppCDS matters in proportion to how many classes **your** app loads beyond that default set: libraries, frameworks, XML, logging. The leftovers in the AppCDS run are `LambdaForm` classes spun up at runtime by `java.lang.invoke`, which the JDK 17 dynamic archive does not store. On 17, `-XX:+AutoCreateSharedArchive` fails with **Unrecognized VM option**: it arrived in JDK 19." },
      { table: { head: ["JDK", "CDS milestone"], rows: [["5", "CDS for JDK classes (client VM)"], ["10", "AppCDS: application classes (JEP 310)"], ["12", "default archive shipped and on by default (JEP 341)"], ["13", "dynamic archiving at exit, `-XX:ArchiveClassesAtExit` (JEP 350)"], ["19", "`-XX:+AutoCreateSharedArchive`"], ["24+", "Leyden's AOT cache builds on the same machinery"]] } },
      { h: "Validation" },
      { mini: { scene: "CdsCheck" } },
      { tryit: { note: "Make the archive stale and see what you get (real JDK 17 output):", cmd: "$ touch hello.jar\n$ java -XX:SharedArchiveFile=app.jsa -jar hello.jar\n$ java -XX:SharedArchiveFile=app.jsa -Xshare:on -version", out: "[0.008s][warning][cds,dynamic] Unable to use shared archive. The top archive failed to load: app.jsa\n\u2026the program runs normally, without the archive\u2026\nAn error has occurred while processing the shared archive file.\nshared class paths mismatch (hint: enable -Xlog:class+path=info to diagnose the failure)\nError occurred during initialization of VM" } },
      { callout: { tone: "pull", title: "rule", text: "Generate the archive in the same build step that produces the jar, with the same JDK, and ship them together. In CI, a run with `-Xshare:on` proves the archive is actually usable." } }
    ] },
    { ch: 3, blocks: [
      { p: "**Project Leyden** shifts work from every start into an earlier **training run**, step by step, while keeping the JVM a JVM: interpreter, JIT and deoptimisation all stay." },
      { mini: { scene: "LeydenShift" } },
      { table: { head: ["JEP", "JDK", "what it adds"], rows: [["483 \xB7 Ahead-of-Time Class Loading & Linking", "24", "the AOT cache: classes stored already **loaded and linked**, from class path, module path and the JDK"], ["514 \xB7 Ahead-of-Time Command-Line Ergonomics", "25", "one-step `-XX:AOTCacheOutput`, plus `JDK_AOT_VM_OPTIONS` for the creation step"], ["515 \xB7 Ahead-of-Time Method Profiling", "25", "method **profiles** from training, so the JIT starts compiling hot code at once"], ["516 \xB7 Ahead-of-Time Object Caching with Any GC", "26", "cached heap objects can be **streamed**, so the cache works with ZGC too"]] } },
      { callout: { tone: "bad", title: "correction to the source note", text: 'The note says JDK 26 makes AOT caching work "with any collector (previously G1-only)". JEP 483 itself lists only **ZGC** as unsupported, and allows training and production runs to use different collectors. JEP 516 removes the ZGC limitation by adding a GC-agnostic, streamed object format alongside the mapped one.' } },
      { h: "The workflow" },
      { mini: { scene: "LeydenWorkflow" } },
      { code: "# JDK 24+ (JEP 483): record, create, run\njava -XX:AOTMode=record -XX:AOTConfiguration=app.aotconf -cp app.jar com.example.App\njava -XX:AOTMode=create -XX:AOTConfiguration=app.aotconf -XX:AOTCache=app.aot -cp app.jar\njava -XX:AOTCache=app.aot -cp app.jar com.example.App\n\n# JDK 25+ (JEP 514): training run and creation in one command\njava -XX:AOTCacheOutput=app.aot -cp app.jar com.example.App", lang: "shell", title: "documented commands (not runnable on JDK 17)" },
      { table: { head: ["documented result", "before", "with cache", "cache"], rows: [["HelloStream (JEP 483)", "0.031 s", "0.018 s (\u221242%)", "11.4 MB"], ["Spring PetClinic 3.2.0, ~21,000 classes (JEP 483)", "4.486 s", "2.604 s (\u221242%)", "130 MB"], ["HelloStreamWarmup with profiles (JEP 515)", "90 ms", "73 ms (\u221219%)", "+250 KB"]] } },
      { list: ["All runs: the **same JDK release, OS and CPU architecture**.", "The class path must contain **only JAR files** (no directories), and module options must match.", "The training run must resemble production: the cache only helps with what training actually did.", "Under the hood the AOT options are macros over the existing CDS machinery (`-XX:SharedArchiveFile` and friends)."] },
      { callout: { tone: "violet", title: 'deeper: what "linked" buys you', text: "With plain CDS, an archived class still has to be **loaded** into its class loader (made visible, registered, given a mirror) and **linked** at runtime. The AOT cache records that state, so in production the classes simply appear already loaded and linked when the JVM starts. The HotSpot implementation also pre-resolves some constant-pool entries and pre-generates `invokedynamic` linkage for lambdas; treat those as implementation details that grow from release to release." } },
      { h: "Profiles, and why the JIT stays" },
      { mini: { scene: "Profiles" } },
      { p: "A cached profile is a **head start**, not a contract. The production run keeps profiling; if it behaves differently from training, C2's speculation fails, the code is deoptimised, and the JVM learns from the real workload (8.8). Peak performance is unchanged because it is the same C2." }
    ] },
    { ch: 4, blocks: [
      { p: "`jlink` builds a custom runtime image containing only the modules you name plus their transitive `requires`. `jdeps` tells you which modules a jar needs." },
      { mini: { scene: "Jdeps" } },
      { tryit: { note: "Real JDK 17 output:", cmd: "$ java --list-modules | wc -l\n$ jdeps --print-module-deps hello.jar\n$ jdeps hello.jar | head -4", out: "      70\njava.base,java.logging,java.xml\nhello\n [file:///\u2026/hello.jar]\n   requires mandated java.base (@17.0.17)\n   requires java.logging (@17.0.17)" } },
      { h: "Building the runtime" },
      { mini: { scene: "Jlink" } },
      { code: '# JDK 17 syntax\njlink --module-path hello.jar --add-modules hello \\\n      --strip-debug --no-header-files --no-man-pages \\\n      --compress=2 --output rt\n\nrt/bin/java -m hello/app.Main\n\n# JDK 21+ spells compression --compress=zip-6 (JDK 17: "Invalid compression level zip-6")', lang: "shell", title: "jlink" },
      { table: { head: ["image (macOS arm64, JDK 17)", "size"], rows: [["full JDK (includes 70 MB of `jmods`)", "**305 MB**"], ["runtime with all 70 modules", "154 MB"], ["3 modules, plain jlink", "52 MB"], ["3 modules, stripped + `--compress=2`", "**28 MB** (libjvm 14, `lib/modules` 12)"], ["same + `--generate-cds-archive`", "50 MB"]] } },
      { callout: { tone: "pull", title: "measured surprise", text: "A trimmed runtime has **no CDS archive** unless you ask for one, so it starts slower than the full JDK: **110 ms** vs **81 ms** for `hello.jar`. `--generate-cds-archive` (a jlink plugin since JDK 17) adds 22 MB and brings it back to **75 ms**." } },
      { h: "Where jlink bites" },
      { mini: { scene: "JlinkTraps" } },
      { callout: { tone: "bad", title: "correction to the source note", text: 'The note says jlink needs dependencies to be "modular or at least automatic modules". Automatic modules are **not** accepted: `Error: automatic module cannot be used with jlink: util from file:///\u2026/util-1.0.jar` (real JDK 17 output). The common pattern is to jlink only the JDK modules your jars need and keep the jars on the class path.' } },
      { code: 'jdeps --print-module-deps --ignore-missing-deps -cp "lib/*" app.jar   # \u2192 e.g. java.base,java.sql\njlink --add-modules java.base,java.sql --output rt\nrt/bin/java -cp "app.jar:lib/*" com.example.Main', lang: "shell", title: "the usual pattern" },
      { p: "`jdeps` only sees static references. Modules reached through **services** (`ServiceLoader`) or reflection are invisible to it. Our run loaded classes from `jdk.localedata` (non-English locale data) without any reference in our code; `jdk.crypto.ec`, `jdk.charsets` and `jdk.zipfs` are other usual suspects. Test the trimmed runtime itself and add such modules explicitly." }
    ] },
    { ch: 5, blocks: [
      { mini: { scene: "Jpackage" } },
      { tryit: { note: "Real run on macOS, JDK 17:", cmd: '$ jpackage --name Hello --input input --main-jar hello.jar --main-class app.Main \\\n           --type app-image --dest out\n$ du -sh out/Hello.app\n$ jpackage --name Hello --input input --main-jar hello.jar --main-class app.Main \\\n           --type dmg --add-modules java.base,java.logging,java.xml \\\n           --jlink-options "--strip-debug --no-header-files --no-man-pages --compress=2" --dest dmg\n$ ls -l dmg', out: "125M	out/Hello.app\n-rw-r--r--  1 basha  wheel  18829607  5 Oct 12:19 Hello-1.0.dmg" } },
      { list: ["Output types: `app-image` everywhere; `dmg`/`pkg` on macOS, `msi`/`exe` on Windows, `deb`/`rpm` on Linux.", "It builds only for the OS it runs on: one CI job per platform.", "Left to defaults it links a large runtime (125 MB here). Name your modules (`--add-modules`) or pass a jlink image (`--runtime-image`): 29 MB here.", "Signing and notarisation options exist for macOS; Windows installers need the WiX toolset.", "It changes how you ship, not how fast the JVM starts."] }
    ] },
    { ch: 6, blocks: [
      { p: "**GraalVM native image** compiles the application, the parts of the JDK it uses, and a small runtime (**Substrate VM**) into one executable, ahead of time. Nothing on this page about native image was measured: `native-image` is not installed on the machine used for this topic." },
      { mini: { scene: "NativeIdea" } },
      { h: "The closed world" },
      { mini: { scene: "PointsTo" } },
      { p: 'The **points-to analysis** starts from `main` and iterates to a fixed point: which methods can be called, which types can flow into each variable and field, which fields are read. Only what it proves reachable is compiled. Calls it can see through, like `Class.forName("app.Polite")` with a **constant** argument, or `Main.class.getResourceAsStream("/greeting.xml")` with a literal name, are folded and registered automatically. A name computed at run time (our system property) cannot be.' },
      { h: "What breaks, and the fix" },
      { mini: { scene: "WhatBreaks" } },
      { code: '{\n  "reflection": [\n    { "type": "app.Polite",\n      "methods": [ { "name": "<init>", "parameterTypes": [] } ] }\n  ],\n  "resources": [ { "glob": "templates/**" } ]\n}', lang: "plain", title: "META-INF/native-image/<groupId>/<artifactId>/reachability-metadata.json" },
      { code: "# run on the JVM; the agent writes what reflection, resources, proxies\u2026 were used\njava -agentlib:native-image-agent=config-output-dir=cfg -jar hello.jar", lang: "shell", title: "the tracing agent" },
      { callout: { tone: "violet", title: "deeper: which exception?", text: "The source note says the binary fails with `ClassNotFoundException`. That was the classic behaviour. Current GraalVM documentation says a reflective lookup without metadata throws `MissingReflectionRegistrationError` (an `Error`), which names the missing registration; `--exact-reachability-metadata` makes such problems surface early. Either way it fails **at run time**, not at build time." } },
      { list: ["Spring Boot 3 (AOT processing), Quarkus and Micronaut generate metadata during the build.", "The **GraalVM Reachability Metadata Repository** supplies metadata for many popular libraries.", "Old libraries doing undeclared reflection, proxies or serialization are where native builds hurt."] },
      { h: "Build-time initialisation" },
      { mini: { scene: "BuildInit" } },
      { p: "Static initialisers that run during the build leave their objects in the **image heap**, which is mapped at startup: zero initialisation work at run time. The danger is capturing build-machine state (time, random seeds, environment, host names, open files). Since GraalVM 19, application classes are initialised at **run time** by default; `--initialize-at-build-time=<class or package>` opts in." },
      { h: "The bill" },
      { mini: { scene: "NativeCosts" } },
      { table: { head: ["", "JVM", "native image (typical reports)"], rows: [["startup", "hundreds of ms to seconds", "a few to tens of ms"], ["memory", "larger (JIT, metadata, profiles)", "often several times smaller"], ["peak throughput", "higher: C2 with live profiles", "usually lower; PGO (Oracle GraalVM) recovers much"], ["build", "seconds", "minutes and several GB of RAM"], ["GC", "all HotSpot collectors", "Serial (Community); G1 in Oracle GraalVM on Linux"], ["tooling", "JFR, jcmd, agents, JMX", "a different, smaller set"]] } },
      { callout: { tone: "pull", title: "status in 2025\u201326", text: `The source note calls G1 and PGO features of "paid" Oracle GraalVM. Since 2023 Oracle GraalVM has been free to use under the GraalVM Free Terms and Conditions; G1 and PGO are still Oracle GraalVM, not Community Edition. In September 2025 Oracle said GraalVM for JDK 24 was the last release included in its Java SE products and that JVM startup/AOT work continues in OpenJDK's Project Leyden. Native image itself continues in GraalVM 25.` } }
    ] },
    { ch: 7, blocks: [
      { mini: { scene: "AllTogether" } },
      { table: { head: ["technique", "what it skips", "hello.jar, JDK 17"], rows: [["default CDS", "parsing + verifying JDK classes", "122 \u2192 81 ms"], ["AppCDS", "parsing + verifying your classes too", "\u2192 75 ms"], ["jlink", "nothing (it saves disk, not time)", "110 ms without an archive"], ["jlink + CDS", "as CDS, in a 50 MB runtime", "75 ms"], ["AOT cache (JDK 24+)", "+ loading, linking, (25) profiling", "documented: \u221242% on PetClinic"], ["native image", "the whole JVM", "documented: milliseconds"]] } },
      { mini: { scene: "Decide" } },
      { table: { head: ["workload", "use"], rows: [["long-running server", "**plain JVM**: startup is amortised; you want peak JIT throughput"], ["frequent deploys or restarts", "JVM + **AppCDS**, or the **AOT cache** on JDK 24+"], ["container image size matters", "+ **jlink** (with `--generate-cds-archive`)"], ["scales out constantly", "native image **or** JVM + AOT cache: measure both"], ["serverless function, CLI tool", "**native image**"], ["desktop application", "**jpackage**"]] } },
      { callout: { tone: "pull", title: "the honest default", text: "For a normal server: plain JVM, plus the AOT cache once you are on JDK 24+. It is a flag, not an architecture change. Native image is a commitment (a different build, minutes-long builds, metadata, different tooling): take it when cold start is the actual product requirement." } }
    ] }
  ];
  var traps = [
    `**AOT is not "no JIT".** Leyden's AOT cache keeps the interpreter, C1, C2 and deoptimisation. Only native image removes the JIT.`,
    "**Native image is not strictly better.** Lower peak throughput (without PGO), minutes-long builds, reflection metadata, a different toolset. Wrong for most long-running servers.",
    "**jlink does not accept automatic modules.** jlink the JDK modules from `jdeps`, keep your jars on the class path.",
    "**A stale CDS archive is silently ignored.** Rebuilding the jar invalidates it; the JVM prints one warning and runs slower. `-Xshare:on` makes it fatal.",
    "**A trimmed runtime can start slower.** A jlink image has no CDS archive unless you add `--generate-cds-archive` (110 vs 75 ms here).",
    "**A benchmark on a fresh JVM measures startup and the interpreter**, not your steady-state code (8.8).",
    "**Optimising startup for a service that runs for weeks** buys nothing. Optimise throughput instead."
  ];
  var recap = [
    "**Why startup is slow**: class loading (1,287 classes for a 3-class app), verification of non-JDK classes, and an interpreter with no profile.",
    "**CDS**: dump parsed, verified classes once and `mmap` them; read-only pages are shared between JVMs. On by default for JDK classes since JDK 12.",
    "**AppCDS**: `-XX:ArchiveClassesAtExit` then `-XX:SharedArchiveFile` (JDK 19+: `-XX:+AutoCreateSharedArchive`). 122 \u2192 81 \u2192 75 ms here.",
    "**Leyden AOT cache**: JDK 24 (JEP 483) loaded + linked classes; JDK 25 (JEP 514, 515) one-step creation and profiles; JDK 26 (JEP 516) any GC. Keeps the JIT.",
    "**jlink**: only the modules you need, 305 MB \u2192 28 MB; explicit modules only; add a CDS archive back. **jpackage**: native installers, per OS.",
    "**Native image**: closed-world points-to analysis, build-time init into an image heap, AOT machine code, no JIT. Milliseconds to start; metadata, build time and peak throughput are the bill.",
    "**Default**: plain JVM + AOT cache. Native image when cold start is the requirement."
  ];
  var quiz = [
    { q: "Running `hello.jar` with `-Xlog:class+init`, only 8 of about 1,280 loaded classes are verified. Why?", options: ["Verification is lazy and most classes never run", "Classes from the boot loader (most of the JDK) are trusted and skip verification; app and library classes are verified", "The default CDS archive disables verification for everything", "Verification only happens for classes with a static initialiser"], answer: 1, why: "HotSpot defaults to `-XX:-BytecodeVerificationLocal` (boot classes trusted) and `-XX:+BytecodeVerificationRemote` (everything else verified). The 8 were our 3 classes, a lambda class and 4 `jdk.localedata` classes loaded by the platform loader." },
    { q: "What does CDS actually save at startup?", options: ["JIT compilation of hot methods", "Reading, parsing and verifying classes: the archive is memory-mapped straight into metaspace", "Garbage collection during startup", "Running static initialisers"], answer: 1, why: "The archive holds already-parsed, already-verified class metadata. Mapping it replaces per-class parsing; the read-only pages can even be shared by several JVMs. It does not compile code or run `<clinit>`." },
    { q: "You rebuild `hello.jar` but keep the old `app.jsa`. What happens on the next start with `-XX:SharedArchiveFile=app.jsa`?", options: ["The JVM refuses to start", "It maps the stale archive and may run old code", "It prints a warning, ignores the archive and runs without it, slower", "It regenerates the archive automatically"], answer: 2, why: 'The archive records each jar\'s size and modification time. On a mismatch the JVM warns ("Unable to use shared archive") and carries on. Only with `-Xshare:on` does it become a fatal error; only `-XX:+AutoCreateSharedArchive` (JDK 19+) regenerates.' },
    { q: "Which startup cost does JEP 515 (AOT method profiling, JDK 25) address that CDS and JEP 483 do not?", options: ["Parsing class files", "Verifying bytecode", "The JIT starting with an empty profile", "The size of the runtime image"], answer: 2, why: "CDS removes parsing/verification, JEP 483 removes loading/linking. JEP 515 stores profiles from the training run so the JIT can compile hot methods immediately instead of profiling from zero." },
    { q: `A team says "we use Leyden's AOT cache, so we lost C2's peak performance". Is that right?`, options: ["Yes, AOT code replaces the JIT", "Yes, but only with ZGC", "No: the JVM still interprets, profiles, JIT-compiles and deoptimises; the cache is a head start", "No, because the AOT cache disables C1 instead"], answer: 2, why: "Leyden keeps the whole JIT pipeline. Only GraalVM native image gives up the JIT and its profile-driven speculation." },
    { q: "A jlink image with just `java.base,java.logging,java.xml` starts in 110 ms while the full JDK takes 81 ms. Why is the smaller runtime slower?", options: ["Compression makes class loading slower", "It lacks a CDS archive, so every class is parsed again", "It runs without the C2 compiler", "Fewer modules means a longer module-resolution step"], answer: 1, why: "The full JDK ships `lib/server/classes.jsa`; a fresh jlink image has none. `--generate-cds-archive` puts one back (75 ms here, at +22 MB)." },
    { q: "Why does `jlink` reject your build when one dependency is a plain jar on the module path?", options: ["jlink only accepts signed jars", "The jar becomes an automatic module, and jlink only links explicit modules", "Plain jars must be compressed first", "jlink requires every jar to contain native code"], answer: 1, why: "Automatic modules have no declared dependencies, so jlink cannot compute a closed module graph and refuses them. The usual fix is to jlink only the JDK modules and put your jars on the class path." },
    { q: 'In the native image of our app, `Class.forName(System.getProperty("greeter", "app.Polite"))` fails at run time. What is the root cause?', options: ["Native image does not support reflection at all", "The closed-world analysis cannot see a name computed at run time, so `app.Polite` was never registered or compiled in", "System properties are unavailable in native executables", "The class was initialised at build time and then discarded"], answer: 1, why: 'Reflection works when declared. A constant `Class.forName("app.Polite")` would be folded automatically; a computed name needs reachability metadata (or the tracing agent to generate it).' },
    { q: "A class has `static final long BUILT_AT = System.currentTimeMillis();` and is initialised at build time in a native image. What value does production see?", options: ["The current time at each start", "The time the binary was built, in every copy", "Zero, because build-time fields are reset", "A compile error from native-image"], answer: 1, why: "Build-time initialisation snapshots the objects and values into the image heap. That is why application classes initialise at run time by default." },
    { q: "Your service runs for three weeks between deploys and needs maximum throughput. Best choice?", options: ["GraalVM native image", "Plain JVM (optionally with the AOT cache for faster deploys)", "jpackage", "A jlink image without CDS"], answer: 1, why: "Startup is amortised over weeks; what matters is peak throughput, where C2 with live profiles usually beats native image." }
  ];
  window.AN.registerTopic({
    id: "8.10",
    part: "08",
    title: "Startup, packaging and AOT",
    kicker: "Part 08 \xB7 The JVM",
    lede: "Why a three-class program loads 1,287 classes before it prints a line, and what CDS, Leyden's AOT cache, jlink, jpackage and GraalVM native image each do about it, measured where possible.",
    chapters,
    scenes,
    captions,
    notes,
    traps,
    recap,
    quiz
  });
})();
