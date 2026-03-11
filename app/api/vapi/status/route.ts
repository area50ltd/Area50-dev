import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
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

  const company = await db.query.companies.findFirst({ where: eq(companies.id, dbUser.company_id) })
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  return NextResponse.json({
    configured: !!company.vapi_assistant_id,
    phone_number: company.vapi_phone_number ?? null,
    assistant_id: company.vapi_assistant_id ?? null,
    voice_language: company.voice_language ?? null,
    voice_tone: company.voice_tone ?? null,
  })
}
