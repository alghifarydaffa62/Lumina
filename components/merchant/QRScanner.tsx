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
    <div className="border border-line bg-panel p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="border border-line2 bg-panel p-2.5">
          <ScanLine className="h-5 w-5 text-brass-dim" />
        </div>
        <div>
          <h3 className="font-display text-lg tracking-tightest uppercase text-ink">Scan Wallet QR</h3>
          <p className="font-mono text-[10px] tracking-widest2 uppercase text-ink-faint">Point camera at the user&apos;s QR code</p>
        </div>
      </div>

      <div
        id={elId}
        className={`overflow-hidden border border-line bg-panel-soft transition-all ${
          scanning ? 'h-auto min-h-55' : 'h-0 min-h-0'
        }`}
      />

      {!scanning && !error && (
        <button
          type="button"
          onClick={onStart}
          className="mt-4 flex w-full items-center justify-center gap-2 border border-brass bg-brass py-3 font-mono text-[11px] tracking-widest2 uppercase font-semibold text-obsidian transition duration-300 hover:bg-obsidian hover:text-brass"
        >
          <Camera size={18} />
          Open Scanner
        </button>
      )}

      {error && (
        <div className="flex flex-col gap-3">
          <div className="border border-line bg-panel p-3 font-mono text-[11px] tracking-widest2 uppercase text-ink-dim shadow-sm">
            <CameraOff size={16} className="mb-1 inline" /> {error}
          </div>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center gap-2 border border-line2 bg-panel py-2.5 font-mono text-[11px] tracking-widest2 uppercase text-ink-faint transition duration-300 hover:bg-ink hover:text-panel"
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
          className="mt-3 flex w-full items-center justify-center gap-2 border border-brass-dim bg-brass-dim py-2.5 font-mono text-[11px] tracking-widest2 uppercase font-semibold text-white transition duration-300 hover:bg-white hover:text-brass-dim"
        >
          <CameraOff size={16} />
          Cancel Scanning
        </button>
      )}
    </div>
  )
}
