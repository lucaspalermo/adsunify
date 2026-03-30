"use client"

import { useRef, type ReactNode, type MouseEvent } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlowCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
}

export function GlowCard({
  children,
  className,
  glowColor = "rgba(99, 102, 241, 0.15)",
}: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springX = useSpring(mouseX, { stiffness: 500, damping: 50 })
  const springY = useSpring(mouseY, { stiffness: 500, damping: 50 })

  function handleMouse(e: MouseEvent) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm transition-colors duration-300 hover:border-white/[0.15] hover:bg-white/[0.05]",
        className
      )}
    >
      {/* Cursor-following glow */}
      <motion.div
        className="pointer-events-none absolute -inset-px z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at var(--mx) var(--my), ${glowColor}, transparent 40%)`,
          // @ts-expect-error CSS custom properties
          "--mx": springX,
          "--my": springY,
        }}
      />

      {/* Alternate glow using motion template */}
      <motion.div
        className="pointer-events-none absolute -inset-px z-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at ${springX.get()}px ${springY.get()}px, ${glowColor}, transparent 40%)`,
        }}
      />

      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
