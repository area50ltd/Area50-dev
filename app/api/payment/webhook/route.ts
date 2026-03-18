/**
 * Paystack webhook handler.
 *
 * Events handled:
 *   charge.success          — initial plan payment OR recurring renewal OR top-up
 *   subscription.create     — save subscription_code + email_token
 *   subscription.disable    — subscription cancelled → downgrade to starter
 *   invoice.payment_failed  — renewal failed → mark plan as past_due
 */
import { NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/paystack'
import { db } from '@/lib/db'
import { payment_transactions, companies, credit_transactions, plans } from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('x-paystack-signature') ?? ''

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body)

  // ── charge.success ───────────────────────────────────────────────────────────
  if (event.event === 'charge.success') {
    const { reference, metadata, subscription_code: subCode } = event.data
    const companyIdFromMeta: string | undefined = metadata?.company_id
    const typeFromMeta: string | undefined = metadata?.type
    const planKeyFromMeta: string | undefined = metadata?.plan_key ?? undefined

    // Idempotency guard
    const existing = await db.query.payment_transactions.findFirst({
      where: eq(payment_transactions.paystack_reference, reference),
    })
    if (existing?.status === 'success') {
      return NextResponse.json({ received: true })
    }

    if (subCode && !companyIdFromMeta) {
      // ── Recurring plan renewal (no metadata — Paystack auto-charge) ─────────
      // Look up company by subscription_code
      const company = await db.query.companies.findFirst({
        where: eq(companies.paystack_subscription_code, subCode),
      })
      if (!company) return NextResponse.json({ received: true })

      // Look up plan to know how many credits to reset to
      const planRow = await db.query.plans.findFirst({
        where: eq(plans.key, company.plan ?? 'starter'),
      })
      const renewalCredits = planRow?.credits ?? 0

      const now = new Date()
      const expiresAt = new Date(now)
      expiresAt.setDate(expiresAt.getDate() + 30)

      // Check if there's a pending payment_transaction for this reference
      if (!existing) {
        await db.insert(payment_transactions).values({
          company_id: company.id,
          paystack_reference: reference,
          amount_kobo: event.data.amount ?? 0,
          credits_purchased: renewalCredits,
          status: 'success',
          payment_type: 'plan_renewal',
          plan_key: company.plan,
          subscription_code: subCode,
        })
      } else {
        await db.update(payment_transactions)
          .set({ status: 'success', subscription_code: subCode })
          .where(eq(payment_transactions.paystack_reference, reference))
      }

      await Promise.all([
        // Reset credits to plan amount (SET, not add)
        db.update(companies)
          .set({
            credits: renewalCredits,
            plan_status: 'active',
            plan_expires_at: expiresAt,
          })
          .where(eq(companies.id, company.id)),

        db.insert(credit_transactions).values({
          company_id: company.id,
          type: 'top_up',
          amount: renewalCredits,
          reference,
          description: `Monthly renewal — ${company.plan} (${renewalCredits.toLocaleString()} credits reset)`,
        }),
      ])

      return NextResponse.json({ received: true })
    }

    if (companyIdFromMeta && typeFromMeta === 'plan' && planKeyFromMeta) {
      // ── Initial plan payment (handled by /verify on redirect, webhook is belt-and-suspenders) ──
      // Only run if verify route hasn't already processed this
      if (existing && existing.status === 'pending') {
        const planRow = await db.query.plans.findFirst({ where: eq(plans.key, planKeyFromMeta) })
        const planCredits = planRow?.credits ?? (metadata?.credits ?? 0)
        const now = new Date()
        const expiresAt = new Date(now)
        expiresAt.setDate(expiresAt.getDate() + 30)

        await Promise.all([
          db.update(payment_transactions)
            .set({ status: 'success', subscription_code: subCode ?? null })
            .where(eq(payment_transactions.paystack_reference, reference)),

          db.update(companies)
            .set({
              plan: planKeyFromMeta,
              plan_status: 'active',
              plan_started_at: now,
              plan_expires_at: expiresAt,
              credits: planCredits,
              ...(subCode ? { paystack_subscription_code: subCode } : {}),
              ...(event.data.customer?.customer_code
                ? { paystack_customer_code: event.data.customer.customer_code }
                : {}),
              ...(event.data.authorization?.authorization_code
                ? { paystack_authorization_code: event.data.authorization.authorization_code }
                : {}),
            })
            .where(eq(companies.id, companyIdFromMeta)),
        ])
      }
      return NextResponse.json({ received: true })
    }

    // ── Regular top-up ────────────────────────────────────────────────────────
    const credits: number = metadata?.credits ?? 0
    if (companyIdFromMeta && credits > 0 && typeFromMeta === 'topup') {
      await Promise.all([
        db.update(payment_transactions)
          .set({ status: 'success' })
          .where(eq(payment_transactions.paystack_reference, reference)),

        db.update(companies)
          .set({ credits: sql`credits + ${credits}` })
          .where(eq(companies.id, companyIdFromMeta)),

        db.insert(credit_transactions).values({
          company_id: companyIdFromMeta,
          type: 'top_up',
          amount: credits,
          reference,
          description: `Paystack top-up — ${credits.toLocaleString()} credits`,
        }),
      ])
    }
  }

  // ── subscription.create ──────────────────────────────────────────────────────
  if (event.event === 'subscription.create') {
    const { subscription_code, email_token, customer, plan: planObj } = event.data
    if (!subscription_code || !customer?.email) return NextResponse.json({ received: true })

    // Find company by customer email and save subscription_code + email_token
    const company = await db.query.companies.findFirst({
      where: eq(companies.email, customer.email),
    })
    if (company) {
      await db.update(companies)
        .set({
          paystack_subscription_code: subscription_code,
          // Store email_token in authorization_code field for cancellation use
          paystack_authorization_code: email_token ?? company.paystack_authorization_code,
          plan_status: 'active',
        })
        .where(eq(companies.id, company.id))
    }
  }

  // ── subscription.disable ─────────────────────────────────────────────────────
  if (event.event === 'subscription.disable') {
    const { subscription_code } = event.data
    if (!subscription_code) return NextResponse.json({ received: true })

    const company = await db.query.companies.findFirst({
      where: eq(companies.paystack_subscription_code, subscription_code),
    })
    if (company) {
      await db.update(companies)
        .set({ plan_status: 'cancelled' })
        .where(eq(companies.id, company.id))
    }
  }

  // ── invoice.payment_failed ───────────────────────────────────────────────────
  if (event.event === 'invoice.payment_failed') {
    const { subscription } = event.data
    const subCode = subscription?.subscription_code
    if (!subCode) return NextResponse.json({ received: true })

    const company = await db.query.companies.findFirst({
      where: eq(companies.paystack_subscription_code, subCode),
    })
    if (company) {
      await db.update(companies)
        .set({ plan_status: 'past_due' })
        .where(eq(companies.id, company.id))
    }
  }

  return NextResponse.json({ received: true })
}
