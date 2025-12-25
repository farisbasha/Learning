# Phase 029: Callback Hell
## Agent Instructions

**Phase**: 029 | **Part**: D - Async Programming | **Language**: JavaScript (Legacy)

## Topics
1. What is callback hell — nested callbacks
2. The "pyramid of doom" visual
3. Real-world examples
4. Why it's problematic (readability, error handling)
5. Debugging callback hell
6. Partial solutions: named functions
7. Historical context: pre-Promise era
8. Why Promises/async-await were invented

## Example of Callback Hell
```javascript
getUser(userId, (err, user) => {
    getOrders(user.id, (err, orders) => {
        getOrderDetails(orders[0].id, (err, details) => {
            getProduct(details.productId, (err, product) => {
                // Pyramid of doom!
            });
        });
    });
});
```

## Content Instructions
**Notes**: Show problem, partial solutions, motivation for Promises
**Summary**: Callback hell recognition and modern alternatives
