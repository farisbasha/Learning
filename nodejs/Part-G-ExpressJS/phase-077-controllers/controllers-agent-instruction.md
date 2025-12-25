# Phase 077: Controllers Pattern
## Agent Instructions

**Phase**: 077 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. Controller classes vs functions
2. Typed controller methods
3. Dependency injection manually
4. Keeping controllers thin
5. Single responsibility

## Example
```typescript
class UserController {
    constructor(private userService: UserService) {}
    
    async getUser(req: Request, res: Response) {
        const user = await this.userService.findById(req.params.id);
        res.json(user);
    }
}
```

## Content Instructions
**Notes**: Controller patterns with examples
**Summary**: Controller patterns reference
