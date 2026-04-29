import { ChatInterface } from '@/components/messaging/ChatInterface'

export const metadata = {
  title: 'Chat with Us | Salon',
  description: 'Send us a message and get personalized consultation from our salon team.',
}

export default function ChatPage() {
  return (
    <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full h-[calc(100dvh-4rem)]">
      <ChatInterface />
    </main>
  )
}
