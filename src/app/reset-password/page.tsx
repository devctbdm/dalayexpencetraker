import { AuthShell } from "@/components/auth/auth-shell"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  return (
    <AuthShell
      eyebrow="Secure account recovery"
      title="Choose a new password"
      description="This one-time link is valid for 60 minutes after it is sent."
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  )
}
