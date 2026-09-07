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
 * DailyTrack uses a simple account model: every record belongs to one signed-in
 * person and there are deliberately no roles or permission levels.
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)]
)

/**
 * Only a hash of a reset token is stored. A raw token is sent by email and is
 * single-use, time-limited, and never kept in the database.
 */
export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("password_reset_tokens_token_hash_unique").on(table.tokenHash),
    index("password_reset_tokens_user_id_idx").on(table.userId),
    index("password_reset_tokens_expires_at_idx").on(table.expiresAt),
  ]
)

/**
 * User-defined buckets make categorisation extensible without changing the
 * database schema whenever a new kind of expense is needed.
 */
export const expenseCategories = pgTable(
  "expense_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    color: varchar("color", { length: 16 }).notNull().default("#8B95A7"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("expense_categories_user_name_unique").on(
      table.userId,
      table.name
    ),
    index("expense_categories_user_id_idx").on(table.userId),
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
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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
    index("expenses_user_id_idx").on(table.userId),
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
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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
    uniqueIndex("journal_entries_user_date_unique").on(
      table.userId,
      table.entryDate
    ),
    index("journal_entries_user_id_idx").on(table.userId),
    index("journal_entries_updated_at_idx").on(table.updatedAt),
  ]
)

export const userRelations = relations(users, ({ many }) => ({
  expenseCategories: many(expenseCategories),
  expenses: many(expenses),
  journalEntries: many(journalEntries),
  passwordResetTokens: many(passwordResetTokens),
}))

export const passwordResetTokenRelations = relations(
  passwordResetTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [passwordResetTokens.userId],
      references: [users.id],
    }),
  })
)

export const expenseCategoryRelations = relations(
  expenseCategories,
  ({ one, many }) => ({
    user: one(users, {
      fields: [expenseCategories.userId],
      references: [users.id],
    }),
    expenses: many(expenses),
  })
)

export const expenseRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id],
  }),
}))

export const journalEntryRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
}))
