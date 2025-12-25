# Node.js + TypeScript Complete Transition Course
## Course Index — 162 Phases

> **Philosophy**: Legacy patterns first → Modern patterns with more detail
> 
> For PHP developers transitioning to Node.js + TypeScript

---

## 📂 Folder Structure

```
/Users/basha/Documents/Learning/nodejs/
├── Part-A-JavaScript-Fundamentals/     (001-010)
├── Part-B-TypeScript-Fundamentals/     (011-018)
├── Part-C-NodeJS-Runtime-Internals/    (019-026)
├── Part-D-Async-Programming/           (027-038)
├── Part-E-Modules-npm/                 (039-046)
├── Part-F-Core-NodeJS-APIs/            (047-062)
├── Part-G-ExpressJS/                   (063-085)
├── Part-H-Database-ORM/                (086-104)
├── Part-I-Auth-Security/               (105-120)
├── Part-J-API-Development/             (121-129)
├── Part-K-Testing/                     (130-139)
├── Part-L-NestJS/                      (140-152)
├── Part-M-Production-DevOps/           (153-162)
├── COURSE-INDEX.md
├── PROGRESS-TRACKER.md
└── course-plan.md
```

---

## Part A: JavaScript Fundamentals (001-010)
> *Learn JS first so you understand what TypeScript adds*

| Phase | Topic                        | Folder                    |
|-------|------------------------------|---------------------------|
| 001   | JavaScript Syntax            | `phase-001-js-syntax`     |
| 002   | Data Types & Dynamic Typing  | `phase-002-data-types`    |
| 003   | Functions & Arrow Functions  | `phase-003-functions`     |
| 004   | Closures & Scope             | `phase-004-closures-scope`|
| 005   | Objects & Prototypes         | `phase-005-objects-prototypes` |
| 006   | The `this` Keyword           | `phase-006-this-keyword`  |
| 007   | Arrays & Iteration           | `phase-007-arrays`        |
| 008   | ES6 Classes                  | `phase-008-classes`       |
| 009   | Error Handling               | `phase-009-error-handling`|
| 010   | Modern JS Features (ES6+)    | `phase-010-modern-js`     |

---

## Part B: TypeScript Fundamentals (011-018)
> *TypeScript is PRIMARY from here onwards*

| Phase | Topic                        | Folder                    |
|-------|------------------------------|---------------------------|
| 011   | TypeScript Introduction      | `phase-011-typescript-intro` |
| 012   | Basic Types                  | `phase-012-ts-basic-types`|
| 013   | Interfaces & Type Aliases    | `phase-013-ts-interfaces` |
| 014   | Functions in TypeScript      | `phase-014-ts-functions`  |
| 015   | Union & Literal Types        | `phase-015-ts-unions`     |
| 016   | Generics                     | `phase-016-ts-generics`   |
| 017   | Utility Types                | `phase-017-ts-utility-types` |
| 018   | Advanced Patterns            | `phase-018-ts-advanced`   |

---

## Part C: Node.js Runtime & Internals (019-026)
> *Understanding how Node.js works*

| Phase | Topic                        | Folder                    |
|-------|------------------------------|---------------------------|
| 019   | What is Node.js              | `phase-019-what-is-nodejs`|
| 020   | Process vs Thread            | `phase-020-process-thread`|
| 021   | PHP-FPM vs Node Architecture | `phase-021-php-vs-node`   |
| 022   | Event Loop Concept           | `phase-022-event-loop-concept` |
| 023   | Event Loop Phases Deep Dive  | `phase-023-event-loop-phases` |
| 024   | Microtasks vs Macrotasks     | `phase-024-microtasks-macrotasks` |
| 025   | Blocking vs Non-Blocking     | `phase-025-blocking-nonblocking` |
| 026   | The `process` Object         | `phase-026-process-object`|

---

## Part D: Async Programming Evolution (027-038)
> *From callbacks (legacy) to async/await (modern)*

| Phase | Topic                        | Folder                    | Lang |
|-------|------------------------------|---------------------------|------|
| 027   | Callbacks (Legacy)           | `phase-027-callbacks`     | JS   |
| 028   | Error-First Callbacks        | `phase-028-error-first-callbacks` | JS |
| 029   | Callback Hell                | `phase-029-callback-hell` | JS   |
| 030   | Event Emitters               | `phase-030-event-emitters`| TS   |
| 031   | Promises Introduction        | `phase-031-promises-intro`| TS   |
| 032   | Consuming Promises           | `phase-032-promises-consuming` | TS |
| 033   | Promise Chaining             | `phase-033-promise-chaining` | TS |
| 034   | Promise Combinators          | `phase-034-promise-combinators` | TS |
| 035   | Promisify (Converting)       | `phase-035-promisify`     | TS   |
| 036   | Async/Await                  | `phase-036-async-await`   | TS   |
| 037   | Advanced Async Patterns      | `phase-037-async-patterns`| TS   |
| 038   | Error Handling in Async      | `phase-038-async-errors`  | TS   |

