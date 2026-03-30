"use client"

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { cn } from "@/lib/utils"

interface DataPoint {
  name: string
  [key: string]: string | number
}

interface AreaChartCardProps {
  data: DataPoint[]
  dataKey: string
  secondaryKey?: string
  title: string
  subtitle?: string
  color?: string
  secondaryColor?: string
  height?: number
  className?: string
  valuePrefix?: string
  valueSuffix?: string
}

function CustomTooltip({ active, payload, label, prefix = "", suffix = "" }: any) {
  if (!active || !payload) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
      <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {prefix}{typeof entry.value === "number" ? entry.value.toLocaleString("pt-BR") : entry.value}{suffix}
        </p>
      ))}
    </div>
  )
}

export function AreaChartCard({
  data,
  dataKey,
  secondaryKey,
  title,
  subtitle,
  color = "#6366f1",
  secondaryColor = "#8b5cf6",
  height = 250,
  className,
  valuePrefix = "",
  valueSuffix = "",
}: AreaChartCardProps) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50", className)}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 dark:text-zinc-400">{subtitle}</p>}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            {secondaryKey && (
              <linearGradient id={`gradient-${secondaryKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={secondaryColor} stopOpacity={0.2} />
                <stop offset="100%" stopColor={secondaryColor} stopOpacity={0} />
              </linearGradient>
            )}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.06)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip prefix={valuePrefix} suffix={valueSuffix} />} />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#gradient-${dataKey})`} />
          {secondaryKey && (
            <Area type="monotone" dataKey={secondaryKey} stroke={secondaryColor} strokeWidth={2} fill={`url(#gradient-${secondaryKey})`} />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
