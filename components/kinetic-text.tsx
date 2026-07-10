'use client'

import { motion, Variants } from 'framer-motion'
import { ElementType, ReactNode } from 'react'

const HEAVY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

type KineticTextProps = {
  children: string
  as?: ElementType
  className?: string
  unit?: 'word' | 'char'
  delay?: number
  stagger?: number
  once?: boolean
}

/**
 * Splits text into words or characters and reveals them with a heavy,
 * deliberate y-axis / opacity motion. No bounce. No spring. Everything
 * settles like weight coming to rest.
 */
export function KineticText({
  children,
  as: Tag = 'div',
  className = '',
  unit = 'word',
  delay = 0,
  stagger = 0.045,
  once = true,
}: KineticTextProps) {
  const pieces = unit === 'char' ? children.split('') : children.split(' ')

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  }

  const item: Variants = {
    hidden: { opacity: 0, y: unit === 'char' ? '0.6em' : '110%' },
    visible: {
      opacity: 1,
      y: '0%',
      transition: { duration: 0.9, ease: HEAVY_EASE },
    },
  }

  const MotionTag = motion(Tag as ElementType) as ElementType

  return (
    <MotionTag
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-10% 0px -10% 0px' }}
    >
      {pieces.map((piece, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden' }}>
          <motion.span
            variants={item}
            style={{ display: 'inline-block' }}
          >
            {piece === '' ? '\u00A0' : piece}
            {unit === 'word' && i < pieces.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  )
}

export function FadeUp({
  children,
  className = '',
  delay = 0,
  duration = 1,
  once = true,
}: {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  once?: boolean
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-10% 0px -10% 0px' }}
      transition={{ duration, ease: HEAVY_EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

export const HEAVY = HEAVY_EASE
