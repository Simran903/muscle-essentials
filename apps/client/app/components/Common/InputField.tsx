"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type InputFieldProps = React.ComponentProps<"input">

export function InputField({ className, ...props }: InputFieldProps) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-xl border border-border/80 bg-background px-3.5 py-2 text-sm text-foreground shadow-sm transition-all outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50 hover:border-border focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/15 dark:focus-visible:border-primary/50 dark:focus-visible:ring-primary/12",
        className
      )}
      {...props}
    />
  )
}
