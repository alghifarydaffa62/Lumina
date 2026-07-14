'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/lib/app-wallet'
import { useFirebaseAuthContext } from '@/lib/firebase-auth-context'
import { useTransactions } from '@/hooks/useTransactions'
import TransactionList from '@/components/my-card/TransactionList'
import { Shield } from 'lucide-react'

export default function TransactionsPage() {
  const { isConnected, isConnecting } = useWallet()
  const { authenticate, authLoading, isAuthenticated, authSettled } = useFirebaseAuthContext()
  const router = useRouter()
  const { transactions, loading, error, indexUrl } = useTransactions()

  useEffect(() => {
    if (!isConnected && !isConnecting) {
      router.push('/')
    }
  }, [isConnected, isConnecting, router])

  if (!isConnected) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-ink-faint">Connect your wallet to continue</p>
      </div>
    )
  }

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="border border-line2 bg-panel p-3">
          <Shield className="h-6 w-6 text-brass-dim" />
        </div>
        <p className="text-sm text-ink-dim">Sign in to view your transaction history</p>
        <button
          onClick={authenticate}
          className="border border-line2 bg-panel px-6 py-3 font-mono text-[11px] tracking-widest2 uppercase text-ink transition duration-300 hover:bg-ink hover:text-panel"
        >
          Sign in
        </button>
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-ink-faint">Authenticating...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <h1 className="font-display text-xl tracking-tightest text-ink uppercase md:text-2xl">Transactions</h1>
      <div className="flex-1">
        <TransactionList
          transactions={transactions}
          loading={loading}
          error={error}
          indexUrl={indexUrl}
        />
      </div>
    </div>
  )
}
