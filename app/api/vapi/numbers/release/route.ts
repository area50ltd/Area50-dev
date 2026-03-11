import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, companies } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { deletePhoneNumber } from '@/lib/vapi'
import { releaseNumber, twilioGetIncomingNumberSid, TwilioError } from '@/lib/twilio'

export async function DELETE() {
  const supabase = createClient()
  const { data: { user: _authUser } } = await supabase.auth.getUser()
  if (!_authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await db.query.users.findFirst({ where: eq(users.clerk_id, _authUser.id) })
  if (!dbUser?.company_id) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  const company = await db.query.companies.findFirst({ where: eq(companies.id, dbUser.company_id) })
  if (!company?.vapi_phone_number) {
    return NextResponse.json({ error: 'No phone number to release' }, { status: 404 })
  }

  // Step 1: Remove from Vapi (best effort)
  if (company.vapi_phone_number_id) {
    try {
      await deletePhoneNumber(company.vapi_phone_number_id)
    } catch (err) {
      console.error('[api/vapi/numbers/release] Vapi delete failed (continuing):', err)
    }
  }

  // Step 2: Release from Twilio by looking up the number SID dynamically
  try {
    const sid = await twilioGetIncomingNumberSid(company.vapi_phone_number)
    if (sid) await releaseNumber(sid)
  } catch (err) {
    if (!(err instanceof TwilioError && err.code === 'not_configured')) {
      console.error('[api/vapi/numbers/release] Twilio release failed (continuing):', err)
    }
  }

  // Step 3: Clear from DB regardless — don't leave the admin stuck
  await db.update(companies)
    .set({ vapi_phone_number: null, vapi_phone_number_id: null })
    .where(eq(companies.id, dbUser.company_id))

  return NextResponse.json({ success: true })
}
