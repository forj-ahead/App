'use client'

import { useState } from 'react'
import { Phone, Clock, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
import type { Lead } from '@/lib/types'

function ScoreBadge({ score }: { score: number }) {
  const [bg, text] =
    score >= 8 ? ['bg-green-500/12 border-green-500/25', 'text-green-400'] :
    score >= 6 ? ['bg-amber-500/12 border-amber-500/25', 'text-amber-400'] :
                 ['bg-red-500/12 border-red-500/25', 'text-red-400']

  return (
    <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border flex-shrink-0 ${bg}`}>
      <span className={`text-lg font-black tabular-nums leading-none ${text}`}>{score}</span>
      <span className={`text-[9px] font-semibold ${text} opacity-60`}>/10</span>
    </div>
  )
}

function StatusChip({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    contacted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    closed: 'bg-green-500/10 text-green-400 border-green-500/20',
    disqualified: 'bg-white/5 text-white/25 border-white/10',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border ${styles[status] ?? ''}`}>
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
    <div className={`bg-[#0D1525] border rounded-xl overflow-hidden transition-all ${open ? 'border-white/10' : 'border-white/[0.06] hover:border-white/10'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-5 py-4 flex items-center gap-4"
      >
        <ScoreBadge score={lead.score} />

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-white font-semibold text-sm">
              {lead.caller_name ?? 'Unknown caller'}
            </span>
            <span className="text-white/25 text-xs font-mono">{lead.caller_number}</span>
          </div>
          <p className="text-white/40 text-xs truncate leading-relaxed">
            {lead.service_requested ?? 'Service not identified'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <StatusChip status={lead.status} />
          <span className="text-white/20 text-xs hidden sm:block">{time}</span>
          {open
            ? <ChevronUp size={13} className="text-white/20" />
            : <ChevronDown size={13} className="text-white/20" />
          }
        </div>
      </button>

      {open && (
        <div className="border-t border-white/[0.06] px-5 py-5 space-y-5">
          {lead.summary && (
            <div>
              <p className="text-white/25 text-[10px] font-semibold uppercase tracking-wider mb-2">Summary</p>
              <p className="text-white/70 text-sm leading-relaxed">{lead.summary}</p>
            </div>
          )}
          {lead.score_reasoning && (
            <div>
              <p className="text-white/25 text-[10px] font-semibold uppercase tracking-wider mb-2">Score Reasoning</p>
              <p className="text-white/50 text-sm leading-relaxed">{lead.score_reasoning}</p>
            </div>
          )}
          {(lead as any).calls?.transcript && (
            <div>
              <p className="text-white/25 text-[10px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MessageSquare size={10} />
                Transcript
              </p>
              <pre className="text-white/40 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-black/20 rounded-lg p-4 max-h-52 overflow-y-auto border border-white/[0.06]">
                {(lead as any).calls.transcript}
              </pre>
            </div>
          )}
          <div className="flex items-center gap-2 pt-1">
            <a
              href={`tel:${lead.caller_number}`}
              className="flex items-center gap-1.5 bg-[#2D6FE8] hover:bg-[#4D8BF0] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
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
      <div className="text-center py-24 border border-white/[0.06] rounded-xl bg-[#0D1525]">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
          <Phone size={20} className="text-white/20" />
        </div>
        <p className="text-white/40 font-medium text-sm mb-1">No leads yet</p>
        <p className="text-white/20 text-xs">Leads will appear here after your first qualified call</p>
      </div>
    )
  }

  const sorted = [...leads].sort((a, b) => b.score - a.score)

  return (
    <div className="space-y-2">
      {sorted.map(lead => (
        <LeadRow key={lead.id} lead={lead} />
      ))}
    </div>
  )
}
