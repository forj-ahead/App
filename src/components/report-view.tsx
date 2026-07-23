'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Download, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Lead {
  id: string
  score: number
  status: string
  created_at: string
  status_updated_at: string | null
  caller_number: string
}

interface Call {
  id: string
  created_at: string
  duration_seconds: number
}

const PERIOD_LABELS: Record<string, string> = {
  this_month: 'This month',
  last_month: 'Last month',
  last_30: 'Last 30 days',
  all_time: 'All time',
}

function delta(current: number, prev: number) {
  if (prev === 0) return null
  const pct = Math.round(((current - prev) / prev) * 100)
  if (pct > 0) return { label: `+${pct}% vs prior period`, positive: true }
  if (pct < 0) return { label: `${pct}% vs prior period`, positive: false }
  return { label: 'Same as prior period', positive: null }
}

function StatCard({ label, value, sub, highlight = false }: { label: string; value: string | number; sub?: { label: string; positive: boolean | null } | null; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${highlight ? 'bg-blue-500/10 border-blue-500/25' : 'bg-[#111827] border-slate-700/50'}`}>
      <p className="text-slate-500 text-xs font-medium mb-2">{label}</p>
      <p className={`text-3xl font-bold tabular-nums ${highlight ? 'text-blue-300' : 'text-white'}`}>{value}</p>
      {sub && (
        <div className={`flex items-center gap-1 mt-2 text-[11px] font-medium ${
          sub.positive === true ? 'text-emerald-400' :
          sub.positive === false ? 'text-red-400' : 'text-slate-500'
        }`}>
          {sub.positive === true ? <TrendingUp size={11} /> : sub.positive === false ? <TrendingDown size={11} /> : <Minus size={11} />}
          {sub.label}
        </div>
      )}
    </div>
  )
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(pct, 2)}%` }} />
    </div>
  )
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ReportView({ leads, calls, period, prevLeadCount, businessName }: {
  leads: Lead[]
  calls: Call[]
  period: string
  prevLeadCount: number
  businessName: string
}) {
  const router = useRouter()

  // ── Core stats ──────────────────────────────────────────────
  const totalCalls = calls.length
  const totalLeads = leads.length
  const qualRate = totalCalls > 0 ? Math.round((totalLeads / totalCalls) * 100) : 0
  const avgScore = totalLeads > 0
    ? (leads.reduce((s, l) => s + l.score, 0) / totalLeads).toFixed(1)
    : '—'

  // ── Score breakdown ──────────────────────────────────────────
  const hot   = leads.filter(l => l.score >= 9).length
  const warm  = leads.filter(l => l.score >= 7 && l.score < 9).length
  const cool  = leads.filter(l => l.score >= 5 && l.score < 7).length
  const cold  = leads.filter(l => l.score < 5).length

  // ── Status funnel ────────────────────────────────────────────
  const byStatus = {
    new:          leads.filter(l => l.status === 'new').length,
    contacted:    leads.filter(l => l.status === 'contacted').length,
    closed:       leads.filter(l => l.status === 'closed').length,
    disqualified: leads.filter(l => l.status === 'disqualified').length,
  }
  const closeRate = totalLeads > 0 ? Math.round((byStatus.closed / totalLeads) * 100) : 0

  // ── Response time ────────────────────────────────────────────
  const contactedLeads = leads.filter(l => l.status !== 'new' && l.status_updated_at)
  const avgResponseHours = contactedLeads.length > 0
    ? contactedLeads.reduce((sum, l) => {
        const diff = new Date(l.status_updated_at!).getTime() - new Date(l.created_at).getTime()
        return sum + diff / 3600000
      }, 0) / contactedLeads.length
    : null

  const contactedWithin24 = contactedLeads.filter(l => {
    const diff = new Date(l.status_updated_at!).getTime() - new Date(l.created_at).getTime()
    return diff < 86400000
  }).length
  const within24Rate = totalLeads > 0 ? Math.round((contactedWithin24 / totalLeads) * 100) : 0

  const stillWaiting = byStatus.new

  // ── Calls by day of week ─────────────────────────────────────
  const byDay = Array(7).fill(0)
  calls.forEach(c => byDay[new Date(c.created_at).getDay()]++)
  const maxDay = Math.max(...byDay, 1)

  // ── Deltas ───────────────────────────────────────────────────
  const leadDelta = delta(totalLeads, prevLeadCount)

  const reportDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 print:mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <img src="/logo-icon.png" alt="Forj" className="w-6 h-6 rounded print:hidden" />
            <span className="text-slate-500 text-xs font-medium print:text-black">Forj — Performance Report</span>
          </div>
          <h1 className="text-xl font-bold text-white print:text-black">{businessName}</h1>
          <p className="text-slate-500 text-sm mt-0.5 print:text-gray-600">Generated {reportDate}</p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          {/* Period selector */}
          <div className="flex items-center gap-0.5 bg-[#0b1120] border border-slate-700/50 rounded-lg p-1">
            {Object.entries(PERIOD_LABELS).map(([val, label]) => (
              <button
                key={val}
                onClick={() => router.push(`/dashboard/reports?period=${val}`)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  period === val
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/50 bg-[#111827] text-slate-300 hover:text-white hover:border-slate-600 text-xs font-medium transition-colors"
          >
            <Download size={12} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Calls Answered" value={totalCalls} />
        <StatCard label="Leads Generated" value={totalLeads} highlight sub={leadDelta} />
        <StatCard label="Qualification Rate" value={`${qualRate}%`} />
        <StatCard label="Avg Lead Score" value={avgScore} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {/* Score breakdown */}
        <div className="rounded-xl border border-slate-700/50 bg-[#111827] p-5">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Lead Quality Breakdown</p>
          <div className="space-y-3">
            {[
              { label: 'Hot (9–10)', count: hot,  color: 'bg-emerald-500' },
              { label: 'Warm (7–8)', count: warm, color: 'bg-blue-500' },
              { label: 'Cool (5–6)', count: cool, color: 'bg-amber-500' },
              { label: 'Cold (1–4)', count: cold, color: 'bg-slate-600' },
            ].map(({ label, count, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 text-xs">{label}</span>
                  <span className="text-white text-xs font-semibold tabular-nums">{count}</span>
                </div>
                <Bar pct={totalLeads > 0 ? (count / totalLeads) * 100 : 0} color={color} />
              </div>
            ))}
          </div>
        </div>

        {/* Status funnel */}
        <div className="rounded-xl border border-slate-700/50 bg-[#111827] p-5">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Lead Pipeline</p>
          <div className="space-y-3">
            {[
              { label: 'New (awaiting contact)', count: byStatus.new,          color: 'bg-blue-500' },
              { label: 'Contacted',              count: byStatus.contacted,    color: 'bg-purple-500' },
              { label: 'Closed / Won',           count: byStatus.closed,       color: 'bg-emerald-500' },
              { label: 'Disqualified',           count: byStatus.disqualified, color: 'bg-slate-600' },
            ].map(({ label, count, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 text-xs">{label}</span>
                  <span className="text-white text-xs font-semibold tabular-nums">{count}</span>
                </div>
                <Bar pct={totalLeads > 0 ? (count / totalLeads) * 100 : 0} color={color} />
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
            <span className="text-slate-500 text-xs">Close rate</span>
            <span className="text-emerald-400 text-sm font-bold">{closeRate}%</span>
          </div>
        </div>
      </div>

      {/* Response performance */}
      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl border border-slate-700/50 bg-[#111827] p-5">
          <p className="text-slate-500 text-xs font-medium mb-2">Avg Response Time</p>
          <p className="text-2xl font-bold text-white">
            {avgResponseHours !== null
              ? avgResponseHours < 1
                ? `${Math.round(avgResponseHours * 60)}m`
                : `${avgResponseHours.toFixed(1)}h`
              : '—'}
          </p>
          <p className="text-slate-600 text-xs mt-1">From call to first contact</p>
        </div>
        <div className="rounded-xl border border-slate-700/50 bg-[#111827] p-5">
          <p className="text-slate-500 text-xs font-medium mb-2">Contacted Within 24h</p>
          <p className={`text-2xl font-bold ${within24Rate >= 80 ? 'text-emerald-400' : within24Rate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
            {totalLeads > 0 ? `${within24Rate}%` : '—'}
          </p>
          <p className="text-slate-600 text-xs mt-1">Of all qualified leads</p>
        </div>
        <div className={`rounded-xl border p-5 ${stillWaiting > 0 ? 'bg-red-500/8 border-red-500/20' : 'bg-[#111827] border-slate-700/50'}`}>
          <p className="text-slate-500 text-xs font-medium mb-2">Still Waiting</p>
          <p className={`text-2xl font-bold ${stillWaiting > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{stillWaiting}</p>
          <p className="text-slate-600 text-xs mt-1">{stillWaiting === 0 ? 'All leads contacted' : 'Leads need a call back'}</p>
        </div>
      </div>

      {/* Calls by day of week */}
      <div className="rounded-xl border border-slate-700/50 bg-[#111827] p-5">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Calls by Day of Week</p>
        <div className="flex items-end gap-2 h-20">
          {byDay.map((count, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-slate-500 text-[10px] tabular-nums">{count > 0 ? count : ''}</span>
              <div
                className="w-full rounded-sm bg-blue-500/70"
                style={{ height: `${Math.round((count / maxDay) * 56) + 4}px`, minHeight: '4px' }}
              />
              <span className="text-slate-600 text-[10px]">{DAY_NAMES[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:text-black { color: black !important; }
          .print\\:text-gray-600 { color: #4b5563 !important; }
          [class*="bg-[#"] { background-color: #f9fafb !important; }
          [class*="border-slate"] { border-color: #e5e7eb !important; }
          [class*="text-white"] { color: #111827 !important; }
          [class*="text-slate-4"] { color: #374151 !important; }
          [class*="text-slate-5"] { color: #6b7280 !important; }
          [class*="text-slate-6"] { color: #9ca3af !important; }
        }
      `}</style>
    </div>
  )
}
