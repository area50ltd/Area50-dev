import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { plans, companies } from '@/lib/schema'
import { requireRole } from '@/lib/auth'
import { eq } from 'drizzle-orm'

const PatchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  price_kobo: z.number().int().min(0).optional(),
  credits: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole('super_admin')
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  await db
    .update(plans)
    .set({ ...parsed.data, updated_at: new Date() })
    .where(eq(plans.id, params.id))

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole('super_admin')
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get the plan key first
  const [plan] = await db.select({ key: plans.key }).from(plans).where(eq(plans.id, params.id))
  if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

  // Block deletion if any companies are on this plan
  const companiesOnPlan = await db
    .select({ id: companies.id })
    .from(companies)
    .where(eq(companies.plan, plan.key))
    .limit(1)

  if (companiesOnPlan.length > 0) {
    return NextResponse.json(
      { error: `Cannot delete — ${companiesOnPlan.length > 0 ? 'companies are currently on this plan' : ''}` },
      { status: 409 }
    )
  }

  await db.delete(plans).where(eq(plans.id, params.id))
  return NextResponse.json({ success: true })
}
