import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { knowledge_documents } from '@/lib/schema'
import { uploadFile, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/r2'
import { callN8n } from '@/lib/n8n'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getCurrentUser()
  if (!user?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 })
    }

    const contentType = file.type
    const fileExt = ALLOWED_FILE_TYPES[contentType]
    if (!fileExt) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { key, documentId, url } = await uploadFile(
      user.company_id,
      buffer,
      file.name,
      contentType
    )

    // Save to DB as processing — return 200 immediately, embed in background
    await db.insert(knowledge_documents).values({
      id: documentId,
      company_id: user.company_id,
      filename: file.name,
      file_type: fileExt,
      file_size: file.size,
      r2_key: key,
      r2_url: url,
      embedding_status: 'processing',
    })

    // Fire n8n ingestion without awaiting — embedding takes 10-30s
    // Update DB status when it completes in the background
    void callN8n('/webhook/knowledge/ingest', {
      company_id: user.company_id,
      document_id: documentId,
      file_url: url,
      file_type: fileExt,
      filename: file.name,
    })
      .then(async () => {
        await db
          .update(knowledge_documents)
          .set({ embedding_status: 'completed' })
          .where(eq(knowledge_documents.id, documentId))
      })
      .catch(async (err) => {
        console.error('[knowledge/ingest background]', err)
        await db
          .update(knowledge_documents)
          .set({ embedding_status: 'error' })
          .where(eq(knowledge_documents.id, documentId))
      })

    return NextResponse.json({ success: true, documentId, url })
  } catch (err) {
    console.error('[api/knowledge/upload]', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
