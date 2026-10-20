'use client'

import { useState } from 'react'
import { Plus, X, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toE164, formatPhone, formatAsTyped } from '@/lib/phone'

export function SmsConfig({ businessId, initialEnabled, initialPhones }: {
  businessId: string
  initialEnabled: boolean
  initialPhones: string[]
}) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [phones, setPhones] = useState<string[]>(initialPhones)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [consent, setConsent] = useState(false)

  async function save(nextEnabled: boolean, nextPhones: string[]) {
    setSaving(true)
    const supabase = createClient()
    // Keep the older single-number alert_phone in sync so removing every number really stops texts
    await supabase.from('businesses').update({
      sms_alerts_enabled: nextEnabled,
      alert_phones: nextPhones,
      alert_phone: nextPhones[0] ?? null,
    }).eq('id', businessId)
    setSaving(false)
  }

  async function toggleEnabled() {
    if (!enabled && !consent) return
    const next = !enabled
    setEnabled(next)
    await save(next, phones)
  }

  async function addPhone() {
    const phone = toE164(input)
    if (!phone) { setError('Enter a 10-digit US mobile number'); return }
    setInput('')
    setError('')
    if (phones.includes(phone)) return
    const next = [...phones, phone]
    setPhones(next)
    await save(enabled, next)
  }

  async function removePhone(phone: string) {
    const next = phones.filter(p => p !== phone)
    setPhones(next)
    await save(enabled, next)
  }

  const active = enabled && phones.length > 0

  return (
    <div className="bg-[#0D1525] border border-white/[0.06] rounded-xl p-5 space-y-4 text-xs">

      <div className="flex items-center gap-2">
        <Bell size={12} className={active ? 'text-emerald-400' : 'text-white/30'} />
        <span className="text-white/70 font-semibold text-sm">SMS Lead Alerts</span>
        <span className={`ml-1 px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wide ${
          active
            ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25'
            : 'text-white/40 bg-white/[0.03] border-white/10'
        }`}>
          {active ? 'On' : 'Off'}
        </span>
        {saving && <span className="ml-auto text-white/25 text-[11px]">Saving…</span>}
      </div>

      <p className="text-white/40 text-[11px] leading-relaxed">
        These numbers get a text the moment a qualified lead calls.
      </p>

      {/* Numbers */}
      <div className="rounded-lg border border-white/[0.06] divide-y divide-white/[0.05]">
        {phones.length === 0 ? (
          <p className="px-3 py-2.5 text-white/30">No numbers yet</p>
        ) : phones.map(phone => (
          <div key={phone} className="flex items-center justify-between px-3 py-2.5">
            <span className="text-white/75 text-[13px] tabular-nums">{formatPhone(phone)}</span>
            <button
              onClick={() => removePhone(phone)}
              aria-label={`Remove ${formatPhone(phone)}`}
              className="text-white/25 hover:text-red-400 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Add a number */}
      <div>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center bg-white/[0.03] border border-white/[0.06] rounded-lg focus-within:border-white/20">
            <span className="pl-3 text-white/35 text-[13px]">+1</span>
            <input
              value={input}
              onChange={e => { setInput(formatAsTyped(e.target.value)); setError('') }}
              onKeyDown={e => e.key === 'Enter' && addPhone()}
              inputMode="tel"
              placeholder="(703) 555-1234"
              aria-label="Mobile number to receive alerts"
              className="flex-1 bg-transparent px-2 py-2 text-white/80 placeholder:text-white/20 text-[13px] tabular-nums focus:outline-none"
            />
          </div>
          <button
            onClick={addPhone}
            disabled={!toE164(input)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-500/15 border border-blue-500/25 text-blue-300 hover:bg-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={11} />
            Add number
          </button>
        </div>
        {error && <p className="text-red-400/80 text-[11px] mt-1.5">{error}</p>}
      </div>

      {enabled ? (
        <button
          onClick={toggleEnabled}
          className="text-white/40 hover:text-red-300 text-[11px] underline underline-offset-2 transition-colors"
        >
          Turn off SMS alerts
        </button>
      ) : (
        <>
          <label className="flex items-start gap-3 cursor-pointer">
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

          <button
            onClick={toggleEnabled}
            disabled={!consent || phones.length === 0}
            className="w-full py-2.5 rounded-lg text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Turn on SMS alerts
          </button>
        </>
      )}

    </div>
  )
}
