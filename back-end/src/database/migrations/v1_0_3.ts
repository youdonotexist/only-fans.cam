import { Database } from 'sqlite3';
import { Migration } from './migrationRunner';

/**
 * Migration to version 1.0.3
 * 
 * This migration adds a flagged_fans table to store reports of inappropriate content
 */
export const migration_v1_0_3: Migration = {
  version: '1.0.3',
  description: 'Add flagged_fans table for content reporting',
  up: async (db: Database): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if the flagged_fans table already exists
      db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='flagged_fans'",
        (err, row) => {
          if (err) {
            console.error('Error checking if flagged_fans table exists:', err.message);
            reject(err);
            return;
          }

          if (!row) {
            console.log('Creating flagged_fans table...');
            
            // Create the flagged_fans table if it doesn't exist
            db.run(`
              CREATE TABLE IF NOT EXISTS flagged_fans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fan_id INTEGER NOT NULL,
                reporter_id INTEGER NOT NULL,
                reason TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (fan_id) REFERENCES fans (id) ON DELETE CASCADE,
                FOREIGN KEY (reporter_id) REFERENCES users (id) ON DELETE CASCADE
              )
            `, (err) => {
              if (err) {
                console.error('Error creating flagged_fans table:', err.message);
                reject(err);
                return;
              }
              
              console.log('flagged_fans table created successfully.');
              resolve();
            });
          } else {
            console.log('flagged_fans table already exists.');
            resolve();
          }
        }
      );
    });
  }
};