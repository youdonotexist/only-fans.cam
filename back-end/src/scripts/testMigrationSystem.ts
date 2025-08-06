import { Database } from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { 
  initializeVersionTracking, 
  getDatabaseVersion, 
  getSystemSetting, 
  setSystemSetting,
  CURRENT_DB_VERSION,
  DB_VERSION_KEY
} from '../database/migrations';
import { runMigrations } from '../database/migrations/migrationRunner';

// Test database path
const testDbPath = path.resolve(__dirname, '../../TEMP/test/migration-test.db');
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
 * Run migration system tests
 */
async function testMigrationSystem() {
  console.log('Starting migration system tests...');
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
    // Test 1: Initialize version tracking
    console.log('\nTest 1: Initialize version tracking');
    await initializeVersionTracking(db);
    const initialVersion = await getDatabaseVersion(db);
    console.log(`Initial database version: ${initialVersion}`);
    
    if (initialVersion === CURRENT_DB_VERSION) {
      console.log('✅ Version tracking initialized successfully');
    } else {
      console.error(`❌ Version tracking initialization failed. Expected ${CURRENT_DB_VERSION}, got ${initialVersion}`);
    }
    
    // Test 2: Run migrations
    console.log('\nTest 2: Run migrations');
    await runMigrations(db);
    const migratedVersion = await getDatabaseVersion(db);
    console.log(`Migrated database version: ${migratedVersion}`);
    
    if (migratedVersion === CURRENT_DB_VERSION) {
      console.log('✅ Migrations ran successfully');
    } else {
      console.error(`❌ Migration failed. Expected ${CURRENT_DB_VERSION}, got ${migratedVersion}`);
    }
    
    // Test 3: Verify system_settings table
    console.log('\nTest 3: Verify system_settings table');
    const versionFromSettings = await getSystemSetting(db, DB_VERSION_KEY);
    console.log(`Version from system_settings: ${versionFromSettings}`);
    
    if (versionFromSettings === CURRENT_DB_VERSION) {
      console.log('✅ system_settings table working correctly');
    } else {
      console.error(`❌ system_settings table not working correctly. Expected ${CURRENT_DB_VERSION}, got ${versionFromSettings}`);
    }
    
    // Test 4: Set and get a custom system setting
    console.log('\nTest 4: Set and get a custom system setting');
    const testKey = 'test_setting';
    const testValue = 'test_value_' + Date.now();
    
    await setSystemSetting(db, testKey, testValue);
    const retrievedValue = await getSystemSetting(db, testKey);
    console.log(`Set system setting: ${testKey} = ${testValue}`);
    console.log(`Retrieved system setting: ${testKey} = ${retrievedValue}`);
    
    if (retrievedValue === testValue) {
      console.log('✅ Custom system setting works correctly');
    } else {
      console.error(`❌ Custom system setting failed. Expected ${testValue}, got ${retrievedValue}`);
    }
    
    // Test 5: Verify tables created by migrations
    console.log('\nTest 5: Verify tables created by migrations');
    const tables = await getTables(db);
    console.log('Tables in database:', tables);
    
    const requiredTables = ['system_settings', 'users', 'user_logins', 'feedback'];
    const missingTables = requiredTables.filter(table => !tables.includes(table));
    
    if (missingTables.length === 0) {
      console.log('✅ All required tables created by migrations');
    } else {
      console.error(`❌ Missing tables: ${missingTables.join(', ')}`);
    }
    
    // Test 6: Verify idempotence (running migrations again should be safe)
    console.log('\nTest 6: Verify migration idempotence');
    await runMigrations(db);
    const versionAfterSecondRun = await getDatabaseVersion(db);
    console.log(`Version after second migration run: ${versionAfterSecondRun}`);
    
    if (versionAfterSecondRun === CURRENT_DB_VERSION) {
      console.log('✅ Migrations are idempotent');
    } else {
      console.error(`❌ Migrations are not idempotent. Expected ${CURRENT_DB_VERSION}, got ${versionAfterSecondRun}`);
    }
    
    // Summary
    console.log('\n=== Test Summary ===');
    console.log('Migration system tests completed');
    console.log('Current database version:', await getDatabaseVersion(db));
    console.log('Tables created:', tables.join(', '));
    
  } catch (error) {
    console.error('Error during migration tests:', error);
  } finally {
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      }
      console.log('Database connection closed');
    });
  }
}

/**
 * Get all tables in the database
 */
function getTables(db: Database): Promise<string[]> {
  return new Promise((resolve, reject) => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      const tables = rows.map((row: any) => row.name);
      resolve(tables);
    });
  });
}

// Run tests
testMigrationSystem().catch(error => {
  console.error('Unhandled error during tests:', error);
  process.exit(1);
});