import crypto from 'crypto'

const SECRET = process.env.PAYSTACK_SECRET_KEY

export async function initializeTransaction(params: {
  email: string
  amount: number // smallest currency unit (cents for USD)
  currency?: string
  metadata?: Record<string, unknown>
  callback_url?: string
}) {
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currency: process.env.PAYSTACK_CURRENCY ?? 'NGN', ...params }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message ?? `Paystack error: ${res.status}`)
  return data
}

export async function verifyTransaction(reference: string) {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: {
      Authorization: `Bearer ${SECRET}`,
    },
  })
  return res.json()
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', SECRET!)
    .update(body)
    .digest('hex')
  return hash === signature
}
