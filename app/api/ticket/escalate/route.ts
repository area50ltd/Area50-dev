import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { NextResponse } from 'next/server'
import { callN8n } from '@/lib/n8n'

const Schema = z.object({
  ticket_id: z.string().uuid(),
  company_id: z.string().uuid(),
  score: z.number().min(0).max(10),
  reason: z.string().optional(),
  category: z.string().optional(),
  sentiment: z.string().optional(),
})

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user: _authUser } } = await supabase.auth.getUser()
  if (!_authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = _authUser.id

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    const result = await callN8n('/webhook/ticket/escalate', parsed.data)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[api/ticket/escalate]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
