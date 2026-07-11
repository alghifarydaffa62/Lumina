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
            className={`flex items-center gap-3 px-4 py-2.5 font-mono text-[11px] tracking-widest2 uppercase transition duration-300 ${
              isActive
                ? 'bg-brass/10 text-brass-bright'
                : 'text-titanium hover:bg-bone/5 hover:text-bone'
            }`}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        )
      })}

      <hr className="border-hairline" />

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2.5 font-mono text-[11px] tracking-widest2 uppercase text-brass-dim transition duration-300 hover:bg-brass/5 hover:text-brass"
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
        <div className="fixed inset-x-0 top-0 z-50">
          <div className="chrome-gradient absolute inset-0 -z-10 border-b border-brass/20 backdrop-blur-md" />
          <div className="relative flex items-center justify-between px-4 py-3">
            <span className="font-display text-lg tracking-tightest text-bone uppercase">
              Lumina<span className="text-brass">.</span>
            </span>
            <button
              type="button"
              onClick={() => setOpen((p) => !p)}
              className="border border-white/15 p-2 text-titanium transition duration-300 hover:bg-white/5 hover:text-bone"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {open && (
          <div className="chrome-gradient fixed inset-x-0 top-14 z-50 mx-2 border border-brass/20 p-3 shadow-lg">
            <nav className="flex flex-col gap-1">{menu}</nav>
          </div>
        )}

        {open && (
          <div className="fixed inset-0 z-40 bg-obsidian/50" onClick={close} />
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="chrome-gradient hidden w-64 shrink-0 flex-col border border-brass/20 p-6 shadow-lg md:flex">
        <span className="font-display text-lg tracking-tightest text-bone uppercase">
          Lumina<span className="text-brass">.</span>
        </span>

        <nav className="mt-10 flex flex-1 flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 font-mono text-[11px] tracking-widest2 uppercase transition duration-300 ${
                  isActive
                    ? 'bg-brass/15 text-brass-bright'
                    : 'text-titanium hover:bg-white/5 hover:text-bone'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 flex items-center gap-3 px-3 py-2.5 font-mono text-[11px] tracking-widest2 uppercase text-oxblood-bright transition duration-300 hover:bg-oxblood-bright/10"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>
    </>
  )
}
