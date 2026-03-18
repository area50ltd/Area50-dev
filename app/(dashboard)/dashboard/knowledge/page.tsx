'use client'

import { TopBar } from '@/components/dashboard/TopBar'
import { KnowledgeUpload } from '@/components/dashboard/KnowledgeUpload'
import { KnowledgeDocList } from '@/components/dashboard/KnowledgeDocList'
import { useKnowledge } from '@/hooks/useKnowledge'
import { usePlanLimits } from '@/hooks/usePlanLimits'
import { UpgradePrompt } from '@/components/shared/UpgradePrompt'
import { formatFileSize } from '@/lib/utils'
import { HardDrive, RefreshCw, Plus, Database, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function KnowledgePage() {
  const { data: docs = [], isLoading, refetch } = useKnowledge()
  const { canUploadDoc, limits, usage } = usePlanLimits()

  const totalSize = docs.reduce((sum, d) => sum + (d.file_size ?? 0), 0)
  const completedCount = docs.filter((d) => d.embedding_status === 'completed').length
  const processingCount = docs.filter((d) => d.embedding_status === 'processing').length
  const errorCount = docs.filter((d) => d.embedding_status === 'error').length

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="AI Knowledge Base" />

      <main className="flex-1 p-4 sm:p-6 space-y-5">
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
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 py-1.5 px-3 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>

        {/* Main split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left — Upload + Data Sources */}
          <div className="space-y-5">
            {/* Upload card */}
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Plus size={15} className="text-violet-600" /> Upload Documents
                </h3>
                {limits.max_kb_docs !== -1 && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    !canUploadDoc
                      ? 'bg-red-100 text-red-600'
                      : usage.kb_docs >= limits.max_kb_docs * 0.8
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {usage.kb_docs}/{limits.max_kb_docs} docs
                  </span>
                )}
              </div>
              {canUploadDoc ? (
                <KnowledgeUpload />
              ) : (
                <UpgradePrompt
                  feature="KB document limit reached"
                  requiredPlan="growth"
                  description={`Your plan allows ${limits.max_kb_docs} documents. Upgrade to add more.`}
                />
              )}
            </div>

            {/* Data Sources card */}
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
              <h3 className="font-heading text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
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
              <h3 className="font-heading text-sm font-bold text-neutral-900">Uploaded Documents</h3>
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
