import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { callN8n } from '@/lib/n8n'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.query.users.findFirst({ where: eq(users.clerk_id, userId) })
  if (!user?.company_id) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  try {
    const result = await callN8n('/webhook/vapi/assistant/get', {
      company_id: user.company_id,
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[api/vapi/assistant]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
