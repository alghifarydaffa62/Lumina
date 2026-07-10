'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useWallet } from '@/lib/app-wallet'
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
  const router = useRouter()
  const [showQR, setShowQR] = useState(false)
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    disconnect()
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
                ? 'bg-brass/10 text-brass'
                : 'text-titanium hover:bg-bone/5 hover:text-bone'
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
          className="flex items-center gap-3 px-4 py-2.5 font-mono text-[11px] tracking-widest2 uppercase text-titanium transition duration-300 hover:bg-bone/5 hover:text-bone"
        >
          <QrCode size={18} />
          QR Address
        </button>
      )}

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
      <QRCodeModal value={account?.address ?? ''} open={showQR} onClose={() => setShowQR(false)} />

      {/* Mobile: fixed top bar + dropdown */}
      <div className="md:hidden">
        <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-hairline bg-obsidian/80 backdrop-blur-md px-4 py-3">
          <span className="font-display text-lg tracking-tightest text-bone uppercase">
            Lumina<span className="text-brass">.</span>
          </span>
          <button
            type="button"
            onClick={() => setOpen((p) => !p)}
            className="border border-hairline2 p-2 text-titanium transition duration-300 hover:bg-bone/5 hover:text-bone"
          >
            <Menu size={18} />
          </button>
        </div>

        {open && (
          <div className="fixed inset-x-0 top-[56px] z-50 mx-2 border border-hairline bg-obsidian-raised/95 backdrop-blur-md p-3">
            <nav className="flex flex-col gap-1">{menu}</nav>
          </div>
        )}

        {open && (
          <div className="fixed inset-0 z-40 bg-obsidian/60" onClick={close} />
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border border-hairline bg-obsidian-raised/80 backdrop-blur-md p-6 md:flex">
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
                    ? 'bg-brass/10 text-brass'
                    : 'text-titanium hover:bg-bone/5 hover:text-bone'
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
              className="flex items-center gap-3 px-3 py-2.5 font-mono text-[11px] tracking-widest2 uppercase text-titanium transition duration-300 hover:bg-bone/5 hover:text-bone"
            >
              <QrCode size={16} />
              QR Address
            </button>
          )}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 flex items-center gap-3 px-3 py-2.5 font-mono text-[11px] tracking-widest2 uppercase text-brass-dim transition duration-300 hover:bg-brass/5 hover:text-brass"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>
    </>
  )
}
