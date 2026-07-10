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
    <div className="flex flex-col items-center gap-4 border border-hairline bg-obsidian-panel p-6">
      <LtvGauge ratio={ltvRatio} />
      <div className="text-center font-mono text-[11px] tracking-widest2 uppercase text-bone-faint">
        <p>Collateral: {loading ? '...' : formatAmount(collateral)}</p>
        <p>Debt: {loading ? '...' : formatAmount(debt)}</p>
      </div>
    </div>
  )
}
