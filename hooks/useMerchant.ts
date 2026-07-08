'use client'

import { useEffect, useState, useCallback, startTransition } from 'react'
import { useWallet } from 'stellar-wallet-kit'
import { useRouter } from 'next/navigation'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useToast } from '@/components/Toast'

export function useMerchantDashboardAuth() {
  const { isConnected, isConnecting } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (!isConnected && !isConnecting) router.push('/merchant')
  }, [isConnected, isConnecting, router])

  return { isConnected }
}

export interface MerchantData {
  storeName: string
  joinedAt: Date | null
}

export function useMerchantStore(address: string | undefined) {
  const toast = useToast()
  const [store, setStore] = useState<MerchantData | null>(null)
  const [checking, setChecking] = useState(true)
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    if (!address) {
      startTransition(() => setChecking(false))
      return
    }

    let cancelled = false

    getDoc(doc(db, 'merchants', address))
      .then((snap) => {
        if (!cancelled) {
          if (snap.exists()) {
            const data = snap.data()
            setStore({ storeName: data.storeName, joinedAt: data.joinedAt?.toDate() ?? null })
            setRegistered(true)
          } else {
            setStore(null)
            setRegistered(false)
          }
        }
      })
      .catch((err) => {
        if (!cancelled) toast.error(err instanceof Error ? err.message : 'Failed to check store')
      })
      .finally(() => {
        if (!cancelled) setChecking(false)
      })

    return () => { cancelled = true }
  }, [address, toast])

  const register = useCallback(async (storeName: string) => {
    if (!address) return
    try {
      await setDoc(doc(db, 'merchants', address), {
        storeName,
        joinedAt: serverTimestamp(),
      })
      setStore({ storeName, joinedAt: null })
      setRegistered(true)
      toast.success(`Store "${storeName}" registered!`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to register store')
      throw err
    }
  }, [address, toast])

  return { store, checking, registered, register }
}
