'use client'

import { useWallet } from '@/lib/app-wallet'

export default function DashboardHeader() {
  const { account, isConnected } = useWallet()

  return (
    <header className="chrome-gradient flex items-center justify-between border border-brass/20 px-4 py-3 shadow-lg backdrop-blur-md md:px-6 md:py-4">
      <div className="min-w-0">
        <h1 className="font-display text-lg tracking-tightest text-bone uppercase md:text-xl">Welcome back</h1>
        <p className="text-xs text-titanium md:text-sm">Manage your Lumina dashboard</p>
      </div>

      {isConnected && account?.address && (
        <div className="hidden shrink-0 border border-brass/25 bg-black/20 px-3 py-1.5 font-mono text-[11px] tracking-widest2 text-bone-dim md:block md:px-4 md:py-2">
          {account.address.slice(0, 10)}...{account.address.slice(-4)}
        </div>
      )}
    </header>
  )
}