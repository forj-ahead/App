import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Phone, Plus, CheckCircle2, AlertCircle } from 'lucide-react'

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-white/35 text-sm mt-0.5">{businesses?.length ?? 0} active client{businesses?.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/clients/new"
          className="flex items-center gap-2 bg-[#2D6FE8] hover:bg-[#4D8BF0] text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={15} />
          Onboard Client
        </Link>
      </div>

      {!businesses?.length ? (
        <div className="text-center py-24 bg-[#0D1525] border border-white/[0.06] rounded-xl">
          <p className="text-white/40 font-medium mb-1">No clients yet</p>
          <p className="text-white/20 text-sm mb-6">Add your first client to get started</p>
          <Link href="/admin/clients/new" className="bg-[#2D6FE8] hover:bg-[#4D8BF0] text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors">
            Onboard First Client
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {businesses.map(biz => (
            <Link
              key={biz.id}
              href={`/admin/clients/${biz.id}`}
              className="flex items-center gap-4 bg-[#0D1525] border border-white/[0.06] hover:border-white/10 rounded-xl px-5 py-4 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1A2340] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">{biz.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{biz.name}</p>
                <p className="text-white/35 text-xs mt-0.5">{biz.industry}</p>
              </div>
              <div className="flex items-center gap-2 text-white/25 text-xs flex-shrink-0">
                <Phone size={11} />
                <span className="font-mono">{biz.twilio_number ?? 'No number'}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {biz.retell_agent_id ? (
                  <span className="flex items-center gap-1 text-green-400 text-xs">
                    <CheckCircle2 size={12} />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400/70 text-xs">
                    <AlertCircle size={12} />
                    No agent
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
