import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export function SentenceSkeleton() {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-16 w-full" />
    </Card>
  )
}

export function SentenceListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SentenceSkeleton key={i} />
      ))}
    </div>
  )
}
