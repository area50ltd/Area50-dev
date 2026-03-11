import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { tickets, users } from '@/lib/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: Request) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const assigned_to = searchParams.get('assigned_to')
  const search = searchParams.get('search')

  const conditions = [eq(tickets.company_id, currentUser.company_id)]

  if (status && status !== 'all') conditions.push(eq(tickets.status, status))
  if (priority) conditions.push(eq(tickets.priority, priority))
  if (assigned_to) conditions.push(eq(tickets.assigned_to, assigned_to))

  const rows = await db
    .select()
    .from(tickets)
    .where(and(...conditions))
    .orderBy(desc(tickets.created_at))
    .limit(100)

  // Simple search filter post-query (category/session_id)
  const filtered = search
    ? rows.filter(
        (t) =>
          t.category?.toLowerCase().includes(search.toLowerCase()) ||
          t.session_id?.toLowerCase().includes(search.toLowerCase()) ||
          t.id.toLowerCase().includes(search.toLowerCase())
      )
    : rows

  return NextResponse.json(filtered)
}

const CreateSchema = z.object({
  channel: z.enum(['web_widget', 'whatsapp', 'voice_inbound']).default('web_widget'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  category: z.string().max(100).optional(),
  language: z.string().max(10).default('en'),
})

export async function POST(req: Request) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const body = await req.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    const [ticket] = await db
      .insert(tickets)
      .values({
        company_id: currentUser.company_id,
        channel: parsed.data.channel,
        priority: parsed.data.priority,
        category: parsed.data.category,
        language: parsed.data.language,
        status: 'open',
        assigned_to: 'ai',
      })
      .returning()

    return NextResponse.json(ticket, { status: 201 })
  } catch (err) {
    console.error('[api/tickets POST]', err)
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}
