import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET = 'area50-files'

export async function uploadFile(
  companyId: string,
  file: Buffer,
  filename: string,
  contentType: string
) {
  const documentId = randomUUID()
  const key = `${companyId}/${documentId}/${filename}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, file, { contentType, upsert: false })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key)

  return {
    key,
    documentId,
    url: data.publicUrl,
  }
}

export async function getSignedDownloadUrl(key: string) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(key, 3600)

  if (error) throw new Error(`Failed to create signed URL: ${error.message}`)
  return data.signedUrl
}

export async function deleteFile(key: string) {
  const { error } = await supabase.storage.from(BUCKET).remove([key])
  if (error) throw new Error(`Failed to delete file: ${error.message}`)
}

export const ALLOWED_FILE_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'text/csv': 'csv',
  'application/json': 'json',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
}

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
