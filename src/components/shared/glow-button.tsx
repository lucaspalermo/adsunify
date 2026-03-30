"use client"

import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from "react"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const glowButtonVariants = cva(
  "relative inline-flex items-center justify-center font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-xl",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:brightness-110",
        secondary: "bg-white border-2 border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300 dark:bg-zinc-900 dark:border-violet-500/30 dark:text-violet-400 dark:hover:bg-violet-500/10",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
      },
      size: {
        sm: "h-9 px-4 text-sm gap-1.5",
        md: "h-11 px-6 text-sm gap-2",
        lg: "h-13 px-8 text-base gap-2.5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
)

interface GlowButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">, VariantProps<typeof glowButtonVariants> {
  children: ReactNode
  className?: string
}

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ children, className, variant, size, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(glowButtonVariants({ variant, size }), className)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
        {...(props as any)}
      >
        {children}
      </motion.button>
    )
  }
)

GlowButton.displayName = "GlowButton"
export { glowButtonVariants }
export default GlowButton
