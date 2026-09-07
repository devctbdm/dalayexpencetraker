import { eq } from "drizzle-orm"

import { expenseCategories } from "@/db/schema"
import { getDb } from "@/db"
import { categoryColorForName } from "@/lib/tracker"

/** Finds a category by name or creates it for a new expense. */
export async function findOrCreateCategory(
  db: ReturnType<typeof getDb>,
  name: string
) {
  await db
    .insert(expenseCategories)
    .values({
      name,
      color: categoryColorForName(name),
    })
    .onConflictDoNothing({ target: expenseCategories.name })

  const [category] = await db
    .select()
    .from(expenseCategories)
    .where(eq(expenseCategories.name, name))
    .limit(1)

  if (!category) {
    throw new Error("The expense category could not be created.")
  }

  return category
}
