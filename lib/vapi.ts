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

export async function searchAvailableNumbers(areaCode?: string): Promise<VapiPhoneNumber[]> {
  const params = new URLSearchParams({ limit: '10' })
  if (areaCode) params.set('areaCode', areaCode)
  return vapiRequest<VapiPhoneNumber[]>(`/phone-number/available?${params}`)
}

export async function searchAvailableByCountry(
  country: string,
  areaCode?: string,
): Promise<AvailablePhoneNumber[]> {
  const params = new URLSearchParams({ country, limit: '10' })
  if (areaCode) params.set('areaCode', areaCode)

  // The Vapi API may return numbers with different field names depending on version.
  // Normalise to our AvailablePhoneNumber shape.
  const raw = await vapiRequest<Record<string, unknown>[]>(`/phone-number/available?${params}`)

  return raw
    .map((item) => ({
      phoneNumber: (item.phoneNumber ?? item.number ?? item.phone_number ?? '') as string,
      areaCode: (item.areaCode ?? item.area_code ?? areaCode) as string | undefined,
      region: (item.region ?? item.locality ?? item.state ?? '') as string | undefined,
    }))
    .filter((n) => Boolean(n.phoneNumber))
}

// ─── Purchase / Release ───────────────────────────────────────────────────────

/** Purchase using a phoneNumberId (simple setup wizard flow) */
export async function purchasePhoneNumber(phoneNumberId: string): Promise<VapiPhoneNumber> {
  return vapiRequest<VapiPhoneNumber>('/phone-number', {
    method: 'POST',
    body: JSON.stringify({ phoneNumberId }),
  })
}

/** Register a Twilio-purchased number with Vapi using the platform's Twilio credentials */
export async function registerTwilioNumber(params: {
  number: string
  name: string
  assistantId: string
  serverUrl: string
}): Promise<VapiPhoneNumber> {
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
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
