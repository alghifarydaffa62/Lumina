'use client'

import Link from 'next/link'

export default function MerchantNavbar() {

  return (
    <nav className="flex items-center justify-around border-b border-slate-200 bg-white px-8 py-4">
      <Link href="/merchant" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-sm font-bold text-white">
          L
        </div>
        <span className="text-lg font-semibold text-slate-800">Lumina Merchant</span>
      </Link>

      <ul className="flex items-center gap-8">
        <li>
          <Link href="/merchant" className="text-sm font-medium text-slate-600 hover:text-purple-700">
            Home
          </Link>
        </li>
        <li>
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-purple-700">
            Main Site
          </Link>
        </li>
        <li>
          <Link href="#" className="text-sm font-medium text-slate-600 hover:text-purple-700">
            Know More
          </Link>
        </li>
        <li>
          <Link href="#" className="text-sm font-medium text-slate-600 hover:text-purple-700">
            Use Case
          </Link>
        </li>
      </ul>
    </nav>
  )
}
