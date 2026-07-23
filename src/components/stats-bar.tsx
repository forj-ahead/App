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
    { label: 'New Leads', value: stats.newLeads, accent: true },
    { label: 'Total Leads', value: stats.totalLeads, accent: false },
    { label: 'Total Calls', value: stats.totalCalls, accent: false },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map(({ label, value, accent }) => (
        <div
          key={label}
          className={`rounded-xl border px-5 py-4 ${
            accent
              ? 'bg-blue-500/10 border-blue-500/25'
              : 'bg-[#111827] border-slate-700/50'
          }`}
        >
          <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${accent ? 'text-blue-400/80' : 'text-slate-500'}`}>
            {label}
          </p>
          <p className={`text-3xl font-bold tabular-nums tracking-tight ${accent ? 'text-blue-400' : 'text-white'}`}>
            {value}
          </p>
        </div>
      ))}
    </div>
  )
}
