"use client"

import { useEffect, useRef } from "react"
import { useMotionValue, useTransform, animate, motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
}

export function AnimatedCounter({
  value,
  duration = 1.5,
  className,
  prefix,
  suffix,
}: AnimatedCounterProps) {
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (latest) =>
    Math.round(latest).toLocaleString("pt-BR")
  )
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      type: "spring",
      stiffness: 50,
      damping: 20,
    })

    return () => controls.stop()
  }, [motionValue, value, duration])

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      <motion.span ref={ref}>{rounded}</motion.span>
      {suffix}
    </span>
  )
}

export default AnimatedCounter
