// Topic 8.1 — From source to bytecode. Source notes: Part-08-The-JVM/8.1-from-source-to-bytecode.md
// All bytecode, constant-pool entries and hex bytes are real javac (JDK 17) output for Calc.java.
import { CALC_SRC, SIntro, STwoCompilers, SHexDump, SVersions, SStructure, SPoolTable, SDescriptors, SResolution, SJavap } from './8.1/scenes1.jsx';
import { SStackAdd, SPrefixes, SStackMain, SInvokes, SVTable, SIndy } from './8.1/scenes2.jsx';
import { SDesugar, SStringSwitch, SErasure, SLambdas, SClassFileApi, STraps, SRecap } from './8.1/scenes3.jsx';

const chapters = ['Intro', 'Two compilers', 'The class file', 'Constant pool', 'javap', 'Stack machine', 'Invoking methods', 'Desugaring', 'Verify it yourself', 'Class-File API', 'Traps', 'Recap'];

const scenes = [
  { name: 'Intro', dur: 22, ch: 0, title: '', C: SIntro },
  { name: 'TwoCompilers', dur: 48, ch: 1, title: 'Java is compiled twice', C: STwoCompilers },
  { name: 'HexDump', dur: 52, ch: 2, title: 'Inside Calc.class, byte by byte', C: SHexDump },
  { name: 'Versions', dur: 40, ch: 2, title: 'The version number decides who can run it', C: SVersions },
  { name: 'Structure', dur: 32, ch: 2, title: 'The shape of every class file', C: SStructure },
  { name: 'PoolTable', dur: 56, ch: 3, title: 'Names live in the constant pool', C: SPoolTable },
  { name: 'Descriptors', dur: 44, ch: 3, title: 'Descriptors: types in a few letters', C: SDescriptors },
  { name: 'Resolution', dur: 38, ch: 3, title: 'From symbolic to direct, once', C: SResolution },
  { name: 'Javap', dur: 36, ch: 4, title: 'javap: see what the compiler did', C: SJavap },
  { name: 'StackAdd', dur: 58, ch: 5, title: 'A stack machine, no registers', C: SStackAdd },
  { name: 'Prefixes', dur: 38, ch: 5, title: 'The first letter is the type', C: SPrefixes },
  { name: 'StackMain', dur: 72, ch: 5, title: 'main(), one instruction at a time', C: SStackMain },
  { name: 'Invokes', dur: 44, ch: 6, title: 'Five ways to call a method', C: SInvokes },
  { name: 'VTable', dur: 62, ch: 6, title: 'invokevirtual: the vtable', C: SVTable },
  { name: 'Indy', dur: 56, ch: 6, title: 'invokedynamic: linked at runtime', C: SIndy },
  { name: 'Desugar', dur: 58, ch: 7, title: 'Syntax that vanishes', C: SDesugar },
  { name: 'StringSwitch', dur: 44, ch: 7, title: 'A switch on strings is two switches', C: SStringSwitch },
  { name: 'Erasure', dur: 44, ch: 8, title: 'See erasure for yourself', C: SErasure },
  { name: 'Lambdas', dur: 44, ch: 8, title: 'See lambdas for yourself', C: SLambdas },
  { name: 'ClassFileApi', dur: 32, ch: 9, title: 'The Class-File API · Java 24', C: SClassFileApi },
  { name: 'Traps', dur: 32, ch: 10, title: 'Traps', C: STraps },
  { name: 'Recap', dur: 34, ch: 11, title: 'Recap', C: SRecap },
];

