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
      <div className="flex items-center justify-center border border-hairline bg-obsidian-panel p-12">
        <p className="font-mono text-[11px] tracking-widest2 uppercase text-titanium">Loading transactions...</p>
      </div>
    )
  }

  if (error && indexUrl) {
    return (
      <div className="border border-brass/30 bg-brass/5 p-6">
        <div className="flex items-start gap-3">
          <Database className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
          <div className="space-y-2 text-sm">
            <p className="font-medium text-brass">Firestore index needed</p>
            <p className="text-brass-dim">
              This query needs a composite index to run. Click the button below to create it in Firebase Console.
            </p>
            <a
              href={indexUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-hairline2 bg-transparent px-4 py-2 font-mono text-[11px] tracking-widest2 uppercase text-brass transition duration-300 hover:bg-brass hover:text-obsidian"
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
      <div className="border border-brass/30 bg-brass/5 p-4 text-sm text-brass">
        Failed to load transactions: {error}
      </div>
    )
  }

  if (!transactions.length) {
    return (
      <div className="flex flex-1 items-center justify-center border border-dashed border-hairline2 bg-obsidian-panel py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="border border-hairline2 bg-obsidian p-3">
            <Clock className="h-6 w-6 text-bone-faint" />
          </div>
          <p className="font-mono text-[11px] tracking-widest2 uppercase text-bone-faint">No transactions yet</p>
          <p className="text-xs text-bone-faint">
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
            className="border border-hairline bg-obsidian-panel p-4 transition duration-300 hover:bg-obsidian-raised"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="border border-hairline2 bg-obsidian px-2 py-0.5 font-mono text-[11px] tracking-widest2 uppercase text-brass">
                    {tx.merchantName}
                  </span>
                  {isPaid ? (
                    <span className="flex items-center gap-1 font-mono text-[11px] tracking-widest2 uppercase text-brass">
                      <CheckCircle size={12} />
                      Paid
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-mono text-[11px] tracking-widest2 uppercase text-bone-faint">
                      <XCircle size={12} />
                      Expired
                    </span>
                  )}
                </div>
                <p className="text-sm text-bone-dim">{tx.itemDescription}</p>
                <div className="flex items-center gap-3 font-mono text-[11px] tracking-widest2 uppercase text-bone-faint">
                  <span>{tx.buyerAddress.slice(0, 8)}...</span>
                  {tx.createdAt && (
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {tx.createdAt.toDate().toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <span className="text-lg font-semibold text-bone">
                {tx.amountUSDC.toFixed(2)} USDC
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
