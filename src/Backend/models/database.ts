import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'database.sqlite');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

const DEFAULT_ADMIN = {
  username: 'Havi',
  email: 'havidu6@gmail.com',
  password: '19072006a',
  role: 'admin',
};

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initializeDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      author_id TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mimetype TEXT NOT NULL,
      size INTEGER NOT NULL,
      uploader_id TEXT NOT NULL,
      is_public INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sermons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titre TEXT NOT NULL,
      verset TEXT,
      description TEXT,
      chemin TEXT,
      date TEXT,
      auteur TEXT,
      categorie TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titre TEXT NOT NULL,
      lieu TEXT,
      description TEXT,
      categorie TEXT,
      heure TEXT,
      date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
    CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
    CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
    CREATE INDEX IF NOT EXISTS idx_files_uploader ON files(uploader_id);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
  `);

  ensureDefaultAdmin();
  console.log('# Database initialized at:', DB_PATH);
}

function ensureDefaultAdmin(): void {
  const hashedPassword = bcrypt.hashSync(DEFAULT_ADMIN.password, 12);
  const existingByEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(DEFAULT_ADMIN.email) as { id: string } | undefined;
  const existingByUsername = db.prepare('SELECT id FROM users WHERE username = ?').get(DEFAULT_ADMIN.username) as { id: string } | undefined;
  const existingId = existingByEmail?.id || existingByUsername?.id;

  if (existingId) {
    db.prepare(`
      UPDATE users
      SET email = ?, username = ?, password = ?, role = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(DEFAULT_ADMIN.email, DEFAULT_ADMIN.username, hashedPassword, DEFAULT_ADMIN.role, existingId);
    console.log(`# Default admin ensured: ${DEFAULT_ADMIN.email}`);
    return;
  }

  db.prepare(`
    INSERT INTO users (id, email, username, password, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(uuidv4(), DEFAULT_ADMIN.email, DEFAULT_ADMIN.username, hashedPassword, DEFAULT_ADMIN.role);

  console.log(`# Default admin created: ${DEFAULT_ADMIN.email}`);
}

export function getDb(): Database.Database {
  return db;
}

export default db;
