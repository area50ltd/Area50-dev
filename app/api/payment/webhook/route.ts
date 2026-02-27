import { NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/paystack'
import { db } from '@/lib/db'
import { payment_transactions, companies } from '@/lib/schema'
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
    const credits = metadata?.credits ?? 0
    const companyId = metadata?.company_id

    if (companyId && credits > 0) {
      await db
        .update(payment_transactions)
        .set({ status: 'success' })
        .where(eq(payment_transactions.paystack_reference, reference))

      await db
        .update(companies)
        .set({ credits: sql`credits + ${credits}` })
        .where(eq(companies.id, companyId))
    }
  }

  return NextResponse.json({ received: true })
}
