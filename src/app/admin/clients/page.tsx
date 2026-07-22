import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Phone } from 'lucide-react'

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Clients</h1>
          <p className="text-white/40 text-sm">{businesses?.length ?? 0} active clients</p>
        </div>
        <Link
          href="/admin/clients/new"
          className="bg-[#2D6FE8] hover:bg-blue-600 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
        >
          + Onboard Client
        </Link>
      </div>

      {!businesses?.length ? (
        <div className="text-center py-20">
          <p className="text-white/40 font-medium mb-1">No clients yet</p>
          <p className="text-white/25 text-sm mb-6">Add your first client to get started</p>
          <Link
            href="/admin/clients/new"
            className="bg-[#2D6FE8] hover:bg-blue-600 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
          >
            Onboard First Client
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {businesses.map(biz => (
            <Link
              key={biz.id}
              href={`/admin/clients/${biz.id}`}
              className="block bg-[#111827] border border-white/5 rounded-xl px-5 py-4 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-[#1A2340] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">{biz.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{biz.name}</p>
                  <p className="text-white/40 text-xs">{biz.industry}</p>
                </div>
                <div className="flex items-center gap-2 text-white/30 text-xs flex-shrink-0">
                  <Phone size={12} />
                  <span className="font-mono">{biz.twilio_number ?? 'No number'}</span>
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${biz.retell_agent_id ? 'bg-green-400' : 'bg-amber-400'}`} title={biz.retell_agent_id ? 'Agent active' : 'No agent configured'} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
