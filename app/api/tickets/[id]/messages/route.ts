import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { tickets, messages } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

const bodySchema = z.object({
  content: z.string().min(1).max(10000),
})

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getCurrentUser()
  if (!user?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  // Verify ticket belongs to this company
  const ticket = await db.query.tickets.findFirst({
    where: and(eq(tickets.id, params.id), eq(tickets.company_id, user.company_id)),
  })
  if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const [message] = await db.insert(messages).values({
    ticket_id: params.id,
    company_id: user.company_id,
    sender_type: 'agent',
    sender_id: user.id,
    content: parsed.data.content,
  }).returning()

  // Update ticket status to in_progress if still open
  if (ticket.status === 'open') {
    await db.update(tickets).set({ status: 'in_progress', updated_at: new Date() }).where(eq(tickets.id, params.id))
  }

  return NextResponse.json(message, { status: 201 })
}
