# Phase 091: Sequelize Models (LEGACY)

> **LEGACY NOTICE**: Sequelize model definition with `sequelize-typescript` decorators was the standard approach from 2016-2020. Modern ORMs like Prisma use schema files instead. Understanding Sequelize models is essential for maintaining legacy codebases.

## Table of Contents
1. [Model Definition Overview](#model-definition-overview)
2. [Table and Column Decorators](#table-and-column-decorators)
3. [Data Types Reference](#data-types-reference)
4. [Column Options](#column-options)
5. [Indexes](#indexes)
6. [Timestamps](#timestamps)
7. [Instance vs Class Methods](#instance-vs-class-methods)
8. [Hooks (Lifecycle Events)](#hooks)
9. [Laravel/Eloquent Comparison](#laravel-comparison)

---

## Model Definition Overview

### Basic Model Structure

```typescript
// src/models/User.ts
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  email!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
```

### Model Inheritance Chain

```
Model (Sequelize base class)
  └── Your Model (User, Post, etc.)
        ├── Instance methods (operate on single row)
        ├── Static methods (operate on table)
        └── Decorated properties (columns)
```

> **Theory Note**: The decorator pattern in sequelize-typescript uses TypeScript's reflection capabilities to extract type information at runtime. The `emitDecoratorMetadata` compiler option enables this by generating metadata about parameter and return types.

---

## Table and Column Decorators

### @Table Decorator

The `@Table` decorator configures how the model maps to a database table:

```typescript
import { Table, Model } from 'sequelize-typescript';

// Minimal - uses class name as table name
@Table
export class User extends Model {}

// With options
@Table({
  tableName: 'users',          // Explicit table name
  timestamps: true,            // Enable createdAt/updatedAt
  paranoid: true,              // Enable soft deletes (deletedAt)
  underscored: true,           // Use snake_case for columns
  freezeTableName: true,       // Don't pluralize table name
  schema: 'public',            // PostgreSQL schema
  engine: 'InnoDB',            // MySQL engine
  charset: 'utf8mb4',          // Character set
  collate: 'utf8mb4_unicode_ci', // Collation
  indexes: [                   // Table-level indexes
    { fields: ['email'], unique: true },
  ],
})
export class User extends Model {}
```

### @Column Decorator

The `@Column` decorator defines column properties:

```typescript
import { Column, DataType } from 'sequelize-typescript';

// Inferred type from TypeScript
@Column
name!: string; // → VARCHAR(255)

// Explicit data type
@Column(DataType.STRING(100))
name!: string; // → VARCHAR(100)

// With full options
@Column({
  type: DataType.STRING(100),
  allowNull: false,
  unique: true,
  defaultValue: 'Guest',
  comment: 'User display name',
  field: 'user_name', // Different DB column name
})
name!: string;
```

### @PrimaryKey and @AutoIncrement

```typescript
import {
  PrimaryKey,
  AutoIncrement,
  Column,
  DataType,
} from 'sequelize-typescript';

// Standard auto-incrementing primary key
@PrimaryKey
@AutoIncrement
@Column(DataType.INTEGER)
id!: number;

// UUID primary key
@PrimaryKey
@Column({
  type: DataType.UUID,
  defaultValue: DataType.UUIDV4,
})
id!: string;

// Composite primary key
@PrimaryKey
@Column(DataType.INTEGER)
userId!: number;

@PrimaryKey
@Column(DataType.INTEGER)
roleId!: number;
```

---

## Data Types Reference

### Common Data Types

```typescript
import { DataType } from 'sequelize-typescript';

// String types
@Column(DataType.STRING)           // VARCHAR(255)
@Column(DataType.STRING(100))      // VARCHAR(100)
@Column(DataType.TEXT)             // TEXT (unlimited)
@Column(DataType.TEXT('tiny'))     // TINYTEXT (MySQL)
@Column(DataType.CHAR(2))          // CHAR(2) fixed length

// Numeric types
@Column(DataType.INTEGER)          // INTEGER
@Column(DataType.BIGINT)           // BIGINT
@Column(DataType.SMALLINT)         // SMALLINT
@Column(DataType.TINYINT)          // TINYINT
@Column(DataType.FLOAT)            // FLOAT
@Column(DataType.DOUBLE)           // DOUBLE PRECISION
@Column(DataType.DECIMAL(10, 2))   // DECIMAL(10, 2)

// Boolean
@Column(DataType.BOOLEAN)          // BOOLEAN

// Date/Time
@Column(DataType.DATE)             // DATETIME/TIMESTAMP
@Column(DataType.DATEONLY)         // DATE (no time)
@Column(DataType.TIME)             // TIME

// Binary
@Column(DataType.BLOB)             // BLOB
@Column(DataType.BLOB('tiny'))     // TINYBLOB

// JSON (PostgreSQL/MySQL 5.7+)
@Column(DataType.JSON)             // JSON
@Column(DataType.JSONB)            // JSONB (PostgreSQL)

// UUID
@Column(DataType.UUID)             // UUID

// Array (PostgreSQL only)
@Column(DataType.ARRAY(DataType.STRING))  // TEXT[]
@Column(DataType.ARRAY(DataType.INTEGER)) // INTEGER[]

// Enum
@Column(DataType.ENUM('pending', 'active', 'banned'))
```

### Type Mapping Table

| TypeScript | Sequelize DataType | PostgreSQL | MySQL |
|------------|-------------------|------------|-------|
| `string` | STRING | VARCHAR | VARCHAR |
| `string` | TEXT | TEXT | TEXT |
| `number` | INTEGER | INTEGER | INT |
| `number` | BIGINT | BIGINT | BIGINT |
| `number` | FLOAT | REAL | FLOAT |
| `number` | DECIMAL | DECIMAL | DECIMAL |
| `boolean` | BOOLEAN | BOOLEAN | TINYINT(1) |
| `Date` | DATE | TIMESTAMP | DATETIME |
| `object` | JSON/JSONB | JSONB | JSON |
| `Buffer` | BLOB | BYTEA | BLOB |

### Complete Model Example with Various Types

```typescript
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  Default,
} from 'sequelize-typescript';

@Table({ tableName: 'products' })
export class Product extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({
    type: DataType.STRING(200),
    allowNull: false,
  })
  name!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price!: number;

  @Column(DataType.INTEGER)
  @Default(0)
  stockQuantity!: number;

  @Column(DataType.BOOLEAN)
  @Default(true)
  isActive!: boolean;

  @Column(DataType.JSONB)
  metadata?: Record<string, any>;

  @Column(DataType.ARRAY(DataType.STRING))
  tags?: string[];

  @Column(DataType.ENUM('draft', 'published', 'archived'))
  @Default('draft')
  status!: 'draft' | 'published' | 'archived';

  @Column(DataType.DATEONLY)
  releaseDate?: Date;
}
```

---

## Column Options

### allowNull

```typescript
// Required field (NOT NULL)
@Column({
  type: DataType.STRING,
  allowNull: false, // SQL: NOT NULL
})
email!: string;

// Optional field (NULL allowed)
@Column({
  type: DataType.STRING,
  allowNull: true, // Default behavior
})
nickname?: string;
```

### defaultValue

```typescript
import { Default, Column, DataType } from 'sequelize-typescript';

// Static default
@Column(DataType.STRING)
@Default('Guest')
name!: string;

// Database function (PostgreSQL)
@Column({
  type: DataType.UUID,
  defaultValue: DataType.UUIDV4,
})
uuid!: string;

// Current timestamp
@Column({
  type: DataType.DATE,
  defaultValue: DataType.NOW,
})
createdAt!: Date;

// Literal SQL
import { Sequelize } from 'sequelize';

@Column({
  type: DataType.DATE,
  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
})
timestamp!: Date;
```

### unique

```typescript
// Simple unique constraint
@Column({
  type: DataType.STRING,
  unique: true,
})
email!: string;

// Named unique constraint
@Column({
  type: DataType.STRING,
  unique: 'unique_username',
})
username!: string;

// Composite unique (use @Table indexes instead)
@Table({
  indexes: [
    {
      unique: true,
      fields: ['tenant_id', 'email'],
      name: 'unique_tenant_email',
    },
  ],
})
```

### Validation

```typescript
@Column({
  type: DataType.STRING,
  allowNull: false,
  validate: {
    notEmpty: true,                    // No empty strings
    len: [2, 100],                     // Length between 2-100
    isEmail: true,                     // Email format
    isUrl: true,                       // URL format
    isAlphanumeric: true,              // Letters and numbers only
    isIn: [['admin', 'user', 'guest']], // Allowed values
    min: 0,                            // Minimum number
    max: 100,                          // Maximum number
    isInt: true,                       // Integer only
    isDecimal: true,                   // Decimal number
    notNull: { msg: 'Email is required' }, // Custom message
    // Custom validator
    isEven(value: number) {
      if (value % 2 !== 0) {
        throw new Error('Must be even');
      }
    },
    // Async validator
    async isUnique(value: string) {
      const existing = await User.findOne({ where: { email: value } });
      if (existing) {
        throw new Error('Email already exists');
      }
    },
  },
})
email!: string;
```

---

## Indexes

### Index Decorator

```typescript
import { Index, Column, DataType } from 'sequelize-typescript';

// Simple index
@Index
@Column(DataType.STRING)
email!: string;

// Named index
@Index('idx_username')
@Column(DataType.STRING)
username!: string;

// Multiple columns share same index
@Index('idx_name')
@Column(DataType.STRING)
firstName!: string;

@Index('idx_name')
@Column(DataType.STRING)
lastName!: string;
```

### Table-Level Indexes

```typescript
@Table({
  tableName: 'users',
  indexes: [
    // Simple index
    { fields: ['email'] },

    // Unique index
    { fields: ['username'], unique: true },

    // Composite index
    { fields: ['first_name', 'last_name'] },

    // Named index
    {
      name: 'idx_active_users',
      fields: ['status', 'last_login'],
      where: { status: 'active' }, // Partial index (PostgreSQL)
    },

    // Full-text index (MySQL)
    {
      type: 'FULLTEXT',
      fields: ['title', 'content'],
    },

    // GIN index (PostgreSQL JSONB)
    {
      fields: ['metadata'],
      using: 'gin',
    },
  ],
})
export class User extends Model {}
```

---

## Timestamps

### Built-in Timestamp Decorators

```typescript
import {
  Table,
  Model,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Column,
  DataType,
} from 'sequelize-typescript';

@Table({
  tableName: 'posts',
  timestamps: true, // Enable automatic timestamps
  paranoid: true,   // Enable soft deletes (requires deletedAt)
})
export class Post extends Model {
  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt?: Date; // Only populated when soft-deleted
}
```

### Custom Timestamp Column Names

```typescript
@Table({
  tableName: 'posts',
  timestamps: true,
  createdAt: 'created_at',  // Use snake_case
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  underscored: true,        // Or set globally
})
export class Post extends Model {
  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt!: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt!: Date;
}
```

### Disabling Timestamps

```typescript
// Disable for specific model
@Table({
  timestamps: false,
})
export class Log extends Model {}

// Disable for specific operation
await User.create({ name: 'John' }, { silent: true });
await user.save({ silent: true });
```

---

## Instance vs Class Methods

### Instance Methods

Instance methods operate on a single model instance (one database row):

```typescript
@Table({ tableName: 'users' })
export class User extends Model {
  @Column(DataType.STRING)
  firstName!: string;

  @Column(DataType.STRING)
  lastName!: string;

  @Column(DataType.STRING)
  password!: string;

  // Instance method - operates on 'this'
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Async instance method
  async comparePassword(candidatePassword: string): Promise<boolean> {
    const bcrypt = await import('bcrypt');
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Instance method that modifies data
  async updateLastLogin(): Promise<void> {
    this.lastLoginAt = new Date();
    await this.save();
  }
}

// Usage
const user = await User.findByPk(1);
console.log(user.getFullName()); // "John Doe"
const valid = await user.comparePassword('secret');
```

### Class (Static) Methods

Class methods operate on the model class (the table):

```typescript
@Table({ tableName: 'users' })
export class User extends Model {
  @Column(DataType.STRING)
  email!: string;

  @Column(DataType.BOOLEAN)
  @Default(true)
  isActive!: boolean;

  // Static method - custom finder
  static async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  // Static method - complex query
  static async getActiveUsers(): Promise<User[]> {
    return this.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
    });
  }

  // Static method - aggregation
  static async countByStatus(): Promise<Record<string, number>> {
    const results = await this.findAll({
      attributes: [
        'isActive',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      ],
      group: ['isActive'],
      raw: true,
    });
    return Object.fromEntries(
      results.map((r: any) => [r.isActive ? 'active' : 'inactive', r.count])
    );
  }
}

// Usage
const user = await User.findByEmail('john@example.com');
const activeUsers = await User.getActiveUsers();
const counts = await User.countByStatus();
```

### Virtual Fields (Computed Properties)

```typescript
import { Column, DataType } from 'sequelize-typescript';

@Table({ tableName: 'users' })
export class User extends Model {
  @Column(DataType.STRING)
  firstName!: string;

  @Column(DataType.STRING)
  lastName!: string;

  // Virtual field - not stored in database
  @Column(DataType.VIRTUAL)
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Virtual with custom getter/setter
  @Column({
    type: DataType.VIRTUAL,
    get() {
      return this.getDataValue('firstName')?.toUpperCase();
    },
  })
  upperName!: string;
}
```

---

## Hooks (Lifecycle Events)

### Hook Overview

Hooks allow you to execute code at specific points in a model's lifecycle:

```
Create Flow:      beforeValidate → afterValidate → beforeCreate → afterCreate
Update Flow:      beforeValidate → afterValidate → beforeUpdate → afterUpdate
Delete Flow:      beforeDestroy → afterDestroy
Find Flow:        beforeFind → afterFind
Bulk Operations:  beforeBulkCreate → afterBulkCreate (etc.)
```

### Decorator-Based Hooks

```typescript
import {
  Table,
  Model,
  Column,
  DataType,
  BeforeCreate,
  AfterCreate,
  BeforeUpdate,
  BeforeDestroy,
  BeforeSave,
  BeforeValidate,
} from 'sequelize-typescript';
import bcrypt from 'bcrypt';

@Table({ tableName: 'users' })
export class User extends Model {
  @Column(DataType.STRING)
  email!: string;

  @Column(DataType.STRING)
  password!: string;

  @Column(DataType.STRING)
  passwordHash!: string;

  // Runs before validation on create/update
  @BeforeValidate
  static normalizeEmail(instance: User) {
    if (instance.email) {
      instance.email = instance.email.toLowerCase().trim();
    }
  }

  // Runs before insert
  @BeforeCreate
  static async hashPassword(instance: User) {
    if (instance.password) {
      instance.passwordHash = await bcrypt.hash(instance.password, 10);
      instance.password = ''; // Clear plain password
    }
  }

  // Runs after insert
  @AfterCreate
  static async sendWelcomeEmail(instance: User) {
    console.log(`Sending welcome email to ${instance.email}`);
    // await emailService.sendWelcome(instance.email);
  }

  // Runs before update
  @BeforeUpdate
  static async rehashPasswordIfChanged(instance: User) {
    if (instance.changed('password') && instance.password) {
      instance.passwordHash = await bcrypt.hash(instance.password, 10);
      instance.password = '';
    }
  }

  // Runs before any save (create or update)
  @BeforeSave
  static updateTimestamp(instance: User) {
    console.log(`Saving user: ${instance.email}`);
  }

  // Runs before delete
  @BeforeDestroy
  static async cleanupRelatedData(instance: User) {
    console.log(`Cleaning up data for user ${instance.id}`);
    // await Post.destroy({ where: { userId: instance.id } });
  }
}
```

### All Available Hooks

```typescript
import {
  // Validation hooks
  BeforeValidate,
  AfterValidate,

  // Create hooks
  BeforeCreate,
  AfterCreate,

  // Update hooks
  BeforeUpdate,
  AfterUpdate,

  // Save hooks (create + update)
  BeforeSave,
  AfterSave,

  // Destroy hooks
  BeforeDestroy,
  AfterDestroy,

  // Upsert hooks
  BeforeUpsert,
  AfterUpsert,

  // Bulk operation hooks
  BeforeBulkCreate,
  AfterBulkCreate,
  BeforeBulkUpdate,
  AfterBulkUpdate,
  BeforeBulkDestroy,
  AfterBulkDestroy,

  // Find hooks
  BeforeFind,
  BeforeFindAfterExpandIncludeAll,
  BeforeFindAfterOptions,
  AfterFind,

  // Sync hooks
  BeforeSync,
  AfterSync,
} from 'sequelize-typescript';
```

### Hook Execution Order

```typescript
// Order for Model.create():
// 1. beforeValidate
// 2. afterValidate
// 3. beforeCreate
// 4. beforeSave
// 5. [SQL INSERT executed]
// 6. afterCreate
// 7. afterSave

// Order for instance.save() (existing record):
// 1. beforeValidate
// 2. afterValidate
// 3. beforeUpdate
// 4. beforeSave
// 5. [SQL UPDATE executed]
// 6. afterUpdate
// 7. afterSave
```

### Bulk Operation Hooks Caveat

> **LEGACY GOTCHA**: By default, bulk operations (`bulkCreate`, `update`, `destroy` with `where`) do NOT run individual hooks. You must pass `{ individualHooks: true }`:

```typescript
// Individual hooks NOT called
await User.destroy({ where: { isActive: false } });

// Individual hooks ARE called (slower, but hooks run)
await User.destroy({
  where: { isActive: false },
  individualHooks: true,
});

// Same for bulkCreate
await User.bulkCreate(users, { individualHooks: true });
```

---

## Laravel/Eloquent Comparison

### Model Definition

```php
// Laravel: app/Models/User.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'users';
    protected $fillable = ['name', 'email', 'password'];
    protected $hidden = ['password'];
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_admin' => 'boolean',
    ];

    // Accessor
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    // Mutator
    public function setPasswordAttribute($value): void
    {
        $this->attributes['password'] = bcrypt($value);
    }
}
```

```typescript
// Sequelize: src/models/User.ts
import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
} from 'sequelize-typescript';
import bcrypt from 'bcrypt';

@Table({ tableName: 'users' })
export class User extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  email!: string;

  @Column(DataType.STRING)
  password!: string;

  // Accessor (Virtual field)
  @Column(DataType.VIRTUAL)
  get fullName(): string {
    return `${this.getDataValue('firstName')} ${this.getDataValue('lastName')}`;
  }

  // Mutator equivalent (Hook)
  @BeforeCreate
  static async hashPassword(instance: User) {
    instance.password = await bcrypt.hash(instance.password, 10);
  }

  // For JSON serialization (like $hidden)
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}
```

### Eloquent $fillable / $guarded vs Sequelize

```php
// Laravel: Mass assignment protection
class User extends Model
{
    protected $fillable = ['name', 'email']; // Allowed
    // or
    protected $guarded = ['id', 'is_admin']; // Blocked
}
```

```typescript
// Sequelize: No built-in equivalent, use hooks or validation
@Table({ tableName: 'users' })
export class User extends Model {
  @BeforeCreate
  @BeforeUpdate
  static preventMassAssignment(instance: User, options: any) {
    const blocked = ['isAdmin', 'role'];
    blocked.forEach(field => {
      if (instance.changed(field)) {
        throw new Error(`Cannot mass-assign ${field}`);
      }
    });
  }
}

// Alternative: Use DTOs/validation layer before creating
const createUser = (data: CreateUserDto) => {
  const { name, email } = data; // Only extract allowed fields
  return User.create({ name, email });
};
```

### Eloquent Casts vs Sequelize

```php
// Laravel: Automatic type casting
protected $casts = [
    'options' => 'array',
    'is_admin' => 'boolean',
    'birthday' => 'date',
];
```

```typescript
// Sequelize: Use DataType + getters/setters
@Column(DataType.JSONB)
options!: Record<string, any>; // Auto-parsed from JSON

@Column(DataType.BOOLEAN)
isAdmin!: boolean; // Auto-converted

@Column(DataType.DATEONLY)
birthday!: Date;

// Custom casting with getter
@Column({
  type: DataType.STRING,
  get() {
    const raw = this.getDataValue('tags');
    return raw ? raw.split(',') : [];
  },
  set(value: string[]) {
    this.setDataValue('tags', value.join(','));
  },
})
tags!: string[];
```

### Eloquent Events vs Sequelize Hooks

```php
// Laravel: Model events
class User extends Model
{
    protected static function booted()
    {
        static::creating(function ($user) {
            $user->uuid = Str::uuid();
        });

        static::created(function ($user) {
            Mail::to($user)->send(new WelcomeMail($user));
        });

        static::deleting(function ($user) {
            $user->posts()->delete();
        });
    }
}
```

```typescript
// Sequelize: Decorator hooks
@Table({ tableName: 'users' })
export class User extends Model {
  @BeforeCreate
  static generateUuid(instance: User) {
    instance.uuid = uuidv4();
  }

  @AfterCreate
  static async sendWelcome(instance: User) {
    await mailService.send(new WelcomeMail(instance));
  }

  @BeforeDestroy
  static async deletePosts(instance: User) {
    await Post.destroy({ where: { userId: instance.id } });
  }
}
```

---

## Key Takeaways

1. **Decorators define schema** - Unlike Prisma's schema file, Sequelize uses TypeScript decorators in model classes.

2. **DataType must match TypeScript** - Ensure your DataType matches your TypeScript type annotation.

3. **Virtual fields for computed properties** - Use `DataType.VIRTUAL` for non-persisted computed values.

4. **Hooks are powerful but tricky** - Bulk operations skip individual hooks by default.

5. **No built-in mass assignment protection** - Unlike Eloquent's `$fillable`, you must implement this yourself.

6. **Timestamps are configurable** - Can be enabled/disabled and renamed per model.

---

## What's Next?

In the next phase, we'll explore **Sequelize CRUD Operations**:
- Creating records with create() and build()
- Reading with findAll(), findOne(), findByPk()
- Updating and deleting records
- Query operators and conditions
