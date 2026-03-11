import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users, companies } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { purchaseNumber, TwilioError } from '@/lib/twilio'
import { registerTwilioNumber, VapiError } from '@/lib/vapi'
import { callN8n } from '@/lib/n8n'

const SetupSchema = z.object({
  phone_number: z.string().min(7),    // E.164 e.g. +14155552671 — selected from search results
  voice_language: z.string().min(1),
  voice_tone: z.string().min(1),
  elevenlabs_voice_id: z.string().optional(),
})

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user: _authUser } } = await supabase.auth.getUser()
  if (!_authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await db.query.users.findFirst({ where: eq(users.clerk_id, _authUser.id) })
  if (!dbUser?.company_id) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  const company = await db.query.companies.findFirst({ where: eq(companies.id, dbUser.company_id) })
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  const body = await req.json()
  const parsed = SetupSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { phone_number, voice_language, voice_tone, elevenlabs_voice_id } = parsed.data

  // Step 1: Save voice config first (non-blocking if phone purchase fails)
  await db.update(companies)
    .set({
      voice_language,
      voice_tone,
      ...(elevenlabs_voice_id ? { elevenlabs_voice_id } : {}),
    })
    .where(eq(companies.id, dbUser.company_id))

  // Step 2: Build Vapi assistant via n8n WF7 (needed before phone number registration)
  try {
    await callN8n('/webhook/vapi/assistant/get', {
      company_id: dbUser.company_id,
      force_rebuild: true,
    })
  } catch (err) {
    console.error('[api/vapi/setup] WF7 assistant creation failed', err)
    return NextResponse.json({ error: 'Failed to create AI assistant. Please try again.' }, { status: 500 })
  }

  // Reload company to get fresh vapi_assistant_id from WF7
  const refreshed = await db.query.companies.findFirst({ where: eq(companies.id, dbUser.company_id) })
  if (!refreshed?.vapi_assistant_id) {
    return NextResponse.json({ error: 'AI assistant setup incomplete. Please try again.' }, { status: 500 })
  }

  // Step 3: Purchase the number from Twilio
  let purchased
  try {
    purchased = await purchaseNumber(phone_number)
  } catch (err) {
    console.error('[api/vapi/setup] Twilio purchase failed', err)
    if (err instanceof TwilioError && err.code === 'not_configured') {
      return NextResponse.json({ error: 'Phone purchasing is not available. Please contact support.' }, { status: 503 })
    }
    return NextResponse.json({ error: (err instanceof TwilioError ? err.message : null) ?? 'Failed to purchase phone number.' }, { status: 502 })
  }

  // Step 4: Register with Vapi using Twilio provider
  const serverUrl = `${process.env.N8N_WEBHOOK_BASE_URL}/webhook/vapi/inbound`
  let vapiNumber
  try {
    vapiNumber = await registerTwilioNumber({
      number: purchased.phone_number,
      name: `${refreshed.name} Main Line`,
      assistantId: refreshed.vapi_assistant_id,
      serverUrl,
    })
  } catch (err) {
    console.error('[api/vapi/setup] Vapi registration failed', err)
    // Number purchased — save it even without Vapi registration
    await db.update(companies)
      .set({ vapi_phone_number: purchased.phone_number, vapi_phone_number_id: null })
      .where(eq(companies.id, dbUser.company_id))
    return NextResponse.json({
      success: true,
      phone_number: purchased.phone_number,
      warning: 'Number purchased but AI connection failed. Please contact support.',
    })
  }

  // Step 5: Save phone number + Vapi ID
  await db.update(companies)
    .set({
      vapi_phone_number: purchased.phone_number,
      vapi_phone_number_id: vapiNumber.id,
    })
    .where(eq(companies.id, dbUser.company_id))

  return NextResponse.json({
    success: true,
    phone_number: purchased.phone_number,
  })
}
