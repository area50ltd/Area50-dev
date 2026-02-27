import { describe, it, expect, vi } from 'vitest'
import { POST } from '@/app/api/payment/verify/route'

vi.mock('@/lib/paystack', () => ({
  verifyTransaction: vi.fn().mockResolvedValue({
    status: true,
    data: {
      status: 'success',
      reference: 'ref_verify_001',
      amount: 3500000,
      metadata: { company_id: '11111111-1111-1111-1111-111111111111', credits: 15000 },
    },
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
        users: {
          findFirst: vi.fn().mockResolvedValue({ id: 'u1', company_id: '11111111-1111-1111-1111-111111111111', role: 'admin', clerk_id: 'clerk_123', email: 'test@test.com', name: 'Test', is_active: true, phone: null, created_at: new Date() }),
        },
        payment_transactions: {
          findFirst: vi.fn().mockResolvedValue({ id: 'pay-1', status: 'pending', credits_purchased: 15000 }),
        },
      },
      update: mockUpdate,
    },
    sql: vi.fn(),
  }
})

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'clerk_123' }),
}))

describe('POST /api/payment/verify', () => {
  it('returns 200 for valid reference', async () => {
    const req = new Request('http://localhost/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: 'ref_verify_001' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.status).toBe('success')
  })

  it('returns 401 when unauthenticated', async () => {
    const { auth } = await import('@clerk/nextjs/server')
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)

    const req = new Request('http://localhost/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: 'ref_001' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 for missing reference', async () => {
    const req = new Request('http://localhost/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
