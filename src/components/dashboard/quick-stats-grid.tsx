"use client"

import { motion } from "framer-motion"
import { Users, Search, FileText, Zap, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/shared/glass-card"
import { AnimatedCounter } from "@/components/shared/animated-counter"

interface StatCard {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  change: string
  changeType: "positive" | "neutral"
}

const stats: StatCard[] = [
  {
    title: "Visitantes este mês",
    value: 1247,
    icon: Users,
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-600",
    change: "+12.5%",
    changeType: "positive",
  },
  {
    title: "Palavras no Top 10",
    value: 8,
    icon: Search,
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-400",
    change: "+3",
    changeType: "positive",
  },
  {
    title: "Conteúdos publicados",
    value: 12,
    icon: FileText,
    iconBg: "bg-cyan-500/15",
    iconColor: "text-cyan-400",
    change: "+2",
    changeType: "positive",
  },
  {
    title: "XP Total",
    value: 2450,
    icon: Zap,
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
    change: "Nível 5",
    changeType: "neutral",
  },
]

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}

export function QuickStatsGrid({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4", className)}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <motion.div key={stat.title} variants={item}>
            <GlassCard className="p-4 flex items-start gap-4">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  stat.iconBg
                )}
              >
                <Icon className={cn("h-5 w-5", stat.iconColor)} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 truncate">
                  {stat.title}
                </p>
                <AnimatedCounter
                  value={stat.value}
                  className="text-xl font-bold text-slate-900 dark:text-zinc-100"
                />
                <div className="mt-1 flex items-center gap-1">
                  {stat.changeType === "positive" && (
                    <ArrowUp className="h-3 w-3 text-green-400" />
                  )}
                  <span
                    className={cn(
                      "text-xs font-medium",
                      stat.changeType === "positive"
                        ? "text-green-400"
                        : "text-slate-500 dark:text-zinc-400"
                    )}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

export default QuickStatsGrid
