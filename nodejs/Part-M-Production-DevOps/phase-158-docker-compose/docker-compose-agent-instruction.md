# Phase 158: Docker Compose
## Agent Instructions

**Phase**: 158 | **Part**: M - Production & DevOps | **Language**: YAML

## Topics
1. What is Docker Compose
2. docker-compose.yml structure
3. Services: app, database, redis
4. Volumes for persistence
5. Networks
6. Environment files
7. Development vs production compose
8. Running: docker-compose up
9. Health checks
10. Laravel Sail comparison

## Example
```yaml
version: '3.8'

services:
    api:
        build:
            context: .
            target: development
        ports:
            - "3000:3000"
        volumes:
            - .:/app
            - /app/node_modules
        environment:
            - NODE_ENV=development
            - DATABASE_URL=postgresql://user:pass@db:5432/myapp
            - REDIS_URL=redis://redis:6379
        depends_on:
            - db
            - redis
    
    db:
        image: postgres:15-alpine
        environment:
            POSTGRES_USER: user
            POSTGRES_PASSWORD: pass
            POSTGRES_DB: myapp
        volumes:
            - postgres_data:/var/lib/postgresql/data
    
    redis:
        image: redis:7-alpine
        volumes:
            - redis_data:/data

volumes:
    postgres_data:
    redis_data:
```

## Content Instructions
**Notes**: Docker Compose for Node.js development
**Summary**: Docker Compose template
