'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const STARTER_TEMPLATES = [
  {
    name: 'Roofing',
    industry: 'Roofing',
    base_prompt: `You are a friendly scheduling assistant for {{business_name}}, a professional roofing company. Your job is to answer calls, gather information about what the caller needs, and determine if it's a good fit for us.\n\nStart by greeting the caller warmly and asking how you can help them today. Then gather: what type of roofing issue they have, their address/area, their timeline, and roughly how many squares or what size their roof is if relevant.\n\nServices we offer: {{services_offered}}\nServices we do NOT offer: {{services_excluded}}\n\nIf they need something we don't offer, politely let them know and wish them well. Otherwise, collect their name and best callback number and let them know someone will follow up shortly.`,
    scoring_criteria: 'Score higher for: clear roofing need, ready timeline, homeowner (not renter), good location. Score lower for: wrong service type, vague need, outside service area, or just price shopping with no intent.',
    questions: [
      { id: '1', question: 'What type of roofing issue are you dealing with?', purpose: 'Identify service type' },
      { id: '2', question: "What's your address or general area?", purpose: 'Confirm service area' },
      { id: '3', question: 'How soon are you looking to get this done?', purpose: 'Gauge timeline and urgency' },
      { id: '4', question: 'Are you the homeowner?', purpose: 'Confirm decision-maker' },
    ]
  },
  {
    name: 'HVAC',
    industry: 'HVAC',
    base_prompt: `You are a friendly scheduling assistant for {{business_name}}, an HVAC service company. Your job is to answer calls, understand what the caller needs, and qualify them as a potential customer.\n\nGreet the caller and ask what's going on with their heating or cooling system. Find out: what the issue is, what type of system they have, when it started, and how urgent it is.\n\nServices we offer: {{services_offered}}\nServices we do NOT offer: {{services_excluded}}\n\nCollect their name, address, and best callback number before ending the call.`,
    scoring_criteria: 'Score higher for: active system issue, urgency (no heat/AC), homeowner, residential system. Score lower for: commercial-only systems if not offered, out of area, or fishing for free advice only.',
    questions: [
      { id: '1', question: "What's going on with your system?", purpose: 'Identify the issue' },
      { id: '2', question: 'What type of system do you have — central air, heat pump, furnace?', purpose: 'System type' },
      { id: '3', question: 'How long has this been happening?', purpose: 'Urgency assessment' },
      { id: '4', question: "What's your address?", purpose: 'Service area check' },
    ]
  },
  {
    name: 'Insurance Broker',
    industry: 'Insurance',
    base_prompt: `You are a friendly assistant for {{business_name}}, an independent insurance broker. Your job is to gather information from callers who are looking for insurance coverage and determine if we can help them.\n\nAsk what type of insurance they're looking for, their current situation, and what's prompting them to look now. Find out their timeline and whether they currently have coverage.\n\nServices we offer: {{services_offered}}\nServices we do NOT offer: {{services_excluded}}\n\nCollect their name, email, and phone number before ending the call.`,
    scoring_criteria: 'Score higher for: clear insurance need, ready to get quotes, life event driving the need. Score lower for: just browsing, wrong type of insurance, or not a decision-maker.',
    questions: [
      { id: '1', question: 'What type of insurance are you looking for?', purpose: 'Identify coverage type' },
      { id: '2', question: "What's prompting you to look for coverage right now?", purpose: 'Understand urgency/trigger' },
      { id: '3', question: 'Do you currently have coverage, or is this a new policy?', purpose: 'Gauge situation' },
      { id: '4', question: 'How soon are you looking to get this in place?', purpose: 'Timeline' },
    ]
  },
  {
    name: 'Mortgage Broker',
    industry: 'Mortgage',
    base_prompt: `You are a friendly assistant for {{business_name}}, an independent mortgage broker. Your job is to speak with callers who are looking for a mortgage or refinance and gather key information.\n\nFind out what they're looking to do — purchase, refinance, or something else. Ask about their timeline, property type, and roughly what loan amount they're thinking about.\n\nServices we offer: {{services_offered}}\nServices we do NOT offer: {{services_excluded}}\n\nCollect their name and best contact information before ending the call.`,
    scoring_criteria: 'Score higher for: purchase or refinance with clear intent, good timeline, specific property in mind. Score lower for: just curious, credit issues mentioned, or commercial deals if not offered.',
    questions: [
      { id: '1', question: 'Are you looking to purchase a home or refinance an existing one?', purpose: 'Loan purpose' },
      { id: '2', question: "What's your target timeline?", purpose: 'Urgency' },
      { id: '3', question: 'What type of property is it — primary home, investment, or second home?', purpose: 'Property type' },
      { id: '4', question: 'Do you have an idea of the loan amount you are looking for?', purpose: 'Deal size' },
    ]
  },
  {
    name: 'Landscaping',
    industry: 'Landscaping',
    base_prompt: `You are a friendly scheduling assistant for {{business_name}}, a professional landscaping company. Your job is to find out what landscaping work the caller needs and whether it's a good fit.\n\nAsk what they are looking to have done, the size of the property, and their timeline. Find out if it's a one-time project or ongoing maintenance.\n\nServices we offer: {{services_offered}}\nServices we do NOT offer: {{services_excluded}}\n\nCollect their name, address, and callback number.`,
    scoring_criteria: 'Score higher for: clear project scope, homeowner, reasonable timeline, larger property or ongoing work. Score lower for: very small one-time job, wrong service type, or renter without owner permission.',
    questions: [
      { id: '1', question: 'What kind of landscaping work are you looking for?', purpose: 'Service type' },
      { id: '2', question: 'Is this a one-time project or are you looking for ongoing service?', purpose: 'Recurring vs project' },
      { id: '3', question: 'How big is the property roughly?', purpose: 'Scope sizing' },
      { id: '4', question: 'When are you hoping to get started?', purpose: 'Timeline' },
    ]
  },
]

