import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deriveCues, sceneAt, chapterSpans, chapterAt, crossedBoundary, captionsFor, makeStore } from '../src/engine/timeline.js';

const scenes = [
  { name: 'Intro', dur: 10, ch: 0 },
  { name: 'A', dur: 20, ch: 1 },
  { name: 'B', dur: 15, ch: 1 },
  { name: 'C', dur: 5, ch: 2 },
];

test('deriveCues sums durations', () => {
  const c = deriveCues(scenes);
  assert.deepEqual(c.starts, [0, 10, 30, 45]);
  assert.equal(c.total, 50);
  assert.equal(c.byName.B, 30);
});

test('sceneAt handles boundaries and the end', () => {
  const c = deriveCues(scenes);
  assert.equal(sceneAt(c, 0), 0);
  assert.equal(sceneAt(c, 9.999), 0);
  assert.equal(sceneAt(c, 10), 1);
  assert.equal(sceneAt(c, 50), 3);
  assert.equal(sceneAt(c, -3), 0);
});

test('chapterSpans merges consecutive scenes of one chapter', () => {
  const s = chapterSpans(scenes);
  assert.deepEqual(s.map((x) => [x.ch, x.start, x.end]), [[0, 0, 10], [1, 10, 45], [2, 45, 50]]);
  assert.equal(chapterAt(s, 44.9), 1);
  assert.equal(chapterAt(s, 45), 2);
  assert.equal(chapterAt(s, 50), 2);
});

test('crossedBoundary only fires for natural playback', () => {
  const s = chapterSpans(scenes);
  assert.equal(crossedBoundary(44.9, 45.1, s, false).ch, 1);
  assert.equal(crossedBoundary(44.9, 45.1, s, true), null);
  assert.equal(crossedBoundary(20, 21, s, false), null);
  assert.equal(crossedBoundary(49.9, 50, s, false), null, 'end of video is not a chapter pause');
});

test('captionsFor offsets by scene start and ends before the scene ends', () => {
  const c = deriveCues(scenes);
  const caps = captionsFor(scenes, { A: [[1, 'one'], [5, 'two']], C: [[0.5, 'last']] }, c);
  assert.deepEqual(caps, [
    { at: 11, until: 15, text: 'one' },
    { at: 15, until: 29.7, text: 'two' },
    { at: 45.5, until: 49.7, text: 'last' },
  ]);
});

test('store survives a throwing localStorage', () => {
  const bad = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  const st = makeStore(() => bad);
  assert.equal(st.get('k', 7), 7);
  assert.doesNotThrow(() => st.set('k', 1));
  const mem = new Map();
  const ok = makeStore(() => ({ getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) }));
  ok.set('x', { a: 1 });
  assert.deepEqual(ok.get('x', null), { a: 1 });
  const none = makeStore(() => undefined);
  assert.equal(none.get('k', 'd'), 'd');
});
