'use client'

import { Clock, CheckCircle, XCircle, Database } from 'lucide-react'
import type { Transaction } from '@/hooks/useTransactions'

interface Props {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  indexUrl: string | null
}

export default function TransactionList({ transactions, loading, error, indexUrl }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-purple-200 bg-white p-12">
        <p className="text-sm text-slate-400">Loading transactions...</p>
      </div>
    )
  }

  if (error && indexUrl) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-3">
          <Database className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div className="space-y-2 text-sm">
            <p className="font-medium text-amber-800">Firestore index needed</p>
            <p className="text-amber-700">
              This query needs a composite index to run. Click the button below to create it in Firebase Console.
            </p>
            <a
              href={indexUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
            >
              Create Index
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Failed to load transactions: {error}
      </div>
    )
  }

  if (!transactions.length) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-purple-200 bg-white py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-purple-100 p-3">
            <Clock className="h-6 w-6 text-purple-400" />
          </div>
          <p className="text-sm font-medium text-purple-400">No transactions yet</p>
          <p className="text-xs text-purple-300">
            Paid and expired invoices will appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {transactions.map((tx) => {
        const isPaid = tx.status === 'paid'

        return (
          <div
            key={tx.id}
            className="rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                    {tx.merchantName}
                  </span>
                  {isPaid ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600">
                      <CheckCircle size={12} />
                      Paid
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <XCircle size={12} />
                      Expired
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700">{tx.itemDescription}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="font-mono">{tx.buyerAddress.slice(0, 8)}...</span>
                  {tx.createdAt && (
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {tx.createdAt.toDate().toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <span className="text-lg font-semibold text-slate-800">
                {tx.amountUSDC.toFixed(2)} USDC
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
