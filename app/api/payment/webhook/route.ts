import { NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/paystack'
import { db } from '@/lib/db'
import { payment_transactions, companies, credit_transactions } from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('x-paystack-signature') ?? ''

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body)

  if (event.event === 'charge.success') {
    const { reference, metadata } = event.data
    const credits: number = metadata?.credits ?? 0
    const companyId: string | undefined = metadata?.company_id

    if (!companyId || credits <= 0) {
      return NextResponse.json({ received: true })
    }

    // Idempotency: skip if already processed
    const existing = await db.query.payment_transactions.findFirst({
      where: eq(payment_transactions.paystack_reference, reference),
    })

    if (existing?.status === 'success') {
      return NextResponse.json({ received: true })
    }

    await Promise.all([
      db
        .update(payment_transactions)
        .set({ status: 'success' })
        .where(eq(payment_transactions.paystack_reference, reference)),

      db
        .update(companies)
        .set({ credits: sql`credits + ${credits}` })
        .where(eq(companies.id, companyId)),

      db.insert(credit_transactions).values({
        company_id: companyId,
        type: 'top_up',
        amount: credits,
        reference,
        description: `Paystack webhook — ${credits.toLocaleString()} credits`,
      }),
    ])
  }

  return NextResponse.json({ received: true })
}
