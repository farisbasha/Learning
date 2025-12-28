# Knex Query Builder - Quick Reference

## Installation

```bash
npm install knex pg           # PostgreSQL
npm install knex mysql2       # MySQL
npm install knex better-sqlite3  # SQLite
```

## Configuration

```typescript
// knexfile.ts
import type { Knex } from 'knex';

const config: Knex.Config = {
  client: 'pg',
  connection: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'mydb',
  },
  pool: { min: 2, max: 10 },
  migrations: { directory: './migrations' },
  seeds: { directory: './seeds' },
};

export default config;
```

```typescript
// db/index.ts
import Knex from 'knex';
import config from '../knexfile';

export default Knex(config);
```

---

## SELECT Queries

```typescript
// Basic select
knex('users');                          // SELECT * FROM users
knex('users').select('id', 'name');     // SELECT id, name FROM users
knex('users').select('*');              // SELECT * FROM users

// First record
knex('users').first();                  // Returns single object or undefined

// Specific columns
knex('users').select('id', 'email as userEmail');

// Distinct
knex('users').distinct('role');

// Count
knex('users').count('id');
knex('users').count('* as total');

// Pluck (array of single column values)
knex('users').pluck('email');           // ['a@b.com', 'c@d.com', ...]
```

---

## WHERE Clauses

```typescript
// Basic
.where('id', 1)                         // id = 1
.where('id', '=', 1)                    // id = 1
.where({ id: 1 })                       // id = 1
.where({ id: 1, active: true })         // id = 1 AND active = true

// Operators
.where('age', '>', 18)
.where('age', '>=', 18)
.where('age', '<', 65)
.where('age', '<=', 65)
.where('role', '!=', 'admin')

// AND / OR
.where('a', 1).where('b', 2)            // a = 1 AND b = 2
.where('a', 1).andWhere('b', 2)         // a = 1 AND b = 2
.where('a', 1).orWhere('b', 2)          // a = 1 OR b = 2

// Grouped conditions
.where(function() {
  this.where('a', 1).orWhere('b', 2);
})                                       // AND (a = 1 OR b = 2)

// WHERE IN
.whereIn('id', [1, 2, 3])
.whereNotIn('status', ['banned'])

// WHERE NULL
.whereNull('deleted_at')
.whereNotNull('verified_at')

// WHERE BETWEEN
.whereBetween('price', [10, 100])
.whereNotBetween('age', [0, 18])

// WHERE LIKE
.where('name', 'like', '%John%')
.where('email', 'ilike', '%@gmail%')    // Case-insensitive (PostgreSQL)

// WHERE EXISTS
.whereExists(function() {
  this.select('*').from('posts').whereRaw('posts.user_id = users.id');
})

// WHERE RAW
.whereRaw('LOWER(email) = ?', ['test@example.com'])
.whereRaw('price * qty > ?', [100])
```

---

## INSERT

```typescript
// Single insert
knex('users').insert({ name: 'John', email: 'john@example.com' });

// Insert returning ID (PostgreSQL)
knex('users').insert(data).returning('id');

// Insert returning full record
knex('users').insert(data).returning('*');

// Insert multiple
knex('users').insert([
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' },
]);

// Upsert (ON CONFLICT - PostgreSQL)
knex('users')
  .insert({ email: 'user@example.com', name: 'User' })
  .onConflict('email')
  .merge();                              // Update all except conflict column

knex('users')
  .insert(data)
  .onConflict('email')
  .merge(['name']);                      // Update only 'name'

knex('users')
  .insert(data)
  .onConflict('email')
  .ignore();                             // Do nothing on conflict
```

---

## UPDATE

```typescript
// Basic update
knex('users').where('id', 1).update({ name: 'New Name' });

// Update returning record
knex('users').where('id', 1).update(data).returning('*');

// Update multiple conditions
knex('users')
  .where('role', 'guest')
  .where('created_at', '<', oldDate)
  .update({ role: 'archived' });

// Increment / Decrement
knex('posts').where('id', 1).increment('views', 1);
knex('products').where('id', 1).decrement('stock', 5);
```

---

## DELETE

```typescript
// Delete with condition
knex('users').where('id', 1).delete();

// Delete and return
knex('users').where('id', 1).delete().returning('*');

// Delete multiple
knex('sessions').where('expires', '<', new Date()).delete();

// Truncate (reset auto-increment)
knex('logs').truncate();
```

---

## JOINS

```typescript
// INNER JOIN
knex('users')
  .join('posts', 'users.id', 'posts.user_id')
  .select('users.name', 'posts.title');

// LEFT JOIN
knex('users')
  .leftJoin('posts', 'users.id', 'posts.user_id');

// RIGHT JOIN
knex('users')
  .rightJoin('posts', 'users.id', 'posts.user_id');

// Multiple conditions
knex('users')
  .join('posts', function() {
    this.on('users.id', '=', 'posts.user_id')
      .andOn('posts.published', '=', knex.raw('?', [true]));
  });

// Table aliases
knex('users as u')
  .leftJoin('posts as p', 'u.id', 'p.user_id')
  .leftJoin('comments as c', 'p.id', 'c.post_id');
```

---

## ORDER, LIMIT, OFFSET

```typescript
.orderBy('created_at', 'desc')
.orderBy([
  { column: 'role', order: 'asc' },
  { column: 'name', order: 'asc' },
])
.orderByRaw('RANDOM()')                  // Random order

.limit(10)
.offset(20)

// Pagination helper
const page = 3;
const perPage = 20;
.limit(perPage).offset((page - 1) * perPage);
```

