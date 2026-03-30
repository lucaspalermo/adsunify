import { StatsCardSkeleton, CardSkeleton, TableSkeleton } from "@/components/shared/skeleton-loader"

export default function AnunciosLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-zinc-800" />
        <div className="h-4 w-64 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <StatsCardSkeleton key={i} />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton lines={3} />
        <CardSkeleton lines={3} />
      </div>
      <TableSkeleton rows={4} />
    </div>
  )
}
