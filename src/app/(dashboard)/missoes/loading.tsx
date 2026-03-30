import { MissionsSkeleton, Skeleton } from "@/components/shared/skeleton-loader"

export default function MissoesLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <MissionsSkeleton />
    </div>
  )
}
