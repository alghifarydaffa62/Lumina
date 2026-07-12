import DashboardSidebar from '@/components/DashboardSidebar'
import DashboardHeader from '@/components/DashboardHeader'
import { ToastProvider } from '@/components/Toast'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <div className="flex h-screen flex-col bg-paper md:flex-row md:gap-5 md:p-5">
        <DashboardSidebar />
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6 pt-16 md:gap-5 md:p-0">
          <DashboardHeader />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </ToastProvider>
  )
}