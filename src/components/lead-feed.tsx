'use client'

import { useState } from 'react'
import { Phone, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import type { Lead } from '@/lib/types'

function ScorePill({ score }: { score: number }) {
  const [color, bg] =
    score >= 8 ? ['text-emerald-400', 'bg-emerald-500/10 border-emerald-500/20'] :
    score >= 6 ? ['text-amber-400',   'bg-amber-500/10  border-amber-500/20'] :
                 ['text-red-400',     'bg-red-500/10    border-red-500/20']
  return (
    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded border text-xs font-semibold tabular-nums ${color} ${bg}`}>
      {score}<span className="opacity-50 font-normal">/10</span>
    </span>
  )
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new:          'text-blue-400  bg-blue-500/8   border-blue-500/15',
    contacted:    'text-purple-400 bg-purple-500/8 border-purple-500/15',
    closed:       'text-emerald-400 bg-emerald-500/8 border-emerald-500/15',
    disqualified: 'text-zinc-600  bg-white/3      border-white/8',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-medium uppercase tracking-wide ${styles[status] ?? ''}`}>
      {status}
    </span>
  )
}

function LeadRow({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false)
  const time = new Date(lead.created_at).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })

  return (
    <div className={`rounded-lg border transition-colors ${open ? 'border-white/10 bg-white/[0.02]' : 'border-white/[0.06] bg-white/[0.015] hover:border-white/10'}`}>
      <button onClick={() => setOpen(!open)} className="w-full text-left px-4 py-3.5 flex items-center gap-3">
        <ScorePill score={lead.score} />

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-white text-sm font-medium">{lead.caller_name ?? 'Unknown'}</span>
            <span className="text-zinc-600 text-xs font-mono">{lead.caller_number}</span>
          </div>
          <p className="text-zinc-500 text-xs mt-0.5 truncate">{lead.service_requested ?? '—'}</p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <StatusPill status={lead.status} />
          <span className="text-zinc-700 text-xs tabular-nums hidden sm:block">{time}</span>
          {open ? <ChevronUp size={13} className="text-zinc-700" /> : <ChevronDown size={13} className="text-zinc-700" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-white/[0.06] px-4 py-4 space-y-4">
          {lead.summary && (
            <div>
              <p className="text-zinc-700 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Summary</p>
              <p className="text-zinc-300 text-sm leading-relaxed">{lead.summary}</p>
            </div>
          )}
          {lead.score_reasoning && (
            <div>
              <p className="text-zinc-700 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Score reasoning</p>
              <p className="text-zinc-500 text-sm leading-relaxed">{lead.score_reasoning}</p>
            </div>
          )}
          {(lead as any).calls?.transcript && (
            <div>
              <p className="text-zinc-700 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Transcript</p>
              <pre className="text-zinc-500 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-white/[0.02] rounded-md p-3 max-h-48 overflow-y-auto border border-white/[0.06]">
                {(lead as any).calls.transcript}
              </pre>
            </div>
          )}
          <div className="pt-1">
            <a
              href={`tel:${lead.caller_number}`}
              className="inline-flex items-center gap-1.5 bg-white text-black text-xs font-semibold px-3.5 py-2 rounded-md hover:bg-zinc-100 transition-colors"
            >
              <Phone size={11} />
              Call back
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export function LeadFeed({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 border border-white/[0.06] rounded-lg bg-white/[0.01]">
        <div className="w-10 h-10 rounded-full border border-white/[0.06] flex items-center justify-center mb-4">
          <Phone size={16} className="text-zinc-700" />
        </div>
        <p className="text-zinc-500 text-sm font-medium">No leads yet</p>
        <p className="text-zinc-700 text-xs mt-1">Leads appear here after Maya qualifies a call</p>
      </div>
    )
  }

  const sorted = [...leads].sort((a, b) => b.score - a.score)

  return (
    <div className="space-y-1.5">
      {sorted.map(lead => <LeadRow key={lead.id} lead={lead} />)}
    </div>
  )
}
