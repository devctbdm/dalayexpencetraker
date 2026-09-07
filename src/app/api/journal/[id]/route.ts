import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { getDb } from "@/db"
import { journalEntries } from "@/db/schema"
import { requireCurrentUser } from "@/lib/auth"
import { apiAuthError, apiError } from "@/lib/api"

export const runtime = "nodejs"

const idSchema = z.string().uuid()

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const parsedId = idSchema.safeParse(id)

  if (!parsedId.success) {
    return apiError("That journal entry ID is invalid.", 400)
  }

  try {
    const user = await requireCurrentUser()
    const db = getDb()
    const [deleted] = await db
      .delete(journalEntries)
      .where(
        and(
          eq(journalEntries.id, parsedId.data),
          eq(journalEntries.userId, user.id)
        )
      )
      .returning({ id: journalEntries.id })

    if (!deleted) {
      return apiError("Journal entry not found.", 404)
    }

    return new Response(null, { status: 204 })
  } catch (error) {
    return apiAuthError(error)
  }
}
