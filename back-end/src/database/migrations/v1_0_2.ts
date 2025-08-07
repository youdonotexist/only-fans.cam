import { Database } from 'sqlite3';
import { Migration } from './migrationRunner';

/**
 * Migration to version 1.0.2
 * 
 * This migration adds the fan_type column to the fans table
 * to allow categorization of different types of fans
 */
export const migration_v1_0_2: Migration = {
  version: '1.0.2',
  description: 'Add fan_type column to fans table',
  up: async (db: Database): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if the fan_type column already exists in the fans table
      db.all(
        `PRAGMA table_info(fans)`,
        [],
        (err, rows: any[]) => {
          if (err) {
            console.error('Error checking if fan_type column exists:', err.message);
            reject(err);
            return;
          }

          // Check if the fan_type column exists
          const fanTypeColumn = rows.find((row: any) => row.name === 'fan_type');
          
          if (!fanTypeColumn) {
            console.log('Adding fan_type column to fans table...');
            
            // Add the fan_type column if it doesn't exist
            db.run(
              'ALTER TABLE fans ADD COLUMN fan_type TEXT DEFAULT "ceiling"',
              (err) => {
                if (err) {
                  console.error('Error adding fan_type column:', err.message);
                  reject(err);
                  return;
                }
                
                console.log('fan_type column added successfully.');
                resolve();
              }
            );
          } else {
            console.log('fan_type column already exists in fans table.');
            resolve();
          }
        }
      );
    });
  }
};