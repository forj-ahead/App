'use client'

import { useState } from 'react'
import { Phone, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Lead } from '@/lib/types'

interface LeadFeedProps {
  leads: Lead[]
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8 ? 'bg-green-500/15 text-green-400 border-green-500/20' :
    score >= 6 ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' :
                 'bg-red-500/15 text-red-400 border-red-500/20'

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border tabular-nums ${color}`}>
      {score}/10
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    contacted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    closed: 'bg-green-500/10 text-green-400 border-green-500/20',
    disqualified: 'bg-white/5 text-white/30 border-white/10',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${styles[status] ?? ''}`}>
      {status}
    </span>
  )
}

function LeadRow({ lead }: { lead: Lead }) {
  const [expanded, setExpanded] = useState(false)

  const formattedTime = new Date(lead.created_at).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })

  return (
    <div className="bg-[#111827] border border-white/5 rounded-xl overflow-hidden transition-colors hover:border-white/10">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-center gap-4"
      >
        <ScoreBadge score={lead.score} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-white font-semibold text-sm">
              {lead.caller_name ?? lead.caller_number}
            </span>
            {lead.caller_name && (
              <span className="text-white/30 text-xs font-mono">{lead.caller_number}</span>
            )}
          </div>
          <p className="text-white/50 text-xs truncate">
            {lead.service_requested ?? 'Service request'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <StatusBadge status={lead.status} />
          <div className="flex items-center gap-1 text-white/25 text-xs">
            <Clock size={11} />
            {formattedTime}
          </div>
          {expanded ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/5 px-5 py-4 space-y-4">
          {lead.summary && (
            <div>
              <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-1.5">Summary</p>
              <p className="text-white/80 text-sm leading-relaxed">{lead.summary}</p>
            </div>
          )}
          {lead.score_reasoning && (
            <div>
              <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-1.5">Why this score</p>
              <p className="text-white/60 text-sm leading-relaxed">{lead.score_reasoning}</p>
            </div>
          )}
          {lead.calls?.transcript && (
            <div>
              <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-1.5">Transcript</p>
              <pre className="text-white/50 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-white/3 rounded-lg p-3 max-h-48 overflow-y-auto border border-white/5">
                {lead.calls.transcript}
              </pre>
            </div>
          )}
          <div className="flex items-center gap-2 pt-1">
            <a
              href={`tel:${lead.caller_number}`}
              className="flex items-center gap-1.5 bg-[#2D6FE8] hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Phone size={12} />
              Call back
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export function LeadFeed({ leads }: LeadFeedProps) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">📞</div>
        <p className="text-white/40 font-medium mb-1">No leads yet</p>
        <p className="text-white/25 text-sm">Leads will appear here after your first qualified call</p>
      </div>
    )
  }

  const sorted = [...leads].sort((a, b) => b.score - a.score)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white/60 text-sm font-medium">{leads.length} lead{leads.length !== 1 ? 's' : ''} · sorted by score</h2>
      </div>
      {sorted.map(lead => (
        <LeadRow key={lead.id} lead={lead} />
      ))}
    </div>
  )
}
