'use client'

import { useState } from 'react'
import { ConnectButton } from 'stellar-wallet-kit'
import Link from 'next/link'

const LINKS = [
  { label: 'Docket', href: '#docket' },
  { label: 'Routing', href: '#routing' },
  { label: 'Terms', href: '#terms' },
]

export default function MerchantNavbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleNav = () => setMenuOpen(false)

  return (
    <nav className="fixed top-0 inset-x-0 z-50">
      <div className="absolute inset-0 -z-10 border-b border-hairline bg-obsidian/80 backdrop-blur-md" />

      <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
        <a href="/merchant" className="font-display text-lg tracking-tightest text-bone uppercase">
          Lumina <span className="text-titanium/60 text-sm align-top">Merchant</span>
        </a>

        <ul className="hidden md:flex items-center gap-10">
          {LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="font-mono text-[11px] tracking-widest2 uppercase text-titanium hover:text-bone transition-colors duration-300"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="rule-l border-hairline2 pl-10">
            <Link
              href="/"
              className="font-mono text-[11px] tracking-widest2 uppercase text-brass hover:text-brass-bright transition-colors duration-300"
            >
              ← For Cardholders
            </Link>
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
            <Link
              key={link.label}
              href={link.href}
              onClick={handleNav}
              className="font-mono text-[11px] tracking-widest2 uppercase text-titanium hover:text-bone transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/"
            onClick={handleNav}
            className="font-mono text-[11px] tracking-widest2 uppercase text-brass hover:text-brass-bright transition-colors duration-300"
          >
            ← For Cardholders
          </Link>
          <div className="sm:hidden [&_button]:!w-full [&_button]:!font-mono [&_button]:!text-[11px] [&_button]:!tracking-widest2 [&_button]:!uppercase [&_button]:!rounded-none [&_button]:!border [&_button]:!border-hairline2 [&_button]:!bg-transparent [&_button]:!text-bone [&_button]:hover:!bg-bone [&_button]:hover:!text-obsidian [&_button]:!transition-colors [&_button]:!duration-300 [&_button]:!px-5 [&_button]:!py-2.5">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
