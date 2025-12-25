# Phase 020: Process vs Thread
## Agent Instructions

**Phase**: 020 | **Part**: C - Node.js Runtime | **Language**: TypeScript

## Topics
1. CPU cores explained — physical execution units
2. What is a process — container for threads, memory
3. What is a thread — actual execution path
4. OS scheduling — how threads get CPU time
5. Context switching — overhead of switching
6. Memory isolation between processes
7. PHP-FPM: one process per request
8. Node: one process, one main thread

## Key Concepts
- CPU cores run threads, not processes
- Processes OWN threads
- Node's main thread runs the event loop
- More threads ≠ always faster

## Content Instructions
**Notes**: Deep explanation with diagrams
**Summary**: Process vs Thread cheatsheet
