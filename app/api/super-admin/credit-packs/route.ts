import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { credit_packs } from '@/lib/schema'
import { requireRole } from '@/lib/auth'
import { asc } from 'drizzle-orm'

export async function GET() {
  try {
    await requireRole('super_admin')
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await db.select().from(credit_packs).orderBy(asc(credit_packs.sort_order))
  return NextResponse.json(rows)
}

const CreateSchema = z.object({
  label: z.string().min(1).max(100),
  price_kobo: z.number().int().min(0),
  credits: z.number().int().min(0),
  sort_order: z.number().int().min(0).default(0),
})

export async function POST(req: Request) {
  try {
    await requireRole('super_admin')
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const [pack] = await db.insert(credit_packs).values(parsed.data).returning()
  return NextResponse.json(pack, { status: 201 })
}
