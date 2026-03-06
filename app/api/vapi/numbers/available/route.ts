import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { searchAvailableByCountry } from '@/lib/vapi'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.query.users.findFirst({ where: eq(users.clerk_id, userId) })
  if (!user?.company_id) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const country = searchParams.get('country') ?? 'US'
  const areaCode = searchParams.get('area_code') ?? undefined

  try {
    const numbers = await searchAvailableByCountry(country, areaCode)
    return NextResponse.json(numbers)
  } catch (err) {
    console.error('[api/vapi/numbers/available]', err)
    return NextResponse.json({ error: 'Failed to fetch available numbers' }, { status: 500 })
  }
}
