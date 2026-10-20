import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full border border-kurio-border bg-kurio-surface px-4 py-2.5 text-sm text-kurio-text-primary font-mono placeholder:text-kurio-text-secondary/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-kurio-accent focus-visible:border-kurio-accent disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
