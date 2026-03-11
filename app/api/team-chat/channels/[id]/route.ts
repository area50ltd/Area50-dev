import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { team_channels, team_messages } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

// DELETE /api/team-chat/channels/[id]
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  try {
    // Verify channel belongs to this company
    const channel = await db.query.team_channels.findFirst({
      where: and(
        eq(team_channels.id, params.id),
        eq(team_channels.company_id, currentUser.company_id)
      ),
    })
    if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 })

    // Delete messages first, then channel
    await db.delete(team_messages).where(eq(team_messages.channel_id, params.id))
    await db.delete(team_channels).where(eq(team_channels.id, params.id))

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[team-chat/channels DELETE]', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
