'use client'

import { TopBar } from '@/components/dashboard/TopBar'
import { KnowledgeUpload } from '@/components/dashboard/KnowledgeUpload'
import { KnowledgeDocList } from '@/components/dashboard/KnowledgeDocList'
import { useKnowledge } from '@/hooks/useKnowledge'
import { formatFileSize } from '@/lib/utils'
import { HardDrive, RefreshCw, Plus, Database, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function KnowledgePage() {
  const { data: docs = [], isLoading, refetch } = useKnowledge()

  const totalSize = docs.reduce((sum, d) => sum + (d.file_size ?? 0), 0)
  const completedCount = docs.filter((d) => d.embedding_status === 'completed').length
  const processingCount = docs.filter((d) => d.embedding_status === 'processing').length
  const errorCount = docs.filter((d) => d.embedding_status === 'error').length

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="AI Knowledge Base" />

      <main className="flex-1 p-6 space-y-5">
        {/* Storage bar */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HardDrive size={18} className="text-neutral-400" />
            <div>
              <p className="text-sm font-medium text-neutral-700">Storage Used</p>
              <p className="text-xs text-neutral-400">
                {formatFileSize(totalSize)} · {docs.length} document{docs.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status summary */}
            <div className="flex items-center gap-4 text-xs">
              {completedCount > 0 && (
                <span className="flex items-center gap-1.5 text-green-600">
                  <CheckCircle2 size={13} /> {completedCount} ready
                </span>
              )}
              {processingCount > 0 && (
                <span className="flex items-center gap-1.5 text-yellow-600">
                  <Loader2 size={13} className="animate-spin" /> {processingCount} processing
                </span>
              )}
              {errorCount > 0 && (
                <span className="flex items-center gap-1.5 text-red-500">
                  <AlertCircle size={13} /> {errorCount} errors
                </span>
              )}
            </div>

            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-[#1B2A4A] py-1.5 px-3 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>

        {/* Main split layout */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left — Upload + Data Sources */}
          <div className="space-y-5">
            {/* Upload card */}
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
              <h3 className="font-heading text-sm font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <Plus size={15} className="text-[#E91E8C]" /> Upload Documents
              </h3>
              <KnowledgeUpload />
            </div>

            {/* Data Sources card */}
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
              <h3 className="font-heading text-sm font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <Database size={15} className="text-blue-500" /> Data Sources
              </h3>

              <div className="space-y-3">
                {[
                  { name: 'Notion', desc: 'Import from workspace', icon: '📝' },
                  { name: 'Google Drive', desc: 'Sync documents', icon: '📁' },
                  { name: 'Website / URL', desc: 'Crawl a website URL', icon: '🌐' },
                ].map((source) => (
                  <div key={source.name} className="flex items-center justify-between py-2.5 border-b border-neutral-50 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{source.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-neutral-700">{source.name}</p>
                        <p className="text-xs text-neutral-400">{source.desc}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium bg-neutral-100 text-neutral-400 px-2 py-0.5 rounded-full">Soon</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Documents table */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-sm font-bold text-[#1B2A4A]">Uploaded Documents</h3>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="text-xs rounded-full h-7 px-3">
                  Add FAQ
                </Button>
                <Button variant="secondary" size="sm" className="text-xs rounded-full h-7 px-3">
                  Custom Q&A
                </Button>
              </div>
            </div>
            <KnowledgeDocList docs={docs} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  )
}
