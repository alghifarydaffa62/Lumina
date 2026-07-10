'use client'

import { createContext, useContext, useState} from 'react'
import { useWallet as useSwallet } from 'stellar-wallet-kit'

interface SimState {
  enabled: boolean
  setEnabled: (v: boolean) => void
}

const SimContext = createContext<SimState>({ enabled: false, setEnabled: () => {} })

export function SimulatorProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false)

  return (
    <SimContext.Provider value={{ enabled, setEnabled }}>
      {children}
      {process.env.NODE_ENV === 'development' && <SimulatorFab enabled={enabled} onToggle={() => setEnabled((p) => !p)} />}
    </SimContext.Provider>
  )
}

function SimulatorFab({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="fixed bottom-4 right-4 z-[9999] rounded-full px-4 py-2 text-xs font-bold shadow-2xl transition"
      style={{
        backgroundColor: enabled ? '#059669' : '#6b7280',
        color: '#fff',
      }}
    >
      SIM: {enabled ? 'ON' : 'OFF'}
    </button>
  )
}

const SIM_ADDRESS = 'GAXSIMULATORWALLETTESTADDRESS123456789'

export function useWallet() {
  const real = useSwallet()
  const { enabled } = useContext(SimContext)

  if (enabled) {
    return {
      ...real,
      isConnected: true,
      isConnecting: false,
      account: { address: SIM_ADDRESS, publicKey: SIM_ADDRESS },
    }
  }

  return real
}
