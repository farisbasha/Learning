# Phase 022: Event Loop Concept
## Agent Instructions

**Phase**: 022 | **Part**: C - Node.js Runtime | **Language**: TypeScript

## Topics
1. What is the event loop — loop checking for ready callbacks
2. Why single-threaded can handle thousands of connections
3. Non-blocking I/O — OS handles waiting
4. Event-driven programming model
5. The callback queue (task queue)
6. Mental model: restaurant waiter analogy
7. Visualizing the event loop

## Key Concept
> The event loop is a loop that keeps checking: "Any callbacks ready to run?"
> It executes them ONE AT A TIME.

## PHP Comparison
- PHP: Wait for DB, thread blocked
- Node: Start DB query, handle other requests, come back when ready

## Content Instructions
**Notes**: Conceptual explanation with analogies
**Summary**: Event loop mental model
