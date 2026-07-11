const STELLAR_DECIMALS = 7

export function formatAmount(raw: number | bigint, decimals = STELLAR_DECIMALS): string {
  const big = BigInt(raw)
  const divisor = BigInt(10) ** BigInt(decimals)
  const whole = big / divisor
  const fraction = big % divisor
  const fracStr = fraction.toString().padStart(decimals, '0').slice(0, 2)
  const wholeStr = whole.toLocaleString('en-US')
  return `${wholeStr}.${fracStr.padEnd(2, '0')}`
}

export function formatUSD(raw: number | bigint): string {
  return `$${formatAmount(raw)}`
}