---

## AGGREGATIONS

```typescript
.count('id')
.count('id as total')
.sum('amount')
.avg('rating')
.min('price')
.max('price')

// Group By
knex('orders')
  .select('status')
  .count('* as count')
  .groupBy('status');

// Having
knex('users')
  .select('role')
  .count('* as count')
  .groupBy('role')
  .having('count', '>', 10);
```

---

## TRANSACTIONS

```typescript
// Callback style (auto commit/rollback)
const result = await knex.transaction(async (trx) => {
  const [user] = await trx('users').insert(userData).returning('*');
  await trx('profiles').insert({ user_id: user.id, ...profileData });
  return user;
});

// Manual control
const trx = await knex.transaction();
try {
  await trx('accounts').where('id', 1).decrement('balance', 100);
  await trx('accounts').where('id', 2).increment('balance', 100);
  await trx.commit();
} catch (error) {
  await trx.rollback();
  throw error;
}
```

---

## RAW QUERIES

```typescript
// Full raw query
const result = await knex.raw('SELECT * FROM users WHERE id = ?', [1]);
const users = result.rows;               // PostgreSQL

// Named bindings
await knex.raw(
  'SELECT * FROM users WHERE email = :email',
  { email: 'test@example.com' }
);

// Raw in query builder
knex('users')
  .select('id', knex.raw('UPPER(name) as upper_name'))
  .whereRaw('created_at > NOW() - INTERVAL ? DAY', [30])
  .orderByRaw('RANDOM()');
```

---

## MIGRATIONS

```bash
# Create migration
npx knex migrate:make create_users_table -x ts

# Run migrations
npx knex migrate:latest

# Rollback
npx knex migrate:rollback
npx knex migrate:rollback --all

# Status
npx knex migrate:status
```

```typescript
// Migration file
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.increments('id');
    table.string('email').notNullable().unique();
    table.string('name');
    table.boolean('active').defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
```

---

## COLUMN TYPES

```typescript
table.increments('id');              // Auto-increment INT
table.bigIncrements('id');           // Auto-increment BIGINT
table.integer('count');
table.bigInteger('views');
table.float('rating');
table.decimal('price', 10, 2);       // DECIMAL(10,2)
table.string('name', 255);           // VARCHAR(255)
table.text('content');               // TEXT
table.boolean('active');
table.date('birth_date');
table.dateTime('scheduled_at');
table.timestamp('created_at');
table.json('metadata');
table.jsonb('data');                 // PostgreSQL JSONB
table.uuid('uuid');
table.binary('data');
table.enum('status', ['a', 'b']);
```

---

## COLUMN MODIFIERS

```typescript
.notNullable()                       // NOT NULL
.nullable()                          // NULL (default)
.defaultTo('value')                  // DEFAULT 'value'
.defaultTo(knex.fn.now())            // DEFAULT CURRENT_TIMESTAMP
.unique()                            // UNIQUE constraint
.primary()                           // PRIMARY KEY
.unsigned()                          // UNSIGNED (MySQL)
.index()                             // Create index
.references('id').inTable('users')   // Foreign key
.onDelete('CASCADE')
.onUpdate('CASCADE')
.after('column')                     // Position after column
.first()                             // Position first
.comment('description')              // Column comment
```

---

## SCHEMA OPERATIONS

```typescript
// Check existence
await knex.schema.hasTable('users');
await knex.schema.hasColumn('users', 'email');

// Alter table
await knex.schema.alterTable('users', (table) => {
  table.string('phone').after('email');
  table.dropColumn('old_column');
  table.renameColumn('old_name', 'new_name');
  table.index('phone');
  table.dropIndex('old_index');
});

// Rename table
await knex.schema.renameTable('old_name', 'new_name');

// Drop table
await knex.schema.dropTable('table_name');
await knex.schema.dropTableIfExists('table_name');
```

---

## SEEDS

```bash
# Create seed
npx knex seed:make 01_users -x ts

# Run seeds
npx knex seed:run
npx knex seed:run --specific=01_users.ts
```

```typescript
// Seed file
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('users').del();
  await knex('users').insert([
    { email: 'admin@example.com', name: 'Admin' },
    { email: 'user@example.com', name: 'User' },
  ]);
}
```

---

## DEBUGGING

```typescript
// Log generated SQL
const query = knex('users').where('id', 1);
console.log(query.toString());
// SELECT * FROM "users" WHERE "id" = 1

// Query event listener
knex.on('query', (data) => {
  console.log('SQL:', data.sql);
  console.log('Bindings:', data.bindings);
});
```

---

## TYPESCRIPT TYPES

```typescript
// Define your types
interface User {
  id: number;
  email: string;
  name: string;
  created_at: Date;
}

// Use with Knex
const users = await knex<User>('users').where('id', 1);
const user = await knex<User>('users').where('id', 1).first();
```

---

## COMMON PATTERNS

```typescript
// Pagination
async function paginate<T>(
  query: Knex.QueryBuilder,
  page: number,
  perPage: number
): Promise<{ data: T[]; total: number; pages: number }> {
  const [countResult] = await query.clone().count('* as total');
  const total = Number(countResult.total);
  const data = await query.limit(perPage).offset((page - 1) * perPage);
  return { data, total, pages: Math.ceil(total / perPage) };
}

// Soft delete
async function softDelete(table: string, id: number): Promise<void> {
  await knex(table).where('id', id).update({ deleted_at: new Date() });
}

// Base query with soft delete filter
const activeQuery = () => knex('users').whereNull('deleted_at');
```
