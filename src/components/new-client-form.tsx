'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Copy, Check } from 'lucide-react'

interface Template { id: string; name: string; industry: string }

interface SuccessData {
  businessId: string
  businessName: string
  agentId: string
  twilioNumber: string
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded border border-slate-700/50 hover:border-slate-500"
    >
      {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function ForwardingCode({ label, code }: { label: string; code: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-700/40 last:border-0">
      <div>
        <p className="text-white text-xs font-medium">{label}</p>
      </div>
      <div className="flex items-center gap-2">
        <code className="text-blue-300 font-mono text-sm bg-[#0b1120] px-3 py-1 rounded-lg border border-slate-700/50">
          {code}
        </code>
        <CopyButton text={code} />
      </div>
    </div>
  )
}

function SuccessScreen({ data }: { data: SuccessData }) {
  const router = useRouter()
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl">
        <CheckCircle size={22} className="text-emerald-400 flex-shrink-0" />
        <div>
          <p className="text-white font-semibold">{data.businessName} is live</p>
          <p className="text-slate-400 text-sm mt-0.5">Agent created and connected. Complete the steps below to finish setup.</p>
        </div>
      </div>

      {/* Agent ID */}
      <div className="bg-[#111827] border border-white/5 rounded-xl p-5">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Retell Agent ID</p>
        <div className="flex items-center gap-3">
          <code className="text-blue-300 font-mono text-sm flex-1 bg-[#0b1120] px-3 py-2 rounded-lg border border-slate-700/50 truncate">
            {data.agentId}
          </code>
          <CopyButton text={data.agentId} />
        </div>
        <p className="text-slate-500 text-xs mt-2">Already saved to the client record.</p>
      </div>

      {/* Remaining steps */}
      <div className="bg-[#111827] border border-white/5 rounded-xl p-5">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">Remaining Steps</p>
        <ol className="space-y-4">
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
            <div>
              <p className="text-white text-sm font-medium">Buy a phone number in Retell</p>
              <p className="text-slate-400 text-xs mt-0.5">Retell dashboard → Phone Numbers → Buy number. Pick an area code close to the client.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
            <div>
              <p className="text-white text-sm font-medium">Assign the agent to that number in Retell</p>
              <p className="text-slate-400 text-xs mt-0.5">Phone Numbers → select number → assign agent "{data.businessName}"</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
            <div>
              <p className="text-white text-sm font-medium">Add the Twilio number to the client record in Forj</p>
              <p className="text-slate-400 text-xs mt-0.5">Go to the client detail page and enter it — format: +1XXXXXXXXXX</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
            <div>
              <p className="text-white text-sm font-medium">Test — call the Retell number yourself</p>
              <p className="text-slate-400 text-xs mt-0.5">The agent should answer and a call should appear in the dashboard.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
            <div>
              <p className="text-white text-sm font-medium">Set up call forwarding with the client</p>
            </div>
          </li>
        </ol>
      </div>

      {/* Call forwarding codes */}
      <div className="bg-[#111827] border border-white/5 rounded-xl p-5">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">Call Forwarding Codes</p>
        <p className="text-slate-500 text-xs mb-4">Client opens Phone app, dials each code, presses Call. Stays active permanently.</p>
        {data.twilioNumber ? (
          <>
            <ForwardingCode label="When no answer" code={`*61*${data.twilioNumber}#`} />
            <ForwardingCode label="When busy / on another call" code={`*67*${data.twilioNumber}#`} />
            <ForwardingCode label="When on DND / unreachable" code={`*62*${data.twilioNumber}#`} />
            <p className="text-slate-600 text-xs mt-3">To cancel all: <code className="font-mono">##61# ##67# ##62#</code></p>
          </>
        ) : (
          <p className="text-slate-500 text-sm">Add the Twilio number to the client record first — codes will appear here.</p>
        )}
      </div>

      <Button
        onClick={() => router.push(`/admin/clients/${data.businessId}`)}
        className="w-full bg-[#2D6FE8] hover:bg-blue-600 text-white font-semibold h-11"
      >
        Go to Client Record →
      </Button>
    </div>
  )
}

export function NewClientForm({ templates }: { templates: Template[] }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<SuccessData | null>(null)

  const [form, setForm] = useState({
    businessName: '',
    industry: '',
    templateId: '',
    contactName: '',
    contactEmail: '',
    alertPhone: '',
    scoreThreshold: '7',
    agentName: 'Maya',
    servicesOffered: '',
    servicesExcluded: '',
    serviceArea: '',
    customQuestions: '',
    disqualifyIf: '',
    extraContext: '',
  })

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    if (key === 'templateId') {
      const t = templates.find(t => t.id === value) ?? null
      if (t) setForm(f => ({ ...f, industry: t.industry, templateId: value }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    // 1. Create business in Supabase
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .insert({
        name: form.businessName,
        industry: form.industry,
        template_id: form.templateId || null,
        alert_phone: form.alertPhone || null,
        score_threshold: parseInt(form.scoreThreshold),
        services_offered: form.servicesOffered.split(',').map(s => s.trim()).filter(Boolean),
        services_excluded: form.servicesExcluded.split(',').map(s => s.trim()).filter(Boolean),
        sms_alerts_enabled: !!form.alertPhone,
      })
      .select()
      .single()

    if (bizError || !business) {
      setError(bizError?.message ?? 'Failed to create business')
      setLoading(false)
      return
    }

    // 2. Create Retell agent via server route
    const agentRes = await fetch('/api/admin/create-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: form.businessName,
        industry: form.industry,
        agentName: form.agentName,
        servicesOffered: form.servicesOffered,
        servicesExcluded: form.servicesExcluded,
        serviceArea: form.serviceArea,
        customQuestions: form.customQuestions,
        disqualifyIf: form.disqualifyIf,
        extraContext: form.extraContext,
      }),
    })

    const agentData = await agentRes.json()

    if (!agentRes.ok) {
      setError(`Agent created business but Retell failed: ${agentData.error}. Add agent ID manually in the client record.`)
      setLoading(false)
      return
    }

    // 3. Save agent ID back to business
    await supabase
      .from('businesses')
      .update({ retell_agent_id: agentData.agentId })
      .eq('id', business.id)

    setSuccess({
      businessId: business.id,
      businessName: form.businessName,
      agentId: agentData.agentId,
      twilioNumber: '',
    })
    setLoading(false)
  }

