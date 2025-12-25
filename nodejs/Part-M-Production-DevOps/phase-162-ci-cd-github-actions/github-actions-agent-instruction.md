# Phase 162: CI/CD with GitHub Actions
## Agent Instructions

**Phase**: 162 | **Part**: M - Production & DevOps | **Language**: YAML

## Topics
1. What is CI/CD
2. GitHub Actions basics
3. Workflow file structure
4. Triggers: push, PR, schedule
5. Jobs and steps
6. Testing in CI
7. Building Docker images
8. Deploying to servers
9. Environment secrets
10. Caching node_modules

## Example
```yaml
name: CI/CD Pipeline

on:
    push:
        branches: [main]
    pull_request:
        branches: [main]

jobs:
    test:
        runs-on: ubuntu-latest
        
        services:
            postgres:
                image: postgres:15
                env:
                    POSTGRES_PASSWORD: test
                options: >-
                    --health-cmd pg_isready
                    --health-interval 10s
        
        steps:
            - uses: actions/checkout@v4
            
            - name: Setup Node.js
              uses: actions/setup-node@v4
              with:
                  node-version: '20'
                  cache: 'npm'
            
            - run: npm ci
            - run: npm run lint
            - run: npm run test:cov
            - run: npm run build
    
    deploy:
        needs: test
        if: github.ref == 'refs/heads/main'
        runs-on: ubuntu-latest
        
        steps:
            - name: Deploy to production
              run: |
                  # Deploy script
```

## Content Instructions
**Notes**: GitHub Actions CI/CD setup
**Summary**: GitHub Actions workflow template
