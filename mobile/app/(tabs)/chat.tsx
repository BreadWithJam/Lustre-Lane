import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/colors'
import { endpoints } from '@/constants/api'
import { useAuth } from '@/context/AuthContext'
import { getStoredThreadId, setStoredThreadId, clearStoredThreadId } from '@/lib/auth'
import type { MessageThread } from '@/types'
import { NewConversationForm } from '@/components/NewConversationForm'

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function ChatScreen() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)

  useEffect(() => {
    if (authLoading) return
    loadThreads()
  }, [authLoading, user])

  const loadThreads = async () => {
    setLoading(true)
    try {
      if (user) {
        const token = await user.getIdToken(true)
        const res = await fetch(endpoints.myThreads, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const json = await res.json()
          const data: MessageThread[] = json.data ?? []
          setThreads(data)
          setLoading(false)
          if (data.length === 0) setShowNewForm(true)
          return
        }
      }
      // Guest: try localStorage thread
      const storedId = await getStoredThreadId()
      if (storedId) {
        const res = await fetch(endpoints.thread(storedId))
        if (res.ok) {
          const json = await res.json()
          if (json.data) { setThreads([json.data]); setLoading(false); return }
        }
        await clearStoredThreadId()
      }
      setShowNewForm(true)
    } catch {
      setShowNewForm(true)
    }
    setLoading(false)
  }

  if (authLoading || loading) {
    return (
      <SafeAreaView style={styles.center} edges={['top']}>
        <ActivityIndicator color={Colors.brown} />
      </SafeAreaView>
    )
  }

  if (showNewForm) {
    return (
      <NewConversationForm
        user={user}
        onCreated={async (thread) => {
          await setStoredThreadId(thread.id)
          setShowNewForm(false)
          router.push(`/chat/${thread.id}`)
        }}
      />
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Your Conversations</Text>
        <Pressable style={styles.newBtn} onPress={() => setShowNewForm(true)}>
          <Text style={styles.newBtnText}>+ New</Text>
        </Pressable>
      </View>

      <FlatList
        data={threads}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const lastMsg = item.messages?.[item.messages.length - 1]
          return (
            <Pressable style={styles.threadItem} onPress={() => router.push(`/chat/${item.id}`)}>
              <View style={styles.threadMain}>
                <Text style={styles.threadName}>{item.clientName ?? item.clientEmail}</Text>
                {lastMsg && <Text style={styles.threadPreview} numberOfLines={1}>{lastMsg.content}</Text>}
              </View>
              <Text style={styles.threadTime}>{formatRelativeTime(item.lastMessageAt)}</Text>
            </Pressable>
          )
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  header: { color: Colors.brown, fontSize: 22, fontWeight: '700' },
  newBtn: { backgroundColor: Colors.brown, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  newBtnText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingTop: 8 },
  threadItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  threadMain: { flex: 1 },
  threadName: { color: Colors.text, fontWeight: '600', fontSize: 15, marginBottom: 2 },
  threadPreview: { color: Colors.textMuted, fontSize: 13 },
  threadTime: { color: Colors.warmGray, fontSize: 12 },
})
