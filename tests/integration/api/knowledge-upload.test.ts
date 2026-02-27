import { describe, it, expect, vi } from 'vitest'
import { POST } from '@/app/api/knowledge/upload/route'

vi.mock('@/lib/n8n', () => ({
  callN8n: vi.fn().mockResolvedValue({ success: true, chunks: 12 }),
}))

vi.mock('@/lib/r2', () => ({
  uploadFile: vi.fn().mockResolvedValue({
    key: 'company-123/doc-uuid/test.pdf',
    documentId: 'doc-uuid',
    url: 'https://files.example.com/company-123/doc-uuid/test.pdf',
  }),
  ALLOWED_FILE_TYPES: ['application/pdf', 'text/plain', 'text/csv', 'application/json', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  MAX_FILE_SIZE: 52428800,
}))

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn().mockResolvedValue({ id: 'u1', company_id: '11111111-1111-1111-1111-111111111111', role: 'admin', clerk_id: 'clerk_123', email: 'test@test.com', name: 'Test', is_active: true, phone: null, created_at: new Date() }),
      },
    },
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue([{ id: 'doc-uuid' }]) }),
  },
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'clerk_123' }),
}))

describe('POST /api/knowledge/upload', () => {
  it('returns 401 when unauthenticated', async () => {
    const { auth } = await import('@clerk/nextjs/server')
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)

    const formData = new FormData()
    formData.append('file', new Blob(['test'], { type: 'application/pdf' }), 'test.pdf')

    const req = new Request('http://localhost/api/knowledge/upload', {
      method: 'POST',
      body: formData,
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when no file attached', async () => {
    const req = new Request('http://localhost/api/knowledge/upload', {
      method: 'POST',
      body: new FormData(), // empty
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for unsupported file type', async () => {
    const formData = new FormData()
    formData.append('file', new Blob(['test'], { type: 'image/jpeg' }), 'photo.jpg')

    const req = new Request('http://localhost/api/knowledge/upload', {
      method: 'POST',
      body: formData,
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
