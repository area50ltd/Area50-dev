import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from './db'
import { users } from './schema'
import { eq } from 'drizzle-orm'

export async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null

  try {
    // Look up existing user record
    const existing = await db.query.users.findFirst({ where: eq(users.clerk_id, userId) })
    if (existing) return existing

    // First visit after sign-up — auto-create the user record
    const clerkUser = await currentUser()
    if (!clerkUser) return null

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null

    const [created] = await db
      .insert(users)
      .values({ clerk_id: userId, email, name, role: 'admin' })
      .onConflictDoUpdate({ target: users.clerk_id, set: { email, name } })
      .returning()

    return created ?? null
  } catch {
    // DB not configured yet — return null gracefully
    return null
  }
}

export async function requireRole(...roles: string[]) {
  const user = await getCurrentUser()
  if (!user || !roles.includes(user.role)) throw new Error('Unauthorized')
  return user
}

export async function requireAuth() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')
  return userId
}
