'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/hooks/useWallet'
import ConnectWalletButton from '@/components/ConnectWalletButton'

export default function DashboardPage() {
  const { wallet, disconnect } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (!wallet.isConnected && !wallet.isConnecting) {
      router.push('/')
    }
  }, [wallet.isConnected, wallet.isConnecting, router])

  const handleLogout = () => {
    disconnect()
    router.push('/')
  }

  if (!wallet.isConnected) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-zinc-600">Please connect your wallet to access the dashboard.</p>
        <ConnectWalletButton />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold text-blue-800">Welcome to Lumina Dashboard</h1>
      <p className="text-zinc-600">
        Connected as{' '}
        <span className="font-mono text-sm text-zinc-800">{wallet.publicKey}</span>
      </p>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-red-500"
      >
        Logout
      </button>
    </div>
  )
}
