import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { NextResponse } from 'next/server'
import { callN8n } from '@/lib/n8n'
import { deductCredits } from '@/lib/credits'

const Schema = z.object({
  company_id: z.string().uuid(),
  message: z.string().min(1).max(5000),
  session_id: z.string(),
  ticket_id: z.string().uuid(),
  channel: z.enum(['web_widget', 'whatsapp', 'voice_inbound']),
  language: z.string().default('en'),
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
    const result = await callN8n('/webhook/ai/chat', parsed.data)

    // Deduct 1 credit per AI message — fire after response, never blocks
    const deduct = await deductCredits({
      company_id: parsed.data.company_id,
      type: 'ai_message',
      amount: 1,
      reference: parsed.data.ticket_id,
    })

    return NextResponse.json({
      ...(result as object),
      credits_exhausted: deduct.insufficient,
    })
  } catch (err) {
    console.error('[api/chat]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
