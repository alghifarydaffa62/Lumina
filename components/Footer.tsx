import { ReactNode } from 'react'

export function Footer({ children }: { children?: ReactNode }) {
  return (
    <footer className="rule-t border-hairline px-6 md:px-16 py-14">
      <div className="mx-auto max-w-[1440px] grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-6">
          <p className="font-display text-2xl md:text-3xl tracking-tightest text-bone leading-tight max-w-md">
            No branches. No relationship managers. No forms.
          </p>
        </div>
        <div className="col-span-12 md:col-span-6 flex flex-col md:items-end justify-between gap-8">
          <div className="font-mono text-[11px] tracking-widest2 uppercase text-titanium">
            Built on Stellar / Soroban
          </div>
          {children}
        </div>
      </div>
      <div className="mx-auto max-w-[1440px] rule-t border-hairline mt-14 pt-6 flex flex-col md:flex-row justify-between gap-3 font-mono text-[10px] tracking-widest2 uppercase text-titanium/60">
        <span>Lumina Protocol — Not a bank. Not a promise. A contract.</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  )
}
