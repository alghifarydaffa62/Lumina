'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ConnectButton } from 'stellar-wallet-kit'
import { useWallet } from '@/lib/app-wallet'
import Link from 'next/link'

const LINKS = [
  { label: 'Index', href: '#index' },
  { label: 'The Mechanism', href: '#mechanism' },
  { label: 'Provisions', href: '#provisions' },
  { label: 'Use', href: '#use' },
]

export default function Navbar() {
  const { isConnected } = useWallet()
  const router = useRouter()
  const pathname = usePathname()
  const wasDisconnected = useRef(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (isConnected && wasDisconnected.current && pathname === '/') {
      router.push('/dashboard')
    }
    wasDisconnected.current = !isConnected
  }, [isConnected, pathname, router])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const handleNav = (href: string) => {
    setMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 inset-x-0 z-50">
      <div className="absolute inset-0 -z-10 border-b border-hairline bg-obsidian/80 backdrop-blur-md" />

      <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
        <Link href="/" className="font-display text-lg tracking-tightest text-bone uppercase">
          Lumina
          <span className="text-brass">.</span>
        </Link>

        <ul className="hidden md:flex items-center gap-10">
          {LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={() => handleNav(link.href)}
                className="font-mono text-[11px] tracking-widest2 uppercase text-titanium hover:text-bone transition-colors duration-300"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="rule-l border-hairline2 pl-10">
            <a
              href="/merchant"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] tracking-widest2 uppercase text-brass hover:text-brass-bright transition-colors duration-300"
            >
              For Merchants →
            </a>
          </li>
        </ul>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block [&_button]:!font-mono [&_button]:!text-[11px] [&_button]:!tracking-widest2 [&_button]:!uppercase [&_button]:!rounded-none [&_button]:!border [&_button]:!border-hairline2 [&_button]:!bg-transparent [&_button]:!text-bone [&_button]:hover:!bg-bone [&_button]:hover:!text-obsidian [&_button]:!transition-colors [&_button]:!duration-300 [&_button]:!px-5 [&_button]:!py-2.5">
            <ConnectButton />
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <span
              className={`block h-px w-5 bg-bone transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}
            />
            <span
              className={`block h-px w-5 bg-bone transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}
            />
            <span
              className={`block h-px w-5 bg-bone transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}
            />
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-80 border-b border-hairline' : 'max-h-0'}`}
      >
        <div className="bg-obsidian/95 backdrop-blur-md px-6 py-6 flex flex-col gap-5">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => handleNav(link.href)}
              className="font-mono text-[11px] tracking-widest2 uppercase text-titanium hover:text-bone transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/merchant"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="font-mono text-[11px] tracking-widest2 uppercase text-brass hover:text-brass-bright transition-colors duration-300"
          >
            For Merchants →
          </a>
          <div className="sm:hidden [&_button]:!w-full [&_button]:!font-mono [&_button]:!text-[11px] [&_button]:!tracking-widest2 [&_button]:!uppercase [&_button]:!rounded-none [&_button]:!border [&_button]:!border-hairline2 [&_button]:!bg-transparent [&_button]:!text-bone [&_button]:hover:!bg-bone [&_button]:hover:!text-obsidian [&_button]:!transition-colors [&_button]:!duration-300 [&_button]:!px-5 [&_button]:!py-2.5">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
