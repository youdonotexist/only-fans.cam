import { Database } from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Interface for system settings
export interface SystemSetting {
  key: string;
  value: string;
}

// Database version key
export const DB_VERSION_KEY = 'db_version';

// Current database version
export const CURRENT_DB_VERSION = '1.0.3';

/**
 * Initialize the system_settings table and set up version tracking
 * @param db Database instance
 */
export async function initializeVersionTracking(db: Database): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create system_settings table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating system_settings table:', err.message);
        reject(err);
        return;
      }

      // Check if version exists
      db.get('SELECT value FROM system_settings WHERE key = ?', [DB_VERSION_KEY], (err, row: { value: string } | undefined) => {
        if (err) {
          console.error('Error checking database version:', err.message);
          reject(err);
          return;
        }

        if (!row) {
          // Set initial version if not exists
          db.run(
            'INSERT INTO system_settings (key, value) VALUES (?, ?)',
            [DB_VERSION_KEY, '0.0.0'],
            (err) => {
              if (err) {
                console.error('Error setting initial database version:', err.message);
                reject(err);
                return;
              }
              console.log(`Database version initialized to '0.0.0'`);
              resolve();
            }
          );
        } else {
          console.log(`Current database version: ${row.value}`);
          resolve();
        }
      });
    });
  });
}

/**
 * Get the current database version
 * @param db Database instance
 * @returns Current database version
 */
export async function getDatabaseVersion(db: Database): Promise<string> {
  return new Promise((resolve, reject) => {
    db.get('SELECT value FROM system_settings WHERE key = ?', [DB_VERSION_KEY], (err, row: { value: string } | undefined) => {
      if (err) {
        console.error('Error getting database version:', err.message);
        reject(err);
        return;
      }

      if (!row) {
        resolve('0.0.0'); // Default version if not set
      } else {
        resolve(row.value);
      }
    });
  });
}

/**
 * Update the database version
 * @param db Database instance
 * @param version New version
 */
export async function updateDatabaseVersion(db: Database, version: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE system_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
      [version, DB_VERSION_KEY],
      (err) => {
        if (err) {
          console.error('Error updating database version:', err.message);
          reject(err);
          return;
        }
        console.log(`Database version updated to ${version}`);
        resolve();
      }
    );
  });
}

/**
 * Get a system setting value
 * @param db Database instance
 * @param key Setting key
 * @returns Setting value or null if not found
 */
export async function getSystemSetting(db: Database, key: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    db.get('SELECT value FROM system_settings WHERE key = ?', [key], (err, row: { value: string } | undefined) => {
      if (err) {
        console.error(`Error getting system setting ${key}:`, err.message);
        reject(err);
        return;
      }

      if (!row) {
        resolve(null);
      } else {
        resolve(row.value);
      }
    });
  });
}

/**
 * Set a system setting value
 * @param db Database instance
 * @param key Setting key
 * @param value Setting value
 */
export async function setSystemSetting(db: Database, key: string, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Try to update first
    db.run(
      'UPDATE system_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
      [value, key],
      function(err) {
        if (err) {
          console.error(`Error updating system setting ${key}:`, err.message);
          reject(err);
          return;
        }

        // If no rows were updated, insert a new row
        if (this.changes === 0) {
          db.run(
            'INSERT INTO system_settings (key, value) VALUES (?, ?)',
            [key, value],
            (err) => {
              if (err) {
                console.error(`Error inserting system setting ${key}:`, err.message);
                reject(err);
                return;
              }
              resolve();
            }
          );
        } else {
          resolve();
        }
      }
    );
  });
}

/**
 * Compare version strings (semver format)
 * @param version1 First version
 * @param version2 Second version
 * @returns -1 if version1 < version2, 0 if equal, 1 if version1 > version2
 */
export function compareVersions(version1: string, version2: string): number {
  const parts1 = version1.split('.').map(Number);
  const parts2 = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = i < parts1.length ? parts1[i] : 0;
    const part2 = i < parts2.length ? parts2[i] : 0;

    if (part1 < part2) return -1;
    if (part1 > part2) return 1;
  }

  return 0; // Versions are equal
}