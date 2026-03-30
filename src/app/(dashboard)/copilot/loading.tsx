import { Skeleton, CardSkeleton } from "@/components/shared/skeleton-loader"

export default function CopilotLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <CardSkeleton lines={10} />
    </div>
  )
}
