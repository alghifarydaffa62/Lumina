const STROOP_DECIMALS = 7

export function toStroops(input: string): bigint {
  if (!/^\d+(\.\d{1,7})?$/.test(input)) {
    throw new Error(`Invalid amount: ${input}`)
  }
  const parts = input.split('.')
  const whole = parts[0] || '0'
  const fraction = (parts[1] || '').padEnd(STROOP_DECIMALS, '0').slice(0, STROOP_DECIMALS)
  return BigInt(whole) * BigInt(10 ** STROOP_DECIMALS) + BigInt(fraction)
}
