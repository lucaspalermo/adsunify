import { StatsCardSkeleton, CardSkeleton } from "@/components/shared/skeleton-loader"

export default function RelatoriosLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-zinc-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <StatsCardSkeleton key={i} />)}
      </div>
      <CardSkeleton lines={8} />
    </div>
  )
}
