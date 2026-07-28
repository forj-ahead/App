'use client'

import { useState } from 'react'
import { Plus, X, Bell, BellOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function SmsConfig({ businessId, initialEnabled, initialPhones }: {
  businessId: string
  initialEnabled: boolean
  initialPhones: string[]
}) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [phones, setPhones] = useState<string[]>(initialPhones)
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)

  async function save(nextEnabled: boolean, nextPhones: string[]) {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('businesses').update({
      sms_alerts_enabled: nextEnabled,
      alert_phones: nextPhones,
    }).eq('id', businessId)
    setSaving(false)
  }

  async function toggleEnabled() {
    const next = !enabled
    setEnabled(next)
    await save(next, phones)
  }

  async function addPhone() {
    const cleaned = input.trim().replace(/\D/g, '')
    if (!cleaned) return
    const formatted = cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`
    if (phones.includes(formatted)) { setInput(''); return }
    const next = [...phones, formatted]
    setPhones(next)
    setInput('')
    await save(enabled, next)
  }

  async function removePhone(phone: string) {
    const next = phones.filter(p => p !== phone)
    setPhones(next)
    await save(enabled, next)
  }

  return (
    <div className="bg-[#0D1525] border border-white/[0.06] rounded-xl p-4 space-y-3 text-xs">
      {/* Toggle row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {enabled
            ? <Bell size={11} className="text-emerald-400" />
            : <BellOff size={11} className="text-white/20" />
          }
          <span className="text-white/50 font-medium">SMS alerts</span>
          {saving && <span className="text-white/20">Saving…</span>}
        </div>
        <button
          onClick={toggleEnabled}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${enabled ? 'bg-emerald-500' : 'bg-white/10'}`}
        >
          <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Phone list */}
      {phones.length > 0 && (
        <div className="space-y-1.5">
          {phones.map(phone => (
            <div key={phone} className="flex items-center justify-between bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-1.5">
              <span className="text-white/60 font-mono">{phone}</span>
              <button onClick={() => removePhone(phone)} className="text-white/20 hover:text-red-400 transition-colors ml-2">
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add phone */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addPhone()}
          placeholder="+1 (703) 555-1234"
          className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5 text-white/70 placeholder:text-white/15 text-xs focus:outline-none focus:border-white/20"
        />
        <button
          onClick={addPhone}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/25 text-blue-300 hover:bg-blue-500/25 transition-colors"
        >
          <Plus size={11} />
          Add
        </button>
      </div>

      {phones.length === 0 && (
        <p className="text-white/20 text-[10px]">No numbers added. Alerts will not send.</p>
      )}
    </div>
  )
}
