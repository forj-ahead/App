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
    {
      label: 'New Leads',
      value: stats.newLeads,
      sub: 'awaiting follow-up',
      accent: true,
    },
    {
      label: 'Total Leads',
      value: stats.totalLeads,
      sub: 'all time',
      accent: false,
    },
    {
      label: 'Total Calls',
      value: stats.totalCalls,
      sub: 'all time',
      accent: false,
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map(({ label, value, sub, accent }) => (
        <div
          key={label}
          className={`rounded-xl border p-5 ${
            accent
              ? 'bg-[#2D6FE8]/10 border-[#2D6FE8]/25'
              : 'bg-[#0D1525] border-white/[0.06]'
          }`}
        >
          <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${accent ? 'text-[#4D8BF0]/70' : 'text-white/30'}`}>
            {label}
          </p>
          <p className={`text-4xl font-black tabular-nums tracking-tight ${accent ? 'text-[#4D8BF0]' : 'text-white'}`}>
            {value}
          </p>
          <p className={`text-xs mt-1.5 ${accent ? 'text-[#4D8BF0]/40' : 'text-white/20'}`}>{sub}</p>
        </div>
      ))}
    </div>
  )
}
