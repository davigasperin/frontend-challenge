import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center px-2 py-0.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "border border-kurio-accent/40 bg-kurio-accent/15 text-kurio-accent",
        secondary:
          "border border-kurio-border bg-kurio-surface text-kurio-text-secondary",
        outline:
          "border border-kurio-border text-kurio-text-primary",
        success:
          "border border-emerald-500/40 bg-emerald-950/40 text-emerald-400",
        destructive:
          "border border-red-500/40 bg-red-950/40 text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
