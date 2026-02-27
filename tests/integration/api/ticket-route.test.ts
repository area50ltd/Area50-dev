import { describe, it, expect, vi } from 'vitest'
import { POST } from '@/app/api/ticket/route/route'

vi.mock('@/lib/n8n', () => ({
  callN8n: vi.fn().mockResolvedValue({
    score: 4,
    category: 'billing',
    sentiment: 'neutral',
    assigned_to: 'ai',
  }),
}))

vi.mock('@/lib/db', () => ({
  db: { query: { users: { findFirst: vi.fn().mockResolvedValue({ id: 'u1', company_id: '11111111-1111-1111-1111-111111111111', role: 'admin', clerk_id: 'user_test_123', email: 'test@test.com', name: 'Test', is_active: true, phone: null, created_at: new Date() }) } } },
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'user_test_123' }),
}))

const VALID_PAYLOAD = {
  ticket_id: '33333333-3333-3333-3333-333333333333',
  message: 'My payment failed',
  company_id: '11111111-1111-1111-1111-111111111111',
  session_id: 'session-001',
  message_count: 3,
}

describe('POST /api/ticket/route', () => {
  it('returns 200 with routing decision', async () => {
    const req = new Request('http://localhost/api/ticket/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(VALID_PAYLOAD),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.score).toBe(4)
    expect(json.category).toBe('billing')
  })

  it('returns 401 when unauthenticated', async () => {
    const { auth } = await import('@clerk/nextjs/server')
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)

    const req = new Request('http://localhost/api/ticket/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(VALID_PAYLOAD),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid payload', async () => {
    const req = new Request('http://localhost/api/ticket/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'test' }), // missing ticket_id, company_id, session_id
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
