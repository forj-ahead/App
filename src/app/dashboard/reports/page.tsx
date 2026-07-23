import { createClient } from '@/lib/supabase/server'
import { ReportView } from '@/components/report-view'

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; business?: string }>
}) {
  const { period = 'this_month', business: filterBusinessId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users').select('role, business_id, businesses(name)').eq('id', user!.id).single()

  const isAdmin = profile?.role === 'admin'
  const businessId = isAdmin ? (filterBusinessId || null) : profile?.business_id

  const businessesRes = isAdmin
    ? await supabase.from('businesses').select('id, name').order('name')
    : { data: [] as { id: string; name: string }[] }

  const activeBusinessName = isAdmin
    ? (businessesRes.data?.find(b => b.id === filterBusinessId)?.name ?? 'All clients')
    : ((profile?.businesses as any)?.name ?? '')

  // Date range setup
  const now = new Date()
  let start: Date
  let prevStart: Date
  let prevEnd: Date
  let useUpperBound = false
  let upperBound: Date | null = null

  if (period === 'last_month') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    upperBound = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
    prevStart = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    prevEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59)
    useUpperBound = true
  } else if (period === 'last_30') {
    start = new Date(Date.now() - 30 * 86400000)
    prevStart = new Date(Date.now() - 60 * 86400000)
    prevEnd = start
  } else if (period === 'all_time') {
    start = new Date(0)
    prevStart = new Date(0)
    prevEnd = new Date(0)
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
    prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  }

  const leadsQ = supabase.from('leads').select('*').gte('created_at', start.toISOString())
  if (useUpperBound && upperBound) leadsQ.lte('created_at', upperBound.toISOString())
  if (businessId) leadsQ.eq('business_id', businessId)

  const callsQ = supabase.from('calls').select('id, created_at, duration_seconds').gte('created_at', start.toISOString())
  if (useUpperBound && upperBound) callsQ.lte('created_at', upperBound.toISOString())
  if (businessId) callsQ.eq('business_id', businessId)

  const [{ data: leads }, { data: calls }] = await Promise.all([leadsQ, callsQ])

  let prevLeadCount = 0
  if (period !== 'all_time') {
    const prevQ = supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', prevStart.toISOString())
      .lte('created_at', prevEnd.toISOString())
    if (businessId) prevQ.eq('business_id', businessId)
    const { count } = await prevQ
    prevLeadCount = count ?? 0
  }

  return (
    <ReportView
      leads={leads ?? []}
      calls={calls ?? []}
      period={period}
      prevLeadCount={prevLeadCount}
      businessName={activeBusinessName}
      businesses={businessesRes.data ?? []}
      isAdmin={isAdmin}
    />
  )
}
