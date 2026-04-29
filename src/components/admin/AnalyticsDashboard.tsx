'use client'

import { useQuery } from '@tanstack/react-query'
import type { MessageThread, Service } from '@/types'

interface NotificationRecord {
  id: string
  type: string
  recipientEmail: string
  threadId?: string
  status: 'sent' | 'failed'
  error?: string
  createdAt: string
}

async function fetchThreads(): Promise<MessageThread[]> {
  const res = await fetch('/api/messages')
  if (!res.ok) throw new Error('Failed to fetch threads')
  const json = await res.json()
  return json.data
}

async function fetchServices(): Promise<Service[]> {
  const res = await fetch('/api/services?active=false')
  if (!res.ok) throw new Error('Failed to fetch services')
  const json = await res.json()
  return json.data
}

async function fetchNotificationHistory(): Promise<NotificationRecord[]> {
  const res = await fetch('/api/notifications/history')
  if (!res.ok) return []
  const json = await res.json()
  return json.data ?? []
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <p className="text-sm text-salon-warm-gray">{label}</p>
      <p className="text-3xl font-serif font-bold text-salon-brown mt-1">{value}</p>
      {sub && <p className="text-xs text-salon-warm-gray mt-1">{sub}</p>}
    </div>
  )
}

export function AnalyticsDashboard() {
  const { data: threads = [], isLoading: threadsLoading } = useQuery({
    queryKey: ['admin-threads-analytics'],
    queryFn: fetchThreads,
  })

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['admin-services-analytics'],
    queryFn: fetchServices,
  })

  const { data: notifications = [] } = useQuery({
    queryKey: ['admin-notifications-history'],
    queryFn: fetchNotificationHistory,
  })

  const isLoading = threadsLoading || servicesLoading

  // Derived metrics
  const openThreads = threads.filter(t => t.status === 'open').length
  const closedThreads = threads.filter(t => t.status === 'closed').length
  const activeServices = services.filter(s => s.isActive).length

  // Message volume by day (last 7 days)
  const now = Date.now()
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
  const recentThreads = threads.filter(t => new Date(t.lastMessageAt).getTime() > sevenDaysAgo)

  // Popular categories
  const categoryCounts = services.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + 1
    return acc
  }, {})
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]

  // Notification stats
  const sentNotifications = notifications.filter(n => n.status === 'sent').length
  const failedNotifications = notifications.filter(n => n.status === 'failed').length

  if (isLoading) {
    return <div className="text-salon-warm-gray py-8 text-center">Loading analytics…</div>
  }

  return (
    <div className="space-y-8">
      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Threads" value={threads.length} sub="all time" />
        <StatCard label="Open Threads" value={openThreads} sub="awaiting response" />
        <StatCard label="Active Services" value={activeServices} sub={`of ${services.length} total`} />
        <StatCard label="Messages (7d)" value={recentThreads.length} sub="recent activity" />
      </div>

      {/* Thread status breakdown */}
      <div className="bg-white border border-border rounded-xl p-6">
        <h3 className="font-semibold text-salon-brown mb-4">Thread Status</h3>
        <div className="space-y-3">
          {(['open', 'closed', 'archived'] as const).map(status => {
            const count = threads.filter(t => t.status === status).length
            const pct = threads.length > 0 ? Math.round((count / threads.length) * 100) : 0
            const colors = { open: 'bg-green-400', closed: 'bg-gray-300', archived: 'bg-yellow-400' }
            return (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize text-salon-warm-gray">{status}</span>
                  <span className="font-medium text-salon-brown">{count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-salon-cream rounded-full overflow-hidden">
                  <div className={`h-full ${colors[status]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular services by category */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h3 className="font-semibold text-salon-brown mb-4">Services by Category</h3>
          {Object.keys(categoryCounts).length === 0 ? (
            <p className="text-sm text-salon-warm-gray">No services yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(categoryCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm capitalize text-salon-warm-gray">{cat}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-salon-cream rounded-full overflow-hidden">
                        <div
                          className="h-full bg-salon-brown rounded-full"
                          style={{ width: `${(count / services.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-salon-brown w-4 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
          {topCategory && (
            <p className="text-xs text-salon-warm-gray mt-4">
              Most popular: <span className="font-medium capitalize">{topCategory[0]}</span> ({topCategory[1]} services)
            </p>
          )}
        </div>

        {/* Notification history */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h3 className="font-semibold text-salon-brown mb-4">Notification History</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-700">{sentNotifications}</p>
              <p className="text-xs text-green-600 mt-0.5">Sent</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-700">{failedNotifications}</p>
              <p className="text-xs text-red-600 mt-0.5">Failed</p>
            </div>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-salon-warm-gray">No notifications recorded yet.</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notifications.slice(0, 10).map(n => (
                <div key={n.id} className="flex items-center justify-between text-xs">
                  <span className="text-salon-warm-gray truncate max-w-[60%]">{n.recipientEmail}</span>
                  <span className={`px-2 py-0.5 rounded-full font-medium ${n.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {n.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent threads */}
      <div className="bg-white border border-border rounded-xl p-6">
        <h3 className="font-semibold text-salon-brown mb-4">Recent Threads</h3>
        {threads.length === 0 ? (
          <p className="text-sm text-salon-warm-gray">No threads yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium text-salon-warm-gray">Client</th>
                  <th className="text-left py-2 font-medium text-salon-warm-gray">Status</th>
                  <th className="text-left py-2 font-medium text-salon-warm-gray">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {threads.slice(0, 8).map(thread => (
                  <tr key={thread.id}>
                    <td className="py-2 text-salon-brown">{thread.clientName ?? thread.clientEmail}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        thread.status === 'open' ? 'bg-green-100 text-green-700' :
                        thread.status === 'closed' ? 'bg-gray-100 text-gray-500' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {thread.status}
                      </span>
                    </td>
                    <td className="py-2 text-salon-warm-gray">
                      {new Date(thread.lastMessageAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
