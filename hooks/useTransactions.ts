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
import { useFirebaseAuthContext } from '@/lib/firebase-auth-context'

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
  const { isAuthenticated, authLoading, authError } = useFirebaseAuthContext()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [indexUrl, setIndexUrl] = useState<string | null>(null)

  const ready = !!account?.address && isAuthenticated

  useEffect(() => {
    if (!account?.address) return
    if (authLoading) return
    if (!isAuthenticated) return

    setLoading(true)
    setError(null)
    setIndexUrl(null)

    console.log('[useTransactions] subscribing to Firestore', {
      address: account.address,
      isAuthenticated,
    })

    const q = query(
      collection(db, 'invoices'),
      where('buyerAddress', '==', account.address),
      orderBy('createdAt', 'desc'),
    )

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        console.log('[useTransactions] onSnapshot success', {
          docCount: snapshot.size,
          empty: snapshot.empty,
          metadata: snapshot.metadata,
        })
        const list: Transaction[] = []
        snapshot.forEach((d) => {
          const data = d.data()
          if (data.status !== 'paid' && data.status !== 'expired' && data.status !== 'settled') return
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
        console.log('[useTransactions] after filter', { listLength: list.length, list })
        setTransactions(list)
        setLoading(false)
        setError(null)
        setIndexUrl(null)
      },
      (err) => {
        console.error('[useTransactions] onSnapshot error', {
          code: err.code,
          message: err.message,
          name: err.name,
          stack: err.stack,
        })
        setError(`${err.name}: ${err.message}`)
        setLoading(false)
        setIndexUrl(extractIndexUrl(err.message))
      },
    )

    return () => {
      console.log('[useTransactions] unsubscribing')
      unsub()
    }
  }, [account?.address, authLoading, isAuthenticated])

  console.log('[useTransactions] render', {
    ready,
    loading,
    error,
    transactionsCount: transactions.length,
    isAuthenticated,
    authLoading,
    authError,
    address: account?.address,
  })

  return {
    transactions: ready ? transactions : [],
    loading: ready ? loading : false,
    error: ready ? error : null,
    indexUrl: ready ? indexUrl : null,
  }
}
