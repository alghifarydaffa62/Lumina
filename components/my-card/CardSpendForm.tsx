'use client'

import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { formatAmount } from '@/lib/format'

interface Props {
  onSpend: (amount: string, clear: () => void) => void
  availableCredit: bigint
  disabled: boolean
}

export default function CardSpendForm({ onSpend, availableCredit, disabled }: Props) {
  const [amount, setAmount] = useState('')
  const [merchant, setMerchant] = useState('')

  const creditNum = Number(availableCredit) / 1e7
  const num = Number(amount)
  const valid = amount.length > 0 && num > 0 && num <= creditNum
  const exceeds = amount.length > 0 && num > creditNum

  return (
    <div className="rounded-2xl border border-purple-200 bg-white p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-purple-100 p-2.5">
          <ShoppingCart className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Make a Purchase</h2>
          <p className="text-xs text-slate-400">
            Available credit: ${creditNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Merchant</label>
          <input
            type="text"
            placeholder="e.g. Starbucks, Amazon, ..."
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-400 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Amount (USDC)</label>
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
          {exceeds && (
            <p className="mt-1 text-xs text-red-500">Exceeds available credit</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onSpend(amount, () => { setAmount(''); setMerchant('') })}
          disabled={!valid || disabled}
          className="mt-2 rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </div>
  )
}
