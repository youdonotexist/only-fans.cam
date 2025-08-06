# Database Upgrade Guide

This document explains how to upgrade your existing OnlyFans database to include the latest schema changes related to admin functionality.

## Recent Schema Changes

The following changes have been made to the database schema:

1. **Added `is_admin` column to the `users` table**
   - Boolean field to identify administrator users
   - Default value is `0` (false)

2. **Added `user_logins` table**
   - Tracks login events with IP addresses
   - Stores user agent information
   - Records login type (login or register)

3. **Added `feedback` table**
   - Stores user feedback and bug reports
   - Tracks status of feedback items
   - Links to user accounts when available

## Upgrade Process

### Prerequisites

- Node.js and npm installed
- Access to the OnlyFans backend repository
- TypeScript installed

### Step 1: Build the Project

First, make sure the project is built with the latest changes:

```bash
cd back-end
npm install
npm run build
```

### Step 2: Run the Database Upgrade Script

The database upgrade script will add the new columns and tables to your existing database:

```bash
npm run db:upgrade
```

This script:
- Checks if each column or table already exists before attempting to add it
- Is idempotent (can be run multiple times without issues)
- Provides detailed logging of the upgrade process

### Step 3: Set Admin User (Optional)

If you want to designate a user as an administrator, run:

```bash
npm run db:set-admin
```

By default, this script sets the user with email `youdonotexist@gmail.com` as an admin. If you need to change this, edit the `ADMIN_EMAIL` constant in `src/scripts/setAdminUser.ts`.

## Verification

### Automated Verification

The easiest way to verify the database upgrade is to run the test script:

```bash
npm run db:test
```

This script will:
- Check if the `is_admin` column exists in the `users` table
- Check if the `user_logins` table exists and display its schema
- Check if the `feedback` table exists and display its schema
- Check if any admin users are configured
- Provide a summary of the verification results

### Manual Verification

You can also manually verify the changes by:

1. Checking the database schema:
   ```bash
   sqlite3 TEMP/app/data/onlyfans.db ".schema users"
   sqlite3 TEMP/app/data/onlyfans.db ".schema user_logins"
   sqlite3 TEMP/app/data/onlyfans.db ".schema feedback"
   ```

2. Verifying admin user setup:
   ```bash
   sqlite3 TEMP/app/data/onlyfans.db "SELECT username, email, is_admin FROM users WHERE is_admin = 1"
   ```

## Troubleshooting

### Common Issues

1. **"Column already exists" error**
   - This is normal if you've already run the upgrade script before
   - The script is designed to handle this gracefully

2. **"No such table: users" error**
   - Make sure you've initialized the database by running the application at least once
   - The database should be created at `TEMP/app/data/onlyfans.db`

3. **"Admin user not found" message**
   - This is normal if the admin user hasn't registered yet
   - The admin role will be set automatically when the user registers

### Getting Help

If you encounter any issues with the database upgrade process, please:

1. Check the console output for detailed error messages
2. Verify that you have the necessary permissions to modify the database file
3. Contact the development team with the error details if problems persist