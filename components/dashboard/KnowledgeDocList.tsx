'use client'

import { File, FileText, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, Clock, Trash2, ExternalLink } from 'lucide-react'
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

export function KnowledgeDocList({ docs, isLoading }: KnowledgeDocListProps) {
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
    <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
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
            return (
              <tr key={doc.id} className="hover:bg-neutral-50/60 transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    {typeIcon(doc.file_type)}
                    <span className="font-medium text-neutral-700 text-sm">{doc.filename}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs uppercase font-semibold text-neutral-400">{doc.file_type}</span>
                </td>
                <td className="px-4 py-3.5 text-xs text-neutral-400">
                  {doc.file_size ? formatFileSize(doc.file_size) : '—'}
                </td>
                <td className="px-4 py-3.5 text-xs text-neutral-400">
                  {formatDate(doc.created_at)}
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.className}`}>
                    {status.icon}
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {doc.r2_url && (
                      <a href={doc.r2_url} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-700">
                        <ExternalLink size={13} />
                      </a>
                    )}
                    <button className="p-1.5 hover:bg-red-50 rounded-lg text-neutral-400 hover:text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
