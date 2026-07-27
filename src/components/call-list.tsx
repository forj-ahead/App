'use client'

import { useState } from 'react'
import { Phone, Clock, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'

function fmt(s: number) {
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

function CallRow({ call, isAdmin }: { call: any; isAdmin: boolean }) {
  const [open, setOpen] = useState(false)
  const biz = call.businesses

  const time = new Date(call.created_at).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })

  return (
    <div className={`rounded-xl border transition-all ${open ? 'border-slate-600 bg-[#111827]' : 'border-slate-700/50 bg-[#111827]/60 hover:border-slate-600 hover:bg-[#111827]'}`}>
      <button onClick={() => setOpen(!open)} className="w-full text-left px-5 py-4 flex items-center gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl border border-slate-700/50 bg-slate-800/30 flex items-center justify-center">
          <Phone size={14} className="text-slate-500" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white text-sm font-semibold font-mono">{call.caller_number}</span>
            {isAdmin && biz?.name && (
              <span className="text-slate-600 text-xs">· {biz.name}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Clock size={10} />
            <span>{fmt(call.duration_seconds)}</span>
            <span className="text-slate-700">·</span>
            <span>{time}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {call.transcript ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded border text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
              Transcript
            </span>
          ) : (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded border text-slate-600 bg-slate-800/40 border-slate-700/50">
              No transcript
            </span>
          )}
          {open ? <ChevronUp size={14} className="text-slate-600" /> : <ChevronDown size={14} className="text-slate-600" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-700/50">
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 mb-3">
              <MessageSquare size={11} className="text-slate-500" />
              <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Transcript</p>
            </div>
            {call.transcript ? (
              <pre className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-[#0b1120] border border-slate-700/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                {call.transcript}
              </pre>
            ) : (
              <p className="text-slate-600 text-xs">No transcript available for this call</p>
            )}
          </div>

          <div className="px-5 py-3.5 border-t border-slate-700/50 flex items-center gap-3">
            <a
              href={`tel:${call.caller_number}`}
              className="inline-flex items-center gap-1.5 bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
            >
              <Phone size={11} />
              Call back
            </a>
            <span className="text-slate-500 text-xs font-mono">{call.caller_number}</span>
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

  const withTranscript = calls.filter(c => c.transcript)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 px-1">
        <div>
          <p className="text-2xl font-bold text-white tabular-nums">{calls.length}</p>
          <p className="text-slate-500 text-xs mt-0.5">Total calls</p>
        </div>
        <div className="w-px h-8 bg-slate-700/50" />
        <div>
          <p className="text-2xl font-bold text-emerald-400 tabular-nums">{withTranscript.length}</p>
          <p className="text-slate-500 text-xs mt-0.5">With transcript</p>
        </div>
      </div>

      <div className="space-y-2">
        {calls.map(call => (
          <CallRow key={call.id} call={call} isAdmin={isAdmin} />
        ))}
      </div>
    </div>
  )
}
