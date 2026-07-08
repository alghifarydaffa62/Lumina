'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from 'stellar-wallet-kit'
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
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Please connect your wallet to access the dashboard.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={refresh}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
          <p className="text-sm text-purple-400">Collateral</p>
          <p className="mt-2 text-2xl font-semibold text-purple-900">
            {loading ? '...' : formatUSD(collateral)}
          </p>
        </div>
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
          <p className="text-sm text-purple-400">Active Debt</p>
          <p className="mt-2 text-2xl font-semibold text-purple-900">
            {loading ? '...' : formatUSD(debt)}
          </p>
        </div>
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
          <p className="text-sm text-purple-400">Available Credit</p>
          <p className="mt-2 text-2xl font-semibold text-purple-900">
            {loading ? '...' : formatUSD(availableCredit)}
          </p>
        </div>
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
          <p className="text-sm text-purple-400">Max LTV</p>
          <p className="mt-2 text-2xl font-semibold text-purple-900">{ltvLimit}%</p>
        </div>
      </div>

      <div className="flex flex-1 items-start gap-6">
        <div className="flex flex-col items-center rounded-2xl border border-purple-200 bg-white p-6">
          <LtvGauge ratio={ltvHealthRatio} />
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="rounded-2xl border border-purple-200 bg-white p-5">
            <h3 className="mb-2 text-sm font-medium text-slate-700">Credit Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Collateral Balance</span>
                <span className="font-medium text-slate-800">
                  {loading ? '...' : formatUSD(collateral)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Active Debt</span>
                <span className="font-medium text-slate-800">
                  {loading ? '...' : formatUSD(debt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Max Allowed Debt ({ltvLimit}% LTV)</span>
                <span className="font-medium text-slate-800">
                  {loading ? '...' : formatUSD((Number(collateral) * ltvLimit) / 100)}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Available Credit</span>
                  <span className="font-semibold text-purple-900">
                    {loading ? '...' : formatUSD(availableCredit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-purple-200 bg-white text-purple-300">
            Activity feed — coming soon
          </div>
        </div>
      </div>
    </div>
  )
}
