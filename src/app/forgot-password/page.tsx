import { AuthShell } from "@/components/auth/auth-shell"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Password help"
      title="Reset your password"
      description="Enter your email and we’ll send a secure link to choose a new password."
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
