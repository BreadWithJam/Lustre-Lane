export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

export const endpoints = {
  services: `${API_URL}/api/services`,
  service: (id: string) => `${API_URL}/api/services/${id}`,
  gallery: `${API_URL}/api/gallery`,
  messages: `${API_URL}/api/messages`,
  thread: (id: string) => `${API_URL}/api/messages/${id}`,
  myThreads: `${API_URL}/api/auth/my-thread`,
  linkThread: `${API_URL}/api/auth/link-thread`,
}
