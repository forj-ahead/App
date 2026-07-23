'use client'

import { useState } from 'react'
import { Phone, Clock, ChevronDown, ChevronUp, MessageSquare, Star } from 'lucide-react'

function fmt(s: number) {
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

function scoreColor(s: number) {
  if (s >= 8) return 'text-emerald-400'
  if (s >= 6) return 'text-amber-400'
  return 'text-red-400'
}

function CallRow({ call, isAdmin }: { call: any; isAdmin: boolean }) {
  const [open, setOpen] = useState(false)
  const lead = call.leads
  const biz = call.businesses
  const score = lead?.score

  const time = new Date(call.created_at).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })

  return (
    <div className={`rounded-xl border transition-all ${open ? 'border-slate-600 bg-[#111827]' : 'border-slate-700/50 bg-[#111827]/60 hover:border-slate-600 hover:bg-[#111827]'}`}>
      {/* Row */}
      <button onClick={() => setOpen(!open)} className="w-full text-left px-5 py-4 flex items-center gap-4">
        {/* Score or placeholder */}
        {lead ? (
          <div className={`flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl border ${
            score >= 8 ? 'bg-emerald-500/15 border-emerald-500/25' :
            score >= 6 ? 'bg-amber-500/15 border-amber-500/25' :
                         'bg-red-500/15 border-red-500/25'
          }`}>
            <span className={`text-lg font-bold tabular-nums leading-none ${scoreColor(score)}`}>{score}</span>
            <span className={`text-[9px] font-medium opacity-50 ${scoreColor(score)}`}>/10</span>
          </div>
        ) : (
          <div className="flex-shrink-0 w-12 h-12 rounded-xl border border-slate-700/50 bg-slate-800/30 flex items-center justify-center">
            <Phone size={16} className="text-slate-600" />
          </div>
        )}

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white text-sm font-semibold">
              {lead?.caller_name ?? call.caller_number}
            </span>
            {lead?.caller_name && (
              <span className="text-slate-500 text-xs font-mono">{call.caller_number}</span>
            )}
            {isAdmin && biz?.name && (
              <span className="text-slate-600 text-xs">· {biz.name}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {lead?.service_requested ? (
              <p className="text-slate-400 text-xs truncate">{lead.service_requested}</p>
            ) : (
              <p className="text-slate-600 text-xs italic">No lead scored</p>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <Clock size={11} />
            {fmt(call.duration_seconds)}
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
            lead
              ? 'text-blue-300 bg-blue-500/10 border-blue-500/25'
              : 'text-slate-600 bg-slate-800/40 border-slate-700/50'
          }`}>
            {lead ? 'Qualified' : 'Unscored'}
          </span>
          <span className="text-slate-600 text-xs tabular-nums hidden md:block">{time}</span>
          {open ? <ChevronUp size={14} className="text-slate-600" /> : <ChevronDown size={14} className="text-slate-600" />}
        </div>
      </button>

      {/* Expanded */}
      {open && (
        <div className="border-t border-slate-700/50 divide-y divide-slate-700/40">

          {/* Lead summary if scored */}
          {lead?.summary && (
            <div className="px-5 py-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Star size={11} className="text-slate-500" />
                <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">What they needed</p>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">{lead.summary}</p>
              {lead.score_reasoning && (
                <p className="text-slate-500 text-xs leading-relaxed mt-2">{lead.score_reasoning}</p>
              )}
            </div>
          )}

          {/* Transcript */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 mb-2">
              <MessageSquare size={11} className="text-slate-500" />
              <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Transcript</p>
            </div>
            {call.transcript ? (
              <pre className="text-slate-400 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-[#0b1120] border border-slate-700/50 rounded-lg p-3.5 max-h-72 overflow-y-auto">
                {call.transcript}
              </pre>
            ) : (
              <p className="text-slate-600 text-xs">No transcript available for this call</p>
            )}
          </div>

          {/* Actions */}
          <div className="px-5 py-3.5 flex items-center gap-3">
            <a
              href={`tel:${call.caller_number}`}
              className="inline-flex items-center gap-1.5 bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
            >
              <Phone size={11} />
              Call back
            </a>
            <span className="text-slate-500 text-xs font-mono">{call.caller_number}</span>
            {!lead && (
              <span className="text-slate-600 text-xs ml-auto">Call too short or scoring failed</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function CallList({ calls, isAdmin }: { calls: any[]; isAdmin: boolean }) {
  if (!calls.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 border border-slate-700/50 rounded-xl bg-[#111827]/40">
        <div className="w-10 h-10 rounded-full border border-slate-700/50 flex items-center justify-center mb-3">
          <Phone size={16} className="text-slate-700" />
        </div>
        <p className="text-slate-400 text-sm font-medium">No calls yet</p>
        <p className="text-slate-600 text-xs mt-1">Calls appear here after Maya answers your first call</p>
      </div>
    )
  }

  const scored = calls.filter(c => c.leads)
  const unscored = calls.filter(c => !c.leads)

  return (
    <div className="space-y-6">
      {/* Summary strip */}
      <div className="flex items-center gap-6 px-1">
        <div>
          <p className="text-2xl font-bold text-white tabular-nums">{calls.length}</p>
          <p className="text-slate-500 text-xs mt-0.5">Total calls</p>
        </div>
        <div className="w-px h-8 bg-slate-700/50" />
        <div>
          <p className="text-2xl font-bold text-blue-400 tabular-nums">{scored.length}</p>
          <p className="text-slate-500 text-xs mt-0.5">Qualified</p>
        </div>
        <div className="w-px h-8 bg-slate-700/50" />
        <div>
          <p className="text-2xl font-bold text-slate-500 tabular-nums">{unscored.length}</p>
          <p className="text-slate-500 text-xs mt-0.5">Unscored</p>
        </div>
        {scored.length > 0 && (
          <>
            <div className="w-px h-8 bg-slate-700/50" />
            <div>
              <p className="text-2xl font-bold text-emerald-400 tabular-nums">
                {(scored.reduce((s, c) => s + c.leads.score, 0) / scored.length).toFixed(1)}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">Avg score</p>
            </div>
          </>
        )}
      </div>

      {/* Call rows */}
      <div className="space-y-2">
        {calls.map(call => (
          <CallRow key={call.id} call={call} isAdmin={isAdmin} />
        ))}
      </div>
    </div>
  )
}
