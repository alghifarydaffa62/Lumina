'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from 'stellar-wallet-kit'
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
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Please connect your wallet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-800">Transactions</h1>
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
