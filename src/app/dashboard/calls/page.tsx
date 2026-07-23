import { createClient } from '@/lib/supabase/server'
import { Phone, Clock } from 'lucide-react'

export default async function CallsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('role, business_id')
    .eq('id', user!.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const query = supabase
    .from('calls')
    .select('*, leads(score, caller_name, service_requested), businesses(name)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (!isAdmin && profile?.business_id) {
    query.eq('business_id', profile.business_id)
  }

  const { data: calls } = await query

  const fmt = (s: number) => s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-white">Calls</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          {isAdmin ? 'All inbound calls across every client' : 'Every inbound call, including unscored ones'}
        </p>
      </div>

      {!calls?.length ? (
        <div className="flex flex-col items-center justify-center py-24 border border-zinc-800 rounded-lg">
          <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center mb-4">
            <Phone size={16} className="text-zinc-700" />
          </div>
          <p className="text-zinc-500 text-sm font-medium">No calls yet</p>
          <p className="text-zinc-700 text-xs mt-1">Calls appear here after Maya answers your first call</p>
        </div>
      ) : (
        <div className="border border-zinc-800 rounded-lg divide-y divide-zinc-800/80 overflow-hidden">
          {calls.map(call => {
            const lead = (call as any).leads
            const biz = (call as any).businesses
            const score = lead?.score

            return (
              <div key={call.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-zinc-800/40 transition-colors">
                {lead ? (
                  <span className={`text-xs font-semibold tabular-nums w-8 text-center ${
                    score >= 8 ? 'text-emerald-400' :
                    score >= 6 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {score}
                  </span>
                ) : (
                  <div className="w-8 flex justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-white text-sm font-medium">
                      {lead?.caller_name ?? call.caller_number}
                    </span>
                    {lead?.caller_name && (
                      <span className="text-zinc-700 text-xs font-mono">{call.caller_number}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {lead?.service_requested && <p className="text-zinc-600 text-xs truncate">{lead.service_requested}</p>}
                    {isAdmin && biz?.name && <span className="text-zinc-800 text-xs">· {biz.name}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="flex items-center gap-1 text-zinc-700 text-xs">
                    <Clock size={11} />
                    {fmt(call.duration_seconds)}
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                    lead
                      ? 'text-blue-400 bg-blue-500/8 border-blue-500/15'
                      : 'text-zinc-700 bg-white/3 border-white/8'
                  }`}>
                    {lead ? 'Scored' : 'Unscored'}
                  </span>
                  <p className="text-zinc-700 text-xs tabular-nums">
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
