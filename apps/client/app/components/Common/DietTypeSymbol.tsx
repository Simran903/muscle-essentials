"use client"

import type { ProductDietType } from "@/lib/api"
import { cn } from "@/lib/utils"

type DietTypeSymbolProps = {
  dietType: ProductDietType
  size?: number
  className?: string
}

export function DietTypeSymbol({ dietType, size = 18, className }: DietTypeSymbolProps) {
  const boxStyle = { width: size, height: size, minWidth: size, minHeight: size }
  const dot = Math.round(size * 0.44)

  if (dietType === "VEG") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-sm border-[2.5px] border-emerald-600 bg-white dark:bg-white",
          className,
        )}
        style={boxStyle}
        role="img"
        aria-label="Vegetarian"
      >
        <span
          className="shrink-0 rounded-full bg-emerald-600"
          style={{ width: dot, height: dot }}
        />
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-sm border-[2.5px] border-red-700 bg-white dark:bg-white",
        className,
      )}
      style={boxStyle}
      role="img"
      aria-label="Non-vegetarian"
    >
      <span
        className="shrink-0 rounded-full bg-red-700"
        style={{ width: dot, height: dot }}
      />
    </span>
  )
}
