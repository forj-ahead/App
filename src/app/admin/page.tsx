import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, FileText, Phone } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()

  const { count: clientCount } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })

  const { count: templateCount } = await supabase
    .from('templates')
    .select('*', { count: 'exact', head: true })

  const { count: callCount } = await supabase
    .from('calls')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Admin Overview</h1>
        <p className="text-white/40 text-sm">Manage all clients and configuration</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active Clients', value: clientCount ?? 0, icon: Users, href: '/admin/clients' },
          { label: 'Templates', value: templateCount ?? 0, icon: FileText, href: '/admin/templates' },
          { label: 'Total Calls', value: callCount ?? 0, icon: Phone, href: '#' },
        ].map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="bg-[#111827] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#2D6FE8]/15 flex items-center justify-center">
                <Icon size={16} className="text-[#2D6FE8]" />
              </div>
              <span className="text-white/40 text-xs font-medium uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-3xl font-bold text-white tabular-nums">{value}</p>
          </Link>
        ))}
      </div>

      <div className="flex gap-4">
        <Link
          href="/admin/clients/new"
          className="bg-[#2D6FE8] hover:bg-blue-600 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
        >
          + Onboard New Client
        </Link>
        <Link
          href="/admin/templates/new"
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
        >
          + New Template
        </Link>
      </div>
    </div>
  )
}
