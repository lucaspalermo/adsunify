import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

// Base shimmer skeleton block
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-slate-200 dark:bg-zinc-800",
        className
      )}
    />
  )
}

// Full dashboard page skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Content area */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CardSkeleton lines={5} />
        </div>
        <CardSkeleton lines={4} />
      </div>
    </div>
  )
}

// Stats card skeleton
export function StatsCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  )
}

// Generic card skeleton
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-40" />
        </div>
        {[...Array(lines)].map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-3", i === lines - 1 ? "w-3/5" : "w-full")}
          />
        ))}
      </div>
    </div>
  )
}

// Score ring skeleton
export function ScoreRingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Skeleton className="h-28 w-28 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-100 px-6 py-4 dark:border-zinc-800">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className={cn("h-3", i === 0 ? "w-32" : "w-20")} />
        ))}
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-slate-50 px-6 py-3.5 last:border-0 dark:border-zinc-800/50">
          {[...Array(4)].map((_, j) => (
            <Skeleton key={j} className={cn("h-3", j === 0 ? "w-28" : "w-16")} />
          ))}
        </div>
      ))}
    </div>
  )
}

// Missions list skeleton
export function MissionsSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

// Legacy exports for backwards compatibility
export function SkeletonLoader({
  className,
  variant = "text",
}: {
  className?: string
  variant?: "card" | "text" | "circle" | "bar"
}) {
  switch (variant) {
    case "card":
      return <CardSkeleton />
    case "circle":
      return <Skeleton className={cn("h-12 w-12 rounded-full", className)} />
    case "bar":
      return <Skeleton className={cn("h-2 w-full rounded-full", className)} />
    case "text":
    default:
      return <Skeleton className={cn("h-4 w-full", className)} />
  }
}

export default SkeletonLoader
