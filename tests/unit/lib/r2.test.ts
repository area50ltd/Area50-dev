import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the S3 client before importing r2
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(() => ({
    send: vi.fn().mockResolvedValue({}),
  })),
  PutObjectCommand: vi.fn(),
  GetObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
}))

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://signed-url.example.com/file.pdf'),
}))

vi.mock('crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('crypto')>()
  return {
    ...actual,
    randomUUID: vi.fn().mockReturnValue('mock-uuid-1234'),
  }
})

describe('r2 helpers', () => {
  beforeEach(() => {
    vi.stubEnv('R2_ACCOUNT_ID', 'test-account-id')
    vi.stubEnv('R2_ACCESS_KEY_ID', 'test-access-key')
    vi.stubEnv('R2_SECRET_ACCESS_KEY', 'test-secret')
    vi.stubEnv('R2_BUCKET_NAME', 'area50-files')
    vi.stubEnv('NEXT_PUBLIC_R2_PUBLIC_URL', 'https://files.example.com')
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
    expect(result.url).toBe('https://files.example.com/company-123/mock-uuid-1234/test.pdf')
  })

  it('getSignedDownloadUrl returns presigned URL', async () => {
    const { getSignedDownloadUrl } = await import('@/lib/r2')
    const url = await getSignedDownloadUrl('company-123/doc-id/file.pdf')
    expect(url).toBe('https://signed-url.example.com/file.pdf')
  })

  it('ALLOWED_FILE_TYPES includes expected types', async () => {
    const { ALLOWED_FILE_TYPES } = await import('@/lib/r2')
    expect(ALLOWED_FILE_TYPES).toContain('application/pdf')
    expect(ALLOWED_FILE_TYPES).toContain('text/plain')
    expect(ALLOWED_FILE_TYPES).toContain('text/csv')
  })

  it('MAX_FILE_SIZE is 50MB', async () => {
    const { MAX_FILE_SIZE } = await import('@/lib/r2')
    expect(MAX_FILE_SIZE).toBe(50 * 1024 * 1024)
  })
})
