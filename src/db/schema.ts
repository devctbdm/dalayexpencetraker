import { relations } from "drizzle-orm"
import {
  date,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

/**
 * User-defined buckets make categorisation extensible without changing the
 * database schema whenever a new kind of expense is needed.
 */
export const expenseCategories = pgTable(
  "expense_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 80 }).notNull(),
    color: varchar("color", { length: 16 }).notNull().default("#8B95A7"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("expense_categories_name_unique").on(table.name),
  ]
)

/**
 * Monetary values intentionally use Postgres NUMERIC rather than floating
 * point values, so the costs shown in the UI retain their exact value.
 */
export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => expenseCategories.id, { onDelete: "restrict" }),
    description: varchar("description", { length: 180 }).notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("BDT"),
    note: text("note"),
    paymentMethod: varchar("payment_method", { length: 40 }),
    /** When the money was actually spent. */
    spentAt: timestamp("spent_at", { withTimezone: true }).notNull(),
    /** When the record was captured in DailyTrack. */
    recordedAt: timestamp("recorded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("expenses_spent_at_idx").on(table.spentAt),
    index("expenses_category_id_idx").on(table.categoryId),
  ]
)

/**
 * One personal reflection per calendar day. The date is stored separately
 * from timestamps so a journal entry remains anchored to the intended day.
 */
export const journalEntries = pgTable(
  "journal_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    entryDate: date("entry_date").notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    content: text("content").notNull(),
    mood: varchar("mood", { length: 40 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("journal_entries_entry_date_unique").on(table.entryDate),
    index("journal_entries_updated_at_idx").on(table.updatedAt),
  ]
)

export const expenseCategoryRelations = relations(
  expenseCategories,
  ({ many }) => ({
    expenses: many(expenses),
  })
)

export const expenseRelations = relations(expenses, ({ one }) => ({
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id],
  }),
}))
