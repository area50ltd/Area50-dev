import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { team_messages, team_channels } from '@/lib/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

// GET /api/team-chat/channels/[id]/messages — last 50 messages, oldest first
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  try {
    // Fetch last 50, ordered DESC, then reverse for display
    const rows = await db
      .select()
      .from(team_messages)
      .where(
        and(
          eq(team_messages.channel_id, params.id),
          eq(team_messages.company_id, currentUser.company_id)
        )
      )
      .orderBy(desc(team_messages.created_at))
      .limit(50)

    return NextResponse.json({ messages: rows.reverse() })
  } catch (err) {
    console.error('[team-chat/messages GET]', err)
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 })
  }
}

const SendSchema = z.object({
  content: z.string().min(1).max(4000),
})

// POST /api/team-chat/channels/[id]/messages — send a message
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const body = await req.json()
  const parsed = SendSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    // Verify the channel belongs to this company
    const channel = await db.query.team_channels.findFirst({
      where: and(
        eq(team_channels.id, params.id),
        eq(team_channels.company_id, currentUser.company_id)
      ),
    })
    if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 })

    const [message] = await db
      .insert(team_messages)
      .values({
        channel_id: params.id,
        company_id: currentUser.company_id,
        user_id: currentUser.id,
        author_name: currentUser.name ?? currentUser.email,
        content: parsed.data.content,
      })
      .returning()

    return NextResponse.json({ message }, { status: 201 })
  } catch (err) {
    console.error('[team-chat/messages POST]', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
