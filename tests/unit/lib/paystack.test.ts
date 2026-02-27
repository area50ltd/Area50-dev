import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { initializeTransaction, verifyTransaction, verifyWebhookSignature } from '@/lib/paystack'

describe('Paystack helpers', () => {
  beforeEach(() => {
    vi.stubEnv('PAYSTACK_SECRET_KEY', 'sk_test_mock')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initializeTransaction', () => {
    it('calls Paystack initialize endpoint', async () => {
      const mockFetch = vi.mocked(fetch)
      const mockData = { status: true, data: { authorization_url: 'https://paystack.com/pay/xxx', reference: 'ref_123' } }
      mockFetch.mockResolvedValueOnce({ json: async () => mockData } as Response)

      const result = await initializeTransaction({ email: 'test@test.com', amount: 1500000 })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.paystack.co/transaction/initialize',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ Authorization: 'Bearer sk_test_mock' }),
          body: JSON.stringify({ email: 'test@test.com', amount: 1500000 }),
        })
      )
      expect(result.data.reference).toBe('ref_123')
    })

    it('passes metadata through', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({ json: async () => ({}) } as Response)

      const meta = { company_id: 'abc', credits: 5000 }
      await initializeTransaction({ email: 'x@x.com', amount: 100, metadata: meta })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ email: 'x@x.com', amount: 100, metadata: meta }),
        })
      )
    })
  })

  describe('verifyTransaction', () => {
    it('calls Paystack verify endpoint with reference', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ status: true, data: { status: 'success' } }),
      } as Response)

      const result = await verifyTransaction('ref_abc')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.paystack.co/transaction/verify/ref_abc',
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer sk_test_mock' }),
        })
      )
      expect(result.data.status).toBe('success')
    })
  })

  describe('verifyWebhookSignature', () => {
    it('returns false for mismatched signature', () => {
      const valid = verifyWebhookSignature('{"event":"charge.success"}', 'bad_sig')
      expect(valid).toBe(false)
    })

    it('returns true for correct HMAC-SHA512 signature', async () => {
      const crypto = await import('crypto')
      const body = '{"event":"charge.success"}'
      const sig = crypto.createHmac('sha512', 'sk_test_mock').update(body).digest('hex')
      const valid = verifyWebhookSignature(body, sig)
      expect(valid).toBe(true)
    })
  })
})
