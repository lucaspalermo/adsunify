import { CardSkeleton, Skeleton } from "@/components/shared/skeleton-loader"

export default function ConteudoLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <CardSkeleton key={i} lines={2} />)}
      </div>
      <CardSkeleton lines={6} />
    </div>
  )
}
