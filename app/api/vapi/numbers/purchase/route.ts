import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users, companies } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { purchasePhoneNumberFull } from '@/lib/vapi'

const Schema = z.object({
  number: z.string().min(7),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.query.users.findFirst({ where: eq(users.clerk_id, userId) })
  if (!user?.company_id) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const company = await db.query.companies.findFirst({ where: eq(companies.id, user.company_id) })
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  // Block if already has a number
  if (company.vapi_phone_number) {
    return NextResponse.json(
      { error: 'Company already has a phone number. Release the current number first.' },
      { status: 409 },
    )
  }

  // Require assistant to be set up first
  if (!company.vapi_assistant_id) {
    return NextResponse.json(
      { error: 'AI assistant must be configured before purchasing a phone number.' },
      { status: 422 },
    )
  }

  const serverUrl = `${process.env.N8N_WEBHOOK_BASE_URL}/webhook/vapi/inbound`

  try {
    const purchased = await purchasePhoneNumberFull({
      number: parsed.data.number,
      name: `${company.name} Main Line`,
      assistantId: company.vapi_assistant_id,
      serverUrl,
    })

    await db.update(companies)
      .set({
        vapi_phone_number: purchased.number,
        vapi_phone_number_id: purchased.id,
      })
      .where(eq(companies.id, user.company_id))

    return NextResponse.json({
      success: true,
      phone_number: purchased.number,
      phone_number_id: purchased.id,
    })
  } catch (err) {
    console.error('[api/vapi/numbers/purchase]', err)
    return NextResponse.json({ error: 'Failed to purchase phone number. Please try again.' }, { status: 500 })
  }
}
