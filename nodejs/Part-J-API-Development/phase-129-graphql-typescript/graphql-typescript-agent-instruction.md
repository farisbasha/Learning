# Phase 129: GraphQL with TypeScript
## Agent Instructions

**Phase**: 129 | **Part**: J - API Development | **Language**: TypeScript

## Topics
1. Type-safe GraphQL with graphql-codegen
2. Generating types from schema
3. Typed resolvers
4. Context typing
5. Input types
6. Enums
7. Authentication in GraphQL
8. Error handling
9. DataLoader for N+1 problem
10. Prisma + GraphQL integration

## Example
```typescript
import { Resolvers } from './generated/graphql';

interface Context {
    prisma: PrismaClient;
    user?: User;
}

const resolvers: Resolvers<Context> = {
    Query: {
        users: async (_, __, { prisma }) => {
            return prisma.user.findMany();
        }
    },
    User: {
        posts: async (parent, _, { prisma }) => {
            return prisma.post.findMany({
                where: { authorId: parent.id }
            });
        }
    },
    Mutation: {
        createUser: async (_, { input }, { prisma }) => {
            return prisma.user.create({ data: input });
        }
    }
};
```

## Content Instructions
**Notes**: Type-safe GraphQL implementation
**Summary**: GraphQL TypeScript patterns
