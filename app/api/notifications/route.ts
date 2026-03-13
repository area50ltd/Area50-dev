import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tickets, companies, knowledge_documents } from '@/lib/schema'
import { eq, and, gte, desc } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

const STATUS_LABELS: Record<string, string> = {
  open: 'New ticket opened',
  in_progress: 'Ticket in progress',
  escalated: 'Ticket escalated to human',
  resolved: 'Ticket resolved',
  closed: 'Ticket closed',
}

const CHANNEL_LABELS: Record<string, string> = {
  web_widget: 'Web widget',
  whatsapp: 'WhatsApp',
  voice_inbound: 'Voice call',
}

export async function GET() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const since = new Date(Date.now() - 72 * 60 * 60 * 1000) // last 72h

  const [company, recentTickets, erroredDocs] = await Promise.all([
    db.query.companies.findFirst({ where: eq(companies.id, currentUser.company_id) }),
    db
      .select({
        id: tickets.id,
        status: tickets.status,
        channel: tickets.channel,
        category: tickets.category,
        assigned_to: tickets.assigned_to,
        created_at: tickets.created_at,
        updated_at: tickets.updated_at,
      })
      .from(tickets)
      .where(
        and(
          eq(tickets.company_id, currentUser.company_id),
          gte(tickets.updated_at, since),
        ),
      )
      .orderBy(desc(tickets.updated_at))
      .limit(15),
    db
      .select({ id: knowledge_documents.id, filename: knowledge_documents.filename, created_at: knowledge_documents.created_at })
      .from(knowledge_documents)
      .where(
        and(
          eq(knowledge_documents.company_id, currentUser.company_id),
          eq(knowledge_documents.embedding_status, 'error'),
          gte(knowledge_documents.created_at, since),
        ),
      )
      .limit(3),
  ])

  const notifications: { id: string; type: string; title: string; description: string; href: string; created_at: string }[] = []

  // Low credit warning (pinned at top)
  if (company && (company.credits ?? 0) < (company.low_credit_threshold ?? 500)) {
    notifications.push({
      id: 'low-credits',
      type: 'warning',
      title: 'Low Credits',
      description: `Only ${company.credits ?? 0} credits remaining. Top up to keep AI responses running.`,
      href: '/dashboard/billing',
      created_at: new Date().toISOString(),
    })
  }

  // Errored KB documents
  for (const doc of erroredDocs) {
    notifications.push({
      id: `kb-error-${doc.id}`,
      type: 'error',
      title: 'Knowledge Base Error',
      description: `"${doc.filename}" failed to embed. Click to retry.`,
      href: '/dashboard/knowledge',
      created_at: doc.created_at?.toISOString() ?? new Date().toISOString(),
    })
  }

  // Recent ticket activity — escalations get special type, others are info/activity
  for (const t of recentTickets) {
    const isEscalation = t.status === 'escalated'
    const channel = CHANNEL_LABELS[t.channel ?? ''] ?? t.channel ?? 'Unknown'
    const category = t.category ? ` · ${t.category}` : ''
    notifications.push({
      id: `ticket-${t.id}-${t.status}`,
      type: isEscalation ? 'escalation' : t.status === 'resolved' ? 'info' : 'info',
      title: STATUS_LABELS[t.status ?? ''] ?? 'Ticket updated',
      description: `${channel}${category} · ID: ${t.id.slice(0, 8)}… · ${t.assigned_to === 'human' ? 'Assigned to agent' : 'Handled by AI'}`,
      href: `/dashboard/tickets/${t.id}`,
      created_at: t.updated_at?.toISOString() ?? t.created_at?.toISOString() ?? new Date().toISOString(),
    })
  }

  // Sort by most recent, alerts always first
  notifications.sort((a, b) => {
    const priority = (type: string) => type === 'warning' || type === 'error' ? 0 : 1
    const pa = priority(a.type), pb = priority(b.type)
    if (pa !== pb) return pa - pb
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  // Unread = alerts + escalations + anything in last 1h
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  const unread = notifications.filter(
    (n) => n.type === 'warning' || n.type === 'error' || n.type === 'escalation'
      || new Date(n.created_at).getTime() > oneHourAgo
  ).length

  return NextResponse.json({ notifications: notifications.slice(0, 20), unread })
}
