import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { companies } from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'
import { requireRole } from '@/lib/auth'

const Schema = z.object({
  action: z.enum(['add', 'reset']),
  amount: z.number().int().min(1).optional(), // required for 'add'
})

// POST /api/super-admin/companies/[id]/credits
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await requireRole('super_admin').catch(() => null)
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { action, amount } = parsed.data

  if (action === 'add' && (!amount || amount <= 0)) {
    return NextResponse.json({ error: 'Amount required for add action' }, { status: 400 })
  }

  try {
    if (action === 'reset') {
      await db
        .update(companies)
        .set({ credits: 0 })
        .where(eq(companies.id, params.id))
    } else {
      await db
        .update(companies)
        .set({ credits: sql`credits + ${amount}` })
        .where(eq(companies.id, params.id))
    }

    // Read back the new balance
    const [company] = await db
      .select({ credits: companies.credits })
      .from(companies)
      .where(eq(companies.id, params.id))

    return NextResponse.json({ success: true, new_balance: company?.credits ?? 0 })
  } catch (err) {
    console.error('[super-admin/companies/credits POST]', err)
    return NextResponse.json({ error: 'Credits update failed' }, { status: 500 })
  }
}
