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
        <div className="border border-bone/20 bg-bone p-6">
          <div className="flex items-center gap-3">
            <div className="border border-obsidian/10 bg-obsidian p-2.5">
              <Store className="h-5 w-5 text-brass" />
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-widest2 uppercase text-titanium-dark">Store Name</p>
              <p className="mt-1 text-xl font-semibold text-obsidian">
                {store?.storeName || '—'}
              </p>
            </div>
          </div>
        </div>
        <div className="border border-hairline bg-obsidian-panel p-6">
          <div className="flex items-center gap-3">
            <div className="border border-hairline2 bg-obsidian p-2.5">
              <Receipt className="h-5 w-5 text-brass" />
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-widest2 uppercase text-titanium">Status</p>
              <p className="mt-1 text-xl font-semibold text-bone">Ready to accept payments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center border border-dashed border-hairline2 bg-obsidian-panel font-mono text-[11px] tracking-widest2 uppercase text-bone-faint">
        <p>Go to <strong className="text-brass">Create Bill</strong> to send an invoice</p>
      </div>
    </div>
  )
}
