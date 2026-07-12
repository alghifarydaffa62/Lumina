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
      {children}
    </ToastProvider>
  )
}
