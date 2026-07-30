import * as React from "react"
import { cn } from "@/lib/utils"

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-10 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}
