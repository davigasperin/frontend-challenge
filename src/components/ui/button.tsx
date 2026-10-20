import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kurio-accent focus-visible:ring-offset-2 focus-visible:ring-offset-kurio-bg disabled:pointer-events-none disabled:opacity-50 tracking-wider uppercase font-mono cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-kurio-accent text-kurio-bg hover:bg-kurio-accent-hover shadow-sm",
        secondary:
          "bg-kurio-surface text-kurio-text-primary border border-kurio-border hover:border-kurio-accent hover:text-kurio-accent",
        outline:
          "border border-kurio-border bg-transparent text-kurio-text-primary hover:border-kurio-accent hover:bg-kurio-surface/50",
        ghost:
          "text-kurio-text-secondary hover:text-kurio-text-primary hover:bg-kurio-surface/40",
        destructive:
          "bg-red-950/80 text-red-300 border border-red-800/60 hover:bg-red-900/90",
        link:
          "text-kurio-accent underline-offset-4 hover:underline lowercase normal-case font-normal",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-13 px-8 text-base",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
