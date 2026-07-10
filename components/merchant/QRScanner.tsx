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
    <div className="border border-hairline bg-obsidian-panel p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="border border-hairline2 bg-obsidian p-2.5">
          <ScanLine className="h-5 w-5 text-brass" />
        </div>
        <div>
          <h3 className="font-display text-lg tracking-tightest uppercase text-bone">Scan Wallet QR</h3>
          <p className="font-mono text-[10px] tracking-widest2 uppercase text-titanium">Point camera at the user&apos;s QR code</p>
        </div>
      </div>

      <div
        id={elId}
        className={`overflow-hidden border border-hairline bg-obsidian transition-all ${
          scanning ? 'h-auto min-h-55' : 'h-0 min-h-0'
        }`}
      />

      {!scanning && !error && (
        <button
          type="button"
          onClick={onStart}
          className="mt-4 flex w-full items-center justify-center gap-2 border border-brass bg-transparent py-3 font-mono text-[11px] tracking-widest2 uppercase text-brass transition duration-300 hover:bg-brass hover:text-obsidian"
        >
          <Camera size={18} />
          Open Scanner
        </button>
      )}

      {error && (
        <div className="flex flex-col gap-3">
          <div className="border border-brass/30 bg-brass/5 p-3 font-mono text-[11px] tracking-widest2 uppercase text-brass">
            <CameraOff size={16} className="mb-1 inline" /> {error}
          </div>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center gap-2 border border-hairline2 bg-transparent py-2.5 font-mono text-[11px] tracking-widest2 uppercase text-titanium transition duration-300 hover:bg-bone/5 hover:text-bone"
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
          className="mt-3 flex w-full items-center justify-center gap-2 border border-brass-dim py-2.5 font-mono text-[11px] tracking-widest2 uppercase text-brass-dim transition duration-300 hover:bg-brass/5 hover:text-brass"
        >
          <CameraOff size={16} />
          Cancel Scanning
        </button>
      )}
    </div>
  )
}
