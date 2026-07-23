-- Run this in your Supabase SQL editor

-- Templates (industry call scripts)
create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text not null,
  base_prompt text not null,
  questions jsonb not null default '[]',
  scoring_criteria text,
  created_at timestamptz default now()
);

-- Businesses (your clients)
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text not null,
  template_id uuid references templates(id),
  retell_agent_id text,
  twilio_number text,
  services_offered text[] not null default '{}',
  services_excluded text[] not null default '{}',
  score_threshold int not null default 7,
  alert_phone text,
  sms_alerts_enabled boolean not null default true,
  created_at timestamptz default now()
);

-- User profiles (extends Supabase auth.users)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'client' check (role in ('admin', 'client')),
  business_id uuid references businesses(id),
  phone text,
  created_at timestamptz default now()
);

-- Calls (every inbound call)
create table if not exists calls (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id),
  retell_call_id text unique not null,
  caller_number text not null,
  duration_seconds int not null default 0,
  transcript text,
  status text not null default 'completed' check (status in ('completed', 'failed', 'in_progress')),
  created_at timestamptz default now()
);

-- Leads (qualified calls scored by Claude)
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  call_id uuid unique not null references calls(id),
  business_id uuid not null references businesses(id),
  caller_number text not null,
  caller_name text,
  service_requested text,
  score int not null check (score between 1 and 10),
  score_reasoning text,
  summary text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed', 'disqualified')),
  status_updated_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists leads_business_id_idx on leads(business_id);
create index if not exists leads_score_idx on leads(score desc);
create index if not exists calls_business_id_idx on calls(business_id);

-- Row Level Security
alter table businesses enable row level security;
alter table calls enable row level security;
alter table leads enable row level security;
alter table users enable row level security;
alter table templates enable row level security;

-- Users can read their own profile
create policy "users_read_own" on users for select using (auth.uid() = id);

-- Clients see only their business's data
create policy "clients_read_own_business" on businesses for select
  using (id in (select business_id from users where id = auth.uid()));

create policy "clients_read_own_calls" on calls for select
  using (business_id in (select business_id from users where id = auth.uid()));

create policy "clients_read_own_leads" on leads for select
  using (business_id in (select business_id from users where id = auth.uid()));

-- Everyone can read templates
create policy "templates_read_all" on templates for select using (true);

-- Admin function (service role bypasses RLS — used by webhook)
-- The webhook API route uses the service role key, so it can write to all tables without RLS.

-- Create your admin user after signing up:
-- UPDATE users SET role = 'admin' WHERE email = 'james@forjahead.com';
