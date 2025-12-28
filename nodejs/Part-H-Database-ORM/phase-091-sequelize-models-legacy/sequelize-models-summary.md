# Phase 091: Sequelize Models - Decorator Reference

> **LEGACY**: Quick reference for sequelize-typescript model decorators.

## Essential Model Template

```typescript
import {
  Table, Column, Model, PrimaryKey, AutoIncrement,
  DataType, CreatedAt, UpdatedAt, Default, BeforeCreate,
} from 'sequelize-typescript';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  name!: string;

  @Column({ type: DataType.STRING(255), allowNull: false, unique: true })
  email!: string;

  @Column(DataType.BOOLEAN)
  @Default(true)
  isActive!: boolean;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;

  @BeforeCreate
  static beforeCreateHook(instance: User) {
    // Pre-save logic
  }
}
```

## @Table Options

| Option | Type | Description |
|--------|------|-------------|
| `tableName` | string | Explicit table name |
| `timestamps` | boolean | Enable createdAt/updatedAt |
| `paranoid` | boolean | Enable soft deletes |
| `underscored` | boolean | Use snake_case columns |
| `freezeTableName` | boolean | Don't pluralize |
| `indexes` | array | Table-level indexes |

## @Column Options

| Option | Type | Description |
|--------|------|-------------|
| `type` | DataType | Column data type |
| `allowNull` | boolean | Allow NULL values |
| `unique` | boolean/string | Unique constraint |
| `defaultValue` | any | Default value |
| `field` | string | DB column name |
| `validate` | object | Validation rules |
| `comment` | string | Column comment |

## Common Data Types

```typescript
// Strings
DataType.STRING           // VARCHAR(255)
DataType.STRING(100)      // VARCHAR(100)
DataType.TEXT             // TEXT

// Numbers
DataType.INTEGER          // INTEGER
DataType.BIGINT           // BIGINT
DataType.FLOAT            // FLOAT
DataType.DECIMAL(10, 2)   // DECIMAL(10,2)

// Boolean & Dates
DataType.BOOLEAN          // BOOLEAN
DataType.DATE             // DATETIME
DataType.DATEONLY         // DATE only

// Special
DataType.JSON             // JSON
DataType.JSONB            // JSONB (PostgreSQL)
DataType.UUID             // UUID
DataType.VIRTUAL          // Computed (not stored)
DataType.ENUM('a', 'b')   // ENUM type
```

## Column Decorators

```typescript
@PrimaryKey               // Primary key
@AutoIncrement            // Auto-increment
@Default(value)           // Default value
@Index                    // Create index
@Index('name')            // Named index
@Unique                   // Unique constraint
@CreatedAt                // Managed createdAt
@UpdatedAt                // Managed updatedAt
@DeletedAt                // Soft delete column
```

## Hooks (Lifecycle)

| Hook | When |
|------|------|
| `@BeforeValidate` | Before validation |
| `@AfterValidate` | After validation |
| `@BeforeCreate` | Before INSERT |
| `@AfterCreate` | After INSERT |
| `@BeforeUpdate` | Before UPDATE |
| `@AfterUpdate` | After UPDATE |
| `@BeforeSave` | Before INSERT/UPDATE |
| `@AfterSave` | After INSERT/UPDATE |
| `@BeforeDestroy` | Before DELETE |
| `@AfterDestroy` | After DELETE |

## Validation Options

```typescript
@Column({
  type: DataType.STRING,
  validate: {
    notEmpty: true,
    len: [2, 100],
    isEmail: true,
    isUrl: true,
    isIn: [['a', 'b', 'c']],
    min: 0,
    max: 100,
    // Custom
    customValidator(value: string) {
      if (!value.startsWith('X')) {
        throw new Error('Must start with X');
      }
    },
  },
})
```

## Instance vs Static Methods

```typescript
@Table({ tableName: 'users' })
export class User extends Model {
  // Instance method - operates on 'this'
  getDisplayName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Static method - operates on class
  static async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }
}

// Usage
const user = await User.findByEmail('a@b.com'); // Static
user.getDisplayName();                          // Instance
```

## Virtual Fields

```typescript
@Column(DataType.VIRTUAL)
get fullName(): string {
  return `${this.firstName} ${this.lastName}`;
}
```

## Indexes at Table Level

```typescript
@Table({
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['status', 'created_at'] },
    { fields: ['metadata'], using: 'gin' }, // PostgreSQL
  ],
})
```

## Laravel Eloquent Quick Map

| Eloquent | Sequelize |
|----------|-----------|
| `$table` | `@Table({ tableName })` |
| `$fillable` | Use DTOs/validation |
| `$casts` | `DataType` + getters |
| `$hidden` | Override `toJSON()` |
| Accessors | Virtual columns |
| Mutators | `@BeforeCreate` hooks |
| Events | Hook decorators |
