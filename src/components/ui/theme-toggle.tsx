"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sun, Moon, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className={cn("h-9 w-9", className)} />

  const modes = [
    { key: "light", icon: Sun, label: "Claro" },
    { key: "dark", icon: Moon, label: "Escuro" },
    { key: "system", icon: Monitor, label: "Sistema" },
  ] as const

  return (
    <div className={cn("flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-800", className)}>
      {modes.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => setTheme(key)}
          className={cn(
            "relative flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors",
            theme === key && "text-zinc-900 dark:text-white"
          )}
          title={label}
        >
          {theme === key && (
            <motion.div
              layoutId="theme-toggle-bg"
              className="absolute inset-0 rounded-lg bg-white shadow-sm dark:bg-zinc-700"
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          )}
          <Icon className="relative z-10 h-4 w-4" />
        </button>
      ))}
    </div>
  )
}

export function ThemeToggleCompact({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className={cn("h-9 w-9", className)} />

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700",
        className
      )}
      title={isDark ? "Modo claro" : "Modo escuro"}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="h-4 w-4" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}
