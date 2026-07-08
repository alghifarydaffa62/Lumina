'use client'

import LtvGauge from '@/components/LtvGauge'
import { formatAmount } from '@/lib/format'

interface Props {
  collateral: bigint
  debt: bigint
  ltvRatio: number
  loading: boolean
}

export default function VaultLtvPanel({ collateral, debt, ltvRatio, loading }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-purple-200 bg-white p-6">
      <LtvGauge ratio={ltvRatio} />
      <div className="text-center text-xs text-slate-400">
        <p>Collateral: {loading ? '...' : formatAmount(collateral)}</p>
        <p>Debt: {loading ? '...' : formatAmount(debt)}</p>
      </div>
    </div>
  )
}
