'use client'

import { useState, useMemo, useRef } from 'react'
import { Phone, ChevronDown, ChevronUp, Clock, SlidersHorizontal, Check, PhoneCall, X, RefreshCw, StickyNote, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Lead } from '@/lib/types'

type Status = 'new' | 'contacted' | 'closed' | 'disqualified'

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function waitingUrgency(lead: Lead): { label: string; className: string } | null {
  if (lead.status !== 'new') return null
  const since = lead.status_updated_at ?? lead.created_at
  const hours = (Date.now() - new Date(since).getTime()) / 3600000
  if (hours >= 48) return { label: `Waiting ${timeAgo(since)}`, className: 'text-red-400' }
  if (hours >= 24) return { label: `Waiting ${timeAgo(since)}`, className: 'text-amber-400' }
  if (hours >= 4)  return { label: `Waiting ${timeAgo(since)}`, className: 'text-slate-400' }
  return null
}

function scoreColor(s: number) {
  if (s >= 8) return { text: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/25' }
  if (s >= 6) return { text: 'text-amber-400',   bg: 'bg-amber-500/15  border-amber-500/25'  }
  return          { text: 'text-red-400',         bg: 'bg-red-500/15    border-red-500/25'    }
}

function scoreLabel(s: number) {
  if (s >= 9) return 'Hot'
  if (s >= 7) return 'Warm'
  if (s >= 5) return 'Cool'
  return 'Cold'
}

const STATUS_META: Record<Status, { label: string; color: string }> = {
  new:          { label: 'New',          color: 'text-blue-300  bg-blue-500/10  border-blue-500/25' },
  contacted:    { label: 'Contacted',    color: 'text-purple-300 bg-purple-500/10 border-purple-500/25' },
  closed:       { label: 'Closed',       color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25' },
  disqualified: { label: 'Disqualified', color: 'text-slate-500  bg-slate-800/50 border-slate-700/50' },
}

function StatusPill({ status }: { status: Status }) {
  const { label, color } = STATUS_META[status] ?? STATUS_META.new
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wide ${color}`}>
      {label}
    </span>
  )
}

const STATUS_ACTIONS: { to: Status; label: string; icon: React.ElementType; style: string }[] = [
  { to: 'contacted',    label: 'Mark contacted',    icon: PhoneCall, style: 'bg-purple-500/15 hover:bg-purple-500/25 border-purple-500/30 text-purple-300' },
  { to: 'closed',       label: 'Mark closed',       icon: Check,     style: 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-300' },
  { to: 'disqualified', label: 'Disqualify',        icon: X,         style: 'bg-slate-800/50 hover:bg-slate-700/50 border-slate-600/50 text-slate-400' },
  { to: 'new',          label: 'Reopen',            icon: RefreshCw, style: 'bg-blue-500/15 hover:bg-blue-500/25 border-blue-500/30 text-blue-300' },
]

function LeadRow({ lead: initialLead }: { lead: Lead }) {
  const [open, setOpen] = useState(false)
  const [lead, setLead] = useState(initialLead)
  const [updating, setUpdating] = useState(false)
  const [notes, setNotes] = useState(initialLead.notes ?? '')
  const [notesSaved, setNotesSaved] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { text, bg } = scoreColor(lead.score)
  const call = (lead as any).calls

  const time = new Date(lead.created_at).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })

  async function updateStatus(to: Status) {
    setUpdating(true)
    const supabase = createClient()
    const now = new Date().toISOString()
    let { data, error } = await supabase
      .from('leads')
      .update({ status: to, status_updated_at: now })
      .eq('id', lead.id)
      .select()
      .single()
    // Fallback if status_updated_at column doesn't exist yet
    if (error) {
      const res = await supabase.from('leads').update({ status: to }).eq('id', lead.id).select().single()
      data = res.data; error = res.error
    }
    if (!error && data) setLead({ ...lead, status: data.status, status_updated_at: now })
    setUpdating(false)
  }

  async function saveNotes(value: string) {
    const supabase = createClient()
    await supabase.from('leads').update({ notes: value }).eq('id', lead.id)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2000)
  }

  function handleNotesChange(value: string) {
    setNotes(value)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveNotes(value), 1000)
  }

  // Show actions that aren't the current status
  const availableActions = STATUS_ACTIONS.filter(a => a.to !== lead.status)

  return (
    <div className={`rounded-xl border transition-all ${open ? 'border-slate-600 bg-[#111827]' : 'border-slate-700/50 bg-[#111827]/60 hover:border-slate-600 hover:bg-[#111827]'}`}>
      {/* Row header */}
      <button onClick={() => setOpen(!open)} className="w-full text-left px-5 py-4 flex items-center gap-4">
        <div className={`flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl border ${bg}`}>
          <span className={`text-lg font-bold tabular-nums leading-none ${text}`}>{lead.score}</span>
          <span className={`text-[9px] font-medium opacity-50 ${text}`}>/10</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white text-sm font-semibold">{lead.caller_name ?? 'Unknown caller'}</span>
            <span className="text-slate-500 text-xs font-mono">{lead.caller_number}</span>
          </div>
          <p className="text-slate-400 text-xs truncate">{lead.service_requested ?? 'No service identified'}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusPill status={lead.status as Status} />
          {(() => { const u = waitingUrgency(lead); return u ? <span className={`text-[10px] font-medium hidden sm:block ${u.className}`}>{u.label}</span> : null })()}
          <span className="text-slate-600 text-xs tabular-nums hidden md:block">{time}</span>
          {open ? <ChevronUp size={14} className="text-slate-600" /> : <ChevronDown size={14} className="text-slate-600" />}
        </div>
      </button>

      {/* Expanded */}
      {open && (
        <div className="border-t border-slate-700/50 divide-y divide-slate-700/40">

          {/* Status selector */}
          <div className="px-5 py-3.5 flex items-center gap-3">
            <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Status</span>
            <select
              value={lead.status}
              disabled={updating}
              onChange={e => updateStatus(e.target.value as Status)}
              className="bg-[#0b1120] border border-slate-700/50 text-slate-200 text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-slate-500 disabled:opacity-50 cursor-pointer"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed / Won</option>
              <option value="disqualified">Disqualified</option>
            </select>
            {updating && <span className="text-slate-600 text-xs">Saving…</span>}
          </div>

          {/* Summary */}
          {lead.summary && (
            <div className="px-5 py-4">
              <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-2">What they need</p>
              <p className="text-slate-200 text-sm leading-relaxed">{lead.summary}</p>
            </div>
          )}

          {/* Score reasoning */}
          {lead.score_reasoning && (
            <div className="px-5 py-4">
              <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-2">Score reasoning</p>
              <p className="text-slate-400 text-sm leading-relaxed">{lead.score_reasoning}</p>
            </div>
          )}

          {/* Notes */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <StickyNote size={11} className="text-slate-500" />
                <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Notes</p>
              </div>
              {notesSaved && <span className="text-emerald-400 text-[10px]">Saved</span>}
            </div>
            <textarea
              value={notes}
              onChange={e => handleNotesChange(e.target.value)}
              placeholder="Add notes about this lead…"
              rows={3}
              className="w-full bg-[#0b1120] border border-slate-700/50 rounded-lg px-3.5 py-3 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-slate-500 resize-none leading-relaxed"
            />
          </div>

          {/* Transcript */}
          {call && (
            <div className="px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Transcript</p>
                {call.duration_seconds && (
                  <span className="flex items-center gap-1 text-slate-600 text-xs">
                    <Clock size={10} />
                    {call.duration_seconds < 60 ? `${call.duration_seconds}s` : `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s`}
                  </span>
                )}
              </div>
              {call.transcript ? (
                <pre className="text-slate-400 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-[#0b1120] border border-slate-700/50 rounded-lg p-3.5 max-h-56 overflow-y-auto">
                  {call.transcript}
                </pre>
              ) : (
                <p className="text-slate-600 text-xs">No transcript available</p>
              )}
            </div>
          )}

          {/* Call back */}
          <div className="px-5 py-3.5 flex items-center gap-3">
            <a
              href={`tel:${lead.caller_number}`}
              onClick={() => lead.status === 'new' && updateStatus('contacted')}
              className="inline-flex items-center gap-1.5 bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
            >
              <Phone size={11} />
              Call {lead.caller_name ?? 'back'}
            </a>
            <span className="text-slate-500 text-xs font-mono">{lead.caller_number}</span>
            {lead.status === 'new' && (
              <span className="text-slate-600 text-[10px]">· Tapping call will auto-mark as contacted</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const SCORE_FILTERS = [
  { label: 'All', min: 0 },
  { label: '6+', min: 6 },
  { label: '7+', min: 7 },
  { label: '8+', min: 8 },
  { label: '9–10', min: 9 },
]

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Closed', value: 'closed' },
  { label: 'Disqualified', value: 'disqualified' },
]

function FilterGroup({ options, value, onChange }: {
  options: { label: string; value?: string; min?: number }[]
  value: string | number
  onChange: (v: any) => void
}) {
  return (
    <div className="flex items-center gap-0.5 bg-[#0b1120] border border-slate-700/50 rounded-lg p-1">
      {options.map(opt => {
        const v = opt.value ?? opt.min
        const active = value === v
        return (
          <button
            key={String(v)}
            onClick={() => onChange(v)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              active
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function exportCSV(leads: Lead[]) {
  const rows = [
    ['Name', 'Phone', 'Score', 'Status', 'Service Requested', 'Summary', 'Notes', 'Date'],
    ...leads.map(l => [
      l.caller_name ?? '',
      l.caller_number,
      String(l.score),
      l.status,
      l.service_requested ?? '',
      l.summary ?? '',
      l.notes ?? '',
      new Date(l.created_at).toLocaleString(),
    ]),
  ]
  const csv = rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `forj-leads-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function LeadFeed({ leads }: { leads: Lead[] }) {
  const [minScore, setMinScore] = useState(0)
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState<'score' | 'date'>('score')

  const filtered = useMemo(() => {
    let out = leads.filter(l => l.score >= minScore)
    if (status !== 'all') out = out.filter(l => l.status === status)
    return [...out].sort((a, b) =>
      sort === 'score'
        ? b.score - a.score
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [leads, minScore, status, sort])

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col gap-2 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
            <SlidersHorizontal size={12} /> Score
          </span>
          <FilterGroup options={SCORE_FILTERS.map(f => ({ label: f.label, min: f.min }))} value={minScore} onChange={setMinScore} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5 w-[42px]">Status</span>
          <FilterGroup options={STATUS_FILTERS.map(f => ({ label: f.label, value: f.value }))} value={status} onChange={setStatus} />
          <div className="ml-auto flex items-center gap-2">
            <FilterGroup
              options={[{ label: 'Score', value: 'score' }, { label: 'Date', value: 'date' }]}
              value={sort}
              onChange={setSort}
            />
            <button
              onClick={() => exportCSV(filtered)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-700/50 bg-[#111827] text-slate-400 hover:text-slate-200 hover:border-slate-600 text-xs font-medium transition-colors"
              title="Export to CSV"
            >
              <Download size={11} />
            </button>
          </div>
        </div>
      </div>

      <p className="text-slate-600 text-xs mb-3">
        {filtered.length} of {leads.length} lead{leads.length !== 1 ? 's' : ''}
        {(minScore > 0 || status !== 'all') && (
          <button onClick={() => { setMinScore(0); setStatus('all') }} className="ml-2 text-blue-400 hover:text-blue-300 transition-colors">
            Clear filters
          </button>
        )}
      </p>

      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-slate-700/50 rounded-xl bg-[#111827]/40">
          <div className="w-10 h-10 rounded-full border border-slate-700/50 flex items-center justify-center mb-3">
            <Phone size={16} className="text-slate-700" />
          </div>
          <p className="text-slate-400 text-sm font-medium">No leads yet</p>
          <p className="text-slate-600 text-xs mt-1">Leads appear here after Maya qualifies a call</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-slate-700/50 rounded-xl bg-[#111827]/40">
          <p className="text-slate-400 text-sm font-medium">No leads match these filters</p>
          <button onClick={() => { setMinScore(0); setStatus('all') }} className="text-blue-400 text-xs mt-2 hover:text-blue-300 transition-colors">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(lead => <LeadRow key={lead.id} lead={lead} />)}
        </div>
      )}
    </div>
  )
}
