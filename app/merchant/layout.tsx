import type { Metadata } from 'next'
import { ToastProvider } from '@/components/Toast'

export const metadata: Metadata = {
  title: 'Lumina Merchant',
}

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-slate-50">
        {children}
      </div>
    </ToastProvider>
  )
}
