import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users, companies } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.query.users.findFirst({ where: eq(users.clerk_id, userId) })
  if (!user?.company_id) return NextResponse.json(null)

  const company = await db.query.companies.findFirst({
    where: eq(companies.id, user.company_id),
  })

  return NextResponse.json(company ?? null)
}
