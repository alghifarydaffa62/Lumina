'use client'

import { useEffect, useState } from 'react'

type IndexRailProps = {
  items: { id: string; label: string }[]
}

export function IndexRail({ items }: IndexRailProps) {
  const [active, setActive] = useState(items[0]?.id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        })
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    )

    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  return (
    <div className="hidden lg:flex fixed left-8 top-1/2 -translate-y-1/2 z-40 flex-col gap-4">
      {items.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          className="group flex items-center gap-3"
          aria-current={active === id ? 'true' : undefined}
        >
          <span
            className={`h-px transition-all duration-500 ease-heavy ${
              active === id ? 'w-8 bg-brass' : 'w-3 bg-titanium/50 group-hover:w-5 group-hover:bg-bone-dim'
            }`}
          />
          <span
            className={`font-mono text-[10px] tracking-widest2 uppercase transition-colors duration-500 ${
              active === id ? 'text-brass' : 'text-titanium/60 group-hover:text-bone-dim'
            }`}
          >
            {label}
          </span>
        </a>
      ))}
    </div>
  )
}
