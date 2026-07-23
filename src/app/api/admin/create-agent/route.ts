import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const TONE_DESCRIPTIONS: Record<string, string> = {
  friendly: 'warm, upbeat, and personable — like talking to a helpful neighbor',
  professional: 'polished and businesslike — confident and efficient',
  casual: 'relaxed and conversational — like chatting with someone you know',
  concise: 'direct and to the point — no small talk, just get the info and wrap up',
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const {
    businessName,
    industry,
    agentName = 'Maya',
    tone = 'friendly',
    greeting,
    servicesOffered,
    servicesExcluded,
    serviceArea,
    customQuestions,
    disqualifyIf,
    extraContext,
  } = body

  const apiKey = process.env.RETELL_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Retell API key not configured' }, { status: 500 })

  const toneDesc = TONE_DESCRIPTIONS[tone] ?? TONE_DESCRIPTIONS.friendly

  const greetingLine = greeting
    ? `Always open with this exact greeting: "${greeting}"`
    : `Open with a warm, natural greeting — introduce yourself as ${agentName} from ${businessName} and ask how you can help.`

  const servicesLine = servicesOffered
    ? `Services we OFFER: ${servicesOffered}`
    : `You handle general ${industry} inquiries — use your judgment on what likely fits.`

  const excludedLine = servicesExcluded
    ? `Services we do NOT offer (politely decline and end the call): ${servicesExcluded}`
    : ''

  const areaLine = serviceArea
    ? `We only serve: ${serviceArea}. If the caller is outside this area, let them know politely and end the call.`
    : ''

  const questionsLine = customQuestions
    ? `Key questions to ask (weave these in naturally — don't read them as a list):\n${customQuestions}`
    : `Ask the questions that make sense for a ${industry} business — understand what they need, their timeline, and whether they're the decision maker.`

  const disqualifyLine = disqualifyIf
    ? `Score 1–3 and wrap up politely if:\n${disqualifyIf}`
    : `Score 1–3 if the caller clearly doesn't need ${industry} services, is just price fishing with no intent to move forward, or is outside any stated service area.`

  const extraLine = extraContext ? `\nAdditional context:\n${extraContext}` : ''

  const prompt = `You are ${agentName}, a call answering agent for ${businessName}, a ${industry} business. Your tone should be ${toneDesc}.

${greetingLine}

${servicesLine}
${excludedLine}
${areaLine}

Your job:
1. Understand what the caller needs.
2. ${questionsLine}
3. Always collect: the caller's name and best callback number before ending the call.
4. ${disqualifyLine}
5. End every qualified call by letting them know someone will follow up shortly.

Keep conversations natural and don't rush. Never make promises about pricing, availability, or timelines.${extraLine}`

  // Create Retell LLM
  const llmRes = await fetch('https://api.retellai.com/create-retell-llm', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      general_prompt: prompt,
    }),
  })

  if (!llmRes.ok) {
    const err = await llmRes.text()
    return NextResponse.json({ error: `Retell LLM error: ${err}` }, { status: 500 })
  }

  const llm = await llmRes.json()

  // Create Retell Agent
  const agentRes = await fetch('https://api.retellai.com/create-agent', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agent_name: `${businessName} — ${agentName}`,
      response_engine: { type: 'retell-llm', llm_id: llm.llm_id },
      voice_id: 'elevenlabs-Adrian',
    }),
  })

  if (!agentRes.ok) {
    const err = await agentRes.text()
    return NextResponse.json({ error: `Retell agent error: ${err}` }, { status: 500 })
  }

  const agent = await agentRes.json()
  return NextResponse.json({ agentId: agent.agent_id, llmId: llm.llm_id })
}
