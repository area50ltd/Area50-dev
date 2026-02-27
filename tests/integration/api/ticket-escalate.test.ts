import { describe, it, expect, vi } from 'vitest'
import { POST } from '@/app/api/ticket/escalate/route'

vi.mock('@/lib/n8n', () => ({
  callN8n: vi.fn().mockResolvedValue({ success: true, agent_id: 'agent-001', queue_position: 2 }),
}))

vi.mock('@/lib/db', () => ({
  db: { query: { users: { findFirst: vi.fn().mockResolvedValue({ id: 'u1', company_id: '11111111-1111-1111-1111-111111111111', role: 'admin', clerk_id: 'clerk_123', email: 'test@test.com', name: 'Test', is_active: true, phone: null, created_at: new Date() }) } } },
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'clerk_123' }),
}))

const VALID_PAYLOAD = {
  ticket_id: '33333333-3333-3333-3333-333333333333',
  company_id: '11111111-1111-1111-1111-111111111111',
  score: 8,
  reason: 'Customer very frustrated',
  category: 'complaint',
  sentiment: 'angry',
}

describe('POST /api/ticket/escalate', () => {
  it('returns 200 on successful escalation', async () => {
    const req = new Request('http://localhost/api/ticket/escalate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(VALID_PAYLOAD),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('returns 401 when unauthenticated', async () => {
    const { auth } = await import('@clerk/nextjs/server')
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)

    const req = new Request('http://localhost/api/ticket/escalate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(VALID_PAYLOAD),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid payload', async () => {
    const req = new Request('http://localhost/api/ticket/escalate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket_id: 'not-a-uuid' }), // invalid UUID
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for score out of range', async () => {
    const req = new Request('http://localhost/api/ticket/escalate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...VALID_PAYLOAD, score: 15 }), // score > 10
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
