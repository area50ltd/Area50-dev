import { z } from 'zod'
import { NextResponse } from 'next/server'
import { initializeTransaction } from '@/lib/paystack'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { payment_transactions, credit_packs, plans, companies } from '@/lib/schema'
import { eq } from 'drizzle-orm'

const Schema = z.object({
  pack_id: z.string().uuid(),
  type: z.enum(['plan', 'topup']),
})

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { pack_id, type } = parsed.data

  // Look up price and credits server-side — never trust client-submitted amounts
  let amount_kobo: number
  let credits: number
  let planKey: string | undefined
  let paystackPlanCode: string | undefined

  if (type === 'topup') {
    const pack = await db.query.credit_packs.findFirst({ where: eq(credit_packs.id, pack_id) })
    if (!pack || !pack.is_active) return NextResponse.json({ error: 'Invalid credit pack' }, { status: 400 })
    amount_kobo = pack.price_kobo
    credits = pack.credits
  } else {
    // Plan subscription
    const plan = await db.query.plans.findFirst({ where: eq(plans.id, pack_id) })
    if (!plan || !plan.is_active) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    if (!plan.paystack_plan_code) {
      return NextResponse.json(
        { error: 'This plan is not yet linked to a Paystack subscription. Contact support.' },
        { status: 400 },
      )
    }
    amount_kobo = plan.price_kobo
    credits = plan.credits
    planKey = plan.key
    paystackPlanCode = plan.paystack_plan_code

    // Prevent re-subscribing to the same active plan
    const company = await db.query.companies.findFirst({ where: eq(companies.id, user.company_id) })
    if (company?.plan === plan.key && company?.plan_status === 'active') {
      return NextResponse.json({ error: 'You are already on this plan.' }, { status: 409 })
    }
  }

  try {
    const result = await initializeTransaction({
      email: user.email,
      amount: amount_kobo,
      // Attach the Paystack plan_code — this creates the subscription automatically after payment
      ...(paystackPlanCode ? { plan: paystackPlanCode } : {}),
      metadata: {
        company_id: user.company_id,
        credits,
        type,
        plan_key: planKey ?? null,
        user_id: user.id,
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?payment=verify`,
    })

    if (result.status && result.data?.reference) {
      await db.insert(payment_transactions).values({
        company_id: user.company_id,
        paystack_reference: result.data.reference,
        amount_kobo,
        credits_purchased: credits,
        status: 'pending',
        payment_type: type,
        plan_key: planKey ?? null,
      })
    }

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment initialization failed'
    console.error('[api/payment/initialize]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
