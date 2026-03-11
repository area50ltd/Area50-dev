import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { knowledge_documents } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'
import { deleteFile } from '@/lib/r2'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!currentUser?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const doc = await db.query.knowledge_documents.findFirst({
    where: and(
      eq(knowledge_documents.id, params.id),
      eq(knowledge_documents.company_id, currentUser.company_id)
    ),
  })
  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

  // Delete from storage
  if (doc.r2_key) {
    try {
      await deleteFile(doc.r2_key)
    } catch {
      // Storage deletion failure is non-fatal — continue with DB deletion
    }
  }

  await db.delete(knowledge_documents).where(eq(knowledge_documents.id, params.id))

  return NextResponse.json({ success: true })
}
