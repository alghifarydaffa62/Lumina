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
        <div className="border border-line bg-panel p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="border border-line2 bg-panel p-2.5">
              <Store className="h-5 w-5 text-brass-dim" />
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-widest2 uppercase text-ink-faint">Store Name</p>
              <p className="mt-1 text-xl font-semibold text-ink">
                {store?.storeName || '—'}
              </p>
            </div>
          </div>
        </div>
        <div className="border border-line bg-panel p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="border border-line2 bg-panel p-2.5">
              <Receipt className="h-5 w-5 text-brass-dim" />
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-widest2 uppercase text-ink-faint">Status</p>
              <p className="mt-1 text-xl font-semibold text-ink">Ready to accept payments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center border border-dashed border-line2 bg-panel-soft font-mono text-[11px] tracking-widest2 uppercase text-ink-faint">
        <p>Go to <strong className="text-brass-dim">Create Bill</strong> to send an invoice</p>
      </div>
    </div>
  )
}
