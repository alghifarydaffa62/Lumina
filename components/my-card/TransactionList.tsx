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
      <div className="flex items-center justify-center border border-line bg-panel p-12 shadow-sm">
        <p className="font-mono text-[11px] tracking-widest2 uppercase text-ink-faint">Loading transactions...</p>
      </div>
    )
  }

  if (error && indexUrl) {
    return (
      <div className="border border-line bg-panel p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <Database className="mt-0.5 h-5 w-5 shrink-0 text-brass-dim" />
          <div className="space-y-2 text-sm">
            <p className="font-medium text-ink">Firestore index needed</p>
            <p className="text-ink-dim">
              This query needs a composite index to run. Click the button below to create it in Firebase Console.
            </p>
            <a
              href={indexUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-line2 bg-panel px-4 py-2 font-mono text-[11px] tracking-widest2 uppercase text-ink transition duration-300 hover:bg-ink hover:text-panel"
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
      <div className="border border-red-500/30 bg-red-500/5 p-4 text-sm shadow-sm">
        <p className="font-mono text-[11px] tracking-widest2 uppercase text-red-400">Error</p>
        <p className="mt-1 text-ink-dim break-all">{error}</p>
      </div>
    )
  }

  if (!transactions.length) {
    return (
      <div className="flex flex-1 items-center justify-center border border-dashed border-line2 bg-panel-soft py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="border border-line2 bg-panel p-3">
            <Clock className="h-6 w-6 text-ink-faint" />
          </div>
          <p className="font-mono text-[11px] tracking-widest2 uppercase text-ink-faint">No transactions yet</p>
          <p className="text-xs text-ink-faint">
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
            className="border border-line bg-panel p-4 shadow-sm transition duration-300 hover:bg-panel-soft"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="border border-line2 bg-panel px-2 py-0.5 font-mono text-[11px] tracking-widest2 uppercase text-brass-dim">
                    {tx.merchantName}
                  </span>
                  {isPaid ? (
                    <span className="flex items-center gap-1 font-mono text-[11px] tracking-widest2 uppercase text-brass-dim">
                      <CheckCircle size={12} />
                      Paid
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-mono text-[11px] tracking-widest2 uppercase text-ink-faint">
                      <XCircle size={12} />
                      Expired
                    </span>
                  )}
                </div>
                <p className="text-sm text-ink-dim">{tx.itemDescription}</p>
                <div className="flex items-center gap-3 font-mono text-[11px] tracking-widest2 uppercase text-ink-faint">
                  <span>{tx.buyerAddress.slice(0, 8)}...</span>
                  {tx.createdAt && (
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {tx.createdAt.toDate().toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <span className="text-lg font-semibold text-ink">
                {tx.amountUSDC.toFixed(2)} USDC
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
