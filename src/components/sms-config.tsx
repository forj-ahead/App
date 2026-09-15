'use client'

import { useState } from 'react'
import { Plus, X, Bell } from 'lucide-react'
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
  const [consent, setConsent] = useState(false)

  async function save(nextEnabled: boolean, nextPhones: string[]) {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('businesses').update({
      sms_alerts_enabled: nextEnabled,
      alert_phones: nextPhones,
    }).eq('id', businessId)
    setSaving(false)
  }

  async function handleEnable() {
    if (!consent) return
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
    <div className="bg-[#0D1525] border border-white/[0.06] rounded-xl p-5 space-y-4 text-xs">

      <div className="flex items-center gap-2 mb-1">
        <Bell size={12} className="text-emerald-400" />
        <span className="text-white/70 font-semibold text-sm">SMS Lead Alerts</span>
        {saving && <span className="text-white/20 text-xs">Saving…</span>}
      </div>

      <p className="text-white/40 text-[11px] leading-relaxed">
        Get a text message the moment a qualified lead calls your business. Enter your mobile number below and enable alerts.
      </p>

      {/* Phone number input */}
      <div>
        <label className="block text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-1.5">
          Mobile number to receive alerts
        </label>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPhone()}
            placeholder="+1 (703) 555-1234"
            className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-white/70 placeholder:text-white/15 text-xs focus:outline-none focus:border-white/20"
          />
          <button
            onClick={addPhone}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-500/15 border border-blue-500/25 text-blue-300 hover:bg-blue-500/25 transition-colors"
          >
            <Plus size={11} />
            Add
          </button>
        </div>
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

      {/* Consent checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative mt-0.5 flex-shrink-0">
          <input
            type="checkbox"
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-4 h-4 rounded border transition-colors ${consent ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 bg-white/[0.03]'}`}>
            {consent && (
              <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-white/30 text-[10px] leading-relaxed">
          I agree to receive automated SMS lead alert notifications from Forj at the number(s) above.
          Message frequency varies based on call volume — up to one message per qualifying inbound call.
          Msg&amp;Data rates may apply. Reply <strong className="text-white/50">STOP</strong> to opt out at any time.
          Reply <strong className="text-white/50">HELP</strong> for help.{' '}
          <a href="https://app.forjahead.com/privacy" target="_blank" rel="noopener noreferrer" className="text-white/50 underline hover:text-white/70">Privacy Policy</a>
          {' · '}
          <a href="https://app.forjahead.com/terms" target="_blank" rel="noopener noreferrer" className="text-white/50 underline hover:text-white/70">Terms of Service</a>
        </span>
      </label>

      {/* Enable button */}
      <button
        onClick={handleEnable}
        disabled={!consent || phones.length === 0}
        className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-colors ${
          enabled
            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-300'
            : 'bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed'
        }`}
      >
        {enabled ? 'Disable SMS Alerts' : 'Yes, enable SMS alerts'}
      </button>

    </div>
  )
}
