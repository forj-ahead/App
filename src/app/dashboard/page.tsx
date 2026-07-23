import { createClient } from '@/lib/supabase/server'
import { LeadFeed } from '@/components/lead-feed'
import { StatsBar } from '@/components/stats-bar'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('*, businesses(*)')
    .eq('id', user!.id)
    .single()

  const businessId = profile?.business_id

  const [leadsRes, totalLeadsRes, totalCallsRes, newLeadsRes] = await Promise.all([
    supabase.from('leads').select('*, calls(*)').eq('business_id', businessId).order('created_at', { ascending: false }).limit(50),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('business_id', businessId),
    supabase.from('calls').select('*', { count: 'exact', head: true }).eq('business_id', businessId),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('status', 'new'),
  ])

  const stats = {
    totalLeads: totalLeadsRes.count ?? 0,
    totalCalls: totalCallsRes.count ?? 0,
    newLeads: newLeadsRes.count ?? 0,
    businessName: profile?.businesses?.name ?? '',
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-white">Leads</h1>
        {profile?.businesses?.name && (
          <p className="text-zinc-500 text-sm mt-0.5">{profile.businesses.name}</p>
        )}
      </div>
      <StatsBar stats={stats} />
      <div className="mt-8">
        <p className="text-zinc-600 text-xs font-medium mb-3">
          {leadsRes.data?.length ?? 0} lead{leadsRes.data?.length !== 1 ? 's' : ''} · sorted by score
        </p>
        <LeadFeed leads={leadsRes.data ?? []} />
      </div>
    </div>
  )
}