const captions = {
  Intro: [[0.8, 'You write Java. The JVM never sees it.'], [5.5, '`javac` turns your source into **bytecode**: a compact instruction set for a virtual machine.'], [11.5, 'This topic opens that class file: its bytes, its constant pool, the instructions inside.'], [17, 'One small class, `Calc`, carries us all the way through.']],
  TwoCompilers: [[0.5, 'Java is compiled twice.'], [3.5, 'First by `javac`, once, ahead of time. It produces portable bytecode, not machine code.'], [10, 'Then by the JVM, continuously, while your program runs.'], [14.5, 'Every method starts in the **interpreter**: slow, but it starts instantly.'], [20, 'Called often enough, **C1** compiles it: quick to compile, and it gathers a profile.'], [26.5, 'Hotter still, **C2** recompiles it aggressively, using that profile.'], [32.5, 'If an assumption turns out false, the JVM **deoptimises**: back to the interpreter, re-profile, try again.'], [39.5, "That's why a Java service starts slow and gets several times faster. This topic is the left half; 8.8 is the right."]],
  HexDump: [[0.5, 'Compile the class, then dump its raw bytes.'], [5, 'Every class file starts with the same four bytes: `CAFEBABE`, the magic number.'], [11, 'Then the version: minor `0000`, major `003D`.'], [15.5, '0x3D is 61: Java 17, the JDK on this machine. A Java 25 compiler writes 0x45, which is 69.'], [22.5, 'Next, `0033`: the constant pool count. 51 means 50 entries.'], [28, 'And the pool starts right away. `0A` is a tag meaning Methodref. It points to entries #2 and #3.'], [35, '`07` is a Class entry pointing to #4. `0C` is a NameAndType: #5 and #6.'], [41.5, '`01` is raw text: sixteen bytes spelling `java/lang/Object`.'], [47, 'Nothing here is magic. Just tags, indexes and text.']],
  Versions: [[0.5, 'Each Java release bumps the major version.'], [6, 'Run a class file on an older JVM, and it refuses.'], [12, "`UnsupportedClassVersionError`. It's not a missing class; it's a version mismatch."], [20, 'The other way always works: a Java 8 class file runs on a Java 25 JVM.'], [27, 'Java runs older class files forever, never newer ones.'], [32, 'The fix: run a newer JVM, or compile with `--release 17` to target the older one.']],
  Structure: [[0.5, 'After the header, every class file is the same fixed sequence of tables.'], [4, 'Access flags, this class, its superclass, interfaces, fields…'], [10, '…then methods. Each method carries a `Code` attribute: its bytecode.'], [16, "It also records `max_stack` and `max_locals`: exactly how big this method's frame must be."], [23, "And the biggest section by far: the constant pool. Three quarters of this file. Let's open it."]],
  PoolTable: [[0.5, 'Bytecode never spells out names. It says `#10`: an index into the constant pool.'], [6, 'Entry #10 is a Methodref, built from two other entries.'], [11, '#7 is the class, which points to the text `Calc`.'], [17, '#11 is a NameAndType, pointing to the name `add`…'], [22, '…and to the descriptor `(II)I`.'], [27.5, 'So `invokevirtual #10` means: call `Calc.add`, which takes two ints and returns an int.'], [34.5, 'Entries are shared. `<init>:()V` is stored once and used by two different constructor references.'], [42, 'Every class name, method name, string literal and type descriptor lives here, once.'], [49, "That's why `javap` output is full of `#7`, `#10`, `#14`."]],
  Descriptors: [[0.5, "Descriptors are the JVM's compact spelling of types."], [4.5, 'One letter per primitive. Watch two odd ones: `J` is long, `Z` is boolean.'], [11.5, '`L…;` wraps a class name. `[` means array of.'], [17, "`(II)I`: two ints in, an int out. That's `add`."], [24, "`([Ljava/lang/String;)V`: an array of String in, nothing out. That's `main`."], [31, '`(JZ)[D`: a long and a boolean in, a double array out.'], [37.5, 'The return type is part of the descriptor. To the JVM, a method is its name plus its full descriptor.']],
  Resolution: [[0.5, "At runtime the constant pool becomes a lookup table that gets faster as it's used."], [4.5, 'When the class loads, its pool becomes a runtime constant pool in metaspace.'], [10.5, 'The first time `invokevirtual #10` runs, #10 is still just text: a symbolic reference.'], [16.5, 'So the JVM resolves it: finds class `Calc`, loading it if needed, then `add` with that exact descriptor.'], [24, 'The result, a direct reference, is cached. In HotSpot, that cache sits beside the pool.'], [30.5, 'Every later call skips the lookup. Resolution happens lazily, once.']],
  Javap: [[0.5, '`javap` ships with every JDK. It shows you what the compiler actually produced.'], [5, 'Plain `javap` lists the non-private signatures.'], [9.5, '`-p` adds private members.'], [13.5, '`-c` disassembles: the bytecode of every method.'], [18, '`-v` is verbose: constant pool, flags, stack sizes, attributes.'], [23, '`-s` prints type descriptors.'], [27.5, '`javap -c -p -v` answers "what does this compile to?" for any question about Java.']],
  StackAdd: [[0.5, 'The JVM is a stack machine. There are no registers.'], [4.5, 'Each method call gets a frame: numbered local variable slots, and an operand stack.'], [10.5, 'Slot 0 holds `this`, so `a` is slot 1 and `b` is slot 2. Say we call `add(2, 3)`.'], [17.5, '`iload_1`: push a copy of local slot 1 onto the operand stack.'], [24, '`iload_2`: push slot 2. Two values are waiting.'], [30, '`iadd`: pop two ints, add them, push the result.'], [37, '`ireturn`: pop the top value and hand it back to the caller.'], [43.5, 'Every instruction works the same way: pop its inputs, push its output.'], [50, '`max_stack = 2` and `max_locals = 3` fix the frame size. The verifier checks they always hold.']],
  Prefixes: [[0.5, "An opcode's first letter is its type."], [4, '`i` int, `l` long, `f` float, `d` double, and `a` for a reference: an address.'], [10, 'So one operation comes in typed versions: `iload`, `lload`, `aload`…'], [16, "Booleans, bytes, chars and shorts are computed as ints. There's no `badd`."], [22, 'A long or double takes **two** local slots. Here `b` lives in slots 3 and 4.'], [29.5, 'The `_1` suffix is a one-byte shortcut for slots 0 to 3. Higher slots need an extra operand byte.']],
  StackMain: [[0.5, 'Now `main`, one instruction at a time.'], [4, '`new #7` allocates a `Calc` object on the heap, uninitialised, and pushes a reference to it.'], [9.5, '`dup` copies that reference. Why? Because the constructor call will consume one.'], [15, '`invokespecial #9` runs `<init>`, the constructor. Now the object is ready.'], [21, "`astore_1` pops the remaining reference into slot 1. That's `c`."], [26.5, 'Push the receiver and the arguments: `aload_1`, `iconst_2`, `iconst_3`.'], [33.5, '`invokevirtual #10` pops all three, runs `add` in a new frame, and pushes the result.'], [40, "`istore_2` saves 5 into slot 2. That's `r`."], [45, '`getstatic #14` pushes `System.out`. Then `iload_2` pushes `r`.'], [51.5, '`invokedynamic` turns 5 into the string `"r = 5"`. More on that soon.'], [58, '`invokevirtual #24` calls `println`. The console prints.'], [64, 'Three lines of Java became 14 instructions, 28 bytes. `return` pops the frame.']],
  Invokes: [[0.5, 'Method calls compile to one of five invoke instructions.'], [4, '`invokestatic`: a static method. No receiver, one fixed target.'], [9.5, '`invokespecial`: constructors, private methods, `super.x()`. The exact method is known: no dispatch.'], [16, "`invokevirtual`: a normal instance method. The target depends on the object's real class."], [22.5, '`invokeinterface`: the same idea, called through an interface type.'], [28.5, '`invokedynamic`: the target is decided by code, at runtime, the first time it runs.'], [35.5, "Fixed targets on the left, fully dynamic on the right. Let's open the middle and the right."]],
  VTable: [[0.5, 'How does `invokevirtual` find the right method? Through a **vtable**.'], [5, '`Dog` extends `Animal`. It overrides `speak`, but inherits `eat`.'], [11, 'Each class has a table of its virtual methods, stored with its metadata in metaspace.'], [16.5, "A subclass copies its parent's table and replaces the slots it overrides. `speak` is slot 5 in both."], [24.5, 'The call says `Animal.speak`. Resolution turns that into a slot number, once.'], [30, "At runtime: follow the object's header to its real class…"], [35.5, '…read slot 5 of that class\'s vtable, and jump. `Dog.speak` runs.'], [41.5, 'Two loads and a jump, whatever the declared type.'], [47.5, "Interfaces can't use fixed slots: a class implements many. `invokeinterface` first searches an **itable**."], [55, 'In hot code, the JIT usually skips both with inline caches. That comes in 8.8.']],
  Indy: [[0.5, '`invokedynamic` is the instruction that makes modern Java work.'], [4.5, 'Our `"r = " + r` compiled to it. The class file also names a bootstrap method and a recipe.'], [8.5, "The first time it runs, the call site is empty. There's no target yet."], [13, 'So the JVM calls its **bootstrap method**: `StringConcatFactory.makeConcatWithConstants`.'], [20, 'The bootstrap builds code for this exact recipe and returns a `CallSite`.'], [26.5, 'Now the call site is linked. Every later execution jumps straight to the target.'], [33, 'Lambdas work the same way, with `LambdaMetafactory` as the bootstrap. It creates the class implementing `Runnable` at runtime.'], [41, 'The payoff: the strategy lives in the JDK, not in your class file.'], [46.5, 'Java 9 moved string `+` to `invokedynamic`. Code compiled since gets each JDK\'s improvements without recompiling.']],
  Desugar: [[0.5, 'Much of what you write is syntax that disappears before bytecode.'], [4, "A for-each over a list becomes an `Iterator` loop. Notice the cast: that's erasure."], [11, 'Over an array, it becomes a plain indexed loop.'], [16, 'Autoboxing is just method calls: `Integer.valueOf` and `intValue`.'], [22, 'String `+` becomes one `invokedynamic`.'], [27.5, 'A lambda becomes `invokedynamic`, plus a private static method holding its body.'], [33.5, 'An enum is a final class extending `Enum`, with a static array of its constants.'], [39.5, 'A record is a final class whose `equals`, `hashCode` and `toString` are bootstrapped by `invokedynamic`.'], [46.5, 'And generics vanish entirely: `Object`, plus casts the compiler inserts for you.'], [52, 'The JVM never sees any of this sugar.']],
  StringSwitch: [[0.5, 'A `switch` on strings is fun to open up. Say `s` is `"b"`.'], [5, "Step one: compute `s.hashCode()`. For `\"b\"`, that's 98."], [10.5, 'A `lookupswitch` jumps by hash: 97 for "a", 98 for "b".'], [16.5, 'Different strings can share a hash: `"Aa"` and `"BB"` are both 2112. So it checks `equals` too.'], [24, 'A match stores a case index: here, 1.'], [29, 'Step two: a second switch on that index picks the result: 2.'], [35.5, 'Two lines of source, about thirty instructions.']],
  Erasure: [[0.5, "Now verify Part 03 with your own eyes. Here's a generic method."], [5, '`javap -s` prints its descriptor: what the JVM actually uses.'], [10, '`(Ljava/util/List;)Ljava/util/List;`. No `String`, no `Integer`. The type arguments are gone.'], [17.5, "They survive only in a `Signature` attribute. `javac` and reflection read it; execution ignores it."], [25, 'So who enforces the types? Look at a caller.'], [29.5, 'In bytecode, `List.get` returns `Object`. The compiler inserted a `checkcast String`.'], [36.5, 'Erasure in one picture: `Object` everywhere, and casts the compiler wrote for you.']],
  Lambdas: [[0.5, "Part 06 said lambdas aren't anonymous classes. Check it."], [4.5, 'An anonymous class compiles to its own file: `Anon$1.class`.'], [10, 'The lambda version produces only `Lam.class`.'], [15.5, "Inside, the lambda's body became a private static method: `lambda$new$0`."], [22, "Where the lambda was written, there's an `invokedynamic` that returns a `Runnable`."], [29, 'The implementing class is generated at runtime, on first use. Nothing on disk.'], [36.5, 'Autoboxing is just as visible: `iconst_5`, then `invokestatic Integer.valueOf`.']],
  ClassFileApi: [[0.5, 'Frameworks read and write bytecode constantly: Spring, Hibernate, Mockito, JaCoCo.'], [5.5, 'For years they bundled a library called ASM.'], [9.5, 'Every new JDK brought a new class-file version, and ASM had to catch up before they worked.'], [16, 'Java 24 made the Class-File API final: `java.lang.classfile`, inside the JDK, always current.'], [23.5, "You'll rarely call it yourself. You benefit when your frameworks stop breaking on JDK upgrades."]],
  Traps: [[0.5, 'Four traps worth avoiding.'], [3.5, '`UnsupportedClassVersionError` is a version mismatch, not a missing class.'], [10, 'Generics are not in the bytecode: only in a `Signature` attribute.'], [16.5, "Lambdas don't create class files. `invokedynamic` creates their class at runtime."], [23, "And bytecode isn't what runs for long. Hot methods become machine code."]],
  Recap: [[0.5, 'Recap.'], [3, '`javac` compiles once to bytecode; the JIT compiles hot code at runtime.'], [9, 'A class file is `CAFEBABE`, a version, a constant pool, then fields and methods.'], [15, 'The JVM is a stack machine: local slots, an operand stack, typed opcodes.'], [21, 'Five invokes. `invokedynamic` powers lambdas, string concatenation and records.'], [26.5, 'And `javap -c -p -v` shows you all of it. Use it.']],
};

