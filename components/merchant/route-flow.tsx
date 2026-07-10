'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { HEAVY } from '@/components/kinetic-text'

const NODES = [
  { code: 'A', label: 'Invoice Issued', sub: 'Off-chain / Firebase' },
  { code: 'B', label: 'Contract Executes', sub: 'Soroban / Stellar' },
  { code: 'C', label: 'Wallet Credited', sub: 'Merchant USDC' },
]

/**
 * The merchant-side signature: settlement isn't described, it's timed.
 * A counter races through the three nodes in well under a second, then
 * sits next to the industry number, struck through.
 */
export function RouteFlow() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-20%' })
  const [activeNode, setActiveNode] = useState(-1)
  const [elapsed, setElapsed] = useState(0)
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    if (!inView) return
    const timers: ReturnType<typeof setTimeout>[] = []
    const start = performance.now()
    let raf: number

    const tick = () => {
      setElapsed(performance.now() - start)
      if (!settled) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    NODES.forEach((_, i) => {
      timers.push(setTimeout(() => setActiveNode(i), 500 + i * 420))
    })
    timers.push(
      setTimeout(() => {
        setSettled(true)
      }, 500 + NODES.length * 420)
    )

    return () => {
      timers.forEach(clearTimeout)
      cancelAnimationFrame(raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  return (
    <div ref={ref} className="border border-hairline2 bg-obsidian-panel/60">
      <div className="flex items-center justify-between px-6 py-3 rule-b border-hairline">
        <span className="font-mono text-micro text-titanium tracking-widest2 uppercase">
          Settlement Trace — Invoice #8842
        </span>
        <span className="font-mono text-micro text-brass tracking-widest2 uppercase tabular-nums">
          {settled ? 'complete' : `t+${(elapsed / 1000).toFixed(2)}s`}
        </span>
      </div>

      <div className="px-6 md:px-10 py-14 md:py-20">
        <div className="grid grid-cols-3 gap-4 md:gap-10 relative">
          <div className="absolute top-[10px] left-[8%] right-[8%] h-px bg-hairline2 hidden md:block">
            <motion.div
              className="h-full bg-brass"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: settled ? 1 : activeNode >= 0 ? (activeNode + 1) / NODES.length : 0 }}
              transition={{ duration: 0.4, ease: HEAVY }}
              style={{ transformOrigin: 'left' }}
            />
          </div>

          {NODES.map((node, i) => (
            <div key={node.code} className="relative">
              <motion.div
                animate={{
                  backgroundColor: i <= activeNode ? '#B08D3E' : 'rgba(154,154,150,0.3)',
                  scale: i === activeNode && !settled ? 1.4 : 1,
                }}
                transition={{ duration: 0.4, ease: HEAVY }}
                className="w-[10px] h-[10px] rounded-full mb-5"
              />
              <p className="font-mono text-[10px] tracking-widest2 text-titanium uppercase mb-1">
                {node.code}
              </p>
              <p
                className={`font-display text-base md:text-xl tracking-tightest mb-1 transition-colors duration-500 ${
                  i <= activeNode ? 'text-bone' : 'text-titanium/50'
                }`}
              >
                {node.label}
              </p>
              <p className="font-mono text-[10px] md:text-xs text-titanium/60">{node.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 md:mt-20 rule-t border-hairline pt-8 flex flex-col md:flex-row gap-6 md:gap-16">
          <div>
            <p className="font-mono text-micro text-titanium tracking-widest2 uppercase mb-2">Lumina Settlement</p>
            <p className="font-display text-3xl md:text-4xl tracking-tightest text-brass tabular-nums">
              &lt; 1.0s
            </p>
          </div>
          <div>
            <p className="font-mono text-micro text-titanium tracking-widest2 uppercase mb-2">Card Network Average</p>
            <p className="font-display text-3xl md:text-4xl tracking-tightest text-titanium/50 line-through decoration-titanium/40">
              2–5 business days
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
