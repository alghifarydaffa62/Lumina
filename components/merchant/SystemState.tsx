'use client'

import { motion } from 'framer-motion'

type SystemStateProps = {
  label: string
}

export function SystemState({ label }: SystemStateProps) {
  return (
    <div className="flex flex-1 min-h-svh items-center justify-center bg-obsidian px-6">
      <div className="flex items-center gap-3 font-mono text-xs tracking-widest2 uppercase text-titanium">
        <motion.span
          animate={{ opacity: [1, 1, 0.2, 0.2] }}
          transition={{ duration: 1.1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
          className="inline-block w-1.5 h-1.5 bg-brass"
        />
        {label}
      </div>
    </div>
  )
}