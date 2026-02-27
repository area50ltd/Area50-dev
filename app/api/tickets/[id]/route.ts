import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { tickets, messages } from '@/lib/schema'
import { eq, and, asc } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getCurrentUser()
  if (!user?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const ticket = await db.query.tickets.findFirst({
    where: and(eq(tickets.id, params.id), eq(tickets.company_id, user.company_id)),
  })

  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const msgs = await db
    .select()
    .from(messages)
    .where(and(eq(messages.ticket_id, params.id), eq(messages.company_id, user.company_id)))
    .orderBy(asc(messages.created_at))

  return NextResponse.json({ ticket, messages: msgs })
}

const UpdateSchema = z.object({
  status: z.enum(['open', 'in_progress', 'escalated', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  agent_id: z.string().uuid().nullable().optional(),
  assigned_to: z.string().optional(),
})

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getCurrentUser()
  if (!user?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const body = await req.json()
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const updates: Record<string, unknown> = { ...parsed.data, updated_at: new Date() }
  if (parsed.data.status === 'resolved') {
    updates.is_resolved = true
    updates.resolved_at = new Date()
  }

  await db
    .update(tickets)
    .set(updates)
    .where(and(eq(tickets.id, params.id), eq(tickets.company_id, user.company_id)))

  return NextResponse.json({ success: true })
}
