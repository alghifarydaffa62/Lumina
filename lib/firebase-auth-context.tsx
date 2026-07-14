'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'

interface FirebaseAuthContextValue {
  isAuthenticated: boolean
  uid: string | null
  authLoading: boolean
  authError: string | null
  authSettled: boolean
  authenticate: () => Promise<void>
  signOut: () => Promise<void>
}

const FirebaseAuthContext = createContext<FirebaseAuthContextValue>({
  isAuthenticated: false,
  uid: null,
  authLoading: false,
  authError: null,
  authSettled: false,
  authenticate: async () => {},
  signOut: async () => {},
})

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, uid, authLoading, authError, authSettled, authenticate, signOut } = useFirebaseAuth()
  return (
    <FirebaseAuthContext.Provider value={{ isAuthenticated, uid, authLoading, authError, authSettled, authenticate, signOut }}>
      {children}
    </FirebaseAuthContext.Provider>
  )
}

export function useFirebaseAuthContext() {
  return useContext(FirebaseAuthContext)
}
