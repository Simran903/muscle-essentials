"use client"

import { cn } from "@/lib/utils"

export type PaginationProps = {
  page: number
  totalPages: number
  onPrevious: () => void
  onNext: () => void
  className?: string
  previousLabel?: string
  nextLabel?: string
  /** When set, overrides default (`page <= 1`) for disabling Previous */
  isPreviousDisabled?: boolean
  /** When set, overrides default (`page >= totalPages` or `totalPages < 1`) for disabling Next */
  isNextDisabled?: boolean
}

export function Pagination({
  page,
  totalPages,
  onPrevious,
  onNext,
  className,
  previousLabel = "Previous",
  nextLabel = "Next",
  isPreviousDisabled,
  isNextDisabled,
}: PaginationProps) {
  const previousDisabled = isPreviousDisabled ?? page <= 1
  const nextDisabled =
    isNextDisabled ?? (page >= totalPages || totalPages < 1)

  const buttonClass =
    "rounded-md border border-border/60 bg-background px-5 py-2 text-sm font-medium transition-colors hover:border-border hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={previousDisabled}
          className={buttonClass}
        >
          {previousLabel}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className={buttonClass}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  )
}
