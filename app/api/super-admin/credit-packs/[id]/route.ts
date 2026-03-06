import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { credit_packs } from '@/lib/schema'
import { requireRole } from '@/lib/auth'
import { eq } from 'drizzle-orm'

const PatchSchema = z.object({
  label: z.string().min(1).max(100).optional(),
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
    .update(credit_packs)
    .set({ ...parsed.data, updated_at: new Date() })
    .where(eq(credit_packs.id, params.id))

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

  await db.delete(credit_packs).where(eq(credit_packs.id, params.id))
  return NextResponse.json({ success: true })
}
