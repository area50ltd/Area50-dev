import crypto from 'crypto'

const SECRET = process.env.PAYSTACK_SECRET_KEY
const BASE = 'https://api.paystack.co'

function headers() {
  return { Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' }
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function initializeTransaction(params: {
  email: string
  amount: number // kobo
  currency?: string
  plan?: string  // Paystack plan_code — attaches subscription
  metadata?: Record<string, unknown>
  callback_url?: string
}) {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ currency: process.env.PAYSTACK_CURRENCY ?? 'NGN', ...params }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message ?? `Paystack error: ${res.status}`)
  return data
}

export async function verifyTransaction(reference: string) {
  const res = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: headers(),
  })
  return res.json()
}

// ─── Customers ────────────────────────────────────────────────────────────────

export async function createCustomer(params: { email: string; first_name?: string; last_name?: string }) {
  const res = await fetch(`${BASE}/customer`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(params),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message ?? `Paystack error: ${res.status}`)
  return data as { status: boolean; data: { customer_code: string; id: number; email: string } }
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

/**
 * Create a subscription for an existing customer using a saved authorization.
 * Used when a customer already has a card on file (e.g. upgrading a plan).
 */
export async function createSubscription(params: {
  customer: string      // customer_code or email
  plan: string          // Paystack plan_code
  authorization?: string // authorization_code from previous transaction
  start_date?: string   // ISO date — defaults to now
}) {
  const res = await fetch(`${BASE}/subscription`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(params),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message ?? `Paystack error: ${res.status}`)
  return data as {
    status: boolean
    data: { subscription_code: string; email_token: string; status: string }
  }
}

/**
 * Disable (cancel) a subscription.
 * email_token comes from subscription.create webhook or getSubscription().
 */
export async function disableSubscription(params: {
  code: string        // subscription_code
  token: string       // email_token
}) {
  const res = await fetch(`${BASE}/subscription/disable`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ code: params.code, token: params.token }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message ?? `Paystack error: ${res.status}`)
  return data as { status: boolean; message: string }
}

/**
 * Fetch a single subscription by subscription_code.
 * Returns email_token needed for cancellation.
 */
export async function getSubscription(subscriptionCode: string) {
  const res = await fetch(`${BASE}/subscription/${encodeURIComponent(subscriptionCode)}`, {
    headers: headers(),
  })
  const data = await res.json()
  return data as {
    status: boolean
    data: {
      subscription_code: string
      email_token: string
      status: string
      plan: { plan_code: string; name: string; amount: number }
      customer: { customer_code: string; email: string }
      next_payment_date: string
    }
  }
}

// ─── Webhook ──────────────────────────────────────────────────────────────────

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const hash = crypto.createHmac('sha512', SECRET!).update(body).digest('hex')
  return hash === signature
}
