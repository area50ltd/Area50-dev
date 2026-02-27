import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/chat/route'

vi.mock('@/lib/n8n', () => ({
  callN8n: vi.fn().mockResolvedValue({
    response: 'Our office hours are 9am–6pm WAT, Monday to Friday.',
    session_id: 'session-test-001',
    ticket_id: '33333333-3333-3333-3333-333333333333',
    escalate: false,
    score: 2,
    category: 'inquiry',
    sentiment: 'neutral',
  }),
}))

vi.mock('@/lib/db', () => ({
  db: { query: { users: { findFirst: vi.fn().mockResolvedValue({ id: 'u1', company_id: '11111111-1111-1111-1111-111111111111', role: 'admin', clerk_id: 'user_test_123', email: 'test@test.com', name: 'Test', is_active: true, phone: null, created_at: new Date() }) } } },
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'user_test_123' }),
}))

const VALID_PAYLOAD = {
  company_id: '11111111-1111-1111-1111-111111111111',
  message: 'What are your office hours?',
  session_id: 'session-test-001',
  ticket_id: '33333333-3333-3333-3333-333333333333',
  channel: 'web_widget',
  language: 'en',
}

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/chat', () => {
  it('returns 200 for valid payload', async () => {
    const res = await POST(makeRequest(VALID_PAYLOAD))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.response).toBeDefined()
    expect(json.session_id).toBe('session-test-001')
  })

  it('returns AI response content', async () => {
    const res = await POST(makeRequest(VALID_PAYLOAD))
    const json = await res.json()
    expect(json.response).toContain('office hours')
  })

  it('returns 401 when unauthenticated', async () => {
    const { auth } = await import('@clerk/nextjs/server')
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)

    const res = await POST(makeRequest(VALID_PAYLOAD))
    expect(res.status).toBe(401)
  })

  it('returns 400 for missing required fields', async () => {
    const res = await POST(makeRequest({ message: 'test' })) // missing company_id, session_id, etc.
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid channel', async () => {
    const res = await POST(makeRequest({ ...VALID_PAYLOAD, channel: 'telegram' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for empty message', async () => {
    const res = await POST(makeRequest({ ...VALID_PAYLOAD, message: '' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for message exceeding 5000 chars', async () => {
    const res = await POST(makeRequest({ ...VALID_PAYLOAD, message: 'x'.repeat(5001) }))
    expect(res.status).toBe(400)
  })
})
