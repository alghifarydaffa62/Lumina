import { MerchantCover } from './merchant-cover'
import { RouteFlow } from './route-flow'
import { Marquee } from '@/components/marquee'
import { Clause } from '@/components/clause'
import { IndexRail } from '@/components/index-rail'
import { ProvisionList } from '@/components/provision-list'
import { KineticText } from '@/components/kinetic-text'
import { Footer } from '@/components/Footer'

const RAIL_ITEMS = [
  { id: 'docket', label: 'Cover' },
  { id: 'routing', label: 'Routing' },
  { id: 'terms', label: 'Terms' },
  { id: 'onboard', label: 'Onboard' },
]

const TICKER = [
  'OFF-CHAIN INVOICING',
  'INSTANT USDC SETTLEMENT',
  'ZERO CHARGEBACKS',
  'SOROBAN SMART CONTRACTS',
  'NO PROCESSOR HOLD',
]

const TERMS = [
  {
    term: 'You invoice, we don\u2019t touch it',
    detail:
      'Invoices are created and stored off-chain through Firebase. Lumina never sits between you and your billing records.',
  },
  {
    term: 'Payment triggers the contract',
    detail:
      'When a customer pays, a Soroban smart contract executes the transfer directly \u2014 not a settlement batch, not a holding account.',
  },
  {
    term: 'No chargebacks, by design',
    detail:
      'USDC settlement is final at the contract level. There is no dispute window to staff for, because there is no reversal path.',
  },
  {
    term: 'Your wallet, immediately',
    detail:
      'Funds land in the wallet you registered. Not a Lumina-controlled balance waiting on a withdrawal request.',
  },
]

/**
 * Everything a merchant sees before connecting a wallet. Once connected,
 * MerchantPage swaps this out for the checking / register / redirect
 * states — this component owns no wallet logic of its own.
 */
export default function MerchantHero() {
  return (
    <>
      <IndexRail items={RAIL_ITEMS} />

      <MerchantCover />

      <Marquee items={TICKER} />

      <Clause id="routing" index="01" title="The Routing">
        <p className="font-body text-lg md:text-2xl text-bone-dim leading-snug max-w-2xl mb-14">
          Card processors hold your money for days and reserve the right to
          take it back. Lumina routes it once, on settlement, to a wallet
          only you control.
        </p>
        <RouteFlow />
      </Clause>

      <Clause id="terms" index="02" title="Terms of Service">
        <ProvisionList items={TERMS} />
      </Clause>

      <Clause id="onboard" index="03" title="Onboarding" dense>
        <KineticText
          as="h2"
          unit="char"
          className="font-display text-[10vw] md:text-[5vw] leading-[0.9] tracking-tightest uppercase text-bone max-w-3xl"
        >
          Connect a wallet to register your store.
        </KineticText>
        <p className="mt-6 font-mono text-xs tracking-widest2 uppercase text-titanium">
          Use the connect control in the header above.
        </p>
      </Clause>

      <Footer>
        <span className="font-mono text-[11px] tracking-widest2 uppercase text-titanium">
          Settlement average: under 1 second
        </span>
      </Footer>
    </>
  )
}