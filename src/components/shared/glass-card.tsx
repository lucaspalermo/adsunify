"use client"

import { type ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  glowColor?: string
  onClick?: () => void
  layoutId?: string
  [key: string]: unknown
}

export function GlassCard({ children, className, hover = true, glow = false, onClick, layoutId, ...rest }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      layoutId={layoutId}
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900/50",
        hover && "hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700 dark:hover:shadow-zinc-900/50",
        glow && "ring-2 ring-violet-500/20 border-violet-300 dark:border-violet-500/30 dark:ring-violet-500/10",
        className
      )}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export default GlassCard
