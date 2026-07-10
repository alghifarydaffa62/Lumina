'use client'

import { useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

type TerminalTypeProps = {
  lines: string[]
  className?: string
  cursor?: boolean
  speed?: number
  startDelay?: number
}

/**
 * Types out a sequence of lines character-by-character, once the block
 * enters view. Used sparingly — for the moments in the copy that should
 * feel like a system speaking, not a marketer.
 */
export function TerminalType({
  lines,
  className = '',
  cursor = true,
  speed = 22,
  startDelay = 200,
}: TerminalTypeProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px -15% 0px' })
  const [rendered, setRendered] = useState<string[]>([])
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!inView) return
    let cancelled = false
    let lineIdx = 0
    let charIdx = 0
    const out: string[] = new Array(lines.length).fill('')

    const timer = setTimeout(function tick() {
      if (cancelled) return
      if (lineIdx >= lines.length) {
        setDone(true)
        return
      }
      const currentLine = lines[lineIdx]
      charIdx += 1
      out[lineIdx] = currentLine.slice(0, charIdx)
      setRendered([...out])

      if (charIdx >= currentLine.length) {
        lineIdx += 1
        charIdx = 0
        setTimeout(tick, 260)
      } else {
        setTimeout(tick, speed)
      }
    }, startDelay)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [inView, lines, speed, startDelay])

  return (
    <div ref={ref} className={className}>
      {lines.map((_, i) => (
        <div key={i} className="min-h-[1.4em]">
          {rendered[i] ?? ''}
          {i === (rendered.length - 1) && !done && cursor && (
            <motion.span
              animate={{ opacity: [1, 1, 0, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
              className="inline-block w-[0.55em] h-[0.95em] bg-brass align-middle ml-1"
            />
          )}
        </div>
      ))}
    </div>
  )
}
