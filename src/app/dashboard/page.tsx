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
    businessName: profile?.businesses?.name ?? 'Your Business',
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-7">
        <p className="text-white/25 text-xs font-medium mb-1">{today}</p>
        <h1 className="text-2xl font-bold text-white">Lead Dashboard</h1>
        {profile?.businesses?.name && (
          <p className="text-white/35 text-sm mt-0.5">{profile.businesses.name}</p>
        )}
      </div>
      <StatsBar stats={stats} />
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white/60 text-sm font-semibold">
            {leadsRes.data?.length ?? 0} lead{leadsRes.data?.length !== 1 ? 's' : ''} · sorted by score
          </h2>
        </div>
        <LeadFeed leads={leadsRes.data ?? []} />
      </div>
    </div>
  )
}
