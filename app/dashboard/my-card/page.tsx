'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/hooks/useWallet'
import ConnectWalletButton from '@/components/ConnectWalletButton'

export default function MyCardPage() {
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
        <p className="text-zinc-400">Please connect your wallet.</p>
        <ConnectWalletButton />
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-white/10 text-white/30">
      My Card — coming soon
    </div>
  )
}
