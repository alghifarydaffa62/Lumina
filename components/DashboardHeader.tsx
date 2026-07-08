'use client'

import { useWallet } from 'stellar-wallet-kit'

export default function DashboardHeader() {
  const { account, isConnected } = useWallet()

  return (
    <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-linear-to-r from-slate-950 via-purple-950 to-slate-950 px-6 py-4">
      <div>
        <h1 className="text-xl font-semibold text-white">Welcome back</h1>
        <p className="text-sm text-white/60">Manage your Lumina dashboard</p>
      </div>

      {isConnected && account?.address && (
        <div className="rounded-xl bg-white/10 px-4 py-2 font-mono text-sm text-white font-semibold">
          {account.address.slice(0, 10)}...{account.address.slice(-4)}
        </div>
      )}
    </header>
  )
}
