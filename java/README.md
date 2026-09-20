# The Java Route — Learning Notes

Notes built from `The-Java-Route.pdf`: **14 parts, 97 steps**, language and JVM only.
No Spring, no web frameworks. Those are a different map and only make sense after this one.

Everything here targets **Java 25 (LTS, Sept 2025)**. Where a codebase you actually
meet would look different on Java 8 or 17, the notes say so.

---

## How these notes are written

You already write Python, JS, PHP and Dart. So these notes:

- **Skip** the universal stuff — what a loop is, what a function is.
- **Contrast** — every file has a "Coming from JS/Python/Dart" section, because most
  Java confusion is not "what is this idea" but "why is Java so explicit about it".
- **Go slow** on the things you said you've never touched: pass-by-value, initialisation
  order, `equals`/`hashCode`, dynamic dispatch, why records exist.

Every file has the same six sections:

| Section | What it is |
|---|---|
| **What this is** | One line. Why the step exists. |
| **Coming from JS/Python/Dart** | The contrast that makes it click. |
| **The concepts** | Short code. Nothing over ~15 lines. |
| **⚠️ Traps** | Where people get this wrong. |
| **💀 Dead / never use** | Version-tagged, so you don't learn 2012 Java. |
| **Recap + self-check** | A table and 3 questions. |

---

## Version tags you'll see

| Tag | Meaning |
|---|---|
| `Java 8` | The version that made it final and usable. Safe to rely on. |
| `preview` | Real, but still changing. Know it, don't rely on it. |
| `💀 dead` | Removed, or should never appear in new code. |

---

## The one fact about Java's history

**In 2017 Java stopped saving up changes for years and started shipping every six months.**

Material written before that gap behaves like a different language — and most of the
internet's Java was written before it. This is why you cannot trust a random Stack
Overflow answer without checking its date.

LTS releases land every two years: **8, 11, 17, 21, 25**. Java 25 is current.

---

## ⚠️ Your setup right now

You currently have **Java 17**:

```
openjdk 17.0.17  (/opt/homebrew/opt/openjdk@17)
```

The notes are written for **Java 25**, so a few things in them will not compile for you
until you upgrade:

| Used in the notes | Needs | On your Java 17 write instead |
|---|---|---|
| `IO.println("x")` | Java 25 | `System.out.println("x")` |
| `void main() { }` | Java 25 | `public static void main(String[] args) { }` |
| Validation before `super()` | Java 25 | Put it in a static helper |
| `case Circle(double r) ->` (record patterns) | Java 21 | `if (s instanceof Circle c)` |

**Everything else works on 17** — I verified records, sealed interfaces, enums with
constant bodies, `EnumSet`, text blocks, switch expressions and defensive copying all
run correctly on your current JDK.

### Upgrading (recommended — the roadmap is built around 25)

```bash
# Option A: SDKMAN, so you can keep 17 for old projects
curl -s "https://get.sdkman.io" | bash
sdk install java 25-tem
sdk default java 25-tem

# Option B: homebrew
brew install openjdk@25
```

```bash
java --version    # should say 25.x
```

Then, for the whole of Parts 00–07, your main tool is **JShell** — Java's REPL:

```bash
jshell
```

```java
jshell> 2 + 2
$1 ==> 4

jshell> var name = "Basha"
name ==> "Basha"

jshell> name.toUpperCase()
$3 ==> "BASHA"
```

No class. No `main`. No build tool. No IDE. Type an idea, see the answer.
Use it constantly while reading these notes.

---

## Current progress

| Part | Status |
|---|---|
| 00 · Orientation and history | ✅ Notes written |
| 01 · The language, procedurally | ✅ Notes written |
| 02 · Objects, properly | ✅ Notes written |
| 03 – 13 | ⬜ Roadmap only — see `COURSE-INDEX.md` |

Start at [`Part-00-Orientation/0.1-what-the-words-mean.md`](Part-00-Orientation/0.1-what-the-words-mean.md).
