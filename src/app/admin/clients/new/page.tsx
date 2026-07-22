import { createClient } from '@/lib/supabase/server'
import { NewClientForm } from '@/components/new-client-form'

export default async function NewClientPage() {
  const supabase = await createClient()

  const { data: templates } = await supabase
    .from('templates')
    .select('id, name, industry')
    .order('name')

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Onboard New Client</h1>
        <p className="text-white/40 text-sm">Choose a template and configure their agent</p>
      </div>
      <NewClientForm templates={templates ?? []} />
    </div>
  )
}
