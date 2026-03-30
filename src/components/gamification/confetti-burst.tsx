"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ConfettiParticle {
  id: number
  x: number
  y: number
  rotation: number
  color: string
  size: number
  shape: "square" | "circle"
}

const COLORS = [
  "#facc15",
  "#fb923c",
  "#a78bfa",
  "#34d399",
  "#f472b6",
  "#60a5fa",
  "#f87171",
  "#2dd4bf",
]

function generateParticles(count: number): ConfettiParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 800,
    y: -(Math.random() * 400 + 200),
    rotation: Math.random() * 720 - 360,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 8 + 4,
    shape: Math.random() > 0.5 ? "square" : "circle",
  }))
}

interface ConfettiBurstProps {
  trigger: boolean
  onComplete?: () => void
}

export function ConfettiBurst({ trigger, onComplete }: ConfettiBurstProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([])

  useEffect(() => {
    if (trigger) {
      setParticles(generateParticles(35))
      const timer = setTimeout(() => {
        setParticles([])
        onComplete?.()
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [trigger, onComplete])

  return (
    <div className="pointer-events-none fixed inset-0 z-[300] overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              opacity: 1,
              x: "50vw",
              y: "50vh",
              rotate: 0,
              scale: 1,
            }}
            animate={{
              opacity: 0,
              x: `calc(50vw + ${p.x}px)`,
              y: `calc(50vh + ${p.y}px + 600px)`,
              rotate: p.rotation,
              scale: 0,
            }}
            transition={{
              duration: 2.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="absolute"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.shape === "circle" ? "50%" : "2px",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
