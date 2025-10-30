import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load env variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve DB path with default to ./data/notes.db relative to backend root
const backendRoot = path.resolve(__dirname, '..');
const DEFAULT_DB_PATH = path.join(backendRoot, 'data', 'notes.db');

const DB_PATH = process.env.DB_PATH ? path.resolve(backendRoot, process.env.DB_PATH) : DEFAULT_DB_PATH;

// Ensure directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let dbInstance = null;

/**
 * PUBLIC_INTERFACE
 * getDb returns a singleton better-sqlite3 database instance.
 * It ensures the database file exists and initializes schema on first use.
 * @returns {import('better-sqlite3').Database} The database instance
 */
export function getDb() {
  if (dbInstance) return dbInstance;

  dbInstance = new Database(DB_PATH, { fileMustExist: false });

  // Pragmas for better defaults
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');

  // Initialize schema if not exists (no routes yet, but safe to set up)
  initializeSchema(dbInstance);

  return dbInstance;
}

function initializeSchema(db) {
  // Create notes table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT DEFAULT '',
      content TEXT DEFAULT '',
      tags TEXT DEFAULT '[]',           -- JSON string array
      pinned INTEGER DEFAULT 0,         -- 0/1
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_notes_updatedAt ON notes(updatedAt);
    CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(pinned);
    CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);
  `);
}
