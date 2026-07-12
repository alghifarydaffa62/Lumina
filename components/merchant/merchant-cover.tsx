'use client'

import { motion } from 'framer-motion'
import { KineticText, HEAVY } from '../kinetic-text'
import { TerminalType } from '../terminal-type'

export function MerchantCover() {
  return (
    <section id="docket" className="relative min-h-svh flex flex-col justify-end pt-32 pb-0 px-6 md:px-16 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: HEAVY }}
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(176,141,62,0.08), transparent 60%)',
        }}
      />

      <div className="mx-auto max-w-360 w-full">
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-2 order-2 md:order-1 mt-10 md:mt-0">
            <TerminalType
              className="font-mono text-[11px] leading-relaxed text-titanium"
              lines={['> invoice: off-chain', '> route: on settle', '> chargeback: n/a']}
              speed={26}
              startDelay={1400}
            />
          </div>

          <div className="col-span-12 md:col-span-10 order-1 md:order-2">
            <KineticText
              as="h1"
              unit="word"
              className="font-display text-[11.5vw] md:text-[6.6vw] leading-[0.86] tracking-tightest uppercase text-bone"
            >
              Process credit cards. Settle on-chain.
            </KineticText>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: HEAVY, delay: 0.9 }}
          className="mt-10 md:mt-16 rule-t border-hairline pt-8 grid grid-cols-12 gap-6"
        >
          <p className="col-span-12 md:col-span-5 font-body text-base md:text-lg text-bone-dim leading-relaxed">
            Issue an invoice off-chain. The moment it`s paid, a Soroban
            contract routes USDC straight to your wallet. No processor
            holds it. No chargeback reopens it.
          </p>
          <div className="col-span-12 md:col-span-4 md:col-start-9 flex items-end">
            <a
              href="#routing"
              className="group inline-flex items-center gap-4 font-mono text-xs tracking-widest2 uppercase text-bone"
            >
              <span className="w-10 h-px bg-brass group-hover:w-16 transition-all duration-500 ease-heavy" />
              See the routing
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