const CALC = CALC_SRC.join('\n');

const notes = [
  { ch: 1, blocks: [
    { p: '**Java is compiled twice.** `javac` compiles your source once, ahead of time, into **bytecode**: instructions for a virtual machine, identical on every OS. Then, while the program runs, the JVM compiles the methods that matter into real machine code, using facts it can only know at runtime.' },
    { mini: { scene: 'TwoCompilers' } },
    { list: ['**Interpreter**: every method starts here. It executes bytecode one instruction at a time. Slow, but there is no wait.', '**C1**: once a method is called often (roughly 200 calls by default), C1 compiles it quickly and adds profiling: which branches run, which types actually show up.', '**C2**: hotter still (thousands of calls), C2 recompiles it aggressively using that profile: inlining, escape analysis, loop optimisations.', '**Deoptimisation**: C2 bets on what the profile showed (e.g. "this call always sees a `Dog`"). If the bet is lost, the JVM throws the compiled code away, goes back to the interpreter, re-profiles and recompiles.'] },
    { callout: { tone: 'pull', title: 'consequence', text: 'A Java service is slow for its first few thousand requests, then several times faster. A benchmark without warm-up measures the interpreter, not your code (8.8).' } },
  ] },
  { ch: 2, blocks: [
    { p: 'Our running example for this whole topic:' },
    { code: CALC, title: 'Calc.java' },
    { tryit: { note: 'Compile it and look at the first bytes yourself. (These are the bytes from JDK 17; on Java 25 the 8th byte is `45`.)', cmd: '$ javac Calc.java\n$ xxd Calc.class | head -4', out: '00000000: cafe babe 0000 003d 0033 0a00 0200 0307  .......=.3......\n00000010: 0004 0c00 0500 0601 0010 6a61 7661 2f6c  ..........java/l\n00000020: 616e 672f 4f62 6a65 6374 0100 063c 696e  ang/Object...<in\n00000030: 6974 3e01 0003 2829 5607 0008 0100 0443  it>...()V......C' } },
    { mini: { scene: 'HexDump' } },
    { table: { head: ['bytes', 'meaning'], rows: [['`ca fe ba be`', '**magic number**. Every class file starts with it'], ['`00 00`', 'minor version'], ['`00 3d`', 'major version: 0x3D = 61 = Java 17'], ['`00 33`', 'constant pool count: 51, so entries #1–#50'], ['`0a 0002 0003`', 'entry #1: tag 10 = Methodref → class #2, name-and-type #3'], ['`07 0004`', 'entry #2: tag 7 = Class → name in #4'], ['`01 0010 6a61…`', 'entry #4: tag 1 = Utf8, 16 bytes: `java/lang/Object`']] } },
    { h: 'Version numbers' },
    { mini: { scene: 'Versions' } },
    { table: { head: ['major', 'Java'], rows: [['52', '8'], ['55', '11'], ['61', '17'], ['65', '21'], ['69', '25']] } },
    { callout: { tone: 'bad', title: 'UnsupportedClassVersionError', text: '"class file version 69.0, this version only recognizes up to 61.0" means a Java 25 class on a Java 17 JVM. **Java runs older class files forever, never newer ones.** Fix: upgrade the runtime, or compile with `javac --release 17`.' } },
    { h: 'The structure' },
    { mini: { scene: 'Structure' } },
    { code: 'magic · version · constant pool · access flags · this/super class\n      · interfaces · fields · methods · attributes', lang: 'plain', title: 'every class file, in order' },
    { p: "Each method's `Code` attribute holds its bytecode plus **`max_stack`** and **`max_locals`**, computed by `javac`. The JVM can size the method's frame before running a single instruction, and the verifier proves no path ever exceeds them. In `Calc.class`, the constant pool is 703 of the 928 bytes: **76%** of the file." },
  ] },
  { ch: 3, blocks: [
    { p: 'The **constant pool** holds every string literal, class name, method name and type descriptor in the file, stored once and referenced by index. Instructions refer to it as `#n`.' },
    { mini: { scene: 'PoolTable' } },
    { code: '  #7 = Class              #8             // Calc\n  #8 = Utf8               Calc\n #10 = Methodref          #7.#11         // Calc.add:(II)I\n #11 = NameAndType        #12:#13        // add:(II)I\n #12 = Utf8               add\n #13 = Utf8               (II)I', lang: 'plain', title: 'javap -v Calc.class (excerpt)' },
    { h: 'Descriptors' },
    { mini: { scene: 'Descriptors' } },
    { table: { head: ['descriptor', 'type'], rows: [['`B C D F I S`', 'byte, char, double, float, int, short'], ['`J`', '**long** (L was taken)'], ['`Z`', '**boolean** (B was taken)'], ['`V`', 'void (return type only)'], ['`Ljava/lang/String;`', 'a class type'], ['`[I`', 'int[]   (`[[I` is int[][])'], ['`(II)I`', 'method: (int, int) → int']] } },
    { callout: { tone: 'violet', title: 'deeper', text: 'To the JVM, a method is **name + full descriptor**, return type included. `javac` forbids two methods that differ only in return type, but the class-file format allows it, and compilers use it for bridge methods (Part 03).' } },
    { h: 'Resolution: symbolic → direct' },
    { mini: { scene: 'Resolution' } },
    { p: "When a class loads, its pool becomes the **runtime constant pool** in metaspace. Entries start out **symbolic**: just names. The first time an instruction uses one, the JVM **resolves** it: it locates (and if necessary loads) the class, finds the member by name and descriptor, checks access, and caches the direct reference. HotSpot keeps that cache in a structure beside the pool (the *constant pool cache*). Every later execution skips the lookup. Resolution is lazy, which is why a missing class often fails only when the line that needs it first runs (8.2)." },
  ] },
  { ch: 4, blocks: [
    { mini: { scene: 'Javap' } },
    { code: '$ javap Calc.class            # non-private signatures\n$ javap -p Calc.class         # include private members\n$ javap -c Calc.class         # disassemble: the bytecode\n$ javap -c -p -v Calc.class   # everything: constant pool, flags, stack sizes\n$ javap -s Calc.class         # type descriptors', lang: 'shell' },
    { tryit: { cmd: '$ javap -c Calc.class', out: '  int add(int, int);\n    Code:\n       0: iload_1\n       1: iload_2\n       2: iadd\n       3: ireturn', outLang: 'bytecode' } },
    { p: '**Use it constantly.** Every "what does this actually compile to?" question in Parts 03, 06 and 07 is answered by `javap -c -p`.' },
  ] },
  { ch: 5, blocks: [
    { p: 'The JVM has **no registers**. Every instruction pops its inputs from an **operand stack** and pushes its result back. Each method call gets a **frame**: numbered local variable slots plus its own operand stack.' },
    { mini: { scene: 'StackAdd' } },
    { code: '0: iload_1        // push local slot 1 (a)\n1: iload_2        // push local slot 2 (b)\n2: iadd           // pop two ints, push their sum\n3: ireturn        // pop it and return it', lang: 'bytecode', title: 'add, annotated' },
    { code: 'operand stack:   [ ]  →  [ 2 ]  →  [ 2, 3 ]  →  [ 5 ]  →  [ ]', lang: 'plain', title: 'add(2, 3)' },
    { callout: { tone: 'pull', text: 'Slot 0 is `this` in an instance method. That is why `a` is slot 1. In a static method, the first parameter is slot 0.' } },
    { h: 'Typed opcodes' },
    { mini: { scene: 'Prefixes' } },
    { table: { head: ['prefix', 'type', 'examples'], rows: [['`i`', 'int (also boolean, byte, char, short)', '`iload istore iadd ireturn`'], ['`l`', 'long: **two slots**', '`lload ladd lreturn`'], ['`f`', 'float', '`fload fadd`'], ['`d`', 'double: **two slots**', '`dload dadd`'], ['`a`', 'reference ("address")', '`aload astore areturn`']] } },
    { h: 'main(), instruction by instruction' },
    { mini: { scene: 'StackMain' } },
    { code: ' 0: new           #7     // allocate an uninitialised Calc, push its reference\n 3: dup                  // copy it: <init> will consume one\n 4: invokespecial #9     // Calc.<init>()\n 7: astore_1             // c = the other copy\n 8: aload_1              // push c (the receiver)\n 9: iconst_2\n10: iconst_3\n11: invokevirtual #10    // c.add(2, 3) → pushes 5\n14: istore_2             // r = 5\n15: getstatic     #14    // push System.out\n18: iload_2              // push r\n19: invokedynamic #20, 0 // "r = " + r → pushes a String\n24: invokevirtual #24    // println(String)\n27: return', lang: 'bytecode', title: 'main, annotated (real javap output)' },
    { callout: { tone: 'violet', title: 'deeper: why new + dup', text: '`new` only allocates. The object is not usable until `<init>` runs, and the verifier tracks it as *uninitialised* until then. `invokespecial <init>` consumes one reference, so `javac` emits `dup` to keep a second copy for storing into `c`.' } },
  ] },
  { ch: 6, blocks: [
    { mini: { scene: 'Invokes' } },
    { table: { head: ['instruction', 'used for', 'how the target is found'], rows: [['`invokestatic`', 'static methods', 'fixed at link time'], ['`invokespecial`', 'constructors, `private` methods, `super.x()`', 'fixed: no dispatch'], ['`invokevirtual`', 'normal instance methods', 'vtable slot of the receiver\'s class'], ['`invokeinterface`', 'calls through an interface type', 'itable search, then slot'], ['`invokedynamic`', 'lambdas, string `+`, record methods', 'a bootstrap method decides, once, at runtime']] } },
    { h: 'invokevirtual and the vtable' },
    { mini: { scene: 'VTable' } },
    { p: "Every class's metadata (its *klass*, in metaspace) contains a **vtable**: an array of pointers to its virtual methods. A subclass starts with a copy of its parent's vtable, replaces the entries it overrides and appends new ones. So `speak` is at the **same index** in `Animal` and in `Dog`." },
    { steps: ['Resolution (once) turns `Animal.speak` into vtable index 5.', "At each call: load the receiver's klass pointer from its object header.", 'Load entry 5 from that klass\'s vtable.', 'Jump. `Dog.speak` runs even though the variable is typed `Animal`.'] },
    { callout: { tone: 'violet', title: 'deeper', text: "`Object`'s non-final methods (`equals`, `hashCode`, `toString`, `finalize`, `clone`) fill the first vtable slots of every class. Interfaces can't use fixed indexes because one class implements many interfaces, so `invokeinterface` first searches the class's **itable** for the interface, then indexes into it. In hot code the JIT replaces both with **inline caches** (8.8)." } },
    { h: 'invokedynamic' },
    { mini: { scene: 'Indy' } },
    { p: 'An `invokedynamic` call site starts **unlinked**. The first time it executes, the JVM calls the **bootstrap method** named in the class file\'s `BootstrapMethods` attribute. The bootstrap returns a `CallSite` holding the target `MethodHandle`. From then on the call site is linked, and calls go straight to the target.' },
    { list: ['String `+` → bootstrap `StringConcatFactory.makeConcatWithConstants`, with a recipe such as `"r = \\u0001"` (`\\u0001` marks each argument).', 'Lambdas → bootstrap `LambdaMetafactory.metafactory`, which spins up a hidden class implementing the functional interface.', "Records → `ObjectMethods.bootstrap` generates `equals`, `hashCode` and `toString`."] },
    { callout: { tone: 'flow', text: 'The strategy lives in the JDK, not in your class file. Since Java 9 (JEP 280), string concatenation compiles to `invokedynamic`, so each newer JDK can link the same bytecode to faster code **without recompiling**.' } },
  ] },
  { ch: 7, blocks: [
    { mini: { scene: 'Desugar' } },
    { table: { head: ['you write', 'compiles to'], rows: [['for-each over a collection', '`Iterator` + `hasNext` + `next` (+ `checkcast`)'], ['for-each over an array', 'an indexed loop with `arraylength`'], ['`Integer i = 5`', '`Integer.valueOf(5)`'], ['`int x = someInteger`', '`someInteger.intValue()`'], ['`"a" + b + "c"`', '`invokedynamic` → `StringConcatFactory`'], ['a lambda', '`invokedynamic` + a private static `lambda$…` method'], ['an `enum`', 'a final class extending `Enum`, with a static `$VALUES` array'], ['a `record`', 'a final class extending `Record`; `equals`/`hashCode`/`toString` via `invokedynamic`'], ['inner class touching a private outer field', 'NestMates attributes (Java 11+); synthetic accessors before'], ['generics', '**erased**: `Object` plus inserted casts'], ['string `switch`', 'a switch on `hashCode()`, `equals` checks, then a switch on an index']] } },
    { h: 'The string switch' },
    { mini: { scene: 'StringSwitch' } },
    { p: 'The first switch jumps on `s.hashCode()`. Because different strings can share a hash (`"Aa"` and `"BB"` are both 2112), each branch confirms with `equals` and records a case index. A second switch on that index picks the result. `javac` chooses `tableswitch` (dense keys) or `lookupswitch` (sparse keys) for each; for this example JDK 17 emitted two `lookupswitch`es.' },
  ] },
  { ch: 8, blocks: [
    { h: 'Erasure (Part 03)' },
    { mini: { scene: 'Erasure' } },
    { tryit: { cmd: '$ javap -s Erase.class', out: '  java.util.List<java.lang.String> f(java.util.List<java.lang.Integer>);\n    descriptor: (Ljava/util/List;)Ljava/util/List;' } },
    { p: 'The **descriptor**, which is what the JVM links and executes against, has no type arguments. The generic signature survives in a separate `Signature` attribute (visible with `javap -v`). `javac` reads it when you compile against the class, and reflection reads it (`getGenericReturnType()`), but execution ignores it. Type safety at runtime comes from the `checkcast` instructions the compiler inserts at each use.' },
    { h: 'Lambdas (Part 06)' },
    { mini: { scene: 'Lambdas' } },
    { tryit: { cmd: '$ javac Lam.java Anon.java && ls *.class\n$ javap -c -p Lam.class', out: 'Anon$1.class  Anon.class  Lam.class      ← no Lam$1.class\n  5: invokedynamic #7,  0   // InvokeDynamic #0:run:()Ljava/lang/Runnable;\n  private static void lambda$new$0();' } },
    { h: 'Autoboxing (Part 01)' },
    { code: '0: iconst_5\n1: invokestatic  #37   // Method java/lang/Integer.valueOf:(I)Ljava/lang/Integer;   ← the boxing, made visible', lang: 'bytecode', title: 'Integer i = 5;' },
  ] },
  { ch: 9, blocks: [
    { mini: { scene: 'ClassFileApi' } },
    { code: 'import java.lang.classfile.*;\n\nClassModel cm = ClassFile.of().parse(Path.of("Calc.class"));\nfor (MethodModel m : cm.methods())\n    System.out.println(m.methodName() + " " + m.methodType());', title: 'Java 24+' },
    { p: '**Why it exists:** Spring, Hibernate, Mockito, JaCoCo and friends manipulate bytecode. They bundled ASM, and every JDK release (with a new class-file version) broke them until ASM caught up. The Class-File API (final in Java 24, JEP 484) lives inside the JDK and always understands the current format. You will rarely use it directly; you benefit when your frameworks stop breaking on upgrades.' },
  ] },
];

