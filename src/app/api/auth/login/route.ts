import { compare } from "bcryptjs"
import { eq } from "drizzle-orm"

import { getDb } from "@/db"
import { users } from "@/db/schema"
import {
  assertAuthConfigured,
  createSession,
} from "@/lib/auth"
import { apiAuthError, apiError, apiSuccess, readJson } from "@/lib/api"
import { loginPayloadSchema } from "@/lib/validators"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const parsed = loginPayloadSchema.safeParse(await readJson(request))
  if (!parsed.success) {
    return apiError("Enter your email and password to continue.", 422, {
      fields: parsed.error.flatten().fieldErrors,
    })
  }

  try {
    assertAuthConfigured()
    const db = getDb()
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1)

    if (!user || !(await compare(parsed.data.password, user.passwordHash))) {
      return apiError("Email or password is incorrect.", 401)
    }

    await createSession(user.id)
    return apiSuccess({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    return apiAuthError(error)
  }
}
