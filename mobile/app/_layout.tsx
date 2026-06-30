import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '@/context/AuthContext'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="chat/[threadId]" options={{ headerShown: true, title: 'Conversation', headerTintColor: '#7C4A2D' }} />
        </Stack>
        <StatusBar style="dark" />
      </AuthProvider>
    </SafeAreaProvider>
  )
}
