'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from 'stellar-wallet-kit'

export default function DashboardPage() {
  const { isConnected, isConnecting } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (!isConnected && !isConnecting) {
      router.push('/')
    }
  }, [isConnected, isConnecting, router])

  if (!isConnected) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Please connect your wallet to access the dashboard.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {['Total Balance', 'Active Vaults', 'Yield Earned', 'Transactions'].map(
          (title, i) => (
            <div
              key={i}
              className="rounded-2xl border border-purple-200 bg-purple-50 p-5"
            >
              <p className="text-sm text-purple-400">{title}</p>
              <p className="mt-2 text-2xl font-semibold text-purple-900">—</p>
            </div>
          ),
        )}
      </div>

      <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-purple-200 bg-white text-purple-300">
        Main content area — coming soon
      </div>
    </div>
  )
}
