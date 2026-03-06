import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq, and, ne } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

// GET /api/users — all users in the current user's company
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const currentUser = await getCurrentUser()
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  try {
    const companyUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        is_active: users.is_active,
        created_at: users.created_at,
      })
      .from(users)
      .where(
        and(
          eq(users.company_id, currentUser.company_id),
          // Exclude super_admin accounts from this list
          ne(users.role, 'super_admin')
        )
      )
      .orderBy(users.created_at)

    return NextResponse.json({ users: companyUsers })
  } catch (err) {
    console.error('[api/users GET]', err)
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 })
  }
}
