import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { companies, plans, agents, knowledge_documents } from '@/lib/schema'
import { eq, count } from 'drizzle-orm'
import { limitsFromDbRow, getPlanLimits } from '@/lib/plan-limits'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const [company, agentCountResult, kbCountResult] = await Promise.all([
    db.query.companies.findFirst({ where: eq(companies.id, user.company_id) }),
    db.select({ count: count() }).from(agents).where(eq(agents.company_id, user.company_id)),
    db.select({ count: count() }).from(knowledge_documents).where(eq(knowledge_documents.company_id, user.company_id)),
  ])

  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  const planKey = company.plan ?? 'starter'
  const agentCount = agentCountResult[0]?.count ?? 0
  const kbCount = kbCountResult[0]?.count ?? 0

  // Try to get limits from DB plan row; fall back to hardcoded map
  const planRow = await db.query.plans.findFirst({ where: eq(plans.key, planKey) })
  const limits = planRow ? limitsFromDbRow({ ...planRow }) : getPlanLimits(planKey)

  return NextResponse.json({
    plan: planKey,
    plan_status: company.plan_status ?? 'free',
    plan_expires_at: company.plan_expires_at ?? null,
    limits,
    usage: {
      agents: agentCount,
      kb_docs: kbCount,
    },
  })
}
