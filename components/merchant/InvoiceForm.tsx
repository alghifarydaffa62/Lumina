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
    <div className="border border-hairline bg-obsidian-panel p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="border border-hairline2 bg-obsidian p-2.5">
          <Receipt className="h-5 w-5 text-brass" />
        </div>
        <div>
          <h2 className="font-display text-lg tracking-tightest uppercase text-bone">Create Bill</h2>
          <p className="font-mono text-[10px] tracking-widest2 uppercase text-titanium">{storeName ? `Store: ${storeName}` : ''}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block font-mono text-[11px] tracking-widest2 uppercase text-titanium">
            Buyer Address
            <button
              type="button"
              onClick={onScanAgain}
              className="ml-2 inline-flex items-center gap-1 text-brass hover:text-brass-bright transition duration-300"
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
            className="w-full border border-hairline bg-obsidian px-4 py-2.5 font-mono text-sm text-bone outline-none transition duration-300 focus:border-brass/50 disabled:opacity-50 placeholder:text-bone-faint"
          />
          {selfBill && (
            <p className="mt-1 font-mono text-[11px] tracking-widest2 uppercase text-brass-dim">Cannot create a bill for yourself</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block font-mono text-[11px] tracking-widest2 uppercase text-titanium">Item Description</label>
          <input
            type="text"
            placeholder="e.g. Coffee, Subscription, ..."
            value={itemDescription}
            onChange={(e) => onItemDescriptionChange(e.target.value)}
            disabled={saving}
            className="w-full border border-hairline bg-obsidian px-4 py-2.5 text-sm text-bone outline-none transition duration-300 focus:border-brass/50 disabled:opacity-50 placeholder:text-bone-faint"
          />
        </div>

        <div>
          <label className="mb-1.5 block font-mono text-[11px] tracking-widest2 uppercase text-titanium">Amount (USDC)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amountUSDC}
            onChange={(e) => onAmountUSDCChange(e.target.value)}
            disabled={saving}
            className="w-full border border-hairline bg-obsidian px-4 py-3 font-mono text-lg text-bone outline-none transition duration-300 focus:border-brass/50 disabled:opacity-50 placeholder:text-bone-faint"
          />
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!valid || saving}
          className="mt-2 border border-brass bg-transparent py-3 font-mono text-[11px] tracking-widest2 uppercase text-brass transition duration-300 hover:bg-brass hover:text-obsidian disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Sending...' : 'Send Bill'}
        </button>
      </div>
    </div>
  )
}
