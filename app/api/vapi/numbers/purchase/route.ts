import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users, companies } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { purchaseVapiNativeNumber, registerTwilioNumber, VapiError } from '@/lib/vapi'
import { purchaseNumber, TwilioError } from '@/lib/twilio'

const Schema = z.object({
  phone_number: z.string().min(7, 'Invalid phone number'),
  // 'vapi' = Vapi-native provider (default), 'twilio' = BYO Twilio
  provider: z.enum(['vapi', 'twilio']).default('vapi'),
})

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user: _authUser } } = await supabase.auth.getUser()
  if (!_authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await db.query.users.findFirst({ where: eq(users.clerk_id, _authUser.id) })
  if (!dbUser?.company_id) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const company = await db.query.companies.findFirst({ where: eq(companies.id, dbUser.company_id) })
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  if (company.vapi_phone_number) {
    return NextResponse.json(
      { error: 'Your account already has a phone number. Release the current number first.' },
      { status: 409 },
    )
  }

  if (!company.vapi_assistant_id || company.vapi_assistant_id === 'null') {
    return NextResponse.json(
      { error: 'AI assistant must be configured before purchasing a phone number.' },
      { status: 422 },
    )
  }

  const { phone_number, provider } = parsed.data
  const numberName = `${company.name} Main Line`

  // ── Path A: Vapi-native (preferred) ───────────────────────────────────────
  if (provider === 'vapi') {
    try {
      const vapiNumber = await purchaseVapiNativeNumber({
        number: phone_number,
        name: numberName,
        assistantId: company.vapi_assistant_id,
      })
      await db.update(companies)
        .set({ vapi_phone_number: phone_number, vapi_phone_number_id: vapiNumber.id })
        .where(eq(companies.id, dbUser.company_id))
      return NextResponse.json({ success: true, phone_number, provider: 'vapi' })
    } catch (err) {
      console.error('[api/vapi/numbers/purchase] Vapi-native purchase failed, falling back to Twilio:', err)
      // Fall through to Twilio path
    }
  }

  // ── Path B: Twilio (fallback or explicit) ─────────────────────────────────
  let purchased
  try {
    purchased = await purchaseNumber(phone_number)
  } catch (err) {
    console.error('[api/vapi/numbers/purchase] Twilio purchase failed:', err)
    if (err instanceof TwilioError) {
      if (err.code === 'not_configured') {
        return NextResponse.json(
          { error: 'Phone number purchasing is not available. Please contact support.' },
          { status: 503 },
        )
      }
      return NextResponse.json({ error: err.message || 'Failed to purchase phone number.' }, { status: 502 })
    }
    return NextResponse.json({ error: 'Failed to purchase phone number. Please try again.' }, { status: 500 })
  }

  // Register the Twilio-purchased number with Vapi
  const serverUrl = `${process.env.N8N_WEBHOOK_BASE_URL}/webhook/vapi/inbound`
  let vapiNumber
  try {
    vapiNumber = await registerTwilioNumber({
      number: purchased.phone_number,
      name: numberName,
      assistantId: company.vapi_assistant_id,
      serverUrl,
    })
  } catch (err) {
    console.error('[api/vapi/numbers/purchase] Vapi registration failed:', err)
    // Number purchased in Twilio but Vapi registration failed — save anyway
    await db.update(companies)
      .set({ vapi_phone_number: purchased.phone_number, vapi_phone_number_id: null })
      .where(eq(companies.id, dbUser.company_id))
    if (err instanceof VapiError) {
      return NextResponse.json({
        success: true,
        phone_number: purchased.phone_number,
        provider: 'twilio',
        warning: 'Number purchased but AI assistant connection failed. Please contact support.',
      })
    }
    return NextResponse.json({
      success: true,
      phone_number: purchased.phone_number,
      provider: 'twilio',
      warning: 'Number purchased but AI setup incomplete. Please contact support.',
    })
  }

  await db.update(companies)
    .set({ vapi_phone_number: purchased.phone_number, vapi_phone_number_id: vapiNumber.id })
    .where(eq(companies.id, dbUser.company_id))

  return NextResponse.json({ success: true, phone_number: purchased.phone_number, provider: 'twilio' })
}
