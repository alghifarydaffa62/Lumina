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
        <p className="text-sm text-ink-faint">Connect your wallet to continue</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-xl tracking-tightest text-ink uppercase md:text-2xl">My Card</h1>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="self-start border border-line2 bg-panel px-4 py-2 font-mono text-[11px] tracking-widest2 uppercase text-ink transition duration-300 hover:bg-ink hover:text-panel disabled:opacity-50 sm:self-auto"
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

      <div className="flex flex-1 gap-4 md:gap-6">
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
