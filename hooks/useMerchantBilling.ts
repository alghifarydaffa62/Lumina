'use client'

import { useState, useCallback } from 'react'
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useToast } from '@/components/Toast'

interface CreateInvoiceParams {
  buyerAddress: string
  merchantAddress: string
  merchantName: string
  itemDescription: string
  amountUSDC: number
}

export function useMerchantBilling() {
  const toast = useToast()
  const [saving, setSaving] = useState(false)

  const createInvoice = useCallback(async (params: CreateInvoiceParams) => {
    setSaving(true)
    try {
      await addDoc(collection(db, 'invoices'), {
        buyerAddress: params.buyerAddress,
        merchantAddress: params.merchantAddress,
        merchantName: params.merchantName,
        itemDescription: params.itemDescription,
        amountUSDC: params.amountUSDC,
        status: 'pending',
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)),
      })
      toast.success(`Invoice sent to ${params.buyerAddress.slice(0, 8)}...`)
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create invoice')
      return false
    } finally {
      setSaving(false)
    }
  }, [toast])

  return { saving, createInvoice }
}
