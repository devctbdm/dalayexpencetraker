import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // `db:generate` does not connect, so this local fallback lets a fresh
    // clone generate migrations before a Supabase connection is supplied.
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/dailytrack",
  },
  verbose: true,
  strict: true,
})
