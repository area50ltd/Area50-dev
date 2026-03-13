import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { platform_settings } from '@/lib/schema'
import { requireRole } from '@/lib/auth'
import { eq } from 'drizzle-orm'

const MASKED_KEYS = [
  'paystack_secret_key', 'paystack_public_key', 'paystack_webhook_secret', 'n8n_secret',
  'twilio_account_sid', 'twilio_auth_token',
]

function maskValue(key: string, value: string | null): string {
  if (!value) return ''
  if (MASKED_KEYS.includes(key)) {
    return value.length > 4 ? `****${value.slice(-4)}` : '****'
  }
  return value
}

export async function GET() {
  try {
    await requireRole('super_admin')
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await db.select().from(platform_settings)
  const result: Record<string, string> = {}
  for (const row of rows) {
    result[row.key] = maskValue(row.key, row.value)
  }
  return NextResponse.json(result)
}

const PatchSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string(),
})

export async function PATCH(req: Request) {
  try {
    await requireRole('super_admin')
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { key, value } = parsed.data

  await db
    .insert(platform_settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: platform_settings.key, set: { value, updated_at: new Date() } })

  return NextResponse.json({ success: true })
}
