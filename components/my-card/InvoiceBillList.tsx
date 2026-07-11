'use client'

import { useEffect, useState } from 'react'
import { Clock, ShoppingCart, Database, Timer } from 'lucide-react'
import type { Invoice } from '@/hooks/useInvoices'

interface Props {
  invoices: Invoice[]
  loading: boolean
  error: string | null
  indexUrl: string | null
  payingId: string | null
  onPay: (inv: Invoice) => void
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0:00'
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function InvoiceBillList({ invoices, loading, error, indexUrl, payingId, onPay }: Props) {
  const [now, setNow] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center border border-line bg-panel p-12 shadow-sm">
        <p className="font-mono text-[11px] tracking-widest2 uppercase text-ink-faint">Loading invoices...</p>
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
      <div className="border border-line bg-panel p-4 text-sm text-ink-dim shadow-sm">
        Failed to load invoices: {error}
      </div>
    )
  }

  const visible = invoices.filter((inv) => {
    if (inv.status !== 'pending') return false
    if (!inv.expiresAt) return true
    return inv.expiresAt.toDate().getTime() > now
  })

  if (!visible.length) {
    return (
      <div className="flex flex-1 items-center justify-center border border-dashed border-line2 bg-panel-soft py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="border border-line2 bg-panel p-3">
            <ShoppingCart className="h-6 w-6 text-ink-faint" />
          </div>
          <p className="font-mono text-[11px] tracking-widest2 uppercase text-ink-faint">No pending invoices</p>
          <p className="text-xs text-ink-faint">
            Ask a merchant to scan your wallet to receive a bill
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {visible.map((inv) => {
        const isPaying = payingId === inv.id
        const expiresAt = inv.expiresAt?.toDate().getTime() ?? 0
        const left = expiresAt - now
        const expired = left <= 0

        return (
          <div
            key={inv.id}
            className="border border-line bg-panel p-4 shadow-sm transition duration-300 hover:bg-panel-soft"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="border border-line2 bg-panel px-2 py-0.5 font-mono text-[11px] tracking-widest2 uppercase text-brass-dim">
                    {inv.merchantName}
                  </span>
                  {expired && (
                    <span className="flex items-center gap-1 font-mono text-[11px] tracking-widest2 uppercase text-ink-faint">
                      Expired
                    </span>
                  )}
                </div>
                <p className="text-sm text-ink-dim">{inv.itemDescription}</p>
                <div className="flex items-center gap-3 font-mono text-[11px] tracking-widest2 uppercase text-ink-faint">
                  <span>{inv.buyerAddress.slice(0, 8)}...</span>
                  {inv.createdAt && (
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {inv.createdAt.toDate().toLocaleDateString()}
                    </span>
                  )}
                  {!expired && (
                    <span className="flex items-center gap-1 text-brass-dim">
                      <Timer size={11} />
                      {formatCountdown(left)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="text-lg font-semibold text-ink">
                  {inv.amountUSDC.toFixed(2)} USDC
                </span>
                {!expired && (
                  <button
                    type="button"
                    onClick={() => onPay(inv)}
                    disabled={isPaying}
                    className="border border-brass bg-transparent px-4 py-1.5 font-mono text-[11px] tracking-widest2 uppercase text-brass-dim transition duration-300 hover:bg-brass hover:text-obsidian disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPaying ? 'Processing...' : 'Pay Now'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
