# Phase 122: API Response Formatting
## Agent Instructions

**Phase**: 122 | **Part**: J - API Development | **Language**: TypeScript

## Topics
1. Consistent response structure
2. Success response format
3. Error response format
4. Pagination metadata
5. Response envelope pattern
6. Response transformers/serializers
7. Hiding sensitive fields
8. Date formatting
9. Null vs undefined
10. Laravel comparison: API Resources

## Example
```typescript
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, string[]>;
    };
}
```

## Content Instructions
**Notes**: API response formatting patterns
**Summary**: Response structure templates
