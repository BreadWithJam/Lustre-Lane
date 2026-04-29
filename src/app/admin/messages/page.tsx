import { AdminLayout } from '@/components/admin/AdminLayout'
import { MessageInbox } from '@/components/admin/MessageInbox'

export default function AdminMessagesPage() {
  return (
    <AdminLayout>
      <div className="p-8">
        <h2 className="text-2xl font-serif font-bold text-salon-brown mb-6">Messages</h2>
        <MessageInbox />
      </div>
    </AdminLayout>
  )
}
