"use client"

import { useRef, useState, type ReactNode, type MouseEvent } from "react"
import { motion, useSpring, useMotionValue } from "framer-motion"
import { cn } from "@/lib/utils"

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  variant?: "primary" | "secondary" | "ghost"
  size?: "md" | "lg"
  onClick?: () => void
  href?: string
}

export function MagneticButton({
  children,
  className,
  variant = "primary",
  size = "md",
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 })
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 })

  function handleMouse(e: MouseEvent) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) * 0.3)
    y.set((e.clientY - centerY) * 0.3)
  }

  function handleLeave() {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  const variants = {
    primary:
      "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white shadow-2xl shadow-violet-500/25",
    secondary:
      "border border-white/10 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10",
    ghost: "text-zinc-400 hover:text-white",
  }

  const sizes = {
    md: "h-11 px-6 text-sm",
    lg: "h-14 px-10 text-base",
  }

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300",
        variants[variant],
        sizes[size],
        isHovered && variant === "primary" && "shadow-violet-500/50",
        className
      )}
    >
      {/* Glow overlay on hover */}
      {variant === "primary" && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 opacity-0 blur-xl"
          animate={{ opacity: isHovered ? 0.4 : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  )
}
