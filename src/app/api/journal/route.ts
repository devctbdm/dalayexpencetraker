import { desc, eq } from "drizzle-orm"
import type { NextRequest } from "next/server"

import { getDb } from "@/db"
import { journalEntries } from "@/db/schema"
import { requireCurrentUser } from "@/lib/auth"
import { apiAuthError, apiError, apiSuccess, readJson } from "@/lib/api"
import type { JournalRecord } from "@/lib/tracker"
import { journalPayloadSchema } from "@/lib/validators"

export const runtime = "nodejs"

type JournalRow = {
  id: string
  entryDate: string
  title: string
  content: string
  mood: string | null
  createdAt: Date
  updatedAt: Date
}

function toJournalRecord(row: JournalRow): JournalRecord {
  return {
    id: row.id,
    entryDate: row.entryDate,
    title: row.title,
    content: row.content,
    mood: row.mood,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireCurrentUser()
    const requestedLimit = Number(request.nextUrl.searchParams.get("limit"))
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.floor(requestedLimit), 1), 60)
      : 30
    const db = getDb()
    const entries = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, user.id))
      .orderBy(desc(journalEntries.entryDate), desc(journalEntries.updatedAt))
      .limit(limit)

    return apiSuccess({ entries: entries.map(toJournalRecord) })
  } catch (error) {
    return apiAuthError(error)
  }
}

export async function POST(request: Request) {
  const parsed = journalPayloadSchema.safeParse(await readJson(request))

  if (!parsed.success) {
    return apiError("Check your journal entry and try again.", 422, {
      fields: parsed.error.flatten().fieldErrors,
    })
  }

  try {
    const user = await requireCurrentUser()
    const db = getDb()
    const [entry] = await db
      .insert(journalEntries)
      .values({
        userId: user.id,
        entryDate: parsed.data.entryDate,
        title: parsed.data.title,
        content: parsed.data.content,
        mood: parsed.data.mood || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [journalEntries.userId, journalEntries.entryDate],
        set: {
          title: parsed.data.title,
          content: parsed.data.content,
          mood: parsed.data.mood || null,
          updatedAt: new Date(),
        },
      })
      .returning()

    return apiSuccess({ entry: toJournalRecord(entry) }, 201)
  } catch (error) {
    return apiAuthError(error)
  }
}
