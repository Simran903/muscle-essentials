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
          "inline-flex shrink-0 items-center justify-center rounded-[1px] border-[2.5px] border-[#138808] bg-white shadow-sm dark:bg-white",
          className,
        )}
        style={boxStyle}
        role="img"
        aria-label="Vegetarian"
      >
        <span
          className="shrink-0 rounded-full bg-[#138808]"
          style={{ width: dot, height: dot }}
        />
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[1px] border-[2.5px] border-[#b71c1c] bg-white shadow-sm dark:bg-white",
        className,
      )}
      style={boxStyle}
      role="img"
      aria-label="Non-vegetarian"
    >
      <span
        className="shrink-0 rounded-full bg-[#b71c1c]"
        style={{ width: dot, height: dot }}
      />
    </span>
  )
}
