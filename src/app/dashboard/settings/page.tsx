import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('*, businesses(*)')
    .eq('id', user!.id)
    .single()

  const business = profile?.businesses

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-white/40 text-sm">Your business configuration</p>
      </div>

      <div className="space-y-4">
        <div className="bg-[#111827] border border-white/5 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Business Info</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/40">Name</span>
              <span className="text-white">{business?.name ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Industry</span>
              <span className="text-white">{business?.industry ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Phone number</span>
              <span className="text-white font-mono">{business?.twilio_number ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Alert phone</span>
              <span className="text-white font-mono">{business?.alert_phone ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Lead score threshold</span>
              <span className="text-white">{business?.score_threshold ?? 7}/10</span>
            </div>
          </div>
        </div>

        <div className="bg-[#111827] border border-white/5 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-2">Services Offered</h2>
          <div className="flex flex-wrap gap-2 mt-3">
            {business?.services_offered?.length ? business.services_offered.map((s: string) => (
              <span key={s} className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs px-3 py-1 rounded-full">{s}</span>
            )) : <span className="text-white/30 text-sm">None configured</span>}
          </div>
        </div>

        <div className="bg-[#111827] border border-white/5 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-2">Services Excluded</h2>
          <div className="flex flex-wrap gap-2 mt-3">
            {business?.services_excluded?.length ? business.services_excluded.map((s: string) => (
              <span key={s} className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs px-3 py-1 rounded-full">{s}</span>
            )) : <span className="text-white/30 text-sm">None configured</span>}
          </div>
        </div>

        <p className="text-white/25 text-xs text-center pt-2">
          To update your configuration, contact james@forjahead.com
        </p>
      </div>
    </div>
  )
}
