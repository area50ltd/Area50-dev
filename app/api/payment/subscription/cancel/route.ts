import { NextResponse } from 'next/server'
import { getSubscription, disableSubscription } from '@/lib/paystack'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { companies } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const company = await db.query.companies.findFirst({
    where: eq(companies.id, user.company_id),
  })

  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  if (!company.paystack_subscription_code) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
  }

  if (company.plan_status === 'cancelled') {
    return NextResponse.json({ error: 'Subscription already cancelled' }, { status: 409 })
  }

  try {
    // Fetch the subscription to get the email_token (required for Paystack disable)
    const sub = await getSubscription(company.paystack_subscription_code)
    if (!sub.status || !sub.data?.email_token) {
      return NextResponse.json(
        { error: 'Could not retrieve subscription details from Paystack' },
        { status: 502 },
      )
    }

    await disableSubscription({
      code: company.paystack_subscription_code,
      token: sub.data.email_token,
    })

    // Mark cancelled in DB — the subscription.disable webhook will also fire but this makes it instant
    await db.update(companies)
      .set({ plan_status: 'cancelled' })
      .where(eq(companies.id, user.company_id))

    return NextResponse.json({ success: true, message: 'Subscription cancelled. Your plan remains active until the current period ends.' })
  } catch (err) {
    console.error('[api/payment/subscription/cancel]', err)
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
  }
}
