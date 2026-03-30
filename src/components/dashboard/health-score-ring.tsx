"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { AnimatedCounter } from "@/components/shared/animated-counter"

interface HealthScoreRingProps {
  score: number
  size?: number
  className?: string
}

function getScoreColor(score: number): string {
  if (score <= 30) return "#ef4444"
  if (score <= 60) return "#eab308"
  if (score <= 80) return "#3b82f6"
  return "#22c55e"
}

export function HealthScoreRing({
  score,
  size = 200,
  className,
}: HealthScoreRingProps) {
  const [mounted, setMounted] = useState(false)
  const color = getScoreColor(score)

  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-30"
          style={{
            background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
          }}
        />

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg]"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
          />

          {/* Animated score arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{
              strokeDashoffset: mounted ? strokeDashoffset : circumference,
            }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            style={{
              filter: `drop-shadow(0 0 8px ${color}80)`,
            }}
          />

          {/* Pulsing overlay arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={mounted ? strokeDashoffset : circumference}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              filter: `drop-shadow(0 0 12px ${color}60)`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedCounter
            value={score}
            className="text-5xl font-bold text-slate-900"
          />
        </div>
      </div>

      <span className="mt-3 text-sm font-medium text-slate-500">
        Saúde do Marketing
      </span>
    </div>
  )
}

export default HealthScoreRing
