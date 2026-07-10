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
        <p className="text-sm text-titanium">Connect your wallet to continue</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-xl tracking-tightest text-bone uppercase md:text-2xl">Dashboard</h1>
        <button
          type="button"
          onClick={refresh}
          className="self-start border border-hairline2 bg-transparent px-4 py-2 font-mono text-[11px] tracking-widest2 uppercase text-bone transition duration-300 hover:bg-bone hover:text-obsidian sm:self-auto"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="border border-brass/30 bg-brass/5 p-4 text-sm text-brass">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="border border-hairline bg-obsidian-panel p-5">
          <p className="font-mono text-[11px] tracking-widest2 uppercase text-titanium">Collateral</p>
          <p className="mt-2 text-2xl font-semibold text-bone">
            {loading ? '...' : formatUSD(collateral)}
          </p>
        </div>
        <div className="border border-hairline bg-obsidian-panel p-5">
          <p className="font-mono text-[11px] tracking-widest2 uppercase text-titanium">Active Debt</p>
          <p className="mt-2 text-2xl font-semibold text-bone">
            {loading ? '...' : formatUSD(debt)}
          </p>
        </div>
        <div className="border border-hairline bg-obsidian-panel p-5">
          <p className="font-mono text-[11px] tracking-widest2 uppercase text-titanium">Available Credit</p>
          <p className="mt-2 text-2xl font-semibold text-brass">
            {loading ? '...' : formatUSD(availableCredit)}
          </p>
        </div>
        <div className="border border-hairline bg-obsidian-panel p-5">
          <p className="font-mono text-[11px] tracking-widest2 uppercase text-titanium">Max LTV</p>
          <p className="mt-2 text-2xl font-semibold text-bone">{ltvLimit}%</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-start gap-6 md:flex-row">
        <div className="flex w-full flex-col items-center border border-hairline bg-obsidian-panel p-6 md:w-auto">
          <LtvGauge ratio={ltvHealthRatio} />
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="border border-hairline bg-obsidian-panel p-5">
            <h3 className="mb-2 font-mono text-[11px] tracking-widest2 uppercase text-bone-dim">Credit Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-titanium">Collateral Balance</span>
                <span className="font-medium text-bone">
                  {loading ? '...' : formatUSD(collateral)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-titanium">Active Debt</span>
                <span className="font-medium text-bone">
                  {loading ? '...' : formatUSD(debt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-titanium">Max Allowed Debt ({ltvLimit}% LTV)</span>
                <span className="font-medium text-bone">
                  {loading ? '...' : formatUSD((Number(collateral) * ltvLimit) / 100)}
                </span>
              </div>
              <div className="border-t border-hairline pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-bone-dim">Available Credit</span>
                  <span className="font-semibold text-brass">
                    {loading ? '...' : formatUSD(availableCredit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center border border-dashed border-hairline2 bg-obsidian-panel font-mono text-[11px] tracking-widest2 uppercase text-bone-faint">
            Activity feed — coming soon
          </div>
        </div>
      </div>
    </div>
  )
}
