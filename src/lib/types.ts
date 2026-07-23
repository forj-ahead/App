export type UserRole = 'admin' | 'client'
export type LeadStatus = 'new' | 'contacted' | 'closed' | 'disqualified'
export type CallStatus = 'completed' | 'failed' | 'in_progress'

export interface Business {
  id: string
  name: string
  industry: string
  template_id: string | null
  retell_agent_id: string | null
  twilio_number: string | null
  services_offered: string[]
  services_excluded: string[]
  score_threshold: number
  alert_phone: string | null
  sms_alerts_enabled: boolean
  created_at: string
}

export interface Call {
  id: string
  business_id: string
  retell_call_id: string
  caller_number: string
  duration_seconds: number
  transcript: string | null
  status: CallStatus
  created_at: string
}

export interface Lead {
  id: string
  call_id: string
  business_id: string
  caller_number: string
  caller_name: string | null
  service_requested: string | null
  score: number
  score_reasoning: string | null
  summary: string | null
  status: LeadStatus
  notes: string | null
  created_at: string
  calls?: Call
}

export interface Template {
  id: string
  name: string
  industry: string
  base_prompt: string
  questions: QualifyingQuestion[]
  scoring_criteria: string
  created_at: string
}

export interface QualifyingQuestion {
  id: string
  question: string
  purpose: string
}

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  business_id: string | null
  phone: string | null
  created_at: string
}
