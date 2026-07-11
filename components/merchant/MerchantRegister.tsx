'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { KineticText, HEAVY } from '@/components/kinetic-text'

interface Props {
  onRegister: (storeName: string) => Promise<void>
}

const fadeUp = { opacity: 1, y: 0 }
const fadeDown = { opacity: 0, y: 16 }
const transition = { duration: 0.8, ease: HEAVY, delay: 0.3 }

export default function MerchantRegister({ onRegister }: Props) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      await onRegister(name.trim())
    } catch {
      setError('Failed to register. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [name, onRegister])

  return (
    <div className="flex flex-1 min-h-svh items-center justify-center bg-obsidian px-6">
      <div className="w-full max-w-md">
        <span className="font-mono text-micro text-brass tracking-widest2 uppercase">
          01 — Registration
        </span>
        <KineticText
          as="h2"
          unit="word"
          className="font-display text-4xl md:text-5xl leading-[0.95] tracking-tightest uppercase text-bone mt-4 mb-3"
        >
          Register your store.
        </KineticText>
        <p className="font-body text-sm text-bone-dim leading-relaxed mb-10 max-w-sm">
          Choose a name for your store to start accepting payments.
        </p>

        <motion.div
          initial={fadeDown}
          animate={fadeUp}
          transition={transition}
          className="border border-hairline2 bg-obsidian-panel/60"
        >
          {error && (
            <div className="rule-b border-hairline px-6 py-4">
              <p className="font-mono text-xs text-brass tracking-wide">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-6 px-6 py-8">
            <label className="flex flex-col gap-3">
              <span className="font-mono text-[10px] tracking-widest2 uppercase text-titanium">
                Store name
              </span>
              <input
                type="text"
                placeholder="e.g. Meridian Coffee Co."
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
                className="w-full bg-transparent border border-hairline2 focus:border-brass px-4 py-3 font-body text-base text-bone placeholder:text-titanium/50 outline-none transition-colors duration-300 disabled:opacity-50"
              />
            </label>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!name.trim() || saving}
              className="font-mono text-xs tracking-widest2 uppercase bg-brass text-obsidian py-4 hover:bg-brass-bright transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Registering…' : 'Register'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
