import { Database } from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { 
  initializeVersionTracking, 
  getDatabaseVersion, 
  setSystemSetting,
  CURRENT_DB_VERSION,
  DB_VERSION_KEY
} from '../database/migrations';
import { runMigrations } from '../database/migrations/migrationRunner';

// Test database path
const testDbPath = path.resolve(__dirname, '../../TEMP/test/is-admin-migration-test.db');
const testDbDir = path.dirname(testDbPath);

// Ensure test directory exists
if (!fs.existsSync(testDbDir)) {
  fs.mkdirSync(testDbDir, { recursive: true });
}

// Remove existing test database if it exists
if (fs.existsSync(testDbPath)) {
  fs.unlinkSync(testDbPath);
  console.log('Removed existing test database');
}

/**
 * Test the is_admin migration
 */
async function testIsAdminMigration() {
  console.log('Starting is_admin migration test...');
  console.log(`Test database: ${testDbPath}`);
  
  // Create test database
  const db = new Database(testDbPath, (err) => {
    if (err) {
      console.error('Error creating test database:', err.message);
      process.exit(1);
    }
    console.log('Connected to test database');
  });
  
  try {
    // Step 1: Create a basic users table without is_admin column
    console.log('Step 1: Creating basic users table without is_admin column and initializing system_settings');
    
    // Initialize version tracking with version 0.0.0
    await initializeVersionTracking(db);
    await setSystemSetting(db, DB_VERSION_KEY, '0.0.0');
    
    // Create users table without is_admin column
    await new Promise<void>((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          bio TEXT,
          profile_image TEXT,
          cover_image TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating users table:', err.message);
          reject(err);
          return;
        }
        resolve();
      });
    });
    
    // Step 2: Verify is_admin column doesn't exist
    console.log('Step 2: Verifying is_admin column doesn\'t exist yet');
    const hasIsAdminBefore = await columnExists(db, 'users', 'is_admin');
    console.log(`is_admin column exists before migration: ${!hasIsAdminBefore ? '✅ PASS' : '❌ FAIL'}`);
    
    // Step 3: Run migrations
    console.log('Step 3: Running migrations');
    await runMigrations(db);
    
    // Step 4: Verify is_admin column exists after migration
    console.log('Step 4: Verifying is_admin column exists after migration');
    const hasIsAdminAfter = await columnExists(db, 'users', 'is_admin');
    console.log(`is_admin column exists after migration: ${hasIsAdminAfter ? '✅ PASS' : '❌ FAIL'}`);
    
    // Summary
    console.log('\n=== Test Summary ===');
    if (!hasIsAdminBefore && hasIsAdminAfter) {
      console.log('✅ TEST PASSED: is_admin column was successfully added by the migration system');
    } else {
      console.log('❌ TEST FAILED: is_admin column was not added correctly');
    }
    
  } catch (error) {
    console.error('Error during migration test:', error);
  } finally {
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database connection:', err.message);
      }
      console.log('Database connection closed');
    });
  }
}

/**
 * Check if a column exists in a table
 */
async function columnExists(db: Database, table: string, column: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    db.all(
      `PRAGMA table_info(${table})`,
      [],
      (err, rows: any[]) => {
        if (err) {
          console.error(`Error checking if column ${column} exists in ${table}:`, err.message);
          reject(err);
          return;
        }
        
        // Check if the column exists
        const columnInfo = rows.find((row: any) => row.name === column);
        resolve(!!columnInfo);
      }
    );
  });
}

// Run the test
testIsAdminMigration().catch(err => {
  console.error('Unhandled error during test:', err);
  process.exit(1);
});