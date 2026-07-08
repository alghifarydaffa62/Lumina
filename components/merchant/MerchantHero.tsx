'use client'

import { ConnectButton } from 'stellar-wallet-kit'
import { Store } from 'lucide-react'

export default function MerchantHero() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="rounded-2xl bg-purple-100 p-4">
        <Store className="h-12 w-12 text-purple-600" />
      </div>
      <h1 className="max-w-xl text-4xl font-bold text-slate-900">
        Accept payments with Lumina
      </h1>
      <p className="max-w-md text-slate-500">
        Connect your wallet to start accepting USDC payments through the Stellar network.
        No traditional banking required.
      </p>
      <ConnectButton />
    </section>
  )
}
