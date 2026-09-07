import { DatabaseNotConfiguredError } from "@/db"

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

export async function readJson(request: Request) {
  try {
    return await request.json()
  } catch {
    return undefined
  }
}
