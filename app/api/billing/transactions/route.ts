import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { credit_transactions } from '@/lib/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: Request) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = 20
  const offset = (page - 1) * limit

  const typeFilter = searchParams.get('type') // optional

  const whereClause = typeFilter
    ? and(
        eq(credit_transactions.company_id, currentUser.company_id),
        eq(credit_transactions.type, typeFilter),
      )
    : eq(credit_transactions.company_id, currentUser.company_id)

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(credit_transactions)
      .where(whereClause)
      .orderBy(desc(credit_transactions.created_at))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(credit_transactions)
      .where(whereClause),
  ])

  const total = countResult[0]?.count ?? 0

  return NextResponse.json({
    transactions: rows,
    total,
    page,
    pages: Math.ceil(total / limit),
  })
}