const traps = [
  '`UnsupportedClassVersionError` is not a missing class. It is a **version** mismatch: a newer class file on an older JVM.',
  'Generics are not in the bytecode, only in a `Signature` attribute that execution ignores. That is why `List<String>` and `List<Integer>` are the same class at runtime.',
  'Lambdas do not create class files. `invokedynamic` creates their implementing class at runtime.',
  'Bytecode is only what runs **at first**. Hot methods are compiled to machine code by the JIT, and that is what you are really measuring in a benchmark.',
  "Slot numbers aren't parameter positions: `this` takes slot 0 in instance methods, and `long`/`double` take two slots each.",
];

const recap = [
  '**Two compilers**: `javac` once, ahead of time; the JIT continuously, at runtime.',
  '**Class file**: `CAFEBABE`, version (61 = Java 17, 69 = Java 25), constant pool, flags, this/super, interfaces, fields, methods, attributes.',
  '**Constant pool**: every literal and name stored once, referenced as `#n`; resolved lazily from symbolic to direct.',
  '**Descriptors**: `I J Z V L…; [`; a method is name + full descriptor.',
  '**Stack machine**: local slots + operand stack; typed opcodes (`i l f d a`); `max_stack`/`max_locals` known in advance.',
  '**Five invokes**: `static`, `special`, `virtual` (vtable), `interface` (itable), **`dynamic`** (bootstrap, linked once).',
  '**Desugaring**: for-each, boxing, enums, records, lambdas, string switch, generics all vanish before bytecode.',
  '**`javap -c -p -v`**: use it whenever you wonder what something compiles to.',
];

