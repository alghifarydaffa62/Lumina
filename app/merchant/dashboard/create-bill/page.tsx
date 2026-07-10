'use client'

import { useMerchantDashboardAuth, useMerchantStore } from '@/hooks/useMerchant'
import { useMerchantBilling } from '@/hooks/useMerchantBilling'
import { useQRScanner } from '@/hooks/useQRScanner'
import { useWallet } from '@/lib/app-wallet'
import QRScanner from '@/components/merchant/QRScanner'
import InvoiceForm from '@/components/merchant/InvoiceForm'
import { useState } from 'react'

export default function CreateBillPage() {
  const { isConnected } = useMerchantDashboardAuth()
  const { account } = useWallet()
  const { store } = useMerchantStore(account?.address)
  const { saving, createInvoice } = useMerchantBilling()
  const { elId, scanning, result, error, start, stop, reset } = useQRScanner()

  const [buyerAddress, setBuyerAddress] = useState('')
  const [itemDescription, setItemDescription] = useState('')
  const [amountUSDC, setAmountUSDC] = useState('')

  if (!isConnected) return null

  const currentAddress = result || buyerAddress

  const handleSubmit = async () => {
    if (!account || !store) return
    const ok = await createInvoice({
      buyerAddress: currentAddress.trim(),
      merchantAddress: account.address,
      merchantName: store.storeName,
      itemDescription: itemDescription.trim(),
      amountUSDC: Number(amountUSDC),
    })
    if (ok) {
      setBuyerAddress('')
      setItemDescription('')
      setAmountUSDC('')
    }
  }

  const handleScanAgain = () => {
    setBuyerAddress('')
    reset()
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 lg:flex-row lg:items-start">
      <div className="flex-1">
        <QRScanner
          elId={elId}
          scanning={scanning}
          error={error}
          onStart={start}
          onStop={stop}
          onReset={reset}
        />
      </div>

      <div className="flex-1">
        <InvoiceForm
          buyerAddress={currentAddress}
          onBuyerAddressChange={setBuyerAddress}
          itemDescription={itemDescription}
          onItemDescriptionChange={setItemDescription}
          amountUSDC={amountUSDC}
          onAmountUSDCChange={setAmountUSDC}
          merchantAddress={account?.address}
          storeName={store?.storeName}
          saving={saving}
          onSubmit={handleSubmit}
          onScanAgain={handleScanAgain}
        />
      </div>
    </div>
  )
}
