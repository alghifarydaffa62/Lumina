'use client'

import { useState } from 'react'
import { formatAmount } from '@/lib/format'

interface Props {
  onWithdraw: (amount: string, clear: () => void) => void
  maxCollateral: bigint
  loading: boolean
  disabled: boolean
}

export default function VaultWithdrawForm({ onWithdraw, maxCollateral, loading, disabled }: Props) {
  const [amount, setAmount] = useState('')

  const num = Number(amount)
  const maxNum = Number(maxCollateral) / 1e7
  const valid = amount.length > 0 && num > 0 && num <= maxNum
  const exceeds = amount.length > 0 && num > maxNum

  return (
    <div className="flex-1 rounded-2xl border border-purple-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">Withdraw Collateral</h2>
      <div className="flex flex-col gap-4">
        <input
          type="number"
          step="0.0000001"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={disabled}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg text-slate-800 outline-none transition focus:border-purple-400 disabled:opacity-50"
        />
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Available: {loading ? '...' : formatAmount(maxCollateral)}</span>
          <button
            type="button"
            onClick={() => setAmount(formatAmount(maxCollateral).replace(/,/g, ''))}
            className="text-purple-600 hover:underline"
          >
            Max
          </button>
        </div>
        <button
          type="button"
          onClick={() => onWithdraw(amount, () => setAmount(''))}
          disabled={!valid || disabled}
          className="rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? 'Processing...' : 'Withdraw'}
        </button>
        {exceeds && (
          <p className="text-xs text-red-500">Exceeds available collateral</p>
        )}
      </div>
    </div>
  )
}
