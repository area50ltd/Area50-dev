import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { companies } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { requireRole } from '@/lib/auth'

const PatchSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  plan: z.enum(['starter', 'growth', 'business']).optional(),
  is_active: z.boolean().optional(),
})

// PATCH /api/super-admin/companies/[id] — update org details
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireRole('super_admin').catch(() => null)
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  try {
    await db
      .update(companies)
      .set({ ...parsed.data, updated_at: new Date() })
      .where(eq(companies.id, params.id))

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[super-admin/companies PATCH]', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

// DELETE /api/super-admin/companies/[id] — permanently delete org
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireRole('super_admin').catch(() => null)
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    await db.delete(companies).where(eq(companies.id, params.id))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[super-admin/companies DELETE]', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
