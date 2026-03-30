import { CardSkeleton, TableSkeleton } from "@/components/shared/skeleton-loader"

export default function ConcorrentesLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-zinc-800" />
      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton lines={4} />
        <CardSkeleton lines={4} />
      </div>
      <TableSkeleton rows={5} />
    </div>
  )
}
