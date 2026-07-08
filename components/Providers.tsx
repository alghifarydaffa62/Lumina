'use client'

import { WalletProvider, NetworkType } from 'stellar-wallet-kit'
import type { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WalletProvider
      config={{
        network: NetworkType.TESTNET,
        autoConnect: true,
        theme: {
          mode: 'dark',
          primaryColor: '#7c3aed',
          borderRadius: '16px',
        },
      }}
    >
      {children}
    </WalletProvider>
  )
}
