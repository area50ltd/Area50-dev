import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, companies } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { deletePhoneNumber } from '@/lib/vapi'

export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.query.users.findFirst({ where: eq(users.clerk_id, userId) })
  if (!user?.company_id) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  const company = await db.query.companies.findFirst({ where: eq(companies.id, user.company_id) })
  if (!company?.vapi_phone_number_id) {
    return NextResponse.json({ error: 'No phone number to release' }, { status: 404 })
  }

  try {
    await deletePhoneNumber(company.vapi_phone_number_id)
  } catch (err) {
    console.error('[api/vapi/numbers/release] Vapi delete failed:', err)
    // Even if Vapi call fails, clear the number from DB so admin isn't stuck
  }

  await db.update(companies)
    .set({ vapi_phone_number: null, vapi_phone_number_id: null })
    .where(eq(companies.id, user.company_id))

  return NextResponse.json({ success: true })
}
