import { clearSession } from "@/lib/auth"
import { apiAuthError, apiSuccess } from "@/lib/api"

export const runtime = "nodejs"

export async function POST() {
  try {
    await clearSession()
    return apiSuccess({ ok: true })
  } catch (error) {
    return apiAuthError(error)
  }
}
