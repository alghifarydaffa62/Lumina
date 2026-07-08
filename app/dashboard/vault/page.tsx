'use client'

import { useVaultAuth, useVaultBalances, useVaultActions, LTV_LIMIT } from '@/hooks/useVault'
import VaultBalances from '@/components/vault/VaultBalances'
import VaultLtvPanel from '@/components/vault/VaultLtvPanel'
import VaultDepositForm from '@/components/vault/VaultDepositForm'
import VaultWithdrawForm from '@/components/vault/VaultWithdrawForm'

export default function VaultPage() {
  const { isConnected } = useVaultAuth()
  const { collateral, debt, loading, refresh } = useVaultBalances()
  const { isPending, handleDeposit, handleWithdraw } = useVaultActions(refresh)

  const collateralNum = Number(collateral)
  const debtNum = Number(debt)
  const maxAllowed = (collateralNum * LTV_LIMIT) / 100
  const ltvRatio = maxAllowed > 0 ? (debtNum / maxAllowed) * 100 : 0

  if (!isConnected) {
    return (
      <div className="flex flex-1 items-center justify-center">
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
          onClick={refresh}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <VaultBalances
        collateral={collateral}
        debt={debt}
        ltvRatio={ltvRatio}
        loading={loading}
      />

      <div className="flex flex-1 items-start gap-6">
        <VaultLtvPanel
          collateral={collateral}
          debt={debt}
          ltvRatio={ltvRatio}
          loading={loading}
        />

        <div className="flex flex-1 gap-6">
          <VaultDepositForm onDeposit={handleDeposit} disabled={isPending} />
          <VaultWithdrawForm
            onWithdraw={handleWithdraw}
            maxCollateral={collateral}
            loading={loading}
            disabled={isPending}
          />
        </div>
      </div>
    </div>
  )
}
