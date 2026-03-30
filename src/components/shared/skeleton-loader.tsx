import { cn } from "@/lib/utils"

interface SkeletonLoaderProps {
  className?: string
  variant?: "card" | "text" | "circle" | "bar"
}

export function SkeletonLoader({
  className,
  variant = "text",
}: SkeletonLoaderProps) {
  const baseClasses = "animate-pulse bg-slate-200 rounded"

  switch (variant) {
    case "card":
      return (
        <div className={cn(baseClasses, "rounded-2xl p-6 space-y-4", className)}>
          <div className="h-4 w-3/4 rounded bg-slate-300" />
          <div className="h-3 w-full rounded bg-slate-200" />
          <div className="h-3 w-5/6 rounded bg-slate-200" />
          <div className="h-10 w-1/3 rounded-lg bg-slate-300 mt-4" />
        </div>
      )

    case "circle":
      return (
        <div
          className={cn(baseClasses, "h-12 w-12 rounded-full", className)}
        />
      )

    case "bar":
      return (
        <div className={cn("w-full rounded-full bg-slate-200", className)}>
          <div className="h-2 w-2/3 rounded-full bg-slate-300 animate-pulse" />
        </div>
      )

    case "text":
    default:
      return (
        <div className={cn(baseClasses, "h-4 w-full rounded", className)} />
      )
  }
}

export default SkeletonLoader
