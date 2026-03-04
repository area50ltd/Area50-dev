import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users, companies } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { purchasePhoneNumber } from '@/lib/vapi'
import { callN8n } from '@/lib/n8n'

const SetupSchema = z.object({
  phone_number_id: z.string().min(1),
  voice_language: z.string().min(1),
  voice_tone: z.string().min(1),
  elevenlabs_voice_id: z.string().optional(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.query.users.findFirst({ where: eq(users.clerk_id, userId) })
  if (!user?.company_id) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  const body = await req.json()
  const parsed = SetupSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { phone_number_id, voice_language, voice_tone, elevenlabs_voice_id } = parsed.data

  // Step 1: Purchase phone number from Vapi
  let purchasedNumber: { number: string; id: string }
  try {
    purchasedNumber = await purchasePhoneNumber(phone_number_id)
  } catch (err) {
    console.error('[api/vapi/setup] phone purchase failed', err)
    return NextResponse.json({ error: 'Failed to purchase phone number' }, { status: 500 })
  }

  // Step 2: Persist voice config + phone number to DB
  await db.update(companies)
    .set({
      vapi_phone_number: purchasedNumber.number,
      vapi_phone_number_id: purchasedNumber.id,
      voice_language,
      voice_tone,
      ...(elevenlabs_voice_id ? { elevenlabs_voice_id } : {}),
    })
    .where(eq(companies.id, user.company_id))

  // Step 3: Trigger n8n WF7 to create Vapi assistant (non-blocking on error)
  try {
    await callN8n('/webhook/vapi/assistant/get', {
      company_id: user.company_id,
      force_rebuild: true,
    })
  } catch (err) {
    console.error('[api/vapi/setup] WF7 assistant creation failed', err)
    // Phone number is purchased — return partial success so user knows number is secured
    return NextResponse.json({
      success: true,
      phone_number: purchasedNumber.number,
      warning: 'Phone number purchased but assistant creation is still in progress.',
    })
  }

  return NextResponse.json({
    success: true,
    phone_number: purchasedNumber.number,
  })
}
