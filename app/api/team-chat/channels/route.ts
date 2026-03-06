import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { team_channels } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

// GET /api/team-chat/channels — list all channels for the company
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getCurrentUser()
  if (!user?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  try {
    const channels = await db
      .select()
      .from(team_channels)
      .where(eq(team_channels.company_id, user.company_id))
      .orderBy(team_channels.created_at)

    return NextResponse.json({ channels, current_user_id: user.id })
  } catch (err) {
    console.error('[team-chat/channels GET]', err)
    return NextResponse.json({ error: 'Failed to load channels' }, { status: 500 })
  }
}

const CreateSchema = z.object({
  name: z.string().min(1).max(100).transform((s) => s.toLowerCase().replace(/\s+/g, '-')),
  description: z.string().max(255).optional(),
})

// POST /api/team-chat/channels — create a channel
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getCurrentUser()
  if (!user?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const body = await req.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    const [channel] = await db
      .insert(team_channels)
      .values({
        company_id: user.company_id,
        name: parsed.data.name,
        description: parsed.data.description,
        created_by: user.id,
      })
      .returning()

    return NextResponse.json({ channel }, { status: 201 })
  } catch (err) {
    console.error('[team-chat/channels POST]', err)
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 })
  }
}
