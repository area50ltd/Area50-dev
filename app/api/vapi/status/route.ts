import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, companies } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.query.users.findFirst({ where: eq(users.clerk_id, userId) })
  if (!user?.company_id) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  const company = await db.query.companies.findFirst({ where: eq(companies.id, user.company_id) })
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  return NextResponse.json({
    configured: !!company.vapi_assistant_id,
    phone_number: company.vapi_phone_number ?? null,
    assistant_id: company.vapi_assistant_id ?? null,
    voice_language: company.voice_language ?? null,
    voice_tone: company.voice_tone ?? null,
  })
}
