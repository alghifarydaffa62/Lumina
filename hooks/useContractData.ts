'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWallet } from '@/lib/app-wallet'
import { getCollateral, getDebt } from '@/lib/contract'

const LTV_LIMIT = 70

export interface ContractData {
  collateral: bigint
  debt: bigint
  loading: boolean
  error: string | null
  maxAllowedDebt: bigint
  availableCredit: bigint
  ltvHealthRatio: number
  ltvLimit: number
  refresh: () => void
}

export function useContractData(): ContractData {
  const { account } = useWallet()
  const [collateral, setCollateral] = useState<bigint>(BigInt(0))
  const [debt, setDebt] = useState<bigint>(BigInt(0))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    if (!account) return
    let cancelled = false

    const load = async () => {
      try {
        const [coll, d] = await Promise.all([
          getCollateral(account.address),
          getDebt(account.address),
        ])
        if (!cancelled) {
          setCollateral(coll)
          setDebt(d)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError(err instanceof Error ? err.message : 'Failed to fetch contract data')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [account, fetchKey])

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    setFetchKey((k) => k + 1)
  }, [])

  const maxAllowedDebt = collateral * BigInt(LTV_LIMIT) / BigInt(100)
  const availableCredit = maxAllowedDebt > debt ? maxAllowedDebt - debt : BigInt(0)
  const ltvHealthRatio = maxAllowedDebt > BigInt(0) ? Number(debt * BigInt(100) / maxAllowedDebt) : 0

  return {
    collateral,
    debt,
    loading,
    error,
    maxAllowedDebt,
    availableCredit,
    ltvHealthRatio,
    ltvLimit: LTV_LIMIT,
    refresh,
  }
}
