import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { findOrCreateCategory } from "@/db/categories"
import { getDb } from "@/db"
import { expenses } from "@/db/schema"
import { requireCurrentUser } from "@/lib/auth"
import { apiAuthError, apiError, apiSuccess, readJson } from "@/lib/api"
import type { ExpenseRecord } from "@/lib/tracker"
import { expenseUpdateSchema } from "@/lib/validators"

export const runtime = "nodejs"

const idSchema = z.string().uuid()

type ExpenseRow = {
  id: string
  description: string
  amount: string
  note: string | null
  paymentMethod: string | null
  spentAt: Date
  recordedAt: Date
}

function toExpenseRecord(
  row: ExpenseRow,
  category: string,
  categoryColor: string
): ExpenseRecord {
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    category,
    categoryColor,
    spentAt: row.spentAt.toISOString(),
    recordedAt: row.recordedAt.toISOString(),
    notes: row.note,
    paymentMethod: row.paymentMethod,
  }
}

function parseSpentAt(date: string) {
  return new Date(`${date}T12:00:00.000Z`)
}

async function getId(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  return idSchema.safeParse(id)
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const id = await getId(context)
  if (!id.success) {
    return apiError("That expense ID is invalid.", 400)
  }

  const parsed = expenseUpdateSchema.safeParse(await readJson(request))
  if (!parsed.success) {
    return apiError("Check the expense details and try again.", 422, {
      fields: parsed.error.flatten().fieldErrors,
    })
  }

  try {
    const user = await requireCurrentUser()
    const db = getDb()
    const update = parsed.data
    let category: { id: string; name: string; color: string } | undefined

    if (update.category) {
      category = await findOrCreateCategory(db, user.id, update.category)
    }

    const [updated] = await db
      .update(expenses)
      .set({
        ...(update.description ? { description: update.description } : {}),
        ...(typeof update.amount === "number"
          ? { amount: update.amount.toFixed(2) }
          : {}),
        ...(category ? { categoryId: category.id } : {}),
        ...(update.spentAt ? { spentAt: parseSpentAt(update.spentAt) } : {}),
        ...(update.notes !== undefined ? { note: update.notes || null } : {}),
        ...(update.paymentMethod !== undefined
          ? { paymentMethod: update.paymentMethod || null }
          : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(expenses.id, id.data), eq(expenses.userId, user.id)))
      .returning()

    if (!updated) {
      return apiError("Expense not found.", 404)
    }

    if (!category) {
      // The update did not alter category. Look it up so the returned record
      // remains complete without making the client refetch its entire list.
      const current = await db.query.expenses.findFirst({
        where: and(eq(expenses.id, id.data), eq(expenses.userId, user.id)),
        with: { category: true },
      })

      if (!current?.category) {
        return apiError("Expense category not found.", 404)
      }

      category = current.category
    }

    return apiSuccess({
      expense: toExpenseRecord(updated, category.name, category.color),
    })
  } catch (error) {
    return apiAuthError(error)
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const id = await getId(context)
  if (!id.success) {
    return apiError("That expense ID is invalid.", 400)
  }

  try {
    const user = await requireCurrentUser()
    const db = getDb()
    const [deleted] = await db
      .delete(expenses)
      .where(and(eq(expenses.id, id.data), eq(expenses.userId, user.id)))
      .returning({ id: expenses.id })

    if (!deleted) {
      return apiError("Expense not found.", 404)
    }

    return new Response(null, { status: 204 })
  } catch (error) {
    return apiAuthError(error)
  }
}
