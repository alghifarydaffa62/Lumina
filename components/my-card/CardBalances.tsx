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
          className={`rounded-2xl border p-5 ${
            c.accent
              ? 'border-purple-300 bg-purple-100'
              : 'border-purple-200 bg-purple-50'
          }`}
        >
          <p className="text-sm text-purple-400">{c.label}</p>
          <p className={`mt-2 text-2xl font-semibold ${c.accent ? 'text-purple-900' : 'text-purple-900'}`}>
            {loading ? '...' : c.value}
          </p>
        </div>
      ))}
    </div>
  )
}
