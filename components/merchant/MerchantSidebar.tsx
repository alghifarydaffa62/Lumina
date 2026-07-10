'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useWallet } from '@/lib/app-wallet'
import { Receipt, LogOut, Menu } from 'lucide-react'

const menuItems = [
  { label: 'Dashboard', href: '/merchant/dashboard', icon: Receipt },
  { label: 'Create Bill', href: '/merchant/dashboard/create-bill', icon: Receipt },
]

export default function MerchantSidebar() {
  const pathname = usePathname()
  const { disconnect } = useWallet()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    disconnect()
    router.push('/merchant')
  }

  const close = () => setOpen(false)

  const menu = (
    <>
      {menuItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={close}
            className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
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

      <hr className="border-white/10" />

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-white/10 hover:text-red-200"
      >
        <LogOut size={18} />
        Logout
      </button>
    </>
  )

  return (
    <>
      {/* Mobile: fixed top bar + dropdown */}
      <div className="md:hidden">
        <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between rounded-b-2xl border-b border-white/10 bg-linear-to-r from-slate-950 via-purple-950 to-slate-950 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-sm font-bold text-white">
              L
            </div>
            <span className="text-lg font-semibold text-white">Merchant</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen((p) => !p)}
            className="rounded-xl bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <Menu size={20} />
          </button>
        </div>

        {open && (
          <div className="fixed inset-x-0 top-[60px] z-50 mx-2 rounded-2xl border border-white/10 bg-linear-to-b from-slate-950 via-purple-950 to-slate-950 p-3 shadow-2xl">
            <nav className="flex flex-col gap-1">{menu}</nav>
          </div>
        )}

        {open && (
          <div className="fixed inset-0 z-40 bg-black/20" onClick={close} />
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col rounded-3xl border border-white/10 bg-linear-to-br from-slate-950 via-purple-950 to-slate-950 p-5 md:flex">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-sm font-bold text-white">
            L
          </div>
          <span className="text-lg font-semibold text-white">Merchant</span>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
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
    </>
  )
}
