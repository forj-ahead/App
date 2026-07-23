import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Star, Clock, CheckCircle2, XCircle, PhoneCall } from 'lucide-react'

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8 ? 'bg-green-500/15 text-green-400 border-green-500/20' :
    score >= 6 ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' :
                 'bg-red-500/15 text-red-400 border-red-500/20'
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border tabular-nums ${color}`}>
      {score}/10
    </span>
  )
}

function StatusDot({ value }: { value: boolean | null }) {
  if (value === null) return <span className="w-2 h-2 rounded-full bg-white/20 inline-block" />
  return <span className={`w-2 h-2 rounded-full inline-block ${value ? 'bg-green-400' : 'bg-amber-400'}`} />
}

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!business) notFound()

  const { data: leads } = await supabase
    .from('leads')
    .select('*, calls(*)')
    .eq('business_id', params.id)
    .order('created_at', { ascending: false })

  const { data: calls } = await supabase
    .from('calls')
    .select('*')
    .eq('business_id', params.id)
    .order('created_at', { ascending: false })

  const avgScore = leads?.length
    ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length * 10) / 10
    : null

  const stats = [
    { label: 'Total Calls', value: calls?.length ?? 0 },
    { label: 'Qualified Leads', value: leads?.length ?? 0 },
    { label: 'Avg Score', value: avgScore !== null ? `${avgScore}/10` : '—' },
    { label: 'Score Threshold', value: `${business.score_threshold}/10` },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back + header */}
      <div className="mb-6">
        <Link href="/admin/clients" className="flex items-center gap-1.5 text-white/30 hover:text-white text-sm mb-4 transition-colors w-fit">
          <ArrowLeft size={14} />
          All Clients
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#1A2340] flex items-center justify-center">
              <span className="text-white font-black text-lg">{business.name[0]}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{business.name}</h1>
              <p className="text-white/40 text-sm">{business.industry}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <StatusDot value={!!business.retell_agent_id} />
            <span className="text-white/40">{business.retell_agent_id ? 'Agent active' : 'No agent'}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-[#111827] border border-white/5 rounded-xl p-4">
            <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-1.5">{label}</p>
            <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* Config */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#111827] border border-white/5 rounded-xl p-5">
          <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Configuration</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-white/40">Phone Number</span>
              <span className="text-white font-mono text-xs">{business.twilio_number ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Alert Phone</span>
              <span className="text-white font-mono text-xs">{business.alert_phone ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">SMS Alerts</span>
              <span className={business.sms_alerts_enabled ? 'text-green-400' : 'text-white/30'}>{business.sms_alerts_enabled ? 'On' : 'Off'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Retell Agent ID</span>
              <span className="text-white/50 font-mono text-xs truncate max-w-32">{business.retell_agent_id ?? '—'}</span>
            </div>
          </div>
        </div>
        <div className="bg-[#111827] border border-white/5 rounded-xl p-5">
          <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Services</h3>
          <div className="mb-3">
            <p className="text-white/25 text-xs mb-2">Offered</p>
            <div className="flex flex-wrap gap-1.5">
              {business.services_offered?.length ? business.services_offered.map((s: string) => (
                <span key={s} className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs px-2.5 py-1 rounded-full">{s}</span>
              )) : <span className="text-white/20 text-xs">None</span>}
            </div>
          </div>
          <div>
            <p className="text-white/25 text-xs mb-2">Excluded</p>
            <div className="flex flex-wrap gap-1.5">
              {business.services_excluded?.length ? business.services_excluded.map((s: string) => (
                <span key={s} className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs px-2.5 py-1 rounded-full">{s}</span>
              )) : <span className="text-white/20 text-xs">None</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Leads */}
      <div className="mb-6">
        <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Star size={15} className="text-[#2D6FE8]" />
          Qualified Leads <span className="text-white/30 font-normal text-sm ml-1">({leads?.length ?? 0})</span>
        </h2>
        {!leads?.length ? (
          <div className="bg-[#111827] border border-white/5 rounded-xl px-5 py-10 text-center">
            <p className="text-white/30 text-sm">No leads yet — leads appear after scored calls</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leads.map(lead => (
              <div key={lead.id} className="bg-[#111827] border border-white/5 rounded-xl px-5 py-4">
                <div className="flex items-center gap-4">
                  <ScoreBadge score={lead.score} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{lead.caller_name ?? lead.caller_number}</p>
                    <p className="text-white/40 text-xs mt-0.5">{lead.service_requested}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white/25 text-xs">
                      {new Date(lead.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                    <p className="text-white/40 text-xs font-mono mt-0.5">{lead.caller_number}</p>
                  </div>
                </div>
                {lead.summary && (
                  <p className="text-white/40 text-xs mt-3 leading-relaxed border-t border-white/5 pt-3">{lead.summary}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calls */}
      <div>
        <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
          <PhoneCall size={15} className="text-[#2D6FE8]" />
          All Calls <span className="text-white/30 font-normal text-sm ml-1">({calls?.length ?? 0})</span>
        </h2>
        {!calls?.length ? (
          <div className="bg-[#111827] border border-white/5 rounded-xl px-5 py-10 text-center">
            <p className="text-white/30 text-sm">No calls yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {calls.map(call => (
              <div key={call.id} className="bg-[#111827] border border-white/5 rounded-xl px-5 py-3 flex items-center gap-4">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${call.status === 'completed' ? 'bg-green-400' : 'bg-red-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-mono">{call.caller_number}</p>
                </div>
                <div className="flex items-center gap-1 text-white/30 text-xs flex-shrink-0">
                  <Clock size={11} />
                  {call.duration_seconds}s
                </div>
                <p className="text-white/25 text-xs flex-shrink-0">
                  {new Date(call.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
