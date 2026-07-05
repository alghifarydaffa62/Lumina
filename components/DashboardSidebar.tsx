'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useWallet } from '@/hooks/useWallet'
import {
  LayoutDashboard,
  CreditCard,
  Vault,
  Zap,
  ArrowUpDown,
  LogOut,
} from 'lucide-react'

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Card', href: '/dashboard/my-card', icon: CreditCard },
  { label: 'Vault', href: '/dashboard/vault', icon: Vault },
  { label: 'Yield Engine', href: '/dashboard/yield-engine', icon: Zap },
  { label: 'Transactions', href: '/dashboard/transactions', icon: ArrowUpDown },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { disconnect } = useWallet()
  const router = useRouter()

  const handleLogout = () => {
    disconnect()
    router.push('/')
  }

  return (
    <aside className="flex w-64 flex-col rounded-3xl border border-white/10 bg-linear-to-b from-purple-600/20 to-purple-900/30 backdrop-blur-xl p-5">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-sm font-bold text-white">
          L
        </div>
        <span className="text-lg font-semibold text-white">Lumina</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
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
