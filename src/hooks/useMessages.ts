'use client'

/**
 * Custom hooks for messaging data fetching with React Query.
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { MessageThread, Message } from '@/types'

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const messageKeys = {
  all: ['messages'] as const,
  threads: () => [...messageKeys.all, 'threads'] as const,
  thread: (id: string) => [...messageKeys.all, 'thread', id] as const,
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchThreads(): Promise<MessageThread[]> {
  const res = await fetch('/api/messages')
  if (!res.ok) throw new Error('Failed to fetch message threads')
  const json = await res.json()
  return json.data as MessageThread[]
}

async function fetchThread(threadId: string): Promise<MessageThread> {
  const res = await fetch(`/api/messages/${threadId}`)
  if (!res.ok) throw new Error('Failed to fetch message thread')
  const json = await res.json()
  return json.data as MessageThread
}

interface SendMessagePayload {
  threadId: string
  content: string
  senderType: 'client' | 'admin'
  senderName?: string
  attachments?: {
    id: string
    file_name: string
    file_url: string
    file_type: string
    file_size: number
  }[]
}

async function sendMessage(payload: SendMessagePayload): Promise<Message> {
  const { threadId, ...body } = payload
  const res = await fetch(`/api/messages/${threadId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to send message')
  const json = await res.json()
  return json.data as Message
}

interface CreateThreadPayload {
  clientEmail: string
  clientName?: string
  clientPhone?: string
  content: string
  senderName?: string
}

async function createThread(payload: CreateThreadPayload): Promise<{ thread: MessageThread; message: Message }> {
  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, senderType: 'client' }),
  })
  if (!res.ok) throw new Error('Failed to create message thread')
  const json = await res.json()
  return json.data as { thread: MessageThread; message: Message }
}

async function markThreadRead(threadId: string): Promise<void> {
  const res = await fetch(`/api/messages/${threadId}/read`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to mark thread as read')
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Fetch all message threads (admin). */
export function useMessageThreads() {
  return useQuery({
    queryKey: messageKeys.threads(),
    queryFn: fetchThreads,
    staleTime: 30 * 1000, // 30 seconds — messages are time-sensitive
  })
}

/** Fetch a single thread with its messages. */
export function useMessageThread(threadId: string | null) {
  return useQuery({
    queryKey: messageKeys.thread(threadId ?? ''),
    queryFn: () => fetchThread(threadId!),
    enabled: !!threadId,
    staleTime: 30 * 1000,
  })
}

/** Send a message in an existing thread. Applies optimistic update. */
export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: sendMessage,
    onMutate: async (payload) => {
      const key = messageKeys.thread(payload.threadId)
      await qc.cancelQueries({ queryKey: key })
      const previous = qc.getQueryData<MessageThread>(key)

      // Optimistically append the message
      if (previous) {
        const optimisticMessage: Message = {
          id: `optimistic-${Date.now()}`,
          threadId: payload.threadId,
          senderType: payload.senderType,
          senderName: payload.senderName,
          content: payload.content,
          createdAt: new Date(),
        }
        qc.setQueryData<MessageThread>(key, {
          ...previous,
          messages: [...(previous.messages ?? []), optimisticMessage],
          lastMessageAt: new Date(),
        })
      }

      return { previous }
    },
    onError: (_err, payload, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(messageKeys.thread(payload.threadId), ctx.previous)
      }
    },
    onSettled: (_data, _err, payload) => {
      qc.invalidateQueries({ queryKey: messageKeys.thread(payload.threadId) })
      qc.invalidateQueries({ queryKey: messageKeys.threads() })
    },
  })
}

/** Create a new thread (first client message). */
export function useCreateThread() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createThread,
    onSuccess: () => qc.invalidateQueries({ queryKey: messageKeys.threads() }),
  })
}

/** Mark all messages in a thread as read (admin). */
export function useMarkThreadRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markThreadRead,
    onSuccess: (_data, threadId) => {
      qc.invalidateQueries({ queryKey: messageKeys.thread(threadId) })
      qc.invalidateQueries({ queryKey: messageKeys.threads() })
    },
  })
}
