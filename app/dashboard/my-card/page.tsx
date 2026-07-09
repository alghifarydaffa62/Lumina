'use client'

import { useCardAuth, useCardBalances } from '@/hooks/useCard'
import { useInvoices, usePayInvoice } from '@/hooks/useInvoices'
import CardBalances from '@/components/my-card/CardBalances'
import InvoiceBillList from '@/components/my-card/InvoiceBillList'

export default function MyCardPage() {
  const { isConnected } = useCardAuth()
  const { collateral, debt, availableCredit, loading, refresh } = useCardBalances()
  const { invoices, loading: invLoading, error: invError, indexUrl } = useInvoices()
  const { payingId, pay } = usePayInvoice()

  if (!isConnected) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-slate-500">Please connect your wallet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">My Card</h1>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <CardBalances
        availableCredit={availableCredit}
        collateral={collateral}
        debt={debt}
        loading={loading}
      />

      <div className="flex flex-1 gap-6">
        <div className="flex-1">
          <InvoiceBillList
            invoices={invoices}
            loading={invLoading}
            error={invError}
            indexUrl={indexUrl}
            payingId={payingId}
            onPay={pay}
          />
        </div>
      </div>
    </div>
  )
}
