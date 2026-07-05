import DashboardSidebar from '@/components/DashboardSidebar'
import DashboardHeader from '@/components/DashboardHeader'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen gap-5 bg-slate-50 p-5">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col gap-5">
        <DashboardHeader />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
