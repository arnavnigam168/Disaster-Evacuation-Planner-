import * as React from "react"
import { cn } from "@/lib/utils"

export function Button({ className, children, ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow transition-colors",
        "hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
