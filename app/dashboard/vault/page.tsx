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
        <p className="text-sm text-ink-faint">Connect your wallet to continue</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-xl tracking-tightest text-ink uppercase md:text-2xl">Vault</h1>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="self-start border border-line2 bg-panel px-4 py-2 font-mono text-[11px] tracking-widest2 uppercase text-ink transition duration-300 hover:bg-ink hover:text-panel disabled:opacity-50 sm:self-auto"
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

      <div className="flex flex-1 flex-col items-start gap-6 md:flex-row">
        <VaultLtvPanel
          collateral={collateral}
          debt={debt}
          ltvRatio={ltvRatio}
          loading={loading}
        />

        <div className="flex flex-1 flex-col gap-4 md:flex-row md:gap-6">
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
