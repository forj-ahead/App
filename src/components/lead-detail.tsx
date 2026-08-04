'use client'

import { useState, useRef } from 'react'
import { Phone, ArrowLeft, Play, Pause, StickyNote } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Lead } from '@/lib/types'
import Link from 'next/link'

type Status = 'new' | 'contacted' | 'closed' | 'disqualified'

const STATUS_META: Record<Status, { label: string; color: string }> = {
  new:          { label: 'New',          color: 'text-blue-300  bg-blue-500/10  border-blue-500/25' },
  contacted:    { label: 'Contacted',    color: 'text-purple-300 bg-purple-500/10 border-purple-500/25' },
  closed:       { label: 'Closed',       color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25' },
  disqualified: { label: 'Disqualified', color: 'text-slate-500  bg-slate-800/50 border-slate-700/50' },
}

function scoreColor(s: number) {
  if (s >= 5) return { text: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/25' }
  if (s >= 4) return { text: 'text-blue-400',    bg: 'bg-blue-500/15    border-blue-500/25'    }
  if (s >= 3) return { text: 'text-amber-400',   bg: 'bg-amber-500/15   border-amber-500/25'   }
  return          { text: 'text-red-400',         bg: 'bg-red-500/15     border-red-500/25'     }
}

function scoreLabel(s: number) {
  if (s >= 5) return 'Hot lead'
  if (s >= 4) return 'Good lead'
  if (s >= 3) return 'Warm lead'
  return 'Cold lead'
}

export function LeadDetail({ lead: initialLead }: { lead: Lead }) {
  const [lead, setLead] = useState(initialLead)
  const [updating, setUpdating] = useState(false)
  const [notes, setNotes] = useState(initialLead.notes ?? '')
  const [notesSaved, setNotesSaved] = useState(false)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const call = (lead as any).calls
  const { text, bg } = scoreColor(lead.score)

  const time = new Date(lead.created_at).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
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
    if (error) {
      const res = await supabase.from('leads').update({ status: to }).eq('id', lead.id).select().single()
      data = res.data; error = res.error
    }
    if (!error && data) setLead({ ...lead, status: data.status, status_updated_at: now })
    setUpdating(false)
  }

  function handleNotesChange(value: string) {
    setNotes(value)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      const supabase = createClient()
      await supabase.from('leads').update({ notes: value }).eq('id', lead.id)
      setNotesSaved(true)
      setTimeout(() => setNotesSaved(false), 2000)
    }, 1000)
  }

  function togglePlay() {
    const url = call?.recording_url
    if (!url) return
    if (!audioRef.current) {
      audioRef.current = new Audio(url)
      audioRef.current.onended = () => setPlaying(false)
    }
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  const statusMeta = STATUS_META[lead.status as Status] ?? STATUS_META.new

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors"
      >
        <ArrowLeft size={14} />
        Back to leads
      </Link>

      {/* Score + caller */}
      <div className="rounded-xl border border-slate-700/50 bg-[#111827] p-6">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl border ${bg}`}>
            <span className={`text-2xl font-bold tabular-nums leading-none ${text}`}>{lead.score}</span>
            <span className={`text-[10px] font-medium opacity-50 ${text}`}>/5</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-white text-lg font-semibold">{lead.caller_name ?? 'Unknown caller'}</h1>
              <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wide ${statusMeta.color}`}>
                {statusMeta.label}
              </span>
            </div>
            <p className={`text-sm font-medium mb-1 ${text}`}>{scoreLabel(lead.score)}</p>
            <p className="text-slate-500 text-xs font-mono">{lead.caller_number}</p>
            <p className="text-slate-600 text-xs mt-1">{time}</p>
          </div>
        </div>

        {/* What they need */}
        {lead.service_requested && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-1">What they need</p>
            <p className="text-slate-200 text-sm">{lead.service_requested}</p>
          </div>
        )}
      </div>

      {/* Summary */}
      {lead.summary && (
        <div className="rounded-xl border border-slate-700/50 bg-[#111827] p-5">
          <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-2">Summary</p>
          <p className="text-slate-200 text-sm leading-relaxed">{lead.summary}</p>
          {lead.score_reasoning && (
            <p className="text-slate-500 text-xs mt-3 leading-relaxed">{lead.score_reasoning}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="rounded-xl border border-slate-700/50 bg-[#111827] p-5 space-y-4">
        {/* Call back */}
        <div className="flex items-center gap-3 flex-wrap">
          <a
            href={`tel:${lead.caller_number}`}
            onClick={() => lead.status === 'new' && updateStatus('contacted')}
            className="inline-flex items-center gap-1.5 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            <Phone size={13} />
            Call {lead.caller_name ?? 'back'}
          </a>
          {call?.recording_url && (
            <button
              onClick={togglePlay}
              className="inline-flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              {playing ? <Pause size={13} /> : <Play size={13} />}
              {playing ? 'Pause recording' : 'Play recording'}
            </button>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider w-14">Status</span>
          <select
            value={lead.status}
            disabled={updating}
            onChange={e => updateStatus(e.target.value as Status)}
            className="bg-[#0b1120] border border-slate-700/50 text-slate-200 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:border-slate-500 disabled:opacity-50 cursor-pointer"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed / Won</option>
            <option value="disqualified">Disqualified</option>
          </select>
          {updating && <span className="text-slate-600 text-xs">Saving…</span>}
        </div>
      </div>

      {/* Transcript */}
      {call?.transcript && (
        <div className="rounded-xl border border-slate-700/50 bg-[#111827] p-5">
          <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-3">Call transcript</p>
          <pre className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-[#0b1120] border border-slate-700/50 rounded-lg p-4 max-h-96 overflow-y-auto">
            {call.transcript}
          </pre>
        </div>
      )}

      {/* Notes */}
      <div className="rounded-xl border border-slate-700/50 bg-[#111827] p-5">
        <div className="flex items-center justify-between mb-3">
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
          rows={4}
          className="w-full bg-[#0b1120] border border-slate-700/50 rounded-lg px-3.5 py-3 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-slate-500 resize-none leading-relaxed"
        />
      </div>
    </div>
  )
}
