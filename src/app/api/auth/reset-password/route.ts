import { createHash } from "node:crypto"

import { and, eq, gt, isNull } from "drizzle-orm"
import { hash } from "bcryptjs"

import { getDb } from "@/db"
import { passwordResetTokens, users } from "@/db/schema"
import {
  assertAuthConfigured,
  createSession,
} from "@/lib/auth"
import { apiAuthError, apiError, apiSuccess, readJson } from "@/lib/api"
import { resetPasswordPayloadSchema } from "@/lib/validators"

export const runtime = "nodejs"

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export async function POST(request: Request) {
  const parsed = resetPasswordPayloadSchema.safeParse(await readJson(request))
  if (!parsed.success) {
    return apiError("Check your new password and try again.", 422, {
      fields: parsed.error.flatten().fieldErrors,
    })
  }

  try {
    assertAuthConfigured()
    const db = getDb()
    const now = new Date()
    const passwordHash = await hash(parsed.data.password, 12)

    const user = await db.transaction(async (tx) => {
      // Atomically mark a valid token as used. A second request with the same
      // token will return no record and cannot change the password again.
      const [resetToken] = await tx
        .update(passwordResetTokens)
        .set({ usedAt: now })
        .where(
          and(
            eq(passwordResetTokens.tokenHash, hashToken(parsed.data.token)),
            gt(passwordResetTokens.expiresAt, now),
            isNull(passwordResetTokens.usedAt)
          )
        )
        .returning({ userId: passwordResetTokens.userId })

      if (!resetToken) return null

      const [updatedUser] = await tx
        .update(users)
        .set({ passwordHash, updatedAt: now })
        .where(eq(users.id, resetToken.userId))
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
        })

      return updatedUser ?? null
    })

    if (!user) {
      return apiError(
        "This password reset link is invalid or has expired. Request a new one.",
        400
      )
    }

    await createSession(user.id)
    return apiSuccess({ user })
  } catch (error) {
    return apiAuthError(error)
  }
}
