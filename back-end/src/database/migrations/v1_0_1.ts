import { Database } from 'sqlite3';
import { Migration } from './migrationRunner';

/**
 * Migration to version 1.0.1
 * 
 * This migration ensures the is_admin column exists in the users table
 * This is a safety migration to fix databases that might not have the column
 */
export const migration_v1_0_1: Migration = {
  version: '1.0.1',
  description: 'Ensure is_admin column exists in users table',
  up: async (db: Database): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if the is_admin column already exists in the users table
      db.all(
        `PRAGMA table_info(users)`,
        [],
        (err, rows: any[]) => {
          if (err) {
            console.error('Error checking if is_admin column exists:', err.message);
            reject(err);
            return;
          }

          // Check if the is_admin column exists
          const isAdminColumn = rows.find((row: any) => row.name === 'is_admin');
          
          if (!isAdminColumn) {
            console.log('Adding is_admin column to users table...');
            
            // Add the is_admin column if it doesn't exist
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
          } else {
            console.log('is_admin column already exists in users table.');
            resolve();
          }
        }
      );
    });
  }
};