'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from 'stellar-wallet-kit'

export default function YieldEnginePage() {
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
        <p className="text-slate-500">Please connect your wallet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-purple-200 bg-white text-purple-300">
      Yield Engine — coming soon
    </div>
  )
}
