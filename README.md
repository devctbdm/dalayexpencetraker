# DailyTrack

A mobile-responsive personal dashboard for capturing everyday expenses and short daily journal reflections. The interface is built with **Next.js 16.3.4**, Tailwind CSS, and Shadcn base components; the API routes use **Drizzle ORM** with a Supabase PostgreSQL connection.

## Features

- Responsive admin-style dashboard with the Shadcn `sidebar-03` pattern and a mobile drawer sidebar
- Daily expense tracking for descriptions, exact numeric amounts, categories, payment method, spend time, and record time
- One journal reflection per calendar day with title, mood, content, creation, and update timestamps
- Interactive add-expense and write-entry panels
- Recent activity filtering, category breakdown, budget progress, and 7-day spending chart
- Browser-only preview fallback when Supabase is not configured, so the UI is usable immediately
- Production API routes for expense/journal create, read, update/delete, validation, and error handling

## Local setup

```bash
corepack pnpm install
cp .env.example .env.local
# Add your Supabase PostgreSQL connection string to DATABASE_URL
corepack pnpm db:generate
corepack pnpm db:migrate
corepack pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000). The root route redirects to `/dashboard`.

## Supabase and Drizzle

1. In Supabase, open **Connect** and copy the PostgreSQL URI. A transaction pooler URI is generally a good fit for serverless hosting.
2. Put it in `.env.local` as `DATABASE_URL`. Do not expose that URL with a `NEXT_PUBLIC_` prefix.
3. Generate a migration after schema changes with `corepack pnpm db:generate`.
4. Apply migrations with `corepack pnpm db:migrate`.

The Drizzle tables live in [`src/db/schema.ts`](src/db/schema.ts):

- `expense_categories` stores reusable category names and colors.
- `expenses` stores a description, `NUMERIC(12,2)` cost, category relation, currency, optional note/payment method, `spent_at`, `recorded_at`, and `updated_at`.
- `journal_entries` stores one dated reflection with content, mood, and timestamp metadata.

The `postgres` driver is configured with prepared statements disabled, which is compatible with Supabase poolers.

## API routes

| Route | Methods | Purpose |
| --- | --- | --- |
| `/api/categories` | `GET`, `POST` | List or add reusable expense categories |
| `/api/expenses` | `GET`, `POST` | List or record expenses |
| `/api/expenses/[id]` | `PATCH`, `DELETE` | Update or remove one expense |
| `/api/journal` | `GET`, `POST` | List journal entries or create/update the entry for a day |
| `/api/journal/[id]` | `DELETE` | Remove a journal entry |

All write routes validate input with Zod. When `DATABASE_URL` is absent, API routes return a clear `503` response; the dashboard intentionally falls back to browser storage for a polished local preview.

## Useful commands

```bash
corepack pnpm dev          # development server
corepack pnpm build        # production build
corepack pnpm lint         # lint the app
corepack pnpm db:generate  # create Drizzle migration files
corepack pnpm db:migrate   # apply Drizzle migrations
corepack pnpm db:studio    # open Drizzle Studio
```
