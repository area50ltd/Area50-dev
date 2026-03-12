import { cache } from 'react'
import { createClient } from './supabase/server'
import { db } from './db'
import { users } from './schema'
import { eq } from 'drizzle-orm'

// cache() deduplicates this function within a single server render / request lifecycle.
// If getCurrentUser() is called multiple times (e.g., layout + page), getUser()
// only hits the Supabase Auth server once.
export const getCurrentUser = cache(async function getCurrentUser() {
  try {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return null

    // Look up existing user record (clerk_id column stores the Supabase auth user UUID)
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.clerk_id, authUser.id))
      .limit(1)
    if (existing) return existing

    // First login — auto-create user row
    const name = (authUser.user_metadata?.full_name as string | undefined)
      ?? (authUser.user_metadata?.name as string | undefined)
      ?? null

    const [created] = await db
      .insert(users)
      .values({
        clerk_id: authUser.id,
        email: authUser.email ?? '',
        name,
        role: 'admin',
      })
      .onConflictDoUpdate({
        target: users.clerk_id,
        set: { email: authUser.email ?? '' },
      })
      .returning()

    return created ?? null
  } catch (err) {
    console.error('[getCurrentUser] failed:', err)
    return null
  }
})

export async function requireRole(...roles: string[]) {
  const user = await getCurrentUser()
  if (!user || !roles.includes(user.role)) throw new Error('Unauthorized')
  return user
}

export async function requireAuth() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user.id
}
