import { AdminLayout } from '@/components/admin/AdminLayout'
import { ServiceManager } from '@/components/admin/ServiceManager'

export default function AdminServicesPage() {
  return (
    <AdminLayout>
      <div className="p-8">
        <h2 className="text-2xl font-serif font-bold text-salon-brown mb-6">Services</h2>
        <ServiceManager />
      </div>
    </AdminLayout>
  )
}
