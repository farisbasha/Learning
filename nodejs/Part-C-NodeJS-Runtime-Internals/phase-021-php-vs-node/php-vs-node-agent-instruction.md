# Phase 021: PHP-FPM vs Node.js Architecture
## Agent Instructions

**Phase**: 021 | **Part**: C - Node.js Runtime | **Language**: TypeScript

## Topics
1. PHP request lifecycle — receive, process, respond, die
2. PHP-FPM worker pool — pre-forked processes
3. How PHP handles concurrency — one process per request
4. Node.js request lifecycle — continuous process
5. How Node handles concurrency — event loop
6. Memory usage comparison
7. Scaling strategies: PHP (more workers) vs Node (PM2/cluster)
8. When PHP wins vs when Node wins

## Key Insight
- PHP: Blocking is OK, process isolation protects others
- Node: Blocking is FATAL, blocks everyone

## Content Instructions
**Notes**: Architecture comparison with diagrams
**Summary**: PHP vs Node comparison table
