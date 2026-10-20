// Caller types come from a business's scoring_instructions (e.g. Kirila: "client" | "applicant").
// Most businesses don't set one, so a missing type means a normal client lead.

export function normalizeCallerType(type: unknown): string | null {
  return typeof type === 'string' && type.trim() ? type.trim().toLowerCase() : null
}

export function isClientLead(lead: { caller_type?: string | null }) {
  const type = normalizeCallerType(lead.caller_type)
  return !type || type === 'client'
}

// "applicant" -> "Applicant"
export function callerTypeLabel(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}
