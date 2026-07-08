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
    <div className="flex min-h-screen gap-5 bg-slate-50 p-5">
      <MerchantSidebar />
      <div className="flex flex-1 flex-col gap-5">
        <MerchantHeader />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
