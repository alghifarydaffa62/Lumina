'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useWallet } from '@/lib/app-wallet'
import { useFirebaseAuthContext } from '@/lib/firebase-auth-context'
import {
  LayoutDashboard,
  CreditCard,
  Vault,
  ArrowUpDown,
  QrCode,
  LogOut,
  Menu,
} from 'lucide-react'
import QRCodeModal from '@/components/QRCodeModal'

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Vault', href: '/dashboard/vault', icon: Vault },
  { label: 'My Card', href: '/dashboard/my-card', icon: CreditCard },
  { label: 'Transactions', href: '/dashboard/transactions', icon: ArrowUpDown },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { account, disconnect } = useWallet()
  const { signOut } = useFirebaseAuthContext()
  const router = useRouter()
  const [showQR, setShowQR] = useState(false)
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await disconnect()
    await signOut()
    router.push('/')
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
                ? 'bg-brass/15 text-brass-bright'
                : 'text-titanium hover:bg-white/5 hover:text-bone'
            }`}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        )
      })}

      {account?.address && (
        <button
          type="button"
          onClick={() => { setShowQR(true); close() }}
          className="flex items-center gap-3 px-4 py-2.5 font-mono text-[11px] tracking-widest2 uppercase text-titanium transition duration-300 hover:bg-white/5 hover:text-bone"
        >
          <QrCode size={18} />
          QR Address
        </button>
      )}

      <hr className="border-white/10" />

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2.5 font-mono text-[11px] tracking-widest2 uppercase text-oxblood-bright transition duration-300 hover:bg-oxblood-bright/10"
      >
        <LogOut size={18} />
        Logout
      </button>
    </>
  )

  return (
    <>
      <QRCodeModal value={account?.address ?? ''} open={showQR} onClose={() => setShowQR(false)} />

      {/* Mobile: fixed top bar + dropdown */}
      <div className="md:hidden">
        <div className="fixed inset-x-0 top-0 z-50">
          {/* blur/gradient on its own layer, never an ancestor of fixed-
              position modal content (QR modal, dropdown). */}
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

          {account?.address && (
            <button
              type="button"
              onClick={() => setShowQR(true)}
              className="flex items-center gap-3 px-3 py-2.5 font-mono text-[11px] tracking-widest2 uppercase text-titanium transition duration-300 hover:bg-white/5 hover:text-bone"
            >
              <QrCode size={16} />
              QR Address
            </button>
          )}
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