'use client'

import { useWallet } from '@/lib/app-wallet'
import { useMerchantDashboardAuth, useMerchantStore } from '@/hooks/useMerchant'
import { Store, Receipt } from 'lucide-react'

export default function MerchantDashboardPage() {
  const { isConnected } = useMerchantDashboardAuth()
  const { account } = useWallet()
  const { store } = useMerchantStore(account?.address)

  if (!isConnected) return null

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-2.5">
              <Store className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-400">Store Name</p>
              <p className="text-xl font-semibold text-purple-900">
                {store?.storeName || '—'}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-2.5">
              <Receipt className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-400">Status</p>
              <p className="text-xl font-semibold text-purple-900">Ready to accept payments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-purple-200 bg-white text-purple-300">
        <p className="text-sm">Go to <strong>Create Bill</strong> to send an invoice</p>
      </div>
    </div>
  )
}
