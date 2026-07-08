'use client'

import { useEffect, useState, startTransition } from 'react'
import { useWallet } from 'stellar-wallet-kit'
import { useRouter } from 'next/navigation'
import { useMerchantStore } from '@/hooks/useMerchant'
import MerchantNavbar from '@/components/merchant/MerchantNavbar'
import MerchantHero from '@/components/merchant/MerchantHero'
import MerchantRegister from '@/components/merchant/MerchantRegister'

export default function MerchantPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => { startTransition(() => setMounted(true)) }, [])

  if (!mounted) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  return <MerchantPageInner />
}

function MerchantPageInner() {
  const { isConnected, isConnecting, account } = useWallet()
  const router = useRouter()
  const { checking, registered, register } = useMerchantStore(account?.address)

  useEffect(() => {
    if (isConnected && !checking && registered) {
      router.push('/merchant/dashboard')
    }
  }, [isConnected, checking, registered, router])

  return (
    <>
      <MerchantNavbar />
      {!isConnected && !isConnecting && <MerchantHero />}
      {(isConnecting || checking) && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-slate-500">Checking your store...</p>
        </div>
      )}
      {!checking && !registered && !isConnecting && isConnected && (
        <MerchantRegister onRegister={register} />
      )}
      {!checking && registered && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-slate-500">Redirecting to dashboard...</p>
        </div>
      )}
    </>
  )
}