const quiz = [
  { q: '`javap -s` on a generic method shows `(Ljava/util/List;)Ljava/util/List;`. What does that prove?', options: ['The method was compiled without generics', 'The JVM executes against erased types; type arguments survive only in a Signature attribute', 'javap hides type arguments by default; `-v` puts them back into the descriptor', 'Generics are checked by the JVM at class load time'], answer: 1, why: 'The descriptor is what the JVM links against, and it has no type arguments. The generic signature lives in a separate `Signature` attribute that javac and reflection read; runtime safety comes from inserted `checkcast`s.' },
  { q: 'Which invoke instruction do lambdas compile to?', options: ['invokevirtual', 'invokeinterface', 'invokespecial', 'invokedynamic'], answer: 3, why: 'A lambda site is an `invokedynamic` whose bootstrap (`LambdaMetafactory`) creates the implementing class at runtime. The body becomes a private static `lambda$…` method.' },
  { q: 'A class file has major version 65 and the JVM supports up to 61. What happens, and does the reverse ever fail?', options: ['It runs in compatibility mode; the reverse fails', 'UnsupportedClassVersionError; the reverse (old class, new JVM) works', 'NoClassDefFoundError; the reverse also fails', 'It runs but newer features throw at runtime'], answer: 1, why: '65 is Java 21, 61 is Java 17. Newer class files are refused. Java runs older class files forever.' },
  { q: 'In `int add(int a, int b)`, why is `a` loaded with `iload_1` and not `iload_0`?', options: ['Slot 0 is reserved for the return value', 'Slot 0 holds `this` in an instance method', 'Bytecode slots are 1-based', 'Slot 0 holds the operand stack pointer'], answer: 1, why: 'Instance methods receive `this` in local slot 0. In a static method the first parameter would be slot 0.' },
  { q: 'What does `invokevirtual #10` refer to?', options: ['The 10th method in the class', 'Byte offset 10 in the method', 'Constant pool entry 10: a Methodref (class + name + descriptor)', 'vtable slot 10'], answer: 2, why: '`#10` is a constant pool index. Entry #10 is a Methodref built from #7 (class Calc) and #11 (NameAndType add:(II)I).' },
  { q: 'Why does `new Calc()` compile to `new`, then `dup`, then `invokespecial <init>`?', options: ['dup protects against garbage collection', '`<init>` consumes one reference, so a copy is needed to store in the variable', 'dup allocates the fields', 'It is a javac bug kept for compatibility'], answer: 1, why: '`new` only allocates and pushes one reference. The constructor call pops a reference as its receiver, so `dup` leaves a second one on the stack for `astore`.' },
  { q: 'How does `invokevirtual` find `Dog.speak` when the variable is typed `Animal`?', options: ['It searches the class hierarchy by name on every call', "It reads the object's klass pointer, then a fixed vtable slot resolved once", 'javac already decided it at compile time', 'Through the itable'], answer: 1, why: 'Overridden methods keep the same vtable index in subclasses. Resolution turns the symbolic method into an index once; each call is two loads and a jump.' },
  { q: 'What is the descriptor of `long sum(long a, boolean b)`?', options: ['(LB)L', '(JZ)J', '(lz)l', '(JB)J'], answer: 1, why: '`J` is long and `Z` is boolean, because `L` (class types) and `B` (byte) were already taken.' },
  { q: 'Why does a string `switch` call `equals` after switching on `hashCode()`?', options: ['To handle null', 'Because different strings can have the same hash code', 'Because hashCode is not deterministic', 'To make the switch exhaustive'], answer: 1, why: 'Hash codes collide (`"Aa"` and `"BB"` are both 2112), so each hash branch confirms the actual string with `equals`.' },
];

window.AN.registerTopic({
  id: '8.1', part: '08', title: 'From source to bytecode', kicker: 'Part 08 · The JVM',
  lede: 'Open a class file and look at it. It stops being mysterious in about ten minutes, and everything you took on trust about generics, lambdas and boxing becomes something you can verify.',
  chapters, scenes, captions, notes, traps, recap, quiz,
});
