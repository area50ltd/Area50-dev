import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

interface ClerkEmailAddress {
  email_address: string
  id: string
}

interface ClerkUserCreatedData {
  id: string
  email_addresses: ClerkEmailAddress[]
  primary_email_address_id: string
  first_name: string | null
  last_name: string | null
}

interface WebhookEvent {
  type: string
  data: ClerkUserCreatedData
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing CLERK_WEBHOOK_SECRET' }, { status: 500 })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let event: WebhookEvent

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  if (event.type === 'user.created') {
    const { id, email_addresses, primary_email_address_id, first_name, last_name } = event.data
    const primary = email_addresses.find((e) => e.id === primary_email_address_id)
    if (primary) {
      await db.insert(users).values({
        clerk_id: id,
        email: primary.email_address,
        name: [first_name, last_name].filter(Boolean).join(' ') || null,
        role: 'admin', // default role — can be changed in settings
      }).onConflictDoNothing()
    }
  }

  if (event.type === 'user.deleted') {
    const { id } = event.data
    await db.update(users).set({ is_active: false }).where(eq(users.clerk_id, id))
  }

  return NextResponse.json({ received: true })
}
