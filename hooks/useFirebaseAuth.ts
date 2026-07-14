'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { onAuthStateChanged, signInWithCustomToken, signOut as fbSignOut, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useWallet } from '@/lib/app-wallet'
import { Horizon, TransactionBuilder, Memo, Operation, Networks, Account } from '@stellar/stellar-sdk'

const HORIZON = new Horizon.Server('https://horizon-testnet.stellar.org')

export function useFirebaseAuth() {
  const { account, signTransaction, isConnected } = useWallet()
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authAttempted, setAuthAttempted] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const authingRef = useRef(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user)
      setAuthReady(true)
    })
    return () => unsub()
  }, [])

  const authenticate = useCallback(async () => {
    if (!account?.address || !signTransaction || authingRef.current) return

    authingRef.current = true
    setAuthLoading(true)
    setAuthError(null)
    setAuthAttempted(true)

    try {
      const { nonce, challenge } = await fetch('/api/firebase-auth').then((r) => r.json())

      const accountData = await HORIZON.loadAccount(account.address)
      const stellarAccount = new Account(accountData.accountId(), accountData.sequenceNumber())

      const tx = new TransactionBuilder(stellarAccount, {
        fee: '100',
        networkPassphrase: Networks.TESTNET,
      })
        .addMemo(Memo.text(nonce))
        .addOperation(Operation.bumpSequence({ bumpTo: '0' }))
        .setTimeout(30)
        .build()

      const txXdr = tx.toXDR()
      const { signedTxXdr } = await signTransaction(txXdr, {
        networkPassphrase: Networks.TESTNET,
      })

      const res = await fetch('/api/firebase-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signedTxXdr, challenge }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Auth failed')

      await signInWithCustomToken(auth, data.token)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setAuthError(msg)
    } finally {
      setAuthLoading(false)
      authingRef.current = false
    }
  }, [account, signTransaction])

  const signOut = useCallback(async () => {
    await fbSignOut(auth)
    setFirebaseUser(null)
  }, [])

  useEffect(() => {
    if (!isConnected || !account?.address || !authReady || firebaseUser || authLoading || authError) return

    const id = setTimeout(() => authenticate(), 5000)
    return () => clearTimeout(id)
  }, [isConnected, account?.address, authReady, firebaseUser, authLoading, authError, authenticate])

  const isAuthenticated = !!firebaseUser
  const uid = firebaseUser?.uid ?? null
  const authSettled = authAttempted && !authLoading

  return { isAuthenticated, uid, firebaseUser, authLoading, authError, authSettled, authenticate, signOut }
}
