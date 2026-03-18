import { z } from 'zod'
import { NextResponse } from 'next/server'
import { verifyTransaction } from '@/lib/paystack'
import { db } from '@/lib/db'
import { payment_transactions, companies, credit_transactions } from '@/lib/schema'
import { and, eq, sql } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

const Schema = z.object({ reference: z.string() })

export async function POST(req: Request) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!currentUser.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { reference } = parsed.data

  try {
    // Idempotency: verify reference exists AND belongs to this company
    const existing = await db.query.payment_transactions.findFirst({
      where: and(
        eq(payment_transactions.paystack_reference, reference),
        eq(payment_transactions.company_id, currentUser.company_id),
      ),
    })

    if (!existing) return NextResponse.json({ error: 'Reference not found' }, { status: 404 })

    if (existing.status === 'success') {
      return NextResponse.json({ success: true, credits_added: existing.credits_purchased, already_processed: true })
    }

    const result = await verifyTransaction(reference)

    if (!result.status || result.data?.status !== 'success') {
      return NextResponse.json({ success: false, message: 'Payment not successful' })
    }

    // Use credits_purchased recorded server-side at initialization — never Paystack metadata
    const credits = existing.credits_purchased ?? 0

    await Promise.all([
      db
        .update(payment_transactions)
        .set({ status: 'success' })
        .where(eq(payment_transactions.paystack_reference, reference)),

      db
        .update(companies)
        .set({ credits: sql`credits + ${credits}` })
        .where(eq(companies.id, currentUser.company_id)),

      credits > 0
        ? db.insert(credit_transactions).values({
            company_id: currentUser.company_id,
            type: 'top_up',
            amount: credits,
            reference,
            description: `Paystack top-up — ${credits.toLocaleString()} credits`,
          })
        : Promise.resolve(),
    ])

    return NextResponse.json({ success: true, credits_added: credits })
  } catch (err) {
    console.error('[api/payment/verify]', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
