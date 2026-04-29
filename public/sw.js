/**
 * Service Worker for Web Push Notifications
 * Requirements: 4.3
 */

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'New Notification', body: event.data.text() }
  }

  const title = payload.title ?? 'Salon Notification'
  const options = {
    body: payload.body ?? '',
    icon: payload.icon ?? '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: { url: payload.url ?? '/' },
    requireInteraction: false,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url ?? '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus()
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url)
        }
      })
  )
})
