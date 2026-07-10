'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { HEAVY } from './kinetic-text'

const STAGES = [
  { label: 'COLLATERAL LOCKED', value: 40000, tag: 'XLM-USDC' },
  { label: 'DEBT GENERATED', value: 12480.32, tag: 'ON SPEND' },
  { label: 'YIELD ROUTED', value: 12480.32, tag: 'KEEPER BOT' },
  { label: 'DEBT DISSOLVED', value: 0, tag: 'SETTLED' },
]

/**
 * The one signature moment on the cardholder page: the debt lifecycle,
 * rendered as a live private-ledger readout rather than an illustration.
 * This is the mechanic made visible — deposit, spend, silent repayment.
 */
export function DebtLedger() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-20% 0px -20% 0px' })
  const [stage, setStage] = useState(0)
  const [display, setDisplay] = useState(STAGES[0].value)

  useEffect(() => {
    if (!inView) return
    const advance = (i: number) => {
      if (i >= STAGES.length) return
      setStage(i)
      const start = display
      const end = STAGES[i].value
      const duration = 900
      const startTime = performance.now()
      const frame = (t: number) => {
        const p = Math.min((t - startTime) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setDisplay(start + (end - start) * eased)
        if (p < 1) requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
      if (i < STAGES.length - 1) {
        setTimeout(() => advance(i + 1), duration + 900)
      }
    }
    const t = setTimeout(() => advance(0), 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  const current = STAGES[stage]
  const dissolved = stage === STAGES.length - 1

  return (
    <div ref={ref} className="border border-hairline2 bg-obsidian-panel/60 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-3 rule-b border-hairline">
        <span className="font-mono text-micro text-titanium tracking-widest2 uppercase">Live Ledger — Position #0417</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={current.tag}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="font-mono text-micro text-brass tracking-widest2 uppercase"
          >
            {current.tag}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="px-6 md:px-10 py-14 md:py-20">
        <AnimatePresence mode="wait">
          <motion.p
            key={current.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: HEAVY }}
            className="font-mono text-micro text-titanium tracking-widest2 uppercase mb-4"
          >
            {current.label}
          </motion.p>
        </AnimatePresence>

        <div className="font-display text-[13vw] leading-[0.9] md:text-[6.5vw] tracking-tightest tabular-nums">
          <span className={dissolved ? 'text-titanium/40 line-through decoration-brass/70' : 'text-bone'}>
            ${display.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <AnimatePresence>
          {dissolved && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: HEAVY, delay: 0.3 }}
              className="mt-6 font-mono text-sm text-brass tracking-wide"
            >
              — paid in the background. you were never notified, because there was nothing to do.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-4 rule-t border-hairline font-mono text-[10px] md:text-xs text-titanium tracking-widest2 uppercase">
        {STAGES.map((s, i) => (
          <div
            key={s.label}
            className={`px-3 md:px-6 py-4 rule-r border-hairline last:border-r-0 transition-colors duration-500 ${
              i <= stage ? 'text-bone-dim' : 'text-titanium/40'
            }`}
          >
            <span className={i <= stage ? 'text-brass' : ''}>{String(i + 1).padStart(2, '0')}</span>
            <span className="hidden md:inline"> — {s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
