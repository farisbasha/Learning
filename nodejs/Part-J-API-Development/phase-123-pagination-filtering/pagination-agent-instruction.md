# Phase 123: Pagination & Filtering
## Agent Instructions

**Phase**: 123 | **Part**: J - API Development | **Language**: TypeScript

## Topics
1. Offset-based pagination
2. Cursor-based pagination
3. Page size limits
4. Filtering patterns
5. Sorting patterns
6. Search implementation
7. Combining filters
8. Prisma pagination
9. Query parameter parsing
10. Performance considerations

## Example
```typescript
interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
}

const paginate = async (params: PaginationParams) => {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 10, 100);
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
        prisma.user.findMany({
            where: params.search ? {
                OR: [
                    { name: { contains: params.search } },
                    { email: { contains: params.search } }
                ]
            } : undefined,
            orderBy: { [params.sortBy || 'createdAt']: params.sortOrder || 'desc' },
            skip,
            take: limit
        }),
        prisma.user.count()
    ]);
    
    return {
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
};
```

## Content Instructions
**Notes**: Pagination and filtering implementation
**Summary**: Pagination patterns reference
