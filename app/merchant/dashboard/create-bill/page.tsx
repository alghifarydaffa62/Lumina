'use client'

import { useState } from 'react'
import { useWallet } from 'stellar-wallet-kit'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useToast } from '@/components/Toast'
import { useMerchantDashboardAuth, useMerchantStore } from '@/hooks/useMerchant'
import { Receipt } from 'lucide-react'

export default function CreateBillPage() {
  const { isConnected } = useMerchantDashboardAuth()
  const { account } = useWallet()
  const { store } = useMerchantStore(account?.address)
  const toast = useToast()

  const [buyerAddress, setBuyerAddress] = useState('')
  const [itemDescription, setItemDescription] = useState('')
  const [amountUSDC, setAmountUSDC] = useState('')
  const [saving, setSaving] = useState(false)

  if (!isConnected) return null

  const amt = Number(amountUSDC)
  const valid = buyerAddress.trim().length > 0
    && itemDescription.trim().length > 0
    && amountUSDC.length > 0 && amt > 0
    && buyerAddress.trim() !== account?.address

  const handleCreate = async () => {
    if (!account || !store) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'invoices'), {
        merchantAddress: account.address,
        merchantName: store.storeName,
        buyerAddress: buyerAddress.trim(),
        itemDescription: itemDescription.trim(),
        amountUSDC: amt,
        status: 'pending',
        createdAt: serverTimestamp(),
      })
      toast.success(`Invoice sent to ${buyerAddress.slice(0, 8)}...`)
      setBuyerAddress('')
      setItemDescription('')
      setAmountUSDC('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create invoice')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="rounded-2xl border border-purple-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-purple-100 p-2.5">
            <Receipt className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Create Bill</h2>
            <p className="text-xs text-slate-400">
              {store ? `Store: ${store.storeName}` : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Buyer Address</label>
            <input
              type="text"
              placeholder="G..."
              value={buyerAddress}
              onChange={(e) => setBuyerAddress(e.target.value)}
              disabled={saving}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-sm text-slate-800 outline-none transition focus:border-purple-400 disabled:opacity-50"
            />
            {buyerAddress === account?.address && (
              <p className="mt-1 text-xs text-red-500">Cannot create a bill for yourself</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Item Description</label>
            <input
              type="text"
              placeholder="e.g. Coffee, Subscription, ..."
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
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
              onChange={(e) => setAmountUSDC(e.target.value)}
              disabled={saving}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg text-slate-800 outline-none transition focus:border-purple-400 disabled:opacity-50"
            />
          </div>

          <button
            type="button"
            onClick={handleCreate}
            disabled={!valid || saving}
            className="mt-2 rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Issue Invoice'}
          </button>
        </div>
      </div>
    </div>
  )
}
