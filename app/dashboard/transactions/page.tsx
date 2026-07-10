'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/lib/app-wallet'
import { useTransactions } from '@/hooks/useTransactions'
import TransactionList from '@/components/my-card/TransactionList'

export default function TransactionsPage() {
  const { isConnected, isConnecting } = useWallet()
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
        <p className="text-sm text-titanium">Connect your wallet to continue</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <h1 className="font-display text-xl tracking-tightest text-bone uppercase md:text-2xl">Transactions</h1>
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
