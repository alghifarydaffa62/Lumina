'use client'

import { Camera, CameraOff, ScanLine, RotateCcw } from 'lucide-react'

interface Props {
  elId: string
  scanning: boolean
  error: string | null
  onStart: () => void
  onStop: () => void
  onReset: () => void
}

export default function QRScanner({ elId, scanning, error, onStart, onStop, onReset }: Props) {
  return (
    <div className="rounded-2xl border border-purple-200 bg-white p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-purple-100 p-2.5">
          <ScanLine className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Scan Wallet QR</h3>
          <p className="text-xs text-slate-400">Point camera at the user&apos;s QR code</p>
        </div>
      </div>

      <div
        id={elId}
        className={`overflow-hidden rounded-xl bg-slate-100 transition-all ${
          scanning ? 'h-auto min-h-55' : 'h-0 min-h-0'
        }`}
      />

      {!scanning && !error && (
        <button
          type="button"
          onClick={onStart}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
        >
          <Camera size={18} />
          Open Scanner
        </button>
      )}

      {error && (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            <CameraOff size={16} className="mb-1 inline" /> {error}
          </div>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RotateCcw size={16} />
            Try Again
          </button>
        </div>
      )}

      {scanning && (
        <button
          type="button"
          onClick={onStop}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <CameraOff size={16} />
          Cancel Scanning
        </button>
      )}
    </div>
  )
}
