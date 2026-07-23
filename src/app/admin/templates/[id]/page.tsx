import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageSquare } from 'lucide-react'

export default async function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: template } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .single()

  if (!template) notFound()

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, industry')
    .eq('template_id', id)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/templates" className="flex items-center gap-1.5 text-white/30 hover:text-white text-sm mb-4 transition-colors w-fit">
          <ArrowLeft size={14} />
          All Templates
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{template.name}</h1>
            <p className="text-white/40 text-sm">{template.industry} · {template.questions?.length ?? 0} qualifying questions</p>
          </div>
          <span className="text-white/25 text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
            {businesses?.length ?? 0} client{businesses?.length !== 1 ? 's' : ''} using this
          </span>
        </div>
      </div>

      {/* Prompt */}
      <div className="bg-[#111827] border border-white/5 rounded-xl p-5 mb-4">
        <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Call Script</h2>
        <pre className="text-white/70 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-black/20 rounded-lg p-4 border border-white/5">
          {template.base_prompt}
        </pre>
      </div>

      {/* Scoring */}
      {template.scoring_criteria && (
        <div className="bg-[#111827] border border-white/5 rounded-xl p-5 mb-4">
          <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Scoring Criteria</h2>
          <p className="text-white/60 text-sm leading-relaxed">{template.scoring_criteria}</p>
        </div>
      )}

      {/* Questions */}
      {template.questions?.length > 0 && (
        <div className="bg-[#111827] border border-white/5 rounded-xl p-5 mb-4">
          <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
            <MessageSquare size={12} />
            Qualifying Questions
          </h2>
          <div className="space-y-3">
            {template.questions.map((q: { id: string; question: string; purpose: string }, i: number) => (
              <div key={q.id} className="flex gap-3">
                <span className="text-white/20 text-xs font-mono mt-0.5 flex-shrink-0">{i + 1}.</span>
                <div>
                  <p className="text-white/80 text-sm">{q.question}</p>
                  <p className="text-white/30 text-xs mt-0.5">{q.purpose}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clients using this template */}
      {businesses && businesses.length > 0 && (
        <div className="bg-[#111827] border border-white/5 rounded-xl p-5">
          <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Clients Using This Template</h2>
          <div className="space-y-2">
            {businesses.map(biz => (
              <Link
                key={biz.id}
                href={`/admin/clients/${biz.id}`}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/3 hover:bg-white/5 transition-colors"
              >
                <span className="text-white/70 text-sm">{biz.name}</span>
                <span className="text-white/30 text-xs">{biz.industry}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
