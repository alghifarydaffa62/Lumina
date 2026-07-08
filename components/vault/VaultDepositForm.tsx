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
    <div className="flex-1 rounded-2xl border border-purple-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">Deposit Collateral</h2>
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
        <button
          type="button"
          onClick={() => onDeposit(amount, () => setAmount(''))}
          disabled={!valid || disabled}
          className="rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? 'Processing...' : 'Deposit'}
        </button>
      </div>
    </div>
  )
}
