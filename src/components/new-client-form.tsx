'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Template { id: string; name: string; industry: string }

export function NewClientForm({ templates }: { templates: Template[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  const [form, setForm] = useState({
    businessName: '',
    industry: '',
    templateId: '',
    alertPhone: '',
    scoreThreshold: '7',
    servicesOffered: '',
    servicesExcluded: '',
    ownerEmail: '',
    ownerPassword: '',
  })

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    if (key === 'templateId') {
      const t = templates.find(t => t.id === value) ?? null
      setSelectedTemplate(t)
      if (t) setForm(f => ({ ...f, industry: t.industry, templateId: value }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    // Create business
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
        sms_alerts_enabled: true,
      })
      .select()
      .single()

    if (bizError) {
      setError(bizError.message)
      setLoading(false)
      return
    }

    router.push(`/admin/clients/${business.id}`)
  }

  const inputClass = "bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#2D6FE8]"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Template picker */}
      <div className="bg-[#111827] border border-white/5 rounded-xl p-6 space-y-4">
        <h2 className="text-white font-semibold text-sm">Start from a template</h2>
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
          {!templates.length && (
            <p className="text-white/30 text-sm col-span-2">No templates yet — <a href="/admin/templates/new" className="text-[#2D6FE8]">create one first</a></p>
          )}
        </div>
      </div>

      {/* Business info */}
      <div className="bg-[#111827] border border-white/5 rounded-xl p-6 space-y-4">
        <h2 className="text-white font-semibold text-sm">Business Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white/60 text-xs">Business Name *</Label>
            <Input value={form.businessName} onChange={e => set('businessName', e.target.value)} required placeholder="Acme Roofing" className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label className="text-white/60 text-xs">Industry *</Label>
            <Input value={form.industry} onChange={e => set('industry', e.target.value)} required placeholder="Roofing" className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white/60 text-xs">Alert Phone (SMS)</Label>
            <Input value={form.alertPhone} onChange={e => set('alertPhone', e.target.value)} placeholder="+17035551234" className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label className="text-white/60 text-xs">Score Threshold (1–10)</Label>
            <Input type="number" min="1" max="10" value={form.scoreThreshold} onChange={e => set('scoreThreshold', e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-white/60 text-xs">Services Offered (comma separated)</Label>
          <Textarea value={form.servicesOffered} onChange={e => set('servicesOffered', e.target.value)} placeholder="Roof repair, New roof installation, Gutters" className={`${inputClass} resize-none`} rows={2} />
        </div>
        <div className="space-y-2">
          <Label className="text-white/60 text-xs">Services Excluded (comma separated)</Label>
          <Textarea value={form.servicesExcluded} onChange={e => set('servicesExcluded', e.target.value)} placeholder="Residential roofing, Flat roofs" className={`${inputClass} resize-none`} rows={2} />
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
      )}

      <Button type="submit" disabled={loading} className="w-full bg-[#2D6FE8] hover:bg-blue-600 text-white font-semibold h-11">
        {loading ? 'Creating…' : 'Create Client →'}
      </Button>
    </form>
  )
}
