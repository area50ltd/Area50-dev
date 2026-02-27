import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { NextResponse } from 'next/server'
import { verifyTransaction } from '@/lib/paystack'
import { db } from '@/lib/db'
import { payment_transactions, companies } from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

const Schema = z.object({ reference: z.string() })

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getCurrentUser()
  if (!user?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    const result = await verifyTransaction(parsed.data.reference)

    if (result.status && result.data.status === 'success') {
      const meta = result.data.metadata
      const credits = meta?.credits ?? 0

      // Update payment transaction
      await db
        .update(payment_transactions)
        .set({ status: 'success' })
        .where(eq(payment_transactions.paystack_reference, parsed.data.reference))

      // Add credits to company
      await db
        .update(companies)
        .set({ credits: sql`credits + ${credits}` })
        .where(eq(companies.id, user.company_id))

      return NextResponse.json({ success: true, credits_added: credits })
    }

    return NextResponse.json({ success: false, message: 'Payment not successful' })
  } catch (err) {
    console.error('[api/payment/verify]', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
