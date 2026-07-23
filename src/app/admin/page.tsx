import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, FileText, Phone, Plus } from 'lucide-react'

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
    { label: 'Clients', value: clientsRes.count ?? 0, icon: Users, href: '/admin/clients', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Templates', value: templatesRes.count ?? 0, icon: FileText, href: '/admin/templates', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Total Calls', value: callsRes.count ?? 0, icon: Phone, href: '/dashboard/calls', color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Total Leads', value: leadsRes.count ?? 0, icon: Users, href: '/dashboard', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-white/35 text-sm mt-0.5">All clients, templates, and system activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {stats.map(({ label, value, icon: Icon, href, color, bg }) => (
          <Link key={label} href={href} className="bg-[#0D1525] border border-white/[0.06] hover:border-white/10 rounded-xl p-5 transition-colors group">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={15} className={color} />
            </div>
            <p className="text-3xl font-black text-white tabular-nums">{value}</p>
            <p className="text-white/30 text-xs font-medium mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-8">
        <Link
          href="/admin/clients/new"
          className="flex items-center gap-2 bg-[#2D6FE8] hover:bg-[#4D8BF0] text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={15} />
          Onboard Client
        </Link>
        <Link
          href="/admin/templates/new"
          className="flex items-center gap-2 bg-white/5 hover:bg-white/8 border border-white/10 text-white/70 hover:text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={15} />
          New Template
        </Link>
      </div>

      {/* Recent clients */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white/60 text-sm font-semibold">Recent Clients</h2>
          <Link href="/admin/clients" className="text-[#4D8BF0] text-xs hover:underline">View all</Link>
        </div>
        {!recentClients?.length ? (
          <div className="bg-[#0D1525] border border-white/[0.06] rounded-xl px-5 py-10 text-center">
            <p className="text-white/30 text-sm">No clients yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentClients.map(biz => (
              <Link
                key={biz.id}
                href={`/admin/clients/${biz.id}`}
                className="flex items-center gap-4 bg-[#0D1525] border border-white/[0.06] hover:border-white/10 rounded-xl px-5 py-3.5 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#1A2340] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">{biz.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{biz.name}</p>
                  <p className="text-white/30 text-xs">{biz.industry}</p>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${biz.retell_agent_id ? 'bg-green-400' : 'bg-amber-400/60'}`} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
