'use client'

import { ConnectButton } from 'stellar-wallet-kit'
import Link from 'next/link'

const LINKS = [
  { label: 'Docket', href: '#docket' },
  { label: 'Routing', href: '#routing' },
  { label: 'Terms', href: '#terms' },
]

export default function MerchantNavbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-hairline bg-obsidian/80 backdrop-blur-md">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
        <a href="/merchant" className="font-display text-lg tracking-tightest text-bone uppercase">
          Lumina <span className="text-titanium/60 text-sm align-top">Merchant</span>
        </a>

        <ul className="hidden md:flex items-center gap-10">
          {LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="font-mono text-[11px] tracking-widest2 uppercase text-titanium hover:text-bone transition-colors duration-300"
              >
                {link.label}
              </a>
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

        <div className="[&_button]:!font-mono [&_button]:!text-[11px] [&_button]:!tracking-widest2 [&_button]:!uppercase [&_button]:!rounded-none [&_button]:!border [&_button]:!border-hairline2 [&_button]:!bg-transparent [&_button]:!text-bone [&_button]:hover:!bg-bone [&_button]:hover:!text-obsidian [&_button]:!transition-colors [&_button]:!duration-300 [&_button]:!px-5 [&_button]:!py-2.5">
          <ConnectButton />
        </div>
      </div>
    </nav>
  )
}
