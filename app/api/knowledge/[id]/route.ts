import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { knowledge_documents } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'
import { deleteFile } from '@/lib/r2'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getCurrentUser()
  if (!user?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const doc = await db.query.knowledge_documents.findFirst({
    where: and(
      eq(knowledge_documents.id, params.id),
      eq(knowledge_documents.company_id, user.company_id)
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
