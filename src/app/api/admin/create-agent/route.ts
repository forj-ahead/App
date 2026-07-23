import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    agentName,
    servicesOffered,
    servicesExcluded,
    serviceArea,
    customQuestions,
    disqualifyIf,
    extraContext,
  } = body

  const apiKey = process.env.RETELL_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Retell API key not configured' }, { status: 500 })

  const offeredList = servicesOffered || 'general services'
  const excludedList = servicesExcluded || 'none specified'
  const areaText = serviceArea ? `Service area: ${serviceArea}.` : ''
  const questionsText = customQuestions
    ? `\n\nAdditional questions to ask:\n${customQuestions}`
    : ''
  const disqualifyText = disqualifyIf
    ? `\n\nDisqualify (score 1–3 and end the call politely) if:\n${disqualifyIf}`
    : ''
  const extraText = extraContext ? `\n\nAdditional context:\n${extraContext}` : ''

  const prompt = `You are ${agentName || 'a friendly assistant'}, a call answering agent for ${businessName}, a ${industry} company. Your job is to answer inbound calls, understand what the caller needs, and qualify them as a potential lead.

${areaText}
Services we OFFER: ${offeredList}
Services we do NOT offer: ${excludedList}

When a caller contacts us:
1. Greet them warmly and ask how you can help.
2. Listen to what they need. If they're asking for a service we don't offer, let them know politely and wish them well — do not continue qualifying.
3. Ask clarifying questions to understand their situation, timeline, and fit.
4. Always collect: their name, phone number or best way to reach them, and a brief description of what they need.${questionsText}${disqualifyText}${extraText}

Keep conversations warm, natural, and brief. Do not oversell or make promises about pricing or availability. End every qualified call by letting them know someone will follow up shortly.`

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
      agent_name: `${businessName} — ${agentName || 'Agent'}`,
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
