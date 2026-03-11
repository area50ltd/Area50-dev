import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { credit_transactions } from '@/lib/schema'
import { eq, and, lt, gte, sql } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  // Start of current month in UTC
  const startOfMonth = new Date()
  startOfMonth.setUTCDate(1)
  startOfMonth.setUTCHours(0, 0, 0, 0)

  // Usage breakdown by type for current month (deductions only: amount < 0)
  const rows = await db
    .select({
      type: credit_transactions.type,
      transactions: sql<number>`cast(count(*) as int)`,
      credits_used: sql<number>`cast(sum(abs(${credit_transactions.amount})) as int)`,
    })
    .from(credit_transactions)
    .where(
      and(
        eq(credit_transactions.company_id, currentUser.company_id),
        lt(credit_transactions.amount, 0),
        gte(credit_transactions.created_at, startOfMonth),
      ),
    )
    .groupBy(credit_transactions.type)

  const total_used = rows.reduce((acc, r) => acc + (r.credits_used ?? 0), 0)

  return NextResponse.json({ rows, total_used })
}