export default function NewTemplatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<typeof STARTER_TEMPLATES[0] | null>(null)
  const [form, setForm] = useState({ name: '', industry: '', base_prompt: '', scoring_criteria: '' })

  function pickStarter(t: typeof STARTER_TEMPLATES[0]) {
    setSelected(t)
    setForm({ name: t.name, industry: t.industry, base_prompt: t.base_prompt, scoring_criteria: t.scoring_criteria })
  }

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data, error: err } = await supabase
      .from('templates')
      .insert({ ...form, questions: selected?.questions ?? [] })
      .select()
      .single()
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/admin/templates')
  }

  const inputClass = "bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#2D6FE8]"

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">New Template</h1>
        <p className="text-white/40 text-sm">Start from a preset or write from scratch</p>
      </div>

      {/* Starter presets */}
      <div className="bg-[#111827] border border-white/5 rounded-xl p-5 mb-6">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Start from preset</p>
        <div className="grid grid-cols-3 gap-2">
          {STARTER_TEMPLATES.map(t => (
            <button
              key={t.name}
              type="button"
              onClick={() => pickStarter(t)}
              className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                selected?.name === t.name
                  ? 'bg-[#2D6FE8]/15 border-[#2D6FE8]/40 text-[#2D6FE8]'
                  : 'border-white/10 text-white/60 hover:border-white/20 hover:text-white'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-[#111827] border border-white/5 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Template Name *</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Roofing" className={inputClass} />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Industry *</Label>
              <Input value={form.industry} onChange={e => set('industry', e.target.value)} required placeholder="Roofing" className={inputClass} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-white/60 text-xs">Call Script / Agent Prompt *</Label>
            <Textarea
              value={form.base_prompt}
              onChange={e => set('base_prompt', e.target.value)}
              required
              rows={8}
              placeholder="You are a friendly assistant for {{business_name}}..."
              className={`${inputClass} resize-none font-mono text-xs`}
            />
            <p className="text-white/20 text-xs">Use {'{{business_name}}'}, {'{{services_offered}}'}, {'{{services_excluded}}'} as variables</p>
          </div>
          <div className="space-y-2">
            <Label className="text-white/60 text-xs">Scoring Criteria</Label>
            <Textarea
              value={form.scoring_criteria}
              onChange={e => set('scoring_criteria', e.target.value)}
              rows={3}
              placeholder="Score higher for: ... Score lower for: ..."
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full bg-[#2D6FE8] hover:bg-blue-600 text-white font-semibold h-11">
          {loading ? 'Saving…' : 'Save Template →'}
        </Button>
      </form>
    </div>
  )
}
