import { Resend } from 'resend'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Resend] RESEND_API_KEY not set, skipping email send')
    return
  }
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'noreply@example.com',
    to,
    subject,
    html,
  })

  if (error) {
    // Log but don't throw - email failure should not break the transaction
    console.error('[Resend] Failed to send email:', error)
  }
}
