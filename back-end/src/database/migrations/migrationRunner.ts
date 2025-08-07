import { Database } from 'sqlite3';
import { 
  initializeVersionTracking, 
  getDatabaseVersion, 
  updateDatabaseVersion, 
  compareVersions,
  CURRENT_DB_VERSION
} from './index';
import { migration_v1_0_0 } from './v1_0_0';
import { migration_v1_0_1 } from './v1_0_1';
import { migration_v1_0_2 } from './v1_0_2';
import { migration_v1_0_3 } from './v1_0_3';

// Interface for migration
export interface Migration {
  version: string;
  description: string;
  up: (db: Database) => Promise<void>;
}

// Array of migrations, ordered by version
const migrations: Migration[] = [
  migration_v1_0_0,
  migration_v1_0_1,
  migration_v1_0_2,
  migration_v1_0_3,
  // Add future migrations here
];

/**
 * Run all pending migrations
 * @param db Database instance
 */
export async function runMigrations(db: Database): Promise<void> {
  try {
    // Initialize version tracking
    await initializeVersionTracking(db);
    
    // Get current database version
    const currentVersion = await getDatabaseVersion(db);
    
    console.log(`Current database version: ${currentVersion}`);
    console.log(`Target database version: ${CURRENT_DB_VERSION}`);
    
    // If already at latest version, no need to run migrations
    if (compareVersions(currentVersion, CURRENT_DB_VERSION) >= 0) {
      console.log('Database is already at the latest version.');
      return;
    }
    
    console.log('Running database migrations...');
    
    // Filter migrations that need to be applied
    const pendingMigrations = migrations.filter(
      migration => compareVersions(migration.version, currentVersion) > 0
    );
    
    // Sort migrations by version
    pendingMigrations.sort((a, b) => compareVersions(a.version, b.version));
    
    // Run migrations in sequence
    for (const migration of pendingMigrations) {
      console.log(`Applying migration to version ${migration.version}: ${migration.description}`);
      
      // Begin transaction
      await beginTransaction(db);
      
      try {
        // Run migration
        await migration.up(db);
        
        // Update database version
        await updateDatabaseVersion(db, migration.version);
        
        // Commit transaction
        await commitTransaction(db);
        
        console.log(`Migration to version ${migration.version} completed successfully.`);
      } catch (error) {
        // Rollback transaction on error
        await rollbackTransaction(db);
        
        console.error(`Migration to version ${migration.version} failed:`, error);
        throw error;
      }
    }
    
    console.log('All migrations completed successfully.');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}

/**
 * Begin a transaction
 * @param db Database instance
 */
function beginTransaction(db: Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run('BEGIN TRANSACTION', (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/**
 * Commit a transaction
 * @param db Database instance
 */
function commitTransaction(db: Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run('COMMIT', (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/**
 * Rollback a transaction
 * @param db Database instance
 */
function rollbackTransaction(db: Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run('ROLLBACK', (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}