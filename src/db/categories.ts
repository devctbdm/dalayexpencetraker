import { and, eq } from "drizzle-orm"

import { getDb } from "@/db"
import { expenseCategories } from "@/db/schema"
import { categoryColorForName } from "@/lib/tracker"

/** Finds a signed-in user’s category by name or creates it for a new expense. */
export async function findOrCreateCategory(
  db: ReturnType<typeof getDb>,
  userId: string,
  name: string
) {
  await db
    .insert(expenseCategories)
    .values({
      userId,
      name,
      color: categoryColorForName(name),
    })
    .onConflictDoNothing({
      target: [expenseCategories.userId, expenseCategories.name],
    })

  const [category] = await db
    .select()
    .from(expenseCategories)
    .where(
      and(
        eq(expenseCategories.userId, userId),
        eq(expenseCategories.name, name)
      )
    )
    .limit(1)

  if (!category) {
    throw new Error("The expense category could not be created.")
  }

  return category
}
