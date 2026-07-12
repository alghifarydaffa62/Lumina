'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'

interface FirebaseAuthContextValue {
  isAuthenticated: boolean
  uid: string | null
  authLoading: boolean
  authError: string | null
  signOut: () => Promise<void>
}

const FirebaseAuthContext = createContext<FirebaseAuthContextValue>({
  isAuthenticated: false,
  uid: null,
  authLoading: false,
  authError: null,
  signOut: async () => {},
})

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuth()
  return (
    <FirebaseAuthContext.Provider value={auth}>
      {children}
    </FirebaseAuthContext.Provider>
  )
}

export function useFirebaseAuthContext() {
  return useContext(FirebaseAuthContext)
}
