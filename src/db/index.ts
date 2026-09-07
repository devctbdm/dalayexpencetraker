import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "@/db/schema"

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not configured")
    this.name = "DatabaseNotConfiguredError"
  }
}

function createDatabase(connectionString: string) {
  // Supabase poolers work best with prepared statements disabled. Local URLs
  // are kept SSL-free so the same setup is comfortable for development.
  const isLocalDatabase = /localhost|127\.0\.0\.1|\[::1\]/.test(
    connectionString
  )
  const client = postgres(connectionString, {
    max: 1,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: isLocalDatabase ? false : "require",
  })

  return drizzle({ client, schema })
}

type TrackerDatabase = ReturnType<typeof createDatabase>

type DatabaseGlobal = typeof globalThis & {
  __dailyTrackDb?: TrackerDatabase
}

const databaseGlobal = globalThis as DatabaseGlobal

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL)
}

/**
 * Lazily creates the Drizzle client. This keeps the UI usable in preview mode
 * without a database while API calls clearly report the missing configuration.
 */
export function getDb(): TrackerDatabase {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new DatabaseNotConfiguredError()
  }

  if (!databaseGlobal.__dailyTrackDb) {
    databaseGlobal.__dailyTrackDb = createDatabase(connectionString)
  }

  return databaseGlobal.__dailyTrackDb
}
