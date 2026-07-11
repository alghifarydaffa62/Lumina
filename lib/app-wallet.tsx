'use client'

import { useWallet as useSwallet } from 'stellar-wallet-kit'

export function useWallet() {
  return useSwallet()
}
