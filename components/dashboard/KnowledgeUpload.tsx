'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileText, FileSpreadsheet, File } from 'lucide-react'
import { toast } from 'sonner'
import { useUploadDocument } from '@/hooks/useKnowledge'
import { formatFileSize } from '@/lib/utils'
import { ALLOWED_KB_EXTENSIONS } from '@/lib/constants'

const fileIcon = (type: string) => {
  if (type.includes('pdf')) return <File size={16} className="text-red-500" />
  if (type.includes('csv') || type.includes('sheet')) return <FileSpreadsheet size={16} className="text-green-600" />
  return <FileText size={16} className="text-blue-500" />
}

export function KnowledgeUpload() {
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate: uploadDoc, isPending } = useUploadDocument()

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return
    const valid = Array.from(incoming).filter((f) => {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase()
      return ALLOWED_KB_EXTENSIONS.includes(ext as typeof ALLOWED_KB_EXTENSIONS[number])
    })
    if (valid.length < incoming.length) toast.warning('Some files were skipped (unsupported format)')
    setFiles((prev) => [...prev, ...valid])
  }

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx))

  const uploadAll = () => {
    if (files.length === 0) return
    files.forEach((file) => {
      uploadDoc(file, {
        onSuccess: () => toast.success(`${file.name} uploaded and queued for embedding`),
        onError: (err) => toast.error(`Failed to upload ${file.name}: ${err.message}`),
      })
    })
    setFiles([])
  }

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
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* File queue */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 bg-white border border-neutral-100 rounded-xl px-4 py-3"
            >
              {fileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-700 truncate">{file.name}</p>
                <p className="text-xs text-neutral-400">{formatFileSize(file.size)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(idx) }}
                className="text-neutral-300 hover:text-red-400 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          ))}

          <button
            onClick={uploadAll}
            disabled={isPending}
            className="w-full py-2.5 rounded-xl bg-[#E91E8C] text-white text-sm font-semibold hover:bg-[#c91878] disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Uploading...' : `Upload ${files.length} file${files.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  )
}
