// The hub and page generator read this. To add a topic: add an entry here, write
// src/topics/<id>.jsx, run `node build.mjs`. status: 'planned' | 'building' | 'ready'.
window.AN_MANIFEST = {
  title: 'Java, animated',
  parts: [
    {
      id: '08', title: 'The JVM', sub: 'Memory and execution: the machine under your code', dir: 'part-08',
      topics: [
        { id: '8.1', slug: 'from-source-to-bytecode', title: 'From source to bytecode', status: 'ready' },
        { id: '8.2', slug: 'class-loading', title: 'Class loading', status: 'ready' },
        { id: '8.3', slug: 'runtime-memory-areas', title: 'Runtime memory areas', status: 'ready' },
        { id: '8.4', slug: 'how-an-object-is-laid-out', title: 'How an object is laid out', status: 'building' },
        { id: '8.5', slug: 'garbage-collection-theory', title: 'Garbage collection: the theory', status: 'building' },
        { id: '8.6', slug: 'the-collectors', title: 'The collectors', status: 'building' },
        { id: '8.7', slug: 'references-and-reachability', title: 'References and reachability', status: 'building' },
        { id: '8.8', slug: 'jit-compilation', title: 'JIT compilation', status: 'building' },
        { id: '8.9', slug: 'observing-a-running-jvm', title: 'Observing a running JVM', status: 'building' },
        { id: '8.10', slug: 'startup-packaging-aot', title: 'Startup, packaging and AOT', status: 'building' },
      ],
    },
  ],
};
