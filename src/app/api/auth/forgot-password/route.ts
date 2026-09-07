import { createHash, randomBytes } from "node:crypto"

import { eq } from "drizzle-orm"

import { getDb } from "@/db"
import { passwordResetTokens, users } from "@/db/schema"
import { assertAuthConfigured } from "@/lib/auth"
import { apiAuthError, apiError, apiSuccess, readJson } from "@/lib/api"
import { sendPasswordResetEmail } from "@/lib/email"
import { forgotPasswordPayloadSchema } from "@/lib/validators"

export const runtime = "nodejs"

const RESET_TOKEN_LIFETIME_MS = 60 * 60 * 1000
const GENERIC_SUCCESS_MESSAGE =
  "If an account exists for that email, a password reset link is on its way."

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

function getAppUrl(request: Request) {
  const configuredUrl = process.env.APP_URL?.trim()
  const url = configuredUrl ? new URL(configuredUrl) : new URL(request.url)

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("APP_URL must use http or https")
  }

  return url.origin
}

export async function POST(request: Request) {
  const parsed = forgotPasswordPayloadSchema.safeParse(await readJson(request))
  if (!parsed.success) {
    return apiError("Enter a valid email address.", 422, {
      fields: parsed.error.flatten().fieldErrors,
    })
  }

  try {
    assertAuthConfigured()
    const db = getDb()
    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1)

    // Always return the same message for unknown accounts to avoid revealing
    // which email addresses are registered.
    if (!user) {
      return apiSuccess({ message: GENERIC_SUCCESS_MESSAGE })
    }

    const token = randomBytes(32).toString("base64url")
    const tokenHash = hashToken(token)
    const expiresAt = new Date(Date.now() + RESET_TOKEN_LIFETIME_MS)

    // A newer request invalidates any previous reset link for this account.
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, user.id))

    const [resetRecord] = await db
      .insert(passwordResetTokens)
      .values({
        userId: user.id,
        tokenHash,
        expiresAt,
      })
      .returning({ id: passwordResetTokens.id })

    const resetUrl = new URL("/reset-password", getAppUrl(request))
    resetUrl.searchParams.set("token", token)

    try {
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetUrl: resetUrl.toString(),
      })
    } catch (error) {
      // Do not leave a usable token around if delivery failed.
      if (resetRecord) {
        await db
          .delete(passwordResetTokens)
          .where(eq(passwordResetTokens.id, resetRecord.id))
      }
      throw error
    }

    return apiSuccess({ message: GENERIC_SUCCESS_MESSAGE })
  } catch (error) {
    return apiAuthError(error)
  }
}
