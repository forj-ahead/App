@AGENTS.md

# Forj — Project Context & SOPs

Forj is an AI call answering and lead qualification SaaS built by James Bamberger. Clients are service businesses (roofers, landscapers, HVAC, etc.). The AI agent answers inbound calls, qualifies leads, and surfaces them in a dashboard.

**Stack:** Next.js 15 App Router, Supabase (Postgres + RLS), Retell AI (voice agents), Stripe (billing), Cloudflare Pages (marketing site), Vercel (app).

**Repos:**
- App: `jjbam/forj-app` → `app.forjahead.com`
- Marketing: `forj-ahead/Forj` → `forjahead.com`

**Key env vars** (all in `.env.local` and Vercel):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `RETELL_API_KEY`
- `STRIPE_SECRET_KEY` — live key
- `STRIPE_TEST_KEY` — test key

---

## Client Onboarding SOP

When James says he is onboarding a new client, follow this process in order.

### Step 1 — Send payment link
Send the client the Stripe payment link before doing anything else:
**`https://buy.stripe.com/14A4gAd1W6rl3CN4K98AE00`**
$199/mo recurring. Confirm payment before proceeding.

### Step 2 — Gather client info
Use the onboarding form at `app.forjahead.com/admin/clients/new`. Collect:
- Business name and industry
- Contact name and email
- Services offered (comma separated)
- Services NOT offered
- Service area
- Score threshold (default 4 out of 5)
- Agent name (default Maya)
- Tone (friendly / professional / casual / concise)
- Opening greeting (optional — auto-generates if blank)
- Custom qualifying questions (optional)
- Disqualify conditions (optional)
- FAQs (one Q&A per line — fetch from their website if available)
- Extra context

If the client has a website, fetch their FAQ and services pages to pre-fill the form.

### Step 3 — Submit the onboarding form
Submitting automatically:
1. Creates a `businesses` record in Supabase
2. Calls `/api/admin/create-agent` which builds a prompt, creates a Retell LLM (`gpt-4o-mini`), and creates a Retell agent (voice: `cartesia-Sarah`)
3. Saves `retell_agent_id` back to the business record
4. Shows success screen with agent ID and remaining steps

### Step 4 — Buy a phone number in Retell
Buy via Retell API with an area code close to the client's location, assign the agent to the number. Add the number to the client record in Forj (`+1XXXXXXXXXX` format).

### Step 5 — Set the webhook on the agent
Every agent must have this webhook or calls won't appear in the dashboard:
```
https://app.forjahead.com/api/webhooks/retell
```
Set via: `PATCH https://api.retellai.com/update-agent/AGENT_ID` with `{"webhook_url": "..."}`

### Step 6 — Create the client's user account
Use Supabase admin API with the service role key to create an auth user, then link to the business in the `users` table with `role: client`.

### Step 7 — Test the agent
Call the Retell number. Verify:
- Agent answers with the opening greeting
- Asks qualifying questions naturally
- Collects name and callback number
- Ends the call cleanly (no narrating "end call" out loud)
- Call and lead appear in the Forj dashboard after hanging up

### Step 8 — Set up call forwarding with the client
Do together on the onboarding call:
- **Verizon/AT&T (unanswered calls):** dial `*71` + Retell number, press call. Wait for confirmation tone.
- **Cancel:** dial `*73`
- **T-Mobile:** use T-Mobile app → Calls → Call Forwarding
- Only needs to be done once.

---

## Scoring Scale
Leads are scored **1–5**:
- **5** — perfect lead, call back immediately
- **4** — good lead, follow up today
- **3** — maybe, follow up if slow
- **1–2** — not a fit

Default qualify threshold: **4+**

## Agent Prompt Standards
All agents must:
- Use `general_tools` with `end_call` (`speak_after_execution: false`)
- Have three states: `information_collection` → `not_a_fit` / `wrap_up`
- Use an American voice (default: `cartesia-Sarah`)
- Never say "end call" out loud — hang up silently after natural goodbye
- Have webhook URL set to `https://app.forjahead.com/api/webhooks/retell`

## Key Supabase Tables
- `businesses` — one per client. Has `retell_agent_id`, `twilio_number`, `score_threshold`, `services_offered`, `services_excluded`
- `users` — has `role` (admin | client) and `business_id`
- `calls` — every inbound call. Has `transcript`, `duration_seconds`, `retell_call_id`
- `leads` — qualified leads linked to calls. Has `score` (1–5), `score_reasoning`, `summary`, `status`, `notes`

## Current Clients
- **Elliott Land Management** — Chase Elliott, landscaping, agent: `agent_0c6facf840a7233887a16dc20a`
- **Reborn Roofing** — Brett Kittleson (`brett@rebornroofing.com`), Memphis TN, agent: `agent_98994854ba133c544289b181d2`, number: +19012953534

## Stripe
- Live payment link: `https://buy.stripe.com/14A4gAd1W6rl3CN4K98AE00` ($199/mo)
- Product ID: `prod_Uy9UOHnMFFWasL`
- Price ID: `price_1TyDBaJGepYXWGdjZYVanXXS`
- Send payment link BEFORE onboarding. Confirm payment before creating the agent.
