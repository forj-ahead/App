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

  const isAdmin = profile?.role === 'admin'
  const businessId = profile?.business_id

  // Admins see all leads; clients see only their business
  const leadsQuery = supabase
    .from('leads')
    .select('*, calls(*)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (!isAdmin && businessId) {
    leadsQuery.eq('business_id', businessId)
  }

  const [leadsRes, totalLeadsRes, totalCallsRes, newLeadsRes] = await Promise.all([
    leadsQuery,
    isAdmin
      ? supabase.from('leads').select('*', { count: 'exact', head: true })
      : supabase.from('leads').select('*', { count: 'exact', head: true }).eq('business_id', businessId),
    isAdmin
      ? supabase.from('calls').select('*', { count: 'exact', head: true })
      : supabase.from('calls').select('*', { count: 'exact', head: true }).eq('business_id', businessId),
    isAdmin
      ? supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new')
      : supabase.from('leads').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('status', 'new'),
  ])

  const stats = {
    totalLeads: totalLeadsRes.count ?? 0,
    totalCalls: totalCallsRes.count ?? 0,
    newLeads: newLeadsRes.count ?? 0,
    businessName: isAdmin ? 'All clients' : (profile?.businesses?.name ?? ''),
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-white">Leads</h1>
        <p className="text-zinc-500 text-sm mt-0.5">{stats.businessName}</p>
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
