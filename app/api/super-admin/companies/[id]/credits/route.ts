import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { companies, credit_transactions } from '@/lib/schema'
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
      await db.insert(credit_transactions).values({
        company_id: params.id,
        type: 'admin_reset',
        amount: 0,
        description: 'Credits reset to 0 by super admin',
      })
    } else {
      await db
        .update(companies)
        .set({ credits: sql`credits + ${amount}` })
        .where(eq(companies.id, params.id))
      await db.insert(credit_transactions).values({
        company_id: params.id,
        type: 'top_up',
        amount: amount!,
        description: `Manual top-up by super admin`,
      })
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
