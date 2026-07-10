import { FadeUp } from './kinetic-text'

type Provision = { term: string; detail: string }

export function ProvisionList({ items }: { items: Provision[] }) {
  return (
    <div>
      {items.map((item, i) => (
        <FadeUp key={item.term} delay={i * 0.06}>
          <div className="grid grid-cols-12 gap-6 py-7 rule-t border-hairline first:border-t-0 items-baseline">
            <div className="col-span-12 md:col-span-4">
              <h4 className="font-display text-xl md:text-2xl text-bone tracking-tightest">
                {item.term}
              </h4>
            </div>
            <div className="col-span-12 md:col-span-7 md:col-start-6">
              <p className="font-body text-sm md:text-base text-bone-dim leading-relaxed">
                {item.detail}
              </p>
            </div>
          </div>
        </FadeUp>
      ))}
    </div>
  )
}
