import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { callN8n } from '@/lib/n8n'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

const Schema = z.object({
  customer_phone: z.string().min(7),
  ticket_id: z.string().uuid(),
})

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user: _authUser } } = await supabase.auth.getUser()
  if (!_authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = _authUser.id

  const dbUser = await db.query.users.findFirst({ where: eq(users.clerk_id, userId) })
  if (!dbUser?.company_id) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    const result = await callN8n('/webhook/vapi/outbound', {
      company_id: dbUser.company_id,
      ...parsed.data,
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[api/vapi/outbound]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
