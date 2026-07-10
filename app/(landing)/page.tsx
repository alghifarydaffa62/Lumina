'use client'

import Navbar from '@/components/Navbar'
import { Cover } from '@/components/cover'
import { Marquee } from '@/components/marquee'
import { Clause } from '@/components/clause'
import { IndexRail } from '@/components/index-rail'
import { DebtLedger } from '@/components/debt-ledger'
import { ProvisionList } from '@/components/provision-list'
import { CardFace } from '@/components/card-face'
import { KineticText } from '@/components/kinetic-text'
import { Footer } from '@/components/Footer'
import { ConnectButton } from 'stellar-wallet-kit'

const RAIL_ITEMS = [
  { id: 'index', label: 'Cover' },
  { id: 'mechanism', label: 'Mechanism' },
  { id: 'provisions', label: 'Provisions' },
  { id: 'use', label: 'Use' },
  { id: 'signature', label: 'Signature' },
]

const TICKER = [
  'COLLATERALIZED USDC SPEND',
  'YIELD-FUNDED REPAYMENT',
  'SOROBAN SMART CONTRACTS',
  'ZERO STATEMENTS',
  'ZERO DUE DATES',
]

const PROVISIONS = [
  {
    term: 'Collateral, not credit',
    detail:
      'You deposit first. The protocol never extends you anything it has not already secured against your own assets.',
  },
  {
    term: 'Spend in USDC',
    detail:
      'Every transaction settles in USDC on Stellar. No card network, no interchange fee negotiated on your behalf.',
  },
  {
    term: 'A keeper, not a statement',
    detail:
      'An automated keeper bot applies protocol yield against your generated debt continuously. There is nothing to schedule.',
  },
  {
    term: 'The debt dissolves',
    detail:
      'You will not receive a reminder, because there is nothing for you to act on. The balance is handled before you notice it.',
  },
]

export default function LuminaPage() {
  return (
    <main className="relative bg-obsidian text-bone">
      <Navbar />
      <IndexRail items={RAIL_ITEMS} />

      <Cover />

      <Marquee items={TICKER} />

      <Clause id="mechanism" index="01" title="The Mechanism">
        <p className="font-body text-lg md:text-2xl text-bone-dim leading-snug max-w-2xl mb-14">
          Most cards make debt loud — a statement, a due date, a rate youre
          meant to fear. Lumina makes it quiet. Collateral sits in the
          protocol. You spend against it. The gap repays itself.
        </p>
        <DebtLedger />
      </Clause>

      <Clause id="provisions" index="02" title="Provisions">
        <ProvisionList items={PROVISIONS} />
      </Clause>

      <Clause id="use" index="03" title="The Card">
        <div className="grid grid-cols-12 gap-10 items-center">
          <div className="col-span-12 md:col-span-6 order-2 md:order-1">
            <CardFace />
          </div>
          <div className="col-span-12 md:col-span-6 order-1 md:order-2">
            <KineticText
              as="p"
              unit="word"
              className="font-display text-2xl md:text-4xl tracking-tightest text-bone leading-tight mb-6"
            >
              One instrument. Everywhere USDC settles.
            </KineticText>
            <p className="font-body text-sm md:text-base text-bone-dim leading-relaxed max-w-md">
              No physical mailing, no activation call. The card is issued
              against your on-chain position the moment your collateral
              clears.
            </p>
          </div>
        </div>
      </Clause>

      <Clause id="signature" index="04" title="Signature" dense>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <KineticText
            as="h2"
            unit="char"
            className="font-display text-[11vw] md:text-[4vw] leading-[0.9] uppercase text-bone max-w-3xl"
          >
            Hold the collateral. Forget the debt.
          </KineticText>
          <div className="shrink-0 [&_button]:!font-mono [&_button]:!text-xs [&_button]:!tracking-widest2 [&_button]:!uppercase [&_button]:!rounded-none [&_button]:!bg-brass [&_button]:!text-obsidian [&_button]:hover:!bg-brass-bright [&_button]:!transition-colors [&_button]:!duration-300 [&_button]:!px-8 [&_button]:!py-4">
            <ConnectButton />
          </div>
        </div>
      </Clause>

      <Footer />
    </main>
  )
}