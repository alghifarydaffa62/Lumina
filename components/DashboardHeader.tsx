'use client'

import { useWallet } from '@/hooks/useWallet'

export default function DashboardHeader() {
  const { wallet } = useWallet()

  return (
    <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-gradient-to-r from-purple-600/20 to-purple-900/30 backdrop-blur-xl px-6 py-4">
      <div>
        <h1 className="text-xl font-semibold text-white">Welcome back</h1>
        <p className="text-sm text-white/60">Manage your Lumina dashboard</p>
      </div>

      {wallet.isConnected && wallet.publicKey && (
        <div className="rounded-xl bg-white/10 px-4 py-2 font-mono text-xs text-white/70 backdrop-blur-sm">
          {wallet.publicKey.slice(0, 6)}...{wallet.publicKey.slice(-4)}
        </div>
      )}
    </header>
  )
}
