'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileText, FileSpreadsheet, File, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useUploadDocument } from '@/hooks/useKnowledge'
import { formatFileSize } from '@/lib/utils'
import { ALLOWED_KB_EXTENSIONS } from '@/lib/constants'

type FileState = { file: File; status: 'queued' | 'uploading' | 'done' | 'error' }

const fileIcon = (type: string) => {
  if (type.includes('pdf')) return <File size={16} className="text-red-500" />
  if (type.includes('csv') || type.includes('sheet')) return <FileSpreadsheet size={16} className="text-green-600" />
  return <FileText size={16} className="text-blue-500" />
}

export function KnowledgeUpload() {
  const [dragging, setDragging] = useState(false)
  const [fileStates, setFileStates] = useState<FileState[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate: uploadDoc } = useUploadDocument()

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return
    const valid = Array.from(incoming).filter((f) => {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase()
      return ALLOWED_KB_EXTENSIONS.includes(ext as typeof ALLOWED_KB_EXTENSIONS[number])
    })
    if (valid.length < incoming.length) toast.warning('Some files were skipped (unsupported format)')
    setFileStates((prev) => [...prev, ...valid.map((file) => ({ file, status: 'queued' as const }))])
  }

  const removeFile = (idx: number) =>
    setFileStates((prev) => prev.filter((_, i) => i !== idx))

  const setStatus = (idx: number, status: FileState['status']) =>
    setFileStates((prev) => prev.map((f, i) => (i === idx ? { ...f, status } : f)))

  const uploadAll = () => {
    const queued = fileStates.filter((f) => f.status === 'queued')
    if (queued.length === 0) return

    fileStates.forEach((entry, idx) => {
      if (entry.status !== 'queued') return
      setStatus(idx, 'uploading')
      uploadDoc(entry.file, {
        onSuccess: () => {
          setStatus(idx, 'done')
          toast.success(`${entry.file.name} uploaded and queued for embedding`)
          // Remove done files after a short delay so user sees the checkmark
          setTimeout(() => setFileStates((prev) => prev.filter((_, i) => i !== idx)), 1500)
        },
        onError: (err) => {
          setStatus(idx, 'error')
          toast.error(`Failed to upload ${entry.file.name}: ${err.message}`)
        },
      })
    })
  }

  const queued = fileStates.filter((f) => f.status === 'queued')
  const anyUploading = fileStates.some((f) => f.status === 'uploading')

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragging
            ? 'border-[#E91E8C] bg-[#FDE7F3]/40 scale-[1.01]'
            : 'border-neutral-200 hover:border-[#E91E8C]/40 hover:bg-neutral-50'
        }`}
      >
        <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-3">
          <Upload size={22} className="text-neutral-400" />
        </div>
        <p className="font-medium text-neutral-700 mb-1">Drop files here or click to browse</p>
        <p className="text-neutral-400 text-xs">
          {ALLOWED_KB_EXTENSIONS.join(', ')} · Max 50MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.csv,.docx,.json"
          className="hidden"
          onChange={(e) => { addFiles(e.target.files); e.target.value = '' }}
        />
      </div>

      {/* File queue */}
      {fileStates.length > 0 && (
        <div className="space-y-2">
          {fileStates.map((entry, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 border rounded-xl px-4 py-3 transition-colors ${
                entry.status === 'uploading'
                  ? 'bg-[#FDE7F3]/40 border-[#E91E8C]/20'
                  : entry.status === 'done'
                  ? 'bg-green-50 border-green-100'
                  : entry.status === 'error'
                  ? 'bg-red-50 border-red-100'
                  : 'bg-white border-neutral-100'
              }`}
            >
              {fileIcon(entry.file.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-700 truncate">{entry.file.name}</p>
                <p className="text-xs text-neutral-400">
                  {formatFileSize(entry.file.size)} ·{' '}
                  <span className={
                    entry.status === 'uploading' ? 'text-[#E91E8C]'
                    : entry.status === 'done' ? 'text-green-600'
                    : entry.status === 'error' ? 'text-red-500'
                    : 'text-neutral-400'
                  }>
                    {entry.status === 'uploading' ? 'Uploading...'
                      : entry.status === 'done' ? 'Done'
                      : entry.status === 'error' ? 'Failed'
                      : 'Ready'}
                  </span>
                </p>
              </div>
              {entry.status === 'uploading' && (
                <Loader2 size={15} className="text-[#E91E8C] animate-spin shrink-0" />
              )}
              {entry.status === 'done' && (
                <CheckCircle2 size={15} className="text-green-500 shrink-0" />
              )}
              {(entry.status === 'queued' || entry.status === 'error') && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(idx) }}
                  className="text-neutral-300 hover:text-red-400 transition-colors shrink-0"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          ))}

          {queued.length > 0 && (
            <button
              onClick={uploadAll}
              disabled={anyUploading}
              className="w-full py-2.5 rounded-xl bg-[#E91E8C] text-white text-sm font-semibold hover:bg-[#c91878] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {anyUploading ? (
                <><Loader2 size={15} className="animate-spin" /> Uploading...</>
              ) : (
                `Upload ${queued.length} file${queued.length > 1 ? 's' : ''}`
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
