import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { agents, users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getCurrentUser()
  if (!user?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const rows = await db
    .select({
      agent: agents,
      user: users,
    })
    .from(agents)
    .leftJoin(users, eq(agents.user_id, users.id))
    .where(eq(agents.company_id, user.company_id))

  return NextResponse.json(rows)
}
