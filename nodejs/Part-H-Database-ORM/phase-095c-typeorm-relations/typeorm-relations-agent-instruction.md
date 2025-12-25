# Phase 095c: TypeORM Relations
## Agent Instructions

**Phase**: 095c | **Part**: H - Database & ORM | **Language**: TypeScript

## Topics
1. One-to-One: `@OneToOne`, `@JoinColumn`
2. One-to-Many / Many-to-One: `@OneToMany`, `@ManyToOne`
3. Many-to-Many: `@ManyToMany`, `@JoinTable`
4. Relation options: cascade, eager, onDelete
5. Loading relations: `relations` option
6. QueryBuilder joins
7. Lazy relations
8. Bi-directional vs uni-directional
9. Self-referencing relations

## Example
```typescript
@Entity()
export class User {
    @OneToMany(() => Post, post => post.author)
    posts!: Post[];
}

@Entity()
export class Post {
    @ManyToOne(() => User, user => user.posts)
    @JoinColumn({ name: 'author_id' })
    author!: User;
}

// Loading relations
const user = await userRepository.findOne({
    where: { id: 1 },
    relations: ['posts']
});
```

## Content Instructions
**Notes**: TypeORM relationships complete guide
**Summary**: TypeORM relations decorators reference
