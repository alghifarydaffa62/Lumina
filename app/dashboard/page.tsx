'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/hooks/useWallet'
import ConnectWalletButton from '@/components/ConnectWalletButton'

export default function DashboardPage() {
  const { wallet } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (!wallet.isConnected && !wallet.isConnecting) {
      router.push('/')
    }
  }, [wallet.isConnected, wallet.isConnecting, router])

  if (!wallet.isConnected) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">Please connect your wallet to access the dashboard.</p>
        <ConnectWalletButton />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {['Total Balance', 'Active Vaults', 'Yield Earned', 'Transactions'].map(
          (title, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
            >
              <p className="text-sm text-white/50">{title}</p>
              <p className="mt-2 text-2xl font-semibold text-white">—</p>
            </div>
          ),
        )}
      </div>

      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 text-white/30">
        Main content area — coming soon
      </div>
    </div>
  )
}
