import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { callN8n } from '@/lib/n8n'

const MOCK_BASE = 'https://n8n.example.com'
const MOCK_SECRET = 'test_secret'

describe('callN8n', () => {
  beforeEach(() => {
    vi.stubEnv('N8N_WEBHOOK_BASE_URL', MOCK_BASE)
    vi.stubEnv('N8N_SECRET', MOCK_SECRET)
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sends POST with correct headers and body', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'Hello' }),
    } as Response)

    const payload = { message: 'test', company_id: '123' }
    const result = await callN8n('/webhook/ai/chat', payload)

    expect(mockFetch).toHaveBeenCalledWith(
      `${MOCK_BASE}/webhook/ai/chat`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-area50-secret': MOCK_SECRET,
        }),
        body: JSON.stringify(payload),
        cache: 'no-store',
      })
    )
    expect(result).toEqual({ response: 'Hello' })
  })

  it('throws on non-ok response', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    } as Response)

    await expect(callN8n('/webhook/ai/chat', {})).rejects.toThrow(
      'n8n error on /webhook/ai/chat: 503 Service Unavailable'
    )
  })

  it('is typed generically', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ score: 7, category: 'billing' }),
    } as Response)

    const result = await callN8n<{ score: number; category: string }>('/webhook/ticket/route', {})
    expect(result.score).toBe(7)
    expect(result.category).toBe('billing')
  })
})
