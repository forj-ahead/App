import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { LeadDetail } from '@/components/lead-detail'

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role, business_id')
    .eq('id', user.id)
    .single()

  const { data: lead } = await supabase
    .from('leads')
    .select('*, calls(*)')
    .eq('id', id)
    .single()

  if (!lead) notFound()

  // Non-admins can only see their own business leads
  if (profile?.role !== 'admin' && lead.business_id !== profile?.business_id) notFound()

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <LeadDetail lead={lead} />
    </div>
  )
}
