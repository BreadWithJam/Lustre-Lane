import { useState } from 'react'
import {
  View, Text, TextInput, StyleSheet, Pressable,
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/colors'
import { endpoints } from '@/constants/api'
import type { MessageThread } from '@/types'
import type { User as FirebaseUser } from 'firebase/auth'

interface Props {
  user: FirebaseUser | null
  onCreated: (thread: MessageThread) => void
}

export function NewConversationForm({ user, onCreated }: Props) {
  const [name, setName] = useState(user?.displayName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Name, email and message are required.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(endpoints.messages, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: name.trim(),
          clientEmail: email.trim().toLowerCase(),
          clientPhone: phone.trim() || undefined,
          content: message.trim(),
          senderType: 'client',
          senderName: name.trim(),
        }),
      })
      if (!res.ok) throw new Error('Failed to start conversation')
      const json = await res.json()
      onCreated(json.data.thread)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.avatar}><Text style={styles.avatarText}>S</Text></View>
            <View>
              <Text style={styles.title}>Salon Team</Text>
              <Text style={styles.subtitle}>Usually replies within an hour</Text>
            </View>
          </View>

          <Text style={styles.formTitle}>Start a Conversation</Text>
          <Text style={styles.formSubtitle}>We'll get back to you as soon as possible.</Text>

          <View style={styles.fields}>
            <Field label="Your Name *" value={name} onChangeText={setName} placeholder="Jane Smith" />
            <Field label="Email *" value={email} onChangeText={setEmail} placeholder="jane@example.com" keyboardType="email-address" autoCapitalize="none" />
            <Field label="Phone (optional)" value={phone} onChangeText={setPhone} placeholder="+1 (555) 000-0000" keyboardType="phone-pad" />
            <Field label="Message *" value={message} onChangeText={setMessage} placeholder="How can we help you today?" multiline numberOfLines={4} />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable style={[styles.btn, loading && styles.btnDisabled]} onPress={submit} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnText}>Start Conversation</Text>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function Field({ label, multiline, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        placeholderTextColor={Colors.warmGray}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...props}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.brown, margin: -20, marginBottom: 24, padding: 20 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.gold, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  title: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  formTitle: { color: Colors.brown, fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  formSubtitle: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', marginBottom: 24 },
  fields: { gap: 16, marginBottom: 16 },
  field: { gap: 4 },
  label: { color: Colors.brown, fontSize: 13, fontWeight: '600' },
  input: { backgroundColor: Colors.cream, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  inputMulti: { minHeight: 100 },
  error: { color: Colors.error, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  btn: { backgroundColor: Colors.brown, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
})
