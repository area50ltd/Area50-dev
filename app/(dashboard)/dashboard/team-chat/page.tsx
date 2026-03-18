'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TopBar } from '@/components/dashboard/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  Hash, Plus, Send, MoreHorizontal, UserPlus,
  Archive, Trash2, BellOff, Ticket, Sparkles,
  BookOpen, ChevronDown, Search, Loader2, MessageSquare,
} from 'lucide-react'
import { cn, getInitials, formatRelativeTime } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Channel {
  id: string
  name: string
  description: string | null
  created_at: string
}

interface TeamMessage {
  id: string
  user_id: string
  author_name: string
  content: string
  created_at: string
}

async function fetchChannels(): Promise<{ channels: Channel[]; current_user_id: string }> {
  const res = await fetch('/api/team-chat/channels')
  if (!res.ok) throw new Error('Failed to load channels')
  return res.json()
}

async function fetchMessages(channelId: string): Promise<TeamMessage[]> {
  const res = await fetch(`/api/team-chat/channels/${channelId}/messages`)
  if (!res.ok) throw new Error('Failed to load messages')
  const data = await res.json()
  return data.messages
}

function MessageActionMenu({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute right-0 -top-1 bg-white border border-neutral-100 shadow-lg rounded-xl py-1.5 z-10 min-w-[180px]"
    >
      <button className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2" onClick={() => { toast.success('Message forwarded to ticket queue'); onClose() }}>
        <Ticket size={13} /> Forward to Ticket
      </button>
      <button className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2" onClick={() => { toast.success('AI summary generated'); onClose() }}>
        <Sparkles size={13} /> AI Summarize
      </button>
      <button className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2" onClick={() => { toast.success('Saved to Knowledge Base'); onClose() }}>
        <BookOpen size={13} /> Save to Knowledge Base
      </button>
    </motion.div>
  )
}

