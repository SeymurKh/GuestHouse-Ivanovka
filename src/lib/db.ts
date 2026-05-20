import { createDb } from './schema'

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof createDb> | undefined
}

// Reuse DB connection in development to avoid creating multiple connections
export const db = globalForDb.db ?? createDb()

if (process.env.NODE_ENV !== 'production') globalForDb.db = db
