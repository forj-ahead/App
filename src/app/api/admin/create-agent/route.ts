import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const TONE_DESCRIPTIONS: Record<string, string> = {
  friendly:     'warm, upbeat, and personable — like talking to a helpful neighbor',
  professional: 'polished and businesslike — confident and efficient',
  casual:       'relaxed and conversational — like chatting with someone you already know',
  concise:      'direct and to the point — no small talk, just get the info and wrap up',
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
    faqs,
    extraContext,
  } = body

  const apiKey = process.env.RETELL_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Retell API key not configured' }, { status: 500 })

  const toneDesc = TONE_DESCRIPTIONS[tone] ?? TONE_DESCRIPTIONS.friendly

  const greetingLine = greeting
    ? `Always open every call with this exact greeting: "${greeting}"`
    : `Always open every call with a warm, natural greeting — introduce yourself as ${agentName} from ${businessName} and ask how you can help today.`

  const servicesLine = servicesOffered
    ? `Services we OFFER: ${servicesOffered}`
    : `You handle general ${industry} inquiries — use good judgment about what likely fits.`

  const excludedLine = servicesExcluded
    ? `Services we do NOT offer: ${servicesExcluded}. If a caller only needs one of these, let them know kindly and use end_call to close the conversation.`
    : ''

  const areaLine = serviceArea
    ? `We only serve: ${serviceArea}. If the caller is outside this area, let them know politely and use end_call.`
    : ''

  const questionsLine = customQuestions
    ? `Key questions to ask (weave these in naturally — never read them as a list):\n${customQuestions}`
    : `Ask the questions that make sense for a ${industry} business — understand what they need, their timeline, and whether they are the decision maker.`

  const disqualifyLine = disqualifyIf
    ? `Wrap up and use end_call if:\n${disqualifyIf}`
    : `Wrap up and use end_call if the caller clearly does not need ${industry} services, is just price shopping with no intent to move forward, is outside the service area, or is a solicitor.`

  const faqsLine = faqs
    ? `\nFREQUENTLY ASKED QUESTIONS — answer these naturally if a caller asks:\n${faqs}`
    : ''

  const extraLine = extraContext ? `\nAdditional context:\n${extraContext}` : ''

  const generalPrompt = `You are ${agentName}, the call answering agent for ${businessName}, a ${industry} business. Your tone is ${toneDesc}.

${greetingLine}

${servicesLine}
${excludedLine}
${areaLine}

Your job is to have a genuine, unhurried conversation with the caller — not run through a checklist. Listen first, then ask questions naturally as the conversation develops. Never fire multiple questions at once.

As you talk, find out:
- What they are looking for and why they are calling
- ${questionsLine}
- Their name and best callback number (always get these before ending)

${disqualifyLine}

Once you have everything you need, let the caller know someone from the team will be in touch soon. Say a warm, natural goodbye — then use end_call to hang up. Never say the words "end call" out loud.

Never make promises about pricing, exact timelines, or availability. If you are unsure about something, tell them the team will follow up with those details.${faqsLine}${extraLine}`

  // Create Retell LLM with gpt-4o for best conversation quality
  const llmRes = await fetch('https://api.retellai.com/create-retell-llm', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      general_prompt: generalPrompt,
      general_tools: [
        {
          type: 'end_call',
          name: 'end_call',
          description: 'Silently end the phone call. Only call this after you have finished your goodbye — never say the words "end call" out loud.',
          speak_after_execution: false,
        },
      ],
      states: [
        {
          name: 'information_collection',
          state_prompt: `Greet the caller and begin a natural conversation to understand what they need. Gather their name, callback number, and the key qualifying information. Do not rush — let the conversation flow.`,
          edges: [
            { description: 'Caller is not a fit — outside service area, needs a service not offered, is a solicitor, or has no intent to move forward', destination_state_name: 'not_a_fit' },
            { description: 'All key information collected — name, callback number, and what they need is clear', destination_state_name: 'wrap_up' },
          ],
        },
        {
          name: 'not_a_fit',
          state_prompt: 'Politely explain why you cannot help. Be kind and genuine. Wish them well, say a warm goodbye, then immediately call end_call.',
          edges: [],
        },
        {
          name: 'wrap_up',
          state_prompt: 'Thank the caller. Confirm you have their name and best callback number. Let them know someone from the team will follow up soon. Say a warm, natural goodbye — then immediately call end_call.',
          edges: [],
        },
      ],
      starting_state: 'information_collection',
    }),
  })

  if (!llmRes.ok) {
    const err = await llmRes.text()
    return NextResponse.json({ error: `Retell LLM error: ${err}` }, { status: 500 })
  }

  const llm = await llmRes.json()

  // Create Retell Agent — cartesia-Sarah, American female, natural sounding
  const agentRes = await fetch('https://api.retellai.com/create-agent', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agent_name: `${businessName} — ${agentName}`,
      response_engine: { type: 'retell-llm', llm_id: llm.llm_id },
      voice_id: 'cartesia-Sarah',
      webhook_url: 'https://app.forjahead.com/api/webhooks/retell',
    }),
  })

  if (!agentRes.ok) {
    const err = await agentRes.text()
    return NextResponse.json({ error: `Retell agent error: ${err}` }, { status: 500 })
  }

  const agent = await agentRes.json()
  return NextResponse.json({ agentId: agent.agent_id, llmId: llm.llm_id })
}
