'use client'

import { Receipt, ScanLine } from 'lucide-react'

interface Props {
  buyerAddress: string
  onBuyerAddressChange: (val: string) => void
  itemDescription: string
  onItemDescriptionChange: (val: string) => void
  amountUSDC: string
  onAmountUSDCChange: (val: string) => void
  merchantAddress: string | undefined
  storeName: string | undefined
  saving: boolean
  onSubmit: () => void
  onScanAgain: () => void
}

export default function InvoiceForm({
  buyerAddress,
  onBuyerAddressChange,
  itemDescription,
  onItemDescriptionChange,
  amountUSDC,
  onAmountUSDCChange,
  merchantAddress,
  storeName,
  saving,
  onSubmit,
  onScanAgain,
}: Props) {
  const amt = Number(amountUSDC)
  const selfBill = buyerAddress.trim() === merchantAddress
  const valid = buyerAddress.trim().length > 0
    && itemDescription.trim().length > 0
    && amountUSDC.length > 0 && amt > 0
    && !selfBill

  return (
    <div className="rounded-2xl border border-purple-200 bg-white p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-purple-100 p-2.5">
          <Receipt className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Create Bill</h2>
          <p className="text-xs text-slate-400">{storeName ? `Store: ${storeName}` : ''}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Buyer Address
            <button
              type="button"
              onClick={onScanAgain}
              className="ml-2 inline-flex items-center gap-1 text-purple-600 hover:underline"
            >
              <ScanLine size={13} />
              scan
            </button>
          </label>
          <input
            type="text"
            placeholder="G..."
            value={buyerAddress}
            onChange={(e) => onBuyerAddressChange(e.target.value)}
            disabled={saving}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-sm text-slate-800 outline-none transition focus:border-purple-400 disabled:opacity-50"
          />
          {selfBill && (
            <p className="mt-1 text-xs text-red-500">Cannot create a bill for yourself</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Item Description</label>
          <input
            type="text"
            placeholder="e.g. Coffee, Subscription, ..."
            value={itemDescription}
            onChange={(e) => onItemDescriptionChange(e.target.value)}
            disabled={saving}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-400 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Amount (USDC)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amountUSDC}
            onChange={(e) => onAmountUSDCChange(e.target.value)}
            disabled={saving}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg text-slate-800 outline-none transition focus:border-purple-400 disabled:opacity-50"
          />
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!valid || saving}
          className="mt-2 rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Sending...' : 'Send Bill'}
        </button>
      </div>
    </div>
  )
}
