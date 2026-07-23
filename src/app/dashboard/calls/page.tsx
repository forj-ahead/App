import { createClient } from '@/lib/supabase/server'
import { CallList } from '@/components/call-list'
import { BusinessFilter } from '@/components/business-filter'

export default async function CallsPage({
  searchParams,
}: {
  searchParams: Promise<{ business?: string }>
}) {
  const { business: filterBusinessId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('role, business_id')
    .eq('id', user!.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const businessId = isAdmin ? (filterBusinessId || null) : profile?.business_id

  const query = supabase
    .from('calls')
    .select('*, leads(score, caller_name, service_requested, summary, score_reasoning, status), businesses(name)')
    .order('created_at', { ascending: false })
    .limit(200)

  if (businessId) query.eq('business_id', businessId)

  const [callsRes, businessesRes] = await Promise.all([
    query,
    isAdmin ? supabase.from('businesses').select('id, name').order('name') : Promise.resolve({ data: [] }),
  ])

  const activeBusinessName = isAdmin
    ? (businessesRes.data?.find(b => b.id === filterBusinessId)?.name ?? 'All clients')
    : 'Every inbound call — click to see transcript and details'

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6 md:mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-white">Calls</h1>
          <p className="text-slate-400 text-sm mt-0.5">{activeBusinessName}</p>
        </div>
        {isAdmin && (
          <BusinessFilter businesses={businessesRes.data ?? []} />
        )}
      </div>
      <CallList calls={callsRes.data ?? []} isAdmin={isAdmin} />
    </div>
  )
}
