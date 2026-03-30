import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GradientTextProps {
  children: ReactNode
  className?: string
  from?: string
  via?: string
  to?: string
  as?: "span" | "h1" | "h2" | "h3" | "h4" | "p" | "div"
}

export function GradientText({
  children,
  className,
  from = "from-violet-600",
  via = "via-blue-500",
  to = "to-cyan-500",
  as: Tag = "span",
}: GradientTextProps) {
  return (
    <Tag
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent",
        from,
        via,
        to,
        className
      )}
    >
      {children}
    </Tag>
  )
}

export default GradientText
