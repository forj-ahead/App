import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Clock, ChevronRight, Settings2 } from 'lucide-react'

function ScoreBadge({ score }: { score: number }) {
  const [bg, text] =
    score >= 8 ? ['bg-green-500/12 border-green-500/25', 'text-green-400'] :
    score >= 6 ? ['bg-amber-500/12 border-amber-500/25', 'text-amber-400'] :
                 ['bg-red-500/12 border-red-500/25', 'text-red-400']
  return (
    <div className={`flex flex-col items-center justify-center w-11 h-11 rounded-xl border flex-shrink-0 ${bg}`}>
      <span className={`text-base font-black tabular-nums leading-none ${text}`}>{score}</span>
      <span className={`text-[9px] font-semibold opacity-50 ${text}`}>/10</span>
    </div>
  )
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single()

  if (!business) notFound()

  const [leadsRes, callsRes] = await Promise.all([
    supabase.from('leads').select('*, calls(transcript, duration_seconds)').eq('business_id', id).order('created_at', { ascending: false }),
    supabase.from('calls').select('*').eq('business_id', id).order('created_at', { ascending: false }),
  ])

  const leads = leadsRes.data ?? []
  const calls = callsRes.data ?? []

  const newLeads = leads.filter(l => l.status === 'new').length
  const avgScore = leads.length
    ? (leads.reduce((s, l) => s + l.score, 0) / leads.length).toFixed(1)
    : null

  return (
    <div className="min-h-screen bg-[#060B16]">
      {/* Admin banner */}
      <div className="bg-[#2D6FE8]/10 border-b border-[#2D6FE8]/20 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#4D8BF0] text-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60">Admin view</span>
          <ChevronRight size={12} className="opacity-40" />
          <span className="font-medium">{business.name}</span>
        </div>
        <Link
          href="/admin/clients"
          className="flex items-center gap-1.5 text-[#4D8BF0] hover:text-white text-xs font-medium transition-colors"
        >
          <ArrowLeft size={13} />
          Back to clients
        </Link>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-white">{business.name}</h1>
            <p className="text-white/35 text-sm mt-0.5">{business.industry}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <Phone size={11} />
            <span className="font-mono">{business.twilio_number ?? 'No number assigned'}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: 'New Leads', value: newLeads, accent: true },
            { label: 'Total Leads', value: leads.length, accent: false },
            { label: 'Total Calls', value: calls.length, accent: false },
            { label: 'Avg Score', value: avgScore ? `${avgScore}/10` : '—', accent: false },
          ].map(({ label, value, accent }) => (
            <div key={label} className={`rounded-xl border p-4 ${accent ? 'bg-[#2D6FE8]/10 border-[#2D6FE8]/25' : 'bg-[#0D1525] border-white/[0.06]'}`}>
              <p className={`text-xs font-medium uppercase tracking-wider mb-2 ${accent ? 'text-[#4D8BF0]/60' : 'text-white/25'}`}>{label}</p>
              <p className={`text-3xl font-black tabular-nums ${accent ? 'text-[#4D8BF0]' : 'text-white'}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Leads — takes 2 cols */}
          <div className="col-span-2">
            <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">
              Qualified Leads · {leads.length}
            </h2>
            {leads.length === 0 ? (
              <div className="bg-[#0D1525] border border-white/[0.06] rounded-xl px-5 py-12 text-center">
                <p className="text-white/25 text-sm">No leads yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leads.map(lead => (
                  <div key={lead.id} className="bg-[#0D1525] border border-white/[0.06] rounded-xl px-4 py-3.5 flex items-center gap-3">
                    <ScoreBadge score={lead.score} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{lead.caller_name ?? lead.caller_number}</p>
                      <p className="text-white/35 text-xs mt-0.5 truncate">{lead.service_requested}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white/20 text-xs">
                        {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-white/30 text-xs font-mono mt-0.5">{lead.caller_number}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column: config + recent calls */}
          <div className="space-y-5">
            {/* Config */}
            <div>
              <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Settings2 size={11} />
                Config
              </h2>
              <div className="bg-[#0D1525] border border-white/[0.06] rounded-xl p-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/30">Alert phone</span>
                  <span className="text-white/60 font-mono">{business.alert_phone ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/30">SMS alerts</span>
                  <span className={business.sms_alerts_enabled ? 'text-green-400' : 'text-white/25'}>
                    {business.sms_alerts_enabled ? 'On' : 'Off'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/30">Score threshold</span>
                  <span className="text-white/60">{business.score_threshold}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/30">Agent</span>
                  <span className={business.retell_agent_id ? 'text-green-400' : 'text-amber-400/70'}>
                    {business.retell_agent_id ? 'Active' : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Services</h2>
              <div className="bg-[#0D1525] border border-white/[0.06] rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-white/20 text-[10px] mb-1.5">Offered</p>
                  <div className="flex flex-wrap gap-1">
                    {business.services_offered?.length
                      ? business.services_offered.map((s: string) => (
                          <span key={s} className="text-green-400 bg-green-500/10 border border-green-500/20 text-[10px] px-2 py-0.5 rounded-full">{s}</span>
                        ))
                      : <span className="text-white/20 text-xs">None</span>
                    }
                  </div>
                </div>
                <div>
                  <p className="text-white/20 text-[10px] mb-1.5">Excluded</p>
                  <div className="flex flex-wrap gap-1">
                    {business.services_excluded?.length
                      ? business.services_excluded.map((s: string) => (
                          <span key={s} className="text-red-400 bg-red-500/10 border border-red-500/20 text-[10px] px-2 py-0.5 rounded-full">{s}</span>
                        ))
                      : <span className="text-white/20 text-xs">None</span>
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Recent calls */}
            <div>
              <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">
                Recent Calls · {calls.length}
              </h2>
              <div className="space-y-1.5">
                {calls.slice(0, 6).map(call => (
                  <div key={call.id} className="bg-[#0D1525] border border-white/[0.06] rounded-lg px-3 py-2.5 flex items-center gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${call.status === 'completed' ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-white/50 text-xs font-mono flex-1 truncate">{call.caller_number}</span>
                    <div className="flex items-center gap-1 text-white/20 text-[10px] flex-shrink-0">
                      <Clock size={9} />
                      {call.duration_seconds}s
                    </div>
                  </div>
                ))}
                {calls.length === 0 && (
                  <p className="text-white/20 text-xs text-center py-4">No calls yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
