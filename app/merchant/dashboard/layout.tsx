import type { Metadata } from 'next'
import MerchantSidebar from '@/components/merchant/MerchantSidebar'
import MerchantHeader from '@/components/merchant/MerchantHeader'

export const metadata: Metadata = {
  title: 'Lumina Merchant - Dashboard',
}

export default function MerchantDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row md:gap-5 md:p-5">
      <MerchantSidebar />
      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-16 md:gap-5 md:p-0 md:pt-0">
        <MerchantHeader />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
