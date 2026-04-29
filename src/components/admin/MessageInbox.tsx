'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { MessageThread, MessageThreadStatus } from '@/types'

const STATUS_LABELS: Record<MessageThreadStatus, string> = {
  open: 'Open',
  closed: 'Closed',
  archived: 'Archived',
}

const STATUS_COLORS: Record<MessageThreadStatus, string> = {
  open: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
  archived: 'bg-yellow-100 text-yellow-700',
}

async function fetchThreads(status?: string): Promise<MessageThread[]> {
  const url = status ? `/api/messages?status=${status}` : '/api/messages'
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch threads')
  const json = await res.json()
  return json.data
}

async function fetchThread(threadId: string): Promise<MessageThread> {
  const res = await fetch(`/api/messages/${threadId}`)
  if (!res.ok) throw new Error('Failed to fetch thread')
  const json = await res.json()
  return json.data
}

async function sendReply(threadId: string, content: string): Promise<void> {
  const res = await fetch(`/api/messages/${threadId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, senderType: 'admin', senderName: 'Salon Staff' }),
  })
  if (!res.ok) throw new Error('Failed to send reply')
}

async function updateThreadStatus(threadId: string, status: MessageThreadStatus): Promise<void> {
  const res = await fetch(`/api/messages/${threadId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Failed to update thread status')
}

const QUICK_REPLIES = [
  'Thank you for reaching out! We\'ll get back to you shortly.',
  'We\'d love to book you in. What days work best for you?',
  'Great question! Let me check our availability.',
]

export function MessageInbox() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ['admin-threads', statusFilter],
    queryFn: () => fetchThreads(statusFilter || undefined),
  })

  const { data: activeThread } = useQuery({
    queryKey: ['admin-thread', selectedThreadId],
    queryFn: () => fetchThread(selectedThreadId!),
    enabled: !!selectedThreadId,
    refetchInterval: 5000, // poll every 5s for new messages
  })

  const replyMutation = useMutation({
    mutationFn: ({ threadId, content }: { threadId: string; content: string }) =>
      sendReply(threadId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-thread', selectedThreadId] })
      queryClient.invalidateQueries({ queryKey: ['admin-threads'] })
      setReplyText('')
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ threadId, status }: { threadId: string; status: MessageThreadStatus }) =>
      updateThreadStatus(threadId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-threads'] })
      queryClient.invalidateQueries({ queryKey: ['admin-thread', selectedThreadId] })
    },
  })

  function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!replyText.trim() || !selectedThreadId) return
    replyMutation.mutate({ threadId: selectedThreadId, content: replyText.trim() })
  }

  function formatTime(date: Date | string) {
    return new Date(date).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    })
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* Thread list */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-white border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salon-brown"
            aria-label="Filter by status"
          >
            <option value="">All threads</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {isLoading && (
            <p className="text-center text-salon-warm-gray py-8 text-sm">Loading…</p>
          )}
          {!isLoading && threads.length === 0 && (
            <p className="text-center text-salon-warm-gray py-8 text-sm">No threads found.</p>
          )}
          {threads.map(thread => (
            <button
              key={thread.id}
              onClick={() => setSelectedThreadId(thread.id)}
              className={`w-full text-left px-4 py-3 hover:bg-salon-cream/50 transition-colors ${selectedThreadId === thread.id ? 'bg-salon-cream' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-salon-brown truncate">
                  {thread.clientName ?? thread.clientEmail}
                </p>
                <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[thread.status]}`}>
                  {STATUS_LABELS[thread.status]}
                </span>
              </div>
              <p className="text-xs text-salon-warm-gray mt-0.5 truncate">{thread.clientEmail}</p>
              <p className="text-xs text-salon-warm-gray mt-1">{formatTime(thread.lastMessageAt)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Thread detail */}
      <div className="flex-1 flex flex-col bg-white border border-border rounded-xl overflow-hidden">
        {!selectedThreadId ? (
          <div className="flex-1 flex items-center justify-center text-salon-warm-gray">
            Select a thread to view messages
          </div>
        ) : !activeThread ? (
          <div className="flex-1 flex items-center justify-center text-salon-warm-gray text-sm">
            Loading…
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <p className="font-semibold text-salon-brown">
                  {activeThread.clientName ?? activeThread.clientEmail}
                </p>
                <p className="text-xs text-salon-warm-gray">{activeThread.clientEmail}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={activeThread.status}
                  onChange={e => statusMutation.mutate({ threadId: activeThread.id, status: e.target.value as MessageThreadStatus })}
                  className="px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salon-brown"
                  aria-label="Thread status"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {(activeThread.messages ?? []).map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                    msg.senderType === 'admin'
                      ? 'bg-salon-brown text-white'
                      : 'bg-salon-cream text-salon-brown'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.senderType === 'admin' ? 'text-white/70' : 'text-salon-warm-gray'}`}>
                      {msg.senderName ?? (msg.senderType === 'admin' ? 'Salon Staff' : 'Client')} · {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              {(activeThread.messages ?? []).length === 0 && (
                <p className="text-center text-salon-warm-gray text-sm">No messages yet.</p>
              )}
            </div>

            {/* Quick replies */}
            <div className="px-6 py-2 border-t border-border flex gap-2 overflow-x-auto">
              {QUICK_REPLIES.map((qr, i) => (
                <button
                  key={i}
                  onClick={() => setReplyText(qr)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 bg-salon-cream text-salon-brown rounded-full hover:bg-salon-brown hover:text-white transition-colors"
                >
                  {qr.length > 40 ? qr.slice(0, 40) + '…' : qr}
                </button>
              ))}
            </div>

            {/* Reply composer */}
            <form onSubmit={handleReply} className="px-6 py-4 border-t border-border flex gap-3">
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(e) } }}
                placeholder="Type a reply… (Enter to send)"
                rows={2}
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salon-brown resize-none"
                aria-label="Reply message"
              />
              <button
                type="submit"
                disabled={!replyText.trim() || replyMutation.isPending}
                className="px-4 py-2 bg-salon-brown text-white rounded-lg text-sm font-medium hover:bg-salon-brown/90 transition-colors disabled:opacity-60 self-end"
              >
                {replyMutation.isPending ? '…' : 'Send'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
