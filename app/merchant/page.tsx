'use client'

import { useEffect, useState, startTransition } from 'react'
import { useWallet } from '@/lib/app-wallet'
import { useRouter } from 'next/navigation'
import { useMerchantStore } from '@/hooks/useMerchant'
import MerchantNavbar from '@/components/merchant/MerchantNavbar'
import MerchantHero from '@/components/merchant/MerchantHero'
import MerchantRegister from '@/components/merchant/MerchantRegister'
import { SystemState } from '@/components/merchant/SystemState'

export default function MerchantPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => { startTransition(() => setMounted(true)) }, [])

  if (!mounted) {
    return <SystemState label="Loading" />
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
    <main className="relative bg-obsidian text-bone">
      <MerchantNavbar />
      {!isConnected && !isConnecting && <MerchantHero />}
      {(isConnecting || checking) && <SystemState label="Checking your store" />}
      {!checking && !registered && !isConnecting && isConnected && (
        <MerchantRegister onRegister={register} />
      )}
      {!checking && registered && <SystemState label="Redirecting to dashboard" />}
    </main>
  )
}
