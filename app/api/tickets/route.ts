import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tickets, users } from '@/lib/schema'
import { eq, and, desc, ilike, or } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getCurrentUser()
  if (!user?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const assigned_to = searchParams.get('assigned_to')
  const search = searchParams.get('search')

  const conditions = [eq(tickets.company_id, user.company_id)]

  if (status && status !== 'all') conditions.push(eq(tickets.status, status))
  if (priority) conditions.push(eq(tickets.priority, priority))
  if (assigned_to) conditions.push(eq(tickets.assigned_to, assigned_to))

  const rows = await db
    .select()
    .from(tickets)
    .where(and(...conditions))
    .orderBy(desc(tickets.created_at))
    .limit(100)

  // Simple search filter post-query (category/session_id)
  const filtered = search
    ? rows.filter(
        (t) =>
          t.category?.toLowerCase().includes(search.toLowerCase()) ||
          t.session_id?.toLowerCase().includes(search.toLowerCase()) ||
          t.id.toLowerCase().includes(search.toLowerCase())
      )
    : rows

  return NextResponse.json(filtered)
}
