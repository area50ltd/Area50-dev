import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { companies, tickets } from '@/lib/schema'
import { count, eq, sql } from 'drizzle-orm'
import { requireRole } from '@/lib/auth'

// GET /api/super-admin/companies — list all companies with ticket counts
export async function GET() {
  const user = await requireRole('super_admin').catch(() => null)
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    // All companies ordered by newest first
    const allCompanies = await db
      .select({
        id: companies.id,
        name: companies.name,
        email: companies.email,
        plan: companies.plan,
        credits: companies.credits,
        is_active: companies.is_active,
        created_at: companies.created_at,
      })
      .from(companies)
      .orderBy(sql`${companies.created_at} DESC`)

    // Ticket counts per company
    const ticketCounts = await db
      .select({ company_id: tickets.company_id, count: count() })
      .from(tickets)
      .groupBy(tickets.company_id)

    const countMap = Object.fromEntries(
      ticketCounts.map((r) => [r.company_id, r.count])
    )

    const data = allCompanies.map((c) => ({
      ...c,
      ticketCount: countMap[c.id] ?? 0,
    }))

    return NextResponse.json({ companies: data })
  } catch (err) {
    console.error('[super-admin/companies GET]', err)
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
  }
}

// POST /api/super-admin/companies — create a new organization
const CreateSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  plan: z.enum(['starter', 'growth', 'business']).default('starter'),
  credits: z.number().int().min(0).default(500),
})

export async function POST(req: Request) {
  const user = await requireRole('super_admin').catch(() => null)
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    const [company] = await db
      .insert(companies)
      .values({
        name: parsed.data.name,
        email: parsed.data.email,
        plan: parsed.data.plan,
        credits: parsed.data.credits,
      })
      .returning({
        id: companies.id,
        name: companies.name,
        email: companies.email,
        plan: companies.plan,
        credits: companies.credits,
        is_active: companies.is_active,
        created_at: companies.created_at,
      })

    return NextResponse.json({ company: { ...company, ticketCount: 0 } }, { status: 201 })
  } catch (err: unknown) {
    console.error('[super-admin/companies POST]', err)
    const msg = err instanceof Error && err.message.includes('unique')
      ? 'Email already in use'
      : 'Failed to create company'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
