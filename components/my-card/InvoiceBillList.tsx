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
      <div className="flex items-center justify-center rounded-2xl border border-purple-200 bg-white p-12">
        <p className="text-sm text-slate-400">Loading invoices...</p>
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
      <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-purple-200 bg-white py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-purple-100 p-3">
            <ShoppingCart className="h-6 w-6 text-purple-400" />
          </div>
          <p className="text-sm font-medium text-purple-400">No pending invoices</p>
          <p className="text-xs text-purple-300">
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
            className="rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                    {inv.merchantName}
                  </span>
                  {expired && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      Expired
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700">{inv.itemDescription}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="font-mono">{inv.buyerAddress.slice(0, 8)}...</span>
                  {inv.createdAt && (
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {inv.createdAt.toDate().toLocaleDateString()}
                    </span>
                  )}
                  {!expired && (
                    <span className="flex items-center gap-1 font-mono text-amber-600">
                      <Timer size={11} />
                      {formatCountdown(left)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="text-lg font-semibold text-slate-800">
                  {inv.amountUSDC.toFixed(2)} USDC
                </span>
                {!expired && (
                  <button
                    type="button"
                    onClick={() => onPay(inv)}
                    disabled={isPaying}
                    className="rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
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
