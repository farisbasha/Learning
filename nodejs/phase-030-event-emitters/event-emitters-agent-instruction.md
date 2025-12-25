# Phase 030: Event Emitters
## Agent Instructions

**Phase**: 030 | **Part**: D - Async Programming | **Language**: TypeScript

## Topics
1. `EventEmitter` class from 'events'
2. `emitter.on(event, listener)` — subscribe
3. `emitter.emit(event, ...args)` — trigger
4. `emitter.once()` — one-time listener
5. `emitter.removeListener()` — unsubscribe
6. Error event — special case (must handle)
7. Creating typed custom event emitters
8. Real-world uses: streams, HTTP, custom events

## TypeScript Pattern
```typescript
import { EventEmitter } from 'events';

interface MyEvents {
    data: (payload: string) => void;
    error: (err: Error) => void;
}

const emitter = new EventEmitter();
emitter.on('data', (payload: string) => console.log(payload));
emitter.emit('data', 'Hello!');
```

## Content Instructions
**Notes**: EventEmitter with TypeScript typing
**Summary**: EventEmitter API reference
