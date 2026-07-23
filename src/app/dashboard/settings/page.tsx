import { createClient } from '@/lib/supabase/server'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="text-slate-200 text-sm font-mono">{value}</span>
    </div>
  )
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('*, businesses(*)')
    .eq('id', user!.id)
    .single()

  const b = profile?.businesses

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-0.5">Your business configuration</p>
      </div>

      <div className="space-y-4">
        <div className="border border-white/[0.06] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.01]">
            <p className="text-slate-400 text-xs font-medium">Business</p>
          </div>
          <div className="px-4">
            <Row label="Name" value={b?.name ?? '—'} />
            <Row label="Industry" value={b?.industry ?? '—'} />
            <Row label="Phone number" value={b?.twilio_number ?? '—'} />
            <Row label="Alert phone" value={b?.alert_phone ?? '—'} />
            <Row label="Score threshold" value={`${b?.score_threshold ?? 7}/10`} />
            <Row label="SMS alerts" value="Coming soon" />
          </div>
        </div>

        <div className="border border-white/[0.06] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.01]">
            <p className="text-slate-400 text-xs font-medium">Services offered</p>
          </div>
          <div className="px-4 py-3 flex flex-wrap gap-2">
            {b?.services_offered?.length
              ? b.services_offered.map((s: string) => (
                  <span key={s} className="text-emerald-400 bg-emerald-500/8 border border-emerald-500/15 text-xs px-2.5 py-1 rounded-md">{s}</span>
                ))
              : <span className="text-slate-500 text-sm">None configured</span>
            }
          </div>
        </div>

        <div className="border border-white/[0.06] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.01]">
            <p className="text-slate-400 text-xs font-medium">Services excluded</p>
          </div>
          <div className="px-4 py-3 flex flex-wrap gap-2">
            {b?.services_excluded?.length
              ? b.services_excluded.map((s: string) => (
                  <span key={s} className="text-red-400 bg-red-500/8 border border-red-500/15 text-xs px-2.5 py-1 rounded-md">{s}</span>
                ))
              : <span className="text-slate-500 text-sm">None configured</span>
            }
          </div>
        </div>

        <p className="text-slate-500 text-xs text-center pt-1">
          To update configuration, contact <a href="mailto:james@forjahead.com" className="text-slate-400 hover:text-slate-300 transition-colors">james@forjahead.com</a>
        </p>
      </div>
    </div>
  )
}
