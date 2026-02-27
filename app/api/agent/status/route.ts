import { auth } from '@clerk/nextjs/server'
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
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  await db
    .update(agents)
    .set({ status: parsed.data.status })
    .where(eq(agents.user_id, user.id))

  return NextResponse.json({ success: true })
}
