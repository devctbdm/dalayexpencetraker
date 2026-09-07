import { redirect } from "next/navigation"

import { AuthShell } from "@/components/auth/auth-shell"
import { RegisterForm } from "@/components/auth/register-form"
import { isDatabaseConfigured } from "@/db"
import { getCurrentUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function RegisterPage() {
  if (isDatabaseConfigured() && (await getCurrentUser())) {
    redirect("/dashboard")
  }

  return (
    <AuthShell
      eyebrow="Start your daily rhythm"
      title="Create your account"
      description="A private home for the moments and money that make up your days."
    >
      <RegisterForm />
    </AuthShell>
  )
}
