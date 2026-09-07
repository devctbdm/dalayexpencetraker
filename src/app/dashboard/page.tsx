import { redirect } from "next/navigation"

import { DashboardClient } from "@/components/dashboard-client"
import { isDatabaseConfigured } from "@/db"
import { getCurrentUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

const previewUser = {
  id: "local-preview",
  name: "Alex Morgan",
  email: "preview@dailytrack.local",
}

export default async function DashboardPage() {
  // Keep the polished visual preview available before a Supabase URL exists.
  // Once persistence is configured, all dashboard data is scoped to the
  // signed-in account and unauthenticated visitors are sent to login.
  if (!isDatabaseConfigured()) {
    return <DashboardClient user={previewUser} isPreview />
  }

  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  return <DashboardClient user={user} />
}
