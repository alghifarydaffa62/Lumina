import { ReactNode } from 'react'

type ClauseProps = {
  id: string
  index: string 
  title: string
  children: ReactNode
  className?: string
  dense?: boolean
}

export function Clause({ id, index, title, children, className = '', dense = false }: ClauseProps) {
  return (
    <section
      id={id}
      data-clause={id}
      className={`relative rule-t border-hairline ${dense ? 'py-20 md:py-28' : 'py-28 md:py-44'} px-6 md:px-16 ${className}`}
    >
      <div className="mx-auto max-w-360">
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 md:col-span-3 mb-10 md:mb-0">
            <span className="font-mono text-micro text-brass tracking-widest2 uppercase">
              {index}
            </span>
            <h3 className="font-display text-sm md:text-base text-bone-dim uppercase tracking-widest2 mt-3 max-w-[14ch]">
              {title}
            </h3>
          </div>
          <div className="col-span-12 md:col-span-9">{children}</div>
        </div>
      </div>
    </section>
  )
}
