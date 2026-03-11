import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { callN8n } from '@/lib/n8n'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

const Schema = z.object({
  ticket_id: z.string().uuid(),
  session_id: z.string().min(1),
  agent_message: z.string().optional(),
})

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user: _authUser } } = await supabase.auth.getUser()
  if (!_authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await db.query.users.findFirst({ where: eq(users.clerk_id, _authUser.id) })
  if (!dbUser?.company_id) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    const result = await callN8n('/webhook/ai/suggest', {
      company_id: dbUser.company_id,
      ticket_id: parsed.data.ticket_id,
      session_id: parsed.data.session_id,
      ...(parsed.data.agent_message ? { agent_message: parsed.data.agent_message } : {}),
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[api/suggest]', err)
    return NextResponse.json({ error: 'Failed to get suggestion' }, { status: 500 })
  }
}
