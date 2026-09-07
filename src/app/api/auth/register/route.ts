import { hash } from "bcryptjs"
import { eq } from "drizzle-orm"

import { getDb } from "@/db"
import { users } from "@/db/schema"
import {
  assertAuthConfigured,
  createSession,
} from "@/lib/auth"
import { apiAuthError, apiError, apiSuccess, readJson } from "@/lib/api"
import { registerPayloadSchema } from "@/lib/validators"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const parsed = registerPayloadSchema.safeParse(await readJson(request))
  if (!parsed.success) {
    return apiError("Check your details and try again.", 422, {
      fields: parsed.error.flatten().fieldErrors,
    })
  }

  try {
    // Validate server configuration before creating an account so a user never
    // ends up with an account they cannot immediately sign into.
    assertAuthConfigured()
    const db = getDb()
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1)

    if (existingUser) {
      return apiError("An account with that email already exists.", 409)
    }

    const passwordHash = await hash(parsed.data.password, 12)
    const [user] = await db
      .insert(users)
      .values({
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
      })

    if (!user) {
      return apiError("We could not create your account. Please try again.", 500)
    }

    await createSession(user.id)
    return apiSuccess({ user }, 201)
  } catch (error) {
    return apiAuthError(error)
  }
}
