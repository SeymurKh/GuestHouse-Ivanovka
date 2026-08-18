// Database schema and initialization for better-sqlite3
import Database from 'better-sqlite3'
import path from 'path'
import { mkdirSync } from 'fs'
import { galleryImages } from './content-manifest'

const DB_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DB_DIR, 'guesthouse.db')

function generateId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `c${timestamp}${random}`
}

function tableExists(db: Database.Database, tableName: string): boolean {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(tableName) as { name: string } | undefined
  return Boolean(row)
}

function seedGallery(db: Database.Database) {
  const insert = db.prepare(
    'INSERT INTO GalleryImage (id, url, sortOrder) VALUES (@id, @url, @sortOrder)'
  )
  const insertAll = db.transaction((items: string[]) => {
    items.forEach((url, index) => {
      insert.run({ id: generateId(), url, sortOrder: index })
    })
  })
  insertAll(galleryImages)
}

export function createDb(): Database.Database {
  // Ensure data directory exists
  mkdirSync(DB_DIR, { recursive: true })

  const db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  // Seed the gallery only when the table is first created,
  // so deleting all photos doesn't re-seed on the next restart.
  const galleryExisted = tableExists(db, 'GalleryImage')

  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS Room (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      conditions TEXT NOT NULL DEFAULT '',
      advantages TEXT NOT NULL DEFAULT '[]',
      price REAL NOT NULL,
      capacity INTEGER NOT NULL,
      amenities TEXT NOT NULL DEFAULT '[]',
      images TEXT NOT NULL DEFAULT '[]',
      bookingUrl TEXT NOT NULL DEFAULT '',
      isAvailable INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS Review (
      id TEXT PRIMARY KEY,
      guestName TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      comment TEXT NOT NULL,
      isApproved INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS SiteSettings (
      id TEXT PRIMARY KEY,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS GalleryImage (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)

  // Migration for existing databases: add bookingUrl if missing
  try {
    db.exec("ALTER TABLE Room ADD COLUMN bookingUrl TEXT NOT NULL DEFAULT ''")
  } catch {
    // Column already exists — nothing to do
  }

  if (!galleryExisted) {
    seedGallery(db)
  }

  return db
}

// Helper to parse JSON fields from SQLite (stored as TEXT)
export function parseJsonField(value: unknown): unknown {
  if (value === undefined || value === null) return []
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return []
  }
}

// Helper to stringify JSON fields for SQLite
export function stringifyJsonField(value: unknown): string {
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

// Helper to convert SQLite row to app-level Room type
// JSON fields (advantages, amenities, images) are parsed from TEXT
// Localized fields (name, description, conditions) are kept as-is (string or JSON string)
export function mapRoomRow(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: row.name as string, // Localized: stored as JSON string like '{"ru":"...","az":"...","en":"..."}' or plain string
    description: row.description as string, // Localized: same as name
    conditions: row.conditions as string, // Localized: same as name
    advantages: parseJsonField(row.advantages),
    price: row.price as number,
    capacity: row.capacity as number,
    amenities: parseJsonField(row.amenities),
    images: parseJsonField(row.images) as string[],
    bookingUrl: (row.bookingUrl as string) || '',
    isAvailable: Boolean(row.isAvailable),
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
  }
}

// Helper to convert SQLite row to app-level Review type
export function mapReviewRow(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    guestName: row.guestName as string,
    rating: row.rating as number,
    comment: row.comment as string,
    isApproved: Boolean(row.isApproved),
    createdAt: row.createdAt as string,
  }
}

// Helper to convert SQLite row to app-level SiteSettings type
export function mapSettingsRow(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    phone: row.phone as string,
    email: (row.email as string) || null,
    address: (row.address as string) || null,
    description: (row.description as string) || null,
  }
}

// Helper to convert SQLite row to app-level GalleryImage type
export function mapGalleryImageRow(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    url: row.url as string,
    sortOrder: row.sortOrder as number,
    createdAt: row.createdAt as string,
  }
}

export { generateId }
