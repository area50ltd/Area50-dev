// ─── Vapi REST API Client (server-side only) ─────────────────────────────────
// Used for phone number search/purchase.
// Assistant management goes through n8n WF7 via callN8n().

const VAPI_BASE = 'https://api.vapi.ai'

/** Structured error thrown by vapiRequest so callers can surface the right message */
export class VapiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: 'not_configured' | 'unauthorized' | 'not_found' | 'api_error',
  ) {
    super(message)
    this.name = 'VapiError'
  }
}

async function vapiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const key = process.env.VAPI_API_KEY
  if (!key) throw new VapiError('VAPI_API_KEY is not configured in environment', undefined, 'not_configured')

  const res = await fetch(`${VAPI_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    let detail = ''
    try {
      const body = await res.json()
      detail = body?.message ?? body?.error ?? JSON.stringify(body)
    } catch {
      detail = await res.text().catch(() => '')
    }

    if (res.status === 401 || res.status === 403) {
      throw new VapiError('Invalid Vapi API key — check your VAPI_API_KEY setting', res.status, 'unauthorized')
    }
    if (res.status === 404) {
      throw new VapiError(`Vapi endpoint not found: ${path}`, res.status, 'not_found')
    }
    throw new VapiError(detail || `Vapi API error ${res.status}`, res.status, 'api_error')
  }

  return res.json() as Promise<T>
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VapiPhoneNumber {
  id: string
  number: string
  country?: string
  areaCode?: string
  provider?: string
  name?: string
}

/** Shape returned by /phone-number/available */
export interface AvailablePhoneNumber {
  phoneNumber: string
  areaCode?: string
  region?: string
}

// ─── Available Numbers ────────────────────────────────────────────────────────

// Countries Vapi's native provider can provision numbers in.
// Vapi uses Vonage under the hood; area-code selection is US-centric but other
// countries can be provisioned by omitting an area code.
export const VAPI_NATIVE_COUNTRIES = new Set(['US', 'CA', 'GB', 'AU'])

/**
 * Vapi has NO search/available endpoint.  Instead we return a virtual
 * placeholder for supported countries — the real number is assigned by Vapi
 * at purchase time via POST /phone-number with numberDesiredAreaCode.
 *
 * Placeholder format: `__vapi__:<COUNTRY>:<AREA_CODE>`
 */
export async function searchAvailableByCountry(
  country: string,
  areaCode?: string,
): Promise<AvailablePhoneNumber[]> {
  const key = process.env.VAPI_API_KEY
  if (!key) throw new VapiError('VAPI_API_KEY is not configured', undefined, 'not_configured')

  if (!VAPI_NATIVE_COUNTRIES.has(country.toUpperCase())) {
    return [] // unsupported country — caller will fall through to Twilio
  }

  return [{
    phoneNumber: `__vapi__:${country.toUpperCase()}:${areaCode ?? ''}`,
    areaCode,
    region: country.toUpperCase(),
  }]
}

// ─── Purchase / Release ───────────────────────────────────────────────────────

/**
 * Provision a number through Vapi's own provider (Vonage-backed).
 * Vapi assigns the actual number — no explicit number is specified.
 * `numberDesiredAreaCode` is an optional US area code preference.
 */
export async function purchaseVapiNativeNumber(params: {
  numberDesiredAreaCode?: string
  name: string
  assistantId: string
}): Promise<VapiPhoneNumber> {
  const body: Record<string, unknown> = {
    provider: 'vapi',
    name: params.name,
    assistantId: params.assistantId,
  }
  if (params.numberDesiredAreaCode) {
    body.numberDesiredAreaCode = params.numberDesiredAreaCode
  }
  return vapiRequest<VapiPhoneNumber>('/phone-number', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/** Register a Twilio-purchased number with Vapi (fallback path — reads creds from DB then env) */
export async function registerTwilioNumber(params: {
  number: string
  name: string
  assistantId: string
  serverUrl: string
}): Promise<VapiPhoneNumber> {
  // Read from DB first (super admin settings), fall back to env vars
  let twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
  let twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
  try {
    const { db } = await import('@/lib/db')
    const { platform_settings } = await import('@/lib/schema')
    const { inArray } = await import('drizzle-orm')
    const rows = await db.select().from(platform_settings)
      .where(inArray(platform_settings.key, ['twilio_account_sid', 'twilio_auth_token']))
    for (const row of rows) {
      if (row.key === 'twilio_account_sid' && row.value) twilioAccountSid = row.value
      if (row.key === 'twilio_auth_token' && row.value) twilioAuthToken = row.value
    }
  } catch { /* ignore — fall back to env vars */ }
  if (!twilioAccountSid || !twilioAuthToken) {
    throw new VapiError('Twilio credentials not configured', undefined, 'not_configured')
  }
  return vapiRequest<VapiPhoneNumber>('/phone-number', {
    method: 'POST',
    body: JSON.stringify({
      provider: 'twilio',
      number: params.number,
      name: params.name,
      assistantId: params.assistantId,
      serverUrl: params.serverUrl,
      twilioAccountSid,
      twilioAuthToken,
    }),
  })
}

/** Release / delete an owned phone number */
export async function deletePhoneNumber(phoneNumberId: string): Promise<void> {
  await vapiRequest<unknown>(`/phone-number/${phoneNumberId}`, { method: 'DELETE' })
}

export async function listOwnedPhoneNumbers(): Promise<VapiPhoneNumber[]> {
  return vapiRequest<VapiPhoneNumber[]>('/phone-number')
}
