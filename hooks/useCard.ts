'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWallet } from '@/lib/app-wallet'
import { useRouter } from 'next/navigation'
import { getCollateral, getDebt, spend } from '@/lib/contract'
import { toStroops } from '@/lib/amount'
import { useToast } from '@/components/Toast'

export const LTV_LIMIT = 70

function shortHash(hash: string): string {
  return `${hash.slice(0, 8)}...${hash.slice(-4)}`
}

export function useCardAuth() {
  const { isConnected, isConnecting } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (!isConnected && !isConnecting) router.push('/')
  }, [isConnected, isConnecting, router])

  return { isConnected }
}

export function useCardBalances() {
  const { account } = useWallet()
  const toast = useToast()
  const [collateral, setCollateral] = useState(BigInt(0))
  const [debt, setDebt] = useState(BigInt(0))
  const [loading, setLoading] = useState(true)
  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    if (!account) return
    let cancelled = false
    let poll = false

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
        if (!cancelled && !poll) {
          toast.error(err instanceof Error ? err.message : 'Failed to fetch balances')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const interval = setInterval(() => {
      poll = true
      load()
    }, 60_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [account, toast, fetchKey])

  const maxDebt = collateral * BigInt(LTV_LIMIT) / BigInt(100)
  const availableCredit: bigint = maxDebt > debt ? maxDebt - debt : BigInt(0)

  const refresh = useCallback(() => {
    setLoading(true)
    setFetchKey((k) => k + 1)
  }, [])

  return { collateral, debt, availableCredit, loading, refresh }
}

export function useCardActions(refreshBalances: () => void) {
  const { account, signTransaction } = useWallet()
  const toast = useToast()
  const [isPending, setIsPending] = useState(false)

  const handleSpend = useCallback(
    async (amountStr: string, onSuccess: () => void) => {
      if (!account?.address || !signTransaction) return
      setIsPending(true)
      try {
        const amount = toStroops(amountStr)
        const hash = await spend(account.address, amount, signTransaction)
        toast.success(`Spent ${amountStr} USDC  (${shortHash(hash)})`)
        onSuccess()
        refreshBalances()
      } catch (err) {
        const msg = err instanceof Error ? err.message : ''
        if (msg === 'Transaction cancelled') return
        if (/txfailed|tx_bad_seq|txBadSeq|insufficient|simulation failed/i.test(msg)) {
          toast.error('Transaction failed: Exceeds maximum LTV credit limit or insufficient gas.')
        } else {
          toast.error(msg || 'Spend failed')
        }
      } finally {
        setIsPending(false)
      }
    },
    [account, signTransaction, toast, refreshBalances],
  )

  return { isPending, handleSpend }
}
