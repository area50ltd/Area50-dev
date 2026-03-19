import { z } from 'zod'
import { NextResponse } from 'next/server'
import { verifyTransaction } from '@/lib/paystack'
import { db } from '@/lib/db'
import { payment_transactions, companies, credit_transactions, plans } from '@/lib/schema'
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
      return NextResponse.json({
        success: true,
        credits_added: existing.credits_purchased,
        already_processed: true,
      })
    }

    const result = await verifyTransaction(reference)
    if (!result.status || result.data?.status !== 'success') {
      // Mark transaction as failed so it doesn't block future attempts
      await db.update(payment_transactions)
        .set({ status: 'failed' })
        .where(eq(payment_transactions.paystack_reference, reference))
      return NextResponse.json({
        success: false,
        message: result.data?.gateway_response ?? 'Payment was not completed. You can try again.',
      })
    }

    const credits = existing.credits_purchased ?? 0
    const isPlan = existing.payment_type === 'plan'
    const planKey = existing.plan_key

    // Extract subscription_code from Paystack response (present when a plan was attached)
    const subscriptionCode: string | undefined = result.data?.subscription?.subscription_code
      ?? result.data?.subscription_code
      ?? undefined

    // Extract customer_code and authorization_code for future use
    const customerCode: string | undefined = result.data?.customer?.customer_code
    const authorizationCode: string | undefined = result.data?.authorization?.authorization_code

    if (isPlan && planKey) {
      // ── Plan activation ──
      // Look up plan for credits amount (always use DB value, not metadata)
      const planRow = await db.query.plans.findFirst({ where: eq(plans.key, planKey) })
      const planCredits = planRow?.credits ?? credits
      const now = new Date()
      const expiresAt = new Date(now)
      expiresAt.setDate(expiresAt.getDate() + 30)

      await Promise.all([
        // Mark payment as success, save subscription_code
        db.update(payment_transactions)
          .set({ status: 'success', subscription_code: subscriptionCode ?? null })
          .where(eq(payment_transactions.paystack_reference, reference)),

        // Update company: SET credits to plan amount (not additive), activate plan
        db.update(companies)
          .set({
            plan: planKey,
            plan_status: 'active',
            plan_started_at: now,
            plan_expires_at: expiresAt,
            credits: planCredits,
            ...(subscriptionCode ? { paystack_subscription_code: subscriptionCode } : {}),
            ...(customerCode ? { paystack_customer_code: customerCode } : {}),
            ...(authorizationCode ? { paystack_authorization_code: authorizationCode } : {}),
          })
          .where(eq(companies.id, currentUser.company_id)),

        // Log as plan activation
        db.insert(credit_transactions).values({
          company_id: currentUser.company_id,
          type: 'top_up',
          amount: planCredits,
          reference,
          description: `Plan activated — ${planKey} (${planCredits.toLocaleString()} credits)`,
        }),
      ])

      return NextResponse.json({ success: true, credits_added: planCredits, plan_activated: planKey })
    } else {
      // ── Credit top-up (original flow) ──
      await Promise.all([
        db.update(payment_transactions)
          .set({ status: 'success' })
          .where(eq(payment_transactions.paystack_reference, reference)),

        db.update(companies)
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
    }
  } catch (err) {
    console.error('[api/payment/verify]', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
