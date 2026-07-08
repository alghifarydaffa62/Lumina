'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useWallet } from 'stellar-wallet-kit'
import { Receipt, LogOut } from 'lucide-react'

export default function MerchantSidebar() {
  const pathname = usePathname()
  const { disconnect } = useWallet()
  const router = useRouter()

  const handleLogout = () => {
    disconnect()
    router.push('/merchant')
  }

  return (
    <aside className="flex w-64 flex-col rounded-3xl border border-white/10 bg-linear-to-br from-slate-950 via-purple-950 to-slate-950 p-5">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-sm font-bold text-white">
          L
        </div>
        <span className="text-lg font-semibold text-white">Merchant</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        <Link
          href="/merchant/dashboard"
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            pathname === '/merchant/dashboard'
              ? 'bg-white/15 text-white'
              : 'text-white/60 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Receipt size={18} />
          Dashboard
        </Link>
        <Link
          href="/merchant/dashboard/create-bill"
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            pathname === '/merchant/dashboard/create-bill'
              ? 'bg-white/15 text-white'
              : 'text-white/60 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Receipt size={18} />
          Create Bill
        </Link>
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-300 transition hover:bg-white/10 hover:text-red-200"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  )
}
