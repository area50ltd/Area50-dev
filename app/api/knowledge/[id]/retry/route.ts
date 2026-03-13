import { NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { knowledge_documents } from '@/lib/schema'
import { callN8n } from '@/lib/n8n'
import { getCurrentUser } from '@/lib/auth'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const doc = await db.query.knowledge_documents.findFirst({
    where: and(
      eq(knowledge_documents.id, params.id),
      eq(knowledge_documents.company_id, currentUser.company_id),
    ),
  })
  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

  await db
    .update(knowledge_documents)
    .set({ embedding_status: 'processing' })
    .where(eq(knowledge_documents.id, params.id))

  try {
    await callN8n('/webhook/knowledge/ingest', {
      company_id: currentUser.company_id,
      document_id: doc.id,
      file_url: doc.r2_url,
      file_type: doc.file_type,
      filename: doc.filename,
    })
    await db
      .update(knowledge_documents)
      .set({ embedding_status: 'completed' })
      .where(eq(knowledge_documents.id, params.id))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[knowledge/retry]', err)
    await db
      .update(knowledge_documents)
      .set({ embedding_status: 'error' })
      .where(eq(knowledge_documents.id, params.id))
    return NextResponse.json({ error: 'Embedding failed' }, { status: 502 })
  }
}
