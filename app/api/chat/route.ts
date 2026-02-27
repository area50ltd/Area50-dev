import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { NextResponse } from 'next/server'
import { callN8n } from '@/lib/n8n'

const Schema = z.object({
  company_id: z.string().uuid(),
  message: z.string().min(1).max(5000),
  session_id: z.string(),
  ticket_id: z.string().uuid(),
  channel: z.enum(['web_widget', 'whatsapp', 'voice_inbound']),
  language: z.string().default('en'),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    const result = await callN8n('/webhook/ai/chat', parsed.data)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[api/chat]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
