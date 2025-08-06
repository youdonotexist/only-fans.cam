# Database Schema Management in OnlyFans

## Current Approach

The OnlyFans application currently uses a **schema initialization approach** rather than formal database migrations. This document explains how database schema changes are handled in the project.

## How Schema Changes Are Implemented

### Table Creation

Tables are created using the `CREATE TABLE IF NOT EXISTS` SQL statement in the `initializeDatabase()` function in `back-end/src/database/init.ts`. This approach:

1. Creates tables if they don't exist
2. Preserves existing tables if they do exist
3. Does not modify existing tables that have a different structure

Example:
```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  bio TEXT,
  profile_image TEXT,
  cover_image TEXT,
  is_admin BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Adding New Fields

When adding new fields to existing tables, the project **does not use formal migrations**. Instead:

1. The field is added to the `CREATE TABLE IF NOT EXISTS` statement in `init.ts`
2. For existing databases, a separate script may be needed to alter the table

For example, the `is_admin` field was added to the users table in the initialization script, but existing databases would need an `ALTER TABLE` statement to add this field.

### Adding New Tables

New tables (like the `feedback` table) are simply added to the initialization script with their own `CREATE TABLE IF NOT EXISTS` statement.

## Limitations of This Approach

1. **Schema Evolution**: The current approach doesn't automatically update existing table structures
2. **Data Consistency**: Without migrations, it's harder to ensure all database instances have the same schema
3. **Versioning**: There's no built-in way to track which schema changes have been applied

## Recommendations for Future Development

For a more robust approach to schema management, consider implementing one of these options:

### Option 1: Implement SQLite Migrations

Create a migrations system that:
- Numbers migration files sequentially
- Tracks which migrations have been applied
- Applies only new migrations when the application starts

### Option 2: Use a Schema Version Table

Create a simple version tracking system:
1. Add a `schema_versions` table to track applied changes
2. Check the current version on startup
3. Apply any missing schema updates

### Option 3: Use an ORM with Migration Support

Consider using an ORM like TypeORM or Sequelize that provides built-in migration support.

## Conclusion

The current schema management approach is simple but has limitations for a growing application. As the application evolves, implementing a more formal migration system would help maintain database consistency across environments and deployments.