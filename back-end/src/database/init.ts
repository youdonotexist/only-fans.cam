import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { runMigrations } from './migrations/migrationRunner';

// Database directory
const dbDir = path.resolve(__dirname, '../../TEMP/app/data');
// Database file path
const dbPath = path.resolve(dbDir, 'onlyfans.db');

// Ensure the data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create and initialize the database
export async function initializeDatabase(): Promise<Database> {
  const db = new sqlite3.Database(dbPath, (err: Error | null) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
    console.log('Connected to the SQLite database.');
  });

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');
  
  // Run migrations
  try {
    await runMigrations(db);
    console.log('Database migrations completed successfully.');
  } catch (error) {
    console.error('Error running database migrations:', error);
  }

  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
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
  `);

  // Create fans table (for fan posts)
  db.run(`
    CREATE TABLE IF NOT EXISTS fans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create media table (for images and videos)
  db.run(`
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fan_id INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (fan_id) REFERENCES fans (id) ON DELETE CASCADE
    )
  `);

  // Create follows table (for user follows)
  db.run(`
    CREATE TABLE IF NOT EXISTS follows (
      follower_id INTEGER NOT NULL,
      following_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (follower_id, following_id),
      FOREIGN KEY (follower_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (following_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create likes table (for fan likes)
  db.run(`
    CREATE TABLE IF NOT EXISTS likes (
      user_id INTEGER NOT NULL,
      fan_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, fan_id),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (fan_id) REFERENCES fans (id) ON DELETE CASCADE
    )
  `);

  // Create comments table
  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      fan_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (fan_id) REFERENCES fans (id) ON DELETE CASCADE
    )
  `);

  // Create notifications table
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      fan_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      actor_id INTEGER NOT NULL,
      is_read BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (fan_id) REFERENCES fans (id) ON DELETE CASCADE,
      FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create messages table
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      recipient_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      is_read BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (recipient_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create conversations table to track message threads between users
  db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user1_id INTEGER NOT NULL,
      user2_id INTEGER NOT NULL,
      last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user1_id, user2_id),
      FOREIGN KEY (user1_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (user2_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);
  
  // Create user_logins table to track login events with IP addresses
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
  `);
  
  // Create feedback table for user feedback and bug reports
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
  `);

  return db;
}

// Get database instance
export function getDatabase(): Database {
  return new sqlite3.Database(dbPath, (err: Error | null) => {
    if (err) {
      console.error('Error opening database:', err.message);
      process.exit(1);
    }
  });
}