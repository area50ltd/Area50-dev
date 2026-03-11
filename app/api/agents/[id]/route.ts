import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { agents, users } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

const updateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  max_concurrent_chats: z.number().int().min(1).max(20).optional(),
  specializations: z.array(z.string()).optional(),
})

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // Verify agent belongs to this company
  const existing = await db.query.agents.findFirst({
    where: and(eq(agents.id, params.id), eq(agents.company_id, currentUser.company_id)),
  })
  if (!existing) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  const { name, max_concurrent_chats, specializations } = parsed.data

  // Update agent record
  const agentUpdates: Record<string, unknown> = {}
  if (max_concurrent_chats !== undefined) agentUpdates.max_concurrent_chats = max_concurrent_chats
  if (specializations !== undefined) agentUpdates.specializations = specializations

  if (Object.keys(agentUpdates).length > 0) {
    await db.update(agents).set(agentUpdates).where(eq(agents.id, params.id))
  }

  // Update user name if provided
  if (name !== undefined && existing.user_id) {
    await db.update(users).set({ name }).where(eq(users.id, existing.user_id))
  }

  const [updated] = await db
    .select({ agent: agents, user: users })
    .from(agents)
    .leftJoin(users, eq(agents.user_id, users.id))
    .where(eq(agents.id, params.id))

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  // Verify agent belongs to this company
  const existing = await db.query.agents.findFirst({
    where: and(eq(agents.id, params.id), eq(agents.company_id, currentUser.company_id)),
  })
  if (!existing) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  // Delete agent first (FK constraint)
  await db.delete(agents).where(eq(agents.id, params.id))

  // Deactivate the user (don't delete — preserve ticket history)
  if (existing.user_id) {
    await db.update(users).set({ is_active: false }).where(eq(users.id, existing.user_id))
  }

  return NextResponse.json({ success: true })
}
