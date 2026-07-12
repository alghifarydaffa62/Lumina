'use client'

import { Clock } from 'lucide-react'

export default function CardHistory() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-purple-200 bg-white text-purple-300">
      <div className="flex flex-col items-center gap-2">
        <Clock className="h-8 w-8" />
        <p className="text-sm">Transaction history coming soon</p>
      </div>
    </div>
  )
}
