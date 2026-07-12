'use client'

import { motion } from 'framer-motion'
import { HEAVY } from './kinetic-text'

export function CardFace() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: -1.5 }}
      whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
      viewport={{ once: true, margin: '-15%' }}
      transition={{ duration: 1.1, ease: HEAVY }}
      whileHover={{ rotate: 0, y: -6 }}
      className="relative w-full max-w-sm sm:max-w-md aspect-[1.586/1] border border-hairline2 bg-obsidian-panel p-4 sm:p-7 flex flex-col justify-between mx-auto md:mx-0"
      style={{ transformOrigin: 'bottom left' }}
    >
      <div className="flex justify-between items-start">
        <span className="font-display text-xs sm:text-sm tracking-tightest text-bone uppercase">Lumina</span>
        <span className="font-mono text-[8px] sm:text-[9px] tracking-widest2 text-titanium uppercase">Soroban / XLM</span>
      </div>

      <div className="font-mono text-sm sm:text-xl tracking-[0.15em] sm:tracking-[0.2em] text-bone-dim break-all">
        4417 &nbsp; 08•• &nbsp; •••• &nbsp; 0000
      </div>

      <div className="flex justify-between items-end">
        <div>
          <p className="font-mono text-[8px] sm:text-[9px] tracking-widest2 text-titanium uppercase">Collateral</p>
          <p className="font-mono text-xs sm:text-sm text-bone">USDC-Backed</p>
        </div>
        <span className="font-mono text-[8px] sm:text-[9px] tracking-widest2 text-brass uppercase">No Statement</span>
      </div>
    </motion.div>
  )
}
