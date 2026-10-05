(() => {
  // src/topics/8.4/common.jsx
  var { PAL, MOTION, track, pulse, hexA, toneColor, MONO, Txt, clamp } = window.AN;
  var E = MOTION.enter;
  var TONE = { mark: "violet", klass: "blue", field: "flow", ref: "pull", pad: "ink", bad: "bad", len: "pink" };
  var POINT_SRC = ["public class Point {", "    int x;", "    int y;", "}"];
  var ORDER_SRC = [
    "public class Order {",
    "    boolean paid;      // 1 byte",
    "    int     qty;       // 4 bytes",
    "    long    id;        // 8 bytes",
    "    Object  customer;  // 4 bytes (compressed)",
    "}"
  ];
  var hexToBits = (hex) => hex.split("").map((h) => parseInt(h, 16).toString(2).padStart(4, "0")).join("");
  function BitRow({ x, y, bits, groups = [], cw = 26, h = 48, a = 1, fs = 17, lfs = 17, labels = true, reveal, labelY }) {
    if (a <= 5e-3) return null;
    const gOf = (i) => groups.find((g) => i >= g.from && i < g.from + g.n);
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 0, top: 0, opacity: clamp(a, 0, 1) } }, bits.split("").map((b0, i) => {
      const g = gOf(i);
      const b = reveal ? reveal(i, b0) : b0;
      const c = g && g.tone !== "dim" ? toneColor(g.tone) : PAL.ink3;
      const glow = g && g.glow ? g.glow : 0;
      return /* @__PURE__ */ React.createElement("div", { key: i, style: {
        position: "absolute",
        left: x + i * cw,
        top: y,
        width: cw - 2,
        height: h,
        boxSizing: "border-box",
        borderRadius: 4,
        background: g && g.tone !== "dim" ? hexA(c, 0.1 + 0.18 * glow) : "transparent",
        border: `1.5px solid ${hexA(c, g && g.tone !== "dim" ? 0.75 : 0.35)}`,
        boxShadow: glow > 0.01 ? `0 0 ${16 * glow}px ${hexA(c, 0.6 * glow)}` : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        font: `600 ${fs}px ${MONO}`,
        color: b === "1" ? PAL.ink : PAL.ink3
      } }, b);
    }), labels && groups.filter((g) => g.label).map((g, k) => {
      const c = g.tone !== "dim" ? toneColor(g.tone) : PAL.ink3;
      const ly = labelY == null ? y + h + 8 : labelY;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: k }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x + g.from * cw, top: ly, width: g.n * cw - 2, height: 8, borderLeft: `2px solid ${c}`, borderRight: `2px solid ${c}`, borderBottom: `2px solid ${c}`, boxSizing: "border-box", opacity: g.la == null ? 1 : g.la } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x + g.from * cw + g.n * cw / 2, top: ly + 14, transform: "translateX(-50%)", font: `500 ${lfs}px ${MONO}`, color: c, whiteSpace: "nowrap", opacity: g.la == null ? 1 : g.la } }, g.label));
    }));
  }
  function Blk({ x0, y, unit, off, n, h = 70, label, sub, tone, pad, a = 1, glow = 0, fs = 18, sfs = 17, dashed }) {
    if (a <= 5e-3) return null;
    const col = tone ? toneColor(tone) : PAL.ink3;
    return /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      left: x0 + off * unit,
      top: y,
      width: n * unit,
      height: h,
      boxSizing: "border-box",
      opacity: clamp(a, 0, 1),
      borderRadius: 6,
      background: pad ? `repeating-linear-gradient(45deg, transparent 0 7px, ${hexA(col, 0.3)} 7px 9px)` : hexA(col, 0.16),
      border: `2px ${dashed || pad ? "dashed" : "solid"} ${hexA(col, 0.85)}`,
      boxShadow: glow > 0.01 ? `0 0 ${24 * glow}px ${hexA(col, 0.6 * glow)}` : "none",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden"
    } }, label && /* @__PURE__ */ React.createElement("div", { style: { font: `600 ${fs}px ${MONO}`, color: pad ? PAL.ink3 : PAL.ink, whiteSpace: "nowrap" } }, label), sub && /* @__PURE__ */ React.createElement("div", { style: { font: `400 ${sfs}px ${MONO}`, color: pad ? PAL.ink3 : col, whiteSpace: "nowrap", marginTop: 2 } }, sub));
  }
  function Ruler({ x0, y, unit, marks, a = 1, fs = 17, color }) {
    if (a <= 5e-3) return null;
    return marks.map((m) => /* @__PURE__ */ React.createElement(Txt, { key: m, x: x0 + m * unit, y, anchor: "mid", mono: true, fs, color: color || PAL.ink3, a }, String(m)));
  }
  function Tok({ t, keys, text, tone = "flow", from, until, w = 180, h = 46, fs = 20, glowAt }) {
    const start = from == null ? keys[0][0] : from;
    if (t < start) return null;
    const [x, y] = track(t, keys);
    let a = E(t, start, 0.25);
    if (until != null) a *= 1 - E(t, until, 0.3);
    if (a <= 0.01) return null;
    const c = toneColor(tone);
    const g = glowAt != null ? pulse(t, [glowAt], 1) : 0;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, boxSizing: "border-box", borderRadius: 10, opacity: a, background: hexA(c, 0.16), border: `2px solid ${c}`, display: "flex", alignItems: "center", justifyContent: "center", font: `600 ${fs}px ${MONO}`, color: PAL.ink, boxShadow: g > 0.01 ? `0 0 ${26 * g}px ${hexA(c, 0.7 * g)}` : "none", whiteSpace: "nowrap" } }, text);
  }
  function Lines({ lines, fs = 20, lh = 1.65, pad = "14px 22px", color }) {
    return /* @__PURE__ */ React.createElement("div", { style: { padding: pad, font: `500 ${fs}px ${MONO}`, color: color || PAL.ink2, lineHeight: lh, whiteSpace: "pre" } }, lines.map((l, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { opacity: l.a == null ? 1 : l.a, color: l.c || void 0 } }, l.s == null ? l : l.s)));
  }

  // src/topics/8.4/scenes1.jsx
  var {
    PAL: PAL2,
    MOTION: MOTION2,
    lerp,
    win,
    pulse: pulse2,
    step,
    track: track2,
    clamp: clamp2,
    hexA: hexA2,
    MONO: MONO2,
    SANS,
    Txt: Txt2,
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
    Bytes,
    Brace,
    Chip,
    Mark,
    toneColor: toneColor2
  } = window.AN;
  var E2 = MOTION2.enter;
  var M = MOTION2.move;
  var POP = MOTION2.pop;
  function SIntro({ t }) {
    const Y = 540, BX = 840, U = 40;
    const chips = ["mark word", "class pointer", "field order", "padding", "compressed oops", "compact headers", "Valhalla"];
    const cw = chips.map((c) => c.length * 10.8 + 34);
    const total = cw.reduce((s, w) => s + w, 0) + (chips.length - 1) * 18;
    let cx = 960 - total / 2;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt2, { x: 96, y: 150, mono: true, fs: 22, weight: 600, color: PAL2.pull, a: E2(t, 0.3), style: { letterSpacing: "0.14em" } }, "PART 08 \xB7 THE JVM \xB7 8.4"), /* @__PURE__ */ React.createElement(Txt2, { x: 92, y: 192, fs: 110, weight: 700, lh: 1, a: E2(t, 0.6, 0.9), style: { letterSpacing: "-0.03em", transform: `translateY(${(1 - E2(t, 0.6, 0.9)) * 24}px)` } }, "How an object is laid out"), /* @__PURE__ */ React.createElement(Txt2, { x: 96, y: 330, fs: 34, color: PAL2.ink2, a: E2(t, 1.4, 0.8) }, "Headers, padding, compressed oops and compact headers, byte by byte."), /* @__PURE__ */ React.createElement(Code, { x: 96, y: Y - 30, w: 520, h: 216, fs: 22, lh: 36, title: "Point.java", a: E2(t, 1.8), lines: POINT_SRC }), /* @__PURE__ */ React.createElement(Txt2, { x: 356, y: Y + 198, anchor: "mid", fs: 20, color: PAL2.ink2, a: E2(t, 2.2) }, "two ints: 8 bytes of data"), /* @__PURE__ */ React.createElement(HArrow, { x1: 640, x2: 820, y: Y + 80, a: E2(t, 5.5), color: PAL2.pull, label: "new Point()", lfs: 17 }), /* @__PURE__ */ React.createElement(Bytes, { x: BX, y: Y + 40, unit: U, h: 84, fs: 19, sfs: 17, ruler: false, a: E2(t, 5.6), cells: [
      { n: 8, label: "mark word", sub: "8 bytes", tone: TONE.mark, a: E2(t, 6) },
      { n: 4, label: "class", sub: "4 bytes", tone: TONE.klass, a: E2(t, 6.5) },
      { n: 4, label: "x", sub: "int", tone: TONE.field, a: E2(t, 7), glow: win(t, 5.5, 11) },
      { n: 4, label: "y", sub: "int", tone: TONE.field, a: E2(t, 7.3), glow: win(t, 5.5, 11) },
      { n: 4, label: "pad", sub: "4 bytes", pad: true, a: E2(t, 7.8) }
    ] }), /* @__PURE__ */ React.createElement(Brace, { x: BX, y: Y + 26, w: 12 * U, above: true, label: "header: 12 bytes", tone: TONE.mark, a: E2(t, 11.2) }), /* @__PURE__ */ React.createElement(Brace, { x: BX + 12 * U, y: Y + 152, w: 8 * U, label: "your data: 8", tone: "flow", a: E2(t, 11.6) }), /* @__PURE__ */ React.createElement(Brace, { x: BX + 20 * U, y: Y + 152, w: 4 * U, label: "padding: 4", a: E2(t, 12) }), /* @__PURE__ */ React.createElement(Txt2, { x: BX + 12 * U, y: Y + 218, anchor: "mid", fs: 30, weight: 600, a: E2(t, 8.5) }, "8 bytes of data \u2192 ", /* @__PURE__ */ React.createElement("span", { style: { color: PAL2.pull } }, "24 bytes"), " on the heap"), chips.map((c, i) => {
      const x = cx + cw[i] / 2;
      cx += cw[i] + 18;
      return /* @__PURE__ */ React.createElement(Chip, { key: c, x, y: 890, text: c, tone: i < 2 ? "violet" : i < 4 ? "flow" : "pull", fs: 18, h: 44, mono: true, o: E2(t, 17.5 + i * 0.25) });
    }));
  }
  function SAnatomy({ t }) {
    const X = 192, U = 64;
    const focus = t < 11.5 ? 0 : t < 17.5 ? 1 : t < 24 ? 2 : t < 31 ? 3 : -1;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt2, { x: X, y: 196, mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 1) }, "ONE Point OBJECT ON THE HEAP \xB7 OFFSETS IN BYTES"), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: X, top: 230, width: 24 * U, height: 90, boxSizing: "border-box", borderRadius: 6, border: `2px dashed ${PAL2.line2}`, opacity: E2(t, 0.6) * (1 - E2(t, 24.5)) } }), /* @__PURE__ */ React.createElement(Bytes, { x: X, y: 230, unit: U, h: 90, fs: 22, sfs: 17, ruler: false, a: E2(t, 0.6), cells: [
      { n: 8, label: "mark word", sub: "8 bytes", tone: TONE.mark, a: E2(t, 5), glow: focus === 0 ? 0.8 : 0 },
      { n: 4, label: "class pointer", sub: "4 bytes", tone: TONE.klass, a: E2(t, 11.5), glow: focus === 1 ? 0.8 : 0 },
      { n: 4, label: "int x", sub: "offset 12", tone: TONE.field, a: E2(t, 17.5), glow: focus === 2 ? 0.8 : 0 },
      { n: 4, label: "int y", sub: "offset 16", tone: TONE.field, a: E2(t, 18.3), glow: focus === 2 ? 0.8 : 0 },
      { n: 4, label: "padding", sub: "4 bytes", pad: true, a: E2(t, 24), glow: focus === 3 ? 0.8 : 0 }
    ] }), /* @__PURE__ */ React.createElement(Ruler, { x0: X, y: 328, unit: U, marks: [0, 8, 12, 16, 20, 24], a: E2(t, 1) }), /* @__PURE__ */ React.createElement(Brace, { x: X + 12 * U, y: 358, w: 8 * U, label: "your data \xB7 8 of 24 bytes", tone: "flow", a: E2(t, 38) }), /* @__PURE__ */ React.createElement(Card, { x: 96, y: 420, w: 540, h: 170, a: E2(t, 5.4), tone: "violet", num: "bytes 0\u20137", title: "Mark word", sub: "identity hash, GC age, lock state. One word, reused for different jobs.", tfs: 28, sfs: 19, glow: focus === 0 ? 0.6 : 0 }), /* @__PURE__ */ React.createElement(Card, { x: 690, y: 420, w: 540, h: 170, a: E2(t, 11.9), tone: "blue", num: "bytes 8\u201311", title: "Class pointer", sub: "which class this object is: a link into metaspace.", tfs: 28, sfs: 19, glow: focus === 1 ? 0.6 : 0 }), /* @__PURE__ */ React.createElement(Card, { x: 1284, y: 420, w: 540, h: 170, a: E2(t, 17.9), tone: "flow", num: "bytes 12\u201323", title: "Fields, then padding", sub: "your data, then filler up to a multiple of 8.", tfs: 28, sfs: 19, glow: focus >= 2 ? 0.6 : 0 }), /* @__PURE__ */ React.createElement(Console, { x: 96, y: 612, w: 1728, h: 312, t, a: E2(t, 1), fs: 18, lh: 29, items: [
      { at: 1.4, text: "java -jar jol-cli.jar internals -cp . Point", kind: "cmd" },
      { at: 2, text: "OFF  SZ   TYPE DESCRIPTION               VALUE", kind: "dim" },
      { at: 5.2, text: "  0   8        (object header: mark)     0x0000000000000001 (non-biasable; age: 0)" },
      { at: 11.7, text: "  8   4        (object header: class)    0x01015000" },
      { at: 17.7, text: " 12   4    int Point.x                   0", kind: "ok" },
      { at: 18.5, text: " 16   4    int Point.y                   0", kind: "ok" },
      { at: 24.2, text: " 20   4        (object alignment gap)    " },
      { at: 31, text: "Instance size: 24 bytes", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(Badge, { x: 1640, y: 680, text: "JDK 17 \xB7 real output", tone: "ink", a: E2(t, 2), fs: 17 }));
  }
  var FRESH = hexToBits("0000000000000001");
  var HASHED = hexToBits("00000033e5ccce01");
  function SMarkBits({ t }) {
    const X = 128, CW2 = 26;
    const fill = clamp2((t - 25) / 2.2, 0, 1);
    const reveal = (i) => i >= 25 && i < 56 ? (i - 25) / 31 < fill ? HASHED[i] : FRESH[i] : FRESH[i];
    const hashed = t >= 27.2;
    const groups = [
      { from: 0, n: 25, tone: "dim", label: "unused \xB7 25 bits" },
      { from: 25, n: 31, tone: "pull", label: "identity hash \xB7 31 bits", glow: win(t, 12, 18) + win(t, 25, 31) },
      { from: 56, n: 1, tone: "dim" },
      { from: 57, n: 4, tone: "green", label: "age", glow: win(t, 38, 44.6) },
      { from: 61, n: 1, tone: "bad", label: "b", glow: win(t, 41, 44.6) },
      { from: 62, n: 2, tone: "flow", label: "lock", glow: win(t, 5.5, 11.5) + E2(t, 45) }
    ];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt2, { x: X + 12, y: 198, anchor: "mid", mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 0.8) }, "63"), /* @__PURE__ */ React.createElement(Txt2, { x: X + 63 * CW2 + 12, y: 198, anchor: "mid", mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 0.8) }, "0"), /* @__PURE__ */ React.createElement(Txt2, { x: 960, y: 198, anchor: "mid", mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 0.8) }, "MARK WORD OF A Point \xB7 64 BITS \xB7 JDK 17 LAYOUT"), /* @__PURE__ */ React.createElement(BitRow, { x: X, y: 226, cw: CW2, h: 50, bits: FRESH, groups, reveal, a: E2(t, 0.6) }), /* @__PURE__ */ React.createElement(Txt2, { x: 960, y: 366, anchor: "mid", mono: true, fs: 40, weight: 600, a: E2(t, 1.2) }, "mark = 0x", /* @__PURE__ */ React.createElement("span", { style: { color: hashed ? PAL2.pull : PAL2.ink2 } }, hashed ? "00000033e5ccce" : "00000000000000"), /* @__PURE__ */ React.createElement("span", { style: { color: PAL2.flow } }, "01")), /* @__PURE__ */ React.createElement(Val84, { t }), /* @__PURE__ */ React.createElement(Console, { x: 96, y: 470, w: 1120, h: 300, t, a: E2(t, 1), fs: 18, lh: 32, items: [
      { at: 1.4, text: "java -cp jol-cli.jar:. Marks        # columns trimmed", kind: "cmd" },
      { at: 2.2, text: "fresh:   mark 0x0000000000000001 (non-biasable; age: 0)" },
      { at: 19, text: "identityHashCode = 0x33e5ccce", kind: "ok" },
      { at: 27.3, text: "hashed:  mark 0x00000033e5ccce01 (hash: 0x33e5ccce; age: 0)", kind: "ok" },
      { at: 32, text: "System.out.println(p)  \u2192  Point@33e5ccce" }
    ] }), /* @__PURE__ */ React.createElement(Callout, { x: 1260, y: 470, w: 564, tone: "pull", a: win(t, 12, 44.6), title: "lazy", fs: 20, text: "No hash is computed at `new`. The first `identityHashCode` (or default `hashCode`) call generates one and stores it here. Every later call just reads it." }), /* @__PURE__ */ React.createElement(
      Table,
      {
        x: 1260,
        y: 470,
        cols: [110, 454],
        head: ["bits", "state"],
        rows: [["01", "unlocked"], ["00", "thin lock"], ["10", "monitor \xB7 fat lock"], ["11", "marked by the GC"]],
        a: E2(t, 45),
        fs: 20,
        rh: 52,
        rowA: [0, 1, 2, 3].map((i) => E2(t, 45.3 + i * 0.3)),
        colColors: [PAL2.flow, PAL2.ink],
        marks: { 0: ["flow", E2(t, 45.3)] }
      }
    ), /* @__PURE__ */ React.createElement(Callout, { x: 96, y: 800, w: 1120, tone: "violet", a: E2(t, 31.5), fs: 20, text: '`Object.toString()` is `getClass().getName() + "@" + Integer.toHexString(hashCode())`. The default `hashCode()` is this stored identity hash.' }));
  }
  function Val84({ t }) {
    return /* @__PURE__ */ React.createElement(Tok, { t, keys: [[18.8, 1500, 400], [25, 1500, 400], [26.4, 1181, 251]], text: "0x33e5ccce", tone: "pull", w: 210, h: 48, fs: 22, from: 18.8, until: 26.8, glowAt: 19 });
  }
  var STATES = [
    ["unlocked", "01", "0x00000033e5ccce01", "hash + age live in the word", "flow", 5],
    ["thin lock", "00", "0x000000016dc3aae0", "\u2192 lock record on the owner's stack", "pull", 17.5],
    ["fat lock", "10", "0x0000000bdcdbce02", "\u2192 ObjectMonitor", "violet", 31.5],
    ["GC: marked", "11", "forwarding pointer", "\u2192 the new copy (during GC only)", "pink", 38]
  ];
  function SMarkStates({ t }) {
    const cur = STATES.filter((s) => t >= s[5]).length - 1;
    const markNow = t < 17.5 ? "0x00000033e5ccce01" : t < 31.5 ? "0x000000016dc3aae0" : t < 38 ? "0x0000000bdcdbce02" : "forward \u2192 copy | 11";
    const markTone = t < 17.5 ? PAL2.flow : t < 31.5 ? PAL2.pull : t < 38 ? PAL2.violet : PAL2.pink;
    const oldA = 1 - E2(t, 37.6, 0.5);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, STATES.map(([name, bits, hex, desc, tone, at], i) => /* @__PURE__ */ React.createElement(Panel, { key: name, x: 96 + i * 439, y: 196, w: 410, h: 190, title: name, right: /* @__PURE__ */ React.createElement("span", { style: { color: toneColor2(tone), fontWeight: 700 } }, "lock bits ", bits), tone, a: E2(t, 1 + i * 0.2) * (cur >= i ? 1 : 0.35), glow: cur === i ? 0.8 : 0 }, /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 18px", font: `600 21px ${MONO2}`, color: PAL2.ink } }, hex), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 18px", font: `400 19px ${SANS}`, color: PAL2.ink2, lineHeight: 1.35 } }, desc))), /* @__PURE__ */ React.createElement(Panel, { x: 96, y: 430, w: 500, h: 350, title: "thread T1 \xB7 stack", tone: "flow", a: E2(t, 11) * oldA }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 22, top: 230, width: 452, height: 56, boxSizing: "border-box", borderRadius: 10, border: `2px solid ${PAL2.line2}`, display: "flex", alignItems: "center", padding: "0 16px", font: `500 19px ${MONO2}`, color: PAL2.ink2 } }, "main()")), /* @__PURE__ */ React.createElement(Box, { x: 118, y: 500, w: 456, h: 130, label: "lock record", sub: "displaced mark: 0x\u202633e5ccce01", tone: "pull", fs: 21, sfs: 17, a: E2(t, 12) * oldA, glow: win(t, 12, 17.5) + pulse2(t, [45.5], 1.2) }), /* @__PURE__ */ React.createElement(Txt2, { x: 346, y: 640, anchor: "mid", mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 12.4) * oldA }, "synchronized (p) { \u2026 }"), /* @__PURE__ */ React.createElement(
      Node,
      {
        x: 700,
        y: 450,
        w: 520,
        h: 200,
        kind: "heap",
        name: "Point p",
        tone: "flow",
        a: E2(t, 1.4),
        rfs: 20,
        rows: [["mark", markNow, markTone, pulse2(t, [17.5, 31.5, 38], 1.2)], ["class", "\u2192 Point"], ["x, y", "0, 0"]],
        glow: pulse2(t, [17.5, 31.5, 38], 1.2)
      }
    ), /* @__PURE__ */ React.createElement(Arrow, { from: [698, 563], to: [578, 566], draw: M(t, 17.6, 0.6), color: PAL2.pull, a: win(t, 17.6, 31.4) }), /* @__PURE__ */ React.createElement(Arrow, { from: [1222, 563], to: [1320, 563], draw: M(t, 31.6, 0.6), color: PAL2.violet, a: win(t, 31.6, 37.8) }), /* @__PURE__ */ React.createElement(Panel, { x: 1324, y: 430, w: 500, h: 190, title: "ObjectMonitor", tone: "violet", a: win(t, 24.5, 37.8), glow: pulse2(t, [45.5], 1.2) }, /* @__PURE__ */ React.createElement(Lines, { fs: 19, lines: ["header:  0x\u202633e5ccce01", "owner:   T1", "waiting: T2"] })), /* @__PURE__ */ React.createElement(Box, { x: 1324, y: 640, w: 500, h: 70, label: "thread T2", sub: "blocked in synchronized (p)", tone: "bad", fs: 20, sfs: 17, a: win(t, 24.5, 37.8) }), /* @__PURE__ */ React.createElement(
      Node,
      {
        x: 1324,
        y: 450,
        w: 500,
        h: 200,
        kind: "heap \xB7 to-space",
        name: "Point p (new copy)",
        tone: "pink",
        a: E2(t, 38.6),
        rfs: 20,
        rows: [["mark", "0x00000033e5ccce01", PAL2.flow], ["class", "\u2192 Point"], ["x, y", "0, 0"]]
      }
    ), /* @__PURE__ */ React.createElement(Arrow, { from: [1222, 563], to: [1320, 563], draw: M(t, 39, 0.6), color: PAL2.pink }), /* @__PURE__ */ React.createElement(Txt2, { x: 1271, y: 520, anchor: "mid", mono: true, fs: 17, color: PAL2.pink, a: E2(t, 39.5) }, "forward"), /* @__PURE__ */ React.createElement(Txt2, { x: 960, y: 680, anchor: "mid", fs: 19, color: PAL2.ink2, w: 520, align: "center", a: E2(t, 40) }, "As the GC finds other references to the old copy, it reads this pointer and updates them to the new one."), /* @__PURE__ */ React.createElement(Callout, { x: 96, y: 810, w: 1180, tone: "pull", a: win(t, 45.5, 51.8), fs: 20, title: "the hash survives", text: "The displaced header (hash, age) waits in the lock record or the monitor and is put back on unlock." }), /* @__PURE__ */ React.createElement(Callout, { x: 96, y: 810, w: 1728, tone: "violet", a: E2(t, 52), fs: 20, title: "JDK 23+ \xB7 lightweight locking", text: "The header stays in place and only the lock bits flip to `00`; the owner goes on the thread's own lock-stack. JDK 25, same program: `0x\u20264fe304f801` \u2192 `0x\u20264fe304f800`." }));
  }
  var GCS = [11.5, 17, 19.5, 22];
  function SAges({ t }) {
    const age = t < 24 ? GCS.filter((g) => t >= g + 0.6).length : clamp2(4 + Math.floor((t - 24) / 0.45), 4, 15);
    const promoted = t >= 28.6;
    const low = age << 3 | 1;
    const bits = low.toString(2).padStart(8, "0");
    const eden = [380, 420], s0 = [820, 344], s1 = [820, 478], old = [546, 600];
    const keys = [[0, ...eden], [11.5, ...eden], [12.3, ...s0], [17, ...s0], [17.8, ...s1], [19.5, ...s1], [20.3, ...s0], [22, ...s0], [22.8, ...s1], [28.2, ...s1], [29.2, ...old]];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel, { x: 96, y: 196, w: 900, h: 340, title: "young generation \xB7 Serial GC", a: E2(t, 0.5) }), /* @__PURE__ */ React.createElement(Box, { x: 120, y: 256, w: 520, h: 260, label: "eden", tone: "ink", a: E2(t, 0.8), fs: 20, style: { justifyContent: "flex-start", paddingTop: 14 } }), /* @__PURE__ */ React.createElement(Box, { x: 670, y: 256, w: 300, h: 140, label: "survivor 0", tone: "ink", a: E2(t, 1), fs: 18, style: { justifyContent: "flex-start", paddingTop: 10 } }), /* @__PURE__ */ React.createElement(Box, { x: 670, y: 406, w: 300, h: 110, label: "survivor 1", tone: "ink", a: E2(t, 1.2), fs: 18, style: { justifyContent: "flex-start", paddingTop: 10 } }), /* @__PURE__ */ React.createElement(Box, { x: 96, y: 560, w: 900, h: 80, label: "old generation", tone: promoted ? "pull" : "ink", a: E2(t, 1.4), fs: 20, glow: pulse2(t, [29.2], 1.2), style: { alignItems: "flex-start", paddingLeft: 20 } }), /* @__PURE__ */ React.createElement(Tok, { t, keys, text: `Point \xB7 age ${age}`, tone: "green", w: 250, h: 48, fs: 19, from: 1.5, glowAt: -1 }), GCS.map((g, i) => /* @__PURE__ */ React.createElement(Badge, { key: i, x: 380, y: 490, text: `young GC ${i + 1}`, tone: "bad", a: win(t, g, g + 1.6, 0.25), fs: 17 })), /* @__PURE__ */ React.createElement(Badge, { x: 380, y: 490, text: "\u2026more GCs", tone: "bad", a: win(t, 24, 28.4, 0.25), fs: 17 }), /* @__PURE__ */ React.createElement(Console, { x: 1040, y: 196, w: 784, h: 340, t, a: E2(t, 1), fs: 18, lh: 30, items: [
      { at: 1.4, text: "java -XX:+UseSerialGC \u2026 Ages   # trimmed", kind: "cmd" },
      { at: 2, text: "start:  0x0000007a81197d01  (age: 0)" },
      { at: 12.3, text: "GC 1:   0x0000007a81197d09  (age: 1)", kind: "ok" },
      { at: 17.8, text: "GC 2:   0x0000007a81197d11  (age: 2)", kind: "ok" },
      { at: 20.3, text: "GC 3:   0x0000007a81197d19  (age: 3)", kind: "ok" },
      { at: 22.8, text: "GC 4:   0x0000007a81197d21  (age: 4)", kind: "ok" },
      { at: 23.4, text: "GC 5:   0x0000007a81197d29  (age: 5)", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(Txt2, { x: 1040, y: 560, mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 6) }, "LOW BYTE OF THE MARK WORD"), /* @__PURE__ */ React.createElement(BitRow, { x: 1040, y: 596, cw: 96, h: 70, fs: 28, lfs: 17, bits, a: E2(t, 6), groups: [
      { from: 0, n: 1, tone: "dim", label: "gap" },
      { from: 1, n: 4, tone: "green", label: `age = ${age}`, glow: pulse2(t, GCS.map((g) => g + 0.6), 0.9) },
      { from: 5, n: 1, tone: "bad", label: "b" },
      { from: 6, n: 2, tone: "flow", label: "lock 01" }
    ] }), /* @__PURE__ */ React.createElement(Txt2, { x: 1040, y: 720, mono: true, fs: 22, color: PAL2.ink2, a: E2(t, 6) }, "= 0x", /* @__PURE__ */ React.createElement("span", { style: { color: PAL2.green } }, low.toString(16).padStart(2, "0"))), /* @__PURE__ */ React.createElement(Callout, { x: 96, y: 668, w: 900, tone: "green", a: E2(t, 30), fs: 20, title: "4 bits", text: "The age counts 0 to 15 and can't go higher. Promotion by age has to happen by 15." }), /* @__PURE__ */ React.createElement(Console, { x: 96, y: 790, w: 1728, h: 134, t, a: E2(t, 35.5), fs: 18, lh: 30, items: [
      { at: 35.8, text: "java -XX:MaxTenuringThreshold=17 -version", kind: "cmd" },
      { at: 36.4, text: "uintx MaxTenuringThreshold=17 is outside the allowed range [ 0 ... 16 ]", kind: "err" }
    ] }), /* @__PURE__ */ React.createElement(Badge, { x: 1640, y: 810, text: "16 = never promote by age", tone: "ink", a: E2(t, 37), fs: 17 }));
  }
  function SKlass({ t }) {
    const X = 96, U = 40;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt2, { x: X, y: 196, mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 0.6) }, "Point \xB7 JOL: \u201CCompressed class pointers: 0-bit shift and 0x8800000000 base\u201D"), /* @__PURE__ */ React.createElement(Bytes, { x: X, y: 232, unit: U, h: 84, fs: 18, sfs: 17, ruler: false, a: E2(t, 0.6), cells: [
      { n: 8, label: "mark word", tone: TONE.mark },
      { n: 4, label: "0x01015000", sub: "class", tone: TONE.klass, glow: win(t, 5.5, 18) },
      { n: 4, label: "x", tone: TONE.field },
      { n: 4, label: "y", tone: TONE.field },
      { n: 4, label: "pad", pad: true }
    ] }), /* @__PURE__ */ React.createElement(Panel, { x: X, y: 370, w: 960, h: 210, title: "decode the class word", tone: "blue", a: E2(t, 5.5) }, /* @__PURE__ */ React.createElement(Lines, { fs: 26, lh: 1.7, lines: [
      { s: "narrow klass   0x01015000", a: E2(t, 5.8) },
      { s: "+ class base   0x8800000000   (shift 0)", a: E2(t, 12), c: PAL2.ink2 },
      { s: "= Klass*       0x8801015000", a: E2(t, 15), c: PAL2.blue }
    ] })), /* @__PURE__ */ React.createElement(Arrow, { pts: [[1060, 548], [1090, 548], [1090, 330], [1116, 330]], draw: M(t, 18, 0.7), color: PAL2.blue }), /* @__PURE__ */ React.createElement(Panel, { x: 1120, y: 196, w: 704, h: 386, title: "metaspace \xB7 the Klass of Point", tone: "violet", a: E2(t, 18), glow: win(t, 25, 31) * 0.7 }, /* @__PURE__ */ React.createElement("div", { style: { padding: "6px 0" } }, [["name", "Point"], ["super", "java.lang.Object"], ["instance size", "24 bytes"], ["field layout", "x @12 \xB7 y @16"], ["vtable", "equals, hashCode, toString, \u2026"], ["mirror", "\u2192 the Point.class object"]].map(([k, v], i) => /* @__PURE__ */ React.createElement("div", { key: k, style: { display: "flex", padding: "10px 22px", borderTop: i ? `1px solid ${PAL2.line}` : "none", font: `400 20px ${MONO2}`, opacity: E2(t, 18.4 + i * 0.35) } }, /* @__PURE__ */ React.createElement("span", { style: { width: 210, color: PAL2.ink3 } }, k), /* @__PURE__ */ React.createElement("span", { style: { color: PAL2.ink } }, v))))), [["p.getClass()", "reads the mirror"], ["x instanceof Point", "compares Klass*"], ["p.toString()", "vtable slot (8.1)"]].map(([l, s], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: l }, /* @__PURE__ */ React.createElement(Box, { x: 96 + i * 340, y: 650, w: 316, h: 96, label: l, sub: s, tone: "pull", fs: 20, sfs: 17, a: E2(t, 25 + i * 0.8), glow: pulse2(t, [25 + i * 0.8], 1) }))), /* @__PURE__ */ React.createElement(Arrow, { pts: [[1052, 698], [1240, 698], [1240, 588]], draw: M(t, 27.4, 0.7), color: PAL2.pull }), /* @__PURE__ */ React.createElement(Txt2, { x: 1272, y: 668, mono: true, fs: 17, color: PAL2.pull, a: E2(t, 28) }, "all start from the class word"), /* @__PURE__ */ React.createElement(Callout, { x: 96, y: 790, w: 1728, tone: "blue", a: E2(t, 32), fs: 21, title: "compressed class space", text: "Every Klass lives in one reserved region, 1 GB by default (`CompressedClassSpaceSize`). A 32-bit offset reaches all of it, so the class word needs only 4 bytes. Turn compressed class pointers off and it takes 8, making the header 16." }));
  }

  // src/topics/8.4/scenes2.jsx
  var {
    PAL: PAL3,
    MOTION: MOTION3,
    lerp: lerp2,
    win: win2,
    pulse: pulse3,
    step: step2,
    track: track3,
    clamp: clamp3,
    hexA: hexA3,
    MONO: MONO3,
    SANS: SANS2,
    Txt: Txt3,
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
    Bytes: Bytes2,
    Brace: Brace2,
    Stat,
    Mark: Mark2,
    toneColor: toneColor3
  } = window.AN;
  var E3 = MOTION3.enter;
  var M2 = MOTION3.move;
  var POP2 = MOTION3.pop;
  function SDeclOrder({ t }) {
    const X = 160, U = 40, Y = 610;
    const [hl, hA] = window.AN.hlAt(t, [[12.5, 1], [18.5, 2], [25.5, 3], [32, 4], [38, -1]]);
    const next = step2(t, [[12.5, 12], [13.5, 13], [20, 20], [27, 32], [32.5, 36], [38.5, 40]], 0);
    const waste = step2(t, [[18.5, 3], [25.5, 7], [38.5, 11]], 0);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 196, w: 700, h: 310, title: "Order.java", a: E3(t, 0.5), fs: 21, lh: 40, hl, hlA: hA, lines: ORDER_SRC }), /* @__PURE__ */ React.createElement(Card2, { x: 840, y: 196, w: 984, h: 150, a: E3(t, 6), tone: "pull", num: "natural alignment", title: "A field of size n starts at an offset divisible by n.", sub: "ints at 4, 8, 12, 16\u2026   longs at 8, 16, 24\u2026", tfs: 28, sfs: 21 }), /* @__PURE__ */ React.createElement(Stat, { x: 840, y: 392, w: 560, label: "next free offset", value: String(next), a: E3(t, 12.5) }), /* @__PURE__ */ React.createElement(Stat, { x: 840, y: 440, w: 560, label: "bytes wasted on padding", value: String(waste), color: waste ? PAL3.bad : PAL3.ink, a: E3(t, 12.5) }), /* @__PURE__ */ React.createElement(Badge2, { x: 1630, y: 420, text: "IF the JVM kept source order", tone: "ink", a: E3(t, 12.5), fs: 17 }), /* @__PURE__ */ React.createElement(Txt3, { x: X, y: Y - 40, mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 1.5) }, "DECLARATION ORDER \xB7 BYTE OFFSETS"), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: X, top: Y, width: 40 * U, height: 70, boxSizing: "border-box", borderRadius: 6, border: `2px dashed ${PAL3.line2}`, opacity: E3(t, 1.5) * (1 - E3(t, 38.5)) } }), /* @__PURE__ */ React.createElement(Txt3, { x: X + 20 * U, y: Y + 22, anchor: "mid", mono: true, fs: 20, color: PAL3.ink3, a: E3(t, 1.5) * (1 - E3(t, 12.3)) }, "where should each field go?"), /* @__PURE__ */ React.createElement(Blk, { x0: X, y: Y, unit: U, off: 0, n: 8, label: "mark", tone: TONE.mark, a: E3(t, 12.5) }), /* @__PURE__ */ React.createElement(Blk, { x0: X, y: Y, unit: U, off: 8, n: 4, label: "class", tone: TONE.klass, a: E3(t, 12.8) }), /* @__PURE__ */ React.createElement(Blk, { x0: X, y: Y, unit: U, off: 12, n: 1, label: "p", tone: TONE.field, a: E3(t, 13.5), glow: pulse3(t, [13.5], 1), fs: 17 }), /* @__PURE__ */ React.createElement(Blk, { x0: X, y: Y, unit: U, off: 13, n: 3, label: "3", tone: "bad", pad: true, a: E3(t, 18.5), glow: pulse3(t, [18.5], 1.2) }), /* @__PURE__ */ React.createElement(Blk, { x0: X, y: Y, unit: U, off: 16, n: 4, label: "qty", tone: TONE.field, a: E3(t, 20) }), /* @__PURE__ */ React.createElement(Blk, { x0: X, y: Y, unit: U, off: 20, n: 4, label: "4", tone: "bad", pad: true, a: E3(t, 25.5), glow: pulse3(t, [25.5], 1.2) }), /* @__PURE__ */ React.createElement(Blk, { x0: X, y: Y, unit: U, off: 24, n: 8, label: "id", tone: TONE.field, a: E3(t, 27) }), /* @__PURE__ */ React.createElement(Blk, { x0: X, y: Y, unit: U, off: 32, n: 4, label: "cust", tone: TONE.ref, a: E3(t, 32.5) }), /* @__PURE__ */ React.createElement(Blk, { x0: X, y: Y, unit: U, off: 36, n: 4, label: "4", tone: "bad", pad: true, a: E3(t, 38.5), glow: pulse3(t, [38.5], 1.2) }), /* @__PURE__ */ React.createElement(Ruler, { x0: X, y: Y + 78, unit: U, marks: [0, 8, 12], a: E3(t, 12.5) }), /* @__PURE__ */ React.createElement(Ruler, { x0: X, y: Y + 78, unit: U, marks: [13, 16], a: E3(t, 18.5) }), /* @__PURE__ */ React.createElement(Ruler, { x0: X, y: Y + 78, unit: U, marks: [20, 24], a: E3(t, 25.5) }), /* @__PURE__ */ React.createElement(Ruler, { x0: X, y: Y + 78, unit: U, marks: [32, 36], a: E3(t, 32) }), /* @__PURE__ */ React.createElement(Ruler, { x0: X, y: Y + 78, unit: U, marks: [40], a: E3(t, 38.5) }), /* @__PURE__ */ React.createElement(Arrow2, { from: [X + 13 * U, Y - 8], to: [X + 16 * U + 4, Y - 8], curve: -34, draw: M2(t, 18.8, 0.7), color: PAL3.bad }), /* @__PURE__ */ React.createElement(Txt3, { x: X + 14.5 * U, y: Y - 92, anchor: "mid", mono: true, fs: 17, color: PAL3.bad, a: E3(t, 19.4) * (1 - E3(t, 25.3, 0.3)) }, "13 % 4 \u2260 0 \u2192 16"), /* @__PURE__ */ React.createElement(Arrow2, { from: [X + 20 * U, Y - 8], to: [X + 24 * U + 4, Y - 8], curve: -34, draw: M2(t, 25.8, 0.7), color: PAL3.bad }), /* @__PURE__ */ React.createElement(Txt3, { x: X + 22 * U, y: Y - 92, anchor: "mid", mono: true, fs: 17, color: PAL3.bad, a: E3(t, 26.4) }, "20 % 8 \u2260 0 \u2192 24"), /* @__PURE__ */ React.createElement(Brace2, { x: X + 36 * U, y: Y + 108, w: 4 * U, label: "to a multiple of 8", tone: "bad", a: E3(t, 39), fs: 17 }), /* @__PURE__ */ React.createElement(Badge2, { x: 960, y: 790, text: "40 bytes \xB7 11 of them padding", tone: "bad", a: POP2(t, 39.5), fs: 22, solid: true }), /* @__PURE__ */ React.createElement(Callout2, { x: 96, y: 840, w: 1728, tone: "flow", a: E3(t, 45), fs: 21, text: "HotSpot never uses this order. It computes a better layout when the class is loaded." }));
  }
  var MOVES = [
    // [label, n, srcOff, dstOff, tone, at]
    ["id", 8, 24, 16, TONE.field, 5],
    ["qty", 4, 16, 12, TONE.field, 11.5],
    ["p", 1, 12, 24, TONE.field, 17.5],
    ["cust", 4, 32, 28, TONE.ref, 19.5]
  ];
  function SReorder({ t }) {
    const X = 96, U = 36, Y1 = 236, Y2 = 404;
    const dim = 1 - 0.6 * E3(t, 4.5, 0.8);
    const RULES = [
      [5, "1", "Longs and doubles first, then ints, shorts, bytes."],
      [11.5, "2", "Smaller fields drop into holes: `qty` fills 12\u201316."],
      [17.5, "3", "References grouped into one block, after the primitives."],
      [38.5, "4", "So the GC scans one run of pointers per object."],
      [45.5, "5", "Parent fields keep their offsets; since JDK 15 a subclass may fill their holes."]
    ];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt3, { x: X, y: 200, mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 0.5) }, "SOURCE ORDER"), /* @__PURE__ */ React.createElement("div", { style: { opacity: dim } }, /* @__PURE__ */ React.createElement(Bytes2, { x: X, y: Y1, unit: U, h: 66, fs: 17, sfs: 17, ruler: false, a: E3(t, 0.5), cells: [
      { n: 8, label: "mark", tone: TONE.mark },
      { n: 4, label: "class", tone: TONE.klass },
      { n: 1, label: "p", tone: TONE.field },
      { n: 3, pad: true, tone: "bad" },
      { n: 4, label: "qty", tone: TONE.field },
      { n: 4, pad: true, tone: "bad" },
      { n: 8, label: "id", tone: TONE.field },
      { n: 4, label: "cust", tone: TONE.ref },
      { n: 4, pad: true, tone: "bad" }
    ] })), /* @__PURE__ */ React.createElement(Badge2, { x: 1690, y: Y1 + 33, text: "40 bytes", tone: "bad", a: E3(t, 0.8), fs: 18 }), /* @__PURE__ */ React.createElement(Txt3, { x: X, y: Y2 - 36, mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 4.6) }, "HOTSPOT ORDER \xB7 JDK 17 \xB7 AS JOL REPORTS IT"), /* @__PURE__ */ React.createElement(Blk, { x0: X, y: Y2, unit: U, off: 0, n: 8, h: 66, label: "mark", tone: TONE.mark, a: E3(t, 4.8), fs: 17 }), /* @__PURE__ */ React.createElement(Blk, { x0: X, y: Y2, unit: U, off: 8, n: 4, h: 66, label: "class", tone: TONE.klass, a: E3(t, 4.8), fs: 17 }), MOVES.map(([l, n, s, d, tone, at]) => {
      const p = M2(t, at, 1.3);
      if (t < at) return null;
      return /* @__PURE__ */ React.createElement(Blk, { key: l, x0: X, y: lerp2(Y1, Y2, p), unit: U, off: lerp2(s, d, p), n, h: 66, label: l, tone, fs: 17, glow: pulse3(t, [at + 1.3], 1) });
    }), /* @__PURE__ */ React.createElement(Blk, { x0: X, y: Y2, unit: U, off: 25, n: 3, h: 66, pad: true, tone: "bad", a: E3(t, 21.2) }), /* @__PURE__ */ React.createElement(Ruler, { x0: X, y: Y2 + 74, unit: U, marks: [0, 8, 12, 16, 24, 25, 28, 32], a: E3(t, 21.5) }), /* @__PURE__ */ React.createElement(Badge2, { x: 1690, y: Y2 + 33, text: "32 bytes", tone: "flow", a: POP2(t, 24.5), fs: 18, solid: true }), /* @__PURE__ */ React.createElement(Txt3, { x: 1690, y: Y2 + 72, anchor: "mid", mono: true, fs: 17, color: PAL3.flow, a: E3(t, 25) }, "3 wasted, not 11"), /* @__PURE__ */ React.createElement(Console2, { x: 96, y: 530, w: 1e3, h: 394, t, a: E3(t, 1), fs: 18, lh: 30, items: [
      { at: 1.4, text: "java -jar jol-cli.jar internals -cp . Order", kind: "cmd" },
      { at: 2, text: "OFF  SZ               TYPE DESCRIPTION", kind: "dim" },
      { at: 5, text: "  0   8                    (object header: mark)" },
      { at: 5.2, text: "  8   4                    (object header: class)" },
      { at: 12.9, text: " 12   4                int Order.qty", kind: "ok" },
      { at: 13.1, text: " 16   8               long Order.id", kind: "ok" },
      { at: 18.9, text: " 24   1            boolean Order.paid", kind: "ok" },
      { at: 21.2, text: " 25   3                    (alignment/padding gap)" },
      { at: 21.4, text: " 28   4   java.lang.Object Order.customer", kind: "ok" },
      { at: 24.6, text: "Instance size: 32 bytes", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(Panel2, { x: 1140, y: 530, w: 684, h: 394, title: "how HotSpot places fields", tone: "flow", a: E3(t, 5) }, /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 22px" } }, RULES.map(([at, n, s]) => /* @__PURE__ */ React.createElement("div", { key: n, style: { display: "flex", gap: 14, margin: "10px 0", opacity: E3(t, at), font: `400 20px ${SANS2}`, color: PAL3.ink, lineHeight: 1.35 } }, /* @__PURE__ */ React.createElement("span", { style: { font: `600 20px ${MONO3}`, color: PAL3.pull } }, n), /* @__PURE__ */ React.createElement("span", null, window.AN.fmt(s)))))));
  }
  function SAlignment({ t }) {
    const X = 144, U = 17, Y = 250;
    const objs = [
      [0, [[12, "hdr", TONE.mark], [8, "x y", TONE.field], [4, "", "ink", true]], "Point \xB7 24 B"],
      [24, [[12, "hdr", TONE.mark], [4, "qty", TONE.field], [8, "id", TONE.field], [1, "", TONE.field], [3, "", "bad", true], [4, "c", TONE.ref]], "Order \xB7 32 B"],
      [56, [[12, "hdr", TONE.mark], [8, "x y", TONE.field], [4, "", "ink", true]], "Point \xB7 24 B"]
    ];
    const bin = (h) => {
      const v = parseInt(h.slice(-2), 16).toString(2).padStart(8, "0");
      return [v.slice(0, 4) + " " + v.slice(4, 5), v.slice(5)];
    };
    const addrs = ["0x7ff4235b8", "0x7ff4235c8", "0x7ff4235d8", "0x70080269e8"];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt3, { x: X + 96 * U, y: 392, anchor: "right", mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 4.5) }, "A STRETCH OF HEAP \xB7 TICKS EVERY 8 BYTES"), Array.from({ length: 13 }).map((_, k) => /* @__PURE__ */ React.createElement(React.Fragment, { key: k }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: X + k * 8 * U - 1, top: Y - 14, width: 2, height: 108, background: hexA3(PAL3.ink2, 0.35), opacity: E3(t, 4.5 + k * 0.05) } }), /* @__PURE__ */ React.createElement(Txt3, { x: X + k * 8 * U, y: Y + 100, anchor: "mid", mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 4.5 + k * 0.05) }, "+" + k * 8))), objs.map(([o, cells, name], i) => {
      let off = o;
      const a = E3(t, 1 + i * 0.6);
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, cells.map(([n, l, tone, pad], j) => {
        const el = /* @__PURE__ */ React.createElement(Blk, { key: j, x0: X, y: Y, unit: U, off, n, h: 80, label: l, tone, pad, a, fs: 17, glow: (i === 0 && pad ? win2(t, 11, 17.4) : 0) + (i === 1 && pad ? win2(t, 17.5, 23.4) : 0) });
        off += n;
        return el;
      }), /* @__PURE__ */ React.createElement(Txt3, { x: X + (o + (i === 1 ? 16 : 12)) * U, y: Y - 44, anchor: "mid", mono: true, fs: 17, color: PAL3.ink, a }, name));
    }), /* @__PURE__ */ React.createElement(Blk, { x0: X, y: Y, unit: U, off: 80, n: 16, h: 80, label: "free", dashed: true, tone: "ink", a: E3(t, 2.8), fs: 17 }), /* @__PURE__ */ React.createElement(Brace2, { x: X + 20 * U, y: Y + 128, w: 4 * U, label: "external loss: 4 B", tone: "pull", a: E3(t, 11.4), fs: 17 }), /* @__PURE__ */ React.createElement(Brace2, { x: X + 49 * U, y: Y + 128, w: 3 * U, label: "internal loss: 3 B", tone: "bad", a: E3(t, 17.8), fs: 17 }), /* @__PURE__ */ React.createElement(Panel2, { x: 96, y: 460, w: 840, h: 330, title: "one load or two", a: E3(t, 23.5), tone: "flow" }, /* @__PURE__ */ React.createElement("div", null)), [0, 1].map((r) => /* @__PURE__ */ React.createElement(React.Fragment, { key: r }, /* @__PURE__ */ React.createElement(Blk, { x0: 136, y: 540 + r * 120, unit: 40, off: 0, n: 8, h: 56, label: "word A", tone: "ink", dashed: true, a: E3(t, 23.8), fs: 17 }), /* @__PURE__ */ React.createElement(Blk, { x0: 136, y: 540 + r * 120, unit: 40, off: 8, n: 8, h: 56, label: "word B", tone: "ink", dashed: true, a: E3(t, 23.8), fs: 17 }))), /* @__PURE__ */ React.createElement(Blk, { x0: 136, y: 604, unit: 40, off: 0, n: 8, h: 32, label: "long @0", tone: "flow", a: E3(t, 24.4), fs: 17 }), /* @__PURE__ */ React.createElement(Blk, { x0: 136, y: 724, unit: 40, off: 4, n: 8, h: 32, label: "long @4", tone: "bad", a: E3(t, 25.4), fs: 17 }), /* @__PURE__ */ React.createElement(Txt3, { x: 856, y: 584, anchor: "mid", mono: true, fs: 18, color: PAL3.flow, a: E3(t, 24.6) }, "1 load"), /* @__PURE__ */ React.createElement(Txt3, { x: 856, y: 704, anchor: "mid", mono: true, fs: 18, color: PAL3.bad, a: E3(t, 25.6) }, "2 loads"), /* @__PURE__ */ React.createElement(Txt3, { x: 856, y: 730, anchor: "mid", mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 25.6) }, "+ stitching"), /* @__PURE__ */ React.createElement(Panel2, { x: 980, y: 460, w: 844, h: 330, title: "real object addresses \xB7 JDK 17", right: "JOL addressOf", a: E3(t, 30), tone: "pull" }, /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 24px" } }, addrs.map((h, i) => {
      const [hi, lo] = bin(h);
      return /* @__PURE__ */ React.createElement("div", { key: h, style: { display: "flex", justifyContent: "space-between", font: `500 22px ${MONO3}`, color: PAL3.ink, height: 56, alignItems: "center", opacity: E3(t, 30.4 + i * 0.4) } }, /* @__PURE__ */ React.createElement("span", null, h), /* @__PURE__ */ React.createElement("span", { style: { color: PAL3.ink3 } }, "\u2026", hi, /* @__PURE__ */ React.createElement("span", { style: { color: PAL3.pull, fontWeight: 700 } }, lo)));
    }))), /* @__PURE__ */ React.createElement(Callout2, { x: 96, y: 820, w: 1728, tone: "pull", a: E3(t, 36), fs: 21, text: "The low **three bits of every object address are 000**. Bits that are always zero don't need to be stored. That's the whole idea behind compressed oops." }));
  }
  function SJol({ t }) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Console2, { x: 96, y: 196, w: 1e3, h: 290, t, a: E3(t, 0.5), fs: 17, lh: 30, items: [
      { at: 1.4, text: "java -jar jol-cli.jar internals java.lang.Integer", kind: "cmd" },
      { at: 5.8, text: "OFF  SZ   TYPE DESCRIPTION               VALUE", kind: "dim" },
      { at: 6.5, text: "  0   8        (object header: mark)     0x0000000000000001 (non-biasable; age: 0)" },
      { at: 6.8, text: "  8   4        (object header: class)    0x00040f28" },
      { at: 7.1, text: " 12   4    int Integer.value             0", kind: "ok" },
      { at: 7.4, text: "Instance size: 16 bytes", kind: "ok" },
      { at: 7.7, text: "Space losses: 0 bytes internal + 0 bytes external = 0 bytes total", kind: "dim" }
    ] }), /* @__PURE__ */ React.createElement(Bytes2, { x: 96, y: 524, unit: 50, h: 72, fs: 19, sfs: 17, ruler: false, a: E3(t, 11.5), cells: [
      { n: 8, label: "mark word", tone: TONE.mark },
      { n: 4, label: "class", tone: TONE.klass },
      { n: 4, label: "value", sub: "int", tone: TONE.field, glow: win2(t, 11.5, 17) }
    ] }), /* @__PURE__ */ React.createElement(Txt3, { x: 930, y: 548, mono: true, fs: 22, color: PAL3.flow, a: E3(t, 12) }, "16 B"), /* @__PURE__ */ React.createElement(Code2, { x: 1140, y: 196, w: 684, h: 380, title: "Measure.java \xB7 jol-core", a: E3(t, 17.5), fs: 19, lh: 34, hl: t < 23.5 ? 3 : 7, hlA: win2(t, 17.8, 30), lines: [
      "import org.openjdk.jol.info.*;",
      "",
      "// shallow: one object's layout",
      "ClassLayout.parseClass(Order.class)",
      "           .toPrintable();",
      "",
      "// deep: everything reachable",
      "GraphLayout.parseInstance(map)",
      "           .totalSize();"
    ] }), /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 650, w: 1728, h: 270, lang: "plain", title: "GraphLayout.parseInstance(map).toFootprint()", right: "HashMap<Integer,Integer> \xB7 1M entries \xB7 JDK 17", a: E3(t, 23.8), fs: 19, lh: 32, hl: 5, hlA: E3(t, 30.5), lines: [
      { s: "     COUNT       AVG       SUM   DESCRIPTION", o: 0.6 },
      "         1   8388624   8388624   [Ljava.util.HashMap$Node;",
      "   2000000        16  32000000   java.lang.Integer",
      "         1        48        48   java.util.HashMap",
      "   1000000        32  32000000   java.util.HashMap$Node",
      "   3000002            72388672   (total)"
    ] }), /* @__PURE__ */ React.createElement(Badge2, { x: 1482, y: 612, text: '"I think this is big" \u2192 a number', tone: "pull", a: E3(t, 37), fs: 18 }));
  }
  var NARROW = "00000001000000000100110100111101";
  function SCoopsDecode({ t }) {
    const CW2 = 30, BY = 548;
    const sh = M2(t, 13.5, 1.4);
    const x0 = lerp2(760, 670, sh);
    const zeros = E3(t, 15, 0.5);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 196, w: 620, h: 176, title: "Decode.java", a: E3(t, 0.5), fs: 21, lh: 36, lines: ["class Line {", "    Point start = new Point();", "}"] }), /* @__PURE__ */ React.createElement(Console2, { x: 760, y: 196, w: 1064, h: 176, t, a: E3(t, 1), fs: 17, lh: 28, items: [
      { at: 1.4, text: "java -Xmx16g -Xlog:gc+heap+coops=debug -cp jol-cli.jar:. Decode", kind: "cmd" },
      { at: 2, text: "Heap address: 0x0000007000800000, size: 16384 MB,", kind: "dim" },
      { at: 2.3, text: "Compressed Oops mode: Non-zero disjoint base: 0x0000007000000000, Oop shift amount: 3", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(Txt3, { x: 96, y: 398, mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 3) }, "LINE OBJECT"), /* @__PURE__ */ React.createElement(Bytes2, { x: 96, y: 426, unit: 40, h: 70, fs: 17, sfs: 17, ruler: false, a: E3(t, 3), cells: [
      { n: 8, label: "mark", tone: TONE.mark },
      { n: 4, label: "class", tone: TONE.klass },
      { n: 4, label: "0x01004d3d", sub: "start", tone: TONE.ref, glow: win2(t, 7, 13) }
    ] }), /* @__PURE__ */ React.createElement(Arrow2, { pts: [[656, 462], [720, 462], [720, BY + 24], [x0 - 8, BY + 24]], draw: M2(t, 8, 0.7), color: PAL3.pull, a: 1 - E3(t, 13.2, 0.3) }), /* @__PURE__ */ React.createElement(Txt3, { x: 96, y: BY + 8, mono: true, fs: 22, color: PAL3.ink2, a: E3(t, 8.6) }, t < 15.4 ? "stored value" : "value << 3  (\xD7 8)"), /* @__PURE__ */ React.createElement(BitRow, { x: x0, y: BY, cw: CW2, h: 48, fs: 18, bits: NARROW, labels: false, a: E3(t, 8.6), groups: [{ from: 0, n: 32, tone: "pull" }] }), /* @__PURE__ */ React.createElement(BitRow, { x: 670 + 32 * CW2, y: BY, cw: CW2, h: 48, fs: 18, bits: "000", labels: false, a: zeros, groups: [{ from: 0, n: 3, tone: "green", glow: win2(t, 15, 26) }] }), /* @__PURE__ */ React.createElement(Txt3, { x: 1678, y: BY + 60, anchor: "mid", mono: true, fs: 17, color: PAL3.green, a: E3(t, 19.5) }, "always 000"), /* @__PURE__ */ React.createElement(Panel2, { x: 96, y: 636, w: 1728, h: 168, a: E3(t, 8.6), tone: "pull" }, /* @__PURE__ */ React.createElement(Lines, { fs: 28, lh: 1.45, pad: "14px 30px", lines: [
      { s: "  narrow oop      0x01004d3d", a: 1 },
      { s: "  << 3          = 0x00080269e8", a: E3(t, 16) },
      { s: "+ heap base       0x7000000000", a: E3(t, 27), c: PAL3.violet }
    ] })), /* @__PURE__ */ React.createElement(Panel2, { x: 1100, y: 652, w: 700, h: 136, a: E3(t, 33.5), tone: "flow", glow: pulse3(t, [33.6], 1.4) }, /* @__PURE__ */ React.createElement("div", { style: { padding: "18px 26px", font: `600 34px ${MONO3}`, color: PAL3.flow } }, "= 0x70080269e8"), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 26px", font: `400 18px ${MONO3}`, color: PAL3.ink2 } }, "JOL addressOf(line.start) = 0x70080269e8")), /* @__PURE__ */ React.createElement(Mark2, { x: 1750, y: 720, ok: true, a: POP2(t, 34.4) }), /* @__PURE__ */ React.createElement(Callout2, { x: 96, y: 826, w: 1728, tone: "flow", a: win2(t, 40.5, 46.8), fs: 21, title: "cost", text: "The JIT emits this decode on every reference load: one shift and one add. Cheap enough to be on by default." }), /* @__PURE__ */ React.createElement(Callout2, { x: 96, y: 826, w: 1728, tone: "violet", a: E3(t, 47), fs: 21, title: "zero-based mode \xB7 smaller heap", text: "At `-Xmx2g` the base was 0, so the shift alone is the address: `0x610e4d3c << 3` = `0x3087269e0`, exactly where the Point was. HotSpot picks the simplest mode that fits the heap." }));
  }
  function SCoops32({ t }) {
    const X = 160, W = 1600, Y = 370;
    const gx = (g) => X + g / 32 * W;
    const marks = [[4, 16.5], [16, 17.5], [31, 22.5]];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt3, { x: 960, y: 206, anchor: "mid", mono: true, fs: 46, weight: 600, a: E3(t, 4.5) }, "2", /* @__PURE__ */ React.createElement("sup", { style: { fontSize: 26 } }, "32"), " = 4,294,967,296 values"), /* @__PURE__ */ React.createElement(Txt3, { x: 960, y: 278, anchor: "mid", mono: true, fs: 30, color: PAL3.pull, a: E3(t, 9.5) }, "\xD7 8 bytes per value = 32 GB of addressable heap"), /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      left: X,
      top: Y,
      width: W,
      height: 90,
      boxSizing: "border-box",
      borderRadius: 10,
      border: `2px solid ${PAL3.pull}`,
      background: hexA3(PAL3.pull, 0.08),
      opacity: E3(t, 1),
      backgroundImage: `repeating-linear-gradient(90deg, transparent 0 24px, ${hexA3(PAL3.pull, 0.22)} 24px 25px)`
    } }), [0, 4, 8, 12, 16, 20, 24, 28, 32].map((g) => /* @__PURE__ */ React.createElement(Txt3, { key: g, x: gx(g), y: Y + 100, anchor: "mid", mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 1.2) }, g, " GB")), /* @__PURE__ */ React.createElement(Txt3, { x: X + W, y: Y - 34, anchor: "right", mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 1) }, "THE 32 GB WINDOW A 4-BYTE REFERENCE CAN REACH"), marks.map(([g, at]) => /* @__PURE__ */ React.createElement(React.Fragment, { key: g }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: X, top: Y + 18, width: g / 32 * W * E3(t, at, 1), height: 54, borderRadius: 8, background: hexA3(PAL3.flow, 0.16), border: `2px solid ${hexA3(PAL3.flow, 0.7)}`, boxSizing: "border-box", opacity: g === 31 ? E3(t, at, 0.3) : win2(t, at, at + (g === 4 ? 1 : 5)) } }), /* @__PURE__ */ React.createElement(Txt3, { x: gx(g) - 12, y: Y + 32, anchor: "right", mono: true, fs: 20, color: PAL3.flow, a: g === 31 ? E3(t, at + 0.6) : win2(t, at + 0.4, at + (g === 4 ? 1 : 5)) }, `-Xmx${g}g \u2713`))), /* @__PURE__ */ React.createElement(Blk, { x0: X, y: Y + 18, unit: W / 32, off: 0, n: 0.35, h: 54, pad: true, tone: "violet", a: E3(t, 30.5) }), /* @__PURE__ */ React.createElement(Txt3, { x: X + 30, y: Y - 34, mono: true, fs: 17, color: PAL3.violet, a: E3(t, 30.8) }, "\u2199 protected page at the base"), /* @__PURE__ */ React.createElement(Box2, { x: 1564, y: Y + 132, w: 260, h: 70, label: "-Xmx32g \u2717", sub: "doesn't fit", tone: "bad", fs: 20, sfs: 17, a: E3(t, 26), glow: pulse3(t, [26], 1.2) }), /* @__PURE__ */ React.createElement(Console2, { x: 96, y: 600, w: 1100, h: 200, t, a: E3(t, 22.5), fs: 17, lh: 30, items: [
      { at: 22.8, text: "java -Xmx31g -XX:+PrintFlagsFinal -version | grep -w UseCompressedOops", kind: "cmd" },
      { at: 23.3, text: "     bool UseCompressedOops   = true    {product lp64_product} {ergonomic}", kind: "ok" },
      { at: 25.5, text: "java -Xmx32g -XX:+PrintFlagsFinal -version | grep -w UseCompressedOops", kind: "cmd" },
      { at: 26, text: "     bool UseCompressedOops   = false   {product lp64_product} {default}", kind: "err" }
    ] }), /* @__PURE__ */ React.createElement(Callout2, { x: 1240, y: 600, w: 584, tone: "violet", a: E3(t, 30.5), fs: 19, title: "why not exactly 32g?", text: "The window must also cover a protected page at the heap base (16 MB at -Xmx31g, per the log). A full 32 GB heap can't fit." }), /* @__PURE__ */ React.createElement(Callout2, { x: 96, y: 826, w: 1728, tone: "pull", a: E3(t, 37), fs: 21, title: "ObjectAlignmentInBytes=16", text: "Shift by 4 instead of 3 and the window becomes 64 GB (JDK 17: `-Xmx60g` keeps compressed oops). The price: every object is padded to 16, and `Point` grows from 24 to 32 bytes." }));
  }
  function SCliff({ t }) {
    const X = 96, U = 30;
    const R = 1.226;
    const cx = (g) => 300 + (g - 24) / 24 * 1440, cy = (g) => 880 - (g - 22) / 20 * 210;
    const draw = clamp3((t - 26.5) / 5, 0, 1);
    const pts = [];
    for (let g = 24; g <= 48.001; g += 0.25) {
      if (g > 24 + 24 * draw) break;
      const v = g < 32 ? Math.min(g, 31) : g / R;
      if (g >= 32 && pts.length && pts[pts.length - 1][2] < 32) pts.push([cx(32), cy(31), 32]);
      pts.push([cx(g), cy(v), g]);
    }
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt3, { x: X, y: 194, mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 0.5) }, "Order \xB7 COMPRESSED OOPS (DEFAULT)"), /* @__PURE__ */ React.createElement(Bytes2, { x: X, y: 222, unit: U, h: 56, fs: 17, sfs: 17, ruler: false, a: E3(t, 0.5), cells: [
      { n: 8, label: "mark", tone: TONE.mark },
      { n: 4, label: "class", tone: TONE.klass },
      { n: 4, label: "qty", tone: TONE.field },
      { n: 8, label: "id", tone: TONE.field },
      { n: 1, tone: TONE.field },
      { n: 3, pad: true },
      { n: 4, label: "cust", tone: TONE.ref }
    ] }), /* @__PURE__ */ React.createElement(Badge2, { x: 1120, y: 250, text: "32 B", tone: "flow", a: E3(t, 1), fs: 20 }), /* @__PURE__ */ React.createElement(Txt3, { x: X, y: 302, mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 5.5) }, "Order \xB7 -XX:-UseCompressedOops"), /* @__PURE__ */ React.createElement(Bytes2, { x: X, y: 330, unit: U, h: 56, fs: 17, sfs: 17, ruler: false, a: E3(t, 5.5), cells: [
      { n: 8, label: "mark", tone: TONE.mark },
      { n: 4, label: "class", tone: TONE.klass, glow: win2(t, 13, 19.4) },
      { n: 4, label: "qty", tone: TONE.field },
      { n: 8, label: "id", tone: TONE.field },
      { n: 1, tone: TONE.field },
      { n: 7, pad: true, tone: "bad" },
      { n: 8, label: "customer", tone: TONE.ref, glow: win2(t, 6.5, 13) }
    ] }), /* @__PURE__ */ React.createElement(Badge2, { x: 1400, y: 358, text: "40 B (+25%)", tone: "bad", a: POP2(t, 7.5), fs: 20 }), /* @__PURE__ */ React.createElement(Txt3, { x: X + 12 * U, y: 396, anchor: "mid", mono: true, fs: 17, color: PAL3.blue, a: E3(t, 13.3) }, "class word still 4 B: compressed class pointers stay on (JDK 15+)"), /* @__PURE__ */ React.createElement(Txt3, { x: X, y: 444, mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 19.5) }, "HashMap<Integer,Integer> \xB7 1M ENTRIES \xB7 GraphLayout.totalSize()"), [["compressed", 72.39, "flow", 19.8], ["uncompressed", 88.78, "bad", 20.6]].map(([l, mb, tone, at], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: l }, /* @__PURE__ */ React.createElement(Txt3, { x: X, y: 480 + i * 48, mono: true, fs: 19, color: PAL3.ink2, a: E3(t, at) }, l), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 300, top: 476 + i * 48, height: 34, width: mb * 13 * E3(t, at, 0.8), borderRadius: 6, background: hexA3(toneColor3(tone), 0.3), border: `2px solid ${toneColor3(tone)}`, boxSizing: "border-box", opacity: E3(t, at) } }), /* @__PURE__ */ React.createElement(Txt3, { x: 300 + mb * 13 + 16, y: 480 + i * 48, mono: true, fs: 19, color: toneColor3(tone), a: E3(t, at + 0.6) }, mb.toFixed(1), " MB"))), /* @__PURE__ */ React.createElement(Panel2, { x: 96, y: 590, w: 1728, h: 340, title: "how much of that data fits, by -Xmx", right: "illustration \xB7 uses the measured 1.23\xD7 growth", a: E3(t, 26.5) }), /* @__PURE__ */ React.createElement("svg", { width: "1920", height: "1080", style: { position: "absolute", left: 0, top: 0, opacity: E3(t, 26.8) } }, /* @__PURE__ */ React.createElement("rect", { x: cx(32), y: cy(31), width: cx(38) - cx(32), height: cy(22) - cy(31), fill: hexA3(PAL3.bad, 0.12 * E3(t, 40)) }), /* @__PURE__ */ React.createElement("line", { x1: cx(24), y1: cy(31), x2: cx(48), y2: cy(31), stroke: PAL3.ink3, strokeWidth: "1.5", strokeDasharray: "6 6" }), /* @__PURE__ */ React.createElement("line", { x1: cx(24), y1: cy(22), x2: cx(48), y2: cy(22), stroke: PAL3.line2, strokeWidth: "2" }), pts.length > 1 && /* @__PURE__ */ React.createElement("polyline", { points: pts.map((p) => p[0] + "," + p[1]).join(" "), fill: "none", stroke: PAL3.flow, strokeWidth: "4", strokeLinejoin: "round" })), [24, 28, 31, 32, 38, 44, 48].map((g) => /* @__PURE__ */ React.createElement(Txt3, { key: g, x: cx(g), y: cy(22) + 8, anchor: "mid", mono: true, fs: 17, color: g === 32 ? PAL3.bad : PAL3.ink3, a: E3(t, 27) }, g, "g")), /* @__PURE__ */ React.createElement(Txt3, { x: cx(24) + 6, y: cy(31) - 30, mono: true, fs: 17, color: PAL3.ink2, a: E3(t, 27.5) }, "what -Xmx31g holds"), /* @__PURE__ */ React.createElement(Txt3, { x: cx(32) - 14, y: cy(32 / R) + 8, anchor: "right", mono: true, fs: 17, color: PAL3.bad, a: E3(t, 33) }, "32g holds what 26g held \u2192"), /* @__PURE__ */ React.createElement(Txt3, { x: cx(35), y: cy(22) - 30, anchor: "mid", mono: true, fs: 18, weight: 600, color: PAL3.bad, a: E3(t, 40) }, "dead zone"), /* @__PURE__ */ React.createElement(Txt3, { x: cx(38) + 12, y: cy(31) + 8, mono: true, fs: 17, color: PAL3.flow, a: E3(t, 40.5) }, "break-even \u2248 38g"), /* @__PURE__ */ React.createElement(Badge2, { x: 1580, y: 650, text: "stay \u2264 31g, or go well past 40g", tone: "pull", a: E3(t, 47), fs: 18, solid: true }));
  }

  // src/topics/8.4/scenes3.jsx
  var {
    PAL: PAL4,
    MOTION: MOTION4,
    lerp: lerp3,
    win: win3,
    pulse: pulse4,
    step: step3,
    track: track4,
    clamp: clamp4,
    hexA: hexA4,
    MONO: MONO4,
    SANS: SANS3,
    Txt: Txt4,
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
    Bytes: Bytes3,
    Brace: Brace3,
    Stat: Stat2,
    Mark: Mark3,
    toneColor: toneColor4
  } = window.AN;
  var E4 = MOTION4.enter;
  var M3 = MOTION4.move;
  var POP3 = MOTION4.pop;
  function SBoxing({ t }) {
    const OX = 1060, U = 40;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel3, { x: 96, y: 196, w: 520, h: 300, title: "int n = 1000;", tone: "flow", a: E4(t, 0.5) }, /* @__PURE__ */ React.createElement("div", { style: { padding: "18px 22px", font: `400 19px ${SANS3}`, color: PAL4.ink2 } }, "the value sits right in the slot")), /* @__PURE__ */ React.createElement(Box3, { x: 196, y: 300, w: 320, h: 100, label: "1000", sub: "n \xB7 4 bytes", tone: "flow", fs: 34, sfs: 18, a: E4(t, 1), glow: pulse4(t, [1.2], 1) }), /* @__PURE__ */ React.createElement(Panel3, { x: 660, y: 196, w: 1164, h: 300, title: "Integer m = 1000;", tone: "pull", a: E4(t, 5.5) }, /* @__PURE__ */ React.createElement("div", { style: { padding: "18px 22px", font: `400 19px ${SANS3}`, color: PAL4.ink2 } }, "the slot holds a reference; the value lives in an object")), /* @__PURE__ */ React.createElement(Box3, { x: 700, y: 300, w: 240, h: 100, label: "\u2192 ref", sub: "m \xB7 4 bytes", tone: "pull", fs: 28, sfs: 18, a: E4(t, 12), glow: pulse4(t, [12.2], 1) }), /* @__PURE__ */ React.createElement(Arrow3, { from: [944, 350], to: [OX - 8, 350], draw: M3(t, 12.4, 0.6), color: PAL4.pull }), /* @__PURE__ */ React.createElement(Bytes3, { x: OX, y: 300, unit: U, h: 100, fs: 20, sfs: 17, ruler: false, a: E4(t, 6), cells: [
      { n: 8, label: "mark word", sub: "8", tone: TONE.mark, a: E4(t, 6) },
      { n: 4, label: "class", sub: "4", tone: TONE.klass, a: E4(t, 6.6) },
      { n: 4, label: "1000", sub: "value", tone: TONE.field, a: E4(t, 7.2), glow: win3(t, 7.2, 11) }
    ] }), /* @__PURE__ */ React.createElement(Txt4, { x: OX + 8 * U, y: 418, anchor: "mid", mono: true, fs: 18, color: PAL4.ink2, a: E4(t, 7.6) }, "Integer object \xB7 16 bytes (JOL)"), /* @__PURE__ */ React.createElement(Txt4, { x: 356, y: 530, anchor: "mid", mono: true, fs: 40, weight: 600, color: PAL4.flow, a: E4(t, 17.5) }, "4 bytes"), /* @__PURE__ */ React.createElement(Txt4, { x: 1242, y: 530, anchor: "mid", mono: true, fs: 40, weight: 600, color: PAL4.pull, a: E4(t, 17.5) * (1 - E4(t, 37.6, 0.4)) }, "4 + 16 = 20 bytes"), /* @__PURE__ */ React.createElement(Txt4, { x: 1242, y: 530, anchor: "mid", mono: true, fs: 34, weight: 600, color: PAL4.bad, a: E4(t, 38) }, "no compressed oops: 8 + 16 = 24"), /* @__PURE__ */ React.createElement(Badge3, { x: 780, y: 556, text: "5\xD7 per element", tone: "bad", a: POP3(t, 19), fs: 22, solid: true }), /* @__PURE__ */ React.createElement(Panel3, { x: 96, y: 630, w: 840, h: 290, title: "Integer.valueOf(100) \xB7 twice", tone: "flow", a: E4(t, 24) }), /* @__PURE__ */ React.createElement(Box3, { x: 130, y: 700, w: 150, h: 70, label: "a", sub: "ref", tone: "pull", fs: 22, sfs: 17, a: E4(t, 24.4) }), /* @__PURE__ */ React.createElement(Box3, { x: 130, y: 810, w: 150, h: 70, label: "b", sub: "ref", tone: "pull", fs: 22, sfs: 17, a: E4(t, 24.8) }), /* @__PURE__ */ React.createElement(Box3, { x: 520, y: 740, w: 360, h: 100, label: "Integer(100)", sub: "IntegerCache: -128\u2026127", tone: "flow", fs: 22, sfs: 17, a: E4(t, 25.2), glow: pulse4(t, [26.6], 1.2) }), /* @__PURE__ */ React.createElement(Arrow3, { from: [284, 735], to: [516, 776], draw: M3(t, 25.6, 0.6), color: PAL4.flow }), /* @__PURE__ */ React.createElement(Arrow3, { from: [284, 845], to: [516, 806], draw: M3(t, 26, 0.6), color: PAL4.flow }), /* @__PURE__ */ React.createElement(Badge3, { x: 700, y: 688, text: "a == b  \u2192 true", tone: "flow", a: E4(t, 27), fs: 18 }), /* @__PURE__ */ React.createElement(Panel3, { x: 984, y: 630, w: 840, h: 290, title: "Integer.valueOf(1000) \xB7 twice", tone: "pull", a: E4(t, 31) }), /* @__PURE__ */ React.createElement(Box3, { x: 1018, y: 700, w: 150, h: 70, label: "c", sub: "ref", tone: "pull", fs: 22, sfs: 17, a: E4(t, 31.4) }), /* @__PURE__ */ React.createElement(Box3, { x: 1018, y: 810, w: 150, h: 70, label: "d", sub: "ref", tone: "pull", fs: 22, sfs: 17, a: E4(t, 31.8) }), /* @__PURE__ */ React.createElement(Box3, { x: 1420, y: 690, w: 360, h: 84, label: "Integer(1000)", sub: "new \xB7 16 B", tone: "pull", fs: 22, sfs: 17, a: E4(t, 32.2) }), /* @__PURE__ */ React.createElement(Box3, { x: 1420, y: 800, w: 360, h: 84, label: "Integer(1000)", sub: "new \xB7 16 B", tone: "pull", fs: 22, sfs: 17, a: E4(t, 32.8) }), /* @__PURE__ */ React.createElement(Arrow3, { from: [1172, 735], to: [1416, 732], draw: M3(t, 32.4, 0.6), color: PAL4.pull }), /* @__PURE__ */ React.createElement(Arrow3, { from: [1172, 845], to: [1416, 842], draw: M3(t, 33, 0.6), color: PAL4.pull }), /* @__PURE__ */ React.createElement(Badge3, { x: 1300, y: 790, text: "c == d  \u2192 false", tone: "bad", a: E4(t, 34), fs: 18 }));
  }
  var MB = 16.2;
  var ROWS = [
    ["int[]", 5, [[4, "ints", "flow"]], "4.0 MB \xB7 1\xD7"],
    ["Integer[]", 10.5, [[4, "refs", "violet"], [16, "1M Integer objects", "pull"]], "20.0 MB \xB7 5\xD7"],
    ["ArrayList<Integer>", 17, [[4.86, "array", "violet"], [16, "1M Integer objects", "pull"]], "20.9 MB"],
    ["HashMap<Integer,Integer>", 22.5, [[8.39, "table", "blue"], [32, "1M Node objects", "violet"], [32, "2M Integer objects", "pull"]], "72.4 MB \xB7 18\xD7"]
  ];
  function SMillion({ t }) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: 196, mono: true, fs: 17, color: PAL4.ink3, a: E4(t, 0.5) }, "1,000,000 VALUES (1000\u20261000999) \xB7 GraphLayout.totalSize() \xB7 JDK 17"), ROWS.map(([name, at, segs, total], i) => {
      const y = 246 + i * 104;
      let x = 400;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: name }, /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: y + 24, mono: true, fs: 20, color: PAL4.ink, a: E4(t, 1 + i * 0.3) }, name), segs.map(([mb, l, tone], j) => {
        const w = mb * MB, x0 = x;
        x += w;
        const a = E4(t, at + 0.3 + j * 0.5, 0.6);
        return /* @__PURE__ */ React.createElement("div", { key: j, style: { position: "absolute", left: x0, top: y, width: w * a, height: 76, boxSizing: "border-box", borderRadius: 6, background: hexA4(toneColor4(tone), 0.22), border: `2px solid ${toneColor4(tone)}`, opacity: a, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", font: `600 18px ${MONO4}`, color: PAL4.ink, whiteSpace: "nowrap" } }, w > 70 ? l : "");
      }), /* @__PURE__ */ React.createElement(Txt4, { x: x + 16, y: y + 24, mono: true, fs: 20, weight: 600, color: i === 3 ? PAL4.bad : PAL4.ink2, a: E4(t, at + 1.2) }, total));
    }), /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: 686, mono: true, fs: 17, color: PAL4.ink3, a: E4(t, 30) }, "ONE HashMap.Node \xB7 32 BYTES"), /* @__PURE__ */ React.createElement(Bytes3, { x: 96, y: 718, unit: 40, h: 80, fs: 19, sfs: 17, ruler: false, a: E4(t, 30), cells: [
      { n: 8, label: "mark word", tone: TONE.mark },
      { n: 4, label: "class", tone: TONE.klass },
      { n: 4, label: "hash", sub: "int", tone: TONE.field },
      { n: 4, label: "key", sub: "ref", tone: TONE.ref },
      { n: 4, label: "value", sub: "ref", tone: TONE.ref },
      { n: 4, label: "next", sub: "ref", tone: TONE.ref },
      { n: 4, label: "pad", pad: true }
    ] }), /* @__PURE__ */ React.createElement(Ruler, { x0: 96, y: 806, unit: 40, marks: [0, 8, 12, 16, 20, 24, 28, 32], a: E4(t, 30) }), /* @__PURE__ */ React.createElement(Callout3, { x: 1440, y: 704, w: 384, tone: "bad", a: E4(t, 37), fs: 20, text: "The numbers themselves: 2M \xD7 4 B = **8 MB** of the 72." }));
  }
  function SArrays({ t }) {
    const X = 96, U = 44, Y1 = 236, Y2 = 410;
    const objs = [[150, 640], [900, 700], [1500, 640]];
    const refX = (i) => X + (16 + i * 4 + 2) * U;
    const chase = (i) => {
      const s = 31.5 + i * 1.6;
      const p = M3(t, s, 1.1);
      if (p <= 0 || p >= 1) return null;
      const [ox, oy] = objs[i];
      return /* @__PURE__ */ React.createElement(Dot3, { key: i, x: lerp3(refX(i), ox + 130, p), y: lerp3(Y2 + 70, oy, p), color: PAL4.pull, r: 9 });
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt4, { x: X, y: 200, mono: true, fs: 18, color: PAL4.ink2, a: E4(t, 0.5) }, "new int[]", "{", "7, 8, 9", "}", "  \xB7  JOL: 32 bytes"), /* @__PURE__ */ React.createElement(Bytes3, { x: X, y: Y1, unit: U, h: 74, fs: 19, sfs: 17, ruler: false, a: E4(t, 0.6), cells: [
      { n: 8, label: "mark word", tone: TONE.mark, a: E4(t, 1.2) },
      { n: 4, label: "class", tone: TONE.klass, a: E4(t, 1.5) },
      { n: 4, label: "3", sub: "length", tone: TONE.len, a: E4(t, 1.8), glow: win3(t, 6, 12) },
      { n: 4, label: "7", tone: TONE.field, a: E4(t, 2.1) },
      { n: 4, label: "8", tone: TONE.field, a: E4(t, 2.3) },
      { n: 4, label: "9", tone: TONE.field, a: E4(t, 2.5) },
      { n: 4, label: "pad", pad: true, a: E4(t, 2.8) }
    ] }), /* @__PURE__ */ React.createElement(Ruler, { x0: X, y: Y1 + 80, unit: U, marks: [0, 8, 12, 16, 20, 24, 28, 32], a: E4(t, 2) }), /* @__PURE__ */ React.createElement(Badge3, { x: 1650, y: Y1 + 37, text: "1 object", tone: "flow", a: E4(t, 25), fs: 20 }), /* @__PURE__ */ React.createElement(Txt4, { x: X, y: Y2 - 36, mono: true, fs: 18, color: PAL4.ink2, a: E4(t, 12.5) }, "new Integer[]", "{", "1000, 2000, 3000", "}", "  \xB7  same shape, 32 bytes"), /* @__PURE__ */ React.createElement(Bytes3, { x: X, y: Y2, unit: U, h: 74, fs: 19, sfs: 17, ruler: false, a: E4(t, 12.5), cells: [
      { n: 8, label: "mark word", tone: TONE.mark },
      { n: 4, label: "class", tone: TONE.klass },
      { n: 4, label: "3", sub: "length", tone: TONE.len },
      { n: 4, label: "\u2192", sub: "ref", tone: TONE.ref, glow: win3(t, 18.5, 24) },
      { n: 4, label: "\u2192", sub: "ref", tone: TONE.ref, glow: win3(t, 18.5, 24) },
      { n: 4, label: "\u2192", sub: "ref", tone: TONE.ref, glow: win3(t, 18.5, 24) },
      { n: 4, label: "pad", pad: true }
    ] }), /* @__PURE__ */ React.createElement(Badge3, { x: 1650, y: Y2 + 37, text: "1 + 3 objects", tone: "bad", a: E4(t, 25), fs: 20 }), /* @__PURE__ */ React.createElement(Panel3, { x: 96, y: 540, w: 1728, h: 250, title: "heap", a: E4(t, 18.5) }), objs.map(([ox, oy], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, /* @__PURE__ */ React.createElement(Box3, { x: ox, y: oy, w: 260, h: 74, label: `Integer(${(i + 1) * 1e3})`, sub: "16 B", tone: "pull", fs: 20, sfs: 17, a: E4(t, 19 + i * 0.5), glow: pulse4(t, [32.6 + i * 1.6], 0.9) }), /* @__PURE__ */ React.createElement(Arrow3, { from: [refX(i), Y2 + 76], to: [ox + 130, oy - 4], draw: M3(t, 19.2 + i * 0.5, 0.7), color: PAL4.pull }))), [0, 1, 2].map(chase), /* @__PURE__ */ React.createElement(Callout3, { x: 96, y: 810, w: 1728, tone: "pull", a: win3(t, 25, 37.8), fs: 21, text: "`int[1000]` is **one** object. `Integer[1000]` is **1,001**: the array plus a thousand separate objects, each reached by following a pointer." }), /* @__PURE__ */ React.createElement(Callout3, { x: 96, y: 810, w: 1728, tone: "violet", a: E4(t, 38), fs: 21, title: "2D arrays too", text: "`int[1000][1000]` is an array of 1,000 references to 1,000 separate row arrays: 1,001 objects, and the rows can sit anywhere." }));
  }
  var LX = 230;
  var LY = 272;
  var CW = 52;
  var LH = 70;
  var B_OBJ = [[3, 9], [1, 2], [4, 12], [2, 6], [3, 1], [1, 11], [4, 4], [2, 13]];
  function SCacheLines({ t }) {
    const phaseB = t >= 18.6;
    const aA = win3(t, 1.2, 18.6, 0.4), aB = E4(t, 19, 0.4);
    const kA = Math.floor(clamp4((t - 6.5) / 0.22, -1, 43));
    const lineOf = (k) => k < 12 ? 0 : k < 28 ? 1 : 2;
    const missesA = kA < 0 ? 0 : lineOf(kA) + 1;
    const jB = Math.floor(clamp4((t - 19.5) / 1.1, -1, 7));
    const missesB = jB < 0 ? 0 : 1 + (jB + 1);
    const cellA = (line, c) => {
      const idx = line * 16 + c - 4;
      return idx;
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel3, { x: 96, y: 196, w: 1100, h: 452, title: phaseB ? "memory \xB7 Integer[] with scattered objects" : "memory \xB7 int[] in 64-byte cache lines", a: E4(t, 0.5), tone: phaseB ? "bad" : "flow" }), [0, 1, 2, 3, 4].map((ln) => /* @__PURE__ */ React.createElement(Txt4, { key: ln, x: 120, y: LY + ln * LH + 14, mono: true, fs: 17, color: PAL4.ink3, a: E4(t, 1) }, `line ${ln}`)), aA > 0.01 && [0, 1, 2].map((ln) => Array.from({ length: 16 }).map((_, c) => {
      const idx = cellA(ln, c);
      const hdr = idx < 0;
      const read = !hdr && idx <= kA;
      const lineLoaded = kA >= 0 && (ln <= lineOf(kA) || t > 12.5 && ln === lineOf(kA) + 1);
      const c0 = hdr ? PAL4.ink3 : read ? PAL4.green : lineLoaded ? PAL4.flow : PAL4.ink3;
      return /* @__PURE__ */ React.createElement("div", { key: ln + "-" + c, style: { position: "absolute", left: LX + c * CW, top: LY + ln * LH, width: CW - 4, height: LH - 14, boxSizing: "border-box", borderRadius: 5, opacity: aA, border: `2px solid ${hexA4(c0, 0.8)}`, background: hexA4(c0, read ? 0.25 : 0.08), display: "flex", alignItems: "center", justifyContent: "center", font: `600 17px ${MONO4}`, color: hdr ? PAL4.ink3 : PAL4.ink } }, hdr ? "h" : idx);
    })), aA > 0.01 && t > 12.5 && /* @__PURE__ */ React.createElement(Badge3, { x: LX + 16 * CW + 66, y: LY + 2 * LH + 28, text: "prefetched", tone: "flow", a: aA * E4(t, 12.5), fs: 17 }), aB > 0.01 && Array.from({ length: 16 }).map((_, c) => {
      const isRef = c >= 4 && c < 12;
      const j = c - 4;
      const read = isRef && j <= jB;
      const c0 = !isRef ? PAL4.ink3 : read ? PAL4.green : PAL4.pull;
      return /* @__PURE__ */ React.createElement("div", { key: "r" + c, style: { position: "absolute", left: LX + c * CW, top: LY, width: CW - 4, height: LH - 14, boxSizing: "border-box", borderRadius: 5, opacity: aB, border: `2px solid ${hexA4(c0, 0.8)}`, background: hexA4(c0, read ? 0.22 : 0.08), display: "flex", alignItems: "center", justifyContent: "center", font: `600 17px ${MONO4}`, color: isRef ? PAL4.ink : PAL4.ink3 } }, c < 4 ? "h" : isRef ? "\u2192" : "\xB7");
    }), aB > 0.01 && [1, 2, 3, 4].map((ln) => Array.from({ length: 16 }).map((_, c) => {
      const k = B_OBJ.findIndex(([l, cc]) => l === ln && c >= cc && c < cc + 1);
      const hit = k >= 0 && k <= jB;
      const c0 = k >= 0 ? hit ? PAL4.bad : PAL4.pull : PAL4.ink3;
      return /* @__PURE__ */ React.createElement("div", { key: ln + "b" + c, style: { position: "absolute", left: LX + c * CW, top: LY + ln * LH, width: CW - 4, height: LH - 14, boxSizing: "border-box", borderRadius: 5, opacity: aB * (k >= 0 ? 1 : 0.5), border: `2px solid ${hexA4(c0, k >= 0 ? 0.9 : 0.3)}`, background: hexA4(c0, hit ? 0.3 : 0.05), display: "flex", alignItems: "center", justifyContent: "center", font: `600 17px ${MONO4}`, color: k >= 0 ? PAL4.ink : PAL4.ink3 } }, k >= 0 ? "I" : "");
    })), aB > 0.01 && jB >= 0 && (() => {
      const [l, c] = B_OBJ[jB];
      const p = M3(t, 19.5 + jB * 1.1, 0.5);
      return /* @__PURE__ */ React.createElement(Arrow3, { from: [LX + (4 + jB) * CW + 25, LY + 56], to: [lerp3(LX + (4 + jB) * CW + 25, LX + c * CW + 25, p), lerp3(LY + 56, LY + l * LH, p)], color: PAL4.bad, width: 2.5, a: aB });
    })(), /* @__PURE__ */ React.createElement(Txt4, { x: LX, y: LY + 5 * LH - 4, mono: true, fs: 17, color: PAL4.ink3, a: E4(t, 1.5) }, phaseB ? "I = an Integer object \xB7 \u2192 = a reference in the array" : "h = array header \xB7 each cell = one 4-byte int"), /* @__PURE__ */ React.createElement(Panel3, { x: 1240, y: 196, w: 584, h: 452, title: "CPU view", a: E4(t, 3) }, /* @__PURE__ */ React.createElement("div", { style: { padding: "18px 24px", font: `400 20px ${SANS3}`, color: PAL4.ink2, lineHeight: 1.5 } }, /* @__PURE__ */ React.createElement("div", null, "one cache line = ", /* @__PURE__ */ React.createElement("b", { style: { color: PAL4.ink } }, "64 bytes"), " = 16 ints"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 18, font: `600 22px ${MONO4}`, color: phaseB ? PAL4.bad : PAL4.flow } }, phaseB ? `elements read: ${Math.max(0, jB + 1)}` : `elements read: ${Math.max(0, Math.min(kA + 1, 44))}`), /* @__PURE__ */ React.createElement("div", { style: { font: `600 22px ${MONO4}`, color: PAL4.bad } }, "lines fetched: ", phaseB ? missesB : Math.min(3, missesA)), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 18, opacity: E4(t, 26) } }, "cache hit \u2248 ", /* @__PURE__ */ React.createElement("b", { style: { color: PAL4.green } }, "1 ns")), /* @__PURE__ */ React.createElement("div", { style: { opacity: E4(t, 26.4) } }, "miss to DRAM \u2248 ", /* @__PURE__ */ React.createElement("b", { style: { color: PAL4.bad } }, "~100 ns")), /* @__PURE__ */ React.createElement("div", { style: { opacity: E4(t, 27), marginTop: 8, fontSize: 18, color: PAL4.ink3 } }, "(order of magnitude; varies by CPU)"))), /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: 672, mono: true, fs: 17, color: PAL4.ink3, a: E4(t, 33) }, "SUM OF 10M VALUES \xB7 JDK 17 \xB7 THIS MACHINE \xB7 AFTER WARM-UP (ONE OF 3 SIMILAR RUNS)"), [["int[]", 6.5, "flow", 33.2], ["Integer[] \xB7 scattered", 49.2, "bad", 34.2], ["Integer[] \xB7 allocation order", 6.7, "pull", 41]].map(([l, ms, tone, at], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: l }, /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: 712 + i * 56, mono: true, fs: 19, color: PAL4.ink, a: E4(t, at) }, l), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 520, top: 706 + i * 56, width: ms * 22 * E4(t, at, 0.9), height: 38, borderRadius: 6, background: hexA4(toneColor4(tone), 0.28), border: `2px solid ${toneColor4(tone)}`, boxSizing: "border-box", opacity: E4(t, at) } }), /* @__PURE__ */ React.createElement(Txt4, { x: 520 + ms * 22 + 16, y: 712 + i * 56, mono: true, fs: 19, weight: 600, color: toneColor4(tone), a: E4(t, at + 0.7) }, ms, " ms"))), /* @__PURE__ */ React.createElement(Badge3, { x: 980, y: 842, text: "7.5\xD7 slower", tone: "bad", a: POP3(t, 35.5) * (1 - E4(t, 40.6, 0.3)), fs: 22, solid: true }), /* @__PURE__ */ React.createElement(Txt4, { x: 720, y: 892, mono: true, fs: 17, color: PAL4.pull, a: E4(t, 42) }, "fresh Integers sat 16 bytes apart: 0x7ff4235b8, \u20265c8, \u20265d8, \u20265e8"));
  }

  // src/topics/8.4/scenes4.jsx
  var {
    PAL: PAL5,
    MOTION: MOTION5,
    lerp: lerp4,
    win: win4,
    pulse: pulse5,
    step: step4,
    clamp: clamp5,
    hexA: hexA5,
    MONO: MONO5,
    SANS: SANS4,
    Txt: Txt5,
    Panel: Panel4,
    Box: Box4,
    Code: Code4,
    Console: Console4,
    HArrow: HArrow4,
    VArrow: VArrow4,
    Arrow: Arrow4,
    Dot: Dot4,
    Card: Card4,
    Badge: Badge4,
    Callout: Callout4,
    Table: Table4,
    Bytes: Bytes4,
    Brace: Brace4,
    Mark: Mark4,
    toneColor: toneColor5
  } = window.AN;
  var E5 = MOTION5.enter;
  var M4 = MOTION5.move;
  var POP4 = MOTION5.pop;
  var C = (n, label, tone, pad) => ({ n, label, tone, pad });
  var CMP = [
    // [name, before cells, after cells, before size, after size, at]
    ["Point", [C(8, "mark", TONE.mark), C(4, "cls", TONE.klass), C(4, "x", TONE.field), C(4, "y", TONE.field), C(4, "", "ink", true)], [C(8, "mark", TONE.mark), C(4, "x", TONE.field), C(4, "y", TONE.field)], 24, 16, 19],
    ["Integer", [C(8, "mark", TONE.mark), C(4, "cls", TONE.klass), C(4, "val", TONE.field)], [C(8, "mark", TONE.mark), C(4, "val", TONE.field), C(4, "", "ink", true)], 16, 16, 26],
    [
      "Order",
      [C(8, "mark", TONE.mark), C(4, "cls", TONE.klass), C(4, "qty", TONE.field), C(8, "id", TONE.field), C(1, "", TONE.field), C(3, "", "ink", true), C(4, "cust", TONE.ref)],
      [C(8, "mark", TONE.mark), C(8, "id", TONE.field), C(4, "qty", TONE.field), C(1, "", TONE.field), C(3, "", "ink", true), C(4, "cust", TONE.ref), C(4, "", "ink", true)],
      32,
      32,
      32.5
    ],
    ["int[3]", [C(8, "mark", TONE.mark), C(4, "cls", TONE.klass), C(4, "len", TONE.len), C(12, "7  8  9", TONE.field), C(4, "", "ink", true)], [C(8, "mark", TONE.mark), C(4, "len", TONE.len), C(12, "7  8  9", TONE.field)], 32, 24, 39.5]
  ];
  function SCompact({ t }) {
    const X = 128, CW2 = 26, U = 22, BX = 360, AX = 1110;
    const groups = [
      { from: 0, n: 22, tone: "blue", label: "class pointer \xB7 22 bits", glow: win4(t, 6, 12.4) },
      { from: 22, n: 31, tone: "pull", label: "identity hash \xB7 31 bits" },
      { from: 53, n: 4, tone: "dim", label: "Valhalla", glow: 0 },
      { from: 57, n: 4, tone: "green", label: "age" },
      { from: 61, n: 1, tone: "pink", label: "f", glow: win4(t, 12.5, 18.6) },
      { from: 62, n: 2, tone: "flow", label: "lock" }
    ];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt5, { x: 960, y: 196, anchor: "mid", mono: true, fs: 17, color: PAL5.ink3, a: E5(t, 0.6) }, "COMPACT HEADER \xB7 ONE 64-BIT WORD \xB7 JDK 25 LAYOUT (markWord.hpp)"), /* @__PURE__ */ React.createElement(BitRow, { x: X, y: 226, cw: CW2, h: 48, bits: hexToBits("010c800000000001"), groups, a: E5(t, 0.6) }), /* @__PURE__ */ React.createElement(Txt5, { x: 960, y: 350, anchor: "mid", mono: true, fs: 24, color: PAL5.ink2, a: E5(t, 6) }, "fresh Point, JDK 25: mark = ", /* @__PURE__ */ React.createElement("span", { style: { color: PAL5.blue } }, "0x010c8"), "00000000001  \xB7 JOL calls it \u201CLilliput\u201D"), /* @__PURE__ */ React.createElement(HeaderMerge, { t }), /* @__PURE__ */ React.createElement(Txt5, { x: BX, y: 410, mono: true, fs: 17, color: PAL5.ink3, a: E5(t, 18.6) }, "DEFAULT HEADER \xB7 12 BYTES"), /* @__PURE__ */ React.createElement(Txt5, { x: AX, y: 410, mono: true, fs: 17, color: PAL5.ink3, a: E5(t, 18.6) }, "-XX:+UseCompactObjectHeaders \xB7 8 BYTES"), CMP.map(([name, before, after, bs, as, at], i) => {
      const y = 446 + i * 92;
      const a = E5(t, at);
      let ob = 0, oa = 0;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: name }, /* @__PURE__ */ React.createElement(Txt5, { x: 96, y: y + 6, mono: true, fs: 21, weight: 600, color: PAL5.ink, a }, name), /* @__PURE__ */ React.createElement(Txt5, { x: 96, y: y + 36, mono: true, fs: 19, color: as < bs ? PAL5.flow : PAL5.ink2, a: E5(t, at + 1) }, bs, " \u2192 ", as, " B"), before.map((c, j) => {
        const el = /* @__PURE__ */ React.createElement(Blk, { key: "b" + j, x0: BX, y, unit: U, off: ob, n: c.n, h: 62, label: c.label, tone: c.tone, pad: c.pad, a, fs: 17 });
        ob += c.n;
        return el;
      }), after.map((c, j) => {
        const el = /* @__PURE__ */ React.createElement(Blk, { key: "a" + j, x0: AX, y, unit: U, off: oa, n: c.n, h: 62, label: c.label, tone: c.tone, pad: c.pad, a: E5(t, at + 0.6), fs: 17, glow: as < bs ? pulse5(t, [at + 1], 1.2) : 0 });
        oa += c.n;
        return el;
      }));
    }), /* @__PURE__ */ React.createElement(Callout4, { x: 96, y: 826, w: 1728, tone: "flow", a: E5(t, 46), fs: 21, title: "across a whole heap", text: "Savings come in 8-byte steps, so small objects gain most. JEP 519 reports SPECjbb2015 using **22% less heap** and 8% less CPU time." }));
  }
  function HeaderMerge({ t }) {
    const a = E5(t, 0.8) * (1 - E5(t, 18, 0.5));
    if (a <= 0.01) return null;
    const X0 = 560, U = 50, Y = 470;
    const p = M4(t, 3.5, 1.6);
    const cw = lerp4(4 * U, 22 / 64 * 8 * U, p);
    return /* @__PURE__ */ React.createElement("div", { style: { opacity: a } }, /* @__PURE__ */ React.createElement(Txt5, { x: 960, y: 420, anchor: "mid", mono: true, fs: 20, color: PAL5.ink2 }, p < 0.5 ? "default: mark word + class pointer = 12 bytes" : "compact: one 8-byte word"), /* @__PURE__ */ React.createElement(Blk, { x0: X0, y: Y, unit: U, off: 0, n: 8, h: 86, label: p < 0.5 ? "mark word" : "", sub: p < 0.5 ? "8 bytes" : "", tone: TONE.mark, fs: 22 }), p >= 0.5 && /* @__PURE__ */ React.createElement(Txt5, { x: X0 + (cw + 8 * U) / 2, y: Y + 28, anchor: "mid", mono: true, fs: 20, color: PAL5.ink }, "hash \xB7 age \xB7 lock"), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: lerp4(X0 + 8 * U, X0, p), top: Y, width: cw, height: 86, boxSizing: "border-box", borderRadius: 6, background: hexA5(PAL5.blue, 0.22), border: `2px solid ${PAL5.blue}`, display: "flex", alignItems: "center", justifyContent: "center", font: `600 20px ${MONO5}`, color: PAL5.ink, whiteSpace: "nowrap", overflow: "hidden" } }, p < 0.5 ? "class \xB7 4 B" : "class \xB7 22 bits"), /* @__PURE__ */ React.createElement(Txt5, { x: X0 + lerp4(12, 8, p) * U + 20, y: Y + 28, mono: true, fs: 26, weight: 600, color: p < 0.5 ? PAL5.ink2 : PAL5.flow }, p < 0.5 ? "12 B" : "8 B"), /* @__PURE__ */ React.createElement(Ruler, { x0: X0, y: Y + 96, unit: U, marks: p < 0.5 ? [0, 8, 12] : [0, 8] }));
  }
  var REL = [
    ["JDK 24", "Mar 2025", "Experimental", "JEP 450", "needs UnlockExperimentalVMOptions", "ink", 4],
    ["JDK 25 \xB7 LTS", "Sep 2025", "Product feature", "JEP 519", "one flag, off by default", "flow", 10.5],
    ["JDK 26", "Mar 2026", "Product feature", "", "still off by default", "flow", 14],
    ["JDK 27", "Sep 2026", "On by default", "JEP 534", "opt out with a minus", "pull", 17]
  ];
  function SCompactTimeline({ t }) {
    const [hl, hA] = window.AN.hlAt(t, [[4, 1], [10.5, 3], [17, 5], [24, 5]]);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 150, top: 452, width: 1620, height: 4, background: PAL5.line2, opacity: E5(t, 1) } }), REL.map(([v, d, what, jep, sub, tone, at], i) => {
      const x = 96 + i * 440;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: v }, /* @__PURE__ */ React.createElement(Card4, { x, y: 196, w: 408, h: 190, a: E5(t, at), tone, num: jep ? `${v} \xB7 ${jep}` : v, title: what, sub, tfs: 28, sfs: 20, glow: win4(t, at, at + 6) * 0.8 }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x + 204 - 12, top: 442, width: 24, height: 24, borderRadius: 12, background: E5(t, at) > 0.5 ? toneColor5(tone) : PAL5.panel2, border: `2px solid ${PAL5.line2}`, opacity: E5(t, 1) } }), /* @__PURE__ */ React.createElement(Txt5, { x: x + 204, y: 482, anchor: "mid", mono: true, fs: 18, color: PAL5.ink3, a: E5(t, 1) }, d), /* @__PURE__ */ React.createElement(Txt5, { x: x + 204, y: 404, anchor: "mid", mono: true, fs: 20, weight: 600, color: PAL5.ink, a: E5(t, 1) * (1 - E5(t, at - 0.3)) }, v.split(" \xB7")[0]));
    }), /* @__PURE__ */ React.createElement(Code4, { x: 96, y: 540, w: 1728, h: 290, lang: "shell", title: "turning it on (or off)", a: E5(t, 4), fs: 22, lh: 36, hl, hlA: hA, lines: [
      "# JDK 24 (experimental)",
      "$ java -XX:+UnlockExperimentalVMOptions -XX:+UseCompactObjectHeaders -jar app.jar",
      "# JDK 25 and 26 (product, off by default)",
      "$ java -XX:+UseCompactObjectHeaders -jar app.jar",
      "# JDK 27+: on by default. To go back to 12-byte headers:",
      "$ java -XX:-UseCompactObjectHeaders -jar app.jar"
    ] }), /* @__PURE__ */ React.createElement(Callout4, { x: 96, y: 850, w: 1728, tone: "pull", a: E5(t, 30), fs: 20, text: "On 25 or 26? Run JOL twice, with and without the flag, and compare `Instance size`. The old layout is still there in 27; JEP 534 plans to deprecate it later." }));
  }
  function SValhalla({ t }) {
    const U = 25, AY = 400;
    const refX = (i) => 96 + (16 + i * 4 + 2) * U;
    const boxes = [96, 366, 636];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code4, { x: 96, y: 196, w: 820, h: 140, title: "today", a: E5(t, 0.5), fs: 21, lh: 36, lines: ["record Point(int x, int y) {}", "Point[] ps = new Point[3];"] }), /* @__PURE__ */ React.createElement(Code4, { x: 1004, y: 196, w: 820, h: 140, title: "Valhalla \xB7 JEP 401 (preview)", tone: "violet", a: E5(t, 11), fs: 21, lh: 36, lines: ["value record Point(int x, int y) {}", "Point[] ps = new Point[3];"] }), /* @__PURE__ */ React.createElement(Txt5, { x: 96, y: AY - 34, mono: true, fs: 17, color: PAL5.ink3, a: E5(t, 2) }, "TODAY \xB7 Point[3] \xB7 32 B ARRAY + 3 \xD7 24 B OBJECTS"), /* @__PURE__ */ React.createElement(Bytes4, { x: 96, y: AY, unit: U, h: 64, fs: 17, sfs: 17, ruler: false, a: E5(t, 2), cells: [
      { n: 8, label: "mark", tone: TONE.mark },
      { n: 4, label: "cls", tone: TONE.klass },
      { n: 4, label: "len", tone: TONE.len },
      { n: 4, label: "\u2192", tone: TONE.ref },
      { n: 4, label: "\u2192", tone: TONE.ref },
      { n: 4, label: "\u2192", tone: TONE.ref },
      { n: 4, pad: true }
    ] }), boxes.map((bx, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, /* @__PURE__ */ React.createElement(Box4, { x: bx, y: 560, w: 250, h: 84, label: "Point \xB7 24 B", sub: "header + x + y", tone: "pull", fs: 19, sfs: 17, a: E5(t, 3 + i * 0.4) }), /* @__PURE__ */ React.createElement(Arrow4, { from: [refX(i), AY + 66], to: [bx + 125, 556], draw: M4(t, 3.2 + i * 0.4, 0.6), color: PAL5.pull }))), /* @__PURE__ */ React.createElement(Card4, { x: 1004, y: 366, w: 820, h: 190, a: E5(t, 11.5), tone: "violet", num: "no identity", title: "`==` compares the fields", sub: "`new Point(17, 3) == new Point(17, 3)` is true. No identity hash, no `synchronized` on it.", tfs: 26, sfs: 20 }), /* @__PURE__ */ React.createElement(Panel4, { x: 1004, y: 584, w: 820, h: 220, title: "JEP 401's example: a flattened Integer[5]", tone: "violet", a: win4(t, 24, 30.8) }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, padding: "22px 22px 10px" } }, ["1|1996", "1|2006", "1|1996", "0|0", "0|0"].map((v, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { flex: 1, height: 64, borderRadius: 8, border: `2px solid ${PAL5.violet}`, background: hexA5(PAL5.violet, 0.12), display: "flex", alignItems: "center", justifyContent: "center", font: `600 20px ${MONO5}`, color: PAL5.ink } }, v))), /* @__PURE__ */ React.createElement("div", { style: { padding: "6px 22px", font: `400 19px ${SANS4}`, color: PAL5.ink2 } }, "null flag + the int, one 64-bit word each. No pointers, no objects.")), /* @__PURE__ */ React.createElement(Panel4, { x: 1004, y: 584, w: 820, h: 220, title: "value record Point(int x, int y), flattened?", tone: "bad", a: E5(t, 31) }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative", height: 120 } }, /* @__PURE__ */ React.createElement(Blk, { x0: 24, y: 26, unit: 11.4, off: 0, n: 1.6, h: 56, label: "", tone: "bad" }), /* @__PURE__ */ React.createElement(Blk, { x0: 24, y: 26, unit: 11.4, off: 1.6, n: 32, h: 56, label: "x \xB7 32 bits", tone: TONE.field }), /* @__PURE__ */ React.createElement(Blk, { x0: 24, y: 26, unit: 11.4, off: 33.6, n: 32, h: 56, label: "y \xB7 32 bits", tone: TONE.field }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 24 + 64 * 11.4, top: 10, width: 3, height: 90, background: PAL5.bad } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 24 + 64 * 11.4 - 70, top: 98, font: `600 17px ${MONO5}`, color: PAL5.bad } }, "64-bit limit")), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 22px", font: `400 19px ${SANS4}`, color: PAL5.ink2 } }, "null flag + 64 bits of data = 65 bits: too big to read atomically.")), /* @__PURE__ */ React.createElement(Callout4, { x: 96, y: 680, w: 820, tone: "violet", a: win4(t, 17.5, 38.3), fs: 20, title: "flattening", text: "Without identity, the JVM may store a value's fields directly inside the array or the field that holds it. JEP 401 lets it; it doesn't promise it." }), /* @__PURE__ */ React.createElement(Callout4, { x: 96, y: 680, w: 820, tone: "pull", a: E5(t, 38.5), fs: 20, title: "status \xB7 October 2026", text: "JEP 401, value objects, is a **preview** integrated for JDK 28 (due March 2027). No released JDK has it. `List<int>` is further out still." }), /* @__PURE__ */ React.createElement(Badge4, { x: 1414, y: 860, text: "today: int[] and IntStream", tone: "pull", a: E5(t, 45.5), fs: 22, solid: true }));
  }
  var TRAPS = [
    [1.5, "\u201CFields sit in memory in source order\u201D", "HotSpot reorders: big primitives first, holes filled, references grouped."],
    [9, "\u201CA bigger -Xmx always means more room\u201D", "At 32g compressed oops switch off. 31g can hold more than 32g."],
    [15.5, "\u201CInteger is a bit bigger than int\u201D", "16-byte object + 4-byte reference: 5\xD7 per element, plus a pointer chase."],
    [22, "\u201CInteger[] is contiguous, like int[]\u201D", "It's contiguous references to objects that can be anywhere."],
    [28, "\u201CObject size = sum of the fields\u201D", "Add the 12-byte header (8 compact) and padding to 8. Measure with JOL."]
  ];
  function STraps({ t }) {
    return TRAPS.map(([at, myth, real], i) => {
      const y = 196 + i * 146;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, /* @__PURE__ */ React.createElement(Box4, { x: 96, y, w: 760, h: 124, label: myth, mono: false, fs: 23, tone: "bad", a: E5(t, at), strike: t > at + 2, style: { whiteSpace: "normal" } }), /* @__PURE__ */ React.createElement(HArrow4, { x1: 870, x2: 940, y: y + 62, a: E5(t, at + 1.5), color: PAL5.flow }), /* @__PURE__ */ React.createElement(Card4, { x: 956, y, w: 868, h: 124, a: E5(t, at + 1.6), tone: "flow", title: real, tfs: 23 }));
    });
  }
  var RECAP = [
    [3, "1", "Header", "8-byte mark word (hash, age, lock) + 4-byte class pointer = 12 bytes."],
    [8.5, "2", "Layout", "Fields reordered, holes filled; every object a multiple of 8."],
    [14, "3", "Compressed oops", "32-bit value \xD7 8 + base. 4-byte references up to `-Xmx31g`."],
    [19.5, "4", "Boxing", "`Integer` = 16 B + a 4 B reference. `int` = 4 B."],
    [25, "5", "Locality", "`Integer[]` is a pointer chase; `int[]` streams through cache lines."],
    [30, "6", "Compact headers", "8-byte headers, default in JDK 27. Check it all with **JOL**."]
  ];
  function SRecap({ t }) {
    return RECAP.map(([at, n, title, sub], i) => /* @__PURE__ */ React.createElement(Card4, { key: n, x: 96 + i % 3 * 584, y: 210 + Math.floor(i / 3) * 290, w: 560, h: 260, num: n, title, sub, tfs: 36, sfs: 25, a: E5(t, at), tone: i === 5 ? "pull" : void 0, glow: i === 5 ? win4(t, 30, 40) : 0 }));
  }

  // src/topics/8.4.jsx
  var chapters = ["Intro", "The header", "Field layout", "Measure with JOL", "Compressed oops", "Boxing", "Arrays and caches", "Compact headers", "Valhalla", "Traps", "Recap"];
  var scenes = [
    { name: "Intro", dur: 24, ch: 0, title: "", C: SIntro },
    { name: "Anatomy", dur: 46, ch: 1, title: "Every object starts with a header", C: SAnatomy },
    { name: "MarkBits", dur: 54, ch: 1, title: "The mark word, bit by bit", C: SMarkBits },
    { name: "MarkStates", dur: 60, ch: 1, title: "One word, many jobs", C: SMarkStates },
    { name: "Ages", dur: 44, ch: 1, title: "The GC age lives in the header too", C: SAges },
    { name: "Klass", dur: 42, ch: 1, title: "The class pointer: 4 bytes into metaspace", C: SKlass },
    { name: "DeclOrder", dur: 52, ch: 2, title: "If fields stayed in source order", C: SDeclOrder },
    { name: "Reorder", dur: 56, ch: 2, title: "HotSpot reorders the fields", C: SReorder },
    { name: "Alignment", dur: 42, ch: 2, title: "Why everything is a multiple of 8", C: SAlignment },
    { name: "Jol", dur: 44, ch: 3, title: "Measure it: JOL", C: SJol },
    { name: "CoopsDecode", dur: 56, ch: 4, title: "A 4-byte reference on a 64-bit JVM", C: SCoopsDecode },
    { name: "Coops32", dur: 46, ch: 4, title: "Why the limit is 32 GB", C: SCoops32 },
    { name: "Cliff", dur: 54, ch: 4, title: "The 32 GB cliff", C: SCliff },
    { name: "Boxing", dur: 46, ch: 5, title: "`Integer` versus `int`", C: SBoxing },
    { name: "Million", dur: 44, ch: 5, title: "A million values", C: SMillion },
    { name: "Arrays", dur: 48, ch: 6, title: "Arrays of objects are arrays of references", C: SArrays },
    { name: "CacheLines", dur: 56, ch: 6, title: "Cache lines: why scattered costs more", C: SCacheLines },
    { name: "Compact", dur: 56, ch: 7, title: "Compact object headers: 12 bytes \u2192 8", C: SCompact },
    { name: "CompactTimeline", dur: 38, ch: 7, title: "When you get compact headers", C: SCompactTimeline },
    { name: "Valhalla", dur: 52, ch: 8, title: "Project Valhalla: not yet", C: SValhalla },
    { name: "Traps", dur: 38, ch: 9, title: "Traps", C: STraps },
    { name: "Recap", dur: 38, ch: 10, title: "Recap", C: SRecap }
  ];
  var captions = {
    Intro: [[0.8, "`Point` holds two ints: 8 bytes of data."], [5.5, "Create one, and it takes 24 bytes on the heap. Where do the other 16 go?"], [11, "A header, then your fields, then padding. Every byte has a reason."], [17.5, "Two small classes, `Point` and `Order`, carry us through. Every number is real JOL output."]],
    Anatomy: [[0.5, "Every object on the heap starts with a **header**, before any of your fields."], [5, "First the **mark word**: 8 bytes the JVM uses for the identity hash, GC age and locking."], [11.5, "Then the **class pointer**: 4 bytes saying which class this object is."], [17.5, "Twelve bytes of header. Then the fields: `x` at offset 12, `y` at 16."], [24, "That ends at 20. Objects are sized in multiples of 8, so 4 bytes of padding follow."], [31, "JOL prints exactly this: offsets, sizes, and the gap."], [38, "Header 12, data 8, padding 4. Only a third of this object is your data."]],
    MarkBits: [[0.5, "Here are the 64 bits of `Point`'s mark word, as JDK 17 lays them out."], [5.5, "A fresh object: all zeros except the last two bits, `01`. Unlocked, and no hash yet."], [12, "31 bits are reserved for the identity hash. But nothing is computed until someone asks."], [18.5, "Call `System.identityHashCode(p)`. The JVM generates a random number: `0x33e5ccce`."], [25, "And writes it into the header, once. Every later call just reads it back."], [31.5, "That stored value is what `Object.toString()` prints: `Point@33e5ccce`."], [38, "Four bits hold the GC age. One bit is left over from biased locking, off since JDK 15."], [45, "The last two bits are the lock state. They decide how to read the other 62."]],
    MarkStates: [[0.5, "The mark word is reused. Its last two bits say what the rest means."], [5, "Unlocked, `01`: the rest holds the hash and the GC age. That's what we just saw."], [11, "Enter `synchronized (p)`. JDK 17 copies the header into a **lock record** on the thread's stack\u2026"], [17.5, "\u2026and points the mark word at it. Lock bits `00`: a thin lock. Real value: `0x16dc3aae0`."], [24.5, "A second thread wants the lock. The JVM inflates it to an `ObjectMonitor`, which keeps the header."], [31.5, "Now the mark word points at the monitor, with bits `10`: a fat lock. Part 09 goes deeper."], [38, "During a copying GC, the old copy's mark word becomes a **forwarding pointer** to the new one: `11`."], [45.5, "The hash survives all of this. It waits in the lock record or monitor and is restored afterwards."], [52, "Since JDK 23, lightweight locking leaves the header in place and records the owner on the thread."]],
    Ages: [[0.5, "Every time a young GC copies a surviving object, it bumps an age counter in its header."], [6, "Our `Point` starts in eden at age 0. The low byte of its mark word: `0x01`."], [11.5, "GC 1 copies it into a survivor space. Age 1: the byte becomes `0x09`."], [17, "GC 2, age 2: `0x11`. GC 3, age 3: `0x19`. Real output from JDK 17 with Serial GC."], [24, "Survive long enough, and the GC promotes it to the old generation."], [30, "The age has only 4 bits. It counts 0 to 15 and can go no higher."], [35.5, "So `MaxTenuringThreshold` tops out at 16, meaning never promote by age. The header sets the limit."]],
    Klass: [[0.5, "The second header word answers one question: what class is this object?"], [5.5, "It holds `0x01015000`. Not an address: a 32-bit offset into the **compressed class space**."], [12, "Add the class-space base, `0x8800000000`. JOL reported a shift of 0, so that is the whole decode."], [18, "The result points at `Point`'s Klass in metaspace: name, size, field layout, vtable."], [25, "`getClass()`, `instanceof`, casts and virtual calls all start by reading this word."], [32, "All Klasses share one region, 1 GB by default. A 4-byte offset reaches every one of them."]],
    DeclOrder: [[0.5, "Now a messier class. `Order` has a boolean, an int, a long and a reference."], [6, "The hardware rule: each field starts at an offset that is a multiple of its own size."], [12.5, "Lay them out in source order. The header takes bytes 0 to 12, so `paid` goes at 12."], [18.5, "`qty` is an int and needs a multiple of 4. 13 isn't, so 3 bytes are wasted. It lands at 16."], [25.5, "`id` is a long: a multiple of 8. 20 is not. Four more bytes wasted, and `id` lands at 24."], [32, "`customer`, a 4-byte compressed reference, fits at 32. That ends at 36."], [38, "The object must end on an 8-byte boundary: 4 more bytes. Total 40, with 11 bytes of air."], [45, "HotSpot doesn't do this. It rearranges the fields first."]],
    Reorder: [[0.5, "HotSpot computes each class's field layout once, when the class is loaded."], [5, "The header stays at 0 to 12. Then the biggest primitive first: `id`, a long, at 16."], [11.5, "That leaves a 4-byte hole at 12. `qty` fits exactly, so it moves in."], [17.5, "`paid` goes right after the long, at 24. The reference, `customer`, comes last, at 28."], [24.5, "Total: 32 bytes instead of 40. Only 3 bytes of padding, between `paid` and `customer`."], [31, "JOL confirms it on JDK 17. The order in your source file is not the order in memory."], [38.5, "References are grouped together so the GC can scan one run of pointers per object."], [45.5, "Superclass fields keep their offsets. Since JDK 15 a subclass may slip small fields into their holes."], [51, "You can't read the layout off the source. Measure it."]],
    Alignment: [[0.5, "Why must objects be multiples of 8 bytes?"], [4.5, "The heap is handed out in 8-byte steps. Every object starts on an 8-byte boundary."], [11, "`Point` needs 20 bytes, so it gets 24. JOL calls those 4 bytes an external loss."], [17.5, "Gaps between fields are internal losses. `Order` has 3 internal, 0 external."], [23.5, "Aligned data can be read in a single memory access. A long split across a boundary could not."], [30, "And a bonus: every object address ends in three zero bits. These are real addresses."], [36, "Three bits that are always zero don't need storing. That idea is compressed oops."]],
    Jol: [[0.5, "You don't have to work any of this out by hand. JOL, Java Object Layout, measures it."], [5.5, "`jol-cli internals` prints the layout of any class. Here, `java.lang.Integer`."], [11.5, "Mark word, class pointer, one int at offset 12. 16 bytes, no waste."], [17.5, "In code, `ClassLayout` gives the same table for a class or a live instance."], [23.5, "`GraphLayout` follows references: the **deep** size of everything reachable."], [30, "A `HashMap` with a million entries: 72 MB, and most of it is not your ints."], [37, 'JOL turns "I think this is big" into a number.']],
    CoopsDecode: [[0.5, "A 64-bit JVM should need 8-byte references. HotSpot stores 4. Here's the trick, on a real object."], [6.5, "`Line` holds one reference, `start`, at offset 12. The 4 bytes there read `0x01004d3d`."], [13, "That's not an address. Shift it left by 3 bits, which multiplies it by 8."], [19.5, "Three zero bits appear on the right. Objects start on 8-byte boundaries, so they were always zero."], [27, "Then add the heap base the JVM chose at startup, `0x7000000000`. The log prints both."], [33.5, "Result: `0x70080269e8`. JOL's `addressOf` reports exactly that address for the `Point`."], [40.5, "The JIT does this on every reference load: one shift, one add. Cheap enough to be the default."], [47, "With `-Xmx2g` the base was zero, so the shift alone gives the address."]],
    Coops32: [[0.5, "So how far can a 32-bit value reach?"], [4.5, "32 bits give about 4.3 billion different values."], [9.5, "Each one names an 8-byte slot, not a single byte. 4.3 billion \xD7 8 bytes = 32 GB."], [16.5, "Any heap that fits inside that window can use 4-byte references."], [22.5, "Measured on JDK 17: at `-Xmx31g`, `UseCompressedOops` is true."], [26, "At `-Xmx32g` it is false. The JVM switches it off silently, with no warning."], [30.5, "Why not exactly 32? The window must also cover a protected page at the heap base."], [37, "`-XX:ObjectAlignmentInBytes=16` stretches the window to 64 GB, but pads every object to 16."]],
    Cliff: [[0.5, "What happens to `Order` with compressed oops off? Run JOL with `-XX:-UseCompressedOops`."], [6.5, "`customer` grows to 8 bytes and needs an 8-aligned slot. `Order` grows from 32 to 40 bytes."], [13, "The class word stays 4 bytes: compressed class pointers have been independent since JDK 15."], [19.5, "A million-entry `HashMap<Integer,Integer>`: 72 MB with compressed oops, 89 MB without."], [26.5, "So raise `-Xmx` from 31g to 32g, and the same data needs about 23% more space."], [33, "32 GB now holds what 26 GB held. You added memory and lost capacity."], [40, "For this data you'd need about 38 GB just to break even. That's the dead zone."], [47, "Rule: stay at 31g or below, or jump well past 40. Check with `-XX:+PrintFlagsFinal`."]],
    Boxing: [[0.5, "Now the cost of boxing. An `int` is 4 bytes, stored right where it is declared."], [5.5, "An `Integer` is a full object: 12 bytes of header around a 4-byte `value`. 16 bytes."], [12, "And whatever holds it needs a reference to it: 4 more bytes."], [17.5, "4 bytes versus 20, for the same number. In a collection that is 5\xD7 per element."], [24, "The `Integer` cache only covers -128 to 127: `valueOf(100)` returns one shared object."], [31, "`valueOf(1000)` allocates a new 16-byte object each time. Most real data lives out here."], [38, "Without compressed oops the object stays 16 bytes, but the reference grows to 8."]],
    Million: [[0.5, "Scale it up: one million values, measured with `GraphLayout` on JDK 17."], [5, "`int[]`: one object. 4 MB of ints plus a 16-byte header."], [10.5, "`Integer[]`: a 4 MB array of references, plus a million 16-byte objects. 20 MB, 5\xD7."], [17, "`ArrayList<Integer>`: the same, plus some spare capacity. 20.9 MB."], [22.5, "`HashMap<Integer,Integer>`: 72 MB. Each entry is a 32-byte `Node`, plus two `Integer`s."], [30, "Inside a `Node`: header, hash, key, value, next. 28 bytes, padded to 32."], [37, "18\xD7 the `int[]`. Only 8 MB of the 72 are the actual numbers."]],
    Arrays: [[0.5, "Arrays have one more header field: the length. Here is `int[3]` on JDK 17."], [6, "Mark word, class pointer, a 4-byte length, then the elements back to back. 32 bytes."], [12.5, "`Integer[3]` has exactly the same shape. But its elements are references."], [18.5, "Each one points to a separate `Integer` object, somewhere else on the heap."], [25, "So `int[1000]` is one object. `Integer[1000]` is 1,001."], [31, "To read `boxed[i]`, the CPU loads the reference, then follows it: a pointer chase per element."], [38, "A 2D `int[1000][1000]` is also 1,001 objects: an array of references to 1,000 row arrays."]],
    CacheLines: [[0.5, "Memory reaches the CPU in **cache lines** of 64 bytes, never one value at a time."], [6, "One line holds 16 ints. Scanning `int[]` costs one trip to memory per 16 elements."], [12.5, "Better still, the prefetcher spots the pattern and fetches the next line before you ask."], [19, "`Integer[]`: each reference leads somewhere else. Potentially a cache miss per element."], [26, "A miss to main memory costs roughly 100\xD7 a hit, and a stride prefetcher can't guess where pointers lead."], [33, "Measured: summing 10 million values. `int[]` 6.5 ms. `Integer[]` with scattered objects: 49 ms."], [41, "The twist: freshly allocated `Integer`s sat 16 bytes apart. In that order: 6.7 ms."], [48.5, "Real heaps mix allocations from everywhere. Locality, not size, is the real cost of boxing."]],
    Compact: [[0.5, "Compact object headers fold the class pointer into the mark word. 12 bytes become 8."], [6, "The class pointer shrinks to 22 bits, at the top. Hash, age and lock bits keep their jobs."], [12.5, "Four bits are reserved for Project Valhalla. One more is used by the GC while moving objects."], [19, "Real JOL on JDK 25 with `-XX:+UseCompactObjectHeaders`: `Point` drops from 24 bytes to 16."], [26, "`Integer` stays at 16: 8 plus 4 is 12, and alignment pads it right back."], [32.5, "`Order` stays at 32 too. The 4 saved bytes simply become padding."], [39.5, "Arrays gain: `int[3]` drops from 32 to 24, with the length right after the 8-byte header."], [46, "Small objects gain most, and heaps are full of them. SPECjbb2015 used 22% less heap."]],
    CompactTimeline: [[0.5, "Compact headers arrived in three steps."], [4, "JDK 24: experimental, JEP 450. You had to unlock experimental options to try it."], [10.5, "JDK 25, the current LTS: a product feature, JEP 519. One flag, still off by default."], [17, "JDK 27: on by default, JEP 534. The same code uses less memory with no changes."], [24, "You can still switch back with `-XX:-UseCompactObjectHeaders`."], [30, "On 25 or 26, try it: run JOL with and without the flag and compare."]],
    Valhalla: [[0.5, "Project Valhalla goes after the root cause: object identity."], [5, "Today `Point[3]` is three references to three separate 24-byte objects."], [11, "A **value class** gives up identity: `==` compares the fields, and you cannot lock on it."], [17.5, "Without identity, the JVM may store the fields inside the array or field itself: flattening."], [24, "JEP 401's own example: an `Integer[]` flattened into 64-bit words, a null flag plus the int."], [31, "The catch: flattened values must be read atomically. Two ints plus a null flag is 65 bits."], [38.5, "Status: value objects are a **preview** integrated for JDK 28, due March 2027. Not released yet."], [45.5, "Don't design around it. Use `int[]` and `IntStream` today."]],
    Traps: [[0.5, "Five traps worth avoiding."], [3, "Field order in the source is not memory order. HotSpot reorders."], [9, "Going from 31g to 32g can leave you with less room, not more."], [15.5, "An `Integer` in a collection costs 20 bytes, not 4."], [22, "`Integer[]` is an array of references, not of numbers."], [28, "An object's size is not the sum of its fields. Header and padding count. Measure with JOL."]],
    Recap: [[0.5, "Recap."], [3, "A 12-byte header: an 8-byte mark word and a 4-byte class pointer."], [8.5, "Fields are reordered to fill holes, and every object is padded to a multiple of 8."], [14, "Compressed oops: a 32-bit value times 8, plus a base. 4-byte references up to `-Xmx31g`."], [19.5, "An `Integer` is 16 bytes plus a 4-byte reference; an `int` is 4."], [25, "Arrays of objects are arrays of references: pointer chases and cache misses."], [30, "Compact headers make it 8 bytes, by default from JDK 27. And JOL measures all of it."]]
  };
  var notes = [
    { ch: 1, blocks: [
      { p: "Our two running examples:" },
      { code: POINT_SRC.join("\n") + "\n\n" + ORDER_SRC.join("\n"), title: "Point.java \xB7 Order.java" },
      { p: "Every object on the HotSpot heap starts with a **header**: an 8-byte **mark word** and a 4-byte **class pointer** (with compressed class pointers, the default). Then come the fields, then padding up to the next multiple of 8. `Point` holds 8 bytes of data and occupies 24." },
      { mini: { scene: "Anatomy" } },
      { tryit: { note: "JOL 0.17 CLI on JDK 17 (download link in the JOL section).", cmd: "$ javac Point.java\n$ java -jar jol-cli.jar internals -cp . Point", out: "Point object internals:\nOFF  SZ   TYPE DESCRIPTION               VALUE\n  0   8        (object header: mark)     0x0000000000000001 (non-biasable; age: 0)\n  8   4        (object header: class)    0x01015000\n 12   4    int Point.x                   0\n 16   4    int Point.y                   0\n 20   4        (object alignment gap)    \nInstance size: 24 bytes\nSpace losses: 0 bytes internal + 4 bytes external = 4 bytes total" } },
      { h: "The mark word, bit by bit" },
      { mini: { scene: "MarkBits" } },
      { table: { head: ["bits (63 \u2192 0)", "JDK 17, unlocked object"], rows: [["25", "unused"], ["31", "**identity hash**, written the first time it is asked for"], ["1", "unused"], ["4", "**GC age** (0\u201315)"], ["1", "biased-lock bit: biased locking is disabled by default since JDK 15 and was removed afterwards"], ["2", "**lock bits**: `01` unlocked, `00` thin-locked, `10` monitor, `11` marked by the GC"]] } },
      { tryit: { note: "A small program that prints the mark word with JOL's `ClassLayout.parseInstance(p)` (columns trimmed).", cmd: "$ java -cp jol-cli.jar:. Marks", out: "fresh:     0x0000000000000001 (non-biasable; age: 0)\nidentityHashCode = 0x33e5ccce\nhashed:    0x00000033e5ccce01 (hash: 0x33e5ccce; age: 0)\nlocked:    0x000000016dc3aae0 (thin lock: 0x000000016dc3aae0)\nunlocked:  0x00000033e5ccce01 (hash: 0x33e5ccce; age: 0)\ncontended: 0x0000000bdcdbce02 (fat lock: 0x0000000bdcdbce02)\nPoint@33e5ccce" } },
      { callout: { tone: "pull", title: "why the first identityHashCode costs something", text: "The hash is not stored until someone asks, because those bits share a word with the lock state. The first call generates a random value and installs it in the header (which can mean dealing with a lock that is held at that moment). After that it is a plain read. The `@33e5ccce` in `Point@33e5ccce` (and `[I@\u2026` for arrays) is that stored value." } },
      { h: "One word, many jobs" },
      { mini: { scene: "MarkStates" } },
      { table: { head: ["lock bits", "state", "the other 62 bits (JDK 17)"], rows: [["`01`", "unlocked", "hash, age"], ["`00`", "thin lock", "pointer to a lock record on the owning thread's stack, which holds the displaced header"], ["`10`", "inflated (fat) lock", "pointer to an `ObjectMonitor`, which holds the displaced header"], ["`11`", "marked", "used by the GC, e.g. a forwarding pointer to the object's new copy"]] } },
      { callout: { tone: "violet", title: "deeper: locking changed after JDK 17", text: "**Lightweight locking** (default since JDK 23) does not touch the header's payload: a thin lock just flips the lock bits to `00` and pushes the object onto the owning thread's small *lock-stack*. The same `Marks` program on JDK 25 printed `0x0000024fe304f801` unlocked and `0x0000024fe304f800` locked: only the last bit changed. Since JDK 27, inflated monitors are also found through a side table by default (the *object monitor table*), so the mark word keeps the hash even under contention." } },
      { callout: { tone: "violet", title: "deeper: the JDK 25 layout", text: "From `markWord.hpp` in JDK 25: `unused:22 hash:31 | unused_gap:4 age:4 self-fwd:1 lock:2`. The old biased bit became a *self-forwarded* bit (used when a GC fails to move an object), and 4 bits are reserved for Valhalla. So the hash now starts at bit 11, not bit 8. JOL 0.17 still decodes it at the old position: on JDK 25 its `hash:` annotation is wrong (`0x4fe304f8` printed for a real hash of `0x49fc609f`), though the raw word is right." } },
      { h: "The GC age" },
      { mini: { scene: "Ages" } },
      { tryit: { note: "Point survived five young collections (Serial GC, 64 MB young gen). Abridged to the mark word lines.", cmd: "$ java -XX:+UseSerialGC -Xmn64m -XX:MaxTenuringThreshold=15 -cp jol-cli.jar:. Ages", out: "start:       0x0000007a81197d01 (hash: 0x7a81197d; age: 0)\nafter GC 1:  0x0000007a81197d09 (hash: 0x7a81197d; age: 1)\nafter GC 2:  0x0000007a81197d11 (hash: 0x7a81197d; age: 2)\nafter GC 3:  0x0000007a81197d19 (hash: 0x7a81197d; age: 3)\nafter GC 4:  0x0000007a81197d21 (hash: 0x7a81197d; age: 4)\nafter GC 5:  0x0000007a81197d29 (hash: 0x7a81197d; age: 5)" } },
      { tryit: { note: 'Four bits of age is why this flag has a hard ceiling. 16 is accepted and means "never promote by age".', cmd: "$ java -XX:MaxTenuringThreshold=17 -version", out: "uintx MaxTenuringThreshold=17 is outside the allowed range [ 0 ... 16 ]\nError: Could not create the Java Virtual Machine." } },
      { h: "The class pointer" },
      { mini: { scene: "Klass" } },
      { p: "The second word is a **narrow class pointer**: a 32-bit offset into the *compressed class space*, a region of metaspace (8.3) reserved for `Klass` structures, 1 GB by default (`CompressedClassSpaceSize`). Decoding is `base + (narrow << shift)`; JOL reported base `0x8800000000`, shift 0. The `Klass` holds the name, super, size, field layout and vtable. `getClass()` reads it (and returns the `Class` mirror), `instanceof`/`checkcast` compare it, `invokevirtual` indexes its vtable (8.1)." },
      { callout: { tone: "violet", title: "deeper", text: "Compressed class pointers have been independent of compressed oops since JDK 15. With `-XX:-UseCompressedClassPointers` the class word is 8 bytes and the header 16: JOL on JDK 17 then shows `Order`'s class word as `0x000000012a918200` and `id` moving to offset 16." } }
    ] },
    { ch: 2, blocks: [
      { p: "**Natural alignment**: a field of size *n* sits at an offset divisible by *n*. Laid out in declaration order, `Order` would need 40 bytes, 11 of them padding." },
      { mini: { scene: "DeclOrder" } },
      { p: "HotSpot instead computes a layout once per class, at load time: largest primitives first, smaller ones dropped into any holes (here, `qty` fills the 4-byte gap left after the 12-byte header), then all references together." },
      { mini: { scene: "Reorder" } },
      { tryit: { cmd: "$ java -jar jol-cli.jar internals -cp . Order", out: "Order object internals:\nOFF  SZ               TYPE DESCRIPTION               VALUE\n  0   8                    (object header: mark)     0x0000000000000001 (non-biasable; age: 0)\n  8   4                    (object header: class)    0x01015000\n 12   4                int Order.qty                 0\n 16   8               long Order.id                  0\n 24   1            boolean Order.paid                false\n 25   3                    (alignment/padding gap)   \n 28   4   java.lang.Object Order.customer            null\nInstance size: 32 bytes\nSpace losses: 3 bytes internal + 0 bytes external = 3 bytes total" } },
      { callout: { tone: "bad", title: "correction to the source notes", text: "The notes showed `customer` at 24 and `paid` at 28. JDK 17 (and 25) actually put `paid` at 24, a 3-byte gap, then `customer` at 28: references come after all primitives. The total, 32 bytes, is the same." } },
      { list: ["**Why group references?** Each class keeps an *oop map*: (offset, count) runs that tell the GC where the pointers are. One contiguous block means one run to scan.", "**Inheritance**: superclass fields keep their offsets, so code compiled against the parent still works on the child. Since JDK 15's field-layout rewrite, a subclass can put small fields into holes the parent left (see below).", "**`@Contended`** (JDK internal, or with `-XX:-RestrictContended`) adds padding on purpose to keep hot fields on separate cache lines: the opposite of packing."] },
      { tryit: { note: "`class A { long a; boolean b; }` and `class B extends A { boolean c; int d; }`. `B.c` lands in the hole after `A.b`.", cmd: "$ java -jar jol-cli.jar internals -cp . B", out: " 12   1   boolean A.b                       false\n 13   1   boolean B.c                       false\n 14   2           (alignment/padding gap)   \n 16   8      long A.a                       0\n 24   4       int B.d                       0\n 28   4           (object alignment gap)    \nInstance size: 32 bytes" } },
      { h: "Why multiples of 8" },
      { mini: { scene: "Alignment" } },
      { p: "`ObjectAlignmentInBytes` defaults to 8: every object starts on an 8-byte boundary and its size is rounded up to 8. JOL reports padding inside an object as an *internal* loss and padding at its end as *external*. Alignment means a field can be read in one memory access, and it means every object address ends in three zero bits, which compressed oops exploit." }
    ] },
    { ch: 3, blocks: [
      { mini: { scene: "Jol" } },
      { tryit: { note: "JOL 0.17 is the latest release on Maven Central.", cmd: "$ curl -o jol-cli.jar https://repo1.maven.org/maven2/org/openjdk/jol/jol-cli/0.17/jol-cli-0.17-full.jar\n$ java -jar jol-cli.jar internals java.lang.Integer", out: "java.lang.Integer object internals:\nOFF  SZ   TYPE DESCRIPTION               VALUE\n  0   8        (object header: mark)     0x0000000000000001 (non-biasable; age: 0)\n  8   4        (object header: class)    0x00040f28\n 12   4    int Integer.value             0\nInstance size: 16 bytes\nSpace losses: 0 bytes internal + 0 bytes external = 0 bytes total" } },
      { code: "import org.openjdk.jol.info.*;\n\nSystem.out.println(ClassLayout.parseClass(Order.class).toPrintable());   // layout of a class\nSystem.out.println(ClassLayout.parseInstance(p).toPrintable());          // a live object, with its mark word\nSystem.out.println(GraphLayout.parseInstance(map).totalSize());          // deep size: everything reachable\nSystem.out.println(GraphLayout.parseInstance(map).toFootprint());        // per-class breakdown", title: "with jol-core as a dependency" },
      { callout: { tone: "pull", title: "shallow vs deep", text: '`ClassLayout` is one object (shallow). `GraphLayout` walks references and counts every object reachable (deep), which is what "how much memory does this map use?" really means. Deep sizes include shared objects (like cached `Integer`s), so they can overcount.' } },
      { p: "The `-XX:+UseCompressedOops`-style flags apply to JOL too, because it measures the JVM it runs in: `java -XX:-UseCompressedOops -jar jol-cli.jar \u2026` shows the uncompressed layout." }
    ] },
    { ch: 4, blocks: [
      { p: "A reference field holds a 32-bit **narrow oop**. The JVM turns it into an address with `heapBase + (narrow << 3)`. Because objects are 8-byte aligned, the three bits the shift brings in were always zero anyway." },
      { mini: { scene: "CoopsDecode" } },
      { tryit: { note: "`Decode` reads the 4 raw bytes of `line.start` with `Unsafe.getInt` and compares with JOL's `VM.current().addressOf(line.start)`.", cmd: "$ java -Xmx16g -Xlog:gc+heap+coops=debug -cp jol-cli.jar:. Decode", out: "Heap address: 0x0000007000800000, size: 16384 MB, Compressed Oops mode: Non-zero disjoint base: 0x0000007000000000, Oop shift amount: 3\nfield offset          = 12\nstored 32-bit value   = 0x01004d3d\nvalue << 3            = 0x80269e8\nreal address of Point = 0x70080269e8" } },
      { table: { head: ["mode (as -Xlog names it)", "decode", "when"], rows: [["32-bit / unscaled", "address = narrow", "whole heap below 4 GB of address space"], ["Zero based", "address = narrow << 3", "heap ends below 32 GB of address space (e.g. `-Xmx2g`: `0x610e4d3c << 3 = 0x3087269e0`)"], ["Non-zero disjoint base", "base OR (narrow << 3)", "base has no bits overlapping the shifted value, so OR works"], ["Non-zero based", "base + (narrow << 3)", "anything else that still fits"]] } },
      { p: "On this Mac (arm64), the low 4 GB of address space is reserved by the OS, so JDK 17 never chose the unscaled mode: `-Xmx2g` was zero-based, `-Xmx16g` and `-Xmx31g` were *non-zero disjoint base*." },
      { h: "Why 32 GB" },
      { mini: { scene: "Coops32" } },
      { tryit: { cmd: "$ java -Xmx31g -XX:+PrintFlagsFinal -version | grep -w UseCompressedOops\n$ java -Xmx32g -XX:+PrintFlagsFinal -version | grep -w UseCompressedOops", out: "     bool UseCompressedOops                        = true                           {product lp64_product} {ergonomic}\n     bool UseCompressedOops                        = false                          {product lp64_product} {default}" } },
      { p: "2\xB3\xB2 values \xD7 8 bytes = 32 GB. A full 32 GB heap does not fit because the window also has to cover a protected page at the base (16 MB at `-Xmx31g`, per the coops log). `-XX:ObjectAlignmentInBytes=16` makes the shift 4 and the window 64 GB (JDK 17 kept compressed oops at `-Xmx60g`), at the cost of padding every object to 16: `Point` becomes 32 bytes." },
      { h: "The cliff" },
      { mini: { scene: "Cliff" } },
      { table: { head: ["JDK 17, measured", "compressed oops", "-XX:-UseCompressedOops"], rows: [["`Point`", "24 B", "24 B"], ["`Integer`", "16 B", "16 B"], ["`Order`", "32 B", "**40 B**"], ["`Integer[1M]` + its Integers", "20.0 MB", "24.0 MB"], ["`HashMap<Integer,Integer>` 1M", "72.4 MB", "**88.8 MB**"]] } },
      { callout: { tone: "bad", title: "the production trap", text: "Raising `-Xmx` from 31g to 32g silently doubles every reference. For the `HashMap` above (1.23\xD7 growth), a 32 GB heap holds what about 26 GB held before, and you need roughly 38 GB to break even. The exact dead zone depends on how pointer-heavy your objects are. **Stay at or below 31g, or go well past 40g**, and confirm with `-XX:+PrintFlagsFinal`." } }
    ] },
    { ch: 5, blocks: [
      { mini: { scene: "Boxing" } },
      { code: "int                 4 bytes, stored in place\n\nInteger object:\n  mark word         8\n  class pointer     4\n  int value         4\n  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n                   16 bytes\n+ reference         4  (8 without compressed oops)\n  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n                   20 bytes per element  \u2248 5\xD7", lang: "plain", title: "the arithmetic" },
      { callout: { tone: "pull", title: "the Integer cache", text: "`Integer.valueOf` (which autoboxing calls) returns shared objects for -128..127 (the upper bound can be raised with `-XX:AutoBoxCacheMax`). Outside that range every boxing allocates a fresh 16-byte object, which is also why `==` on two boxed 1000s is false." } },
      { h: "A million values" },
      { mini: { scene: "Million" } },
      { tryit: { note: "Values 1000\u20261000999 (outside the cache), measured with `GraphLayout.parseInstance(x).totalSize()`.", cmd: "$ java -Xmx2g -cp jol-cli.jar:. Sizes", out: "int[1M]               4,000,016 bytes\nInteger[1M]          20,000,016 bytes\nArrayList<Integer>   20,861,992 bytes\nHashMap<Int,Int>     72,388,672 bytes\njava.util.HashMap footprint:\n     COUNT       AVG       SUM   DESCRIPTION\n         1   8388624   8388624   [Ljava.util.HashMap$Node;\n   2000000        16  32000000   java.lang.Integer\n         1        48        48   java.util.HashMap\n   1000000        32  32000000   java.util.HashMap$Node\n   3000002            72388672   (total)" } },
      { callout: { tone: "bad", title: "correction to the source notes", text: "The notes estimated `HashMap<Integer,Integer>` at ~80 MB (20\xD7). Measured on JDK 17 it is **72.4 MB (18\xD7)**: 32 MB of `Node`s, 32 MB of `Integer`s, 8.4 MB of table. Without compressed oops it is 88.8 MB." } }
    ] },
    { ch: 6, blocks: [
      { mini: { scene: "Arrays" } },
      { tryit: { note: "Arrays add a 4-byte length to the header, so elements start at offset 16 on JDK 17.", cmd: "$ java -cp jol-cli.jar:. Arr", out: "[I object internals:\nOFF  SZ   TYPE DESCRIPTION               VALUE\n  0   8        (object header: mark)     0x0000000000000001 (non-biasable; age: 0)\n  8   4        (object header: class)    0x00006c28\n 12   4        (array length)            3\n 16  12    int [I.<elements>             N/A\n 28   4        (object alignment gap)    \nInstance size: 32 bytes" } },
      { h: "Cache lines and locality" },
      { mini: { scene: "CacheLines" } },
      { tryit: { note: "10M elements; `mixed` is a shuffled copy of `seq` (same objects, scattered access order). One run on this Mac, after warm-up; abridged.", cmd: "$ java -Xms6g -Xmx6g -cp jol-cli.jar:. Scatter", out: "seq[0]   -> 0x7ff4235b8\nseq[1]   -> 0x7ff4235c8\nseq[2]   -> 0x7ff4235d8\nmixed[0] -> 0x7fa238500\nmixed[1] -> 0x7fb345f60\nmixed[2] -> 0x7f65789b0\nint[]   6.5 ms | Integer[] in alloc order   6.7 ms | Integer[] scattered   49.2 ms" } },
      { p: "The CPU fetches memory in 64-byte **cache lines**. An `int[]` delivers 16 values per line and its sequential pattern is easy for the hardware prefetcher. An `Integer[]` delivers 16 *references* per line, and each one may point into a different line. Freshly allocated objects often sit next to each other (bump-pointer allocation in a TLAB), which is why the allocation-order scan was nearly as fast as `int[]`. Real heaps interleave allocations from many places, and that is the case that hurts." },
      { list: ["Why `ArrayList` beats `LinkedList` (5.2) and `ArrayDeque` beats `LinkedList` (5.4).", "Why `IntStream` beats `Stream<Integer>` (6.4).", "Why `int[]` beats `List<Integer>` by more than the byte counts suggest (5.8).", "Why `ArrayList` splits well for parallel streams (6.8)."] }
    ] },
    { ch: 7, blocks: [
      { p: "Compact object headers (Project Lilliput) put a 22-bit class pointer into the top of the mark word, so the header is one 64-bit word instead of 96 bits." },
      { mini: { scene: "Compact" } },
      { tryit: { note: "Temurin JDK 25.0.4.1. The flag no longer needs `UnlockExperimentalVMOptions` on 25.", cmd: "$ java -XX:+UseCompactObjectHeaders -jar jol-cli.jar internals -cp . Point", out: "Point object internals:\nOFF  SZ   TYPE DESCRIPTION               VALUE\n  0   8        (object header: mark)     0x010c800000000001 (Lilliput)\n  8   4    int Point.x                   0\n 12   4    int Point.y                   0\nInstance size: 16 bytes" } },
      { table: { head: ["JDK 25, JOL", "default header", "compact header"], rows: [["`Point`", "24 B", "**16 B**"], ["`Integer`", "16 B", "16 B (8 + 4, padded)"], ["`Order`", "32 B", "32 B (gap moves to the end)"], ["`int[3]`", "32 B", "**24 B** (elements at offset 12)"]] } },
      { h: "Versions" },
      { mini: { scene: "CompactTimeline" } },
      { table: { head: ["release", "status", "flags"], rows: [["JDK 24", "experimental (JEP 450)", "`-XX:+UnlockExperimentalVMOptions -XX:+UseCompactObjectHeaders`"], ["JDK 25 (LTS), 26", "product feature, off by default (JEP 519)", "`-XX:+UseCompactObjectHeaders`"], ["JDK 27", "**on by default** (JEP 534)", "`-XX:-UseCompactObjectHeaders` to opt out"]] } },
      { callout: { tone: "bad", title: "correction to the source notes", text: 'The notes gave `-XX:+UnlockExperimentalVMOptions -XX:+UseCompactObjectHeaders` for "Java 24\u201326". Only JDK 24 needs the unlock flag; JEP 519 made it a product option in JDK 25. "Default in 27" is correct (JEP 534). The quoted gain "10\u201320% less heap" is in the right range: the JEPs report SPECjbb2015 using 22% less heap and 8% less CPU in one setting.' } },
      { callout: { tone: "violet", title: "deeper", text: "Compact headers require compressed class pointers and lightweight locking, and turn on the object monitor table (so an inflated lock no longer overwrites the header). The 22-bit class pointer caps the number of loaded classes at about 4 million. The identity hash is still 31 bits in the mark word." } }
    ] },
    { ch: 8, blocks: [
      { mini: { scene: "Valhalla" } },
      { code: "value record Point(int x, int y) {}\n\nPoint p = new Point(17, 3);\nnew Point(17, 3) == p     // true: no identity, == compares fields", title: "JEP 401 (preview) \xB7 from the JEP" },
      { p: "A **value class** has no identity: no `synchronized`, no identity hash, and `==` compares field values. That frees the JVM to **flatten** references to value objects: store the fields directly inside the array or object that holds them, with no header and no pointer. JEP 401 lets a JVM do this; it does not guarantee it." },
      { callout: { tone: "bad", title: "correction to the source notes", text: "The notes showed `Point[3]` becoming `[x][y][x][y][x][y]`. Under JEP 401's rules a flattened reference must be read and written atomically, which on common hardware limits it to 64 bits, and a nullable `Point` needs a null flag on top of its 64 bits of ints: 65 bits. JEP 401's own flattening examples are `Integer` and `LocalDate`, which fit. Dense `x y x y` arrays need future work (null-restricted types)." } },
      { callout: { tone: "pull", title: "status \xB7 October 2026", text: "JEP 401, *Value Objects (Preview)*, is integrated for **JDK 28** (due March 2027), behind `--enable-preview`; with preview on, `Integer`, `LocalDate` and other JDK classes become value classes. No released JDK has it. Specialised generics (`List<int>`) are further out. **Do not design around it**: use `int[]` and `IntStream` today." } }
    ] }
  ];
  var traps = [
    "**Field order in source = memory order.** HotSpot reorders: large primitives first, holes filled by smaller fields, references grouped at the end.",
    "**A bigger heap always holds more.** At `-Xmx32g` compressed oops switch off and every reference doubles; 31g can hold more than 32g. The boundary is exact (31g on, 32g off on JDK 17).",
    '**`Integer` is "a bit bigger" than `int`.** It is a 16-byte object plus a 4-byte reference: 5\xD7 per collection element, plus a pointer chase on every read.',
    "**`Integer[]` is contiguous like `int[]`.** Only its references are contiguous; the objects can be anywhere, and scanning them can be several times slower.",
    "**Size = sum of field sizes.** Add 12 bytes of header (8 with compact headers), 16 for arrays, and padding to 8. Measure with JOL.",
    "**The first `identityHashCode` is free.** It generates and installs the hash in the header; later calls are a read.",
    "**Compact headers shrink every object.** Savings come in 8-byte steps: `Point` 24 \u2192 16, but `Integer` and `Order` stay the same."
  ];
  var recap = [
    "**Header**: 8-byte mark word (identity hash, GC age, lock bits) + 4-byte compressed class pointer = **12 bytes**; arrays add a 4-byte length.",
    "**Mark word states**: `01` unlocked \xB7 `00` thin lock \xB7 `10` monitor \xB7 `11` GC-marked. The age is 4 bits, so tenuring caps at 15.",
    "**Layout**: fields reordered (big first, holes filled, references last); everything padded to a multiple of 8. `Order`: 40 bytes in source order, 32 in reality.",
    "**Compressed oops**: `address = base + (narrow << 3)`; 4-byte references up to `-Xmx31g`, off at `32g`.",
    "**Boxing**: `Integer` = 16 B + 4 B reference vs 4 B; 1M values: `int[]` 4 MB \xB7 `Integer[]` 20 MB \xB7 `HashMap` 72 MB.",
    "**Locality**: object arrays are arrays of references; scattered objects cost cache misses (49 ms vs 6.5 ms for 10M values here).",
    "**Compact headers**: 8-byte header; experimental in 24, product in 25, **default in 27**.",
    "**Valhalla**: value objects are a preview for JDK 28. Not yet. **Measure with JOL.**"
  ];
  var quiz = [
    { q: "Why does raising `-Xmx` from 31g to 32g risk *reducing* how much data fits?", options: ["G1 needs more regions above 32 GB", "Compressed oops switch off, so every reference grows from 4 to 8 bytes", "The class space moves out of metaspace", "Object alignment changes from 8 to 16 bytes"], answer: 1, why: "A 32-bit narrow oop \xD7 8 reaches 32 GB, and a full 32 GB heap (plus its protected base page) does not fit. HotSpot silently turns `UseCompressedOops` off, references double, and pointer-heavy data can need ~23% more space." },
    { q: "`Point { int x; int y; }` holds 8 bytes of data. Why does JOL report 24 bytes on JDK 17?", options: ["Each int is stored as 8 bytes", "12-byte header + 8 bytes of fields = 20, padded to a multiple of 8", "The JVM adds a hidden length field", "Two 8-byte headers"], answer: 1, why: "Mark word (8) + compressed class pointer (4) + two ints (8) = 20, and objects are rounded up to 8-byte multiples: 4 bytes of external padding." },
    { q: "In `Order { boolean paid; int qty; long id; Object customer; }`, which field does HotSpot put at offset 12, right after the header?", options: ["paid", "qty", "id", "customer"], answer: 1, why: "Larger primitives are placed first and smaller ones fill holes. `id` needs an 8-aligned offset (16), leaving a 4-byte hole at 12 that `qty` fills exactly." },
    { q: "A reference field contains `0x01004d3d`, the log says base `0x7000000000`, shift 3. Where is the object?", options: ["0x01004d3d", "0x7001004d3d", "0x70080269e8", "0x00080269e8"], answer: 2, why: "`0x01004d3d << 3 = 0x80269e8`, plus the base gives `0x70080269e8`, which is what JOL `addressOf` reported. The shift works because object addresses always end in three zero bits." },
    { q: "Why is the first `System.identityHashCode(o)` call more expensive than later ones?", options: ["It scans the heap for collisions", "The hash is generated lazily and installed into the mark word on first request", "It forces a full GC", "It has to inflate a monitor every time"], answer: 1, why: "The hash bits share the mark word with lock state, so nothing is stored at allocation. The first call generates a value and writes it into the header; later calls just read it." },
    { q: "Why can't `-XX:MaxTenuringThreshold` go above 16?", options: ["GC logs only print two digits", "The age lives in a 4-bit field of the mark word, so it can only count to 15", "Survivor spaces only hold 16 copies", "It is a G1-only limit"], answer: 1, why: 'Each young GC that copies an object increments its age in the header. Four bits count 0 to 15; 16 is accepted to mean "never promote by age", since the age can never reach it.' },
    { q: "Summing 10M values: `int[]` took 6.5 ms, `Integer[]` with scattered objects 49 ms. What explains most of the gap?", options: ["Integer objects are 5\xD7 larger, so 5\xD7 more bytes", "Unboxing calls are slow", "Each element is a pointer chase to a different cache line, which the prefetcher cannot predict", "The GC ran during the loop"], answer: 2, why: "In allocation order the same `Integer[]` took 6.7 ms, despite being the same size. The cost is locality: scattered objects mean a likely cache miss per element." },
    { q: "With compact object headers on JDK 25, which object does *not* get smaller?", options: ["Point (two ints)", "int[3]", "java.lang.Integer", "A class with no fields (12 \u2192 8 bytes before padding)"], answer: 2, why: "Integer goes from 12 + 4 = 16 to 8 + 4 = 12, which pads back to 16. Savings come in 8-byte steps. Point drops 24 \u2192 16 and int[3] 32 \u2192 24." },
    { q: "On JDK 17 you run with `-XX:-UseCompressedOops`. How big is the header of an `Order`?", options: ["8 bytes", "12 bytes: compressed class pointers stay on", "16 bytes", "20 bytes"], answer: 1, why: "Since JDK 15 compressed class pointers are independent of compressed oops. JOL shows mark (8) + class (4); only the `customer` reference grows to 8, making `Order` 40 bytes." },
    { q: "What is the status of Project Valhalla's value objects as of October 2026?", options: ["Final in JDK 25", "A preview (JEP 401) integrated for JDK 28, not in any released JDK", "Experimental in JDK 27 behind an -XX flag", "Cancelled in favour of compact headers"], answer: 1, why: "JEP 401 is integrated for JDK 28 (March 2027) behind `--enable-preview`. Compact headers are the part that has shipped; use `int[]` and primitive streams today." }
  ];
  window.AN.registerTopic({
    id: "8.4",
    part: "08",
    title: "How an object is laid out",
    kicker: "Part 08 \xB7 The JVM",
    lede: "Concrete byte counts: the header, the mark word, field order and padding, compressed oops, boxing, cache lines and compact headers, all measured with JOL. This is what makes performance intuition real rather than superstitious.",
    chapters,
    scenes,
    captions,
    notes,
    traps,
    recap,
    quiz
  });
})();
