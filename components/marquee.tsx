'use client'

import { motion } from 'framer-motion'

export function Marquee({ items }: { items: string[] }) {
  const loop = [...items, ...items]
  return (
    <div className="rule-t rule-b border-hairline overflow-hidden py-4 bg-obsidian-panel">
      <motion.div
        className="flex gap-10 whitespace-nowrap font-mono text-xs tracking-widest2 uppercase text-titanium"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 34, ease: 'linear', repeat: Infinity }}
      >
        {loop.map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            {item}
            <span className="text-brass/60">/</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}
