import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppSidebar } from '@/components/app-sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch user profile to get role
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const newLeadsQuery = supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'new')
  if (!isAdmin && profile?.business_id) newLeadsQuery.eq('business_id', profile.business_id)
  const { count: newLeadCount } = await newLeadsQuery

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar user={user} profile={profile} newLeadCount={newLeadCount ?? 0} />
      <main className="flex-1 overflow-y-auto bg-background pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}
