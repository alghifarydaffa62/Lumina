'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWallet } from '@/lib/app-wallet'
import { useRouter } from 'next/navigation'
import { getCollateral, getDebt, deposit, withdraw } from '@/lib/contract'
import { toStroops } from '@/lib/amount'
import { useToast } from '@/components/Toast'

export const LTV_LIMIT = 70

function shortHash(hash: string): string {
  return `${hash.slice(0, 8)}...${hash.slice(-4)}`
}

export function useVaultAuth() {
  const { isConnected, isConnecting } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (!isConnected && !isConnecting) router.push('/')
  }, [isConnected, isConnecting, router])

  return { isConnected }
}

export function useVaultBalances() {
  const { account } = useWallet()
  const toast = useToast()
  const [collateral, setCollateral] = useState(BigInt(0))
  const [debt, setDebt] = useState(BigInt(0))
  const [loading, setLoading] = useState(true)
  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    if (!account) return
    let cancelled = false

    const load = async () => {
      try {
        const [c, d] = await Promise.all([
          getCollateral(account.address),
          getDebt(account.address),
        ])
        if (!cancelled) {
          setCollateral(c)
          setDebt(d)
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : 'Failed to fetch balances')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [account, toast, fetchKey])

  const refresh = useCallback(() => {
    setLoading(true)
    setFetchKey((k) => k + 1)
  }, [])

  return { collateral, debt, loading, refresh }
}

export function useVaultActions(refreshBalances: () => void) {
  const { account, signTransaction } = useWallet()
  const toast = useToast()
  const [isPending, setIsPending] = useState(false)

  const execute = useCallback(
    async (
      label: string,
      amountStr: string,
      action: (address: string, amount: bigint, sign: typeof signTransaction) => Promise<string>,
      onSuccess: () => void,
    ) => {
      if (!account?.address || !signTransaction) return
      setIsPending(true)
      try {
        const amount = toStroops(amountStr)
        const hash = await action(account.address, amount, signTransaction)
        toast.success(`${label} ${amountStr} USDC  (${shortHash(hash)})`)
        onSuccess()
        refreshBalances()
      } catch (err) {
        const msg = err instanceof Error ? err.message : ''
        if (msg === 'Transaction cancelled') return
        if (/txfailed|tx_bad_seq|txBadSeq|insufficient|simulation failed/i.test(msg)) {
          toast.error('Insufficient remaining collateral to support active debt.')
        } else {
          toast.error(msg || `${label.toLowerCase()} failed`)
        }
      } finally {
        setIsPending(false)
      }
    },
    [account, signTransaction, toast, refreshBalances],
  )

  const handleDeposit = useCallback(
    (amount: string, clear: () => void) => execute('Deposited', amount, deposit, clear),
    [execute],
  )

  const handleWithdraw = useCallback(
    (amount: string, clear: () => void) => execute('Withdrew', amount, withdraw, clear),
    [execute],
  )

  return { isPending, handleDeposit, handleWithdraw }
}
