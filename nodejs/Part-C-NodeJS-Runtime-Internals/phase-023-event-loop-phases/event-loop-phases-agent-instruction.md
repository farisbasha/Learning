# Phase 023: Event Loop Phases Deep Dive
## Agent Instructions

**Phase**: 023 | **Part**: C - Node.js Runtime | **Language**: TypeScript

## Topics
1. Timers phase — `setTimeout`, `setInterval` callbacks
2. Pending callbacks — I/O callbacks deferred from previous
3. Idle, prepare — internal use
4. Poll phase — retrieve new I/O events
5. Check phase — `setImmediate` callbacks
6. Close callbacks — `socket.on('close')`
7. Phase diagram and order
8. How callbacks move through phases

## Key Diagram
```
   ┌───────────────────────────┐
┌─>│           timers          │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘      
│  ┌─────────────┴─────────────┐
│  │           poll            │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
```

## Content Instructions
**Notes**: Each phase explained with examples
**Summary**: Phase diagram and quick reference
