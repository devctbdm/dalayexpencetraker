import { requireCurrentUser } from "@/lib/auth"
import { apiAuthError, apiSuccess } from "@/lib/api"

export const runtime = "nodejs"

export async function GET() {
  try {
    return apiSuccess({ user: await requireCurrentUser() })
  } catch (error) {
    return apiAuthError(error)
  }
}
