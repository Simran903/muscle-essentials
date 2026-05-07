"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type InputFieldProps = React.ComponentProps<"input">

export function InputField({ className, ...props }: InputFieldProps) {
  return (
    <input
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs transition-colors outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-none focus-visible:ring-none focus-visible:border-cyan-500 focus-visible:shadow-[0_4px_14px_rgba(0,0,0,0.08)]",
        className
      )}
      {...props}
    />
  )
}
