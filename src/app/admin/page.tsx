import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, FileText, Phone, TrendingUp, Plus } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()

  const [clientsRes, templatesRes, callsRes, leadsRes] = await Promise.all([
    supabase.from('businesses').select('*', { count: 'exact', head: true }),
    supabase.from('templates').select('*', { count: 'exact', head: true }),
    supabase.from('calls').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
  ])

  const { data: recentClients } = await supabase
    .from('businesses')
    .select('id, name, industry, retell_agent_id, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: 'Clients', value: clientsRes.count ?? 0, icon: Users, href: '/admin/clients' },
    { label: 'Templates', value: templatesRes.count ?? 0, icon: FileText, href: '/admin/templates' },
    { label: 'Total Calls', value: callsRes.count ?? 0, icon: Phone, href: '/dashboard/calls' },
    { label: 'Total Leads', value: leadsRes.count ?? 0, icon: TrendingUp, href: '/dashboard' },
  ]

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-lg font-semibold text-white">Overview</h1>
        <p className="text-slate-400 text-sm mt-0.5">All clients, templates, and activity</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 md:mb-8">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="bg-[#111827] hover:bg-[#1a2235] border border-slate-700/50 rounded-lg p-4 transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-400 text-xs font-medium">{label}</p>
              <Icon size={13} className="text-slate-500 group-hover:text-slate-400 transition-colors" />
            </div>
            <p className="text-2xl font-semibold text-white tabular-nums">{value}</p>
          </Link>
        ))}
      </div>

      <div className="flex gap-2 mb-10">
        <Link href="/admin/clients/new" className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-200 text-black text-xs font-semibold px-4 py-2 rounded-md transition-colors">
          <Plus size={13} />
          Onboard client
        </Link>
        <Link href="/admin/templates/new" className="inline-flex items-center gap-1.5 bg-[#1a2235] hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold px-4 py-2 rounded-md transition-colors">
          <Plus size={13} />
          New template
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-500 text-xs font-medium">Recent clients</p>
          <Link href="/admin/clients" className="text-slate-400 hover:text-slate-300 text-xs transition-colors">View all →</Link>
        </div>
        {!recentClients?.length ? (
          <div className="border border-white/[0.06] rounded-lg px-4 py-10 text-center">
            <p className="text-slate-500 text-sm">No clients yet</p>
          </div>
        ) : (
          <div className="border border-slate-700/50 rounded-lg divide-y divide-slate-700/40 overflow-hidden bg-[#111827]/60">
            {recentClients.map(biz => (
              <Link key={biz.id} href={`/admin/clients/${biz.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700/30 transition-colors">
                <div className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-xs">{biz.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{biz.name}</p>
                  <p className="text-slate-500 text-xs">{biz.industry}</p>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full ${biz.retell_agent_id ? 'bg-emerald-400' : 'bg-amber-400/50'}`} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
