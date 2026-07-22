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

  // Fetch recent leads
  const { data: leads } = await supabase
    .from('leads')
    .select('*, calls(*)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(50)

  // Stats
  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)

  const { count: totalCalls } = await supabase
    .from('calls')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)

  const { count: newLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('status', 'new')

  const stats = {
    totalLeads: totalLeads ?? 0,
    totalCalls: totalCalls ?? 0,
    newLeads: newLeads ?? 0,
    businessName: profile?.businesses?.name ?? 'Your Business',
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Lead Dashboard</h1>
        <p className="text-white/40 text-sm">All qualified calls, ranked by score</p>
      </div>
      <StatsBar stats={stats} />
      <div className="mt-8">
        <LeadFeed leads={leads ?? []} />
      </div>
    </div>
  )
}
