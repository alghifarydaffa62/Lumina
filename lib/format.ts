const STELLAR_DECIMALS = 7

export function formatAmount(raw: number | bigint, decimals = STELLAR_DECIMALS): string {
  const num = Number(raw) / 10 ** decimals
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  })
}

export function formatUSD(raw: number | bigint): string {
  return `$${formatAmount(raw)}`
}
