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
    && /^\d+(\.\d{0,2})?$/.test(amountUSDC) && amt > 0
    && !selfBill

  return (
    <div className="border border-line bg-panel p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="border border-line2 bg-panel p-2.5">
          <Receipt className="h-5 w-5 text-brass-dim" />
        </div>
        <div>
          <h2 className="font-display text-lg tracking-tightest uppercase text-ink">Create Bill</h2>
          <p className="font-mono text-[10px] tracking-widest2 uppercase text-ink-faint">{storeName ? `Store: ${storeName}` : ''}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block font-mono text-[11px] tracking-widest2 uppercase text-ink-faint">
            Buyer Address
            <button
              type="button"
              onClick={onScanAgain}
              className="ml-2 inline-flex items-center gap-1 text-brass-dim hover:text-brass transition duration-300"
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
            className="w-full border border-line bg-panel px-4 py-2.5 font-mono text-sm text-ink outline-none transition duration-300 focus:border-brass/50 disabled:opacity-50 placeholder:text-ink-faint"
          />
          {selfBill && (
            <p className="mt-1 font-mono text-[11px] tracking-widest2 uppercase text-brass-dim">Cannot create a bill for yourself</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block font-mono text-[11px] tracking-widest2 uppercase text-ink-faint">Item Description</label>
          <input
            type="text"
            placeholder="e.g. Coffee, Subscription, ..."
            value={itemDescription}
            onChange={(e) => onItemDescriptionChange(e.target.value)}
            disabled={saving}
            className="w-full border border-line bg-panel px-4 py-2.5 text-sm text-ink outline-none transition duration-300 focus:border-brass/50 disabled:opacity-50 placeholder:text-ink-faint"
          />
        </div>

        <div>
          <label className="mb-1.5 block font-mono text-[11px] tracking-widest2 uppercase text-ink-faint">Amount (USDC)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amountUSDC}
            onChange={(e) => {
              const v = e.target.value
              if (v === '' || /^\d+(\.\d{0,2})?$/.test(v)) onAmountUSDCChange(v)
            }}
            disabled={saving}
            className="w-full border border-line bg-panel px-4 py-3 font-mono text-lg text-ink outline-none transition duration-300 focus:border-brass/50 disabled:opacity-50 placeholder:text-ink-faint"
          />
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!valid || saving}
          className="mt-2 border border-brass bg-brass py-3 font-mono text-[11px] tracking-widest2 uppercase font-semibold text-obsidian transition duration-300 hover:bg-obsidian hover:text-brass disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Sending...' : 'Send Bill'}
        </button>
      </div>
    </div>
  )
}
