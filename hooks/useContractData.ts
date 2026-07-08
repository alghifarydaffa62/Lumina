'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWallet } from 'stellar-wallet-kit'
import { getCollateral, getDebt } from '@/lib/contract'

const LTV_LIMIT = 70

interface ContractData {
  collateral: bigint
  debt: bigint
  loading: boolean
  error: string | null
  maxAllowedDebt: number
  availableCredit: number
  ltvHealthRatio: number
  ltvLimit: number
  refresh: () => void
}

export function useContractData(): ContractData {
  const { account, isConnected } = useWallet()
  const [collateral, setCollateral] = useState<bigint>(BigInt(0))
  const [debt, setDebt] = useState<bigint>(BigInt(0))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  const fetchData = useCallback(async () => {
    if (!isConnected || !account?.address) return

    setLoading(true)
    setError(null)

    try {
      const [coll, d] = await Promise.all([
        getCollateral(account.address),
        getDebt(account.address),
      ])

      setCollateral(coll)
      setDebt(d)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to fetch contract data')
    } finally {
      setLoading(false)
    }
  }, [isConnected, account?.address])

  useEffect(() => {
    fetchData()
  }, [fetchData, fetchKey])

  const collateralNum = Number(collateral)
  const debtNum = Number(debt)
  const maxAllowedDebt = (collateralNum * LTV_LIMIT) / 100
  const availableCredit = Math.max(0, maxAllowedDebt - debtNum)
  const ltvHealthRatio = maxAllowedDebt > 0 ? (debtNum / maxAllowedDebt) * 100 : 0

  return {
    collateral,
    debt,
    loading,
    error,
    maxAllowedDebt,
    availableCredit,
    ltvHealthRatio,
    ltvLimit: LTV_LIMIT,
    refresh: () => setFetchKey((k) => k + 1),
  }
}
