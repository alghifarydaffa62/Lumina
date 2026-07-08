'use client'

import { useState } from 'react'
import { Store } from 'lucide-react'

interface Props {
  onRegister: (storeName: string) => Promise<void>
}

export default function MerchantRegister({ onRegister }: Props) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
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
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl border border-purple-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="rounded-xl bg-purple-100 p-3">
            <Store className="h-6 w-6 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800">Register Your Store</h2>
          <p className="text-center text-sm text-slate-500">
            Choose a name for your store to start accepting payments.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Store name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-800 outline-none transition focus:border-purple-400 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || saving}
            className="rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Registering...' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  )
}
