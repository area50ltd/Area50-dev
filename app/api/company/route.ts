import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users, companies } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const supabase = createClient()
  const { data: { user: _authUser } } = await supabase.auth.getUser()
  if (!_authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = _authUser.id

  const dbUser = await db.query.users.findFirst({ where: eq(users.clerk_id, userId) })
  if (!dbUser?.company_id) return NextResponse.json(null)

  const company = await db.query.companies.findFirst({
    where: eq(companies.id, dbUser.company_id),
  })

  return NextResponse.json(company ?? null)
}

const updateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  ai_personality: z.string().optional(),
  widget_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  widget_welcome: z.string().max(500).optional(),
  widget_avatar: z.string().url().optional().nullable(),
  language: z.string().max(10).optional(),
  voice_language: z.string().max(10).optional(),
  voice_accent: z.string().max(50).optional(),
  voice_gender: z.string().max(10).optional(),
  voice_tone: z.string().max(20).optional(),
  elevenlabs_voice_id: z.string().max(100).optional().nullable(),
  vapi_assistant_id: z.string().max(255).optional().nullable(),
  vapi_phone_number: z.string().max(50).optional().nullable(),
  slack_webhook_url: z.string().url().optional().nullable(),
})

export async function PATCH(req: Request) {
  const supabase = createClient()
  const { data: { user: _authUser } } = await supabase.auth.getUser()
  if (!_authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = _authUser.id

  const dbUser = await db.query.users.findFirst({ where: eq(users.clerk_id, userId) })
  if (!dbUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const [updated] = await db
    .update(companies)
    .set({ ...parsed.data, updated_at: new Date() })
    .where(eq(companies.id, dbUser.company_id))
    .returning()

  return NextResponse.json(updated)
}
