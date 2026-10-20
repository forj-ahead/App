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

  // Spoken word-for-word by the Welcome node
  const greetingText = greeting
    || `Thanks for calling ${businessName}, this is ${agentName}. How can I help you today?`

  const servicesLine = servicesOffered
    ? `Services we OFFER: ${servicesOffered}`
    : `You handle general ${industry} inquiries — use good judgment about what likely fits.`

  const excludedLine = servicesExcluded
    ? `Services we do NOT offer: ${servicesExcluded}. If a caller only needs one of these, let them know kindly and wrap up.`
    : ''

  const areaLine = serviceArea
    ? `We only serve: ${serviceArea}. If the caller is outside this area, let them know politely and wrap up.`
    : ''

  const questionsLine = customQuestions
    ? `Key questions to ask (weave these in naturally — never read them as a list):\n${customQuestions}`
    : `Ask the questions that make sense for a ${industry} business — understand what they need, their timeline, and whether they are the decision maker.`

  const disqualifyLine = disqualifyIf
    ? `The caller is not a fit if:\n${disqualifyIf}`
    : `The caller is not a fit if they clearly do not need ${industry} services, are just price shopping with no intent to move forward, are outside the service area, or are a solicitor.`

  const faqsLine = faqs
    ? `\nFREQUENTLY ASKED QUESTIONS — answer these naturally if a caller asks:\n${faqs}`
    : ''

  const extraLine = extraContext ? `\nAdditional context:\n${extraContext}` : ''

  // Shared by every node; node instructions only cover that step of the call
  const globalPrompt = `You are ${agentName}, the call answering agent for ${businessName}, a ${industry} business. Your tone is ${toneDesc}.

${servicesLine}
${excludedLine}
${areaLine}

Have a genuine, unhurried conversation with the caller — not a checklist. Listen first, then ask questions naturally. Never ask more than one question at a time.

Never make promises about pricing, exact timelines, or availability. If you are unsure about something, tell them the team will follow up with those details.

Never say the words "end call" out loud.${faqsLine}${extraLine}`

  const saidGoodbye = 'The agent has said goodbye to the caller'

  const flowRes = await fetch('https://api.retellai.com/create-conversation-flow', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      start_speaker: 'agent',
      model_choice: { type: 'cascading', model: 'gpt-4.1' },
      global_prompt: globalPrompt,
      start_node_id: 'welcome',
      nodes: [
        {
          id: 'welcome',
          name: 'Welcome',
          type: 'conversation',
          instruction: { type: 'static_text', text: greetingText },
          display_position: { x: 0, y: 0 },
          edges: [
            { id: 'welcome-to-qualify', transition_condition: { type: 'prompt', prompt: 'The caller has responded' }, destination_node_id: 'qualify' },
          ],
        },
        {
          id: 'qualify',
          name: 'Qualify',
          type: 'conversation',
          instruction: {
            type: 'prompt',
            text: `Understand what the caller needs and qualify them. As you talk, find out:
- What they are looking for and why they are calling
- ${questionsLine}
- Their name and best callback number (always get these)

${disqualifyLine}`,
          },
          display_position: { x: 400, y: 0 },
          edges: [
            { id: 'qualify-to-not-a-fit', transition_condition: { type: 'prompt', prompt: 'The caller is not a fit for this business' }, destination_node_id: 'not_a_fit' },
            { id: 'qualify-to-wrap-up', transition_condition: { type: 'prompt', prompt: 'Name, callback number, and what they need are all clear' }, destination_node_id: 'wrap_up' },
          ],
        },
        {
          id: 'not_a_fit',
          name: 'Not a Fit',
          type: 'conversation',
          instruction: { type: 'prompt', text: 'Politely explain why you cannot help. Be kind and genuine. Wish them well and say a warm goodbye.' },
          display_position: { x: 800, y: -200 },
          edges: [
            { id: 'not-a-fit-to-end', transition_condition: { type: 'prompt', prompt: saidGoodbye }, destination_node_id: 'end' },
          ],
        },
        {
          id: 'wrap_up',
          name: 'Wrap Up',
          type: 'conversation',
          instruction: { type: 'prompt', text: 'Thank the caller. Read back their name and best callback number to confirm. Let them know someone from the team will follow up soon, then say a warm, natural goodbye.' },
          display_position: { x: 800, y: 200 },
          edges: [
            { id: 'wrap-up-to-end', transition_condition: { type: 'prompt', prompt: saidGoodbye }, destination_node_id: 'end' },
          ],
        },
        {
          id: 'end',
          name: 'End Call',
          type: 'end',
          display_position: { x: 1200, y: 0 },
        },
      ],
    }),
  })

  if (!flowRes.ok) {
    const err = await flowRes.text()
    return NextResponse.json({ error: `Retell conversation flow error: ${err}` }, { status: 500 })
  }

  const flow = await flowRes.json()

  // Create Retell Agent — cartesia-Sarah, American female, natural sounding
  const agentRes = await fetch('https://api.retellai.com/create-agent', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agent_name: `${businessName} — ${agentName}`,
      response_engine: { type: 'conversation-flow', conversation_flow_id: flow.conversation_flow_id },
      voice_id: 'cartesia-Sarah',
      webhook_url: 'https://app.forjahead.com/api/webhooks/retell',
    }),
  })

  if (!agentRes.ok) {
    const err = await agentRes.text()
    return NextResponse.json({ error: `Retell agent error: ${err}` }, { status: 500 })
  }

  const agent = await agentRes.json()
  return NextResponse.json({ agentId: agent.agent_id, conversationFlowId: flow.conversation_flow_id })
}
