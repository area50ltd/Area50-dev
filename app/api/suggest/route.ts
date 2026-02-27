import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { callN8n } from '@/lib/n8n'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

const Schema = z.object({
  ticket_id: z.string().uuid(),
  context: z.string().min(1).max(10000),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.query.users.findFirst({ where: eq(users.clerk_id, userId) })
  if (!user?.company_id) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    const result = await callN8n('/webhook/ai/suggest', {
      company_id: user.company_id,
      ...parsed.data,
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[api/suggest]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
