# Phase 030: Event Emitters — Summary Cheatsheet

## 📡 Essential API

| Method | Description |
|--------|-------------|
| **`on(event, fn)`** | Subscribe to an event (multiple times). |
| **`once(event, fn)`**| Subscribe to an event (only first time). |
| **`emit(event, data)`**| Trigger an event and pass data. |
| **`off(event, fn)`** | Unsubscribe (same as `removeListener`). |

---

## 🛡️ The Error Rule
Always listen to `'error'`!
```javascript
emitter.on('error', (err) => { ... });
```
*If you don't, your production server will crash on errors.*

---

## 🏗️ Typed Pattern (TS)

```typescript
import { EventEmitter } from 'events';

interface UserEvents {
  'login': (user: string) => void;
  'logout': () => void;
}

// In standard Node, we just document types, 
// as EventEmitter isn't perfectly generic out of the box.
```

---

## 💡 Remember
- Listeners are called **synchronously** in order.
- `emitter.emit()` returns `true` if there were listeners, `false` otherwise.
- Avoid memory leaks by removing listeners when you're done with them (e.g. in a "cleanup" or "destroy" method).
- Most heavy-lifting modules in Node (like `http`, `fs` streams) **are** EventEmitters.
- **Part D Progression**: Callbacks → Events → **Promises** (Next!)
