"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap } from "lucide-react"

interface XpToastProps {
  xp: number
  message: string
  visible: boolean
  onClose: () => void
}

export function XpToast({ xp, message, visible, onClose }: XpToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [visible, onClose])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-[100]"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-2xl backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
              <Zap className="h-5 w-5 text-white" fill="white" />
            </div>
            <div>
              <p className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-2xl font-black text-transparent">
                +{xp} XP
              </p>
              <p className="text-sm text-slate-500">{message}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
