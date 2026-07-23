import { createClient } from '@/lib/supabase/server'
import { ReportView } from '@/components/report-view'

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const { period = 'this_month' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users').select('role, business_id, businesses(name)').eq('id', user!.id).single()

  const isAdmin = profile?.role === 'admin'
  const businessId = profile?.business_id

  // Date range
  const now = new Date()
  let start: Date
  let prevStart: Date
  let prevEnd: Date

  if (period === 'last_month') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
    prevStart = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    prevEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59)
    // use end for filtering
    const leadsQ = supabase.from('leads').select('*').gte('created_at', start.toISOString()).lte('created_at', end.toISOString())
    const callsQ = supabase.from('calls').select('id, created_at, duration_seconds').gte('created_at', start.toISOString()).lte('created_at', end.toISOString())
    if (!isAdmin && businessId) { leadsQ.eq('business_id', businessId); callsQ.eq('business_id', businessId) }
    const [{ data: leads }, { data: calls }] = await Promise.all([leadsQ, callsQ])
    const prevLeadsQ = supabase.from('leads').select('id').gte('created_at', prevStart.toISOString()).lte('created_at', prevEnd.toISOString())
    if (!isAdmin && businessId) prevLeadsQ.eq('business_id', businessId)
    const { count: prevLeadCount } = await prevLeadsQ.select('id', { count: 'exact', head: true })
    return <ReportView leads={leads ?? []} calls={calls ?? []} period={period} prevLeadCount={prevLeadCount ?? 0} businessName={isAdmin ? 'All clients' : ((profile?.businesses as any)?.name ?? '')} />
  }

  if (period === 'last_30') {
    start = new Date(Date.now() - 30 * 86400000)
    prevStart = new Date(Date.now() - 60 * 86400000)
    prevEnd = start
  } else if (period === 'all_time') {
    start = new Date(0)
    prevStart = new Date(0)
    prevEnd = new Date(0)
  } else {
    // this_month
    start = new Date(now.getFullYear(), now.getMonth(), 1)
    prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  }

  const leadsQ = supabase.from('leads').select('*').gte('created_at', start.toISOString())
  const callsQ = supabase.from('calls').select('id, created_at, duration_seconds').gte('created_at', start.toISOString())
  if (!isAdmin && businessId) { leadsQ.eq('business_id', businessId); callsQ.eq('business_id', businessId) }

  const [{ data: leads }, { data: calls }] = await Promise.all([leadsQ, callsQ])

  let prevLeadCount = 0
  if (period !== 'all_time') {
    const prevQ = supabase.from('leads').select('id', { count: 'exact', head: true })
      .gte('created_at', prevStart.toISOString()).lte('created_at', prevEnd.toISOString())
    if (!isAdmin && businessId) prevQ.eq('business_id', businessId)
    const { count } = await prevQ
    prevLeadCount = count ?? 0
  }

  return (
    <ReportView
      leads={leads ?? []}
      calls={calls ?? []}
      period={period}
      prevLeadCount={prevLeadCount}
      businessName={isAdmin ? 'All clients' : ((profile?.businesses as any)?.name ?? '')}
    />
  )
}
