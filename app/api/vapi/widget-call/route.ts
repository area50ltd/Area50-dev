import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { companies } from '@/lib/schema'
import { eq } from 'drizzle-orm'

const QuerySchema = z.object({
  company_id: z.string().uuid(),
})

// Public route — no Clerk auth (widget has no user session)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const parsed = QuerySchema.safeParse({ company_id: searchParams.get('company_id') })
  if (!parsed.success) return NextResponse.json({ error: 'Invalid company_id' }, { status: 400 })

  const company = await db.query.companies.findFirst({
    where: eq(companies.id, parsed.data.company_id),
  })

  if (!company?.vapi_assistant_id) {
    return NextResponse.json({ error: 'Voice not configured for this company' }, { status: 404 })
  }

  return NextResponse.json({
    assistant_id: company.vapi_assistant_id,
    public_key: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? '',
  })
}
