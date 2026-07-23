import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Phone, Plus } from 'lucide-react'

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-lg font-semibold text-white">Clients</h1>
          <p className="text-slate-400 text-sm mt-0.5">{businesses?.length ?? 0} total</p>
        </div>
        <Link href="/admin/clients/new" className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-200 text-black text-xs font-semibold px-4 py-2 rounded-md transition-colors">
          <Plus size={13} />
          Onboard client
        </Link>
      </div>

      {!businesses?.length ? (
        <div className="flex flex-col items-center justify-center py-24 border border-white/[0.06] rounded-lg">
          <p className="text-slate-400 text-sm font-medium mb-1">No clients yet</p>
          <p className="text-slate-500 text-xs mb-5">Add your first client to get started</p>
          <Link href="/admin/clients/new" className="bg-white hover:bg-slate-200 text-black text-xs font-semibold px-4 py-2 rounded-md transition-colors">
            Onboard first client
          </Link>
        </div>
      ) : (
        <div className="border border-slate-700/50 rounded-lg divide-y divide-slate-700/40 overflow-hidden bg-[#111827]/60">
          {businesses.map(biz => (
            <Link key={biz.id} href={`/admin/clients/${biz.id}`} className="flex items-center gap-4 px-4 py-3.5 hover:bg-slate-700/30 transition-colors">
              <div className="w-8 h-8 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium text-sm">{biz.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{biz.name}</p>
                <p className="text-slate-500 text-xs mt-0.5">{biz.industry}</p>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Phone size={11} />
                <span className="font-mono">{biz.twilio_number ?? '—'}</span>
              </div>
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${biz.retell_agent_id ? 'bg-emerald-400' : 'bg-amber-400/50'}`} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
