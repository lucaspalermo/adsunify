"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  labels: string[]
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1
        const isCompleted = step < currentStep
        const isCurrent = step === currentStep

        return (
          <div key={step} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                  isCompleted && "bg-green-500 text-white",
                  isCurrent && "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/30",
                  !isCompleted && !isCurrent && "bg-slate-50 text-slate-400 border border-slate-200"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step}
              </motion.div>
              <span className={cn(
                "text-xs mt-1.5 whitespace-nowrap",
                isCurrent ? "text-slate-900 font-medium" : "text-slate-400"
              )}>
                {labels[i]}
              </span>
            </div>
            {step < totalSteps && (
              <div className={cn(
                "w-12 h-0.5 mb-5",
                step < currentStep ? "bg-green-500" : "bg-slate-100"
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default StepIndicator
