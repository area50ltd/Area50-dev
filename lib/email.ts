/**
 * Email sending utility using Resend API.
 * API key + from address are stored in platform_settings by super admin.
 * Falls back gracefully if not configured (logs warning, doesn't crash).
 */

import { db } from './db'
import { platform_settings } from './schema'
import { eq } from 'drizzle-orm'

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

async function getSetting(key: string): Promise<string | null> {
  try {
    const [row] = await db
      .select()
      .from(platform_settings)
      .where(eq(platform_settings.key, key))
      .limit(1)
    return row?.value ?? null
  } catch {
    return null
  }
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const apiKey = await getSetting('resend_api_key')
  if (!apiKey) {
    console.warn('[email] Resend API key not configured in platform_settings')
    return { success: false, error: 'Email not configured' }
  }

  const fromName = (await getSetting('email_from_name')) ?? 'Zentativ'
  const fromAddress = (await getSetting('email_from_address')) ?? 'notifications@zentativ.com'
  const to = Array.isArray(options.to) ? options.to : [options.to]

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `${fromName} <${fromAddress}>`,
        to,
        subject: options.subject,
        html: options.html,
        ...(options.replyTo ? { reply_to: options.replyTo } : {}),
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('[email] Resend error:', res.status, body)
      return { success: false, error: `Resend ${res.status}: ${body}` }
    }

    return { success: true }
  } catch (err) {
    console.error('[email] Network error:', err)
    return { success: false, error: 'Network error sending email' }
  }
}

// ─── Pre-built templates ──────────────────────────────────────────────────────

export function escalationEmailHtml(params: {
  companyName: string
  ticketId: string
  customerName: string
  category: string
  summary: string
  appUrl: string
}): string {
  return `
<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:32px">
<div style="max-width:540px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">
  <div style="background:#7C3AED;padding:24px 32px">
    <h1 style="color:#fff;margin:0;font-size:20px">Ticket Escalated</h1>
    <p style="color:#e9d5ff;margin:4px 0 0;font-size:13px">${params.companyName}</p>
  </div>
  <div style="padding:32px">
    <p style="color:#374151;font-size:15px;margin:0 0 20px">A ticket requires human attention:</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="color:#6b7280;padding:6px 0;width:120px">Ticket ID</td><td style="color:#111827;font-weight:600">#${params.ticketId.slice(0, 8)}</td></tr>
      <tr><td style="color:#6b7280;padding:6px 0">Customer</td><td style="color:#111827">${params.customerName}</td></tr>
      <tr><td style="color:#6b7280;padding:6px 0">Category</td><td style="color:#111827">${params.category}</td></tr>
    </table>
    ${params.summary ? `<div style="background:#f3f4f6;border-radius:8px;padding:16px;margin-top:20px"><p style="color:#6b7280;font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:.05em">AI Summary</p><p style="color:#374151;font-size:14px;margin:0">${params.summary}</p></div>` : ''}
    <a href="${params.appUrl}/dashboard/tickets/${params.ticketId}" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#7C3AED;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">View Ticket →</a>
  </div>
  <div style="padding:16px 32px;border-top:1px solid #f3f4f6;font-size:12px;color:#9ca3af">You're receiving this because escalation alerts are enabled for your account.</div>
</div>
</body></html>`
}

export function lowCreditEmailHtml(params: {
  companyName: string
  creditsRemaining: number
  threshold: number
  appUrl: string
}): string {
  return `
<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:32px">
<div style="max-width:540px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">
  <div style="background:#F59E0B;padding:24px 32px">
    <h1 style="color:#fff;margin:0;font-size:20px">⚠️ Low Credit Balance</h1>
    <p style="color:#fef3c7;margin:4px 0 0;font-size:13px">${params.companyName}</p>
  </div>
  <div style="padding:32px">
    <p style="color:#374151;font-size:15px;margin:0 0 12px">Your AI credit balance is running low.</p>
    <p style="font-size:32px;font-weight:700;color:#F59E0B;margin:0 0 4px">${params.creditsRemaining.toLocaleString()}</p>
    <p style="color:#6b7280;font-size:13px;margin:0 0 24px">credits remaining (threshold: ${params.threshold})</p>
    <p style="color:#374151;font-size:14px">Top up now to ensure uninterrupted AI support for your customers.</p>
    <a href="${params.appUrl}/dashboard/billing" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#7C3AED;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Top Up Credits →</a>
  </div>
  <div style="padding:16px 32px;border-top:1px solid #f3f4f6;font-size:12px;color:#9ca3af">You're receiving this because low credit alerts are enabled for your account.</div>
</div>
</body></html>`
}
