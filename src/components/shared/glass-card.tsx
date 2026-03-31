"use client"

import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  onClick?: () => void
  glowColor?: string
  layoutId?: string
}

export function GlassCard({ children, className, hover = true, glow = false, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900/50",
        hover && "hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-zinc-700 dark:hover:shadow-zinc-900/50",
        glow && "ring-2 ring-violet-500/20 border-violet-300 dark:border-violet-500/30 dark:ring-violet-500/10",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  )
}

export default GlassCard
