// ─── Vapi REST API Client (server-side only) ─────────────────────────────────
// Used for phone number search/purchase.
// Assistant management goes through n8n WF7 via callN8n().

const VAPI_BASE = 'https://api.vapi.ai'

async function vapiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const key = process.env.VAPI_API_KEY
  if (!key) throw new Error('VAPI_API_KEY is not configured')

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
    const text = await res.text()
    throw new Error(`Vapi API error ${res.status}: ${text}`)
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
  const params = new URLSearchParams({ country })
  if (areaCode) params.set('areaCode', areaCode)
  return vapiRequest<AvailablePhoneNumber[]>(`/phone-number/available?${params}`)
}

// ─── Purchase / Release ───────────────────────────────────────────────────────

/** Purchase using a phoneNumberId (simple setup wizard flow) */
export async function purchasePhoneNumber(phoneNumberId: string): Promise<VapiPhoneNumber> {
  return vapiRequest<VapiPhoneNumber>('/phone-number', {
    method: 'POST',
    body: JSON.stringify({ phoneNumberId }),
  })
}

/** Purchase a specific number string with full config (assistant link + inbound webhook) */
export async function purchasePhoneNumberFull(params: {
  number: string
  name: string
  assistantId: string
  serverUrl: string
}): Promise<VapiPhoneNumber> {
  return vapiRequest<VapiPhoneNumber>('/phone-number', {
    method: 'POST',
    body: JSON.stringify({
      provider: 'vapi',
      number: params.number,
      name: params.name,
      assistantId: params.assistantId,
      serverUrl: params.serverUrl,
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
