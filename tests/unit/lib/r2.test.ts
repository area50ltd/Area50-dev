import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase client before importing r2
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://aeyyziqoymjlvgjvrqjw.supabase.co/storage/v1/object/public/area50-files/company-123/mock-uuid-1234/test.pdf' },
        }),
        createSignedUrl: vi.fn().mockResolvedValue({
          data: { signedUrl: 'https://signed-url.example.com/file.pdf' },
          error: null,
        }),
        remove: vi.fn().mockResolvedValue({ error: null }),
      }),
    },
  }),
}))

vi.mock('crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('crypto')>()
  return {
    ...actual,
    randomUUID: vi.fn().mockReturnValue('mock-uuid-1234'),
  }
})

describe('r2 helpers (Supabase Storage)', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://aeyyziqoymjlvgjvrqjw.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key')
  })

  it('uploadFile returns correct key, documentId, and url', async () => {
    const { uploadFile } = await import('@/lib/r2')
    const result = await uploadFile(
      'company-123',
      Buffer.from('test content'),
      'test.pdf',
      'application/pdf'
    )

    expect(result.documentId).toBe('mock-uuid-1234')
    expect(result.key).toBe('company-123/mock-uuid-1234/test.pdf')
    expect(result.url).toContain('company-123/mock-uuid-1234/test.pdf')
  })

  it('getSignedDownloadUrl returns signed URL', async () => {
    const { getSignedDownloadUrl } = await import('@/lib/r2')
    const url = await getSignedDownloadUrl('company-123/doc-id/file.pdf')
    expect(url).toBe('https://signed-url.example.com/file.pdf')
  })

  it('ALLOWED_FILE_TYPES includes expected MIME types', async () => {
    const { ALLOWED_FILE_TYPES } = await import('@/lib/r2')
    expect(ALLOWED_FILE_TYPES['application/pdf']).toBe('pdf')
    expect(ALLOWED_FILE_TYPES['text/plain']).toBe('txt')
    expect(ALLOWED_FILE_TYPES['text/csv']).toBe('csv')
    expect(ALLOWED_FILE_TYPES['application/json']).toBe('json')
    expect(
      ALLOWED_FILE_TYPES['application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    ).toBe('docx')
  })

  it('MAX_FILE_SIZE is 50MB', async () => {
    const { MAX_FILE_SIZE } = await import('@/lib/r2')
    expect(MAX_FILE_SIZE).toBe(50 * 1024 * 1024)
  })
})
