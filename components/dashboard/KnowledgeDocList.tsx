'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { File, FileText, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, Clock, Trash2, ExternalLink, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, formatFileSize } from '@/lib/utils'
import { Skeleton } from '@/components/shared/LoadingSkeleton'
import type { KnowledgeDocument } from '@/lib/types'

const statusConfig: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
  pending: { icon: <Clock size={13} />, label: 'Pending', className: 'bg-gray-100 text-gray-500' },
  processing: { icon: <Loader2 size={13} className="animate-spin" />, label: 'Embedding...', className: 'bg-yellow-50 text-yellow-600' },
  completed: { icon: <CheckCircle2 size={13} />, label: 'Completed', className: 'bg-green-50 text-green-600' },
  error: { icon: <AlertCircle size={13} />, label: 'Error', className: 'bg-red-50 text-red-500' },
}

const typeIcon = (type: string) => {
  if (type === 'pdf') return <File size={16} className="text-red-500" />
  if (type === 'csv') return <FileSpreadsheet size={16} className="text-green-600" />
  return <FileText size={16} className="text-blue-500" />
}

interface KnowledgeDocListProps {
  docs: KnowledgeDocument[]
  isLoading: boolean
}

function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/knowledge/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Delete failed')
      }
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['knowledge'] }),
  })
}

function useRetryDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/knowledge/${id}/retry`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Retry failed')
      }
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['knowledge'] }),
  })
}

export function KnowledgeDocList({ docs, isLoading }: KnowledgeDocListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [retryingId, setRetryingId] = useState<string | null>(null)
  const { mutate: deleteDoc } = useDeleteDocument()
  const { mutate: retryDoc } = useRetryDocument()

  const handleRetry = (doc: KnowledgeDocument) => {
    setRetryingId(doc.id)
    retryDoc(doc.id, {
      onSuccess: () => {
        toast.success(`"${doc.filename}" re-embedded successfully`)
        setRetryingId(null)
      },
      onError: (err) => {
        toast.error(`Retry failed: ${err.message}`)
        setRetryingId(null)
      },
    })
  }

  const handleDelete = (doc: KnowledgeDocument) => {
    setDeletingId(doc.id)
    deleteDoc(doc.id, {
      onSuccess: () => {
        toast.success(`"${doc.filename}" deleted`)
        setDeletingId(null)
      },
      onError: (err) => {
        toast.error(`Failed to delete: ${err.message}`)
        setDeletingId(null)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 bg-white rounded-xl border border-neutral-100">
            <Skeleton className="w-8 h-8 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  if (docs.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-400 text-sm">
        No documents uploaded yet
      </div>
    )
  }

  return (
    <>
      {/* ── Mobile card list (< sm) ─────────────────────────────────────── */}
      <div className="sm:hidden space-y-2">
        {docs.map((doc) => {
          const status = statusConfig[doc.embedding_status ?? 'pending']
          const isDeleting = deletingId === doc.id
          const isRetrying = retryingId === doc.id
          const canRetry = doc.embedding_status === 'error' || doc.embedding_status === 'processing'
          return (
            <div key={doc.id} className="bg-white rounded-xl border border-neutral-100 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{typeIcon(doc.file_type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-700 text-sm truncate">{doc.filename}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${status.className}`}>
                      {status.icon} {status.label}
                    </span>
                    <span className="text-xs text-neutral-400 uppercase">{doc.file_type}</span>
                    {doc.file_size && <span className="text-xs text-neutral-400">{formatFileSize(doc.file_size)}</span>}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">{formatDate(doc.created_at)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {canRetry && (
                    <button onClick={() => handleRetry(doc)} disabled={isRetrying} className="p-1.5 hover:bg-violet-50 rounded-lg text-neutral-400 hover:text-violet-600 disabled:opacity-40">
                      {isRetrying ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    </button>
                  )}
                  {doc.r2_url && (
                    <a href={doc.r2_url} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-700">
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <button onClick={() => handleDelete(doc)} disabled={isDeleting} className="p-1.5 hover:bg-red-50 rounded-lg text-neutral-400 hover:text-red-500 disabled:opacity-40">
                    {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Desktop table (sm+) ─────────────────────────────────────────── */}
      <div className="hidden sm:block bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">File</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Size</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Added</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Status</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {docs.map((doc) => {
                const status = statusConfig[doc.embedding_status ?? 'pending']
                const isDeleting = deletingId === doc.id
                const isRetrying = retryingId === doc.id
                const canRetry = doc.embedding_status === 'error' || doc.embedding_status === 'processing'
                return (
                  <tr key={doc.id} className="hover:bg-neutral-50/60 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">{typeIcon(doc.file_type)}<span className="font-medium text-neutral-700 text-sm">{doc.filename}</span></div>
                    </td>
                    <td className="px-4 py-3.5"><span className="text-xs uppercase font-semibold text-neutral-400">{doc.file_type}</span></td>
                    <td className="px-4 py-3.5 text-xs text-neutral-400">{doc.file_size ? formatFileSize(doc.file_size) : '—'}</td>
                    <td className="px-4 py-3.5 text-xs text-neutral-400">{formatDate(doc.created_at)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.className}`}>
                        {status.icon} {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canRetry && (
                          <button onClick={() => handleRetry(doc)} disabled={isRetrying} title="Retry embedding" className="p-1.5 hover:bg-violet-50 rounded-lg text-neutral-400 hover:text-violet-600 disabled:opacity-40">
                            {isRetrying ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                          </button>
                        )}
                        {doc.r2_url && (
                          <a href={doc.r2_url} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-700"><ExternalLink size={13} /></a>
                        )}
                        <button onClick={() => handleDelete(doc)} disabled={isDeleting} className="p-1.5 hover:bg-red-50 rounded-lg text-neutral-400 hover:text-red-500 disabled:opacity-40">
                          {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
