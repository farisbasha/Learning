(() => {
  // src/topics/8.7/common.jsx
  var { PAL, MOTION, track, pulse, hexA, toneColor, MONO, SANS, Txt, Box, Badge, clamp, lerp } = window.AN;
  var E = MOTION.enter;
  var KIND = {
    strong: { color: PAL.flow, dash: null, w: 3.5, tone: "flow", name: "strong" },
    soft: { color: PAL.pull, dash: "16 9", w: 3.5, tone: "pull", name: "soft" },
    weak: { color: PAL.blue, dash: "2 9", w: 4, tone: "blue", name: "weak" },
    phantom: { color: PAL.violet, dash: "11 6 2 6", w: 3, tone: "violet", name: "phantom" },
    final: { color: PAL.pink, dash: "6 6", w: 3, tone: "pink", name: "final" },
    bad: { color: PAL.bad, dash: null, w: 4, tone: "bad", name: "leak" }
  };
  function partial(P, p) {
    if (p >= 1) return P;
    const seg = [];
    let total = 0;
    for (let i = 1; i < P.length; i++) {
      const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
      seg.push(l);
      total += l;
    }
    let left = total * clamp(p, 0, 1);
    const out = [P[0]];
    for (let i = 1; i < P.length; i++) {
      if (left >= seg[i - 1]) {
        out.push(P[i]);
        left -= seg[i - 1];
        continue;
      }
      const f = seg[i - 1] ? left / seg[i - 1] : 0;
      out.push([lerp(P[i - 1][0], P[i][0], f), lerp(P[i - 1][1], P[i][1], f)]);
      break;
    }
    return out;
  }
  function midpoint(P) {
    let total = 0;
    const seg = [];
    for (let i = 1; i < P.length; i++) {
      const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
      seg.push(l);
      total += l;
    }
    let left = total / 2;
    for (let i = 1; i < P.length; i++) {
      if (left <= seg[i - 1]) {
        const f = left / seg[i - 1];
        return [lerp(P[i - 1][0], P[i][0], f), lerp(P[i - 1][1], P[i][1], f)];
      }
      left -= seg[i - 1];
    }
    return P[0];
  }
  function RArrow({ pts, kind = "strong", draw = 1, a = 1, cut = 0, label, lx, ly, lfs = 17, head = true, color, width, glow = 0 }) {
    if (a <= 5e-3 || draw <= 1e-3) return null;
    const K = KIND[kind];
    const c = color || K.color;
    const P = partial(pts, draw);
    const d = "M" + P.map((q) => q.join(",")).join(" L");
    const end = P[P.length - 1], prev = P[P.length - 2] || P[0];
    const ang = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
    const hs = 14;
    const hp = `${end[0]},${end[1]} ${end[0] - hs * Math.cos(ang - 0.42)},${end[1] - hs * Math.sin(ang - 0.42)} ${end[0] - hs * Math.cos(ang + 0.42)},${end[1] - hs * Math.sin(ang + 0.42)}`;
    const op = clamp(a, 0, 1) * (1 - 0.72 * clamp(cut, 0, 1));
    const m = midpoint(pts);
    return /* @__PURE__ */ React.createElement("svg", { width: "1920", height: "1080", viewBox: "0 0 1920 1080", style: { position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" } }, /* @__PURE__ */ React.createElement("g", { opacity: op }, glow > 0.01 && /* @__PURE__ */ React.createElement("path", { d, fill: "none", stroke: c, strokeWidth: (width || K.w) + 10, strokeOpacity: 0.25 * glow, strokeLinecap: "round", strokeLinejoin: "round" }), /* @__PURE__ */ React.createElement("path", { d, fill: "none", stroke: c, strokeWidth: width || K.w, strokeLinecap: "round", strokeLinejoin: "round", strokeDasharray: K.dash || void 0 }), head && draw > 0.97 && /* @__PURE__ */ React.createElement("polygon", { points: hp, fill: c }), label && /* @__PURE__ */ React.createElement("text", { x: lx, y: ly, fill: c, stroke: PAL.bg, strokeWidth: "6", paintOrder: "stroke", style: { font: `600 ${lfs}px ${MONO}` }, textAnchor: "middle" }, label)), cut > 0.01 && /* @__PURE__ */ React.createElement("g", { transform: `translate(${m[0]},${m[1]}) scale(${0.6 + 0.4 * clamp(cut, 0, 1)})`, opacity: clamp(cut * 1.5, 0, 1) }, /* @__PURE__ */ React.createElement("circle", { r: "17", fill: PAL.bg, stroke: PAL.bad, strokeWidth: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M-7,-7 L7,7 M7,-7 L-7,7", stroke: PAL.bad, strokeWidth: "3.5", strokeLinecap: "round" })));
  }
  function Obj({ x, y, w = 220, h = 66, name, sub, tone = "ink", a = 1, gone = 0, glow = 0, fs = 21, sfs = 17, ghostSub = "collected" }) {
    if (a <= 5e-3) return null;
    const g = clamp(gone, 0, 1);
    const dead = g > 0.5;
    return /* @__PURE__ */ React.createElement(Box, { x, y, w, h, label: name, sub: dead ? ghostSub : sub, tone: g > 0.05 ? dead ? "dim" : "bad" : tone, dashed: g > 0.05, strike: dead, a: a * (1 - 0.55 * g), glow: g > 0.05 && !dead ? 0.8 : glow, fs, sfs });
  }
  function RefBox({ x, y, w = 290, h = 72, kind = "weak", title, cleared = 0, a = 1, glow = 0, fs = 19, sfs = 17, sub }) {
    if (a <= 5e-3) return null;
    const K = KIND[kind];
    const c = clamp(cleared, 0, 1) > 0.5;
    return /* @__PURE__ */ React.createElement(Box, { x, y, w, h, label: /* @__PURE__ */ React.createElement("span", { style: { color: K.color } }, title), sub: sub || (c ? "referent = null" : "referent \u2192"), tone: c ? "dim" : K.tone, a, glow, fs, sfs });
  }
  function GcSweep({ t, at, dur = 1.4, x, y, w, h, label = "GC", tone = "pull" }) {
    const p = (t - at) / dur;
    if (p < 0 || p > 1.25) return null;
    const c = toneColor(tone);
    const fade = p > 1 ? 1 - (p - 1) / 0.25 : 1;
    const lx = x + w * clamp(p, 0, 1);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, width: lx - x, height: h, background: `linear-gradient(90deg, ${hexA(c, 0)}, ${hexA(c, 0.1)})`, opacity: fade, borderRadius: 12, pointerEvents: "none" } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: lx - 2, top: y, width: 4, height: h, background: c, boxShadow: `0 0 24px ${c}`, opacity: fade } }), /* @__PURE__ */ React.createElement(Badge, { x: lx, y: y + 16, text: label, tone, solid: true, a: fade, fs: 17 }));
  }
  function Gauge({ x, y, w, h = 30, value, max, label = "heap", a = 1, right, unit = "M", fs = 18 }) {
    if (a <= 5e-3) return null;
    const f = clamp(value / max, 0, 1);
    const c = f > 0.85 ? PAL.bad : f > 0.6 ? PAL.pull : PAL.flow;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, width: w, opacity: clamp(a, 0, 1) } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", font: `500 ${fs}px ${MONO}`, color: PAL.ink2, marginBottom: 8, whiteSpace: "nowrap" } }, /* @__PURE__ */ React.createElement("span", null, label), /* @__PURE__ */ React.createElement("span", { style: { color: c } }, right != null ? right : `${Math.round(value)}${unit} / ${max}${unit}`)), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", height: h, borderRadius: 8, background: PAL.panel2, border: `1.5px solid ${PAL.line2}`, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 0, top: 0, bottom: 0, width: `${f * 100}%`, background: `linear-gradient(90deg, ${hexA(c, 0.55)}, ${c})`, borderRadius: 6 } })));
  }
  function Chart({ x, y, w, h, series, xmax, ymax, a = 1, yTicks = [], xTicks = [], yUnit = "", xLabel, title, right }) {
    if (a <= 5e-3) return null;
    const px = (v) => x + 70 + v / xmax * (w - 100);
    const py = (v) => y + h - 50 - v / ymax * (h - 110);
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 0, top: 0, opacity: clamp(a, 0, 1) } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, width: w, height: h, boxSizing: "border-box", borderRadius: 14, background: PAL.panel, border: `1.5px solid ${PAL.line2}` } }, title && /* @__PURE__ */ React.createElement("div", { style: { height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", borderBottom: `1px solid ${PAL.line}`, font: `500 18px ${MONO}`, color: PAL.ink2, whiteSpace: "nowrap" } }, /* @__PURE__ */ React.createElement("span", null, title), right && /* @__PURE__ */ React.createElement("span", { style: { color: PAL.ink3 } }, right))), /* @__PURE__ */ React.createElement("svg", { width: "1920", height: "1080", style: { position: "absolute", left: 0, top: 0, overflow: "visible" } }, /* @__PURE__ */ React.createElement("line", { x1: px(0), y1: py(0), x2: px(xmax), y2: py(0), stroke: PAL.line2, strokeWidth: "2" }), yTicks.map((v) => /* @__PURE__ */ React.createElement("g", { key: "y" + v }, /* @__PURE__ */ React.createElement("line", { x1: px(0), y1: py(v), x2: px(xmax), y2: py(v), stroke: PAL.line, strokeWidth: "1" }), /* @__PURE__ */ React.createElement("text", { x: px(0) - 10, y: py(v) + 5, fill: PAL.ink3, textAnchor: "end", style: { font: `400 17px ${MONO}` } }, v, yUnit))), xTicks.map(([v, l]) => /* @__PURE__ */ React.createElement("text", { key: "x" + v, x: px(v), y: py(0) + 24, fill: PAL.ink3, textAnchor: "middle", style: { font: `400 17px ${MONO}` } }, l)), series.map((s, k) => {
      const n = s.n == null ? s.pts.length : s.n;
      const whole = Math.floor(n);
      const shown = s.pts.slice(0, Math.max(0, whole));
      if (whole < s.pts.length && whole >= 1 && n > whole) {
        const p0 = s.pts[whole - 1], p1 = s.pts[whole], f = n - whole;
        shown.push([lerp(p0[0], p1[0], f), lerp(p0[1], p1[1], f)]);
      }
      if (shown.length < 1) return null;
      return /* @__PURE__ */ React.createElement("g", { key: k }, shown.length > 1 && /* @__PURE__ */ React.createElement("polyline", { points: shown.map((p) => `${px(p[0])},${py(p[1])}`).join(" "), fill: "none", stroke: s.color, strokeWidth: "3.5", strokeLinejoin: "round", strokeDasharray: s.dash }), s.dots && shown.map((p, i) => /* @__PURE__ */ React.createElement("circle", { key: i, cx: px(p[0]), cy: py(p[1]), r: "5", fill: s.color })));
    })), xLabel && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x + w - 20, top: y + h - 30, transform: "translateX(-100%)", font: `400 17px ${MONO}`, color: PAL.ink3, whiteSpace: "nowrap" } }, xLabel));
  }
  function Legend({ x, y, a = 1, kinds = ["strong", "soft", "weak", "phantom"], gap = 210, len = 90 }) {
    if (a <= 5e-3) return null;
    return kinds.map((k, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: k }, /* @__PURE__ */ React.createElement(RArrow, { pts: [[x + i * gap, y], [x + i * gap + len, y]], kind: k, a }), /* @__PURE__ */ React.createElement(Txt, { x: x + i * gap + len + 14, y, anchor: "left-center", mono: true, fs: 17, color: KIND[k].color, a }, k)));
  }
  function LeakTag({ n, a = 1 }) {
    return /* @__PURE__ */ React.createElement(Badge, { x: 1824, y: 130, anchor: "right", text: `LEAK ${n} OF 7`, tone: "bad", a, fs: 17 });
  }
  function Tok({ t, keys, text, tone = "flow", from, until, w = 220, h = 48, fs = 18, glowAt }) {
    const start = from == null ? keys[0][0] : from;
    if (t < start) return null;
    const [x, y] = track(t, keys);
    let a = E(t, start, 0.25);
    if (until != null) a *= 1 - E(t, until, 0.3);
    if (a <= 0.01) return null;
    const c = toneColor(tone);
    const g = glowAt != null ? pulse(t, [glowAt], 1) : 0;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, boxSizing: "border-box", borderRadius: 10, opacity: a, background: PAL.panel2, border: `2px solid ${c}`, display: "flex", alignItems: "center", justifyContent: "center", font: `600 ${fs}px ${MONO}`, color: PAL.ink, boxShadow: g > 0.01 ? `0 0 ${26 * g}px ${hexA(c, 0.7 * g)}` : "none", whiteSpace: "nowrap" } }, text);
  }
  function Region({ x, y, w, h, title, tone = "ink", a = 1, glow = 0, right }) {
    if (a <= 5e-3) return null;
    const c = toneColor(tone);
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, width: w, height: h, boxSizing: "border-box", borderRadius: 12, border: `2px dashed ${hexA(c, 0.6)}`, background: hexA(c, 0.04 + 0.08 * glow), opacity: clamp(a, 0, 1), boxShadow: glow > 0.01 ? `0 0 ${28 * glow}px ${hexA(c, 0.4 * glow)}` : "none" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 14, top: 8, font: `600 17px ${MONO}`, color: c, letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" } }, title), right && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", right: 14, top: 8, font: `500 17px ${MONO}`, color: PAL.ink3, whiteSpace: "nowrap" } }, right));
  }

  // src/topics/8.7/scenes1.jsx
  var {
    PAL: PAL2,
    MOTION: MOTION2,
    lin,
    lerp: lerp2,
    win,
    pulse: pulse2,
    step,
    track1,
    hlAt,
    clamp: clamp2,
    hexA: hexA2,
    MONO: MONO2,
    SANS: SANS2,
    Txt: Txt2,
    Panel,
    Box: Box2,
    Code,
    Console,
    HArrow,
    VArrow,
    Arrow,
    Dot,
    Card,
    Node,
    Badge: Badge2,
    Callout,
    Table,
    Mark,
    toneColor: toneColor2
  } = window.AN;
  var E2 = MOTION2.enter;
  var M = MOTION2.move;
  var POP = MOTION2.pop;
  var LEAK_PTS = [[0, 1], [0.39, 14], [0.465, 17], [0.513, 19], [0.539, 20], [0.565, 21], [0.59, 22], [0.616, 23], [0.642, 24], [0.668, 25], [0.693, 26], [0.718, 27], [0.744, 28], [0.769, 29], [0.794, 30]];
  function SIntro({ t }) {
    const rows = [["strong", "a.png"], ["soft", "b.png"], ["weak", "c.png"], ["phantom", "d.png"]];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt2, { x: 96, y: 150, mono: true, fs: 22, weight: 600, color: PAL2.pull, a: E2(t, 0.3), style: { letterSpacing: "0.14em" } }, "PART 08 \xB7 THE JVM \xB7 8.7"), /* @__PURE__ */ React.createElement(Txt2, { x: 92, y: 192, fs: 110, weight: 700, lh: 1, a: E2(t, 0.6, 0.9), style: { letterSpacing: "-0.03em", transform: `translateY(${(1 - E2(t, 0.6, 0.9)) * 24}px)` } }, "References and reachability"), /* @__PURE__ */ React.createElement(Txt2, { x: 96, y: 330, fs: 34, color: PAL2.ink2, a: E2(t, 1.4, 0.8) }, "Who keeps an object alive, how to hold one loosely, and why Java still leaks."), /* @__PURE__ */ React.createElement(Box2, { x: 96, y: 480, w: 200, h: 360, label: "GC root", sub: "main() locals", tone: "flow", a: E2(t, 2), fs: 24 }), rows.map(([k, f], i) => {
      const y = 520 + i * 92;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: k }, /* @__PURE__ */ React.createElement(RArrow, { pts: [[300, y], [600, y]], kind: k, draw: M(t, 6 + i * 1.1, 0.8), label: k, lx: 450, ly: y - 14, lfs: 17 }), /* @__PURE__ */ React.createElement(Obj, { x: 606, y: y - 30, w: 230, h: 60, name: f, sub: "1 MB of pixels", a: E2(t, 6.5 + i * 1.1), tone: KIND[k].tone }));
    }), /* @__PURE__ */ React.createElement(Txt2, { x: 96, y: 862, fs: 20, color: PAL2.ink2, a: E2(t, 10.5) }, "each arrow: a different promise about when the GC may take the image"), /* @__PURE__ */ React.createElement(
      Chart,
      {
        x: 1e3,
        y: 470,
        w: 824,
        h: 420,
        a: E2(t, 12),
        title: "heap after each GC",
        right: "a leak",
        xmax: 0.85,
        ymax: 32,
        yTicks: [0, 16, 32],
        yUnit: "M",
        series: [{ pts: LEAK_PTS, color: PAL2.bad, n: lerp2(1, LEAK_PTS.length, lin(t, 12.6, 4.4)) }],
        xLabel: "time \u2192"
      }
    ), /* @__PURE__ */ React.createElement(Badge2, { x: 1412, y: 560, text: "OutOfMemoryError", tone: "bad", solid: true, a: POP(t, 17), fs: 18 }), /* @__PURE__ */ React.createElement(Badge2, { x: 1412, y: 918, text: "running example: an image viewer and its picture cache", tone: "pull", a: E2(t, 18.2), fs: 17 }));
  }
  function SReachability({ t }) {
    const mk = (at) => t >= at ? "flow" : "ink";
    const dot = (s, x1, y1, x2, y2) => {
      const p = M(t, s, 0.7);
      return p > 0 && p < 1 ? /* @__PURE__ */ React.createElement(Dot, { x: lerp2(x1, x2, p), y: lerp2(y1, y2, p), r: 8, color: PAL2.flow }) : null;
    };
    const islandGone = M(t, 17, 1);
    const fields = [["referent", "private T referent;"], ["queue", "volatile ReferenceQueue queue;"], ["next", "volatile Reference next;"], ["discovered", "transient Reference discovered;"]];
    const ladder = [["strongly", "flow"], ["softly", "pull"], ["weakly", "blue"], ["phantom", "violet"], ["unreachable", "dim"]];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel, { x: 96, y: 200, w: 340, h: 330, title: "GC roots", tone: "flow", a: E2(t, 0.6) }), /* @__PURE__ */ React.createElement(Box2, { x: 120, y: 262, w: 292, h: 72, label: "viewer", sub: "local \xB7 main()", tone: "flow", a: E2(t, 1.2) }), /* @__PURE__ */ React.createElement(Box2, { x: 120, y: 356, w: 292, h: 72, label: "CACHE", sub: "static field", tone: "flow", a: E2(t, 1.6) }), /* @__PURE__ */ React.createElement(Txt2, { x: 120, y: 452, fs: 17, mono: true, color: PAL2.ink3, a: E2(t, 2.2), w: 300 }, "also: other threads, JNI handles, classes\u2026"), /* @__PURE__ */ React.createElement(Panel, { x: 480, y: 200, w: 1344, h: 330, title: "heap", a: E2(t, 2.5) }), /* @__PURE__ */ React.createElement(Obj, { x: 520, y: 262, w: 230, h: 66, name: "ImageViewer", tone: mk(7.6), a: E2(t, 3), glow: pulse2(t, [7.6], 1) }), /* @__PURE__ */ React.createElement(Obj, { x: 820, y: 262, w: 230, h: 66, name: "Image", sub: "cat.png", tone: mk(8.4), a: E2(t, 3.2), glow: pulse2(t, [8.4], 1) }), /* @__PURE__ */ React.createElement(Obj, { x: 1120, y: 262, w: 230, h: 66, name: "byte[]", sub: "1 MB pixels", tone: mk(9.2), a: E2(t, 3.4), glow: pulse2(t, [9.2], 1) }), /* @__PURE__ */ React.createElement(Obj, { x: 520, y: 380, w: 230, h: 66, name: "HashMap", tone: mk(9.6), a: E2(t, 3.6), glow: pulse2(t, [9.6], 1) }), /* @__PURE__ */ React.createElement(Obj, { x: 820, y: 380, w: 230, h: 66, name: "Image", sub: "dog.png", tone: mk(10.4), a: E2(t, 3.8), glow: pulse2(t, [10.4], 1) }), /* @__PURE__ */ React.createElement(Obj, { x: 1120, y: 380, w: 230, h: 66, name: "byte[]", sub: "1 MB pixels", tone: mk(11.2), a: E2(t, 4), glow: pulse2(t, [11.2], 1) }), /* @__PURE__ */ React.createElement(Obj, { x: 1440, y: 262, w: 230, h: 66, name: "Image", sub: "old.png", a: E2(t, 4.2), tone: t > 13 ? "bad" : "ink", gone: islandGone, ghostSub: "reclaimed" }), /* @__PURE__ */ React.createElement(Obj, { x: 1440, y: 400, w: 230, h: 66, name: "Thumb", sub: "old.png", a: E2(t, 4.4), tone: t > 13 ? "bad" : "ink", gone: islandGone, ghostSub: "reclaimed" }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[412, 298], [516, 298]], draw: M(t, 4.6, 0.5) }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[412, 392], [470, 392], [470, 413], [516, 413]], draw: M(t, 4.8, 0.5) }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[750, 295], [816, 295]], draw: M(t, 5, 0.4) }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1050, 295], [1116, 295]], draw: M(t, 5.2, 0.4) }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[750, 413], [816, 413]], draw: M(t, 5.4, 0.4) }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1050, 413], [1116, 413]], draw: M(t, 5.6, 0.4) }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1520, 328], [1520, 396]], draw: M(t, 5.8, 0.4), a: 1 - 0.6 * islandGone }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1600, 400], [1600, 332]], draw: M(t, 6, 0.4), a: 1 - 0.6 * islandGone }), /* @__PURE__ */ React.createElement(Txt2, { x: 1555, y: 480, anchor: "mid", mono: true, fs: 17, color: PAL2.bad, a: E2(t, 13.5) }, "a cycle \xB7 unreachable"), dot(7, 412, 298, 516, 298), dot(7.8, 750, 295, 816, 295), dot(8.6, 1050, 295, 1116, 295), dot(9, 412, 392, 516, 413), dot(9.8, 750, 413, 816, 413), dot(10.6, 1050, 413, 1116, 413), /* @__PURE__ */ React.createElement(Box2, { x: 96, y: 640, w: 240, h: 80, label: "ref", sub: "local \xB7 main()", tone: "flow", a: E2(t, 27) }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[336, 680], [436, 680]], draw: M(t, 27.5, 0.5) }), /* @__PURE__ */ React.createElement(Panel, { x: 440, y: 590, w: 470, h: 250, title: "WeakReference<Image>", right: "javap -p", tone: "blue", a: E2(t, 27.8) }, /* @__PURE__ */ React.createElement("div", { style: { padding: "8px 0" } }, fields.map(([f, s], i) => {
      const lit = f === "referent" && t > 33;
      return /* @__PURE__ */ React.createElement("div", { key: f, style: { height: 46, display: "flex", alignItems: "center", padding: "0 20px", font: `500 18px ${MONO2}`, color: lit ? PAL2.ink : PAL2.ink2, background: lit ? hexA2(PAL2.pull, 0.14) : "transparent", borderLeft: `3px solid ${lit ? PAL2.pull : "transparent"}`, opacity: E2(t, 33 + i * 0.3) } }, s);
    }))), /* @__PURE__ */ React.createElement(RArrow, { pts: [[910, 665], [996, 665]], kind: "weak", draw: M(t, 34, 0.6) }), /* @__PURE__ */ React.createElement(Obj, { x: 1e3, y: 632, w: 240, h: 66, name: "Image", sub: "cat.png", tone: "blue", a: E2(t, 34.4) }), /* @__PURE__ */ React.createElement(Badge2, { x: 1120, y: 736, text: "not followed while marking", tone: "pull", a: E2(t, 40), fs: 17 }), /* @__PURE__ */ React.createElement(Callout, { x: 1290, y: 590, w: 534, tone: "pull", a: E2(t, 39), fs: 20, text: "Marking follows every field **except** `referent`. The GC notes the Reference on a list and decides about it after marking." }), /* @__PURE__ */ React.createElement(Callout, { x: 1290, y: 738, w: 534, tone: "flow", a: E2(t, 53), fs: 20, text: "An object's level is its **strongest** path. One strong path beats any number of weak ones." }), ladder.map(([l, tone], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: l }, /* @__PURE__ */ React.createElement(Box2, { x: 96 + i * 346, y: 866, w: 300, h: 56, label: l, sub: i < 4 ? "reachable" : "", tone, a: E2(t, 47 + i * 0.5), fs: 19, sfs: 17 }), i < 4 && /* @__PURE__ */ React.createElement(Txt2, { x: 96 + i * 346 + 323, y: 894, anchor: "center", mono: true, fs: 22, color: PAL2.ink3, a: E2(t, 47 + i * 0.5) }, "\u203A"))));
  }
  function SFourStrengths({ t }) {
    const R = [276, 386, 496, 606];
    const [hl, hA] = hlAt(t, [[1, 1], [7, 2], [9, 3], [11, 4], [19, 5], [38, 6]]);
    const heap = t < 19 ? 9 : t < 38 ? lerp2(9, 5, M(t, 19.5, 0.8)) : t < 51.5 ? lerp2(5, 61, lin(t, 38.5, 11.5)) : lerp2(61, 59, M(t, 52, 0.6));
    const cutC = M(t, 20, 0.6), goneC = M(t, 20.6, 0.8), goneD = M(t, 21.2, 0.8), cutD = M(t, 26, 0.6);
    const cutB = M(t, 52, 0.6), goneB = M(t, 52.6, 0.8);
    const slotX = (i) => 1070 + i * 300;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code, { x: 96, y: 196, w: 760, h: 290, title: "Strengths.java", a: E2(t, 0.4), fs: 17, lh: 30, hl, hlA: hA, lines: [
      "var queue = new ReferenceQueue<Image>();",
      'Image a = new Image("a.png");',
      'var b = new SoftReference<>(new Image("b.png"), queue);',
      'var c = new WeakReference<>(new Image("c.png"), queue);',
      'var d = new PhantomReference<>(new Image("d.png"), queue);',
      "System.gc();",
      "// then: allocate 1 MB blocks until b is cleared"
    ] }), /* @__PURE__ */ React.createElement(Console, { x: 96, y: 506, w: 760, h: 424, t, a: E2(t, 1), fs: 17, lh: 27, title: "terminal \xB7 JDK 17 \xB7 log trimmed", items: [
      { at: 15, text: "java -Xmx64m -Xlog:gc Strengths", kind: "cmd" },
      { at: 15.6, text: "phantom.get() = null" },
      { at: 19.6, text: "GC(0) Pause Full (System.gc()) 9M->5M(24M)", kind: "dim" },
      { at: 21, text: "after GC  : a=a.png  b=alive  c=cleared  d=cleared" },
      { at: 27, text: "  queue.poll() -> weak c", kind: "ok" },
      { at: 27.6, text: "  queue.poll() -> phantom d", kind: "ok" },
      { at: 45, text: "GC(13) Pause Full (G1 Compaction Pause) 59M->59M(64M)", kind: "dim" },
      { at: 47, text: "GC(17) Pause Full (G1 Compaction Pause) 61M->61M(64M)", kind: "dim" },
      { at: 52, text: "GC(18) Pause Full (G1 Compaction Pause) 61M->59M(64M)", kind: "ok" },
      { at: 53, text: "pressure  : soft b cleared after allocating 29 MB" },
      { at: 55, text: "  queue.poll() -> soft b", kind: "ok" },
      { at: 59, text: "a is still a.png (strong: never collected while reachable)" }
    ] }), /* @__PURE__ */ React.createElement(Region, { x: 900, y: 196, w: 200, h: 470, title: "main()", tone: "flow", a: E2(t, 1.6) }), ["a", "b", "c", "d"].map((n, i) => /* @__PURE__ */ React.createElement(Box2, { key: n, x: 916, y: R[i] - 30, w: 168, h: 60, label: n, sub: "local", tone: "flow", a: E2(t, [1.8, 7, 9, 11][i]), fs: 22, sfs: 17, glow: i === 0 ? pulse2(t, [59.5], 1.4) : 0 })), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1084, R[0]], [1586, R[0]]], draw: M(t, 2.2, 0.8), label: "strong", lx: 1330, ly: R[0] - 14, lfs: 17, glow: win(t, 59.5, 66) }), /* @__PURE__ */ React.createElement(Obj, { x: 1590, y: R[0] - 32, w: 234, h: 64, name: "a.png", sub: "1 MB", tone: "flow", a: E2(t, 2.8), glow: pulse2(t, [59.5], 1.4) }), [["b", "soft", "SoftReference", 7.3, cutB, goneB], ["c", "weak", "WeakReference", 9.3, cutC, goneC], ["d", "phantom", "PhantomReference", 11.3, cutD, goneD]].map(([n, k, title, at, cut, gone], j) => {
      const y = R[j + 1];
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: n }, /* @__PURE__ */ React.createElement(RArrow, { pts: [[1084, y], [1176, y]], draw: M(t, at, 0.4) }), /* @__PURE__ */ React.createElement(RefBox, { x: 1180, y: y - 36, w: 290, h: 72, kind: k, title, cleared: k === "phantom" ? t > 13.6 ? 1 : 0 : cut, a: E2(t, at + 0.3), glow: k === "phantom" ? pulse2(t, [13.8], 1.2) : 0, sub: k === "phantom" && t > 13.6 && t < 26 ? "get() \u2192 null" : void 0 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1470, y], [1586, y]], kind: k, draw: M(t, at + 0.6, 0.5), cut, label: k, lx: 1528, ly: y - 14, lfs: 17 }), /* @__PURE__ */ React.createElement(Obj, { x: 1590, y: y - 32, w: 234, h: 64, name: `${n}.png`, sub: "1 MB", tone: KIND[k].tone, a: E2(t, at + 0.9), gone }));
    }), /* @__PURE__ */ React.createElement(GcSweep, { t, at: 19, x: 1100, y: 196, w: 724, h: 470, label: "System.gc()" }), /* @__PURE__ */ React.createElement(GcSweep, { t, at: 44, dur: 1.6, x: 1100, y: 196, w: 724, h: 470, label: "young + full GCs", tone: "ink" }), /* @__PURE__ */ React.createElement(GcSweep, { t, at: 50.6, x: 1100, y: 196, w: 724, h: 470, label: "last-ditch full GC", tone: "bad" }), /* @__PURE__ */ React.createElement(Panel, { x: 900, y: 690, w: 924, h: 116, title: "ReferenceQueue<Image>", right: "poll() \xB7 remove()", tone: "violet", a: E2(t, 13.5) }), /* @__PURE__ */ React.createElement(Tok, { t, keys: [[26.2, 1325, R[2]], [27.4, slotX(0), 768]], text: "WeakReference c", tone: "blue", w: 270 }), /* @__PURE__ */ React.createElement(Tok, { t, keys: [[26.8, 1325, R[3]], [28, slotX(1), 768]], text: "PhantomReference d", tone: "violet", w: 270 }), /* @__PURE__ */ React.createElement(Tok, { t, keys: [[54, 1325, R[1]], [55.2, slotX(2), 768]], text: "SoftReference b", tone: "pull", w: 270 }), /* @__PURE__ */ React.createElement(Gauge, { x: 900, y: 826, w: 924, value: heap, max: 64, label: "heap \xB7 -Xmx64m", a: E2(t, 14) }), /* @__PURE__ */ React.createElement(Badge2, { x: 1362, y: 160, text: "memory pressure: allocating 1 MB blocks", tone: "bad", a: win(t, 38.5, 52), fs: 17 }));
  }
  function SStrengthTable({ t }) {
    const name = (k) => /* @__PURE__ */ React.createElement("span", { style: { color: KIND[k].color, font: `600 22px ${MONO2}` } }, k);
    const rows = [
      [name("strong"), "never, while strongly reachable", "the object", "everything normal"],
      [name("soft"), "when memory is short \xB7 all of them before an OOM", "object, or null", "memory-sensitive caches (poorly)"],
      [name("weak"), "at the next GC that sees it only weakly reachable", "object, or null", "canonical maps \xB7 metadata \xB7 listeners"],
      [name("phantom"), "after collection: enqueued (cleared too, Java 9+)", "always null", "post-mortem cleanup (Cleaner)"]
    ];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      Table,
      {
        x: 96,
        y: 210,
        cols: [190, 640, 250, 648],
        head: ["strength", "referent cleared\u2026", "get() returns", "use it for"],
        rows,
        a: E2(t, 0.5),
        mono: false,
        fs: 21,
        rh: 72,
        rowA: rows.map((_, i) => E2(t, [4, 9, 16, 22][i])),
        marks: { 0: ["flow", win(t, 4, 9)], 1: ["pull", win(t, 9, 16)], 2: ["blue", win(t, 16, 22)], 3: ["violet", win(t, 22, 28)] }
      }
    ), /* @__PURE__ */ React.createElement(Legend, { x: 130, y: 600, a: E2(t, 1.5), gap: 420, len: 150 }), /* @__PURE__ */ React.createElement(Txt2, { x: 96, y: 650, fs: 19, color: PAL2.ink3, mono: true, a: E2(t, 2) }, "strongest  \u203A  soft  \u203A  weak  \u203A  phantom  \u203A  weakest"), /* @__PURE__ */ React.createElement(Callout, { x: 96, y: 710, w: 1728, tone: "bad", a: E2(t, 28), title: "correcting the source note", fs: 21, text: "The GC does not clear them \u201Cin that order when it needs memory\u201D. Only **soft** references wait for memory pressure. A **weak** reference is cleared by any GC that finds its referent only weakly reachable, however much memory is free." }));
  }
  function SStrongestPath({ t }) {
    const Y = { soft: 266, img: 416, weak: 566, phantom: 706 };
    const [hl, hA] = hlAt(t, [[0.8, 0], [2, 1], [3, 2], [4, 3], [6, 4], [12.5, 5]]);
    const cut = M(t, 27.4, 0.6), gone = M(t, 28.2, 0.8);
    const level = t < 6.5 ? "strongly reachable" : t < 27.6 ? "softly reachable" : "";
    const qx = (i) => 1280 + i * 215;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code, { x: 96, y: 196, w: 720, h: 262, title: "SameObject.java", a: E2(t, 0.4), fs: 17, lh: 32, hl, hlA: hA, lines: [
      'Image img = new Image("cat.png");',
      "var soft    = new SoftReference<>(img, queue);",
      "var weak    = new WeakReference<>(img, queue);",
      "var phantom = new PhantomReference<>(img, queue);",
      "img = null;",
      "System.gc();   // later: memory pressure"
    ] }), /* @__PURE__ */ React.createElement(Console, { x: 96, y: 480, w: 720, h: 300, t, a: E2(t, 1), fs: 17, lh: 27, title: "terminal \xB7 JDK 17", items: [
      { at: 13, text: "java -Xmx64m SameObject", kind: "cmd" },
      { at: 15, text: "after System.gc(): soft=alive weak=alive phantom=alive" },
      { at: 16, text: "  queue.poll() -> null", kind: "dim" },
      { at: 28.4, text: "after pressure:    soft=cleared weak=cleared phantom=cleared" },
      { at: 32, text: "  queue.poll() -> soft", kind: "ok" },
      { at: 32.4, text: "  queue.poll() -> weak", kind: "ok" },
      { at: 32.8, text: "  queue.poll() -> phantom", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(Callout, { x: 96, y: 804, w: 720, tone: "pull", a: E2(t, 38), fs: 20, text: "Soft and weak references to one object are cleared **atomically**, in the same GC. Then the phantom is enqueued." }), /* @__PURE__ */ React.createElement(Region, { x: 880, y: 196, w: 210, h: 580, title: "main()", tone: "flow", a: E2(t, 1.2) }), ["soft", "img", "weak", "phantom"].map((n, i) => /* @__PURE__ */ React.createElement(Box2, { key: n, x: 896, y: Y[n] - 30, w: 178, h: 60, label: n, sub: "local", tone: "flow", a: E2(t, [2, 1.4, 3, 4][i]), fs: 21, sfs: 17 })), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1074, Y.img], [1556, Y.img]], draw: M(t, 1.8, 0.8), a: 1 - E2(t, 7, 0.8), label: "strong", lx: 1300, ly: Y.img - 14, lfs: 17 }), /* @__PURE__ */ React.createElement(Txt2, { x: 1300, y: Y.img + 14, anchor: "mid", mono: true, fs: 17, color: PAL2.bad, a: E2(t, 7.2) }, "img = null"), [["soft", "SoftReference", [[1440, Y.soft], [1500, Y.soft], [1500, 400], [1556, 400]], 2.2], ["weak", "WeakReference", [[1440, Y.weak], [1500, Y.weak], [1500, 450], [1556, 450]], 3.2], ["phantom", "PhantomReference", [[1440, Y.phantom], [1690, Y.phantom], [1690, 474]], 4.2]].map(([k, title, pts, at]) => /* @__PURE__ */ React.createElement(React.Fragment, { key: k }, /* @__PURE__ */ React.createElement(RArrow, { pts: [[1074, Y[k]], [1156, Y[k]]], draw: M(t, at, 0.4) }), /* @__PURE__ */ React.createElement(RefBox, { x: 1160, y: Y[k] - 36, w: 280, kind: k, title, cleared: k === "phantom" ? 0 : cut, a: E2(t, at + 0.2), sub: k === "phantom" ? cut > 0.5 ? "referent = null" : "get() \u2192 null" : void 0 }), /* @__PURE__ */ React.createElement(RArrow, { pts, kind: k, draw: M(t, at + 0.5, 0.6), cut, glow: k === "soft" ? win(t, 19, 26) : 0 }))), /* @__PURE__ */ React.createElement(Obj, { x: 1560, y: 380, w: 264, h: 90, name: "cat.png", sub: level, tone: t < 6.5 ? "flow" : "pull", a: E2(t, 1), gone, fs: 24 }), /* @__PURE__ */ React.createElement(Badge2, { x: 1692, y: 340, text: "weak waits: a soft path exists", tone: "pull", a: win(t, 19, 26.5), fs: 17 }), /* @__PURE__ */ React.createElement(GcSweep, { t, at: 12.8, x: 1100, y: 196, w: 724, h: 580, label: "System.gc()" }), /* @__PURE__ */ React.createElement(GcSweep, { t, at: 26.2, x: 1100, y: 196, w: 724, h: 580, label: "memory pressure", tone: "bad" }), /* @__PURE__ */ React.createElement(Panel, { x: 1160, y: 790, w: 664, h: 116, title: "ReferenceQueue", tone: "violet", a: E2(t, 4.5) }), [["soft", "pull"], ["weak", "blue"], ["phantom", "violet"]].map(([k, tone], i) => /* @__PURE__ */ React.createElement(Tok, { key: k, t, keys: [[31.6 + i * 0.4, 1300, Y[k]], [32.8 + i * 0.4, qx(i), 868]], text: k, tone, w: 196 })), /* @__PURE__ */ React.createElement(Txt2, { x: 1492, y: 862, anchor: "mid", mono: true, fs: 17, color: PAL2.ink3, a: win(t, 16, 31.5) }, "queue.poll() \u2192 null"));
  }
  function SSoftPolicy({ t }) {
    const AX0 = 130, AX1 = 880, sx = (s) => AX0 + clamp2(s, 0, 3) / 3 * (AX1 - AX0);
    const grace = t < 23 ? 63 : 0.63;
    const bars = [[4, 200, 34], [8, 200, 35.5], [12, 200, 37], [16, 0, 39], [20, 0, 40]];
    const BX = 1070, BY = 600, BH = 300;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code, { x: 96, y: 196, w: 820, h: 140, title: "javap -p java.lang.ref.SoftReference", a: E2(t, 4.5), fs: 19, lh: 36, lines: ["private static long clock;   // advanced by every GC", "private long timestamp;      // = clock at the last get()"] }), /* @__PURE__ */ React.createElement(Box2, { x: 96, y: 356, w: 820, h: 110, label: "keep if  clock \u2212 timestamp \u2264 freeMB \xD7 SoftRefLRUPolicyMSPerMB", sub: "freeMB = max heap \u2212 used at last GC  \xB7  factor default: 1000 ms", tone: "pull", a: E2(t, 12), fs: 20, sfs: 17, glow: pulse2(t, [12.2], 1.2) }), /* @__PURE__ */ React.createElement(Panel, { x: 96, y: 486, w: 820, h: 180, title: "grace window for an idle soft referent", a: E2(t, 19.5) }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: AX0, top: 590, width: AX1 - AX0, height: 2, background: PAL2.line2, opacity: E2(t, 19.5) } }), [0, 1, 2, 3].map((s) => /* @__PURE__ */ React.createElement(Txt2, { key: s, x: sx(s), y: 604, anchor: "mid", mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 19.5) }, s, " s")), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: AX0, top: 552, width: sx(grace) - AX0, height: 30, borderRadius: 6, background: hexA2(t < 23 ? PAL2.flow : PAL2.bad, 0.4), border: `2px solid ${t < 23 ? PAL2.flow : PAL2.bad}`, opacity: E2(t, 20), transition: "none" } }), /* @__PURE__ */ React.createElement(Txt2, { x: t < 23 ? AX1 - 10 : sx(grace) + 12, y: 556, anchor: t < 23 ? "right" : void 0, mono: true, fs: 17, color: PAL2.ink, a: E2(t, 20.4) }, t < 23 ? "63 MB \xD7 1000 ms = 63 s \u2192" : "63 MB \xD7 10 ms = 0.63 s"), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: sx(1.5) - 1, top: 530, width: 3, height: 70, background: PAL2.pull, opacity: E2(t, 21) } }), /* @__PURE__ */ React.createElement(Txt2, { x: sx(1.5), y: 628, anchor: "mid", mono: true, fs: 17, color: PAL2.pull, a: E2(t, 21) }, "idle 1.5 s"), /* @__PURE__ */ React.createElement(Console, { x: 96, y: 684, w: 820, h: 250, t, a: E2(t, 26.5), fs: 17, lh: 27, title: "terminal \xB7 JDK 17 \xB7 SoftClock", items: [
      { at: 27, text: "java -Xmx64m -XX:SoftRefLRUPolicyMSPerMB=<f> SoftClock", kind: "cmd" },
      { at: 27.5, text: "SoftRefLRUPolicyMSPerMB=1000", kind: "dim" },
      { at: 27.8, text: "soft ref after 1.5 s idle + GC: alive", kind: "ok" },
      { at: 28.6, text: "SoftRefLRUPolicyMSPerMB=10", kind: "dim" },
      { at: 28.9, text: "soft ref after 1.5 s idle + GC: cleared", kind: "err" },
      { at: 29.7, text: "SoftRefLRUPolicyMSPerMB=0", kind: "dim" },
      { at: 30, text: "soft ref after 1.5 s idle + GC: cleared", kind: "err" }
    ] }), /* @__PURE__ */ React.createElement(Panel, { x: 980, y: 196, w: 844, h: 470, title: "soft cache: 200 thumbnails", right: "-Xmx48m", a: E2(t, 33) }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 1030, top: BY, width: 760, height: 2, background: PAL2.line2, opacity: E2(t, 33) } }), bars.map(([mb, v, at], i) => {
      const a = E2(t, at), h = v / 200 * BH * E2(t, at, 0.5);
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: mb }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: BX + i * 145, top: BY - h, width: 100, height: h, borderRadius: "8px 8px 0 0", background: hexA2(PAL2.pull, 0.45), border: `2px solid ${PAL2.pull}`, boxSizing: "border-box", opacity: a } }), /* @__PURE__ */ React.createElement(Txt2, { x: BX + i * 145 + 50, y: BY - h - 34, anchor: "mid", mono: true, fs: 22, weight: 600, color: v ? PAL2.pull : PAL2.bad, a }, v), /* @__PURE__ */ React.createElement(Txt2, { x: BX + i * 145 + 50, y: BY + 12, anchor: "mid", mono: true, fs: 17, color: PAL2.ink2, a: E2(t, 33.5) }, mb, " MB"));
    }), /* @__PURE__ */ React.createElement(Txt2, { x: 1030, y: 252, mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 33.5) }, "entries still alive, as the app needs more memory"), /* @__PURE__ */ React.createElement(Badge2, { x: 1630, y: 340, text: "200 \u2192 0 in one GC", tone: "bad", a: POP(t, 39.5), fs: 17 }), /* @__PURE__ */ React.createElement(Console, { x: 980, y: 684, w: 844, h: 250, t, a: E2(t, 33), fs: 17, lh: 27, title: "terminal \xB7 JDK 17 \xB7 Cache soft", items: [
      { at: 33.5, text: "soft: cached 200 thumbnails (~20 MB)" },
      { at: 34, text: "  app holds 4 MB -> cache entries still alive: 200" },
      { at: 35.5, text: "  app holds 8 MB -> cache entries still alive: 200" },
      { at: 37, text: "  app holds 12 MB -> cache entries still alive: 200" },
      { at: 39, text: "  app holds 16 MB -> cache entries still alive: 0", kind: "err" },
      { at: 40, text: "  app holds 20 MB -> cache entries still alive: 0", kind: "err" }
    ] }), /* @__PURE__ */ React.createElement(Callout, { x: 1e3, y: 400, w: 500, tone: "flow", a: E2(t, 46), fs: 19, text: "Full or empty, never in between. Use a **bounded** cache (Caffeine) instead." }));
  }
  function SWeakOldGen({ t }) {
    const sweeps = Array.from({ length: 13 }, (_, k) => 13.9 + k * 0.5);
    const ygc = sweeps.filter((s) => t >= s).length;
    const cutY = M(t, 14.1, 0.5), goneY = M(t, 14.5, 0.6), cutO = M(t, 27.8, 0.5), goneO = M(t, 28.3, 0.6);
    const log = [];
    const young = [["2M->1M(10M)"], ["4M->0M(10M)"], ["4M->1M(10M)"], ["5M->1M(37M)"], ["22M->1M(37M)"], ["22M->1M(37M)"], ["22M->1M(37M)"], ["22M->1M(37M)"], ["22M->1M(40M)"], ["24M->1M(40M)"], ["24M->1M(40M)"], ["24M->1M(40M)"], ["24M->1M(40M)"]];
    young.forEach(([s], k) => log.push({ at: sweeps[k] + 0.2, text: `GC(${k + 1}) Pause Young (Normal) (G1 Evacuation Pause) ${s}`, kind: "dim" }));
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(RefBox, { x: 180, y: 196, w: 290, h: 68, kind: "weak", title: "wYoung", sub: "WeakReference", a: E2(t, 6.5), cleared: cutY }), /* @__PURE__ */ React.createElement(RefBox, { x: 720, y: 196, w: 290, h: 68, kind: "weak", title: "wOld", sub: "WeakReference", a: E2(t, 7), cleared: cutO }), /* @__PURE__ */ React.createElement(Panel, { x: 96, y: 300, w: 1e3, h: 330, title: "heap \xB7 G1", a: E2(t, 0.5) }), /* @__PURE__ */ React.createElement(Region, { x: 120, y: 360, w: 440, h: 250, title: "young", tone: "flow", a: E2(t, 1), glow: win(t, 13.8, 20.4) * 0.6 }), /* @__PURE__ */ React.createElement(Region, { x: 590, y: 360, w: 480, h: 250, title: "old", tone: "violet", a: E2(t, 1.4), glow: pulse2(t, [27], 1.5) }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[325, 264], [325, 446]], kind: "weak", draw: M(t, 7.2, 0.6), cut: cutY }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[865, 264], [865, 446]], kind: "weak", draw: M(t, 7.6, 0.6), cut: cutO }), /* @__PURE__ */ React.createElement(Obj, { x: 200, y: 450, w: 250, h: 70, name: "new Object()", sub: "young", tone: "flow", a: E2(t, 6.4), gone: goneY }), /* @__PURE__ */ React.createElement(Obj, { x: 735, y: 450, w: 260, h: 70, name: "new Object()", sub: "old \xB7 promoted", tone: "violet", a: E2(t, 6), gone: goneO, glow: win(t, 20.5, 27) * 0.7 }), /* @__PURE__ */ React.createElement(Txt2, { x: 140, y: 570, mono: true, fs: 18, color: PAL2.flow, a: E2(t, 13.9) }, "young GCs: ", ygc), /* @__PURE__ */ React.createElement(Txt2, { x: 610, y: 570, mono: true, fs: 18, color: PAL2.violet, a: win(t, 15, 27) }, "not scanned by young GCs"), sweeps.map((s, k) => /* @__PURE__ */ React.createElement(GcSweep, { key: k, t, at: s, dur: 0.42, x: 120, y: 360, w: 440, h: 250, label: "young GC", tone: "flow" })), /* @__PURE__ */ React.createElement(GcSweep, { t, at: 26.6, dur: 1.3, x: 96, y: 300, w: 1e3, h: 330, label: "full GC", tone: "bad" }), /* @__PURE__ */ React.createElement(Callout, { x: 96, y: 660, w: 1e3, tone: "pull", a: E2(t, 33), fs: 21, text: "\u201CNext GC\u201D really means **the next GC that collects the referent\u2019s region**. G1\u2019s young GCs never look at old regions; an old referent waits for a mixed or full GC." }), /* @__PURE__ */ React.createElement(Console, { x: 1140, y: 196, w: 684, h: 734, t, a: E2(t, 5.5), fs: 17, lh: 26, title: "terminal \xB7 JDK 17 \xB7 -Xlog:gc (trimmed)", items: [
      { at: 6, text: "java -Xmx64m -Xlog:gc OldWeak", kind: "cmd" },
      { at: 7, text: "GC(0) Pause Full (System.gc()) 1M->0M(10M)", kind: "dim" },
      ...log,
      { at: 21, text: "after young GCs: young referent cleared, old referent alive", kind: "ok" },
      { at: 27.5, text: "GC(14) Pause Full (System.gc()) 21M->1M(10M)", kind: "dim" },
      { at: 29, text: "after full GC:   old referent cleared", kind: "ok" }
    ] }));
  }

  // src/topics/8.7/scenes2.jsx
  var {
    PAL: PAL3,
    MOTION: MOTION3,
    lin: lin2,
    lerp: lerp3,
    win: win2,
    pulse: pulse3,
    hlAt: hlAt2,
    clamp: clamp3,
    hexA: hexA3,
    MONO: MONO3,
    SANS: SANS3,
    Txt: Txt3,
    Panel: Panel2,
    Box: Box3,
    Code: Code2,
    Console: Console2,
    HArrow: HArrow2,
    VArrow: VArrow2,
    Arrow: Arrow2,
    Dot: Dot2,
    Card: Card2,
    Badge: Badge3,
    Callout: Callout2,
    Mark: Mark2,
    toneColor: toneColor3
  } = window.AN;
  var E3 = MOTION3.enter;
  var M2 = MOTION3.move;
  var POP2 = MOTION3.pop;
  function SRefQueue({ t }) {
    const a1 = 1 - E3(t, 28, 0.6), a2 = E3(t, 29);
    const states = [
      ["active", "referent set \xB7 checked by each GC", "blue", 5.5],
      ["pending", "referent cleared \xB7 VM pending list", "pull", 11],
      ["enqueued", "on your ReferenceQueue", "violet", 18],
      ["inactive", "handed to your code \xB7 done", "dim", 24.5]
    ];
    const sx = (i) => 150 + i * 440;
    const cur = states.filter((s) => t >= s[3]).length - 1;
    const R = { sea: 250, sun: 370, sky: 490 };
    const gone = M2(t, 39.2, 0.7), seaRefA = 1 - E3(t, 43, 0.4), sunRefGone = M2(t, 40, 0.8);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, a1 > 0.01 && /* @__PURE__ */ React.createElement(React.Fragment, null, states.map(([l, sub, tone, at], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: l }, /* @__PURE__ */ React.createElement(Box3, { x: sx(i), y: 290, w: 300, h: 130, label: l, sub, tone, a: a1 * E3(t, at - 0.3), fs: 30, sfs: 17, glow: cur === i ? 0.7 : 0 }), i < 3 && /* @__PURE__ */ React.createElement(HArrow2, { x1: sx(i) + 306, x2: sx(i) + 434, y: 355, a: a1 * E3(t, states[i + 1][3] - 0.5), color: PAL3.ink2, label: ["GC", "handler", "poll()"][i], lfs: 17 }))), /* @__PURE__ */ React.createElement(Txt3, { x: sx(1) + 150, y: 436, anchor: "mid", mono: true, fs: 17, color: PAL3.ink3, a: a1 * E3(t, 12) }, "linked through `discovered`"), /* @__PURE__ */ React.createElement(Txt3, { x: sx(2) + 150, y: 436, anchor: "mid", mono: true, fs: 17, color: PAL3.ink3, a: a1 * E3(t, 19) }, "linked through `next`"), /* @__PURE__ */ React.createElement(Tok, { t, keys: [[5.6, sx(0) + 150, 500], [11.2, sx(0) + 150, 500], [12.2, sx(1) + 150, 500], [18.3, sx(1) + 150, 500], [19.3, sx(2) + 150, 500], [24.8, sx(2) + 150, 500], [25.8, sx(3) + 150, 500]], text: "WeakReference c", tone: "blue", w: 260, until: 28 }), /* @__PURE__ */ React.createElement(Obj, { x: sx(0) + 40, y: 560, w: 220, h: 60, name: "c.png", tone: "blue", a: a1 * E3(t, 6), gone: M2(t, 11.4, 0.6) }), /* @__PURE__ */ React.createElement(Console2, { x: 300, y: 660, w: 1320, h: 190, t, a: a1 * E3(t, 17.5), fs: 17, lh: 30, title: "jcmd <pid> Thread.print \xB7 JDK 17 (trimmed)", items: [
      { at: 18, text: '"Reference Handler" #2 daemon prio=10 os_prio=31 ... waiting on condition', kind: "ok" },
      { at: 18.4, text: '"Finalizer" #3 daemon prio=8 os_prio=31 ... in Object.wait()' },
      { at: 18.8, text: '"Common-Cleaner" #13 daemon prio=8 os_prio=31 ... in Object.wait()' }
    ] })), a2 > 0.01 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 196, w: 860, h: 428, title: "Tracker.java", a: a2, fs: 17, lh: 30, hl: t > 44 ? 9 : 8, hlA: win2(t, 38, 50), lines: [
      "class TextureRef extends PhantomReference<Texture> {",
      "    final long handle;          // copied out: get() is null",
      "    TextureRef(Texture t, ReferenceQueue<Texture> q, long h) {",
      "        super(t, q); handle = h; }",
      "}",
      "static final Set<TextureRef> LIVE = new HashSet<>();",
      "// cleanup thread:",
      "while (true) {",
      "    var r = (TextureRef) QUEUE.remove();   // blocks",
      "    freeGpu(r.handle);  LIVE.remove(r);",
      "}"
    ] }), /* @__PURE__ */ React.createElement(Console2, { x: 96, y: 648, w: 860, h: 200, t, a: a2, fs: 17, lh: 27, title: "terminal \xB7 JDK 17", items: [
      { at: 37, text: "java Tracker", kind: "cmd" },
      { at: 38.5, text: "System.gc()" },
      { at: 45, text: "  cleanup thread: freeing GPU handle of sea.png  (get() = null)", kind: "ok" },
      { at: 51, text: "sky.png still in use: sky.png; sun.png was never reported", kind: "err" }
    ] }), /* @__PURE__ */ React.createElement(Box3, { x: 1e3, y: 210, w: 220, h: 300, label: "LIVE", sub: "static Set", tone: "flow", a: a2 * E3(t, 30) }), /* @__PURE__ */ React.createElement(Box3, { x: 1e3, y: 560, w: 220, h: 64, label: "sky", sub: "local", tone: "flow", a: a2 * E3(t, 30.4), fs: 20, sfs: 17 }), [["sea", 30.6, seaRefA], ["sun", 31, 1 - 0.7 * sunRefGone], ["sky", 31.4, 1]].map(([n, at, ra]) => /* @__PURE__ */ React.createElement(React.Fragment, { key: n }, n !== "sun" && /* @__PURE__ */ React.createElement(RArrow, { pts: [[1220, R[n]], [1286, R[n]]], draw: M2(t, at, 0.4), a: a2 * ra }), /* @__PURE__ */ React.createElement(RefBox, { x: 1290, y: R[n] - 34, w: 270, h: 68, kind: "phantom", title: "TextureRef", sub: `${n}.png \xB7 handle`, a: a2 * E3(t, at + 0.2) * ra }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1560, R[n]], [1626, R[n]]], kind: "phantom", draw: M2(t, at + 0.4, 0.4), a: a2 * ra }), /* @__PURE__ */ React.createElement(Obj, { x: 1630, y: R[n] - 32, w: 194, h: 64, name: `${n}.png`, sub: "Texture", tone: n === "sky" ? "flow" : "violet", a: a2 * E3(t, at + 0.6), gone: n === "sky" ? 0 : gone }))), /* @__PURE__ */ React.createElement(Txt3, { x: 1425, y: R.sun + 40, anchor: "mid", mono: true, fs: 17, color: PAL3.bad, a: a2 * E3(t, 32) }, "nothing holds this Reference"), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1220, 592], [1590, 592], [1590, 512], [1626, 512]], draw: M2(t, 31.6, 0.6), a: a2 }), /* @__PURE__ */ React.createElement(Box3, { x: 1290, y: 650, w: 534, h: 80, label: "texture-cleanup thread", sub: t > 46.4 ? "freed GPU handle of sea.png" : "blocked in QUEUE.remove()", tone: "pull", a: a2 * E3(t, 37.5), glow: pulse3(t, [46.4], 1.6), fs: 20 }), /* @__PURE__ */ React.createElement(Panel2, { x: 1290, y: 756, w: 534, h: 110, title: "QUEUE", tone: "violet", a: a2 * E3(t, 37.5) }), /* @__PURE__ */ React.createElement(Tok, { t, keys: [[43, 1425, R.sea], [44.2, 1557, 828], [45.4, 1557, 828], [46.2, 1557, 690]], text: "TextureRef sea", tone: "violet", w: 250, until: 46.2 }), /* @__PURE__ */ React.createElement(GcSweep, { t, at: 38.4, x: 1e3, y: 200, w: 824, h: 440, label: "GC" }), /* @__PURE__ */ React.createElement(Badge3, { x: 1425, y: R.sun - 50, text: "the Reference itself was collected", tone: "bad", a: a2 * E3(t, 51), fs: 17 }), /* @__PURE__ */ React.createElement(Callout2, { x: 96, y: 866, w: 860, tone: "pull", a: E3(t, 57), fs: 19, text: "Keep Reference objects **strongly reachable** until they are processed." })));
  }
  function EntryBox({ x, y, w = 520, h = 130, a, stale = 0, glow = 0, n }) {
    if (a <= 5e-3) return null;
    const s = stale > 0.5;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Box3, { x, y, w, h, tone: s ? "bad" : "blue", dashed: s, a, glow }), /* @__PURE__ */ React.createElement(Txt3, { x: x + 20, y: y + 12, mono: true, fs: 18, weight: 600, color: PAL3.blue, a }, "Entry extends WeakReference"), /* @__PURE__ */ React.createElement(Txt3, { x: x + w - 20, y: y + 14, anchor: "right", mono: true, fs: 17, color: PAL3.violet, a }, "queue = map's queue"), /* @__PURE__ */ React.createElement(Txt3, { x: x + 20, y: y + 50, mono: true, fs: 18, color: PAL3.ink2, a }, "referent (key)"), /* @__PURE__ */ React.createElement(Txt3, { x: x + 210, y: y + 50, mono: true, fs: 18, color: s ? PAL3.bad : PAL3.ink, a }, s ? "= null" : `\u2192 Page${n}`), /* @__PURE__ */ React.createElement(Txt3, { x: x + 20, y: y + 92, mono: true, fs: 18, color: PAL3.ink2, a }, "value"), /* @__PURE__ */ React.createElement(Txt3, { x: x + 210, y: y + 92, mono: true, fs: 18, color: PAL3.ink, a }, "\u2192 Thumbnail (strong)"));
  }
  function SWeakMapVanish({ t }) {
    const rows = [{ y: 280, n: 1, cell: 1 }, { y: 470, n: 2, cell: 4 }];
    const k = (y) => y + 62, v = (y) => y + 104;
    const dropP1 = E3(t, 19.4, 0.6), cutK = M2(t, 25.4, 0.5), goneP1 = M2(t, 25.8, 0.7);
    const stale = t > 26 ? 1 : 0, expunged = E3(t, 40, 0.8), goneThumb = M2(t, 45.5, 0.8);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel2, { x: 96, y: 200, w: 940, h: 560, title: "WeakHashMap<Page, Thumbnail>", right: "table", tone: "blue", a: E3(t, 0.5) }), Array.from({ length: 6 }, (_, i) => {
      const used = rows.some((r) => r.cell === i) && !(i === 1 && expunged > 0.5);
      return /* @__PURE__ */ React.createElement(Box3, { key: i, x: 120, y: 270 + i * 58, w: 70, h: 50, label: used ? "\u25CF" : "", tone: used ? "blue" : void 0, a: E3(t, 0.8 + i * 0.05), fs: 18 });
    }), rows.map((r, j) => {
      const ea = E3(t, 1.5 + j) * (j === 0 ? 1 - expunged : 1);
      const cy = 270 + r.cell * 58 + 25;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: r.n }, /* @__PURE__ */ React.createElement(RArrow, { pts: [[190, cy], [256, cy]], draw: M2(t, 1.6 + j, 0.4), a: j === 0 ? 1 - expunged : 1 }), /* @__PURE__ */ React.createElement(EntryBox, { x: 260, y: r.y, a: ea, n: r.n, stale: j === 0 ? stale : 0, glow: j === 0 ? win2(t, 31, 38) : pulse3(t, [7.2], 1.2) }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[780, k(r.y)], [1096, k(r.y)]], kind: "weak", draw: M2(t, 7.5 + j * 0.3, 0.6), cut: j === 0 ? cutK : 0, a: j === 0 ? 1 - expunged : 1, label: "weak", lx: 940, ly: k(r.y) - 12, lfs: 17 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[780, v(r.y)], [1376, v(r.y)]], draw: M2(t, 8.1 + j * 0.3, 0.6), a: j === 0 ? 1 - expunged : 1, glow: j === 0 ? win2(t, 31, 38) : 0 }), /* @__PURE__ */ React.createElement(Obj, { x: 1100, y: k(r.y) - 26, w: 220, h: 52, name: `Page${r.n}`, tone: "blue", a: E3(t, 2 + j), gone: j === 0 ? goneP1 : 0, fs: 20 }), /* @__PURE__ */ React.createElement(Obj, { x: 1380, y: v(r.y) - 26, w: 250, h: 52, name: "Thumbnail", sub: "", tone: "flow", a: E3(t, 2.3 + j), gone: j === 0 ? goneThumb : 0, fs: 19, glow: j === 0 ? win2(t, 31, 38) : 0, ghostSub: "" }), /* @__PURE__ */ React.createElement(Box3, { x: 1680, y: k(r.y) - 26, w: 144, h: 52, label: `p${r.n}`, tone: "flow", a: E3(t, 2.6 + j) * (j === 0 ? 1 - 0.6 * dropP1 : 1), strike: j === 0 && dropP1 > 0.5, fs: 20 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1676, k(r.y)], [1324, k(r.y)]], draw: M2(t, 2.8 + j, 0.5), a: j === 0 ? 1 - dropP1 : 1 }));
    }), /* @__PURE__ */ React.createElement(Txt3, { x: 1752, y: k(280) + 32, anchor: "mid", mono: true, fs: 17, color: PAL3.bad, a: E3(t, 19.6) }, "p1 = null"), /* @__PURE__ */ React.createElement(Region, { x: 120, y: 636, w: 890, h: 100, title: "queue \xB7 private ReferenceQueue", tone: "violet", a: E3(t, 13.5) }), /* @__PURE__ */ React.createElement(Tok, { t, keys: [[26.4, 520, 345], [27.6, 560, 700], [39.4, 560, 700]], text: "Entry (Page1)", tone: "bad", w: 230, until: 39.6 }), /* @__PURE__ */ React.createElement(Badge3, { x: 860, y: 690, text: "size() \u2192 expungeStaleEntries()", tone: "pull", a: win2(t, 38.6, 50), fs: 17 }), /* @__PURE__ */ React.createElement(GcSweep, { t, at: 24.6, x: 1040, y: 200, w: 784, h: 420, label: "GC" }), /* @__PURE__ */ React.createElement(Console2, { x: 96, y: 780, w: 1728, h: 160, t, a: E3(t, 30.5), fs: 17, lh: 27, title: "terminal \xB7 JDK 17 \xB7 Expunge.java (reads WeakHashMap fields via reflection)", items: [
      { at: 31, text: "java --add-opens java.base/java.util=ALL-UNNAMED Expunge", kind: "cmd" },
      { at: 32, text: "after GC, before touching the map: internal size field = 2, table slots in use = 2", kind: "err" },
      { at: 40.2, text: "m.size() = 1   <- expungeStaleEntries() ran inside size()", kind: "ok" },
      { at: 45.5, text: "after size(): internal size field = 1, table slots in use = 1" }
    ] }));
  }
  function SWeakMapTraps({ t }) {
    const P = [96, 680, 1264];
    const live = [[4, 19], [19, 26], [26, 48]];
    const cutL = M2(t, 33.4, 0.5), goneL = M2(t, 33.8, 0.6);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, [["1 \xB7 value points at its key", "bad"], ["2 \xB7 string literal keys", "bad"], ["3 \xB7 weak listener registry", "bad"]].map(([title, tone], i) => /* @__PURE__ */ React.createElement(Panel2, { key: i, x: P[i], y: 196, w: 560, h: 734, title, tone: win2(t, live[i][0], live[i][1]) > 0.5 ? "pull" : void 0, glow: win2(t, live[i][0], live[i][1]) * 0.6, a: E3(t, [4, 19, 26][i] - 0.5) })), /* @__PURE__ */ React.createElement(Box3, { x: 116, y: 262, w: 200, h: 64, label: "Entry", tone: "blue", a: E3(t, 4.5), fs: 20 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[316, 294], [436, 294]], kind: "weak", draw: M2(t, 5, 0.5), label: "key", lx: 376, ly: 282, lfs: 17 }), /* @__PURE__ */ React.createElement(Obj, { x: 440, y: 262, w: 196, h: 64, name: "Page3", tone: t > 12 ? "bad" : "blue", a: E3(t, 5.2), glow: win2(t, 9, 19) * 0.8 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[216, 326], [216, 396]], draw: M2(t, 5.6, 0.4), label: "value", lx: 262, ly: 366, lfs: 17 }), /* @__PURE__ */ React.createElement(Obj, { x: 116, y: 400, w: 300, h: 64, name: "BadThumbnail", tone: "flow", a: E3(t, 5.8) }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[416, 432], [538, 432], [538, 330]], kind: "bad", draw: M2(t, 7, 0.6), label: "page field", lx: 480, ly: 458, lfs: 17, glow: win2(t, 9, 19) }), /* @__PURE__ */ React.createElement(Console2, { x: 116, y: 500, w: 520, h: 180, t, a: E3(t, 11), fs: 17, lh: 27, title: "terminal \xB7 JDK 17", items: [{ at: 11.5, text: "java Thumbs", kind: "cmd" }, { at: 12, text: "value refers to key: after gc,", kind: "err" }, { at: 12.2, text: "  size = 1  keys = [Page3]", kind: "err" }] }), /* @__PURE__ */ React.createElement(Code2, { x: 116, y: 700, w: 520, h: 130, title: "fix", a: E3(t, 15), fs: 17, lh: 30, lines: ["record Thumbnail(byte[] px) {}  // no key inside", "// or hold the key weakly inside the value"] }), /* @__PURE__ */ React.createElement(Box3, { x: 700, y: 262, w: 230, h: 64, label: "string table", sub: "held by the JVM", tone: "flow", a: E3(t, 19.5), fs: 19, sfs: 17 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[930, 294], [986, 294]], draw: M2(t, 20, 0.4) }), /* @__PURE__ */ React.createElement(Obj, { x: 990, y: 262, w: 230, h: 64, name: '"logo.png"', sub: "interned literal", tone: "pull", a: E3(t, 20.2), sfs: 17 }), /* @__PURE__ */ React.createElement(Box3, { x: 700, y: 400, w: 230, h: 64, label: "Entry", tone: "blue", a: E3(t, 20.6), fs: 20 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[930, 432], [1105, 432], [1105, 330]], kind: "weak", draw: M2(t, 21, 0.6), label: "key", lx: 1018, ly: 420, lfs: 17 }), /* @__PURE__ */ React.createElement(Console2, { x: 700, y: 500, w: 520, h: 180, t, a: E3(t, 22), fs: 17, lh: 27, title: "terminal \xB7 JDK 17", items: [{ at: 22.5, text: "java Thumbs", kind: "cmd" }, { at: 23, text: "string literal key: after gc, size = 1", kind: "err" }] }), /* @__PURE__ */ React.createElement(Code2, { x: 700, y: 700, w: 520, h: 130, title: "fix", lang: "plain", a: E3(t, 24), fs: 17, lh: 30, lines: ["use keys you create and drop:", 'new Page(\u2026), not "logo.png"'] }), /* @__PURE__ */ React.createElement(Obj, { x: 1284, y: 262, w: 230, h: 64, name: "ImageViewer", sub: "alive \xB7 open", tone: "flow", a: E3(t, 26.5), sfs: 17 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1514, 294], [1556, 294]], draw: M2(t, 27, 0.3) }), /* @__PURE__ */ React.createElement(Obj, { x: 1560, y: 262, w: 244, h: 64, name: "\u03BB onTheme", sub: "held by a field", tone: "flow", a: E3(t, 27.2), sfs: 17 }), /* @__PURE__ */ React.createElement(Box3, { x: 1284, y: 400, w: 230, h: 64, label: "registry", sub: "WeakHashMap", tone: "blue", a: E3(t, 27.6), fs: 20, sfs: 17 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1514, 420], [1536, 420], [1536, 340], [1600, 340], [1600, 330]], kind: "weak", draw: M2(t, 28, 0.5) }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1514, 444], [1556, 444]], kind: "weak", draw: M2(t, 28.4, 0.4), cut: cutL }), /* @__PURE__ */ React.createElement(Obj, { x: 1560, y: 412, w: 244, h: 64, name: "\u03BB inline", sub: "held only by the map", tone: "pull", a: E3(t, 28.6), gone: goneL, sfs: 17 }), /* @__PURE__ */ React.createElement(GcSweep, { t, at: 32.6, x: 1264, y: 240, w: 560, h: 250, label: "GC" }), /* @__PURE__ */ React.createElement(Console2, { x: 1284, y: 500, w: 520, h: 180, t, a: E3(t, 33), fs: 17, lh: 27, title: "terminal \xB7 JDK 17", items: [
      { at: 33.5, text: "java WeakRegistry", kind: "cmd" },
      { at: 34, text: "registered: 2" },
      { at: 34.5, text: "after gc:   1   (viewer A is still alive and open)", kind: "err" },
      { at: 35, text: "  viewer A repaints for dark" }
    ] }), /* @__PURE__ */ React.createElement(Code2, { x: 1284, y: 700, w: 520, h: 130, title: "fix", a: E3(t, 40), fs: 17, lh: 30, lines: ["final Consumer<String> onTheme = \u2026;", "registry.put(onTheme, true);  // owner holds it"] }), /* @__PURE__ */ React.createElement(Txt3, { x: 960, y: 870, anchor: "mid", fs: 20, color: PAL3.ink2, a: E3(t, 42) }, "and in every case: entries vanish whenever the GC runs, so never count on one still being there"));
  }
  function SFinalize({ t }) {
    const [hl, hA] = hlAt2(t, [[6, 6], [13, 8], [13.8, 9], [32, 3], [46, 10], [46.8, 11]]);
    const phases = [["phase 1", "reconsider soft", 15], ["phase 2", "clear soft & weak", 19], ["phase 3", "keep finalizable alive", 25], ["phase 4", "notify phantom", 29]];
    const ph = t >= 13.6 && t < 31 ? phases.filter((p) => t >= p[2]).length - 1 : -1;
    const zTone = t < 13 ? "flow" : t < 25 ? "bad" : t < 32.5 ? "pull" : "flow";
    const zSub = t < 13 ? "cat.png \xB7 reachable" : t < 25 ? "unreachable" : t < 32.5 ? "kept alive for finalize()" : t < 46 ? "resurrected" : "unreachable again";
    const goneZ = M2(t, 47.6, 0.8), cutW = M2(t, 19.6, 0.5);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 196, w: 800, h: 428, title: "Zombie.java", a: E3(t, 0.4), fs: 17, lh: 30, hl, hlA: hA, lines: [
      "class Zombie {",
      "    static Zombie saved;              // a GC root",
      "    @Override protected void finalize() {",
      "        saved = this;                 // resurrection",
      "    }",
      "}",
      'var z = new Zombie("cat.png");',
      "var weak = new WeakReference<>(z);",
      "z = null;",
      "System.gc();                          // GC #1",
      "saved = null;",
      "System.gc();                          // GC #2"
    ] }), /* @__PURE__ */ React.createElement(Console2, { x: 96, y: 644, w: 800, h: 286, t, a: E3(t, 1), fs: 17, lh: 27, title: "terminal \xB7 JDK 17", items: [
      { at: 1.2, text: "javac Zombie.java", kind: "cmd" },
      { at: 1.6, text: "Note: Zombie.java uses or overrides a deprecated API.", kind: "dim" },
      { at: 13, text: "java Zombie", kind: "cmd" },
      { at: 13.8, text: "GC #1" },
      { at: 32.6, text: "  finalize() running on thread: Finalizer", kind: "ok" },
      { at: 39.5, text: "  saved = cat.png, weak ref cleared", kind: "ok" },
      { at: 46.6, text: "GC #2" },
      { at: 48.4, text: "  saved = null   (finalize() never runs twice)" }
    ] }), phases.map(([l, s, at], i) => /* @__PURE__ */ React.createElement(Box3, { key: l, x: 950 + i * 218, y: 196, w: 208, h: 70, label: l, sub: s, tone: ph === i ? "pull" : "ink", glow: ph === i ? 0.8 : 0, a: E3(t, 13.4 + i * 0.15), fs: 18, sfs: 17 })), /* @__PURE__ */ React.createElement(Txt3, { x: 950, y: 276, mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 14) }, "HotSpot reference processing, from -Xlog:gc+phases+ref=debug"), /* @__PURE__ */ React.createElement(Box3, { x: 950, y: 330, w: 250, h: 72, label: "Zombie.saved", sub: "static field \xB7 root", tone: "flow", a: E3(t, 1.5), fs: 19, sfs: 17 }), /* @__PURE__ */ React.createElement(Box3, { x: 950, y: 466, w: 250, h: 64, label: "z", sub: "local", tone: "flow", a: E3(t, 2), strike: t > 13, fs: 20, sfs: 17 }), /* @__PURE__ */ React.createElement(RefBox, { x: 950, y: 570, w: 250, h: 64, kind: "weak", title: "WeakReference", cleared: cutW, a: E3(t, 2.4), fs: 18, sfs: 17 }), /* @__PURE__ */ React.createElement(Obj, { x: 1400, y: 330, w: 300, h: 90, name: "Zombie", sub: zSub, tone: zTone, a: E3(t, 1.8), gone: goneZ, ghostSub: "collected \xB7 no finalize()", fs: 24, glow: pulse3(t, [25, 33], 1.4) }), /* @__PURE__ */ React.createElement(Badge3, { x: 1550, y: 308, text: "back from the dead", tone: "flow", solid: true, a: win2(t, 33.4, 46), fs: 17 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1200, 366], [1396, 366]], draw: M2(t, 32.8, 0.6), a: 1 - E3(t, 46.2, 0.5), glow: win2(t, 33, 46), label: "saved = this", lx: 1298, ly: 354, lfs: 17 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1200, 498], [1420, 498], [1420, 424]], draw: M2(t, 2.2, 0.5), a: 1 - E3(t, 13, 0.6) }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1200, 602], [1460, 602], [1460, 424]], kind: "weak", draw: M2(t, 2.8, 0.5), cut: cutW }), /* @__PURE__ */ React.createElement(RefBox, { x: 1520, y: 520, w: 300, h: 72, kind: "final", title: "Finalizer", sub: "FinalReference \xB7 at allocation", a: E3(t, 6.5) * (1 - E3(t, 26, 0.4)), fs: 19, sfs: 17, glow: pulse3(t, [6.8], 1.2) }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1650, 520], [1650, 424]], kind: "final", draw: M2(t, 7, 0.5), a: 1 - E3(t, 26, 0.4) }), /* @__PURE__ */ React.createElement(Tok, { t, keys: [[26, 1670, 556], [27.2, 1610, 742], [32.4, 1610, 742]], text: "Finalizer ref", tone: "pink", w: 200, until: 32.4 }), /* @__PURE__ */ React.createElement(Box3, { x: 1400, y: 700, w: 420, h: 84, label: "Finalizer thread", sub: t > 32.4 && t < 40 ? "running finalize()" : "prio 8 \xB7 daemon", tone: "pink", a: E3(t, 7.5), glow: win2(t, 32.2, 34.5), fs: 21 }), /* @__PURE__ */ React.createElement(GcSweep, { t, at: 13.6, dur: 1.6, x: 940, y: 300, w: 884, h: 500, label: "GC #1" }), /* @__PURE__ */ React.createElement(GcSweep, { t, at: 46.8, x: 940, y: 300, w: 884, h: 500, label: "GC #2" }), /* @__PURE__ */ React.createElement(Callout2, { x: 950, y: 820, w: 874, tone: "bad", a: E3(t, 53), fs: 19, text: "Every finalizable object needs **at least two GCs** to die, plus a turn on one thread you don't control." }));
  }
  function SFinalizeProblems({ t }) {
    const cards = [
      ["May never run", "No guarantee, not even at exit. If the heap never fills, it never runs.", 3.5],
      ["Unpredictable timing", "Runs later, on the Finalizer thread, in no particular order.", 4.5],
      ["Slows collection", "At least two GC cycles to reclaim. A slow finalize() backs up the queue.", 10.5],
      ["Can resurrect", "`finalize()` can store `this` anywhere: the object comes back.", 12],
      ["Exceptions swallowed", "A throw inside it is ignored. Cleanup stops half-way, silently.", 13.5],
      ["A security hole", "Finalizer attack: a subclass grabs a half-built object whose constructor threw.", 18]
    ];
    const nodes = [["Java 1.0", "finalize() arrives", 200, "ink"], ["Java 9", "deprecated", 700, "pull"], ["Java 18", "JEP 421: deprecated for removal", 1200, "bad"], ["Java 25", "still present \xB7 still deprecated", 1700, "bad"]];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, cards.map(([title, sub, at], i) => /* @__PURE__ */ React.createElement(Card2, { key: title, x: 96 + i % 3 * 584, y: 196 + Math.floor(i / 3) * 196, w: 560, h: 176, a: E3(t, at), num: String(i + 1), title, sub, tfs: 26, sfs: 19, tone: "bad" })), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 140, top: 680, width: 1640, height: 4, borderRadius: 2, background: PAL3.line2, opacity: E3(t, 25) } }), nodes.map(([v, s, x, tone], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: v }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x - 12, top: 670, width: 24, height: 24, borderRadius: 12, background: toneColor3(tone), opacity: E3(t, 25 + i * 0.7) } }), /* @__PURE__ */ React.createElement(Txt3, { x, y: 624, anchor: "mid", mono: true, fs: 21, weight: 600, a: E3(t, 25 + i * 0.7) }, v), /* @__PURE__ */ React.createElement(Txt3, { x, y: 708, anchor: "mid", mono: true, fs: 17, color: toneColor3(tone), a: E3(t, 25 + i * 0.7) }, s))), /* @__PURE__ */ React.createElement(Txt3, { x: 1200, y: 734, anchor: "mid", mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 27.5) }, "adds --finalization=disabled"), /* @__PURE__ */ React.createElement(Callout2, { x: 96, y: 790, w: 1728, tone: "bad", a: E3(t, 33), title: "correcting the source note", fs: 20, text: "The note calls `finalize()` **removed**. It isn't: deprecated in 9, deprecated for removal in 18, still there in Java 25. Run with `--finalization=disabled` (18+) to check you don't depend on it." }));
  }
  function SCleanerVsTwr({ t }) {
    const [hl, hA] = hlAt2(t, [[6, 5], [13, 7], [19.5, 10], [26, -1]]);
    const L1 = 716, L2 = 846;
    const chip = (x, y, label, sub, tone, at, glow) => /* @__PURE__ */ React.createElement(Box3, { x: x - 115, y: y - 28, w: 230, h: 56, label, sub, tone, a: E3(t, at), fs: 17, sfs: 17, glow });
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 196, w: 860, h: 398, title: "Texture.java", a: E3(t, 0.4), fs: 17, lh: 30, hl, hlA: hA, lines: [
      "class Texture implements AutoCloseable {",
      "    static final Cleaner CLEANER = Cleaner.create();",
      "    private final Cleaner.Cleanable cleanable;",
      "    Texture(String name) {",
      "        long handle = allocGpu(name);",
      "        cleanable = CLEANER.register(this, new Free(handle));",
      "    }",
      "    private record Free(long handle) implements Runnable {",
      "        public void run() { freeGpu(handle); }",
      "    }",
      "    public void close() { cleanable.clean(); }"
    ] }), /* @__PURE__ */ React.createElement(Box3, { x: 1e3, y: 210, w: 250, h: 72, label: "CLEANER", sub: "thread Cleaner-0", tone: "pull", a: E3(t, 6), fs: 20, sfs: 17 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1250, 246], [1296, 246]], draw: M2(t, 6.6, 0.3) }), /* @__PURE__ */ React.createElement(RefBox, { x: 1300, y: 210, w: 300, h: 72, kind: "phantom", title: "PhantomCleanable", a: E3(t, 7), fs: 19, sfs: 17 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1600, 246], [1646, 246]], draw: M2(t, 13.2, 0.3) }), /* @__PURE__ */ React.createElement(Obj, { x: 1650, y: 210, w: 174, h: 72, name: "Free", sub: "handle only", tone: "flow", a: E3(t, 13.4), sfs: 17, glow: win2(t, 13.4, 19) }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1400, 282], [1400, 396]], kind: "phantom", draw: M2(t, 8, 0.5), label: "phantom", lx: 1350, ly: 344, lfs: 17 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1520, 396], [1520, 286]], draw: M2(t, 9, 0.5), label: "cleanable", lx: 1586, ly: 344, lfs: 17 }), /* @__PURE__ */ React.createElement(Obj, { x: 1300, y: 400, w: 300, h: 72, name: "Texture", sub: "sky.png \xB7 GPU handle", tone: "ink", a: E3(t, 6.8), sfs: 17 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1737, 282], [1737, 436], [1604, 436]], kind: "bad", draw: M2(t, 14.5, 0.6), cut: E3(t, 15.2), label: "no path back", lx: 1737, ly: 500, lfs: 17 }), /* @__PURE__ */ React.createElement(Panel2, { x: 96, y: 620, w: 1728, h: 310, title: "when does the GPU memory come back?", a: E3(t, 19) }), /* @__PURE__ */ React.createElement(Txt3, { x: 120, y: L1 - 12, mono: true, fs: 18, weight: 600, color: PAL3.flow, a: E3(t, 19.5) }, "try-with-resources"), /* @__PURE__ */ React.createElement(Txt3, { x: 120, y: L2 - 12, mono: true, fs: 18, weight: 600, color: PAL3.bad, a: E3(t, 32.5) }, "forgot close()"), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 360, top: L1, width: 1440, height: 2, background: PAL3.line2, opacity: E3(t, 19.5) } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 360, top: L2, width: 1440, height: 2, background: PAL3.line2, opacity: E3(t, 32.5) } }), chip(500, L1, "alloc sky.png", "main", "ink", 20.5), chip(760, L1, "using sky.png", "main", "ink", 22), chip(1020, L1, "free sky.png", "on thread main", "flow", 24, pulse3(t, [24.2], 1.4)), chip(1280, L1, "block ended", "", "ink", 25.4), /* @__PURE__ */ React.createElement(Badge3, { x: 1020, y: L1 - 46, text: "exactly here", tone: "flow", a: E3(t, 27), fs: 17 }), chip(500, L2, "alloc sea.png", "main", "ink", 33), chip(760, L2, "dropped sea.png", "no close()", "bad", 34.5), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 890, top: L2 - 22, width: 560, height: 44, borderRadius: 10, border: `2px dashed ${PAL3.ink3}`, opacity: E3(t, 36), display: "flex", alignItems: "center", justifyContent: "center", font: `400 17px ${MONO3}`, color: PAL3.ink3 } }, "\u2026 until a GC notices \xB7 maybe never \u2026"), /* @__PURE__ */ React.createElement(Badge3, { x: 1480, y: L2, text: "GC", tone: "pull", solid: true, a: POP2(t, 39.6), fs: 17 }), chip(1640, L2, "free sea.png", "on thread Cleaner-0", "pull", 40.4, pulse3(t, [40.6], 1.4)), /* @__PURE__ */ React.createElement(Badge3, { x: 1600, y: 652, text: "clean() twice \u2192 the action runs once", tone: "violet", a: E3(t, 47), fs: 17 }));
  }
  function SCleanerTrap({ t }) {
    const hot = win2(t, 11, 26);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 196, w: 860, h: 200, title: "LeakyTexture.java", a: E3(t, 0.4), fs: 17, lh: 32, lines: [
      "LeakyTexture(String name) {",
      "    this.name = name;",
      { s: "    CLEANER.register(this, () -> freeGpu(this.name));", tone: "bad", toneA: E3(t, 5.5) },
      "}"
    ] }), /* @__PURE__ */ React.createElement(Box3, { x: 1e3, y: 220, w: 240, h: 72, label: "Cleaner-0", sub: "thread \xB7 GC root", tone: "flow", a: E3(t, 11), fs: 20, sfs: 17 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1240, 256], [1296, 256]], kind: hot > 0.5 ? "bad" : "strong", draw: M2(t, 11.4, 0.3) }), /* @__PURE__ */ React.createElement(RefBox, { x: 1300, y: 220, w: 260, h: 72, kind: "phantom", title: "PhantomCleanable", a: E3(t, 11.2), fs: 18, sfs: 17 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1560, 256], [1606, 256]], kind: hot > 0.5 ? "bad" : "strong", draw: M2(t, 12, 0.3) }), /* @__PURE__ */ React.createElement(Obj, { x: 1610, y: 220, w: 214, h: 72, name: "lambda", sub: "captured this", tone: "bad", a: E3(t, 12.2), sfs: 17 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1717, 292], [1717, 436]], kind: "bad", draw: M2(t, 12.8, 0.5), label: "this", lx: 1760, ly: 370, lfs: 17, glow: hot }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1430, 292], [1430, 476], [1606, 476]], kind: "phantom", draw: M2(t, 13.4, 0.5) }), /* @__PURE__ */ React.createElement(Obj, { x: 1610, y: 440, w: 214, h: 72, name: "LeakyTexture", sub: "sun.png", tone: "pull", a: E3(t, 13), sfs: 17, glow: win2(t, 18, 26) * 0.8 }), /* @__PURE__ */ React.createElement(Badge3, { x: 1717, y: 548, text: "still strongly reachable", tone: "bad", a: E3(t, 21), fs: 17 }), /* @__PURE__ */ React.createElement(GcSweep, { t, at: 18.2, dur: 1, x: 1e3, y: 210, w: 824, h: 320, label: "GC" }), /* @__PURE__ */ React.createElement(GcSweep, { t, at: 19.8, dur: 1, x: 1e3, y: 210, w: 824, h: 320, label: "GC" }), /* @__PURE__ */ React.createElement(Console2, { x: 96, y: 416, w: 860, h: 190, t, a: E3(t, 18), fs: 17, lh: 26, title: "terminal \xB7 JDK 17 \xB7 Tex.java, case 3", items: [
      { at: 18.5, text: "java Tex", kind: "cmd" },
      { at: 19, text: "3) cleanup action captures this" },
      { at: 21.5, text: "  ...nothing. sun.png is reachable from the Cleaner forever", kind: "err" }
    ] }), /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 640, w: 860, h: 210, title: "fix: a static nested record", a: E3(t, 32), fs: 17, lh: 28, lines: [
      "CLEANER.register(this, new Free(name, handle));",
      "private record Free(String name, long handle)",
      "        implements Runnable {",
      "    public void run() { freeGpu(handle); }",
      "}"
    ] }), /* @__PURE__ */ React.createElement(Callout2, { x: 1e3, y: 600, w: 824, tone: "pull", a: E3(t, 26), fs: 19, text: "A leak and a missed cleanup in one: the same hidden `this` that inner classes and capturing lambdas carry." }), /* @__PURE__ */ React.createElement(Callout2, { x: 1e3, y: 730, w: 824, tone: "violet", a: E3(t, 38.5), title: "the opposite trap \xB7 Java 9+", fs: 18, text: "An object can become unreachable while its own method still runs. The Cleaner could free the handle mid-call. Use `Reference.reachabilityFence(this)` in a `finally`." }));
  }

  // src/topics/8.7/scenes3.jsx
  var {
    PAL: PAL4,
    MOTION: MOTION4,
    lin: lin3,
    lerp: lerp4,
    win: win3,
    pulse: pulse4,
    hlAt: hlAt3,
    clamp: clamp4,
    hexA: hexA4,
    MONO: MONO4,
    SANS: SANS4,
    Txt: Txt4,
    Panel: Panel3,
    Box: Box4,
    Code: Code3,
    Console: Console3,
    HArrow: HArrow3,
    VArrow: VArrow3,
    Dot: Dot3,
    Card: Card3,
    Badge: Badge4,
    Callout: Callout3,
    Mark: Mark3,
    toneColor: toneColor4
  } = window.AN;
  var E4 = MOTION4.enter;
  var M3 = MOTION4.move;
  var POP3 = MOTION4.pop;
  var FIX_PTS = [[0, 1], [0.379, 14], [0.38, 1], [0.837, 19], [0.838, 1], [1.29, 19], [1.291, 1], [1.743, 19], [1.744, 1], [2.196, 19], [2.197, 1]];
  function SLeakStatic({ t }) {
    const fixed = t >= 34;
    const n = Math.round(lerp4(0, 291, lin3(t, 12, 14)));
    const filled = fixed ? 0 : Math.round(n / 291 * 120);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(LeakTag, { n: 1, a: E4(t, 0.5) }), /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 196, w: 800, h: 324, title: "Sessions.java", a: E4(t, 0.4), fs: 18, lh: 32, lines: [
      "private static final Map<String, Session> SESSIONS",
      { s: "        = new HashMap<>();          // a GC root", tone: "pull", toneA: win3(t, 5, 12) },
      "",
      "void handle(Request r) {",
      { s: "    SESSIONS.put(r.id(), new Session(r.user(), 100 KB));", tone: "bad", toneA: win3(t, 12, 34) },
      fixed ? { s: "    try { serve(r); }", tone: "green" } : "    serve(r);",
      fixed ? { s: "    finally { SESSIONS.remove(r.id()); }   // the fix", tone: "green" } : { s: "    // nothing ever removes it", tone: "bad", toneA: win3(t, 12, 34) },
      "}"
    ] }), /* @__PURE__ */ React.createElement(Panel3, { x: 96, y: 544, w: 800, h: 386, title: "what the GC sees", a: E4(t, 5) }), /* @__PURE__ */ React.createElement(Box4, { x: 120, y: 610, w: 250, h: 84, label: "Sessions.class", sub: "static \xB7 GC root", tone: "flow", a: E4(t, 5.5), fs: 20, glow: pulse4(t, [5.6], 1.2) }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[370, 652], [426, 652]], draw: M3(t, 6, 0.4) }), /* @__PURE__ */ React.createElement(Box4, { x: 430, y: 610, w: 180, h: 84, label: "HashMap", sub: "SESSIONS", tone: "flow", a: E4(t, 6.2), fs: 20 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[610, 652], [646, 652]], draw: M3(t, 6.6, 0.3) }), Array.from({ length: 120 }, (_, i) => {
      const c = i % 10, r = Math.floor(i / 10);
      const on = i < filled;
      return /* @__PURE__ */ React.createElement("div", { key: i, style: { position: "absolute", left: 650 + c * 23, top: 604 + r * 24, width: 19, height: 20, borderRadius: 4, background: on ? hexA4(PAL4.bad, 0.5) : PAL4.panel2, border: `1.5px solid ${on ? PAL4.bad : PAL4.line}`, opacity: E4(t, 6.6) } });
    }), /* @__PURE__ */ React.createElement(Txt4, { x: 120, y: 730, mono: true, fs: 20, color: fixed ? PAL4.flow : PAL4.bad, a: E4(t, 12) }, "sessions: ", fixed ? 0 : n), /* @__PURE__ */ React.createElement(Txt4, { x: 120, y: 770, mono: true, fs: 17, color: PAL4.ink3, a: E4(t, 12), w: 500 }, fixed ? "removed when each request ends" : "each square \u2248 2\u20133 sessions of 100 KB"), /* @__PURE__ */ React.createElement(
      Chart,
      {
        x: 940,
        y: 196,
        w: 884,
        h: 480,
        a: E4(t, 17.5),
        title: "heap used \xB7 -Xmx32m \xB7 real GC log",
        xmax: 2.3,
        ymax: 32,
        yTicks: [0, 16, 32],
        yUnit: "M",
        xTicks: [[0, "0 s"], [1, "1 s"], [2, "2 s"]],
        series: [{ pts: LEAK_PTS, color: PAL4.bad, n: lerp4(1, LEAK_PTS.length, lin3(t, 18, 8)) }, { pts: FIX_PTS, color: PAL4.flow, n: lerp4(1, FIX_PTS.length, lin3(t, 41, 6)) }]
      }
    ), /* @__PURE__ */ React.createElement(Badge4, { x: 1180, y: 300, text: "OutOfMemoryError \xB7 request 292", tone: "bad", solid: true, a: POP3(t, 26.4), fs: 17 }), /* @__PURE__ */ React.createElement(Badge4, { x: 1560, y: 560, text: "back to 1M after every GC", tone: "flow", a: E4(t, 45), fs: 17 }), /* @__PURE__ */ React.createElement(Console3, { x: 940, y: 700, w: 884, h: 230, t, a: E4(t, 18), fs: 17, lh: 28, title: "terminal \xB7 JDK 17 \xB7 abridged", items: [
      { at: 18.2, text: "java -Xmx32m -Xlog:gc Sessions", kind: "cmd" },
      { at: 19, text: "GC(0) Pause Young (Normal) (G1 Evacuation Pause) 14M->14M(32M)", kind: "dim" },
      { at: 22, text: "GC(10) Pause Young (Normal) (G1 Evacuation Pause) 24M->24M(32M)", kind: "dim" },
      { at: 25.6, text: "GC(21) Pause Full (G1 Compaction Pause) 30M->29M(32M)", kind: "dim" },
      { at: 26.4, text: "java.lang.OutOfMemoryError: Java heap space at request 292", kind: "err" },
      { at: 41, text: "java -Xmx32m -Xlog:gc Sessions fixed", kind: "cmd" },
      { at: 42, text: "GC(0) Pause Young (Normal) (G1 Evacuation Pause) 14M->1M(32M)", kind: "ok" },
      { at: 43.5, text: "GC(1) Pause Young (Normal) (G1 Evacuation Pause) 19M->1M(32M)", kind: "ok" },
      { at: 45, text: "requests=1000  sessions=0", kind: "ok" }
    ] }));
  }
  function SLeakListeners({ t }) {
    const fixed = t >= 27;
    const count = fixed ? 0 : Math.round(lerp4(0, 295, lin3(t, 12, 7)));
    const rows = [0, 1, 2, 3, 4];
    const heap = fixed ? 2 : lerp4(1, 31, lin3(t, 12, 7.2));
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(LeakTag, { n: 2, a: E4(t, 0.5) }), /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 196, w: 800, h: 260, title: "ImageViewer.java", a: E4(t, 0.4), fs: 18, lh: 32, lines: [
      "class ImageViewer {",
      "    final byte[] image = new byte[100 * 1024];",
      { s: "    final Consumer<String> onTheme = t -> repaint();", tone: "pull", toneA: win3(t, 5, 12) },
      "    void open()  { THEMES.add(onTheme); }",
      fixed ? { s: "    void close() { THEMES.remove(onTheme); }", tone: "green" } : { s: "    void close() { }   // forgot THEMES.remove", tone: "bad", toneA: win3(t, 11.5, 27) },
      "}"
    ] }), /* @__PURE__ */ React.createElement(Console3, { x: 96, y: 480, w: 800, h: 238, t, a: E4(t, 18.5), fs: 17, lh: 28, title: "terminal \xB7 JDK 17 \xB7 long line wrapped", items: [
      { at: 19, text: "java -Xmx32m Listeners", kind: "cmd" },
      { at: 19.5, text: "java.lang.OutOfMemoryError: Java heap space after 296 viewers;", kind: "err" },
      { at: 19.6, text: "    listeners still registered: 295", kind: "err" },
      { at: 27.5, text: "java -Xmx32m Listeners fixed", kind: "cmd" },
      { at: 28, text: "opened 1000 viewers, listeners still registered: 0", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(Callout3, { x: 96, y: 744, w: 800, tone: "violet", a: E4(t, 33.5), fs: 20, text: "A weak registry also works, **if** the viewer keeps its listener in a field. Otherwise the listener vanishes at the next GC." }), /* @__PURE__ */ React.createElement(Panel3, { x: 940, y: 196, w: 884, h: 480, title: "reachable from THEMES", a: E4(t, 4) }), /* @__PURE__ */ React.createElement(Box4, { x: 964, y: 262, w: 220, h: 72, label: "THEMES", sub: "static \xB7 root", tone: "flow", a: E4(t, 4.5), fs: 20 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1184, 298], [1226, 298]], draw: M3(t, 5, 0.3) }), /* @__PURE__ */ React.createElement(Box4, { x: 1230, y: 262, w: 230, h: 72, label: "listeners", sub: "ArrayList", tone: "flow", a: E4(t, 5.2), fs: 20 }), rows.map((i) => {
      const y = 262 + i * 80;
      const ra = (i === 0 ? E4(t, 6) : E4(t, 12 + i * 1.2)) * (1 - E4(t, 27.2, 0.6));
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, /* @__PURE__ */ React.createElement(RArrow, { pts: [[1460, 298], [1484, 298], [1484, y + 30], [1506, y + 30]], draw: 1, a: ra }), /* @__PURE__ */ React.createElement(Obj, { x: 1510, y, w: 110, h: 60, name: "\u03BB", sub: "theme", tone: "pull", a: ra, fs: 20 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1620, y + 30], [1656, y + 30]], a: ra, kind: i === 0 && t < 11.5 ? "strong" : "bad" }), /* @__PURE__ */ React.createElement(Obj, { x: 1660, y, w: 150, h: 60, name: "Viewer", sub: t > 11.5 || i > 0 ? "closed" : "open", tone: t > 11.5 || i > 0 ? "bad" : "flow", a: ra, fs: 19 }));
    }), /* @__PURE__ */ React.createElement(Txt4, { x: 964, y: 420, mono: true, fs: 20, color: fixed ? PAL4.flow : PAL4.bad, a: E4(t, 12) }, "registered: ", count), /* @__PURE__ */ React.createElement(Txt4, { x: 964, y: 460, mono: true, fs: 17, color: PAL4.ink3, a: E4(t, 12), w: 300 }, "each closed viewer still holds its 100 KB image"), /* @__PURE__ */ React.createElement(Txt4, { x: 1660, y: 650, anchor: "mid", mono: true, fs: 17, color: PAL4.ink3, a: E4(t, 14) * (1 - E4(t, 27)) }, "\u2026 290 more"), /* @__PURE__ */ React.createElement(Gauge, { x: 940, y: 712, w: 884, value: heap, max: 32, label: "heap \xB7 -Xmx32m", a: E4(t, 12), right: fixed ? "stays low" : void 0 }), /* @__PURE__ */ React.createElement(Badge4, { x: 1382, y: 820, text: "OutOfMemoryError after 296 viewers", tone: "bad", solid: true, a: win3(t, 19.4, 27), fs: 17 }));
  }
  function SLeakThreadLocal({ t }) {
    const user = t < 18.5 ? "" : t < 25.5 ? "alice" : "bob";
    const fixed = t >= 46.5;
    const memA = E4(t, 38.6) * (1 - E4(t, 54, 0.6));
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(LeakTag, { n: 3, a: E4(t, 0.5) }), /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 196, w: 820, h: 292, title: "Pool.java", a: E4(t, 0.4), fs: 18, lh: 32, lines: [
      "static final ThreadLocal<UserContext> CONTEXT",
      "        = new ThreadLocal<>();",
      "void handle(Request r) {",
      "    if (r.user() != null)",
      { s: "        CONTEXT.set(new UserContext(r.user(), 2 MB));", tone: "pull", toneA: win3(t, 5, 12) },
      { s: "    UserContext c = CONTEXT.get();   // ...", tone: "bad", toneA: win3(t, 31, 39) },
      "}"
    ] }), /* @__PURE__ */ React.createElement(Console3, { x: 96, y: 510, w: 820, h: 262, t, a: E4(t, 18), fs: 17, lh: 28, title: "terminal \xB7 JDK 17 \xB7 one pooled thread", items: [
      { at: 18.2, text: "java Pool", kind: "cmd" },
      { at: 19, text: "  pool-1-thread-1 request user=alice  sees context of: alice" },
      { at: 26, text: "  pool-1-thread-1 request user=bob    sees context of: bob" },
      { at: 31.5, text: "  pool-1-thread-1 request user=null   sees context of: bob", kind: "err" },
      { at: 47, text: "java Pool fixed", kind: "cmd" },
      { at: 47.6, text: "  pool-1-thread-1 request user=null   sees context of: nobody", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 796, w: 820, h: 128, title: "the fix", a: E4(t, 46.5), fs: 18, lh: 30, lines: ["try { handle(r); }", { s: "finally { CONTEXT.remove(); }   // mandatory in pools", tone: "green" }] }), /* @__PURE__ */ React.createElement(Box4, { x: 960, y: 210, w: 280, h: 90, label: "pool-1-thread-1", sub: "reused \xB7 never dies", tone: "flow", a: E4(t, 4.5), fs: 21, glow: pulse4(t, [18.6, 25.6, 31.2], 1) }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1240, 255], [1296, 255]], draw: M3(t, 5, 0.3), label: "threadLocals", lx: 1268, ly: 238, lfs: 17 }), /* @__PURE__ */ React.createElement(Box4, { x: 1300, y: 210, w: 260, h: 90, label: "ThreadLocalMap", sub: "one per Thread", tone: "flow", a: E4(t, 5.3), fs: 20 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1430, 300], [1430, 366]], draw: M3(t, 6, 0.3) }), /* @__PURE__ */ React.createElement(Box4, { x: 1300, y: 370, w: 260, h: 130, label: "Entry", sub: "extends WeakReference", tone: "blue", a: E4(t, 11.5), fs: 21, glow: pulse4(t, [11.8], 1.2) }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1560, 402], [1616, 402]], kind: "weak", draw: M3(t, 12, 0.4), label: "key", lx: 1588, ly: 390, lfs: 17 }), /* @__PURE__ */ React.createElement(Obj, { x: 1620, y: 370, w: 204, h: 64, name: "CONTEXT", sub: "the ThreadLocal", tone: "blue", a: E4(t, 12.2) }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1560, 476], [1616, 476]], kind: fixed ? "strong" : "bad", draw: M3(t, 13.5, 0.4), a: user && !(fixed && t > 48) ? 1 : 0.25, label: "value", lx: 1588, ly: 464, lfs: 17 }), /* @__PURE__ */ React.createElement(Obj, { x: 1620, y: 448, w: 204, h: 80, name: "UserContext", sub: fixed && t > 48 ? "removed" : user ? `user = ${user}` : "(empty)", tone: t > 31 && t < 46 ? "bad" : "pull", a: E4(t, 13.5), glow: win3(t, 31.2, 39) + pulse4(t, [18.8, 25.8], 1), gone: fixed && t > 48 ? 1 : 0, ghostSub: "removed" }), /* @__PURE__ */ React.createElement(Badge4, { x: 1722, y: 556, text: "bob's data, anonymous request", tone: "bad", solid: true, a: win3(t, 31.4, 39), fs: 17 }), [["request \xB7 alice", 18], ["request \xB7 bob", 25], ["request \xB7 (anonymous)", 31]].map(([l, at], i) => /* @__PURE__ */ React.createElement(Tok, { key: i, t, keys: [[at, 1100, 590], [at + 0.8, 1100, 320]], text: l, tone: i === 2 ? "bad" : "pull", w: 270, until: at + 1.2 })), /* @__PURE__ */ React.createElement(Txt4, { x: 1100, y: 330, anchor: "mid", mono: true, fs: 17, color: PAL4.ink3, a: win3(t, 20, 25) + win3(t, 27, 31) }, "request finished \xB7 value still attached"), /* @__PURE__ */ React.createElement(Panel3, { x: 960, y: 620, w: 864, h: 310, title: "8 pool threads \xB7 4 MB buffer each \xB7 then a full GC", a: memA }), Array.from({ length: 8 }, (_, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, /* @__PURE__ */ React.createElement(Box4, { x: 984 + i * 104, y: 684, w: 92, h: 56, label: `T${i + 1}`, tone: "flow", a: memA, fs: 19 }), /* @__PURE__ */ React.createElement(Box4, { x: 984 + i * 104, y: 752, w: 92, h: 44, label: "4 MB", tone: "bad", a: memA * (fixed ? 1 - E4(t, 48, 0.6) : E4(t, 39 + i * 0.12)), fs: 17 }))), /* @__PURE__ */ React.createElement(Txt4, { x: 984, y: 820, mono: true, fs: 19, color: PAL4.bad, a: memA * E4(t, 40.5) }, "no remove(): GC(0) Pause Full (System.gc()) 36M->33M(120M)"), /* @__PURE__ */ React.createElement(Txt4, { x: 984, y: 862, mono: true, fs: 19, color: PAL4.flow, a: memA * E4(t, 48.4) }, "remove():    GC(0) Pause Full (System.gc()) 36M->1M(10M)"), /* @__PURE__ */ React.createElement(Callout3, { x: 960, y: 640, w: 864, tone: "violet", a: E4(t, 54.6), title: "classloader leak", fs: 20, text: "On an app server the pool belongs to the container. A value whose class came from your webapp pins that webapp's whole class loader, and every class it loaded, after a redeploy (8.2)." }));
  }
  function SLeakInner({ t }) {
    const fixed = t >= 26.5;
    const n = fixed ? 1e3 : Math.round(lerp4(0, 291, lin3(t, 13, 6.5)));
    const stack = fixed ? 0 : Math.min(4, Math.floor(n / 60));
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(LeakTag, { n: 4, a: E4(t, 0.5) }), /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 196, w: 820, h: 292, title: "ImageViewer.java", a: E4(t, 0.4), fs: 18, lh: 32, lines: [
      "class ImageViewer {",
      "    final byte[] image = new byte[100 * 1024];",
      fixed ? { s: "    static class StaticRefresh implements Runnable {", tone: "green" } : { s: "    class Refresh implements Runnable {   // inner", tone: "bad", toneA: win3(t, 5, 26) },
      fixed ? { s: "        final String url;  // copies only this", tone: "green" } : "        public void run() { \u2026 }",
      "    }",
      "}",
      fixed ? { s: "SCHEDULER.add(new StaticRefresh(viewer.url));", tone: "green" } : "SCHEDULER.add(viewer.new Refresh());"
    ] }), /* @__PURE__ */ React.createElement(Console3, { x: 96, y: 510, w: 820, h: 190, t, a: E4(t, 5) * (1 - E4(t, 26.5, 0.4)), fs: 17, lh: 28, title: "javap -p \xB7 JDK 17", items: [
      { at: 5.4, text: "javap -p 'ImageViewer$Refresh'", kind: "cmd" },
      { at: 6, text: "class ImageViewer$Refresh implements java.lang.Runnable {" },
      { at: 6.6, text: "  final ImageViewer this$0;", kind: "err" },
      { at: 7, text: "  ImageViewer$Refresh(ImageViewer);" }
    ] }), /* @__PURE__ */ React.createElement(Console3, { x: 96, y: 510, w: 820, h: 190, t, a: E4(t, 26.8), fs: 17, lh: 28, title: "javap -p \xB7 JDK 17", items: [
      { at: 27, text: "javap -p 'ImageViewer$StaticRefresh'", kind: "cmd" },
      { at: 27.5, text: "class ImageViewer$StaticRefresh implements java.lang.Runnable {" },
      { at: 28, text: "  final java.lang.String url;", kind: "ok" },
      { at: 28.4, text: "  ImageViewer$StaticRefresh(java.lang.String);" }
    ] }), /* @__PURE__ */ React.createElement(Console3, { x: 96, y: 722, w: 820, h: 208, t, a: E4(t, 19), fs: 17, lh: 28, title: "terminal \xB7 JDK 17 \xB7 long line wrapped", items: [
      { at: 19.4, text: "java -Xmx32m ImageViewer", kind: "cmd" },
      { at: 20, text: "java.lang.OutOfMemoryError: Java heap space after 292 viewers", kind: "err" },
      { at: 20.1, text: "    (291 tiny tasks queued)", kind: "err" },
      { at: 32.5, text: "java -Xmx32m ImageViewer fixed", kind: "cmd" },
      { at: 33, text: "1000 viewers closed, 1000 tasks queued, heap fine", kind: "ok" }
    ] }), Array.from({ length: stack }, (_, k) => /* @__PURE__ */ React.createElement(React.Fragment, { key: k }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 1280 + (k + 1) * 8, top: 220 + (k + 1) * 8, width: 220, height: 76, borderRadius: 12, border: `2px solid ${hexA4(PAL4.pull, 0.4)}`, background: PAL4.panel2, zIndex: 0 } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 1560 + (k + 1) * 8, top: 220 + (k + 1) * 8, width: 264, height: 76, borderRadius: 12, border: `2px solid ${hexA4(PAL4.bad, 0.4)}`, background: PAL4.panel2 } }))), /* @__PURE__ */ React.createElement(Box4, { x: 960, y: 220, w: 260, h: 76, label: "SCHEDULER", sub: "static List \xB7 root", tone: "flow", a: E4(t, 12.5), fs: 20 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1220, 258], [1276, 258]], draw: M3(t, 13, 0.3) }), /* @__PURE__ */ React.createElement(Obj, { x: 1280, y: 220, w: 220, h: 76, name: fixed ? "StaticRefresh" : "Refresh", sub: fixed ? "url only" : "a tiny task", tone: fixed ? "green" : "pull", a: E4(t, 13.2), fs: fixed ? 19 : 21 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1500, 258], [1556, 258]], kind: "bad", draw: M3(t, 13.6, 0.3), cut: fixed ? 1 : 0, label: "this$0", lx: 1528, ly: 242, lfs: 17, glow: win3(t, 13.6, 26) }), /* @__PURE__ */ React.createElement(Obj, { x: 1560, y: 220, w: 264, h: 76, name: "ImageViewer", sub: "closed", tone: "bad", a: E4(t, 13.8), gone: fixed ? 1 : 0, ghostSub: "collected" }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1692, 296], [1692, 356]], draw: M3(t, 14, 0.3), a: fixed ? 0.3 : 1 }), /* @__PURE__ */ React.createElement(Obj, { x: 1560, y: 360, w: 264, h: 76, name: "byte[]", sub: "100 KB image", tone: "bad", a: E4(t, 14.2), gone: fixed ? 1 : 0, ghostSub: "collected" }), /* @__PURE__ */ React.createElement(Txt4, { x: 960, y: 340, mono: true, fs: 20, color: fixed ? PAL4.flow : PAL4.bad, a: E4(t, 13) }, "tasks queued: ", n), /* @__PURE__ */ React.createElement(Txt4, { x: 960, y: 380, mono: true, fs: 17, color: PAL4.ink3, w: 290, a: E4(t, 14) }, fixed ? "tasks keep only a String" : "each one drags a closed viewer along"), /* @__PURE__ */ React.createElement(Gauge, { x: 960, y: 480, w: 864, value: fixed ? 3 : lerp4(1, 31, lin3(t, 13, 6.5)), max: 32, label: "heap \xB7 -Xmx32m", right: fixed ? "fine" : void 0, a: E4(t, 13) }), /* @__PURE__ */ React.createElement(Callout3, { x: 960, y: 600, w: 864, tone: "pull", a: E4(t, 33), fs: 20, text: "Anonymous classes, and lambdas that use a field or method of `this`, capture the enclosing instance the same way." }));
  }
  function SLeakResources({ t }) {
    const fixed = t >= 25;
    const reads = fixed ? 0 : Math.round(lerp4(0, 253, lin3(t, 12, 6.5)));
    const open = fixed ? 4 : Math.min(256, 4 + reads);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(LeakTag, { n: 5, a: E4(t, 0.5) }), /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 196, w: 820, h: 196, title: "Unclosed.java", a: E4(t, 0.4), fs: 18, lh: 32, lines: [
      "int readHeader(String path) throws IOException {",
      { s: "    var in = new FileInputStream(path);   // never closed", tone: "bad", toneA: win3(t, 5, 25) },
      "    return in.read();",
      "}"
    ] }), /* @__PURE__ */ React.createElement(Console3, { x: 96, y: 420, w: 820, h: 226, t, a: E4(t, 18), fs: 17, lh: 28, title: "terminal \xB7 JDK 17 \xB7 long line wrapped", items: [
      { at: 18.4, text: "(ulimit -n 256; java -XX:-MaxFDLimit Unclosed)", kind: "cmd" },
      { at: 19, text: "after 253 reads: java.io.FileNotFoundException: cat.png", kind: "err" },
      { at: 19.1, text: "    (Too many open files)", kind: "err" },
      { at: 26, text: "(ulimit -n 256; java -XX:-MaxFDLimit Unclosed fixed)", kind: "cmd" },
      { at: 26.6, text: "read 5000 headers, fine", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 670, w: 820, h: 164, title: "the fix", a: E4(t, 25), fs: 18, lh: 32, lines: [{ s: "try (var in = new FileInputStream(path)) {", tone: "green" }, "    return in.read();", "}   // closed here, every time"] }), /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: 856, mono: true, fs: 17, color: PAL4.ink3, a: E4(t, 31.5), w: 820 }, "-XX:-MaxFDLimit stops HotSpot raising the limit on macOS, so ulimit applies"), /* @__PURE__ */ React.createElement(Panel3, { x: 960, y: 196, w: 864, h: 520, title: "process file descriptors", right: "ulimit -n 256", a: E4(t, 4.5) }), Array.from({ length: 256 }, (_, i) => {
      const c = i % 16, r = Math.floor(i / 16);
      const on = i < open;
      const sys = i < 4;
      const last = !fixed && reads >= 253 && i >= 250;
      const col = sys ? PAL4.ink3 : last ? PAL4.bad : PAL4.pull;
      return /* @__PURE__ */ React.createElement("div", { key: i, style: { position: "absolute", left: 980 + c * 52, top: 256 + r * 28, width: 46, height: 22, borderRadius: 4, background: on ? hexA4(col, 0.45) : PAL4.panel2, border: `1.5px solid ${on ? col : PAL4.line}`, opacity: E4(t, 5 + r * 0.03) } });
    }), /* @__PURE__ */ React.createElement(Txt4, { x: 980, y: 740, mono: true, fs: 20, color: fixed ? PAL4.flow : open >= 256 ? PAL4.bad : PAL4.pull, a: E4(t, 12) }, "open: ", open, " / 256   \xB7   reads: ", fixed ? "5000 (each closed)" : reads), /* @__PURE__ */ React.createElement(Gauge, { x: 960, y: 790, w: 864, value: 2, max: 64, label: "heap: nearly empty, so no GC runs and nothing is released", right: "", a: E4(t, 12) }), /* @__PURE__ */ React.createElement(Callout3, { x: 960, y: 880, w: 864, tone: "pull", a: E4(t, 31.5), fs: 18, text: "The JDK's internal cleaner closes them after a GC, eventually. Never rely on it." }));
  }
  function SLeakMutatedKey({ t }) {
    const RY = (i) => 252 + i * 42;
    const mutated = t >= 12.5;
    const probe1 = win3(t, 18.5, 22.5), probe2 = win3(t, 22.5, 26);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(LeakTag, { n: 6, a: E4(t, 0.5) }), /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 196, w: 820, h: 324, title: "MutKey.java", a: E4(t, 0.4), fs: 18, lh: 32, hl: t < 6 ? -1 : t < 12.5 ? 5 : t < 18.5 ? 6 : 7, hlA: E4(t, 6) * (1 - E4(t, 26)), lines: [
      "final class ImageKey {",
      { s: "    String url; int width;           // mutable!", tone: "bad", toneA: win3(t, 6, 34) },
      "    public int hashCode() { return Objects.hash(url, width); }",
      "}",
      'var key = new ImageKey("cat.png", 100);',
      'cache.put(key, "100px thumbnail");',
      "key.width = 200;",
      "cache.get(key);   // ?"
    ] }), /* @__PURE__ */ React.createElement(Console3, { x: 96, y: 540, w: 820, h: 262, t, a: E4(t, 18), fs: 17, lh: 28, title: "terminal \xB7 JDK 17", items: [
      { at: 18.4, text: "java MutKey", kind: "cmd" },
      { at: 19.5, text: "get(key)         = null", kind: "err" },
      { at: 23, text: "get(cat.png,100) = null", kind: "err" },
      { at: 24, text: "containsKey(key) = false", kind: "err" },
      { at: 26.4, text: "size()           = 1" },
      { at: 28.5, text: "after put again, size() = 2", kind: "err" }
    ] }), /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 822, w: 820, h: 100, title: "the fix", a: E4(t, 34), fs: 18, lh: 32, lines: [{ s: "record ImageKey(String url, int width) {}   // immutable", tone: "green" }] }), /* @__PURE__ */ React.createElement(Panel3, { x: 980, y: 196, w: 844, h: 734, title: "HashMap table \xB7 16 buckets", right: "(h ^ h>>>16) & 15", a: E4(t, 2) }), Array.from({ length: 16 }, (_, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, /* @__PURE__ */ React.createElement(Txt4, { x: 1e3, y: RY(i) + 6, mono: true, fs: 17, color: i === 11 || i === 7 ? PAL4.ink : PAL4.ink3, a: E4(t, 2.4) }, "[", i, "]"), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 1060, top: RY(i), width: 120, height: 34, borderRadius: 6, background: PAL4.panel2, border: `1.5px solid ${PAL4.line}`, opacity: E4(t, 2.4) } }))), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1180, RY(11) + 17], [1206, RY(11) + 17]], draw: M3(t, 6.4, 0.3) }), /* @__PURE__ */ React.createElement(Box4, { x: 1210, y: RY(11), w: 330, h: 34, label: mutated ? "key(cat.png, 200) \u2192 100px" : "key(cat.png, 100) \u2192 100px", tone: t > 26 ? "bad" : mutated ? "pull" : "flow", a: POP3(t, 6.4), fs: 17, glow: pulse4(t, [12.6], 1.2) + win3(t, 26, 34) * 0.8 }), /* @__PURE__ */ React.createElement(Txt4, { x: 1560, y: RY(11) + 6, mono: true, fs: 17, color: PAL4.flow, a: win3(t, 6.6, 12.5) }, "hash for width 100"), /* @__PURE__ */ React.createElement(Txt4, { x: 1560, y: RY(11) + 6, mono: true, fs: 17, color: PAL4.bad, a: E4(t, 26.4) }, "unreachable by lookup"), /* @__PURE__ */ React.createElement(Badge4, { x: 1395, y: RY(9) + 17, text: "hash for width 200 now says bucket 7", tone: "pull", a: win3(t, 13, 18.5), fs: 17 }), /* @__PURE__ */ React.createElement(Tok, { t, keys: [[18.6, 1700, 210 + 20], [19.6, 1640, RY(7) + 17]], text: "get(key) \u2192 [7]", tone: "bad", w: 220, until: 22.4 }), /* @__PURE__ */ React.createElement(Mark3, { x: 1210, y: RY(7) + 17, ok: false, a: probe1 }), /* @__PURE__ */ React.createElement(Tok, { t, keys: [[22.6, 1700, 230], [23.4, 1660, RY(11) + 17]], text: "new key(100) \u2192 [11]", tone: "bad", w: 250, until: 25.8 }), /* @__PURE__ */ React.createElement(Badge4, { x: 1395, y: RY(13) + 17, text: "found, but equals() fails: 200 \u2260 100", tone: "bad", a: probe2, fs: 17 }), /* @__PURE__ */ React.createElement(RArrow, { pts: [[1180, RY(7) + 17], [1206, RY(7) + 17]], draw: M3(t, 28.2, 0.3) }), /* @__PURE__ */ React.createElement(Box4, { x: 1210, y: RY(7), w: 330, h: 34, label: "key(cat.png, 200) \u2192 200px", tone: "flow", a: POP3(t, 28.2), fs: 17 }), /* @__PURE__ */ React.createElement(Txt4, { x: 1e3, y: RY(15) + 46, mono: true, fs: 19, color: t > 28.4 ? PAL4.bad : PAL4.ink, a: E4(t, 26.4) }, "size() = ", t > 28.4 ? 2 : 1));
  }
  function SLeakCache({ t }) {
    const k = Math.max(0, Math.floor((t - 20) / 0.9));
    const f = t < 20 ? 0 : M3(t, 20 + k * 0.9, 0.5);
    const ids = Array.from({ length: 9 }, (_, i) => k + i + 1);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(LeakTag, { n: 7, a: E4(t, 0.5) }), /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 196, w: 820, h: 196, title: "Cache.java \xB7 unbounded", a: E4(t, 0.4), fs: 18, lh: 32, lines: [
      { s: "Map<String, byte[]> cache = new HashMap<>();   // unbounded", tone: "bad", toneA: win3(t, 1, 13.5) },
      "byte[] thumb(String url) {",
      "    return cache.computeIfAbsent(url, Cache::decode);",
      "}"
    ] }), /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 414, w: 820, h: 278, title: "the fix \xB7 a bounded LRU", a: E4(t, 13.5), fs: 17, lh: 30, lines: [
      "class Lru<K, V> extends LinkedHashMap<K, V> {",
      "    final int max;",
      { s: "    Lru(int max) { super(16, 0.75f, true); this.max = max; }", tone: "green", toneA: win3(t, 14, 20) },
      { s: "    protected boolean removeEldestEntry(Map.Entry<K, V> e) {", tone: "green", toneA: win3(t, 20, 28) },
      { s: "        return size() > max;", tone: "green", toneA: win3(t, 20, 28) },
      "    }",
      "}"
    ] }), /* @__PURE__ */ React.createElement(Console3, { x: 96, y: 714, w: 820, h: 216, t, a: E4(t, 6), fs: 17, lh: 28, title: "terminal \xB7 JDK 17 \xB7 long line wrapped", items: [
      { at: 6.4, text: "java -Xmx32m Cache unbounded", kind: "cmd" },
      { at: 7, text: "unbounded: java.lang.OutOfMemoryError: Java heap space", kind: "err" },
      { at: 7.1, text: "    at image 289, cache size = 288", kind: "err" },
      { at: 28, text: "java -Xmx32m Cache lru", kind: "cmd" },
      { at: 28.6, text: "lru: 2000 distinct images requested, cache size = 100", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(Panel3, { x: 960, y: 196, w: 864, h: 230, title: "LinkedHashMap \xB7 access order", right: "max = 100 \xB7 8 drawn", a: E4(t, 19.5) }), /* @__PURE__ */ React.createElement(Txt4, { x: 984, y: 258, mono: true, fs: 17, color: PAL4.bad, a: E4(t, 20) }, "head = eldest \u2192 evicted"), /* @__PURE__ */ React.createElement(Txt4, { x: 1800, y: 258, anchor: "right", mono: true, fs: 17, color: PAL4.flow, a: E4(t, 20) }, "tail = newest / just used"), t >= 19.5 && ids.map((id, i) => {
      const x = 984 + (i - f) * 102;
      const a = i === 0 ? 1 - f : i === 8 ? f : 1;
      return /* @__PURE__ */ React.createElement(Box4, { key: id, x, y: 300 + (i === 0 ? f * 40 : 0), w: 92, h: 60, label: `img${id}`, tone: i === 0 ? "bad" : i >= 7 ? "flow" : "ink", a: a * E4(t, 19.5), fs: 17 });
    }), /* @__PURE__ */ React.createElement(
      Chart,
      {
        x: 960,
        y: 450,
        w: 864,
        h: 480,
        a: E4(t, 5),
        title: "cache size vs distinct images requested",
        xmax: 2e3,
        ymax: 300,
        yTicks: [0, 100, 200, 300],
        xTicks: [[0, "0"], [1e3, "1000"], [2e3, "2000"]],
        series: [{ pts: [[0, 0], [288, 288]], color: PAL4.bad, n: lerp4(1, 2, lin3(t, 6, 5)) }, { pts: [[0, 0], [100, 100], [2e3, 100]], color: PAL4.flow, n: lerp4(1, 3, lin3(t, 28, 5)) }]
      }
    ), /* @__PURE__ */ React.createElement(Badge4, { x: 1210, y: 540, text: "OOM at image 289", tone: "bad", solid: true, a: POP3(t, 11), fs: 17 }), /* @__PURE__ */ React.createElement(Badge4, { x: 1560, y: 770, text: "capped at 100", tone: "flow", a: E4(t, 32), fs: 17 }), /* @__PURE__ */ React.createElement(Callout3, { x: 980, y: 520, w: 540, tone: "pull", a: E4(t, 35), fs: 19, text: "Production: **Caffeine**. Size or weight bounds, expiry, stats, concurrency." }));
  }

  // src/topics/8.7/scenes4.jsx
  var {
    PAL: PAL5,
    MOTION: MOTION5,
    lin: lin4,
    lerp: lerp5,
    win: win4,
    pulse: pulse5,
    clamp: clamp5,
    hexA: hexA5,
    MONO: MONO5,
    SANS: SANS5,
    Txt: Txt5,
    Panel: Panel4,
    Box: Box5,
    Code: Code4,
    Console: Console4,
    HArrow: HArrow4,
    Card: Card4,
    Badge: Badge5,
    Callout: Callout4,
    toneColor: toneColor5
  } = window.AN;
  var E5 = MOTION5.enter;
  var M4 = MOTION5.move;
  var POP4 = MOTION5.pop;
  var PAUSES = [[23.523, "young"], [7.596, "young"], [2.743, "young"], [2.53, "young"], [2.708, "young"], [0.605, "young"], [0.345, "young"], [0.334, "young"], [19.162, "FULL"]];
  function SSystemGc({ t }) {
    const cards = [
      ["Usually a full GC", "Stop-the-world, whole heap: 19 ms here, against 0.3 ms young pauses.", 12.5, "bad"],
      ["It undoes adaptive sizing", "G1 had grown the heap to 283M. The full GC shrank it to 144M.", 20, "pull"],
      ["It is only a hint", "`-XX:+DisableExplicitGC` makes it a no-op.", 27, "violet"],
      ["It fixes nothing", "Leaked objects are reachable. Leak 1: full GCs went 30M \u2192 29M.", 33.5, "bad"]
    ];
    const BX = 900, BASE = 560, MAXH = 260;
    const committed = t < 6 ? 130 : t < 20 ? lerp5(130, 283, lin4(t, 6, 5)) : lerp5(283, 144, M4(t, 20.2, 0.8));
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code4, { x: 96, y: 196, w: 700, h: 112, title: "anywhere in production code", a: E5(t, 0.4), fs: 24, lh: 44, lines: [{ s: "System.gc();      // \u274C", tone: "bad" }] }), cards.map(([title, sub, at, tone], i) => /* @__PURE__ */ React.createElement(Card4, { key: title, x: 96, y: 330 + i * 146, w: 700, h: 132, a: E5(t, at), title, sub, tfs: 25, sfs: 19, tone, glow: win4(t, at, at + 6) * 0.8 })), /* @__PURE__ */ React.createElement(Panel4, { x: 840, y: 196, w: 984, h: 400, title: "pause per GC (ms) \xB7 -Xlog:gc \xB7 JDK 17 \xB7 G1", a: E5(t, 5.5) }), PAUSES.map(([ms, kind], i) => {
      const at = i < 8 ? 6 + i * 0.6 : 12.5;
      const h = ms / 25 * MAXH * E5(t, at, 0.5);
      const full = kind === "FULL";
      const c = full ? PAL5.bad : PAL5.flow;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: BX + i * 100, top: BASE - h, width: 70, height: Math.max(h, 2), borderRadius: "6px 6px 0 0", background: hexA5(c, 0.45), border: `2px solid ${c}`, boxSizing: "border-box", opacity: E5(t, at) } }), /* @__PURE__ */ React.createElement(Txt5, { x: BX + i * 100 + 35, y: BASE - h - 30, anchor: "mid", mono: true, fs: 17, color: c, a: E5(t, at) }, ms < 1 ? ms.toFixed(2) : ms.toFixed(1)), /* @__PURE__ */ React.createElement(Txt5, { x: BX + i * 100 + 35, y: BASE + 8, anchor: "mid", mono: true, fs: 17, color: full ? PAL5.bad : PAL5.ink3, a: E5(t, at) }, full ? "gc()" : `GC${i}`));
    }), /* @__PURE__ */ React.createElement(Badge5, { x: 1250, y: 300, text: "warm-up", tone: "ink", a: E5(t, 8), fs: 17 }), /* @__PURE__ */ React.createElement(Badge5, { x: 1600, y: 300, text: "Pause Full (System.gc())", tone: "bad", solid: true, a: POP4(t, 12.8), fs: 17 }), /* @__PURE__ */ React.createElement(Gauge, { x: 840, y: 616, w: 984, value: committed, max: 300, label: "committed heap (G1 adaptive sizing)", right: `${Math.round(committed)}M`, a: E5(t, 6) }), /* @__PURE__ */ React.createElement(Console4, { x: 840, y: 712, w: 984, h: 218, t, a: E5(t, 12), fs: 17, lh: 28, title: "terminal \xB7 JDK 17 \xB7 abridged", items: [
      { at: 12.2, text: "java -Xmx512m -Xlog:gc ExplicitGc", kind: "cmd" },
      { at: 12.5, text: "calling System.gc()" },
      { at: 12.9, text: "GC(8) Pause Full (System.gc()) 203M->39M(144M) 19.162ms", kind: "err" },
      { at: 27.4, text: "java -Xmx512m -Xlog:gc -XX:+DisableExplicitGC ExplicitGc", kind: "cmd" },
      { at: 27.9, text: "GC(7) Pause Young (Normal) (G1 Evacuation Pause) 61M->40M(283M)", kind: "dim" },
      { at: 28.4, text: "calling System.gc()", kind: "ok" },
      { at: 28.8, text: "live arrays: 2000" }
    ] }), /* @__PURE__ */ React.createElement(Badge5, { x: 1640, y: 846, text: "no GC line follows", tone: "flow", a: E5(t, 28.6), fs: 17 }), /* @__PURE__ */ React.createElement(Badge5, { x: 1824, y: 130, anchor: "right", text: "legitimate: tests and benchmark setup only", tone: "pull", a: E5(t, 47), fs: 17 }));
  }
  var TRAPS = [
    [3, "\u201CSoftReference makes a good cache\u201D", "Opaque LRU-clock policy, full or empty. Use Caffeine or a bounded LRU."],
    [8.5, "\u201CWeakHashMap values are weak\u201D", "**Keys** are weak. A value that points at its key keeps the entry forever."],
    [14, "\u201CWeak refs clear at the very next GC\u201D", "At the next GC that covers the referent, and only if no soft path is left."],
    [19.5, "\u201CCleaner replaces try-with-resources\u201D", "A backstop only. And its action must never capture `this`."],
    [25, "\u201CThreadLocal is fine without remove()\u201D", "Pooled threads keep the value: memory, and data across requests."],
    [30.5, "\u201CSystem.gc() before heavy work helps\u201D", "A full GC and discarded sizing. If it seems to help, find the leak."]
  ];
  function STraps({ t }) {
    return TRAPS.map(([at, myth, real], i) => {
      const y = 196 + i * 122;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, /* @__PURE__ */ React.createElement(Box5, { x: 96, y, w: 760, h: 108, label: myth, mono: false, fs: 22, tone: "bad", a: E5(t, at), strike: t > at + 2 }), /* @__PURE__ */ React.createElement(HArrow4, { x1: 870, x2: 940, y: y + 54, a: E5(t, at + 1.5), color: PAL5.flow }), /* @__PURE__ */ React.createElement(Card4, { x: 956, y, w: 868, h: 108, a: E5(t, at + 1.6), tone: "flow", title: real, tfs: 22 }));
    });
  }
  var RECAP = [
    [3, "1", "Reachability", "Alive = reachable from a root. The **strongest** path decides the level."],
    [8, "2", "Soft and weak", "Soft: cleared when memory is short (LRU clock). Weak: the next GC that sees it."],
    [13, "3", "Phantom + queues", "`get()` is always null. Enqueued after collection. Keep the Reference reachable."],
    [18, "4", "WeakHashMap", "Weak keys, strong values. Stale entries leave when you next touch the map."],
    [23, "5", "Cleanup", "`finalize()`: deprecated for removal. try-with-resources first, `Cleaner` as backstop."],
    [28, "6", "Leaks", "Static maps, listeners, ThreadLocal, inner classes, resources, keys, caches. Not `System.gc()`."]
  ];
  function SRecap({ t }) {
    return RECAP.map(([at, n, title, sub], i) => /* @__PURE__ */ React.createElement(Card4, { key: n, x: 96 + i % 3 * 584, y: 210 + Math.floor(i / 3) * 330, w: 560, h: 300, num: n, title, sub, tfs: 34, sfs: 24, a: E5(t, at), tone: i === 5 ? "bad" : void 0, glow: i === 5 ? win4(t, 28.5, 40) : 0 }));
  }

  // src/topics/8.7.jsx
  var chapters = ["Intro", "Reachability", "Four strengths", "Soft vs weak", "ReferenceQueue", "WeakHashMap", "finalize()", "Cleaner", "Leak shapes", "System.gc()", "Traps", "Recap"];
  var scenes = [
    { name: "Intro", dur: 24, ch: 0, title: "", C: SIntro },
    { name: "Reachability", dur: 60, ch: 1, title: "Alive means reachable", C: SReachability },
    { name: "FourStrengths", dur: 72, ch: 2, title: "Four strengths, one GC cycle", C: SFourStrengths },
    { name: "StrengthTable", dur: 34, ch: 2, title: "The four strengths side by side", C: SStrengthTable },
    { name: "StrongestPath", dur: 46, ch: 3, title: "The strongest path decides", C: SStrongestPath },
    { name: "SoftPolicy", dur: 54, ch: 3, title: "When is memory \u201Cshort\u201D?", C: SSoftPolicy },
    { name: "WeakOldGen", dur: 40, ch: 3, title: "\u201CThe next GC\u201D is not always next", C: SWeakOldGen },
    { name: "RefQueue", dur: 64, ch: 4, title: "How a Reference reaches your queue", C: SRefQueue },
    { name: "WeakMapVanish", dur: 58, ch: 5, title: "WeakHashMap: how an entry disappears", C: SWeakMapVanish },
    { name: "WeakMapTraps", dur: 48, ch: 5, title: "Three WeakHashMap surprises", C: SWeakMapTraps },
    { name: "Finalize", dur: 60, ch: 6, title: "finalize() brings an object back", C: SFinalize },
    { name: "FinalizeProblems", dur: 40, ch: 6, title: "Why finalize() was a mistake", C: SFinalizeProblems },
    { name: "CleanerVsTwr", dur: 60, ch: 7, title: "Cleaner vs try-with-resources", C: SCleanerVsTwr },
    { name: "CleanerTrap", dur: 46, ch: 7, title: "The one Cleaner rule", C: SCleanerTrap },
    { name: "LeakStatic", dur: 50, ch: 8, title: "Static collections", C: SLeakStatic },
    { name: "LeakListeners", dur: 40, ch: 8, title: "Listeners never removed", C: SLeakListeners },
    { name: "LeakThreadLocal", dur: 62, ch: 8, title: "ThreadLocal in a thread pool", C: SLeakThreadLocal },
    { name: "LeakInner", dur: 40, ch: 8, title: "Inner classes hold their outer object", C: SLeakInner },
    { name: "LeakResources", dur: 38, ch: 8, title: "Resources never closed", C: SLeakResources },
    { name: "LeakMutatedKey", dur: 42, ch: 8, title: "Keys mutated inside a map", C: SLeakMutatedKey },
    { name: "LeakCache", dur: 46, ch: 8, title: "Caches with no eviction", C: SLeakCache },
    { name: "SystemGc", dur: 54, ch: 9, title: "Why you never call System.gc()", C: SSystemGc },
    { name: "Traps", dur: 37, ch: 10, title: "Traps", C: STraps },
    { name: "Recap", dur: 36, ch: 11, title: "Recap", C: SRecap }
  ];
  var captions = {
    Intro: [[0.8, "An object lives as long as something can reach it. Nothing else matters to the collector."], [6, "Java lets you hold an object **loosely**: soft, weak and phantom references, each weaker than the last."], [12.5, "And when something holds an object too tightly by accident, that is a memory leak."], [18, "One running example all the way: an image viewer and its cache of pictures."]],
    Reachability: [[0.5, "First, a reminder from 8.5: the collector starts from **GC roots**: thread stacks, static fields, JNI handles."], [7, "It follows every reference it finds, marking each object it reaches."], [13, "Whatever it never reaches is garbage, cycles included. Two objects pointing at each other don't save each other."], [20, 'So a Java object dies when nothing reachable points at it. There is no "delete", and no reference count.'], [27, "A `WeakReference` is itself an ordinary object. Here a local variable holds it strongly."], [33, "Inside it, `javap` shows four fields. One of them, `referent`, is special."], [39, "When marking reaches a Reference object, it does **not** follow `referent`. It notes the Reference, and decides later."], [47, "That gives five levels of reachability, from strongly reachable down to unreachable."], [53, "The strongest path to an object decides its level. Now let's meet the four strengths."]],
    FourStrengths: [[0.5, "Four images, each held a different way. `a` is an ordinary local variable: a strong reference."], [7, "`b` is held through a `SoftReference`, `c` through a `WeakReference`, `d` through a `PhantomReference`."], [13.5, "All three register a `ReferenceQueue`. And `d.get()` already returns null: a phantom never gives the object back."], [19, "Now `System.gc()`. The weak referent `c` is cleared at once: nothing strong or soft holds it."], [25.5, "The phantom referent `d` is collected too, and both Reference objects land on the queue."], [32, "`b` survives: a soft referent is kept while there is room. And `a` is untouchable."], [38, "Now apply memory pressure: allocate 1 MB blocks until the heap is nearly full."], [45, "G1 tries young GCs, then full GCs that still keep soft referents. 61M stays 61M."], [51.5, "Only a last-ditch full GC clears soft references: 61M down to 59M. `b` is gone, and its reference is queued."], [59, "Real JDK 17 output. `a`, the strong one, was never at risk."], [65, "And the queue told us exactly **which** references were cleared, without checking each one."]],
    StrengthTable: [[0.5, "The four strengths side by side."], [4, "Strong references keep an object alive. Period."], [9, "Soft: kept until memory runs short. The JVM promises to clear all of them before throwing `OutOfMemoryError`."], [16, "Weak: cleared at the next GC that notices, whether memory is short or not."], [22, "Phantom: `get()` is always null. It only tells you, through the queue, that the object is gone."], [28, "Memory pressure matters only to soft references. Weak ones never wait for it."]],
    StrongestPath: [[0.5, "One image, held all four ways at once. Which references get cleared?"], [6, "Drop the strong one: `img = null`. The image is now reachable only through Reference objects."], [12.5, "Run `System.gc()`. Nothing is cleared, not even the weak reference. Real output."], [19, "Why? Reachability is decided by the **strongest** path. A soft path exists, so the image is softly reachable."], [26, "Now memory pressure. The soft reference gives way, and in that same GC so does the weak one."], [32, "The image is collected, and all three references arrive on the queue together."], [38, "The rule: soft and weak references to one object are cleared atomically. Then the phantom is enqueued."]],
    SoftPolicy: [[0.5, 'When is memory "short"? HotSpot uses a clock, not a fill level.'], [5, "Every `SoftReference` has a `timestamp`, refreshed by each `get()`. A static `clock` advances at every GC."], [12, "A soft referent survives if it was used recently: within free heap in MB, times 1000 ms."], [19.5, "With 63 MB free, an untouched entry gets about a minute. Shrink the factor, and the same idle entry is cleared."], [27, "Real output: idle for 1.5 s. At 1000 ms per MB it survives; at 10 or 0 it is cleared."], [33, "Now a cache of 200 soft thumbnails, while the app slowly needs more memory."], [39, "All 200 survive, then one full GC clears every entry at once. 200 to zero."], [46, "A cache that is full or empty, never in between. Use a bounded cache like Caffeine instead."]],
    WeakOldGen: [[0.5, '"Weak references are cleared at the next GC." Mostly true. Here is the catch.'], [6, "One object is promoted to the old generation by a full GC. Another is young. Each has a `WeakReference`."], [13, "Drop both strong references, then make garbage. G1 runs young GCs: thirteen of them."], [20, "Each young GC scans only young regions. The young referent is cleared; the old one is still alive."], [26.5, "Only a GC that covers the old region, here a full GC, clears it."], [33, 'So weak means "at the next GC that examines it". For old objects, that can be minutes away.']],
    RefQueue: [[0.5, "How does a cleared reference reach your queue? Follow one `WeakReference` through its life."], [5.5, "It starts **active**: the referent is set, and the GC examines it at every cycle."], [11, "When the GC finds the referent only weakly reachable, it clears it and links the Reference onto a **pending list**."], [18, "A high-priority JVM thread, the **Reference Handler**, drains that list and enqueues each Reference on its queue."], [24.5, "Your code then sees it with `poll()` or a blocking `remove()`. After that it is inactive: done."], [31, "Now use it. Each `Texture` owns a GPU handle. A `PhantomReference` subclass carries a copy of that handle."], [38, "A cleanup thread blocks in `remove()`. The GC runs: `sea.png` and `sun.png` are unreachable."], [44, "`sea.png`'s `TextureRef` is enqueued and the thread frees the handle. `get()` is null: it can't touch the texture."], [51, "But `sun.png` was never reported. Its `TextureRef` was garbage too: nothing held the Reference object."], [57, "Rule: keep your Reference objects strongly reachable, in a set, until they are processed."]],
    WeakMapVanish: [[0.5, "A `WeakHashMap` keyed by `Page`: each open page gets a thumbnail that should vanish when the page closes."], [7, "Inside, every entry **is** a `WeakReference` to its key. The value is an ordinary strong field."], [13.5, "The map also owns a private `ReferenceQueue`, and every entry is registered with it."], [19, "Page 1 closes: `p1 = null`. Now only the entry's weak `referent` points at it."], [24.6, "GC: the key is cleared and collected, and the entry is enqueued on the map's queue."], [31, "But the entry is still in the table, still holding the thumbnail. Real output: 2 slots in use."], [38.5, "The next time you touch the map, `size()`, `get()` or `put()`, it runs `expungeStaleEntries()`."], [45, "It drains the queue and unlinks each stale entry. Now the thumbnail is garbage too."], [51, "Entries vanish in two steps: the GC clears the key, and the map cleans up later."]],
    WeakMapTraps: [[0.5, "Three ways a `WeakHashMap` surprises people."], [4, "One: the value points back at its key. The map holds values strongly, so the key stays strongly reachable."], [11.5, "The entry never clears. Keep values free of their keys, or hold the key weakly inside the value."], [19, "Two: string literals as keys. Literals are interned and held by the JVM, so they never go away."], [26, "Three: a weak listener registry. A listener registered as an inline lambda has nothing else holding it."], [33, "The next GC removes it, though the viewer is alive and open. The listener silently stops firing."], [40, "So the owner must hold its listener in a field. And never count on an entry still being there."]],
    Finalize: [[0.5, "Before references, Java had `finalize()`: a method the GC calls before reclaiming an object."], [6, "Because `Zombie` overrides it, the JVM registers each new instance with a hidden `Finalizer` reference, at allocation."], [13, "Drop the last strong reference and call `System.gc()`. Reference processing runs in four phases."], [19, "Phase 2 clears the `WeakReference`. As far as weak references know, the object is dead."], [25, "Phase 3 marks it alive again, with everything it references, and queues it for the **Finalizer** thread."], [32, "The Finalizer thread runs `finalize()`, which stores `this` in a static field. The object is back from the dead."], [39.5, "Real output: the weak reference was cleared, yet `saved` holds that very same object."], [46, "Drop it again and GC: this time it is simply collected. `finalize()` never runs twice."], [53, "The cost: every finalizable object needs at least two GCs to die, and a thread you don't control."]],
    FinalizeProblems: [[0.5, "Six problems, all fundamental."], [3.5, "It may never run, not even at exit. And when it does, you don't know when, or in what order."], [10.5, "It slows collection. It can resurrect objects. And exceptions thrown inside it are silently ignored."], [18, "And the finalizer attack: a subclass's `finalize()` can grab a half-built object whose constructor threw."], [25, "Deprecated in Java 9, deprecated **for removal** in 18. Java 18 also added `--finalization=disabled`."], [33, "It's still present in Java 25, but treat it as gone. Its replacement, `Cleaner`, is built on phantom references."]],
    CleanerVsTwr: [[0.5, "`Cleaner` is the supported replacement: phantom references plus a thread, packaged up."], [6, "`register(this, action)` returns a `Cleanable`. The Cleaner holds the action and a phantom reference to the texture."], [13, "The action, a static nested record, holds only the handle. It never points back at the texture."], [19.5, "Path one: try-with-resources. `close()` calls `clean()` at the end of the block, on your own thread."], [27, "Deterministic: the GPU memory comes back exactly when the block ends."], [32.5, "Path two: someone forgets `close()`. The texture becomes unreachable, and nothing happens yet."], [39.5, "Only when a GC notices does the Cleaner's own thread, `Cleaner-0`, run the action. Maybe soon, maybe never."], [47, "Either way, the action runs at most once. A second `clean()` does nothing."], [53, "So try-with-resources is the answer. `Cleaner` is only a safety net, for native memory."]],
    CleanerTrap: [[0.5, "The one rule of `Cleaner`: the action must not reference the object it cleans."], [5.5, "This lambda reads `this.name`, so it captures `this`."], [11, "The Cleaner is reachable from its thread, the action from the Cleaner, and the texture from the action."], [18, "A strong path exists, so the texture never becomes phantom reachable. Two GCs later: nothing."], [26, "A leak and a missed cleanup at once. It's the same hidden `this` that inner classes carry."], [32, "The fix: a static nested class or record that copies just what cleanup needs: the handle."], [38.5, "The opposite trap: an object can become unreachable while its own method still runs. `reachabilityFence` prevents that."]],
    LeakStatic: [[0.5, "A Java leak is unintentional reachability. Leak one, the most common: a static collection that only grows."], [5, "A static field is a GC root. Everything the map reaches lives as long as the class: usually forever."], [12, "Each request adds a 100 KB session, and nothing ever removes it."], [18, "Watch the heap: 14M, 17M, 19M after successive GCs. The GC is working; it just can't free anything."], [26, "Full GCs at 30M free almost nothing. `OutOfMemoryError` at request 292. Real run, 32 MB heap."], [34, "The fix: remove the entry when the request ends. Or bound the map, or don't make it static."], [41, "Now each GC drops the heap back to 1M. A sawtooth, not a climb: that is a healthy heap."]],
    LeakListeners: [[0.5, "Leak two: listeners that are added and never removed."], [5, "Each viewer registers a theme listener. The lambda calls `repaint()`, so it captures the viewer."], [11.5, "The viewer closes, but the app-wide theme manager still holds the listener, which holds the viewer and its image."], [19, "Open and close enough viewers and the heap fills: `OutOfMemoryError` after 296, with 295 still registered."], [27, "Fix: unregister in `close()`. A thousand viewers later, zero listeners remain."], [33.5, "A weak registry works too, but only if the viewer holds its listener in a field. Remember the vanishing lambda."]],
    LeakThreadLocal: [[0.5, "Leak three, the nasty one: a `ThreadLocal` in a thread pool."], [5, "Each `Thread` object owns a map. `CONTEXT.set()` puts an entry into the current thread's map."], [11.5, "The entry is a weak reference to the `ThreadLocal` key, but its value is held strongly."], [18, "Request one, alice, sets her context. The request ends. The context stays, attached to the thread."], [25, "In a pool the thread is reused, never destroyed. Bob's request overwrites the value, and it stays too."], [31, "Then an anonymous request on the same thread reads bob's context. Real output. That's a data leak."], [38.5, "And memory: eight idle pool threads keep 4 MB each. After a full GC, 33M is still live."], [46.5, "The fix is mandatory in pools: `remove()` in a `finally`. Nobody's context leaks, and the full GC frees it all."], [54.5, "On an app server, a value from your webapp's classes pins the whole class loader after a redeploy."]],
    LeakInner: [[0.5, "Leak four: an inner class instance that outlives its outer object."], [5, "A non-static inner class gets a hidden field, `this$0`, pointing at its enclosing instance. `javap -p` shows it."], [12.5, "Queue a tiny `Refresh` task in a long-lived scheduler, and it drags the whole closed viewer along."], [19, "Real output: `OutOfMemoryError` after 292 viewers, with just 291 tiny tasks queued."], [26.5, "Fix: a `static` nested class that copies only what it needs. No `this$0`."], [32.5, "A thousand tasks, no problem. Capturing lambdas and anonymous classes hold `this` the same way."]],
    LeakResources: [[0.5, "Leak five: resources that are opened and never closed."], [5, "Every `FileInputStream` holds an OS file descriptor, plus buffers and native memory that a heap gauge never shows."], [12, "Here the heap stays nearly empty, so no GC runs, and nothing ever releases the descriptors."], [18.5, "Real output, with the limit set to 256: after 253 reads, `Too many open files`."], [25, "The fix is try-with-resources: closed at the end of the block, every time. 5,000 reads, no problem."], [31.5, "The JDK's own cleaner would close them after some GC, eventually. Never rely on that."]],
    LeakMutatedKey: [[0.5, "Leak six isn't quite a leak, but it looks like one: a key mutated while inside a `HashMap`."], [6, "`ImageKey` uses `width` in `hashCode()`. Put it in the map, and its hash picks bucket 11."], [12.5, "Now set `width` to 200. The entry doesn't move. It sits in the bucket for the old hash."], [18.5, "`get(key)` computes the new hash, looks in bucket 7, and finds nothing. Even a fresh key with width 100 can't match."], [26, "Yet `size()` is still 1. Put again, and the map holds two entries, one unreachable by any lookup."], [33.5, "The table still references it, so the GC keeps it. The fix: immutable keys, like a record."]],
    LeakCache: [[0.5, "Leak seven: a cache with no eviction. Every distinct image URL adds an entry, forever."], [6, "It looks like a cache but behaves like a static collection. Real output: `OutOfMemoryError` at image 289."], [13.5, "A cache needs a bound and an eviction policy. The simplest: a `LinkedHashMap` in access order."], [20, "Each `get` moves an entry to the tail. After each `put`, `removeEldestEntry` can drop the head: the least recently used."], [28, "With a bound of 100, two thousand distinct images later the cache holds exactly 100."], [35, "In production, use Caffeine: size or weight bounds, expiry, statistics, and good concurrency."], [40.5, "Seven shapes, one cause: something reachable that you forgot about."]],
    SystemGc: [[0.5, "Last: `System.gc()`. Here is what it actually does, from a real G1 log."], [6, "A busy program: eight young pauses. After warm-up, they take a third of a millisecond."], [12.5, "Then `System.gc()`: a **full**, stop-the-world collection of the whole heap. 19 ms here, far more on big heaps."], [20, "It also threw away what G1 had learned: the heap it had grown to 283 MB was shrunk to 144 MB."], [27, "And it's only a hint. With `-XX:+DisableExplicitGC`, the same call does nothing at all."], [33.5, "It can't fix a leak: leaked objects are reachable by definition. The full GCs in leak one freed almost nothing."], [41, "If `System.gc()` seems to help, you have a leak or a sizing problem. Fix that instead."], [47, "Legitimate uses: tests and benchmark setup, like the demos in this video. Never production code."]],
    Traps: [[0.5, "Six traps."], [3, "Soft references make a poor cache: full or empty."], [8.5, "In a `WeakHashMap` only the keys are weak."], [14, '"Next GC" means the next GC that covers the referent.'], [19.5, "`Cleaner` is a backstop, and its action must not capture `this`."], [25, "Pooled threads keep `ThreadLocal` values until you `remove()` them."], [30.5, "And `System.gc()` never helps. If it seems to, look for the leak."]],
    Recap: [[0.5, "Recap."], [3, "Alive means reachable from a root, and the strongest path decides how."], [8, "Soft references go when memory is short; weak ones at the next GC that sees them."], [13, "Phantoms report collection through a queue. Keep the Reference itself reachable."], [18, "`WeakHashMap`: weak keys, strong values, lazy cleanup."], [23, "try-with-resources first, `Cleaner` as a backstop, `finalize()` never."], [28, "And learn the seven leak shapes by sight. They are most of what you will meet."]]
  };
  var STRENGTHS_SRC = `import java.lang.ref.*;
import java.util.*;

public class Strengths {
    record Image(String name, byte[] px) {
        Image(String name) { this(name, new byte[1 << 20]); }   // 1 MB of pixels
        public String toString() { return name; }
    }
    static String show(Reference<?> r) { return r.refersTo(null) ? "cleared" : "alive"; }

    public static void main(String[] args) throws Exception {
        var queue = new ReferenceQueue<Image>();
        Image a = new Image("a.png");                                   // strong
        var b = new SoftReference<>(new Image("b.png"), queue);
        var c = new WeakReference<>(new Image("c.png"), queue);
        var d = new PhantomReference<>(new Image("d.png"), queue);
        Map<Reference<?>, String> names = Map.of(b, "soft b", c, "weak c", d, "phantom d");

        System.out.println("phantom.get() = " + d.get());
        System.gc();
        Thread.sleep(100);
        System.out.println("after GC  : a=" + a + "  b=" + show(b) + "  c=" + show(c) + "  d=" + show(d));
        for (Reference<?> r; (r = queue.poll()) != null; ) System.out.println("  queue.poll() -> " + names.get(r));

        List<byte[]> hog = new ArrayList<>();            // memory pressure
        int mb = 0;
        while (!b.refersTo(null)) { hog.add(new byte[1 << 20]); mb++; }
        System.out.println("pressure  : soft b cleared after allocating " + mb + " MB");
        hog = null;
        Thread.sleep(100);
        for (Reference<?> r; (r = queue.poll()) != null; ) System.out.println("  queue.poll() -> " + names.get(r));
        System.out.println("a is still " + a + " (strong: never collected while reachable)");
    }
}`;
  var TEXTURE_SRC = `public class Texture implements AutoCloseable {
    private static final Cleaner CLEANER = Cleaner.create();
    private final Cleaner.Cleanable cleanable;

    public Texture(String name) {
        long handle = allocGpu(name);
        // the action must NOT reference this, or the Texture is never collected
        this.cleanable = CLEANER.register(this, new Free(handle));
    }

    // a record nested in a class is implicitly static: no hidden outer reference
    private record Free(long handle) implements Runnable {
        public void run() { freeGpu(handle); }
    }

    @Override public void close() { cleanable.clean(); }   // runs the action at most once
}`;
  var notes = [
    { ch: 1, blocks: [
      { p: "**A Java object is alive exactly as long as it is reachable**: there is a chain of ordinary references to it from a **GC root**. Roots are the references the collector can find without looking in the heap: local variables and operands in every thread's stack frames, static fields of loaded classes, JNI handles, and a few JVM-internal ones (8.5 covers marking in detail). Anything not reached is garbage, including cycles: two objects pointing at each other keep nothing alive." },
      { mini: { scene: "Reachability" } },
      { p: "A `java.lang.ref.Reference` (soft, weak, phantom) is an ordinary heap object that you hold strongly. What makes it special is one field, **`referent`**: the GC does not trace through it during marking. It records the Reference on a *discovered* list and decides at the end of marking, by reference type, whether to clear it." },
      { tryit: { note: "The fields the GC works with, straight from the JDK:", cmd: "$ javap -p java.lang.ref.Reference", out: "public abstract class java.lang.ref.Reference<T> {\n  private T referent;\n  volatile java.lang.ref.ReferenceQueue<? super T> queue;\n  volatile java.lang.ref.Reference next;\n  private transient java.lang.ref.Reference<?> discovered;\n  ...\n  private static native java.lang.ref.Reference<?> getAndClearReferencePendingList();\n  public final boolean refersTo(T);\n  public static void reachabilityFence(java.lang.Object);" } },
      { table: { head: ["level", "meaning"], rows: [["strongly reachable", "a chain of ordinary references from a root"], ["softly reachable", "not strongly; reachable through a `SoftReference`"], ["weakly reachable", "not strongly or softly; reachable through a `WeakReference`"], ["phantom reachable", "finalized (if needed), reachable only through a `PhantomReference`"], ["unreachable", "reclaimable"]] } },
      { callout: { tone: "violet", title: "deeper: reference processing in HotSpot", text: "After marking, HotSpot processes discovered references in four phases. With `-Xlog:gc+phases+ref=debug` (JDK 17) they are logged as: **Reconsider SoftReferences** (apply the soft policy), **Notify Soft/WeakReferences** (clear the dead ones), **Notify and keep alive finalizable** (resurrect objects that still need `finalize()`), **Notify PhantomReferences**. Cleared References are linked through `discovered` into the VM's pending list, which the Java-side Reference Handler thread drains." } }
    ] },
    { ch: 2, blocks: [
      { p: "The running example: an image viewer holding `Image`s of 1 MB each. Four images, held four ways, then one `System.gc()` and one memory-pressure episode:" },
      { code: STRENGTHS_SRC, title: "Strengths.java (JDK 16+ for refersTo)" },
      { mini: { scene: "FourStrengths" } },
      { tryit: { note: "Real output (JDK 17, G1). The full log has ~20 GC lines during the pressure phase; the relevant ones are kept and decorations trimmed.", cmd: "$ java -Xmx64m -Xlog:gc Strengths", out: "phantom.get() = null\nGC(0) Pause Full (System.gc()) 9M->5M(24M) 1.757ms\nafter GC  : a=a.png  b=alive  c=cleared  d=cleared\n  queue.poll() -> weak c\n  queue.poll() -> phantom d\n...\nGC(13) Pause Full (G1 Compaction Pause) 59M->59M(64M) 1.194ms\nGC(17) Pause Full (G1 Compaction Pause) 61M->61M(64M) 1.222ms\nGC(18) Pause Full (G1 Compaction Pause) 61M->59M(64M) 0.937ms\npressure  : soft b cleared after allocating 29 MB\n  queue.poll() -> soft b\na is still a.png (strong: never collected while reachable)" } },
      { p: "Notice GC(17) and GC(18): G1 first runs a full GC that **keeps** soft referents; only when that frees nothing does it run a last-ditch full GC that clears all soft references. That is the spec's guarantee in action: every soft reference is cleared before an `OutOfMemoryError`." },
      { mini: { scene: "StrengthTable" } },
      { table: { head: ["strength", "referent cleared\u2026", "`get()`", "use for"], rows: [["**strong**", "never, while strongly reachable", "n/a", "everything normal"], ["**soft**", "when the GC decides memory is short; all before an OOM", "object or null", "memory-sensitive caches (badly: see next chapter)"], ["**weak**", "at the next GC that finds it only weakly reachable", "object or null", "canonicalising maps, metadata, listener registries"], ["**phantom**", "after collection: enqueued (and cleared automatically since Java 9)", "**always null**", "post-mortem cleanup; the basis of `Cleaner`"]] } },
      { callout: { tone: "bad", title: "correction to the source note", text: 'The note says the collector clears them "strong > soft > weak > phantom\u2026 in that order when it needs memory". The ordering of **strength** is right, but clearing is not driven by need except for soft references. A weak reference is cleared by any GC that finds its referent only weakly reachable, even with gigabytes free.' } }
    ] },
    { ch: 3, blocks: [
      { h: "The strongest path decides" },
      { mini: { scene: "StrongestPath" } },
      { tryit: { note: "One `Image` with a soft, a weak and a phantom reference, and no strong one:", cmd: "$ java -Xmx64m SameObject", out: "after System.gc(): soft=alive weak=alive phantom=alive\n  queue.poll() -> null\nafter pressure:    soft=cleared weak=cleared phantom=cleared\n  queue.poll() -> soft\n  queue.poll() -> weak\n  queue.poll() -> phantom" } },
      { p: "The weak reference survived the first GC because the image was **softly** reachable. The spec requires soft and weak references to an object to be cleared atomically, at the moment it stops being softly (or weakly) reachable; the phantom reference is enqueued once the object is truly gone. Don't read anything into the poll order." },
      { h: 'How HotSpot decides memory is "short"' },
      { mini: { scene: "SoftPolicy" } },
      { code: "keep a soft referent if:\n    clock - timestamp  <=  freeMB * SoftRefLRUPolicyMSPerMB      (default 1000 ms per MB)\n\nclock      static, set at the end of every GC\ntimestamp  per reference, set to clock by the constructor and by each get()\nfreeMB     max heap minus used at the last GC (server VMs)", lang: "plain", title: "the LRU soft-reference policy (HotSpot)" },
      { tryit: { note: "A 1 MB soft referent, idle for 1.5 s, then GCs. The clock only advances at the end of a GC, so the test runs one GC before sleeping and two after.", cmd: '$ for f in 1000 10 0; do echo "SoftRefLRUPolicyMSPerMB=$f"; java -Xmx64m -XX:SoftRefLRUPolicyMSPerMB=$f SoftClock; done', out: "SoftRefLRUPolicyMSPerMB=1000\nsoft ref after 1.5 s idle + GC: alive\nSoftRefLRUPolicyMSPerMB=10\nsoft ref after 1.5 s idle + GC: cleared\nSoftRefLRUPolicyMSPerMB=0\nsoft ref after 1.5 s idle + GC: cleared" } },
      { tryit: { note: "A cache of 200 soft 100 KB thumbnails while the app needs 4 MB more each round:", cmd: "$ java -Xmx48m Cache soft", out: "soft: cached 200 thumbnails (~20 MB)\n  app holds 4 MB -> cache entries still alive: 200\n  app holds 8 MB -> cache entries still alive: 200\n  app holds 12 MB -> cache entries still alive: 200\n  app holds 16 MB -> cache entries still alive: 0\n  app holds 20 MB -> cache entries still alive: 0" } },
      { callout: { tone: "pull", title: "why soft caches disappoint", text: "The policy is per-reference LRU on an opaque clock, and the clearing GC is usually the one that has run out of options, so it clears **everything** it may. You get a cache that is full or empty (200 \u2192 0 above, run to run the cliff moved between 12 and 16 MB), plus extra GC work for the collector. Use a size-bounded cache: Caffeine, or a `LinkedHashMap` LRU (leak 7)." } },
      { h: '"The next GC" is not always next' },
      { mini: { scene: "WeakOldGen" } },
      { tryit: { note: "Abridged: 13 young GCs are logged between the first two lines and the result.", cmd: "$ java -Xmx64m -Xlog:gc OldWeak", out: "GC(0) Pause Full (System.gc()) 1M->0M(10M) 0.773ms\nGC(1) Pause Young (Normal) (G1 Evacuation Pause) 2M->1M(10M) 0.107ms\n...\nGC(13) Pause Young (Normal) (G1 Evacuation Pause) 24M->1M(40M) 0.125ms\nafter young GCs: young referent cleared, old referent alive\nGC(14) Pause Full (System.gc()) 21M->1M(10M) 0.847ms\nafter full GC:   old referent cleared" } },
      { callout: { tone: "violet", title: "deeper", text: "A collector only discovers references whose referents lie in the part of the heap it is collecting. A young GC treats old objects as live without looking at them, so a weak referent that has been promoted waits for a concurrent cycle + mixed GC (G1), a full GC, or, with ZGC/Shenandoah, the next concurrent cycle. That is why `WeakHashMap` entries for long-lived keys can linger for a long time after the key is dropped." } }
    ] },
    { ch: 4, blocks: [
      { p: "A `ReferenceQueue` is how you learn that something **was** collected, without polling every reference." },
      { mini: { scene: "RefQueue" } },
      { steps: ["**Active**: referent set. Each GC that covers the referent checks its reachability.", "**Pending**: the GC cleared the referent (soft/weak; phantom since Java 9) and linked the Reference into the VM's pending list through `discovered`.", "**Enqueued**: the **Reference Handler** thread (priority 10) moved it onto the queue you registered, linked through `next`. A Reference registered with no queue skips this.", "**Inactive**: your thread took it with `poll()` (non-blocking) or `remove()` (blocking, optional timeout)."] },
      { tryit: { note: "The threads involved, in any JDK 17 process that created a Cleaner:", cmd: `$ jcmd <pid> Thread.print | grep '^"'`, out: '"Reference Handler" #2 daemon prio=10 os_prio=31 cpu=0.09ms elapsed=1.82s ... waiting on condition\n"Finalizer" #3 daemon prio=8 os_prio=31 cpu=0.10ms elapsed=1.82s ... in Object.wait()\n"Common-Cleaner" #13 daemon prio=8 os_prio=31 cpu=0.07ms elapsed=1.81s ... in Object.wait()\n"Cleaner-0" #14 daemon prio=8 os_prio=31 cpu=0.05ms elapsed=1.81s ... in Object.wait()' } },
      { code: "static final class TextureRef extends PhantomReference<Texture> {\n    final String name; final long handle;                  // what cleanup needs, copied out\n    TextureRef(Texture t, ReferenceQueue<Texture> q, long handle) { super(t, q); name = t.name(); this.handle = handle; }\n}\nstatic final ReferenceQueue<Texture> QUEUE = new ReferenceQueue<>();\nstatic final Set<TextureRef> LIVE = new HashSet<>();      // keeps the Reference objects themselves alive\n\n// cleanup thread\nwhile (true) {\n    var r = (TextureRef) QUEUE.remove();                 // blocks until the GC enqueues one\n    freeGpu(r.handle);\n    LIVE.remove(r);\n}", title: "Tracker.java (excerpt)" },
      { tryit: { cmd: "$ java Tracker", out: "System.gc()\n  cleanup thread: freeing GPU handle of sea.png  (get() = null)\nsky.png still in use: sky.png; sun.png was never reported" } },
      { callout: { tone: "bad", title: "the Reference must stay reachable", text: "`sun.png` was loaded with a `TextureRef` that nothing kept. The GC collected the `TextureRef` along with the texture, so it was never enqueued. Always hold registered references somewhere strong (a set, like `LIVE`) until the queue hands them back. `Cleaner` does this for you." } },
      { callout: { tone: "violet", title: "deeper", text: "`PhantomReference.get()` always returns null by design: you cannot resurrect the object, which is precisely the flaw that made finalizers dangerous. Copy what cleanup needs (the handle) into the Reference subclass. To test a reference without creating a strong reference, use `refersTo(null)` (Java 16+) rather than `get() == null`." } }
    ] },
    { ch: 5, blocks: [
      { p: "**Keys are weakly referenced**, values strongly. An entry disappears some time after nothing else holds its key." },
      { mini: { scene: "WeakMapVanish" } },
      { code: "static final class Page { final int number; Page(int n) { number = n; } }   // identity equals/hashCode\nrecord Thumbnail(byte[] px) {}\n\nMap<Page, Thumbnail> thumbs = new WeakHashMap<>();\nPage p1 = new Page(1), p2 = new Page(2);\nthumbs.put(p1, new Thumbnail(new byte[100_000]));\nthumbs.put(p2, new Thumbnail(new byte[100_000]));\np1 = null;                 // page 1 closed\nSystem.gc();", title: "Thumbs.java (excerpt)" },
      { tryit: { cmd: "$ java Thumbs", out: "size = 2\nafter gc, size = 1  keys = [Page2]\nvalue refers to key: after gc, size = 1  keys = [Page3]\nstring literal key: after gc, size = 1" } },
      { tryit: { note: "Peeking at the private fields with reflection shows the two steps: the GC clears the key, the map removes the entry on its next operation.", cmd: "$ java --add-opens java.base/java.util=ALL-UNNAMED Expunge", out: "after GC, before touching the map: internal size field = 2, table slots in use = 2\nm.size() = 1   <- expungeStaleEntries() ran inside size()\nafter size(): internal size field = 1, table slots in use = 1" } },
      { code: "class java.util.WeakHashMap$Entry<K, V> extends java.lang.ref.WeakReference<java.lang.Object> implements java.util.Map$Entry<K, V> {\n  V value;\n  final int hash;\n  java.util.WeakHashMap$Entry<K, V> next;", lang: "plain", title: "javap -p java.util.WeakHashMap$Entry (JDK 17)" },
      { h: "The traps" },
      { mini: { scene: "WeakMapTraps" } },
      { list: ["**Value refers to key**: the map holds the value strongly, the value holds the key, so the key is strongly reachable and the entry never clears. Keep the key out of the value, or hold it as a `WeakReference` inside the value.", "**Interned keys**: string literals (and small boxed integers from the `Integer` cache) are held by the JVM and never become weakly reachable.", "**Entries vanish nondeterministically**, whenever a GC covering the key runs. Never use it where an entry must still be there.", "**Weak listener registries** (`Collections.newSetFromMap(new WeakHashMap<>())`): a listener held only by the registry disappears at the next GC. The owner must keep it in a field."] },
      { tryit: { cmd: "$ java WeakRegistry", out: "registered: 2\nafter gc:   1   (viewer A is still alive and open)\n  viewer A repaints for dark" } },
      { callout: { tone: "violet", title: "deeper", text: "A non-capturing lambda (`t -> System.out.println(t)`) evaluates to a single cached instance held by its call site, so it never gets collected and will hide this bug in tests. The demo uses a capturing lambda, which is a new object each time. `ThreadLocalMap` uses the same weak-key/strong-value design as `WeakHashMap`, which is why it leaks values (leak 3)." } }
    ] },
    { ch: 6, blocks: [
      { mini: { scene: "Finalize" } },
      { code: 'class Zombie {\n    static Zombie saved;                                   // a GC root\n    final String name;\n    Zombie(String name) { this.name = name; }\n    @Override protected void finalize() {\n        System.out.println("  finalize() running on thread: " + Thread.currentThread().getName());\n        saved = this;                                      // resurrection\n    }\n}', title: "Zombie.java (excerpt)" },
      { tryit: { cmd: "$ javac -Xlint:deprecation Zombie.java && java Zombie", out: "Zombie.java:8: warning: [deprecation] finalize() in Object has been deprecated\nGC #1\n  finalize() running on thread: Finalizer\n  saved = cat.png, weak ref cleared\nGC #2\n  saved = null   (finalize() never runs twice)" } },
      { p: "The weak reference was cleared **before** the object was resurrected (phase 2 runs before phase 3), so after GC #1 the program has a live object whose weak reference says it is dead. Objects with a non-trivial `finalize()` are registered with a `java.lang.ref.Finalizer` (a `FinalReference`) at allocation, which itself costs time." },
      { mini: { scene: "FinalizeProblems" } },
      { table: { head: ["problem", "why"], rows: [["may never run", "no guarantee, not at exit either (`runFinalizersOnExit` is long gone)"], ["unpredictable timing", "runs on the Finalizer thread, whenever it gets there, in no order"], ["slows collection", "at least two GC cycles to reclaim; a slow finalizer backs up everyone"], ["resurrection", "`finalize()` can store `this` in a reachable place"], ["exceptions swallowed", "a throw is ignored, leaving a half-cleaned object"], ["security hole", "finalizer attack: subclass, let the constructor throw, grab `this` in `finalize()`"]] } },
      { callout: { tone: "bad", title: "correction to the source note", text: 'The note marks `finalize()` as "deprecated 9, REMOVED". It has **not** been removed: deprecated in Java 9, deprecated *for removal* in Java 18 (JEP 421), and still present in Java 25. JEP 421 also added `--finalization=disabled` (Java 18+; JDK 17 rejects it as an unrecognized option) so you can test whether your application or its libraries depend on finalization.' } },
      { callout: { tone: "violet", title: "deeper: defusing the finalizer attack", text: "The attack needs the object to be finalizable, which only happens once `Object.<init>` completes. Classes that validate in a constructor can do it before calling `super()` (via a static helper in the `this(...)`/`super(...)` argument list, or since Java 25 with flexible constructor bodies) or simply be `final`." } }
    ] },
    { ch: 7, blocks: [
      { code: TEXTURE_SRC, title: "Texture.java" },
      { mini: { scene: "CleanerVsTwr" } },
      { tryit: { cmd: "$ java Tex", out: "1) try-with-resources\n  alloc   sky.png\n  using   sky.png\n  free    sky.png  on thread main\n  block ended\n2) forgot close(): Cleaner is the backstop\n  alloc   sea.png\n  dropped sea.png\n  free    sea.png  on thread Cleaner-0\n3) cleanup action captures this\n  ...nothing. sun.png is reachable from the Cleaner forever\n4) clean() twice runs the action once\n  alloc   moon.png\n  free    moon.png  on thread main" } },
      { table: { head: ["", "try-with-resources", "`Cleaner`"], rows: [["when it runs", "**deterministically**, at the end of the block", "after some GC notices, or never"], ["which thread", "yours", "the Cleaner's (`Cleaner-0`, or `Common-Cleaner` inside the JDK)"], ["visible in the code", "yes", "no"], ["correct choice", "**almost always**", "a backstop for native resources"]] } },
      { mini: { scene: "CleanerTrap" } },
      { code: "void draw() {\n    try {\n        gpuDraw(handle);                    // last use of fields: `this` may now be unreachable\n    } finally {\n        Reference.reachabilityFence(this);  // keeps this reachable until here (Java 9+)\n    }\n}", title: "the opposite trap: reachabilityFence" },
      { callout: { tone: "violet", title: "deeper", text: "Reachability is about what the program **will** use, not what is in scope. Once a JIT-compiled method has read its last field, `this` can be considered dead, the Cleaner can run, and the native handle can be freed while `gpuDraw` is still using it. `reachabilityFence(this)` marks the point until which the object must stay reachable. try-with-resources avoids the problem because `close()` is a later use of the object." } }
    ] },
    { ch: 8, blocks: [
      { p: "**A Java leak is unintentional reachability.** The GC is doing its job: everything leaked is reachable from a root. These seven shapes are most of what you will meet; each demo below ran with `-Xmx32m` so it fails in under a second." },
      { h: "1 \xB7 Static collections" },
      { mini: { scene: "LeakStatic" } },
      { tryit: { note: "Leak vs fixed (abridged GC log). In the leak, every GC leaves more live data; in the fixed run each young GC drops back to 1M.", cmd: "$ java -Xmx32m -Xlog:gc Sessions\n$ java -Xmx32m -Xlog:gc Sessions fixed", out: "GC(0) Pause Young (Normal) (G1 Evacuation Pause) 14M->14M(32M) 2.246ms\nGC(1) Pause Young (Normal) (G1 Evacuation Pause) 17M->17M(32M) 0.808ms\n...\nGC(19) Pause Young (Prepare Mixed) (G1 Evacuation Pause) 30M->30M(32M) 0.211ms\nGC(20) Pause Full (G1 Compaction Pause) 30M->30M(32M) 0.844ms\nGC(21) Pause Full (G1 Compaction Pause) 30M->29M(32M) 1.379ms\njava.lang.OutOfMemoryError: Java heap space at request 292, sessions=291\n--- fixed ---\nGC(0) Pause Young (Normal) (G1 Evacuation Pause) 14M->1M(32M) 0.605ms\nGC(1) Pause Young (Normal) (G1 Evacuation Pause) 19M->1M(32M) 0.370ms\n...\nrequests=1000  sessions=0" } },
      { p: "Fix: remove entries when their owner is done, bound the collection, or don't make it static. Reading a leak in a GC log: look at the number **after** the arrow. If the floor keeps rising across GCs, something is accumulating." },
      { h: "2 \xB7 Unremoved listeners and callbacks" },
      { mini: { scene: "LeakListeners" } },
      { tryit: { cmd: "$ java -Xmx32m Listeners\n$ java -Xmx32m Listeners fixed", out: "java.lang.OutOfMemoryError: Java heap space after 296 viewers; listeners still registered: 295\nopened 1000 viewers, listeners still registered: 0" } },
      { h: "3 \xB7 ThreadLocal in a pooled thread" },
      { mini: { scene: "LeakThreadLocal" } },
      { code: "private static final ThreadLocal<UserContext> CONTEXT = new ThreadLocal<>();\n\nvoid handleRequest(Request r) {\n    try {\n        CONTEXT.set(new UserContext(r.user()));\n        handle(r);\n    } finally {\n        CONTEXT.remove();                 // mandatory in pooled threads\n    }\n}", title: "the fix" },
      { tryit: { cmd: "$ java Pool && java Pool fixed", out: "  pool-1-thread-1 request user=alice  sees context of: alice\n  pool-1-thread-1 request user=bob    sees context of: bob\n  pool-1-thread-1 request user=null   sees context of: bob\n  pool-1-thread-1 request user=alice  sees context of: alice\n  pool-1-thread-1 request user=bob    sees context of: bob\n  pool-1-thread-1 request user=null   sees context of: nobody" } },
      { tryit: { note: "Eight pool threads, each leaving a 4 MB buffer in a ThreadLocal, then a full GC once all requests are done:", cmd: "$ java -Xlog:gc PoolMem && java -Xlog:gc PoolMem fixed", out: "all requests finished; pool threads idle\nGC(0) Pause Full (System.gc()) 36M->33M(120M) 9.169ms\nall requests finished; pool threads idle\nGC(0) Pause Full (System.gc()) 36M->1M(10M) 2.131ms" } },
      { callout: { tone: "violet", title: "deeper: why the weak key doesn't save you", text: "`javap -p 'java.lang.ThreadLocal$ThreadLocalMap$Entry'` shows `class ThreadLocal$ThreadLocalMap$Entry extends WeakReference<ThreadLocal<?>> { Object value; }`. The **key** is weak, but a `static final` ThreadLocal is never collected anyway, and the **value** is strong. Even when a key is collected, its stale value stays until a later `set`/`get`/`remove` on that thread happens to expunge it. Only `remove()` is reliable. A thread you create and discard takes its map with it, which is why the leak needs a pool. On Java 25, `ScopedValue` (final in JDK 25) is a bounded, immutable alternative for passing context down a call." } },
      { p: "It is also a classic **classloader leak** (8.2): a value whose class came from a webapp, left on a container-owned pool thread, keeps that webapp's class loader and all its classes alive after redeploy." },
      { h: "4 \xB7 Inner class references" },
      { mini: { scene: "LeakInner" } },
      { tryit: { cmd: "$ javap -p 'ImageViewer$Refresh' 'ImageViewer$StaticRefresh'", out: "class ImageViewer$Refresh implements java.lang.Runnable {\n  final ImageViewer this$0;\n  ImageViewer$Refresh(ImageViewer);\n  public void run();\n}\nclass ImageViewer$StaticRefresh implements java.lang.Runnable {\n  final java.lang.String url;\n  ImageViewer$StaticRefresh(java.lang.String);\n  public void run();\n}" } },
      { tryit: { cmd: "$ java -Xmx32m ImageViewer && java -Xmx32m ImageViewer fixed", out: "java.lang.OutOfMemoryError: Java heap space after 292 viewers (291 tiny tasks queued)\n1000 viewers closed, 1000 tasks queued, heap fine" } },
      { h: "5 \xB7 Unclosed resources" },
      { mini: { scene: "LeakResources" } },
      { tryit: { note: "HotSpot on macOS raises the soft file limit at startup (`MaxFDLimit`); turning that off makes `ulimit` bite.", cmd: "$ (ulimit -n 256; java -XX:-MaxFDLimit Unclosed; java -XX:-MaxFDLimit Unclosed fixed)", out: "after 253 reads: java.io.FileNotFoundException: cat.png (Too many open files)\nread 5000 headers, fine" } },
      { h: "6 \xB7 Mutated map keys" },
      { mini: { scene: "LeakMutatedKey" } },
      { tryit: { note: "Bucket numbers computed with the HashMap spread `(h ^ h >>> 16) & 15`: width 100 \u2192 bucket 11, width 200 \u2192 bucket 7.", cmd: "$ java MutKey", out: "get(key)         = null\nget(cat.png,100) = null\ncontainsKey(key) = false\nsize()           = 1\nafter put again, size() = 2\nremove(key)      = 200px thumbnail, size() = 1" } },
      { h: "7 \xB7 Growing caches with no eviction" },
      { mini: { scene: "LeakCache" } },
      { code: "static final class Lru<K, V> extends LinkedHashMap<K, V> {\n    final int max;\n    Lru(int max) { super(16, 0.75f, true); this.max = max; }      // true = access order\n    @Override protected boolean removeEldestEntry(Map.Entry<K, V> e) { return size() > max; }\n}", title: "a bounded LRU (not thread-safe; wrap or use Caffeine)" },
      { tryit: { cmd: "$ java -Xmx32m Cache unbounded; java -Xmx32m Cache lru", out: "unbounded: java.lang.OutOfMemoryError: Java heap space at image 289, cache size = 288\nlru: 2000 distinct images requested, cache size = 100" } }
    ] },
    { ch: 9, blocks: [
      { mini: { scene: "SystemGc" } },
      { tryit: { note: "About 2 million live objects, then lots of short-lived garbage, then one `System.gc()` (abridged):", cmd: "$ java -Xmx512m -Xlog:gc ExplicitGc", out: "GC(0) Pause Young (Normal) (G1 Evacuation Pause) 23M->23M(130M) 23.523ms\n...\nGC(4) Pause Young (Normal) (G1 Evacuation Pause) 68M->41M(283M) 2.708ms\nGC(5) Pause Young (Normal) (G1 Evacuation Pause) 54M->41M(283M) 0.605ms\nGC(6) Pause Young (Normal) (G1 Evacuation Pause) 57M->41M(283M) 0.345ms\nGC(7) Pause Young (Normal) (G1 Evacuation Pause) 57M->41M(283M) 0.334ms\ncalling System.gc()\nGC(8) Pause Full (System.gc()) 203M->39M(144M) 19.162ms\nlive arrays: 2000" } },
      { tryit: { cmd: "$ java -Xmx512m -Xlog:gc -XX:+DisableExplicitGC ExplicitGc | tail -3", out: "GC(7) Pause Young (Normal) (G1 Evacuation Pause) 61M->40M(283M) 0.395ms\ncalling System.gc()\nlive arrays: 2000" } },
      { table: { head: ["", ""], rows: [["**it is a hint**", "the JVM may ignore it; `-XX:+DisableExplicitGC` makes that official"], ["**usually a full GC**", "G1 logs `Pause Full (System.gc())`, stop-the-world over the whole heap (unless `-XX:+ExplicitGCInvokesConcurrent`)"], ["**undoes adaptive sizing**", "above, G1 had grown the heap to 283M; the full GC shrank it to 144M"], ["**fixes nothing**", "leaked objects are reachable, so no GC can collect them"]] } },
      { callout: { tone: "pull", text: "**If `System.gc()` appears to help, you have a leak** (things reachable that shouldn't be) **or a sizing problem** (8.3). The only legitimate uses are outside production: benchmark setup between measured runs, and forcing reference clearing in tests, as every demo on this page does." } }
    ] }
  ];
  var traps = [
    "`SoftReference` caches are full or empty: the HotSpot LRU-clock policy clears everything eligible in one GC. Use Caffeine or a bounded `LinkedHashMap`.",
    "`WeakHashMap` **keys** are weak; values are strong. A value that refers to its key keeps the entry forever. Interned strings never clear either.",
    "Weak references are cleared at the next GC **that covers the referent** (an old object waits for a mixed/full GC), and only if no soft path remains.",
    "A `Cleaner` is a backstop, not a replacement for try-with-resources. If its action references the object (a lambda using `this`), the object is never collected and the action never runs.",
    "A `PhantomReference` (or any Reference) that you don't keep strongly reachable is collected with its referent and never enqueued.",
    "`ThreadLocal` without `remove()` in a pooled thread leaks memory and can leak one request's data into the next.",
    "`System.gc()` before a memory-heavy operation: a full GC, discarded tuning, no benefit.",
    "`finalize()` has not been removed (still in Java 25), but it is deprecated for removal: don't write new ones."
  ];
  var recap = [
    "**Reachability**: alive = reachable from a GC root; the strongest path decides the level (strong \u203A soft \u203A weak \u203A phantom \u203A unreachable).",
    "**Soft**: cleared when the GC decides memory is short (LRU clock: idle time vs free MB \xD7 1000 ms); all cleared before an OOM. Poor cache.",
    "**Weak**: cleared by the next GC that finds the referent only weakly reachable. `WeakHashMap`, canonical maps, registries.",
    "**Phantom**: `get()` always null; enqueued after collection. Basis of `Cleaner`. Keep Reference objects reachable.",
    "**ReferenceQueue**: active \u2192 pending (GC) \u2192 enqueued (Reference Handler thread) \u2192 your `poll()`/`remove()`.",
    "**`WeakHashMap`**: entries are `WeakReference`s to keys with strong values; stale entries are expunged on the next map operation.",
    "**`finalize()`**: deprecated for removal (JEP 421); may never run, can resurrect, needs two GCs, a security hole.",
    "**Cleanup**: try-with-resources first; `Cleaner` as a backstop with an action that never references the object.",
    "**Leak shapes**: static collections \xB7 listeners \xB7 `ThreadLocal` in pools \xB7 inner classes \xB7 unclosed resources \xB7 mutated keys \xB7 unbounded caches.",
    "**`System.gc()`**: don't. If it helps, you have a leak or a sizing problem."
  ];
  var quiz = [
    { q: "An image is reachable through a `SoftReference` and a `WeakReference`, and nothing else. A GC runs with plenty of free memory. What happens to the weak reference?", options: ["It is cleared: weak references are always cleared at the next GC", "It is kept: the image is softly reachable, and weak references are only cleared once an object is weakly reachable", "It is cleared, and the soft reference is cleared with it", "It is enqueued but not cleared"], answer: 1, why: "Reachability is the strongest path. A live soft path makes the object softly reachable, so the weak reference stays. When memory pressure finally clears the soft reference, the weak one is cleared atomically in the same GC (real output: soft, weak and phantom all went together)." },
    { q: "Why does `PhantomReference.get()` always return null?", options: ["Because phantom referents are cleared before the reference is created", "So that cleanup code can never resurrect the object, the flaw that made finalizers dangerous", "Because phantom references only work with a ReferenceQueue that holds the object", "It is a bug kept for compatibility"], answer: 1, why: "Phantom references exist only to report that an object is gone. If `get()` returned it, cleanup code could store it somewhere and bring it back, exactly what `finalize()` allowed. Copy what cleanup needs (a handle) into the Reference subclass instead." },
    { q: "You register `new PhantomReference<>(texture, queue)` and keep no reference to the PhantomReference itself. The texture is dropped and a GC runs. What does your cleanup thread see?", options: ["The reference arrives on the queue as usual", "Nothing: the PhantomReference was unreachable too, so it was collected and never enqueued", "The reference arrives, but get() returns the texture", "An exception from the Reference Handler thread"], answer: 1, why: "A Reference object is an ordinary object. If nothing holds it, it is garbage like anything else and the GC never enqueues it (the `sun.png` case in the demo). Keep registered references in a set until processed; `Cleaner` does that internally." },
    { q: "A `WeakHashMap<Page, Thumbnail>` entry never disappears, even after the page is closed and many GCs run. What is the most likely cause?", options: ["WeakHashMap only clears entries on a full GC", "The `Thumbnail` value holds a reference to its `Page` key, so the map keeps the key strongly reachable", "The map needs `System.gc()` to expunge entries", "Pages must implement `equals` for weak keys to work"], answer: 1, why: "Values are strongly held by the map. A value that points at its key makes the key strongly reachable through the map itself, so it can never become weakly reachable. Remove the back-pointer or hold it weakly." },
    { q: "Right after a GC clears a `WeakHashMap` key, before you touch the map again, what does the map look like inside?", options: ["The entry is already gone from the table", "The entry is still in the table (holding its value) and sits on the map's private queue; the next `size()`/`get()`/`put()` expunges it", "The entry's value has been cleared too", "The whole table is rebuilt"], answer: 1, why: "Each entry is a `WeakReference` registered with the map's queue. The GC only clears the key and enqueues the entry. `expungeStaleEntries()` runs inside later map operations and unlinks it (real reflection output: 2 slots, then 1 after `size()`)." },
    { q: "Why does a `ThreadLocal` value leak in a thread pool but not in a thread you create for one task and then discard?", options: ["Pools use a different ThreadLocal implementation", "The value lives in the Thread object's own map; a pooled thread is never discarded, so its map (and the value) lives on", "ThreadLocal values are static", "Pools disable garbage collection of thread-local data"], answer: 1, why: "Each `Thread` has a `ThreadLocalMap` whose entries hold their values strongly. A discarded thread becomes unreachable and takes its map with it. A pooled thread is reused forever, so values stay until `remove()`, and the next request on that thread can even read them." },
    { q: "A `Cleaner` action is written as `() -> freeGpu(this.handle)`. What happens when the texture is no longer used?", options: ["The action runs after the next GC", "The action runs immediately", "The texture is never collected and the action never runs, because the Cleaner reaches the texture through the lambda", "The JVM throws IllegalArgumentException at register time"], answer: 2, why: "The Cleaner holds the action strongly, and the lambda captures `this`. That is a strong path from a root to the texture, so it never becomes phantom reachable. Use a static nested class or record holding just the handle." },
    { q: "An object overrides `finalize()` to do `saved = this`. After its last reference is dropped, which sequence happens in the first GC?", options: ["It is collected, then finalize() runs on the copy", "Weak references to it are cleared, then it is kept alive and queued for the Finalizer thread, which runs finalize() and resurrects it", "finalize() runs on the GC thread before any references are cleared", "Nothing: finalizable objects are skipped until a full GC"], answer: 1, why: "Reference processing clears soft/weak references first (phase 2), then marks finalizable objects alive again (phase 3) for the Finalizer thread. Real output: the weak reference was cleared, yet `saved` held the same object. finalize() never runs a second time." },
    { q: "A weak referent was promoted to the old generation, then its last strong reference was dropped. Thirteen young GCs later, `refersTo(null)` is still false. Why?", options: ["Weak references are only cleared under memory pressure", "A young GC only processes references whose referents are in the regions it collects; the old referent waits for a mixed or full GC", "The JIT is keeping the object alive", "The reference was not registered with a queue"], answer: 1, why: '"Cleared at the next GC" really means the next GC that examines the referent. G1 young GCs never trace old regions, so an old referent can outlive many young GCs (real output: cleared only by the full GC).' },
    { q: "Someone adds `System.gc()` after each batch job and memory graphs look better. What have they most likely discovered?", options: ["That G1 needs manual help", "A leak or a sizing problem: either something reachable is accumulating, or the heap is mis-sized, and the forced full GC is masking it", "That full GCs are cheaper than young GCs", "Nothing: System.gc() is the recommended way to free batch memory"], answer: 1, why: `A forced full GC can only collect unreachable objects, which a normal GC would also collect eventually. If it "helps", look at heap-after-GC trends for a leak, or at heap sizing (8.3). Meanwhile it adds stop-the-world full pauses and discards G1's adaptive sizing (283M \u2192 144M in the demo).` }
  ];
  window.AN.registerTopic({
    id: "8.7",
    part: "08",
    title: "References and reachability",
    kicker: "Part 08 \xB7 The JVM",
    lede: "An object lives exactly as long as something can reach it. Learn the four reference strengths by watching a real GC clear them, the only correct ways to clean up after an object, and the seven shapes a Java memory leak takes.",
    chapters,
    scenes,
    captions,
    notes,
    traps,
    recap,
    quiz
  });
})();
