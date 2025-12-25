# Phase 032: Consuming Promises
## Agent Instructions

**Phase**: 032 | **Part**: D - Async Programming | **Language**: TypeScript

## Topics
1. `.then(onFulfilled)` — handle success
2. `.catch(onRejected)` — handle error
3. `.finally(onFinally)` — cleanup
4. Return values in `.then()` — chaining
5. Error propagation through chains
6. Type inference in Promise chains

## Example
```typescript
fetchUser(1)
    .then((user) => {
        console.log(user.name);
        return user.id;
    })
    .catch((err) => {
        console.error('Failed:', err);
    })
    .finally(() => {
        console.log('Done');
    });
```

## Content Instructions
**Notes**: Consuming Promises with all handlers
**Summary**: Promise consumption patterns
