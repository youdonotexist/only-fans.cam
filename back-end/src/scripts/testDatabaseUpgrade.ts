import { getDatabase } from '../database/init';
import { Database } from 'sqlite3';

/**
 * Script to test the database upgrade by verifying the schema changes
 * This script checks for:
 * - is_admin column in users table
 * - user_logins table
 * - feedback table
 */

// Function to check if a column exists in a table
async function columnExists(db: Database, table: string, column: string): Promise<boolean> {
  return new Promise((resolve) => {
    db.all(
      `PRAGMA table_info(${table})`,
      [],
      (err, rows) => {
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

// Function to get table schema
async function getTableSchema(db: Database, table: string): Promise<string | null> {
  return new Promise((resolve) => {
    db.get(
      `SELECT sql FROM sqlite_master WHERE type='table' AND name=?`,
      [table],
      (err, row: { sql: string } | undefined) => {
        if (err || !row) {
          console.error(`Error getting schema for table ${table}:`, err?.message || 'Table not found');
          resolve(null);
          return;
        }

        resolve(row.sql);
      }
    );
  });
}

// Main test function
async function testDatabaseUpgrade() {
  console.log('Starting database upgrade verification...');
  const db = getDatabase();
  let allTestsPassed = true;

  try {
    // Test 1: Check if users table exists
    const hasUsersTable = await tableExists(db, 'users');
    console.log(`Test 1: Users table exists: ${hasUsersTable ? '✅ PASS' : '❌ FAIL'}`);
    if (!hasUsersTable) {
      allTestsPassed = false;
      console.error('  - Users table not found. Please initialize the database first.');
    }

    // Test 2: Check if is_admin column exists in users table
    if (hasUsersTable) {
      const hasIsAdminColumn = await columnExists(db, 'users', 'is_admin');
      console.log(`Test 2: is_admin column exists in users table: ${hasIsAdminColumn ? '✅ PASS' : '❌ FAIL'}`);
      if (!hasIsAdminColumn) {
        allTestsPassed = false;
        console.error('  - is_admin column not found in users table. Please run the upgrade script.');
      }
    }

    // Test 3: Check if user_logins table exists
    const hasUserLoginsTable = await tableExists(db, 'user_logins');
    console.log(`Test 3: user_logins table exists: ${hasUserLoginsTable ? '✅ PASS' : '❌ FAIL'}`);
    if (!hasUserLoginsTable) {
      allTestsPassed = false;
      console.error('  - user_logins table not found. Please run the upgrade script.');
    } else {
      // Check user_logins table schema
      const userLoginsSchema = await getTableSchema(db, 'user_logins');
      console.log('  - user_logins table schema:');
      console.log(`    ${userLoginsSchema?.replace(/\n/g, '\n    ')}`);
    }

    // Test 4: Check if feedback table exists
    const hasFeedbackTable = await tableExists(db, 'feedback');
    console.log(`Test 4: feedback table exists: ${hasFeedbackTable ? '✅ PASS' : '❌ FAIL'}`);
    if (!hasFeedbackTable) {
      allTestsPassed = false;
      console.error('  - feedback table not found. Please run the upgrade script.');
    } else {
      // Check feedback table schema
      const feedbackSchema = await getTableSchema(db, 'feedback');
      console.log('  - feedback table schema:');
      console.log(`    ${feedbackSchema?.replace(/\n/g, '\n    ')}`);
    }

    // Test 5: Check for admin users
    if (hasUsersTable && await columnExists(db, 'users', 'is_admin')) {
      db.all(
        'SELECT id, username, email FROM users WHERE is_admin = 1',
        [],
        (err, rows) => {
          if (err) {
            console.error('Error checking for admin users:', err.message);
            return;
          }

          console.log(`Test 5: Admin users found: ${rows.length > 0 ? '✅ PASS' : '⚠️ WARNING'}`);
          if (rows.length === 0) {
            console.warn('  - No admin users found. You may want to run the setAdminUser script.');
          } else {
            console.log('  - Admin users:');
            rows.forEach((row: any) => {
              console.log(`    - ID: ${row.id}, Username: ${row.username}, Email: ${row.email}`);
            });
          }

          // Final summary
          console.log('\nVerification summary:');
          if (allTestsPassed) {
            console.log('✅ All required database upgrades are in place!');
          } else {
            console.log('❌ Some database upgrades are missing. Please run the upgrade script.');
          }

          // Close the database connection
          db.close((err) => {
            if (err) {
              console.error('Error closing database connection:', err.message);
            }
          });
        }
      );
    } else {
      // Final summary if we can't check for admin users
      console.log('\nVerification summary:');
      if (allTestsPassed) {
        console.log('✅ All required database upgrades are in place!');
      } else {
        console.log('❌ Some database upgrades are missing. Please run the upgrade script.');
      }

      // Close the database connection
      db.close((err) => {
        if (err) {
          console.error('Error closing database connection:', err.message);
        }
      });
    }
  } catch (error) {
    console.error('Error during database verification:', error);
    db.close((err) => {
      if (err) {
        console.error('Error closing database connection:', err.message);
      }
    });
  }
}

// Run the test function
testDatabaseUpgrade().catch(err => {
  console.error('Unhandled error during database verification:', err);
  process.exit(1);
});