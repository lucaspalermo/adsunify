"use client"

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts"
import { cn } from "@/lib/utils"

interface RadarDataPoint {
  subject: string
  user: number
  competitor: number
  fullMark: number
}

interface RadarChartCardProps {
  data: RadarDataPoint[]
  title: string
  subtitle?: string
  className?: string
}

export function RadarChartCard({ data, title, subtitle, className }: RadarChartCardProps) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50", className)}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 dark:text-zinc-400">{subtitle}</p>}
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(99,102,241,0.1)" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#71717a" }} />
          <PolarRadiusAxis tick={false} axisLine={false} />
          <Radar name="Voce" dataKey="user" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
          <Radar name="Concorrente" dataKey="competitor" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "12px",
              fontSize: "12px",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center justify-center gap-6 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-indigo-500" /> Voce
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" /> Concorrente
        </span>
      </div>
    </div>
  )
}
