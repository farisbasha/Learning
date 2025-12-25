# Phase 042: CommonJS vs ESM Interop
## Agent Instructions

**Phase**: 042 | **Part**: E - Modules & npm | **Language**: TypeScript

## Topics
1. Mixing CJS and ESM in one project
2. Importing CJS from ESM
3. TypeScript interop settings
4. `esModuleInterop: true`
5. `allowSyntheticDefaultImports: true`
6. Migration strategies from CJS to ESM
7. Common errors and fixes

## Common Pattern
```typescript
// ESM importing CJS package
import express from 'express'; // With esModuleInterop

// Without esModuleInterop
import * as express from 'express';
```

## Content Instructions
**Notes**: Interoperability patterns and migration
**Summary**: CJS/ESM interop quick reference
