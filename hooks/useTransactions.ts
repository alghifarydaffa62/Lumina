'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@/lib/app-wallet'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Transaction {
  id: string
  merchantName: string
  itemDescription: string
  amountUSDC: number
  status: 'paid' | 'expired'
  createdAt: Timestamp | null
  buyerAddress: string
}

function extractIndexUrl(msg: string): string | null {
  const m = msg.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)
  return m?.[0] ?? null
}

export function useTransactions() {
  const { account } = useWallet()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [indexUrl, setIndexUrl] = useState<string | null>(null)

  const ready = !!account?.address

  useEffect(() => {
    if (!ready) return

    const q = query(
      collection(db, 'invoices'),
      where('buyerAddress', '==', account!.address),
      orderBy('createdAt', 'desc'),
    )

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: Transaction[] = []
        snapshot.forEach((d) => {
          const data = d.data()
          if (data.status !== 'paid' && data.status !== 'expired') return
          list.push({
            id: d.id,
            merchantName: data.merchantName || '',
            itemDescription: data.itemDescription,
            amountUSDC: data.amountUSDC,
            status: data.status,
            createdAt: data.createdAt ?? null,
            buyerAddress: data.buyerAddress,
          })
        })
        setTransactions(list)
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
  }, [ready, account])

  return {
    transactions: ready ? transactions : [],
    loading: ready ? loading : false,
    error: ready ? error : null,
    indexUrl: ready ? indexUrl : null,
  }
}
