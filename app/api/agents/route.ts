import { NextResponse } from 'next/server'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { db } from '@/lib/db'
import { agents, users, companies, plans } from '@/lib/schema'
import { eq, count } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'
import { limitsFromDbRow, getPlanLimits, withinLimit } from '@/lib/plan-limits'

export async function GET() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const rows = await db
    .select({ agent: agents, user: users })
    .from(agents)
    .leftJoin(users, eq(agents.user_id, users.id))
    .where(eq(agents.company_id, currentUser.company_id))

  return NextResponse.json(rows)
}

const createSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  max_concurrent_chats: z.number().int().min(1).max(20).default(3),
  specializations: z.array(z.string()).default([]),
})

export async function POST(req: Request) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { name, email, max_concurrent_chats, specializations } = parsed.data

  // ── Plan limit: max_agents ───────────────────────────────────────────────────
  const [company, agentCountResult] = await Promise.all([
    db.query.companies.findFirst({ where: eq(companies.id, currentUser.company_id) }),
    db.select({ count: count() }).from(agents).where(eq(agents.company_id, currentUser.company_id)),
  ])
  const planRow = company?.plan
    ? await db.query.plans.findFirst({ where: eq(plans.key, company.plan) })
    : null
  const limits = planRow ? limitsFromDbRow({ ...planRow }) : getPlanLimits(company?.plan ?? 'starter')
  const agentCount = agentCountResult[0]?.count ?? 0
  if (!withinLimit(agentCount, limits.max_agents)) {
    return NextResponse.json(
      { error: 'Agent seat limit reached for your plan.', upgrade_required: true, required_plan: 'growth' },
      { status: 403 },
    )
  }

  // Check if email already exists
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) })
  if (existing) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })

  // Create user with agent role
  const [newUser] = await db.insert(users).values({
    clerk_id: `agent_${randomUUID()}`,
    company_id: currentUser.company_id,
    name,
    email,
    role: 'agent',
    is_active: true,
  }).returning()

  // Create agent record — try with specializations, fall back without if column missing
  let newAgent
  try {
    ;[newAgent] = await db.insert(agents).values({
      user_id: newUser.id,
      company_id: currentUser.company_id,
      status: 'offline',
      max_concurrent_chats,
      specializations,
    }).returning()
  } catch {
    ;[newAgent] = await db.insert(agents).values({
      user_id: newUser.id,
      company_id: currentUser.company_id,
      status: 'offline',
      max_concurrent_chats,
    }).returning()
  }

  return NextResponse.json({ agent: newAgent, user: newUser }, { status: 201 })
}
