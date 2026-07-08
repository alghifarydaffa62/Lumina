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
        color: { dark: '#1e1b4b', light: '#ffffff' },
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-purple-200 bg-white p-8 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="self-end text-slate-400 transition hover:text-slate-600"
        >
          <X size={20} />
        </button>

        <div className="rounded-xl bg-purple-100 p-3">
          <QrCode className="h-6 w-6 text-purple-600" />
        </div>

        <h3 className="text-lg font-semibold text-slate-800">Your Wallet Address</h3>

        {error ? (
          <p className="text-sm text-red-500">Failed to generate QR code</p>
        ) : (
          <canvas ref={canvasRef} width={220} height={220} className="rounded-xl" />
        )}

        <p className="max-w-[220px] break-all text-center font-mono text-xs text-slate-500">
          {value.slice(0, 16)}...{value.slice(-8)}
        </p>
      </div>
    </div>
  )
}
