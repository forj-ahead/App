import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function TemplatesPage() {
  const supabase = await createClient()
  const { data: templates } = await supabase.from('templates').select('*').order('name')

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-lg font-semibold text-white">Templates</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Industry call scripts and scoring rules</p>
        </div>
        <Link href="/admin/templates/new" className="inline-flex items-center gap-1.5 bg-white hover:bg-zinc-200 text-black text-xs font-semibold px-4 py-2 rounded-md transition-colors">
          <Plus size={13} />
          New template
        </Link>
      </div>

      {!templates?.length ? (
        <div className="flex flex-col items-center justify-center py-24 border border-zinc-800 rounded-lg">
          <p className="text-zinc-500 text-sm font-medium mb-1">No templates yet</p>
          <p className="text-zinc-700 text-xs mb-5">Create your first industry template</p>
          <Link href="/admin/templates/new" className="bg-white hover:bg-zinc-100 text-black text-xs font-medium px-3.5 py-2 rounded-md transition-colors">
            Create template
          </Link>
        </div>
      ) : (
        <div className="border border-zinc-800 rounded-lg divide-y divide-zinc-800/80 overflow-hidden">
          {templates.map(t => (
            <Link key={t.id} href={`/admin/templates/${t.id}`} className="flex items-center gap-4 px-4 py-3.5 hover:bg-zinc-800/60 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{t.name}</p>
                <p className="text-zinc-600 text-xs mt-0.5">{t.industry}</p>
              </div>
              <span className="text-zinc-700 text-xs">{t.questions?.length ?? 0} questions</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
