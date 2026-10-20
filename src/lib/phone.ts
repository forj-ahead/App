// US phone helpers. Numbers are stored as E.164 (+1XXXXXXXXXX) and shown as +1 (XXX) XXX-XXXX.

export function toE164(input: string): string | null {
  const digits = input.replace(/\D/g, '')
  const local = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
  return local.length === 10 ? `+1${local}` : null
}

export function formatPhone(e164: string | null | undefined): string {
  if (!e164) return '—'
  const local = e164.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '')
  if (local.length !== 10) return e164
  return `+1 (${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`
}

// Formats a number while it's being typed: "7035" -> "(703) 5"
export function formatAsTyped(input: string): string {
  let digits = input.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1)
  digits = digits.slice(0, 10)
  if (digits.length <= 3) return digits.length ? `(${digits}` : ''
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}
