import { type ElementType, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GradientTextProps {
  children: ReactNode
  className?: string
  from?: string
  via?: string
  to?: string
  as?: ElementType
}

export function GradientText({
  children,
  className,
  from = "from-violet-600",
  via = "via-blue-500",
  to = "to-cyan-500",
  as: Component = "span",
}: GradientTextProps) {
  return (
    <Component
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent",
        from,
        via,
        to,
        className
      )}
    >
      {children}
    </Component>
  )
}

export default GradientText
