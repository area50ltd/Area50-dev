import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { NextResponse } from 'next/server'
import { initializeTransaction } from '@/lib/paystack'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { payment_transactions } from '@/lib/schema'

const Schema = z.object({
  amount_kobo: z.number().int().positive(),
  credits: z.number().int().positive(),
  type: z.enum(['plan', 'topup']),
})

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getCurrentUser()
  if (!user?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    const result = await initializeTransaction({
      email: user.email,
      amount: parsed.data.amount_kobo,
      metadata: {
        company_id: user.company_id,
        credits: parsed.data.credits,
        type: parsed.data.type,
        user_id: user.id,
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?payment=verify`,
    })

    if (result.status) {
      // Save pending transaction
      await db.insert(payment_transactions).values({
        company_id: user.company_id,
        paystack_reference: result.data.reference,
        amount_kobo: parsed.data.amount_kobo,
        credits_purchased: parsed.data.credits,
        status: 'pending',
      })
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[api/payment/initialize]', err)
    return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 })
  }
}
