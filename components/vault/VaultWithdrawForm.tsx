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
  const valid = /^\d+(\.\d*)?$/.test(amount) && num > 0 && num <= maxNum
  const exceeds = /^\d+(\.\d*)?$/.test(amount) && num > maxNum

  return (
    <div className="flex-1 border border-line bg-panel p-6 shadow-sm">
      <h2 className="mb-4 font-mono text-[11px] tracking-widest2 uppercase font-semibold text-ink-dim">Withdraw Collateral</h2>
      <div className="flex flex-col gap-4">
        <input
          type="number"
          step="0.0000001"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => {
            const v = e.target.value
            if (v === '' || /^\d+(\.\d*)?$/.test(v)) setAmount(v)
          }}
          disabled={disabled}
          className="w-full border border-line bg-panel px-4 py-3 font-mono text-lg text-ink outline-none transition duration-300 focus:border-brass/50 disabled:opacity-50 placeholder:text-ink-faint"
        />
        <div className="flex items-center justify-between font-mono text-[11px] tracking-widest2 uppercase text-ink-faint">
          <span className='font-semibold'>Available: {loading ? '...' : formatAmount(maxCollateral)}</span>
          <button
            type="button"
            onClick={() => setAmount(formatAmount(maxCollateral).replace(/,/g, ''))}
            className="text-brass-dim transition duration-300 hover:text-brass"
          >
            Max
          </button>
        </div>
        <button
          type="button"
          onClick={() => onWithdraw(amount, () => setAmount(''))}
          disabled={!valid || disabled}
          className="border border-brass bg-brass py-3 font-mono text-[11px] tracking-widest2 uppercase font-semibold text-obsidian transition duration-300 hover:bg-obsidian hover:text-brass disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? 'Processing...' : 'Withdraw'}
        </button>
        {exceeds && (
          <p className="font-mono text-[11px] tracking-widest2 uppercase text-brass-dim">Exceeds available collateral</p>
        )}
      </div>
    </div>
  )
}
