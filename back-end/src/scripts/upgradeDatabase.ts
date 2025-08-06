import { getDatabase } from '../database/init';
import { Database } from 'sqlite3';

/**
 * Script to upgrade the database schema for existing databases
 * Adds columns and tables related to admin functionality:
 * - is_admin column to users table
 * - user_logins table for tracking login IP addresses
 * - feedback table for user feedback and bug reports
 */

// Function to check if a column exists in a table
async function columnExists(db: Database, table: string, column: string): Promise<boolean> {
  return new Promise((resolve) => {
    db.get(
      `PRAGMA table_info(${table})`,
      [],
      (err, rows: any) => {
        if (err) {
          console.error(`Error checking if column ${column} exists in ${table}:`, err.message);
          resolve(false);
          return;
        }

        // Check if the column exists in the result
        const columnInfo = rows.find((row: any) => row.name === column);
        resolve(!!columnInfo);
      }
    );
  });
}

// Function to check if a table exists
async function tableExists(db: Database, table: string): Promise<boolean> {
  return new Promise((resolve) => {
    db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
      [table],
      (err, row) => {
        if (err) {
          console.error(`Error checking if table ${table} exists:`, err.message);
          resolve(false);
          return;
        }

        resolve(!!row);
      }
    );
  });
}

// Main upgrade function
async function upgradeDatabase() {
  console.log('Starting database schema upgrade...');
  const db = getDatabase();

  try {
    // 1. Add is_admin column to users table if it doesn't exist
    const hasIsAdminColumn = await columnExists(db, 'users', 'is_admin');
    if (!hasIsAdminColumn) {
      console.log('Adding is_admin column to users table...');
      await new Promise<void>((resolve, reject) => {
        db.run(
          'ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0',
          (err) => {
            if (err) {
              console.error('Error adding is_admin column:', err.message);
              reject(err);
              return;
            }
            console.log('is_admin column added successfully.');
            resolve();
          }
        );
      });
    } else {
      console.log('is_admin column already exists in users table.');
    }

    // 2. Create user_logins table if it doesn't exist
    const hasUserLoginsTable = await tableExists(db, 'user_logins');
    if (!hasUserLoginsTable) {
      console.log('Creating user_logins table...');
      await new Promise<void>((resolve, reject) => {
        db.run(`
          CREATE TABLE user_logins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            ip_address TEXT NOT NULL,
            login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            login_type TEXT NOT NULL,
            user_agent TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) {
            console.error('Error creating user_logins table:', err.message);
            reject(err);
            return;
          }
          console.log('user_logins table created successfully.');
          resolve();
        });
      });
    } else {
      console.log('user_logins table already exists.');
    }

    // 3. Create feedback table if it doesn't exist
    const hasFeedbackTable = await tableExists(db, 'feedback');
    if (!hasFeedbackTable) {
      console.log('Creating feedback table...');
      await new Promise<void>((resolve, reject) => {
        db.run(`
          CREATE TABLE feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
          )
        `, (err) => {
          if (err) {
            console.error('Error creating feedback table:', err.message);
            reject(err);
            return;
          }
          console.log('feedback table created successfully.');
          resolve();
        });
      });
    } else {
      console.log('feedback table already exists.');
    }

    console.log('Database schema upgrade completed successfully.');
  } catch (error) {
    console.error('Error during database upgrade:', error);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Error closing database connection:', err.message);
      }
      console.log('Database connection closed.');
    });
  }
}

// Run the upgrade function
upgradeDatabase().catch(err => {
  console.error('Unhandled error during database upgrade:', err);
  process.exit(1);
});