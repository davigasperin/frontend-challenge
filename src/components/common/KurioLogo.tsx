import React from "react"

export interface KurioLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: "sm" | "md" | "lg"
}

export function KurioLogo(_props: KurioLogoProps) {
  return (
    <div className="flex items-center gap-2 select-none group">
      <span className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-kurio-text-primary group-hover:text-kurio-accent transition-colors">
        KURIO
      </span>
      <span className="h-2 w-2 rounded-full bg-kurio-accent animate-pulse" />
    </div>
  )
}
