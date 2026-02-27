import { describe, it, expect, vi } from 'vitest'
import { POST } from '@/app/api/payment/initialize/route'

vi.mock('@/lib/paystack', () => ({
  initializeTransaction: vi.fn().mockResolvedValue({
    status: true,
    data: { authorization_url: 'https://paystack.com/pay/test', reference: 'ref_test_001' },
  }),
}))

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'u1',
          company_id: '11111111-1111-1111-1111-111111111111',
          role: 'admin',
          clerk_id: 'clerk_123',
          email: 'admin@company.com',
          name: 'Admin User',
          is_active: true,
          phone: null,
          created_at: new Date(),
        }),
      },
    },
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue([]) }),
  },
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'clerk_123' }),
}))

describe('POST /api/payment/initialize', () => {
  it('returns 200 with authorization_url for valid plan', async () => {
    const req = new Request('http://localhost/api/payment/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'plan', plan: 'growth' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.authorization_url).toBeDefined()
    expect(json.reference).toBeDefined()
  })

  it('returns 200 for credit pack purchase', async () => {
    const req = new Request('http://localhost/api/payment/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'credits', pack_index: 0 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  it('returns 401 when unauthenticated', async () => {
    const { auth } = await import('@clerk/nextjs/server')
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)

    const req = new Request('http://localhost/api/payment/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'plan', plan: 'starter' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid plan name', async () => {
    const req = new Request('http://localhost/api/payment/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'plan', plan: 'enterprise' }), // not a valid plan
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
