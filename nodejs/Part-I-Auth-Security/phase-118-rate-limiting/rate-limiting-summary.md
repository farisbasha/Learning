# Phase 118: Rate Limit Patterns Summary

## 🛠️ Configuration Cheat-Sheet

```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 1. Time Window (15m)
  max: 100,                  // 2. Max Requests
  standardHeaders: true,     // 3. Return RateLimit Headers
  legacyHeaders: false,      // 4. Disable X-RateLimit Headers
  message: "Too busy!",      // 5. Custom Message
  statusCode: 429            // 6. Correct Status Code
});
```

## Strategy Selection

| Endpoint Type | Window | Max | Strategy |
| :--- | :--- | :--- | :--- |
| **Login / Register** | 1 Hour | 5 | Block abuse of credentials. |
| **Public API** | 15 Mins | 100 | Prevent DoS/DDoS. |
| **Heavy (Video Proc)**| 1 Hour | 2 | Prevent CPU resource exhaustion. |
| **Internal Tools** | 1 Min | 1000 | High throughput for trusted staff. |

## HTTP Headers in Response

- `RateLimit-Limit`: The quota (e.g., 100).
- `RateLimit-Remaining`: How many are left (e.g., 58).
- `RateLimit-Reset`: Time when the window resets (Timestamp).

## Implementation Checklist
- [ ] Install `express-rate-limit`.
- [ ] Configure `trust proxy` for correct IP detection.
- [ ] Define a global limiter.
- [ ] Define specialized strict limiters for Auth routes.
- [ ] (Production) Integrate Redis for distributed counters.
- [ ] Handle 429 responses in the frontend UX.

## 🤝 Relationship with Laravel
Equivalent to Laravel's `throttle` middleware. In Node, we have more direct control over the `keyGenerator` to limit by API Key or custom headers.
