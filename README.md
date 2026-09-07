# DailyTrack

A mobile-responsive personal dashboard for capturing everyday expenses and short daily journal reflections. The interface is built with **Next.js 16.3.4**, Tailwind CSS, and Shadcn base components; the API routes use **Drizzle ORM** with a Supabase PostgreSQL connection.

## Features

- Email-and-password authentication: register, sign in, secure sign out, and password recovery
- Password reset emails delivered through [Resend](https://resend.com), with a one-time, SHA-256-hashed token that expires after 60 minutes
- HTTP-only, signed, 7-day session cookies; no roles or permissions model
- Each expense and journal entry is isolated to its signed-in account
- Responsive admin-style dashboard with the Shadcn `sidebar-03` pattern and a mobile drawer sidebar
- Daily expense tracking for descriptions, exact numeric amounts, categories, payment method, spend time, and record time
- One journal reflection per user per calendar day with title, mood, content, creation, and update timestamps
- Interactive add-expense and write-entry panels
- Recent activity filtering, category breakdown, budget progress, and a 7-day spending chart
- Browser-only dashboard preview fallback when Supabase is not configured

## Local setup

```bash
corepack pnpm install
cp .env.example .env.local
# Fill DATABASE_URL, AUTH_SECRET, APP_URL, RESEND_API_KEY, and RESEND_FROM_EMAIL.
corepack pnpm db:migrate
corepack pnpm dev
```

Generate an `AUTH_SECRET` with:

```bash
openssl rand -base64 32
```

Visit [http://localhost:3000](http://localhost:3000). With a Supabase URL configured, unauthenticated visitors are sent to `/login` and can create an account at `/register`.

## Supabase, Drizzle, and authentication

1. In Supabase, open **Connect** and copy the PostgreSQL URI. A transaction pooler URI is generally a good fit for serverless hosting.
2. Put it in `.env.local` as `DATABASE_URL`. Do not expose that URL with a `NEXT_PUBLIC_` prefix.
3. Set a random `AUTH_SECRET` with at least 32 characters. It signs the HTTP-only session cookie.
4. Set `APP_URL` to your deployed application origin. It is used to build password-reset links.
5. Create and verify a sending domain in Resend, then set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`. Resend’s sandbox sender can be used for limited account-owner testing; a verified sender is required for production recipients.
6. Apply the initial migration with `corepack pnpm db:migrate`.

The Drizzle tables live in [`src/db/schema.ts`](src/db/schema.ts):

- `users` stores a name, normalized email, bcrypt password hash, and timestamps. It intentionally has no role field.
- `password_reset_tokens` stores only a token hash, an expiry timestamp, and a used-at timestamp.
- `expense_categories` stores each signed-in user’s reusable category names and colors.
- `expenses` stores the signed-in owner, description, `NUMERIC(12,2)` cost, category relation, currency, optional note/payment method, `spent_at`, `recorded_at`, and `updated_at`.
- `journal_entries` stores the signed-in owner’s dated reflection with content, mood, and timestamp metadata.

The `postgres` driver is configured with prepared statements disabled, which is compatible with Supabase poolers.

## API routes

| Route | Methods | Purpose |
| --- | --- | --- |
| `/api/auth/register` | `POST` | Create an account and start a session |
| `/api/auth/login` | `POST` | Verify credentials and start a session |
| `/api/auth/logout` | `POST` | Clear the HTTP-only session cookie |
| `/api/auth/me` | `GET` | Return the current signed-in user |
| `/api/auth/forgot-password` | `POST` | Issue and email a password-reset link through Resend |
| `/api/auth/reset-password` | `POST` | Redeem a valid reset token and set a new password |
| `/api/categories` | `GET`, `POST` | List or add reusable expense categories |
| `/api/expenses` | `GET`, `POST` | List or record the current user’s expenses |
| `/api/expenses/[id]` | `PATCH`, `DELETE` | Update or remove the current user’s expense |
| `/api/journal` | `GET`, `POST` | List entries or create/update the current user’s entry for a day |
| `/api/journal/[id]` | `DELETE` | Remove the current user’s journal entry |

All write routes validate input with Zod. Authentication and data ownership are enforced in every protected API route. Password-reset requests respond identically for known and unknown emails to avoid account enumeration.

## Useful commands

```bash
corepack pnpm dev          # development server
corepack pnpm build        # production build
corepack pnpm lint         # lint the app
corepack pnpm db:generate  # create Drizzle migration files
corepack pnpm db:migrate   # apply Drizzle migrations
corepack pnpm db:studio    # open Drizzle Studio
```
