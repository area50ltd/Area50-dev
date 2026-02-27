import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/payment/webhook/route'
import crypto from 'crypto'

const MOCK_SECRET = 'sk_test_mock'

vi.mock('@/lib/paystack', () => ({
  verifyWebhookSignature: vi.fn((body: string, sig: string) => {
    const expected = crypto.createHmac('sha512', MOCK_SECRET).update(body).digest('hex')
    return sig === expected
  }),
}))

vi.mock('@/lib/db', () => {
  const mockUpdate = vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([]),
    }),
  })
  return {
    db: {
      query: {
        payment_transactions: {
          findFirst: vi.fn().mockResolvedValue({ id: 'pay-1', status: 'pending', credits_purchased: 5000 }),
        },
      },
      update: mockUpdate,
    },
    sql: vi.fn(),
  }
})

function makeWebhookRequest(body: unknown, signed = true) {
  const bodyStr = JSON.stringify(body)
  const sig = signed
    ? crypto.createHmac('sha512', MOCK_SECRET).update(bodyStr).digest('hex')
    : 'invalid_sig'

  return new Request('http://localhost/api/payment/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-paystack-signature': sig,
    },
    body: bodyStr,
  })
}

describe('POST /api/payment/webhook', () => {
  beforeEach(() => {
    vi.stubEnv('PAYSTACK_SECRET_KEY', MOCK_SECRET)
  })

  it('returns 200 for valid charge.success event', async () => {
    const req = makeWebhookRequest({
      event: 'charge.success',
      data: { reference: 'ref_webhook_001', amount: 500000, metadata: { company_id: '11111111-1111-1111-1111-111111111111', credits: 5000 } },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  it('returns 400 for invalid signature', async () => {
    const req = makeWebhookRequest(
      { event: 'charge.success', data: { reference: 'ref_001' } },
      false // bad sig
    )
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 for unknown event (no-op)', async () => {
    const req = makeWebhookRequest({ event: 'refund.processed', data: {} })
    const res = await POST(req)
    // Should still return 200 — just ignore unknown events
    expect(res.status).toBe(200)
  })
})
