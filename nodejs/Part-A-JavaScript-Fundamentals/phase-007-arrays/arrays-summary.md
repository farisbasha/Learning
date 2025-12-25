# Phase 007: Arrays — Summary Cheatsheet

## 🏁 Navigation & Basics
- **Size**: `arr.length`
- **Check**: `Array.isArray(x)`
- **Access**: `arr[0]`
- **Last Item**: `arr.at(-1)` (New!)

---

## 🛠️ PHP ↔ JS Function Map

| Goal | PHP | JavaScript |
|------|-----|------------|
| Push/Push | `array_push($a, $v)` | `a.push(v)` |
| Filter | `array_filter($a, fn)` | `a.filter(v => ...)` |
| Transform | `array_map(fn, $a)` | `a.map(v => ...)` |
| Sum/Reduce | `array_reduce($a, fn)` | `a.reduce((acc, v) => ...)` |
| Exists? | `in_array($v, $a)` | `a.includes(v)` |
| Merge | `array_merge($a, $b)` | `[...a, ...b]` |
| Keys | `array_keys($a)` | `Object.keys(a)` (for Objects) |

---

## 🚦 Choosing the Right Method

1. **Transform data?** → `.map()`
2. **Remove items?** → `.filter()`
3. **Total/Combine?** → `.reduce()`
4. **Find one item?** → `.find()`
5. **Check IF something exists?** → `.some()`
6. **Just a side-effect (e.g. log)?** → `.forEach()`

---

## ⚠️ Mutating vs Non-Mutating

| Modifies Original (Avoid) | Returns New (Safe) |
|---------------------------|---------------------|
| `push` / `pop`           | `map`               |
| `shift` / `unshift`       | `filter`            |
| `splice`                  | `slice`             |
| `sort`                    | `concat`            |
| `reverse`                 | `[...arr].sort()`   |

---

## 💡 Remember
- **`.find()`** returns `undefined` if nothing matches.
- **`.map()`** will always return an array of the same length as the original.
- **`.filter()`** returns an empty array `[]` if nothing matches (which is truthy!).
- **Spread `...`** creates a shallow copy. If your array contains objects, those objects are still shared references.
