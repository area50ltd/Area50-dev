import { z } from 'zod'
import { NextResponse } from 'next/server'
import { callN8n } from '@/lib/n8n'
import { getCurrentUser } from '@/lib/auth'

const Schema = z.object({
  query: z.string().min(1).max(500),
})

export async function POST(req: Request) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    const result = await callN8n('/webhook/knowledge/search', {
      company_id: currentUser.company_id,
      query: parsed.data.query,
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[api/knowledge/search]', err)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
