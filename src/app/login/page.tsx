import { redirect } from "next/navigation"

import { LoginForm } from "@/components/auth/login-form"
import { AuthShell } from "@/components/auth/auth-shell"
import { isDatabaseConfigured } from "@/db"
import { getCurrentUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function LoginPage() {
  if (isDatabaseConfigured() && (await getCurrentUser())) {
    redirect("/dashboard")
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your space"
      description="Pick up where you left off with your spending and daily reflections."
    >
      <LoginForm />
    </AuthShell>
  )
}
