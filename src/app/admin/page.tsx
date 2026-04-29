import { AdminLayout } from '@/components/admin/AdminLayout'
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard'

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="p-8">
        <h2 className="text-2xl font-serif font-bold text-salon-brown mb-6">Dashboard</h2>
        <AnalyticsDashboard />
      </div>
    </AdminLayout>
  )
}
