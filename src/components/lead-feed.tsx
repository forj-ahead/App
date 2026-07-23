'use client'

import { useState } from 'react'
import { Phone, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import type { Lead } from '@/lib/types'

function scoreColor(s: number) {
  if (s >= 8) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' }
  if (s >= 6) return { text: 'text-amber-400',   bg: 'bg-amber-500/10  border-amber-500/20'  }
  return          { text: 'text-red-400',         bg: 'bg-red-500/10    border-red-500/20'    }
}

function scoreLabel(s: number) {
  if (s >= 8) return 'Hot lead'
  if (s >= 6) return 'Warm lead'
  if (s >= 4) return 'Cool lead'
  return 'Not qualified'
}

function LeadRow({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false)
  const { text, bg } = scoreColor(lead.score)
  const call = (lead as any).calls

  const time = new Date(lead.created_at).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })

  return (
    <div className={`rounded-lg border transition-colors ${open ? 'border-zinc-700 bg-zinc-900/60' : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'}`}>
      {/* Row — always visible */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-3.5 flex items-center gap-4"
      >
        {/* Score */}
        <div className={`flex-shrink-0 flex flex-col items-center justify-center w-11 h-11 rounded-lg border ${bg}`}>
          <span className={`text-base font-bold tabular-nums leading-none ${text}`}>{lead.score}</span>
          <span className={`text-[9px] font-medium opacity-50 ${text}`}>/10</span>
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-white text-sm font-medium">{lead.caller_name ?? 'Unknown caller'}</span>
            <span className="text-zinc-700 text-xs font-mono">{lead.caller_number}</span>
          </div>
          <p className="text-zinc-400 text-xs truncate">{lead.service_requested ?? 'No service identified'}</p>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`text-[10px] font-medium ${text}`}>{scoreLabel(lead.score)}</span>
          <span className="text-zinc-700 text-xs tabular-nums">{time}</span>
          {open
            ? <ChevronUp size={13} className="text-zinc-700" />
            : <ChevronDown size={13} className="text-zinc-700" />
          }
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-zinc-800 divide-y divide-white/[0.04]">
          {/* Summary */}
          {lead.summary && (
            <div className="px-4 py-4">
              <p className="text-zinc-600 text-[10px] font-semibold uppercase tracking-wider mb-2">What they need</p>
              <p className="text-zinc-200 text-sm leading-relaxed">{lead.summary}</p>
            </div>
          )}

          {/* Score reasoning */}
          {lead.score_reasoning && (
            <div className="px-4 py-4">
              <p className="text-zinc-600 text-[10px] font-semibold uppercase tracking-wider mb-2">Why this score</p>
              <p className="text-zinc-400 text-sm leading-relaxed">{lead.score_reasoning}</p>
            </div>
          )}

          {/* Call details */}
          {call && (
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-zinc-600 text-[10px] font-semibold uppercase tracking-wider">Call transcript</p>
                {call.duration_seconds && (
                  <span className="flex items-center gap-1 text-zinc-700 text-xs">
                    <Clock size={10} />
                    {call.duration_seconds < 60
                      ? `${call.duration_seconds}s`
                      : `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s`
                    }
                  </span>
                )}
              </div>
              {call.transcript ? (
                <pre className="text-zinc-500 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-white/[0.02] border border-zinc-800 rounded-md p-3 max-h-56 overflow-y-auto">
                  {call.transcript}
                </pre>
              ) : (
                <p className="text-zinc-700 text-xs">No transcript available</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="px-4 py-3 flex items-center gap-2">
            <a
              href={`tel:${lead.caller_number}`}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-zinc-100 text-black text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
            >
              <Phone size={11} />
              Call {lead.caller_name ?? 'back'}
            </a>
            <span className="text-zinc-700 text-xs">{lead.caller_number}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function LeadFeed({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-zinc-800 rounded-lg">
        <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center mb-3">
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
