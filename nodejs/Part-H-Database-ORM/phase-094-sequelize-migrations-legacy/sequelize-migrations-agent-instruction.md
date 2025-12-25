# Phase 094: Sequelize Migrations (Legacy)
## Agent Instructions

**Phase**: 094 | **Part**: H - Database & ORM | **Language**: TypeScript

## Topics
1. Why migrations — version control for database
2. `sequelize-cli` installation
3. Migration file structure
4. `up` and `down` functions
5. Creating tables
6. Altering tables: add/remove columns
7. Indexes and constraints
8. Running migrations: `db:migrate`
9. Rolling back: `db:migrate:undo`
10. Seeders: `db:seed:all`
11. Sync vs Migrations (why migrations are better)
12. Laravel comparison: Artisan migrations

## Example
```javascript
// migrations/20231225-create-users.js
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            email: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true
            },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('users');
    }
};
```

## Content Instructions
**Notes**: Database migrations with Sequelize CLI
**Summary**: Migration commands reference
