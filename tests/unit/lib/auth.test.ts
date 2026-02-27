import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
  },
}))

describe('auth helpers', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getCurrentUser', () => {
    it('returns null when not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server')
      vi.mocked(auth).mockResolvedValue({ userId: null } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)

      const { getCurrentUser } = await import('@/lib/auth')
      const user = await getCurrentUser()
      expect(user).toBeNull()
    })

    it('queries DB by clerk_id when authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server')
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_abc' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)

      const { db } = await import('@/lib/db')
      const mockUser = { id: 'user-1', clerk_id: 'clerk_abc', role: 'admin', company_id: 'co-1', email: 'a@b.com', name: 'Test', is_active: true, phone: null, created_at: new Date() }
      vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser)

      const { getCurrentUser } = await import('@/lib/auth')
      const user = await getCurrentUser()
      expect(user).toEqual(mockUser)
    })
  })

  describe('requireRole', () => {
    it('throws Unauthorized when user not found', async () => {
      const { auth } = await import('@clerk/nextjs/server')
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_xyz' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)

      const { db } = await import('@/lib/db')
      vi.mocked(db.query.users.findFirst).mockResolvedValue(undefined)

      const { requireRole } = await import('@/lib/auth')
      await expect(requireRole('admin')).rejects.toThrow('Unauthorized')
    })

    it('throws Unauthorized when role does not match', async () => {
      const { auth } = await import('@clerk/nextjs/server')
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_agent' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)

      const { db } = await import('@/lib/db')
      vi.mocked(db.query.users.findFirst).mockResolvedValue({
        id: 'u-2', clerk_id: 'clerk_agent', role: 'agent', company_id: 'co-1', email: 'agent@b.com', name: 'Agent', is_active: true, phone: null, created_at: new Date(),
      })

      const { requireRole } = await import('@/lib/auth')
      await expect(requireRole('admin', 'super_admin')).rejects.toThrow('Unauthorized')
    })

    it('returns user when role matches', async () => {
      const { auth } = await import('@clerk/nextjs/server')
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_admin' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)

      const mockUser = { id: 'u-3', clerk_id: 'clerk_admin', role: 'admin', company_id: 'co-1', email: 'admin@b.com', name: 'Admin', is_active: true, phone: null, created_at: new Date() }
      const { db } = await import('@/lib/db')
      vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser)

      const { requireRole } = await import('@/lib/auth')
      const user = await requireRole('admin')
      expect(user).toEqual(mockUser)
    })
  })
})
