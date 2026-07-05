'use client'

import { useWallet } from '@/hooks/useWallet'
import { useRouter } from 'next/navigation'

export default function ConnectWalletButton() {
  const { wallet, connect } = useWallet()
  const router = useRouter()

  const handleConnect = async () => {
    try {
      await connect()
      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet'
      alert(message)
    }
  }

  if (wallet.isConnected && wallet.publicKey) {
    const truncated = `${wallet.publicKey.slice(0, 4)}...${wallet.publicKey.slice(-4)}`
    return (
      <button
        type="button"
        className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 cursor-default"
      >
        {truncated}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={wallet.isConnecting}
      className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
    >
      {wallet.isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}
