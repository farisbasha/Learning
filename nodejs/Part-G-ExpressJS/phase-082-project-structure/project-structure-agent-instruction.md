# Phase 082: Express Project Structure
## Agent Instructions

**Phase**: 082 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. Recommended folder structure for TypeScript projects
2. Separation of concerns
3. `src/` organization patterns
4. Routes folder
5. Controllers folder
6. Services folder
7. Middleware folder
8. Types/interfaces folder
9. Config folder
10. Utils/helpers folder
11. Feature-based vs layer-based organization
12. Laravel comparison: app/ structure

## Example Structure
```
src/
├── config/
│   ├── database.ts
│   └── env.ts
├── controllers/
│   └── userController.ts
├── middleware/
│   ├── auth.ts
│   └── validate.ts
├── routes/
│   ├── index.ts
│   └── users.ts
├── services/
│   └── userService.ts
├── types/
│   └── express.d.ts
├── utils/
│   └── logger.ts
├── app.ts
└── server.ts
```

## Content Instructions
**Notes**: Production-ready project structure guide
**Summary**: Project structure template
