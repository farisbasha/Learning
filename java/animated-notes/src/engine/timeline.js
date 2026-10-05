// Pure timeline math. Scenes are [{name, dur, ch}]; everything else derives from them.

export function deriveCues(scenes) {
  const starts = [];
  const byName = {};
  let acc = 0;
  for (const s of scenes) {
    starts.push(acc);
    if (!(s.name in byName)) byName[s.name] = acc;
    acc += s.dur;
  }
  return { starts, total: acc, byName };
}

export function sceneAt(cues, T) {
  const { starts } = cues;
  let i = 0;
  while (i + 1 < starts.length && T >= starts[i + 1]) i++;
  return i;
}

// Consecutive scenes sharing a chapter index form one span.
export function chapterSpans(scenes) {
  const spans = [];
  let acc = 0;
  scenes.forEach((s, i) => {
    const last = spans[spans.length - 1];
    if (last && last.ch === s.ch) last.end = acc + s.dur;
    else spans.push({ ch: s.ch, start: acc, end: acc + s.dur, first: i });
    acc += s.dur;
  });
  return spans;
}

export function chapterAt(spans, T) {
  for (let i = 0; i < spans.length; i++) if (T < spans[i].end) return i;
  return spans.length - 1;
}

// The span whose end natural playback just crossed (never the last one, never while seeking).
export function crossedBoundary(prevT, nextT, spans, seeking) {
  if (seeking) return null;
  for (let i = 0; i < spans.length - 1; i++) {
    const e = spans[i].end;
    if (prevT < e && nextT >= e) return spans[i];
  }
  return null;
}

export function captionsFor(scenes, captions, cues) {
  const out = [];
  scenes.forEach((s, i) => {
    const list = captions[s.name] || [];
    const st = cues.starts[i];
    const en = st + s.dur - 0.3;
    list.forEach(([at, text], j) => {
      const next = j + 1 < list.length ? st + list[j + 1][0] : en;
      out.push({ at: st + at, until: Math.round(Math.min(next, en) * 1000) / 1000, text });
    });
  });
  return out;
}

export function makeStore(getLS) {
  const ls = () => { try { return getLS(); } catch (e) { return undefined; } };
  return {
    get(key, fallback) {
      try {
        const raw = ls()?.getItem('an:' + key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { ls()?.setItem('an:' + key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
    },
  };
}

export const store = makeStore(() => globalThis.localStorage);
