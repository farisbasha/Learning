(() => {
  // src/topics/8.5/scenes1.jsx
  var {
    PAL,
    MOTION,
    lin,
    lerp,
    win,
    pulse,
    step,
    track,
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
    Badge,
    Callout,
    Mark,
    toneColor
  } = window.AN;
  var E = MOTION.enter;
  var M = MOTION.move;
  var POP = MOTION.pop;
  var SERVER_SRC = [
    "public class Server {",
    "    static final Map<Integer, byte[]> CACHE = new HashMap<>();",
    '    static final int N = Integer.getInteger("sessions", 20_000);',
    "    static final Object[] sessions = new Object[N];",
    "",
    "    static int handle(int id) {",
    '        var sb = new StringBuilder("GET /user/").append(id % 500);',
    "        byte[] body = new byte[1024];",
    "        CACHE.computeIfAbsent(id % 500, k -> new byte[2048]);",
    "        sessions[id % N] = new byte[48];",
    "        return sb.length() + body.length;",
    "    }",
    "}"
  ];
  function SIntro({ t }) {
    const cols = 13, rows = 7, cw = 58, chh = 40, gap = 8, HX = 902, HY = 488;
    const kind = (i) => [3, 17, 30].includes(i) ? "cache" : i % 9 === 5 ? "session" : "temp";
    const dead = t > 12.5;
    const cells = [];
    for (let i = 0; i < cols * rows; i++) {
      const at = 4 + i * 0.085;
      const a = E(t, at, 0.25);
      if (a < 0.01) continue;
      const k = kind(i);
      const c = k === "cache" ? PAL.flow : k === "session" ? PAL.pull : PAL.ink2;
      const gone = k === "temp" ? E(t, 12.5 + i % 13 * 0.05, 0.5) : 0;
      const x = HX + i % cols * (cw + gap), y = HY + Math.floor(i / cols) * (chh + gap);
      cells.push(/* @__PURE__ */ React.createElement("div", { key: i, style: { position: "absolute", left: x, top: y, width: cw, height: chh, boxSizing: "border-box", borderRadius: 7, opacity: a * (1 - 0.7 * gone), background: hexA(c, k === "temp" ? 0.12 : 0.22), border: `2px ${gone > 0.5 ? "dashed" : "solid"} ${hexA(c, k === "temp" ? 0.5 : 0.9)}`, boxShadow: dead && k !== "temp" ? `0 0 14px ${hexA(c, 0.5)}` : "none" } }));
    }
    const tone = (i) => i === 6 || i === 7 ? "bad" : i === 8 ? "flow" : i === 9 ? "pull" : void 0;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 150, mono: true, fs: 22, weight: 600, color: PAL.pull, a: E(t, 0.3), style: { letterSpacing: "0.14em" } }, "PART 08 \xB7 THE JVM \xB7 8.5"), /* @__PURE__ */ React.createElement(Txt, { x: 92, y: 192, fs: 100, weight: 700, lh: 1, a: E(t, 0.6, 0.9), style: { letterSpacing: "-0.03em", transform: `translateY(${(1 - E(t, 0.6, 0.9)) * 24}px)` } }, "Garbage collection: the theory"), /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 322, fs: 34, color: PAL.ink2, a: E(t, 1.4, 0.8) }, "How the JVM decides what is garbage, and what it costs to clean up."), /* @__PURE__ */ React.createElement(
      Code,
      {
        x: 96,
        y: 430,
        w: 760,
        h: 406,
        fs: 17,
        lh: 26,
        title: "Server.java \xB7 the running example",
        a: E(t, 1.8),
        lines: SERVER_SRC.map((s, i) => ({ s, tone: tone(i), toneA: E(t, 18.5) }))
      }
    ), /* @__PURE__ */ React.createElement(Panel, { x: 880, y: 430, w: 944, h: 406, title: "heap \xB7 eden", right: dead ? "most of it is already dead" : "filling, one request at a time", a: E(t, 3.4), tone: "flow" }), cells, /* @__PURE__ */ React.createElement(Badge, { x: 900, y: 872, text: "dies at return", tone: "ink", a: E(t, 18.8), fs: 17, anchor: "left" }), /* @__PURE__ */ React.createElement(Badge, { x: 1110, y: 872, text: "session: lives a while", tone: "pull", a: E(t, 19.2), fs: 17, anchor: "left" }), /* @__PURE__ */ React.createElement(Badge, { x: 1400, y: 872, text: "cache: lives forever", tone: "flow", a: E(t, 19.6), fs: 17, anchor: "left" }), /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 858, fs: 20, color: PAL.ink2, a: E(t, 12.5) }, "reachability \xB7 generations \xB7 algorithms \xB7 card tables \xB7 safepoints \xB7 TLABs"));
  }
  function RootRow({ x, y, name, note, a, tone = "violet", glow = 0 }) {
    return /* @__PURE__ */ React.createElement(
      Box,
      {
        x,
        y,
        w: 420,
        h: 50,
        align: "left",
        tone,
        a,
        glow,
        fs: 19,
        label: /* @__PURE__ */ React.createElement("span", null, name, /* @__PURE__ */ React.createElement("span", { style: { color: PAL.ink3, fontWeight: 400, marginLeft: 14, fontSize: 17 } }, note))
      }
    );
  }
  function SRoots({ t }) {
    const mk = { sb: 33.4, val: 34.4, body: 33.8, map: 34.6, tab: 35.2, node: 35.8, b2k: 36.4, sess: 34.9, s48: 35.6 };
    const live = (k) => t >= mk[k] ? "flow" : "ink";
    const lg = (k) => pulse(t, [mk[k]], 1);
    const gBad = t >= 39.5;
    const G = (x, y, label, sub) => /* @__PURE__ */ React.createElement(Box, { x, y, w: 200, h: 50, label, fs: 19, tone: gBad ? "bad" : "dim", dashed: gBad, a: E(t, 3.2) * (gBad ? 0.85 : 0.7) });
    const O = (k, x, y, label, at) => /* @__PURE__ */ React.createElement(Box, { x, y, w: 200, h: 50, label, fs: 19, tone: live(k), a: E(t, at), glow: lg(k) });
    const ra = (k) => t >= mk[k] ? PAL.flow : PAL.ink3;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel, { x: 96, y: 196, w: 540, h: 630, title: "GC roots", tone: "violet", a: E(t, 6.5) }), /* @__PURE__ */ React.createElement(Txt, { x: 120, y: 256, mono: true, fs: 17, color: PAL.ink3, a: E(t, 13) }, "THREAD main \xB7 frame handle(42)"), /* @__PURE__ */ React.createElement(RootRow, { x: 120, y: 286, name: "id = 42", note: "an int, not a reference", tone: "dim", a: E(t, 13.2) }), /* @__PURE__ */ React.createElement(RootRow, { x: 120, y: 346, name: "sb", note: "local slot", a: E(t, 13.6), glow: pulse(t, [33], 1) }), /* @__PURE__ */ React.createElement(RootRow, { x: 120, y: 406, name: "body", note: "local slot", a: E(t, 14), glow: pulse(t, [33], 1) }), /* @__PURE__ */ React.createElement(Txt, { x: 120, y: 486, mono: true, fs: 17, color: PAL.ink3, a: E(t, 20) }, "STATIC FIELDS \xB7 class Server"), /* @__PURE__ */ React.createElement(RootRow, { x: 120, y: 516, name: "CACHE", note: "static field", a: E(t, 20.3), glow: pulse(t, [33], 1) }), /* @__PURE__ */ React.createElement(RootRow, { x: 120, y: 576, name: "sessions", note: "static field", a: E(t, 20.7), glow: pulse(t, [33], 1) }), /* @__PURE__ */ React.createElement(Txt, { x: 120, y: 656, mono: true, fs: 17, color: PAL.ink3, a: E(t, 26.5) }, "ALSO ROOTS"), ["JNI handles", "Thread objects", "classes, loaders", "JVM internals"].map((s, i) => /* @__PURE__ */ React.createElement(Box, { key: s, x: 120 + i % 2 * 220, y: 686 + Math.floor(i / 2) * 62, w: 200, h: 50, label: s, fs: 17, tone: "violet", a: E(t, 26.8 + i * 0.4) })), /* @__PURE__ */ React.createElement(Panel, { x: 690, y: 196, w: 1134, h: 630, title: "heap", right: "who can be reached?", a: E(t, 2.5) }), O("sb", 740, 346, "StringBuilder", 3), O("val", 1e3, 346, "byte[26]", 3.2), /* @__PURE__ */ React.createElement(HArrow, { x1: 942, x2: 996, y: 371, a: E(t, 3.3), color: ra("val") }), O("body", 740, 406, "byte[1024]", 3.3), O("map", 740, 516, "HashMap", 3.5), O("tab", 1e3, 516, "Node[1024]", 3.6), O("node", 1260, 516, "Node", 3.7), O("b2k", 1520, 516, "byte[2048]", 3.8), /* @__PURE__ */ React.createElement(HArrow, { x1: 942, x2: 996, y: 541, a: E(t, 3.8), color: ra("tab") }), /* @__PURE__ */ React.createElement(HArrow, { x1: 1202, x2: 1256, y: 541, a: E(t, 3.8), color: ra("node") }), /* @__PURE__ */ React.createElement(HArrow, { x1: 1462, x2: 1516, y: 541, a: E(t, 3.8), color: ra("b2k") }), /* @__PURE__ */ React.createElement(Badge, { x: 1772, y: 541, text: "\xD7500", tone: "flow", a: E(t, 4), fs: 17 }), O("sess", 740, 576, "Object[20000]", 3.9), O("s48", 1e3, 576, "byte[48]", 4), /* @__PURE__ */ React.createElement(HArrow, { x1: 942, x2: 996, y: 601, a: E(t, 4), color: ra("s48") }), /* @__PURE__ */ React.createElement(Badge, { x: 1262, y: 601, text: "\xD720,000", tone: "pull", a: E(t, 4.1), fs: 17 }), /* @__PURE__ */ React.createElement(Txt, { x: 740, y: 680, mono: true, fs: 17, color: gBad ? PAL.bad : PAL.ink3, a: E(t, 3.2) }, "LEFT OVER FROM EARLIER REQUESTS"), G(740, 710, "StringBuilder", "unreachable"), G(1e3, 710, "byte[26]", "unreachable"), G(1260, 710, "byte[1024]", "unreachable"), G(1520, 710, "byte[48]", "unreachable"), /* @__PURE__ */ React.createElement(HArrow, { x1: 942, x2: 996, y: 735, a: E(t, 3.3) * 0.6, color: PAL.ink3 }), [[371, "sb", 13.8], [431, "body", 14.2], [541, "map", 20.6], [601, "sess", 21]].map(([y, k, at]) => /* @__PURE__ */ React.createElement(HArrow, { key: k, x1: 544, x2: 736, y, a: E(t, at), color: t >= 33 ? PAL.flow : PAL.violet })), /* @__PURE__ */ React.createElement(Badge, { x: 1420, y: 690, text: "no path from any root", tone: "bad", a: E(t, 40), fs: 17 }), /* @__PURE__ */ React.createElement(Callout, { x: 96, y: 846, w: 1728, tone: "flow", a: E(t, 45), fs: 20, text: "Reachable means live. Unreachable means garbage, **by definition**: no code can ever obtain a reference to it again." }));
  }
  var MN = {
    SB: [330, 236, "StringBuilder"],
    val: [560, 236, "byte[26]"],
    gOld: [1020, 236, "byte[48]"],
    body: [330, 316, "byte[1024]"],
    g1: [790, 316, "byte[1024]"],
    map: [330, 416, "HashMap"],
    tab: [560, 416, "Node[]"],
    n1: [790, 416, "Node"],
    b1: [1020, 416, "byte[2048]"],
    n2: [790, 496, "Node"],
    b2: [1020, 496, "byte[2048]"],
    sess: [330, 596, "Object[]"],
    s1: [560, 596, "byte[48]"],
    s2: [560, 676, "byte[48]"],
    g2: [790, 646, "StringBuilder"],
    g3: [1020, 646, "byte[26]"]
  };
  var MW = 180;
  var MH = 52;
  var MEV = [
    [12, "push", "SB"],
    [12.4, "push", "body"],
    [12.8, "push", "map"],
    [13.2, "push", "sess"],
    [18, "pop", "sess"],
    [19, "push", "s1"],
    [19.4, "push", "s2"],
    [21, "pop", "s2"],
    [22.5, "pop", "s1"],
    [26, "pop", "map"],
    [26.8, "push", "tab"],
    [28, "pop", "tab"],
    [28.8, "push", "n1"],
    [29.2, "push", "n2"],
    [30.5, "pop", "n2"],
    [31.2, "push", "b2"],
    [32.2, "pop", "b2"],
    [33.2, "pop", "n1"],
    [33.9, "push", "b1"],
    [35, "pop", "b1"],
    [36, "pop", "body"],
    [37, "pop", "SB"],
    [37.7, "push", "val"],
    [38.6, "pop", "val"]
  ];
  var MEDGES = [["SB", "val"], ["map", "tab"], ["tab", "n1"], ["tab", "n2"], ["n1", "b1"], ["n2", "b2"], ["sess", "s1"], ["sess", "s2"], ["g2", "g3"]];
  var SHORT = { SB: "SB", val: "b[26]", body: "b[1024]", g1: "b[1024]", map: "Map", gOld: "b[48]", tab: "Node[]", n1: "Node", g2: "SB", b1: "b[2048]", n2: "Node", g3: "b[26]", b2: "b[2048]", sess: "Obj[]", s1: "b[48]", s2: "b[48]" };
  var BITMAP = ["SB", "g1", "val", "body", "map", "gOld", "tab", "n1", "g2", "b1", "n2", "g3", "b2", "sess", "s1", "s2"];
  function SMarking({ t }) {
    const state = {}, stack = [], popAt = {}, pushAt = {};
    for (const [ti, op, id] of MEV) {
      if (t < ti) break;
      if (op === "push") {
        state[id] = "grey";
        stack.push(id);
        pushAt[id] = ti;
      } else {
        state[id] = "black";
        stack.pop();
        popAt[id] = ti;
      }
    }
    const garbageA = E(t, 42);
    const toneOf = (id) => state[id] === "grey" ? "pull" : state[id] === "black" ? "flow" : id[0] === "g" && garbageA > 0.5 ? "bad" : void 0;
    const edge = ([p, c]) => {
      const [px, py] = MN[p], [cx, cy] = MN[c];
      const lit = popAt[p] != null;
      const col = lit ? PAL.flow : PAL.ink3;
      const a = E(t, 1.5) * (p[0] === "g" ? 0.6 : 1);
      if (py === cy) return /* @__PURE__ */ React.createElement(HArrow, { key: p + c, x1: px + MW + 2, x2: cx - 4, y: py + MH / 2, a, color: col });
      const mx = px + MW + 25;
      return /* @__PURE__ */ React.createElement(Arrow, { key: p + c, pts: [[px + MW + 2, py + MH / 2], [mx, py + MH / 2], [mx, cy + MH / 2], [cx - 4, cy + MH / 2]], a, color: col, width: 2 });
    };
    const roots = [["sb", "SB"], ["body", "body"], ["CACHE", "map"], ["sessions", "sess"]];
    const lastPop = MEV.filter(([ti, op]) => op === "pop" && t >= ti).pop();
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 200, mono: true, fs: 17, color: PAL.ink3, a: E(t, 0.5) }, "ROOTS"), roots.map(([n, id]) => /* @__PURE__ */ React.createElement(React.Fragment, { key: n }, /* @__PURE__ */ React.createElement(Box, { x: 96, y: MN[id][1], w: 170, h: MH, label: n, fs: 19, tone: "violet", a: E(t, 0.8), glow: pulse(t, [12], 1) }), /* @__PURE__ */ React.createElement(HArrow, { x1: 268, x2: 326, y: MN[id][1] + MH / 2, a: E(t, 0.9), color: t >= 12 ? PAL.pull : PAL.violet }))), /* @__PURE__ */ React.createElement(
      Panel,
      {
        x: 300,
        y: 196,
        w: 930,
        h: 560,
        title: "heap",
        a: E(t, 0.6),
        right: /* @__PURE__ */ React.createElement("span", { style: { opacity: E(t, 5) } }, /* @__PURE__ */ React.createElement("span", { style: { color: PAL.ink2 } }, "\u25CB white: unseen"), "   ", /* @__PURE__ */ React.createElement("span", { style: { color: PAL.pull } }, "\u25CF grey: found"), "   ", /* @__PURE__ */ React.createElement("span", { style: { color: PAL.flow } }, "\u25CF black: scanned"))
      }
    ), MEDGES.map(edge), Object.entries(MN).map(([id, [x, y, label]]) => /* @__PURE__ */ React.createElement(
      Box,
      {
        key: id,
        x,
        y,
        w: MW,
        h: MH,
        label,
        fs: 18,
        tone: toneOf(id),
        fill: state[id] === "black" ? true : void 0,
        dashed: id[0] === "g" && garbageA > 0.5,
        a: E(t, 1.2) * (id[0] === "g" && garbageA > 0.5 ? 0.8 : 1),
        glow: pulse(t, [pushAt[id] ?? -9, popAt[id] ?? -9], 0.9)
      }
    )), /* @__PURE__ */ React.createElement(Badge, { x: 1110, y: 738, text: "still white \u2192 garbage", tone: "bad", a: garbageA, fs: 17 }), /* @__PURE__ */ React.createElement(Panel, { x: 1270, y: 196, w: 554, h: 560, title: "mark stack", right: stack.length ? `depth ${stack.length}` : t > 12 ? "empty" : "", tone: "pull", a: E(t, 11.5) }), /* @__PURE__ */ React.createElement(Txt, { x: 1296, y: 258, mono: true, fs: 17, color: PAL.ink2, a: E(t, 18) * (t < 39.5 ? 1 : 0) }, "scanning: ", /* @__PURE__ */ React.createElement("span", { style: { color: PAL.flow } }, lastPop ? MN[lastPop[2]][2] : "")), stack.map((id, i) => /* @__PURE__ */ React.createElement(Box, { key: id, x: 1397, y: 680 - i * 60, w: 300, h: 50, label: MN[id][2], sub: void 0, fs: 19, tone: "pull", a: E(t, pushAt[id], 0.3) })), /* @__PURE__ */ React.createElement(Callout, { x: 1296, y: 300, w: 502, tone: "flow", a: E(t, 49), fs: 20, title: "the cost", text: "Marking visits **live** objects only. The dead ones are never touched: nobody points at them." }), /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 776, mono: true, fs: 17, color: PAL.ink3, a: E(t, 36) }, "MARK BITMAP \xB7 one bit per object, in address order"), BITMAP.map((id, i) => {
      const on = state[id] != null;
      return /* @__PURE__ */ React.createElement(
        Box,
        {
          key: id,
          x: 96 + i * 108,
          y: 804,
          w: 100,
          h: 56,
          label: on ? "1" : "0",
          sub: SHORT[id],
          fs: 22,
          sfs: 17,
          tone: on ? "flow" : id[0] === "g" && garbageA > 0.5 ? "bad" : "dim",
          a: E(t, 36.3 + i * 0.04),
          glow: pulse(t, [pushAt[id] ?? -9], 0.8)
        }
      );
    }));
  }
  function SCycle({ t }) {
    const dropped = t >= 18;
    const leaked = t >= 24.5;
    const traced = t >= 31;
    const pair = (X, mode) => {
      const rc = mode === "rc";
      const dTone = rc ? leaked ? "bad" : "pull" : traced ? "bad" : "pull";
      const gone = !rc && t >= 33.5 ? E(t, 33.5, 0.8) : 0;
      const dCount = dropped ? 1 : 2;
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Box, { x: X + 34, y: 300, w: 200, h: 64, label: rc ? "local d" : "GC roots", sub: rc ? "in handle()" : "stacks, statics", fs: 20, sfs: 17, tone: "violet", a: E(t, rc ? 2 : 31) }), /* @__PURE__ */ React.createElement(HArrow, { x1: X + 238, x2: X + 330, y: 332, a: E(t, rc ? 2.4 : 31.4) * (1 - E(t, 18, 0.6)), color: PAL.violet }), dropped && /* @__PURE__ */ React.createElement(Mark, { x: X + 284, y: 332, ok: false, a: E(t, 18.2) * (1 - E(t, 23, 0.5)) }), /* @__PURE__ */ React.createElement(Box, { x: X + 334, y: 290, w: 160, h: 84, label: "D", sub: rc ? `count ${dCount}` : "unmarked", fs: 30, sfs: 17, tone: dTone, dashed: gone > 0.5, a: E(t, rc ? 2.6 : 30) * (1 - 0.6 * gone), glow: rc ? pulse(t, [18.2], 1.2) + pulse(t, [5.8], 1.2) : 0 }), /* @__PURE__ */ React.createElement(Box, { x: X + 610, y: 290, w: 160, h: 84, label: "E", sub: rc ? "count 1" : "unmarked", fs: 30, sfs: 17, tone: dTone, dashed: gone > 0.5, a: E(t, rc ? 2.9 : 30.3) * (1 - 0.6 * gone), glow: rc ? pulse(t, [6.2], 1.2) : 0 }), /* @__PURE__ */ React.createElement(Arrow, { from: [X + 498, 306], to: [X + 606, 306], curve: -26, a: E(t, rc ? 3.2 : 30.5) * (1 - 0.6 * gone), color: leaked && rc ? PAL.bad : PAL.ink2 }), /* @__PURE__ */ React.createElement(Arrow, { from: [X + 606, 358], to: [X + 498, 358], curve: -26, a: E(t, rc ? 3.2 : 30.5) * (1 - 0.6 * gone), color: leaked && rc ? PAL.bad : PAL.ink2 }));
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel, { x: 96, y: 196, w: 840, h: 420, title: "reference counting", right: "CPython \xB7 Swift \xB7 shared_ptr", tone: "pull", a: E(t, 0.5) }), /* @__PURE__ */ React.createElement(Txt, { x: 130, y: 262, fs: 20, color: PAL.ink2, w: 780, a: E(t, 5.5) }, "every object counts its incoming references; free it when the count hits 0"), pair(96, "rc"), /* @__PURE__ */ React.createElement(Callout, { x: 130, y: 430, w: 772, tone: "bad", a: E(t, 24.5), fs: 20, title: "leak", text: "Neither count can reach zero. Both stay allocated forever, unless the runtime adds a separate cycle detector." }), /* @__PURE__ */ React.createElement(Panel, { x: 984, y: 196, w: 840, h: 420, title: "tracing \xB7 what Java does", tone: "flow", a: E(t, 1) }), /* @__PURE__ */ React.createElement(Txt, { x: 1018, y: 262, fs: 20, color: PAL.ink2, w: 780, a: E(t, 30) }, "no counts: follow references from the roots, keep what you reach"), t >= 29.5 && pair(984, "trace"), /* @__PURE__ */ React.createElement(Callout, { x: 1018, y: 430, w: 772, tone: "flow", a: E(t, 34), fs: 20, title: "collected", text: "The cycle is never reached from a root, so both objects are garbage. Pointing at each other doesn't matter." }), /* @__PURE__ */ React.createElement(
      Code,
      {
        x: 96,
        y: 650,
        w: 900,
        h: 236,
        title: "Cycle.java",
        fs: 17,
        lh: 28,
        a: E(t, 3.5),
        hl: step(t, [[12, 1], [18, 3], [31, 4], [37.5, 5]], -1),
        hlA: E(t, 12.5),
        lines: ["Node d = new Node(), e = new Node();", "d.next = e;  e.next = d;                  // a cycle", "var watch = new WeakReference<>(d);       // sees D, keeps nothing alive", "d = null;  e = null;                      // no root reaches the cycle", "System.gc();", 'System.out.println("D collected? " + (watch.get() == null));']
      }
    ), /* @__PURE__ */ React.createElement(Console, { x: 1030, y: 650, w: 794, h: 236, t, a: E(t, 37), fs: 17, lh: 30, title: "terminal \xB7 JDK 17", items: [
      { at: 37.5, text: "java -Xlog:gc Cycle", kind: "cmd" },
      { at: 38.2, text: "[0.004s][info][gc] Using G1", kind: "dim" },
      { at: 38.7, text: "[0.018s][info][gc] GC(0) Pause Full (System.gc()) 3M->0M(10M) 0.815ms" },
      { at: 39.3, text: "D collected? true", kind: "ok" }
    ] }));
  }
  function SLifetimes({ t }) {
    const [hl, hA] = [step(t, [[5.5, 1], [13, 4], [19, 3], [25, -1]], -1), win(t, 5.5, 25)];
    const BX0 = 1e3, BASE = 760, TOP = 330;
    const bars = [
      [5.5, 94.6, "94.6%", "dies in the request", "bad"],
      [13, 5.4, "5.4%", "dies 20k requests later", "pull"],
      [19, 0.09, "< 0.1%", "lives forever", "flow"]
    ];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      Code,
      {
        x: 96,
        y: 196,
        w: 800,
        h: 306,
        title: "what handle() allocates",
        fs: 17,
        lh: 34,
        a: E(t, 0.4),
        hl,
        hlA: hA,
        lines: ["static int handle(int id) {", '    var sb = new StringBuilder("GET /user/").append(id % 500);', "    byte[] body = new byte[1024];", "    CACHE.computeIfAbsent(id % 500, k -> new byte[2048]);", "    sessions[id % N] = new byte[48];", "    return sb.length() + body.length;", "}"].map((s, i) => ({ s, tone: [1, 2].includes(i) ? "bad" : i === 4 ? "pull" : i === 3 ? "flow" : void 0, toneA: E(t, 25) }))
      }
    ), /* @__PURE__ */ React.createElement(Box, { x: 96, y: 530, w: 800, h: 90, align: "left", tone: "bad", a: E(t, 6), fs: 20, sfs: 17, label: "\u2248 1,124 bytes per request \xB7 dead at return", sub: "StringBuilder 24 B + its byte[] 48 B + body 1,040 B + boxed key \u2248 12 B" }), /* @__PURE__ */ React.createElement(Box, { x: 96, y: 636, w: 800, h: 90, align: "left", tone: "pull", a: E(t, 13.3), fs: 20, sfs: 17, label: "64 bytes per request \xB7 dead 20,000 requests later", sub: "the byte[48] session, until its slot is overwritten" }), /* @__PURE__ */ React.createElement(Box, { x: 96, y: 742, w: 800, h: 90, align: "left", tone: "flow", a: E(t, 19.3), fs: 20, sfs: 17, label: "2 KB \xD7 500 entries \xB7 once \xB7 alive forever", sub: "the cache: only the first 500 requests allocate" }), /* @__PURE__ */ React.createElement(Panel, { x: 940, y: 196, w: 884, h: 636, title: "bytes allocated, by lifetime", right: "1M requests", a: E(t, 4.5) }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 970, top: BASE, width: 824, height: 2, background: PAL.line2, opacity: E(t, 5) } }), bars.map(([at, pct, lbl, what, tone], i) => {
      const h = Math.max(3, pct / 100 * (BASE - TOP)) * M(t, at + 0.3, 1.2);
      const x = BX0 + i * 270;
      const c = toneColor(tone);
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: BASE - h, width: 190, height: h, background: hexA(c, 0.3), border: `2px solid ${c}`, borderBottom: "none", borderRadius: "8px 8px 0 0", opacity: E(t, at) } }), /* @__PURE__ */ React.createElement(Txt, { x: x + 95, y: BASE - h - 40, anchor: "mid", mono: true, fs: 24, weight: 600, color: c, a: E(t, at + 1) }, lbl), /* @__PURE__ */ React.createElement(Txt, { x: x + 95, y: BASE + 14, anchor: "mid", fs: 18, color: PAL.ink2, w: 240, align: "center", a: E(t, at) }, what));
    }), /* @__PURE__ */ React.createElement(Callout, { x: 1270, y: 262, w: 526, tone: "pull", a: E(t, 32), fs: 21, title: "weak generational hypothesis", text: "**Most objects die young.** True for nearly every real program, not just this one." }), /* @__PURE__ */ React.createElement(Callout, { x: 1270, y: 430, w: 526, tone: "violet", a: E(t, 39), fs: 20, title: "second observation", text: "Old objects rarely point to young ones. Hold that thought: the card table depends on it." }));
  }
  function SSurvivorCost({ t }) {
    const N = 40, liveIdx = [3, 14, 22, 31];
    const cx = (i) => 120 + i % 20 * 53, cy = (i) => 262 + Math.floor(i / 20) * 50;
    const wiped = E(t, 9, 0.5);
    const runs = [
      ["N = 1", "0 KB survive", 0.076, "104M->1M(123M) 0.069ms", "flow"],
      ["N = 20,000", "1,250 KB survive", 1.051, "105M->2M(123M) 0.917ms", "pull"],
      ["N = 80,000", "5,000 KB survive", 4.895, "109M->6M(123M) 4.964ms", "bad"]
    ];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel, { x: 96, y: 196, w: 1100, h: 170, title: "eden", right: t > 9 ? "empty again: one pointer reset" : "full", a: E(t, 0.4) }), Array.from({ length: N }).map((_, i) => {
      const live = liveIdx.includes(i);
      const c = live ? PAL.flow : PAL.ink3;
      return /* @__PURE__ */ React.createElement("div", { key: i, style: { position: "absolute", left: cx(i), top: cy(i), width: 45, height: 40, boxSizing: "border-box", borderRadius: 6, opacity: E(t, 0.6 + i * 0.02) * (1 - wiped), background: hexA(c, live ? 0.25 : 0.08), border: `2px ${live ? "solid" : "dashed"} ${hexA(c, live ? 1 : 0.5)}`, boxShadow: live && t > 4.5 ? `0 0 ${16 * pulse(t, [4.6], 1.2)}px ${PAL.flow}` : "none" } });
    }), /* @__PURE__ */ React.createElement(Panel, { x: 1240, y: 196, w: 584, h: 170, title: "survivor space", tone: "flow", a: E(t, 4.5) }), liveIdx.map((i, k) => {
      const p = M(t, 5.2 + k * 0.5, 0.9);
      if (p <= 0) return null;
      return /* @__PURE__ */ React.createElement("div", { key: i, style: { position: "absolute", left: lerp(cx(i), 1270 + k * 60, p), top: lerp(cy(i), 286, p), width: 45, height: 40, boxSizing: "border-box", borderRadius: 6, background: hexA(PAL.flow, 0.25), border: `2px solid ${PAL.flow}` } });
    }), /* @__PURE__ */ React.createElement(Txt, { x: 1520, y: 292, mono: true, fs: 18, color: PAL.ink2, a: E(t, 7.5) }, "4 objects copied"), /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 382, fs: 21, color: PAL.ink2, a: E(t, 11) }, "visited: ", /* @__PURE__ */ React.createElement("b", { style: { color: PAL.flow } }, "4 live objects"), "   \xB7   touched: ", /* @__PURE__ */ React.createElement("b", { style: { color: PAL.ink } }, "0 of the 36 dead ones")), /* @__PURE__ */ React.createElement(Panel, { x: 96, y: 440, w: 1728, h: 420, title: "Server, Serial GC, -Xmn128m: same eden, only the live sessions change", right: "JDK 17 \xB7 median of 31 minor GCs", a: E(t, 10.5) }), runs.map(([n, surv, ms, line, tone], i) => {
      const y = 510 + i * 116;
      const at = 24 + i * 1.6;
      const w = ms / 4.895 * 760 * M(t, at, 1);
      const c = toneColor(tone);
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: n }, /* @__PURE__ */ React.createElement(Txt, { x: 126, y, mono: true, fs: 21, weight: 600, color: PAL.ink, a: E(t, 17 + i * 0.4) }, n), /* @__PURE__ */ React.createElement(Txt, { x: 126, y: y + 32, mono: true, fs: 17, color: c, a: E(t, 17 + i * 0.4) }, surv), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 420, top: y + 2, width: Math.max(w, 4), height: 40, borderRadius: 6, background: hexA(c, 0.3), border: `2px solid ${c}`, boxSizing: "border-box", opacity: E(t, at) } }), /* @__PURE__ */ React.createElement(Txt, { x: 430 + Math.max(w, 4), y: y + 6, mono: true, fs: 22, weight: 600, color: c, a: E(t, at + 0.6) }, ms.toFixed(ms < 1 ? 3 : 2), " ms"), /* @__PURE__ */ React.createElement(Txt, { x: 420, y: y + 54, mono: true, fs: 17, color: PAL.ink3, a: E(t, 17.5 + i * 0.4) }, "e.g. GC(20) Pause Young (Allocation Failure) ", line));
    }), /* @__PURE__ */ React.createElement(Callout, { x: 1400, y: 500, w: 394, tone: "pull", a: E(t, 31), fs: 20, text: "Pause time follows the **survivors**. ~100 MB of garbage per GC costs nothing extra." }));
  }

  // src/topics/8.5/scenes2.jsx
  var {
    PAL: PAL2,
    MOTION: MOTION2,
    lin: lin2,
    lerp: lerp2,
    win: win2,
    pulse: pulse2,
    step: step2,
    track: track2,
    track1,
    clamp: clamp2,
    hexA: hexA2,
    MONO: MONO2,
    SANS: SANS2,
    Txt: Txt2,
    Panel: Panel2,
    Box: Box2,
    Code: Code2,
    HArrow: HArrow2,
    VArrow: VArrow2,
    Arrow: Arrow2,
    Dot: Dot2,
    Card: Card2,
    Badge: Badge2,
    Callout: Callout2,
    Mark: Mark2,
    Table,
    Brace,
    Bytes,
    toneColor: toneColor2
  } = window.AN;
  var E2 = MOTION2.enter;
  var M2 = MOTION2.move;
  var POP2 = MOTION2.pop;
  var HEAP = [["A", 0, 2, 1], ["B", 2, 1, 0], ["C", 3, 2, 1], ["D", 5, 1, 0], ["E", 6, 2, 1], ["F", 8, 2, 0], ["G", 10, 1, 0], ["H", 11, 2, 1], ["I", 13, 1, 0], ["J", 14, 2, 1]];
  var OBJ = Object.fromEntries(HEAP.map((o) => [o[0], o]));
  function Cell({ x, y, unit, s, n, h = 90, label, sub, tone, a = 1, glow = 0, dashed, free, dot, sfs = 17, fs = 26 }) {
    if (a <= 0.01) return null;
    const c = free ? PAL2.ink3 : tone ? toneColor2(tone) : PAL2.ink2;
    return /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      left: x + s * unit + 3,
      top: y,
      width: n * unit - 6,
      height: h,
      boxSizing: "border-box",
      borderRadius: 8,
      opacity: clamp2(a, 0, 1),
      background: free ? `repeating-linear-gradient(45deg, transparent 0 7px, ${hexA2(PAL2.ink3, 0.22)} 7px 9px)` : hexA2(c, tone ? 0.16 : 0.08),
      border: `2px ${dashed || free ? "dashed" : "solid"} ${hexA2(c, free ? 0.6 : 0.9)}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: glow > 0.01 ? `0 0 ${26 * glow}px ${hexA2(c, 0.6 * glow)}` : "none",
      overflow: "hidden"
    } }, label != null && /* @__PURE__ */ React.createElement("div", { style: { font: `600 ${fs}px ${MONO2}`, color: free ? PAL2.ink3 : PAL2.ink, whiteSpace: "nowrap" } }, label), sub != null && /* @__PURE__ */ React.createElement("div", { style: { font: `500 ${sfs}px ${MONO2}`, color: free ? PAL2.ink3 : c, whiteSpace: "nowrap", marginTop: 2 } }, sub), dot > 0.01 && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 8, top: 8, width: 12, height: 12, borderRadius: 6, background: PAL2.flow, opacity: dot, boxShadow: `0 0 10px ${PAL2.flow}` } }));
  }
  function Ruler({ x, y, unit, n = 16, a }) {
    return Array.from({ length: n + 1 }).map((_, i) => /* @__PURE__ */ React.createElement(Txt2, { key: i, x: x + i * unit, y, anchor: "mid", mono: true, fs: 17, color: PAL2.ink3, a }, i));
  }
  var arcUp = (x1, x2, y, k, props) => /* @__PURE__ */ React.createElement(Arrow2, { from: [x1, y], to: [x2, y], curve: x2 > x1 ? -k : k, ...props });
  var arcDown = (x1, x2, y, k, props) => /* @__PURE__ */ React.createElement(Arrow2, { from: [x1, y], to: [x2, y], curve: x2 > x1 ? k : -k, ...props });
  var X0 = 160;
  var U = 100;
  var SY = 400;
  var SH = 90;
  var cxOf = (s, n) => X0 + (s + n / 2) * U;
  var REFS = [["A", "C", 64], ["C", "H", 110], ["E", "J", 72], ["B", "D", 46], ["F", "G", 40]];
  function SMarkSweep({ t }) {
    const markAt = { A: 6.5, C: 7.2, H: 7.9, E: 8.6, J: 9.3 };
    const sweepX = X0 + lin2(t, 12, 6) * 16 * U;
    const passed = (s) => t >= 12 + 6 * (s / 16);
    const holes = [[2, 1], [5, 1], [8, 3], [13, 1]];
    const tries = [32.9, 34.2, 35.5, 36.8];
    const tryIdx = step2(t, tries.map((ti, i) => [ti, i]), -1);
    const dt = tryIdx >= 0 ? t - tries[tryIdx] : 0;
    const shake = tryIdx >= 0 && dt > 0.2 && dt < 0.7 ? Math.sin(dt * 50) * 7 : 0;
    const hc = (i) => X0 + (holes[i][0] + holes[i][1] / 2) * U;
    const hx = (i) => clamp2(hc(i) - 200, 160, 1420);
    const tokX = track1(t, [[32.2, 1360], [32.9, hx(0)], [33.8, hx(0)], [34.2, hx(1)], [35.1, hx(1)], [35.5, hx(2)], [36.4, hx(2)], [36.8, hx(3)]]);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt2, { x: X0, y: 200, mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 0.5) }, "HEAP \xB7 16 SLOTS \xB7 10 OBJECTS"), REFS.map(([a, b, k]) => {
      const A = OBJ[a], B = OBJ[b], dead = !A[3];
      const freed = dead && passed(A[1]);
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: a + b }, arcUp(cxOf(A[1], A[2]) + 10, cxOf(B[1], B[2]) - 10, SY - 4, k, { a: E2(t, 1.5) * (dead ? 0.5 : 1) * (freed ? 0 : 1), color: dead ? PAL2.ink3 : t >= markAt[b] ? PAL2.flow : PAL2.ink2, width: 2.2 }));
    }), HEAP.filter((o) => !(t >= 12 && passed(10) && ["F", "G"].includes(o[0]))).map(([n, s, sz, live]) => {
      const freed = !live && t >= 12 && passed(s);
      return /* @__PURE__ */ React.createElement(
        Cell,
        {
          key: n,
          x: X0,
          y: SY,
          unit: U,
          s,
          n: sz,
          h: SH,
          label: freed ? "free" : n,
          sub: freed ? `${sz} slot${sz > 1 ? "s" : ""}` : void 0,
          free: freed,
          fs: freed ? 18 : 26,
          tone: live && t >= markAt[n] ? "flow" : void 0,
          a: E2(t, 0.6 + s * 0.04),
          glow: live ? pulse2(t, [markAt[n]], 1) : 0,
          dot: live && t >= markAt[n] && !passed(s) ? 1 : 0
        }
      );
    }), t >= 12 && passed(10) && /* @__PURE__ */ React.createElement(Cell, { x: X0, y: SY, unit: U, s: 8, n: 3, h: SH, label: "free", sub: "3 slots, merged", free: true, fs: 18, a: 1 }), /* @__PURE__ */ React.createElement(Ruler, { x: X0, y: SY + SH + 8, unit: U, a: E2(t, 1) }), t >= 12 && t < 18.6 && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: sweepX - 2, top: SY - 30, width: 4, height: SH + 60, background: PAL2.pull, boxShadow: `0 0 16px ${PAL2.pull}` } }), t >= 12 && t < 18.6 && /* @__PURE__ */ React.createElement(Txt2, { x: sweepX, y: SY - 60, anchor: "mid", mono: true, fs: 17, color: PAL2.pull }, "sweep \u2192"), [["r1", "A"], ["r2", "E"]].map(([r, o]) => {
      const x = cxOf(OBJ[o][1], OBJ[o][2]);
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: r }, /* @__PURE__ */ React.createElement(Box2, { x: x - 70, y: 576, w: 140, h: 62, label: r, sub: "root", fs: 18, sfs: 17, tone: "violet", a: E2(t, 1) }), /* @__PURE__ */ React.createElement(VArrow2, { x, y1: 572, y2: SY + SH + 34, a: E2(t, 1.2), color: PAL2.violet }));
    }), /* @__PURE__ */ React.createElement(Txt2, { x: X0, y: 660, mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 19) }, "FREE LIST"), /* @__PURE__ */ React.createElement(Box2, { x: X0, y: 690, w: 150, h: 56, label: "head", fs: 19, tone: "pull", a: E2(t, 19.2) }), holes.map(([s, n], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: s }, /* @__PURE__ */ React.createElement(HArrow2, { x1: X0 + 154 + i * 240, x2: X0 + 196 + i * 240, y: 718, a: E2(t, 19.6 + i * 0.5), color: PAL2.pull }), /* @__PURE__ */ React.createElement(Box2, { x: X0 + 200 + i * 240, y: 690, w: 190, h: 56, label: `@${s} \xB7 ${n}`, sub: "address \xB7 size", fs: 20, sfs: 17, tone: "ink", a: E2(t, 19.8 + i * 0.5) }))), holes.map(([s, n], i) => /* @__PURE__ */ React.createElement(Brace, { key: "b" + s, x: X0 + s * U + 6, y: SY + SH + 34, w: n * U - 12, label: String(n), tone: "bad", a: win2(t, 26, 38.4), fs: 17 })), /* @__PURE__ */ React.createElement(Txt2, { x: 1340, y: 702, fs: 22, color: PAL2.bad, a: E2(t, 26.5) }, "6 slots free \xB7 largest hole: 3"), /* @__PURE__ */ React.createElement(Box2, { x: tokX + shake, y: 232, w: 400, h: 64, label: "new object \xB7 needs 4", fs: 20, tone: t >= 37.4 ? "bad" : "pull", a: E2(t, 32) * (1 - 0.3 * E2(t, 38.5)), dashed: true }), tries.map((ti, i) => /* @__PURE__ */ React.createElement(Mark2, { key: i, x: X0 + holes[i][0] * U + holes[i][1] * U / 2, y: 350, ok: false, a: E2(t, ti + 0.6) * win2(t, ti + 0.6, 38.4) })), /* @__PURE__ */ React.createElement(Badge2, { x: 1500, y: 760, text: "allocation fails with 6 slots free", tone: "bad", a: E2(t, 37.4), fs: 17, solid: true }), /* @__PURE__ */ React.createElement(Callout2, { x: X0, y: 800, w: 1664, tone: "pull", a: E2(t, 38.5), fs: 20, title: "cost", text: "Marking scales with **live** objects, sweeping with the **whole heap**. Nothing moves, so no pointer fixing, but allocation must search a free list." }));
  }
  var NEWS = { A: 0, C: 2, E: 4, H: 6, J: 8 };
  function SMarkCompact({ t }) {
    const fwdAt = { A: 6.5, C: 8, E: 9.5, H: 11, J: 12.5 };
    const slideAt = { A: 27, C: 27.6, E: 28.6, H: 29.6, J: 30.6 };
    const live = HEAP.filter((o) => o[3]);
    const sOf = (o) => lerp2(o[1], NEWS[o[0]], M2(t, slideAt[o[0]], 0.9));
    const pass = t < 5.5 ? 0 : t < 19.5 ? 1 : t < 27 ? 2 : t < 34 ? 3 : 4;
    const refRows = [["r1  (root)", "@0", "@0", 20.2], ["r2  (root)", "@6", "@4", 21.4], ["A.next", "@3", "@2", 22.6], ["C.next", "@11", "@6", 23.8], ["E.next", "@14", "@8", 25]];
    const scanX = X0 + lin2(t, 5.5, 8) * 16 * U;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt2, { x: X0, y: 200, mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 0.5) }, "SAME HEAP \xB7 MARKED"), REFS.filter(([a]) => OBJ[a][3]).map(([a, b, k]) => {
      const A = OBJ[a], B = OBJ[b];
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: a + b }, arcUp(cxOf(sOf(A), A[2]) + 10, cxOf(sOf(B), B[2]) - 10, SY - 4, k * (1 - 0.35 * M2(t, 27, 4)), { a: E2(t, 1.2), color: pass === 2 ? PAL2.violet : PAL2.flow, width: 2.2 }));
    }), HEAP.filter((o) => !o[3]).map(([n, s, sz]) => /* @__PURE__ */ React.createElement(Cell, { key: n, x: X0, y: SY, unit: U, s, n: sz, h: SH, label: n, a: E2(t, 0.6) * (1 - E2(t, 26.5, 0.5)) })), live.map((o) => {
      const [n, s, sz] = o;
      const moved = t >= slideAt[n] + 0.9;
      return /* @__PURE__ */ React.createElement(
        Cell,
        {
          key: n,
          x: X0,
          y: SY,
          unit: U,
          s: sOf(o),
          n: sz,
          h: SH,
          label: n,
          tone: "flow",
          a: E2(t, 0.6),
          dot: 1 - E2(t, 33),
          sub: t >= fwdAt[n] && !moved ? `fwd @${NEWS[n]}` : moved ? `@${NEWS[n]}` : `@${s}`,
          glow: pulse2(t, [fwdAt[n], slideAt[n] + 0.9], 1),
          sfs: 17
        }
      );
    }), t >= 34 && /* @__PURE__ */ React.createElement(Cell, { x: X0, y: SY, unit: U, s: 10, n: 6, h: SH, label: "free", sub: "one block \xB7 6 slots", free: true, fs: 20, a: E2(t, 34) }), /* @__PURE__ */ React.createElement(Ruler, { x: X0, y: SY + SH + 8, unit: U, a: E2(t, 1) }), pass === 1 && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: scanX - 2, top: SY - 30, width: 4, height: SH + 60, background: PAL2.violet, boxShadow: `0 0 16px ${PAL2.violet}`, opacity: 1 - E2(t, 13.5) } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: X0 + 10 * U - 12, top: SY + SH + 36, width: 0, height: 0, borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderBottom: `18px solid ${PAL2.pull}`, opacity: E2(t, 34.5) } }), /* @__PURE__ */ React.createElement(Txt2, { x: X0 + 10 * U + 22, y: SY + SH + 40, mono: true, fs: 18, color: PAL2.pull, a: E2(t, 34.5) }, "top: the next allocation goes here"), /* @__PURE__ */ React.createElement(Txt2, { x: X0, y: 600, mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 2) }, "EVERY REFERENCE TO A MOVING OBJECT"), /* @__PURE__ */ React.createElement(
      Table,
      {
        x: X0,
        y: 630,
        cols: [220, 150, 150],
        head: ["reference", "before", "after"],
        a: E2(t, 2),
        fs: 19,
        rh: 44,
        rows: refRows.map(([r, b, a2, at]) => [r, t >= at ? /* @__PURE__ */ React.createElement("span", { style: { color: PAL2.ink3, textDecoration: "line-through" } }, b) : b, /* @__PURE__ */ React.createElement("span", { style: { color: PAL2.flow, opacity: E2(t, at) } }, a2)]),
        marks: Object.fromEntries(refRows.map((r, i) => [i, ["violet", pulse2(t, [r[3]], 1.2)]]))
      }
    ), /* @__PURE__ */ React.createElement(Callout2, { x: 720, y: 600, w: 1104, tone: "violet", a: win2(t, 5.5, 19.3), fs: 21, title: "pass 1 \xB7 compute", text: "Walk the heap in address order. Each live object's new address is the total size of the live objects before it." }), /* @__PURE__ */ React.createElement(Callout2, { x: 720, y: 600, w: 1104, tone: "violet", a: win2(t, 19.5, 26.8), fs: 21, title: "pass 2 \xB7 update", text: "Rewrite every reference, in roots and in object fields, to the new address. Nothing has moved yet." }), /* @__PURE__ */ React.createElement(Callout2, { x: 720, y: 600, w: 1104, tone: "flow", a: win2(t, 27, 33.8), fs: 21, title: "pass 3 \xB7 move", text: "Slide each object down to its new home, lowest address first, so nothing live is overwritten." }), /* @__PURE__ */ React.createElement(Callout2, { x: 720, y: 600, w: 1104, tone: "flow", a: E2(t, 34), fs: 21, title: "result", text: "No holes. All free space is one block, so allocating is just bumping `top`." }), /* @__PURE__ */ React.createElement(Callout2, { x: 720, y: 760, w: 1104, tone: "pull", a: E2(t, 40.5), fs: 20, title: "cost", text: "Several passes over the heap, and every survivor may move: the slowest of the three. Its reward is zero fragmentation with no spare space." }));
  }
  var CX0 = 300;
  var CU = 90;
  var FY = 290;
  var TY = 610;
  var CH = 80;
  var ccx = (s, n) => CX0 + (s + n / 2) * CU;
  var COPIES = [["A", 0, 5.2], ["E", 2, 6.8], ["C", 4, 19.5], ["J", 6, 25.5], ["H", 8, 28]];
  var CREFS = [["A", "C", 60], ["C", "H", 90], ["E", "J", 60], ["B", "D", 40], ["F", "G", 34]];
  function SCopying({ t }) {
    const cp = Object.fromEntries(COPIES.map((c) => [c[0], c]));
    const S = track1(t, [[0, 0], [12, 0], [21, 0], [21.5, 2], [26.6, 2], [27, 4], [29.4, 4], [29.8, 6], [30.6, 6], [31, 8], [34.6, 8], [35, 10]]);
    const F = track1(t, [[0, 0], [5.4, 0], [6.2, 2], [7, 2], [7.8, 4], [19.7, 4], [20.5, 6], [25.7, 6], [26.5, 8], [28.2, 8], [29, 10]]);
    const cleared = E2(t, 45.5, 0.8);
    const scanning = t >= 18.5 && t < 21.5 ? "A" : t >= 25 && t < 27 ? "E" : t >= 27 && t < 29.8 ? "C" : t >= 29.8 && t < 31 ? "J" : t >= 32 && t < 35 ? "H" : null;
    const toRefs = [["A", "C", 20.5, 70, 10, -10], ["E", "J", 26.5, 56, 10, -10], ["C", "H", 29, 50, 10, -10], ["H", "C", 33, 95, 10, 10]];
    const r1To = t >= 6.2, r2To = t >= 7.8;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt2, { x: 96, y: FY + 24, mono: true, fs: 18, weight: 600, color: cleared > 0.5 ? PAL2.ink3 : PAL2.ink2, a: E2(t, 0.4) }, "from-space"), /* @__PURE__ */ React.createElement(Txt2, { x: 96, y: TY + 24, mono: true, fs: 18, weight: 600, color: PAL2.flow, a: E2(t, 0.6) }, "to-space"), /* @__PURE__ */ React.createElement(Txt2, { x: 96, y: TY + 50, mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 0.6) }, "empty at start"), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: CX0, top: TY, width: 16 * CU, height: CH, boxSizing: "border-box", border: `2px dashed ${PAL2.line2}`, borderRadius: 8, opacity: E2(t, 0.6) } }), CREFS.map(([a, b, k]) => {
      const A = OBJ[a], B = OBJ[b], dead = !A[3];
      const back = a === "H";
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: a + b }, arcUp(ccx(A[1], A[2]) + (back ? 10 : 8), ccx(B[1], B[2]) - 8, FY - 4, k, { a: E2(t, 1.2) * (dead ? 0.45 : 0.9) * (1 - cleared), color: PAL2.ink3, width: 2 }));
    }), arcUp(ccx(11, 2) + 14, ccx(3, 2) + 8, FY - 4, 140, { a: E2(t, 1.2) * 0.9 * (1 - cleared), color: PAL2.ink3, width: 2 }), HEAP.map(([n, s, sz, live]) => {
      const c = cp[n];
      const fwd = c && t >= c[2] + 1;
      return /* @__PURE__ */ React.createElement(
        Cell,
        {
          key: n,
          x: CX0,
          y: FY,
          unit: CU,
          s,
          n: sz,
          h: CH,
          label: n,
          fs: 24,
          sfs: 17,
          tone: fwd ? "violet" : live ? "ink" : void 0,
          sub: fwd ? `\u2192 to@${c[1]}` : void 0,
          a: E2(t, 0.5 + s * 0.03) * (1 - cleared),
          glow: n === "C" ? pulse2(t, [33], 1.4) : 0,
          dashed: !live && cleared > 0
        }
      );
    }), cleared > 0.01 && /* @__PURE__ */ React.createElement(Cell, { x: CX0, y: FY, unit: CU, s: 0, n: 16, h: CH, label: "all free", sub: "next GC copies the other way", free: true, fs: 22, a: cleared }), /* @__PURE__ */ React.createElement(Ruler, { x: CX0, y: FY + CH + 6, unit: CU, a: E2(t, 0.8) * (1 - cleared) }), COPIES.map(([n, to, at]) => {
      const o = OBJ[n];
      const p = M2(t, at, 1);
      if (p <= 0) return null;
      const x = lerp2(CX0 + o[1] * CU, CX0 + to * CU, p), y = lerp2(FY, TY, p);
      const done = p >= 1;
      return /* @__PURE__ */ React.createElement(Cell, { key: n, x, y, unit: CU, s: 0, n: o[2], h: CH, label: n + "'", fs: 24, tone: "flow", a: 1, glow: (scanning === n ? 0.8 : 0) + pulse2(t, [at + 1], 1), sub: done ? `@${to}` : void 0, sfs: 17 });
    }), toRefs.map(([a, b, at, k, oa, ob]) => {
      const xa = ccx(cp[a][1], 2) + oa, xb = ccx(cp[b][1], 2) + ob;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: a + b }, arcDown(xa, xb, TY + CH + 4, k, { draw: M2(t, at, 0.6), color: PAL2.flow, width: 2.2 }));
    }), /* @__PURE__ */ React.createElement(Box2, { x: 96, y: 430, w: 170, h: 44, label: "root r1", fs: 17, tone: "violet", a: E2(t, 1) }), /* @__PURE__ */ React.createElement(Box2, { x: 96, y: 490, w: 170, h: 44, label: "root r2", fs: 17, tone: "violet", a: E2(t, 1) }), /* @__PURE__ */ React.createElement(Arrow2, { pts: r1To ? [[268, 452], [390, 452], [390, TY - 32]] : [[268, 452], [390, 452], [390, FY + CH + 30]], color: r1To ? PAL2.flow : PAL2.violet, a: E2(t, 1.2), width: 2.2 }), /* @__PURE__ */ React.createElement(Arrow2, { pts: r2To ? [[268, 512], [570, 512], [570, TY - 32]] : [[268, 512], [930, 512], [930, FY + CH + 30]], color: r2To ? PAL2.flow : PAL2.violet, a: E2(t, 1.2), width: 2.2 }), [[S, "scan", PAL2.pull, 12], [F, "free", PAL2.flow, 12]].map(([v, lbl, c, at], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: lbl }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: CX0 + v * CU - 11, top: 790 + i * 56, width: 0, height: 0, borderLeft: "11px solid transparent", borderRight: "11px solid transparent", borderBottom: `16px solid ${c}`, opacity: E2(t, at) } }), /* @__PURE__ */ React.createElement(Txt2, { x: CX0 + v * CU + 18, y: 790 + i * 56 - 4, mono: true, fs: 18, weight: 600, color: c, a: E2(t, at) }, lbl, " = ", Math.round(v)))), /* @__PURE__ */ React.createElement(Badge2, { x: 1580, y: 812, text: "scan = free \u2192 done", tone: "flow", a: E2(t, 39), fs: 18, solid: true }), /* @__PURE__ */ React.createElement(Callout2, { x: 1100, y: 420, w: 724, tone: "pull", a: E2(t, 45.5), fs: 20, title: "cost", text: "Work scales with **live** objects only. The price: a second space as big as the first." }), /* @__PURE__ */ React.createElement(Badge2, { x: 1180, y: 540, text: "already forwarded: follow it, don't copy", tone: "violet", a: win2(t, 32.5, 38.5), fs: 17 }));
  }
  var MINI = {
    sweep: [[0, 2, 1], [2, 1, 0], [3, 2, 1], [5, 1, 0], [6, 2, 1], [8, 3, 0], [11, 2, 1], [13, 1, 0], [14, 2, 1]],
    compact: [[0, 2, 1], [2, 2, 1], [4, 2, 1], [6, 2, 1], [8, 2, 1], [10, 6, 0]],
    copyTo: [[0, 2, 1], [2, 2, 1], [4, 2, 1], [6, 2, 1], [8, 2, 1], [10, 6, 0]]
  };
  function MiniStrip({ x, y, cells, u = 30, h = 34, a }) {
    return cells.map(([s, n, live], i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
      position: "absolute",
      left: x + s * u + 2,
      top: y,
      width: n * u - 4,
      height: h,
      boxSizing: "border-box",
      borderRadius: 5,
      opacity: a,
      background: live ? hexA2(PAL2.flow, 0.28) : `repeating-linear-gradient(45deg, transparent 0 5px, ${hexA2(PAL2.ink3, 0.3)} 5px 7px)`,
      border: `1.5px ${live ? "solid" : "dashed"} ${live ? PAL2.flow : PAL2.ink3}`
    } }));
  }
  function SFamilies({ t }) {
    const rows = [
      ["Mark-sweep", "mark live, free the rest in place", "live + whole heap", "yes", "none", "free-list search"],
      ["Mark-compact", "mark, then slide survivors down", "live + whole heap", "none", "none", "pointer bump"],
      ["Copying", "evacuate survivors to empty space", "live only", "none", "2\xD7 space", "pointer bump"]
    ];
    const marks = { 0: ["pull", win2(t, 3.5, 9.3)], 1: ["violet", win2(t, 9.5, 15.3)], 2: ["flow", win2(t, 15.5, 22)] };
    const minis = [
      [3.5, "mark-sweep \xB7 after", "holes stay where they were", "pull", [["sweep", 0]]],
      [9.5, "mark-compact \xB7 after", "one free block at the end", "violet", [["compact", 0]]],
      [15.5, "copying \xB7 after", "to-space packed \xB7 from-space all free", "flow", [["copyTo", 0], ["free", 1]]]
    ];
    const dots = (n, live, x, y, at) => Array.from({ length: n }).map((_, i) => {
      const on = live.includes(i);
      return /* @__PURE__ */ React.createElement("div", { key: i, style: { position: "absolute", left: x + i % 20 * 38, top: y + Math.floor(i / 20) * 38, width: 30, height: 30, borderRadius: 6, boxSizing: "border-box", opacity: E2(t, at + i * 0.01), background: hexA2(on ? PAL2.flow : PAL2.ink3, on ? 0.3 : 0.08), border: `2px ${on ? "solid" : "dashed"} ${hexA2(on ? PAL2.flow : PAL2.ink3, on ? 1 : 0.5)}` } });
    });
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      Table,
      {
        x: 96,
        y: 196,
        cols: [230, 420, 250, 220, 220, 388],
        head: ["family", "how", "work scales with", "fragments?", "extra space", "allocation"],
        rows,
        a: E2(t, 0.5),
        rowA: rows.map((_, i) => E2(t, [3.5, 9.5, 15.5][i])),
        fs: 19,
        rh: 56,
        marks,
        colColors: [PAL2.ink, PAL2.ink2, PAL2.ink, PAL2.ink, PAL2.ink, PAL2.ink]
      }
    ), minis.map(([at, title, sub, tone, strips], i) => {
      const x = 96 + i * 584, a = E2(t, at + 0.5);
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, /* @__PURE__ */ React.createElement(Panel2, { x, y: 420, w: 560, h: 170, title, tone, a, glow: win2(t, at + 0.5, at + 6) * 0.6 }), strips.map(([k, row]) => k === "free" ? /* @__PURE__ */ React.createElement(MiniStrip, { key: k, x: x + 40, y: 480 + row * 42, cells: [[0, 16, 0]], a }) : /* @__PURE__ */ React.createElement(MiniStrip, { key: k, x: x + 40, y: 480 + row * 42, cells: MINI[k], a })), /* @__PURE__ */ React.createElement(Txt2, { x: x + 40, y: strips.length > 1 ? 562 : 532, fs: 18, color: PAL2.ink2, a }, sub));
    }), /* @__PURE__ */ React.createElement(Panel2, { x: 96, y: 620, w: 840, h: 250, title: "young generation", right: "copying", tone: "flow", a: E2(t, 22) }), dots(40, [5, 19, 30], 130, 684, 22.4), /* @__PURE__ */ React.createElement(Txt2, { x: 130, y: 772, fs: 21, color: PAL2.ink, w: 780, a: E2(t, 23.5) }, "Mostly dead. Copy the few survivors out; the space is empty again."), /* @__PURE__ */ React.createElement(Txt2, { x: 130, y: 826, mono: true, fs: 17, color: PAL2.flow, a: E2(t, 24.5) }, "cheap \xB7 compacts for free \xB7 survivor spaces, not a 2\xD7 heap"), /* @__PURE__ */ React.createElement(Panel2, { x: 984, y: 620, w: 840, h: 250, title: "old generation", right: "mark-compact / mark-sweep", tone: "pull", a: E2(t, 28.5) }), dots(40, Array.from({ length: 40 }).map((_, i) => i).filter((i) => i % 7 !== 3), 1018, 684, 28.8), /* @__PURE__ */ React.createElement(Txt2, { x: 1018, y: 772, fs: 21, color: PAL2.ink, w: 780, a: E2(t, 29.5) }, "Mostly alive. Copying all of it would cost time and a second heap."), /* @__PURE__ */ React.createElement(Txt2, { x: 1018, y: 826, mono: true, fs: 17, color: PAL2.pull, a: E2(t, 30.5) }, "collect rarely \xB7 mark in place \xB7 compact when needed"), /* @__PURE__ */ React.createElement(Badge2, { x: 960, y: 900, text: "G1 copies regions of both generations \xB7 ZGC and Shenandoah move objects concurrently \u2192 8.6", tone: "ink", a: E2(t, 32), fs: 17 }));
  }
  var EV0 = [96, 196];
  var S0X = 1130;
  var S1X = 1494;
  var edenPos = (i) => [116 + i % 14 * 68, 256 + Math.floor(i / 14) * 66];
  var survPos = (r, k) => [(r === "S0" ? S0X : S1X) + 22 + k % 4 * 76, 258 + Math.floor(k / 4) * 66];
  var oldPos = (k) => [126 + k * 76, 604];
  var FILLS = [[6.5, 12], [19.5, 25], [36, 41.5]];
  var CLEAR = [18.8, 31.8, 51.3];
  var TRACKED = { 4: "C1", 19: "C2", 33: "C3", 9: "s", 27: "s" };
  var MOVES = (() => {
    const born = (f, i) => FILLS[f][0] + i / 42 * (FILLS[f][1] - FILLS[f][0]);
    const L = [];
    ["C1", "C2", "C3"].forEach((n, j) => {
      const i = [4, 19, 33][j];
      L.push({ n, born: born(0, i), keys: [[born(0, i), edenPos(i)], [16.5 + j * 0.3, edenPos(i)], [17.4 + j * 0.3, survPos("S0", j)], [29.5 + j * 0.3, survPos("S0", j)], [30.4 + j * 0.3, survPos("S1", j)], [49 + j * 0.3, survPos("S1", j)], [50 + j * 0.3, oldPos(j)]], ages: [[17.4 + j * 0.3, 1], [30.4 + j * 0.3, 2], [50 + j * 0.3, null]], dead: 99, gone: 99, tone: "flow" });
    });
    [[0, "sA", 22, 31.8, ["S0", 3]], [1, "sB", 39, 51.3, ["S1", 3]], [2, "sC", 99, 99, ["S0", 0]]].forEach(([f, base, dead, gone, [reg, k0]]) => {
      [9, 27].forEach((i, j) => {
        const gc = [16.5, 29.5, 49][f] + 1 + j * 0.3;
        L.push({ n: base + (j + 1), born: born(f, i), keys: [[born(f, i), edenPos(i)], [gc, edenPos(i)], [gc + 0.9, survPos(reg, k0 + j)]], ages: [[gc + 0.9, 1]], dead, gone, tone: "pull" });
      });
    });
    return L;
  })();
  function SMinorGC({ t }) {
    const gcs = [12.5, 25.5, 42];
    const status = t < 6.5 ? "heap layout" : t < 12.5 ? "requests allocate in eden\u2026" : t < 19 ? "minor GC 1: eden \u2192 S0" : t < 25.5 ? "allocating again\u2026" : t < 32 ? "minor GC 2: eden + S0 \u2192 S1" : t < 42 ? "allocating again\u2026" : t < 49 ? "eden full: minor GC 3" : "minor GC 3: promote age 2 \u2192 old";
    const role = (r) => {
      const p = t < 18.8 ? 0 : t < 31.8 ? 1 : t < 51.3 ? 2 : 3;
      const s0 = ["to-space", "from", "to-space", "from"][p], s1 = ["empty", "to-space", "from", "to-space"][p];
      return r === "S0" ? s0 : s1;
    };
    const temps = [];
    FILLS.forEach(([fs, fe], f) => {
      for (let i = 0; i < 42; i++) {
        if (TRACKED[i]) continue;
        const at = fs + i / 42 * (fe - fs);
        const a = E2(t, at, 0.2) * (1 - E2(t, CLEAR[f], 0.4));
        if (a < 0.01) continue;
        const dead = E2(t, at + 0.7, 0.4);
        const [x, y] = edenPos(i);
        temps.push(/* @__PURE__ */ React.createElement("div", { key: f + "-" + i, style: { position: "absolute", left: x, top: y, width: 58, height: 52, boxSizing: "border-box", borderRadius: 7, opacity: a * (1 - 0.55 * dead), background: hexA2(PAL2.ink2, 0.1), border: `2px ${dead > 0.5 ? "dashed" : "solid"} ${hexA2(PAL2.ink2, 0.5)}` } }));
      }
    });
    const c1 = MOVES[0];
    const c1age = step2(t, c1.ages, 0);
    const promoted = t >= 50;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel2, { x: EV0[0], y: EV0[1], w: 1e3, h: 300, title: "eden", right: t > 12.5 && t < 19 ? "allocation failure" : t > 25.5 && t < 32 ? "allocation failure" : t > 42 && t < 51.3 ? "allocation failure" : "young generation", tone: "flow", a: E2(t, 0.5), glow: pulse2(t, gcs, 1.4) }), /* @__PURE__ */ React.createElement(Panel2, { x: S0X, y: 196, w: 330, h: 300, title: "S0", right: role("S0"), tone: "pull", a: E2(t, 1.2) }), /* @__PURE__ */ React.createElement(Panel2, { x: S1X, y: 196, w: 330, h: 300, title: "S1", right: role("S1"), tone: "pull", a: E2(t, 1.5) }), /* @__PURE__ */ React.createElement(Panel2, { x: 96, y: 540, w: 1100, h: 180, title: "old generation (tenured)", right: "collected rarely", tone: "violet", a: E2(t, 2) }), temps, MOVES.map((o) => {
      if (t < o.born) return null;
      const [x, y] = track2(t, o.keys.map(([ti, [px, py]]) => [ti, px, py]));
      const age = step2(t, o.ages, 0);
      const dead = t >= o.dead;
      const a = E2(t, o.born, 0.2) * (1 - E2(t, o.gone, 0.4));
      if (a < 0.01) return null;
      const c = dead ? PAL2.ink3 : toneColor2(o.tone);
      const inOld = age === null;
      return /* @__PURE__ */ React.createElement("div", { key: o.n, style: { position: "absolute", left: x, top: y, width: inOld ? 64 : 58, height: 52, boxSizing: "border-box", borderRadius: 7, opacity: a * (dead ? 0.6 : 1), background: hexA2(c, 0.2), border: `2px ${dead ? "dashed" : "solid"} ${c}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: inOld || age ? `0 0 ${12 * pulse2(t, o.ages.map((k) => k[0]), 1)}px ${c}` : "none" } }, /* @__PURE__ */ React.createElement("div", { style: { font: `600 17px ${MONO2}`, color: PAL2.ink } }, o.n.replace(/[0-9]/, "")), /* @__PURE__ */ React.createElement("div", { style: { font: `500 17px ${MONO2}`, color: c } }, dead ? "dead" : inOld ? "old" : age ? `age ${age}` : "new"));
    }), /* @__PURE__ */ React.createElement(Panel2, { x: 1230, y: 540, w: 594, h: 180, title: "mark word \xB7 a cache entry", right: "64 bits", tone: "pull", a: E2(t, 42) }), /* @__PURE__ */ React.createElement(Bytes, { x: 1254, y: 600, unit: 8.4, h: 46, ruler: false, a: E2(t, 42.4), fs: 17, cells: [
      { n: 25, label: "unused", tone: "dim" },
      { n: 31, label: "identity hash", tone: "ink" },
      { n: 1, tone: "dim" },
      { n: 4, tone: "pull", glow: pulse2(t, [42.6, 49], 1.2) },
      { n: 1, tone: "dim" },
      { n: 2, tone: "dim" }
    ] }), /* @__PURE__ */ React.createElement(Txt2, { x: 1750, y: 652, anchor: "mid", mono: true, fs: 17, color: PAL2.pull, a: E2(t, 42.6) }, "age"), /* @__PURE__ */ React.createElement(Txt2, { x: 1254, y: 680, mono: true, fs: 19, color: PAL2.ink2, a: E2(t, 43) }, "age bits: ", /* @__PURE__ */ React.createElement("span", { style: { color: PAL2.pull, fontWeight: 600 } }, promoted ? "promoted" : (c1age || 0).toString(2).padStart(4, "0")), "   ", /* @__PURE__ */ React.createElement("span", { style: { color: PAL2.ink3 } }, "\xB7 4 bits \u2192 max 15")), /* @__PURE__ */ React.createElement(Txt2, { x: 96, y: 752, mono: true, fs: 24, weight: 600, color: PAL2.ink, a: E2(t, 1) }, status), [["GC 1", "eden \u2192 S0 \xB7 5 copied", 16.5], ["GC 2", "eden + S0 \u2192 S1 \xB7 2 dead skipped", 29.5], ["GC 3", "3 promoted \xB7 2 dead skipped", 49]].map(([n, s, at], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: n }, /* @__PURE__ */ React.createElement(Box2, { x: 96 + i * 420, y: 800, w: 396, h: 72, align: "left", label: n, sub: s, fs: 20, sfs: 17, tone: i === 2 ? "violet" : "flow", a: E2(t, at), glow: pulse2(t, [at], 1) }))), /* @__PURE__ */ React.createElement(Badge2, { x: 1560, y: 768, text: "tenuring threshold here: 2 \xB7 HotSpot max: 15", tone: "pull", a: E2(t, 56.5), fs: 17 }));
  }

  // src/topics/8.5/scenes3.jsx
  var {
    PAL: PAL3,
    MOTION: MOTION3,
    lin: lin3,
    lerp: lerp3,
    win: win3,
    pulse: pulse3,
    step: step3,
    track: track3,
    track1: track12,
    clamp: clamp3,
    hexA: hexA3,
    MONO: MONO3,
    SANS: SANS3,
    Txt: Txt3,
    Panel: Panel3,
    Box: Box3,
    Code: Code3,
    Console: Console2,
    HArrow: HArrow3,
    VArrow: VArrow3,
    Arrow: Arrow3,
    Dot: Dot3,
    Card: Card3,
    Badge: Badge3,
    Callout: Callout3,
    Mark: Mark3,
    Brace: Brace2,
    toneColor: toneColor3
  } = window.AN;
  var E3 = MOTION3.enter;
  var M3 = MOTION3.move;
  var POP3 = MOTION3.pop;
  function SAgeLog({ t }) {
    const g = t < 6.5 ? -1 : t < 12 ? 0 : t < 19.5 ? 1 : t < 26.5 ? Math.min(14, 1 + Math.floor((t - 19.5) / 0.5)) : t < 27 ? 14 : 15;
    const ages = g < 0 ? {} : g === 0 ? { 1: 2959976 } : g === 15 ? { 1: 1280072 } : { 1: 1280072, [g + 1]: 1679824 };
    const PX = 1130, BASE = 600, SC = 300 / 2959976;
    const tenured = g === 15 ? E3(t, 27.2, 0.8) : 0;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Console2, { x: 96, y: 196, w: 1e3, h: 704, t, fs: 17, lh: 28, title: "terminal \xB7 JDK 17 \xB7 Serial GC \xB7 abridged", a: E3(t, 0.4), items: [
      { at: 0.8, text: "java -XX:+UseSerialGC -Xmx256m -Xmn64m \\", kind: "cmd" },
      { at: 0.9, text: "    -Xlog:gc,gc+age=trace,gc+heap=info Server 1000000" },
      { at: 6.5, text: "[0.038s][trace][gc,age] GC(0) Age table with threshold 15 (max threshold 15)", kind: "dim" },
      { at: 6.8, text: "[0.038s][trace][gc,age] GC(0) - age   1:    2959976 bytes,    2959976 total" },
      { at: 7.1, text: "[0.038s][info ][gc     ] GC(0) Pause Young (Allocation Failure) 51M->2M(121M) 2.800ms", kind: "dim" },
      { at: 12, text: "[0.049s][trace][gc,age ] GC(1) - age   1:    1280072 bytes,    1280072 total" },
      { at: 12.4, text: "[0.049s][trace][gc,age ] GC(1) - age   2:    1679824 bytes,    2959896 total", kind: "ok" },
      { at: 12.7, text: "[0.049s][info ][gc     ] GC(1) Pause Young (Allocation Failure) 54M->2M(121M) 1.790ms", kind: "dim" },
      { at: 20, text: "[0.059s][trace][gc,age ] GC(2) - age   1:    1280072 bytes,    1280072 total" },
      { at: 20.2, text: "[0.059s][trace][gc,age ] GC(2) - age   3:    1679824 bytes,    2959896 total", kind: "ok" },
      { at: 20.5, text: "[0.067s][trace][gc,age ] GC(3) - age   1:    1280072 bytes,    1280072 total" },
      { at: 20.7, text: "[0.067s][trace][gc,age ] GC(3) - age   4:    1679824 bytes,    2959896 total", kind: "ok" },
      { at: 21.5, text: "   \u2026", kind: "dim" },
      { at: 26.5, text: "[0.142s][trace][gc,age ] GC(14) - age   1:    1280072 bytes,    1280072 total" },
      { at: 26.7, text: "[0.142s][trace][gc,age ] GC(14) - age  15:    1679824 bytes,    2959896 total", kind: "ok" },
      { at: 27.2, text: "[0.149s][trace][gc,age ] GC(15) - age   1:    1280072 bytes,    1280072 total" },
      { at: 27.5, text: "[0.149s][info ][gc,heap] GC(15) Tenured: 0K(65536K)->1640K(65536K)", kind: "ok" },
      { at: 34.5, text: "java -XX:MaxTenuringThreshold=17 Server 1000", kind: "cmd" },
      { at: 35.2, text: "uintx MaxTenuringThreshold=17 is outside the allowed range [ 0 ... 16 ]", kind: "err" },
      { at: 35.6, text: "Error: Could not create the Java Virtual Machine.", kind: "err" }
    ] }), /* @__PURE__ */ React.createElement(Panel3, { x: PX, y: 196, w: 694, h: 470, title: "age table", right: g >= 0 ? `GC(${g})` : "", tone: "pull", a: E3(t, 1.2) }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: PX + 24, top: BASE, width: 646, height: 2, background: PAL3.line2, opacity: E3(t, 1.4) } }), Array.from({ length: 15 }).map((_, i) => {
      const age = i + 1, v = ages[age] || 0;
      const h = v * SC;
      const c = age === 1 ? g === 0 ? PAL3.ink2 : PAL3.pull : PAL3.flow;
      const x = PX + 30 + i * 42;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: age }, v > 0 && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: BASE - h, width: 34, height: h, background: hexA3(c, 0.32), border: `2px solid ${c}`, borderBottom: "none", borderRadius: "6px 6px 0 0", boxSizing: "border-box" } }), /* @__PURE__ */ React.createElement(Txt3, { x: x + 17, y: BASE + 10, anchor: "mid", mono: true, fs: 17, color: v > 0 ? PAL3.ink : PAL3.ink3, a: E3(t, 1.4) }, age));
    }), /* @__PURE__ */ React.createElement(Txt3, { x: PX + 24, y: BASE + 34, mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 1.4) }, "age (minor GCs survived) \u2192"), /* @__PURE__ */ React.createElement(Badge3, { x: PX + 347, y: 290, text: "age 1: 1,280,072 B = 20,000 \xD7 64 B \xB7 sessions", tone: "pull", a: win3(t, 12.5, 26.5), fs: 17 }), /* @__PURE__ */ React.createElement(Badge3, { x: PX + 347, y: 330, text: "1,679,824 B \xB7 cache + sessions array + startup", tone: "flow", a: win3(t, 19.8, 34.3), fs: 17 }), /* @__PURE__ */ React.createElement(Panel3, { x: PX, y: 690, w: 694, h: 150, title: "old generation", right: tenured > 0.01 ? "0 KB \u2192 1,640 KB" : "0 KB", tone: "violet", a: E3(t, 1.6) }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: PX + 24, top: 760, width: 646, height: 50, borderRadius: 8, border: `2px solid ${PAL3.line2}`, boxSizing: "border-box", opacity: E3(t, 7) } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: PX + 26, top: 762, width: 240 * tenured, height: 46, borderRadius: 6, background: hexA3(PAL3.flow, 0.35), boxShadow: tenured > 0.5 ? `0 0 20px ${hexA3(PAL3.flow, 0.6 * pulse3(t, [28], 1.5))}` : "none" } }), /* @__PURE__ */ React.createElement(Txt3, { x: PX + 290, y: 772, mono: true, fs: 17, color: PAL3.flow, a: tenured }, "promoted at GC(15)"), /* @__PURE__ */ React.createElement(Callout3, { x: PX, y: 856, w: 694, tone: "pull", a: E3(t, 36), fs: 17, text: "16 is allowed and means **never promote by age**. 17 does not fit in 4 bits." }));
  }
  function SPremature({ t }) {
    const occ = t < 26 ? 3986 / 45056 : t < 32.5 ? lerp3(4161, 45035, lin3(t, 26, 6.3)) / 45056 : lerp3(45035, 3664, M3(t, 32.5, 0.8)) / 45056;
    const full = t >= 32.5;
    const spill = M3(t, 13, 1.4);
    const OX = 820, OW = 1004;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Box3, { x: 96, y: 220, w: 360, h: 150, label: "eden", sub: "3,328 KB \xB7 fills fast", tone: "flow", a: E3(t, 0.6), fs: 26, sfs: 17, glow: pulse3(t, [26.5, 27.5, 28.5, 29.5, 30.5, 31.5], 0.5) * 0.6 }), /* @__PURE__ */ React.createElement(HArrow3, { x1: 460, x2: 516, y: 295, a: E3(t, 6.5), color: PAL3.flow }), /* @__PURE__ */ React.createElement(Box3, { x: 520, y: 245, w: 230, h: 100, label: "survivor", sub: "384 KB each", tone: "pull", a: E3(t, 6.5), fs: 22, sfs: 17, glow: win3(t, 6.5, 13) * 0.6 }), /* @__PURE__ */ React.createElement(Box3, { x: 520 + spill * 40, y: 385 - spill * 10, w: 300, h: 56, label: "sessions \xB7 1,250 KB", fs: 18, tone: "bad", a: E3(t, 7.5) * (1 - E3(t, 19.5, 0.5)) }), /* @__PURE__ */ React.createElement(Arrow3, { pts: [[750, 280], [785, 280], [785, 312], [OX - 6, 312]], draw: M3(t, 13, 0.8), color: PAL3.bad, width: 3 }), /* @__PURE__ */ React.createElement(Txt3, { x: 760, y: 196, mono: true, fs: 17, color: PAL3.bad, a: E3(t, 13.4) }, "overflow \u2192 promoted early"), /* @__PURE__ */ React.createElement(Badge3, { x: 635, y: 226, text: "new threshold 2", tone: "pull", a: E3(t, 12.8) * (1 - E3(t, 40, 0.5)), fs: 17 }), /* @__PURE__ */ React.createElement(Panel3, { x: OX, y: 230, w: OW, h: 170, title: "old generation", right: "45,056 KB", tone: full && t < 36 ? "bad" : "violet", a: E3(t, 0.8), glow: pulse3(t, [32.5], 1.6) }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: OX + 24, top: 296, width: OW - 48, height: 60, borderRadius: 8, border: `2px solid ${PAL3.line2}`, boxSizing: "border-box", opacity: E3(t, 1) } }), /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      left: OX + 26,
      top: 298,
      width: (OW - 52) * occ,
      height: 56,
      borderRadius: 6,
      opacity: E3(t, 1),
      background: `repeating-linear-gradient(90deg, ${hexA3(PAL3.flow, 0.4)} 0 ${(OW - 52) * (3664 / 45056)}px, ${hexA3(PAL3.bad, 0.35)} ${(OW - 52) * (3664 / 45056)}px 100%)`
    } }), /* @__PURE__ */ React.createElement(Txt3, { x: OX + 30, y: 364, mono: true, fs: 17, color: PAL3.flow, a: E3(t, 2) }, "live: cache etc."), /* @__PURE__ */ React.createElement(Txt3, { x: OX + OW - 30, y: 364, anchor: "right", mono: true, fs: 17, color: PAL3.bad, a: win3(t, 20, 36) }, "dead sessions pile up here"), /* @__PURE__ */ React.createElement(Console2, { x: 96, y: 440, w: 1728, h: 340, t, fs: 17, lh: 30, title: "terminal \xB7 JDK 17 \xB7 -Xmx48m -Xmn4m \xB7 abridged", a: E3(t, 0.8), items: [
      { at: 1, text: "java -XX:+UseSerialGC -Xmx48m -Xmn4m -Xlog:gc,gc+age=debug,gc+heap=info Server 3000000", kind: "cmd" },
      { at: 7, text: "[0.081s][info ][gc,heap] GC(16) DefNew: 3677K(3712K)->349K(3712K) Eden: 3328K(3328K)->0K(3328K) From: 349K(384K)->349K(384K)" },
      { at: 12.6, text: "[0.081s][debug][gc,age ] GC(16) Desired survivor size 196608 bytes, new threshold 2 (max threshold 15)", kind: "ok" },
      { at: 26, text: "[0.081s][info ][gc,heap] GC(16) Tenured: 3986K(45056K)->4161K(45056K)" },
      { at: 26.8, text: "[0.082s][info ][gc,heap] GC(17) Tenured: 4161K(45056K)->4336K(45056K)" },
      { at: 27.6, text: "[0.083s][info ][gc,heap] GC(18) Tenured: 4336K(45056K)->4511K(45056K)" },
      { at: 28.6, text: "   \u2026  233 more minor GCs, ~175K promoted each time  \u2026", kind: "dim" },
      { at: 32.5, text: "[0.274s][info ][gc,heap] GC(252) Tenured: 45035K(45056K)->3664K(45056K)", kind: "err" },
      { at: 33, text: "[0.274s][info ][gc     ] GC(252) Pause Full (Allocation Failure) 47M->3M(47M) 9.411ms", kind: "err" }
    ] }), /* @__PURE__ */ React.createElement(Box3, { x: 96, y: 796, w: 560, h: 104, align: "left", label: "-Xmn4m", sub: "1,074 minor GCs \xB7 4 full GCs", tone: "bad", a: E3(t, 40), fs: 26, sfs: 20 }), /* @__PURE__ */ React.createElement(Box3, { x: 680, y: 796, w: 560, h: 104, align: "left", label: "-Xmn32m", sub: "133 minor GCs \xB7 0 full GCs", tone: "flow", a: E3(t, 41), fs: 26, sfs: 20 }), /* @__PURE__ */ React.createElement(Callout3, { x: 1264, y: 796, w: 560, tone: "pull", a: E3(t, 47), fs: 20, title: "the fix", text: "A **bigger young gen**: the sessions die there, cheaply, and never reach old." }));
  }
  function SCardTable({ t }) {
    const NC = 24, CW = 70, OX = 120, OY = 510;
    const cardX = (i) => OX + i * CW;
    const dirtyAt = { 11: 31.8, 14: 33.6 };
    const cleaned = t >= 46;
    const isDirty = (i) => dirtyAt[i] != null && t >= dirtyAt[i] && !cleaned;
    const gcScan = win3(t, 39, 46);
    const youngLive = t >= 40;
    const bigScan = t >= 18.5 && t < 24 ? lin3(t, 18.5, 4) : -1;
    const youngObjs = [[150, 300, 6], [330, 300, 7.2], [510, 300, 8.4], [690, 300, 9.6]];
    const olds = [[0, 4, "byte[2048]", "ink"], [4, 4, "byte[2048]", "ink"], [9, 8, "sessions \xB7 Object[20000]", "pull"], [18, 3, "byte[2048]", "ink"], [21, 3, "Node[]", "ink"]];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel3, { x: 96, y: 196, w: 780, h: 210, title: "young generation", right: "minor GC scans this", tone: "flow", a: E3(t, 0.5) }), youngObjs.map(([x, y, at], i) => /* @__PURE__ */ React.createElement(Box3, { key: i, x, y, w: 150, h: 56, label: "byte[48]", fs: 18, tone: youngLive ? "flow" : t >= 12 && t < 18.5 ? "bad" : "pull", a: E3(t, at), glow: youngLive ? pulse3(t, [40.5 + i * 0.2], 1) : 0 })), /* @__PURE__ */ React.createElement(Badge3, { x: 490, y: 260, text: "reachable only from old?", tone: "bad", a: win3(t, 12, 18.3), fs: 17 }), /* @__PURE__ */ React.createElement(
      Code3,
      {
        x: 920,
        y: 196,
        w: 904,
        h: 210,
        title: "sessions[id % N] = new byte[48];  \u2192 the JIT emits",
        lang: "plain",
        fs: 17,
        lh: 34,
        a: E3(t, 6),
        hl: t < 31.5 ? 0 : 2,
        hlA: E3(t, 6.5),
        lines: ["store [elem], obj         ; the reference store", "shr   card, elem, 9        ; address / 512 = card index", "mov   byte [ct + card], 0  ; mark the card dirty", "                            (Serial/Parallel, conceptually)"].map((s, i) => ({ s, o: i === 0 ? 1 : E3(t, 31.5 + i * 0.3) }))
      }
    ), /* @__PURE__ */ React.createElement(Panel3, { x: 96, y: 450, w: 1728, h: 170, title: t >= 25.5 ? "old generation \xB7 cut into 512-byte cards" : "old generation", tone: "violet", a: E3(t, 1) }), olds.map(([c, n, l, tone], i) => /* @__PURE__ */ React.createElement(Box3, { key: i, x: cardX(c) + 4, y: OY + 10, w: n * CW - 8, h: 64, label: l, fs: n > 4 ? 19 : 16, tone, a: E3(t, 1.4 + i * 0.1), glow: i === 2 ? win3(t, 6, 12) * 0.7 : 0 })), t >= 25.5 && Array.from({ length: NC + 1 }).map((_, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { position: "absolute", left: cardX(i), top: OY - 6, width: 0, height: 98, borderLeft: `1.5px dashed ${hexA3(PAL3.violet, 0.5)}`, opacity: E3(t, 25.5 + i * 0.03) } })), isDirty(11) || isDirty(14) || gcScan > 0 ? [11, 14].map((i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { position: "absolute", left: cardX(i), top: OY - 6, width: CW, height: 98, background: hexA3(PAL3.pull, isDirty(i) ? 0.16 + 0.25 * gcScan : 0), opacity: 1 } })) : null, bigScan >= 0 && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: OX, top: OY - 6, width: NC * CW * bigScan, height: 98, background: hexA3(PAL3.bad, 0.12), borderRight: `3px solid ${PAL3.bad}` } }), /* @__PURE__ */ React.createElement(Badge3, { x: 1460, y: 470, text: "scan the whole old gen every minor GC? far too slow", tone: "bad", a: win3(t, 19, 25.3), fs: 17 }), [[11, 0], [14, 2]].map(([c, yi]) => {
      const sx = cardX(c) + CW / 2;
      const [yx] = youngObjs[yi];
      return /* @__PURE__ */ React.createElement(Arrow3, { key: c, pts: [[sx, OY + 8], [sx, 428], [yx + 75, 428], [yx + 75, 360]], a: E3(t, 6.5 + yi * 1.2), color: youngLive ? PAL3.flow : PAL3.pull, width: 2.4 });
    }), /* @__PURE__ */ React.createElement(Txt3, { x: OX, y: 650, mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 25.5) }, "CARD TABLE \xB7 one byte per card \xB7 ff = clean, 00 = dirty"), Array.from({ length: NC }).map((_, i) => {
      const d = isDirty(i);
      return /* @__PURE__ */ React.createElement(Box3, { key: i, x: cardX(i) + 3, y: 678, w: CW - 6, h: 52, label: d ? "00" : "ff", fs: 19, tone: d ? "pull" : "dim", a: E3(t, 25.8 + i * 0.03), glow: d ? pulse3(t, [dirtyAt[i]], 1.2) + gcScan * 0.6 : 0 });
    }), /* @__PURE__ */ React.createElement(Txt3, { x: OX, y: 746, fs: 20, color: PAL3.flow, a: gcScan }, "minor GC: treat objects on dirty cards as extra roots \u2192 scanned ", /* @__PURE__ */ React.createElement("b", null, "2 of 24"), " cards"), /* @__PURE__ */ React.createElement(Txt3, { x: OX, y: 746, fs: 20, color: PAL3.ink2, a: E3(t, 46) * (1 - E3(t, 52.6, 0.4)) }, "after the GC the cards are cleaned (ff) until the next store"), /* @__PURE__ */ React.createElement(Console2, { x: 96, y: 790, w: 1728, h: 128, t, fs: 17, lh: 30, title: "G1 \xB7 JDK 17 \xB7 gc+phases=debug", a: E3(t, 53), items: [
      { at: 53.2, text: "java -Xmx256m -Xlog:gc+phases=debug Server 6000000 | grep -E 'GC\\(9\\).*Scan'", kind: "cmd" },
      { at: 54, text: "[0.308s][debug][gc,phases] GC(9)       Scanned Cards:                 Min: 44, Avg: 56.7, Max: 73, Diff: 29, Sum: 170, Workers: 3", kind: "ok" }
    ] }));
  }
  var LX = (s) => 360 + (s - 2) * 32;
  function Lane({ y, t, label, sub, a, segs, polls, pollA }) {
    const col = { run: PAL3.flow, park: PAL3.ink3, native: PAL3.violet, wait: PAL3.pull, gc: PAL3.flow, blocked: PAL3.bad, idle: PAL3.ink3 };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt3, { x: 96, y: y + 2, mono: true, fs: 18, weight: 600, color: PAL3.ink, a }, label), /* @__PURE__ */ React.createElement(Txt3, { x: 96, y: y + 26, mono: true, fs: 17, color: PAL3.ink3, a }, sub), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: LX(2), top: y + 22, width: LX(46) - LX(2), height: 2, background: PAL3.line, opacity: a } }), segs.map(([s0, s1, k, lbl], i) => {
      if (t < s0) return null;
      const e = Math.min(t, s1);
      const c = col[k];
      const hatched = k === "park" || k === "native" || k === "blocked" || k === "idle";
      return /* @__PURE__ */ React.createElement("div", { key: i, style: {
        position: "absolute",
        left: LX(s0),
        top: y + 4,
        width: Math.max(0, LX(e) - LX(s0)),
        height: 38,
        boxSizing: "border-box",
        borderRadius: 6,
        opacity: a,
        background: hatched ? `repeating-linear-gradient(45deg, ${hexA3(c, 0.12)} 0 6px, ${hexA3(c, 0.32)} 6px 9px)` : hexA3(c, k === "gc" ? 0.45 : 0.28),
        border: `1.5px solid ${hexA3(c, 0.9)}`,
        font: `500 17px ${MONO3}`,
        color: PAL3.ink,
        display: "flex",
        alignItems: "center",
        paddingLeft: 8,
        whiteSpace: "nowrap",
        overflow: "hidden"
      } }, lbl);
    }), (polls || []).map((p, i) => /* @__PURE__ */ React.createElement("div", { key: "p" + i, style: { position: "absolute", left: LX(p) - 1.5, top: y - 6, width: 3, height: 58, background: PAL3.pull, opacity: a * (t >= p - 6 ? 0.9 : 0.35) * (pollA == null ? 1 : pollA) } })));
  }
  function SSafepoints({ t }) {
    const REQ = 20.5, P1 = 21.4, P2 = 24.6, GC0 = 24.8, GC1 = 37.8;
    const now = Math.min(t, 46);
    const pollA = 0.5 + 0.5 * win3(t, 13, 19.5);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt3, { x: LX(2), y: 200, mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 0.5) }, "TIME \u2192"), /* @__PURE__ */ React.createElement(Txt3, { x: 1824, y: 196, anchor: "right", mono: true, fs: 17, color: PAL3.pull, a: E3(t, 0.8) }, "orange ticks = polls in compiled code"), /* @__PURE__ */ React.createElement(
      Lane,
      {
        y: 250,
        t,
        a: E3(t, 1),
        label: "http-1",
        sub: "running Java",
        polls: [5, 8.6, 12.2, 15.8, 19.2, 21.4, 29, 33, 41.5, 44.5],
        pollA,
        segs: [[2, P1, "run"], [P1, GC1, "park", "parked at poll"], [GC1, 46, "run"]]
      }
    ), /* @__PURE__ */ React.createElement(
      Lane,
      {
        y: 350,
        t,
        a: E3(t, 1.2),
        label: "http-2",
        sub: "running Java",
        polls: [6.2, 11.5, 16.8, 24.6, 30, 35, 42.6],
        pollA,
        segs: [[2, P2, "run"], [P2, GC1, "park", "parked"], [GC1, 46, "run"]]
      }
    ), /* @__PURE__ */ React.createElement(Lane, { y: 450, t, a: E3(t, 1.4), label: "http-3", sub: "in native: socket read", segs: [[2, 30, "native", "native code \xB7 already safe"], [30, GC1, "blocked", "waits to re-enter Java"], [GC1, 46, "run"]] }), /* @__PURE__ */ React.createElement(Lane, { y: 550, t, a: E3(t, 1.6), label: "VM thread", sub: "runs the GC", segs: [[2, REQ, "idle"], [REQ, GC0, "wait", "waiting\u2026"], [GC0, GC1, "gc", "at safepoint: GC work (mark, copy)"], [GC1, 46, "idle"]] }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: LX(now) - 1, top: 236, width: 2, height: 380, background: PAL3.ink, opacity: 0.55 * E3(t, 1) } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: LX(REQ) - 1, top: 236, width: 2, height: 380, background: PAL3.bad, opacity: E3(t, REQ) } }), /* @__PURE__ */ React.createElement(Badge3, { x: LX(REQ) + 8, y: 226, text: "safepoint requested: polls armed", tone: "bad", a: E3(t, REQ), fs: 17, anchor: "left" }), /* @__PURE__ */ React.createElement(Brace2, { x: LX(REQ), y: 630, w: LX(P2) - LX(REQ), label: "time to safepoint", tone: "pull", a: E3(t, 33), fs: 17 }), /* @__PURE__ */ React.createElement(Brace2, { x: LX(REQ), y: 690, w: LX(GC1) - LX(REQ), label: "pause the app sees = TTS + GC work", tone: "bad", a: E3(t, 40), fs: 17 }), /* @__PURE__ */ React.createElement(Callout3, { x: 96, y: 770, w: 1728, tone: "violet", a: win3(t, 6.5, 12.8), fs: 20, title: "oop maps", text: "For each poll site, the JIT records which stack slots and registers hold object references. That map is only valid **at** a safepoint." }), /* @__PURE__ */ React.createElement(Callout3, { x: 96, y: 770, w: 1728, tone: "pull", a: win3(t, 13, 19.3), fs: 20, title: "the poll", text: "A load of a per-thread polling word. Disarmed, it costs almost nothing. Armed, it traps the thread into the VM (thread-local handshakes, JDK 10+)." }), /* @__PURE__ */ React.createElement(Callout3, { x: 96, y: 770, w: 1728, tone: "violet", a: win3(t, 26.5, 32.8), fs: 20, title: "native code", text: "A thread in JNI code touches no raw Java pointers, so it counts as stopped. Only its return into Java is blocked." }));
  }
  var TX = (s) => 1010 + (s - 6) * 23;
  function SCountedLoop({ t }) {
    const REQ = 13.5, END = 26.5, GCE = 27.3;
    const lane = (y, label, segs, a) => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt3, { x: 1010, y: y - 26, mono: true, fs: 17, color: PAL3.ink2, a }, label), segs.map(([s0, s1, k, lbl], i) => {
      if (t < s0) return null;
      const c = { run: PAL3.flow, loop: PAL3.pull, park: PAL3.ink3, gc: PAL3.flow }[k];
      const hatched = k === "park";
      return /* @__PURE__ */ React.createElement("div", { key: i, style: {
        position: "absolute",
        left: TX(s0),
        top: y,
        width: Math.max(0, TX(Math.min(t, s1)) - TX(s0)),
        height: 30,
        boxSizing: "border-box",
        borderRadius: 5,
        opacity: a,
        overflow: "hidden",
        whiteSpace: "nowrap",
        background: hatched ? `repeating-linear-gradient(45deg, ${hexA3(c, 0.12)} 0 6px, ${hexA3(c, 0.34)} 6px 9px)` : hexA3(c, 0.3),
        border: `1.5px solid ${c}`,
        font: `500 17px ${MONO3}`,
        color: PAL3.ink,
        paddingLeft: 6,
        display: "flex",
        alignItems: "center"
      } }, lbl);
    }));
    const fixA = E3(t, 35);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      Code3,
      {
        x: 96,
        y: 196,
        w: 860,
        h: 300,
        title: "Tts.java",
        fs: 18,
        lh: 30,
        a: E3(t, 0.5) * (1 - fixA),
        hl: 2,
        hlA: win3(t, 1, 34),
        lines: ["static int spin(int n) {", "    int h = 1;", "    for (int i = 0; i < n; i++) h = h * 31 + i;   // counted", "    return h;", "}", "// worker: spin(Integer.MAX_VALUE)", "// main:   sleep 100 ms, then time System.gc()"]
      }
    ), /* @__PURE__ */ React.createElement(
      Code3,
      {
        x: 96,
        y: 196,
        w: 860,
        h: 300,
        title: "what C2 emits with loop strip mining",
        fs: 18,
        lh: 30,
        a: fixA,
        lines: ["for (int i = 0; i < n; ) {                // outer loop", "    int end = Math.min(i + 1000, n);", "    for (; i < end; i++) h = h * 31 + i;   // inner: no poll", "    safepoint_poll();                     // every 1,000", "}", "// -XX:+UseCountedLoopSafepoints", "// -XX:LoopStripMiningIter=1000"].map((s, i) => ({ s, tone: i === 3 ? "flow" : void 0 }))
      }
    ), /* @__PURE__ */ React.createElement(Panel3, { x: 990, y: 196, w: 834, h: 300, title: "threads", right: "time \u2192", a: E3(t, 6.5) }), lane(270, "worker \xB7 inside spin()", [[7.5, END, "loop", "counted loop \xB7 no poll inside"], [END, GCE, "park"], [GCE, 40, "run"]], E3(t, 7)), lane(346, "main \xB7 System.gc()", [[6, REQ, "run"], [REQ, GCE, "park", "waiting for the VM operation"], [GCE, 40, "run"]], E3(t, 7.2)), lane(422, "other threads", [[6, 14.2, "run"], [14.2, GCE, "park", "parked at a poll \xB7 waiting"], [GCE, 40, "run"]], E3(t, 7.4)), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: TX(REQ) - 1, top: 236, width: 2, height: 224, background: PAL3.bad, opacity: E3(t, REQ) } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: TX(END) - 1, top: 236, width: 2, height: 224, background: PAL3.flow, opacity: E3(t, END) } }), /* @__PURE__ */ React.createElement(Badge3, { x: TX(REQ) + 6, y: 476, text: "armed", tone: "bad", a: E3(t, REQ), fs: 17, anchor: "left" }), /* @__PURE__ */ React.createElement(Badge3, { x: TX(END) + 6, y: 476, text: "GC: ~5 ms", tone: "flow", a: E3(t, END), fs: 17, anchor: "left" }), /* @__PURE__ */ React.createElement(Console2, { x: 96, y: 516, w: 1728, h: 400, t, fs: 17, lh: 30, title: "terminal \xB7 JDK 17 \xB7 real output, abridged", a: E3(t, 19.5), items: [
      { at: 20, text: `java -XX:+UseParallelGC -Xlog:safepoint,gc Tts | grep -E 'System|Safepoint "Par|returned'`, kind: "cmd" },
      { at: 20.6, text: "[2.364s][info][gc] GC(0) Pause Young (System.gc()) 1M->0M(123M) 0.946ms", kind: "dim" },
      { at: 20.8, text: "[2.367s][info][gc] GC(1) Pause Full (System.gc()) 0M->0M(123M) 3.503ms", kind: "dim" },
      { at: 21.3, text: '[2.367s][info][safepoint] Safepoint "ParallelGCSystemGC", \u2026 Reaching safepoint: 2211175541 ns, \u2026 At safepoint: 4655167 ns, Total: 2215969208 ns', kind: "err" },
      { at: 22, text: "System.gc() returned after 2216 ms", kind: "err" },
      { at: 42, text: "java -XX:+UseG1GC -Xlog:safepoint Tts | grep -E 'G1CollectFull|returned'", kind: "cmd" },
      { at: 42.6, text: '[0.148s][info][safepoint] Safepoint "G1CollectFull", \u2026 Reaching safepoint: 37209 ns, \u2026 At safepoint: 1102292 ns, Total: 1141959 ns', kind: "ok" },
      { at: 43, text: "System.gc() returned after 1 ms", kind: "ok" },
      { at: 49, text: "java -XX:+UseParallelGC -Xlog:safepoint TtsLong | grep -E 'SystemGC|returned'     # for (long i = 0; \u2026)", kind: "cmd" },
      { at: 49.6, text: '[2.327s][info][safepoint] Safepoint "ParallelGCSystemGC", \u2026 Reaching safepoint: 2160828334 ns, \u2026 At safepoint: 3839250 ns, Total: 2164754750 ns', kind: "err" },
      { at: 50, text: "System.gc() returned after 2165 ms", kind: "err" }
    ] }), /* @__PURE__ */ React.createElement(Badge3, { x: 1500, y: 542, text: "reaching: 2.21 s \xB7 GC work: 4.7 ms", tone: "bad", a: win3(t, 28, 41.6), fs: 17, solid: true }));
  }

  // src/topics/8.5/scenes4.jsx
  var {
    PAL: PAL4,
    MOTION: MOTION4,
    lin: lin4,
    lerp: lerp4,
    win: win4,
    pulse: pulse4,
    step: step4,
    track: track4,
    track1: track13,
    clamp: clamp4,
    hexA: hexA4,
    MONO: MONO4,
    SANS: SANS4,
    Txt: Txt4,
    Panel: Panel4,
    Box: Box4,
    Code: Code4,
    Console: Console3,
    HArrow: HArrow4,
    VArrow: VArrow4,
    Arrow: Arrow4,
    Dot: Dot4,
    Card: Card4,
    Badge: Badge4,
    Callout: Callout4,
    Mark: Mark4,
    Brace: Brace3,
    toneColor: toneColor4
  } = window.AN;
  var E4 = MOTION4.enter;
  var M4 = MOTION4.move;
  var POP4 = MOTION4.pop;
  var REQ_BLOCKS = [[20, "sb", "ink"], [30, "", "ink"], [120, "body", "ink"], [16, "", "ink"], [36, "sess", "pull"]];
  function STLAB({ t }) {
    const SY2 = 262, SH2 = 100;
    const allocs = [];
    let x = 100;
    for (let r = 0; r < 3; r++) REQ_BLOCKS.forEach(([w, l, tone], k) => {
      allocs.push({ x, w, l, tone, at: (r === 0 ? 12.8 : r === 1 ? 20.5 : 23) + k * (r === 0 ? 1.2 : 0.35) });
      x += w + 2;
    });
    const fit = allocs.filter((a) => a.x + a.w <= 592);
    const overflow = allocs.find((a) => a.x + a.w > 592);
    const shown = fit.filter((a) => t >= a.at);
    const top = shown.length ? shown[shown.length - 1].x + shown[shown.length - 1].w + 2 : 100;
    const refill = t >= 27.5;
    const edenTop = track13(t, [[0, 1408], [27.6, 1408], [28.6, 1808]]);
    const newTop = refill ? 1412 + (t >= 29.2 ? 122 : 0) : null;
    const tl = (x0, w, label, tone, a) => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x0, top: SY2, width: w, height: SH2, boxSizing: "border-box", borderRadius: 8, border: `2px solid ${toneColor4(tone)}`, background: hexA4(toneColor4(tone), 0.05), opacity: a } }), /* @__PURE__ */ React.createElement(Txt4, { x: x0 + 8, y: SY2 + SH2 + 8, mono: true, fs: 17, color: toneColor4(tone), a }, label));
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: 196, mono: true, fs: 17, color: PAL4.ink3, a: E4(t, 0.5) }, t < 6 ? "EDEN \xB7 after a GC: one contiguous free block" : "EDEN \xB7 carved into per-thread TLABs"), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 96, top: SY2, width: 1728, height: SH2, boxSizing: "border-box", borderRadius: 8, border: `2px dashed ${PAL4.flow}`, background: hexA4(PAL4.flow, 0.04), opacity: E4(t, 0.8) * (1 - E4(t, 6)) } }), tl(96, 500, "TLAB \xB7 thread http-1", "flow", E4(t, 6)), tl(600, 400, "TLAB \xB7 http-2", "blue", E4(t, 6.5)), tl(1004, 400, "TLAB \xB7 http-3", "violet", E4(t, 7)), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 1408, top: SY2, width: 416, height: SH2, boxSizing: "border-box", borderRadius: 8, border: `2px dashed ${PAL4.line2}`, opacity: E4(t, 0.8) } }), /* @__PURE__ */ React.createElement(Txt4, { x: 1416, y: SY2 + SH2 + 8, mono: true, fs: 17, color: PAL4.ink3, a: E4(t, 0.8) * (1 - E4(t, 27.5)) }, "not handed out yet"), refill && tl(1408, 400, "new TLAB \xB7 http-1", "flow", E4(t, 28.6)), [[640, 520], [1044, 360]].map(([x0, w], i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { position: "absolute", left: x0, top: SY2 + 30, width: w * (0.5 + 0.4 * lin4(t, 8, 40)) * 0.6, height: 40, borderRadius: 6, background: hexA4(i ? PAL4.violet : PAL4.blue, 0.22), opacity: E4(t, 7.5) } })), shown.map((a, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { position: "absolute", left: a.x, top: SY2 + 28, width: a.w, height: 44, boxSizing: "border-box", borderRadius: 4, background: hexA4(toneColor4(a.tone), a.l === "body" ? 0.25 : 0.4), border: `1.5px solid ${toneColor4(a.tone)}`, font: `500 17px ${MONO4}`, color: PAL4.ink, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" } }, a.l === "body" ? "body" : "")), refill && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: top, top: SY2 + 28, width: 592 - top, height: 44, borderRadius: 4, background: `repeating-linear-gradient(45deg, transparent 0 6px, ${hexA4(PAL4.ink3, 0.4)} 6px 8px)`, opacity: E4(t, 27.6) } }), t >= 29.2 && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 1412, top: SY2 + 28, width: 120, height: 44, boxSizing: "border-box", borderRadius: 4, background: hexA4(PAL4.ink2, 0.25), border: `1.5px solid ${PAL4.ink2}`, font: `500 17px ${MONO4}`, color: PAL4.ink, display: "flex", alignItems: "center", justifyContent: "center" } }, "body"), !refill && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: top - 10, top: SY2 - 26, width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: `16px solid ${PAL4.pull}`, opacity: E4(t, 12) } }), /* @__PURE__ */ React.createElement(Txt4, { x: top + 14, y: SY2 - 34, mono: true, fs: 18, weight: 600, color: PAL4.pull, a: E4(t, 12) }, "top"), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 586, top: SY2 - 26, width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: `16px solid ${PAL4.bad}`, opacity: E4(t, 12) } }), /* @__PURE__ */ React.createElement(Txt4, { x: 520, y: SY2 - 34, anchor: "right", mono: true, fs: 18, weight: 600, color: PAL4.bad, a: E4(t, 12) * (top < 470 ? 1 : 0) }, "end")), refill && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: newTop - 10, top: SY2 - 26, width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: `16px solid ${PAL4.pull}` } }), /* @__PURE__ */ React.createElement(Txt4, { x: newTop + 14, y: SY2 - 34, mono: true, fs: 18, weight: 600, color: PAL4.pull }, "top")), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: edenTop - 2, top: SY2 - 8, width: 4, height: SH2 + 16, background: PAL4.ink, opacity: E4(t, 1) * 0.8 } }), /* @__PURE__ */ React.createElement(Txt4, { x: edenTop - 8, y: SY2 + SH2 + 40, anchor: "right", mono: true, fs: 17, color: PAL4.ink2, a: E4(t, 1) }, "eden top (shared, CAS)"), overflow && /* @__PURE__ */ React.createElement(Box4, { x: 640, y: 392, w: 300, h: 42, label: "next body \xB7 1,040 B: no room", fs: 17, tone: "bad", a: win4(t, 26, 28.4), dashed: true }), /* @__PURE__ */ React.createElement(
      Code4,
      {
        x: 96,
        y: 440,
        w: 900,
        h: 280,
        title: "fast path \xB7 new byte[1024] (1,040 bytes)",
        fs: 18,
        lh: 34,
        a: E4(t, 12.3),
        hl: step4(t, [[12.5, 1], [14.5, 2], [16.5, 3], [18.5, 4], [20, 5], [26, 3]], -1),
        hlA: E4(t, 12.5),
        lines: ["// all of this is inlined into the compiled method", "obj  = tlab.top;", "next = obj + 1040;", "if (next > tlab.end) goto slow_path;    // rare", "tlab.top = next;                        // the bump", "write mark word + klass + length;  zero the body"]
      }
    ), /* @__PURE__ */ React.createElement(Panel4, { x: 1030, y: 440, w: 794, h: 280, title: "slow path \xB7 TLAB exhausted", tone: "pull", a: win4(t, 26, 39.6) }, /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 24px", font: `400 21px ${SANS4}`, color: PAL4.ink, lineHeight: 1.55 } }, ["1. retire the old TLAB: fill its tail with a dummy object", "2. claim a new TLAB: one CAS on eden's shared top", "3. eden can't supply one? \u2192 minor GC", "4. back to the bump in the new TLAB"].map((s, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { opacity: E4(t, 26.5 + i * 0.9) } }, s)))), /* @__PURE__ */ React.createElement(Callout4, { x: 1030, y: 440, w: 794, tone: "flow", a: E4(t, 40), fs: 21, title: "per eden fill", text: "Around 200,000 objects (\u224845,000 requests). Only **51** of them took the slow path." }), /* @__PURE__ */ React.createElement(Callout4, { x: 1030, y: 598, w: 794, tone: "pull", a: E4(t, 45.5), fs: 21, title: "vs malloc", text: "Search free lists, split blocks, coordinate threads. 'Don't allocate in a loop' is dated advice." }), /* @__PURE__ */ React.createElement(Console3, { x: 96, y: 746, w: 1728, h: 158, t, fs: 17, lh: 30, title: "terminal \xB7 JDK 17 \xB7 Serial GC \xB7 abridged", a: E4(t, 33), items: [
      { at: 33.2, text: "java -XX:+UseSerialGC -Xmx256m -Xmn64m -Xlog:gc+tlab=debug,gc Server 1000000", kind: "cmd" },
      { at: 34, text: "[0.127s][debug][gc,tlab] GC(1) TLAB totals: thrds: 1  refills: 51 max: 51 slow allocs: 0 max 0 waste:  0.1% \u2026", kind: "ok" },
      { at: 34.6, text: "(trace level shows each refill: desired_size: 1049KB)", kind: "dim" }
    ] }));
  }
  function STradeOff({ t }) {
    const V = { T: [400, 250], L: [150, 660], F: [650, 660] };
    const dot = track4(t, [[0, 400, 520], [12, 400, 520], [13, 470, 400], [20, 470, 400], [21, 240, 560], [40, 240, 560], [41, 570, 600]]);
    const TX0 = 800, TW = 990;
    const tx = (f) => TX0 + f * TW;
    const bar = (y, h, segs, a) => segs.map(([f0, f1, k, lbl], i) => {
      const c = { app: PAL4.flow, stw: PAL4.bad, gc: PAL4.violet }[k];
      return /* @__PURE__ */ React.createElement("div", { key: i, style: { position: "absolute", left: tx(f0), top: y, width: (f1 - f0) * TW * M4(t, 0, 0.01), height: h, boxSizing: "border-box", borderRadius: 4, background: hexA4(c, k === "app" ? 0.25 : 0.45), border: `1.5px solid ${c}`, opacity: a, font: `500 17px ${MONO4}`, color: PAL4.ink, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", whiteSpace: "nowrap" } }, lbl);
    });
    const gauge = lin4(t, 34, 5);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("svg", { width: "1920", height: "1080", style: { position: "absolute", left: 0, top: 0, opacity: E4(t, 0.5) } }, /* @__PURE__ */ React.createElement("polygon", { points: `${V.T.join(",")} ${V.L.join(",")} ${V.F.join(",")}`, fill: hexA4(PAL4.ink3, 0.06), stroke: PAL4.line2, strokeWidth: "2" })), /* @__PURE__ */ React.createElement(Txt4, { x: V.T[0], y: V.T[1] - 52, anchor: "mid", mono: true, fs: 22, weight: 600, color: PAL4.flow, a: E4(t, 5) }, "THROUGHPUT"), /* @__PURE__ */ React.createElement(Txt4, { x: V.T[0], y: V.T[1] - 26, anchor: "mid", fs: 17, color: PAL4.ink2, a: E4(t, 5.5) }, "time spent in your code"), /* @__PURE__ */ React.createElement(Txt4, { x: V.L[0], y: V.L[1] + 14, anchor: "mid", mono: true, fs: 22, weight: 600, color: PAL4.pull, a: E4(t, 6) }, "LATENCY"), /* @__PURE__ */ React.createElement(Txt4, { x: V.L[0], y: V.L[1] + 42, anchor: "mid", fs: 17, color: PAL4.ink2, a: E4(t, 6.5) }, "short pauses"), /* @__PURE__ */ React.createElement(Txt4, { x: V.F[0], y: V.F[1] + 14, anchor: "mid", mono: true, fs: 22, weight: 600, color: PAL4.violet, a: E4(t, 7) }, "FOOTPRINT"), /* @__PURE__ */ React.createElement(Txt4, { x: V.F[0], y: V.F[1] + 42, anchor: "mid", fs: 17, color: PAL4.ink2, a: E4(t, 7.5) }, "small heap"), /* @__PURE__ */ React.createElement(Dot4, { x: dot[0], y: dot[1], r: 14, color: PAL4.pull, a: E4(t, 10) }), /* @__PURE__ */ React.createElement(Txt4, { x: dot[0] + 22, y: dot[1] - 12, mono: true, fs: 17, color: PAL4.pull, a: E4(t, 12) * (t < 40 ? 1 : 0) }, t < 20 ? "stop-the-world" : "concurrent"), /* @__PURE__ */ React.createElement(Txt4, { x: dot[0] - 22, y: dot[1] - 40, anchor: "right", mono: true, fs: 17, color: PAL4.pull, a: E4(t, 41) }, "small heap"), /* @__PURE__ */ React.createElement(Callout4, { x: 96, y: 760, w: 640, tone: "pull", a: E4(t, 44), fs: 20, text: "Move toward one corner and you move away from another. 8.6 places each collector here." }), /* @__PURE__ */ React.createElement(Panel4, { x: 770, y: 196, w: 1054, h: 706, title: "what the app experiences", right: "time \u2192", a: E4(t, 11.5) }), /* @__PURE__ */ React.createElement(Txt4, { x: 800, y: 256, mono: true, fs: 18, weight: 600, color: PAL4.ink, a: E4(t, 12) }, "stop-the-world"), bar(290, 44, [[0, 0.3, "app"], [0.3, 0.42, "stw", "pause"], [0.42, 0.78, "app"], [0.78, 0.9, "stw", "pause"], [0.9, 1, "app"]], E4(t, 12.5)), /* @__PURE__ */ React.createElement(Txt4, { x: 800, y: 346, fs: 18, color: PAL4.ink2, a: E4(t, 14) }, "all cores collect at once: least total work, but pauses grow with the live data"), /* @__PURE__ */ React.createElement(Txt4, { x: 800, y: 410, mono: true, fs: 18, weight: 600, color: PAL4.ink, a: E4(t, 20) }, "concurrent"), bar(444, 44, [[0, 0.2, "app"], [0.2, 0.21, "stw"], [0.21, 0.6, "app"], [0.6, 0.61, "stw"], [0.61, 1, "app"]], E4(t, 20.5)), bar(496, 34, [[0.2, 0.6, "gc", "GC threads, concurrently"]], E4(t, 21.5)), /* @__PURE__ */ React.createElement(Txt4, { x: 800, y: 544, fs: 18, color: PAL4.ink2, a: E4(t, 27) }, "pauses of a few ms \xB7 costs CPU, plus barriers on every reference access"), /* @__PURE__ */ React.createElement(Txt4, { x: 800, y: 604, mono: true, fs: 18, weight: 600, color: PAL4.ink, a: E4(t, 33.5) }, "headroom \xB7 heap during a concurrent cycle"), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: tx(0), top: 640, width: TW, height: 44, borderRadius: 6, border: `2px solid ${PAL4.line2}`, boxSizing: "border-box", opacity: E4(t, 33.5) } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: tx(0) + 2, top: 642, width: (0.45 + 0.35 * gauge) * (TW - 4), height: 40, borderRadius: 5, background: `linear-gradient(90deg, ${hexA4(PAL4.flow, 0.35)} 0 ${0.45 / (0.45 + 0.35 * gauge + 1e-6) * 100}%, ${hexA4(PAL4.pull, 0.4)} 0)`, opacity: E4(t, 33.5) } }), /* @__PURE__ */ React.createElement(Txt4, { x: tx(0.47), y: 694, fs: 18, color: PAL4.pull, a: E4(t, 35) }, "allocated while the GC was still working \u2192"), /* @__PURE__ */ React.createElement(Txt4, { x: 800, y: 754, mono: true, fs: 18, weight: 600, color: PAL4.ink, a: E4(t, 40) }, "small heap"), bar(788, 44, Array.from({ length: 9 }).flatMap((_, i) => [[i / 9, i / 9 + 0.085, "app"], [i / 9 + 0.085, (i + 1) / 9, "stw"]]), E4(t, 40.5)), /* @__PURE__ */ React.createElement(Txt4, { x: 800, y: 844, fs: 18, color: PAL4.ink2, a: E4(t, 41.5) }, "less memory, so collections come far more often"));
  }
  function SLeak({ t }) {
    const grow = lin4(t, 9, 19);
    const n = Math.floor(grow * 70);
    const after = step4(t, [[20.5, 7], [21.5, 16], [22.5, 24], [23.5, 24], [24.5, 30], [28, 30]], 0);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      Code4,
      {
        x: 96,
        y: 196,
        w: 860,
        h: 238,
        title: "Leak.java \xB7 the server's cache, with one bug",
        fs: 17,
        lh: 34,
        a: E4(t, 0.5),
        hl: 3,
        hlA: E4(t, 7),
        lines: ["static final Map<Integer, byte[]> CACHE = new HashMap<>();  // a GC root", "", "static void handle(int id) {", "    CACHE.computeIfAbsent(id, k -> new byte[2048]);  // bug: not id % 500", "}"]
      }
    ), /* @__PURE__ */ React.createElement(Panel4, { x: 96, y: 460, w: 860, h: 330, title: "heap \xB7 everything reachable from CACHE", tone: "bad", a: E4(t, 7.5) }), /* @__PURE__ */ React.createElement(Box4, { x: 126, y: 530, w: 200, h: 60, label: "CACHE", sub: "GC root", fs: 20, sfs: 17, tone: "violet", a: E4(t, 8), glow: pulse4(t, [14.2], 1.4) }), /* @__PURE__ */ React.createElement(HArrow4, { x1: 330, x2: 376, y: 560, a: E4(t, 8.4), color: PAL4.violet }), /* @__PURE__ */ React.createElement(Box4, { x: 380, y: 530, w: 180, h: 60, label: "HashMap", fs: 20, tone: "ink", a: E4(t, 8.4) }), Array.from({ length: n }).map((_, i) => {
      const c = i % 10, r = Math.floor(i / 10);
      const hl = i === 47 && t >= 35;
      return /* @__PURE__ */ React.createElement("div", { key: i, style: { position: "absolute", left: 590 + c * 34, top: 520 + r * 34, width: 28, height: 28, borderRadius: 5, boxSizing: "border-box", background: hexA4(hl ? PAL4.pull : PAL4.bad, 0.3), border: `2px solid ${hl ? PAL4.pull : PAL4.bad}`, boxShadow: hl ? `0 0 16px ${PAL4.pull}` : "none" } });
    }), /* @__PURE__ */ React.createElement(Txt4, { x: 126, y: 620, fs: 19, color: PAL4.ink2, w: 430, a: E4(t, 14) }, "One new 2 KB entry per request. Every one is reachable from a root, so every one is **live**."), /* @__PURE__ */ React.createElement(Arrow4, { pts: [[590 + 7 * 34 + 14, 520 + 4 * 34 + 30], [590 + 7 * 34 + 14, 770], [110, 770], [110, 560], [122, 560]], draw: M4(t, 35.4, 1), color: PAL4.pull, width: 3 }), /* @__PURE__ */ React.createElement(Txt4, { x: 300, y: 738, mono: true, fs: 17, color: PAL4.pull, a: E4(t, 36.2) }, "path to GC root"), /* @__PURE__ */ React.createElement(Console3, { x: 990, y: 196, w: 834, h: 420, t, fs: 17, lh: 30, title: "terminal \xB7 JDK 17 \xB7 abridged", a: E4(t, 19.5), items: [
      { at: 20, text: "java -XX:+UseSerialGC -Xmx32m -Xlog:gc Leak", kind: "cmd" },
      { at: 20.5, text: "GC(0) Pause Young (Allocation Failure) 8M->7M(30M)" },
      { at: 21.5, text: "GC(1) Pause Young (Allocation Failure) 16M->16M(30M)" },
      { at: 22.5, text: "GC(2) Pause Young (Allocation Failure) 24M->24M(30M)" },
      { at: 23.5, text: "GC(3) Pause Full (Allocation Failure) 24M->24M(30M)", kind: "err" },
      { at: 24.5, text: "GC(4) Pause Full (Allocation Failure) 30M->30M(30M)", kind: "err" },
      { at: 25.5, text: "\u2026  12 more full GCs, 30M->30M each", kind: "dim" },
      { at: 27, text: "15000 requests, cache size 15001", kind: "dim" },
      { at: 28, text: 'Exception in thread "main"', kind: "err" },
      { at: 28.3, text: "    java.lang.OutOfMemoryError: Java heap space", kind: "err" }
    ] }), /* @__PURE__ */ React.createElement(Panel4, { x: 990, y: 640, w: 834, h: 150, title: "heap in use after each GC", right: after ? `${after} MB of 30` : "", tone: "bad", a: E4(t, 20) }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 1014, top: 706, width: 786, height: 50, borderRadius: 8, border: `2px solid ${PAL4.line2}`, boxSizing: "border-box", opacity: E4(t, 20) } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 1016, top: 708, width: 782 * (after / 30) * M4(t, 20.4, 0.01), height: 46, borderRadius: 6, background: hexA4(PAL4.bad, 0.4), transition: "none" } }), /* @__PURE__ */ React.createElement(Callout4, { x: 96, y: 812, w: 1100, tone: "pull", a: E4(t, 35), fs: 20, title: "hunting it", text: "Not 'who forgot to free?' but 'which path from a root keeps this alive?' Take a heap dump (8.9)." }), /* @__PURE__ */ React.createElement(Card4, { x: 1230, y: 812, w: 594, h: 96, a: E4(t, 42), tone: "flow", title: "Garbage = unreachable. Not 'unused'.", tfs: 24 }));
  }
  var TRAPS = [
    [3.5, "\u201CJava counts references\u201D", "It traces **reachability** from GC roots. Cycles are collected."],
    [10, "\u201CFrequent full GCs? Give old gen more room\u201D", "Often **premature promotion**: grow the **young** gen."],
    [16.5, "\u201CAllocation is expensive\u201D", "A **pointer bump** in a TLAB; dead objects cost nothing to collect."],
    [23, "\u201CA long pause is the collector's work\u201D", "Check **time to safepoint**: one counted loop can stall every thread."],
    [29.5, "\u201CLow pauses, high throughput, small heap\u201D", "Pick a point on the trade-off. Each gain is paid for elsewhere."]
  ];
  function STraps({ t }) {
    return TRAPS.map(([at, myth, real], i) => {
      const y = 196 + i * 142;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, /* @__PURE__ */ React.createElement(Box4, { x: 96, y, w: 760, h: 122, label: myth, mono: false, fs: 23, tone: "bad", a: E4(t, at), strike: t > at + 2, style: { whiteSpace: "normal" } }), /* @__PURE__ */ React.createElement(HArrow4, { x1: 870, x2: 940, y: y + 61, a: E4(t, at + 1.5), color: PAL4.flow }), /* @__PURE__ */ React.createElement(Card4, { x: 956, y, w: 868, h: 122, a: E4(t, at + 1.6), tone: "flow", title: real, tfs: 24 }));
    });
  }
  var RECAP = [
    [3, "1", "Reachability", "Live = reachable from GC roots: stacks, statics, JNI, threads. Cycles are collected."],
    [8, "2", "Die young", "Most objects die young. A minor GC pays for survivors only; garbage is free."],
    [13, "3", "Three families", "Mark-sweep fragments, mark-compact moves everything, copying needs space."],
    [18.5, "4", "Ages + promotion", "Age in 4 mark-word bits. Too-small young gen \u2192 premature promotion."],
    [24, "5", "Barriers + safepoints", "Card table finds old\u2192young refs. Pause = time to safepoint + GC work."],
    [29.5, "6", "Bump + leaks", "Allocation is a TLAB pointer bump. A leak is unintentional reachability."]
  ];
  function SRecap({ t }) {
    return RECAP.map(([at, n, title, sub], i) => /* @__PURE__ */ React.createElement(Card4, { key: n, x: 96 + i % 3 * 584, y: 210 + Math.floor(i / 3) * 330, w: 560, h: 300, num: n, title, sub, tfs: 36, sfs: 26, a: E4(t, at), tone: i === 5 ? "pull" : void 0, glow: i === 5 ? win4(t, 30, 40) : 0 }));
  }

  // src/topics/8.5.jsx
  var chapters = ["Intro", "Reachability", "Most objects die young", "The algorithms", "Generations", "Card table", "Safepoints", "Allocation", "The trade-off", "Leaks", "Traps", "Recap"];
  var scenes = [
    { name: "Intro", dur: 24, ch: 0, title: "", C: SIntro },
    { name: "Roots", dur: 50, ch: 1, title: "Garbage is what nothing can reach", C: SRoots },
    { name: "Marking", dur: 56, ch: 1, title: "Marking: a flood from the roots", C: SMarking },
    { name: "Cycle", dur: 44, ch: 1, title: "Cycles: why counting references fails", C: SCycle },
    { name: "Lifetimes", dur: 46, ch: 2, title: "Most objects die young", C: SLifetimes },
    { name: "SurvivorCost", dur: 40, ch: 2, title: "Dead objects cost nothing to collect", C: SSurvivorCost },
    { name: "MarkSweep", dur: 44, ch: 3, title: "Mark-sweep: free in place", C: SMarkSweep },
    { name: "MarkCompact", dur: 48, ch: 3, title: "Mark-compact: slide the survivors together", C: SMarkCompact },
    { name: "Copying", dur: 56, ch: 3, title: "Copying: evacuate to a fresh space", C: SCopying },
    { name: "Families", dur: 36, ch: 3, title: "Three families, and where each one fits", C: SFamilies },
    { name: "MinorGC", dur: 64, ch: 4, title: "Generations in motion", C: SMinorGC },
    { name: "AgeLog", dur: 44, ch: 4, title: "Watch the ages tick in a real log", C: SAgeLog },
    { name: "Premature", dur: 56, ch: 4, title: "Premature promotion", C: SPremature },
    { name: "CardTable", dur: 60, ch: 5, title: "Card table: finding old\u2192young pointers", C: SCardTable },
    { name: "Safepoints", dur: 50, ch: 6, title: "Safepoints: stopping every thread", C: SSafepoints },
    { name: "CountedLoop", dur: 56, ch: 6, title: "One counted loop can stall the whole JVM", C: SCountedLoop },
    { name: "TLAB", dur: 50, ch: 7, title: "Allocation is a pointer bump", C: STLAB },
    { name: "TradeOff", dur: 48, ch: 8, title: "Throughput, latency, footprint", C: STradeOff },
    { name: "Leak", dur: 48, ch: 9, title: "A leak is unintentional reachability", C: SLeak },
    { name: "Traps", dur: 38, ch: 10, title: "Traps", C: STraps },
    { name: "Recap", dur: 38, ch: 11, title: "Recap", C: SRecap }
  ];
  var captions = {
    Intro: [[0.8, "Java never asks you to free memory. So something has to decide what is garbage."], [6, "This topic is the theory under every collector: reachability, generations, and the core algorithms."], [12, "Plus the machinery that makes it fast: card tables, safepoints, TLABs. The flags come in 8.6."], [18, "One tiny web server carries us through: `handle()` allocates a little per request and keeps a cache."]],
    Roots: [[0.5, "Java doesn't count references. It asks one question: can this object still be reached?"], [6.5, "Reached from where? From the **GC roots**: references the JVM knows are live without looking in the heap."], [13, "Every thread's stack: here the frame of `handle(42)` holds `sb` and `body` in local slots."], [20, "Static fields of loaded classes: `CACHE` and `sessions` live as long as `Server` stays loaded."], [26.5, "Also roots: JNI handles from native code, live `Thread` objects, classes and their loaders, JVM internals."], [33, "From the roots, follow every reference. Whatever you reach is live."], [39.5, "The objects left over from earlier requests are still in memory. Nothing points to them."], [45, "No code can ever reach them again, so reclaiming them is always safe."]],
    Marking: [[0.5, "Marking walks the object graph. A tidy way to picture it: three colours."], [5, "**White**: not seen yet. **Grey**: found, fields not scanned yet. **Black**: found and fully scanned."], [12, "Start: every object a root points to turns grey and goes on the mark stack."], [18, "Pop one and scan its reference fields. Each white child turns grey; the popped object turns black."], [26, "Repeat until the stack is empty. Watch the wave run through the cache."], [36, "Each mark is one bit, kept in a side table called the mark bitmap, or in the object header."], [42, "Stack empty. Anything still white was never reached: that's the garbage."], [49, "Notice the cost: marking touches only **live** objects. The dead ones are never visited."]],
    Cycle: [[0.5, "Why not simply count references? Plenty of runtimes do: CPython, Swift, C++ `shared_ptr`."], [5.5, "Each object keeps a count of incoming references. When it hits zero, it is freed at once."], [12, "Two objects, `D` and `E`, point at each other. A local variable points at `D`."], [18, "The method returns. `D`'s count drops from 2 to 1. Not zero, so nothing is freed."], [24.5, "Neither can ever be used again, yet each keeps the other's count at 1. That's a leak."], [31, "Tracing never looks at counts. It starts from the roots, and the cycle is simply never reached."], [37.5, "Real output: the `WeakReference` watching `D` sees it collected. Java has no cycle problem."]],
    Lifetimes: [[0.5, "Look at what `handle()` allocates, sorted by how long each object lives."], [5.5, "The builder, its byte array, the 1 KB body, a boxed key: about 1,124 bytes, dead the moment `handle` returns."], [13, "The session: 64 bytes that live for 20,000 more requests, until their slot is reused."], [19, "The cache: 500 entries, created once, alive forever."], [25, "By bytes allocated: 94.6% die inside one request. 5.4% die a bit later. A sliver lives forever."], [32, "This is the **weak generational hypothesis**: most objects die young. It holds for almost every program."], [39, "And a second observation: old objects rarely point to young ones. Every HotSpot collector leans on both."]],
    SurvivorCost: [[0.5, "Here's the property that makes young collections cheap."], [4.5, "A minor GC finds the live objects from the roots and copies them out. What stays behind is free space."], [11, "It never visits a dead object, so it doesn't matter how many there are."], [16.5, "Measure it. Same server, same eden, about 100 MB of churn per GC. Only the number of live sessions changes."], [24, "No survivors: 0.08 ms. 1.25 MB surviving: about 1 ms. 5 MB surviving: about 4.9 ms."], [31, "Pause time follows the survivors, not the garbage. If 98% of eden is dead, you pay for the 2%."]],
    MarkSweep: [[0.5, "Now the algorithms, all on the same small heap: ten objects, five of them live."], [6, "**Mark-sweep**, step one: mark from the roots. Five objects get their mark bit."], [12, "Step two: sweep. Walk the heap end to end. Every unmarked object becomes free space."], [19, "Free blocks are chained into a **free list**. Nothing moved, so no reference needs fixing."], [26, "But look at the holes: six slots free, in pieces of 1, 1, 3 and 1."], [32, "Now allocate an object that needs four slots. No hole is big enough: **fragmentation**."], [38.5, "Cost: marking follows live objects, sweeping follows the whole heap, and allocation has to search."]],
    MarkCompact: [[0.5, "**Mark-compact** starts the same way: mark the five live objects."], [5.5, "Pass one: walk the heap and work out where each live object will go. That is its forwarding address."], [13, "`A` stays at 0. `C` will move to 2, `E` to 4, `H` to 6, `J` to 8."], [19.5, "Pass two: rewrite every reference, in roots and in objects, to point at the new addresses."], [27, "Pass three: slide each object down to its new home, in address order."], [34, "Result: no holes. All free space is one block, so allocation is just a pointer bump."], [40.5, "Cost: several passes over the heap, and every survivor may move. That's why it's the slow one."]],
    Copying: [[0.5, "**Copying** uses two spaces. Live objects are evacuated from one to the other."], [5, "First the roots: copy `A` and `E` into to-space, and leave a **forwarding pointer** in each old copy."], [12, "Two pointers do the rest. `free` is where the next copy goes. `scan` walks the objects already copied."], [18.5, "Scan `A`: its field points to `C`, still in from-space. Copy `C`, then fix `A`'s field."], [25, "Scan `E`: copy `J`. Scan `C`: copy `H`. To-space fills in breadth-first order."], [32, "Scan `H`: its field points back to `C`, already forwarded. Follow the forwarding pointer. No second copy."], [39, "`scan` catches up with `free`: done. No mark stack needed; the to-space itself is the queue."], [45.5, "From-space is now all garbage, freed in one step. Cost follows live objects, but you need twice the space."]],
    Families: [[0.5, "Side by side."], [3.5, "Mark-sweep: nothing moves, but the heap fragments and allocation searches a free list."], [9.5, "Mark-compact: no fragmentation, but several passes, and every survivor may move."], [15.5, "Copying: work only for survivors and compaction for free, but spare space must sit empty."], [22, "So collectors mix them by generation. Young objects mostly die: copying is perfect there."], [28.5, "Old objects mostly survive. Copying them all would be expensive, so the old gen marks and compacts."]],
    MinorGC: [[0.5, "Now put it together. HotSpot splits the heap: eden and two survivor spaces make the young generation."], [6.5, "Every request allocates in eden: a cache entry now and then, sessions, and lots of short-lived garbage."], [12.5, "Eden is full: an allocation fails. A **minor GC** starts."], [16.5, "Live objects in eden are copied to survivor space S0 with age 1. Then all of eden is free, at once."], [23, "Eden fills again. At the next minor GC, live objects from eden **and** S0 are copied into S1."], [29.5, "The cache entries from S0 tick to age 2. The old sessions died meanwhile, so they simply aren't copied."], [36, "The survivor spaces swap roles every GC. One is always empty: it is the next to-space."], [42, "The age lives in the object's header: 4 bits of the mark word. So it can only count to 15."], [49, "Once an age reaches the tenuring threshold, the next GC **promotes** the object into the old generation."], [56.5, "Here the threshold is 2 to keep it short. HotSpot's maximum is 15, and it adapts the value at runtime."]],
    AgeLog: [[0.5, "Our server on JDK 17 with `-Xlog:gc+age=trace`. Serial GC, so the heap matches the picture."], [6.5, "Every minor GC prints an age table: how many surviving bytes sit at each age."], [12, "Age 1 holds 1,280,072 bytes, every time: 20,000 sessions of 64 bytes. They never reach age 2."], [19.5, "Another 1,679,824 bytes move up one age per GC: the cache, the sessions array, and startup objects."], [27, "At GC 14 they're age 15. At GC 15 they vanish from the table, and the old generation grows by 1,640 KB."], [34.5, "Promoted after 15 survivals. The age has 4 bits: the flag accepts 0 to 16, where 16 means never by age."]],
    Premature: [[0.5, "What if the young generation is too small? Same server, same 48 MB heap, young gen cut to 4 MB."], [6.5, "Each survivor space is now 384 KB. But 1,250 KB of sessions are alive at any moment."], [12.5, "They can't fit. The JVM lowers the tenuring threshold, and the overflow is promoted straight into old."], [19.5, "A moment later those sessions die, but now they're dead in the old gen, which minor GCs never clean."], [26, "So the old gen grows about 175 KB with every minor GC. These are real JDK 17 log lines."], [32.5, "Until it is full: a **full GC**. 45,035 KB of old gen drops to 3,664 KB. 92% was short-lived garbage."], [40, "Over 3 million requests: 4 full GCs with a 4 MB young gen. With 32 MB: none at all."], [47, "The fix is a **bigger young generation**, not a bigger old one. That's why theory comes before flags."]],
    CardTable: [[0.5, "A minor GC scans only the young generation. But some of its roots hide in the old one."], [6, "By now `sessions` has been promoted. Every request stores a brand-new young `byte[48]` into it."], [12, "Those young objects are reachable only through an old one. Miss that pointer and a live session is freed."], [18.5, "Scanning the whole old gen at every minor GC would defeat the point of generations."], [25.5, "So HotSpot cuts the old gen into 512-byte **cards**, and keeps a **card table**: one byte per card."], [31.5, "Every reference store runs a tiny **write barrier**: shift the address right by 9, mark that card dirty."], [39, "At the minor GC, objects on dirty cards are extra roots. Only those few cards get scanned."], [46, "Then the cards are cleaned. Old-to-young pointers are rare, the second observation, so this stays cheap."], [53, "G1 adds per-region remembered sets on top. Its log shows the scale: 170 cards scanned in one pause."]],
    Safepoints: [[0.5, "To trace the graph safely, every Java thread must be stopped at a known point: a **safepoint**."], [6.5, "At a safepoint the JVM knows which slots and registers hold references: the JIT's **oop maps** say so."], [13, "So compiled code polls at chosen spots: loop back-edges and method returns. Each poll is a single load."], [19.5, "The VM thread arms the polls. Each thread runs on to its next poll and parks there."], [26.5, "A thread in native code is already safe: it holds no raw heap pointers. Returning to Java, it waits."], [33, "The wait from request to last thread parked is **time to safepoint**. Only then can the GC work."], [40, "Work done, polls disarmed, threads resume. The pause your app sees is time to safepoint plus the GC work."]],
    CountedLoop: [[0.5, "A poll costs time in a tight loop, so C2 drops polls from **counted loops**: an `int` index, a fixed bound."], [7, "A worker runs `spin(Integer.MAX_VALUE)`: two billion iterations, about two seconds, no poll inside."], [13.5, "`main` calls `System.gc()`. The VM thread arms the polls, and every other thread parks."], [20, "Everyone waits for the worker. Real JDK 17 log, Parallel GC: reaching the safepoint took 2.2 seconds."], [28, "The GC work took under 5 ms; the app felt a 2,216 ms pause. The GC lines alone would never explain it."], [35, "The fix since JDK 10: **loop strip mining**. C2 splits the loop into chunks of 1,000 with a poll between."], [42, "It's on by default with G1, ZGC and Shenandoah. Same program on G1: reaching the safepoint took 37 \xB5s."], [49, "Old advice: 'use a `long` counter'. Since JDK 16, C2 counts long loops too. Measured: still 2.16 s."]],
    TLAB: [[0.5, "Copying and compaction leave the free space in one block. So allocation can be a pointer bump."], [6, "Each thread gets its own chunk of eden: a **TLAB**, thread-local allocation buffer. No locks, no sharing."], [12.5, "`new byte[1024]`: take `top` as the address, add 1,040 bytes, compare with `end`, store it back."], [20, "Then write the header and zero the body. A handful of instructions, inlined by the JIT."], [26, "When the TLAB is full, the slow path: retire it, and claim a fresh one from eden with one atomic update."], [33, "Real numbers for our server: TLABs of about 1 MB, 51 refills per eden fill, 0.1% waste."], [40, "Around 200,000 objects per eden fill, and only 51 trips off the fast path."], [45.5, "Compare `malloc`: free-list searches, splitting, locking. 'Don't allocate in a loop' is dated advice."]],
    TradeOff: [[0.5, "Every collector balances three things you can't max out together."], [5, "**Throughput**: share of time in your code. **Latency**: how long each pause is. **Footprint**: how much memory."], [12, "Stop-the-world: freeze the app, collect on every core. Least total work, but pauses grow with live data."], [20, "Concurrent: do most of the work while the app keeps running. Pauses shrink to milliseconds."], [27, "The price: GC threads take CPU from the app, and barriers add a little to reference reads and writes."], [33.5, "And headroom: the app keeps allocating while the collector works, so it needs spare heap."], [40, "A smaller heap means more frequent collections. Gain in one corner, pay in another. 8.6 maps collectors."]],
    Leak: [[0.5, "You can't leak in Java by forgetting to free. You leak by **keeping a reference** you didn't mean to keep."], [7, "One small bug in our cache: the key is the request id, not `id % 500`. Every request adds an entry."], [14, "Every entry is reachable from a static field, a GC root. So every entry is live, by definition."], [20.5, "Watch the log: almost nothing is freed. 8 MB down to 7. Then 16 to 16, 24 to 24, and full GCs: 30 to 30."], [28, "Then `OutOfMemoryError`. The collector did its job: the program asked it to keep everything."], [35, "So a leak hunt isn't about missing frees. Take a heap dump and ask: which path from a root keeps this alive?"], [42, "Garbage in Java means unreachable. Not 'unused'. Only you know what's unused."]],
    Traps: [[0.5, "Five traps worth avoiding."], [3.5, "Java doesn't count references. It traces reachability, so cycles are no problem."], [10, "Frequent full GCs often mean premature promotion. The fix is a bigger young gen."], [16.5, "Allocation is a pointer bump, and dead objects are free to collect."], [23, "A long pause may be time to safepoint, not GC work. Check `-Xlog:safepoint`."], [29.5, "Low pauses, high throughput and a small heap: you choose a balance, not all three."]],
    Recap: [[0.5, "Recap."], [3, "Live means reachable from GC roots. Cycles are collected."], [8, "Most objects die young, and a minor GC pays only for the survivors."], [13, "Mark-sweep fragments, mark-compact moves everything, copying needs spare space."], [18.5, "Ages live in 4 header bits. A young gen that is too small promotes garbage."], [24, "Card tables find old-to-young pointers. A pause is time to safepoint plus GC work."], [29.5, "Allocation is a pointer bump. A leak is a reference you forgot you kept."]]
  };
  var SERVER = [
    "import java.util.*;",
    "",
    ...SERVER_SRC.slice(0, -1),
    "",
    "    public static void main(String[] args) {",
    "        int n = Integer.parseInt(args[0]);",
    "        long sum = 0;",
    "        for (int i = 0; i < n; i++) sum += handle(i);",
    '        System.out.println("handled " + n + " requests, checksum " + sum);',
    "    }",
    "}"
  ].join("\n");
  var notes = [
    { ch: 1, blocks: [
      { p: "The running example for the whole topic is a tiny request handler. Each call allocates short-lived objects, overwrites one slot of a medium-lived `sessions` array, and fills a cache once:" },
      { code: SERVER, title: "Server.java" },
      { p: "**Java does not count references.** A collector asks one question: *can this object still be reached by following references from a GC root?* Anything not reached is garbage by definition, because no code can ever obtain a reference to it again." },
      { mini: { scene: "Roots" } },
      { table: { head: ["GC root", "example in our server"], rows: [
        ["locals and operands in every thread's frames (including registers of compiled frames)", "`sb`, `body` inside `handle(42)`"],
        ["static fields of loaded classes", "`Server.CACHE`, `Server.sessions`"],
        ["JNI / FFM handles held by native code", "a native library holding a `jobject`"],
        ["live `Thread` objects", "the `main` thread itself"],
        ["classes, and the class loaders that keep them alive (8.2)", "`Server.class` via the app class loader"],
        ["JVM-internal strong references", "e.g. objects pinned by the VM, monitors in use"]
      ] } },
      { callout: { tone: "bad", title: "correction to the source note", text: "Interned strings are **not** roots. HotSpot's string table holds its entries *weakly*: an interned string nobody references is collected. You can see the weak processing in G1's phase log on JDK 17: `StringTable Weak \u2026 Dead \u2026 Total 33`." } },
      { h: "Marking, step by step" },
      { mini: { scene: "Marking" } },
      { steps: ["Mark every object a root points to and push it on the mark stack (**grey**).", "Pop an object, scan its reference fields; mark and push each unmarked child (it turns grey). The popped object is now **black**.", "Repeat until the stack is empty.", "Everything never marked (**white**) is garbage. The mark is one bit: in a side bitmap (G1, ZGC, Parallel) or in the mark word (Serial's full GC)."] },
      { callout: { tone: "violet", title: "deeper: why the colours matter", text: "The tri-colour picture becomes essential once marking runs **concurrently** with your threads. If the app stores a white object into a black one and erases the only grey path to it, the collector would miss it. Concurrent collectors prevent that with barriers: G1 uses snapshot-at-the-beginning (record the old value on overwrite), ZGC uses load barriers. 8.6 covers both." } },
      { h: "Cycles" },
      { mini: { scene: "Cycle" } },
      { tryit: { note: "A cycle of two 1 MB nodes, made unreachable. A `WeakReference` lets us watch without keeping it alive.", cmd: "$ javac Cycle.java && java -Xlog:gc Cycle", out: "[0.004s][info][gc] Using G1\n[0.018s][info][gc] GC(0) Pause Full (System.gc()) 3M->0M(10M) 0.815ms\nD collected? true" } },
      { code: 'Node d = new Node(), e = new Node();      // Node { Node next; byte[] payload = new byte[1_000_000]; }\nd.next = e;  e.next = d;                  // a cycle\nvar watch = new WeakReference<>(d);       // sees D without keeping it alive\nd = null;  e = null;                      // no root reaches the cycle\nSystem.gc();\nSystem.out.println("D collected? " + (watch.get() == null));', title: "Cycle.java (main)" },
      { p: "Reference counting frees objects the instant their count hits zero, but it can never free a cycle on its own. CPython adds a separate cycle detector; Swift and `shared_ptr` make you break cycles with weak references. Tracing simply never reaches the cycle." }
    ] },
    { ch: 2, blocks: [
      { p: "The **weak generational hypothesis**: *most objects die young*. A second, related observation: *old objects rarely point to young ones*." },
      { mini: { scene: "Lifetimes" } },
      { table: { head: ["allocated by handle()", "bytes (64-bit, compressed oops)", "lifetime"], rows: [
        ["`StringBuilder` + its `byte[]`", "24 + 48", "dies at return"],
        ["`byte[1024]` body", "1,040", "dies at return"],
        ["boxed `Integer` key (ids 128..499 aren't cached)", "\u2248 12 on average", "dies at return"],
        ["`byte[48]` session", "64", "20,000 requests"],
        ["`byte[2048]` cache entry", "2,064 \xD7 500", "forever"]
      ] } },
      { p: "So about 94.6% of the bytes die within the request that allocated them. The real GC log agrees: with a 64 MB young gen, each minor GC finds ~51 MB in eden and keeps ~2.8 MB (`54M->2M`)." },
      { h: "The cost of a minor GC follows the survivors" },
      { mini: { scene: "SurvivorCost" } },
      { tryit: { note: "Keep eden the same and change only how many sessions stay alive. Median of minor GCs 10\u201340 on this machine:", cmd: "$ java -Dsessions=1     -XX:+UseSerialGC -Xmx512m -Xmn128m -Xlog:gc,gc+heap=info Server 8000000\n$ java -Dsessions=20000 -XX:+UseSerialGC -Xmx512m -Xmn128m -Xlog:gc,gc+heap=info Server 8000000\n$ java -Dsessions=80000 -XX:+UseSerialGC -Xmx512m -Xmn128m -Xlog:gc,gc+heap=info Server 8000000", out: "sessions=1      From: 0K(13056K)->0K(13056K)        median pause 0.076 ms\nsessions=20000  From: 1250K(13056K)->1250K(13056K)  median pause 1.051 ms\nsessions=80000  From: 5000K(13056K)->5000K(13056K)  median pause 4.895 ms\n(abridged; e.g. GC(20) Pause Young (Allocation Failure) 105M->2M(123M) 0.917ms)" } },
      { callout: { tone: "pull", title: "the key insight", text: "A copying collector's work is proportional to the **surviving** objects, not the dead ones. Roughly 100 MB of garbage per GC costs the same as none. **Dead objects cost nothing to collect.**" } }
    ] },
    { ch: 3, blocks: [
      { p: "Three algorithm families, all built on marking (or tracing) from the roots. Same heap in each scene: ten objects `A`\u2013`J`, five live." },
      { h: "Mark-sweep" },
      { mini: { scene: "MarkSweep" } },
      { p: "Mark the live objects, then **sweep**: walk the whole heap and turn every unmarked object into a free block, merging neighbours, chained into a **free list**. Nothing moves, so no pointer changes. The price is **fragmentation**: free memory exists but in pieces too small for a big object, and allocation must search the list." },
      { h: "Mark-compact" },
      { mini: { scene: "MarkCompact" } },
      { steps: ["Mark.", "Compute forwarding addresses: each live object's new address is the total size of the live objects below it.", "Adjust pointers: rewrite every reference (roots and fields) to the new addresses.", "Move: slide objects down in address order."] },
      { p: "This is the classic LISP2 scheme. HotSpot's Serial full GC follows exactly these phases; Parallel and G1 full GCs do the same work in parallel, region by region. No fragmentation and no spare space, but several passes over the heap and every survivor may move." },
      { h: "Copying (Cheney)" },
      { mini: { scene: "Copying" } },
      { list: ["Copy each root's target into to-space and leave a **forwarding pointer** in the old copy.", "`scan` walks the copied objects; for each reference field: if the target is already forwarded, just update the field; otherwise copy it to `free`, forward it, and update.", "When `scan` reaches `free`, everything live is copied. No mark stack: the to-space is the queue (breadth-first).", "Throw away from-space as a whole. Work \u221D live objects; the price is the empty second space."] },
      { callout: { tone: "violet", title: "deeper", text: "HotSpot's Serial young GC scans to-space Cheney-style. Parallel and G1 evacuate with many threads using work-stealing task queues, which copies in a more depth-first order and tends to keep related objects close together. Either way, forwarding pointers are written into the old copy's mark word." } },
      { h: "Side by side" },
      { mini: { scene: "Families" } },
      { table: { head: ["family", "work \u221D", "fragmentation", "extra space", "allocation"], rows: [
        ["Mark-sweep", "live (mark) + whole heap (sweep)", "yes", "none", "free-list search"],
        ["Mark-compact", "live + several heap passes", "none", "none", "pointer bump"],
        ["Copying", "live only", "none", "2\xD7 (or survivor spaces)", "pointer bump"]
      ] } },
      { p: "**Collectors combine them by generation.** Young: copying, because few objects survive. Old: mark-compact (Serial, Parallel, G1's full GC) or concurrent mark plus copying of selected regions (G1 mixed collections, ZGC, Shenandoah). CMS, the old mark-sweep collector, was removed in JDK 14." }
    ] },
    { ch: 4, blocks: [
      { mini: { scene: "MinorGC" } },
      { steps: ["Requests allocate in **eden**.", "Eden full \u2192 allocation failure \u2192 **minor GC**: live objects from eden and the *from* survivor space are copied to the *to* survivor space, each with age + 1.", "Eden and the from-space are now entirely free. The survivor spaces swap names.", "An object whose age has reached the **tenuring threshold** is copied to the **old generation** instead: *promotion*.", "If the to-space overflows, the remaining survivors are promoted early, whatever their age."] },
      { callout: { tone: "violet", title: "deeper: age bits", text: "The age is stored in the mark word: 4 bits, so 0\u201315. On 64-bit JDK 17 the layout of an unlocked object is `unused:25 hash:31 unused:1 age:4 biased_lock:1 lock:2`. Biased locking is gone from JDK 18 on, and Java 25's compact headers (JEP 519, opt-in) repack the word, but the age is still 4 bits." } },
      { h: "A real age table" },
      { mini: { scene: "AgeLog" } },
      { tryit: { cmd: "$ java -XX:+UseSerialGC -Xmx256m -Xmn64m -Xlog:gc,gc+age=trace,gc+heap=info Server 1000000", out: "[0.049s][debug][gc,age ] GC(1) Desired survivor size 3342336 bytes, new threshold 15 (max threshold 15)\n[0.049s][trace][gc,age ] GC(1) - age   1:    1280072 bytes,    1280072 total\n[0.049s][trace][gc,age ] GC(1) - age   2:    1679824 bytes,    2959896 total\n\u2026\n[0.142s][trace][gc,age ] GC(14) - age   1:    1280072 bytes,    1280072 total\n[0.142s][trace][gc,age ] GC(14) - age  15:    1679824 bytes,    2959896 total\n[0.149s][trace][gc,age ] GC(15) - age   1:    1280072 bytes,    1280072 total\n[0.149s][info ][gc,heap] GC(15) Tenured: 0K(65536K)->1640K(65536K)\n(abridged)" } },
      { p: "**Desired survivor size** is `TargetSurvivorRatio` (default 50%) of one survivor space: 50% of 6,528 KB = 3,342,336 bytes. When the survivors would exceed it, HotSpot lowers the threshold for the next GC. Age 1 is the 20,000 live sessions (20,000 \xD7 64 B = 1,280,000 B, plus a few objects). The 1,679,824 bytes that march up one age per GC are the cache, the `sessions` array itself and long-lived startup objects; after 15 survivals they are promoted and tenured grows by 1,640 KB." },
      { tryit: { note: `The flag's range is 0..16: 16 means "never promote by age", 17 doesn't fit.`, cmd: "$ java -XX:MaxTenuringThreshold=17 Server 1000", out: "uintx MaxTenuringThreshold=17 is outside the allowed range [ 0 ... 16 ]\nError: Could not create the Java Virtual Machine.\nError: A fatal exception has occurred. Program will exit." } },
      { h: "Premature promotion" },
      { mini: { scene: "Premature" } },
      { tryit: { cmd: "$ java -XX:+UseSerialGC -Xmx48m -Xmn4m  -Xlog:gc,gc+age=debug,gc+heap=info Server 3000000\n$ java -XX:+UseSerialGC -Xmx48m -Xmn32m -Xlog:gc Server 3000000", out: "[0.081s][debug][gc,age ] GC(16) Desired survivor size 196608 bytes, new threshold 2 (max threshold 15)\n[0.081s][info ][gc,heap] GC(16) Tenured: 3986K(45056K)->4161K(45056K)\n[0.082s][info ][gc,heap] GC(17) Tenured: 4161K(45056K)->4336K(45056K)\n\u2026\n[0.274s][info ][gc,heap] GC(252) Tenured: 45035K(45056K)->3664K(45056K)\n[0.274s][info ][gc     ] GC(252) Pause Full (Allocation Failure) 47M->3M(47M) 9.411ms\n\n-Xmn4m : 1074 minor GCs, 4 full GCs\n-Xmn32m:  133 minor GCs, 0 full GCs\n(abridged)" } },
      { callout: { tone: "pull", title: "recognise it", text: "Symptom: frequent full (or old) collections in an app that mostly allocates short-lived objects, and each one frees most of the old gen. Cause: survivors overflow, so medium-lived objects are promoted and die in old. Fix: a **larger young generation** (or survivor spaces), not a larger old one." } }
    ] },
    { ch: 5, blocks: [
      { p: "A minor GC must find every reference into the young generation, including those stored in **old** objects. In our server, the `sessions` array is promoted after 15 GCs, and every request then stores a new young `byte[48]` into it." },
      { mini: { scene: "CardTable" } },
      { steps: ["The old generation is divided into **cards** of 512 bytes. The **card table** has one byte per card: `0xff` clean, `0x00` dirty.", "The JIT and interpreter add a **post-write barrier** to every reference store: `card_table[address >> 9] = 0`.", "At a minor GC, the collector scans only the objects on dirty cards, treating their references into young as extra roots.", "Afterwards the cards are cleaned."] },
      { p: "This only works because of the second generational observation: old\u2192young pointers are rare, so few cards are dirty. The barrier itself is two or three instructions on every reference store, a cost the app pays all the time." },
      { tryit: { note: "G1 keeps a card table too, plus a remembered set per region (filled by concurrent refinement threads). Its phase log counts the cards it scans:", cmd: "$ java -Xmx256m -Xlog:gc+phases=debug Server 6000000 | grep -E 'GC\\(9\\).*Scan'", out: "[0.308s][debug][gc,phases] GC(9)     Scan Heap Roots (ms):          Min:  0.0, Avg:  0.0, Max:  0.1, Diff:  0.0, Sum:  0.1, Workers: 3\n[0.308s][debug][gc,phases] GC(9)       Scanned Cards:                 Min: 44, Avg: 56.7, Max: 73, Diff: 29, Sum: 170, Workers: 3" } },
      { callout: { tone: "violet", title: "deeper", text: "The card size has been configurable since JDK 18 (`-XX:GCCardSizeInBytes`, default 512). Concurrent collectors need more barriers than this one: G1 also has a *pre*-write barrier for concurrent marking, and ZGC uses load barriers instead (8.6)." } }
    ] },
    { ch: 6, blocks: [
      { p: "A **safepoint** is a point where a thread's state is fully described: the JIT's **oop maps** say which stack slots and registers hold references. To start a stop-the-world phase, the VM thread arms the polls and waits until every Java thread has reached one. That wait is **time to safepoint** (TTS)." },
      { mini: { scene: "Safepoints" } },
      { list: ["**Compiled code** polls at loop back-edges and at method returns (not at method entry).", "**Interpreted code** checks at bytecode boundaries such as branches and returns.", "**Threads in native code or blocked** already count as safe: they hold no raw heap pointers. They are stopped only if they try to re-enter Java.", "Since JDK 10 the poll is a load of a per-thread polling word (thread-local handshakes, JEP 312), so the VM can also stop a single thread."] },
      { callout: { tone: "bad", title: "correction to the source note", text: "Polls are at returns and loop back-edges, not \"method entry\". Allocation sites are not polls either, though a slow-path allocation calls into the VM and can block there. And `-XX:+PrintSafepointStatistics` is gone: JDK 17 says `Unrecognized VM option 'PrintSafepointStatistics'`. Use `-Xlog:safepoint`." } },
      { h: "Counted loops" },
      { mini: { scene: "CountedLoop" } },
      { code: 'public class Tts {\n    static volatile int sink;\n\n    static int spin(int n) {                     // a counted loop: int index, known bound\n        int h = 1;\n        for (int i = 0; i < n; i++) h = h * 31 + i;\n        return h;\n    }\n\n    public static void main(String[] args) throws Exception {\n        for (int w = 0; w < 20_000; w++) sink = spin(1_000);   // warm up: C2 compiles spin()\n        Thread worker = new Thread(() -> sink = spin(Integer.MAX_VALUE));\n        worker.start();\n        Thread.sleep(100);                       // worker is now deep inside the loop\n        long t0 = System.nanoTime();\n        System.gc();                             // needs every thread at a safepoint\n        System.out.printf("System.gc() returned after %d ms%n", (System.nanoTime() - t0) / 1_000_000);\n        worker.join();\n    }\n}', title: "Tts.java" },
      { tryit: { cmd: "$ java -XX:+UseParallelGC -Xlog:safepoint,gc Tts\n$ java -XX:+UseG1GC -Xlog:safepoint Tts\n$ java -XX:+UseParallelGC -Xlog:safepoint TtsLong      # same, with for (long i = 0; \u2026)", out: '[2.367s][info][safepoint] Safepoint "ParallelGCSystemGC", \u2026 Reaching safepoint: 2211175541 ns, \u2026 At safepoint: 4655167 ns, Total: 2215969208 ns\nSystem.gc() returned after 2216 ms\n\n[0.148s][info][safepoint] Safepoint "G1CollectFull", \u2026 Reaching safepoint: 37209 ns, \u2026 At safepoint: 1102292 ns, Total: 1141959 ns\nSystem.gc() returned after 1 ms\n\n[2.327s][info][safepoint] Safepoint "ParallelGCSystemGC", \u2026 Reaching safepoint: 2160828334 ns, \u2026 At safepoint: 3839250 ns, Total: 2164754750 ns\nSystem.gc() returned after 2165 ms\n(abridged)' } },
      { table: { head: ["JDK 17 flag", "G1 / ZGC / Shenandoah", "Serial / Parallel"], rows: [["`UseCountedLoopSafepoints`", "`true`", "`false`"], ["`LoopStripMiningIter`", "`1000`", "`0`"]] } },
      { callout: { tone: "bad", title: "correction to the source note", text: '"Use a `long` counter, the JIT keeps safepoint polls in those" is outdated. Since JDK 16, C2 also optimises loops with `long` trip counts (it turns them into an `int` loop nested in an outer loop), so the inner loop has no poll. Measured above: the `long` version still waited **2.16 s** to reach the safepoint. The real fix is **loop strip mining**, on by default with G1, ZGC and Shenandoah; with Serial/Parallel you can enable `-XX:+UseCountedLoopSafepoints -XX:LoopStripMiningIter=1000` (reaching the safepoint then took 49 \xB5s here).' } },
      { p: "**Diagnostic signature:** a pause that is much longer than the GC work it reports. In `-Xlog:safepoint`, compare *Reaching safepoint* (TTS) with *At safepoint* (the work)." }
    ] },
    { ch: 7, blocks: [
      { p: "Because copying and compaction leave free space as one block, allocating is a **pointer bump**: read `top`, add the size, compare with `end`, write `top` back, then initialise the header. Each thread bumps inside its own **TLAB** (thread-local allocation buffer) with no locking. Only a TLAB refill touches shared state: one atomic compare-and-swap on eden's top." },
      { mini: { scene: "TLAB" } },
      { tryit: { cmd: "$ java -XX:+UseSerialGC -Xmx256m -Xmn64m -Xlog:gc+tlab=debug,gc Server 1000000", out: "[0.127s][debug][gc,tlab] GC(1) TLAB totals: thrds: 1  refills: 51 max: 51 slow allocs: 0 max 0 waste:  0.1% gc: 0B max: 0B slow: 80064B max: 80064B\n[0.136s][info ][gc     ] GC(1) Pause Young (Allocation Failure) 54M->2M(121M) 8.803ms" } },
      { p: "At `trace` level each refill is printed (`desired_size: 1049KB`). One eden fill here is about 45,000 requests, roughly 200,000 objects, served by **51** TLAB refills and zero slow allocations outside a TLAB." },
      { callout: { tone: "bad", title: "correction to the source note", text: "`-XX:+PrintTLAB` was removed in JDK 9. JDK 17: `Unrecognized VM option 'PrintTLAB'`. Use `-Xlog:gc+tlab=debug` (totals per GC) or `=trace` (every refill)." } },
      { callout: { tone: "pull", title: "dated advice", text: `"Don't allocate in a loop" dates from slow allocators. Short-lived objects are a pointer bump to allocate, free to collect, and escape analysis (8.8) can remove the allocation entirely. Optimise allocation only when a profiler points at it.` } }
    ] },
    { ch: 8, blocks: [
      { mini: { scene: "TradeOff" } },
      { table: { head: ["you want", "you pay with"], rows: [["**throughput** (time in your code)", "longer pauses: batch work into rare stop-the-world collections"], ["**low latency** (short pauses)", "CPU for concurrent GC threads, barrier overhead, and heap headroom"], ["**small footprint**", "more frequent collections, so lower throughput"]] } },
      { p: "**Stop-the-world** phases freeze every application thread; they are the most efficient way to do the work, but their length grows with the live data. **Concurrent** phases run beside the application; they need spare CPU, and spare heap because the application keeps allocating during the cycle. If the headroom runs out, a concurrent collector falls back to a stop-the-world collection." },
      { callout: { tone: "flow", text: `This trade is the whole story of 8.6: Parallel leans to throughput, ZGC to latency, G1 balances. It isn't strictly "pick two", but you can't improve one corner without paying in another.` } }
    ] },
    { ch: 9, blocks: [
      { p: "You can't leak in Java by forgetting to free. **A Java memory leak is unintentional reachability**: an object your code will never use again is still referenced from something reachable, so the collector must keep it." },
      { mini: { scene: "Leak" } },
      { code: 'import java.util.*;\n\npublic class Leak {\n    static final Map<Integer, byte[]> CACHE = new HashMap<>();   // static: a GC root\n\n    static void handle(int id) {\n        CACHE.computeIfAbsent(id, k -> new byte[2048]);         // bug: keyed by request id, never evicted\n    }\n\n    public static void main(String[] args) {\n        for (int i = 0; ; i++) {\n            handle(i);\n            if (i % 5000 == 0) System.out.println(i + " requests, cache size " + CACHE.size());\n        }\n    }\n}', title: "Leak.java" },
      { tryit: { cmd: "$ java -XX:+UseSerialGC -Xmx32m -Xlog:gc Leak", out: '[0.041s][info][gc] GC(0) Pause Young (Allocation Failure) 8M->7M(30M) 2.480ms\n[0.045s][info][gc] GC(1) Pause Young (Allocation Failure) 16M->16M(30M) 2.658ms\n[0.046s][info][gc] GC(2) Pause Young (Allocation Failure) 24M->24M(30M) 0.021ms\n[0.054s][info][gc] GC(3) Pause Full (Allocation Failure) 24M->24M(30M) 7.939ms\n[0.063s][info][gc] GC(4) Pause Full (Allocation Failure) 30M->30M(30M) 7.022ms\n\u2026\n15000 requests, cache size 15001\nException in thread "main" java.lang.OutOfMemoryError: Java heap space\n(abridged)' } },
      { p: "The signature of a leak in a GC log: the heap **after** each collection keeps rising, and full GCs free almost nothing. To find it you don't look for missing frees; you take a heap dump and ask *what is the path from a GC root to these objects?* (8.9). The catalogue of common leak shapes (static collections, listeners, `ThreadLocal`s, class loaders) is in 8.7." }
    ] }
  ];
  var traps = [
    '"Java uses reference counting." It traces **reachability** from GC roots, which is why unreachable cycles are collected.',
    '"Frequent major GCs? Give the old generation more room." Often the opposite: **premature promotion** needs a bigger **young** generation.',
    '"Allocation is expensive." It is a **pointer bump** in a TLAB, and dead objects cost nothing to collect.',
    '"A long GC pause is always the collector\'s work." Check **time to safepoint** in `-Xlog:safepoint`: a counted loop can stall every thread.',
    '"Use a `long` loop counter to keep safepoint polls." Not since JDK 16; rely on loop strip mining (default with G1/ZGC/Shenandoah).',
    `"Interned strings are GC roots." HotSpot's string table is weak; unreferenced interned strings are collected.`,
    '"Low pauses, high throughput and a small heap, all at once." You choose a balance; each gain is paid for elsewhere.'
  ];
  var recap = [
    "**Reachability**: live = reachable from GC roots (stacks, statics, JNI handles, threads, class loaders). Cycles are collected.",
    "**Weak generational hypothesis**: most objects die young; old\u2192young references are rare.",
    "**Minor GC cost** \u221D survivors, not garbage. Dead objects are free.",
    "**Families**: mark-sweep (fragments, free list) \xB7 mark-compact (no holes, several passes, moves everything) \xB7 copying (\u221D live, needs spare space).",
    "**Promotion**: age in 4 mark-word bits (max 15); survivor overflow promotes early. Too-small young gen \u2192 **premature promotion**.",
    "**Card table + write barrier**: dirty 512-byte cards are the extra roots of a minor GC.",
    "**Safepoints**: pause = time to safepoint + GC work. Counted loops without polls stall everyone; loop strip mining fixes it.",
    "**Allocation**: a pointer bump in a TLAB. **Leak**: unintentional reachability."
  ];
  var quiz = [
    { q: "`D` and `E` reference each other, and nothing else references either. What happens at the next GC that covers them?", options: ["They stay forever, because their reference counts are 1", "They are collected, because no path from a GC root reaches them", "They are collected only if `System.gc()` is called", "They are moved to the old generation"], answer: 1, why: "HotSpot never looks at reference counts. Marking starts at the roots; the cycle is never reached, so it is garbage. Reference counting (CPython) needs a separate cycle detector for this case." },
    { q: "Eden is 100 MB. In run A, 0 KB survive each minor GC; in run B, 5 MB survive. Which pause is longer, and why?", options: ["They are equal: eden is the same size", "A, because it frees more garbage", "B, because a copying collector's work is proportional to the surviving objects", "A, because empty survivor spaces must be zeroed"], answer: 2, why: "A minor GC traces and copies live objects only; it never visits dead ones. On JDK 17 the measured medians were 0.08 ms vs 4.9 ms for the same eden." },
    { q: "An app allocating mostly short-lived objects has frequent full GCs, and each full GC frees about 90% of the old gen. What is the most likely fix?", options: ["A larger old generation", "A larger young generation", "Calling System.gc() at quiet times", "Lowering MaxTenuringThreshold to 1"], answer: 1, why: "This is premature promotion: survivors overflow a small young gen and get promoted, then die in the old gen. A bigger young gen lets them die there cheaply. Lowering the threshold would make it worse." },
    { q: "Why does a minor GC need a card table?", options: ["To find free space in eden", "To find references from old objects into young objects without scanning the whole old generation", "To record object ages", "To decide which thread allocates next"], answer: 1, why: "Young objects can be reachable only through an old object. The write barrier marks the card of each reference store dirty, and the minor GC scans only dirty cards as extra roots." },
    { q: "`-Xlog:safepoint` shows `Reaching safepoint: 2211175541 ns` and `At safepoint: 4655167 ns`. What does it mean?", options: ["The GC did 2.2 s of work", "Threads took 2.2 s to stop; the GC work took under 5 ms", "The heap is too small", "A full GC compacted the heap twice"], answer: 1, why: '"Reaching" is time to safepoint: waiting for every thread to hit a poll. Here a worker was in a counted loop with no poll (Parallel GC, no strip mining). The GC itself took ~4.7 ms.' },
    { q: "Why is allocation in a TLAB usually cheaper than `malloc`?", options: ["TLAB memory is never collected", "Free space is contiguous, so allocation is a bump of a thread-private pointer with no locking or searching", "The JVM preallocates every object at startup", "Objects in a TLAB have no header"], answer: 1, why: "Copying/compaction leaves one free block. Each thread bumps `top` inside its own buffer; only a refill uses one atomic operation on shared eden." },
    { q: "What is the main weakness of plain mark-sweep?", options: ["It cannot collect cycles", "It moves every object", "Free space becomes fragmented, and allocation must search a free list", "It needs twice the heap"], answer: 2, why: "Sweeping frees objects in place. In the scene, 6 of 16 slots were free but no hole could hold a 4-slot object." },
    { q: "In Cheney's copying algorithm, scanning `H` finds a field pointing to `C`, which was already copied. What happens?", options: ["`C` is copied again", "The field is updated using the forwarding pointer left in the old `C`; nothing is copied", "The GC aborts and restarts", "`H` is promoted"], answer: 1, why: "Every copied object leaves a forwarding pointer in its old location. Following it keeps one copy per object and preserves cycles and sharing." },
    { q: "`java -XX:MaxTenuringThreshold=17` fails to start. Why?", options: ["17 is reserved for G1", "Object age is stored in 4 bits of the mark word, so the flag range is 0..16 (16 = never promote by age)", "The threshold must be a power of two", "Thresholds above 15 need -XX:+UnlockExperimentalVMOptions"], answer: 1, why: 'Four bits count 0\u201315. The JVM reports "outside the allowed range [ 0 ... 16 ]".' },
    { q: "Which best defines a memory leak in Java?", options: ["Memory never returned to the OS", "Objects your code will never use again that are still reachable from a GC root", "Objects the GC forgot to mark", "Any object in the old generation"], answer: 1, why: "The collector frees everything unreachable. A leak is unintentional reachability, e.g. a static map that only grows. You find it by asking which path from a root keeps the objects alive." }
  ];
  window.AN.registerTopic({
    id: "8.5",
    part: "08",
    title: "Garbage collection: the theory",
    kicker: "Part 08 \xB7 The JVM",
    lede: "Learn the ideas before the collector names: reachability, generations, the three algorithm families, and the machinery underneath (card tables, safepoints, TLABs). After this, GC tuning advice stops being cargo cult.",
    chapters,
    scenes,
    captions,
    notes,
    traps,
    recap,
    quiz
  });
})();
