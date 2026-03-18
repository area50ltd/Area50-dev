import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { companies, payment_transactions, plans, credit_packs } from '@/lib/schema'
import { eq, desc, asc } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const [company, payments, dbPlans, dbPacks] = await Promise.all([
    db.query.companies.findFirst({ where: eq(companies.id, currentUser.company_id) }),
    db
      .select()
      .from(payment_transactions)
      .where(eq(payment_transactions.company_id, currentUser.company_id))
      .orderBy(desc(payment_transactions.created_at))
      .limit(50),
    db.select().from(plans).where(eq(plans.is_active, true)).orderBy(asc(plans.sort_order)),
    db.select().from(credit_packs).where(eq(credit_packs.is_active, true)).orderBy(asc(credit_packs.sort_order)),
  ])

  return NextResponse.json({
    plan: company?.plan ?? 'starter',
    plan_status: company?.plan_status ?? 'free',
    plan_expires_at: company?.plan_expires_at ?? null,
    credits: company?.credits ?? 0,
    payments,
    plans: dbPlans,
    credit_packs: dbPacks,
  })
}
