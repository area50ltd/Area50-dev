import { auth } from '@clerk/nextjs/server'
import { db } from './db'
import { users } from './schema'
import { eq } from 'drizzle-orm'

export async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null
  return db.query.users.findFirst({ where: eq(users.clerk_id, userId) })
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