  const inputClass = "bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#2D6FE8]"

  if (success) return <SuccessScreen data={success} />

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Template picker */}
      {templates.length > 0 && (
        <div className="bg-[#111827] border border-white/5 rounded-xl p-5 space-y-3">
          <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Start from a template (optional)</h2>
          <div className="grid grid-cols-2 gap-2">
            {templates.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => set('templateId', t.id)}
                className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                  form.templateId === t.id
                    ? 'bg-[#2D6FE8]/15 border-[#2D6FE8]/40 text-[#2D6FE8]'
                    : 'border-white/10 text-white/60 hover:border-white/20 hover:text-white'
                }`}
              >
                <div className="font-semibold">{t.name}</div>
                <div className="text-xs opacity-60">{t.industry}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Business info */}
      <div className="bg-[#111827] border border-white/5 rounded-xl p-5 space-y-4">
        <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Business Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white/60 text-xs">Business Name *</Label>
            <Input value={form.businessName} onChange={e => set('businessName', e.target.value)} required placeholder="Acme Roofing" className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label className="text-white/60 text-xs">Industry *</Label>
            <Input value={form.industry} onChange={e => set('industry', e.target.value)} required placeholder="Roofing" className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label className="text-white/60 text-xs">Contact Name</Label>
            <Input value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="Chris Elliott" className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label className="text-white/60 text-xs">Contact Email</Label>
            <Input type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="chris@example.com" className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label className="text-white/60 text-xs">Alert Phone (SMS notifications)</Label>
            <Input value={form.alertPhone} onChange={e => set('alertPhone', e.target.value)} placeholder="+17035551234" className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label className="text-white/60 text-xs">Score Threshold (qualify at X/10+)</Label>
            <Input type="number" min="1" max="10" value={form.scoreThreshold} onChange={e => set('scoreThreshold', e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Agent config */}
      <div className="bg-[#111827] border border-white/5 rounded-xl p-5 space-y-4">
        <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Agent Configuration</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white/60 text-xs">Agent Name (what callers hear)</Label>
            <Input value={form.agentName} onChange={e => set('agentName', e.target.value)} placeholder="Maya" className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label className="text-white/60 text-xs">Service Area</Label>
            <Input value={form.serviceArea} onChange={e => set('serviceArea', e.target.value)} placeholder="Montgomery County MD, within 30 miles" className={inputClass} />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-white/60 text-xs">Services Offered <span className="normal-case font-normal">(comma separated)</span></Label>
          <Textarea value={form.servicesOffered} onChange={e => set('servicesOffered', e.target.value)} placeholder="Roof repair, new roof installation, gutters, inspections" className={`${inputClass} resize-none`} rows={2} />
        </div>
        <div className="space-y-2">
          <Label className="text-white/60 text-xs">Services NOT Offered <span className="normal-case font-normal">(comma separated)</span></Label>
          <Textarea value={form.servicesExcluded} onChange={e => set('servicesExcluded', e.target.value)} placeholder="Flat roofs, commercial buildings, solar panels" className={`${inputClass} resize-none`} rows={2} />
        </div>
        <div className="space-y-2">
          <Label className="text-white/60 text-xs">Custom Qualifying Questions</Label>
          <Textarea
            value={form.customQuestions}
            onChange={e => set('customQuestions', e.target.value)}
            placeholder={"Are you the homeowner or a renter?\nIs this a one-time job or recurring service?\nHow many squares is the roof roughly?"}
            className={`${inputClass} resize-none font-mono text-xs`}
            rows={4}
          />
          <p className="text-white/20 text-xs">One per line. The agent will weave these in naturally.</p>
        </div>
        <div className="space-y-2">
          <Label className="text-white/60 text-xs">Disqualify the lead if…</Label>
          <Textarea
            value={form.disqualifyIf}
            onChange={e => set('disqualifyIf', e.target.value)}
            placeholder={"Caller is a renter without landlord approval\nOutside service area\nOnly wants a price — no intent to book"}
            className={`${inputClass} resize-none font-mono text-xs`}
            rows={3}
          />
          <p className="text-white/20 text-xs">One per line. Agent will score 1–3 and wrap up politely.</p>
        </div>
        <div className="space-y-2">
          <Label className="text-white/60 text-xs">Anything else the agent should know</Label>
          <Textarea
            value={form.extraContext}
            onChange={e => set('extraContext', e.target.value)}
            placeholder="Minimum job size is $500. We don't do same-day emergency calls. Always ask if they have an HOA."
            className={`${inputClass} resize-none`}
            rows={3}
          />
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
      )}

      <Button type="submit" disabled={loading} className="w-full bg-[#2D6FE8] hover:bg-blue-600 text-white font-semibold h-11">
        {loading ? 'Creating client & agent…' : 'Create Client & Agent →'}
      </Button>
    </form>
  )
}
