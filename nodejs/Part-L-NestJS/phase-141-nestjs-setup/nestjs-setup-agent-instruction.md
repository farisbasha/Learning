# Phase 141: NestJS Setup
## Agent Instructions

**Phase**: 141 | **Part**: L - NestJS | **Language**: TypeScript

## Topics
1. Installing NestJS CLI
2. Creating new project: `nest new`
3. Project structure overview
4. Main file: `main.ts`
5. App module
6. Running the app
7. Hot reloading
8. Configuration
9. Environment setup
10. VS Code extensions

## Example
```bash
npm i -g @nestjs/cli
nest new my-api
cd my-api
npm run start:dev
```

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    await app.listen(3000);
}
bootstrap();
```

## Content Instructions
**Notes**: NestJS project setup guide
**Summary**: NestJS CLI commands reference
