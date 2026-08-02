"use client"

import type { ComponentProps } from "react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = ComponentProps<typeof Sonner>

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "font-sans rounded-2xl border border-border/50 bg-card/95 text-card-foreground shadow-lg shadow-black/5 backdrop-blur-sm dark:shadow-black/40",
        },
      }}
      {...props}
    />
  )
}
