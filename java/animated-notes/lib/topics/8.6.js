(() => {
  // src/topics/8.6/common.jsx
  var { PAL, MOTION, clamp, hexA, MONO, SANS, Panel, toneColor } = window.AN;
  var E = MOTION.enter;
  var ORDERS_SRC = [
    "public class Orders {",
    "  static byte[][] recent = new byte[30_000][];  // the cache",
    "  static byte[][] reports = new byte[8][];",
    "",
    "  public static void main(String[] args) {",
    "    Random rnd = new Random(42);",
    "    for (long n = 0; running(); n++) {",
    "      byte[] request = new byte[4_000];      // dies young",
    "      handle(request);",
    "      if (n % 40 == 0)                        // kept a while",
    "        recent[rnd.nextInt(30_000)] = new byte[4_000];",
    "      if (n % 50_000 == 0)                    // big and rare",
    "        reports[(int) (n / 50_000 % 8)] = new byte[1_500_000];",
    "    }",
    "  }",
    "}"
  ];
  function hiLog(s) {
    const re = /(^(?:\[[^\]]*\])+)|(GC\(\d+\))|(\d+[MK](?:\(\d+[MK]\))?->\d+[MK]\(\d+[MK]\)|\d+M\(\d+%\)->\d+M\(\d+%\))|((?:User|Real)=[\d.]+s)|(\d+(?:\.\d+)?\s?ms\b)|(Pause [A-Z][a-z]+(?: [A-Z][a-z]+)*(?: \([A-Za-z0-9 ]+\))?|Allocation Stall|Garbage Collection|Concurrent [A-Za-z -]+?(?= \d|$))|([\s\S])/g;
    const out = [];
    let m, k = 0, buf = "";
    const flush = () => {
      if (buf) {
        out.push(/* @__PURE__ */ React.createElement("span", { key: k++, style: { color: PAL.ink2 } }, buf));
        buf = "";
      }
    };
    while (m = re.exec(s)) {
      if (m[7] != null) {
        buf += m[7];
        continue;
      }
      flush();
      const style = m[1] ? { color: PAL.ink3 } : m[2] ? { color: PAL.pull } : m[3] ? { color: PAL.flow, fontWeight: 600 } : m[4] ? { color: PAL.violet, fontWeight: 600 } : m[5] ? { color: PAL.pink, fontWeight: 600 } : { color: PAL.ink, fontWeight: 600 };
      out.push(/* @__PURE__ */ React.createElement("span", { key: k++, style }, m[0]));
    }
    flush();
    return out;
  }
  function LogPanel({ x, y, w, h, title = "gc.log \xB7 JDK 17", right, lines, t, a = 1, fs = 17, lh = 30, tone }) {
    if (a <= 5e-3) return null;
    return /* @__PURE__ */ React.createElement(Panel, { x, y, w, h, title, right, a, tone }, /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 0" } }, lines.map((L, i) => {
      const o = L.at == null ? 1 : E(t, L.at, 0.35);
      const c = toneColor(L.tone || "pull");
      const hl = L.hl || 0;
      return /* @__PURE__ */ React.createElement("div", { key: i, style: { height: lh, display: "flex", alignItems: "center", padding: "0 18px", whiteSpace: "pre", font: `400 ${fs}px ${MONO}`, opacity: o * (L.dim ? 0.45 : 1), background: hl > 0.01 ? hexA(c, 0.14 * hl) : "transparent", boxShadow: hl > 0.01 ? `inset 3px 0 0 ${hexA(c, hl)}` : "none" } }, L.plain ? /* @__PURE__ */ React.createElement("span", { style: { color: PAL.ink3 } }, L.s) : hiLog(L.s));
    })));
  }
  var KIND = {
    run: (c) => ({ background: hexA(PAL.flow, 0.28), border: `1px solid ${hexA(PAL.flow, 0.5)}` }),
    stw: () => ({ background: PAL.bad }),
    gc: () => ({ background: PAL.pull }),
    conc: () => ({ background: `repeating-linear-gradient(135deg, ${hexA(PAL.violet, 0.75)} 0 5px, ${hexA(PAL.violet, 0.3)} 5px 10px)` }),
    stall: () => ({ background: PAL.pull }),
    idle: () => ({ background: "transparent", border: `1px dashed ${PAL.line2}` })
  };
  function Lane({ x, y, w, h = 30, segs, t0, t1, a = 1, reveal = 1, minW = 2, bg = true }) {
    if (a <= 5e-3) return null;
    const X = (v) => (v - t0) / (t1 - t0) * w;
    const cut = reveal * w;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, width: w, height: h, opacity: clamp(a, 0, 1) } }, bg && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, borderRadius: 6, background: PAL.panel2, border: `1px solid ${PAL.line}` } }), segs.map(([s, e, kind], i) => {
      const l = X(s);
      if (l > cut) return null;
      const ww = Math.max(minW, Math.min(X(e), cut) - l);
      return /* @__PURE__ */ React.createElement("div", { key: i, style: { position: "absolute", left: l, top: kind === "conc" ? h * 0.22 : 0, width: ww, height: kind === "conc" ? h * 0.56 : h, borderRadius: 3, boxSizing: "border-box", ...KIND[kind]() } });
    }));
  }
  function Legend({ x, y, items, a = 1, fs = 17, gap = 34 }) {
    if (a <= 5e-3) return null;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, display: "flex", gap, opacity: a, font: `400 ${fs}px ${MONO}`, color: PAL.ink2, whiteSpace: "nowrap" } }, items.map(([kind, label]) => /* @__PURE__ */ React.createElement("span", { key: label, style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 26, height: 16, borderRadius: 3, boxSizing: "border-box", ...KIND[kind] ? KIND[kind]() : { background: toneColor(kind) } } }), label)));
  }

  // src/topics/8.6/data.jsx
  var P_Serial = [[3.0125, 1.493, "Y"], [3.0466, 2.386, "Y"], [3.0855, 3.504, "Y"], [3.1257, 2.301, "Y"], [3.1656, 2.384, "Y"], [3.1999, 0.071, "Y"], [3.1991, 139.855, "F"], [3.3702, 0.79, "Y"], [3.4189, 1.085, "Y"], [3.4533, 1.71, "Y"], [3.4865, 1.515, "Y"], [3.5186, 1.393, "Y"], [3.5511, 1.889, "Y"], [3.5844, 4.558, "Y"], [3.6195, 1.454, "Y"], [3.6524, 2.567, "Y"], [3.6904, 2.643, "Y"], [3.7255, 1.455, "Y"], [3.758, 1.956, "Y"], [3.7909, 2.15, "Y"], [3.8245, 1.494, "Y"], [3.8571, 1.931, "Y"], [3.8948, 2.177, "Y"], [3.929, 2.038, "Y"], [3.9629, 2.053, "Y"], [3.9968, 2.211, "Y"]];
  var P_Parallel = [[3.0329, 1.087, "Y"], [3.0689, 1.109, "Y"], [3.1059, 1.134, "Y"], [3.142, 1.024, "Y"], [3.178, 1.015, "Y"], [3.2149, 1.066, "Y"], [3.2509, 1.11, "Y"], [3.2869, 1.085, "Y"], [3.324, 1.022, "Y"], [3.3599, 1.089, "Y"], [3.3959, 1.088, "Y"], [3.4325, 2.473, "Y"], [3.4698, 1.247, "Y"], [3.5068, 1.214, "Y"], [3.5439, 1.11, "Y"], [3.5798, 1.202, "Y"], [3.6158, 1.214, "Y"], [3.6519, 1.105, "Y"], [3.6879, 1.074, "Y"], [3.7249, 1.099, "Y"], [3.7608, 1.199, "Y"], [3.7968, 1.176, "Y"], [3.8338, 1.217, "Y"], [3.8699, 1.117, "Y"], [3.9058, 1.237, "Y"], [3.9428, 1.176, "Y"], [3.9789, 1.09, "Y"]];
  var P_G1 = [[3.0241, 1.865, "Y"], [3.0887, 2.316, "Y"], [3.1512, 2.766, "Y"], [3.2133, 2.699, "Y"], [3.2734, 2.571, "Y"], [3.3332, 2.802, "Y"], [3.3926, 2.427, "Y"], [3.4506, 2.432, "Y"], [3.5067, 2.282, "Y"], [3.5627, 2.337, "Y"], [3.6167, 2.265, "Y"], [3.6697, 2.27, "Y"], [3.7217, 2.258, "Y"], [3.7737, 2.309, "Y"], [3.8247, 2.325, "Y"], [3.8748, 2.151, "Y"], [3.9238, 2.196, "Y"], [3.951, 1.954, "Y"], [3.9548, 0.21, "R"], [3.9569, 0.106, "C"]];
  var P_Shenandoah = [[3.1069, 0.099, "I"], [3.1087, 0.303, "F"], [3.113, 0.047, "I"], [3.1159, 0.108, "F"], [3.2449, 0.102, "I"], [3.2486, 0.351, "F"], [3.252, 0.046, "I"], [3.2559, 0.1, "F"], [3.3459, 0.087, "I"], [3.3507, 0.33, "F"], [3.355, 0.047, "I"], [3.3569, 0.101, "F"], [3.4449, 0.071, "I"], [3.4458, 0.217, "F"], [3.449, 0.025, "I"], [3.4499, 0.056, "F"], [3.5149, 0.076, "I"], [3.5168, 0.199, "F"], [3.519, 0.024, "I"], [3.5209, 0.057, "F"], [3.5879, 0.052, "I"], [3.5888, 0.201, "F"], [3.5919, 0.054, "I"], [3.594, 0.047, "F"], [3.6609, 0.073, "I"], [3.6628, 0.208, "F"], [3.666, 0.023, "I"], [3.6679, 0.066, "F"], [3.735, 0.041, "I"], [3.7368, 0.222, "F"], [3.739, 0.033, "I"], [3.7409, 0.06, "F"], [3.8089, 0.081, "I"], [3.8108, 0.174, "F"], [3.813, 0.026, "I"], [3.8149, 0.058, "F"], [3.8929, 0.058, "I"], [3.8948, 0.181, "F"], [3.897, 0.02, "I"], [3.8989, 0.051, "F"], [3.9729, 0.062, "I"], [3.9757, 0.319, "F"], [3.98, 0.021, "I"], [3.9819, 0.061, "F"]];
  var Z512_CYCLES = [[3.017, 3.025], [3.036, 3.043], [3.116, 3.125], [3.136, 3.144], [3.217, 3.225], [3.236, 3.243], [3.316, 3.325], [3.337, 3.343], [3.416, 3.424], [3.437, 3.443], [3.515, 3.523], [3.537, 3.543], [3.614, 3.623], [3.637, 3.645], [3.717, 3.726], [3.737, 3.744], [3.815, 3.824], [3.836, 3.843], [3.914, 3.922], [3.937, 3.945]];
  var Z512_STALLS = [[3.0167, 6.329], [3.1163, 6.661], [3.217, 6.042], [3.3165, 6.459], [3.4158, 6.185], [3.5148, 6.217], [3.6138, 6.173], [3.7165, 6.51], [3.8151, 5.934], [3.9139, 6.136]];
  var Z1G_CYCLES = [[3.046, 3.057], [3.146, 3.157], [3.246, 3.257], [3.346, 3.359], [3.446, 3.457], [3.546, 3.559], [3.662, 3.695], [3.741, 3.752], [3.844, 3.856], [3.946, 3.96]];
  var SHEN_CYCLES = [[3.515, 3.521], [3.809, 3.815], [3.245, 3.256], [3.661, 3.668], [3.588, 3.594], [3.346, 3.357], [3.106, 3.116], [3.973, 3.982], [3.893, 3.899], [3.445, 3.45], [3.735, 3.741]];
  var G1_CONC = [[3.953, 3.958]];

  // src/topics/8.6/scenes1.jsx
  var {
    PAL: PAL2,
    MOTION: MOTION2,
    lin,
    lerp,
    win,
    pulse,
    step,
    track,
    hlAt,
    clamp: clamp2,
    hexA: hexA2,
    MONO: MONO2,
    SANS: SANS2,
    Txt,
    Panel: Panel2,
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
    toneColor: toneColor2
  } = window.AN;
  var E2 = MOTION2.enter;
  var M = MOTION2.move;
  var POP = MOTION2.pop;
  var stw = (arr) => arr.map(([s, ms]) => [s, s + ms / 1e3, "stw"]);
  var ROWS = [
    { name: "Serial", segs: stw(P_Serial) },
    { name: "Parallel", segs: stw(P_Parallel) },
    { name: "G1", segs: [...G1_CONC.map(([a, b]) => [a, b, "conc"]), ...stw(P_G1)] },
    { name: "ZGC \xB7 512 MB", segs: [...Z512_CYCLES.map(([a, b]) => [a, b, "conc"]), ...Z512_STALLS.map(([s, ms]) => [s, s + ms / 1e3, "stall"])] },
    { name: "ZGC \xB7 1 GB", segs: Z1G_CYCLES.map(([a, b]) => [a, b, "conc"]) },
    { name: "Shenandoah", segs: [...SHEN_CYCLES.map(([a, b]) => [a, b, "conc"]), ...stw(P_Shenandoah)] }
  ];
  function Obj({ x, y, w = 30, h = 30, tone = "flow", a = 1, dead, glow = 0, label }) {
    if (a <= 0.01) return null;
    const c = dead ? PAL2.ink3 : toneColor2(tone);
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, width: w, height: h, boxSizing: "border-box", borderRadius: 6, opacity: clamp2(a, 0, 1), background: hexA2(c, dead ? 0.12 : 0.3), border: `2px ${dead ? "dashed" : "solid"} ${hexA2(c, dead ? 0.6 : 0.95)}`, boxShadow: glow > 0.01 ? `0 0 ${22 * glow}px ${hexA2(c, 0.8 * glow)}` : "none", display: "flex", alignItems: "center", justifyContent: "center", font: `600 17px ${MONO2}`, color: PAL2.ink, whiteSpace: "nowrap" } }, label);
  }
  var AreaLabel = ({ x, y, text, a, color }) => /* @__PURE__ */ React.createElement(Txt, { x, y, mono: true, fs: 17, color: color || PAL2.ink3, a }, text);
  function SIntro({ t }) {
    const rows = ROWS.filter((r) => r.name !== "ZGC \xB7 1 GB");
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 150, mono: true, fs: 22, weight: 600, color: PAL2.pull, a: E2(t, 0.3), style: { letterSpacing: "0.14em" } }, "PART 08 \xB7 THE JVM \xB7 8.6"), /* @__PURE__ */ React.createElement(Txt, { x: 92, y: 192, fs: 118, weight: 700, lh: 1, a: E2(t, 0.6, 0.9), style: { letterSpacing: "-0.03em", transform: `translateY(${(1 - E2(t, 0.6, 0.9)) * 24}px)` } }, "The collectors"), /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 338, fs: 36, color: PAL2.ink2, a: E2(t, 1.4, 0.8) }, "Serial, Parallel, G1, ZGC, Shenandoah: what each one stops, and what it costs."), /* @__PURE__ */ React.createElement(Code, { x: 96, y: 430, w: 740, h: 468, fs: 17, lh: 25, title: "Orders.java \xB7 condensed \xB7 same heap, same workload", a: E2(t, 12), lines: ORDERS_SRC }), /* @__PURE__ */ React.createElement(Txt, { x: 880, y: 430, mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 6) }, "ONE REAL SECOND OF THE SAME RUN \xB7 JDK 17"), rows.map((r, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: r.name }, /* @__PURE__ */ React.createElement(Txt, { x: 880, y: 486 + i * 66, mono: true, fs: 20, weight: 600, color: PAL2.ink, a: E2(t, 6.3 + i * 0.3) }, r.name), /* @__PURE__ */ React.createElement(Lane, { x: 1100, y: 480 + i * 66, w: 724, h: 34, segs: r.segs, t0: 3, t1: 4, a: E2(t, 6.3 + i * 0.3), reveal: lin(t, 6.5 + i * 0.3, 4) }))), /* @__PURE__ */ React.createElement(Legend, { x: 880, y: 808, a: E2(t, 8), items: [["stw", "app stopped"], ["conc", "GC running alongside"], ["stall", "app waiting"]] }), /* @__PURE__ */ React.createElement(Callout, { x: 880, y: 846, w: 944, tone: "flow", a: E2(t, 18.5), fs: 20, text: "Spoiler: for most applications the right move is **to change nothing**." }));
  }
  var REQ = Array.from({ length: 60 }, (_, k) => ({ at: 5 + k * 0.75, x: 990 + k * 137 % 440, y: 300 + k * 53 % 104 }));
  var OLDS = Array.from({ length: 14 }, (_, k) => ({ x: 990 + k % 7 * 112, y: 500 + Math.floor(k / 7) * 64, dieAt: k === 3 ? 21 : k === 9 ? 22.5 : null }));
  function SWorkload({ t }) {
    const [hl, hA] = hlAt(t, [[5, 7], [11.5, 10], [24.5, 12], [31, -1]]);
    const cx = track(t, [[12, 1320, 330], [15, 1320, 330], [16.2, 1563, 330], [19, 1563, 330], [20.4, 1102, 564]]);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code, { x: 96, y: 196, w: 800, h: 468, fs: 17, lh: 25, title: "Orders.java \xB7 condensed", a: E2(t, 0.5), lines: ORDERS_SRC, hl, hlA: hA }), /* @__PURE__ */ React.createElement(Callout, { x: 96, y: 700, w: 800, tone: "flow", a: E2(t, 45), fs: 20, text: "Every log in this topic comes from this program, JDK 17, `-Xms512m -Xmx512m`, run for 10 seconds under each collector." }), /* @__PURE__ */ React.createElement(Panel2, { x: 940, y: 196, w: 884, h: 470, title: "heap \xB7 -Xmx512m", a: E2(t, 2) }), /* @__PURE__ */ React.createElement(Box, { x: 966, y: 262, w: 520, h: 170, tone: "flow", a: E2(t, 2.4), glow: win(t, 31, 36) * 0.7 }), /* @__PURE__ */ React.createElement(AreaLabel, { x: 982, y: 268, text: "eden", a: E2(t, 2.6) }), /* @__PURE__ */ React.createElement(Box, { x: 1506, y: 262, w: 145, h: 170, tone: "green", a: E2(t, 2.6), glow: win(t, 33, 37) * 0.7 }), /* @__PURE__ */ React.createElement(AreaLabel, { x: 1520, y: 268, text: "S0", a: E2(t, 2.8) }), /* @__PURE__ */ React.createElement(Box, { x: 1665, y: 262, w: 145, h: 170, tone: "green", a: E2(t, 2.8) }), /* @__PURE__ */ React.createElement(AreaLabel, { x: 1679, y: 268, text: "S1", a: E2(t, 3) }), /* @__PURE__ */ React.createElement(Box, { x: 966, y: 452, w: 844, h: 190, tone: "blue", a: E2(t, 3), glow: win(t, 34, 38) * 0.7 }), /* @__PURE__ */ React.createElement(AreaLabel, { x: 982, y: 458, text: "old", a: E2(t, 3.2) }), REQ.map((r, k) => /* @__PURE__ */ React.createElement(Obj, { key: k, x: r.x, y: r.y, tone: "flow", a: E2(t, r.at, 0.2) * (1 - E2(t, r.at + 0.9, 0.3)) * (t < 11.5 ? 1 : 0.55) })), /* @__PURE__ */ React.createElement(Badge, { x: 1226, y: 412, text: "request \xB7 dead almost at once", tone: "flow", a: win(t, 6, 11.5), fs: 17 }), /* @__PURE__ */ React.createElement(Obj, { x: cx[0], y: cx[1], tone: "pull", a: E2(t, 12), glow: pulse(t, [12, 16.2, 20.4], 0.9) }), /* @__PURE__ */ React.createElement(Badge, { x: 1320, y: 412, text: "cache entry \xB7 survives", tone: "pull", a: win(t, 12.3, 18), fs: 17 }), OLDS.map((o, k) => /* @__PURE__ */ React.createElement(Obj, { key: k, x: o.x, y: o.y, tone: "pull", a: E2(t, 18 + k * 0.08), dead: o.dieAt != null && t > o.dieAt, glow: o.dieAt ? pulse(t, [o.dieAt], 1) : 0 })), OLDS.filter((o) => o.dieAt).map((o, k) => /* @__PURE__ */ React.createElement(Mark, { key: k, x: o.x + 30, y: o.y, ok: false, a: win(t, o.dieAt, o.dieAt + 4) * 0.9 })), /* @__PURE__ */ React.createElement(Badge, { x: 1388, y: 612, text: "replaced at random \u2192 garbage in old", tone: "bad", a: win(t, 21, 31), fs: 17 }), /* @__PURE__ */ React.createElement(Obj, { x: 1060, y: 340, w: 190, h: 60, tone: "violet", a: E2(t, 25), glow: pulse(t, [25.2], 1.2), label: "report \xB7 1.5 MB" }), /* @__PURE__ */ React.createElement(Badge, { x: 1226, y: 412, text: "1 \xB7 born in eden", tone: "flow", a: E2(t, 31), fs: 17, solid: true }), /* @__PURE__ */ React.createElement(Badge, { x: 1658, y: 412, text: "2 \xB7 copied", tone: "green", a: E2(t, 33), fs: 17, solid: true }), /* @__PURE__ */ React.createElement(Badge, { x: 1388, y: 624, text: "3 \xB7 promoted after surviving several GCs", tone: "blue", a: E2(t, 34.5), fs: 17, solid: true }), [["~4 GB/s", "allocated: garbage", "pull"], ["~120 MB", "live: the cache", "flow"], ["512 MB", "heap, every run", "ink"]].map(([v, s, tone], i) => /* @__PURE__ */ React.createElement(Box, { key: v, x: 940 + i * 302, y: 700, w: 280, h: 120, label: v, sub: s, fs: 34, sfs: 17, tone, a: E2(t, 38.5 + i * 0.6) })), /* @__PURE__ */ React.createElement(Txt, { x: 940, y: 840, fs: 17, color: PAL2.ink3, a: E2(t, 40.5), w: 884 }, "4 GB/s: about 10 million orders \xD7 4 KB in 10 seconds, measured from the run."));
  }
  var COLS = [
    ["Serial", "footprint", "long \xB7 1 thread", "-XX:+UseSerialGC"],
    ["Parallel", "throughput", "long \xB7 many threads", "-XX:+UseParallelGC"],
    ["G1", "balance \xB7 default", "goal 200 ms", "-XX:+UseG1GC"],
    ["ZGC", "latency", "< 1 ms", "-XX:+UseZGC"],
    ["Shenandoah", "latency", "~1\u201310 ms", "-XX:+UseShenandoahGC"],
    ["CMS", "removed in 14", "\u2014", "refuses to start"]
  ];
  function SLandscape({ t }) {
    const T = [1480, 250], L = [1150, 770], R = [1810, 770];
    const at = (u, v) => [T[0] * (1 - u - v) + L[0] * u + R[0] * v, T[1] * (1 - u - v) + L[1] * u + R[1] * v];
    const dots = [
      ["Parallel", at(0.08, 0.14), "pull", 19],
      ["Serial", at(0.06, 0.74), "ink", 19],
      ["G1", at(0.33, 0.3), "flow", 19],
      ["ZGC", at(0.74, 0.08), "violet", 27],
      ["Shenandoah", at(0.6, 0.2), "violet", 27]
    ];
    const cardA = win(t, 4.5, 18.5, 0.5);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("svg", { width: "1920", height: "1080", style: { position: "absolute", left: 0, top: 0, opacity: E2(t, 0.6) } }, /* @__PURE__ */ React.createElement("polygon", { points: [T, L, R].map((p) => p.join(",")).join(" "), fill: hexA2(PAL2.ink3, 0.06), stroke: PAL2.line2, strokeWidth: "2" })), /* @__PURE__ */ React.createElement(Txt, { x: T[0], y: T[1] - 46, anchor: "mid", mono: true, fs: 21, weight: 600, color: PAL2.pull, a: E2(t, 4.5) }, "throughput"), /* @__PURE__ */ React.createElement(Txt, { x: L[0], y: L[1] + 16, anchor: "mid", mono: true, fs: 21, weight: 600, color: PAL2.violet, a: E2(t, 9.5) }, "latency"), /* @__PURE__ */ React.createElement(Txt, { x: R[0] - 30, y: R[1] + 16, anchor: "mid", mono: true, fs: 21, weight: 600, color: PAL2.ink2, a: E2(t, 14) }, "footprint"), dots.map(([n, [x, y], tone, at0], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: n }, /* @__PURE__ */ React.createElement(Dot, { x, y, r: 11, color: toneColor2(tone), a: POP(t, at0 + i % 3 * 0.5) }), /* @__PURE__ */ React.createElement(Txt, { x, y: y + 18, anchor: "mid", mono: true, fs: 18, weight: 600, color: PAL2.ink, a: E2(t, at0 + i % 3 * 0.5) }, n))), [
      ["throughput", "Of all CPU time, how much goes to **your code** rather than to GC.", "pull", 4.5],
      ["latency", "The longest time any of your threads is **stopped** for GC.", "violet", 9.5],
      ["footprint", "Extra **memory and CPU** the collector needs to do its job.", "ink", 14]
    ].map(([h, s, tone, a0], i) => /* @__PURE__ */ React.createElement(Card, { key: h, x: 96, y: 210 + i * 170, w: 940, h: 150, num: h, title: s, tfs: 26, tone, a: E2(t, a0) * cardA })), /* @__PURE__ */ React.createElement(
      Table,
      {
        x: 96,
        y: 200,
        cols: [200, 240, 230, 300],
        head: ["collector", "optimises for", "pauses", "flag"],
        rows: COLS,
        a: E2(t, 18.6),
        fs: 19,
        rh: 52,
        rowA: COLS.map((_, i) => E2(t, i < 3 ? 19 + i * 0.6 : i < 5 ? 27 + (i - 3) * 0.6 : 34)),
        marks: { 2: ["flow", win(t, 19, 46) * 0.8], 5: ["bad", E2(t, 34)] },
        colColors: [PAL2.ink, PAL2.ink2, PAL2.ink2, PAL2.flow]
      }
    ), /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 624, mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 39.5) }, "WHO DOES THE WORK WHILE YOUR CODE IS STOPPED?"), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 96, top: 676, width: 970, height: 12, borderRadius: 6, opacity: E2(t, 39.8), background: `linear-gradient(90deg, ${PAL2.bad}, ${PAL2.pull} 50%, ${PAL2.violet})` } }), [["Serial", 120], ["Parallel", 290], ["G1", 560], ["Shenandoah", 820], ["ZGC", 1e3]].map(([n, x], i) => /* @__PURE__ */ React.createElement(Badge, { key: n, x, y: 724, text: n, tone: i < 2 ? "bad" : i === 2 ? "pull" : "violet", a: E2(t, 40.2 + i * 0.3), fs: 17 })), /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 770, fs: 19, color: PAL2.ink2, w: 430, a: E2(t, 41.5) }, "**Stop-the-world**: all GC work happens in pauses."), /* @__PURE__ */ React.createElement(Txt, { x: 600, y: 770, fs: 19, color: PAL2.ink2, w: 466, a: E2(t, 42.5) }, "**Mostly concurrent**: marking, or even moving, runs alongside your code."));
  }
  var EDEN = Array.from({ length: 32 }, (_, k) => ({ c: k % 8, r: Math.floor(k / 8), live: [5, 13, 22, 27].includes(k) }));
  var OLDC = Array.from({ length: 28 }, (_, k) => ({ c: k % 7, r: Math.floor(k / 7), at: k < 8 ? 0 : 26 + (k - 8) * 0.45, dead: k >= 2 && k % 3 === 1, dieAt: 31 + k % 5 * 0.6 }));
  function SSerial({ t }) {
    const TL0 = 4, TL1 = 58;
    const app = [[4, 11, "run"], [11, 23.5, "stw"], [23.5, 37, "run"], [37, 51.5, "stw"], [51.5, 58, "run"]];
    const gc = [[11, 23.5, "gc"], [37, 51.5, "gc"]];
    const rev = lin(t, TL0, TL1 - TL0);
    const LX = 330, LW = 1494, X = (v) => LX + (v - TL0) / (TL1 - TL0) * LW;
    const stopped = t > 11 && t < 23.5 || t > 37 && t < 51.5;
    const ex = (c) => 112 + c * 92, ey = (r) => 398 + r * 40;
    const s0 = [[896, 398], [966, 398], [896, 438], [966, 438]];
    const ox = (c) => 1268 + c * 78, oy = (r) => 398 + r * 40;
    const liveOld = OLDC.filter((o) => !o.dead);
    const phase = t < 38 ? "" : t < 41 ? "Phase 1 \xB7 mark live objects" : t < 43 ? "Phase 2 \xB7 compute new addresses" : t < 44.5 ? "Phase 3 \xB7 adjust pointers" : t < 51.5 ? "Phase 4 \xB7 move objects" : "";
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 218, mono: true, fs: 18, color: stopped ? PAL2.bad : PAL2.flow, a: E2(t, 0.5) }, stopped ? "app thread \xB7 stopped" : "app thread"), /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 270, mono: true, fs: 18, color: PAL2.pull, a: E2(t, 0.8) }, "GC thread"), /* @__PURE__ */ React.createElement(Lane, { x: LX, y: 212, w: LW, h: 36, segs: app, t0: TL0, t1: TL1, reveal: rev, a: E2(t, 0.5) }), /* @__PURE__ */ React.createElement(Lane, { x: LX, y: 264, w: LW, h: 36, segs: gc, t0: TL0, t1: TL1, reveal: rev, a: E2(t, 0.8) }), /* @__PURE__ */ React.createElement(Txt, { x: X(17.25), y: 219, anchor: "mid", mono: true, fs: 17, weight: 600, color: PAL2.bg, a: E2(t, 12) }, "stop-the-world: Pause Young"), /* @__PURE__ */ React.createElement(Txt, { x: X(44.25), y: 219, anchor: "mid", mono: true, fs: 17, weight: 600, color: PAL2.bg, a: E2(t, 38) }, "stop-the-world: Pause Full"), /* @__PURE__ */ React.createElement(Txt, { x: 1824, y: 312, anchor: "right", mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 12) }, "slow motion \xB7 the real pauses are milliseconds"), /* @__PURE__ */ React.createElement(Box, { x: 96, y: 360, w: 760, h: 200, tone: "flow", a: E2(t, 2) }), /* @__PURE__ */ React.createElement(AreaLabel, { x: 112, y: 366, text: "eden", a: E2(t, 2) }), /* @__PURE__ */ React.createElement(Box, { x: 876, y: 360, w: 170, h: 200, tone: "green", a: E2(t, 2.2) }), /* @__PURE__ */ React.createElement(AreaLabel, { x: 890, y: 366, text: "survivor", a: E2(t, 2.2) }), /* @__PURE__ */ React.createElement(Box, { x: 1062, y: 360, w: 170, h: 200, tone: "green", a: E2(t, 2.4), dashed: true }), /* @__PURE__ */ React.createElement(AreaLabel, { x: 1076, y: 366, text: "survivor", a: E2(t, 2.4) }), /* @__PURE__ */ React.createElement(Box, { x: 1252, y: 360, w: 572, h: 200, tone: "blue", a: E2(t, 2.6), glow: win(t, 37, 51.5) * 0.6 }), /* @__PURE__ */ React.createElement(AreaLabel, { x: 1268, y: 366, text: phase ? "old \xB7 " + phase : "old", a: E2(t, 2.6), color: phase ? PAL2.pull : void 0 }), EDEN.map((e, k) => {
      const born = 6 + k * 0.15;
      if (e.live) {
        const j = [5, 13, 22, 27].indexOf(k);
        const [x, y] = track(t, [[16.5 + j * 0.9, ex(e.c), ey(e.r)], [17.6 + j * 0.9, s0[j][0], s0[j][1]]]);
        return /* @__PURE__ */ React.createElement(Obj, { key: k, x, y, w: j < 4 ? 62 : 80, h: 32, tone: "pull", a: E2(t, born, 0.2), glow: win(t, 12, 16.5) * 0.8 });
      }
      const gone = E2(t, 22, 0.6);
      return /* @__PURE__ */ React.createElement(Obj, { key: k, x: ex(e.c), y: ey(e.r), w: 80, h: 32, tone: "flow", dead: t > 11, a: E2(t, born, 0.2) * (1 - gone) });
    }), EDEN.slice(0, 20).map((e, k) => /* @__PURE__ */ React.createElement(Obj, { key: "r" + k, x: ex(e.c), y: ey(e.r), w: 80, h: 32, tone: "flow", a: E2(t, 25 + k * 0.5, 0.2) * (1 - E2(t, 37, 0.5)) })), OLDC.map((o, k) => {
      const li = liveOld.indexOf(o);
      const tx = li >= 0 ? ox(li % 7) : ox(o.c), ty = li >= 0 ? oy(Math.floor(li / 7)) : oy(o.r);
      const [x, y] = li >= 0 ? track(t, [[44.6 + li * 0.12, ox(o.c), oy(o.r)], [45.6 + li * 0.12, tx, ty]]) : [ox(o.c), oy(o.r)];
      const deadNow = o.dead && t > o.dieAt;
      const a = E2(t, o.at, 0.25) * (deadNow ? 1 - E2(t, 45.5, 0.6) : 1);
      return /* @__PURE__ */ React.createElement(Obj, { key: k, x, y, w: 70, h: 32, tone: "pull", dead: deadNow, a, glow: !deadNow ? win(t, 38.2, 41, 0.3) * 0.9 : 0 });
    }), s0.map(([x, y], j) => /* @__PURE__ */ React.createElement(Obj, { key: "s" + j, x, y, w: 62, h: 32, tone: "pull", a: t > 17.6 + j * 0.9 ? 1 - E2(t, 30, 0.6) : 0 })), /* @__PURE__ */ React.createElement(Badge, { x: 476, y: 538, text: "the dead ones are simply abandoned", tone: "flow", a: win(t, 19, 24), fs: 17 }), /* @__PURE__ */ React.createElement(Badge, { x: 1538, y: 538, text: "cache entries promoted and replaced over time", tone: "blue", a: win(t, 31, 37), fs: 17 }), /* @__PURE__ */ React.createElement(LogPanel, { x: 96, y: 600, w: 1150, h: 268, t, a: E2(t, 24), fs: 17, lh: 30, lines: [
      { at: 24.5, s: "[1.465s][info][gc] GC(40) Pause Young (Allocation Failure) 298M->165M(494M) 4.733ms", hl: win(t, 24.5, 31) },
      { at: 38.5, s: "[3.276s][info][gc,phases] GC(87) Phase 1: Mark live objects 76.149ms", hl: win(t, 44, 50) },
      { at: 41, s: "[3.312s][info][gc,phases] GC(87) Phase 2: Compute new object addresses 36.340ms" },
      { at: 43, s: "[3.317s][info][gc,phases] GC(87) Phase 3: Adjust pointers 5.312ms" },
      { at: 44.5, s: "[3.339s][info][gc,phases] GC(87) Phase 4: Move objects 21.702ms" },
      { at: 46, s: "[3.339s][info][gc] GC(87) Pause Full (Allocation Failure) 482M->134M(494M) 139.855ms", hl: E2(t, 46.5), tone: "bad" }
    ] }), /* @__PURE__ */ React.createElement(Card, { x: 1280, y: 600, w: 544, h: 268, a: E2(t, 1) * (1 - E2(t, 51.6, 0.4)), num: "-XX:+UseSerialGC", title: "One GC thread", sub: "young: **copying** into a survivor space \xB7 old: **mark-compact** \xB7 the app waits for all of it", tfs: 30, sfs: 21 }), /* @__PURE__ */ React.createElement(Card, { x: 1280, y: 600, w: 544, h: 268, a: E2(t, 52), tone: "flow", num: "right when", title: "1 CPU \xB7 tiny heap \xB7 CLI tool", sub: "Smallest footprint of any collector. Not legacy: the right tool for its niche.", tfs: 30, sfs: 21, glow: win(t, 52, 60) * 0.6 }));
  }
  var WEND = [12.1, 12.5, 11.9, 12.3, 12.4, 12, 12.2, 12.5];
  function SParallel({ t }) {
    const TL0 = 3, TL1 = 32, LX = 330, LW = 1494;
    const rev = lin(t, TL0, 12);
    const barA = 1 - E2(t, 42.6, 0.4);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 212, mono: true, fs: 18, color: t > 9 && t < 12.5 ? PAL2.bad : PAL2.flow, a: E2(t, 0.5) }, "app thread"), /* @__PURE__ */ React.createElement(Lane, { x: LX, y: 206, w: LW, h: 30, segs: [[3, 9, "run"], [9, 12.5, "stw"], [12.5, 32, "run"]], t0: TL0, t1: TL1, reveal: rev, a: E2(t, 0.5) }), WEND.map((e, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 248 + i * 23, mono: true, fs: 17, color: PAL2.pull, a: E2(t, 5.5 + i * 0.1) }, "GC worker ", i + 1), /* @__PURE__ */ React.createElement(Lane, { x: LX, y: 251 + i * 23, w: LW, h: 16, segs: [[9, e, "gc"]], t0: TL0, t1: TL1, reveal: rev, a: E2(t, 5.5 + i * 0.1) }))), /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 438, mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 12) }, "Serial, same work"), /* @__PURE__ */ React.createElement(Lane, { x: LX, y: 441, w: LW, h: 16, segs: [[9, 9 + 3.4 * 6.5, "idle"]], t0: TL0, t1: TL1, reveal: lin(t, 12, 4) * 0.9, a: E2(t, 12) * 0.9 }), /* @__PURE__ */ React.createElement(Txt, { x: LX + (13 - TL0) / (TL1 - TL0) * LW, y: 464, mono: true, fs: 17, color: PAL2.ink2, a: E2(t, 12.5) }, "one pause split 8 ways: same work, a much shorter wait"), /* @__PURE__ */ React.createElement(LogPanel, { x: 96, y: 500, w: 1728, h: 112, title: "Serial \xB7 a full GC", t, a: E2(t, 17.5), fs: 17, lh: 30, lines: [
      { s: "[3.339s][info][gc] GC(87) Pause Full (Allocation Failure) 482M->134M(494M) 139.855ms", hl: win(t, 17.5, 28) },
      { at: 28.5, s: "[3.339s][info][gc,cpu] GC(87) User=0.03s Sys=0.07s Real=0.14s", hl: win(t, 36, 43) }
    ] }), /* @__PURE__ */ React.createElement(LogPanel, { x: 96, y: 628, w: 1728, h: 112, title: "Parallel \xB7 a full GC", t, a: E2(t, 23), fs: 17, lh: 30, tone: "pull", lines: [
      { s: "[6.309s][info][gc] GC(172) Pause Full (Ergonomics) 501M->126M(505M) 12.336ms", hl: win(t, 23, 28) },
      { at: 28.5, s: "[6.309s][info][gc,cpu] GC(172) User=0.07s Sys=0.01s Real=0.01s", hl: win(t, 36, 43) }
    ] }), [["Serial", 139.855, "0.10 s CPU", "bad", 17.5], ["Parallel", 12.336, "0.08 s CPU", "pull", 23]].map(([n, ms, cpu, tone, a0], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: n }, /* @__PURE__ */ React.createElement(Txt, { x: 96, y: 772 + i * 54, mono: true, fs: 19, weight: 600, color: PAL2.ink, a: E2(t, a0 + 0.5) * barA }, n), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 240, top: 768 + i * 54, height: 34, width: ms / 140 * 1080 * M(t, a0 + 0.6, 1), borderRadius: 6, background: hexA2(toneColor2(tone), 0.85), opacity: E2(t, a0 + 0.5) * barA } }), /* @__PURE__ */ React.createElement(Txt, { x: 240 + ms / 140 * 1080 + 18, y: 772 + i * 54, mono: true, fs: 19, color: toneColor2(tone), a: E2(t, a0 + 1.4) * barA }, ms, " ms wall"), /* @__PURE__ */ React.createElement(Txt, { x: 1824, y: 772 + i * 54, anchor: "right", mono: true, fs: 19, color: PAL2.violet, a: E2(t, 36) * barA }, cpu, " (User+Sys)"))), /* @__PURE__ */ React.createElement(Callout, { x: 96, y: 772, w: 1728, tone: "pull", a: E2(t, 43), fs: 21, title: "the throughput collector", text: "About the same CPU work, a tenth of the wall time. Default from Java 5 to 8 on server machines; still the best pick for batch jobs." }));
  }

  // src/topics/8.6.jsx
  var chapters = ["Intro", "The landscape", "Serial & Parallel"];
  var scenes = [
    { name: "Intro", dur: 24, ch: 0, title: "", C: SIntro },
    { name: "Workload", dur: 52, ch: 1, title: "One workload for every collector", C: SWorkload },
    { name: "Landscape", dur: 46, ch: 1, title: "Five collectors, three costs", C: SLandscape },
    { name: "Serial", dur: 60, ch: 2, title: "Serial: one thread, everything stops", C: SSerial },
    { name: "Parallel", dur: 52, ch: 2, title: "Parallel: the same pause, split across cores", C: SParallel }
  ];
  var captions = {
    Intro: [[0.8, "Five garbage collectors ship with the JDK. They all reclaim the same garbage."], [6, "What differs is **when** your program has to stop for it, and what that costs."], [12, "We'll run one small program through every one of them, with the same 512 MB heap."], [18.5, "And end with the honest answer: most applications should change nothing."]],
    Workload: [[0.5, "Our running example: an order service, boiled down to one loop."], [5, "Every order allocates a 4 KB `request`. It is garbage a moment later."], [11.5, "Every 40th order is kept in a `recent` cache, replacing a random older entry."], [18, "So cache entries live a long time, then die in the old generation."], [24.5, "And every 50,000th order builds a 1.5 MB `report`: one big array."], [31, "Reminder from 8.5: new objects start in eden, survivors are copied, long-lived ones are promoted to old."], [38.5, "That is about 4 GB of garbage a second, with roughly 120 MB staying live."], [45, "Every collector has to clean this up. Watch how differently they do it."]],
    Landscape: [[0.5, "Every collector trades three things against each other."], [4.5, "**Throughput**: how much of the CPU goes to your code rather than to GC."], [9.5, "**Latency**: how long your threads are ever stopped."], [14, "**Footprint**: how much extra memory and CPU the collector needs to do its job."], [19, "Serial: small and simple. Parallel: maximum throughput. G1: the balance, and the default."], [27, "ZGC and Shenandoah: tiny pauses, paid for with CPU and memory headroom."], [34, "And CMS, the old low-pause collector: removed in Java 14."], [39.5, "Two families: stop-the-world collectors, and mostly concurrent ones. Start with the simplest."]],
    Serial: [[0.5, "Serial is the simplest collector: one GC thread, and everything stops while it works."], [6, "Our order loop allocates into eden until eden is full."], [11, "Then: **stop the world**. The application thread is parked at a safepoint."], [16.5, "One thread copies the few live objects out of eden into a survivor space. The dead are simply abandoned."], [24, "Eden is empty again, and the app resumes. The real JDK 17 log: a young pause of a few milliseconds."], [31, "But promoted cache entries pile up in the old generation, and eventually it fills too."], [37, "Now a **full** collection: mark-compact over the whole heap, still on one thread."], [44, "The log shows its four phases. Marking alone took 76 ms. The whole pause: 140 ms."], [52, "Right for tiny heaps, one CPU, short CLI tools. It has the smallest footprint of them all."]],
    Parallel: [[0.5, "Parallel uses the same generational algorithms, but with many GC threads."], [5.5, "On this 8-core machine, the pause is split across 8 workers: `ParallelGCThreads = 8`."], [12, "The app still stops completely. The pause is just much shorter."], [17.5, "Compare full collections from the same workload. Serial: 140 ms."], [23, "Parallel: 12 ms, for about the same amount of heap."], [28.5, "The `gc,cpu` line says why. `Real` is wall time; `User` is CPU time summed over all GC threads."], [36, "Serial: CPU time about equal to wall time, one thread. Parallel: CPU time is eight times the wall time."], [43, "Least total GC work per byte reclaimed: the throughput collector. Perfect for batch jobs."]]
  };
  window.AN.registerTopic({
    id: "8.6",
    part: "08",
    title: "The collectors",
    kicker: "Part 08 \xB7 The JVM",
    lede: "Serial, Parallel, G1, ZGC and Shenandoah, run on the same program with the same heap, so you can see exactly what each one stops and what it costs. And the honest answer that most applications should change nothing.",
    chapters,
    scenes,
    captions,
    notes: [],
    traps: [],
    recap: [],
    quiz: []
  });
})();
