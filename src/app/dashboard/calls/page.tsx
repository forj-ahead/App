import { createClient } from '@/lib/supabase/server'

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
    .select('*')
    .eq('business_id', profile?.business_id)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">All Calls</h1>
        <p className="text-white/40 text-sm">Every inbound call, including disqualified ones</p>
      </div>

      {!calls?.length ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">📵</div>
          <p className="text-white/40 font-medium">No calls yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {calls.map(call => (
            <div key={call.id} className="bg-[#111827] border border-white/5 rounded-xl px-5 py-4 flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${call.status === 'completed' ? 'bg-green-400' : 'bg-red-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{call.caller_number}</p>
                <p className="text-white/30 text-xs">{call.duration_seconds}s · {call.status}</p>
              </div>
              <p className="text-white/30 text-xs flex-shrink-0">
                {new Date(call.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
