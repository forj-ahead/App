import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  // Use service role key for webhook — bypasses RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const body = await req.json()
    const { event, call } = body

    if (event !== 'call_ended') {
      return NextResponse.json({ ok: true })
    }

    const {
      call_id,
      to_number,
      from_number,
      transcript,
      duration_ms,
    } = call

    // Look up the business by their Twilio number
    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('twilio_number', to_number)
      .single()

    if (!business) {
      console.error('No business found for number:', to_number)
      return NextResponse.json({ ok: false, error: 'Business not found' }, { status: 404 })
    }

    // Insert call record (idempotent — retell_call_id is unique)
    const { data: callRecord, error: callError } = await supabase
      .from('calls')
      .upsert({
        retell_call_id: call_id,
        business_id: business.id,
        caller_number: from_number,
        duration_seconds: Math.round((duration_ms ?? 0) / 1000),
        transcript: transcript ?? null,
        status: 'completed',
      }, { onConflict: 'retell_call_id' })
      .select()
      .single()

    if (callError || !callRecord) {
      console.error('Call insert error:', callError)
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    // Score the lead with Claude
    const scored = await scoreLead({ transcript, business })

    if (!scored) {
      return NextResponse.json({ ok: true, scored: false })
    }

    // Insert lead
    const { data: lead } = await supabase
      .from('leads')
      .upsert({
        call_id: callRecord.id,
        business_id: business.id,
        caller_number: from_number,
        caller_name: scored.callerName,
        service_requested: scored.serviceRequested,
        score: scored.score,
        score_reasoning: scored.reasoning,
        summary: scored.summary,
        status: 'new',
      }, { onConflict: 'call_id' })
      .select()
      .single()

    // Send SMS alert if score meets threshold
    if (lead && scored.score >= (business.score_threshold ?? 7) && business.alert_phone && business.sms_alerts_enabled) {
      await sendSmsAlert({ business, lead: { ...lead, ...scored } })
    }

    return NextResponse.json({ ok: true, score: scored.score })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

async function scoreLead({ transcript, business }: { transcript: string; business: Record<string, unknown> }) {
  if (!transcript || !process.env.ANTHROPIC_API_KEY) return null

  const prompt = `You are a lead qualification assistant for a ${business.industry} business called "${business.name}".

Services they OFFER: ${(business.services_offered as string[])?.join(', ') || 'general services'}
Services they DO NOT offer: ${(business.services_excluded as string[])?.join(', ') || 'none specified'}

Here is the call transcript:
<transcript>
${transcript}
</transcript>

Analyze this call and respond with a JSON object containing:
- score: number 1-10 (10 = perfect lead, 1 = completely unqualified)
- callerName: string or null (first name if mentioned)
- serviceRequested: string (what they need in 1 short phrase)
- summary: string (2-3 sentences, plain English, what this caller needs and why they called)
- reasoning: string (1-2 sentences explaining the score)

If the caller is asking for a service this business does not offer, score must be 1-3.
Respond with only valid JSON, no markdown.`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) return null

  const data = await res.json()
  try {
    return JSON.parse(data.content[0].text)
  } catch {
    return null
  }
}

async function sendSmsAlert({ business, lead }: { business: Record<string, unknown>; lead: Record<string, unknown> }) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) return

  const body = `🔥 New Lead (${lead.score}/10) — ${lead.caller_number}\n${lead.service_requested}\n\n${lead.summary}\n\nView: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`

  await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: business.alert_phone as string,
        From: process.env.TWILIO_PHONE_NUMBER!,
        Body: body,
      }).toString(),
    }
  )
}
