'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from 'stellar-wallet-kit'
import { getCollateral, getDebt, deposit, withdraw } from '@/lib/contract'
import { toStroops } from '@/lib/amount'
import { formatUSD, formatAmount } from '@/lib/format'
import LtvGauge from '@/components/LtvGauge'
import { useToast } from '@/components/Toast'

const LTV_LIMIT = 70

function shortHash(hash: string): string {
  return `${hash.slice(0, 8)}...${hash.slice(-4)}`
}

export default function VaultPage() {
  const { isConnected, isConnecting, account, signTransaction } = useWallet()
  const toast = useToast()
  const router = useRouter()

  const [collateralBalance, setCollateralBalance] = useState<bigint>(BigInt(0))
  const [activeDebt, setActiveDebt] = useState<bigint>(BigInt(0))
  const [loading, setLoading] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    if (!isConnected && !isConnecting) {
      router.push('/')
    }
  }, [isConnected, isConnecting, router])

  const fetchBalances = useCallback(async () => {
    if (!account?.address) return
    setLoading(true)
    try {
      const [coll, debt] = await Promise.all([
        getCollateral(account.address),
        getDebt(account.address),
      ])
      setCollateralBalance(coll)
      setActiveDebt(debt)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch balances')
    } finally {
      setLoading(false)
    }
  }, [account?.address, toast])

  useEffect(() => {
    fetchBalances()
  }, [fetchBalances])

  const collateralNum = Number(collateralBalance)
  const debtNum = Number(activeDebt)
  const maxAllowedDebt = (collateralNum * LTV_LIMIT) / 100
  const ltvHealthRatio = maxAllowedDebt > 0 ? (debtNum / maxAllowedDebt) * 100 : 0

  const handleDeposit = async () => {
    if (!account?.address || !signTransaction) return
    setIsPending(true)
    try {
      const amount = toStroops(depositAmount)
      const hash = await deposit(account.address, amount, signTransaction)
      toast.success(`Deposited ${depositAmount} USDC  (${shortHash(hash)})`)
      setDepositAmount('')
      await fetchBalances()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Deposit failed'
      if (msg !== 'Transaction cancelled') toast.error(msg)
    } finally {
      setIsPending(false)
    }
  }

  const handleWithdraw = async () => {
    if (!account?.address || !signTransaction) return
    setIsPending(true)
    try {
      const amount = toStroops(withdrawAmount)
      const hash = await withdraw(account.address, amount, signTransaction)
      toast.success(`Withdrew ${withdrawAmount} USDC  (${shortHash(hash)})`)
      setWithdrawAmount('')
      await fetchBalances()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Withdrawal failed'
      if (msg === 'Transaction cancelled') return
      if (/simulation failed|insufficient|txfailed|tx_bad_seq|txBadSeq/i.test(msg)) {
        toast.error('Insufficient remaining collateral to support active debt.')
      } else {
        toast.error(msg)
      }
    } finally {
      setIsPending(false)
    }
  }

  const depositValid = depositAmount.length > 0 && Number(depositAmount) > 0
  const withdrawAmt = Number(withdrawAmount)
  const withdrawValid = withdrawAmount.length > 0 && withdrawAmt > 0 && withdrawAmt <= collateralNum

  if (!isConnected) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Please connect your wallet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Vault</h1>
        <button
          type="button"
          onClick={fetchBalances}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
          <p className="text-sm text-purple-400">Collateral Balance</p>
          <p className="mt-2 text-2xl font-semibold text-purple-900">
            {loading ? '...' : formatUSD(collateralBalance)}
          </p>
        </div>
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
          <p className="text-sm text-purple-400">Active Debt</p>
          <p className="mt-2 text-2xl font-semibold text-purple-900">
            {loading ? '...' : formatUSD(activeDebt)}
          </p>
        </div>
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
          <p className="text-sm text-purple-400">LTV Health</p>
          <p className="mt-2 text-2xl font-semibold text-purple-900">
            {loading ? '...' : `${ltvHealthRatio.toFixed(1)}%`}
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-start gap-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-purple-200 bg-white p-6">
          <LtvGauge ratio={ltvHealthRatio} />
          <div className="text-center text-xs text-slate-400">
            <p>Collateral: {loading ? '...' : formatAmount(collateralBalance)}</p>
            <p>Debt: {loading ? '...' : formatAmount(activeDebt)}</p>
          </div>
        </div>

        <div className="flex flex-1 gap-6">
          <div className="flex-1 rounded-2xl border border-purple-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Deposit Collateral</h2>
            <div className="flex flex-col gap-4">
              <input
                type="number"
                step="0.0000001"
                min="0"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                disabled={isPending}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg text-slate-800 outline-none transition focus:border-purple-400 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleDeposit}
                disabled={!depositValid || isPending}
                className="rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? 'Processing...' : 'Deposit'}
              </button>
            </div>
          </div>

          <div className="flex-1 rounded-2xl border border-purple-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Withdraw Collateral</h2>
            <div className="flex flex-col gap-4">
              <input
                type="number"
                step="0.0000001"
                min="0"
                max={formatAmount(collateralBalance)}
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                disabled={isPending}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg text-slate-800 outline-none transition focus:border-purple-400 disabled:opacity-50"
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Available: {loading ? '...' : formatAmount(collateralBalance)}</span>
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(formatAmount(collateralBalance).replace(/,/g, ''))}
                  className="text-purple-600 hover:underline"
                >
                  Max
                </button>
              </div>
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={!withdrawValid || isPending}
                className="rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? 'Processing...' : 'Withdraw'}
              </button>
              {withdrawAmount.length > 0 && withdrawAmt > collateralNum && (
                <p className="text-xs text-red-500">Exceeds available collateral</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
