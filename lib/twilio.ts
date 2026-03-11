// ─── Twilio REST Client (server-side only) ────────────────────────────────────
// Used for searching and purchasing phone numbers.
// After purchase, numbers are registered with Vapi via registerTwilioNumber().

const TWILIO_BASE = 'https://api.twilio.com/2010-04-01'

export class TwilioError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: 'not_configured' | 'api_error',
  ) {
    super(message)
    this.name = 'TwilioError'
  }
}

function getCredentials() {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) throw new TwilioError('Twilio credentials not configured', undefined, 'not_configured')
  return { sid, token, auth: Buffer.from(`${sid}:${token}`).toString('base64') }
}

async function twilioGet<T>(path: string): Promise<T> {
  const { sid, auth } = getCredentials()
  const res = await fetch(`${TWILIO_BASE}/Accounts/${sid}${path}`, {
    headers: { Authorization: `Basic ${auth}` },
    cache: 'no-store',
  })
  if (!res.ok) {
    let msg = `Twilio error ${res.status}`
    try { const b = await res.json(); msg = b.message ?? msg } catch { /* ignore */ }
    throw new TwilioError(msg, res.status, 'api_error')
  }
  return res.json()
}

async function twilioPost<T>(path: string, body: Record<string, string>): Promise<T> {
  const { sid, auth } = getCredentials()
  const res = await fetch(`${TWILIO_BASE}/Accounts/${sid}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body).toString(),
    cache: 'no-store',
  })
  if (!res.ok) {
    let msg = `Twilio error ${res.status}`
    try { const b = await res.json(); msg = b.message ?? msg } catch { /* ignore */ }
    throw new TwilioError(msg, res.status, 'api_error')
  }
  return res.json()
}

async function twilioDelete(path: string): Promise<void> {
  const { sid, auth } = getCredentials()
  const res = await fetch(`${TWILIO_BASE}/Accounts/${sid}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Basic ${auth}` },
    cache: 'no-store',
  })
  // 204 No Content = success
  if (!res.ok && res.status !== 204) {
    let msg = `Twilio error ${res.status}`
    try { const b = await res.json(); msg = b.message ?? msg } catch { /* ignore */ }
    throw new TwilioError(msg, res.status, 'api_error')
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TwilioAvailableNumber {
  phone_number: string       // E.164 e.g. +14155552671
  friendly_name: string      // e.g. (415) 555-2671
  region?: string
  locality?: string
  capabilities: { voice: boolean; SMS: boolean; MMS?: boolean }
}

export interface TwilioPurchasedNumber {
  sid: string                // PN... — used to release later
  phone_number: string
  friendly_name: string
}

// ─── Country → Twilio country code mapping ───────────────────────────────────

const COUNTRY_MAP: Record<string, string> = {
  US: 'US', CA: 'CA', GB: 'GB', AU: 'AU',
  ZA: 'ZA', KE: 'KE', GH: 'GH', NG: 'NG',
  DE: 'DE', FR: 'FR',
}

// ─── Search available numbers ─────────────────────────────────────────────────

export async function searchAvailableNumbers(
  country: string,
  areaCode?: string,
  limit = 10,
): Promise<TwilioAvailableNumber[]> {
  const cc = COUNTRY_MAP[country.toUpperCase()]
  if (!cc) throw new TwilioError(`Country "${country}" is not supported`)

  const params = new URLSearchParams({ Limit: String(limit) })
  if (areaCode) params.set('AreaCode', areaCode)

  const data = await twilioGet<{ available_phone_numbers: TwilioAvailableNumber[] }>(
    `/AvailablePhoneNumbers/${cc}/Local.json?${params}`,
  )
  return data.available_phone_numbers ?? []
}

// ─── Purchase a number ────────────────────────────────────────────────────────

export async function purchaseNumber(phoneNumber: string): Promise<TwilioPurchasedNumber> {
  return twilioPost<TwilioPurchasedNumber>('/IncomingPhoneNumbers.json', {
    PhoneNumber: phoneNumber,
  })
}

// ─── Release a number ─────────────────────────────────────────────────────────

export async function releaseNumber(numberSid: string): Promise<void> {
  await twilioDelete(`/IncomingPhoneNumbers/${numberSid}.json`)
}

// ─── Look up Twilio SID for an owned phone number (E.164) ────────────────────
// Used during release so we don't need a separate DB column for the Twilio SID.

export async function twilioGetIncomingNumberSid(phoneNumber: string): Promise<string | null> {
  const data = await twilioGet<{ incoming_phone_numbers: Array<{ sid: string; phone_number: string }> }>(
    `/IncomingPhoneNumbers.json?PhoneNumber=${encodeURIComponent(phoneNumber)}&PageSize=1`,
  )
  return data.incoming_phone_numbers?.[0]?.sid ?? null
}

