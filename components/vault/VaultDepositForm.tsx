'use client'

import { useState } from 'react'

interface Props {
  onDeposit: (amount: string, clear: () => void) => void
  disabled: boolean
}

export default function VaultDepositForm({ onDeposit, disabled }: Props) {
  const [amount, setAmount] = useState('')

  const valid = amount.length > 0 && Number(amount) > 0

  return (
    <div className="flex-1 border border-hairline bg-obsidian-panel p-6">
      <h2 className="mb-4 font-mono text-[11px] tracking-widest2 uppercase text-bone-dim">Deposit Collateral</h2>
      <div className="flex flex-col gap-4">
        <input
          type="number"
          step="0.0000001"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={disabled}
          className="w-full border border-hairline bg-obsidian px-4 py-3 font-mono text-lg text-bone outline-none transition duration-300 focus:border-brass/50 disabled:opacity-50 placeholder:text-bone-faint"
        />
        <button
          type="button"
          onClick={() => onDeposit(amount, () => setAmount(''))}
          disabled={!valid || disabled}
          className="border border-brass bg-transparent py-3 font-mono text-[11px] tracking-widest2 uppercase text-brass transition duration-300 hover:bg-brass hover:text-obsidian disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? 'Processing...' : 'Deposit'}
        </button>
      </div>
    </div>
  )
}
