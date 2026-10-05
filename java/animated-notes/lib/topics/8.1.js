(() => {
  // src/topics/8.1/scenes1.jsx
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
    Bytes,
    toneColor
  } = window.AN;
  var E = MOTION.enter;
  var M = MOTION.move;
  var POP = MOTION.pop;
  var CALC_SRC = [
    "public class Calc {",
    "    int add(int a, int b) {",
    "        return a + b;",
    "    }",
    "    public static void main(String[] args) {",
    "        Calc c = new Calc();",
    "        int r = c.add(2, 3);",
    '        System.out.println("r = " + r);',
    "    }",
    "}"
  ];
  function SIntro({ t }) {
    const Y = 560;
    const hex = ["ca fe ba be 00 00 00 3d", "00 33 0a 00 02 00 03 07", "00 04 0c 00 05 00 06 01", "00 10 6a 61 76 61 2f 6c", "61 6e 67 2f 4f 62 6a 65"];
    const ops = ["iload_1", "iload_2", "iadd", "ireturn"];
    const lit = Math.floor(clamp((t - 12.5) / 1.1, -1, 40)) % 4;
    const travel = (s, x1, x2) => {
      const p = M(t, s, 1.2);
      return p > 0 && p < 1 ? /* @__PURE__ */ React.createElement(Dot, { x: lerp(x1, x2, p), y: Y + 150, r: 9, color: PAL.pull }) : null;
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 150, mono: true, fs: 22, weight: 600, color: PAL.pull, a: E(t, 0.3), style: { letterSpacing: "0.14em" } }, "PART 08 \xB7 THE JVM \xB7 8.1"), /* @__PURE__ */ React.createElement(Txt, { x: 92, y: 192, fs: 118, weight: 700, lh: 1, a: E(t, 0.6, 0.9), style: { letterSpacing: "-0.03em", transform: `translateY(${(1 - E(t, 0.6, 0.9)) * 24}px)` } }, "From source to bytecode"), /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 338, fs: 36, color: PAL.ink2, a: E(t, 1.4, 0.8) }, "What `javac` produces, and how the JVM reads it."), /* @__PURE__ */ React.createElement(Code, { x: 96, y: Y, w: 500, h: 330, fs: 17, lh: 26, title: "Calc.java", a: E(t, 1.8), lines: CALC_SRC }), /* @__PURE__ */ React.createElement(Txt, { x: 346, y: Y + 342, anchor: "mid", fs: 20, color: PAL.ink2, a: E(t, 2.2) }, "what you write"), /* @__PURE__ */ React.createElement(Box, { x: 626, y: Y + 115, w: 150, h: 70, label: "javac", tone: "pull", a: POP(t, 5.5), glow: pulse(t, [6.2], 1.2) }), /* @__PURE__ */ React.createElement(HArrow, { x1: 600, x2: 622, y: Y + 150, a: E(t, 5.5), color: PAL.pull }), /* @__PURE__ */ React.createElement(HArrow, { x1: 780, x2: 812, y: Y + 150, a: E(t, 6.4), color: PAL.pull }), travel(5.3, 600, 812), /* @__PURE__ */ React.createElement(Panel, { x: 816, y: Y, w: 420, h: 330, title: "Calc.class", right: "928 bytes", a: E(t, 6.6), tone: "flow" }, /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 22px" } }, hex.map((h, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { font: `500 22px ${MONO}`, color: i === 0 ? PAL.pull : PAL.ink2, height: 40, opacity: E(t, 7 + i * 0.35, 0.3) } }, h)), /* @__PURE__ */ React.createElement("div", { style: { font: `500 22px ${MONO}`, color: PAL.ink3, opacity: E(t, 9) } }, "\u2026"))), /* @__PURE__ */ React.createElement(Txt, { x: 1026, y: Y + 342, anchor: "mid", fs: 20, color: PAL.ink2, a: E(t, 7.5) }, "bytecode \xB7 same file on every OS"), /* @__PURE__ */ React.createElement(HArrow, { x1: 1240, x2: 1290, y: Y + 150, a: E(t, 11), color: PAL.flow }), travel(10.8, 1240, 1290), /* @__PURE__ */ React.createElement(Panel, { x: 1294, y: Y, w: 530, h: 330, title: "JVM", right: "reads & runs it", a: E(t, 11.2), tone: "pull" }, /* @__PURE__ */ React.createElement("div", { style: { padding: "18px 24px", display: "flex", flexDirection: "column", gap: 12 } }, ops.map((o, i) => /* @__PURE__ */ React.createElement("div", { key: o, style: { display: "flex", alignItems: "center", gap: 14, font: `600 24px ${MONO}`, color: lit === i && t > 12.5 ? PAL.pull : PAL.ink2, opacity: E(t, 11.6 + i * 0.25) } }, /* @__PURE__ */ React.createElement("span", { style: { width: 12, height: 12, borderRadius: 6, background: lit === i && t > 12.5 ? PAL.pull : PAL.line2 } }), o)))), /* @__PURE__ */ React.createElement(Txt, { x: 1559, y: Y + 342, anchor: "mid", fs: 20, color: PAL.ink2, a: E(t, 12) }, "what actually executes"));
  }
  function STwoCompilers({ t }) {
    const Y = 330;
    const aL = E(t, 3.2), aR = E(t, 10);
    const tierX = [850, 1150, 1450, 1712];
    const pos = (() => {
      if (t < 20) return [tierX[0], Y + 88];
      if (t < 26.5) return [lerp(tierX[0], tierX[1], M(t, 20, 0.9)), Y + 88];
      if (t < 32.5) return [lerp(tierX[1], tierX[3], M(t, 26.5, 1.1)), Y + 88];
      if (t < 37) return [lerp(tierX[3], tierX[0], M(t, 33, 1.6)), lerp(Y + 88, Y + 88, 0) + Math.sin(clamp((t - 33) / 1.6, 0, 1) * Math.PI) * 110];
      return [lerp(tierX[0], tierX[3], M(t, 37, 1.6)), Y + 88];
    })();
    const calls = t < 14.5 ? 0 : t < 20 ? Math.round(lin(t, 14.5, 5.3) * 200) : t < 26.5 ? Math.round(200 + lin(t, 20, 6) * 4800) : t < 33 ? Math.round(5e3 + lin(t, 26.5, 6) * 6e3) : 11e3 + Math.round(lin(t, 33, 8) * 3e3);
    const tier = t < 20 ? 0 : t < 26.5 ? 1 : t < 33 ? 2 : t < 38.6 ? 0 : 2;
    const tierName = ["interpreted", "C1 \xB7 profiling", "C2 \xB7 optimised"][tier];
    const gx0 = 150, gx1 = 1780, gy0 = 870, gy1 = 690;
    const T0 = 14, T1 = 44;
    const level = (tt) => tt < 20 ? 0.12 : tt < 26.5 ? 0.45 : tt < 33 ? 0.95 : tt < 38.6 ? 0.18 : 0.95;
    const pts = [];
    for (let tt = T0; tt <= Math.min(t, T1); tt += 0.25) pts.push([lerp(gx0, gx1, (tt - T0) / (T1 - T0)), lerp(gy0, gy1, level(tt))]);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel, { x: 96, y: 210, w: 560, h: 360, title: "ahead of time \xB7 once", a: aL, tone: "pull" }), /* @__PURE__ */ React.createElement(Box, { x: 126, y: Y - 40, w: 200, h: 80, label: "Calc.java", a: E(t, 3.6) }), /* @__PURE__ */ React.createElement(HArrow, { x1: 330, x2: 420, y: Y, a: E(t, 4.4), color: PAL.pull, label: "javac" }), /* @__PURE__ */ React.createElement(Box, { x: 426, y: Y - 40, w: 200, h: 80, label: "Calc.class", tone: "flow", a: E(t, 5) }), /* @__PURE__ */ React.createElement(Txt, { x: 376, y: Y + 70, anchor: "mid", fs: 20, color: PAL.ink2, a: E(t, 5.6), w: 500, align: "center" }, "your build \xB7 portable bytecode, not machine code"), /* @__PURE__ */ React.createElement(Panel, { x: 700, y: 210, w: 1124, h: 360, title: "at runtime \xB7 continuously", a: aR, tone: "flow" }), [["interpreter", "starts instantly"], ["C1", "quick \xB7 profiles"], ["C2", "aggressive"], ["machine code", "fast"]].map(([l, s], i) => /* @__PURE__ */ React.createElement(Box, { key: l, x: tierX[i] - (i === 3 ? 100 : 110), y: Y - 50, w: i === 3 ? 200 : 220, h: 84, label: l, sub: s, tone: i === 0 ? "ink" : i === 3 ? "flow" : "pull", a: E(t, [14.5, 20, 26.5, 27.5][i]), glow: tier === Math.min(i, 2) && i < 3 && t > 14.5 ? 0.6 : 0 })), /* @__PURE__ */ React.createElement(HArrow, { x1: 962, x2: 1038, y: Y - 8, a: E(t, 20), color: PAL.pull, label: "hot?", lfs: 17 }), /* @__PURE__ */ React.createElement(HArrow, { x1: 1262, x2: 1338, y: Y - 8, a: E(t, 26.5), color: PAL.pull, label: "hotter?", lfs: 17 }), /* @__PURE__ */ React.createElement(HArrow, { x1: 1562, x2: 1610, y: Y - 8, a: E(t, 27.5), color: PAL.flow }), /* @__PURE__ */ React.createElement(Arrow, { pts: [[1712, Y + 36], [1712, Y + 170], [850, Y + 170], [850, Y + 40]], draw: M(t, 32.5, 1.4), color: PAL.bad, dashed: true, width: 2.5 }), /* @__PURE__ */ React.createElement(Txt, { x: 1281, y: Y + 180, anchor: "mid", mono: true, fs: 19, color: PAL.bad, a: E(t, 33.4) }, "deoptimise \xB7 assumption was wrong \xB7 re-profile"), t > 14.5 && /* @__PURE__ */ React.createElement(Val, { x: pos[0], y: pos[1], text: "add()", tone: tier === 0 ? "ink" : tier === 1 ? "pull" : "flow", fs: 18, h: 36, o: E(t, 14.5) }), /* @__PURE__ */ React.createElement(Txt, { x: 884, y: Y + 118, mono: true, fs: 18, color: PAL.ink2, a: E(t, 15) }, "calls: ", /* @__PURE__ */ React.createElement("span", { style: { color: PAL.ink } }, calls.toLocaleString("en-US")), " \xB7 ", tierName), /* @__PURE__ */ React.createElement(Txt, { x: 1150, y: Y + 42, anchor: "mid", mono: true, fs: 17, color: PAL.ink3, a: E(t, 20.5) }, "after ~200 calls"), /* @__PURE__ */ React.createElement(Txt, { x: 1450, y: Y + 42, anchor: "mid", mono: true, fs: 17, color: PAL.ink3, a: E(t, 27) }, "after ~5,000+ calls"), /* @__PURE__ */ React.createElement(Panel, { x: 96, y: 620, w: 1728, h: 310, title: "throughput of this service", right: "time \u2192", a: E(t, 14) }), /* @__PURE__ */ React.createElement("svg", { width: "1920", height: "1080", style: { position: "absolute", left: 0, top: 0, opacity: E(t, 14.5) } }, /* @__PURE__ */ React.createElement("line", { x1: gx0, y1: gy0, x2: gx1, y2: gy0, stroke: PAL.line2, strokeWidth: "2" }), pts.length > 1 && /* @__PURE__ */ React.createElement("polyline", { points: pts.map((p) => p.join(",")).join(" "), fill: "none", stroke: PAL.flow, strokeWidth: "4", strokeLinejoin: "round" })), /* @__PURE__ */ React.createElement(Txt, { x: 210, y: gy0 - 60, mono: true, fs: 17, color: PAL.ink3, a: E(t, 16) }, "interpreted: slow"), /* @__PURE__ */ React.createElement(Txt, { x: lerp(gx0, gx1, (21 - T0) / (T1 - T0)), y: lerp(gy0, gy1, 0.45) - 34, mono: true, fs: 17, color: PAL.pull, a: E(t, 21) }, "C1"), /* @__PURE__ */ React.createElement(Txt, { x: lerp(gx0, gx1, (27.5 - T0) / (T1 - T0)), y: lerp(gy0, gy1, 0.95) - 34, mono: true, fs: 17, color: PAL.flow, a: E(t, 28) }, "C2: several \xD7 faster"), /* @__PURE__ */ React.createElement(Txt, { x: lerp(gx0, gx1, (33.4 - T0) / (T1 - T0)), y: gy0 - 84, mono: true, fs: 17, color: PAL.bad, a: E(t, 33.5) }, "deopt dip"), /* @__PURE__ */ React.createElement(Brace, { x: gx0, y: gy0 + 6, w: lerp(0, gx1 - gx0, (27 - T0) / (T1 - T0)), label: "warm-up: a benchmark here measures nothing", tone: "pull", a: E(t, 40), fs: 17 }));
  }
  var BYTES = [
    "ca fe ba be 00 00 00 3d 00 33 0a 00 02 00 03 07",
    "00 04 0c 00 05 00 06 01 00 10 6a 61 76 61 2f 6c",
    "61 6e 67 2f 4f 62 6a 65 63 74 01 00 06 3c 69 6e",
    "69 74 3e 01 00 03 28 29 56 07 00 08 01 00 04 43"
  ].join(" ").split(" ");
  var GROUPS = [
    [0, 3, "pull", 5],
    [4, 5, "ink", 11],
    [6, 7, "flow", 11],
    [8, 9, "violet", 22.5],
    [10, 10, "blue", 28],
    [11, 12, "blue", 29],
    [13, 14, "blue", 30],
    [15, 15, "green", 35],
    [16, 17, "green", 35.6],
    [18, 18, "pink", 37],
    [19, 20, "pink", 37.6],
    [21, 22, "pink", 38.2],
    [23, 23, "pull", 41.5],
    [24, 25, "pull", 42.3],
    [26, 41, "pull", 43.2]
  ];
  function SHexDump({ t }) {
    const cx = 286, cw = 56, gap = 8, rowY = [430, 520, 610, 700];
    const groupOf = (i) => GROUPS.find((g) => i >= g[0] && i <= g[1]);
    const focus = (() => {
      let f = null;
      for (const g of GROUPS) if (t >= g[3]) f = g;
      return f;
    })();
    const decode = [
      [5, "pull", "ca fe ba be", "magic number"],
      [11, "flow", "00 00 \xB7 00 3d", "minor 0 \xB7 major 61 \u2192 Java 17"],
      [22.5, "violet", "00 33", "constant pool count 51 \u2192 50 entries"],
      [28, "blue", "0a 0002 0003", "#1 Methodref \u2192 #2 . #3"],
      [35, "green", "07 0004", "#2 Class \u2192 #4"],
      [37, "pink", "0c 0005 0006", "#3 NameAndType \u2192 #5 : #6"],
      [41.5, "pull", "01 0010 \u2026", "#4 Utf8, 16 bytes: java/lang/Object"]
    ];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Console, { x: 96, y: 190, w: 820, h: 180, t, a: E(t, 0.3), items: [{ at: 0.8, text: "javac Calc.java", kind: "cmd" }, { at: 2.2, text: "xxd Calc.class | head -4", kind: "cmd" }] }), rowY.map((y, r) => /* @__PURE__ */ React.createElement(React.Fragment, { key: r }, /* @__PURE__ */ React.createElement(Txt, { x: 96, y: y + 12, mono: true, fs: 24, color: PAL.ink3, a: E(t, 2.8 + r * 0.2) }, (r * 16).toString(16).padStart(8, "0"), ":"), BYTES.slice(r * 16, r * 16 + 16).map((b, k) => {
      const i = r * 16 + k;
      const g = groupOf(i);
      const on = g && t >= g[3];
      const isFocus = focus && g === focus;
      const c = on ? toneColor(g[2]) : null;
      const ascii = i >= 26 && i <= 41 && t >= 43.2;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: k }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: cx + k * (cw + gap), top: y, width: cw, height: 54, boxSizing: "border-box", borderRadius: 8, opacity: E(t, 2.8 + r * 0.2 + k * 0.02, 0.3), background: on ? hexA(c, isFocus ? 0.3 : 0.14) : PAL.panel2, border: `2px solid ${on ? c : PAL.line}`, display: "flex", alignItems: "center", justifyContent: "center", font: `600 24px ${MONO}`, color: on ? PAL.ink : PAL.ink2, boxShadow: isFocus ? `0 0 18px ${hexA(c, 0.5)}` : "none" } }, b), ascii && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: cx + k * (cw + gap), top: y + 58, width: cw, textAlign: "center", font: `600 18px ${MONO}`, color: PAL.pull, opacity: E(t, 43.2 + (i - 26) * 0.08, 0.2) } }, String.fromCharCode(parseInt(b, 16))));
    }))), /* @__PURE__ */ React.createElement(Panel, { x: 1352, y: 190, w: 472, h: 620, title: "decoded", a: E(t, 4.5) }, /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 18px" } }, decode.map(([at, tone, bytes, what], i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { opacity: E(t, at, 0.4), transform: `translateX(${(1 - E(t, at, 0.4)) * 16}px)`, borderLeft: `4px solid ${toneColor(tone)}`, padding: "6px 12px", margin: "8px 0", background: hexA(toneColor(tone), 0.07), borderRadius: "0 8px 8px 0" } }, /* @__PURE__ */ React.createElement("div", { style: { font: `600 18px ${MONO}`, color: toneColor(tone) } }, bytes), /* @__PURE__ */ React.createElement("div", { style: { font: `400 18px ${SANS}`, color: PAL.ink, marginTop: 2 } }, what))))), /* @__PURE__ */ React.createElement(Callout, { x: 96, y: 810, w: 1210, tone: "flow", a: win(t, 15.5, 22.3, 0.5), title: "version", text: "0x3D = 61 = **Java 17**, the JDK this was compiled with. A Java 25 `javac` writes `0x45` = **69**." }), /* @__PURE__ */ React.createElement(Callout, { x: 96, y: 810, w: 1210, tone: "violet", a: win(t, 22.5, 41.3, 0.5), title: "constant pool", text: "Each entry starts with a one-byte **tag** saying what kind it is, then its data. References to other entries are 2-byte indexes." }), /* @__PURE__ */ React.createElement(Callout, { x: 96, y: 810, w: 1210, tone: "pull", a: E(t, 47), title: "no magic", text: "Tags, indexes and text. You could decode the whole 928-byte file by hand with this table." }));
  }
  function SVersions({ t }) {
    const rows = [["52", "Java 8"], ["55", "Java 11"], ["61", "Java 17"], ["65", "Java 21"], ["69", "Java 25"]];
    const s1x = t < 7 ? 720 : t < 10 ? lerp(720, 1080, M(t, 7, 1.2)) : lerp(1080, 720, M(t, 10, 0.8));
    const shake = t > 10 && t < 11 ? Math.sin(t * 60) * 6 * (11 - t) : 0;
    const s2x = t < 21 ? 720 : lerp(720, 1110, M(t, 21, 1.4));
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Table, { x: 96, y: 200, cols: [150, 220], head: ["major", "release"], rows, a: E(t, 0.4), rowA: rows.map((_, i) => E(t, 0.8 + i * 0.5)), marks: { 2: ["pull", win(t, 6, 20)], 4: ["flow", win(t, 6, 20)], 0: ["flow", win(t, 20, 32)] }, fs: 22 }), /* @__PURE__ */ React.createElement(Code, { x: 96, y: 560, w: 520, h: 140, lang: "shell", title: "the fix", a: E(t, 32), fs: 20, lines: ["$ javac --release 17 Calc.java", "# \u2192 major version 61, runs on 17+"] }), /* @__PURE__ */ React.createElement(Txt, { x: 720, y: 196, mono: true, fs: 18, color: PAL.ink3, a: E(t, 6) }, "NEWER CLASS \xB7 OLDER JVM"), /* @__PURE__ */ React.createElement(Box, { x: s1x + shake, y: 240, w: 300, h: 84, label: "Calc.class", sub: "major 69", tone: "flow", a: E(t, 6) }), /* @__PURE__ */ React.createElement(Box, { x: 1430, y: 226, w: 394, h: 112, label: "JVM 17", sub: "understands up to 61", tone: t > 10 ? "bad" : "ink", a: E(t, 6.3), glow: pulse(t, [10], 1.4) }), /* @__PURE__ */ React.createElement(Mark, { x: 1804, y: 232, ok: false, a: E(t, 10.2) * win(t, 10.2, 20) }), /* @__PURE__ */ React.createElement(Console, { x: 720, y: 370, w: 1104, h: 200, t, a: E(t, 12), fs: 18, lh: 30, items: [
      { at: 12, text: 'Exception in thread "main" java.lang.UnsupportedClassVersionError:', kind: "err" },
      { at: 12.6, text: "  Calc has been compiled by a more recent version of the Java Runtime", kind: "err" },
      { at: 13.2, text: "  (class file version 69.0), this version only recognizes up to 61.0", kind: "err" }
    ] }), /* @__PURE__ */ React.createElement(Txt, { x: 720, y: 596, mono: true, fs: 18, color: PAL.ink3, a: E(t, 20) }, "OLDER CLASS \xB7 NEWER JVM"), /* @__PURE__ */ React.createElement(Box, { x: s2x, y: 640, w: 300, h: 84, label: "Old.class", sub: "major 52", tone: "green", a: E(t, 20) }), /* @__PURE__ */ React.createElement(Box, { x: 1430, y: 626, w: 394, h: 112, label: "JVM 25", sub: "understands up to 69", tone: t > 22.4 ? "flow" : "ink", a: E(t, 20.3), glow: pulse(t, [22.4], 1.4) }), /* @__PURE__ */ React.createElement(Mark, { x: 1804, y: 632, ok: true, a: E(t, 22.5) }), /* @__PURE__ */ React.createElement(Callout, { x: 720, y: 790, w: 1104, tone: "pull", a: E(t, 27), title: "the rule", text: "Java runs **older** class files forever, never **newer** ones." }));
  }
  var SECTIONS = [
    ["magic", "u4 \xB7 CAFEBABE", 0.6, "ink"],
    ["version", "u2 minor \xB7 u2 major", 0.9, "ink"],
    ["constant pool", "50 entries \xB7 703 of 928 bytes", 1.2, "violet", 230],
    ["access flags", "public \xB7 final \xB7 \u2026", 4, "ink"],
    ["this \xB7 super", "#7 Calc \xB7 #2 Object", 4.5, "ink"],
    ["interfaces", "none", 5, "ink"],
    ["fields", "none", 5.5, "ink"],
    ["methods", "<init> \xB7 add \xB7 main", 10, "flow", 100],
    ["attributes", "SourceFile \xB7 BootstrapMethods \u2026", 6.5, "ink"]
  ];
  function SStructure({ t }) {
    let y = 196, mY = 0;
    const boxes = SECTIONS.map(([l, sub, at, tone, big], i) => {
      const h = big || 46;
      const glow = (i === 2 ? win(t, 23, 32) : 0) + (i === 7 ? win(t, 10, 23) * 0.8 : 0);
      const el = big ? /* @__PURE__ */ React.createElement(Box, { key: l, x: 96, y, w: 600, h, label: l, sub, tone, align: "left", fs: 22, sfs: 17, a: E(t, at), glow }) : /* @__PURE__ */ React.createElement(Box, { key: l, x: 96, y, w: 600, h, align: "left", fs: 19, tone, a: E(t, at), glow, label: /* @__PURE__ */ React.createElement("span", null, l, /* @__PURE__ */ React.createElement("span", { style: { color: PAL.ink3, fontWeight: 400, marginLeft: 16 } }, sub)) });
      if (i === 7) mY = y + h / 2;
      y += h + 8;
      return el;
    });
    const codeBytes = [{ n: 1, label: "1b", sub: "iload_1", tone: "flow" }, { n: 1, label: "1c", sub: "iload_2", tone: "flow" }, { n: 1, label: "60", sub: "iadd", tone: "pull" }, { n: 1, label: "ac", sub: "ireturn", tone: "pink" }];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, boxes, /* @__PURE__ */ React.createElement(Arrow, { pts: [[700, mY], [750, mY], [750, 420], [794, 420]], draw: M(t, 10.4, 0.8), color: PAL.flow }), /* @__PURE__ */ React.createElement(Panel, { x: 800, y: 196, w: 1024, h: 470, title: "methods[1] \xB7 add", right: "descriptor (II)I", a: E(t, 10.6), tone: "flow" }, /* @__PURE__ */ React.createElement("div", { style: { padding: "18px 26px", font: `400 20px ${SANS}`, color: PAL.ink2 } }, "Code attribute")), /* @__PURE__ */ React.createElement(Bytes, { x: 860, y: 300, unit: 150, h: 84, fs: 26, sfs: 18, cells: codeBytes.map((c, i) => ({ ...c, a: E(t, 11.5 + i * 0.4) })), a: E(t, 11.4) }), /* @__PURE__ */ React.createElement(Txt, { x: 860, y: 418, fs: 20, color: PAL.ink2, a: E(t, 13.5) }, "four bytes of bytecode: one opcode byte each"), /* @__PURE__ */ React.createElement(Node, { x: 860, y: 470, w: 420, h: 160, kind: "frame size, computed by javac", name: "", rows: [["max_stack", "2", PAL.pull, win(t, 16.5, 23)], ["max_locals", "3", PAL.pull, win(t, 16.5, 23)], ["code_length", "4"]], a: E(t, 16) }), /* @__PURE__ */ React.createElement(Callout, { x: 1310, y: 470, w: 480, tone: "pull", a: E(t, 17.5), text: "The JVM can size this method's frame **before** running a single instruction." }), /* @__PURE__ */ React.createElement(Panel, { x: 800, y: 700, w: 1024, h: 190, title: "where the 928 bytes go", a: E(t, 23) }), /* @__PURE__ */ React.createElement(
      Bytes,
      {
        x: 830,
        y: 770,
        unit: 964 / 928,
        h: 60,
        ruler: false,
        a: E(t, 23.3),
        fs: 18,
        sfs: 16,
        cells: [{ n: 10, tone: "ink" }, { n: 703, label: "constant pool \xB7 76%", tone: "violet", glow: win(t, 24, 32) }, { n: 215, label: "everything else", tone: "ink" }]
      }
    ));
  }
  var POOL = [
    ["#1", "Methodref", "#2.#3", 'java/lang/Object."<init>":()V'],
    ["#2", "Class", "#4", "java/lang/Object"],
    ["#3", "NameAndType", "#5:#6", '"<init>":()V'],
    ["#4", "Utf8", "", "java/lang/Object"],
    ["#5", "Utf8", "", "<init>"],
    ["#6", "Utf8", "", "()V"],
    ["#7", "Class", "#8", "Calc"],
    ["#8", "Utf8", "", "Calc"],
    ["#9", "Methodref", "#7.#3", 'Calc."<init>":()V'],
    ["#10", "Methodref", "#7.#11", "Calc.add:(II)I"],
    ["#11", "NameAndType", "#12:#13", "add:(II)I"],
    ["#12", "Utf8", "", "add"],
    ["#13", "Utf8", "", "(II)I"]
  ];
  function SPoolTable({ t }) {
    const TX = 940, TY = 196, RH = 48;
    const ry = (i) => TY + 42 + i * RH + RH / 2;
    const R = TX + 830;
    const marks = {
      9: ["pull", win(t, 6, 34)],
      6: ["green", win(t, 11, 34)],
      7: ["green", win(t, 13, 34)],
      10: ["pink", win(t, 17, 34)],
      11: ["pink", win(t, 19, 34)],
      12: ["pink", win(t, 22, 34)],
      2: ["violet", E(t, 34.5)],
      0: ["violet", E(t, 36)],
      8: ["violet", E(t, 36)]
    };
    const [hl, hA] = hlAt(t, [[1, 3]]);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      Code,
      {
        x: 96,
        y: 196,
        w: 800,
        h: 290,
        lang: "bytecode",
        title: "main \xB7 javap -c",
        a: E(t, 0.3),
        fs: 20,
        lh: 36,
        hl,
        hlA: hA,
        lines: ["   8: aload_1", "   9: iconst_2", "  10: iconst_3", "  11: invokevirtual #10  // add:(II)I", "  14: istore_2", "  15: getstatic     #14"]
      }
    ), /* @__PURE__ */ React.createElement(
      Table,
      {
        x: TX,
        y: TY,
        cols: [80, 200, 150, 400],
        head: ["#", "kind", "points to", "means"],
        rows: POOL,
        a: E(t, 4),
        fs: 18,
        rh: RH,
        marks,
        rowA: POOL.map((_, i) => E(t, 4.2 + i * 0.12)),
        colColors: [PAL.pull, PAL.ink2, PAL.violet, PAL.ink]
      }
    ), /* @__PURE__ */ React.createElement(Arrow, { from: [760, 196 + 44 + 12 + 3 * 36 + 18], to: [TX - 8, ry(9)], curve: -40, draw: M(t, 6.2, 0.8), color: PAL.pull }), /* @__PURE__ */ React.createElement(Arrow, { from: [R, ry(9)], to: [R, ry(6)], curve: -50, draw: M(t, 11, 0.8), color: PAL.green }), /* @__PURE__ */ React.createElement(Arrow, { from: [R, ry(6)], to: [R, ry(7)], curve: -24, draw: M(t, 13, 0.6), color: PAL.green }), /* @__PURE__ */ React.createElement(Arrow, { from: [R, ry(9)], to: [R, ry(10)], curve: -24, draw: M(t, 17, 0.6), color: PAL.pink }), /* @__PURE__ */ React.createElement(Arrow, { from: [R + 30, ry(10)], to: [R + 30, ry(11)], curve: -24, draw: M(t, 19, 0.6), color: PAL.pink }), /* @__PURE__ */ React.createElement(Arrow, { from: [R + 30, ry(10)], to: [R + 30, ry(12)], curve: -40, draw: M(t, 22, 0.7), color: PAL.pink }), /* @__PURE__ */ React.createElement(Arrow, { from: [TX - 6, ry(0)], to: [TX - 6, ry(2)], curve: 40, draw: M(t, 36, 0.7), color: PAL.violet }), /* @__PURE__ */ React.createElement(Arrow, { from: [TX - 6, ry(8)], to: [TX - 6, ry(2)], curve: -70, draw: M(t, 36.4, 0.9), color: PAL.violet }), /* @__PURE__ */ React.createElement(Card, { x: 96, y: 530, w: 800, h: 170, a: E(t, 27.5), tone: "pull", num: "invokevirtual #10", title: "call `Calc.add`", sub: "taking `(int, int)`, returning `int`", tfs: 30, sfs: 22 }), /* @__PURE__ */ React.createElement(Callout, { x: 96, y: 730, w: 800, tone: "violet", a: E(t, 34.5), title: "stored once", text: "`\"<init>\":()V` is one entry, shared by `Object`'s and `Calc`'s constructor references." }), /* @__PURE__ */ React.createElement(Callout, { x: 96, y: 860, w: 800, tone: "flow", a: E(t, 42), fs: 20, text: "Every class name, method name, string literal and descriptor: once, by index." }));
  }
  var LETTERS = [["B", "byte"], ["C", "char"], ["D", "double"], ["F", "float"], ["I", "int"], ["J", "long"], ["S", "short"], ["Z", "boolean"], ["V", "void"], ["L\u2026;", "class"], ["[", "array of"]];
  var EXAMPLES = [
    { at: 17, end: 24, tokens: [["(", "dim"], ["I", "flow", "int"], ["I", "flow", "int"], [")", "dim"], ["I", "pull", "returns int"]], read: "add(int, int) \u2192 int" },
    { at: 24, end: 31, tokens: [["(", "dim"], ["[", "violet", "array of"], ["Ljava/lang/String;", "flow", "String"], [")", "dim"], ["V", "pull", "returns void"]], read: "main(String[]) \u2192 void" },
    { at: 31, end: 99, tokens: [["(", "dim"], ["J", "flow", "long"], ["Z", "flow", "boolean"], [")", "dim"], ["[", "violet", "array of"], ["D", "pull", "double"]], read: "(long, boolean) \u2192 double[]" }
  ];
  function SDescriptors({ t }) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, LETTERS.map(([l, m], i) => {
      const odd = l === "J" || l === "Z";
      return /* @__PURE__ */ React.createElement(Box, { key: l, x: 96 + i * 158, y: 200, w: 146, h: 108, label: l, sub: m, fs: 30, sfs: 17, tone: odd ? "pull" : l.length > 1 ? "violet" : "ink", a: E(t, 0.8 + i * 0.15), glow: odd ? win(t, 4.5, 11.5) : l.length > 1 ? win(t, 11.5, 17) : 0, s: odd ? 1 + 0.06 * win(t, 4.5, 11.5) : 1 });
    }), EXAMPLES.map((ex, k) => {
      const a = win(t, ex.at, ex.end, 0.5);
      if (a < 0.01) return null;
      const cells = ex.tokens.map(([txt, , meaning]) => Math.max(txt.length * 26 + 28, meaning ? meaning.length * 11.5 + 28 : 0, 44));
      const W = cells.reduce((s, w) => s + w, 0) + (cells.length - 1) * 14;
      let x = 960 - W / 2;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: k }, /* @__PURE__ */ React.createElement(Txt, { x: 960, y: 366, anchor: "mid", mono: true, fs: 44, weight: 600, a }, ex.tokens.map(([txt, tone], j) => /* @__PURE__ */ React.createElement("span", { key: j, style: { color: toneColor(tone) } }, txt))), ex.tokens.map(([txt, tone, meaning], j) => {
        const w = cells[j], x0 = x;
        x += w + 14;
        const ta = E(t, ex.at + 0.8 + j * 0.45, 0.4);
        const c = toneColor(tone);
        return /* @__PURE__ */ React.createElement(React.Fragment, { key: j }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x0, top: 450, width: w, height: 84, boxSizing: "border-box", borderRadius: 10, opacity: a * ta, transform: `translateY(${(1 - ta) * -40}px)`, background: tone === "dim" ? "transparent" : hexA(c, 0.12), border: tone === "dim" ? "none" : `2px solid ${hexA(c, 0.8)}`, display: "flex", alignItems: "center", justifyContent: "center", font: `600 40px ${MONO}`, color: c } }, txt), meaning && /* @__PURE__ */ React.createElement(Txt, { x: x0 + w / 2, y: 548, anchor: "mid", mono: true, fs: 19, color: c, a: a * ta }, meaning));
      }), /* @__PURE__ */ React.createElement(Txt, { x: 960, y: 620, anchor: "mid", mono: true, fs: 36, weight: 600, color: PAL.ink, a: a * E(t, ex.at + 3.4) }, ex.read));
    }), /* @__PURE__ */ React.createElement(Callout, { x: 96, y: 730, w: 1728, tone: "violet", a: E(t, 37.5), title: "return type included", text: "A method is identified by **name + full descriptor**. `javac` forbids overloading on return type alone, but the JVM itself would accept it: `foo:()I` and `foo:()J` are different methods." }));
  }
  function SResolution({ t }) {
    const resolved = t >= 24;
    const runs = [
      { at: 10.5, slow: true },
      { at: 31, slow: false },
      { at: 33, slow: false },
      { at: 35, slow: false }
    ];
    const steps = ["find class Calc", "find add:(II)I", "check access", "cache the result"];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel, { x: 96, y: 210, w: 470, h: 250, title: "Calc.class \xB7 on disk", a: E(t, 0.5) }, /* @__PURE__ */ React.createElement("div", { style: { padding: "18px 22px", font: `500 21px ${MONO}`, color: PAL.ink2, lineHeight: 1.7 } }, /* @__PURE__ */ React.createElement("div", null, "#7  Class      Calc"), /* @__PURE__ */ React.createElement("div", { style: { color: PAL.ink } }, "#10 Methodref  Calc.add:(II)I"), /* @__PURE__ */ React.createElement("div", null, "#11 NameAndType add:(II)I"), /* @__PURE__ */ React.createElement("div", null, "\u2026"))), /* @__PURE__ */ React.createElement(HArrow, { x1: 574, x2: 700, y: 335, a: E(t, 4.5), color: PAL.violet, label: "loads", lfs: 17 }), /* @__PURE__ */ React.createElement(Panel, { x: 706, y: 210, w: 600, h: 250, title: "metaspace \xB7 runtime constant pool", tone: "violet", a: E(t, 4.8) }, /* @__PURE__ */ React.createElement("div", { style: { padding: "22px 22px", font: `500 22px ${MONO}`, color: PAL.ink } }, /* @__PURE__ */ React.createElement("div", { style: { color: PAL.ink2 } }, "#10 Methodref"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, color: resolved ? PAL.ink3 : PAL.pull, textDecoration: resolved ? "line-through" : "none" } }, 'symbolic: "Calc.add:(II)I"'), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, color: PAL.flow, opacity: E(t, 24) } }, "resolved \u2192 Method* Calc::add"))), /* @__PURE__ */ React.createElement(Panel, { x: 1366, y: 210, w: 458, h: 250, title: "cp cache (HotSpot)", tone: "flow", a: E(t, 24) }, /* @__PURE__ */ React.createElement("div", { style: { padding: "22px 22px", font: `500 21px ${MONO}`, color: PAL.ink2, lineHeight: 1.6 } }, /* @__PURE__ */ React.createElement("div", null, "entry for #10:"), /* @__PURE__ */ React.createElement("div", { style: { color: PAL.flow } }, "\u2192 Calc::add, ready"))), /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 520, mono: true, fs: 20, color: PAL.ink3, a: E(t, 10) }, "EXECUTING  invokevirtual #10"), steps.map((s, i) => /* @__PURE__ */ React.createElement(Box, { key: s, x: 300 + i * 330, y: 600, w: 290, h: 80, label: s, fs: 19, tone: i === 3 ? "flow" : "pull", a: E(t, 16.5 + i * 1.6), glow: pulse(t, [17 + i * 1.6], 1) })), steps.slice(1).map((_, i) => /* @__PURE__ */ React.createElement(HArrow, { key: i, x1: 592 + i * 330, x2: 628 + i * 330, y: 640, a: E(t, 17.4 + i * 1.6), color: PAL.pull })), /* @__PURE__ */ React.createElement(Box, { x: 96, y: 600, w: 170, h: 80, label: "1st call", fs: 19, tone: "bad", a: E(t, 10.5) }), /* @__PURE__ */ React.createElement(HArrow, { x1: 268, x2: 296, y: 640, a: E(t, 16.5), color: PAL.pull }), /* @__PURE__ */ React.createElement(Box, { x: 96, y: 760, w: 170, h: 80, label: "2nd, 3rd\u2026", fs: 19, tone: "flow", a: E(t, 30.5) }), /* @__PURE__ */ React.createElement(Arrow, { pts: [[268, 800], [1580, 800]], draw: M(t, 31, 0.8), color: PAL.flow, width: 3 }), /* @__PURE__ */ React.createElement(Box, { x: 1590, y: 760, w: 234, h: 80, label: "Calc::add", fs: 20, tone: "flow", a: E(t, 31.6), glow: pulse(t, [31.8, 33.8, 35.8], 0.8) }), /* @__PURE__ */ React.createElement(Txt, { x: 924, y: 812, anchor: "mid", mono: true, fs: 18, color: PAL.flow, a: E(t, 31.6) }, "straight through the cache \xB7 no lookup"), runs.slice(1).map((r, i) => {
      const p = M(t, r.at, 0.9);
      return p > 0 && p < 1 ? /* @__PURE__ */ React.createElement(Dot, { key: i, x: lerp(268, 1580, p), y: 800, color: PAL.flow }) : null;
    }), /* @__PURE__ */ React.createElement(Callout, { x: 96, y: 880, w: 1728, tone: "pull", a: E(t, 34), fs: 20, text: "Resolution is **lazy**: each entry is resolved the first time it's used, then never again." }));
  }
  var FLAGS = [
    [5, "javap", "non-private signatures"],
    [9.5, "-p", "adds private members"],
    [13.5, "-c", "disassembles every method"],
    [18, "-v", "constant pool, flags, stack sizes, attributes"],
    [23, "-s", "type descriptors"]
  ];
  function SJavap({ t }) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Console, { x: 96, y: 200, w: 900, h: 700, t, a: E(t, 0.4), fs: 20, lh: 31, items: [
      { at: 5, text: "javap Calc.class", kind: "cmd" },
      { at: 5.6, text: "public class Calc {" },
      { at: 5.8, text: "  public Calc();" },
      { at: 6, text: "  int add(int, int);" },
      { at: 6.2, text: "  public static void main(java.lang.String[]);" },
      { at: 6.4, text: "}" },
      { at: 13.5, text: "javap -c Calc.class", kind: "cmd" },
      { at: 14.1, text: "  int add(int, int);" },
      { at: 14.3, text: "    Code:" },
      { at: 14.5, text: "       0: iload_1", kind: "ok" },
      { at: 14.7, text: "       1: iload_2", kind: "ok" },
      { at: 14.9, text: "       2: iadd", kind: "ok" },
      { at: 15.1, text: "       3: ireturn", kind: "ok" },
      { at: 18, text: "javap -v Calc.class | grep stack", kind: "cmd" },
      { at: 18.6, text: "      stack=2, locals=3, args_size=3" },
      { at: 23, text: "javap -s Calc.class | grep descriptor", kind: "cmd" },
      { at: 23.6, text: "    descriptor: (II)I" }
    ] }), FLAGS.map(([at, f, d], i) => /* @__PURE__ */ React.createElement(Box, { key: f, x: 1040, y: 200 + i * 112, w: 784, h: 96, align: "left", label: f, sub: d, fs: 28, sfs: 19, tone: i === 2 ? "pull" : "flow", a: E(t, at), glow: pulse(t, [at + 0.1], 1.2) })), /* @__PURE__ */ React.createElement(Card, { x: 1040, y: 780, w: 784, h: 120, a: E(t, 27.5), tone: "pull", title: "`javap -c -p -v Calc`", sub: "the answer to \u201Cwhat does this compile to?\u201D", tfs: 28, sfs: 20 }));
  }

  // src/topics/8.1/scenes2.jsx
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
    Bytes: Bytes2,
    toneColor: toneColor2
  } = window.AN;
  var E2 = MOTION2.enter;
  var M2 = MOTION2.move;
  var POP2 = MOTION2.pop;
  function Tok({ t, keys, text, tone = "flow", from, until, w = 260, h = 52, fs = 24, glowAt, wKeys }) {
    if (wKeys) w = window.AN.track1(t, wKeys);
    if (t < (from == null ? keys[0][0] : from)) return null;
    const [x, y] = track2(t, keys);
    let a = E2(t, from == null ? keys[0][0] : from, 0.25);
    if (until != null) a *= 1 - E2(t, until, 0.3);
    if (a <= 0.01) return null;
    const c = toneColor2(tone);
    const g = glowAt != null ? pulse2(t, [glowAt], 1) : 0;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, boxSizing: "border-box", borderRadius: 10, opacity: a, background: hexA2(c, 0.16), border: `2px solid ${c}`, display: "flex", alignItems: "center", justifyContent: "center", font: `600 ${fs}px ${MONO2}`, color: PAL2.ink, boxShadow: g > 0.01 ? `0 0 ${26 * g}px ${hexA2(c, 0.7 * g)}` : "none", whiteSpace: "nowrap" } }, text);
  }
  function Slot({ x, y, w = 180, h = 90, idx, name, value, tone, a = 1, glow = 0 }) {
    if (a <= 5e-3) return null;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt2, { x: x + w / 2, y: y - 30, anchor: "mid", mono: true, fs: 16, color: PAL2.ink3, a }, "slot ", idx), /* @__PURE__ */ React.createElement(Box2, { x, y, w, h, label: value, sub: name, tone, a, glow, fs: 24, sfs: 17 }));
  }
  function SStackAdd({ t }) {
    const SX = 1080, sp = (i) => 699 - i * 62;
    const [hl, hA] = hlAt2(t, [[17.5, 0], [24, 1], [30, 2], [37, 3], [43, -1]]);
    const trace = [[10.5, "[ ]"], [18.8, "[ 2 ]"], [25.2, "[ 2, 3 ]"], [31.4, "[ 5 ]"], [38.2, "[ ]"]];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 200, w: 600, h: 190, title: "Calc.java", a: E2(t, 0.5), fs: 24, lh: 40, lines: ["int add(int a, int b) {", "    return a + b;", "}"] }), /* @__PURE__ */ React.createElement(Badge2, { x: 396, y: 420, text: "called as add(2, 3)", tone: "pull", a: E2(t, 12), fs: 18 }), /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 460, w: 600, h: 300, title: "javap -c", lang: "bytecode", a: E2(t, 2), fs: 30, lh: 56, hl, hlA: hA, lines: ["0: iload_1", "1: iload_2", "2: iadd", "3: ireturn"] }), /* @__PURE__ */ React.createElement(Callout2, { x: 96, y: 790, w: 600, tone: "pull", a: E2(t, 50), fs: 19, text: "`max_stack = 2`, `max_locals = 3`: the frame's exact size. The **verifier** checks no path ever exceeds it." }), /* @__PURE__ */ React.createElement(Panel2, { x: 760, y: 200, w: 640, h: 590, title: "frame \xB7 add(2, 3)", tone: "flow", a: E2(t, 4.5) }), /* @__PURE__ */ React.createElement(Txt2, { x: 790, y: 262, mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 5.5) }, "LOCAL VARIABLES"), /* @__PURE__ */ React.createElement(Slot, { x: 790, y: 320, idx: 0, name: "this", value: "Calc@1b6d", tone: "ink", a: E2(t, 10.5) }), /* @__PURE__ */ React.createElement(Slot, { x: 990, y: 320, idx: 1, name: "a", value: "2", tone: "flow", a: E2(t, 11), glow: pulse2(t, [17.5], 1) }), /* @__PURE__ */ React.createElement(Slot, { x: 1190, y: 320, idx: 2, name: "b", value: "3", tone: "flow", a: E2(t, 11.5), glow: pulse2(t, [24], 1) }), /* @__PURE__ */ React.createElement(Panel2, { x: 900, y: 440, w: 360, h: 330, title: "operand stack", a: E2(t, 6), tone: "pull" }), /* @__PURE__ */ React.createElement(Tok, { t, text: "2", keys: [[17.7, 1080, 365], [18.7, SX, sp(0)], [30.2, SX, sp(0)], [31, SX, sp(0) - 31]], until: 31 }), /* @__PURE__ */ React.createElement(Tok, { t, text: "3", keys: [[24.2, 1280, 365], [25.2, SX, sp(1)], [30.2, SX, sp(1)], [31, SX, sp(0) - 31]], until: 31 }), /* @__PURE__ */ React.createElement(Tok, { t, text: "5", tone: "pull", keys: [[31.1, SX, sp(0)], [37.2, SX, sp(0)], [38.2, 1640, sp(0)]], glowAt: 31.1, until: 39 }), /* @__PURE__ */ React.createElement(Txt2, { x: 1080, y: sp(0) - 12, anchor: "mid", mono: true, fs: 17, color: PAL2.ink3, a: win2(t, 6.5, 17.6) }, "empty"), /* @__PURE__ */ React.createElement(Txt2, { x: 1460, y: 262, mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 16) }, "STACK OVER TIME"), trace.map(([at, s], i) => /* @__PURE__ */ React.createElement(Txt2, { key: i, x: 1460, y: 310 + i * 56, mono: true, fs: 30, weight: 600, color: i === trace.filter((x) => t >= x[0]).length - 1 ? PAL2.pull : PAL2.ink2, a: E2(t, at) }, s)), /* @__PURE__ */ React.createElement(Txt2, { x: 1640, y: sp(0) - 64, anchor: "mid", mono: true, fs: 18, color: PAL2.pull, a: E2(t, 38) }, "back to the caller"), /* @__PURE__ */ React.createElement(Callout2, { x: 1440, y: 800, w: 384, tone: "flow", a: E2(t, 43.5), fs: 19, text: "Every instruction: pop its inputs, push its output." }));
  }
  function SPrefixes({ t }) {
    const rows = [["i", "int", "iload  istore  iadd  ireturn"], ["l", "long", "lload  lstore  ladd  lreturn"], ["f", "float", "fload  fstore  fadd  freturn"], ["d", "double", "dload  dstore  dadd  dreturn"], ["a", "reference", "aload  astore  areturn  (no aadd!)"]];
    const [hl, hA] = hlAt2(t, [[23, 0], [25, 1], [27, 2]]);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      Table2,
      {
        x: 96,
        y: 196,
        cols: [130, 210, 700],
        head: ["prefix", "type", "the same operation, typed"],
        rows,
        a: E2(t, 0.6),
        rowA: rows.map((_, i) => E2(t, 4 + i * 0.6)),
        colColors: [PAL2.pull, PAL2.ink, PAL2.ink2],
        fs: 22,
        marks: { 4: ["violet", win2(t, 7, 16)] }
      }
    ), /* @__PURE__ */ React.createElement(Callout2, { x: 1176, y: 196, w: 648, tone: "pull", a: E2(t, 16), title: "no small types", text: "`boolean`, `byte`, `char` and `short` are loaded and computed as **int**. There is no `badd` or `cadd`." }), /* @__PURE__ */ React.createElement(Txt2, { x: 96, y: 540, mono: true, fs: 18, color: PAL2.ink3, a: E2(t, 22) }, "long sum(long a, long b)  \xB7  LOCAL VARIABLES"), [[0, 1, "this", "ink"], [1, 2, "a", "flow"], [3, 2, "b", "pull"]].map(([s, n, name, tone], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, /* @__PURE__ */ React.createElement(Box2, { x: 96 + s * 160, y: 590, w: n * 160 - 10, h: 100, label: name, sub: n === 2 ? "long \xB7 8 bytes" : "reference", tone, a: E2(t, 22.4 + i * 0.4), glow: i === 2 ? win2(t, 24.5, 29) : 0 }), Array.from({ length: n }).map((_, k) => /* @__PURE__ */ React.createElement(Txt2, { key: k, x: 96 + (s + k) * 160 + 75, y: 706, anchor: "mid", mono: true, fs: 16, color: PAL2.ink3, a: E2(t, 22.4 + i * 0.4) }, "slot ", s + k)))), /* @__PURE__ */ React.createElement(Code2, { x: 1176, y: 540, w: 648, h: 250, title: "javap -c", lang: "bytecode", a: E2(t, 23), fs: 26, lh: 44, hl, hlA: hA, lines: ["0: lload_1", "1: lload_3      // b starts at slot 3", "2: ladd", "3: lreturn"] }), /* @__PURE__ */ React.createElement(Bytes2, { x: 96, y: 790, unit: 70, h: 64, ruler: false, a: E2(t, 29.5), fs: 20, sfs: 16, cells: [{ n: 3, label: "lload_1", sub: "1F", tone: "flow" }] }), /* @__PURE__ */ React.createElement(Txt2, { x: 320, y: 808, mono: true, fs: 20, color: PAL2.ink2, a: E2(t, 30) }, "one byte, slot baked in"), /* @__PURE__ */ React.createElement(Bytes2, { x: 680, y: 790, unit: 70, h: 64, ruler: false, a: E2(t, 31.5), fs: 20, sfs: 16, cells: [{ n: 3, label: "lload", sub: "16", tone: "pull" }, { n: 1, label: "05", sub: "slot", tone: "pull" }] }), /* @__PURE__ */ React.createElement(Txt2, { x: 970, y: 808, mono: true, fs: 20, color: PAL2.ink2, a: E2(t, 32) }, "slots 4+ need an operand byte"));
  }
  var MAIN = [
    " 0: new           #7   // Calc",
    " 3: dup",
    " 4: invokespecial #9   // <init>",
    " 7: astore_1",
    " 8: aload_1",
    " 9: iconst_2",
    "10: iconst_3",
    "11: invokevirtual #10  // add",
    "14: istore_2",
    "15: getstatic     #14  // System.out",
    "18: iload_2",
    "19: invokedynamic #20  // concat",
    "24: invokevirtual #24  // println",
    "27: return"
  ];
  var MSTEPS = [[4, 0], [9.5, 1], [15, 2], [21, 3], [26.5, 4], [28.5, 5], [30.5, 6], [33.5, 7], [40, 8], [45, 9], [48, 10], [51.5, 11], [58, 12], [64, 13]];
  function SStackMain({ t }) {
    const SX = 1120, sp = (i) => 859 - i * 62;
    const slot = (i) => [950 + i * 170, 330];
    const OBJ = [1632, 300], STR = [1632, 470];
    const [hl, hA] = hlAt2(t, MSTEPS);
    const ready = t >= 15.6;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 190, w: 700, h: 740, title: "main \xB7 javap -c", lang: "bytecode", a: E2(t, 0.4), fs: 20, lh: 46, hl, hlA: hA, lines: MAIN }), /* @__PURE__ */ React.createElement(Panel2, { x: 840, y: 190, w: 560, h: 740, title: "frame \xB7 main", tone: "flow", a: E2(t, 1) }), ["args", "c", "r"].map((n, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: n }, /* @__PURE__ */ React.createElement(Txt2, { x: slot(i)[0], y: 244, anchor: "mid", mono: true, fs: 16, color: PAL2.ink3, a: E2(t, 1.4) }, "slot ", i), /* @__PURE__ */ React.createElement(Box2, { x: slot(i)[0] - 75, y: 290, w: 150, h: 80, sub: n, label: i === 0 ? "String[]" : "", tone: i === 0 ? "ink" : "flow", a: E2(t, 1.4), fs: 18 }))), /* @__PURE__ */ React.createElement(Panel2, { x: 900, y: 420, w: 440, h: 490, title: "operand stack", tone: "pull", a: E2(t, 1.6) }), /* @__PURE__ */ React.createElement(Badge2, { x: SX, y: 396, text: "add(2, 3) runs in its own frame \u2192 5", tone: "pull", a: win2(t, 34.2, 39.6), fs: 17 }), /* @__PURE__ */ React.createElement(Panel2, { x: 1440, y: 190, w: 384, h: 420, title: "heap", a: E2(t, 3.5) }), /* @__PURE__ */ React.createElement(Box2, { x: OBJ[0] - 160, y: OBJ[1] - 50, w: 320, h: 100, label: "Calc object", sub: ready ? "constructed" : "uninitialised", tone: ready ? "flow" : "dim", dashed: !ready, a: POP2(t, 4.4), glow: pulse2(t, [15.6], 1.2) }), /* @__PURE__ */ React.createElement(Box2, { x: STR[0] - 160, y: STR[1] - 50, w: 320, h: 100, label: '"r = 5"', sub: "String", tone: "pink", a: POP2(t, 54), glow: pulse2(t, [54], 1.2) }), /* @__PURE__ */ React.createElement(Console2, { x: 1440, y: 640, w: 384, h: 290, t, title: "console", a: E2(t, 3.5), items: [{ at: 60, text: "r = 5", kind: "ok" }], fs: 26, lh: 40 }), /* @__PURE__ */ React.createElement(Tok, { t, text: "\u2192 Calc", keys: [[4.6, OBJ[0], OBJ[1]], [5.6, SX, sp(0)], [21.2, SX, sp(0)], [22.2, ...slot(1)]], wKeys: [[21.2, 260], [22.2, 136]], tone: "flow" }), /* @__PURE__ */ React.createElement(Tok, { t, text: "\u2192 Calc", keys: [[9.7, SX, sp(0)], [10.6, SX, sp(1)], [15.2, SX, sp(1)], [16.1, OBJ[0] - 160, OBJ[1]]], until: 15.9, w: 260, tone: "flow" }), /* @__PURE__ */ React.createElement(Tok, { t, text: "\u2192 Calc", keys: [[26.7, ...slot(1)], [27.6, SX, sp(0)], [33.7, SX, sp(0)], [34.5, SX, 400]], until: 34.3, tone: "flow" }), /* @__PURE__ */ React.createElement(Tok, { t, text: "2", keys: [[28.6, SX, sp(1) - 40], [29.1, SX, sp(1)], [33.7, SX, sp(1)], [34.5, SX, 400]], until: 34.3, tone: "violet" }), /* @__PURE__ */ React.createElement(Tok, { t, text: "3", keys: [[30.6, SX, sp(2) - 40], [31.1, SX, sp(2)], [33.7, SX, sp(2)], [34.5, SX, 400]], until: 34.3, tone: "violet" }), /* @__PURE__ */ React.createElement(Tok, { t, text: "5", keys: [[37.6, SX, 400], [38.4, SX, sp(0)], [40.2, SX, sp(0)], [41.2, ...slot(2)]], glowAt: 38.4, tone: "pull", wKeys: [[40.2, 260], [41.2, 136]] }), /* @__PURE__ */ React.createElement(Tok, { t, text: "System.out", keys: [[45.2, SX, sp(0) - 40], [45.8, SX, sp(0)], [58.2, SX, sp(0)], [59.2, 1632, 760]], until: 59, tone: "blue" }), /* @__PURE__ */ React.createElement(Tok, { t, text: "5", keys: [[48.2, ...slot(2)], [49.1, SX, sp(1)], [51.7, SX, sp(1)], [52.8, STR[0], STR[1]]], until: 52.6, tone: "pull" }), /* @__PURE__ */ React.createElement(Tok, { t, text: '\u2192 "r = 5"', keys: [[54.4, STR[0], STR[1]], [55.4, SX, sp(1)], [58.2, SX, sp(1)], [59.2, 1632, 760]], until: 59, tone: "pink" }), /* @__PURE__ */ React.createElement(Arrow2, { from: [slot(1)[0], 288], to: [OBJ[0] - 164, OBJ[1] - 20], curve: -70, draw: M2(t, 22.4, 0.7), color: PAL2.flow }), /* @__PURE__ */ React.createElement(Txt2, { x: SX, y: sp(0) - 12, anchor: "mid", mono: true, fs: 17, color: PAL2.ink3, a: win2(t, 1.8, 4.4) + win2(t, 22.4, 26.8) + win2(t, 59.4, 64.2) }, "empty"), /* @__PURE__ */ React.createElement(Callout2, { x: 922, y: 560, w: 396, tone: "pull", a: E2(t, 64.5), fs: 20, text: "3 lines of Java \u2192 **14 instructions**, 28 bytes. The frame is popped and `main` returns." }));
  }
  var INV = [
    ["invokestatic", "static methods", "Integer.valueOf(5)", "fixed target", "flow", 4],
    ["invokespecial", "constructors \xB7 private \xB7 super.x()", "new Calc() \u2192 <init>", "fixed target", "flow", 9.5],
    ["invokevirtual", "normal instance methods", "c.add(2, 3)", "target = receiver's class", "pull", 16],
    ["invokeinterface", "calls through an interface", "list.iterator()", "target = receiver's class", "pull", 22.5],
    ["invokedynamic", "lambdas \xB7 string + \xB7 records", '"r = " + r', "target chosen by code", "violet", 28.5]
  ];
  function SInvokes({ t }) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, INV.map(([op, use, ex, how, tone, at], i) => {
      const a = E2(t, at);
      const x = 96 + i * 350;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: op }, /* @__PURE__ */ React.createElement(Panel2, { x, y: 210, w: 334, h: 400, a, tone, glow: win2(t, at, at + 6) * 0.7 }), /* @__PURE__ */ React.createElement(Txt2, { x: x + 22, y: 236, mono: true, fs: 22, weight: 700, color: toneColor2(tone), a }, op), /* @__PURE__ */ React.createElement(Txt2, { x: x + 22, y: 290, fs: 22, w: 290, color: PAL2.ink, a }, use), /* @__PURE__ */ React.createElement(Txt2, { x: x + 22, y: 410, mono: true, fs: 16, color: PAL2.ink3, a }, "EXAMPLE"), /* @__PURE__ */ React.createElement(Txt2, { x: x + 22, y: 438, mono: true, fs: 19, color: PAL2.ink2, w: 290, a }, ex), /* @__PURE__ */ React.createElement(Txt2, { x: x + 22, y: 540, fs: 19, w: 290, color: toneColor2(tone), a }, how));
    }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 120, top: 700, width: 1680, height: 10, borderRadius: 5, opacity: E2(t, 35.5), background: `linear-gradient(90deg, ${PAL2.flow}, ${PAL2.pull} 55%, ${PAL2.violet})` } }), /* @__PURE__ */ React.createElement(Txt2, { x: 120, y: 730, mono: true, fs: 20, color: PAL2.flow, a: E2(t, 35.8) }, "decided at compile time"), /* @__PURE__ */ React.createElement(Txt2, { x: 960, y: 730, anchor: "mid", mono: true, fs: 20, color: PAL2.pull, a: E2(t, 36.3) }, "decided by the object's class"), /* @__PURE__ */ React.createElement(Txt2, { x: 1800, y: 730, anchor: "right", mono: true, fs: 20, color: PAL2.violet, a: E2(t, 36.8) }, "decided by a bootstrap method"));
  }
  function SVTable({ t }) {
    const vt = (name, rows, x, at, marks) => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt2, { x, y: 300, mono: true, fs: 19, weight: 600, color: PAL2.ink, a: E2(t, at) }, name, " ", /* @__PURE__ */ React.createElement("span", { style: { color: PAL2.ink3, fontWeight: 400 } }, "\xB7 klass \xB7 vtable")), /* @__PURE__ */ React.createElement(Table2, { x, y: 336, cols: [80, 250], head: ["slot", "method"], rows, a: E2(t, at + 0.2), fs: 18, rh: 46, marks, colColors: [PAL2.pull, PAL2.ink] }));
    const AX = 1130, DX = 1484;
    const dogRow5 = [DX + 330, 336 + 42 + 1 * 46 + 23];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 190, w: 640, h: 330, title: "Animals.java", a: E2(t, 0.5), fs: 21, lh: 36, lines: [
      "class Animal {",
      "    void speak() { \u2026 }",
      "    void eat()   { \u2026 }",
      "}",
      "class Dog extends Animal {",
      "    void speak() { \u2026 }  // override",
      "}"
    ].map((s, i) => ({ s, tone: i === 5 ? "pull" : void 0, toneA: win2(t, 5, 24) })) }), /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 550, w: 640, h: 160, title: "caller", a: E2(t, 24), fs: 21, lh: 38, hl: 1, hlA: win2(t, 24.5, 41), lines: ["Animal a = new Dog();", "a.speak();  // invokevirtual Animal.speak"] }), /* @__PURE__ */ React.createElement(Panel2, { x: 1110, y: 200, w: 714, h: 600, title: "metaspace", tone: "violet", a: E2(t, 11) }), vt("Animal", [["0\u20134", "Object methods"], ["5", "speak \u2192 Animal.speak"], ["6", "eat \u2192 Animal.eat"]], AX, 11.5, { 1: ["pull", win2(t, 16.5, 24)] }), vt("Dog", [["0\u20134", "Object methods"], ["5", "speak \u2192 Dog.speak"], ["6", "eat \u2192 Animal.eat"]], DX, 14, { 1: ["pull", Math.max(win2(t, 16.5, 24), win2(t, 35.5, 47))], 2: ["ink", win2(t, 16.5, 24)] }), /* @__PURE__ */ React.createElement(Box2, { x: AX, y: 690, w: 330, h: 70, label: "Animal.speak()", fs: 20, a: E2(t, 12) }), /* @__PURE__ */ React.createElement(Box2, { x: DX, y: 690, w: 330, h: 70, label: "Dog.speak()", fs: 20, tone: "flow", a: E2(t, 14.5), glow: pulse2(t, [38], 1.6) }), /* @__PURE__ */ React.createElement(Badge2, { x: 1472, y: 600, text: "same slot in parent and child", tone: "pull", a: win2(t, 17, 24), fs: 17 }), /* @__PURE__ */ React.createElement(Badge2, { x: 928, y: 360, text: "resolved once: speak = slot 5", tone: "pull", a: win2(t, 25, 46), fs: 17 }), /* @__PURE__ */ React.createElement(Node2, { x: 790, y: 560, w: 280, h: 150, kind: "heap", name: "Dog object", rows: [["mark word", "\u2026"], ["klass", "\u2192 Dog", PAL2.flow, win2(t, 30, 36)]], a: E2(t, 24.5), glow: pulse2(t, [30], 1.2), tone: "flow" }), /* @__PURE__ */ React.createElement(Arrow2, { from: [742, 663], to: [788, 640], curve: -6, draw: M2(t, 30, 0.6), color: PAL2.pull }), /* @__PURE__ */ React.createElement(Arrow2, { pts: [[1072, 640], [1472, 640], [1472, 312], [DX - 4, 312]], draw: M2(t, 31.6, 0.9), color: PAL2.flow }), /* @__PURE__ */ React.createElement(Arrow2, { from: [dogRow5[0] - 6, dogRow5[1]], to: [DX + 250, 688], curve: -50, draw: M2(t, 36.2, 0.8), color: PAL2.pull }), /* @__PURE__ */ React.createElement(Callout2, { x: 96, y: 760, w: 980, tone: "flow", a: win2(t, 41.5, 47.3), fs: 21, text: "One memory load (the klass), one indexed load (the slot), one jump. Whatever the declared type." }), /* @__PURE__ */ React.createElement(Callout2, { x: 96, y: 760, w: 980, tone: "violet", a: E2(t, 47.5), fs: 20, title: "invokeinterface", text: "A class can implement many interfaces, so there's no fixed slot. The JVM first searches the class's **itable** for that interface, then indexes into it." }), /* @__PURE__ */ React.createElement(Badge2, { x: 1472, y: 860, text: "hot code: the JIT's inline caches skip both \u2192 8.8", tone: "pull", a: E2(t, 55), fs: 17 }));
  }
  function SIndy({ t }) {
    const linked = t >= 26.5;
    const execs = t < 26.5 ? t >= 8.5 ? 1 : 0 : 1 + Math.floor(lin2(t, 27, 6) * 9999);
    const fast = (k) => {
      const s = 27.5 + k * 1.1;
      const p = M2(t, s, 0.6);
      return p > 0 && p < 1 ? /* @__PURE__ */ React.createElement(Dot2, { key: k, x: lerp2(1310, 1460, p), y: 530, color: PAL2.flow, r: 8 }) : null;
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 190, w: 800, h: 150, title: "Calc.main", a: E2(t, 0.5), fs: 20, lh: 36, lines: ['System.out.println("r = " + r);', { s: "19: invokedynamic #20, 0   // makeConcatWithConstants", lang: "bytecode" }] }), /* @__PURE__ */ React.createElement(Panel2, { x: 96, y: 370, w: 800, h: 210, title: "BootstrapMethods attribute (in Calc.class)", a: E2(t, 4.5), tone: "violet" }, /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 22px", font: `500 20px ${MONO2}`, color: PAL2.ink2, lineHeight: 1.65 } }, /* @__PURE__ */ React.createElement("div", null, "0: ", /* @__PURE__ */ React.createElement("span", { style: { color: PAL2.violet } }, "REF_invokeStatic")), /* @__PURE__ */ React.createElement("div", { style: { color: PAL2.ink } }, "   StringConcatFactory.makeConcatWithConstants"), /* @__PURE__ */ React.createElement("div", null, "   recipe: ", /* @__PURE__ */ React.createElement("span", { style: { color: PAL2.str } }, '"r = \\u0001"'), "  ", /* @__PURE__ */ React.createElement("span", { style: { color: PAL2.ink3 } }, "// \\u0001 = where r goes")))), /* @__PURE__ */ React.createElement(Box2, { x: 1e3, y: 210, w: 300, h: 110, label: "call site #20", sub: linked ? "linked" : t >= 8.5 ? "unlinked \xB7 no target" : "", tone: linked ? "flow" : "dim", dashed: !linked, a: E2(t, 8.5), glow: pulse2(t, [26.5], 1.4) }), /* @__PURE__ */ React.createElement(Arrow2, { from: [1300, 265], to: [1460, 265], draw: M2(t, 13, 0.6), color: PAL2.violet, label: "1st time only", lx: 1380, ly: 248, lfs: 17 }), /* @__PURE__ */ React.createElement(Box2, { x: 1464, y: 210, w: 360, h: 110, label: "bootstrap method", sub: "StringConcatFactory", tone: "violet", a: E2(t, 13.2), glow: win2(t, 13.5, 20) * 0.8 }), /* @__PURE__ */ React.createElement(VArrow2, { x: 1644, y1: 322, y2: 470, a: E2(t, 20), color: PAL2.violet, label: "returns", lfs: 17 }), /* @__PURE__ */ React.createElement(Box2, { x: 1464, y: 474, w: 360, h: 110, label: "CallSite", sub: "\u2192 MethodHandle (target)", tone: "flow", a: E2(t, 20.4), glow: pulse2(t, [20.5], 1.2) }), /* @__PURE__ */ React.createElement(Arrow2, { pts: [[1150, 322], [1150, 530], [1460, 530]], draw: M2(t, 26.5, 0.8), color: PAL2.flow, width: 3 }), [0, 1, 2, 3, 4].map(fast), /* @__PURE__ */ React.createElement(Txt2, { x: 1176, y: 360, mono: true, fs: 19, color: PAL2.ink2, a: E2(t, 9) }, "executions: ", /* @__PURE__ */ React.createElement("span", { style: { color: PAL2.ink } }, execs.toLocaleString("en-US"))), /* @__PURE__ */ React.createElement(Txt2, { x: 1176, y: 392, mono: true, fs: 19, color: PAL2.ink2, a: E2(t, 14) }, "bootstrap calls: ", /* @__PURE__ */ React.createElement("span", { style: { color: PAL2.violet } }, "1")), /* @__PURE__ */ React.createElement(Txt2, { x: 96, y: 632, mono: true, fs: 18, color: PAL2.ink3, a: E2(t, 33) }, "LAMBDAS \xB7 SAME MECHANISM"), [["invokedynamic", "returns a Runnable", "violet"], ["LambdaMetafactory", "the bootstrap", "violet"], ["hidden class", "implements Runnable", "pull"], ["lambda$new$0()", "your lambda body", "flow"]].map(([l, s, tone], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: l }, /* @__PURE__ */ React.createElement(Box2, { x: 96 + i * 440, y: 670, w: 380, h: 96, label: l, sub: s, tone, a: E2(t, 33.4 + i * 0.9), fs: 21 }), i > 0 && /* @__PURE__ */ React.createElement(HArrow2, { x1: 96 + i * 440 - 58, x2: 96 + i * 440 - 4, y: 718, a: E2(t, 33.4 + i * 0.9), color: PAL2.ink2 }))), /* @__PURE__ */ React.createElement(Callout2, { x: 96, y: 800, w: 1728, tone: "pull", a: win2(t, 41, 46.3), fs: 21, text: "The payoff: the **strategy lives in the JDK**, not in your class file. A newer JDK can link the same call site to better code." }), /* @__PURE__ */ React.createElement(Callout2, { x: 96, y: 800, w: 1728, tone: "flow", a: E2(t, 46.5), fs: 21, title: "java 9 \xB7 JEP 280", text: "String `+` moved from `StringBuilder` bytecode to `invokedynamic`. Anything compiled with javac 9+ gets each JDK's improvements **without recompiling**." }));
  }

  // src/topics/8.1/scenes3.jsx
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
    fmt,
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
    Bytes: Bytes3,
    toneColor: toneColor3
  } = window.AN;
  var E3 = MOTION3.enter;
  var M3 = MOTION3.move;
  var POP3 = MOTION3.pop;
  var SUGAR = [
    [4, "for (String n : names) { \u2026 }", "it = names.iterator(); while (it.hasNext()) n = (String) it.next();"],
    [11, "for (int x : arr) { \u2026 }", "for (int i = 0; i < arr.length; i++) x = arr[i];"],
    [16, "Integer i = 5;   int x = i;", "Integer.valueOf(5)        \xB7        i.intValue()"],
    [22, '"r = " + r', 'invokedynamic makeConcatWithConstants  "r = \\u0001"'],
    [27.5, "Runnable job = () -> work();", "invokedynamic run()  +  private static void lambda$new$0()"],
    [33.5, "enum Color { RED, GREEN }", "final class Color extends Enum<Color> + static Color[] $VALUES"],
    [39.5, "record Point(int x, int y) {}", "final class Point extends Record + indy equals/hashCode/toString"],
    [46.5, "String s = list.get(0);", "String s = (String) list.get(0);   // get returns Object"]
  ];
  function SDesugar({ t }) {
    const cur = SUGAR.filter((s) => t >= s[0]).length - 1;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt3, { x: 96, y: 186, mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 1) }, "YOU WRITE"), /* @__PURE__ */ React.createElement(Txt3, { x: 900, y: 186, mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 1) }, "JAVAC EMITS (as Java-ish pseudocode)"), SUGAR.map(([at, l, r], i) => {
      const a = E3(t, at), y = 218 + i * 86;
      const focus = i === cur && t < 52 ? 1 : 0;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 96, top: y, width: 740, height: 70, boxSizing: "border-box", borderRadius: 12, opacity: a, background: PAL3.panel2, border: `2px solid ${focus ? PAL3.pull : PAL3.line2}`, display: "flex", alignItems: "center", padding: "0 20px", font: `500 20px ${MONO3}`, whiteSpace: "pre" } }, window.AN.hiJava(l)), /* @__PURE__ */ React.createElement(HArrow3, { x1: 846, x2: 890, y: y + 35, a: E3(t, at + 0.5), color: focus ? PAL3.pull : PAL3.ink3 }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 900, top: y, width: 924, height: 70, boxSizing: "border-box", borderRadius: 12, opacity: E3(t, at + 0.7), transform: `translateX(${(1 - E3(t, at + 0.7)) * 20}px)`, background: hexA3(PAL3.flow, focus ? 0.12 : 0.05), border: `2px solid ${focus ? PAL3.flow : hexA3(PAL3.flow, 0.3)}`, display: "flex", alignItems: "center", padding: "0 20px", font: `500 18px ${MONO3}`, whiteSpace: "pre", overflow: "hidden" } }, window.AN.hiJava(r)));
    }));
  }
  var SW = [
    " 4: aload_1; invokevirtual hashCode",
    " 8: lookupswitch { 97: 36, 98: 50, default: 61 }",
    '36: aload_1; ldc "a"; invokevirtual equals',
    "42: ifeq 61; iconst_0; istore_2",
    '50: aload_1; ldc "b"; invokevirtual equals',
    "56: ifeq 61; iconst_1; istore_2",
    "61: iload_2",
    "62: lookupswitch { 0: 88, 1: 92, default: 96 }",
    "88: iconst_1 \u2192 ireturn",
    "92: iconst_2 \u2192 ireturn",
    "96: iconst_0 \u2192 ireturn"
  ];
  function SStringSwitch({ t }) {
    const [hl, hA] = hlAt3(t, [[5, 0], [10.5, 1], [17.5, 4], [24, 5], [29, 7], [31.5, 9]]);
    const X = 940;
    const tbl = (y, rows, litIdx, at, title) => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt3, { x: X, y: y - 30, mono: true, fs: 17, color: PAL3.ink3, a: E3(t, at) }, title), rows.map(([k, v], i) => /* @__PURE__ */ React.createElement(Box3, { key: i, x: X + i * 200, y, w: 184, h: 72, label: k, sub: "\u2192 " + v, fs: 22, sfs: 17, tone: i === litIdx && t > at + 1.2 ? "pull" : "ink", a: E3(t, at + i * 0.2), glow: i === litIdx ? win3(t, at + 1.2, at + 6) : 0 })));
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 190, w: 780, h: 134, title: "Sugar.java", a: E3(t, 0.5), fs: 19, lh: 34, lines: ["int r = switch (s) {", '    case "a" -> 1;  case "b" -> 2;  default -> 0; };'] }), /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 340, w: 780, h: 580, title: "javap -c (condensed)", lang: "bytecode", a: E3(t, 2), fs: 19, lh: 46, hl, hlA: hA, lines: SW }), /* @__PURE__ */ React.createElement(Box3, { x: X, y: 196, w: 260, h: 80, label: 's = "b"', tone: "pull", a: E3(t, 1), fs: 26 }), /* @__PURE__ */ React.createElement(Box3, { x: X + 300, y: 196, w: 584, h: 80, label: "s.hashCode() = 98", sub: "'b' is char 98", tone: "flow", a: E3(t, 5.2), fs: 24, glow: pulse3(t, [5.4], 1.2) }), tbl(350, [["97", 'case "a"'], ["98", 'case "b"'], ["default", "none"]], 1, 10.5, "STEP 1 \xB7 LOOKUPSWITCH ON THE HASH"), /* @__PURE__ */ React.createElement(Box3, { x: X, y: 466, w: 884, h: 80, label: '"b".equals("b") \u2192 true \xB7 index = 1', tone: "flow", a: E3(t, 17.5), fs: 22, glow: pulse3(t, [24], 1.2) }), /* @__PURE__ */ React.createElement(Callout3, { x: X, y: 566, w: 884, tone: "bad", a: E3(t, 16.5), fs: 19, title: "why equals too?", text: 'Hashes collide: `"Aa".hashCode()` and `"BB".hashCode()` are both **2112**.' }), tbl(736, [["0", "return 1"], ["1", "return 2"], ["default", "return 0"]], 1, 29, "STEP 2 \xB7 SWITCH ON THE INDEX"), /* @__PURE__ */ React.createElement(Badge3, { x: X + 760, y: 846, text: "result: 2", tone: "pull", a: POP3(t, 31.8), fs: 22, solid: true }), /* @__PURE__ */ React.createElement(Badge3, { x: X + 280, y: 866, text: "2 lines of source \xB7 ~30 instructions", tone: "ink", a: E3(t, 35.5), fs: 17 }));
  }
  function SErasure({ t }) {
    const [hl, hA] = hlAt3(t, [[29.5, 1]]);
    const gone = M3(t, 12.5, 1.2);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 190, w: 860, h: 170, title: "Erase.java", a: E3(t, 0.5), fs: 21, lh: 36, lines: ["List<String> f(List<Integer> in) {", "    return new ArrayList<>();", "}"] }), /* @__PURE__ */ React.createElement(Console3, { x: 1e3, y: 190, w: 824, h: 160, t, a: E3(t, 4.5), fs: 17, lh: 28, items: [
      { at: 5, text: "javap -s Erase.class", kind: "cmd" },
      { at: 5.6, text: "java.util.List<java.lang.String> f(java.util.List<java.lang.Integer>);" },
      { at: 6.2, text: "  descriptor: (Ljava/util/List;)Ljava/util/List;", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 0, right: 0, top: 410, textAlign: "center", opacity: E3(t, 10), font: `600 46px ${MONO3}`, color: PAL3.ink } }, "(Ljava/util/List", /* @__PURE__ */ React.createElement("span", { style: { display: "inline-block", color: PAL3.bad, textDecoration: "line-through", maxWidth: (1 - gone) * 300, overflow: "hidden", verticalAlign: "bottom", opacity: 1 - gone } }, "<Integer>"), ";)Ljava/util/List", /* @__PURE__ */ React.createElement("span", { style: { display: "inline-block", color: PAL3.bad, textDecoration: "line-through", maxWidth: (1 - gone) * 300, overflow: "hidden", verticalAlign: "bottom", opacity: 1 - gone } }, "<String>"), ";"), /* @__PURE__ */ React.createElement(Txt3, { x: 960, y: 480, anchor: "mid", fs: 22, color: PAL3.bad, a: E3(t, 11.5) }, "the descriptor the JVM uses has no type arguments"), /* @__PURE__ */ React.createElement(Panel3, { x: 96, y: 540, w: 1728, h: 130, title: "Signature attribute  (javap -v)", tone: "violet", a: E3(t, 17.5) }, /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 22px", font: `500 19px ${MONO3}`, color: PAL3.ink } }, "(Ljava/util/List<Ljava/lang/Integer;>;)Ljava/util/List<Ljava/lang/String;>;")), /* @__PURE__ */ React.createElement(Badge3, { x: 1530, y: 644, text: "read by javac + reflection \u2713", tone: "flow", a: E3(t, 19), fs: 17 }), /* @__PURE__ */ React.createElement(Badge3, { x: 1180, y: 644, text: "ignored when executing \u2717", tone: "bad", a: E3(t, 20), fs: 17 }), /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 710, w: 860, h: 150, title: "a caller", a: E3(t, 25), fs: 21, lh: 36, lines: ['List<String> names = List.of("Ana");', "String s = names.get(0);"] }), /* @__PURE__ */ React.createElement(Code3, { x: 1e3, y: 710, w: 824, h: 150, title: "javap -c", lang: "bytecode", a: E3(t, 26), fs: 19, lh: 36, hl, hlA: hA, lines: ["invokeinterface List.get:(I)Ljava/lang/Object;", "checkcast     java/lang/String   // inserted"] }), /* @__PURE__ */ React.createElement(Badge3, { x: 960, y: 900, text: "erasure = Object everywhere + casts the compiler wrote for you", tone: "pull", a: E3(t, 36.5), fs: 18 }));
  }
  function SLambdas({ t }) {
    const [hl, hA] = hlAt3(t, [[15.5, 3], [22, 1]]);
    const file = (x, y, name, at, tone, ghost) => /* @__PURE__ */ React.createElement(Box3, { x, y, w: 250, h: 70, label: name, fs: 20, tone: ghost ? "bad" : tone, dashed: ghost, strike: ghost, a: E3(t, at) });
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt3, { x: 96, y: 186, mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 0.5) }, "ANONYMOUS CLASS"), /* @__PURE__ */ React.createElement(Txt3, { x: 984, y: 186, mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 0.5) }, "LAMBDA"), /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 216, w: 840, h: 210, title: "Anon.java", a: E3(t, 0.8), fs: 18, lh: 30, lines: ["public class Anon {", "  Runnable r = new Runnable() {", '    public void run() { System.out.println("hi"); }', "  };", "}"] }), /* @__PURE__ */ React.createElement(Code3, { x: 984, y: 216, w: 840, h: 210, title: "Lam.java", a: E3(t, 1.2), fs: 18, lh: 30, lines: ["public class Lam {", '  Runnable r = () -> System.out.println("hi");', "}"] }), /* @__PURE__ */ React.createElement(Txt3, { x: 96, y: 448, mono: true, fs: 17, color: PAL3.ink2, a: E3(t, 4.5) }, "$ javac Anon.java && ls"), file(96, 482, "Anon.class", 4.8, "flow"), file(366, 482, "Anon$1.class", 5.4, "pull"), /* @__PURE__ */ React.createElement(Badge3, { x: 796, y: 517, text: "+1 file per anonymous class", tone: "pull", a: E3(t, 6), fs: 17 }), /* @__PURE__ */ React.createElement(Txt3, { x: 984, y: 448, mono: true, fs: 17, color: PAL3.ink2, a: E3(t, 10) }, "$ javac Lam.java && ls"), file(984, 482, "Lam.class", 10.3, "flow"), file(1254, 482, "Lam$1.class", 11, "flow", true), /* @__PURE__ */ React.createElement(Code3, { x: 984, y: 590, w: 840, h: 320, title: "javap -c -p Lam.class", lang: "bytecode", a: E3(t, 15), fs: 18, lh: 36, hl, hlA: hA, lines: [
      "Lam():",
      "   5: invokedynamic #7, 0   // run:()Runnable",
      "  10: putfield      #11      // r",
      "private static void lambda$new$0():",
      "   0: getstatic     System.out",
      '   3: ldc           "hi"',
      "   5: invokevirtual println"
    ] }), /* @__PURE__ */ React.createElement(Callout3, { x: 96, y: 600, w: 840, tone: "violet", a: win3(t, 29, 36.3), fs: 20, title: "where's the class?", text: "Generated at runtime, on first use, by `LambdaMetafactory`: a hidden class in memory. Nothing on disk." }), /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 600, w: 840, h: 150, title: "Integer i = 5;  \u2192 javap -c", lang: "bytecode", a: E3(t, 36.5), fs: 19, lh: 36, lines: ["0: iconst_5", "1: invokestatic  Integer.valueOf:(I)Ljava/lang/Integer;"], hl: 1, hlA: E3(t, 37.5) }), /* @__PURE__ */ React.createElement(Txt3, { x: 96, y: 770, fs: 20, color: PAL3.ink2, w: 840, a: E3(t, 38.5) }, "Autoboxing, made visible: it's an ordinary static method call."));
  }
  function SClassFileApi({ t }) {
    const rel = [17, 18, 19, 20, 21, 22, 23, 24, 25];
    const x = (i) => 200 + i * 190;
    const cur = Math.floor(clamp3((t - 9.5) / 0.75, -1, 8));
    const fws = ["Spring", "Hibernate", "Mockito", "JaCoCo"];
    const broken = t > 9.5 && t < 16 && (t - 9.5) % 0.75 < 0.45;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, fws.map((f, i) => /* @__PURE__ */ React.createElement(Box3, { key: f, x: 200 + i * 300, y: 210, w: 270, h: 90, label: f, sub: t > 16.5 ? "java.lang.classfile" : "bundles ASM", tone: t > 16.5 ? "flow" : broken ? "bad" : "ink", a: E3(t, 0.6 + i * 0.3), glow: broken ? 0.6 : 0 })), /* @__PURE__ */ React.createElement(Badge3, { x: 1530, y: 255, text: t > 16.5 ? "always current" : "ASM must catch up", tone: t > 16.5 ? "flow" : "bad", a: E3(t, 5.5), fs: 17 }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 170, top: 440, width: 1580, height: 4, background: PAL3.line2, opacity: E3(t, 8) } }), rel.map((r, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: r }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x(i) - 12, top: 430, width: 24, height: 24, borderRadius: 12, background: i <= cur ? r === 24 && t > 16 ? PAL3.flow : PAL3.pull : PAL3.panel2, border: `2px solid ${PAL3.line2}`, opacity: E3(t, 8 + i * 0.05) } }), /* @__PURE__ */ React.createElement(Txt3, { x: x(i), y: 380, anchor: "mid", mono: true, fs: 20, weight: 600, color: PAL3.ink, a: E3(t, 8 + i * 0.05) }, "JDK ", r), /* @__PURE__ */ React.createElement(Txt3, { x: x(i), y: 470, anchor: "mid", mono: true, fs: 16, color: PAL3.ink3, a: E3(t, 8 + i * 0.05) }, "v", r + 44))), /* @__PURE__ */ React.createElement(Badge3, { x: x(7), y: 530, text: "Class-File API final \xB7 JEP 484", tone: "flow", a: POP3(t, 16), fs: 18, solid: true }), /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 620, w: 1100, h: 210, title: "ReadIt.java", a: E3(t, 18), fs: 19, lh: 36, lines: ['ClassModel cm = ClassFile.of().parse(Path.of("Calc.class"));', "for (MethodModel m : cm.methods())", '    System.out.println(m.methodName() + " " + m.methodType());'] }), /* @__PURE__ */ React.createElement(Console3, { x: 1240, y: 620, w: 584, h: 210, t, a: E3(t, 19), fs: 20, items: [{ at: 20, text: "<init> ()V" }, { at: 20.4, text: "add (II)I" }, { at: 20.8, text: "main ([Ljava/lang/String;)V" }] }));
  }
  var TRAPS = [
    [3.5, "\u201CUnsupportedClassVersionError means a class is missing\u201D", "It's a **version** mismatch: a newer class file on an older JVM."],
    [10, "\u201CGenerics are in the bytecode\u201D", "Only in a `Signature` attribute. Execution uses the erased descriptor."],
    [16.5, "\u201CEvery lambda makes a class file\u201D", "`invokedynamic` spins its class up at runtime. No `$1.class`."],
    [23, "\u201CBytecode is what runs\u201D", "Only at first. Hot methods are compiled to machine code by the JIT (8.8)."]
  ];
  function STraps({ t }) {
    return TRAPS.map(([at, myth, real], i) => {
      const y = 200 + i * 172;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, /* @__PURE__ */ React.createElement(Box3, { x: 96, y, w: 760, h: 140, label: myth, mono: false, fs: 23, tone: "bad", a: E3(t, at), strike: t > at + 2, style: { whiteSpace: "normal" } }), /* @__PURE__ */ React.createElement(HArrow3, { x1: 870, x2: 940, y: y + 70, a: E3(t, at + 1.5), color: PAL3.flow }), /* @__PURE__ */ React.createElement(Card3, { x: 956, y, w: 868, h: 140, a: E3(t, at + 1.6), tone: "flow", title: real, tfs: 24 }));
    });
  }
  var RECAP = [
    [3, "1", "Two compilers", "`javac` once to bytecode; the JIT compiles hot code at runtime."],
    [9, "2", "The class file", "`CAFEBABE`, a version, a constant pool, then fields, methods, attributes."],
    [12, "3", "Constant pool", "Every name and literal, stored once, referenced as `#n`."],
    [15, "4", "Stack machine", "Local slots + an operand stack. Typed opcodes: `iload`, `aload`, `iadd`."],
    [21, "5", "Five invokes", "`static`, `special`, `virtual`, `interface`, **`dynamic`**."],
    [26.5, "6", "javap", "`javap -c -p -v` shows you all of it. Use it."]
  ];
  function SRecap({ t }) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, RECAP.map(([at, n, title, sub], i) => /* @__PURE__ */ React.createElement(Card3, { key: n, x: 96 + i % 3 * 584, y: 210 + Math.floor(i / 3) * 290, w: 560, h: 260, num: n, title, sub, tfs: 36, sfs: 25, a: E3(t, at), tone: i === 5 ? "pull" : void 0, glow: i === 5 ? win3(t, 27, 40) : 0 })));
  }

  // src/topics/8.1.jsx
  var chapters = ["Intro", "Two compilers", "The class file", "Constant pool", "javap", "Stack machine", "Invoking methods", "Desugaring", "Verify it yourself", "Class-File API", "Traps", "Recap"];
  var scenes = [
    { name: "Intro", dur: 22, ch: 0, title: "", C: SIntro },
    { name: "TwoCompilers", dur: 48, ch: 1, title: "Java is compiled twice", C: STwoCompilers },
    { name: "HexDump", dur: 52, ch: 2, title: "Inside Calc.class, byte by byte", C: SHexDump },
    { name: "Versions", dur: 40, ch: 2, title: "The version number decides who can run it", C: SVersions },
    { name: "Structure", dur: 32, ch: 2, title: "The shape of every class file", C: SStructure },
    { name: "PoolTable", dur: 56, ch: 3, title: "Names live in the constant pool", C: SPoolTable },
    { name: "Descriptors", dur: 44, ch: 3, title: "Descriptors: types in a few letters", C: SDescriptors },
    { name: "Resolution", dur: 38, ch: 3, title: "From symbolic to direct, once", C: SResolution },
    { name: "Javap", dur: 36, ch: 4, title: "javap: see what the compiler did", C: SJavap },
    { name: "StackAdd", dur: 58, ch: 5, title: "A stack machine, no registers", C: SStackAdd },
    { name: "Prefixes", dur: 38, ch: 5, title: "The first letter is the type", C: SPrefixes },
    { name: "StackMain", dur: 72, ch: 5, title: "main(), one instruction at a time", C: SStackMain },
    { name: "Invokes", dur: 44, ch: 6, title: "Five ways to call a method", C: SInvokes },
    { name: "VTable", dur: 62, ch: 6, title: "invokevirtual: the vtable", C: SVTable },
    { name: "Indy", dur: 56, ch: 6, title: "invokedynamic: linked at runtime", C: SIndy },
    { name: "Desugar", dur: 58, ch: 7, title: "Syntax that vanishes", C: SDesugar },
    { name: "StringSwitch", dur: 44, ch: 7, title: "A switch on strings is two switches", C: SStringSwitch },
    { name: "Erasure", dur: 44, ch: 8, title: "See erasure for yourself", C: SErasure },
    { name: "Lambdas", dur: 44, ch: 8, title: "See lambdas for yourself", C: SLambdas },
    { name: "ClassFileApi", dur: 32, ch: 9, title: "The Class-File API \xB7 Java 24", C: SClassFileApi },
    { name: "Traps", dur: 32, ch: 10, title: "Traps", C: STraps },
    { name: "Recap", dur: 34, ch: 11, title: "Recap", C: SRecap }
  ];
  var captions = {
    Intro: [[0.8, "You write Java. The JVM never sees it."], [5.5, "`javac` turns your source into **bytecode**: a compact instruction set for a virtual machine."], [11.5, "This topic opens that class file: its bytes, its constant pool, the instructions inside."], [17, "One small class, `Calc`, carries us all the way through."]],
    TwoCompilers: [[0.5, "Java is compiled twice."], [3.5, "First by `javac`, once, ahead of time. It produces portable bytecode, not machine code."], [10, "Then by the JVM, continuously, while your program runs."], [14.5, "Every method starts in the **interpreter**: slow, but it starts instantly."], [20, "Called often enough, **C1** compiles it: quick to compile, and it gathers a profile."], [26.5, "Hotter still, **C2** recompiles it aggressively, using that profile."], [32.5, "If an assumption turns out false, the JVM **deoptimises**: back to the interpreter, re-profile, try again."], [39.5, "That's why a Java service starts slow and gets several times faster. This topic is the left half; 8.8 is the right."]],
    HexDump: [[0.5, "Compile the class, then dump its raw bytes."], [5, "Every class file starts with the same four bytes: `CAFEBABE`, the magic number."], [11, "Then the version: minor `0000`, major `003D`."], [15.5, "0x3D is 61: Java 17, the JDK on this machine. A Java 25 compiler writes 0x45, which is 69."], [22.5, "Next, `0033`: the constant pool count. 51 means 50 entries."], [28, "And the pool starts right away. `0A` is a tag meaning Methodref. It points to entries #2 and #3."], [35, "`07` is a Class entry pointing to #4. `0C` is a NameAndType: #5 and #6."], [41.5, "`01` is raw text: sixteen bytes spelling `java/lang/Object`."], [47, "Nothing here is magic. Just tags, indexes and text."]],
    Versions: [[0.5, "Each Java release bumps the major version."], [6, "Run a class file on an older JVM, and it refuses."], [12, "`UnsupportedClassVersionError`. It's not a missing class; it's a version mismatch."], [20, "The other way always works: a Java 8 class file runs on a Java 25 JVM."], [27, "Java runs older class files forever, never newer ones."], [32, "The fix: run a newer JVM, or compile with `--release 17` to target the older one."]],
    Structure: [[0.5, "After the header, every class file is the same fixed sequence of tables."], [4, "Access flags, this class, its superclass, interfaces, fields\u2026"], [10, "\u2026then methods. Each method carries a `Code` attribute: its bytecode."], [16, "It also records `max_stack` and `max_locals`: exactly how big this method's frame must be."], [23, "And the biggest section by far: the constant pool. Three quarters of this file. Let's open it."]],
    PoolTable: [[0.5, "Bytecode never spells out names. It says `#10`: an index into the constant pool."], [6, "Entry #10 is a Methodref, built from two other entries."], [11, "#7 is the class, which points to the text `Calc`."], [17, "#11 is a NameAndType, pointing to the name `add`\u2026"], [22, "\u2026and to the descriptor `(II)I`."], [27.5, "So `invokevirtual #10` means: call `Calc.add`, which takes two ints and returns an int."], [34.5, "Entries are shared. `<init>:()V` is stored once and used by two different constructor references."], [42, "Every class name, method name, string literal and type descriptor lives here, once."], [49, "That's why `javap` output is full of `#7`, `#10`, `#14`."]],
    Descriptors: [[0.5, "Descriptors are the JVM's compact spelling of types."], [4.5, "One letter per primitive. Watch two odd ones: `J` is long, `Z` is boolean."], [11.5, "`L\u2026;` wraps a class name. `[` means array of."], [17, "`(II)I`: two ints in, an int out. That's `add`."], [24, "`([Ljava/lang/String;)V`: an array of String in, nothing out. That's `main`."], [31, "`(JZ)[D`: a long and a boolean in, a double array out."], [37.5, "The return type is part of the descriptor. To the JVM, a method is its name plus its full descriptor."]],
    Resolution: [[0.5, "At runtime the constant pool becomes a lookup table that gets faster as it's used."], [4.5, "When the class loads, its pool becomes a runtime constant pool in metaspace."], [10.5, "The first time `invokevirtual #10` runs, #10 is still just text: a symbolic reference."], [16.5, "So the JVM resolves it: finds class `Calc`, loading it if needed, then `add` with that exact descriptor."], [24, "The result, a direct reference, is cached. In HotSpot, that cache sits beside the pool."], [30.5, "Every later call skips the lookup. Resolution happens lazily, once."]],
    Javap: [[0.5, "`javap` ships with every JDK. It shows you what the compiler actually produced."], [5, "Plain `javap` lists the non-private signatures."], [9.5, "`-p` adds private members."], [13.5, "`-c` disassembles: the bytecode of every method."], [18, "`-v` is verbose: constant pool, flags, stack sizes, attributes."], [23, "`-s` prints type descriptors."], [27.5, '`javap -c -p -v` answers "what does this compile to?" for any question about Java.']],
    StackAdd: [[0.5, "The JVM is a stack machine. There are no registers."], [4.5, "Each method call gets a frame: numbered local variable slots, and an operand stack."], [10.5, "Slot 0 holds `this`, so `a` is slot 1 and `b` is slot 2. Say we call `add(2, 3)`."], [17.5, "`iload_1`: push a copy of local slot 1 onto the operand stack."], [24, "`iload_2`: push slot 2. Two values are waiting."], [30, "`iadd`: pop two ints, add them, push the result."], [37, "`ireturn`: pop the top value and hand it back to the caller."], [43.5, "Every instruction works the same way: pop its inputs, push its output."], [50, "`max_stack = 2` and `max_locals = 3` fix the frame size. The verifier checks they always hold."]],
    Prefixes: [[0.5, "An opcode's first letter is its type."], [4, "`i` int, `l` long, `f` float, `d` double, and `a` for a reference: an address."], [10, "So one operation comes in typed versions: `iload`, `lload`, `aload`\u2026"], [16, "Booleans, bytes, chars and shorts are computed as ints. There's no `badd`."], [22, "A long or double takes **two** local slots. Here `b` lives in slots 3 and 4."], [29.5, "The `_1` suffix is a one-byte shortcut for slots 0 to 3. Higher slots need an extra operand byte."]],
    StackMain: [[0.5, "Now `main`, one instruction at a time."], [4, "`new #7` allocates a `Calc` object on the heap, uninitialised, and pushes a reference to it."], [9.5, "`dup` copies that reference. Why? Because the constructor call will consume one."], [15, "`invokespecial #9` runs `<init>`, the constructor. Now the object is ready."], [21, "`astore_1` pops the remaining reference into slot 1. That's `c`."], [26.5, "Push the receiver and the arguments: `aload_1`, `iconst_2`, `iconst_3`."], [33.5, "`invokevirtual #10` pops all three, runs `add` in a new frame, and pushes the result."], [40, "`istore_2` saves 5 into slot 2. That's `r`."], [45, "`getstatic #14` pushes `System.out`. Then `iload_2` pushes `r`."], [51.5, '`invokedynamic` turns 5 into the string `"r = 5"`. More on that soon.'], [58, "`invokevirtual #24` calls `println`. The console prints."], [64, "Three lines of Java became 14 instructions, 28 bytes. `return` pops the frame."]],
    Invokes: [[0.5, "Method calls compile to one of five invoke instructions."], [4, "`invokestatic`: a static method. No receiver, one fixed target."], [9.5, "`invokespecial`: constructors, private methods, `super.x()`. The exact method is known: no dispatch."], [16, "`invokevirtual`: a normal instance method. The target depends on the object's real class."], [22.5, "`invokeinterface`: the same idea, called through an interface type."], [28.5, "`invokedynamic`: the target is decided by code, at runtime, the first time it runs."], [35.5, "Fixed targets on the left, fully dynamic on the right. Let's open the middle and the right."]],
    VTable: [[0.5, "How does `invokevirtual` find the right method? Through a **vtable**."], [5, "`Dog` extends `Animal`. It overrides `speak`, but inherits `eat`."], [11, "Each class has a table of its virtual methods, stored with its metadata in metaspace."], [16.5, "A subclass copies its parent's table and replaces the slots it overrides. `speak` is slot 5 in both."], [24.5, "The call says `Animal.speak`. Resolution turns that into a slot number, once."], [30, "At runtime: follow the object's header to its real class\u2026"], [35.5, "\u2026read slot 5 of that class's vtable, and jump. `Dog.speak` runs."], [41.5, "Two loads and a jump, whatever the declared type."], [47.5, "Interfaces can't use fixed slots: a class implements many. `invokeinterface` first searches an **itable**."], [55, "In hot code, the JIT usually skips both with inline caches. That comes in 8.8."]],
    Indy: [[0.5, "`invokedynamic` is the instruction that makes modern Java work."], [4.5, 'Our `"r = " + r` compiled to it. The class file also names a bootstrap method and a recipe.'], [8.5, "The first time it runs, the call site is empty. There's no target yet."], [13, "So the JVM calls its **bootstrap method**: `StringConcatFactory.makeConcatWithConstants`."], [20, "The bootstrap builds code for this exact recipe and returns a `CallSite`."], [26.5, "Now the call site is linked. Every later execution jumps straight to the target."], [33, "Lambdas work the same way, with `LambdaMetafactory` as the bootstrap. It creates the class implementing `Runnable` at runtime."], [41, "The payoff: the strategy lives in the JDK, not in your class file."], [46.5, "Java 9 moved string `+` to `invokedynamic`. Code compiled since gets each JDK's improvements without recompiling."]],
    Desugar: [[0.5, "Much of what you write is syntax that disappears before bytecode."], [4, "A for-each over a list becomes an `Iterator` loop. Notice the cast: that's erasure."], [11, "Over an array, it becomes a plain indexed loop."], [16, "Autoboxing is just method calls: `Integer.valueOf` and `intValue`."], [22, "String `+` becomes one `invokedynamic`."], [27.5, "A lambda becomes `invokedynamic`, plus a private static method holding its body."], [33.5, "An enum is a final class extending `Enum`, with a static array of its constants."], [39.5, "A record is a final class whose `equals`, `hashCode` and `toString` are bootstrapped by `invokedynamic`."], [46.5, "And generics vanish entirely: `Object`, plus casts the compiler inserts for you."], [52, "The JVM never sees any of this sugar."]],
    StringSwitch: [[0.5, 'A `switch` on strings is fun to open up. Say `s` is `"b"`.'], [5, 'Step one: compute `s.hashCode()`. For `"b"`, that\'s 98.'], [10.5, 'A `lookupswitch` jumps by hash: 97 for "a", 98 for "b".'], [16.5, 'Different strings can share a hash: `"Aa"` and `"BB"` are both 2112. So it checks `equals` too.'], [24, "A match stores a case index: here, 1."], [29, "Step two: a second switch on that index picks the result: 2."], [35.5, "Two lines of source, about thirty instructions."]],
    Erasure: [[0.5, "Now verify Part 03 with your own eyes. Here's a generic method."], [5, "`javap -s` prints its descriptor: what the JVM actually uses."], [10, "`(Ljava/util/List;)Ljava/util/List;`. No `String`, no `Integer`. The type arguments are gone."], [17.5, "They survive only in a `Signature` attribute. `javac` and reflection read it; execution ignores it."], [25, "So who enforces the types? Look at a caller."], [29.5, "In bytecode, `List.get` returns `Object`. The compiler inserted a `checkcast String`."], [36.5, "Erasure in one picture: `Object` everywhere, and casts the compiler wrote for you."]],
    Lambdas: [[0.5, "Part 06 said lambdas aren't anonymous classes. Check it."], [4.5, "An anonymous class compiles to its own file: `Anon$1.class`."], [10, "The lambda version produces only `Lam.class`."], [15.5, "Inside, the lambda's body became a private static method: `lambda$new$0`."], [22, "Where the lambda was written, there's an `invokedynamic` that returns a `Runnable`."], [29, "The implementing class is generated at runtime, on first use. Nothing on disk."], [36.5, "Autoboxing is just as visible: `iconst_5`, then `invokestatic Integer.valueOf`."]],
    ClassFileApi: [[0.5, "Frameworks read and write bytecode constantly: Spring, Hibernate, Mockito, JaCoCo."], [5.5, "For years they bundled a library called ASM."], [9.5, "Every new JDK brought a new class-file version, and ASM had to catch up before they worked."], [16, "Java 24 made the Class-File API final: `java.lang.classfile`, inside the JDK, always current."], [23.5, "You'll rarely call it yourself. You benefit when your frameworks stop breaking on JDK upgrades."]],
    Traps: [[0.5, "Four traps worth avoiding."], [3.5, "`UnsupportedClassVersionError` is a version mismatch, not a missing class."], [10, "Generics are not in the bytecode: only in a `Signature` attribute."], [16.5, "Lambdas don't create class files. `invokedynamic` creates their class at runtime."], [23, "And bytecode isn't what runs for long. Hot methods become machine code."]],
    Recap: [[0.5, "Recap."], [3, "`javac` compiles once to bytecode; the JIT compiles hot code at runtime."], [9, "A class file is `CAFEBABE`, a version, a constant pool, then fields and methods."], [15, "The JVM is a stack machine: local slots, an operand stack, typed opcodes."], [21, "Five invokes. `invokedynamic` powers lambdas, string concatenation and records."], [26.5, "And `javap -c -p -v` shows you all of it. Use it."]]
  };
  var CALC = CALC_SRC.join("\n");
  var notes = [
    { ch: 1, blocks: [
      { p: "**Java is compiled twice.** `javac` compiles your source once, ahead of time, into **bytecode**: instructions for a virtual machine, identical on every OS. Then, while the program runs, the JVM compiles the methods that matter into real machine code, using facts it can only know at runtime." },
      { mini: { scene: "TwoCompilers" } },
      { list: ["**Interpreter**: every method starts here. It executes bytecode one instruction at a time. Slow, but there is no wait.", "**C1**: once a method is called often (roughly 200 calls by default), C1 compiles it quickly and adds profiling: which branches run, which types actually show up.", "**C2**: hotter still (thousands of calls), C2 recompiles it aggressively using that profile: inlining, escape analysis, loop optimisations.", '**Deoptimisation**: C2 bets on what the profile showed (e.g. "this call always sees a `Dog`"). If the bet is lost, the JVM throws the compiled code away, goes back to the interpreter, re-profiles and recompiles.'] },
      { callout: { tone: "pull", title: "consequence", text: "A Java service is slow for its first few thousand requests, then several times faster. A benchmark without warm-up measures the interpreter, not your code (8.8)." } }
    ] },
    { ch: 2, blocks: [
      { p: "Our running example for this whole topic:" },
      { code: CALC, title: "Calc.java" },
      { tryit: { note: "Compile it and look at the first bytes yourself. (These are the bytes from JDK 17; on Java 25 the 8th byte is `45`.)", cmd: "$ javac Calc.java\n$ xxd Calc.class | head -4", out: "00000000: cafe babe 0000 003d 0033 0a00 0200 0307  .......=.3......\n00000010: 0004 0c00 0500 0601 0010 6a61 7661 2f6c  ..........java/l\n00000020: 616e 672f 4f62 6a65 6374 0100 063c 696e  ang/Object...<in\n00000030: 6974 3e01 0003 2829 5607 0008 0100 0443  it>...()V......C" } },
      { mini: { scene: "HexDump" } },
      { table: { head: ["bytes", "meaning"], rows: [["`ca fe ba be`", "**magic number**. Every class file starts with it"], ["`00 00`", "minor version"], ["`00 3d`", "major version: 0x3D = 61 = Java 17"], ["`00 33`", "constant pool count: 51, so entries #1\u2013#50"], ["`0a 0002 0003`", "entry #1: tag 10 = Methodref \u2192 class #2, name-and-type #3"], ["`07 0004`", "entry #2: tag 7 = Class \u2192 name in #4"], ["`01 0010 6a61\u2026`", "entry #4: tag 1 = Utf8, 16 bytes: `java/lang/Object`"]] } },
      { h: "Version numbers" },
      { mini: { scene: "Versions" } },
      { table: { head: ["major", "Java"], rows: [["52", "8"], ["55", "11"], ["61", "17"], ["65", "21"], ["69", "25"]] } },
      { callout: { tone: "bad", title: "UnsupportedClassVersionError", text: '"class file version 69.0, this version only recognizes up to 61.0" means a Java 25 class on a Java 17 JVM. **Java runs older class files forever, never newer ones.** Fix: upgrade the runtime, or compile with `javac --release 17`.' } },
      { h: "The structure" },
      { mini: { scene: "Structure" } },
      { code: "magic \xB7 version \xB7 constant pool \xB7 access flags \xB7 this/super class\n      \xB7 interfaces \xB7 fields \xB7 methods \xB7 attributes", lang: "plain", title: "every class file, in order" },
      { p: "Each method's `Code` attribute holds its bytecode plus **`max_stack`** and **`max_locals`**, computed by `javac`. The JVM can size the method's frame before running a single instruction, and the verifier proves no path ever exceeds them. In `Calc.class`, the constant pool is 703 of the 928 bytes: **76%** of the file." }
    ] },
    { ch: 3, blocks: [
      { p: "The **constant pool** holds every string literal, class name, method name and type descriptor in the file, stored once and referenced by index. Instructions refer to it as `#n`." },
      { mini: { scene: "PoolTable" } },
      { code: "  #7 = Class              #8             // Calc\n  #8 = Utf8               Calc\n #10 = Methodref          #7.#11         // Calc.add:(II)I\n #11 = NameAndType        #12:#13        // add:(II)I\n #12 = Utf8               add\n #13 = Utf8               (II)I", lang: "plain", title: "javap -v Calc.class (excerpt)" },
      { h: "Descriptors" },
      { mini: { scene: "Descriptors" } },
      { table: { head: ["descriptor", "type"], rows: [["`B C D F I S`", "byte, char, double, float, int, short"], ["`J`", "**long** (L was taken)"], ["`Z`", "**boolean** (B was taken)"], ["`V`", "void (return type only)"], ["`Ljava/lang/String;`", "a class type"], ["`[I`", "int[]   (`[[I` is int[][])"], ["`(II)I`", "method: (int, int) \u2192 int"]] } },
      { callout: { tone: "violet", title: "deeper", text: "To the JVM, a method is **name + full descriptor**, return type included. `javac` forbids two methods that differ only in return type, but the class-file format allows it, and compilers use it for bridge methods (Part 03)." } },
      { h: "Resolution: symbolic \u2192 direct" },
      { mini: { scene: "Resolution" } },
      { p: "When a class loads, its pool becomes the **runtime constant pool** in metaspace. Entries start out **symbolic**: just names. The first time an instruction uses one, the JVM **resolves** it: it locates (and if necessary loads) the class, finds the member by name and descriptor, checks access, and caches the direct reference. HotSpot keeps that cache in a structure beside the pool (the *constant pool cache*). Every later execution skips the lookup. Resolution is lazy, which is why a missing class often fails only when the line that needs it first runs (8.2)." }
    ] },
    { ch: 4, blocks: [
      { mini: { scene: "Javap" } },
      { code: "$ javap Calc.class            # non-private signatures\n$ javap -p Calc.class         # include private members\n$ javap -c Calc.class         # disassemble: the bytecode\n$ javap -c -p -v Calc.class   # everything: constant pool, flags, stack sizes\n$ javap -s Calc.class         # type descriptors", lang: "shell" },
      { tryit: { cmd: "$ javap -c Calc.class", out: "  int add(int, int);\n    Code:\n       0: iload_1\n       1: iload_2\n       2: iadd\n       3: ireturn", outLang: "bytecode" } },
      { p: '**Use it constantly.** Every "what does this actually compile to?" question in Parts 03, 06 and 07 is answered by `javap -c -p`.' }
    ] },
    { ch: 5, blocks: [
      { p: "The JVM has **no registers**. Every instruction pops its inputs from an **operand stack** and pushes its result back. Each method call gets a **frame**: numbered local variable slots plus its own operand stack." },
      { mini: { scene: "StackAdd" } },
      { code: "0: iload_1        // push local slot 1 (a)\n1: iload_2        // push local slot 2 (b)\n2: iadd           // pop two ints, push their sum\n3: ireturn        // pop it and return it", lang: "bytecode", title: "add, annotated" },
      { code: "operand stack:   [ ]  \u2192  [ 2 ]  \u2192  [ 2, 3 ]  \u2192  [ 5 ]  \u2192  [ ]", lang: "plain", title: "add(2, 3)" },
      { callout: { tone: "pull", text: "Slot 0 is `this` in an instance method. That is why `a` is slot 1. In a static method, the first parameter is slot 0." } },
      { h: "Typed opcodes" },
      { mini: { scene: "Prefixes" } },
      { table: { head: ["prefix", "type", "examples"], rows: [["`i`", "int (also boolean, byte, char, short)", "`iload istore iadd ireturn`"], ["`l`", "long: **two slots**", "`lload ladd lreturn`"], ["`f`", "float", "`fload fadd`"], ["`d`", "double: **two slots**", "`dload dadd`"], ["`a`", 'reference ("address")', "`aload astore areturn`"]] } },
      { h: "main(), instruction by instruction" },
      { mini: { scene: "StackMain" } },
      { code: ' 0: new           #7     // allocate an uninitialised Calc, push its reference\n 3: dup                  // copy it: <init> will consume one\n 4: invokespecial #9     // Calc.<init>()\n 7: astore_1             // c = the other copy\n 8: aload_1              // push c (the receiver)\n 9: iconst_2\n10: iconst_3\n11: invokevirtual #10    // c.add(2, 3) \u2192 pushes 5\n14: istore_2             // r = 5\n15: getstatic     #14    // push System.out\n18: iload_2              // push r\n19: invokedynamic #20, 0 // "r = " + r \u2192 pushes a String\n24: invokevirtual #24    // println(String)\n27: return', lang: "bytecode", title: "main, annotated (real javap output)" },
      { callout: { tone: "violet", title: "deeper: why new + dup", text: "`new` only allocates. The object is not usable until `<init>` runs, and the verifier tracks it as *uninitialised* until then. `invokespecial <init>` consumes one reference, so `javac` emits `dup` to keep a second copy for storing into `c`." } }
    ] },
    { ch: 6, blocks: [
      { mini: { scene: "Invokes" } },
      { table: { head: ["instruction", "used for", "how the target is found"], rows: [["`invokestatic`", "static methods", "fixed at link time"], ["`invokespecial`", "constructors, `private` methods, `super.x()`", "fixed: no dispatch"], ["`invokevirtual`", "normal instance methods", "vtable slot of the receiver's class"], ["`invokeinterface`", "calls through an interface type", "itable search, then slot"], ["`invokedynamic`", "lambdas, string `+`, record methods", "a bootstrap method decides, once, at runtime"]] } },
      { h: "invokevirtual and the vtable" },
      { mini: { scene: "VTable" } },
      { p: "Every class's metadata (its *klass*, in metaspace) contains a **vtable**: an array of pointers to its virtual methods. A subclass starts with a copy of its parent's vtable, replaces the entries it overrides and appends new ones. So `speak` is at the **same index** in `Animal` and in `Dog`." },
      { steps: ["Resolution (once) turns `Animal.speak` into vtable index 5.", "At each call: load the receiver's klass pointer from its object header.", "Load entry 5 from that klass's vtable.", "Jump. `Dog.speak` runs even though the variable is typed `Animal`."] },
      { callout: { tone: "violet", title: "deeper", text: "`Object`'s non-final methods (`equals`, `hashCode`, `toString`, `finalize`, `clone`) fill the first vtable slots of every class. Interfaces can't use fixed indexes because one class implements many interfaces, so `invokeinterface` first searches the class's **itable** for the interface, then indexes into it. In hot code the JIT replaces both with **inline caches** (8.8)." } },
      { h: "invokedynamic" },
      { mini: { scene: "Indy" } },
      { p: "An `invokedynamic` call site starts **unlinked**. The first time it executes, the JVM calls the **bootstrap method** named in the class file's `BootstrapMethods` attribute. The bootstrap returns a `CallSite` holding the target `MethodHandle`. From then on the call site is linked, and calls go straight to the target." },
      { list: ['String `+` \u2192 bootstrap `StringConcatFactory.makeConcatWithConstants`, with a recipe such as `"r = \\u0001"` (`\\u0001` marks each argument).', "Lambdas \u2192 bootstrap `LambdaMetafactory.metafactory`, which spins up a hidden class implementing the functional interface.", "Records \u2192 `ObjectMethods.bootstrap` generates `equals`, `hashCode` and `toString`."] },
      { callout: { tone: "flow", text: "The strategy lives in the JDK, not in your class file. Since Java 9 (JEP 280), string concatenation compiles to `invokedynamic`, so each newer JDK can link the same bytecode to faster code **without recompiling**." } }
    ] },
    { ch: 7, blocks: [
      { mini: { scene: "Desugar" } },
      { table: { head: ["you write", "compiles to"], rows: [["for-each over a collection", "`Iterator` + `hasNext` + `next` (+ `checkcast`)"], ["for-each over an array", "an indexed loop with `arraylength`"], ["`Integer i = 5`", "`Integer.valueOf(5)`"], ["`int x = someInteger`", "`someInteger.intValue()`"], ['`"a" + b + "c"`', "`invokedynamic` \u2192 `StringConcatFactory`"], ["a lambda", "`invokedynamic` + a private static `lambda$\u2026` method"], ["an `enum`", "a final class extending `Enum`, with a static `$VALUES` array"], ["a `record`", "a final class extending `Record`; `equals`/`hashCode`/`toString` via `invokedynamic`"], ["inner class touching a private outer field", "NestMates attributes (Java 11+); synthetic accessors before"], ["generics", "**erased**: `Object` plus inserted casts"], ["string `switch`", "a switch on `hashCode()`, `equals` checks, then a switch on an index"]] } },
      { h: "The string switch" },
      { mini: { scene: "StringSwitch" } },
      { p: 'The first switch jumps on `s.hashCode()`. Because different strings can share a hash (`"Aa"` and `"BB"` are both 2112), each branch confirms with `equals` and records a case index. A second switch on that index picks the result. `javac` chooses `tableswitch` (dense keys) or `lookupswitch` (sparse keys) for each; for this example JDK 17 emitted two `lookupswitch`es.' }
    ] },
    { ch: 8, blocks: [
      { h: "Erasure (Part 03)" },
      { mini: { scene: "Erasure" } },
      { tryit: { cmd: "$ javap -s Erase.class", out: "  java.util.List<java.lang.String> f(java.util.List<java.lang.Integer>);\n    descriptor: (Ljava/util/List;)Ljava/util/List;" } },
      { p: "The **descriptor**, which is what the JVM links and executes against, has no type arguments. The generic signature survives in a separate `Signature` attribute (visible with `javap -v`). `javac` reads it when you compile against the class, and reflection reads it (`getGenericReturnType()`), but execution ignores it. Type safety at runtime comes from the `checkcast` instructions the compiler inserts at each use." },
      { h: "Lambdas (Part 06)" },
      { mini: { scene: "Lambdas" } },
      { tryit: { cmd: "$ javac Lam.java Anon.java && ls *.class\n$ javap -c -p Lam.class", out: "Anon$1.class  Anon.class  Lam.class      \u2190 no Lam$1.class\n  5: invokedynamic #7,  0   // InvokeDynamic #0:run:()Ljava/lang/Runnable;\n  private static void lambda$new$0();" } },
      { h: "Autoboxing (Part 01)" },
      { code: "0: iconst_5\n1: invokestatic  #37   // Method java/lang/Integer.valueOf:(I)Ljava/lang/Integer;   \u2190 the boxing, made visible", lang: "bytecode", title: "Integer i = 5;" }
    ] },
    { ch: 9, blocks: [
      { mini: { scene: "ClassFileApi" } },
      { code: 'import java.lang.classfile.*;\n\nClassModel cm = ClassFile.of().parse(Path.of("Calc.class"));\nfor (MethodModel m : cm.methods())\n    System.out.println(m.methodName() + " " + m.methodType());', title: "Java 24+" },
      { p: "**Why it exists:** Spring, Hibernate, Mockito, JaCoCo and friends manipulate bytecode. They bundled ASM, and every JDK release (with a new class-file version) broke them until ASM caught up. The Class-File API (final in Java 24, JEP 484) lives inside the JDK and always understands the current format. You will rarely use it directly; you benefit when your frameworks stop breaking on upgrades." }
    ] }
  ];
  var traps = [
    "`UnsupportedClassVersionError` is not a missing class. It is a **version** mismatch: a newer class file on an older JVM.",
    "Generics are not in the bytecode, only in a `Signature` attribute that execution ignores. That is why `List<String>` and `List<Integer>` are the same class at runtime.",
    "Lambdas do not create class files. `invokedynamic` creates their implementing class at runtime.",
    "Bytecode is only what runs **at first**. Hot methods are compiled to machine code by the JIT, and that is what you are really measuring in a benchmark.",
    "Slot numbers aren't parameter positions: `this` takes slot 0 in instance methods, and `long`/`double` take two slots each."
  ];
  var recap = [
    "**Two compilers**: `javac` once, ahead of time; the JIT continuously, at runtime.",
    "**Class file**: `CAFEBABE`, version (61 = Java 17, 69 = Java 25), constant pool, flags, this/super, interfaces, fields, methods, attributes.",
    "**Constant pool**: every literal and name stored once, referenced as `#n`; resolved lazily from symbolic to direct.",
    "**Descriptors**: `I J Z V L\u2026; [`; a method is name + full descriptor.",
    "**Stack machine**: local slots + operand stack; typed opcodes (`i l f d a`); `max_stack`/`max_locals` known in advance.",
    "**Five invokes**: `static`, `special`, `virtual` (vtable), `interface` (itable), **`dynamic`** (bootstrap, linked once).",
    "**Desugaring**: for-each, boxing, enums, records, lambdas, string switch, generics all vanish before bytecode.",
    "**`javap -c -p -v`**: use it whenever you wonder what something compiles to."
  ];
  var quiz = [
    { q: "`javap -s` on a generic method shows `(Ljava/util/List;)Ljava/util/List;`. What does that prove?", options: ["The method was compiled without generics", "The JVM executes against erased types; type arguments survive only in a Signature attribute", "javap hides type arguments by default; `-v` puts them back into the descriptor", "Generics are checked by the JVM at class load time"], answer: 1, why: "The descriptor is what the JVM links against, and it has no type arguments. The generic signature lives in a separate `Signature` attribute that javac and reflection read; runtime safety comes from inserted `checkcast`s." },
    { q: "Which invoke instruction do lambdas compile to?", options: ["invokevirtual", "invokeinterface", "invokespecial", "invokedynamic"], answer: 3, why: "A lambda site is an `invokedynamic` whose bootstrap (`LambdaMetafactory`) creates the implementing class at runtime. The body becomes a private static `lambda$\u2026` method." },
    { q: "A class file has major version 65 and the JVM supports up to 61. What happens, and does the reverse ever fail?", options: ["It runs in compatibility mode; the reverse fails", "UnsupportedClassVersionError; the reverse (old class, new JVM) works", "NoClassDefFoundError; the reverse also fails", "It runs but newer features throw at runtime"], answer: 1, why: "65 is Java 21, 61 is Java 17. Newer class files are refused. Java runs older class files forever." },
    { q: "In `int add(int a, int b)`, why is `a` loaded with `iload_1` and not `iload_0`?", options: ["Slot 0 is reserved for the return value", "Slot 0 holds `this` in an instance method", "Bytecode slots are 1-based", "Slot 0 holds the operand stack pointer"], answer: 1, why: "Instance methods receive `this` in local slot 0. In a static method the first parameter would be slot 0." },
    { q: "What does `invokevirtual #10` refer to?", options: ["The 10th method in the class", "Byte offset 10 in the method", "Constant pool entry 10: a Methodref (class + name + descriptor)", "vtable slot 10"], answer: 2, why: "`#10` is a constant pool index. Entry #10 is a Methodref built from #7 (class Calc) and #11 (NameAndType add:(II)I)." },
    { q: "Why does `new Calc()` compile to `new`, then `dup`, then `invokespecial <init>`?", options: ["dup protects against garbage collection", "`<init>` consumes one reference, so a copy is needed to store in the variable", "dup allocates the fields", "It is a javac bug kept for compatibility"], answer: 1, why: "`new` only allocates and pushes one reference. The constructor call pops a reference as its receiver, so `dup` leaves a second one on the stack for `astore`." },
    { q: "How does `invokevirtual` find `Dog.speak` when the variable is typed `Animal`?", options: ["It searches the class hierarchy by name on every call", "It reads the object's klass pointer, then a fixed vtable slot resolved once", "javac already decided it at compile time", "Through the itable"], answer: 1, why: "Overridden methods keep the same vtable index in subclasses. Resolution turns the symbolic method into an index once; each call is two loads and a jump." },
    { q: "What is the descriptor of `long sum(long a, boolean b)`?", options: ["(LB)L", "(JZ)J", "(lz)l", "(JB)J"], answer: 1, why: "`J` is long and `Z` is boolean, because `L` (class types) and `B` (byte) were already taken." },
    { q: "Why does a string `switch` call `equals` after switching on `hashCode()`?", options: ["To handle null", "Because different strings can have the same hash code", "Because hashCode is not deterministic", "To make the switch exhaustive"], answer: 1, why: 'Hash codes collide (`"Aa"` and `"BB"` are both 2112), so each hash branch confirms the actual string with `equals`.' }
  ];
  window.AN.registerTopic({
    id: "8.1",
    part: "08",
    title: "From source to bytecode",
    kicker: "Part 08 \xB7 The JVM",
    lede: "Open a class file and look at it. It stops being mysterious in about ten minutes, and everything you took on trust about generics, lambdas and boxing becomes something you can verify.",
    chapters,
    scenes,
    captions,
    notes,
    traps,
    recap,
    quiz
  });
})();
