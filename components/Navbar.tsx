'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ConnectButton } from 'stellar-wallet-kit'
import { useWallet } from '@/lib/app-wallet'

export default function Navbar() {
  const { isConnected } = useWallet()
  const router = useRouter()
  const pathname = usePathname()
  const wasDisconnected = useRef(true)

  useEffect(() => {
    if (isConnected && wasDisconnected.current && pathname === '/') {
      router.push('/dashboard')
    }
    wasDisconnected.current = !isConnected
  }, [isConnected, pathname, router])

  return (
    <nav className="flex justify-around items-center">
      <h1 className="text-2xl font-semibold text-blue-800">Lumina</h1>

      <ul className="flex gap-10 items-center">
        <li>
          <a href="">Home</a>
        </li>
        <li>
          <a href="">About Lumina</a>
        </li>
        <li>
          <a href="">features</a>
        </li>
        <li>
          <a href="">Use Case</a>
        </li>
        <li>
          <a href="/merchant" target="_blank" rel="noopener noreferrer">Lumina Merchant</a>
        </li>
      </ul>

      <ConnectButton />
    </nav>
  )
}
