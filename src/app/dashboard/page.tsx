import { createClient } from '@/lib/supabase/server'
import { LeadFeed } from '@/components/lead-feed'
import { StatsBar } from '@/components/stats-bar'
import { BusinessFilter } from '@/components/business-filter'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ business?: string }>
}) {
  const { business: filterBusinessId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('*, businesses(*)')
    .eq('id', user!.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const businessId = isAdmin ? (filterBusinessId || null) : profile?.business_id

  const leadsQuery = supabase
    .from('leads')
    .select('*, calls(*)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (businessId) leadsQuery.eq('business_id', businessId)

  const countQuery = (table: 'leads' | 'calls') => {
    const q = supabase.from(table).select('*', { count: 'exact', head: true })
    if (businessId) q.eq('business_id', businessId)
    return q
  }

  const newLeadsQ = supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new')
  if (businessId) newLeadsQ.eq('business_id', businessId)

  const [leadsRes, totalLeadsRes, totalCallsRes, newLeadsRes, businessesRes] = await Promise.all([
    leadsQuery,
    countQuery('leads'),
    countQuery('calls'),
    newLeadsQ,
    isAdmin ? supabase.from('businesses').select('id, name').order('name') : Promise.resolve({ data: [] }),
  ])

  const activeBusinessName = isAdmin
    ? (businessesRes.data?.find(b => b.id === filterBusinessId)?.name ?? 'All clients')
    : (profile?.businesses?.name ?? '')

  const stats = {
    totalLeads: totalLeadsRes.count ?? 0,
    totalCalls: totalCallsRes.count ?? 0,
    newLeads: newLeadsRes.count ?? 0,
    businessName: activeBusinessName,
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-white">Leads</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{activeBusinessName}</p>
        </div>
        {isAdmin && (
          <BusinessFilter businesses={businessesRes.data ?? []} />
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
