'use client'

import { useEffect } from 'react'
import { WalletProvider, NetworkType } from 'stellar-wallet-kit'
import type { ReactNode } from 'react'
import { FirebaseAuthProvider } from '@/lib/firebase-auth-context'

const SKIP_PATTERNS = [
  'Failed to connect to Freighter',
  'Error connecting to Freighter',
  'Error getting public key',
]

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const orig = console.error
    const filtered = (...args: unknown[]) => {
      const joined = args.map((a) => (typeof a === 'string' ? a : String(a))).join(' ')
      if (SKIP_PATTERNS.some((p) => joined.includes(p))) return
      orig.call(console, ...args)
    }
    console.error = filtered
    return () => { console.error = orig }
  }, [])

  return (
    <WalletProvider
      config={{
        network: NetworkType.TESTNET,
        autoConnect: true,
        theme: {
          mode: 'dark',
          primaryColor: '#B08D3E',
          borderRadius: '0px',
        },
      }}
    >
      <FirebaseAuthProvider>
        {children}
      </FirebaseAuthProvider>
    </WalletProvider>
  )
}
