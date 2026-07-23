import { createClient } from '@/lib/supabase/server'
import { Phone, Clock } from 'lucide-react'

export default async function CallsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('business_id')
    .eq('id', user!.id)
    .single()

  const { data: calls } = await supabase
    .from('calls')
    .select('*, leads(score, caller_name, service_requested)')
    .eq('business_id', profile?.business_id)
    .order('created_at', { ascending: false })
    .limit(100)

  const formatDuration = (s: number) => {
    if (s < 60) return `${s}s`
    return `${Math.floor(s / 60)}m ${s % 60}s`
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white">All Calls</h1>
        <p className="text-white/35 text-sm mt-0.5">Every inbound call, including unscored ones</p>
      </div>

      {!calls?.length ? (
        <div className="text-center py-24 border border-white/[0.06] rounded-xl bg-[#0D1525]">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Phone size={20} className="text-white/20" />
          </div>
          <p className="text-white/40 font-medium text-sm mb-1">No calls yet</p>
          <p className="text-white/20 text-xs">Calls will appear here after Maya answers your first call</p>
        </div>
      ) : (
        <div className="space-y-2">
          {calls.map(call => {
            const lead = (call as any).leads
            const scored = !!lead
            const score = lead?.score

            return (
              <div key={call.id} className="bg-[#0D1525] border border-white/[0.06] hover:border-white/10 rounded-xl px-5 py-4 flex items-center gap-4 transition-colors">
                {/* Score or dot */}
                {scored ? (
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-black tabular-nums ${
                    score >= 8 ? 'bg-green-500/12 text-green-400' :
                    score >= 6 ? 'bg-amber-500/12 text-amber-400' :
                                 'bg-red-500/12 text-red-400'
                  }`}>
                    {score}
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-white font-medium text-sm">
                      {lead?.caller_name ?? call.caller_number}
                    </span>
                    {lead?.caller_name && (
                      <span className="text-white/25 text-xs font-mono">{call.caller_number}</span>
                    )}
                  </div>
                  {lead?.service_requested && (
                    <p className="text-white/35 text-xs mt-0.5 truncate">{lead.service_requested}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-white/25 text-xs">
                    <Clock size={11} />
                    {formatDuration(call.duration_seconds)}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded border ${
                    scored
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-white/5 text-white/25 border-white/10'
                  }`}>
                    {scored ? 'Scored' : 'Unscored'}
                  </span>
                  <p className="text-white/20 text-xs">
                    {new Date(call.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
