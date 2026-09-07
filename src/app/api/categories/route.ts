import { asc } from "drizzle-orm"
import { z } from "zod"

import { findOrCreateCategory } from "@/db/categories"
import { getDb } from "@/db"
import { expenseCategories } from "@/db/schema"
import { apiDatabaseError, apiError, apiSuccess, readJson } from "@/lib/api"

export const runtime = "nodejs"

const categorySchema = z.object({
  name: z.string().trim().min(1, "Add a category name.").max(80),
})

export async function GET() {
  try {
    const db = getDb()
    const categories = await db
      .select({
        id: expenseCategories.id,
        name: expenseCategories.name,
        color: expenseCategories.color,
        createdAt: expenseCategories.createdAt,
      })
      .from(expenseCategories)
      .orderBy(asc(expenseCategories.name))

    return apiSuccess({
      categories: categories.map((category) => ({
        ...category,
        createdAt: category.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    return apiDatabaseError(error)
  }
}

export async function POST(request: Request) {
  const parsed = categorySchema.safeParse(await readJson(request))
  if (!parsed.success) {
    return apiError("Check the category name and try again.", 422, {
      fields: parsed.error.flatten().fieldErrors,
    })
  }

  try {
    const category = await findOrCreateCategory(getDb(), parsed.data.name)
    return apiSuccess(
      {
        category: {
          ...category,
          createdAt: category.createdAt.toISOString(),
        },
      },
      201
    )
  } catch (error) {
    return apiDatabaseError(error)
  }
}
