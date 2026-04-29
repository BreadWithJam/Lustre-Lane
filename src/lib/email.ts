/**
 * Email service using Resend for transactional notifications.
 * Requirements: 4.1, 4.2
 */

export interface EmailPayload {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export interface NewMessageEmailData {
  clientName?: string
  clientEmail: string
  messageContent: string
  threadId: string
  appUrl: string
}

export interface MessageStatusEmailData {
  clientName?: string
  clientEmail: string
  status: string
  threadId: string
  appUrl: string
}

const FROM_ADDRESS =
  process.env.NOTIFICATION_FROM_EMAIL ?? 'notifications@salon.example.com'
const SALON_ADMIN_EMAIL = process.env.SALON_ADMIN_EMAIL ?? 'admin@salon.example.com'

// ---------------------------------------------------------------------------
// Template builders
// ---------------------------------------------------------------------------

export function buildNewMessageEmailHtml(data: NewMessageEmailData): string {
  const adminUrl = `${data.appUrl}/admin/messages/${data.threadId}`
  const clientDisplay = data.clientName
    ? `${escapeHtml(data.clientName)} (${escapeHtml(data.clientEmail)})`
    : escapeHtml(data.clientEmail)

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>New Client Message</title></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#333">
  <h2 style="color:#8B6914">New Message from ${clientDisplay}</h2>
  <div style="background:#f9f5f0;border-left:4px solid #8B6914;padding:16px;margin:16px 0;border-radius:4px">
    <p style="margin:0;white-space:pre-wrap">${escapeHtml(data.messageContent)}</p>
  </div>
  <a href="${adminUrl}"
     style="display:inline-block;background:#8B6914;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
    View &amp; Reply
  </a>
  <p style="color:#888;font-size:12px;margin-top:24px">
    This is an automated notification from your salon messaging system.
  </p>
</body>
</html>`
}

export function buildStatusUpdateEmailHtml(data: MessageStatusEmailData): string {
  const threadUrl = `${data.appUrl}/chat?thread=${data.threadId}`
  const clientDisplay = data.clientName ?? data.clientEmail

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Message Status Update</title></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#333">
  <h2 style="color:#8B6914">Hi ${escapeHtml(clientDisplay)},</h2>
  <p>Your conversation status has been updated to <strong>${escapeHtml(data.status)}</strong>.</p>
  <a href="${threadUrl}"
     style="display:inline-block;background:#8B6914;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
    View Conversation
  </a>
  <p style="color:#888;font-size:12px;margin-top:24px">
    This is an automated notification from your salon messaging system.
  </p>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// Send helper
// ---------------------------------------------------------------------------

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set — skipping email send')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: payload.from ?? FROM_ADDRESS,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('[email] Resend API error:', response.status, errorBody)
      return { success: false, error: `Resend API error: ${response.status}` }
    }

    const result = (await response.json()) as { id: string }
    return { success: true, id: result.id }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[email] Failed to send email:', message)
    return { success: false, error: message }
  }
}

// ---------------------------------------------------------------------------
// Convenience senders
// ---------------------------------------------------------------------------

export async function sendNewMessageNotification(data: NewMessageEmailData) {
  return sendEmail({
    to: SALON_ADMIN_EMAIL,
    subject: `New message from ${data.clientName ?? data.clientEmail}`,
    html: buildNewMessageEmailHtml(data),
  })
}

export async function sendStatusUpdateNotification(data: MessageStatusEmailData) {
  return sendEmail({
    to: data.clientEmail,
    subject: 'Your conversation status has been updated',
    html: buildStatusUpdateEmailHtml(data),
  })
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
