import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-shimmer rounded-sm border border-kurio-border/40", className)}
      {...props}
    />
  )
}

export { Skeleton }
