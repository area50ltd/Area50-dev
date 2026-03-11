import { z } from 'zod'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { agents, users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

const Schema = z.object({
  status: z.enum(['online', 'away', 'offline']),
})

export async function PATCH(req: Request) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  await db
    .update(agents)
    .set({ status: parsed.data.status })
    .where(eq(agents.user_id, currentUser.id))

  return NextResponse.json({ success: true })
}
