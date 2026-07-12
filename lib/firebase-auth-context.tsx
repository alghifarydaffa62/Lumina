'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'

interface FirebaseAuthContextValue {
  isAuthenticated: boolean
  uid: string | null
  authLoading: boolean
  authError: string | null
  authSettled: boolean
  signOut: () => Promise<void>
}

const FirebaseAuthContext = createContext<FirebaseAuthContextValue>({
  isAuthenticated: false,
  uid: null,
  authLoading: false,
  authError: null,
  authSettled: false,
  signOut: async () => {},
})

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, uid, authLoading, authError, authSettled, signOut } = useFirebaseAuth()
  return (
    <FirebaseAuthContext.Provider value={{ isAuthenticated, uid, authLoading, authError, authSettled, signOut }}>
      {children}
    </FirebaseAuthContext.Provider>
  )
}

export function useFirebaseAuthContext() {
  return useContext(FirebaseAuthContext)
}
