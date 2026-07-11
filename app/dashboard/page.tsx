'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/lib/app-wallet'
import { useContractData } from '@/hooks/useContractData'
import { formatUSD } from '@/lib/format'
import LtvGauge from '@/components/LtvGauge'

export default function DashboardPage() {
  const { isConnected, isConnecting} = useWallet()
  const { collateral, debt, loading, error, availableCredit, ltvHealthRatio, ltvLimit, refresh } =
    useContractData()
  const router = useRouter()

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

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-xl tracking-tightest text-ink uppercase md:text-2xl">Dashboard</h1>
        <button
          type="button"
          onClick={refresh}
          className="self-start border border-line2 bg-panel px-4 py-2 font-mono text-[11px] tracking-widest2 uppercase text-ink transition duration-300 hover:bg-ink hover:text-panel sm:self-auto"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="border border-oxblood/30 bg-oxblood/5 p-4 text-sm text-oxblood">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="border border-line bg-panel p-5 shadow-sm">
          <p className="font-mono text-[11px] tracking-widest2 uppercase text-ink-faint">Collateral</p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {loading ? '...' : formatUSD(collateral)}
          </p>
        </div>
        <div className="border border-line bg-panel p-5 shadow-sm">
          <p className="font-mono text-[11px] tracking-widest2 uppercase text-ink-faint">Active Debt</p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {loading ? '...' : formatUSD(debt)}
          </p>
        </div>
        <div className="border border-line bg-panel p-5 shadow-sm">
          <p className="font-mono text-[11px] tracking-widest2 uppercase text-ink-faint">Available Credit</p>
          <p className="mt-2 text-2xl font-semibold text-brass-dim">
            {loading ? '...' : formatUSD(availableCredit)}
          </p>
        </div>
        <div className="border border-line bg-panel p-5 shadow-sm">
          <p className="font-mono text-[11px] tracking-widest2 uppercase text-ink-faint">Max LTV</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{ltvLimit}%</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-start gap-6 md:flex-row">
        <div className="flex w-full flex-col items-center border border-line bg-panel p-6 shadow-sm md:w-auto">
          <LtvGauge ratio={ltvHealthRatio} />
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="border border-line bg-panel p-5 shadow-sm">
            <h3 className="mb-2 font-mono text-[11px] tracking-widest2 uppercase text-ink-dim">Credit Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-faint">Collateral Balance</span>
                <span className="font-medium text-ink">
                  {loading ? '...' : formatUSD(collateral)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-faint">Active Debt</span>
                <span className="font-medium text-ink">
                  {loading ? '...' : formatUSD(debt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-faint">Max Allowed Debt ({ltvLimit}% LTV)</span>
                <span className="font-medium text-ink">
                  {loading ? '...' : formatUSD((Number(collateral) * ltvLimit) / 100)}
                </span>
              </div>
              <div className="border-t border-line pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-ink-dim">Available Credit</span>
                  <span className="font-semibold text-brass-dim">
                    {loading ? '...' : formatUSD(availableCredit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center border border-dashed border-line2 bg-panel-soft font-mono text-[11px] tracking-widest2 uppercase text-ink-faint">
            Activity feed — coming soon
          </div>
        </div>
      </div>
    </div>
  )
}