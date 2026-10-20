import { Skeleton } from "@/components/ui/skeleton"

export function NFTGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Carregando NFTs"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-kurio-surface border border-kurio-border p-4 flex flex-col gap-4"
        >
          <Skeleton className="aspect-square w-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-kurio-border/60 mt-auto">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-2.5 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function NFTDetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando detalhes do NFT"
      className="grid grid-cols-1 md:grid-cols-2 gap-12 py-6"
    >
      <div className="bg-kurio-surface border border-kurio-border p-4 flex flex-col gap-4">
        <Skeleton className="aspect-square w-full" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
