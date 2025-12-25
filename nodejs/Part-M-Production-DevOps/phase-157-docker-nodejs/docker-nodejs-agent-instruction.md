# Phase 157: Docker for Node.js
## Agent Instructions

**Phase**: 157 | **Part**: M - Production & DevOps | **Language**: Dockerfile

## Topics
1. Why Docker for Node.js
2. Dockerfile basics
3. Multi-stage builds
4. Node.js base images
5. Copying files efficiently
6. Installing dependencies
7. Running as non-root user
8. Environment variables
9. Health checks
10. .dockerignore

## Example
```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Security: run as non-root
USER node

COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package*.json ./

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
```

## Content Instructions
**Notes**: Docker for Node.js applications
**Summary**: Dockerfile template
