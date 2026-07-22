import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function TemplatesPage() {
  const supabase = await createClient()
  const { data: templates } = await supabase.from('templates').select('*').order('name')

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Templates</h1>
          <p className="text-white/40 text-sm">Industry-specific call scripts and scoring rules</p>
        </div>
        <Link href="/admin/templates/new" className="bg-[#2D6FE8] hover:bg-blue-600 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors">
          + New Template
        </Link>
      </div>

      {!templates?.length ? (
        <div className="text-center py-20">
          <p className="text-white/40 font-medium mb-1">No templates yet</p>
          <p className="text-white/25 text-sm mb-6">Create your first industry template</p>
          <Link href="/admin/templates/new" className="bg-[#2D6FE8] hover:bg-blue-600 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors">
            Create Template
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {templates.map(t => (
            <Link key={t.id} href={`/admin/templates/${t.id}`} className="block bg-[#111827] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-semibold">{t.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{t.industry}</p>
                </div>
                <span className="text-white/20 text-xs bg-white/5 px-2 py-1 rounded">
                  {t.questions?.length ?? 0} questions
                </span>
              </div>
              <p className="text-white/40 text-xs line-clamp-2 leading-relaxed">{t.base_prompt?.substring(0, 120)}…</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
