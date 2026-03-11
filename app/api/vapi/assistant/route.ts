import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { callN8n } from '@/lib/n8n'
import { db } from '@/lib/db'
import { users, companies } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const supabase = createClient()
  const { data: { user: _authUser } } = await supabase.auth.getUser()
  if (!_authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = _authUser.id

  const dbUser = await db.query.users.findFirst({ where: eq(users.clerk_id, userId) })
  if (!dbUser?.company_id) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  try {
    const result = await callN8n('/webhook/vapi/assistant/get', {
      company_id: dbUser.company_id,
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[api/vapi/assistant GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const RebuildSchema = z.object({
  force_rebuild: z.boolean().default(true),
  voice_language: z.string().optional(),
  voice_tone: z.string().optional(),
  elevenlabs_voice_id: z.string().optional(),
})

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user: _authUser } } = await supabase.auth.getUser()
  if (!_authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = _authUser.id

  const dbUser = await db.query.users.findFirst({ where: eq(users.clerk_id, userId) })
  if (!dbUser?.company_id) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  const body = await req.json()
  const parsed = RebuildSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { voice_language, voice_tone, elevenlabs_voice_id } = parsed.data

  // Persist voice config changes to DB if provided
  const updatePayload: Record<string, string> = {}
  if (voice_language) updatePayload.voice_language = voice_language
  if (voice_tone) updatePayload.voice_tone = voice_tone
  if (elevenlabs_voice_id !== undefined) updatePayload.elevenlabs_voice_id = elevenlabs_voice_id

  if (Object.keys(updatePayload).length > 0) {
    await db.update(companies)
      .set(updatePayload)
      .where(eq(companies.id, dbUser.company_id))
  }

  try {
    const result = await callN8n('/webhook/vapi/assistant/get', {
      company_id: dbUser.company_id,
      force_rebuild: true,
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[api/vapi/assistant POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
