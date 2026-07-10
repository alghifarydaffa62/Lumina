'use client'

import { useEffect, useRef, useState } from 'react'
import { QrCode, X } from 'lucide-react'

interface Props {
  value: string
  open: boolean
  onClose: () => void
}

export default function QRCodeModal({ value, open, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!open || !canvasRef.current || !value) return
    setError(false)
    import('qrcode').then((qr) => {
      qr.toCanvas(canvasRef.current, value, {
        width: 220,
        margin: 2,
        color: { dark: '#ecece7', light: '#0a0a0a' },
      }).catch(() => setError(true))
    })
  }, [value, open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="flex flex-col items-center gap-5 border border-hairline bg-obsidian-raised p-8">
        <button
          type="button"
          onClick={onClose}
          className="self-end text-titanium transition duration-300 hover:text-bone"
        >
          <X size={20} />
        </button>

        <div className="border border-hairline2 bg-obsidian-panel p-3">
          <QrCode className="h-6 w-6 text-brass" />
        </div>

        <h3 className="font-display text-lg tracking-tightest uppercase text-bone">Your Wallet Address</h3>

        {error ? (
          <p className="text-sm text-brass-dim">Failed to generate QR code</p>
        ) : (
          <canvas ref={canvasRef} width={220} height={220} />
        )}

        <p className="max-w-55 break-all text-center font-mono text-[11px] tracking-widest2 text-bone-faint">
          {value.slice(0, 16)}...{value.slice(-8)}
        </p>
      </div>
    </div>
  )
}
