import { createClient } from '@/lib/supabase/server'
import { CallList } from '@/components/call-list'

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
    .select('*, leads(score, caller_name, service_requested, summary, score_reasoning, status), businesses(name)')
    .order('created_at', { ascending: false })
    .limit(200)

  if (!isAdmin && profile?.business_id) {
    query.eq('business_id', profile.business_id)
  }

  const { data: calls } = await query

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-white">Calls</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {isAdmin ? 'All inbound calls across every client' : 'Every inbound call — click to see transcript and details'}
        </p>
      </div>
      <CallList calls={calls ?? []} isAdmin={isAdmin} />
    </div>
  )
}
