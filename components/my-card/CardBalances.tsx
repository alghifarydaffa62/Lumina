'use client'

import { formatUSD } from '@/lib/format'

interface Props {
  availableCredit: bigint
  collateral: bigint
  debt: bigint
  loading: boolean
}

export default function CardBalances({ availableCredit, collateral, debt, loading }: Props) {
  const cards = [
    { label: 'Available Credit', value: formatUSD(availableCredit), accent: true },
    { label: 'Collateral Balance', value: formatUSD(collateral) },
    { label: 'Active Debt', value: formatUSD(debt) },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`border p-5 ${
            c.accent
              ? 'border-brass/30 bg-brass/5'
              : 'border-hairline bg-obsidian-panel'
          }`}
        >
          <p className="font-mono text-[11px] tracking-widest2 uppercase text-titanium">{c.label}</p>
          <p className={`mt-2 text-2xl font-semibold ${c.accent ? 'text-brass' : 'text-bone'}`}>
            {loading ? '...' : c.value}
          </p>
        </div>
      ))}
    </div>
  )
}
