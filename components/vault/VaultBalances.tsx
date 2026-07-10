'use client'

import { formatUSD } from '@/lib/format'

interface Props {
  collateral: bigint
  debt: bigint
  ltvRatio: number
  loading: boolean
}

export default function VaultBalances({ collateral, debt, ltvRatio, loading }: Props) {
  const cards = [
    { label: 'Collateral Balance', value: formatUSD(collateral) },
    { label: 'Active Debt', value: formatUSD(debt) },
    { label: 'LTV Health', value: `${ltvRatio.toFixed(1)}%` },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} className="border border-hairline bg-obsidian-panel p-5">
          <p className="font-mono text-[11px] tracking-widest2 uppercase text-titanium">{c.label}</p>
          <p className="mt-2 text-2xl font-semibold text-bone">
            {loading ? '...' : c.value}
          </p>
        </div>
      ))}
    </div>
  )
}
