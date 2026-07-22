interface StatsBarProps {
  stats: {
    totalLeads: number
    totalCalls: number
    newLeads: number
    businessName: string
  }
}

export function StatsBar({ stats }: StatsBarProps) {
  const items = [
    { label: 'New Leads', value: stats.newLeads, highlight: true },
    { label: 'Total Leads', value: stats.totalLeads, highlight: false },
    { label: 'Total Calls', value: stats.totalCalls, highlight: false },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map(({ label, value, highlight }) => (
        <div
          key={label}
          className={`rounded-xl border p-5 ${
            highlight
              ? 'bg-[#2D6FE8]/10 border-[#2D6FE8]/20'
              : 'bg-[#111827] border-white/5'
          }`}
        >
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">{label}</p>
          <p className={`text-3xl font-bold tabular-nums ${highlight ? 'text-[#2D6FE8]' : 'text-white'}`}>
            {value}
          </p>
        </div>
      ))}
    </div>
  )
}
