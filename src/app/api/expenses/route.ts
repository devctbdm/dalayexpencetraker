import { desc, eq } from "drizzle-orm"
import type { NextRequest } from "next/server"

import { findOrCreateCategory } from "@/db/categories"
import { getDb } from "@/db"
import { expenseCategories, expenses } from "@/db/schema"
import { requireCurrentUser } from "@/lib/auth"
import { apiAuthError, apiError, apiSuccess, readJson } from "@/lib/api"
import type { ExpenseRecord } from "@/lib/tracker"
import { expensePayloadSchema } from "@/lib/validators"

export const runtime = "nodejs"

type ExpenseQueryRow = {
  id: string
  description: string
  amount: string
  note: string | null
  paymentMethod: string | null
  spentAt: Date
  recordedAt: Date
  category: string | null
  categoryColor: string | null
}

function toExpenseRecord(row: ExpenseQueryRow): ExpenseRecord {
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    category: row.category ?? "Other",
    categoryColor: row.categoryColor ?? "#8B95A7",
    spentAt: row.spentAt.toISOString(),
    recordedAt: row.recordedAt.toISOString(),
    notes: row.note,
    paymentMethod: row.paymentMethod,
  }
}

function expenseDate(date: string | undefined) {
  // Midday UTC avoids accidentally shifting a date backwards when it is later
  // rendered in a negative-offset timezone.
  return date ? new Date(`${date}T12:00:00.000Z`) : new Date()
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireCurrentUser()
    const requestedLimit = Number(request.nextUrl.searchParams.get("limit"))
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.floor(requestedLimit), 1), 100)
      : 100
    const db = getDb()
    const rows = await db
      .select({
        id: expenses.id,
        description: expenses.description,
        amount: expenses.amount,
        note: expenses.note,
        paymentMethod: expenses.paymentMethod,
        spentAt: expenses.spentAt,
        recordedAt: expenses.recordedAt,
        category: expenseCategories.name,
        categoryColor: expenseCategories.color,
      })
      .from(expenses)
      .leftJoin(
        expenseCategories,
        eq(expenses.categoryId, expenseCategories.id)
      )
      .where(eq(expenses.userId, user.id))
      .orderBy(desc(expenses.spentAt), desc(expenses.recordedAt))
      .limit(limit)

    return apiSuccess({ expenses: rows.map(toExpenseRecord) })
  } catch (error) {
    return apiAuthError(error)
  }
}

export async function POST(request: Request) {
  const body = await readJson(request)
  const parsed = expensePayloadSchema.safeParse(body)

  if (!parsed.success) {
    return apiError("Check the expense details and try again.", 422, {
      fields: parsed.error.flatten().fieldErrors,
    })
  }

  try {
    const user = await requireCurrentUser()
    const db = getDb()
    const category = await findOrCreateCategory(
      db,
      user.id,
      parsed.data.category
    )
    const [created] = await db
      .insert(expenses)
      .values({
        userId: user.id,
        categoryId: category.id,
        description: parsed.data.description,
        amount: parsed.data.amount.toFixed(2),
        currency: "BDT",
        note: parsed.data.notes || null,
        paymentMethod: parsed.data.paymentMethod || null,
        spentAt: expenseDate(parsed.data.spentAt),
      })
      .returning()

    return apiSuccess(
      {
        expense: toExpenseRecord({
          ...created,
          category: category.name,
          categoryColor: category.color,
        }),
      },
      201
    )
  } catch (error) {
    return apiAuthError(error)
  }
}
