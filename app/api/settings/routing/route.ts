import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { routing_rules } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getCurrentUser()
  if (!user?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const rule = await db.query.routing_rules.findFirst({
    where: eq(routing_rules.company_id, user.company_id),
  })

  return NextResponse.json(rule ?? null)
}

const updateSchema = z.object({
  complexity_threshold: z.number().int().min(1).max(10).optional(),
  business_hours_start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  business_hours_end: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  timezone: z.string().max(50).optional(),
  after_hours_mode: z.enum(['ai_only', 'voicemail', 'offline']).optional(),
  max_ai_attempts: z.number().int().min(1).max(10).optional(),
  keywords_escalate: z.array(z.string()).optional(),
  after_hours_agent_available: z.boolean().optional(),
  after_hours_message: z.string().optional(),
})

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getCurrentUser()
  if (!user?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const [updated] = await db
    .update(routing_rules)
    .set(parsed.data)
    .where(eq(routing_rules.company_id, user.company_id))
    .returning()

  return NextResponse.json(updated)
}