---

## Part E: Modules & npm (039-046)
> *How Node organizes code*

| Phase | Topic                        | Folder                    | Lang |
|-------|------------------------------|---------------------------|------|
| 039   | CommonJS Modules (Legacy)    | `phase-039-commonjs`      | JS   |
| 040   | ES Modules                   | `phase-040-es-modules`    | TS   |
| 041   | TypeScript Module Resolution | `phase-041-ts-module-resolution` | TS |
| 042   | CommonJS vs ESM Interop      | `phase-042-module-interop`| TS   |
| 043   | npm Fundamentals             | `phase-043-npm-basics`    | TS   |
| 044   | package.json Deep Dive       | `phase-044-package-json`  | TS   |
| 045   | npm Scripts & Dev Tools      | `phase-045-npm-scripts`   | TS   |
| 046   | tsconfig.json Configuration  | `phase-046-tsconfig`      | TS   |

---

## Part F: Core Node.js APIs (047-062)
> *Built-in modules — fully typed*

| Phase | Topic                        | Folder                    |
|-------|------------------------------|---------------------------|
| 047   | File System — Basics         | `phase-047-fs-basics`     |
| 048   | File System — Directories    | `phase-048-fs-directories`|
| 049   | Path Module                  | `phase-049-path-module`   |
| 050   | OS & URL Modules             | `phase-050-os-url`        |
| 051   | HTTP Server                  | `phase-051-http-server`   |
| 052   | HTTP Routing & Body          | `phase-052-http-routing`  |
| 053   | HTTP Client                  | `phase-053-http-client`   |
| 054   | Buffers                      | `phase-054-buffers`       |
| 055   | Streams — Basics             | `phase-055-streams-basics`|
| 056   | Streams — Advanced           | `phase-056-streams-advanced` |
| 057   | Child Processes              | `phase-057-child-processes` |
| 058   | Worker Threads               | `phase-058-worker-threads`|
| 059   | Cluster Module               | `phase-059-cluster`       |
| 060   | Crypto Module                | `phase-060-crypto`        |
| 061   | Zod for Validation           | `phase-061-zod`           |
| 062   | Environment Variables        | `phase-062-env-variables` |

---

## Part G: Express.js (063-085)
> *Legacy patterns FIRST → Modern patterns*

| Phase | Topic                            | Folder | Notes |
|-------|----------------------------------|--------|-------|
| 063   | Express + TypeScript Setup       | `phase-063-express-js-setup` | |
| 064   | Express Basics                   | `phase-064-express-basics` | |
| 065   | Routing Basics                   | `phase-065-routing-basics` | |
| 066   | Route Params & Query             | `phase-066-route-params-query` | |
| 067   | Request Object Deep Dive         | `phase-067-request-object` | |
| 068   | Response Object Deep Dive        | `phase-068-response-object` | |
| 069   | Body-Parser (Legacy)             | `phase-069-body-parser-legacy` | **Legacy** |
| 070   | Middleware Concept               | `phase-070-middleware-concept` | |
| 071   | Built-in Middleware              | `phase-071-middleware-builtin` | |
| 072   | Third-Party Middleware           | `phase-072-middleware-thirdparty` | |
| 073   | Custom Middleware                | `phase-073-middleware-custom` | |
| 074   | Express-Validator (Legacy)       | `phase-074-express-validator-legacy` | **Legacy** |
| 075   | Error Handling                   | `phase-075-error-handling` | |
| 076   | Express Router                   | `phase-076-express-router` | |
| 077   | Template Engines (Legacy/SSR)    | `phase-077-template-engines` | **Legacy** |
| 078   | Static File Serving              | `phase-078-static-files` | |
| 079   | File Uploads (Multer)            | `phase-079-file-uploads-multer` | |
| 080   | Sessions                         | `phase-080-sessions-express` | |
| 081   | Zod Validation (Modern)          | `phase-081-zod-validation-modern` | ✨ **Modern** |
| 082   | Project Structure                | `phase-082-project-structure` | |
| 083   | Controllers Pattern              | `phase-083-controllers` | |
| 084   | Services Pattern                 | `phase-084-services` | |
| 085   | Dependency Injection             | `phase-085-dependency-injection` | |

---

## Part H: Database & ORM (086-104)
> *Raw SQL → Sequelize (Legacy) → TypeORM → Mongoose → Prisma (Modern)*

