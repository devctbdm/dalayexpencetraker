import "server-only"

import { Resend } from "resend"

export class EmailDeliveryConfigurationError extends Error {
  constructor() {
    super("RESEND_API_KEY is not configured")
    this.name = "EmailDeliveryConfigurationError"
  }
}

export class EmailDeliveryError extends Error {
  constructor() {
    super("Resend could not deliver the email")
    this.name = "EmailDeliveryError"
  }
}

function safeName(name: string) {
  return name.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    }
    return entities[character]
  })
}

/** Sends a single-use password-reset link through Resend. */
export async function sendPasswordResetEmail({
  email,
  name,
  resetUrl,
}: {
  email: string
  name: string
  resetUrl: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new EmailDeliveryConfigurationError()
  }

  const resend = new Resend(apiKey)
  const from =
    process.env.RESEND_FROM_EMAIL ?? "DailyTrack <onboarding@resend.dev>"
  const recipientName = safeName(name)

  const { error } = await resend.emails.send({
    from,
    to: [email],
    subject: "Reset your DailyTrack password",
    text: `Hi ${name},\n\nWe received a request to reset your DailyTrack password. Use this link within 60 minutes:\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`,
    html: `
      <div style="background:#f7f8fc;padding:32px 16px;font-family:Arial,sans-serif;color:#273247">
        <div style="margin:0 auto;max-width:520px;border-radius:18px;background:#ffffff;padding:32px">
          <div style="display:inline-block;border-radius:10px;background:#637eff;padding:8px 10px;color:#ffffff;font-weight:700">dailytrack</div>
          <h1 style="margin:24px 0 10px;font-size:24px;letter-spacing:-0.4px">Reset your password</h1>
          <p style="margin:0 0 20px;line-height:1.6">Hi ${recipientName}, we received a request to reset your DailyTrack password.</p>
          <a href="${resetUrl}" style="display:inline-block;border-radius:10px;background:#637eff;padding:12px 18px;color:#ffffff;font-weight:700;text-decoration:none">Choose a new password</a>
          <p style="margin:24px 0 0;color:#758198;font-size:13px;line-height:1.6">This link expires in 60 minutes. If you did not request it, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  })

  if (error) {
    console.error("Resend password reset email failed", error)
    throw new EmailDeliveryError()
  }
}
