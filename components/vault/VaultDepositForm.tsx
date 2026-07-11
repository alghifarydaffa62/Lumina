'use client'

import { useState } from 'react'

interface Props {
  onDeposit: (amount: string, clear: () => void) => void
  disabled: boolean
}

export default function VaultDepositForm({ onDeposit, disabled }: Props) {
  const [amount, setAmount] = useState('')

  const valid = /^\d+(\.\d*)?$/.test(amount) && Number(amount) > 0

  return (
    <div className="flex-1 border border-line bg-panel p-6 shadow-sm">
      <h2 className="mb-4 font-mono text-[11px] tracking-widest2 uppercase font-semibold text-ink-dim">Deposit Collateral</h2>
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
        <button
          type="button"
          onClick={() => onDeposit(amount, () => setAmount(''))}
          disabled={!valid || disabled}
          className="border border-brass bg-brass py-3 font-mono text-[11px] tracking-widest2 uppercase font-semibold text-obsidian transition duration-300 hover:bg-obsidian hover:text-brass disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? 'Processing...' : 'Deposit'}
        </button>
      </div>
    </div>
  )
}
