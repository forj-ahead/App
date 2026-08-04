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
      recording_url,
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
        recording_url: recording_url ?? null,
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

    // Send SMS alerts to all configured numbers
    const phones: string[] = (business.alert_phones as string[])?.length
      ? (business.alert_phones as string[])
      : business.alert_phone ? [business.alert_phone as string] : []

    if (lead && scored.score >= (business.score_threshold ?? 4) && phones.length && business.sms_alerts_enabled) {
      await Promise.all(phones.map(phone => sendSmsAlert({ business, lead: { ...lead, ...scored }, to: phone })))
    }

    return NextResponse.json({ ok: true, score: scored.score })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

async function scoreLead({ transcript, business }: { transcript: string; business: Record<string, unknown> }) {
  console.log('ANTHROPIC_API_KEY present:', !!process.env.ANTHROPIC_API_KEY, 'transcript length:', transcript?.length)
  if (!transcript || !process.env.ANTHROPIC_API_KEY) return null

  const prompt = `You are a lead qualification assistant for a ${business.industry} business called "${business.name}".

Services they OFFER: ${(business.services_offered as string[])?.join(', ') || 'general services'}
Services they DO NOT offer: ${(business.services_excluded as string[])?.join(', ') || 'none specified'}

Here is the call transcript:
<transcript>
${transcript}
</transcript>

Analyze this call and respond with a JSON object containing:
- score: number 1-5 (5 = perfect lead, 1 = completely unqualified)
- callerName: string or null (first name if mentioned)
- serviceRequested: string (what they need in 1 short phrase)
- summary: string (2-3 sentences, plain English, what this caller needs and why they called)
- reasoning: string (1-2 sentences explaining the score)

Scoring guide: 5 = ready to book, clear need, decision maker. 4 = good lead, needs follow-up. 3 = possible, unclear intent. 2 = unlikely fit. 1 = wrong service, outside area, or solicitor.
If the caller is asking for a service this business does not offer, score must be 1-2.
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

  if (!res.ok) {
    const errBody = await res.text()
    console.error('Anthropic API error:', res.status, errBody)
    return null
  }

  const data = await res.json()
  try {
    const raw = data.content[0].text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
    return JSON.parse(raw)
  } catch (e) {
    console.error('JSON parse error:', e, data.content?.[0]?.text)
    return null
  }
}

async function sendSmsAlert({ business, lead, to }: { business: Record<string, unknown>; lead: Record<string, unknown>; to: string }) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) return

  const body = `New Lead ${lead.score}/5 — ${lead.caller_name ?? lead.caller_number}\n${lead.service_requested}\n\n${lead.summary}\n\nCall back: ${lead.caller_number}\nView lead: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads/${lead.id}`

  const params: Record<string, string> = {
    To: to,
    Body: body,
  }

  // Use messaging service (A2P registered) if available, otherwise fall back to direct number
  if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
    params.MessagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID
  } else {
    params.From = process.env.TWILIO_PHONE_NUMBER!
  }

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params).toString(),
    }
  )

  const result = await res.json()
  if (result.error_code) {
    console.error('Twilio SMS error:', result.error_code, result.error_message, 'to:', to)
  } else {
    console.log('SMS sent:', result.sid, 'status:', result.status, 'to:', to)
  }
}
