'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
// 1. Import fungsi resmi dari Freighter API
import { isAllowed, setAllowed, getAddress } from '@stellar/freighter-api'

interface WalletState {
  publicKey: string | null
  isConnected: boolean
  isConnecting: boolean
}

interface WalletContextType {
  wallet: WalletState
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    publicKey: null,
    isConnected: false,
    isConnecting: false,
  })

  const connect = useCallback(async () => {
    setWallet((prev) => ({ ...prev, isConnecting: true }))

    try {
      const { isAllowed: granted } = await isAllowed()

      if (!granted) {
        await setAllowed()
      }

      const { address } = await getAddress()

      if (!address) {
         throw new Error('Freighter detected, but failed to get public key.')
      }

      setWallet({
        publicKey: address,
        isConnected: true,
        isConnecting: false,
      })
    } catch (err) {
      setWallet((prev) => ({ ...prev, isConnecting: false }))
      console.error(err)
      throw new Error('Failed to connect Freighter. Make sure the extension is installed and unlocked.')
    }
  }, [])

  const disconnect = useCallback(() => {
    setWallet({
      publicKey: null,
      isConnected: false,
      isConnecting: false,
    })
  }, [])

  return (
    <WalletContext.Provider value={{ wallet, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWalletContext() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWalletContext must be used within a WalletProvider')
  return ctx
}