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

/**
 * Initialize or migrate the database schema.
 * Adds notes table with fields: id, title, content, tags(JSON text), pinned(INT 0/1),
 * created_at, updated_at, deleted_at (nullable).
 */
function initializeSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT DEFAULT '',
      content TEXT DEFAULT '',
      tags TEXT DEFAULT '[]',           -- JSON string array
      pinned INTEGER DEFAULT 0,         -- 0/1
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at);
    CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(pinned);
    CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);
    CREATE INDEX IF NOT EXISTS idx_notes_deleted_at ON notes(deleted_at);
  `);

  // Migrations for older schema fields -> ensure new columns exist
  try { db.prepare(`ALTER TABLE notes ADD COLUMN deleted_at TEXT NULL`).run(); } catch (_) { /* already exists */ }
  try {
    // If createdAt/updatedAt older columns exist but created_at/updated_at not, try to migrate data.
    // Add new columns if not present.
    db.prepare(`ALTER TABLE notes ADD COLUMN created_at TEXT`).run();
  } catch (_) { /* exists */ }
  try { db.prepare(`ALTER TABLE notes ADD COLUMN updated_at TEXT`).run(); } catch (_) { /* exists */ }

  // If old camelCase columns exist, try to backfill snake_case for existing rows once.
  try {
    const hasCamelCols = (() => {
      const pragma = db.prepare(`PRAGMA table_info(notes)`).all();
      const names = new Set(pragma.map(c => c.name));
      return names.has('createdAt') || names.has('updatedAt');
    })();

    if (hasCamelCols) {
      db.exec(`
        UPDATE notes
        SET created_at = COALESCE(created_at, createdAt),
            updated_at = COALESCE(updated_at, updatedAt)
      `);
    }
  } catch (_) {
    // no-op
  }
}
