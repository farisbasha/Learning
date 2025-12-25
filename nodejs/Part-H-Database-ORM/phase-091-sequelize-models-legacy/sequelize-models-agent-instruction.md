# Phase 091: Sequelize Models (Legacy)
## Agent Instructions

**Phase**: 091 | **Part**: H - Database & ORM | **Language**: TypeScript

## Topics
1. Defining models with `sequelize-typescript`
2. `@Table`, `@Column` decorators
3. Data types: STRING, INTEGER, BOOLEAN, DATE, JSON
4. Primary keys: `@AutoIncrement`, `@PrimaryKey`
5. Nullable columns: `@AllowNull`
6. Default values: `@Default`
7. Unique constraints: `@Unique`
8. Indexes: `@Index`
9. Timestamps: `createdAt`, `updatedAt`
10. Model methods: instance vs class methods
11. Hooks: `@BeforeCreate`, `@AfterCreate`
12. Laravel comparison: Eloquent models

## Example
```typescript
import { Table, Column, Model, DataType, BeforeCreate } from 'sequelize-typescript';

@Table({ tableName: 'users' })
class User extends Model {
    @Column({ primaryKey: true, autoIncrement: true })
    id!: number;

    @Column({ type: DataType.STRING(100), allowNull: false })
    email!: string;

    @Column({ type: DataType.STRING })
    password!: string;

    @BeforeCreate
    static async hashPassword(user: User) {
        user.password = await bcrypt.hash(user.password, 10);
    }
}
```

## Content Instructions
**Notes**: Sequelize model definition with TypeScript
**Summary**: Sequelize model decorators reference
