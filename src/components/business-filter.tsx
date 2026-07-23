'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface Business {
  id: string
  name: string
}

export function BusinessFilter({ businesses }: { businesses: Business[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('business') ?? ''

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    if (val) params.set('business', val)
    else params.delete('business')
    router.push(`?${params.toString()}`)
  }

  return (
    <select
      value={current}
      onChange={onChange}
      className="bg-[#111827] text-white text-sm border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      <option value="">All clients</option>
      {businesses.map(b => (
        <option key={b.id} value={b.id}>{b.name}</option>
      ))}
    </select>
  )
}
