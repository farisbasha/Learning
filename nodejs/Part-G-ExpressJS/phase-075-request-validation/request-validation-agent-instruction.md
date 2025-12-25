# Phase 075: Request Validation
## Agent Instructions

**Phase**: 075 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. Zod for request validation
2. Validation middleware
3. Body validation
4. Query validation
5. Params validation
6. Error message formatting

## PHP Comparison
| Laravel | Express + Zod |
|---------|---------------|
| FormRequest classes | Zod schemas |
| `$request->validate([])` | `schema.parse(req.body)` |

## Content Instructions
**Notes**: Request validation with Zod
**Summary**: Validation middleware patterns
