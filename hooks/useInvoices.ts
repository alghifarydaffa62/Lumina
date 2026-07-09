'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useWallet } from 'stellar-wallet-kit'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { spend } from '@/lib/contract'
import { toStroops } from '@/lib/amount'
import { useToast } from '@/components/Toast'

export interface Invoice {
  id: string
  buyerAddress: string
  merchantAddress: string
  merchantName: string
  itemDescription: string
  amountUSDC: number
  status: 'pending' | 'paid' | 'expired'
  createdAt: Timestamp | null
  expiresAt: Timestamp | null
}

function shortHash(hash: string): string {
  return `${hash.slice(0, 8)}...${hash.slice(-4)}`
}

function extractIndexUrl(msg: string): string | null {
  const m = msg.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)
  return m?.[0] ?? null
}

export function useInvoices() {
  const { account } = useWallet()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [indexUrl, setIndexUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!account?.address) {
      setInvoices([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'invoices'),
      where('buyerAddress', '==', account.address),
      orderBy('createdAt', 'desc'),
    )

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: Invoice[] = []
        snapshot.forEach((d) => {
          const data = d.data()
          list.push({
            id: d.id,
            buyerAddress: data.buyerAddress,
            merchantAddress: data.merchantAddress,
            merchantName: data.merchantName || '',
            itemDescription: data.itemDescription,
            amountUSDC: data.amountUSDC,
            status: data.status,
            createdAt: data.createdAt ?? null,
            expiresAt: data.expiresAt ?? null,
          })
        })
        setInvoices(list)
        setLoading(false)
        setError(null)
        setIndexUrl(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
        setIndexUrl(extractIndexUrl(err.message))
      },
    )

    return () => unsub()
  }, [account?.address])

  return { invoices, loading, error, indexUrl }
}

export function usePayInvoice() {
  const { account, signTransaction } = useWallet()
  const toast = useToast()
  const [payingId, setPayingId] = useState<string | null>(null)

  const pay = useCallback(
    async (inv: Invoice) => {
      if (!account?.address || !signTransaction) return

      setPayingId(inv.id)
      try {
        const amount = toStroops(String(inv.amountUSDC))
        const hash = await spend(account.address, amount, signTransaction)
        await updateDoc(doc(db, 'invoices', inv.id), { status: 'paid' })
        toast.success(`Paid ${inv.amountUSDC} USDC to ${inv.merchantName} (${shortHash(hash)})`)
      } catch (err) {
        const msg = err instanceof Error ? err.message : ''
        if (msg === 'Transaction cancelled') return
        if (/txfailed|tx_bad_seq|txBadSeq|insufficient|simulation failed/i.test(msg)) {
          toast.error('Transaction failed: Exceeds maximum LTV credit limit or insufficient gas.')
        } else {
          toast.error(msg || 'Payment failed')
        }
      } finally {
        setPayingId(null)
      }
    },
    [account, signTransaction, toast],
  )

  return { payingId, pay }
}
