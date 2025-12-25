# Phase 092: Sequelize CRUD Operations (Legacy)
## Agent Instructions

**Phase**: 092 | **Part**: H - Database & ORM | **Language**: TypeScript

## Topics
1. Create: `Model.create()`, `Model.build()` + `save()`
2. Read: `findAll()`, `findOne()`, `findByPk()`, `findOrCreate()`
3. Update: `update()`, instance update + `save()`
4. Delete: `destroy()`
5. Bulk operations: `bulkCreate()`, `bulkUpdate()`
6. Query options: `where`, `attributes`, `order`, `limit`, `offset`
7. Operators: `Op.eq`, `Op.ne`, `Op.gt`, `Op.like`, `Op.in`
8. Raw queries: `sequelize.query()`
9. Counting: `count()`, `findAndCountAll()`
10. Aggregations: `sum()`, `max()`, `min()`
11. Laravel comparison: Eloquent CRUD

## Example
```typescript
// Create
const user = await User.create({ email: 'test@test.com', password: 'hash' });

// Read
const users = await User.findAll({
    where: { email: { [Op.like]: '%@gmail.com' } },
    order: [['createdAt', 'DESC']],
    limit: 10
});

// Update
await User.update({ name: 'New Name' }, { where: { id: 1 } });

// Delete
await User.destroy({ where: { id: 1 } });
```

## Content Instructions
**Notes**: Complete Sequelize CRUD guide
**Summary**: Sequelize CRUD cheatsheet
