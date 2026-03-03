import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { companies, payment_transactions } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getCurrentUser()
  if (!user?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const [company, payments] = await Promise.all([
    db.query.companies.findFirst({ where: eq(companies.id, user.company_id) }),
    db
      .select()
      .from(payment_transactions)
      .where(eq(payment_transactions.company_id, user.company_id))
      .orderBy(desc(payment_transactions.created_at))
      .limit(50),
  ])

  return NextResponse.json({
    plan: company?.plan ?? 'starter',
    credits: company?.credits ?? 0,
    payments,
  })
}
