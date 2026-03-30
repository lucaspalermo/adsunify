"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface LevelUpModalProps {
  visible: boolean
  level: number
  title: string
  onClose: () => void
}

function Particle({ index }: { index: number }) {
  const size = Math.random() * 8 + 4
  const x = (Math.random() - 0.5) * 400
  const y = -(Math.random() * 600 + 100)
  const delay = Math.random() * 0.3
  const colors = [
    "#facc15",
    "#fb923c",
    "#a78bfa",
    "#34d399",
    "#f472b6",
    "#60a5fa",
  ]
  const color = colors[index % colors.length]

  return (
    <motion.div
      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      animate={{ opacity: 0, x, y, scale: 0 }}
      transition={{ duration: 2, delay, ease: "easeOut" }}
      className="absolute left-1/2 top-1/2 rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
    />
  )
}

export function LevelUpModal({
  visible,
  level,
  title,
  onClose,
}: LevelUpModalProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 5000)
      return () => clearTimeout(timer)
    }
  }, [visible, onClose])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-md"
          onClick={onClose}
        >
          {/* Particles */}
          <div className="pointer-events-none absolute inset-0">
            {Array.from({ length: 24 }).map((_, i) => (
              <Particle key={i} index={i} />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-12 py-10 shadow-2xl backdrop-blur-xl"
          >
            <p className="bg-gradient-to-b from-yellow-300 to-orange-500 bg-clip-text text-8xl font-black text-transparent">
              {level}
            </p>
            <h2 className="text-2xl font-bold text-slate-900">
              NIVEL {level}!
            </h2>
            <p className="text-center text-slate-500">
              Voce agora eh <span className="font-semibold text-yellow-300">{title}</span>!
            </p>
            <button
              onClick={onClose}
              className="mt-4 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 px-8 py-3 font-semibold text-black transition-transform hover:scale-105"
            >
              Continuar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
