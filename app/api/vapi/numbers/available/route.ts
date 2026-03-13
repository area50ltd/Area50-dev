import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { searchAvailableByCountry, VapiError } from '@/lib/vapi'
import { searchAvailableNumbers, TwilioError } from '@/lib/twilio'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: Request) {
  const supabase = createClient()
  const { data: { user: _authUser } } = await supabase.auth.getUser()
  if (!_authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await db.query.users.findFirst({ where: eq(users.clerk_id, _authUser.id) })
  if (!dbUser?.company_id) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const country = (searchParams.get('country') ?? 'US').toUpperCase()
  const areaCode = searchParams.get('area_code') ?? undefined

  // ── Try Vapi-native provider first ────────────────────────────────────────
  try {
    const numbers = await searchAvailableByCountry(country, areaCode)
    if (numbers.length > 0) {
      return NextResponse.json(numbers.map((n) => ({
        phone_number: n.phoneNumber,
        friendly_name: n.phoneNumber,
        region: n.region,
        capabilities: { voice: true, SMS: false },
        provider: 'vapi',
      })))
    }
  } catch (err) {
    if (!(err instanceof VapiError && err.code === 'not_configured')) {
      console.warn('[api/vapi/numbers/available] Vapi search failed, trying Twilio:', err)
    }
  }

  // ── Fallback to Twilio ─────────────────────────────────────────────────────
  try {
    const numbers = await searchAvailableNumbers(country, areaCode)
    return NextResponse.json(numbers.map((n) => ({ ...n, provider: 'twilio' })))
  } catch (err) {
    console.error('[api/vapi/numbers/available] Twilio fallback failed:', err)
    if (err instanceof TwilioError && err.code === 'not_configured') {
      return NextResponse.json(
        { error: 'Phone number purchasing is not configured. Please contact support.', code: 'not_configured' },
        { status: 503 },
      )
    }
    return NextResponse.json({ error: 'Failed to fetch available numbers. Please try again.' }, { status: 500 })
  }
}
