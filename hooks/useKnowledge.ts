import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { KnowledgeDocument } from '@/lib/types'

async function fetchDocs(): Promise<KnowledgeDocument[]> {
  const res = await fetch('/api/knowledge')
  if (!res.ok) throw new Error('Failed to fetch documents')
  return res.json()
}

export function useKnowledge() {
  return useQuery({
    queryKey: ['knowledge'],
    queryFn: fetchDocs,
    staleTime: 10_000,
    // Poll every 5s while any doc is still embedding, else every 60s
    refetchInterval: (query) => {
      const docs = query.state.data ?? []
      const hasProcessing = docs.some((d) => d.embedding_status === 'processing')
      return hasProcessing ? 5_000 : 60_000
    },
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Upload failed')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
    },
  })
}
