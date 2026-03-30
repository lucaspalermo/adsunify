"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts"
import { cn } from "@/lib/utils"

interface DataPoint {
  name: string
  value: number
  color?: string
}

interface BarChartCardProps {
  data: DataPoint[]
  title: string
  subtitle?: string
  color?: string
  height?: number
  className?: string
  valuePrefix?: string
}

function CustomTooltip({ active, payload, label, prefix = "" }: any) {
  if (!active || !payload) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
      <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">{label}</p>
      <p className="text-sm font-semibold text-indigo-500">
        {prefix}{payload[0]?.value?.toLocaleString("pt-BR")}
      </p>
    </div>
  )
}

export function BarChartCard({
  data,
  title,
  subtitle,
  color = "#6366f1",
  height = 250,
  className,
  valuePrefix = "",
}: BarChartCardProps) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50", className)}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 dark:text-zinc-400">{subtitle}</p>}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.06)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip prefix={valuePrefix} />} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color || color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
