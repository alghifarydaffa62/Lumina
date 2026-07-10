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
      <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row md:gap-5 md:p-5">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-16 md:gap-5 md:p-0 md:pt-0">
          <DashboardHeader />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </ToastProvider>
  )
}
