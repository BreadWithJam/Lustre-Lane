import { useEffect, useRef, useState } from 'react'
import { View, Text, FlatList, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/colors'
import { endpoints } from '@/constants/api'
import type { Message, MessageThread } from '@/types'

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export default function ConversationScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef<FlatList>(null)

  useEffect(() => {
    fetch(endpoints.thread(threadId))
      .then((r) => r.json())
      .then((json) => {
        const thread: MessageThread = json.data
        setMessages(thread.messages ?? [])
      })
      .finally(() => setLoading(false))
  }, [threadId])

  const send = async () => {
    const content = text.trim()
    if (!content || sending) return
    setSending(true)
    setText('')

    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      threadId,
      senderType: 'client',
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])

    try {
      const res = await fetch(endpoints.thread(threadId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, senderType: 'client' }),
      })
      if (res.ok) {
        const json = await res.json()
        setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? json.data : m)))
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.brown} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isClient = item.senderType === 'client'
            return (
              <View style={[styles.bubble, isClient ? styles.bubbleClient : styles.bubbleAdmin]}>
                {!isClient && item.senderName && (
                  <Text style={styles.senderName}>{item.senderName}</Text>
                )}
                <Text style={isClient ? styles.bubbleTextClient : styles.bubbleTextAdmin}>
                  {item.content}
                </Text>
                <Text style={styles.bubbleTime}>{formatTime(item.createdAt)}</Text>
              </View>
            )
          }}
        />

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor={Colors.warmGray}
            multiline
            returnKeyType="send"
            onSubmitEditing={send}
          />
          <Pressable style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]} onPress={send} disabled={!text.trim() || sending}>
            <Text style={styles.sendBtnText}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  messageList: { padding: 16, gap: 8, paddingBottom: 8 },
  bubble: { maxWidth: '75%', borderRadius: 16, padding: 12, marginBottom: 4 },
  bubbleClient: { alignSelf: 'flex-end', backgroundColor: Colors.brown, borderBottomRightRadius: 4 },
  bubbleAdmin: { alignSelf: 'flex-start', backgroundColor: Colors.cream, borderBottomLeftRadius: 4 },
  bubbleTextClient: { color: Colors.white, fontSize: 14, lineHeight: 20 },
  bubbleTextAdmin: { color: Colors.brown, fontSize: 14, lineHeight: 20 },
  senderName: { color: Colors.warmGray, fontSize: 11, marginBottom: 2 },
  bubbleTime: { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 4, textAlign: 'right' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white },
  input: { flex: 1, backgroundColor: Colors.cream, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: Colors.text, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.brown, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: Colors.white, fontSize: 18, fontWeight: '700' },
})
