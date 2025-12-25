# Phase 128: GraphQL Introduction
## Agent Instructions

**Phase**: 128 | **Part**: J - API Development | **Language**: TypeScript

## Topics
1. What is GraphQL — query language for APIs
2. GraphQL vs REST comparison
3. Schema Definition Language (SDL)
4. Types: Query, Mutation, Subscription
5. Scalar types
6. Object types
7. Resolvers concept
8. Apollo Server introduction
9. GraphQL Playground
10. When to use GraphQL vs REST

## Example
```typescript
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';

const typeDefs = `#graphql
    type User {
        id: ID!
        email: String!
        name: String
        posts: [Post!]!
    }
    
    type Post {
        id: ID!
        title: String!
        author: User!
    }
    
    type Query {
        users: [User!]!
        user(id: ID!): User
    }
    
    type Mutation {
        createUser(email: String!, name: String): User!
    }
`;

const resolvers = {
    Query: {
        users: () => prisma.user.findMany(),
        user: (_, { id }) => prisma.user.findUnique({ where: { id } })
    }
};
```

## Content Instructions
**Notes**: GraphQL fundamentals
**Summary**: GraphQL vs REST comparison
