import "server-only"

import { eq } from "drizzle-orm"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

import { getDb } from "@/db"
import { users } from "@/db/schema"

const SESSION_COOKIE_NAME = "dailytrack_session"
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

export type AuthenticatedUser = {
  id: string
  name: string
  email: string
}

export class AuthConfigurationError extends Error {
  constructor() {
    super("AUTH_SECRET is not configured")
    this.name = "AuthConfigurationError"
  }
}

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("An authenticated session is required")
    this.name = "AuthenticationRequiredError"
  }
}

function getSigningKey() {
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 32) {
    throw new AuthConfigurationError()
  }

  return new TextEncoder().encode(secret)
}

export function assertAuthConfigured() {
  getSigningKey()
}

function sessionCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires,
    maxAge: SESSION_MAX_AGE_SECONDS,
  }
}

/** Stores only a signed user id in a hardened, HTTP-only browser cookie. */
export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000)
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(getSigningKey())

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions(expiresAt))
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(new Date(0)),
    maxAge: 0,
  })
}

export async function getSessionUserId() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSigningKey(), {
      algorithms: ["HS256"],
    })
    return typeof payload.sub === "string" ? payload.sub : null
  } catch {
    return null
  }
}

/**
 * Resolves a safe user DTO from the session. Password hashes and reset tokens
 * remain server-only and are never passed to client components.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const userId = await getSessionUserId()
  if (!userId) return null

  const db = getDb()
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return user ?? null
}

export async function requireCurrentUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new AuthenticationRequiredError()
  }
  return user
}
