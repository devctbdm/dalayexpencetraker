import { DatabaseNotConfiguredError } from "@/db"
import {
  AuthConfigurationError,
  AuthenticationRequiredError,
} from "@/lib/auth"
import {
  EmailDeliveryConfigurationError,
  EmailDeliveryError,
} from "@/lib/email"

export function apiError(message: string, status: number, details?: unknown) {
  return Response.json(
    {
      error: message,
      ...(details ? { details } : {}),
    },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  )
}

export function apiSuccess<T>(data: T, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  })
}

export function apiDatabaseError(error: unknown) {
  if (error instanceof DatabaseNotConfiguredError) {
    return apiError(
      "A Supabase DATABASE_URL is required before cloud persistence can be used.",
      503
    )
  }

  console.error("Database request failed", error)
  return apiError("The database could not complete this request.", 500)
}

export function apiAuthError(error: unknown) {
  if (error instanceof AuthenticationRequiredError) {
    return apiError("Please sign in to continue.", 401)
  }

  if (error instanceof AuthConfigurationError) {
    return apiError(
      "Authentication is not configured. Set a secure AUTH_SECRET to continue.",
      503
    )
  }

  if (error instanceof EmailDeliveryConfigurationError) {
    return apiError(
      "Password reset email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.",
      503
    )
  }

  if (error instanceof EmailDeliveryError) {
    return apiError("We could not send the reset email. Please try again.", 502)
  }

  return apiDatabaseError(error)
}

export async function readJson(request: Request) {
  try {
    return await request.json()
  } catch {
    return undefined
  }
}
