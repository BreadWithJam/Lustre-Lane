import { AdminLayout } from '@/components/admin/AdminLayout'
import { GalleryManager } from '@/components/admin/GalleryManager'

export default function AdminGalleryPage() {
  return (
    <AdminLayout>
      <div className="p-8">
        <h2 className="text-2xl font-serif font-bold text-salon-brown mb-6">Gallery</h2>
        <GalleryManager />
      </div>
    </AdminLayout>
  )
}
