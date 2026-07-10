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
    <div className="flex h-screen flex-col bg-obsidian md:flex-row md:gap-5 md:p-5">
      <MerchantSidebar />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6 pt-16 md:gap-5 md:p-0">
        <MerchantHeader />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
