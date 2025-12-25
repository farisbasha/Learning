# Phase 030: Event Emitters — Notes

In Node.js, much of the core functionality is **Event-Driven**. Instead of waiting for a callback, objects can "emit" events that multiple "listeners" can subscribe to. This is done via the **`EventEmitter`** class.

---

## 1. The Core Concept

The `EventEmitter` works like a radio station.
- **Emitter (The Station)**: Broadcasts signals (events) when something happens.
- **Listener (The Radio)**: Tunes in to a specific signal and takes action when it hears it.

---

## 2. Basic Usage (TypeScript)

To get type-safe events, we can use a small pattern with interfaces.

```typescript
import { EventEmitter } from 'events';

const myEmitter = new EventEmitter();

// 1. Subscribe (Listen)
myEmitter.on('user_logged_in', (user: string) => {
    console.log(`Sending welcome email to ${user}...`);
});

// 2. Broadcast (Emit)
myEmitter.emit('user_logged_in', 'Basha');
```

---

## 3. Useful Methods

- **`.on(name, fn)`**: Listen every time.
- **`.once(name, fn)`**: Listen only for the FIRST time the event happens, then ignore.
- **`.emit(name, ...args)`**: Trigger the event.
- **`.removeListener(name, fn)`**: Stop listening.
- **`.removeAllListeners(name)`**: Clear all subscriptions for an event.

---

## 4. The Special 'error' Event

In Node.js, the `error` event is special. If an `EventEmitter` emits an `error` and there are **no listeners** for it, the Node.js process will **crash** with an unhandled exception.

**Rule: Always have an error listener.**

```typescript
myEmitter.on('error', (err) => {
    console.error('The emitter had a problem:', err.message);
});
```

---

## 5. Extending EventEmitter (Professional Pattern)

In a real app, you don't just use a naked `EventEmitter`. You make your classes **become** emitters.

```typescript
import { EventEmitter } from 'events';

class DBConnection extends EventEmitter {
    connect() {
        console.log("Connecting...");
        // Simulation
        setTimeout(() => {
            this.emit('connected', 'db_v1');
        }, 1000);
    }
}

const db = new DBConnection();
db.on('connected', (version) => console.log('DB Ready:', version));
db.connect();
```

---

## 6. Key Takeaways
1. **One-to-Many**: One event can trigger 10 different listeners at once.
2. **Synchronous**: By default, `EventEmitter` executes all listeners **synchronously** in the order they were added.
3. **Decoupling**: The object emitting the event doesn't need to know who is listening. This is great for building modular systems.
4. **Core Node**: Streams, HTTP servers, and Child Processes are all built on `EventEmitter`.
5. **Next Step**: Now that we've covered callbacks and events, we can move into the most important async tool: **Promises**.