export default function TeamChatPage() {
  const qc = useQueryClient()

  const { data: channelsData, isLoading: channelsLoading } = useQuery({
    queryKey: ['team_channels'],
    queryFn: fetchChannels,
  })

  const channels = channelsData?.channels ?? []
  const currentUserId = channelsData?.current_user_id ?? ''

  const [activeId, setActiveId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [openMenuMsgId, setOpenMenuMsgId] = useState<string | null>(null)
  const [showChannelMenu, setShowChannelMenu] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [search, setSearch] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Set first channel as active once loaded
  useEffect(() => {
    if (!activeId && channels.length > 0) {
      setActiveId(channels[0].id)
    }
  }, [channels, activeId])

  // Fetch + poll messages every 4s
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['team_messages', activeId],
    queryFn: () => fetchMessages(activeId!),
    enabled: !!activeId,
    refetchInterval: 4000,
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const activeChannel = channels.find((c) => c.id === activeId)
  const filteredChannels = channels.filter((c) => c.name.includes(search.toLowerCase()))

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/team-chat/channels/${activeId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error('Failed to send')
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team_messages', activeId] }),
    onError: () => toast.error('Failed to send message'),
  })

  const createChannelMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/team-chat/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('Failed to create channel')
      return res.json()
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['team_channels'] })
      setActiveId(data.channel.id)
      setNewChannelName('')
      setShowCreateChannel(false)
      toast.success(`#${data.channel.name} created`)
    },
    onError: () => toast.error('Failed to create channel'),
  })

  const deleteChannelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/team-chat/channels/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team_channels'] })
      setActiveId(channels.find((c) => c.id !== activeId)?.id ?? null)
      setShowChannelMenu(false)
      toast.success('Channel deleted')
    },
    onError: () => toast.error('Failed to delete channel'),
  })

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || !activeId) return
    sendMutation.mutate(trimmed)
    setInput('')
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Team Chat" />

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={`bg-[#0A0A10] flex flex-col shrink-0 w-full md:w-56 ${activeId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                placeholder="Search channels"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/10 text-white text-xs rounded-lg pl-8 pr-3 py-2 placeholder:text-white/30 focus:outline-none focus:bg-white/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-4 pb-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wide">Channels</p>
            <button onClick={() => setShowCreateChannel(true)} className="text-white/40 hover:text-white transition-colors">
              <Plus size={14} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
            {channelsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={16} className="animate-spin text-white/30" />
              </div>
            ) : filteredChannels.length === 0 ? (
              <p className="text-white/30 text-xs text-center py-6 px-3">
                {search ? 'No channels match' : 'No channels yet — create one'}
              </p>
            ) : (
              filteredChannels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveId(ch.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
                    activeId === ch.id
                      ? 'bg-white/15 text-white font-medium border-l-2 border-violet-500'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Hash size={14} className="shrink-0" />
                  <span className="flex-1 text-left truncate">{ch.name}</span>
                </button>
              ))
            )}
          </nav>
        </aside>

        {/* Chat area */}
        {!activeChannel ? (
          <div className="hidden md:flex flex-1 items-center justify-center bg-white">
            <div className="text-center">
              <MessageSquare size={32} className="mx-auto mb-3 text-neutral-200" />
              <p className="text-neutral-400 text-sm">
                {channelsLoading ? 'Loading channels...' : 'Create a channel to get started'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-white">
            {/* Channel header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveId(null)} className="md:hidden p-1 -ml-1 text-neutral-400 hover:text-neutral-700 transition-colors" aria-label="Back to channels">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                </button>
                <Hash size={18} className="text-neutral-400" />
                <span className="font-medium text-neutral-900">{activeChannel.name}</span>
                {activeChannel.description && (
                  <>
                    <span className="text-neutral-200">|</span>
                    <span className="text-sm text-neutral-400">{activeChannel.description}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-1.5 text-neutral-500 hover:text-neutral-900" onClick={() => toast.info('Invite via Users & Roles page')}>
                  <UserPlus size={15} />
                  <span className="text-xs">Add Member</span>
                </Button>
                <div className="relative">
                  <button onClick={() => setShowChannelMenu(!showChannelMenu)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                  <AnimatePresence>
                    {showChannelMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        className="absolute right-0 top-9 bg-white border border-neutral-100 shadow-lg rounded-xl py-1.5 z-10 min-w-[160px]"
                      >
                        <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5" onClick={() => { toast.info('Channel muted'); setShowChannelMenu(false) }}>
                          <BellOff size={14} /> Mute Channel
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5" onClick={() => { toast.info('Archive coming soon'); setShowChannelMenu(false) }}>
                          <Archive size={14} /> Archive
                        </button>
                        <div className="h-px bg-neutral-100 my-1" />
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5"
                          onClick={() => deleteChannelMutation.mutate(activeId!)}
                          disabled={deleteChannelMutation.isPending}
                        >
                          <Trash2 size={14} /> Delete Channel
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={18} className="animate-spin text-neutral-300" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <MessageSquare size={28} className="text-neutral-200 mb-3" />
                  <p className="text-neutral-400 text-sm">No messages yet — say something!</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg) => {
                    const isMine = msg.user_id === currentUserId
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 group"
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0',
                          isMine ? 'bg-violet-600' : 'bg-neutral-700'
                        )}>
                          {getInitials(msg.author_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-0.5">
                            <span className={cn('text-sm font-semibold', isMine ? 'text-violet-600' : 'text-neutral-900')}>
                              {isMine ? 'You' : msg.author_name}
                            </span>
                            <span className="text-xs text-neutral-400">{formatRelativeTime(new Date(msg.created_at))}</span>
                          </div>
                          <p className="text-sm text-neutral-700 leading-relaxed">{msg.content}</p>
                        </div>
                        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => setOpenMenuMsgId(openMenuMsgId === msg.id ? null : msg.id)}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 transition-colors"
                          >
                            <ChevronDown size={14} />
                          </button>
                          <AnimatePresence>
                            {openMenuMsgId === msg.id && (
                              <MessageActionMenu onClose={() => setOpenMenuMsgId(null)} />
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-5 pb-5">
              <div className="flex items-end gap-3 bg-neutral-50 rounded-xl border border-neutral-200 px-4 py-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder={`Message #${activeChannel.name}`}
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none resize-none leading-relaxed"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sendMutation.isPending}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-600 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-opacity shrink-0"
                >
                  {sendMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={15} />}
                </button>
              </div>
              <p className="text-xs text-neutral-400 mt-1.5 ml-1">Enter to send · Shift+Enter for new line</p>
            </div>
          </div>
        )}
      </main>

      {/* Create channel modal */}
      <AnimatePresence>
        {showCreateChannel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateChannel(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-heading text-lg font-bold text-neutral-900 mb-4">Create Channel</h3>
              <div className="relative mb-4">
                <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <Input
                  placeholder="channel-name"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="pl-9"
                  onKeyDown={(e) => { if (e.key === 'Enter') createChannelMutation.mutate(newChannelName) }}
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1 rounded-full" onClick={() => setShowCreateChannel(false)}>Cancel</Button>
                <Button
                  className="flex-1 rounded-full gap-2"
                  onClick={() => createChannelMutation.mutate(newChannelName)}
                  disabled={!newChannelName || createChannelMutation.isPending}
                >
                  {createChannelMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  Create
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
