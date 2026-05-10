"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type InputFieldProps = React.ComponentProps<"input">

export function InputField({ className, ...props }: InputFieldProps) {
  return (
    <input
      className={cn(
        "flex h-9 w-full rounded-xl border border-input/80 bg-background px-3 py-1 text-sm text-foreground shadow-none transition-[border-color,box-shadow] outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-cyan-500/45 focus-visible:ring-2 focus-visible:ring-cyan-500/15 dark:focus-visible:border-cyan-400/50 dark:focus-visible:ring-cyan-400/12",
        className
      )}
      {...props}
    />
  )
}
