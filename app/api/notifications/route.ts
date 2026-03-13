import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tickets, companies, knowledge_documents } from '@/lib/schema'
import { eq, and, gte, lt, desc } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const since = new Date(Date.now() - 48 * 60 * 60 * 1000) // last 48h

  const [company, escalatedTickets, erroredDocs] = await Promise.all([
    db.query.companies.findFirst({ where: eq(companies.id, currentUser.company_id) }),
    db
      .select({ id: tickets.id, status: tickets.status, created_at: tickets.created_at, updated_at: tickets.updated_at })
      .from(tickets)
      .where(
        and(
          eq(tickets.company_id, currentUser.company_id),
          eq(tickets.status, 'escalated'),
          gte(tickets.updated_at, since),
        ),
      )
      .orderBy(desc(tickets.updated_at))
      .limit(5),
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

  // Low credit warning
  if (company && (company.credits ?? 0) < (company.low_credit_threshold ?? 500)) {
    notifications.push({
      id: 'low-credits',
      type: 'warning',
      title: 'Low Credits',
      description: `You have ${company.credits ?? 0} credits remaining. Top up to keep AI responses running.`,
      href: '/dashboard/billing',
      created_at: new Date().toISOString(),
    })
  }

  // Escalated tickets
  for (const t of escalatedTickets) {
    notifications.push({
      id: `escalated-${t.id}`,
      type: 'escalation',
      title: 'Ticket Escalated',
      description: `A ticket needs human attention (ID: ${t.id.slice(0, 8)}…)`,
      href: `/dashboard/tickets/${t.id}`,
      created_at: t.updated_at?.toISOString() ?? t.created_at?.toISOString() ?? new Date().toISOString(),
    })
  }

  // Errored knowledge documents
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

  // Sort by most recent
  notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return NextResponse.json({ notifications, unread: notifications.length })
}
