import { Database } from 'sqlite3';
import { Migration } from './migrationRunner';

/**
 * Migration to version 1.0.0
 * 
 * This migration adds:
 * 1. is_admin column to users table
 * 2. user_logins table for tracking login IP addresses
 * 3. feedback table for user feedback and bug reports
 */
export const migration_v1_0_0: Migration = {
  version: '1.0.0',
  description: 'Add admin role, IP tracking, and feedback system',
  up: async (db: Database): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Run all migrations in sequence
      db.serialize(() => {
        // 1. Add is_admin column to users table if it doesn't exist
        db.run(`
          CREATE TABLE IF NOT EXISTS temp_users (
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
        `, (err) => {
          if (err) {
            console.error('Error creating temp_users table:', err.message);
            reject(err);
            return;
          }
        });

        // Check if users table exists
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
          if (err) {
            console.error('Error checking users table:', err.message);
            reject(err);
            return;
          }

          if (row) {
            // Copy data from users to temp_users
            db.run(`
              INSERT INTO temp_users (id, username, email, password, bio, profile_image, cover_image, created_at, updated_at)
              SELECT id, username, email, password, bio, profile_image, cover_image, created_at, updated_at FROM users
            `, (err) => {
              if (err) {
                console.error('Error copying users data:', err.message);
                reject(err);
                return;
              }

              // Drop old users table
              db.run('DROP TABLE users', (err) => {
                if (err) {
                  console.error('Error dropping users table:', err.message);
                  reject(err);
                  return;
                }

                // Rename temp_users to users
                db.run('ALTER TABLE temp_users RENAME TO users', (err) => {
                  if (err) {
                    console.error('Error renaming temp_users table:', err.message);
                    reject(err);
                    return;
                  }
                });
              });
            });
          }
        });

        // 2. Create user_logins table
        db.run(`
          CREATE TABLE IF NOT EXISTS user_logins (
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
        });

        // 3. Create feedback table
        db.run(`
          CREATE TABLE IF NOT EXISTS feedback (
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

          // All migrations completed successfully
          resolve();
        });
      });
    });
  }
};