| Phase | Topic                          | Folder | Notes |
|-------|--------------------------------|--------|-------|
| 086   | Database Concepts              | `phase-086-database-concepts` | |
| 087   | Raw MySQL Driver (Legacy)      | `phase-087-raw-mysql-legacy` | **Legacy** |
| 088   | Raw PostgreSQL Driver (Legacy) | `phase-088-raw-postgres-legacy` | **Legacy** |
| 089   | Connection Pooling             | `phase-089-connection-pooling` | |
| 090   | Sequelize Introduction         | `phase-090-sequelize-intro-legacy` | **Legacy ORM** |
| 091   | Sequelize Models               | `phase-091-sequelize-models-legacy` | **Legacy** |
| 092   | Sequelize CRUD                 | `phase-092-sequelize-crud-legacy` | **Legacy** |
| 093   | Sequelize Relations            | `phase-093-sequelize-relations-legacy` | **Legacy** |
| 094   | Sequelize Migrations           | `phase-094-sequelize-migrations-legacy` | **Legacy** |
| 095   | TypeORM Introduction           | `phase-095-typeorm-intro` | |
| 095a  | TypeORM Entities               | `phase-095a-typeorm-entities` | |
| 095b  | TypeORM CRUD                   | `phase-095b-typeorm-crud` | |
| 095c  | TypeORM Relations              | `phase-095c-typeorm-relations` | |
| 095d  | TypeORM Migrations             | `phase-095d-typeorm-migrations` | |
| 096   | Mongoose Introduction          | `phase-096-mongoose-intro` | **MongoDB** |
| 096a  | Mongoose Schemas               | `phase-096a-mongoose-schemas` | |
| 096b  | Mongoose CRUD                  | `phase-096b-mongoose-crud` | |
| 096c  | Mongoose Relations             | `phase-096c-mongoose-relations` | |
| 096d  | Mongoose Advanced Queries      | `phase-096d-mongoose-queries` | |
| 097   | Knex Query Builder             | `phase-096-knex-query-builder` | |
| 098   | Prisma Introduction            | `phase-097-prisma-intro-modern` | ✨ **Modern** |
| 099   | Prisma Schema Design           | `phase-098-prisma-schema` | ✨ **Detailed** |
| 100   | Prisma CRUD                    | `phase-099-prisma-crud` | ✨ **Detailed** |
| 101   | Prisma Advanced Queries        | `phase-100-prisma-advanced` | ✨ **Detailed** |
| 102   | Prisma Relations               | `phase-101-prisma-relations` | ✨ **Detailed** |
| 103   | Prisma Migrations              | `phase-102-prisma-migrations` | ✨ **Detailed** |
| 104   | Prisma Transactions            | `phase-103-prisma-transactions` | ✨ **Detailed** |
| 105   | Drizzle ORM (Newest)           | `phase-104-drizzle-modern` | ✨ **Modern** |

---

## Part I: Authentication & Security (105-120)
> *Sessions → Passport (Legacy) → JWT → Modern Security*

| Phase | Topic                        | Folder | Notes |
|-------|------------------------------|--------|-------|
| 105   | HTTP Auth Basics             | `phase-105-http-auth-basics` | |
| 106   | Sessions & Cookies           | `phase-106-sessions-cookies` | |
| 107   | Passport.js Local (Legacy)   | `phase-107-passport-local-legacy` | **Legacy** |
| 108   | Passport Strategies          | `phase-108-passport-strategies` | |
| 109   | JWT Concept                  | `phase-109-jwt-concept` | |
| 110   | JWT Implementation           | `phase-110-jwt-implementation` | |
| 111   | Password Hashing Concepts    | `phase-111-password-hashing` | |
| 112   | bcrypt & Argon2              | `phase-112-bcrypt-argon` | |
| 113   | RBAC Authorization           | `phase-113-rbac-authorization` | |
| 114   | OAuth Basics                 | `phase-114-oauth-basics` | |
| 115   | Refresh Token Strategy       | `phase-115-refresh-tokens` | |
| 116   | API Keys                     | `phase-116-api-keys` | |
| 117   | Security Headers             | `phase-117-security-headers` | |
| 118   | Rate Limiting                | `phase-118-rate-limiting` | |
| 119   | CSRF Protection              | `phase-119-csrf-protection` | |
| 120   | Multi-tenancy Basics         | `phase-120-multi-tenancy` | |

---

## Part J: API Development (121-129)
> *Building production-ready APIs*

