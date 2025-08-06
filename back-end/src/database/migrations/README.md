# Database Versioning and Migration System

This document explains the database versioning and migration system implemented in the OnlyFans application.

## Overview

The database versioning system uses a `system_settings` table to track the current database version and applies migrations to upgrade the database schema when needed. This approach ensures that:

1. Database schema changes are tracked and versioned
2. Migrations are applied in the correct order
3. Only necessary migrations are applied
4. Migrations are transactional and can be rolled back if they fail

## How It Works

### Version Tracking

The system uses a key-value store in the `system_settings` table to track the current database version:

```sql
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

The database version is stored with the key `db_version` and follows semantic versioning (e.g., `1.0.0`).

### Migration Process

1. When the application starts, it initializes the database and runs the migration system
2. The system checks the current database version
3. It identifies migrations that need to be applied (those with a higher version number)
4. Migrations are applied in order, with each migration wrapped in a transaction
5. After each successful migration, the database version is updated

## Creating New Migrations

To create a new migration:

1. Create a new file in the `migrations` directory with a name that reflects the version (e.g., `v1_1_0.ts`)
2. Define a migration object that implements the `Migration` interface:

```typescript
import { Database } from 'sqlite3';
import { Migration } from './migrationRunner';

export const migration_v1_1_0: Migration = {
  version: '1.1.0',
  description: 'Brief description of the migration',
  up: async (db: Database): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Your migration code here
      // Use db.run(), db.exec(), etc. to make schema changes
      
      // When done, call resolve() or reject(error)
      resolve();
    });
  }
};
```

3. Add your migration to the `migrations` array in `migrationRunner.ts`:

```typescript
import { migration_v1_1_0 } from './v1_1_0';

const migrations: Migration[] = [
  migration_v1_0_0,
  migration_v1_1_0,
  // Add future migrations here
];
```

4. Update the `CURRENT_DB_VERSION` constant in `index.ts` to match the latest migration version:

```typescript
export const CURRENT_DB_VERSION = '1.1.0';
```

## Best Practices

### Additive-Only Changes

As specified in the requirements, all database changes should be additive only to maintain backward compatibility:

- ✅ **DO** add new tables
- ✅ **DO** add new columns to existing tables
- ✅ **DO** add new indexes
- ❌ **DON'T** remove tables
- ❌ **DON'T** remove columns
- ❌ **DON'T** change column types in incompatible ways

### Safe Schema Changes

When modifying existing tables, use the following pattern to ensure data is preserved:

1. Create a temporary table with the new schema
2. Copy data from the old table to the temporary table
3. Drop the old table
4. Rename the temporary table to the original name

Example:

```sql
-- Create temporary table with new schema
CREATE TABLE temp_users (
  id INTEGER PRIMARY KEY,
  username TEXT,
  email TEXT,
  new_column TEXT DEFAULT 'default_value'
);

-- Copy data from old table
INSERT INTO temp_users (id, username, email)
SELECT id, username, email FROM users;

-- Drop old table
DROP TABLE users;

-- Rename temporary table
ALTER TABLE temp_users RENAME TO users;
```

### Transaction Safety

All migrations are automatically wrapped in transactions, so if any part of a migration fails, the entire migration is rolled back. This ensures that the database remains in a consistent state.

## Troubleshooting

If migrations fail, check the following:

1. Ensure the migration version is higher than the current database version
2. Check for syntax errors in your SQL statements
3. Verify that your migration follows the additive-only principle
4. Check the error logs for specific error messages

## System Settings API

The versioning system also provides a general-purpose key-value store that can be used for other system settings:

```typescript
// Get a system setting
const value = await getSystemSetting(db, 'my_setting_key');

// Set a system setting
await setSystemSetting(db, 'my_setting_key', 'my_setting_value');
```

This can be useful for storing configuration values that need to persist across application restarts.