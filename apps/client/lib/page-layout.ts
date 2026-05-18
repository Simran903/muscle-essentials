import { cn } from "@/lib/utils"

/** Shared horizontal gutters for store and account pages. */
export const pagePx = "px-4 sm:px-6 lg:px-10"

/** Shared vertical gutters for store and account pages. */
export const pagePy = "py-6 sm:py-8 lg:py-12"

/** Extra bottom space on small screens for the fixed mobile tab bar. */
export const pageMobileBottom =
  "max-md:pb-[max(7rem,calc(4.75rem+env(safe-area-inset-bottom,0px)))]"

const pageMaxWidthClass = {
  lg: "max-w-lg",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
} as const

type PageMainOptions = {
  maxWidth?: keyof typeof pageMaxWidthClass | false
  className?: string
  /** Apply mobile tab-bar bottom clearance. Default true. */
  mobileBottom?: boolean
}

export function pageMainClassName({
  maxWidth = "6xl",
  className,
  mobileBottom = true,
}: PageMainOptions = {}) {
  return cn(
    "relative isolate mx-auto min-h-svh w-full text-foreground",
    maxWidth !== false && pageMaxWidthClass[maxWidth],
    pagePx,
    pagePy,
    mobileBottom && pageMobileBottom,
    className,
  )
}

export function pageMainCenteredClassName(className?: string) {
  return pageMainClassName({
    maxWidth: "lg",
    className: cn("flex flex-col items-center justify-center text-center", className),
  })
}
