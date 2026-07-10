'use client'

import { useWallet } from '@/lib/app-wallet'

interface Props {
  storeName?: string
}

export default function MerchantHeader({ storeName }: Props) {
  const { account, isConnected } = useWallet()

  return (
    <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-linear-to-r from-slate-950 via-purple-950 to-slate-950 px-4 py-3 md:px-6 md:py-4">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-white md:text-xl">
          {storeName || 'Merchant Dashboard'}
        </h1>
        <p className="text-xs text-white/60 md:text-sm">Manage your store and create bills</p>
      </div>

      {isConnected && account?.address && (
        <div className="hidden shrink-0 rounded-xl bg-white/10 px-3 py-1.5 font-mono text-xs font-semibold text-white md:block md:px-4 md:py-2 md:text-sm">
          {account.address.slice(0, 10)}...{account.address.slice(-4)}
        </div>
      )}
    </header>
  )
}
