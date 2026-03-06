import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { payment_transactions, companies } from '@/lib/schema'
import { requireRole } from '@/lib/auth'
import { eq, desc, and, ilike, sql } from 'drizzle-orm'

export async function GET(req: Request) {
  try {
    await requireRole('super_admin')
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const companySearch = searchParams.get('company') ?? ''
  const status = searchParams.get('status') ?? ''
  const limit = 25
  const offset = (page - 1) * limit

  // Build conditions
  const conditions = []
  if (status && ['success', 'pending', 'failed'].includes(status)) {
    conditions.push(eq(payment_transactions.status, status))
  }

  // Join with companies
  const baseQuery = db
    .select({
      id: payment_transactions.id,
      paystack_reference: payment_transactions.paystack_reference,
      amount_kobo: payment_transactions.amount_kobo,
      credits_purchased: payment_transactions.credits_purchased,
      status: payment_transactions.status,
      created_at: payment_transactions.created_at,
      company_id: payment_transactions.company_id,
      company_name: companies.name,
    })
    .from(payment_transactions)
    .leftJoin(companies, eq(payment_transactions.company_id, companies.id))

  const whereConditions = [...conditions]
  if (companySearch) {
    whereConditions.push(ilike(companies.name, `%${companySearch}%`))
  }

  const rows = await baseQuery
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .orderBy(desc(payment_transactions.created_at))
    .limit(limit)
    .offset(offset)

  const [{ total }] = await db
    .select({ total: sql<number>`cast(count(*) as int)` })
    .from(payment_transactions)
    .leftJoin(companies, eq(payment_transactions.company_id, companies.id))
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)

  // Summary stats
  const [stats] = await db
    .select({
      total_revenue: sql<number>`cast(coalesce(sum(case when ${payment_transactions.status} = 'success' then ${payment_transactions.amount_kobo} else 0 end), 0) as int)`,
      success_count: sql<number>`cast(count(case when ${payment_transactions.status} = 'success' then 1 end) as int)`,
      pending_count: sql<number>`cast(count(case when ${payment_transactions.status} = 'pending' then 1 end) as int)`,
      failed_count: sql<number>`cast(count(case when ${payment_transactions.status} = 'failed' then 1 end) as int)`,
    })
    .from(payment_transactions)

  return NextResponse.json({
    transactions: rows,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    stats,
  })
}
