'use client'

import { useWallet } from '@/lib/app-wallet'

interface Props {
  storeName?: string
}

export default function MerchantHeader({ storeName }: Props) {
  const { account, isConnected } = useWallet()

  return (
    <header className="flex items-center justify-between border border-hairline bg-obsidian-raised/80 backdrop-blur-md px-4 py-3 md:px-6 md:py-4">
      <div className="min-w-0">
        <h1 className="font-display text-lg tracking-tightest text-bone uppercase md:text-xl">
          {storeName || 'Merchant Dashboard'}
        </h1>
        <p className="text-xs text-titanium md:text-sm">Manage your store and create bills</p>
      </div>

      {isConnected && account?.address && (
        <div className="hidden shrink-0 border border-hairline2 px-3 py-1.5 font-mono text-[11px] tracking-widest2 text-bone-dim md:block md:px-4 md:py-2">
          {account.address.slice(0, 10)}...{account.address.slice(-4)}
        </div>
      )}
    </header>
  )
}