| Phase | Topic                        | Folder |
|-------|------------------------------|--------|
| 121   | REST API Design              | `phase-121-rest-design` |
| 122   | API Response Formatting      | `phase-122-api-response-format` |
| 123   | Pagination & Filtering       | `phase-123-pagination-filtering` |
| 124   | File Uploads in APIs         | `phase-124-file-uploads-api` |
| 125   | API Versioning               | `phase-125-api-versioning` |
| 126   | API Documentation (Swagger)  | `phase-126-api-documentation-swagger` |
| 127   | WebSockets (Socket.io)       | `phase-127-websockets-socketio` |
| 128   | GraphQL Introduction         | `phase-128-graphql-intro` |
| 129   | GraphQL with TypeScript      | `phase-129-graphql-typescript` |

---

## Part K: Testing (130-139)
> *Mocha/Chai (Legacy) → Jest (Modern)*

| Phase | Topic                        | Folder | Notes |
|-------|------------------------------|--------|-------|
| 130   | Testing Fundamentals         | `phase-130-testing-fundamentals` | |
| 131   | Mocha & Chai (Legacy)        | `phase-131-mocha-chai-legacy` | **Legacy** |
| 132   | Jest Introduction            | `phase-132-jest-intro` | ✨ **Modern** |
| 133   | Jest with TypeScript         | `phase-133-jest-typescript` | |
| 134   | Unit Testing                 | `phase-134-unit-testing` | |
| 135   | Mocking                      | `phase-135-mocking` | |
| 136   | Integration Testing          | `phase-136-integration-testing` | |
| 137   | API Testing (Supertest)      | `phase-137-supertest-api` | |
| 138   | E2E Testing                  | `phase-138-e2e-testing` | |
| 139   | Test Coverage                | `phase-139-test-coverage` | |

---

## Part L: NestJS (140-152)
> *The Angular-inspired Node.js framework — like Laravel for Node!*

| Phase | Topic                        | Folder |
|-------|------------------------------|--------|
| 140   | NestJS Introduction          | `phase-140-nestjs-intro` |
| 141   | NestJS Setup                 | `phase-141-nestjs-setup` |
| 142   | Modules                      | `phase-142-nestjs-modules` |
| 143   | Controllers                  | `phase-143-nestjs-controllers` |
| 144   | Providers & DI               | `phase-144-nestjs-providers` |
| 145   | DTOs & Validation            | `phase-145-nestjs-dto-validation` |
| 146   | Middleware                   | `phase-146-nestjs-middleware` |
| 147   | Guards                       | `phase-147-nestjs-guards` |
| 148   | Interceptors                 | `phase-148-nestjs-interceptors` |
| 149   | Pipes                        | `phase-149-nestjs-pipes` |
| 150   | Exception Filters            | `phase-150-nestjs-exception-filters` |
| 151   | NestJS + Prisma              | `phase-151-nestjs-prisma` |
| 152   | NestJS Authentication        | `phase-152-nestjs-auth` |

---

## Part M: Production & DevOps (153-162)
> *Deployment, monitoring, and scaling*

| Phase | Topic                        | Folder |
|-------|------------------------------|--------|
| 153   | PM2 Process Manager          | `phase-153-pm2-process-manager` |
| 154   | Environment Configuration    | `phase-154-environment-config` |
| 155   | Logging with Winston         | `phase-155-logging-winston` |
| 156   | Error Monitoring (Sentry)    | `phase-156-error-monitoring` |
| 157   | Docker for Node.js           | `phase-157-docker-nodejs` |
| 158   | Docker Compose               | `phase-158-docker-compose` |
| 159   | Performance Optimization     | `phase-159-performance-optimization` |
| 160   | Caching with Redis           | `phase-160-caching-redis` |
| 161   | Message Queues (BullMQ)      | `phase-161-message-queues-bullmq` |
| 162   | CI/CD (GitHub Actions)       | `phase-162-ci-cd-github-actions` |

---

## 🎯 Total: 162 Phases

| Part | Name | Phases | Focus |
|------|------|--------|-------|
| A | JavaScript | 10 | Foundation |
| B | TypeScript | 8 | Type System |
| C | Node Runtime | 8 | How Node Works |
| D | Async | 12 | Legacy → Modern |
| E | Modules | 8 | Package Management |
| F | Core APIs | 16 | Built-in Modules |
| G | Express | 23 | Legacy → Modern |
| H | Database | 28 | Legacy → Modern ORMs |
| I | Auth/Security | 16 | Security |
| J | API Dev | 9 | API Patterns |
| K | Testing | 10 | Legacy → Modern |
| L | NestJS | 13 | Enterprise Framework |
| M | Production | 10 | DevOps |

---

## 📝 How to Use

1. Navigate to a phase folder
2. Read the `*-agent-instruction.md` file
3. Ask: *"Read the agent instruction and generate notes and summary"*
4. Notes and summary will be created on demand
