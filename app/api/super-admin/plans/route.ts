import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { plans } from '@/lib/schema'
import { requireRole } from '@/lib/auth'
import { asc } from 'drizzle-orm'

export async function GET() {
  try {
    await requireRole('super_admin')
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await db.select().from(plans).orderBy(asc(plans.sort_order))
  return NextResponse.json(rows)
}

const CreateSchema = z.object({
  key: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
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

  try {
    const [plan] = await db.insert(plans).values(parsed.data).returning()
    return NextResponse.json(plan, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'Plan key already exists' }, { status: 409 })
    }
    console.error('[super-admin/plans POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
